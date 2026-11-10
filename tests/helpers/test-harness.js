/**
 * Zero-dependency Test Harness and Assertion Library for Rubicweb Redesign E2E
 */

const suites = [];
let currentSuite = null;

class Expectation {
  constructor(actual, isNot = false) {
    this.actual = actual;
    this.isNot = isNot;
  }

  get not() {
    return new Expectation(this.actual, !this.isNot);
  }

  _test(pass, message) {
    const finalPass = this.isNot ? !pass : pass;
    if (!finalPass) {
      throw new Error(this.isNot ? `Expected NOT ${message}` : `Expected ${message}`);
    }
  }

  toBe(expected) {
    this._test(
      Object.is(this.actual, expected),
      `to be ${JSON.stringify(expected)}, but received ${JSON.stringify(this.actual)}`
    );
  }

  toEqual(expected) {
    const a = JSON.stringify(this.actual);
    const b = JSON.stringify(expected);
    this._test(a === b, `to deeply equal ${b}, but received ${a}`);
  }

  toBeTruthy() {
    this._test(Boolean(this.actual), `to be truthy, but received ${JSON.stringify(this.actual)}`);
  }

  toBeFalsy() {
    this._test(!this.actual, `to be falsy, but received ${JSON.stringify(this.actual)}`);
  }

  toBeNull() {
    this._test(this.actual === null, `to be null, but received ${JSON.stringify(this.actual)}`);
  }

  toBeDefined() {
    this._test(this.actual !== undefined, `to be defined, but received undefined`);
  }

  toBeGreaterThan(expected) {
    this._test(
      Number(this.actual) > Number(expected),
      `to be greater than ${expected}, but received ${this.actual}`
    );
  }

  toBeGreaterThanOrEqual(expected) {
    this._test(
      Number(this.actual) >= Number(expected),
      `to be greater than or equal to ${expected}, but received ${this.actual}`
    );
  }

  toBeLessThan(expected) {
    this._test(
      Number(this.actual) < Number(expected),
      `to be less than ${expected}, but received ${this.actual}`
    );
  }

  toBeLessThanOrEqual(expected) {
    this._test(
      Number(this.actual) <= Number(expected),
      `to be less than or equal to ${expected}, but received ${this.actual}`
    );
  }

  toContain(itemOrSubstr) {
    if (typeof this.actual === 'string') {
      this._test(
        this.actual.includes(itemOrSubstr),
        `"${this.actual}" to contain "${itemOrSubstr}"`
      );
    } else if (Array.isArray(this.actual)) {
      this._test(
        this.actual.includes(itemOrSubstr),
        `array to contain ${JSON.stringify(itemOrSubstr)}`
      );
    } else {
      this._test(false, `toContain target to be string or array, but got ${typeof this.actual}`);
    }
  }

  toMatch(regex) {
    const re = typeof regex === 'string' ? new RegExp(regex) : regex;
    this._test(re.test(String(this.actual)), `"${this.actual}" to match ${re}`);
  }

  toBeCloseTo(expected, numDigits = 2) {
    const diff = Math.abs(Number(this.actual) - Number(expected));
    const tolerance = Math.pow(10, -numDigits) / 2;
    this._test(
      diff < tolerance,
      `to be close to ${expected} (within ${tolerance}), but received ${this.actual}`
    );
  }
}

function expect(actual) {
  return new Expectation(actual);
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeAllHooks: [],
    afterAllHooks: [],
    beforeEachHooks: [],
    afterEachHooks: []
  };
  suites.push(suite);
  const previousSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = previousSuite;
  }
}

function test(name, fn) {
  if (!currentSuite) {
    describe('Default Suite', () => {
      currentSuite.tests.push({ name, fn });
    });
  } else {
    currentSuite.tests.push({ name, fn });
  }
}

const it = test;

function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAllHooks.push(fn);
}

function afterAll(fn) {
  if (currentSuite) currentSuite.afterAllHooks.push(fn);
}

function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEachHooks.push(fn);
}

function afterEach(fn) {
  if (currentSuite) currentSuite.afterEachHooks.push(fn);
}

function getSuites() {
  return suites;
}

function clearSuites() {
  suites.length = 0;
  currentSuite = null;
}

async function runSuites(context = {}, options = {}) {
  const { bail = false, filter = null, onTestStart, onTestEnd, onSuiteStart, onSuiteEnd } = options;
  const results = {
    totalSuites: 0,
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    durationMs: 0,
    suites: []
  };

  const startTime = Date.now();

  for (const suite of suites) {
    if (filter && !suite.name.toLowerCase().includes(filter.toLowerCase())) {
      continue;
    }

    results.totalSuites++;
    const suiteResult = {
      name: suite.name,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0
    };
    const suiteStartTime = Date.now();
    if (onSuiteStart) onSuiteStart(suite);

    // Run beforeAll hooks
    try {
      for (const hook of suite.beforeAllHooks) {
        await hook(context);
      }
    } catch (hookErr) {
      // Mark all tests in suite as failed due to beforeAll failure
      for (const t of suite.tests) {
        results.totalTests++;
        results.failed++;
        suiteResult.failed++;
        const testRes = {
          name: t.name,
          status: 'failed',
          durationMs: 0,
          error: `beforeAll hook failed: ${hookErr.message}\n${hookErr.stack}`
        };
        suiteResult.tests.push(testRes);
        if (onTestEnd) onTestEnd(testRes, suite);
      }
      suiteResult.durationMs = Date.now() - suiteStartTime;
      results.suites.push(suiteResult);
      if (onSuiteEnd) onSuiteEnd(suiteResult);
      if (bail) break;
      continue;
    }

    // Run tests
    for (const t of suite.tests) {
      results.totalTests++;
      if (onTestStart) onTestStart(t, suite);

      // Clean driver logs prior to each test if available
      if (context.driver && typeof context.driver.clearLogs === 'function') {
        context.driver.clearLogs();
      }

      const testStartTime = Date.now();
      let testError = null;

      try {
        for (const hook of suite.beforeEachHooks) {
          await hook(context);
        }

        // Execute test function with 30s timeout safety
        await Promise.race([
          t.fn(context),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Test timed out after 30000ms: "${t.name}"`)), 30000)
          )
        ]);

        for (const hook of suite.afterEachHooks) {
          await hook(context);
        }
      } catch (err) {
        testError = err;
      }

      const testDuration = Date.now() - testStartTime;
      const testRes = {
        name: t.name,
        status: testError ? 'failed' : 'passed',
        durationMs: testDuration,
        error: testError ? (testError.stack || testError.message) : null
      };

      if (testError) {
        results.failed++;
        suiteResult.failed++;
      } else {
        results.passed++;
        suiteResult.passed++;
      }

      suiteResult.tests.push(testRes);
      if (onTestEnd) onTestEnd(testRes, suite);

      if (testError && bail) {
        break;
      }
    }

    // Run afterAll hooks
    try {
      for (const hook of suite.afterAllHooks) {
        await hook(context);
      }
    } catch (afterErr) {
      console.error(`afterAll hook error in suite "${suite.name}":`, afterErr);
    }

    suiteResult.durationMs = Date.now() - suiteStartTime;
    results.suites.push(suiteResult);
    if (onSuiteEnd) onSuiteEnd(suiteResult);

    if (suiteResult.failed > 0 && bail) {
      break;
    }
  }

  results.durationMs = Date.now() - startTime;
  return results;
}

module.exports = {
  expect,
  assert,
  describe,
  test,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  getSuites,
  clearSuites,
  runSuites
};
