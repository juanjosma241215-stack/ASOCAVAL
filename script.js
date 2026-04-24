document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');

    setupScrollProgress();
    setupBackToTop();
    setupNavbarState();
    setupActiveLinks();
    setupRevealAnimations();
    setupDetailsBehavior();
    setupHeroMotion();
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
