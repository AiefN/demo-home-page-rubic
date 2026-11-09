(function () {
  'use strict';

  function initNavigation() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const drawerLinks = document.querySelectorAll('.mobile-nav-list a');

    if (toggleBtn && drawer) {
      function openDrawer() {
        drawer.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-active');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        const firstLink = drawer.querySelector('a');
        if (firstLink) firstLink.focus();
      }

      function closeDrawer() {
        drawer.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggleBtn.focus();
      }

      toggleBtn.addEventListener('click', function () {
        const isOpen = drawer.classList.contains('is-open');
        if (isOpen) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });

      if (backdrop) {
        backdrop.addEventListener('click', closeDrawer);
      }

      drawerLinks.forEach(function (link) {
        link.addEventListener('click', closeDrawer);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
          closeDrawer();
        }
      });
    }

    initScrollSpy();
    handleFloatingNavScroll();
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .floating-nav-links a, .mobile-nav-list a');

    if (!sections.length || !navLinks.length) return;

    let isTicking = false;

    function updateActiveNav() {
      const scrollPos = window.scrollY + 200;

      sections.forEach(function (section) {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('active');
            } else if (href && href.startsWith('#')) {
              link.classList.remove('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (!isTicking) {
        window.requestAnimationFrame(function () {
          updateActiveNav();
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });

    updateActiveNav();
  }

  function handleFloatingNavScroll() {
    const floatingNav = document.querySelector('.floating-bottom-nav');
    if (!floatingNav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          const currentScrollY = window.scrollY;

          if (currentScrollY < 120) {
            floatingNav.style.transform = 'translate(-50%, 0)';
            floatingNav.style.opacity = '0.92';
          } else if (currentScrollY > lastScrollY && currentScrollY > 600) {
            floatingNav.style.transform = 'translate(-50%, 120%)';
            floatingNav.style.opacity = '0';
          } else {
            floatingNav.style.transform = 'translate(-50%, 0)';
            floatingNav.style.opacity = '1';
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
