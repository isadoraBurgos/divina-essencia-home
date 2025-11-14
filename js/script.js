document.addEventListener('DOMContentLoaded', () => {

    const hamburgerBtn = document.querySelector('.a-hamburger-btn');
    const menuList = document.getElementById('menu-list');

    const loginIcon = document.getElementById('login-icon');
    const userDropdown = document.getElementById('user-dropdown-menu');

    const cartIconLink = document.getElementById('cart-icon-link');
    const miniCartOverlay = document.getElementById('mini-cart-overlay');
    const miniCart = document.getElementById('mini-cart');
    const closeCartBtn = document.getElementById('close-cart-btn');

    // -------------------------------------------------------------------
    // A. LÓGICA DO MENU HAMBÚRGUER
    // -------------------------------------------------------------------
    if (hamburgerBtn && menuList) {
        hamburgerBtn.addEventListener('click', () => {
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
            menuList.classList.toggle('is-open');
        });
    }

    // -------------------------------------------------------------------
    // B. LÓGICA DO DROPDOWN DE LOGIN/USUÁRIO
    // -------------------------------------------------------------------
    if (loginIcon && userDropdown) {
        loginIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            userDropdown.classList.toggle('is-active');
            userDropdown.classList.toggle('is-visible'); // MANTÉM is-visible E is-active para compatibilidade
        });

        document.addEventListener('click', (event) => {
            if (!loginIcon.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.remove('is-active');
                userDropdown.classList.remove('is-visible');
            }
        });
        
        userDropdown.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    // -------------------------------------------------------------------
    // C. LÓGICA DO MINI CARRINHO LATERAL
    // -------------------------------------------------------------------
    function closeMiniCart() {
        if (miniCartOverlay && miniCart) {
            miniCartOverlay.classList.remove('is-open');
            miniCart.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    }

    if (cartIconLink && miniCartOverlay && closeCartBtn && miniCart) {
        cartIconLink.addEventListener('click', (e) => {
            e.preventDefault();
            miniCartOverlay.classList.add('is-open');
            miniCart.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });

        closeCartBtn.addEventListener('click', closeMiniCart);

        miniCartOverlay.addEventListener('click', (event) => {
            if (event.target.id === 'mini-cart-overlay') {
                closeMiniCart();
            }
        });
    }

    // -------------------------------------------------------------------
    // D. LÓGICA UNIVERSAL DO CARROSSEL DE PRODUTOS/LINHAS (Sem Loop)
    // -------------------------------------------------------------------
    function initializeCarousel(carouselId) {
        const carouselView = document.getElementById(carouselId);
        if (!carouselView) return; 

        const slideContainer = carouselView.querySelector('.m-product-row, .m-category-row');
        const slides = slideContainer ? slideContainer.children : [];
        const indicatorsContainer = carouselView.querySelector('.m-carousel-indicators');
        const prevBtn = carouselView.querySelector('.a-carousel-control--prev');
        const nextBtn = carouselView.querySelector('.a-carousel-control--next');

        if (slides.length === 0 || !slideContainer || !indicatorsContainer) return;

        let currentIndex = 0; 
        let cardsPerView = 0; 
        let maxSlides = 0; 
        let cardWithGap = 0;

        function calculateCardsPerView() {
            if (slides.length === 0) return;

            const slideWidth = slides[0].offsetWidth;
            const style = window.getComputedStyle(slideContainer);
            const gap = parseInt(style.getPropertyValue('gap')) || 20; 
            cardWithGap = slideWidth + gap;

            cardsPerView = Math.floor(carouselView.offsetWidth / cardWithGap) || 1;
            maxSlides = Math.ceil(slides.length / cardsPerView) - 1;
            if (maxSlides < 0) maxSlides = 0; 
        }
        
        function createIndicators() {
            indicatorsContainer.innerHTML = '';
            
            for (let i = 0; i <= maxSlides; i++) {
                const button = document.createElement('button');
                button.classList.add('a-indicator');
                if (i === currentIndex) {
                    button.classList.add('a-indicator--active');
                }
                button.dataset.slideTo = i;
                button.setAttribute('aria-label', `Ir para slide ${i + 1}`);
                indicatorsContainer.appendChild(button);
            }
            
            indicatorsContainer.querySelectorAll('.a-indicator').forEach(indicator => {
                indicator.addEventListener('click', (event) => {
                    const targetButton = event.target.closest('.a-indicator');
                    if (targetButton) {
                        currentIndex = parseInt(targetButton.dataset.slideTo);
                        updateCarouselPosition();
                    }
                });
            });

            const controlsDisplay = maxSlides > 0 ? '' : 'none';
            if (prevBtn) prevBtn.style.display = controlsDisplay;
            if (nextBtn) nextBtn.style.display = controlsDisplay;
            indicatorsContainer.style.display = maxSlides > 0 ? 'flex' : 'none';
        }

        function updateCarouselPosition() {
            if (currentIndex < 0) {
                currentIndex = 0;
            }
            if (currentIndex > maxSlides) {
                currentIndex = maxSlides;
            }

            let offset;
            
            if (currentIndex === maxSlides && maxSlides > 0) {
                 const maxScroll = slideContainer.scrollWidth - carouselView.clientWidth;
                 offset = maxScroll > 0 ? maxScroll : 0;
            } else {
                 offset = currentIndex * cardsPerView * cardWithGap;
            }
            
            slideContainer.style.transform = `translateX(-${offset}px)`;
            
            indicatorsContainer.querySelectorAll('.a-indicator').forEach((indicator, index) => {
                indicator.classList.toggle('a-indicator--active', index === currentIndex);
            });

            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex === maxSlides;
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex--;
                updateCarouselPosition();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex++;
                updateCarouselPosition();
            });
        }

        function initializeAndListen() {
            calculateCardsPerView();
            createIndicators();
            updateCarouselPosition();
        }

        initializeAndListen();
        window.addEventListener('resize', initializeAndListen);
    }

    initializeCarousel('carousel-destaques');
    initializeCarousel('carousel-linhas');
    initializeCarousel('carousel-novidades');

    // -------------------------------------------------------------------
    // E. LÓGICA DO CARROSSEL DE TEXTO SOBRE NÓS
    // -------------------------------------------------------------------
    function initializeAboutCarousel(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const slides = section.querySelectorAll('.a-about-slide');
        const indicatorsContainer = section.querySelector('#about-indicators');
        const indicators = indicatorsContainer ? indicatorsContainer.querySelectorAll('.a-indicator') : [];

        if (slides.length <= 1) return;
        
        let currentSlideIndex = 0;

        function updateAboutSlide() {
            slides.forEach((slide, index) => {
                slide.classList.toggle('a-about-slide--active', index === currentSlideIndex);
            });

            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('a-indicator--active', index === currentSlideIndex);
            });
        }

        indicators.forEach(indicator => {
            indicator.addEventListener('click', (event) => {
                const targetButton = event.target.closest('.a-indicator');
                if (targetButton && targetButton.dataset.slideTo) {
                    currentSlideIndex = parseInt(targetButton.dataset.slideTo);
                    updateAboutSlide();
                }
            });
        });

        updateAboutSlide();
    }

    initializeAboutCarousel('about-carousel-section');
    
    // -------------------------------------------------------------------
    // F. LÓGICA PARA ALTERNAR VISIBILIDADE DA SENHA
    // -------------------------------------------------------------------
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const passwordInput = document.getElementById(targetId);

            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            }
        });
    });

    // -------------------------------------------------------------------
    // G. POPULAR SELECTS DE DATA DE NASCIMENTO
    // -------------------------------------------------------------------
    const diaSelect = document.getElementById('dia');
    const mesSelect = document.getElementById('mes');
    const anoSelect = document.getElementById('ano');

    if (diaSelect && mesSelect && anoSelect) {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i.toString().padStart(2, '0');
            option.textContent = i.toString().padStart(2, '0');
            diaSelect.appendChild(option);
        }

        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        meses.forEach((mes, index) => {
            const option = document.createElement('option');
            option.value = (index + 1).toString().padStart(2, '0');
            option.textContent = mes;
            mesSelect.appendChild(option);
        });

        const anoAtual = new Date().getFullYear();
        for (let i = anoAtual; i >= anoAtual - 100; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            anoSelect.appendChild(option);
        }
    }
    
    // -------------------------------------------------------------------
    // H. LÓGICA DE QUANTIDADE DE PRODUTOS (Página de Detalhes)
    // -------------------------------------------------------------------
    const quantityInput = document.getElementById('product-quantity-input');
    const minusButton = document.querySelector('.a-qty-btn--minus');
    const plusButton = document.querySelector('.a-qty-btn--plus');
    
    if (quantityInput && minusButton && plusButton) {
        function updateQuantity(amount) {
            let currentValue = parseInt(quantityInput.value) || 1;
            let newValue = currentValue + amount;
            
            if (newValue < 1) {
                newValue = 1;
            }
            
            quantityInput.value = newValue;
        }

        minusButton.addEventListener('click', () => {
            updateQuantity(-1);
        });

        plusButton.addEventListener('click', () => {
            updateQuantity(1);
        });
        
        quantityInput.addEventListener('change', () => {
            let currentValue = parseInt(quantityInput.value);
            if (isNaN(currentValue) || currentValue < 1) {
                quantityInput.value = 1;
            }
        });
    }
});