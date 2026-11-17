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
    const favoritesToggle = document.querySelector('#favorites-only');
    const resetEmptyButton = document.querySelector('[data-reset-empty]');
    const cartMessage = document.querySelector('[data-cart-message]');

    const catalogState = { query: '', category: 'all', sort: 'default', minPrice: 0, maxPrice: Infinity, favoritesOnly: false };

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
        if (state.favoritesOnly) result = result.filter((item) => window.ShopFavorites.has(item.id));
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

        const favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.classList.add('favorite-toggle');
        favoriteButton.classList.toggle('is-active', window.ShopFavorites.has(item.id));
        favoriteButton.dataset.action = 'toggle-favorite';
        favoriteButton.dataset.productId = String(item.id);
        favoriteButton.setAttribute('aria-label', `Избранное: ${item.title}`);
        favoriteButton.setAttribute('aria-pressed', String(window.ShopFavorites.has(item.id)));
        favoriteButton.title = 'Добавить или убрать из избранного';
        favoriteButton.textContent = window.ShopFavorites.has(item.id) ? '♥' : '♡';

        const title = document.createElement('h3');
        title.classList.add('product-card__title');
        title.textContent = item.title;

        const description = document.createElement('p');
        description.classList.add('product-card__description');
        description.textContent = item.description;

        const rating = document.createElement('p');
        rating.classList.add('product-card__rating');
        rating.textContent = `★ ${item.rating.toFixed(1)} · ${item.category === 'audio' ? 'Аудиотехника' : item.category === 'console' ? 'Консоли' : 'Аксессуары'}`;

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
        card.append(picture, favoriteButton, title, description, rating, price, availability, actions);
        return card;
    }

    function renderProducts(items) {
        // replaceChildren не оставляет старые карточки после нового поиска.
        const fragment = document.createDocumentFragment();
        items.forEach((item) => fragment.append(createProductCard(item)));
        container.replaceChildren(fragment);
        countElement.textContent = `Найдено товаров: ${items.length}`;
        emptyElement.hidden = items.length > 0;
        const favoritesCount = document.querySelector('[data-favorites-count]');
        if (favoritesCount) favoritesCount.textContent = String(window.ShopFavorites.count());
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

    // Делегирование событий: обработчик остаётся после перерисовки карточек.
    container.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : event.target?.parentElement;
        if (!target) return;
        const favoriteButton = target.closest('[data-action="toggle-favorite"]');
        if (favoriteButton && container.contains(favoriteButton)) {
            const id = Number(favoriteButton.dataset.productId);
            const added = window.ShopFavorites.toggle(id);
            cartMessage.textContent = added ? 'Товар добавлен в избранное.' : 'Товар удалён из избранного.';
            updateCatalog();
            return;
        }
        // Кнопку добавления обслуживает общий обработчик js/cart.js.
        // Событие click всплывает к document и работает после повторного render.
    });

    favoritesToggle?.addEventListener('change', (event) => {
        catalogState.favoritesOnly = event.target.checked;
        updateCatalog();
    });
    resetEmptyButton?.addEventListener('click', () => {
        searchInput.value = '';
        sortSelect.value = 'default';
        favoritesToggle.checked = false;
        filtersForm.reset();
        catalogState.query = '';
        catalogState.sort = 'default';
        catalogState.category = 'all';
        catalogState.favoritesOnly = false;
        updateCatalog();
        searchInput.focus();
    });
    updateCatalog();
    console.log('КР №4: интерактивный каталог подключён, товаров:', products.length);
})();
