const fs = require('fs');
const cat = require('./categorized-checks.json');

// Let's print out the exact string and selector details for each section
Object.keys(cat).forEach(name => {
  const items = cat[name];
  if (!items.length) return;
  console.log(`\n============================= ${name.toUpperCase()} (${items.length} checks) =============================`);
  const uniqueCodes = [...new Set(items.map(i => `${i.file} [L${i.line}]: ${i.code}`))];
  uniqueCodes.slice(0, 15).forEach(c => console.log('  ' + c));
  if (uniqueCodes.length > 15) {
    console.log(`  ... and ${uniqueCodes.length - 15} more checks.`);
  }
});
