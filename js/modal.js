// КР №4: модальное окно оформления. Работает с карточками, созданными в DOM.
(() => {
    'use strict';
    const dialog = document.querySelector('#order-dialog');
    if (!dialog) return;

    const selectedProduct = dialog.querySelector('#selected-product');
    let opener = null;

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : event.target?.parentElement;
        const button = target?.closest('.product-card__button[data-product]');
        if (!button || button.disabled) return;
        opener = button;
        if (selectedProduct) selectedProduct.value = button.dataset.product;
        if (!dialog.open) dialog.showModal();
        dialog.querySelector('input:not([type="hidden"])')?.focus();
    });

    document.querySelector('#close-order-dialog')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
        if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
})();
