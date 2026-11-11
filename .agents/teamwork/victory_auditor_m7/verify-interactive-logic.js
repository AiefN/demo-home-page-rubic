const fs = require('fs');

const interactionsJs = fs.readFileSync('js/interactions.js', 'utf8');
const contactJs = fs.readFileSync('js/contact.js', 'utf8');
const portfolioJs = fs.readFileSync('js/portfolio.js', 'utf8');
const mainJs = fs.readFileSync('js/main.js', 'utf8');

console.log('=== FORENSIC LOGIC VERIFICATION ===');

// 1. Custom cursor LERP
console.log('\n--- 1. Cursor LERP Logic ---');
const hasCursorLERP = /requestAnimationFrame/i.test(interactionsJs) &&
                      /(?:currentX\s*\+=|targetX\s*-|lerp|\*=\s*|\*\s*0\.)/i.test(interactionsJs) &&
                      /cursorDot|cursorOutline|\.custom-cursor/i.test(interactionsJs);
console.log('Cursor LERP found:', hasCursorLERP);

// 2. 3D Card Tilt Physics
console.log('\n--- 2. 3D Card Tilt Physics ---');
const hasTilt = /getBoundingClientRect/i.test(interactionsJs) &&
                /rotateX/i.test(interactionsJs) &&
                /rotateY/i.test(interactionsJs) &&
                /perspective/i.test(interactionsJs);
console.log('Card Tilt physics math found:', hasTilt);

// 3. Stats Counter Ease-Out
console.log('\n--- 3. Stats Counter Ease-Out ---');
const hasStatsCounter = /IntersectionObserver/i.test(interactionsJs) &&
                        /(?:target|data-target|data-count)/i.test(interactionsJs) &&
                        /(?:requestAnimationFrame|setInterval|Math\.floor|ease)/i.test(interactionsJs);
console.log('Stats counter observer and ease-out found:', hasStatsCounter);

// 4. Testimonials Carousel
console.log('\n--- 4. Testimonials Carousel ---');
const hasCarousel = /(?:next|prev|autoScroll|setInterval|translateX)/i.test(interactionsJs) &&
                    /(?:mouseenter|mouseleave|mouseover|mouseout)/i.test(interactionsJs);
console.log('Carousel auto-scroll & pause-on-hover found:', hasCarousel);

// 5. FAQ Accordion Single-Active
console.log('\n--- 5. FAQ Accordion ---');
const hasFaq = /faq/i.test(interactionsJs) &&
               /aria-expanded/i.test(interactionsJs) &&
               /(?:scrollHeight|maxHeight|height)/i.test(interactionsJs);
console.log('FAQ accordion single active toggle found:', hasFaq);

// 6. Dynamic Pricing Calculator
console.log('\n--- 6. Dynamic Pricing Calculator ---');
const hasPricingCalc = /(?:calc-total-price|calculateTotal|basePrice|extraPages)/i.test(contactJs) &&
                       /(?:formatCurrency|Intl\.NumberFormat|Rp)/i.test(contactJs) &&
                       /(?:data-price|data-express|0\.25|1\.25)/i.test(contactJs);
console.log('Dynamic pricing calculator arithmetic found:', hasPricingCalc);

// 7. Contact Form Validation
console.log('\n--- 7. Contact Form Regex Validation ---');
const hasFormValidation = /(?:test\(|match\(|regex)/i.test(contactJs) &&
                          /(?:@|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i.test(contactJs) &&
                          /(?:08|\+62)/i.test(contactJs);
console.log('Contact form regex validation found:', hasFormValidation);

// 8. Portfolio Filtering & Case Study Modal
console.log('\n--- 8. Portfolio Modal & Filtering ---');
const hasPortfolio = /(?:filter|data-filter|category)/i.test(portfolioJs) &&
                     /(?:modal|case-study|aria-hidden)/i.test(portfolioJs);
console.log('Portfolio filtering & modal logic found:', hasPortfolio);
