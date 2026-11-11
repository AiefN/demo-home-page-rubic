const fs = require('fs');
const path = require('path');

const checksFull = require('./test-checks-full.json');

const standalone = checksFull.filter(f => !f.file.includes('tier1-') && !f.file.includes('tier2-') && !f.file.includes('tier3-') && !f.file.includes('tier4-') && !f.file.includes('helpers'));

console.log(`\n================ Standalone Test Files (${standalone.length}) ================`);
standalone.forEach(f => {
  console.log(`\n--- ${f.file} ---`);
  f.checks.forEach(c => {
    console.log(`  [L${c.lineNum}] ${c.code}`);
  });
});
