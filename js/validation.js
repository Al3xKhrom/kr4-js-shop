// КР №4. Универсальная валидация формы заказа, модальной формы и обратной связи.
// Данные проверяются только локально; никакой реальной отправки и сохранения ПД нет.
(() => {
    'use strict';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fieldsSelector = '[name="name"], [name="email"], [name="phone"], [name="topic"], [name="message"], [name="agreement"]';

    document.querySelectorAll('.order-form').forEach((form) => {
        form.noValidate = true;
        const fields = Array.from(form.querySelectorAll(fieldsSelector));
        const errors = new Map();
        let attempted = false;
        const touched = new Set();
        let summary = form.querySelector('.form-errors');
        if (!summary) {
            summary = document.createElement('p');
            summary.classList.add('form-errors');
            summary.setAttribute('role', 'alert');
            form.prepend(summary);
        }
        summary.hidden = true;
        let message = form.querySelector('.form-message');
        if (!message) {
            message = document.createElement('p');
            message.classList.add('form-message');
            message.setAttribute('aria-live', 'polite');
            form.append(message);
        }
        const success = form.closest('dialog')
            ? document.querySelector('#success-message')
            : (form.parentElement.querySelector('.success-message') || message);

        fields.forEach((field) => {
            const parent = field.closest('.order-form__field') || field.parentElement;
            const error = document.createElement('p');
            error.id = `${field.id || field.name}-error`;
            error.classList.add('form-error');
            error.hidden = true;
            parent.append(error);
            const previous = (field.getAttribute('aria-describedby') || '').trim();
            field.setAttribute('aria-describedby', [previous, error.id].filter(Boolean).join(' '));
            errors.set(field, error);
        });

        function showError(field, text) {
            const error = errors.get(field);
            if (!error) return;
            error.textContent = text;
            error.hidden = text === '';
            if (text) field.setAttribute('aria-invalid', 'true');
            else field.removeAttribute('aria-invalid');
        }
        function validate(field) {
            const value = field.type === 'checkbox' ? '' : field.value.trim();
            let error = '';
            if (field.name === 'name' && value.length < 2) {
                error = 'Введите имя не короче 2 символов.';
            } else if (field.name === 'email' && !emailPattern.test(value)) {
                error = 'Введите корректный e-mail, например name@example.com.';
            } else if (field.name === 'phone' && !/^[78]\d{10}$/.test(value.replace(/\D/g, ''))) {
                error = 'Укажите 11 цифр телефона, начиная с 7 или 8.';
            } else if (field.name === 'topic' && value === '') {
                error = 'Выберите тему заявки.';
            } else if (field.name === 'message' && value.length < 10) {
                error = 'Напишите сообщение не короче 10 символов.';
            } else if (field.name === 'agreement' && !field.checked) {
                error = 'Подтвердите согласие на обработку данных.';
            }
            showError(field, error);
            return error === '';
        }
        function renderSummary() {
            const count = fields.filter((field) => field.getAttribute('aria-invalid') === 'true').length;
            summary.hidden = count === 0;
            summary.textContent = count ? `Исправьте ошибки в ${count} полях.` : '';
        }
        fields.forEach((field) => {
            const revalidate = () => {
                if (!attempted && !touched.has(field)) return;
                validate(field);
                renderSummary();
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
                if (attempted) revalidate();
            });
        });
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            attempted = true;
            const invalid = fields.filter((field) => !validate(field));
            renderSummary();
            if (success) success.textContent = '';
            if (invalid.length) {
                message.textContent = 'Проверьте выделенные поля формы.';
                invalid[0].focus();
                return;
            }
            // Имитируем обработку: почта, телефон и имя не отправляются и не сохраняются.
            console.log('КР №4: проверка формы прошла успешно, отправка имитирована.');
            form.reset();
            attempted = false;
            touched.clear();
            fields.forEach((field) => showError(field, ''));
            renderSummary();
            message.textContent = '';
            const result = form.classList.contains('feedback-form')
                ? 'Сообщение прошло проверку. Это учебная демонстрация: оно не было отправлено.'
                : 'Заявка подготовлена! Это учебная демонстрация: данные не отправлены на сервер, оплата не производится.';
            if (success) success.textContent = result;
            else message.textContent = result;
            const dialog = form.closest('dialog');
            if (dialog?.open) dialog.close();
        });
    });
})();
