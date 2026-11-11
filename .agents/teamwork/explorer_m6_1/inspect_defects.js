const path = require('path');
const fs = require('fs');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

async function inspect() {
  const driver = new BrowserDriver();
  try {
    console.log('Launching browser driver...');
    await driver.launch();
    console.log('Browser launched. Navigating to http://127.0.0.1:5500/index.html...');
    await driver.goto('http://127.0.0.1:5500/index.html');
    await driver.wait?.(1500) || new Promise(r => setTimeout(r, 1500));

    const viewports = [
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 }
    ];

    for (const vp of viewports) {
      console.log(`\n========================================`);
      console.log(`VIEWPORT: ${vp.width}x${vp.height}`);
      console.log(`========================================`);
      await driver.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 500));

      const metrics = await driver.evaluate(() => {
        const bodyRect = document.body.getBoundingClientRect();
        const container = document.querySelector('.container');
        const heroSection = document.querySelector('.hero-section');
        const heroContainer = document.querySelector('.hero-container');
        const heroTitle = document.querySelector('.hero-title');
        const heroSubheadline = document.querySelector('.hero-subheadline');
        const heroActions = document.querySelector('.hero-actions');
        const heroTelemetry = document.querySelector('.hero-telemetry-bar');
        const floatingNav = document.querySelector('.floating-bottom-nav');
        const allFloatingNavs = document.querySelectorAll('.floating-bottom-nav');
        const siteHeader = document.querySelector('.site-header');
        const servicesSection = document.querySelector('#services');
        const servicesTitle = servicesSection ? servicesSection.querySelector('.section-title') : null;

        const getBox = (el) => {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const comp = window.getComputedStyle(el);
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            maxWidth: comp.maxWidth,
            display: comp.display,
            position: comp.position,
            marginLeft: comp.marginLeft,
            marginRight: comp.marginRight,
            paddingLeft: comp.paddingLeft,
            paddingRight: comp.paddingRight,
            zIndex: comp.zIndex,
            backgroundColor: comp.backgroundColor,
            backdropFilter: comp.backdropFilter || comp.webkitBackdropFilter
          };
        };

        const heroChildren = heroContainer ? Array.from(heroContainer.children).map(c => {
          const r = c.getBoundingClientRect();
          const comp = window.getComputedStyle(c);
          return {
            tagName: c.tagName,
            className: c.className,
            text: c.textContent.trim().substring(0, 40),
            rect: { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right },
            display: comp.display,
            width: comp.width,
            maxWidth: comp.maxWidth,
            textAlign: comp.textAlign
          };
        }) : [];

        // Check intersection between floating-bottom-nav and services title
        let navIntersectsServicesTitle = false;
        if (floatingNav && servicesTitle) {
          const fnRect = floatingNav.getBoundingClientRect();
          const stRect = servicesTitle.getBoundingClientRect();
          navIntersectsServicesTitle = !(
            fnRect.right < stRect.left ||
            fnRect.left > stRect.right ||
            fnRect.bottom < stRect.top ||
            fnRect.top > stRect.bottom
          );
        }

        return {
          windowInnerWidth: window.innerWidth,
          windowInnerHeight: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          container: getBox(container),
          heroSection: getBox(heroSection),
          heroContainer: getBox(heroContainer),
          heroTitle: getBox(heroTitle),
          heroSubheadline: getBox(heroSubheadline),
          heroActions: getBox(heroActions),
          heroTelemetry: getBox(heroTelemetry),
          heroChildren,
          floatingNavCount: allFloatingNavs.length,
          floatingNav: getBox(floatingNav),
          siteHeader: getBox(siteHeader),
          servicesTitle: getBox(servicesTitle),
          navIntersectsServicesTitle
        };
      });

      console.log('Metrics summary:');
      console.log(`Window: ${metrics.windowInnerWidth}x${metrics.windowInnerHeight}`);
      console.log(`Hero Container: width=${metrics.heroContainer?.width}px, left=${metrics.heroContainer?.left}px, right=${metrics.heroContainer?.right}px, maxWidth=${metrics.heroContainer?.maxWidth}`);
      console.log(`Hero Title: width=${metrics.heroTitle?.width}px, text='${metrics.heroTitle?.width}'`);
      console.log(`Hero Telemetry: display=${metrics.heroTelemetry?.display}, width=${metrics.heroTelemetry?.width}px, height=${metrics.heroTelemetry?.height}px`);
      console.log(`Hero Children Count: ${metrics.heroChildren.length}`);
      metrics.heroChildren.forEach((child, i) => {
        console.log(`  [${i}] <${child.tagName} class="${child.className}"> width=${child.rect.width}px, height=${child.rect.height}px, right=${child.rect.right}px`);
      });

      const containerRight = metrics.heroContainer ? metrics.heroContainer.right : 0;
      const titleRight = metrics.heroTitle ? metrics.heroTitle.right : 0;
      const actionsRight = metrics.heroActions ? metrics.heroActions.right : 0;
      const telemetryRight = metrics.heroTelemetry ? metrics.heroTelemetry.right : 0;
      console.log(`Void analysis in Hero: Container right edge is at ${containerRight}px. Max child right edge is at ${Math.max(titleRight, actionsRight, telemetryRight)}px. Void width = ${containerRight - Math.max(titleRight, actionsRight, telemetryRight)}px`);

      console.log(`\nFloating Nav Details:`);
      console.log(`Floating Nav Count in DOM: ${metrics.floatingNavCount}`);
      console.log(`Floating Nav Rect: top=${metrics.floatingNav?.top}px, bottom=${metrics.floatingNav?.bottom}px, left=${metrics.floatingNav?.left}px, width=${metrics.floatingNav?.width}px, height=${metrics.floatingNav?.height}px, pos=${metrics.floatingNav?.position}, zIndex=${metrics.floatingNav?.zIndex}, bg=${metrics.floatingNav?.backgroundColor}, blur=${metrics.floatingNav?.backdropFilter}`);
      console.log(`Services Section Title Rect: top=${metrics.servicesTitle?.top}px, bottom=${metrics.servicesTitle?.bottom}px, height=${metrics.servicesTitle?.height}px`);
      console.log(`Collision at scrollY=0: navIntersectsServicesTitle = ${metrics.navIntersectsServicesTitle}`);

      const ss = await driver.send('Page.captureScreenshot');
      const ssPath = path.join(__dirname, `screenshot_${vp.width}x${vp.height}.png`);
      fs.writeFileSync(ssPath, Buffer.from(ss.data, 'base64'));
      console.log(`Saved screenshot to ${ssPath}`);
    }

    // Now test scrolling to see collision with sections!
    console.log(`\n========================================`);
    console.log(`SCROLL COLLISION TEST (1440x900)`);
    console.log(`========================================`);
    await driver.setViewport({ width: 1440, height: 900 });
    const scrollPositions = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    for (const sy of scrollPositions) {
      await driver.evaluate((y) => window.scrollTo(0, y), sy);
      await new Promise(r => setTimeout(r, 200));
      const overlapInfo = await driver.evaluate(() => {
        const fn = document.querySelector('.floating-bottom-nav');
        if (!fn) return { error: 'no floating nav' };
        const fnRect = fn.getBoundingClientRect();
        
        // Find any headings (h1, h2, h3) currently overlapping with fnRect
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, .section-title, .section-header'));
        const overlapping = headings.map(h => {
          const r = h.getBoundingClientRect();
          const intersects = !(
            fnRect.right < r.left ||
            fnRect.left > r.right ||
            fnRect.bottom < r.top ||
            fnRect.top > r.bottom
          );
          return {
            text: h.textContent.trim().substring(0, 50),
            tag: h.tagName,
            className: h.className,
            intersects,
            rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right }
          };
        }).filter(h => h.intersects);

        return {
          scrollY: window.scrollY,
          fnTop: fnRect.top,
          fnBottom: fnRect.bottom,
          overlapping
        };
      });

      console.log(`scrollY = ${sy}px: overlapping headings count = ${overlapInfo.overlapping.length}`);
      overlapInfo.overlapping.forEach(o => {
        console.log(`  -> COLLISION with <${o.tag} class="${o.className}"> "${o.text}" (heading top: ${o.rect.top}px, bottom: ${o.rect.bottom}px, nav top: ${overlapInfo.fnTop}px)`);
      });
    }

  } catch (err) {
    console.error('Error during inspection:', err);
  } finally {
    await driver.close();
  }
}

inspect();
