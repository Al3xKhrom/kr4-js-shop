// Практическая работа №16: массив товаров реального каталога магазина.
// Все товары имеют одинаковые свойства, включая image и description. Наличие, рейтинг и скидки — учебные данные.
// Категории соответствуют значениям фильтра в catalog.html.
const products = [
    {
        id: 1,
        title: "Наушники воздушные капсулы про",
        category: "audio",
        price: 5000,
        discountPercent: 10,
        rating: 4.7,
        isAvailable: true,
        image: "images/product-1.jpg",
        description: "Беспроводные наушники с активным шумоподавлением от внешнего мира."
    },
    {
        id: 2,
        title: "Игровая станция 5",
        category: "console",
        price: 120000,
        discountPercent: 0,
        rating: 4.8,
        isAvailable: true,
        image: "images/product-2.jpg",
        description: "Игровая станция. Идеальный вариант для гта 6."
    },
    {
        id: 3,
        title: "Микрофон (не китайский)",
        category: "audio",
        price: 8000,
        discountPercent: 5,
        rating: 4.5,
        isAvailable: true,
        image: "images/product-3.jpg",
        description: "Мощный и крутой микрофон. Выбор стримеров и блогеров."
    },
    {
        id: 4,
        title: "Х коробка",
        category: "console",
        price: 40000,
        discountPercent: 0,
        rating: 4.4,
        isAvailable: true,
        image: "images/product-4.jpg",
        description: "Игровая консоль для игр."
    },
    {
        id: 5,
        title: "Нинтендо переключатель 2",
        category: "console",
        price: 65000,
        discountPercent: 15,
        rating: 4.6,
        isAvailable: false,
        image: "images/product-5.jpg",
        description: "Портативная игровая станция для фанатов покемонов и зельды."
    },
    {
        id: 6,
        title: "Рычаг управления",
        category: "accessory",
        price: 7000,
        discountPercent: 0,
        rating: 4.3,
        isAvailable: true,
        image: "images/product-6.jpg",
        description: "Рычаг управления для игровой станции 4."
    },
    {
        id: 7,
        title: "Игровая станция 4",
        category: "console",
        price: 35000,
        discountPercent: 0,
        rating: 4.5,
        isAvailable: true,
        image: "images/product-7.jpg",
        description: "Игровая станция. НЕ идеальный вариант для гта 6."
    },
    {
        id: 8,
        title: "Наушники проводные",
        category: "audio",
        price: 2000,
        discountPercent: 0,
        rating: 4.2,
        isAvailable: true,
        image: "images/product-8.jpg",
        description: "Обычные проводные наушники (база)."
    },
    {
        id: 9,
        title: "Флешка (рабочая)",
        category: "accessory",
        price: 1000,
        discountPercent: 5,
        rating: 4.1,
        isAvailable: false,
        image: "images/product-9.jpg",
        description: "Абсолютно точно функционирующее устройство хранения информации."
    }
];
