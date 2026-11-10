/**
 * Rubicweb — Dedicated Contact & Pricing Engine (Milestone 4)
 * Provides:
 * 1. Real-Time Inline Form Validation (RFC 5322 email regex, Indonesian phone formatting)
 * 2. Integrated Dynamic Pricing Estimator & WhatsApp Pre-fill Sync
 * 3. Package Selector & Form-Calculator Bidirectional Synchronization
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1. REAL-TIME INLINE FORM VALIDATION ENGINE
   * -------------------------------------------------------------------------- */
  function initContactValidation() {
    const form = document.querySelector('.consultation-form, .contact-form, #contact-form');
    if (!form) return;

    const nameInput = form.querySelector('#name, input[name="name"], input[name="nama"], #form-name');
    const companyInput = form.querySelector('#company, input[name="company"], input[name="perusahaan"]');
    const emailInput = form.querySelector('#email, input[type="email"], input[name="email"], #form-email');
    const phoneInput = form.querySelector('#phone, input[type="tel"], input[name="phone"], input[name="telepon"], #form-phone');
    const packageSelect = form.querySelector('#package, select[name="package"], select[name="paket"], #form-package');
    const messageInput = form.querySelector('#message, textarea[name="message"], textarea[name="pesan"], #form-message');
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], .btn-submit');
    const successBanner = document.getElementById('form-success-banner');

    // Validation Rules
    const validators = {
      name: function (val) {
        const clean = (val || '').trim();
        if (clean.length < 3) {
          return 'Nama lengkap wajib diisi minimal 3 karakter.';
        }
        return null;
      },
      email: function (val) {
        const clean = (val || '').trim();
        if (!clean) {
          return 'Alamat email wajib diisi.';
        }
        // Strict RFC 5322 regex
        const rfcEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!rfcEmailRegex.test(clean)) {
          return 'Alamat email tidak valid (contoh: info@perusahaan.co.id).';
        }
        return null;
      },
      phone: function (val) {
        const clean = (val || '').replace(/[\s\-\.\(\)]/g, '');
        if (!clean) {
          return 'Nomor WhatsApp wajib diisi.';
        }
        // Indonesian WhatsApp phone standard (+62, 62, 08)
        const idPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
        if (!idPhoneRegex.test(clean)) {
          return 'Nomor WhatsApp tidak valid (format: 08... atau +628..., minimal 10 digit).';
        }
        return null;
      },
      package: function (val) {
        if (!val || val === '' || val === 'pilih') {
          return 'Silakan pilih salah satu paket layanan.';
        }
        return null;
      },
      message: function (val) {
        const clean = (val || '').trim();
        if (clean.length < 10) {
          return 'Mohon deskripsikan kebutuhan proyek minimal 10 karakter.';
        }
        return null;
      }
    };

    function setFieldError(input, errorElement, errorMessage) {
      if (!input) return;
      input.classList.add('is-invalid', 'error', 'invalid');
      input.classList.remove('is-valid');
      input.setAttribute('aria-invalid', 'true');

      const group = input.closest('.form-group') || input.parentElement;
      if (group) group.classList.add('has-error');

      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
    }

    function clearFieldError(input, errorElement) {
      if (!input) return;
      input.classList.remove('is-invalid', 'error', 'invalid');
      input.classList.add('is-valid');
      input.setAttribute('aria-invalid', 'false');

      const group = input.closest('.form-group') || input.parentElement;
      if (group) group.classList.remove('has-error');

      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }

    function validateField(type, input, errorId) {
      if (!input) return true;
      const errorEl = form.querySelector(errorId);
      const validator = validators[type];
      if (!validator) return true;

      const errorMsg = validator(input.value);
      if (errorMsg) {
        setFieldError(input, errorEl, errorMsg);
        return false;
      } else {
        clearFieldError(input, errorEl);
        return true;
      }
    }

    // Attach real-time input and blur event listeners
    if (nameInput) {
      nameInput.addEventListener('blur', () => validateField('name', nameInput, '#error-name'));
      nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('is-invalid') || nameInput.classList.contains('error')) {
          validateField('name', nameInput, '#error-name');
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', () => validateField('email', emailInput, '#error-email'));
      emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('is-invalid') || emailInput.classList.contains('error')) {
          validateField('email', emailInput, '#error-email');
        }
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('blur', () => validateField('phone', phoneInput, '#error-phone'));
      phoneInput.addEventListener('input', () => {
        if (phoneInput.classList.contains('is-invalid') || phoneInput.classList.contains('error')) {
          validateField('phone', phoneInput, '#error-phone');
        }
      });
    }

    if (packageSelect) {
      packageSelect.addEventListener('change', () => validateField('package', packageSelect, '#error-package'));
      packageSelect.addEventListener('blur', () => validateField('package', packageSelect, '#error-package'));
    }

    if (messageInput) {
      messageInput.addEventListener('blur', () => validateField('message', messageInput, '#error-message'));
      messageInput.addEventListener('input', () => {
        if (messageInput.classList.contains('is-invalid') || messageInput.classList.contains('error')) {
          validateField('message', messageInput, '#error-message');
        }
      });
    }

    // Form Submission
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const isNameValid = validateField('name', nameInput, '#error-name');
      const isEmailValid = validateField('email', emailInput, '#error-email');
      const isPhoneValid = validateField('phone', phoneInput, '#error-phone');
      const isPackageValid = validateField('package', packageSelect, '#error-package');
      const isMessageValid = validateField('message', messageInput, '#error-message');

      const isFormValid = isNameValid && isEmailValid && isPhoneValid && isPackageValid && isMessageValid;

      if (!isFormValid) {
        // Focus first invalid input element
        const firstInvalid = form.querySelector('.is-invalid, .error, [aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return false;
      }

      // Convert phone number to international WhatsApp format (628...)
      let rawPhone = (phoneInput ? phoneInput.value : '').replace(/[\s\-\.\(\)]/g, '');
      if (rawPhone.startsWith('+62')) rawPhone = rawPhone.substring(1);
      else if (rawPhone.startsWith('0')) rawPhone = '62' + rawPhone.substring(1);

      const nameVal = (nameInput ? nameInput.value : '').trim();
      const compVal = (companyInput ? companyInput.value : '').trim();
      const pkgVal = (packageSelect ? packageSelect.value : 'Paket Pro');
      const msgVal = (messageInput ? messageInput.value : '').trim();

      const companyText = compVal ? ` (${compVal})` : '';
      const waMessage = `Halo Rubicweb, saya ${nameVal}${companyText}. Saya ingin berkonsultasi mengenai ${pkgVal}. Ringkasan kebutuhan: ${msgVal}`;
      const waUrl = `https://wa.me/6285280008984?text=${encodeURIComponent(waMessage)}`;

      // Display polite success feedback
      if (successBanner) {
        successBanner.style.display = 'block';
        const link = successBanner.querySelector('a');
        if (link) link.href = waUrl;
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Open official WhatsApp window
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return true;
    });
  }

  /* --------------------------------------------------------------------------
   * 2. INTEGRATED DYNAMIC PRICING ESTIMATOR & FORM SYNC
   * -------------------------------------------------------------------------- */
  function initDynamicPricing() {
    const calcSection = document.getElementById('pricing-calculator') || document.querySelector('.pricing-calculator');
    if (!calcSection) return;

    const tierInputs = calcSection.querySelectorAll('input[name="tier"]');
    const extraPagesSlider = calcSection.querySelector('#extra-pages, input[type="range"]');
    const pagesCountDisplay = calcSection.querySelector('#pages-count-display, .pages-count');
    const addonCheckboxes = calcSection.querySelectorAll('input[name="addon"], .calc-addon');
    const totalPriceDisplay = calcSection.querySelector('#calc-total-price');
    const totalTimelineDisplay = calcSection.querySelector('#calc-total-timeline');
    const whatsappCta = calcSection.querySelector('#btn-calc-whatsapp, a.btn-whatsapp');
    const packageDropdown = document.querySelector('#package, select[name="package"], select[name="paket"]');

    const BASE_CONFIG = {
      basic: {
        price: 2500000,
        days: 7,
        basePages: 1,
        extraPagePrice: 350000,
        name: 'Paket Basic (Landing Page)'
      },
      pro: {
        price: 5500000,
        days: 18,
        basePages: 5,
        extraPagePrice: 350000,
        name: 'Paket Pro (Business & Corporate)'
      },
      enterprise: {
        price: 12000000,
        days: 35,
        basePages: 10,
        extraPagePrice: 500000,
        name: 'Paket Enterprise (Custom Web App)'
      }
    };

    function recalculate() {
      let selectedTierKey = 'pro';
      tierInputs.forEach(input => {
        if (input.checked) selectedTierKey = input.value;
      });

      const tier = BASE_CONFIG[selectedTierKey] || BASE_CONFIG.pro;
      let pages = parseInt(extraPagesSlider ? extraPagesSlider.value : tier.basePages, 10);
      if (isNaN(pages) || pages < 1) pages = 1;

      if (pagesCountDisplay) {
        pagesCountDisplay.textContent = `${pages} Halaman`;
      }

      const extraPages = Math.max(0, pages - tier.basePages);
      let subtotal = tier.price + (extraPages * tier.extraPagePrice);
      let totalDays = tier.days + Math.ceil(extraPages * 0.5);

      let isExpress = false;
      const selectedAddons = [];

      addonCheckboxes.forEach(cb => {
        if (cb.checked) {
          if (cb.getAttribute('data-express') === 'true' || cb.value === 'express') {
            isExpress = true;
          } else {
            const price = parseInt(cb.getAttribute('data-price') || '0', 10);
            const days = parseInt(cb.getAttribute('data-days') || '0', 10);
            subtotal += price;
            totalDays += days;
            selectedAddons.push(cb.getAttribute('data-name') || cb.value);
          }
        }
      });

      if (isExpress) {
        subtotal = Math.round(subtotal * 1.25);
        totalDays = Math.max(5, Math.round(totalDays * 0.6));
      }

      // Format Indonesian Rupiah
      const formattedPrice = 'Rp ' + subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      if (totalPriceDisplay) {
        totalPriceDisplay.textContent = formattedPrice;
      }
      if (totalTimelineDisplay) {
        totalTimelineDisplay.textContent = `± ${totalDays} - ${totalDays + 4} Hari Kerja`;
      }

      if (whatsappCta) {
        const addonText = selectedAddons.length ? selectedAddons.join(', ') : 'Fitur Standar';
        const msg = `Halo Rubicweb, saya tertarik mendiskusikan ${tier.name} (${pages} Halaman). Fitur: ${addonText}. Estimasi kalkulator: ${formattedPrice} (${totalDays} hari kerja). Mohon info konsultasi lebih lanjut.`;
        whatsappCta.href = `https://wa.me/6285280008984?text=${encodeURIComponent(msg)}`;
      }

      // Sync with package dropdown if present without triggering error validation
      if (packageDropdown && !packageDropdown.matches(':focus')) {
        const optionToMatch = Array.from(packageDropdown.options).find(opt => {
          return opt.value.toLowerCase().includes(selectedTierKey);
        });
        if (optionToMatch && packageDropdown.value !== optionToMatch.value) {
          packageDropdown.value = optionToMatch.value;
        }
      }
    }

    tierInputs.forEach(input => input.addEventListener('change', recalculate));
    if (extraPagesSlider) {
      extraPagesSlider.addEventListener('input', recalculate);
    }
    addonCheckboxes.forEach(cb => cb.addEventListener('change', recalculate));

    // Form to calculator sync
    if (packageDropdown) {
      packageDropdown.addEventListener('change', function () {
        const val = this.value.toLowerCase();
        let matchedTier = null;
        if (val.includes('basic')) matchedTier = 'basic';
        else if (val.includes('enterprise')) matchedTier = 'enterprise';
        else if (val.includes('pro')) matchedTier = 'pro';

        if (matchedTier) {
          tierInputs.forEach(input => {
            if (input.value === matchedTier) {
              input.checked = true;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        }
      });
    }

    recalculate();
  }

  /* --------------------------------------------------------------------------
   * 3. BOOTSTRAP ON DOM READY
   * -------------------------------------------------------------------------- */
  function initContact() {
    initContactValidation();
    initDynamicPricing();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContact);
  } else {
    initContact();
  }
})();
