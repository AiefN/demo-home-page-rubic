(function () {
  'use strict';

  function initForms() {
    initCollapsibleForm();
    initFormValidation();
  }

  function initCollapsibleForm() {
    const toggleBtn = document.getElementById('toggle-form-btn');
    const toggleBtnText = document.getElementById('toggle-form-btn-text');
    const closeBtn = document.getElementById('close-form-btn');
    const formWrapper = document.getElementById('collapsible-form-wrapper');

    if (!toggleBtn || !formWrapper) return;

    function openForm() {
      formWrapper.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (toggleBtnText) toggleBtnText.textContent = 'TUTUP FORMULIR ×';

      setTimeout(function () {
        formWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const firstInput = formWrapper.querySelector('input');
        if (firstInput) firstInput.focus();
      }, 120);
    }

    function closeForm() {
      formWrapper.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (toggleBtnText) toggleBtnText.textContent = 'EKSPLOR IDE & BUKA FORMULIR →';
    }

    toggleBtn.addEventListener('click', function () {
      if (formWrapper.classList.contains('is-open')) {
        closeForm();
      } else {
        openForm();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeForm);
    }

    const contactLinks = document.querySelectorAll('a[href="#contact"]');
    contactLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        openForm();
      });
    });
  }

  function initFormValidation() {
    const forms = document.querySelectorAll('.validated-contact-form');
    if (!forms.length) return;

    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        let isValid = true;

        const nameInput = form.querySelector('[name="nama"]');
        if (nameInput) {
          const val = nameInput.value.trim();
          if (val.length < 2) {
            showError(nameInput, 'Mohon masukkan nama lengkap Anda (minimal 2 karakter).');
            isValid = false;
          } else {
            clearError(nameInput);
          }
        }

        const emailInput = form.querySelector('[name="email"]');
        if (emailInput) {
          const val = emailInput.value.trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            showError(emailInput, 'Mohon masukkan alamat email yang valid.');
            isValid = false;
          } else {
            clearError(emailInput);
          }
        }

        const categorySelect = form.querySelector('[name="layanan"]');
        if (categorySelect) {
          if (!categorySelect.value) {
            showError(categorySelect, 'Silakan pilih kategori layanan proyek.');
            isValid = false;
          } else {
            clearError(categorySelect);
          }
        }

        const descInput = form.querySelector('[name="deskripsi"], [name="pesan"]');
        if (descInput) {
          const val = descInput.value.trim();
          if (val.length < 10) {
            showError(descInput, 'Deskripsi kebutuhan proyek minimal 10 karakter agar dapat kami telaah.');
            isValid = false;
          } else {
            clearError(descInput);
          }
        }

        const agreementCheck = form.querySelector('[name="persetujuan"]');
        if (agreementCheck && !agreementCheck.checked) {
          showError(agreementCheck, 'Anda harus menyetujui pemrosesan data untuk melanjutkan.');
          isValid = false;
        } else if (agreementCheck) {
          clearError(agreementCheck);
        }

        if (isValid) {
          const feedbackBanner = form.querySelector('.form-feedback-banner');
          if (feedbackBanner) {
            feedbackBanner.classList.add('success');
            feedbackBanner.innerHTML = `
              <strong>Permintaan Terkirim!</strong> Terima kasih, data proyek Anda telah terverifikasi.<br>
              <small>Tim spesialis Rubicweb akan meninjau dan merespons dalam 1-2 hari kerja.</small>
            `;
            feedbackBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Permintaan Telah Diterima';
          }
        }
      });
    });

    function showError(inputElement, message) {
      inputElement.classList.add('has-error');
      const formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
      let errorMsg = formGroup.querySelector('.error-message');
      
      if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message is-visible';
        formGroup.appendChild(errorMsg);
      }
      
      errorMsg.textContent = message;
      errorMsg.classList.add('is-visible');
    }

    function clearError(inputElement) {
      inputElement.classList.remove('has-error');
      const formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
      const errorMsg = formGroup.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.classList.remove('is-visible');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
  } else {
    initForms();
  }
})();
