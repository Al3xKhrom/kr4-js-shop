// Практическая №17. Базовая клиентская валидация: обе формы проекта.
// Ничего не отправляется на сервер; поля и личные данные не сохраняются в localStorage.
(() => {
    'use strict';
    const forms = document.querySelectorAll('.order-form');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    forms.forEach((form) => {
        form.noValidate = true;
        const fields = Array.from(form.querySelectorAll('[name="name"], [name="email"], [name="phone"], [name="topic"], [name="agreement"]'));
        const errors = new Map();
        let attempted = false;
        const touched = new Set();
        const errorSummary = form.querySelector('.form-errors');
        let messageElement = form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('p');
            messageElement.classList.add('form-message');
            messageElement.setAttribute('role', 'status');
            messageElement.setAttribute('aria-live', 'polite');
            form.append(messageElement);
        }
        const successElement = form.closest('dialog')
            ? document.querySelector('#success-message')
            : (document.querySelector('#success-message') || messageElement);

        fields.forEach((field) => {
            const parent = field.closest('.order-form__field');
            if (!parent) return;
            const error = document.createElement('p');
            error.id = `${field.id}-error`;
            error.classList.add('form-error');
            error.hidden = true;
            parent.append(error);
            const described = (field.getAttribute('aria-describedby') || '').trim();
            field.setAttribute('aria-describedby', [described, error.id].filter(Boolean).join(' '));
            errors.set(field, error);
        });

        function showError(field, message) {
            const error = errors.get(field);
            if (!error) return;
            error.textContent = message;
            error.hidden = message === '';
            if (message) field.setAttribute('aria-invalid', 'true');
            else field.removeAttribute('aria-invalid');
        }
        function validate(field) {
            const value = field.type === 'checkbox' ? '' : field.value.trim();
            let message = '';
            if (field.name === 'name' && value.length < 2) {
                message = 'Введите имя не короче 2 символов.';
            } else if (field.name === 'email' && !emailPattern.test(value)) {
                message = 'Введите корректный e-mail, например name@example.com.';
            } else if (field.name === 'phone') {
                const digits = value.replace(/\D/g, '');
                if (!/^[78]\d{10}$/.test(digits)) {
                    message = 'Введите 11 цифр номера, начиная с 7 или 8.';
                }
            } else if (field.name === 'topic' && value === '') {
                message = 'Выберите тему заявки.';
            } else if (field.name === 'agreement' && !field.checked) {
                message = 'Подтвердите согласие на обработку данных.';
            }
            showError(field, message);
            return !message;
        }
        function updateSummary() {
            const invalid = fields.filter((field) => field.getAttribute('aria-invalid') === 'true');
            errorSummary.hidden = invalid.length === 0;
            errorSummary.textContent = invalid.length ? `Исправьте ошибки в ${invalid.length} полях.` : '';
        }
        fields.forEach((field) => {
            const revalidate = () => {
                if (!attempted && !touched.has(field)) return;
                validate(field);
                updateSummary();
            };
            field.addEventListener('input', () => { touched.add(field); revalidate(); });
            field.addEventListener('change', () => { touched.add(field); revalidate(); });
            field.addEventListener('blur', () => {
                if (field.name === 'phone') {
                    const digits = field.value.replace(/\D/g, '');
                    if (/^[78]\d{10}$/.test(digits)) {
                        const normalized = `7${digits.slice(1)}`;
                        field.value = `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
                    }
                }
                // Не раскрываем новую ошибку при первом blur: это может сдвинуть кнопку
                // прямо во время клика. Ошибки появляются при вводе или submit.
                if (attempted) revalidate();
            });
        });
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            attempted = true;
            const invalid = fields.filter((field) => !validate(field));
            updateSummary();
            if (successElement) successElement.textContent = '';
            if (invalid.length) {
                messageElement.textContent = 'Проверьте выделенные поля формы.';
                invalid[0].focus();
                console.warn('Практика №17: форма не прошла проверку.');
                return;
            }
            // Данные собираются локально и НЕ отправляются. Не выводим PII в Console.
            const requestData = {
                name: form.elements.namedItem('name').value.trim(),
                email: form.elements.namedItem('email').value.trim(),
                phone: form.elements.namedItem('phone').value.trim()
            };
            console.log('Практика №17: форма прошла проверку. Полей:', Object.keys(requestData).length);
            form.reset();
            attempted = false;
            touched.clear();
            fields.forEach((field) => showError(field, ''));
            updateSummary();
            messageElement.textContent = '';
            const resultText = 'Форма прошла учебную проверку. Данные на сервер не отправлялись.';
            if (successElement) successElement.textContent = resultText;
            else messageElement.textContent = resultText;
            const dialog = form.closest('dialog');
            if (dialog && dialog.open) dialog.close();
        });
    });
})();
