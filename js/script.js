// ===== MENÚ HAMBURGUESA (único, funciona en desktop y móvil) =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

function toggleNav(open) {
    const isOpen = typeof open === 'boolean' ? open : !nav.classList.contains('open');
    const navPanel = nav.querySelector('.nav-panel');
    if (isOpen) {
        nav.classList.add('open');
        nav.classList.add('active');
        hamburger.classList.add('active');
        nav.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent background scroll
        // set focus to first nav link for accessibility
        const firstLink = nav.querySelector('.nav-link');
        if (firstLink) firstLink.focus();
    } else {
        nav.classList.remove('open');
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        nav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // restore scroll
        // return focus to hamburger
        hamburger.focus();
    }
    // small aria expanded on hamburger
    hamburger.setAttribute('aria-expanded', String(isOpen));
    if (navPanel) {
        // toggle attribute for CSS hooks if needed
        navPanel.setAttribute('data-open', isOpen ? 'true' : 'false');
    }
}

hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleNav();
});

// Cerrar menú al hacer clic en un enlace
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        toggleNav(false);
    });
});

// Cerrar nav al hacer clic fuera
document.addEventListener('click', function(e) {
    // if nav is open and click is outside the nav panel AND outside hamburger, close it
    if (nav.classList.contains('open')) {
        const navPanel = nav.querySelector('.nav-panel');
        if (navPanel && !navPanel.contains(e.target) && !hamburger.contains(e.target)) {
            toggleNav(false);
        }
    }
});

// Close nav with Escape key when open
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        if (nav.classList.contains('open')) {
            toggleNav(false);
        }
    }
});

// Prevent submenus from being visible accidentally
document.querySelectorAll('.sub-toggle').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const submenu = this.closest('.has-submenu').querySelector('.sub-menu');
        if (submenu) {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            submenu.classList.toggle('open');
        }
    });
});

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');

window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== TABS DE CATEGORÍAS =====
const categoryTabs = document.querySelectorAll('.tab-btn');
const categoryPanels = document.querySelectorAll('.category-panel');

categoryTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        
        // Remover clase active de todos los tabs y panels
        categoryTabs.forEach(t => t.classList.remove('active'));
        categoryPanels.forEach(p => p.classList.remove('active'));
        
        // Agregar clase active al tab clickeado y su panel correspondiente
        this.classList.add('active');
        document.getElementById(category).classList.add('active');
    });
});

// ===== SLIDERS DE CATEGORÍAS =====
// ===== SLIDERS DE CATEGORÍAS (dinámicos por carpeta) =====
async function buildProductSwipers() {
    // Asegurarse de que las rutas base sean absolutas
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
    const swipers = document.querySelectorAll('.product-swiper');
    const glightInstances = [];

    for (const container of swipers) {
        const folder = container.dataset.swiperFolder || container.closest('.category-panel')?.dataset.folder;
        if (!folder) continue;

        let singularFolder = folder;
        if (folder === 'pantalones') {
            singularFolder = 'pantalon';
        } else if (folder === 'panes-artesanales') {
            singularFolder = 'pan-artesanal';
        } else if (folder.endsWith('s')) {
            singularFolder = folder.slice(0, -1);
        }

        // Create DOM structure required by Swiper
        const swiperEl = document.createElement('div');
        swiperEl.className = 'swiper my-swiper';
        const wrapper = document.createElement('div');
        wrapper.className = 'swiper-wrapper';
        swiperEl.appendChild(wrapper);

        // navigation
        const prev = document.createElement('div');
        prev.className = 'swiper-button-prev';
        const next = document.createElement('div');
        next.className = 'swiper-button-next';
        const pagination = document.createElement('div');
        pagination.className = 'swiper-pagination';

        container.appendChild(swiperEl);
        container.appendChild(prev);
        container.appendChild(next);
        container.appendChild(pagination);

        console.log(`Buscando imágenes para la categoría: ${folder}`);
        const maxImages = 5;
        const loadedImages = [];
        const categoryMapping = {
            'panes': { folder: 'panes artesanales', prefix: 'panes artesanales ' },
            'pasteles': { folder: 'Pasteleria fina', prefix: 'pasteleria fina ' }, // Actualizado para que coincida con los nombres de archivo
            'reposteria': { folder: 'pan-dulce-tradicional', prefix: 'pan-dulce' },
            'bebidas': { folder: 'bebidas-acompanamientos', prefix: 'bebida' },
            'especiales': { folder: 'especiales-temporada', prefix: 'especial' }
        };

        const category = categoryMapping[folder] || { folder, prefix: folder };
        // Usar la ruta directa a las carpetas específicas
        let folderPath;
        if (category.folder === 'panes artesanales') {
            folderPath = 'images/panes artesanales';
        } else if (category.folder === 'Pasteleria fina') {
            folderPath = 'images/Pasteleria fina';
        } else {
            folderPath = `images/productos/${category.folder}`;
        }
        const prefix = category.prefix;
        console.log(`Usando prefijo de imagen: ${prefix}`);
        
        // Try loading images with the pattern: prefix1.jpg, prefix2.jpg, etc.
        for (let i = 1; i <= maxImages; i++) {
            const imagePath = `${folderPath}/${prefix}${i}.jpg`;
            console.log(`Intentando cargar: ${imagePath}`);
            if (await checkImage(imagePath)) {
                console.log(`Imagen encontrada: ${imagePath}`);
                loadedImages.push(imagePath);
            }
        }

        // If no images found, try with .webp extension
        if (loadedImages.length === 0) {
            console.log('No se encontraron imágenes JPG, intentando con WEBP...');
            for (let i = 1; i <= maxImages; i++) {
                const imagePath = `${folderPath}/${prefix}${i}.webp`;
                console.log(`Intentando cargar: ${imagePath}`);
                if (await checkImage(imagePath)) {
                    console.log(`Imagen encontrada: ${imagePath}`);
                    loadedImages.push(imagePath);
                }
            }
        }
        if (loadedImages.length === 0) {
            // Intentar con una imagen genérica de la categoría
            const fallback = `${folderPath}/main.jpg`;
            console.log(`Intentando cargar imagen de respaldo: ${fallback}`);
            if (await checkImage(fallback)) {
                loadedImages.push(fallback);
                console.log(`Imagen de respaldo cargada: ${fallback}`);
            } else {
                console.log(`No se pudo cargar la imagen de respaldo: ${fallback}`);
            }
        }

        // Si aún no hay imágenes, mostrar un mensaje
        if (loadedImages.length === 0) {
            console.warn(`No se encontraron imágenes para la categoría: ${folder}`);
            const noImageMessage = document.createElement('div');
            noImageMessage.className = 'no-images-message';
            noImageMessage.textContent = 'No hay imágenes disponibles en este momento';
            container.appendChild(noImageMessage);
            continue; // Pasar a la siguiente categoría
        }

        // Build slides
        loadedImages.forEach((src, idx) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            const a = document.createElement('a');
            a.href = src;
            a.className = 'glightbox';
            a.setAttribute('data-gallery', folder);
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${folder} ${idx + 1}`;
            img.style.maxHeight = '420px';
            img.style.objectFit = 'cover';
            img.style.width = '100%';
            a.appendChild(img);
            slide.appendChild(a);
            wrapper.appendChild(slide);
        });

        // If no images found, place a placeholder
        if (loadedImages.length === 0) {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.textContent = 'No hay imágenes disponibles';
            slide.style.padding = '40px';
            slide.style.color = '#666';
            wrapper.appendChild(slide);
        }

        // Initialize Swiper
        // eslint-disable-next-line no-undef
        const swiper = new Swiper(swiperEl, {
            loop: loadedImages.length > 1,
            slidesPerView: 1,
            spaceBetween: 10,
            navigation: {
                nextEl: next,
                prevEl: prev,
            },
            pagination: {
                el: pagination,
                clickable: true,
            },
            autoplay: loadedImages.length > 1 ? { delay: 4000 } : false,
        });

        // Init GLightbox for this folder
        // eslint-disable-next-line no-undef
        const lightbox = GLightbox({ selector: `a.glightbox[data-gallery="${folder}"]` });
        glightInstances.push(lightbox);
    }

    return glightInstances;
}

// Helper to check if an image exists by trying to load it
function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            console.log(`Imagen cargada correctamente: ${url}`);
            resolve(true);
        };
        img.onerror = () => {
            console.log(`No se pudo cargar la imagen: ${url}`);
            resolve(false);
        };
        img.src = url;
    });
}

function initializeApp() {
    // Ensure Swiper and GLightbox are loaded before initializing
    function initializeSlidersAndLightboxes() {
        if (typeof Swiper !== 'undefined' && typeof GLightbox !== 'undefined') {
            buildProductSwipers().then(() => {
                // Product swipers are ready
            });
        } else {
            // Retry after a short delay if libraries are not yet loaded
            setTimeout(initializeSlidersAndLightboxes, 50);
        }
    }
    initializeSlidersAndLightboxes();
}

// Kick off building swipers after load
if (document.readyState === 'complete') {
    initializeApp();
} else {
    window.addEventListener('load', initializeApp);
}

// ===== SLIDER DE TESTIMONIOS =====
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialPrevBtn = document.querySelector('.testimonials-controls .prev');
const testimonialNextBtn = document.querySelector('.testimonials-controls .next');
let currentTestimonial = 0;

function showTestimonial(index) {
    testimonialCards.forEach(card => card.classList.remove('active'));
    testimonialCards[index].classList.add('active');
}

if (testimonialPrevBtn) {
    testimonialPrevBtn.addEventListener('click', function() {
        currentTestimonial = currentTestimonial > 0 ? currentTestimonial - 1 : testimonialCards.length - 1;
        showTestimonial(currentTestimonial);
    });
}

if (testimonialNextBtn) {
    testimonialNextBtn.addEventListener('click', function() {
        currentTestimonial = currentTestimonial < testimonialCards.length - 1 ? currentTestimonial + 1 : 0;
        showTestimonial(currentTestimonial);
    });
}

// Auto-slide testimonios cada 7 segundos
setInterval(() => {
    if (testimonialCards.length > 0) {
        currentTestimonial = currentTestimonial < testimonialCards.length - 1 ? currentTestimonial + 1 : 0;
        showTestimonial(currentTestimonial);
    }
}, 7000);

// ===== TABS DEL PROCESO =====
const processTabs = document.querySelectorAll('.process-tab');
const processSteps = document.querySelectorAll('.process-step');

processTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const step = this.getAttribute('data-step');
        
        // Remover clase active de todos los tabs y panels
        processTabs.forEach(t => t.classList.remove('active'));
        processSteps.forEach(s => s.classList.remove('active'));
        
        // Agregar clase active al tab clickeado y su panel correspondiente
        this.classList.add('active');
        document.getElementById(`step-${step}`).classList.add('active');
    });
});


// ===== ANIMACIONES DE SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animaciones
const animatedElements = document.querySelectorAll('.section-header, .category-panel, .testimonial-card, .process-step');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ===== ENLACES DEL FOOTER A CATEGORÍAS =====
const footerCategoryLinks = document.querySelectorAll('a[data-category]');
footerCategoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const category = this.getAttribute('data-category');
        
        // Navegar a la sección de categorías
        const categoriesSection = document.getElementById('categorias');
        const headerHeight = header.offsetHeight;
        const targetPosition = categoriesSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Activar la categoría correspondiente después de un pequeño delay
        setTimeout(() => {
            // Remover clase active de todos los tabs y panels
            categoryTabs.forEach(t => t.classList.remove('active'));
            categoryPanels.forEach(p => p.classList.remove('active'));
            
            // Activar la categoría específica
            const targetTab = document.querySelector(`[data-category="${category}"]`);
            const targetPanel = document.getElementById(category);
            
            if (targetTab && targetPanel) {
                targetTab.classList.add('active');
                targetPanel.classList.add('active');
            }
        }, 800);
    });
});

// ===== LAZY LOADING PARA IMÁGENES =====
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            observer.unobserve(img);
        }
    });
});

images.forEach(img => {
    imageObserver.observe(img);
});

// ===== PRELOADER SIMPLE =====
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Animar elementos del hero
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroCta = document.querySelector('.hero-cta');
    
    if (heroTitle) {
        heroTitle.style.animation = 'fadeInUp 0.8s ease-out 0.2s both';
    }
    if (heroSubtitle) {
        heroSubtitle.style.animation = 'fadeInUp 0.8s ease-out 0.4s both';
    }
    if (heroCta) {
        heroCta.style.animation = 'fadeInUp 0.8s ease-out 0.6s both';
    }
});

// ===== MANEJO DE ERRORES DE IMÁGENES =====
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        // If an image fails to load, hide its parent container if it's an outfit-card
        if (this.classList.contains('outfit-card-img')) {
            const outfitCard = this.closest('.outfit-card');
            if (outfitCard) {
                outfitCard.style.display = 'none';
            }
        }
    });
});

// ===== ANALYTICS Y TRACKING (opcional) =====
// Trackear clics en botones de WhatsApp
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', function() {
        // Aquí se puede agregar código de analytics
        console.log('WhatsApp link clicked:', this.href);
    });
});

// ===== OPTIMIZACIÓN DE RENDIMIENTO =====
// Debounce para eventos de scroll
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(function() {
        // Código adicional de scroll si es necesario
    }, 10);
}, { passive: true });

// ===== ANIMACIONES CSS ADICIONALES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loaded .hero-title,
    .loaded .hero-subtitle,
    .loaded .hero-cta {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// ===== OUTFITS SLIDER (MOBILE ONLY) =====
let outfitsSwiper;
const outfitsSection = document.querySelector('.outfits-new');
const outfitSwiperContainer = outfitsSection.querySelector('.outfit-swiper'); // The main container for Swiper
const outfitCardsContainer = outfitsSection.querySelector('.outfit-cards-container'); // The container for cards
const outfitCards = outfitsSection.querySelectorAll('.outfit-card'); // Individual cards

function initializeOutfitsSwiper() {
    const isMobile = window.innerWidth <= 768; // Define mobile breakpoint

    if (isMobile && !outfitsSwiper) {
        // Add Swiper classes for mobile
        outfitSwiperContainer.classList.add('swiper');
        outfitCardsContainer.classList.add('swiper-wrapper');
        outfitCards.forEach(card => card.classList.add('swiper-slide'));

        // Initialize Swiper only if on mobile and not already initialized
        if (typeof Swiper !== 'undefined') { // Check if Swiper is loaded
            outfitsSwiper = new Swiper(outfitSwiperContainer, { // Target the main container
                loop: true,
                slidesPerView: 1,
                spaceBetween: 20,
                navigation: {
                    nextEl: '.outfit-swiper .swiper-button-next',
                    prevEl: '.outfit-swiper .swiper-button-prev',
                },
                pagination: {
                    el: '.outfit-swiper .swiper-pagination',
                    clickable: true,
                },
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
            });
        } else {
            console.warn('Swiper library not loaded. Cannot initialize Outfits Swiper.');
        }
    } else if (!isMobile && outfitsSwiper) {
        // Destroy Swiper if not on mobile and it's initialized
        outfitsSwiper.destroy(true, true);
        outfitsSwiper = undefined;

        // Remove Swiper classes for desktop
        outfitSwiperContainer.classList.remove('swiper');
        outfitCardsContainer.classList.remove('swiper-wrapper');
        outfitCards.forEach(card => card.classList.remove('swiper-slide'));

        // Explicitly reset desktop styles (though CSS should handle most of this now)
        if (outfitCardsContainer) {
            outfitCardsContainer.style.display = ''; // Let CSS handle it
            outfitCardsContainer.style.gap = ''; // Let CSS handle it
            outfitCards.forEach(card => {
                card.style.width = ''; // Let CSS handle it
                card.style.flexShrink = ''; // Let CSS handle it
                card.style.margin = ''; // Let CSS handle it
            });
        }
    }
}

// Initialize Swiper on load and resize
window.addEventListener('load', initializeOutfitsSwiper);
window.addEventListener('resize', initializeOutfitsSwiper);

// ===== WIDGET DE CONTACTO LATERAL =====
function initializeContactWidget() {
    const tab = document.getElementById('contact-widget-tab');
    const panel = document.getElementById('contact-widget-panel');
    const closeBtn = document.getElementById('contact-widget-close');

    if (!tab || !panel || !closeBtn) {
        // Si los elementos no se han cargado aún, reintenta en un momento.
        setTimeout(initializeContactWidget, 100);
        return;
    }

    const toggleWidget = (show) => {
        const isOpen = panel.classList.contains('open');
        // Si 'show' es un booleano, úsalo; de lo contrario, invierte el estado actual.
        const newState = typeof show === 'boolean' ? show : !isOpen;

        if (newState) {
            panel.classList.add('open');
            tab.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            tab.setAttribute('aria-expanded', 'true');
        } else {
            panel.classList.remove('open');
            tab.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            tab.setAttribute('aria-expanded', 'false');
        }
    };

    // Abrir el panel al hacer clic en la pestaña
    tab.addEventListener('click', () => toggleWidget());
    tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleWidget();
        }
    });

    // Cerrar el panel con el botón de cierre
    closeBtn.addEventListener('click', () => toggleWidget(false));

    // Cerrar el panel al presionar la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            toggleWidget(false);
        }
    });

    // Cerrar al hacer clic fuera del panel
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !tab.contains(e.target) && panel.classList.contains('open')) {
            toggleWidget(false);
        }
    });
}

// Iniciar la lógica del widget una vez que la ventana se haya cargado
window.addEventListener('load', initializeContactWidget);
