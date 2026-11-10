/**
 * Rubicweb — Dedicated Portfolio Engine (Milestone 4)
 * Provides:
 * 1. Instant Category Filtering without Page Reload (staggered CSS scale/opacity transitions)
 * 2. Accessible Case Study Modal Previews (focus trapping, Escape key, backdrop dismiss)
 * 3. Synchronization with index.html and portfolio.html
 */

(function () {
  'use strict';

  // Authoritative Case Studies Database conforming to spec_miner_rubicweb
  const CASE_STUDIES = {
    nexastore: {
      title: 'NexaStore Luxury Goods',
      client: 'Nexa Luxury Fashion Retail Indonesia',
      tag: 'E-COMMERCE & RETAIL',
      category: 'ecommerce',
      challenge: 'Website lama berbasis template Shopify lambat (skor PageSpeed mobile 42), tingkat cart abandonment mencapai 68%, dan alur checkout berbelit-belit.',
      solution: 'Membangun etalase e-commerce kustom menggunakan Vanilla JS modular tanpa overhead framework berat, kompresi gambar progresif WebP, dan checkout 1 halaman terintegrasi Midtrans API (QRIS & Virtual Account).',
      results: 'Skor Google PageSpeed melonjak dari 42 ke 98/100, First Contentful Paint turun menjadi 0.9 detik, dan rasio konversi checkout meningkat 3.2x dalam 60 hari pertama.',
      img: 'assets/portfolio/karalia-mockup.svg',
      liveUrl: 'portfolio.html#portfolio'
    },
    apex: {
      title: 'Apex Global Logistics',
      client: 'PT Apex Global Logistik Internasional',
      tag: 'CORPORATE PORTAL & TRACKING ENGINE',
      category: 'corporate',
      challenge: 'Website lama berusia 7 tahun tidak responsif mobile dan membebani tim customer service dengan ribuan panggilan harian hanya untuk memeriksa status resi kargo.',
      solution: 'Redesain portal korporat modern dengan sistem pelacak kargo (live cargo tracking) terhubung langsung ke REST API database ERP logistik internal dan proteksi CDN Cloudflare.',
      results: 'Beban panggilan operasional terpangkas 40%, trafik pengguna mobile melonjak 180%, dan sistem stabil melayani 15.000 kueri tracking harian tanpa latensi.',
      img: 'assets/portfolio/wilmar-mockup.svg',
      liveUrl: 'portfolio.html#portfolio'
    },
    lumina: {
      title: 'Lumina Creative Studio',
      client: 'Lumina Architecture & Interior Design Jakarta',
      tag: 'IMMERSIVE ARCHITECTURAL SHOWCASE',
      category: 'corporate',
      challenge: 'Portofolio berisi ratusan render 4K resolusi tinggi menyebabkan website lama sering crash di smartphone dan animasi tampak patah-patah (laggy).',
      solution: 'Menerapkan tata letak visual editorial terinspirasi majalah arsitektur internasional dengan 60fps micro-interactions, 3D perspective card tilt, dan pemuatan gambar adaptif.',
      results: 'Skor Google PageSpeed mencapai 99/100 di Desktop dan 96/100 di Mobile. Rata-rata durasi kunjungan pengguna naik dari 45 detik menjadi 3 menit 40 detik.',
      img: 'assets/portfolio/pinjamin-mockup.svg',
      liveUrl: 'portfolio.html#portfolio'
    },
    flowpulse: {
      title: 'FlowPulse Enterprise Analytics',
      client: 'FlowPulse SaaS Productivity Platform',
      tag: 'SAAS DASHBOARD & WORKFORCE MANAGEMENT',
      category: 'webapp',
      challenge: 'Dashboard lama mengalami memory leaks saat menampilkan ribuan baris data tugas dan visualisasi grafik real-time, menyebabkan browser klien beku.',
      solution: 'Rekayasa Single-Page Application (SPA) ringan berbasis Vanilla JS murni dengan virtualized list rendering, WebSocket terenkripsi, dan token autentikasi JWT.',
      results: 'Waktu respons pembaruan data turun di bawah 150 milidetik, konsumsi memori browser berkurang 60%, dan CSAT klien melonjak menjadi 4.9/5.0.',
      img: 'assets/portfolio/jelypos-mockup.svg',
      liveUrl: 'portfolio.html#portfolio'
    },
    karalia: {
      title: 'Karalia Luxury Jewelry',
      client: 'Karalia Gold & Jewelry Retail',
      tag: 'ONLINE GOLD STORE & E-COMMERCE',
      category: 'ecommerce',
      challenge: 'Membutuhkan etalase perhiasan eksklusif dengan pembaruan harga emas pasar harian otomatis dan transaksi aman bernilai tinggi.',
      solution: 'Platform e-commerce performa tinggi dengan alur transaksi 2 langkah, enkripsi SSL TLS 1.3, dan integrasi payment gateway multi-bank.',
      results: 'Skor Core Web Vitals 99/100, load time 0.8s, dan peningkatan omzet digital sebesar 210% pada semester pertama peluncuran.',
      img: 'assets/portfolio/karalia-mockup.svg',
      liveUrl: 'portfolio.html#portfolio'
    },
    pinjamin: {
      title: 'Pinjamin Fintech Platform',
      client: 'PT Finansial Pinjamin Indonesia',
      tag: 'FINTECH & P2P LENDING PORTAL',
      category: 'webapp',
      challenge: 'Sistem aplikasi pinjaman digital harus memenuhi regulasi OJK terkait transparansi TKB90 real-time dan enkripsi data nasabah sensitif.',
      solution: 'Aplikasi web kustom dengan arsitektur REST API terenkripsi AES-256, verifikasi data instan, dan alur pendaftaran pinjaman tanpa gesekan.',
      results: 'Memproses lebih dari 50.000 pengajuan pinjaman dengan 99.99% system uptime dan tingkat kepatuhan regulasi 100%.',
      img: 'assets/portfolio/pinjamin-mockup.svg',
      liveUrl: 'portfolio.html#portfolio'
    },
    wilmar: {
      title: 'Wilmar Agribusiness Corporate',
      client: 'Wilmar International Group Indonesia',
      tag: 'ENTERPRISE & INVESTOR RELATIONS',
      category: 'corporate',
      challenge: 'Portal korporat skala konglomerasi membutuhkan repositori publikasi laporan keuangan tahunan terindeks dan keterbukaan inisiatif ESG multibahasa.',
      solution: 'Arsitektur website korporat berkecepatan tinggi dengan navigasi multi-level, skema SEO terstruktur, dan tata letak editorial prestisius.',
      results: 'Mencapai peringkat #1 untuk kata kunci korporat industri, waktu respon di bawah 1 detik di seluruh benua, dan bounce rate di bawah 25%.',
      img: 'assets/portfolio/wilmar-mockup.svg',
      liveUrl: 'portfolio.html#portfolio'
    }
  };

  /* --------------------------------------------------------------------------
   * 1. CATEGORY FILTERING ENGINE
   * -------------------------------------------------------------------------- */
  function initPortfolioFiltering() {
    const filterButtons = document.querySelectorAll(
      '.portfolio-filter-btn, .filter-btn, [data-filter]'
    );
    const projectCards = document.querySelectorAll(
      '.portfolio-card[data-category], [data-category]'
    );

    if (!filterButtons.length || !projectCards.length) return;

    let activeFilter = 'all';
    let isTransitioning = false;

    function applyFilter(category, buttonElement) {
      if (isTransitioning) return;
      isTransitioning = true;
      activeFilter = category;

      // Update button active state & accessibility
      filterButtons.forEach(btn => {
        btn.classList.remove('is-active', 'active');
        btn.setAttribute('aria-selected', 'false');
      });

      if (buttonElement) {
        buttonElement.classList.add('is-active', 'active');
        buttonElement.setAttribute('aria-selected', 'true');
      }

      let visibleCount = 0;

      projectCards.forEach(card => {
        const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        const matches = (category === 'all' || category === '*' || cardCategory === category);

        if (matches) {
          card.style.display = '';
          // Force layout reflow for clean staggered transition
          void card.offsetWidth;
          card.style.transition = 'opacity 0.28s cubic-bezier(0.215, 0.61, 0.355, 1), transform 0.28s cubic-bezier(0.215, 0.61, 0.355, 1)';
          card.style.transitionDelay = (visibleCount * 35) + 'ms';
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
          card.style.pointerEvents = 'auto';
          card.classList.remove('is-hidden');
          visibleCount++;
        } else {
          card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          card.style.transitionDelay = '0ms';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95) translateY(8px)';
          card.style.pointerEvents = 'none';
          card.classList.add('is-hidden');
          setTimeout(() => {
            if (card.classList.contains('is-hidden')) {
              card.style.display = 'none';
            }
          }, 220);
        }
      });

      setTimeout(() => {
        isTransitioning = false;
      }, 250);
    }

    filterButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        const category = (this.getAttribute('data-filter') || 'all').toLowerCase();
        applyFilter(category, this);
      });

      // Keyboard navigation for filter buttons
      button.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 2. CASE STUDY MODAL ENGINE
   * -------------------------------------------------------------------------- */
  function initCaseStudyModals() {
    const modal = document.getElementById('case-study-modal');
    if (!modal) return;

    const closeButtons = modal.querySelectorAll('.modal-close, .modal__close, [data-close], .btn-close');
    let lastFocusedElement = null;

    function openModal(projectId) {
      const data = CASE_STUDIES[projectId] || CASE_STUDIES.nexastore;

      const titleEl = modal.querySelector('#modal-title, .modal-title');
      const tagEl = modal.querySelector('#modal-tag, .modal-tag');
      const challengeEl = modal.querySelector('#modal-challenge');
      const solutionEl = modal.querySelector('#modal-solution');
      const resultsEl = modal.querySelector('#modal-results');
      const imgEl = modal.querySelector('#modal-img');
      const clientEl = modal.querySelector('#modal-client');
      const waCta = modal.querySelector('#modal-whatsapp-cta');

      if (titleEl) titleEl.textContent = data.title;
      if (tagEl) tagEl.textContent = data.tag;
      if (clientEl) clientEl.textContent = data.client;
      if (challengeEl) challengeEl.textContent = data.challenge;
      if (solutionEl) solutionEl.textContent = data.solution;
      if (resultsEl) resultsEl.textContent = data.results;
      if (imgEl && data.img) {
        imgEl.src = data.img;
        imgEl.alt = data.title + ' Case Study Screenshot';
      }

      if (waCta) {
        const msg = `Halo Rubicweb, saya membaca studi kasus ${data.title}. Saya tertarik berdiskusi mengenai proyek serupa untuk bisnis saya.`;
        waCta.href = `https://wa.me/6285280008984?text=${encodeURIComponent(msg)}`;
      }

      modal.classList.add('is-active', 'active', 'is-open');
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';

      lastFocusedElement = document.activeElement;
      const firstCloseBtn = closeButtons[0];
      if (firstCloseBtn) {
        setTimeout(() => firstCloseBtn.focus(), 60);
      }
    }

    function closeModal() {
      modal.classList.remove('is-active', 'active', 'is-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = '';

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    // Attach click listeners to all case study triggers
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('.btn-case-study, [data-project-id], [data-modal-target]');
      if (trigger) {
        e.preventDefault();
        const pId = trigger.getAttribute('data-project-id') || 'nexastore';
        openModal(pId);
      }
    });

    closeButtons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal();
      });
    });

    // Backdrop click dismiss
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });

    // Escape key listener & focus trap
    function handleKeyDown(e) {
      if (!modal.classList.contains('is-active') && !modal.classList.contains('active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }

      if (e.key === 'Tab') {
        const focusable = modal.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
  }

  /* --------------------------------------------------------------------------
   * 3. BOOTSTRAP ON DOM READY
   * -------------------------------------------------------------------------- */
  function initPortfolio() {
    initPortfolioFiltering();
    initCaseStudyModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
  } else {
    initPortfolio();
  }
})();
