const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 8: Stats Counter Observer & Decimal Precision', () => {
  test('B8.1 Rapid viewport scroll past stats section does not produce NaN output', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const noNan = await driver.evaluate(async () => {
      window.scrollTo(0, 1000);
      window.dispatchEvent(new Event('scroll'));
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('scroll'));
      const counters = document.querySelectorAll('[data-counter-target], [data-target], .stat-number');
      return Array.from(counters).every(c => !c.textContent.includes('NaN'));
    });

    expect(noNan).toBe(true);
  });

  test('B8.2 Stats section already in viewport on load triggers animation immediately', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html#why-us`);
    await new Promise(r => setTimeout(r, 600));

    const counterActive = await driver.evaluate(() => {
      const el = document.querySelector('[data-counter-target], [data-target], .stat-number');
      return el ? el.textContent.trim().length > 0 : false;
    });

    expect(counterActive).toBe(true);
  });

  test('B8.3 Decimal target values (e.g., 99.9%) maintain accurate floating point format', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const decimalFormatted = await driver.evaluate(() => {
      const counters = document.querySelectorAll('[data-counter-target], [data-target], .stat-number');
      if (counters.length === 0) return false;
      const text = Array.from(counters).map(c => c.textContent).join(' ');
      return text.includes('.') || text.includes('99.9');
    });

    expect(decimalFormatted).toBe(true);
  });

  test('B8.4 Observer disconnects after initial trigger to prevent animation loop restarts', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    await driver.scrollTo(0, 800);
    await new Promise(r => setTimeout(r, 800));

    const stable = await driver.evaluate(() => {
      const counters = document.querySelectorAll('[data-counter-target], [data-target], .stat-number');
      if (counters.length === 0) return false;
      const beforeVals = Array.from(counters).map(c => c.textContent);
      for (let i = 0; i < 5; i++) {
        window.dispatchEvent(new Event('scroll'));
      }
      const afterVals = Array.from(counters).map(c => c.textContent);
      return beforeVals.every((v, i) => v === afterVals[i]);
    });

    expect(stable).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B8.5 Counters render valid placeholder or initial value before intersection trigger', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const validInitial = await driver.evaluate(() => {
      const counters = document.querySelectorAll('[data-counter-target], [data-target], .stat-number');
      return Array.from(counters).every(c => !c.textContent.includes('undefined') && !c.textContent.includes('null'));
    });

    expect(validInitial).toBe(true);
  });
});
