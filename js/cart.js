// КР №4 — полноценная корзина: добавление, изменение количества, удаление,
// расчёт суммы через reduce, промокод STUDENT10, localStorage и экран корзины.
// Данные формы и персональные сведения не храним.
(() => {
    'use strict';
    const CART_KEY = 'kr4-js-shop-cart'; // совместимость с практикой №17
    const PROMO_KEY = 'kr4-js-shop-promo';
    const PROMO_CODE = 'STUDENT10';
    const maxQuantity = 99;

    function readStorage(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    }
    function writeStorage(key, value) {
        try { localStorage.setItem(key, value); return true; }
        catch { return false; }
    }
    function validProduct(id) {
        return products.find((item) => item.id === id && item.isAvailable);
    }
    function restoreCart() {
        try {
            const value = JSON.parse(readStorage(CART_KEY) || '[]');
            if (!Array.isArray(value)) return [];
            const quantities = new Map();
            value.forEach((entry) => {
                if (!entry || !Number.isInteger(entry.productId) || !Number.isInteger(entry.quantity) ||
                    entry.quantity < 1 || !validProduct(entry.productId)) return;
                quantities.set(entry.productId,
                    Math.min(maxQuantity, (quantities.get(entry.productId) || 0) + entry.quantity));
            });
            return Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
        } catch { return []; }
    }

    let cart = restoreCart();
    let promoCode = readStorage(PROMO_KEY) === PROMO_CODE ? PROMO_CODE : '';
    const currency = (amount) => `${amount.toLocaleString('ru-RU')} руб.`;
    const discountedPrice = (item) => item.price - item.price * item.discountPercent / 100;

    function subtotal() {
        return cart.reduce((total, entry) => {
            const item = validProduct(entry.productId);
            return total + (item ? discountedPrice(item) * entry.quantity : 0);
        }, 0);
    }
    function totals() {
        const beforePromo = subtotal();
        const promoDiscount = promoCode === PROMO_CODE ? Math.round(beforePromo * 0.1) : 0;
        return {
            count: cart.reduce((count, entry) => count + entry.quantity, 0),
            beforePromo,
            promoDiscount,
            final: beforePromo - promoDiscount
        };
    }
    function getItems() {
        return cart.map((entry) => ({ ...entry, product: validProduct(entry.productId) }))
            .filter((entry) => entry.product);
    }
    function notify(message = '') {
        const status = document.querySelector('[data-cart-message]');
        if (status) status.textContent = message;
        render();
    }
    function persist() {
        if (!writeStorage(CART_KEY, JSON.stringify(cart))) {
            notify('Не удалось сохранить корзину: хранилище браузера недоступно.');
        }
    }
    function update(message = '') {
        persist();
        notify(message);
    }
    function add(productId) {
        const product = validProduct(productId);
        if (!product) { notify('Товар недоступен для заказа.'); return false; }
        const entry = cart.find((item) => item.productId === productId);
        if (entry && entry.quantity >= maxQuantity) {
            notify('Максимум 99 экземпляров одного товара.');
            return false;
        }
        if (entry) entry.quantity += 1;
        else cart.push({ productId, quantity: 1 });
        update(`Добавлено в корзину: ${product.title}`);
        return true;
    }
    function setQuantity(productId, quantity) {
        if (!validProduct(productId) || !Number.isInteger(quantity) || quantity < 0 || quantity > maxQuantity) return false;
        if (quantity === 0) return remove(productId);
        const entry = cart.find((item) => item.productId === productId);
        if (!entry) return false;
        entry.quantity = quantity;
        update('Количество товара обновлено.');
        return true;
    }
    function remove(productId) {
        const before = cart.length;
        cart = cart.filter((entry) => entry.productId !== productId);
        if (cart.length === before) return false;
        update('Товар удалён из корзины.');
        return true;
    }
    function clear() {
        cart = [];
        promoCode = '';
        writeStorage(PROMO_KEY, '');
        update('Корзина очищена.');
    }
    function setPromo(rawCode) {
        const code = rawCode.trim().toUpperCase();
        if (code === '') {
            promoCode = '';
            writeStorage(PROMO_KEY, '');
            notify('Промокод удалён.');
            return true;
        }
        if (code !== PROMO_CODE) {
            notify('Промокод не найден. Для демонстрации используйте STUDENT10.');
            return false;
        }
        promoCode = PROMO_CODE;
        writeStorage(PROMO_KEY, promoCode);
        notify('Промокод STUDENT10 применён: дополнительная скидка 10%.');
        return true;
    }

    // Формирование элементов без innerHTML: весь текст — через textContent.
    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function actionButton(label, action, productId, disabled = false) {
        const button = element('button', 'button button--secondary', label);
        button.type = 'button';
        button.dataset.cartAction = action;
        button.dataset.productId = String(productId);
        button.disabled = disabled;
        button.setAttribute('aria-label', `${label}: товар №${productId}`);
        return button;
    }
    function renderLine(entry) {
        const item = entry.product;
        const row = element('article', 'cart-line');
        row.dataset.productId = String(item.id);
        const image = element('img', 'cart-line__image');
        image.src = item.image;
        image.alt = item.title;
        image.width = 96;
        image.height = 96;
        image.loading = 'lazy';
        const details = element('div', 'cart-line__details');
        details.append(element('h3', 'product-card__title', item.title),
            element('p', 'cart-line__price', `Цена за единицу: ${currency(discountedPrice(item))}`));
        const controls = element('div', 'cart-line__controls');
        const qty = element('span', 'cart-line__quantity', String(entry.quantity));
        qty.setAttribute('aria-label', `Количество: ${entry.quantity}`);
        controls.append(
            actionButton('−', 'decrease', item.id), qty,
            actionButton('+', 'increase', item.id, entry.quantity >= maxQuantity),
            actionButton('Удалить', 'remove', item.id)
        );
        details.append(controls);
        row.append(image, details,
            element('strong', 'cart-line__sum', currency(discountedPrice(item) * entry.quantity)));
        return row;
    }
    function render() {
        const summary = totals();
        document.querySelectorAll('[data-cart-count], [data-header-cart-count]')
            .forEach((node) => { node.textContent = String(summary.count); });
        document.querySelectorAll('[data-cart-total]')
            .forEach((node) => { node.textContent = currency(summary.final); });
        document.querySelectorAll('[data-cart-clear]')
            .forEach((node) => { node.disabled = summary.count === 0; });

        const list = document.querySelector('[data-cart-items]');
        const empty = document.querySelector('[data-cart-empty]');
        if (list) {
            const fragment = document.createDocumentFragment();
            getItems().forEach((entry) => fragment.append(renderLine(entry)));
            list.replaceChildren(fragment);
        }
        if (empty) empty.hidden = summary.count !== 0;
        const numbers = {
            '[data-cart-subtotal]': summary.beforePromo,
            '[data-cart-promo-discount]': summary.promoDiscount,
            '[data-cart-final]': summary.final
        };
        Object.entries(numbers).forEach(([selector, amount]) => {
            document.querySelectorAll(selector).forEach((node) => { node.textContent = currency(amount); });
        });
        const promoInput = document.querySelector('[data-cart-promo-input]');
        if (promoInput && document.activeElement !== promoInput) promoInput.value = promoCode;
        const orderSummary = document.querySelector('[data-order-cart-summary]');
        if (orderSummary) {
            orderSummary.hidden = summary.count === 0;
            orderSummary.textContent = summary.count
                ? `В вашей корзине ${summary.count} шт. на сумму ${currency(summary.final)}. Это учебная заявка, оплата не производится.`
                : '';
        }
    }

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : event.target?.parentElement;
        const addButton = target?.closest('[data-action="add-to-cart"]');
        if (addButton && !addButton.disabled) {
            add(Number(addButton.dataset.productId));
            return;
        }
        const clearButton = target?.closest('[data-cart-clear]');
        if (clearButton) { clear(); return; }
        const button = target?.closest('[data-cart-action]');
        if (!button) return;
        const id = Number(button.dataset.productId);
        const entry = cart.find((item) => item.productId === id);
        if (button.dataset.cartAction === 'increase') setQuantity(id, Math.min(maxQuantity, (entry?.quantity || 0) + 1));
        if (button.dataset.cartAction === 'decrease' && entry) setQuantity(id, entry.quantity - 1);
        if (button.dataset.cartAction === 'remove') remove(id);
    });
    document.querySelector('[data-cart-promo-form]')?.addEventListener('submit', (event) => {
        event.preventDefault();
        setPromo(event.currentTarget.querySelector('[data-cart-promo-input]').value);
    });

    window.ShopCart = Object.freeze({ add, remove, setQuantity, clear, setPromo, totals, getItems, render });
    render();
})();
