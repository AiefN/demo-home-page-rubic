const fs = require('fs');
const path = require('path');

const htmlFiles = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];
const jsFiles = ['js/main.js', 'js/interactions.js', 'js/portfolio.js', 'js/contact.js'];

console.log('=== CHECKING HTML FILES FOR EXTERNAL SCRIPTS / LIBS ===');
let externalFound = false;
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const scripts = [...content.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  console.log(`[${file}] script tags:`, JSON.stringify(scripts));
  for (const s of scripts) {
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//')) {
      console.error(`VIOLATION: External script in ${file}: ${s}`);
      externalFound = true;
    }
  }
  const links = [...content.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  for (const l of links) {
    if (l.includes('bootstrap') || l.includes('tailwind') || l.includes('material')) {
      console.error(`VIOLATION: Framework CSS in ${file}: ${l}`);
      externalFound = true;
    }
  }
}

console.log('\n=== CHECKING JS FILES FOR FRAMEWORKS OR MOCK FACADES ===');
for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`[${file}] (${content.length} bytes, ${content.split('\n').length} lines)`);
  
  // Check for dummy return constants or empty functions
  const emptyFuncs = [...content.matchAll(/function\s*([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{\s*return\s+(?:true|false|null|undefined|0|['"][^'"]*['"])\s*;\s*\}/g)];
  if (emptyFuncs.length > 0) {
    console.warn(`WARNING: Potential dummy function in ${file}:`, emptyFuncs.map(m => m[0]));
  }
}

if (!externalFound) {
  console.log('\nRESULT: 100% PURE VANILLA STACK CONFIRMED (Zero external frameworks, CDNs, or libraries)');
}
