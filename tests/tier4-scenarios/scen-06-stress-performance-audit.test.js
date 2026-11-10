const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 4 - Scenario 6: High-Stress Performance & Interaction Audit', () => {
  test('S6.1 Rapid event stress test (scrolls, mouse moves, tab clicks, resizes) maintains DOM integrity and zero console errors', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    // 1. Rapid Scroll Stress (50 scroll pulses)
    await driver.evaluate(() => {
      for (let i = 0; i < 50; i++) {
        window.scrollTo(0, (i * 75) % 2000);
        window.dispatchEvent(new Event('scroll'));
      }
    });

    // 2. Rapid Mousemove Stress (50 coordinates)
    await driver.evaluate(() => {
      for (let i = 0; i < 50; i++) {
        window.dispatchEvent(new MouseEvent('mousemove', {
          clientX: (i * 25) % 1200,
          clientY: (i * 18) % 800,
          bubbles: true
        }));
      }
    });

    // 3. Rapid Portfolio Filter Switches (10 switches)
    await driver.evaluate(() => {
      const filters = document.querySelectorAll('#portfolio [data-filter], #portfolio .filter-btn');
      if (filters.length >= 2) {
        for (let i = 0; i < 10; i++) {
          filters[i % filters.length].click();
        }
      }
    });

    // 4. Viewport Resize Stress (Desktop -> Tablet -> Mobile -> Desktop)
    await driver.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 50));
    await driver.setViewport({ width: 320, height: 640 });
    await new Promise(r => setTimeout(r, 50));
    await driver.setViewport({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 50));

    // 5. Assert zero console runtime errors or uncaught exceptions
    const consoleErrors = driver.getConsoleErrors();
    expect(consoleErrors.length).toBe(0);

    // 6. Assert DOM root and main container remain healthy
    const docHealthy = await driver.evaluate(() => {
      return document.body && document.body.children.length >= 2 && !document.body.innerHTML.includes('NaN');
    });
    expect(docHealthy).toBe(true);
  });
});
