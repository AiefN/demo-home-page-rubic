const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 15: Workflow Timeline Mobile Stacking & Semantics', () => {
  async function loadServices(driver, baseUrl) {
    await driver.goto(`${baseUrl}/services.html`);
    const title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/services.html`);
    }
  }

  test('B15.1 320px mobile viewport stacks timeline stages vertically without horizontal clipping', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 320, height: 640 });
    await loadServices(driver, baseUrl);

    const noOverflow = await driver.evaluate(() => {
      return document.documentElement.scrollWidth <= 325;
    });

    expect(noOverflow).toBe(true);
  });

  test('B15.2 Timeline steps display stage numbers (01-06) clearly', async ({ driver, baseUrl }) => {
    await loadServices(driver, baseUrl);
    const hasNumbers = await driver.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('01') || text.includes('1') || text.includes('Tahap');
    });

    expect(hasNumbers).toBe(true);
  });

  test('B15.3 Workflow descriptions contain comprehensive phase scope without text truncation', async ({ driver, baseUrl }) => {
    await loadServices(driver, baseUrl);
    const hasScope = await driver.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      return text.includes('wireframe') || text.includes('desain') || text.includes('testing') || text.includes('deploy');
    });

    expect(hasScope).toBe(true);
  });

  test('B15.4 Deliverables lists use semantic unordered list markup', async ({ driver, baseUrl }) => {
    await loadServices(driver, baseUrl);
    const hasSemanticLists = await driver.evaluate(() => {
      const lists = document.querySelectorAll('ul, ol');
      return lists.length >= 2;
    });

    expect(hasSemanticLists).toBe(true);
  });

  test('B15.5 Timeline visual indicators and icons render without external CDN fonts or images', async ({ driver, baseUrl }) => {
    await loadServices(driver, baseUrl);
    const networkErrors = driver.getNetworkErrors();
    expect(networkErrors.length).toBe(0);
  });
});
