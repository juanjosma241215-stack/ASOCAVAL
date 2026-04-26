
(function () {

    const labels = [
        '',
        'Una estrella — Necesita mejorar',
        'Dos estrellas — Regular',
        'Tres estrellas — Bueno',
        'Cuatro estrellas — Muy bueno',
        'Cinco estrellas — Excelente'
    ];

    function initStars(container) {
        const stars   = container.querySelectorAll('.star');
        const label   = container.querySelector('.star-label');
        let current   = 0;

        function paint(upTo, cls) {
            stars.forEach((s, i) => {
                s.classList.remove('hovered', 'selected');
                if (i < upTo) s.classList.add(cls);
            });
        }

        stars.forEach((star, idx) => {
            const value = idx + 1;

            star.addEventListener('mouseenter', () => {
                paint(value, 'hovered');
                label.textContent = labels[value];
                label.classList.add('active');
            });

            star.addEventListener('mouseleave', () => {
                paint(current, 'selected');
                label.textContent = current ? labels[current] : '';
                label.classList.toggle('active', current > 0);
            });

            star.addEventListener('click', () => {
                current = value;
                paint(value, 'selected');
                label.textContent = labels[value];
                label.classList.add('active');

                /* Anuncio accesible */
                announceRating(value);
            });

            /* Soporte teclado */
            star.setAttribute('tabindex', '0');
            star.setAttribute('role', 'radio');
            star.setAttribute('aria-label', labels[value]);

            star.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    star.click();
                }
            });
        });
    }

    function announceRating(value) {
        let announcer = document.getElementById('sr-rating-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-rating-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
            document.body.appendChild(announcer);
        }
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = 'Calificación seleccionada: ' + labels[value];
        }, 50);
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.star-rating-section').forEach(initStars);
    });

})();