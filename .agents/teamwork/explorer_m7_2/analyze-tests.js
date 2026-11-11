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

const analysis = [];
const allSelectors = new Set();
const allIncludes = new Set();
const allRegexes = new Set();
const allAttributes = new Set();

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(path.resolve(__dirname, '../../..'), f);

  // querySelector / querySelectorAll
  const qsMatches = [...content.matchAll(/querySelector(?:All)?\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g)].map(m => m[1]);
  // .includes('...')
  const incMatches = [...content.matchAll(/\.includes\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g)].map(m => m[1]);
  // getAttribute('...')
  const attrMatches = [...content.matchAll(/getAttribute\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g)].map(m => m[1]);
  // RegExp literals or match
  const matchRegex = [...content.matchAll(/\.match\s*\(\s*\/([^/]+)\/([a-z]*)\s*\)/g)].map(m => `/${m[1]}/${m[2]}`);
  const testRegex = [...content.matchAll(/\/([^/]+)\/([a-z]*)\.test\s*\(/g)].map(m => `/${m[1]}/${m[2]}`);

  qsMatches.forEach(s => s.split(',').map(x => x.trim()).forEach(sel => allSelectors.add(sel)));
  incMatches.forEach(i => allIncludes.add(i));
  attrMatches.forEach(a => allAttributes.add(a));
  matchRegex.forEach(r => allRegexes.add(r));
  testRegex.forEach(r => allRegexes.add(r));

  analysis.push({
    file: relPath,
    selectors: [...new Set(qsMatches)],
    includes: [...new Set(incMatches)],
    attributes: [...new Set(attrMatches)],
    regexes: [...new Set([...matchRegex, ...testRegex])]
  });
});

const report = {
  totalFiles: files.length,
  allSelectors: [...allSelectors].sort(),
  allIncludes: [...allIncludes].sort(),
  allAttributes: [...allAttributes].sort(),
  allRegexes: [...allRegexes].sort(),
  files: analysis
};

fs.writeFileSync(path.join(__dirname, 'test-analysis.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`Analyzed ${files.length} files. test-analysis.json written successfully.`);
