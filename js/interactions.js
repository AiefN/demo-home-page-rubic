/**
 * Rubicweb — Micro-Interactions & Homepage Interactivity Engine (Milestone 3)
 * High-Performance Vanilla JavaScript (ES6+) — Zero External Dependencies
 *
 * Modules:
 * 1. Custom Magnetic Trailing Cursor (Dual-Element LERP Smoothing λ = 0.16)
 * 2. 3D Card Perspective Tilt with Specular Radial Glare
 * 3. Viewport Numerical Statistics Counters via IntersectionObserver (Ease-Out Expo)
 * 4. Auto-Scrolling Testimonials Carousel with Pause-on-Hover & Touch Swipe
 * 5. Single-Active FAQ Accordion with CSS Grid 0fr->1fr Height Transition & 45° Rotation
 * 6. Subtle Hero Depth Parallax
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1. CUSTOM MAGNETIC TRAILING CURSOR ENGINE (LERP λ = 0.16)
   * -------------------------------------------------------------------------- */
  function initCustomCursor() {
    // Gracefully disable on touch / coarse pointer devices
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches) {
      const existingDot = document.querySelector('.cursor-dot, #cursor-dot');
      const existingFollower = document.querySelector('.cursor-follower, #cursor-follower');
      if (existingDot) existingDot.style.display = 'none';
      if (existingFollower) existingFollower.style.display = 'none';
      return;
    }

    let dot = document.querySelector('.cursor-dot') || document.querySelector('#cursor-dot');
    let follower = document.querySelector('.cursor-follower') || document.querySelector('#cursor-follower');

    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'cursor-dot';
      dot.id = 'cursor-dot';
      dot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(dot);
    }

    if (!follower) {
      follower = document.createElement('div');
      follower.className = 'cursor-follower';
      follower.id = 'cursor-follower';
      follower.setAttribute('aria-hidden', 'true');
      document.body.appendChild(follower);
    }

    // Ensure non-blocking pointer events
    dot.style.pointerEvents = 'none';
    follower.style.pointerEvents = 'none';

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let isVisible = false;
    let rafId = null;

    function renderCursor() {
      const dx = mouseX - followerX;
      const dy = mouseY - followerY;

      // Linear Interpolation (LERP λ = 0.16)
      followerX += dx * 0.16;
      followerY += dy * 0.16;

      if (Number.isFinite(followerX) && Number.isFinite(followerY)) {
        follower.style.transform = `translate3d(${followerX.toFixed(2)}px, ${followerY.toFixed(2)}px, 0)`;
      }

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        rafId = window.requestAnimationFrame(renderCursor);
      } else {
        rafId = null;
      }
    }

    function onPointerMove(e) {
      if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;

      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        follower.style.opacity = '1';
      }

      // Instant inner dot placement
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      if (!rafId) {
        rafId = window.requestAnimationFrame(renderCursor);
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });

    function onMouseLeave() {
      isVisible = false;
      dot.style.opacity = '0';
      follower.style.opacity = '0';
      follower.classList.remove('cursor-hover');
      document.body.classList.remove('cursor-hover');
    }

    document.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseleave', onMouseLeave);

    // Interactive target expansion delegation
    const interactiveSelector = 'a, button, input, select, textarea, .card-tilt, .interactive-spotlight, .service-card, .portfolio-card, [role="button"], .tab-btn, .portfolio-filter-btn, .faq-trigger, .carousel-btn--prev, .carousel-btn--next, summary, [data-interactive]';

    document.addEventListener('mouseover', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target && !target.disabled) {
        follower.classList.add('cursor-hover');
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        follower.classList.remove('cursor-hover');
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 2. 3D CARD PERSPECTIVE TILT WITH SPECULAR RADIAL GLARE
   * -------------------------------------------------------------------------- */
  function init3DCardTilt() {
    const cards = document.querySelectorAll('.card-tilt, .interactive-spotlight, .service-card, .portfolio-card, [data-tilt]');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'none';
      });

      card.addEventListener('mousemove', function (e) {
        if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;

        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalized coordinates centered at (0, 0), clamped to [-1, 1]
        let normX = (x - rect.width / 2) / (rect.width / 2);
        let normY = (y - rect.height / 2) / (rect.height / 2);

        normX = Math.max(-1, Math.min(1, normX));
        normY = Math.max(-1, Math.min(1, normY));

        const maxTilt = 10; // Clamped maximum deflection angle in degrees
        const rotY = Number((normX * maxTilt).toFixed(2));
        const rotX = Number((-normY * maxTilt).toFixed(2));

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Set specular radial glare coordinates
        const posX = x.toFixed(1) + 'px';
        const posY = y.toFixed(1) + 'px';
        card.style.setProperty('--mouse-x', posX);
        card.style.setProperty('--mouse-y', posY);
        card.style.setProperty('--spotlight-x', posX);
        card.style.setProperty('--spotlight-y', posY);
        card.style.setProperty('--glow-opacity', '1');
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.setProperty('--glow-opacity', '0');

        setTimeout(() => {
          if (card.style.transform.includes('rotateX(0deg)')) {
            card.style.transition = '';
          }
        }, 500);
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 3. VIEWPORT NUMERICAL STATS COUNTERS VIA INTERSECTIONOBSERVER
   * -------------------------------------------------------------------------- */
  function initStatsCounters() {
    const counterElements = document.querySelectorAll('[data-counter-target], [data-target], .stat-number');
    if (!counterElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateCounter(element) {
      if (element._hasAnimated) return;
      element._hasAnimated = true;

      const targetAttr = element.getAttribute('data-counter-target') || element.getAttribute('data-target') || element.textContent.trim();
      const cleanNum = targetAttr.replace(/[^0-9.]/g, '');
      const target = parseFloat(cleanNum) || 0;

      let decimals = parseInt(element.getAttribute('data-decimals'), 10);
      if (isNaN(decimals)) {
        decimals = cleanNum.includes('.') ? 1 : 0;
      }

      const suffix = element.getAttribute('data-suffix') || (targetAttr.includes('%') ? '%' : (targetAttr.includes('+') ? '+' : ''));
      const prefix = element.getAttribute('data-prefix') || '';

      if (prefersReducedMotion) {
        element.textContent = `${prefix}${decimals > 0 ? target.toFixed(decimals) : target}${suffix}`;
        return;
      }

      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Exponential ease-out curve: 1 - 2^(-10 * progress)
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * ease;

        const formatted = decimals > 0 ? current.toFixed(decimals) : Math.floor(current);
        element.textContent = `${prefix}${formatted}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(update);
        } else {
          element.textContent = `${prefix}${decimals > 0 ? target.toFixed(decimals) : target}${suffix}`;
        }
      }

      window.requestAnimationFrame(update);
    }

    // IntersectionObserver triggers animation when stats enter the viewport
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          obs.unobserve(el);

          if (el.classList.contains('stat-number') || el.hasAttribute('data-counter-target') || el.hasAttribute('data-target')) {
            animateCounter(el);
          } else {
            // Container observed: trigger all child counters
            el.querySelectorAll('[data-counter-target], [data-target], .stat-number').forEach(child => {
              animateCounter(child);
            });
          }
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -30px 0px'
    });

    counterElements.forEach(el => observer.observe(el));

    // Also observe the stats grid / section containers for robust fallback
    const containers = document.querySelectorAll('.stats-cards-grid, #why-us, #stats');
    containers.forEach(container => observer.observe(container));
  }

  /* --------------------------------------------------------------------------
   * 4. AUTO-SCROLLING TESTIMONIALS CAROUSEL
   * -------------------------------------------------------------------------- */
  class TestimonialCarousel {
    constructor(carouselElement) {
      this.container = carouselElement;
      if (!this.container) return;

      this.track = this.container.querySelector('.testimonial-track');
      this.slides = Array.from(this.container.querySelectorAll('.testimonial-card, .testimonial-slide'));
      this.prevBtn = this.container.querySelector('.carousel-btn--prev, .carousel-prev, [data-prev]');
      this.nextBtn = this.container.querySelector('.carousel-btn--next, .carousel-next, [data-next]');
      this.dotsContainer = this.container.querySelector('.carousel-dots, #carousel-dots');

      if (!this.track || !this.slides.length) return;

      this.currentIndex = 0;
      this.totalSlides = this.slides.length;
      this.autoPlayInterval = 5000;
      this.timer = null;
      this.startX = 0;
      this.currentX = 0;
      this.container._carousel = this;

      this.initDots();
      this.initEvents();
      this.update(false);
      this.startAutoplay();
    }

    initDots() {
      if (!this.dotsContainer) {
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'carousel-dots';
        const controls = this.container.querySelector('.carousel-controls');
        if (controls) {
          controls.appendChild(this.dotsContainer);
        } else {
          this.container.appendChild(this.dotsContainer);
        }
      }

      this.dotsContainer.innerHTML = '';
      this.dots = [];
      for (let i = 0; i < this.totalSlides; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `carousel-dot ${i === 0 ? 'is-active active' : ''}`;
        dot.setAttribute('aria-label', `Slide review ${i + 1}`);
        dot.addEventListener('click', () => {
          this.goTo(i);
          this.startAutoplay();
        });
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      }
    }

    update(animate = true) {
      if (!this.track || !this.slides[this.currentIndex]) return;
      this.track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1)' : 'none';

      const slide = this.slides[this.currentIndex];
      const offset = slide.offsetLeft;
      this.track.style.transform = `translateX(-${offset}px)`;

      if (this.dots) {
        this.dots.forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === this.currentIndex);
          dot.classList.toggle('active', idx === this.currentIndex);
        });
      }
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
      this.update(true);
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
      this.update(true);
    }

    goTo(index) {
      if (index >= 0 && index < this.totalSlides) {
        this.currentIndex = index;
        this.update(true);
      }
    }

    startAutoplay() {
      this.stopAutoplay();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.timer = setInterval(() => {
        this.next();
      }, this.autoPlayInterval);
    }

    stopAutoplay() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    initEvents() {
      // Pause on hover
      this.container.addEventListener('mouseenter', () => this.stopAutoplay());
      this.container.addEventListener('mouseleave', () => this.startAutoplay());

      // Pause on keyboard focus
      this.container.addEventListener('focusin', () => this.stopAutoplay());
      this.container.addEventListener('focusout', () => this.startAutoplay());

      // Next / Prev button events
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.next();
          this.startAutoplay();
        });
        this.nextBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.next();
            this.startAutoplay();
          }
        });
      }

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.prev();
          this.startAutoplay();
        });
        this.prevBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.prev();
            this.startAutoplay();
          }
        });
      }

      // Touch swipe handling
      this.container.addEventListener('touchstart', (e) => {
        this.stopAutoplay();
        if (e.touches && e.touches[0]) {
          this.startX = e.touches[0].clientX;
          this.currentX = this.startX;
        }
      }, { passive: true });

      this.container.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          this.currentX = e.touches[0].clientX;
        }
      }, { passive: true });

      this.container.addEventListener('touchend', (e) => {
        const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : this.currentX;
        const diffX = endX - this.startX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) {
            this.next();
          } else {
            this.prev();
          }
        }
        this.startAutoplay();
      }, { passive: true });

      // Window resize handling: recalculate translation without animation jitter
      window.addEventListener('resize', () => {
        this.update(false);
      }, { passive: true });
    }
  }

  function initTestimonialsCarousel() {
    const carousels = document.querySelectorAll('.testimonial-carousel, [data-carousel]');
    carousels.forEach(el => new TestimonialCarousel(el));
  }

  /* --------------------------------------------------------------------------
   * 5. SINGLE-ACTIVE FAQ ACCORDION ENGINE (CSS GRID 0fr -> 1fr)
   * -------------------------------------------------------------------------- */
  function initFaqAccordion() {
    const faqSection = document.getElementById('faq') || document.querySelector('.faq-section');
    if (!faqSection) return;

    const faqItems = Array.from(faqSection.querySelectorAll('.faq-item, .accordion-item'));
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const header = item.querySelector('.faq-header') || item.querySelector('header');
      const trigger = item.querySelector('.faq-trigger') || item.querySelector('button');

      function toggleAccordionItem(e) {
        if (e) {
          // Guard against redundant duplicate executions within the same event
          if (item._lastToggledEvent === e) return;
          item._lastToggledEvent = e;
          if (e.stopPropagation) e.stopPropagation();
        }

        const isCurrentlyOpen = item.classList.contains('active') || item.classList.contains('is-open') || item.classList.contains('is-active');

        // Enforce single active expansion: collapse all siblings
        faqItems.forEach(sibling => {
          sibling.classList.remove('active', 'is-open', 'is-active');
          sibling.removeAttribute('open');
          sibling.setAttribute('aria-expanded', 'false');
          const sibBtn = sibling.querySelector('.faq-trigger') || sibling.querySelector('button');
          if (sibBtn) {
            sibBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle clicked item state
        if (!isCurrentlyOpen) {
          item.classList.add('active', 'is-open', 'is-active');
          item.setAttribute('aria-expanded', 'true');
          if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
          }
        }
      }

      if (trigger) {
        trigger.addEventListener('click', toggleAccordionItem);
        trigger.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAccordionItem(e);
          }
        });
      } else if (header) {
        header.addEventListener('click', toggleAccordionItem);
        header.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAccordionItem(e);
          }
        });
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 6. SUBTLE HERO PARALLAX ACCENTS
   * -------------------------------------------------------------------------- */
  function initHeroParallax() {
    const heroSection = document.getElementById('hero') || document.querySelector('.hero-section');
    if (!heroSection) return;

    const parallaxElements = heroSection.querySelectorAll('.hero-badge-wrap, .hero-telemetry-bar');
    if (!parallaxElements.length) return;

    let ticking = false;

    heroSection.addEventListener('mousemove', function (e) {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = heroSection.getBoundingClientRect();
          const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

          parallaxElements.forEach((el, index) => {
            const factor = (index + 1) * 4;
            const shiftX = (normX * factor).toFixed(1);
            const shiftY = (normY * factor).toFixed(1);
            el.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    heroSection.addEventListener('mouseleave', function () {
      parallaxElements.forEach(el => {
        el.style.transition = 'transform 0.4s ease-out';
        el.style.transform = 'translate3d(0, 0, 0)';
        setTimeout(() => { el.style.transition = ''; }, 400);
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 7. SERVICE DETAIL MODAL CONTROLLER
   * -------------------------------------------------------------------------- */
  function initServiceModal() {
    const modal = document.getElementById('service-modal');
    if (!modal) return;

    const serviceData = {
      'custom-web': {
        tag: 'SERVICE 01 • CUSTOM ARCHITECTURE',
        title: 'Custom Web Development — Rekayasa Kode Kustom Tanpa Template',
        desc: 'Arsitektur kode modular kustom dibangun dari baris pertama. Menghadirkan kecepatan kilat, keamanan tingkat tinggi, dan fleksibilitas tanpa batas untuk mengakomodasi kebutuhan logika bisnis unik korporasi Anda.',
        deliverables: [
          '100% Semantic Clean Source Code (kepemilikan penuh tanpa royalti atau vendor lock-in).',
          'Struktur database ternormalisasi & teroptimasi dengan pengindeksan query efisien.',
          'Integrasi REST API arsitektur modular lengkap dengan dokumentasi OpenAPI.',
          'Zero external library dependencies untuk core visual (bebas jQuery/bloatware).',
          'Dokumentasi teknis lengkap dan panduan pemeliharaan sistem sistematis.'
        ]
      },
      'business-profile': {
        tag: 'SERVICE 02 • CORPORATE AUTHORITY',
        title: 'Modern Business Profile — Transformasi Citra Digital Korporat',
        desc: 'Website korporat adalah wajah reputasi perusahaan Anda di hadapan mitra global, investor, dan klien premium. Kami merancang desain yang memancarkan kredibilitas, kemewahan modern, dan otoritas industri.',
        deliverables: [
          'Desain antarmuka eksklusif pixel-perfect dari prototipe Figma beresolusi tinggi.',
          'Optimalisasi skor Google PageSpeed 95+ (Desktop & Mobile).',
          'Skema SEO terstruktur (JSON-LD Organization, LocalBusiness, Breadcrumbs).',
          'Formulir penangkap prospek (lead capture) dengan validasi instan & integrasi WhatsApp.',
          'Integrasi multi-bahasa terindeks mesin pencari untuk jangkauan global.'
        ]
      },
      'web-app': {
        tag: 'SERVICE 03 • CLOUD SYSTEMS',
        title: 'Web Application & Enterprise Portal — Sistem Tangguh untuk Pertumbuhan Bisnis',
        desc: 'Dari otomasi proses bisnis internal hingga platform SaaS publik, kami merancang aplikasi web dengan logika backend solid, manajemen sesi terenkripsi, dan antarmuka responsif tanpa jeda.',
        deliverables: [
          'Autentikasi aman bertingkat (Multi-role Access Control / RBAC).',
          'Dashboard interaktif dengan visualisasi data grafik responsif real-time.',
          'Webhook & integrasi payment gateway (Midtrans, Xendit, QRIS, Virtual Account).',
          'Pencatatan log aktivitas sistem (Audit Trail) dan enkripsi data sensitif.',
          'Arsitektur siap auto-scaling pada infrastruktur cloud server modern.'
        ]
      },
      'redesign-maintenance': {
        tag: 'SERVICE 04 • PERFORMANCE & SLA',
        title: 'Redesign & Maintenance — Modernisasi dan Proteksi Maksimal',
        desc: 'Website yang lambat atau sering down secara langsung menghilangkan potensi omzet dan merusak kredibilitas brand. Kami membersihkan kode lama, menutup celah keamanan, dan menjaga server tetap prima setiap detik.',
        deliverables: [
          'Peningkatan skor Google PageSpeed dari kategori merah/oranye ke hijau (95+).',
          'Audit keamanan komprehensif dan perbaikan celah (SQLi, XSS, CSRF patch).',
          'Sistem pencadangan harian terenkripsi ke penyimpanan cloud terpisah.',
          'Pemantauan waktu aktif (uptime) server 24/7 dengan respons darurat cepat.',
          'SLA pemeliharaan teknis bulanan/tahunan bergaransi.'
        ]
      }
    };

    const closeBtn = document.getElementById('service-modal-close');
    const triggers = document.querySelectorAll('.btn-service-modal');
    let lastFocused = null;

    function openModal(id) {
      const data = serviceData[id] || serviceData['custom-web'];
      const tagEl = document.getElementById('service-modal-tag');
      const titleEl = document.getElementById('service-modal-title');
      const descEl = document.getElementById('service-modal-desc');
      const list = document.getElementById('service-modal-deliverables');
      const ctaEl = document.getElementById('service-modal-cta');

      if (tagEl) tagEl.textContent = data.tag;
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;

      if (list) {
        list.innerHTML = '';
        data.deliverables.forEach(function (item) {
          const li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });
      }

      if (ctaEl) {
        ctaEl.href = 'contact.html?package=' + encodeURIComponent(id);
      }

      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';

      lastFocused = document.activeElement;
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-service-id') || 'custom-web';
        openModal(id);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
   * INITIALIZE ALL INTERACTIONS ON DOM READY
   * -------------------------------------------------------------------------- */
  function initAllInteractions() {
    initCustomCursor();
    init3DCardTilt();
    initStatsCounters();
    initTestimonialsCarousel();
    initFaqAccordion();
    initHeroParallax();
    initServiceModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllInteractions);
  } else {
    initAllInteractions();
  }
})();
