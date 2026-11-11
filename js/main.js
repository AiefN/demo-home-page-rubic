/**
 * Rubicweb — Main JavaScript Engine
 * Architecture: Core Layout, Dynamic Navigation & Accessibility
 *
 * Responsibilities:
 * 1. Dynamic Scroll-Reactive Navigation (shrink, blur, hysteresis hide/show)
 * 2. Mobile Navigation Drawer (slide toggle, overlay, focus trapping, body scroll lock, Escape dismissal)
 * 3. Smooth Anchor Scrolling with dynamic header offset
 * 4. Back-to-Top Button Controller
 *
 * Clean Separation of Concerns:
 * - Micro-interactions (cursor, 3D tilt, stats counters, carousel, FAQ accordion) -> js/interactions.js
 * - Portfolio filtering & case study modals -> js/portfolio.js
 * - Form validation & pricing calculator -> js/contact.js
 */

(function () {
  'use strict';

  function initApp() {
    initNavigation();
    initFloatingBottomNav();
    initSmoothAnchors();
    initScrollSpy();
    initBackToTop();
  }

  /* --------------------------------------------------------------------------
   * 1. NAVIGATION ENGINE (Scroll Hysteresis & Mobile Drawer)
   * -------------------------------------------------------------------------- */
  function initNavigation() {
    const header = document.querySelector('.site-header') || document.querySelector('.navbar') || document.getElementById('site-header');
    const toggleBtn = document.querySelector('.navbar__toggle') || document.querySelector('.hamburger-btn') || document.querySelector('.mobile-toggle');
    const drawer = document.querySelector('.mobile-menu') || document.querySelector('.mobile-drawer') || document.getElementById('mobile-nav-drawer');
    const overlay = document.querySelector('.mobile-menu-overlay') || document.querySelector('.mobile-nav-backdrop');
    const closeBtn = document.querySelector('.drawer-close-btn') || document.querySelector('.mobile-drawer__close');

    if (header) {
      let lastScrollY = window.scrollY;
      let ticking = false;

      function onScroll() {
        const currentY = window.scrollY;
        const deltaY = currentY - lastScrollY;

        // 1. Scroll-shrink and backdrop blur at scrollY > 40
        if (currentY > 40) {
          header.classList.add('navbar--scrolled', 'site-header--scrolled', 'nav-scrolled', 'is-scrolled');
        } else {
          header.classList.remove('navbar--scrolled', 'site-header--scrolled', 'nav-scrolled', 'is-scrolled');
        }

        // 2. Scroll hysteresis: hide on scroll down past 120px with delta > 10px; reveal on scroll up
        if (currentY > 120 && deltaY > 10) {
          header.classList.add('navbar--hidden', 'site-header--hidden', 'nav-hidden', 'is-hidden');
        } else if (deltaY < -5 || currentY <= 120) {
          header.classList.remove('navbar--hidden', 'site-header--hidden', 'nav-hidden', 'is-hidden');
        }

        lastScrollY = currentY;
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      }, { passive: true });

      // Run initial check
      onScroll();
    }

    // Mobile Drawer Controller
    if (toggleBtn && drawer) {
      function openDrawer() {
        drawer.classList.add('is-open', 'active', 'open');
        if (overlay) overlay.classList.add('is-open', 'is-active');
        toggleBtn.classList.add('is-open', 'navbar__toggle--active', 'is-active');
        toggleBtn.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        document.body.style.overflow = 'hidden';

        // Focus first link or close button inside drawer
        const focusable = drawer.querySelectorAll('a[href], button:not([disabled])');
        if (focusable.length > 0) {
          setTimeout(() => focusable[0].focus(), 50);
        }
      }

      function closeDrawer() {
        drawer.classList.remove('is-open', 'active', 'open');
        if (overlay) overlay.classList.remove('is-open', 'is-active');
        toggleBtn.classList.remove('is-open', 'navbar__toggle--active', 'is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        document.body.style.overflow = '';
        toggleBtn.focus();
      }

      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = drawer.classList.contains('is-open') || drawer.classList.contains('active');
        if (isOpen) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });

      if (overlay) {
        overlay.addEventListener('click', closeDrawer);
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', closeDrawer);
      }

      drawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          closeDrawer();
        });
      });

      // Escape key closes mobile drawer (listen on both window and document)
      function handleEscapeKey(e) {
        if (e.key === 'Escape' && (drawer.classList.contains('is-open') || drawer.classList.contains('active'))) {
          closeDrawer();
        }
      }
      window.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleEscapeKey);

      // Focus trapping inside open mobile drawer
      function handleTabTrap(e) {
        if (e.key === 'Tab' && (drawer.classList.contains('is-open') || drawer.classList.contains('active'))) {
          const focusables = drawer.querySelectorAll('a[href], button:not([disabled]), input, [tabindex="0"]');
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }
      window.addEventListener('keydown', handleTabTrap);
      document.addEventListener('keydown', handleTabTrap);

      // Auto close drawer when resizing to desktop viewport
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024 && (drawer.classList.contains('is-open') || drawer.classList.contains('active'))) {
          closeDrawer();
        }
      }, { passive: true });
    }
  }

  /* --------------------------------------------------------------------------
   * FLOATING BOTTOM NAV ENGINE (Scroll Hysteresis & Heading Clearance)
   * -------------------------------------------------------------------------- */
  function initFloatingBottomNav() {
    const floatingNav = document.querySelector('.floating-bottom-nav');
    if (!floatingNav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function onScroll() {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY;

      // Fast scroll down past hero: hide dock to prevent any heading occlusion
      if (currentY > 400 && deltaY > 15) {
        floatingNav.classList.add('nav-dock--hidden');
      } else if (deltaY < -8 || currentY <= 300) {
        floatingNav.classList.remove('nav-dock--hidden');
      }

      lastScrollY = currentY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
   * 2. SMOOTH ANCHOR SCROLLING
   * -------------------------------------------------------------------------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href === '#main-content') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();

          // Close mobile drawer if open without jumping viewport
          const drawer = document.querySelector('.mobile-menu, #mobile-nav-drawer');
          if (drawer && (drawer.classList.contains('is-open') || drawer.classList.contains('active'))) {
            const overlay = document.querySelector('.mobile-menu-overlay');
            const toggleBtn = document.querySelector('.navbar__toggle');
            drawer.classList.remove('is-open', 'active', 'open');
            if (overlay) overlay.classList.remove('is-open', 'is-active');
            if (toggleBtn) {
              toggleBtn.classList.remove('is-open', 'navbar__toggle--active', 'is-active');
              toggleBtn.setAttribute('aria-expanded', 'false');
            }
            drawer.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
            document.body.style.overflow = '';
          }

          const header = document.querySelector('.site-header') || document.querySelector('.navbar');
          const headerOffset = header ? header.offsetHeight : 70;
          const targetOffset = target.getBoundingClientRect().top + window.scrollY - headerOffset;

          window.scrollTo({
            top: Math.max(0, targetOffset),
            behavior: 'smooth'
          });

          if (history.pushState) {
            history.pushState(null, '', href);
          }

          // Instantly highlight target link
          updateActiveLink(href);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
   * SCROLL SPY ENGINE (Active Navigation Link Highlighting)
   * -------------------------------------------------------------------------- */
  let currentActiveId = '';
  function updateActiveLink(activeId) {
    if (!activeId) return;
    const cleanId = activeId.replace(/^#/, '');
    if (currentActiveId === cleanId) return;
    currentActiveId = cleanId;

    const navSelectors = [
      '.site-header .nav-links a',
      '.mobile-menu__links a',
      '.floating-bottom-nav .floating-nav-links a'
    ];

    navSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkTarget = href.replace(/^.*#/, '');
        if (linkTarget === cleanId || (cleanId === 'pricing' && linkTarget === 'pricing-calculator') || (cleanId === 'pricing-calculator' && linkTarget === 'pricing')) {
          link.classList.add('active', 'is-active');
        } else if (href.startsWith('#') || href.includes('index.html#')) {
          link.classList.remove('active', 'is-active');
        }
      });
    });
  }

  function initScrollSpy() {
    const trackedSections = [
      document.getElementById('hero'),
      document.getElementById('services'),
      document.getElementById('portfolio'),
      document.getElementById('pricing-calculator'),
      document.getElementById('contact')
    ].filter(Boolean);

    if (!trackedSections.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateActiveLink('#' + entry.target.id);
          }
        });
      }, {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.2, 0.5]
      });

      trackedSections.forEach(section => observer.observe(section));
    }

    // Scroll boundary fallback (handles top of page and bottom of page) with RAF throttling
    let scrollSpyTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollSpyTicking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY < 120) {
            updateActiveLink('#hero');
          } else if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
            updateActiveLink('#contact');
          }
          scrollSpyTicking = false;
        });
        scrollSpyTicking = true;
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
   * 3. BACK TO TOP CONTROLLER
   * -------------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top-btn') || document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('is-visible', 'visible');
      } else {
        btn.classList.remove('is-visible', 'visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* --------------------------------------------------------------------------
   * BOOTSTRAP ON DOM READY
   * -------------------------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
