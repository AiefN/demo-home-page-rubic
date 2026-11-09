(function () {
  'use strict';

  let currentY = window.scrollY;
  let targetY = window.scrollY;
  let isRunning = false;

  const scrollMultiplier = 1.7;
  const easeFactor = 0.12;

  function onFrame() {
    const diff = targetY - currentY;
    currentY += diff * easeFactor;
    window.scrollTo(0, currentY);

    if (Math.abs(diff) > 0.6) {
      requestAnimationFrame(onFrame);
    } else {
      window.scrollTo(0, targetY);
      currentY = targetY;
      isRunning = false;
    }
  }

  function handleWheel(e) {
    if (e.ctrlKey) return;

    const isWheel = e.deltaMode === 1 || Math.abs(e.deltaY) >= 25;

    if (isWheel) {
      e.preventDefault();

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      targetY = Math.max(0, Math.min(targetY + (e.deltaY * scrollMultiplier), maxScroll));

      if (!isRunning) {
        isRunning = true;
        currentY = window.scrollY;
        requestAnimationFrame(onFrame);
      }
    } else {
      targetY = window.scrollY;
      currentY = window.scrollY;
    }
  }

  window.addEventListener('scroll', function () {
    if (!isRunning) {
      targetY = window.scrollY;
      currentY = window.scrollY;
    }
  }, { passive: true });

  window.addEventListener('wheel', handleWheel, { passive: false });

  window.kineticScrollTo = function (y) {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    targetY = Math.max(0, Math.min(y, maxScroll));
    if (!isRunning) {
      isRunning = true;
      currentY = window.scrollY;
      requestAnimationFrame(onFrame);
    }
  };
})();
