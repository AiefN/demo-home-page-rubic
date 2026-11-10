/**
 * Independent Forensic Verification Script for Milestone 1 Remediation (Iteration 2)
 * Uses native BrowserDriver from tests/helpers/browser-driver.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const BrowserDriver = require(path.resolve('tests/helpers/browser-driver.js'));

async function runAudit() {
  const results = {
    checks: [],
    passed: 0,
    failed: 0
  };

  function assert(name, condition, details) {
    if (condition) {
      results.passed++;
      results.checks.push({ name, status: 'PASS', details });
      console.log(`[PASS] ${name}: ${details || ''}`);
    } else {
      results.failed++;
      results.checks.push({ name, status: 'FAIL', details });
      console.error(`[FAIL] ${name}: ${details || ''}`);
    }
  }

  console.log('=== PHASE 1: STATIC SOURCE CODE FORENSICS ===');

  const styleCssPath = path.resolve('css/style.css');
  const responsiveCssPath = path.resolve('css/responsive.css');
  const animationsCssPath = path.resolve('css/animations.css');

  assert('style.css exists', fs.existsSync(styleCssPath), `${fs.statSync(styleCssPath).size} bytes`);
  assert('responsive.css exists', fs.existsSync(responsiveCssPath), `${fs.statSync(responsiveCssPath).size} bytes`);
  assert('animations.css exists', fs.existsSync(animationsCssPath), `${fs.statSync(animationsCssPath).size} bytes`);

  const styleCss = fs.readFileSync(styleCssPath, 'utf8');
  const responsiveCss = fs.readFileSync(responsiveCssPath, 'utf8');
  const animationsCss = fs.readFileSync(animationsCssPath, 'utf8');

  // No Forbidden Frameworks or CDNs
  const forbidden = ['bootstrap', 'tailwind', 'bulma', 'foundation', 'jquery', 'react', 'vue', 'cdn.jsdelivr', 'unpkg.com', 'cdnjs.cloudflare'];
  for (const term of forbidden) {
    const foundInStyle = new RegExp('\\b' + term + '\\b', 'i').test(styleCss);
    const foundInResp = new RegExp('\\b' + term + '\\b', 'i').test(responsiveCss);
    const foundInAnim = new RegExp('\\b' + term + '\\b', 'i').test(animationsCss);
    assert(`No forbidden library '${term}'`, !foundInStyle && !foundInResp && !foundInAnim, 'Clean');
  }

  // No empty rules or stubs
  const emptyRulesRegex = /[^{}]+\{\s*\}/g;
  const stubRegex = /\b(TODO|FIXME|STUB|DUMMY|PLACEHOLDER)\b/gi;
  assert('style.css has no empty rules', !emptyRulesRegex.test(styleCss), 'No empty blocks');
  assert('responsive.css has no empty rules', !emptyRulesRegex.test(responsiveCss), 'No empty blocks');
  assert('animations.css has no empty rules', !emptyRulesRegex.test(animationsCss), 'No empty blocks');
  assert('style.css has no stubs', !stubRegex.test(styleCss), 'Clean');
  assert('responsive.css has no stubs', !stubRegex.test(responsiveCss), 'Clean');

  // Specific Remediation Edits Verification
  assert('style.css contains min-height: 0 on .faq-inner', styleCss.includes('min-height: 0;'), 'min-height: 0 present');
  assert('style.css contains padding: 0 28px 0 28px on .faq-inner', /padding:\s*0\s+28px\s+0\s+28px;/.test(styleCss), 'Closed padding is 0 top/bottom');
  assert('style.css contains padding-bottom: 24px on active .faq-inner', /padding-bottom:\s*24px;/.test(styleCss), 'Active padding-bottom is 24px');
  assert('style.css contains max-width: none on .testimonial-track', styleCss.includes('max-width: none !important;'), 'Track max-width overridden');

  assert('responsive.css contains flex: 0 0 100% on mobile testimonial card', /flex:\s*0\s+0\s+100%\s*!important/.test(responsiveCss), 'Mobile card flex is 100%');
  assert('responsive.css contains padding-bottom: 18px on mobile active .faq-inner', /padding-bottom:\s*18px;/.test(responsiveCss), 'Mobile active padding-bottom is 18px');
  assert('responsive.css contains .testimonial-track max-width: none exemption', responsiveCss.includes('.testimonial-track {\n    max-width: none !important;\n  }') || responsiveCss.includes('.testimonial-track {\r\n    max-width: none !important;\r\n  }') || responsiveCss.includes('.testimonial-track {\n  max-width: none !important;\n}'), 'Exemption present');

  console.log('\n=== PHASE 2: BEHAVIORAL DOM MEASUREMENT (BROWSER DRIVER) ===');

  const server = http.createServer((req, res) => {
    let filePath = path.join(process.cwd(), req.url.split('?')[0]);
    if (req.url === '/' || req.url === '/test-fixture.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forensic Verification Fixture</title>
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/animations.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body style="background:#111216; color:#f2f2f6; margin:0; padding:20px;">
  <!-- FAQ Section Fixture -->
  <div class="faq-container" style="max-width:800px; margin:0 auto;">
    <div class="faq-item" id="faq-closed">
      <button class="faq-header">Apakah saya mendapatkan full source code?</button>
      <div class="faq-content">
        <div class="faq-inner">Ya, 100% kepemilikan source code diserahkan kepada Anda setelah pelunasan proyek.</div>
      </div>
    </div>

    <div class="faq-item is-active" id="faq-active">
      <button class="faq-header">Berapa lama estimasi pengerjaan?</button>
      <div class="faq-content">
        <div class="faq-inner">Rata-rata 5-14 hari kerja tergantung kompleksitas dan paket yang dipilih.</div>
      </div>
    </div>
  </div>

  <!-- Testimonial Section Fixture -->
  <div class="testimonial-section" style="max-width:1200px; margin:40px auto; overflow:hidden;">
    <div class="testimonial-carousel">
      <div class="testimonial-track" id="test-track">
        <div class="testimonial-card" id="test-card-1">
          <p class="testimonial-quote">"Rubicweb mentransformasi web kami."</p>
          <span class="testimonial-author">Budi Santoso</span>
        </div>
        <div class="testimonial-card" id="test-card-2">
          <p class="testimonial-quote">"Hasil memuaskan, PageSpeed 98."</p>
          <span class="testimonial-author">Siti Rahma</span>
        </div>
        <div class="testimonial-card" id="test-card-3">
          <p class="testimonial-quote">"Sangat profesional dan cepat."</p>
          <span class="testimonial-author">Ahmad Fauzi</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise(resolve => server.listen(8089, resolve));
  console.log('Fixture server listening on port 8089');

  const driver = new BrowserDriver();
  await driver.launch();

  // Test 1: Desktop Viewport (1440x900)
  await driver.setViewport({ width: 1440, height: 900 });
  await driver.goto('http://127.0.0.1:8089/test-fixture.html');
  await new Promise(r => setTimeout(r, 600));

  const d = await driver.evaluate(`(() => {
    const closedContent = document.querySelector('#faq-closed .faq-content');
    const closedInner = document.querySelector('#faq-closed .faq-inner');
    const activeContent = document.querySelector('#faq-active .faq-content');
    const activeInner = document.querySelector('#faq-active .faq-inner');
    const track = document.querySelector('#test-track');
    const card = document.querySelector('#test-card-1');

    const closedRect = closedContent.getBoundingClientRect();
    const closedInnerRect = closedInner.getBoundingClientRect();
    const activeRect = activeContent.getBoundingClientRect();
    const activeInnerStyle = window.getComputedStyle(activeInner);
    const closedInnerStyle = window.getComputedStyle(closedInner);
    const trackStyle = window.getComputedStyle(track);
    const cardStyle = window.getComputedStyle(card);
    const cardRect = card.getBoundingClientRect();

    return {
      closedHeight: closedRect.height,
      closedInnerHeight: closedInnerRect.height,
      closedPaddingBottom: closedInnerStyle.paddingBottom,
      activeHeight: activeRect.height,
      activePaddingBottom: activeInnerStyle.paddingBottom,
      trackMaxWidth: trackStyle.maxWidth,
      cardWidth: cardRect.width,
      cardFlex: cardStyle.flex
    };
  })()`);

  console.log('Desktop Measurements (1440px):', JSON.stringify(d, null, 2));

  assert('Desktop: Closed FAQ Content Height is exactly 0px', d.closedHeight === 0, `Measured: ${d.closedHeight}px`);
  assert('Desktop: Closed FAQ Inner Padding-Bottom is 0px', d.closedPaddingBottom === '0px', `Measured: ${d.closedPaddingBottom}`);
  assert('Desktop: Active FAQ Content Height > 0px', d.activeHeight > 0, `Measured: ${d.activeHeight}px`);
  assert('Desktop: Active FAQ Inner Padding-Bottom is 24px', d.activePaddingBottom === '24px', `Measured: ${d.activePaddingBottom}`);
  assert('Desktop: Testimonial Track maxWidth is none', d.trackMaxWidth === 'none', `Measured: ${d.trackMaxWidth}`);

  // Test 2: Mobile Viewport (360x640)
  await driver.setViewport({ width: 360, height: 640 });
  await new Promise(r => setTimeout(r, 600));

  const m = await driver.evaluate(`(() => {
    const closedContent = document.querySelector('#faq-closed .faq-content');
    const closedInner = document.querySelector('#faq-closed .faq-inner');
    const activeContent = document.querySelector('#faq-active .faq-content');
    const activeInner = document.querySelector('#faq-active .faq-inner');
    const track = document.querySelector('#test-track');
    const card = document.querySelector('#test-card-1');
    const carousel = document.querySelector('.testimonial-carousel');

    const closedRect = closedContent.getBoundingClientRect();
    const activeRect = activeContent.getBoundingClientRect();
    const activeInnerStyle = window.getComputedStyle(activeInner);
    const closedInnerStyle = window.getComputedStyle(closedInner);
    const trackStyle = window.getComputedStyle(track);
    const cardStyle = window.getComputedStyle(card);
    const cardRect = card.getBoundingClientRect();
    const carouselRect = carousel.getBoundingClientRect();

    return {
      closedHeight: closedRect.height,
      closedPaddingBottom: closedInnerStyle.paddingBottom,
      activeHeight: activeRect.height,
      activePaddingBottom: activeInnerStyle.paddingBottom,
      trackMaxWidth: trackStyle.maxWidth,
      cardWidth: cardRect.width,
      carouselWidth: carouselRect.width,
      cardFlex: cardStyle.flex,
      cardMaxWidth: cardStyle.maxWidth
    };
  })()`);

  console.log('Mobile Measurements (360px):', JSON.stringify(m, null, 2));

  assert('Mobile: Closed FAQ Content Height is exactly 0px', m.closedHeight === 0, `Measured: ${m.closedHeight}px`);
  assert('Mobile: Closed FAQ Inner Padding-Bottom is 0px', m.closedPaddingBottom === '0px', `Measured: ${m.closedPaddingBottom}`);
  assert('Mobile: Active FAQ Inner Padding-Bottom is 18px', m.activePaddingBottom === '18px', `Measured: ${m.activePaddingBottom}`);
  assert('Mobile: Testimonial Card flex is 0 0 100%', m.cardFlex.includes('100%'), `Measured: ${m.cardFlex}`);
  assert('Mobile: Testimonial Card occupies ~100% carousel width', Math.abs(m.cardWidth - m.carouselWidth) < 15, `Card: ${m.cardWidth}px, Carousel: ${m.carouselWidth}px`);
  assert('Mobile: Testimonial Track maxWidth is none', m.trackMaxWidth === 'none', `Measured: ${m.trackMaxWidth}`);

  // Clean up
  await driver.close();
  server.close();

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Checks: ${results.checks.length}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Verdict: ${results.failed === 0 ? 'CLEAN' : 'INTEGRITY VIOLATION'}`);

  return results;
}

runAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
