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
    initSmoothAnchors();
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
        }
      });
    });
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
