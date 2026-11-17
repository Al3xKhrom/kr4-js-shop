// Практическая №17. DOM, события, поиск, фильтрация, сортировка.
// data.js хранит products; main.js сохраняет чистые функции практики №16.
(() => {
    'use strict';
    const container = document.querySelector('[data-products-container]');
    if (!container) return; // код работает только на catalog.html

    const searchInput = document.querySelector('#catalog-search');
    const categorySelect = document.querySelector('#filter-category');
    const sortSelect = document.querySelector('#sort-select');
    const priceFrom = document.querySelector('#price-from');
    const priceTo = document.querySelector('#price-to');
    const filtersForm = document.querySelector('.filters-form');
    const errorElement = document.querySelector('#filter-error');
    const countElement = document.querySelector('.catalog-count');
    const emptyElement = document.querySelector('.catalog-empty');
    const cartCount = document.querySelector('[data-cart-count]');
    const cartTotal = document.querySelector('[data-cart-total]');
    const cartMessage = document.querySelector('[data-cart-message]');
    const clearCartButton = document.querySelector('[data-cart-clear]');

    const catalogState = { query: '', category: 'all', sort: 'default', minPrice: 0, maxPrice: Infinity };

    // Не допускаем сортировку исходного массива. Функции №16 вызываются повторно.
    function sortProducts(items, type) {
        const copy = [...items];
        if (type === 'price-asc') return sortProductsByPrice(copy, 'asc');
        if (type === 'price-desc') return sortProductsByPrice(copy, 'desc');
        if (type === 'title-asc') return copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        return copy;
    }

    function getCatalogProducts(items, state) {
        let result = searchProducts(items, state.query);
        result = filterProductsByCategory(result, state.category);
        result = result.filter((item) => item.price >= state.minPrice && item.price <= state.maxPrice);
        return sortProducts(result, state.sort);
    }

    function createProductCard(item) {
        const card = document.createElement('article');
        card.classList.add('product-card');
        card.dataset.productId = String(item.id);
        card.dataset.category = item.category;
        card.dataset.price = String(item.price);

        const picture = document.createElement('picture');
        const source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = `images/product-${item.id}-100.webp 100w, images/product-${item.id}.webp 200w`;
        source.sizes = '(min-width: 1024px) 254px, (min-width: 640px) 45vw, 90vw';
        const image = document.createElement('img');
        image.classList.add('product-card__image');
        image.src = item.image;
        image.srcset = `images/product-${item.id}-100.jpg 100w, ${item.image} 200w`;
        image.sizes = source.sizes;
        image.alt = item.title;
        image.width = 200;
        image.height = 200;
        image.loading = 'lazy';
        picture.append(source, image);

        if (item.discountPercent > 0) {
            card.classList.add('product-card--discount');
            const badge = document.createElement('span');
            badge.classList.add('product-card__badge');
            badge.textContent = `Скидка ${item.discountPercent}%`;
            card.append(badge);
        }

        const title = document.createElement('h3');
        title.classList.add('product-card__title');
        title.textContent = item.title;

        const description = document.createElement('p');
        description.classList.add('product-card__description');
        description.textContent = item.description;

        const price = document.createElement('p');
        price.classList.add('product-card__price');
        const finalPrice = calculateFinalPrice(item.price, item.discountPercent);
        price.textContent = `Цена: ${formatPrice(finalPrice)}`;
        if (item.discountPercent > 0) {
            const oldPrice = document.createElement('del');
            oldPrice.classList.add('product-card__old-price');
            oldPrice.textContent = formatPrice(item.price);
            price.append(' ', oldPrice);
        }

        const availability = document.createElement('p');
        availability.classList.add('product-card__status');
        availability.classList.toggle('product-card__status--unavailable', !item.isAvailable);
        availability.textContent = item.isAvailable ? 'В наличии' : 'Нет в наличии';

        const actions = document.createElement('div');
        actions.classList.add('product-card__actions');
        const orderButton = document.createElement('button');
        orderButton.type = 'button';
        orderButton.classList.add('button', 'button--primary', 'product-card__button');
        orderButton.dataset.product = item.title;
        orderButton.dataset.productId = String(item.id);
        orderButton.textContent = item.isAvailable ? 'Заказать' : 'Недоступно';
        orderButton.setAttribute('aria-label', `Заказать: ${item.title}`);
        orderButton.setAttribute('aria-haspopup', 'dialog');
        orderButton.setAttribute('aria-controls', 'order-dialog');
        orderButton.disabled = !item.isAvailable;

        const cartButton = document.createElement('button');
        cartButton.type = 'button';
        cartButton.classList.add('button', 'button--secondary');
        cartButton.dataset.action = 'add-to-cart';
        cartButton.dataset.productId = String(item.id);
        cartButton.textContent = item.isAvailable ? 'В корзину' : 'Нет в наличии';
        cartButton.disabled = !item.isAvailable;

        actions.append(orderButton, cartButton);
        card.append(picture, title, description, price, availability, actions);
        return card;
    }

    function renderProducts(items) {
        // replaceChildren не оставляет старые карточки после нового поиска.
        const fragment = document.createDocumentFragment();
        items.forEach((item) => fragment.append(createProductCard(item)));
        container.replaceChildren(fragment);
        countElement.textContent = `Найдено товаров: ${items.length}`;
        emptyElement.hidden = items.length > 0;
    }

    function readPriceFilters() {
        const min = priceFrom.value.trim() === '' ? 0 : Number(priceFrom.value);
        const max = priceTo.value.trim() === '' ? Infinity : Number(priceTo.value);
        if (!Number.isFinite(min) || Number.isNaN(max) || min < 0 || max < 0 || min > max) {
            errorElement.textContent = 'Проверьте диапазон: цена «От» не должна быть больше цены «До».';
            errorElement.hidden = false;
            priceFrom.setAttribute('aria-invalid', String(min > max || min < 0));
            priceTo.setAttribute('aria-invalid', String(max < min || max < 0));
            return false;
        }
        errorElement.hidden = true;
        errorElement.textContent = '';
        priceFrom.removeAttribute('aria-invalid');
        priceTo.removeAttribute('aria-invalid');
        catalogState.minPrice = min;
        catalogState.maxPrice = max;
        return true;
    }

    function updateCatalog() {
        if (!readPriceFilters()) return;
        renderProducts(getCatalogProducts(products, catalogState));
    }

    // Стартовый рендер + повторный рендер при input/change.
    searchInput.addEventListener('input', (event) => {
        catalogState.query = event.target.value;
        updateCatalog();
    });
    categorySelect.addEventListener('change', (event) => {
        catalogState.category = event.target.value;
        updateCatalog();
    });
    sortSelect.addEventListener('change', (event) => {
        catalogState.sort = event.target.value;
        updateCatalog();
    });
    [priceFrom, priceTo].forEach((input) => input.addEventListener('input', updateCatalog));
    filtersForm.addEventListener('submit', (event) => {
        event.preventDefault();
        updateCatalog();
    });
    filtersForm.addEventListener('reset', () => {
        catalogState.category = 'all';
        setTimeout(updateCatalog, 0); // после сброса браузером значений полей
    });

    // Адаптивная панель фильтров: сохранена логика старой версии.
    const disclosure = document.querySelector('.filter-disclosure');
    if (disclosure) {
        const wide = window.matchMedia('(min-width: 1024px)');
        const sync = () => { disclosure.open = wide.matches; };
        sync();
        wide.addEventListener('change', sync);
    }

    // Дополнение КР №4: компактная учебная корзина с localStorage.
    // Сохраняем только id товара и количество. Персональные данные формы не сохраняем.
    const CART_KEY = 'kr4-js-shop-cart';
    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((item) => Number.isInteger(item.productId) &&
                Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99 &&
                products.some((product) => product.id === item.productId && product.isAvailable));
        } catch {
            return [];
        }
    }
    let cart = loadCart();

    function saveCart() {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
        catch { cartMessage.textContent = 'Не удалось сохранить корзину в браузере.'; }
    }
    function renderCart() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const sum = cart.reduce((total, item) => {
            const product = products.find((p) => p.id === item.productId);
            return total + (product ? calculateFinalPrice(product.price, product.discountPercent) * item.quantity : 0);
        }, 0);
        cartCount.textContent = String(count);
        cartTotal.textContent = formatPrice(sum);
        clearCartButton.disabled = count === 0;
    }
    container.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action="add-to-cart"]');
        if (!button || !container.contains(button) || button.disabled) return;
        const itemId = Number(button.dataset.productId);
        const item = products.find((p) => p.id === itemId && p.isAvailable);
        if (!item) return;
        let entry = cart.find((p) => p.productId === itemId);
        if (entry) {
            if (entry.quantity >= 99) {
                cartMessage.textContent = 'Максимум 99 экземпляров одного товара.';
                return;
            }
            entry.quantity += 1;
        } else {
            cart.push({ productId: itemId, quantity: 1 });
        }
        saveCart();
        renderCart();
        cartMessage.textContent = `Добавлено в корзину: ${item.title}`;
        console.log('Практика №17 — выбран товар:', itemId);
    });
    clearCartButton.addEventListener('click', () => {
        cart = [];
        saveCart();
        renderCart();
        cartMessage.textContent = 'Корзина очищена.';
    });
    renderCart();
    updateCatalog();
    console.log('Практика №17: динамический каталог подключён, товаров:', products.length);
})();
