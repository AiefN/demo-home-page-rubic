const fs = require('fs');

const files = [
  'tests/challenger-m5-subpages-tilt-stress.js',
  'tests/challenger-m5-final-responsive.js',
  'tests/stress-challenger-m5-2.js'
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
