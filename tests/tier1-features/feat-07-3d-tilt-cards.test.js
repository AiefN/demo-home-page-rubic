const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 7: 3D Card Tilt & Border Glare', () => {
  test('7.1 Tilt card elements exist in DOM with 3D or spotlight classes', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const cardExists = await driver.evaluate(() => {
      const cards = document.querySelectorAll('.card-tilt, .interactive-spotlight, [data-tilt], .service-card, .portfolio-card');
      return cards.length >= 1;
    });

    expect(cardExists).toBe(true);
  });

  test('7.2 Mouse movement calculates dynamic coordinates on card', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasCoordinates = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      card.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + rect.width * 0.7,
        clientY: rect.top + rect.height * 0.3,
        bubbles: true
      }));

      const varX = card.style.getPropertyValue('--mouse-x') || card.style.getPropertyValue('--spotlight-x');
      const varY = card.style.getPropertyValue('--mouse-y') || card.style.getPropertyValue('--spotlight-y');
      const transform = card.style.transform;
      return !!(varX || varY || transform.includes('rotate') || transform.includes('perspective'));
    });

    expect(hasCoordinates).toBe(true);
  });

  test('7.3 3D perspective or tilt transformation responds to mouse position', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const tiltTriggered = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      card.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + 50,
        clientY: rect.top + 50,
        bubbles: true
      }));
      const transform = card.style.transform || '';
      return transform.includes('perspective') && (transform.includes('rotateX') || transform.includes('rotateY'));
    });

    expect(tiltTriggered).toBe(true);
  });

  test('7.4 Mouseleave resets tilt transform or removes active highlight', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const resetOnLeave = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      const transform = card.style.transform || '';
      return transform.includes('rotateX(0deg)') || transform.includes('scale3d(1, 1, 1)');
    });

    expect(resetOnLeave).toBe(true);
  });

  test('7.5 Specular border glow or radial gradient element is supported', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasGlow = await driver.evaluate(() => {
      const card = document.querySelector('.card-tilt, .interactive-spotlight, .service-card');
      if (!card) return false;
      const style = window.getComputedStyle(card, '::before');
      return style.content !== 'none' || style.backgroundImage.includes('radial-gradient') || style.background.includes('radial-gradient');
    });

    expect(hasGlow).toBe(true);
  });
});
