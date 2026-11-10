const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 9: Filterable Portfolio Gallery', () => {
  test('9.1 Portfolio showcase section is rendered with multiple project items', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const projectCount = await driver.evaluate(() => {
      const items = document.querySelectorAll('#portfolio .portfolio-card, #portfolio [data-category], #portfolio .project-card, #portfolio article');
      return items.length;
    });

    expect(projectCount).toBeGreaterThanOrEqual(2);
  });

  test('9.2 Category filter buttons or tabs are present in portfolio section', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const filterButtons = await driver.evaluate(() => {
      const btns = document.querySelectorAll('#portfolio [data-filter], #portfolio .filter-btn, #portfolio .portfolio-filter-btn');
      return btns.length;
    });

    expect(filterButtons).toBeGreaterThanOrEqual(1);
  });

  test('9.3 Clicking filter button updates active state without reloading page', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const filterToggled = await driver.evaluate(() => {
      const btns = document.querySelectorAll('#portfolio [data-filter], #portfolio .portfolio-filter-btn');
      if (btns.length < 2) return false;
      btns[1].click();
      return (btns[1].classList.contains('active') || btns[1].classList.contains('is-active')) &&
             btns[1].getAttribute('aria-selected') === 'true';
    });

    expect(filterToggled).toBe(true);
  });

  test('9.4 Portfolio cards display tech stack or technology badges', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasTechStack = await driver.evaluate(() => {
      const tags = document.querySelectorAll('#portfolio .tech-badge, #portfolio .tag, #portfolio .badge, #portfolio [data-tech], #portfolio span');
      return tags.length >= 2;
    });

    expect(hasTechStack).toBe(true);
  });

  test('9.5 Portfolio project items feature action links or modal trigger buttons', async ({ driver, baseUrl }) => {
    await driver.goto(`${baseUrl}/index.html`);
    const hasActions = await driver.evaluate(() => {
      const actions = document.querySelectorAll('#portfolio a, #portfolio button, #portfolio .btn-case-study, #portfolio [data-modal-target]');
      return actions.length >= 2;
    });

    expect(hasActions).toBe(true);
  });
});
