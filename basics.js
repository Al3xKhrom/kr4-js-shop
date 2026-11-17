// Отдельная учебная лаборатория практики №15.
// В каждом опыте сначала указан прогноз, затем результат запуска.
console.log('Скрипт запущен');
document.querySelector('#result').textContent = 'JavaScript работает';
const results = [];
const record = (label, value) => {
    console.log(label, value);
    results.push(`${label}: ${value}`);
};

// 1. const, let, typeof и изменение свойства объекта.
{
    const item = { title: 'Лампа', price: 1200, isAvailable: true };
    let amount = 1;
    amount += 1;
    item.price = 1100;
    // Прогноз: 2; "number"; "Лампа 1100".
    record('Количество', amount);
    record('Тип цены до изменения', typeof item.price);
    record('Товар', `${item.title} ${item.price}`);
    item.price = '1100';
    // Прогноз: typeof теперь "string".
    record('Тип цены после изменения', typeof item.price);
}

// 2. Преобразование строк из формы / dataset в число.
{
    const samples = ['1100', 'abc', ''];
    for (const raw of samples) {
        const value = Number(raw);
        const valid = raw.trim() !== '' && Number.isFinite(value);
        // Прогноз: 1100 true; NaN false; 0 false.
        record(`Number(${JSON.stringify(raw)})`, `${value}, корректно: ${valid}`);
    }
}

// 3. Арифметика и ветвления: три разных состояния.
{
    const price = 1000;
    const discountPercent = 10;
    for (const available of [true, false]) {
        const finalPrice = price - price * discountPercent / 100;
        if (available && finalPrice < price) {
            record('Статус со скидкой', `Доступен за ${finalPrice}`); // 900
        } else if (available) {
            record('Статус со скидкой', 'В наличии без скидки');
        } else {
            record('Статус со скидкой', 'Нет в наличии');
        }
    }
    const unchangedPrice = price - price * 0 / 100;
    record('Цена при скидке 0%', unchangedPrice); // 1000
}

// 4. Аргументы, return и локальная область видимости.
{
    function discountedPrice(price, percent) {
        const discount = price * percent / 100;
        return price - discount;
    }
    // Прогноз: 400, 500, 375.
    record('500 со скидкой 20%', discountedPrice(500, 20));
    record('500 со скидкой 0%', discountedPrice(500, 0));
    record('500 со скидкой 25%', discountedPrice(500, 25));
    // Локальная переменная discount снаружи функции недоступна.
}

document.querySelector('#lab-output').textContent = results.join('\n');
