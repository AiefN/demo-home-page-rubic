const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');

(async () => {
  const server = new StaticServer();
  const { port } = await server.start();
  const driver = new BrowserDriver();
  await driver.launch();
  await driver.goto(`http://127.0.0.1:${port}/portfolio.html`);

  const result100ms = await driver.evaluate(async () => {
    const btnEcom = document.querySelector('[data-filter="ecommerce"]');
    const btnWebapp = document.querySelector('[data-filter="webapp"]');

    btnEcom.click();
    await new Promise(r => setTimeout(r, 100));
    btnWebapp.click(); // at 100ms
    await new Promise(r => setTimeout(r, 400));

    const activeFilter = document.querySelector('.filter-btn.active, .portfolio-filter-btn.is-active')?.getAttribute('data-filter');
    const visibleCards = Array.from(document.querySelectorAll('.portfolio-card')).filter(c => !c.classList.contains('is-hidden') && c.style.display !== 'none');

    return {
      clickedFirst: 'ecommerce',
      clickedSecond: 'webapp (at 100ms)',
      actualActiveFilter: activeFilter,
      visibleCount: visibleCards.length,
      visibleCategories: visibleCards.map(c => c.getAttribute('data-category'))
    };
  });

  console.log('Result with 100ms between clicks:', JSON.stringify(result100ms, null, 2));

  const result260ms = await driver.evaluate(async () => {
    const btnEcom = document.querySelector('[data-filter="ecommerce"]');
    const btnWebapp = document.querySelector('[data-filter="webapp"]');

    btnEcom.click();
    await new Promise(r => setTimeout(r, 260));
    btnWebapp.click(); // at 260ms (after transition lock clears)
    await new Promise(r => setTimeout(r, 400));

    const activeFilter = document.querySelector('.filter-btn.active, .portfolio-filter-btn.is-active')?.getAttribute('data-filter');
    const visibleCards = Array.from(document.querySelectorAll('.portfolio-card')).filter(c => !c.classList.contains('is-hidden') && c.style.display !== 'none');

    return {
      clickedFirst: 'ecommerce',
      clickedSecond: 'webapp (at 260ms)',
      actualActiveFilter: activeFilter,
      visibleCount: visibleCards.length,
      visibleCategories: visibleCards.map(c => c.getAttribute('data-category'))
    };
  });

  console.log('Result with 260ms between clicks:', JSON.stringify(result260ms, null, 2));

  await driver.close();
  await server.stop();
})();
