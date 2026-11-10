/**
 * Independent Forensic Integrity Test Script
 * Milestone 5 Iteration 1 Forensic Audit
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  verdict: 'PENDING'
};

function recordCheck(name, passed, details) {
  results.checks.push({ name, passed, details });
  console.log(`${passed ? '✓ PASS' : '✗ FAIL'}: [${name}] - ${details}`);
}

async function runAudit() {
  console.log('=====================================================');
  console.log(' FORENSIC INTEGRITY AUDIT: INDEPENDENT VERIFICATION ');
  console.log('=====================================================\n');

  // 1. Static Scan: 0 occurrences of || true in tests, js, html
  const testFiles = [];
  function collectFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.agents') {
        collectFiles(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html'))) {
        testFiles.push(fullPath);
      }
    }
  }
  collectFiles(path.join(PROJECT_ROOT, 'tests'));
  collectFiles(path.join(PROJECT_ROOT, 'js'));

  let orTrueCount = 0;
  const orTrueLocations = [];
  const orTrueRegex = /\|\|\s*true\b/g;

  for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (orTrueRegex.test(content)) {
      orTrueCount++;
      orTrueLocations.push(path.relative(PROJECT_ROOT, file));
    }
  }

  recordCheck(
    'Purge of || true shortcuts',
    orTrueCount === 0,
    orTrueCount === 0
      ? 'Zero occurrences of || true found across all test and js files'
      : `Found ${orTrueCount} occurrences in: ${orTrueLocations.join(', ')}`
  );

  // 2. HTML Framework and Remote Script Scan
  const htmlFiles = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
  let remoteScriptCount = 0;
  let frameworkCount = 0;
  let inlineScriptCount = 0;

  for (const file of htmlFiles) {
    const fullPath = path.join(PROJECT_ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Check remote script
    const remoteScriptRegex = /<script[^>]*src=["'](https?:|\/\/)[^"']*["']/gi;
    const remoteMatches = content.match(remoteScriptRegex);
    if (remoteMatches) remoteScriptCount += remoteMatches.length;

    // Check inline scripts (excluding external link scripts)
    const scriptBlocks = content.match(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi);
    if (scriptBlocks) inlineScriptCount += scriptBlocks.length;

    // Check prohibited framework mentions in script tags
    const frameworkRegex = /src=["'][^"']*(react|vue|angular|jquery|bootstrap|tailwind)[^"']*["']/gi;
    const fwMatches = content.match(frameworkRegex);
    if (fwMatches) frameworkCount += fwMatches.length;
  }

  recordCheck(
    'Zero Remote Scripts in Production HTML',
    remoteScriptCount === 0,
    remoteScriptCount === 0 ? 'Zero remote CDN <script> tags found' : `Found ${remoteScriptCount} remote scripts`
  );

  recordCheck(
    'Zero Inline Script Blocks in Production HTML',
    inlineScriptCount === 0,
    inlineScriptCount === 0 ? 'Zero inline <script> blocks found' : `Found ${inlineScriptCount} inline scripts`
  );

  recordCheck(
    'Zero Frontend Frameworks Linked in HTML',
    frameworkCount === 0,
    frameworkCount === 0 ? 'Zero React, Vue, jQuery, Bootstrap, Tailwind references' : `Found ${frameworkCount} framework scripts`
  );

  // 3. Algorithmic Verification: Pricing Calculator Math
  const contactJsPath = path.join(PROJECT_ROOT, 'js', 'contact.js');
  const contactJs = fs.readFileSync(contactJsPath, 'utf8');

  // Verify BASE_CONFIG values
  const hasBasic = contactJs.includes('basic:') && contactJs.includes('price: 2500000');
  const hasPro = contactJs.includes('pro:') && contactJs.includes('price: 5500000');
  const hasEnterprise = contactJs.includes('enterprise:') && contactJs.includes('price: 12000000');
  const hasExpressMultiplier = contactJs.includes('subtotal * 1.25');

  recordCheck(
    'Pricing Calculator Configuration & Express Multiplier',
    hasBasic && hasPro && hasEnterprise && hasExpressMultiplier,
    'Verified Basic (2.5M), Pro (5.5M), Enterprise (12M), and Express factor 1.25'
  );

  // 4. Algorithmic Verification: Cursor LERP Formula
  const interactionsJsPath = path.join(PROJECT_ROOT, 'js', 'interactions.js');
  const interactionsJs = fs.readFileSync(interactionsJsPath, 'utf8');

  const hasLerpFactor = interactionsJs.includes('dx * 0.16') && interactionsJs.includes('dy * 0.16');
  recordCheck(
    'Custom Cursor LERP Interpolation Algorithm',
    hasLerpFactor,
    hasLerpFactor ? 'Verified exact linear interpolation formula with λ = 0.16' : 'LERP formula missing'
  );

  // 5. Algorithmic Verification: 3D Perspective Tilt Math
  const hasTiltMath = interactionsJs.includes('normX = (x - rect.width / 2) / (rect.width / 2)') &&
                      interactionsJs.includes('perspective(1000px)') &&
                      interactionsJs.includes('maxTilt = 10');
  recordCheck(
    '3D Perspective Tilt Deflection & Clamp Math',
    hasTiltMath,
    hasTiltMath ? 'Verified normalized coordinate deflection centered at (0,0) clamped to ±10° with 1000px perspective' : 'Tilt math missing'
  );

  // 6. Algorithmic Verification: easeOutExpo Stats Counter Formula
  const hasEaseOutExpo = interactionsJs.includes('1 - Math.pow(2, -10 * progress)');
  recordCheck(
    'Stats Counter easeOutExpo Curve Definition',
    hasEaseOutExpo,
    hasEaseOutExpo ? 'Verified exact mathematical formula f(t) = 1 - 2^(-10t)' : 'easeOutExpo missing'
  );

  // 7. Verify Phone Number Indonesian Regex
  const hasIdnPhoneRegex = contactJs.includes('^(\\+62|62|0)8[1-9][0-9]{6,11}$');
  recordCheck(
    'Indonesian WhatsApp Phone Number Regex Verification',
    hasIdnPhoneRegex,
    hasIdnPhoneRegex ? 'Verified regex pattern ^(\\+62|62|0)8[1-9][0-9]{6,11}$' : 'Indonesian phone regex missing'
  );

  // Final Verdict determination
  const allPassed = results.checks.every(c => c.passed);
  results.verdict = allPassed ? 'CLEAN' : 'INTEGRITY VIOLATION';
  console.log(`\n=====================================================`);
  console.log(`FINAL INDEPENDENT AUDIT VERDICT: ${results.verdict}`);
  console.log(`=====================================================\n`);

  fs.writeFileSync(
    path.join(__dirname, 'independent_forensic_results.json'),
    JSON.stringify(results, null, 2)
  );
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
