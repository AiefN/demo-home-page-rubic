(function () {
  'use strict';

  function initInteractive() {
    initSpotlightEffect();
    initAnimatedCounters();
    initTerminalControls();
    initPortfolioTilt();
  }

  function initSpotlightEffect() {
    const spotlightCards = document.querySelectorAll('.interactive-spotlight');
    if (!spotlightCards.length) return;

    spotlightCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--spotlight-x', x + 'px');
        card.style.setProperty('--spotlight-y', y + 'px');
      });
    });
  }

  function initAnimatedCounters() {
    const counterElements = document.querySelectorAll('.stat-number[data-target]');
    if (!counterElements.length) return;

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          counterElements.forEach(el => animateNumber(el));
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });

    const statsGrid = document.querySelector('.stats-cards-grid');
    if (statsGrid) {
      observer.observe(statsGrid);
    }

    function animateNumber(element) {
      const targetStr = element.getAttribute('data-target') || '0';
      const suffix = element.getAttribute('data-suffix') || '';
      const decimals = parseInt(element.getAttribute('data-decimals') || '0', 10);
      const target = parseFloat(targetStr);
      const duration = 1600;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * ease;

        if (decimals > 0) {
          element.innerHTML = current.toFixed(decimals) + '<span class="stat-plus">' + suffix + '</span>';
        } else {
          element.innerHTML = Math.floor(current) + '<span class="stat-plus">' + suffix + '</span>';
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (decimals > 0) {
            element.innerHTML = target.toFixed(decimals) + '<span class="stat-plus">' + suffix + '</span>';
          } else {
            element.innerHTML = Math.floor(target) + '<span class="stat-plus">' + suffix + '</span>';
          }
        }
      }

      requestAnimationFrame(update);
    }
  }

  function initTerminalControls() {
    const rerunBtn = document.getElementById('terminal-rerun-btn');
    const greenDot = document.getElementById('term-dot-green');
    const yellowDot = document.getElementById('term-dot-yellow');
    const redDot = document.getElementById('term-dot-red');
    const typewriterCode = document.getElementById('typewriter-code');

    if (rerunBtn) {
      rerunBtn.addEventListener('click', function () {
        rerunBtn.style.transform = 'scale(0.92)';
        setTimeout(() => rerunBtn.style.transform = '', 150);
        if (typeof window.rerunTerminalCode === 'function') {
          window.rerunTerminalCode();
        }
      });
    }

    if (greenDot) {
      greenDot.style.cursor = 'pointer';
      greenDot.addEventListener('click', function () {
        if (typeof window.rerunTerminalCode === 'function') {
          window.rerunTerminalCode();
        }
      });
    }

    if (yellowDot) {
      yellowDot.style.cursor = 'pointer';
      yellowDot.addEventListener('click', function () {
        if (typewriterCode) {
          typewriterCode.innerHTML = '<span style="color:#F59E0B">Console cleared. Click Re-Run ⚡</span>';
        }
      });
    }

    if (redDot) {
      redDot.style.cursor = 'pointer';
      redDot.addEventListener('click', function () {
        if (typewriterCode) {
          typewriterCode.innerHTML = '<span style="color:#EF4444">Process stopped. Ready to execute.</span>';
        }
      });
    }
  }

  function initPortfolioTilt() {
    const card = document.querySelector('.portfolio-preview-card');
    if (!card) return;

    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      
      const tiltX = -(y / (rect.height / 2)) * 3;
      const tiltY = (x / (rect.width / 2)) * 3;

      card.style.transform = 'perspective(1000px) rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + tiltY.toFixed(2) + 'deg) translateY(-2px)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.transition = 'transform 0.4s ease';
    });

    card.addEventListener('mouseenter', function () {
      card.style.transition = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractive);
  } else {
    initInteractive();
  }
})();
