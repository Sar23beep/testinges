document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-admin-menu]')?.addEventListener('click', () => document.querySelector('[data-admin-sidebar]')?.classList.toggle('open'));
  document.querySelectorAll('[data-confirm]').forEach((element) => element.addEventListener('click', (event) => {
    if (!window.confirm(element.dataset.confirm)) event.preventDefault();
  }));

  const list = document.querySelector('[data-sortable]');
  let dragged = null;
  list?.querySelectorAll('[data-image-item]').forEach((item) => {
    item.addEventListener('dragstart', () => { dragged = item; item.style.opacity = '.5'; });
    item.addEventListener('dragend', () => { item.style.opacity = ''; dragged = null; });
    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (dragged && dragged !== item) {
        const bounds = item.getBoundingClientRect();
        list.insertBefore(dragged, event.clientX < bounds.left + bounds.width / 2 ? item : item.nextSibling);
      }
    });
  });
  document.querySelector('[data-order-form]')?.addEventListener('submit', () => {
    const ids = [...document.querySelectorAll('[data-image-id]')].map((item) => item.dataset.imageId);
    document.querySelector('[data-order-input]').value = ids.join(',');
  });
});
