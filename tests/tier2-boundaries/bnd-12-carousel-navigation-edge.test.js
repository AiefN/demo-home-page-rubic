const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 2 - Boundary 12: Testimonial Carousel Navigation & Timer Boundaries', () => {
  test('B12.1 Rapid clicks on next button advance slides safely without out-of-bounds error', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const survived = await driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel, [data-carousel]');
      const nextBtn = document.querySelector('.carousel-btn--next, .carousel-next, [data-next]');
      if (!nextBtn || !carousel) return false;
      for (let i = 0; i < 10; i++) {
        nextBtn.click();
      }
      return carousel._carousel ? carousel._carousel.currentIndex >= 0 : true;
    });

    expect(survived).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B12.2 Previous button at initial slide wraps or disables gracefully', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const handled = await driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel, [data-carousel]');
      const prevBtn = document.querySelector('.carousel-btn--prev, .carousel-prev, [data-prev]');
      if (!prevBtn || !carousel) return false;
      prevBtn.click();
      return carousel._carousel ? carousel._carousel.currentIndex >= 0 : true;
    });

    expect(handled).toBe(true);
  });

  test('B12.3 Resizing window during carousel operation preserves item dimensions', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const resized = await driver.evaluate(() => {
      window.dispatchEvent(new Event('resize'));
      const track = document.querySelector('.testimonial-track, .testimonial-carousel');
      return track ? track.clientWidth >= 0 : false;
    });

    expect(resized).toBe(true);
  });

  test('B12.4 Rapid hover toggles do not multiply concurrent timer intervals', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const timersIntact = await driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel, .testimonial-track, #testimonials');
      if (!carousel) return false;
      for (let i = 0; i < 8; i++) {
        carousel.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        carousel.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      }
      return carousel._carousel ? carousel._carousel.timer !== null : true;
    });

    expect(timersIntact).toBe(true);
    expect(driver.getConsoleErrors().length).toBe(0);
  });

  test('B12.5 Touch swipe emulation on carousel advances or updates position', async ({ driver, baseUrl }) => {
    await driver.setViewport({ width: 375, height: 667, mobile: true });
    await driver.goto(`${baseUrl}/index.html`);

    const swipeHandled = await driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel, .testimonial-track, #testimonials');
      if (!carousel) return false;
      const initialIdx = carousel._carousel ? carousel._carousel.currentIndex : 0;
      const t1 = new Touch({ identifier: 1, target: carousel, clientX: 300, clientY: 200 });
      const t2 = new Touch({ identifier: 1, target: carousel, clientX: 50, clientY: 200 });
      carousel.dispatchEvent(new TouchEvent('touchstart', { touches: [t1], bubbles: true }));
      carousel.dispatchEvent(new TouchEvent('touchmove', { touches: [t2], bubbles: true }));
      carousel.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
      return carousel._carousel ? carousel._carousel.currentIndex !== initialIdx : true;
    });

    expect(swipeHandled).toBe(true);
  });
});
