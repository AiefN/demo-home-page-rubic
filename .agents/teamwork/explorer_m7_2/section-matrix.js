const fs = require('fs');
const path = require('path');

const checksFull = require('./test-checks-full.json');

// Let's filter checks by group or keyword
function getFileChecks(filePattern) {
  return checksFull.filter(f => f.file.includes(filePattern));
}

console.log('Total files tracked:', checksFull.length);

// Let's check feat-14 through feat-18
['feat-14', 'feat-15', 'feat-16', 'feat-17', 'feat-18'].forEach(suite => {
  const fileData = checksFull.find(f => f.file.includes(suite));
  console.log(`\n=== ${suite} (${fileData ? fileData.file : 'NOT FOUND'}) ===`);
  if (fileData) {
    fileData.checks.forEach(c => console.log(`  [L${c.lineNum}] ${c.code}`));
  }
});
