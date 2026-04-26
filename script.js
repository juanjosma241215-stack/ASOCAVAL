document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');

    setupScrollProgress();
    setupBackToTop();
    setupNavbarState();
    setupActiveLinks();
    setupRevealAnimations();
    setupDetailsBehavior();
    setupHeroMotion();
    setupExcelGallery();
    setupRatingPanel();
});

function setupScrollProgress() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';

    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';

    progress.appendChild(bar);
    document.body.appendChild(progress);

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
        bar.style.width = `${percent}%`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
}

function setupBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.type = 'button';
    button.setAttribute('aria-label', 'Volver arriba');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(button);

    const toggleButton = () => {
        button.classList.toggle('visible', window.scrollY > 320);
    };

    toggleButton();
    window.addEventListener('scroll', toggleButton, { passive: true });
}

function setupNavbarState() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const updateNavbar = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 24);
    };

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });
}

function setupActiveLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a[href]');

    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const [page] = href.split('#');
        if (page === currentPage) {
            link.classList.add('is-active');
        }
    });
}

function setupRevealAnimations() {
    const selectors = [
        '.hero h1',
        '.hero p',
        '.hero .btn-main',
        '.section-title',
        '.section-subtitle',
        'details',
        '.info-section',
        '.banner-full-container'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    if (!elements.length) return;

    elements.forEach((element, index) => {
        element.classList.add('reveal');
        element.classList.add(`reveal-delay-${index % 4}`);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14
    });

    elements.forEach((element) => observer.observe(element));
}

function setupDetailsBehavior() {
    const detailsList = [...document.querySelectorAll('details')];
    if (!detailsList.length) return;

    detailsList.forEach((detail) => {
        detail.addEventListener('toggle', () => {
            if (!detail.open) return;

            detailsList.forEach((otherDetail) => {
                if (otherDetail !== detail) {
                    otherDetail.open = false;
                }
            });

            detail.classList.remove('details-highlight');
            void detail.offsetWidth;
            detail.classList.add('details-highlight');
        });
    });

    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!(target instanceof HTMLDetailsElement)) return;

    target.open = true;
    requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('details-highlight');
    });
}

function setupHeroMotion() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const updateHero = () => {
        const offset = Math.min(window.scrollY * 0.12, 36);
        hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
    };

    updateHero();
    window.addEventListener('scroll', updateHero, { passive: true });
}

function setupExcelGallery() {
    const input = document.querySelector('[data-excel-input]');
    const gallery = document.querySelector('[data-excel-gallery]');
    const exportButton = document.querySelector('[data-export-excel]');
    const clearButton = document.querySelector('[data-clear-excel]');
    const storageKey = 'asocaval-economic-excel-gallery';
    if (!(input instanceof HTMLInputElement) || !gallery) return;

    let savedImages = loadSavedImages();

    function loadSavedImages() {
        try {
            const raw = window.localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function persistImages() {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(savedImages));
            return true;
        } catch {
            gallery.innerHTML = '<div class="gallery-placeholder">No fue posible guardar las imagenes en el navegador. Intenta con menos archivos.</div>';
            return false;
        }
    }

    function renderGallery() {
        gallery.innerHTML = '';

        if (!savedImages.length) {
            gallery.innerHTML = '<div class="gallery-placeholder">Tus imagenes apareceran aqui ordenadas automaticamente.</div>';
            return;
        }

        savedImages.forEach((file) => {
            const card = document.createElement('figure');
            card.className = 'excel-card';

            const image = document.createElement('img');
            image.alt = file.name;
            image.src = file.dataUrl;

            const caption = document.createElement('span');
            caption.textContent = file.name;

            card.appendChild(image);
            card.appendChild(caption);
            gallery.appendChild(card);
        });
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve({
                    name: file.name,
                    dataUrl: String(event.target?.result || '')
                });
            };
            reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
            reader.readAsDataURL(file);
        });
    }

    input.addEventListener('change', async () => {
        const files = [...(input.files || [])].filter((file) => file.type.startsWith('image/'));
        if (!files.length) return;

        try {
            const newImages = await Promise.all(
                files
                    .sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }))
                    .map(readFileAsDataUrl)
            );

            savedImages = [...savedImages, ...newImages];
            if (persistImages()) {
                renderGallery();
            }
            input.value = '';
        } catch {
            gallery.innerHTML = '<div class="gallery-placeholder">Ocurrio un error al cargar las imagenes.</div>';
        }
    });

    if (exportButton instanceof HTMLButtonElement) {
        exportButton.addEventListener('click', () => {
            if (!savedImages.length) {
                gallery.innerHTML = '<div class="gallery-placeholder">Primero sube imagenes para poder exportarlas.</div>';
                return;
            }

            const rows = savedImages.map((file, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(file.name)}</td>
                    <td><img src="${file.dataUrl}" alt="${escapeHtml(file.name)}" style="max-width:320px; max-height:220px;"></td>
                </tr>
            `).join('');

            const excelContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office"
                      xmlns:x="urn:schemas-microsoft-com:office:excel"
                      xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #c9a47a; padding: 12px; text-align: left; vertical-align: top; }
                        th { background: #d4a373; color: #3d2b1f; }
                        h1 { color: #3d2b1f; }
                    </style>
                </head>
                <body>
                    <h1>Galeria de imagenes de Excel</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Imagen</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </body>
                </html>
            `;

            const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'galeria-excel-asocaval.xls';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        });
    }

    if (clearButton instanceof HTMLButtonElement) {
        clearButton.addEventListener('click', () => {
            savedImages = [];
            try {
                window.localStorage.removeItem(storageKey);
            } catch {}
            renderGallery();
        });
    }

    renderGallery();
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function setupRatingPanel() {
    const panel = document.querySelector('[data-rating-panel]');
    if (!panel) return;

    const analysisBlock = panel.querySelector('[data-analysis-text]');
    const message = panel.querySelector('[data-rating-message]');
    const saveButton = panel.querySelector('[data-save-rating]');
    const resetButton = panel.querySelector('[data-reset-rating]');
    const starButtons = [...panel.querySelectorAll('.star-btn')];
    const storageKey = 'asocaval-economic-rating';

    if (!(analysisBlock instanceof HTMLElement) || !(message instanceof HTMLElement) || !(saveButton instanceof HTMLButtonElement) || !(resetButton instanceof HTMLButtonElement)) {
        return;
    }

    let selectedRating = 0;
    let savedState = loadSavedState();

    function formatStars(value) {
        return value === 1 ? '1 estrella' : `${value} estrellas`;
    }

    function paintStars(value) {
        starButtons.forEach((button) => {
            const buttonValue = Number(button.dataset.value || 0);
            button.classList.toggle('is-active', buttonValue <= value);
            button.classList.toggle('is-selected', buttonValue === value && value > 0);
        });
    }

    function setLockedState(isLocked) {
        saveButton.disabled = isLocked;
        starButtons.forEach((button) => {
            button.disabled = isLocked;
        });
    }

    function loadSavedState() {
        try {
            const raw = window.localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function persistState() {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(savedState));
        } catch {
            message.textContent = 'No se pudo guardar en el navegador.';
            message.className = 'rating-message is-error';
        }
    }

    function clearPersistedState() {
        try {
            window.localStorage.removeItem(storageKey);
        } catch {
            message.textContent = 'No se pudo eliminar la calificacion guardada.';
            message.className = 'rating-message is-error';
        }
    }

    function applySavedState() {
        if (savedState && savedState.rating) {
            selectedRating = savedState.rating;
            paintStars(selectedRating);
            setLockedState(true);
            message.textContent = `Calificacion guardada: ${formatStars(selectedRating)}. Si hubo un error, usa el boton eliminar.`;
            message.className = 'rating-message is-success';
        } else {
            selectedRating = 0;
            paintStars(0);
            setLockedState(false);
            message.textContent = 'Selecciona una calificacion.';
            message.className = 'rating-message';
        }
    }

    starButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (savedState) return;
            selectedRating = Number(button.dataset.value || 0);
            paintStars(selectedRating);
            message.textContent = `Calificacion seleccionada: ${formatStars(selectedRating)}.`;
            message.className = 'rating-message';
        });
    });

    saveButton.addEventListener('click', () => {
        const text = analysisBlock.textContent.trim();

        if (savedState) {
            message.textContent = 'Esta calificacion ya fue registrada. Si necesitas cambiarla, presiona eliminar.';
            message.className = 'rating-message is-error';
            return;
        }

        if (!text) {
            message.textContent = 'Agrega primero el analisis directamente en el codigo HTML.';
            message.className = 'rating-message is-error';
            return;
        }

        if (!selectedRating) {
            message.textContent = 'Selecciona una cantidad de estrellas antes de guardar.';
            message.className = 'rating-message is-error';
            return;
        }

        savedState = {
            analysis: text,
            rating: selectedRating
        };
        persistState();
        applySavedState();
    });

    resetButton.addEventListener('click', () => {
        savedState = null;
        selectedRating = 0;
        clearPersistedState();
        applySavedState();
    });

    applySavedState();
}
