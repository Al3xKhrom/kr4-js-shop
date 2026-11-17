// Без библиотек: node tests/pr16.test.cjs
// Проверка функций практики №16 и безопасного текстового вывода.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const project = path.resolve(__dirname, '..');
const jsMessage = { textContent: '' };
const productOutput = { textContent: '' };
const document = {
    querySelector(selector) {
        if (selector === '.js-message') return jsMessage;
        if (selector === '.product-output') return productOutput;
        return null;
    },
    querySelectorAll() { return []; },
    getElementById() { return null; }
};
const ctx = vm.createContext({
    document,
    window: { matchMedia: () => ({ matches: true, addEventListener() {} }) },
    console: { log() {}, table() {} }
});
for (const file of ['js/data.js', 'js/main.js']) {
    vm.runInContext(fs.readFileSync(path.join(project, file), 'utf8'), ctx, { filename: file });
}
const run = (expression) => vm.runInContext(expression, ctx);
const plain = (value) => JSON.parse(JSON.stringify(value));
const titles = plain(run('getProductTitles(products)'));
assert.equal(run('products.length'), 9);
assert.equal(new Set(titles).size, 9);
assert.equal(run('products.every(item => ["id", "title", "category", "price", "discountPercent", "rating", "isAvailable"].every(k => k in item))'), true);
assert.equal(run('getAvailableProducts(products).length'), 7);
assert.equal(run('countAvailableProducts(products)'), 7);
assert.equal(run('searchProducts(products, " НАУШ ").length'), 2);
assert.equal(run('searchProducts(products, "").length'), 9);
assert.equal(run('searchProducts(products, "несуществующее").length'), 0);
assert.equal(run('filterProductsByCategory(products, "audio").length'), 3);
assert.equal(run('filterProductsByCategory(products, "all").length'), 9);
assert.equal(run('filterProductsByCategory(products, "missing").length'), 0);
assert.equal(run('findProductById(products, 3).title'), 'Микрофон (не китайский)');
assert.equal(run('findProductById(products, 100)'), undefined);
assert.equal(run('calculateTotalPrice(products)'), 283000);
assert.equal(run('calculateTotalPrice([])'), 0);
assert.equal(run('calculateAveragePrice(products)'), 31444);
assert.equal(run('calculateAveragePrice([])'), 0);
assert.deepEqual(plain(run('sortProductsByPrice(products, "asc").map(p => p.price)')),
    [1000,2000,5000,7000,8000,35000,40000,65000,120000]);
assert.deepEqual(plain(run('sortProductsByPrice(products, "desc").map(p => p.price)')),
    [120000,65000,40000,35000,8000,7000,5000,2000,1000]);
assert.deepEqual(plain(run('products.map(p=>p.price)')),
    [5000,120000,8000,40000,65000,7000,35000,2000,1000], 'sort mutated products');
assert.deepEqual(plain(run('getPreparedProducts(products, "науш", "audio", "asc").map(p => p.price)')), [2000, 5000]);
assert.equal(run('getPreparedProducts(products, "x", "audio", "asc").length'), 0);
assert.match(jsMessage.textContent, /Массив товаров/);
assert.match(productOutput.textContent, /Всего товаров: 9/);
assert.match(productOutput.textContent, /Товаров в наличии: 7/);
assert.match(productOutput.textContent, /31.444 руб\./);
console.log('OK: 26 проверок функций, массива, сортировки и вывода через textContent.');
