const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 5: Custom Trailing Cursor & 3D Tilt Card Interaction', () => {
  test('C5.1 Moving cursor over 3D tilt card triggers both follower expansion and 3D perspective rotation', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 1280, height: 800, mobile: false });
    await driver.goto(`${baseUrl}/index.html`);

    const result = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      const follower = document.querySelector('.cursor-follower');
      if (!card || !follower) {
        return { success: false, reason: 'elements missing' };
      }

      const rect = card.getBoundingClientRect();
      const moveX = rect.left + rect.width / 2 + 30;
      const moveY = rect.top + rect.height / 2 + 30;

      card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      card.dispatchEvent(new MouseEvent('mousemove', { clientX: moveX, clientY: moveY, bubbles: true }));

      const hasTransform = typeof card.style.transform === 'string' && card.style.transform.includes('perspective');
      const hasHoverClass = follower.classList.contains('cursor-hover');

      return {
        success: hasTransform && hasHoverClass,
        hasTransform,
        hasHoverClass,
        transform: card.style.transform
      };
    });

    expect(result.success).toBe(true);
    expect(result.hasTransform).toBe(true);
    expect(result.hasHoverClass).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
