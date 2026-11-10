/**
 * Zero-dependency Static HTTP Server for E2E Tests
 * Serves files from workspace root (c:\pkl\PKL) with accurate MIME types.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

class StaticServer {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.resolve(__dirname, '..', '..');
    this.port = options.port || 0; // 0 = dynamic ephemeral port
    this.server = null;
    this.actualPort = null;
    this.requests = [];
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        this.actualPort = this.server.address().port;
        resolve({
          port: this.actualPort,
          url: `http://127.0.0.1:${this.actualPort}`
        });
      });
    });
  }

  handleRequest(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    this.requests.push({
      method: req.method,
      url: req.url,
      pathname,
      timestamp: Date.now()
    });

    if (pathname === '/favicon.ico') {
      const favPath = path.join(this.rootDir, 'favicon.ico');
      if (!fs.existsSync(favPath)) {
        res.writeHead(204, { 'Content-Type': 'image/x-icon' });
        res.end();
        return;
      }
    }

    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Path traversal safety
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(this.rootDir, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback for directory request without trailing slash
        if (stats && stats.isDirectory()) {
          const indexFilePath = path.join(filePath, 'index.html');
          if (fs.existsSync(indexFilePath)) {
            filePath = indexFilePath;
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: ' + pathname);
          return;
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
          return;
        }

        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': content.length,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content);
      });
    });
  }

  getBaseUrl() {
    if (!this.actualPort) {
      throw new Error('StaticServer has not been started yet.');
    }
    return `http://127.0.0.1:${this.actualPort}`;
  }

  getRequests() {
    return [...this.requests];
  }

  clearRequestLog() {
    this.requests = [];
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          this.actualPort = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = StaticServer;
