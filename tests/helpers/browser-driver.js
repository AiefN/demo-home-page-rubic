/**
 * Zero-dependency Headless Browser Driver (Chrome / Edge via Chrome DevTools Protocol)
 * Leverages native Node.js WebSocket and standard child_process orchestration.
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BROWSER_PATHS = [
  process.env.CHROME_BIN,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.EDGE_BIN,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

function findBrowserBinary() {
  for (const binPath of BROWSER_PATHS) {
    try {
      if (fs.existsSync(binPath)) {
        return binPath;
      }
    } catch (e) {
      // ignore
    }
  }
  throw new Error('No supported Chrome or Edge browser executable found on system.');
}

class BrowserDriver {
  constructor(options = {}) {
    this.browserPath = options.browserPath || findBrowserBinary();
    this.port = options.port || (9220 + Math.floor(Math.random() * 600));
    this.proc = null;
    this.ws = null;
    this.tempDir = null;
    this.messageId = 1;
    this.pendingRequests = new Map();
    this.eventListeners = new Map();
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.networkResponses = [];
    this.networkErrors = [];
  }

  async launch() {
    this.tempDir = path.join(os.tmpdir(), `rubic-e2e-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
    fs.mkdirSync(this.tempDir, { recursive: true });

    const chromeArgs = [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${this.tempDir}`,
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-default-apps',
      '--disable-extensions',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1440,900',
      'about:blank'
    ];

    this.proc = spawn(this.browserPath, chromeArgs, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    this.proc.on('error', (err) => {
      console.error('Browser process spawn error:', err);
    });

    const pageWsUrl = await this.waitForDevToolsUrl(15000);
    await this.connectWebSocket(pageWsUrl);
    await this.initializeDomains();
  }

  async waitForDevToolsUrl(timeoutMs = 15000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const pages = await new Promise((resolve, reject) => {
          const req = http.get(`http://127.0.0.1:${this.port}/json`, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
          });
          req.on('error', reject);
          req.setTimeout(1000, () => {
            req.destroy();
            reject(new Error('timeout'));
          });
        });

        const pageTarget = pages.find((p) => p.type === 'page' && p.webSocketDebuggerUrl);
        if (pageTarget) {
          return pageTarget.webSocketDebuggerUrl;
        }
      } catch (err) {
        // Retry
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    throw new Error(`Failed to obtain DevTools target from port ${this.port} within ${timeoutMs}ms`);
  }

  async connectWebSocket(wsUrl) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        resolve();
      };

      this.ws.onerror = (err) => {
        reject(err);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle response to command
          if (data.id && this.pendingRequests.has(data.id)) {
            const { resolve: reqResolve, reject: reqReject } = this.pendingRequests.get(data.id);
            this.pendingRequests.delete(data.id);
            if (data.error) {
              reqReject(new Error(data.error.message || JSON.stringify(data.error)));
            } else {
              reqResolve(data.result);
            }
            return;
          }

          // Handle CDP events
          if (data.method) {
            this.handleCdpEvent(data.method, data.params || {});
          }
        } catch (e) {
          console.error('Error handling CDP websocket message:', e);
        }
      };
    });
  }

  handleCdpEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      const entry = {
        type: params.type,
        args: (params.args || []).map((a) => (a.value !== undefined ? a.value : a.description)),
        timestamp: params.timestamp
      };
      this.consoleLogs.push(entry);
      if (params.type === 'error') {
        this.consoleErrors.push(entry);
      } else if (params.type === 'warning') {
        this.consoleWarnings.push(entry);
      }
    } else if (method === 'Runtime.exceptionThrown') {
      const details = params.exceptionDetails;
      const text = details?.exception?.description || details?.text || 'Uncaught JS exception';
      const entry = {
        type: 'uncaughtException',
        text,
        url: details?.url,
        lineNumber: details?.lineNumber,
        columnNumber: details?.columnNumber
      };
      this.consoleErrors.push(entry);
    } else if (method === 'Network.responseReceived') {
      const res = params.response;
      if (res) {
        const item = {
          url: res.url,
          status: res.status,
          statusText: res.statusText,
          mimeType: res.mimeType
        };
        this.networkResponses.push(item);
        if (res.status >= 400) {
          this.networkErrors.push(item);
        }
      }
    }

    const listeners = this.eventListeners.get(method) || [];
    for (const listener of listeners) {
      try {
        listener(params);
      } catch (err) {
        console.error('Event listener error on ' + method, err);
      }
    }
  }

  async send(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket is not open.'));
      }
      const id = this.messageId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    if (!this.eventListeners.has(method)) {
      this.eventListeners.set(method, []);
    }
    this.eventListeners.get(method).push(listener);
    return () => {
      const list = this.eventListeners.get(method) || [];
      const idx = list.indexOf(listener);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  async initializeDomains() {
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
    await this.send('DOM.enable');
  }

  async goto(url, options = {}) {
    const timeout = options.timeout || 15000;
    this.clearLogs();

    return new Promise((resolve, reject) => {
      let isSettled = false;
      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          resolve(); // Resolve even on timeout so tests can inspect partially loaded state
        }
      }, timeout);

      const cleanup = () => {
        clearTimeout(timer);
        offLoad();
        offWithin();
      };

      const handleDone = () => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          setTimeout(resolve, 80);
        }
      };

      const offLoad = this.on('Page.loadEventFired', handleDone);
      const offWithin = this.on('Page.navigatedWithinDocument', handleDone);

      this.send('Page.navigate', { url }).catch((err) => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          reject(err);
        }
      });
    });
  }

  async evaluate(fnOrExpr, ...args) {
    let expression;
    if (typeof fnOrExpr === 'function') {
      const serializedArgs = JSON.stringify(args);
      expression = `(${fnOrExpr.toString()})(...${serializedArgs})`;
    } else {
      expression = String(fnOrExpr);
    }

    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });

    if (res.exceptionDetails) {
      const text = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`Evaluation failed: ${text}`);
    }

    return res.result ? res.result.value : undefined;
  }

  async $eval(selector, fnOrExpr, ...args) {
    return this.evaluate(
      (sel, fnStr, ...passedArgs) => {
        const el = document.querySelector(sel);
        if (!el) throw new Error(`Element matching selector "${sel}" not found.`);
        const fn = new Function('el', '...args', `return (${fnStr})(el, ...args);`);
        return fn(el, ...passedArgs);
      },
      selector,
      fnOrExpr.toString(),
      ...args
    );
  }

  async $$eval(selector, fnOrExpr, ...args) {
    return this.evaluate(
      (sel, fnStr, ...passedArgs) => {
        const list = Array.from(document.querySelectorAll(sel));
        const fn = new Function('list', '...args', `return (${fnStr})(list, ...args);`);
        return fn(list, ...passedArgs);
      },
      selector,
      fnOrExpr.toString(),
      ...args
    );
  }

  async click(selector) {
    return this.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`Element "${sel}" not found to click.`);
      el.scrollIntoView({ block: 'center', inline: 'center' });
      el.click();
    }, selector);
  }

  async type(selector, text) {
    return this.evaluate(
      (sel, val) => {
        const el = document.querySelector(sel);
        if (!el) throw new Error(`Element "${sel}" not found to type into.`);
        el.focus();
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      selector,
      text
    );
  }

  async scrollTo(x, y) {
    return this.evaluate(
      (scrollX, scrollY) => {
        window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      },
      x,
      y
    );
  }

  async setViewport({ width = 1440, height = 900, deviceScaleFactor = 1, mobile = false } = {}) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: Math.round(width),
      height: Math.round(height),
      deviceScaleFactor,
      mobile
    });
    if (mobile) {
      await this.send('Emulation.setTouchEmulationEnabled', {
        enabled: true,
        maxTouchPoints: 5
      });
    } else {
      await this.send('Emulation.setTouchEmulationEnabled', {
        enabled: false
      });
    }
  }

  async setEmulatedMedia({ media = '', features = [] } = {}) {
    await this.send('Emulation.setEmulatedMedia', {
      media,
      features
    });
  }

  async waitForSelector(selector, { timeout = 5000, visible = false } = {}) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const exists = await this.evaluate(
        (sel, needVisible) => {
          const el = document.querySelector(sel);
          if (!el) return false;
          if (!needVisible) return true;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        },
        selector,
        visible
      );
      if (exists) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Timed out waiting for selector "${selector}" after ${timeout}ms`);
  }

  async waitForFunction(fnOrExpr, { timeout = 5000, interval = 100 } = {}) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.evaluate(fnOrExpr);
        if (result) return result;
      } catch (e) {
        // ignore and retry
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error(`Timed out waiting for function after ${timeout}ms`);
  }

  getConsoleLogs() {
    return [...this.consoleLogs];
  }

  getConsoleErrors() {
    return [...this.consoleErrors];
  }

  getConsoleWarnings() {
    return [...this.consoleWarnings];
  }

  getNetworkResponses() {
    return [...this.networkResponses];
  }

  getNetworkErrors() {
    return [...this.networkErrors];
  }

  clearLogs() {
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.networkResponses = [];
    this.networkErrors = [];
  }

  async close() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    } catch (e) {}

    try {
      if (this.proc) {
        this.proc.kill('SIGKILL');
      }
    } catch (e) {}

    // Clean up temporary user data directory
    if (this.tempDir) {
      setTimeout(() => {
        try {
          fs.rmSync(this.tempDir, { recursive: true, force: true });
        } catch (e) {}
      }, 500);
    }
  }
}

module.exports = BrowserDriver;
