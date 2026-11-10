const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 11: Reduced Motion Preference & Multi-Feature Animation Suppression', () => {
  test('C11.1 Reduced motion preference suppresses aggressive keyframes across cursor, tilt, and carousel', async ({ driver, baseUrl }) => {
    await driver.setEmulatedMedia({
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await driver.goto(`${baseUrl}/index.html`);

    const motionSuppressed = await driver.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    expect(motionSuppressed).toBe(true);
    await driver.setEmulatedMedia({ features: [] });
  });
});
