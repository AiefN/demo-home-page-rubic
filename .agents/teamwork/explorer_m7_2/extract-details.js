const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules') results = results.concat(walk(full));
    } else if (file.endsWith('.js')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk(path.resolve(__dirname, '../../../tests'));

const fileDetails = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(path.resolve(__dirname, '../../..'), f);

  // Extract each test() or each assertion block
  const lines = content.split('\n');
  const textChecks = [];

  lines.forEach((line, idx) => {
    // Check for text checks
    if (line.includes('.includes(') || line.includes('.match(') || line.includes('.test(') ||
        line.includes('textContent') || line.includes('innerText') || line.includes('innerHTML') ||
        line.includes('value ===') || line.includes('value ==') || line.includes('toBe(') ||
        line.includes('toContain(') || line.includes('toEqual(') || line.includes('querySelector') ||
        line.includes('getAttribute')) {
      textChecks.push({ lineNum: idx + 1, code: line.trim() });
    }
  });

  fileDetails.push({
    file: relPath,
    checks: textChecks
  });
});

fs.writeFileSync(path.join(__dirname, 'test-checks-full.json'), JSON.stringify(fileDetails, null, 2), 'utf8');
console.log('test-checks-full.json written successfully.');
