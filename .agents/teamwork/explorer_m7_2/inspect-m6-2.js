const fs = require('fs');

const content = fs.readFileSync('tests/challenger-m6-2-pricing-faq-stress.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('test(') || l.includes('assert(') || l.includes('expect(') || l.includes('suite(') || l.includes('check(') || l.includes('includes(') || l.includes('querySelector') || l.includes('throw new Error')) {
    console.log(`[L${idx+1}] ${l.trim()}`);
  }
});
