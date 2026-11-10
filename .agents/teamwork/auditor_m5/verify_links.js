const fs = require('fs');
const pages = ['index.html', 'services.html', 'portfolio.html', 'contact.html'];

for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  console.log(`=== ${p} ===`);
  for (const target of pages) {
    const hasLink = html.includes(`href="${target}`) || 
                    html.includes(`href="./${target}`) || 
                    (target === 'index.html' && (html.includes('href="/"') || html.includes('href="index.html"')));
    console.log(`  links to ${target}: ${hasLink}`);
  }
}
