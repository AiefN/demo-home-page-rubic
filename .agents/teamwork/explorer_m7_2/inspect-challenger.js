const fs = require('fs');
const path = require('path');

const files = [
  'tests/challenger-m5-2-deep-verification.js',
  'tests/challenger-m6-2-pricing-faq-stress.js',
  'tests/adversarial-m5-verification.js'
];

files.forEach(file => {
  console.log(`\n=================== ${file} ===================`);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('includes(') || l.includes('assert(') || l.includes('throw new Error') || l.includes('querySelector') || l.includes('textContent') || l.includes('===') || l.includes('data-')) {
      if (l.trim().length > 0 && !l.trim().startsWith('//')) {
        console.log(`[L${idx+1}] ${l.trim()}`);
      }
    }
  });
});
