// Команда: node tests/kr4.test.cjs. Проверка итоговой КР №4 без npm.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
let checks = 0;
function check(name, fn) { fn(); checks += 1; console.log('OK:', name); }

const storage = new Map();
const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
};
const document = {
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {}
};
const window = {};
const context = vm.createContext({ document, window, localStorage, console });
vm.runInContext(read('js/data.js'), context);
vm.runInContext(read('js/cart.js'), context);
vm.runInContext(read('js/favorites.js'), context);
const cart = window.ShopCart;
const favorites = window.ShopFavorites;

check('Общие файлы корзины и избранного подключаются', () => {
    for (const file of ['index.html','catalog.html','product.html','order.html','contacts.html','cart.html']) {
        assert(read(file).includes('js/cart.js'), file);
        assert(read(file).includes('cart.html'), `navigation in ${file}`);
    }
    assert(read('catalog.html').includes('js/favorites.js'));
    assert(read('catalog.html').includes('js/catalog.js'));
});
check('Все JS-файлы объявлены в проекте и синтаксис DOM безопасный', () => {
    for (const file of ['main','catalog','cart','favorites','modal','validation']) {
        const script = read(`js/${file}.js`);
        assert(!/\.innerHTML\s*=/.test(script), file);
    }
});
check('Корзина сначала пуста', () => assert.equal(cart.totals().count, 0));
check('Нельзя добавить недоступный товар', () => assert.equal(cart.add(5), false));
check('Можно добавить товар', () => assert.equal(cart.add(1), true));
check('Цена учитывает 10% скидку товара', () => assert.equal(cart.totals().final, 4500));
check('Добавление повторно увеличивает количество', () => { cart.add(1); assert.equal(cart.totals().count, 2); });
check('Состояние хранится только как id и количество', () => {
    assert.deepEqual(JSON.parse(storage.get('kr4-js-shop-cart')), [{productId:1, quantity:2}]);
});
check('Количество можно изменять', () => { assert(cart.setQuantity(1,3)); assert.equal(cart.totals().beforePromo,13500); });
check('Промокод считает дополнительную скидку', () => {
    assert(cart.setPromo(' student10 '));
    assert.equal(cart.totals().promoDiscount,1350);
    assert.equal(cart.totals().final,12150);
});
check('Неверный промокод не меняет итог', () => {
    assert.equal(cart.setPromo('FAKE'), false);
    assert.equal(cart.totals().final,12150);
});
check('Промокод можно отменить', () => {
    assert(cart.setPromo(''));
    assert.equal(cart.totals().final,13500);
});
check('Нельзя установить больше 99 товаров', () => assert.equal(cart.setQuantity(1,100),false));
check('Удаление конкретного товара', () => { assert(cart.remove(1)); assert.equal(cart.totals().count,0); });
check('Избранное сохраняет только допустимые id', () => {
    assert.equal(favorites.toggle(1), true);
    assert.equal(favorites.count(),1);
    assert.equal(favorites.toggle(555),false);
    assert.equal(storage.get('kr4-js-shop-favorites'),'[1]');
});
check('Избранное выключается повторным нажатием', () => {
    assert.equal(favorites.toggle(1),false);
    assert.equal(favorites.count(),0);
});
check('Очистка корзины также сбрасывает промокод', () => {
    cart.add(2); cart.setPromo('STUDENT10'); cart.clear();
    assert.equal(cart.totals().count,0);
    assert.equal(storage.get('kr4-js-shop-promo'),'');
});
check('README содержит критерии КР №4 и проверку на защите', () => {
    const text=read('README.md');
    for (const term of ['Практическая работа','localStorage','Корзина','STUDENT10','Избранное','Breakpoints','СДО'])
        assert(text.toLowerCase().includes(term.toLowerCase()),term);
});
console.log(`Готово: ${checks} проверок КР №4.`);
