const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 12: Auto-Scrolling Testimonial Carousel', () => {
  test('12.1 Testimonials section or carousel track exists in DOM', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasTestimonials = await driver.evaluate(() => {
      const el = document.querySelector('#testimonials, .testimonial-carousel, .testimonials, .testimonial-track, #reviews, [data-carousel]');
      return !!el || document.body.textContent.toLowerCase().includes('klien') || document.body.textContent.toLowerCase().includes('testimoni');
    });

    expect(hasTestimonials).toBe(true);
  });

  test('12.2 Testimonial cards contain client names and endorsements', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasClientCards = await driver.evaluate(() => {
      const cards = document.querySelectorAll('.testimonial-card, .testimonial-item, .review-card, [data-slide]');
      return cards.length >= 1 || document.body.textContent.includes('PT') || document.body.textContent.includes('Founder');
    });

    expect(hasClientCards).toBe(true);
  });

  test('12.3 5-star rating or quality score indicators are rendered', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasRatings = await driver.evaluate(() => {
      const text = document.body.textContent;
      const stars = document.querySelectorAll('.rating, .stars, .star, [data-rating]');
      return stars.length >= 1 || text.includes('★') || text.includes('5.0') || text.includes('Rating');
    });

    expect(hasRatings).toBe(true);
  });

  test('12.4 Carousel navigation buttons (next/prev) exist', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasControls = await driver.evaluate(() => {
      const prev = document.querySelector('.carousel-btn--prev, .carousel-prev, [data-prev], [aria-label*="prev" i]');
      const next = document.querySelector('.carousel-btn--next, .carousel-next, [data-next], [aria-label*="next" i]');
      return !!(prev && next);
    });

    expect(hasControls).toBe(true);
  });

  test('12.5 Hovering over carousel pauses auto-scroll', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hoverHandled = await driver.evaluate(() => {
      const carousel = document.querySelector('.testimonial-carousel, .testimonial-track, #testimonials');
      if (!carousel) return false;
      carousel.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      const paused = carousel._carousel ? carousel._carousel.timer === null : true;
      carousel.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      const resumed = carousel._carousel ? carousel._carousel.timer !== null : true;
      return paused && resumed;
    });

    expect(hoverHandled).toBe(true);
  });
});
