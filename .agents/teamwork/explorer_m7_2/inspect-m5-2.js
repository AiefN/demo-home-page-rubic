const fs = require('fs');

const content = fs.readFileSync('tests/challenger-m5-2-deep-verification.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (idx >= 500) {
    if (l.includes('test(') || l.includes('assert(') || l.includes('expect(') || l.includes('suite(') || l.includes('check(') || l.includes('includes(') || l.includes('querySelector') || l.includes('throw new Error') || l.includes('passed =')) {
      console.log(`[L${idx+1}] ${l.trim()}`);
    }
  }
});
