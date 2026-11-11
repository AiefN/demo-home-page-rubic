const fs = require('fs');
const path = require('path');

const data = require('./test-analysis.json');
const checks = require('./test-checks-full.json');

// Categorize all text assertions
const categoryMap = {
  hero: [],
  services: [],
  trustStats: [],
  portfolio: [],
  pricing: [],
  testimonials: [],
  faq: [],
  navbarDrawer: [],
  footer: [],
  contactForm: [],
  servicesPage: [],
  portfolioPage: [],
  cursorTilt: []
};

checks.forEach(fileObj => {
  fileObj.checks.forEach(check => {
    const code = check.code;
    const file = fileObj.file;
    const item = { file, line: check.lineNum, code };

    if (file.includes('hero') || code.includes('#hero') || code.includes('.hero-')) {
      categoryMap.hero.push(item);
    }
    if (file.includes('service') || code.includes('#services') || code.includes('.service-') || code.includes('#service-modal')) {
      categoryMap.services.push(item);
    }
    if (file.includes('stats') || file.includes('trust') || code.includes('stat-number') || code.includes('counter-target') || code.includes('#why-us')) {
      categoryMap.trustStats.push(item);
    }
    if (file.includes('portfolio') || code.includes('#portfolio') || code.includes('case-study') || code.includes('project-id') || code.includes('nexastore')) {
      categoryMap.portfolio.push(item);
    }
    if (file.includes('calc') || file.includes('pricing') || code.includes('pricing') || code.includes('extra-pages') || code.includes('tier')) {
      categoryMap.pricing.push(item);
    }
    if (file.includes('carousel') || file.includes('testimonial') || code.includes('testimonial')) {
      categoryMap.testimonials.push(item);
    }
    if (file.includes('faq') || code.includes('#faq') || code.includes('faq-')) {
      categoryMap.faq.push(item);
    }
    if (file.includes('nav') || file.includes('drawer') || code.includes('navbar') || code.includes('mobile-menu')) {
      categoryMap.navbarDrawer.push(item);
    }
    if (file.includes('footer') || code.includes('footer') || code.includes('Rubic Kirana')) {
      categoryMap.footer.push(item);
    }
    if (file.includes('contact') || file.includes('form') || code.includes('#contact-form') || code.includes('#name') || code.includes('#email')) {
      categoryMap.contactForm.push(item);
    }
    if (file.includes('workflow') || file.includes('timeline') || code.includes('workflow') || code.includes('timeline')) {
      categoryMap.servicesPage.push(item);
    }
  });
});

console.log('Category Counts:');
Object.keys(categoryMap).forEach(k => {
  console.log(`- ${k}: ${categoryMap[k].length} checks`);
});

fs.writeFileSync(path.join(__dirname, 'categorized-checks.json'), JSON.stringify(categoryMap, null, 2), 'utf8');
console.log('categorized-checks.json generated.');
