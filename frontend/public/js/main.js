document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  menuButton?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  const gate = document.querySelector('[data-age-gate]');
  if (gate && localStorage.getItem('veloura-adult-confirmed') !== 'true') {
    gate.hidden = false;
    document.body.classList.add('no-scroll');
  }
  document.querySelector('[data-age-accept]')?.addEventListener('click', () => {
    localStorage.setItem('veloura-adult-confirmed', 'true');
    gate.hidden = true;
    document.body.classList.remove('no-scroll');
  });

  const mainImage = document.querySelector('[data-main-image]');
  const thumbnails = [...document.querySelectorAll('[data-gallery-src]')];
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  let galleryIndex = 0;

  function showImage(index) {
    if (!mainImage) return;
    const total = thumbnails.length || 1;
    galleryIndex = (index + total) % total;
    const thumbnail = thumbnails[galleryIndex];
    if (thumbnail) {
      mainImage.src = thumbnail.dataset.gallerySrc;
      mainImage.alt = thumbnail.dataset.galleryAlt;
      thumbnails.forEach((item) => item.classList.remove('active'));
      thumbnail.classList.add('active');
    }
    if (lightboxImage) {
      lightboxImage.src = mainImage.src;
      lightboxImage.alt = mainImage.alt;
    }
    document.querySelectorAll('[data-gallery-current]').forEach((item) => { item.textContent = String(galleryIndex + 1); });
    document.querySelectorAll('[data-lightbox-current]').forEach((item) => { item.textContent = String(galleryIndex + 1); });
  }

  thumbnails.forEach((button, index) => button.addEventListener('click', () => showImage(index)));
  document.querySelectorAll('[data-gallery-prev]').forEach((button) => button.addEventListener('click', () => showImage(galleryIndex - 1)));
  document.querySelectorAll('[data-gallery-next]').forEach((button) => button.addEventListener('click', () => showImage(galleryIndex + 1)));
  document.querySelector('[data-gallery-open]')?.addEventListener('click', () => {
    if (lightboxImage && mainImage) { lightboxImage.src = mainImage.src; lightboxImage.alt = mainImage.alt; }
    lightbox?.showModal();
  });
  document.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
  document.addEventListener('keydown', (event) => {
    if (!mainImage || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    showImage(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });

  const dialog = document.querySelector('[data-report-dialog]');
  document.querySelector('[data-report-open]')?.addEventListener('click', () => dialog?.showModal());
  document.querySelector('[data-report-close]')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  const toast = document.querySelector('.toast');
  if (toast) window.setTimeout(() => toast.remove(), 5000);
});
