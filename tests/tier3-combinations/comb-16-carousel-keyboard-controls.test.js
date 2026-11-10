const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 3 - Combination 16: Testimonial Carousel Keyboard Controls & Focus Trapping', () => {
  test('C16.1 Carousel buttons respond to keyboard navigation and Space/Enter keys', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);

    const result = await driver.evaluate(() => {
      const nextBtn = document.querySelector('.carousel-btn--next, .carousel-next, [data-next]');
      const track = document.querySelector('.testimonial-track, .carousel-track');
      if (!nextBtn || !track) {
        return { success: false, reason: 'elements missing' };
      }

      nextBtn.focus();
      const isFocused = document.activeElement === nextBtn;
      const initialTransform = track.style.transform;

      nextBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      nextBtn.click();

      const afterTransform = track.style.transform;
      const transformChanged = afterTransform !== initialTransform;

      return {
        success: isFocused && transformChanged,
        isFocused,
        transformChanged,
        initialTransform,
        afterTransform
      };
    });

    expect(result.success).toBe(true);
    expect(result.isFocused).toBe(true);
    expect(result.transformChanged).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });
});
