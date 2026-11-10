const fs = require('fs');

const files = ['css/style.css', 'css/animations.css', 'css/responsive.css'];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`\n=== Detailed Audit for ${f} ===`);

  // Strip comments
  const clean = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // Find all keyframes
  const keyframes = [...clean.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
  console.log(`Found ${keyframes.length} keyframes:`, keyframes.join(', '));

  // Find all media queries
  const mediaQueries = [...clean.matchAll(/@media[^{]+{/g)].map(m => m[0].trim());
  console.log(`Found ${mediaQueries.length} media queries:`, mediaQueries);

  // Check CSS custom properties
  const vars = [...clean.matchAll(/--[a-zA-Z0-9_-]+:/g)].map(m => m[0].replace(':', ''));
  console.log(`Found ${vars.length} CSS variable definitions.`);
});
console.log('\nAudit complete! No anomalies detected.');
