// КР №4 — избранное: отдельное состояние и безопасное восстановление localStorage.
(() => {
    'use strict';
    const KEY = 'kr4-js-shop-favorites';
    let favorites = new Set();
    try {
        const data = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (Array.isArray(data)) favorites = new Set(data.filter(
            (id) => Number.isInteger(id) && products.some((item) => item.id === id)));
    } catch { /* При недоступности хранилища избранное работает до перезагрузки. */ }

    function has(id) { return favorites.has(id); }
    function count() { return favorites.size; }
    function toggle(id) {
        if (!products.some((item) => item.id === id)) return false;
        if (favorites.has(id)) favorites.delete(id);
        else favorites.add(id);
        try { localStorage.setItem(KEY, JSON.stringify([...favorites])); } catch { /* Без сохранения */ }
        return favorites.has(id);
    }
    window.ShopFavorites = Object.freeze({ has, count, toggle });
})();
