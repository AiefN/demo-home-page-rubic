const path = require('path');
const fs = require('fs');
const BrowserDriver = require('../../../tests/helpers/browser-driver');

async function testFix() {
  const driver = new BrowserDriver();
  try {
    console.log('Testing proposed fixes empirically via CDP...');
    await driver.launch();
    await driver.goto('http://127.0.0.1:5500/index.html');
    await new Promise(r => setTimeout(r, 1000));

    // Apply proposed CSS fixes in the page
    await driver.evaluate(() => {
      // 1. Inject proposed styles
      const style = document.createElement('style');
      style.id = 'explorer-proposed-fixes';
      style.textContent = `
        /* FIX 1: Full-height Hero to prevent section spill at fold */
        .hero, .hero-section {
          min-height: 100vh !important;
          min-height: 100dvh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding-top: 100px !important;
          padding-bottom: 60px !important;
        }

        /* FIX 2: 2-Column Hero Grid on Desktop */
        @media (min-width: 1024px) {
          .hero-container {
            display: grid !important;
            grid-template-columns: 1.15fr 0.85fr !important;
            gap: 48px !important;
            align-items: center !important;
            width: 100% !important;
          }
          .hero-content-col {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* FIX 3: Hero Telemetry Bar flex styling */
        .hero-telemetry-bar {
          display: flex !important;
          align-items: center !important;
          gap: 20px !important;
          flex-wrap: wrap !important;
          padding: 16px 20px !important;
          background: rgba(24, 25, 32, 0.7) !important;
          border: 1px solid rgba(242, 242, 246, 0.1) !important;
          border-radius: 10px !important;
          margin-top: 8px !important;
        }
        .hero-telemetry-bar .telemetry-item {
          display: flex;
          flex-direction: column;
        }
        .hero-telemetry-bar .telemetry-divider {
          width: 1px;
          height: 32px;
          background: rgba(242, 242, 246, 0.15);
        }

        /* FIX 4: Floating Nav Dock Scroll Visibility & Styling */
        .floating-bottom-nav {
          transition: transform 0.35s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.35s ease !important;
          background-color: rgba(17, 18, 22, 0.94) !important; /* higher opacity to prevent text bleed */
          border: 1px solid rgba(210, 254, 113, 0.3) !important;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.75), 0 0 20px rgba(210, 254, 113, 0.1) !important;
        }
        .floating-bottom-nav.nav-dock--hidden {
          transform: translate(-50%, 150%) !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);

      // Reorganize Hero DOM into 2 columns (Left: copy/ctas/telemetry; Right: Showcase Card)
      const heroContainer = document.querySelector('.hero-container');
      if (heroContainer) {
        // Collect current hero elements
        const badge = heroContainer.querySelector('.hero-badge-wrap');
        const title = heroContainer.querySelector('.hero-title');
        const subheadline = heroContainer.querySelector('.hero-subheadline');
        const actions = heroContainer.querySelector('.hero-actions');
        const telemetry = heroContainer.querySelector('.hero-telemetry-bar');

        const leftCol = document.createElement('div');
        leftCol.className = 'hero-content-col';
        if (badge) leftCol.appendChild(badge);
        if (title) leftCol.appendChild(title);
        if (subheadline) leftCol.appendChild(subheadline);
        if (actions) leftCol.appendChild(actions);
        if (telemetry) leftCol.appendChild(telemetry);

        const rightCol = document.createElement('div');
        rightCol.className = 'hero-showcase-col';
        rightCol.innerHTML = `
          <div class="hero-showcase-card card-tilt interactive-card" style="
            background: linear-gradient(145deg, #181920 0%, #131419 100%);
            border: 1px solid rgba(242, 242, 246, 0.14);
            border-radius: 18px;
            padding: 24px;
            box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 30px rgba(210,254,113,0.08);
            position: relative;
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid rgba(242,242,246,0.08); padding-bottom: 12px;">
              <div style="display: flex; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #a1a3af;">rubicweb.engine.config.ts</span>
              <span style="display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.7rem; color: #d2fe71; background: rgba(210,254,113,0.1); padding: 3px 8px; border-radius: 999px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #d2fe71;"></span> PRODUCTION READY
              </span>
            </div>
            <pre style="font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.6; color: #f2f2f6; overflow-x: auto; margin-bottom: 18px;"><code><span style="color:#d2fe71;">export const</span> <span style="color:#70b2b9;">rubicwebStack</span> = {
  <span style="color:#ffd166;">architecture</span>: <span style="color:#a1a3af;">"High-Performance Clean Code"</span>,
  <span style="color:#ffd166;">frameworks</span>: <span style="color:#a1a3af;">"Zero-Dependency / Pure Vanilla"</span>,
  <span style="color:#ffd166;">telemetry</span>: {
    <span style="color:#ffd166;">pageSpeed</span>: <span style="color:#d2fe71;">99</span>,
    <span style="color:#ffd166;">firstContentfulPaint</span>: <span style="color:#d2fe71;">"0.7s"</span>,
    <span style="color:#ffd166;">uptimeSLA</span>: <span style="color:#d2fe71;">"99.9%"</span>
  },
  <span style="color:#ffd166;">ownership</span>: <span style="color:#a1a3af;">"100% Full Source Code"</span>,
  <span style="color:#ffd166;">guarantee</span>: <span style="color:#ff8588;">"Money-Back Warranty"</span>
};</code></pre>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; border-top: 1px solid rgba(242,242,246,0.08); padding-top: 14px;">
              <div style="background: rgba(32,34,43,0.6); padding: 10px; border-radius: 8px; text-align: center;">
                <div style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: #d2fe71;">99/100</div>
                <div style="font-size: 0.7rem; color: #a1a3af;">PageSpeed</div>
              </div>
              <div style="background: rgba(32,34,43,0.6); padding: 10px; border-radius: 8px; text-align: center;">
                <div style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: #70b2b9;">60 fps</div>
                <div style="font-size: 0.7rem; color: #a1a3af;">Animations</div>
              </div>
              <div style="background: rgba(32,34,43,0.6); padding: 10px; border-radius: 8px; text-align: center;">
                <div style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: #ffd166;">100%</div>
                <div style="font-size: 0.7rem; color: #a1a3af;">Ownership</div>
              </div>
            </div>
          </div>
        `;

        heroContainer.innerHTML = '';
        heroContainer.appendChild(leftCol);
        heroContainer.appendChild(rightCol);
      }
    });

    console.log('Proposed fixes applied in DOM. Testing viewports...');

    const viewports = [
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 }
    ];

    for (const vp of viewports) {
      console.log(`\n========================================`);
      console.log(`VERIFYING VIEWPORT: ${vp.width}x${vp.height}`);
      console.log(`========================================`);
      await driver.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 400));

      const metrics = await driver.evaluate(() => {
        const floatingNav = document.querySelector('.floating-bottom-nav');
        const servicesSection = document.querySelector('#services');
        const servicesTitle = servicesSection ? servicesSection.querySelector('.section-title') : null;
        const heroContainer = document.querySelector('.hero-container');
        const leftCol = document.querySelector('.hero-content-col');
        const rightCol = document.querySelector('.hero-showcase-col');

        const fnRect = floatingNav ? floatingNav.getBoundingClientRect() : null;
        const stRect = servicesTitle ? servicesTitle.getBoundingClientRect() : null;
        const hcRect = heroContainer ? heroContainer.getBoundingClientRect() : null;
        const lcRect = leftCol ? leftCol.getBoundingClientRect() : null;
        const rcRect = rightCol ? rightCol.getBoundingClientRect() : null;

        let navIntersectsServicesTitle = false;
        if (fnRect && stRect) {
          navIntersectsServicesTitle = !(
            fnRect.right < stRect.left ||
            fnRect.left > stRect.right ||
            fnRect.bottom < stRect.top ||
            fnRect.top > stRect.bottom
          );
        }

        return {
          windowInnerHeight: window.innerHeight,
          scrollY: window.scrollY,
          servicesTitleTop: stRect ? stRect.top : null,
          floatingNavBottom: fnRect ? fnRect.bottom : null,
          floatingNavTop: fnRect ? fnRect.top : null,
          navIntersectsServicesTitle,
          heroWidth: hcRect ? hcRect.width : null,
          leftColWidth: lcRect ? lcRect.width : null,
          rightColWidth: rcRect ? rcRect.width : null,
          rightColRight: rcRect ? rcRect.right : null,
          containerRight: hcRect ? hcRect.right : null
        };
      });

      console.log(`Services Title Top: ${metrics.servicesTitleTop}px (Viewport Height: ${metrics.windowInnerHeight}px)`);
      console.log(`Floating Nav Rect: top=${metrics.floatingNavTop}px, bottom=${metrics.floatingNavBottom}px`);
      console.log(`Collision with Section Title at scrollY=0: ${metrics.navIntersectsServicesTitle}`);
      console.log(`Hero Container Width: ${metrics.heroWidth}px`);
      console.log(`Left Col Width: ${metrics.leftColWidth}px, Right Col Width: ${metrics.rightColWidth}px`);
      console.log(`Right Col Right Edge: ${metrics.rightColRight}px vs Container Right Edge: ${metrics.containerRight}px`);

      const ss = await driver.send('Page.captureScreenshot');
      const ssPath = path.join(__dirname, `verified_${vp.width}x${vp.height}.png`);
      fs.writeFileSync(ssPath, Buffer.from(ss.data, 'base64'));
      console.log(`Saved screenshot to ${ssPath}`);
    }

  } catch (err) {
    console.error('Error in testFix:', err);
  } finally {
    await driver.close();
  }
}

testFix();
