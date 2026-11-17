// Практика №16: отдельные опыты, не меняющие каталог магазина.
// Для каждого опыта указаны прогноз и фактический результат.
const labLines = [];
function labPrint(name, expected, actual) {
    const show = (value) => JSON.stringify(value, (_key, item) => item === undefined ? "undefined" : item);
    console.log(name, { expected, actual });
    labLines.push(`${name}\n  Прогноз: ${show(expected)}\n  Результат: ${show(actual)}\n  Совпало: ${show(expected) === show(actual) ? 'да' : 'нет'}`);
}

// Индексы, for, for...of и forEach.
{
    const names = ['Лампа', 'Книга', 'Чашка'];
    labPrint('Первый элемент и длина', ['Лампа', 3, undefined], [names[0], names.length, names[3]]);
    const byFor = [];
    for (let index = 0; index < names.length; index += 1) byFor.push(names[index]);
    labPrint('for', names, byFor);
    const byForOf = [];
    for (const name of names) byForOf.push(name);
    labPrint('for...of', names, byForOf);
    const byForEach = [];
    names.forEach((name) => byForEach.push(name));
    labPrint('forEach', names, byForEach);
}

// map, filter, find, sort, reduce; проверка исходного массива.
{
    const prices = [100, 200, 300];
    labPrint('map — скидка 10 руб.', [90, 190, 290], prices.map((price) => price - 10));
    labPrint('map — строки цен', ['100 руб.', '200 руб.', '300 руб.'], prices.map((price) => `${price} руб.`));
    labPrint('filter — цены от 200', [200, 300], prices.filter((price) => price >= 200));
    labPrint('filter — цены от 400', [], prices.filter((price) => price >= 400));
    labPrint('find — первое число больше 150', 200, prices.find((price) => price > 150));
    labPrint('find — больше 400', undefined, prices.find((price) => price > 400));
    labPrint('reduce — сумма', 600, prices.reduce((sum, price) => sum + price, 0));
    labPrint('reduce — пустой массив', 0, [].reduce((sum, price) => sum + price, 0));
    labPrint('Исходные цены не изменились', [100, 200, 300], prices);

    const unsorted = [30, 5, 12];
    labPrint('sort — по возрастанию', [5, 12, 30], [...unsorted].sort((a, b) => a - b));
    labPrint('sort — по убыванию', [30, 12, 5], [...unsorted].sort((a, b) => b - a));
    labPrint('Исходный массив после сортировок копий', [30, 5, 12], unsorted);
}

document.getElementById('array-lab-output').textContent = labLines.join('\n\n');
