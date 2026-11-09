(function () {
  'use strict';

  const projectsData = {
    pinjamin: {
      title: 'Pinjamin',
      category: 'Fintech & P2P Lending',
      categoryValue: 'custom-web-application',
      tag: 'FINTECH PLATFORM',
      description: 'Platform pembiayaan digital dan pinjaman peer-to-peer terpercaya dengan enkripsi data berlapis, transparansi TKB90 real-time, dan alur pendaftaran instan bagi UMKM di Indonesia.',
      image: 'assets/portfolio/pinjamin/pinjamin-main.png',
      alt: 'Tangkapan Layar Platform Pinjamin - Fintech dan P2P Lending',
      link: '#contact'
    },
    karalia: {
      title: 'Karalia',
      category: 'E-Commerce & Toko Online',
      categoryValue: 'ecommerce',
      tag: 'ONLINE GOLD STORE',
      description: 'Toko online modern jual-beli emas dan perhiasan digital berkecepatan tinggi dengan alur checkout 2 langkah, transparansi harga pasar harian, dan skor Core Web Vitals 99/100.',
      image: 'assets/portfolio/karalia/karalia-main.png',
      alt: 'Tangkapan Layar Toko Online Karalia - E-Commerce Emas & Retail',
      link: '#contact'
    },
    wilmar: {
      title: 'Wilmar',
      category: 'Website Korporat & Tbk',
      categoryValue: 'website-development',
      tag: 'ENTERPRISE & TBK',
      description: 'Portal korporat skala konglomerasi agribisnis terbuka dengan repositori publikasi laporan keuangan tahunan terindeks, hubungan investor multibahasa, dan keterbukaan inisiatif ESG.',
      image: 'assets/portfolio/wilmar/wilmar-main.png',
      alt: 'Tangkapan Layar Portal Korporat Wilmar - Hubungan Investor Tbk',
      link: '#contact'
    }
  };

  function initPortfolio() {
    const categoryButtons = document.querySelectorAll('.portfolio-cat-btn');
    const previewCard = document.querySelector('.portfolio-preview-card');
    const previewImg = document.getElementById('preview-project-img');
    const previewTag = document.getElementById('preview-project-tag');
    const previewTitle = document.getElementById('preview-project-title');
    const previewCategory = document.getElementById('preview-project-cat');
    const previewDesc = document.getElementById('preview-project-desc');
    const previewLink = document.getElementById('preview-project-link');

    if (!categoryButtons.length || !previewCard) return;

    function selectCategory(projectId, buttonElement) {
      const data = projectsData[projectId];
      if (!data) return;

      categoryButtons.forEach(btn => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });
      buttonElement.classList.add('is-active');
      buttonElement.setAttribute('aria-selected', 'true');

      previewCard.classList.remove('preview-fade-enter');
      void previewCard.offsetWidth;

      if (previewImg) {
        previewImg.src = data.image;
        previewImg.alt = data.alt;
      }
      if (previewTag) previewTag.textContent = data.tag;
      if (previewTitle) previewTitle.textContent = data.title;
      if (previewCategory) previewCategory.textContent = data.category;
      if (previewDesc) previewDesc.textContent = data.description;
      if (previewLink) {
        previewLink.href = data.link;
        previewLink.innerHTML = 'KONSULTASI PROYEK SERUPA &rarr;';
      }

      previewCard.classList.add('preview-fade-enter');
    }

    if (previewLink) {
      previewLink.addEventListener('click', function () {
        const activeBtn = document.querySelector('.portfolio-cat-btn.is-active');
        if (activeBtn) {
          const pId = activeBtn.getAttribute('data-project');
          const proj = projectsData[pId];
          const select = document.getElementById('form-category');
          if (select && proj && proj.categoryValue) {
            select.value = proj.categoryValue;
          }
        }
      });
    }

    categoryButtons.forEach((btn, index) => {
      const projectId = btn.getAttribute('data-project');

      btn.addEventListener('click', () => {
        selectCategory(projectId, btn);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextBtn = categoryButtons[(index + 1) % categoryButtons.length];
          nextBtn.focus();
          nextBtn.click();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevBtn = categoryButtons[(index - 1 + categoryButtons.length) % categoryButtons.length];
          prevBtn.focus();
          prevBtn.click();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
  } else {
    initPortfolio();
  }
})();
