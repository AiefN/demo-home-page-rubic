const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('FORENSIC AUDIT: Milestone 1 CSS & Assets Independent');
console.log('====================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${message}`);
  } else {
    failedChecks++;
    console.error(`[FAIL] ${message}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

// 1. FILE EXISTENCE & SIZE VERIFICATION
console.log('--- 1. File Existence & Size Checks ---');
const files = [
  { path: 'css/style.css', minSize: 20000, maxSize: 100000 },
  { path: 'css/animations.css', minSize: 3000, maxSize: 50000 },
  { path: 'css/responsive.css', minSize: 5000, maxSize: 50000 }
];

files.forEach(f => {
  const exists = fs.existsSync(f.path);
  assert(exists, `File exists: ${f.path}`);
  if (exists) {
    const size = fs.statSync(f.path).size;
    assert(size >= f.minSize && size <= f.maxSize, 
      `File size in valid range (${size} bytes): ${f.path}`, 
      `Expected ${f.minSize}-${f.maxSize}, got ${size}`);
  }
});

// 2. PARSE INTEGRITY & BALANCED TOKENS
console.log('\n--- 2. Syntax & AST Parse Integrity ---');
files.forEach(f => {
  if (!fs.existsSync(f.path)) return;
  const content = fs.readFileSync(f.path, 'utf8');

  // Check balanced braces
  let braces = 0;
  let inString = false;
  let strChar = '';
  let inComment = false;
  let line = 1;
  let hasBraceError = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1] || '';
    if (ch === '\n') line++;

    if (inComment) {
      if (ch === '*' && next === '/') {
        inComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (ch === strChar && content[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }
    if (ch === '/' && next === '*') {
      inComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      strChar = ch;
      continue;
    }
    if (ch === '{') braces++;
    if (ch === '}') {
      braces--;
      if (braces < 0) {
        hasBraceError = true;
        break;
      }
    }
  }

  assert(!hasBraceError && braces === 0, `Balanced braces in ${f.path}`);
  assert(!inComment, `No unterminated comments in ${f.path}`);
  assert(!inString, `No unterminated strings in ${f.path}`);
});

// 3. FRAMEWORK BUNDLING & CIRCUMVENTION AUDIT
console.log('\n--- 3. Framework Bundling & Circumvention Audit ---');
const prohibitedFrameworks = [
  { name: 'Tailwind CSS', regex: /tailwind|@tailwind|tw-|tailwindcss/i },
  { name: 'Bootstrap', regex: /bootstrap|col-xs-|col-sm-|col-md-|col-lg-|modal-header|modal-footer|navbar-expand/i },
  { name: 'Bulma', regex: /bulma|is-primary|is-info|is-danger|column is-/i },
  { name: 'Foundation', regex: /foundation-sites|grid-x|cell small-/i },
  { name: 'External CSS CDNs', regex: /@import\s+url\(['"]?https?:\/\/(?!fonts\.googleapis\.com).+['"]?\)/i }
];

files.forEach(f => {
  if (!fs.existsSync(f.path)) return;
  const content = fs.readFileSync(f.path, 'utf8');
  prohibitedFrameworks.forEach(fw => {
    const match = content.match(fw.regex);
    assert(!match, `No ${fw.name} signatures in ${f.path}`, match ? match[0] : '');
  });
});

// 4. FACADE & DUMMY IMPLEMENTATION DETECTION
console.log('\n--- 4. Facade & Dummy Implementation Audit ---');
files.forEach(f => {
  if (!fs.existsSync(f.path)) return;
  const content = fs.readFileSync(f.path, 'utf8');

  // Strip comments
  const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // Detect empty rulesets (e.g. .class { })
  // Notice: @media or @keyframes contain nested blocks, so match property rules:
  // We can find all blocks and verify that terminal blocks (containing properties) are not empty
  const emptyBlockMatch = stripped.match(/([^{}]+)\{\s*\}/g);
  assert(!emptyBlockMatch || emptyBlockMatch.length === 0, 
    `No empty rulesets in ${f.path}`, 
    emptyBlockMatch ? emptyBlockMatch.join(', ') : '');

  // Detect dummy TODO or NotImplemented comments
  const dummyCommentMatch = content.match(/TODO|FIXME|PLACEHOLDER|NOT_IMPLEMENTED|DUMMY|STUB/gi);
  assert(!dummyCommentMatch, `No TODO/DUMMY/STUB markers in ${f.path}`, 
    dummyCommentMatch ? dummyCommentMatch.join(', ') : '');
});

// 5. COLOR SCHEME & DESIGN TOKENS COMPLIANCE
console.log('\n--- 5. Room & Pillar Color & Tokens Compliance ---');
const styleCss = fs.readFileSync('css/style.css', 'utf8');

const requiredTokens = [
  { token: '--bg-primary', expectedSub: '#111216' },
  { token: '--accent-primary', expectedSub: '#d2fe71' },
  { token: '--text-primary', expectedSub: '#f2f2f6' },
  { token: '--text-secondary', expectedSub: '#a1a3af' },
  { token: '--text-muted', expectedSub: '#63646a' },
  { token: '--font-display', expectedSub: 'Plus Jakarta Sans' },
  { token: '--font-heading', expectedSub: 'Space Grotesk' },
  { token: '--font-mono', expectedSub: 'JetBrains Mono' },
  { token: '--border-subtle', expectedSub: 'rgba(242, 242, 246, 0.14)' },
  { token: '--border-hover', expectedSub: 'rgba(210, 254, 113' }
];

requiredTokens.forEach(req => {
  const hasToken = styleCss.includes(req.token);
  assert(hasToken, `Master token defined: ${req.token}`);
  if (hasToken) {
    const tokenLine = styleCss.split('\n').find(l => l.includes(req.token));
    const matchesVal = tokenLine && tokenLine.toLowerCase().includes(req.expectedSub.toLowerCase());
    assert(matchesVal, `Token ${req.token} matches architectural value (${req.expectedSub})`, tokenLine ? tokenLine.trim() : '');
  }
});

// Architectural Drafting Grid
assert(styleCss.includes('radial-gradient(circle, rgba(242, 242, 246, 0.065) 1px, transparent 1px)'), 
  'Architectural drafting dot grid pattern implemented');

// 6. ANIMATIONS & MICRO-INTERACTIONS AUDIT
console.log('\n--- 6. Keyframes & GPU Acceleration Audit ---');
const animCss = fs.readFileSync('css/animations.css', 'utf8');

const requiredKeyframes = [
  'ripple',
  'pulseGlow',
  'float',
  'shimmer',
  'textReveal',
  'fadeInScale',
  'spinSlow',
  'blinkCursor',
  'arrowNudge',
  'beaconPulse'
];

requiredKeyframes.forEach(kf => {
  const hasKf = new RegExp(`@keyframes\\s+${kf}\\b`).test(animCss);
  assert(hasKf, `Required keyframe defined: @keyframes ${kf}`);
});

// Reduced motion media query
assert(animCss.includes('@media (prefers-reduced-motion: reduce)'), 
  'Accessible reduced-motion media query implemented');

// GPU acceleration checks
assert(animCss.includes('transform: translateZ(0)') || animCss.includes('will-change: transform'), 
  'Hardware acceleration properties used in animations');

// 7. RESPONSIVE BREAKPOINT AUDIT
console.log('\n--- 7. Responsive Breakpoint & Touch Degradation Audit ---');
const respCss = fs.readFileSync('css/responsive.css', 'utf8');

const requiredMediaQueries = [
  { name: 'Ultra-wide 1440px+', query: 'min-width: 1440px' },
  { name: 'Standard Desktop 1024px-1439px', query: 'min-width: 1024px' },
  { name: 'Tablet 768px-1023px', query: 'max-width: 1023px' },
  { name: 'Mobile <768px', query: 'max-width: 767px' },
  { name: 'Compact Mobile <380px', query: 'max-width: 380px' },
  { name: 'Touch Device Degradation', query: '(hover: none) and (pointer: coarse)' }
];

requiredMediaQueries.forEach(mq => {
  const hasMq = respCss.includes(mq.query);
  assert(hasMq, `Responsive breakpoint defined: ${mq.name} (${mq.query})`);
});

// Zero horizontal overflow rule
assert(respCss.includes('overflow-x: hidden'), 'Strict horizontal overflow-x protection in responsive.css');

// iOS auto-zoom prevention (16px input font-size)
assert(respCss.includes('font-size: 16px !important'), 'iOS Safari auto-zoom prevention (16px form inputs)');

// 8. ASSETS & SVG INTEGRITY AUDIT
console.log('\n--- 8. Assets & Vector Graphics Integrity Audit ---');
const iconsDir = 'assets/icons';
const requiredIcons = [
  'whatsapp.svg', 'chevron-down.svg', 'arrow-right.svg', 'close.svg',
  'check.svg', 'star.svg', 'speedometer.svg', 'shield.svg',
  'server.svg', 'code.svg', 'layout.svg', 'layers.svg',
  'refresh.svg', 'phone.svg', 'mail.svg', 'map-pin.svg'
];

requiredIcons.forEach(icon => {
  const full = path.join(iconsDir, icon);
  const exists = fs.existsSync(full);
  assert(exists, `Icon exists: ${icon}`);
  if (exists) {
    const raw = fs.readFileSync(full, 'utf8');
    const validSvg = raw.includes('<svg') && raw.includes('</svg>') && raw.includes('viewBox');
    assert(validSvg, `Icon ${icon} is valid SVG with viewBox`);
    const hasPath = /<(path|circle|polygon|polyline|ellipse|rect|line|g)\b/i.test(raw);
    assert(hasPath, `Icon ${icon} contains genuine vector geometry`);
  }
});

// Mockups
const mockups = [
  'assets/portfolio/jelypos-mockup.svg',
  'assets/portfolio/karalia-mockup.svg',
  'assets/portfolio/pinjamin-mockup.svg',
  'assets/portfolio/wilmar-mockup.svg'
];

mockups.forEach(m => {
  const exists = fs.existsSync(m);
  assert(exists, `Portfolio mockup exists: ${m}`);
  if (exists) {
    const raw = fs.readFileSync(m, 'utf8');
    const valid = raw.includes('<svg') && raw.includes('</svg>') && raw.length > 500;
    assert(valid, `Portfolio mockup ${m} contains high-fidelity SVG (${raw.length} bytes)`);
  }
});

console.log('\n====================================================');
console.log(`AUDIT SUMMARY: ${totalChecks} Checks, ${passedChecks} Passed, ${failedChecks} Failed`);
console.log(`VERDICT: ${failedChecks === 0 ? 'CLEAN' : 'INTEGRITY VIOLATION'}`);
console.log('====================================================');

if (failedChecks > 0) {
  process.exit(1);
}
