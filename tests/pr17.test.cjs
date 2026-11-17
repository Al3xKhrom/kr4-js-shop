// Без зависимостей: node tests/pr17.test.cjs
// Проверяет требования практики №17: данные, DOM-логику и подключение скриптов.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
let checks = 0;
function test(name, callback) { callback(); checks += 1; console.log('OK:', name); }
const context = vm.createContext({});
vm.runInContext(read('js/data.js'), context);
const products = vm.runInContext('products', context);

test('Каталог содержит 9 собственных товаров', () => assert.equal(products.length, 9));
test('У товаров уникальные id', () => assert.equal(new Set(products.map(x => x.id)).size, 9));
test('Все товары имеют поля для DOM-карточек', () => {
    const fields = ['id','title','category','price','discountPercent','rating','isAvailable','image','description'];
    assert(products.every(item => fields.every(key => Object.hasOwn(item, key))));
});
test('Для каждого товара есть jpg, webp и миниатюры', () => {
    products.forEach(({id, image}) => {
        assert(fs.existsSync(path.join(root, image)), image);
        ['jpg','webp'].forEach(ext => {
            for (const size of ['', '-100']) {
                assert(fs.existsSync(path.join(root, `images/product-${id}${size}.${ext}`)));
            }
        });
    });
});
test('Наличие товара, скидки и цены имеют корректные типы', () => {
    assert(products.every(p => typeof p.isAvailable === 'boolean' &&
        Number.isFinite(p.price) && p.price >= 0 &&
        Number.isFinite(p.discountPercent) && p.discountPercent >= 0 && p.discountPercent <= 100));
});
const catalogHtml = read('catalog.html');
const orderHtml = read('order.html');
const main = read('js/main.js');
const catalog = read('js/catalog.js');
const validation = read('js/validation.js');
test('Нужные JS-файлы подключены к каталогу по порядку', () => {
    const paths = ['js/data.js','js/main.js','js/catalog.js','js/validation.js'];
    const offsets = paths.map(name => catalogHtml.indexOf(name));
    assert(offsets.every(x => x >= 0));
    assert(offsets.every((x, i) => i === 0 || x > offsets[i - 1]));
    assert.match(catalogHtml, /defer/);
});
test('В каталоге присутствуют все обязательные DOM-контролы', () => {
    ['catalog-search','filter-category','sort-select','data-products-container','catalog-count','catalog-empty']
        .forEach(name => assert(catalogHtml.includes(name), name));
});
test('Каталог генерируется через DOM API, без innerHTML', () => {
    for (const keyword of ['createElement', 'append(', 'textContent', 'classList', 'dataset', 'addEventListener', 'replaceChildren']) {
        assert(catalog.includes(keyword), keyword);
    }
    assert(!/\.innerHTML\s*=/.test(catalog));
});
test('Каталог поддерживает поиск, фильтрацию, сортировку и пустой результат', () => {
    ['searchProducts(', 'filterProductsByCategory(', 'sortProductsByPrice(', 'getCatalogProducts(', 'updateCatalog(', 'emptyElement.hidden'].forEach(x => assert(catalog.includes(x), x));
});
test('Добавление товара использует делегирование событий', () => {
    assert.match(catalog, /container\.addEventListener\('click'/);
    assert.match(catalog, /event\.target\.closest/);
    assert.match(catalog, /dataset\.productId/);
    assert.match(main, /document\.addEventListener\('click'/);
});
test('Учебная корзина сохраняет только id товара и количество', () => {
    assert(catalog.includes('localStorage.setItem'));
    assert(catalog.includes('JSON.stringify(cart)'));
    assert(catalog.includes('loadCart()'));
    assert(!/localStorage\.setItem\([^,]+,\s*JSON\.stringify\((?:requestData|formData)/.test(catalog));
});
test('Форма заявки подключает validation.js', () => assert(orderHtml.includes('js/validation.js')));
test('Валидация использует ошибки для каждого поля и preventDefault', () => {
    ['aria-invalid','aria-describedby', 'form-error', 'textContent', "addEventListener('submit'", 'preventDefault()', 'name', 'email', 'phone', 'agreement']
        .forEach(x => assert(validation.includes(x), x));
    assert(!/\.innerHTML\s*=/.test(validation));
});
test('README содержит подробную документацию практики №17', () => {
    const readme=read('README.md');
    assert(readme.includes('Практическая работа №17'));
    assert(readme.includes('Breakpoints') || readme.includes('breakpoint'));
});
console.log(`Успешно: ${checks} проверок практической №17.`);
