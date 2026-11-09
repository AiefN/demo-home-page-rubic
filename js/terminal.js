(function () {
  'use strict';

  const rawCode = `const yourBusiness = {
  speed: 'Pretty Good ⚡',
  seoRanking: '#1 Google Page',
  conversion: 'Maximum 🔥'
};`;

  function initTerminal() {
    const codeContainer = document.getElementById('typewriter-code');
    if (!codeContainer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      codeContainer.innerHTML = highlightSyntax(rawCode);
      return;
    }

    let currentIndex = 0;
    const typingSpeed = 12;

    function typeNextChar() {
      if (currentIndex <= rawCode.length) {
        const textToFormat = rawCode.substring(0, currentIndex);
        codeContainer.innerHTML = highlightSyntax(textToFormat);
        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      }
    }

    setTimeout(typeNextChar, 100);
  }

  function restartTyping() {
    const codeContainer = document.getElementById('typewriter-code');
    if (!codeContainer) return;
    codeContainer.innerHTML = '';
    let currentIndex = 0;
    const typingSpeed = 10;

    function typeNextChar() {
      if (currentIndex <= rawCode.length) {
        const textToFormat = rawCode.substring(0, currentIndex);
        codeContainer.innerHTML = highlightSyntax(textToFormat);
        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      }
    }

    setTimeout(typeNextChar, 40);
  }

  window.rerunTerminalCode = restartTyping;

  function highlightSyntax(code) {
    let html = escapeHtml(code);

    html = html.replace(/\bconst\b/g, '<span style="color:#FF7A00;font-weight:700;">const</span>');
    html = html.replace(/\b(speed|seoRanking|conversion)\b:/g, '<span style="color:#FFB800;font-weight:600;">$1</span>:');
    html = html.replace(/'([^']*)'/g, '<span style="color:#34D399;font-weight:500;">\'$1\'</span>');
    html = html.replace(/\byourBusiness\b/g, '<span style="color:#38BDF8;font-weight:700;">yourBusiness</span>');

    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminal);
  } else {
    initTerminal();
  }
})();
