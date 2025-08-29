// Blog Animations - Subtle and Clean
// No cursor trails or heavy effects, focused on content

console.log('🎬 [BLOG] Blog animations loaded');

// Initialize blog animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 [BLOG] Initializing blog animations...');

    initBlogAnimations();
    initScrollAnimations();
    initNavigationAnimations();
    initSearchAnimations();
    initMobileMenu();
    initQoderMouseEffect();

    console.log('🎬 [BLOG] Blog animations initialized successfully');
});

// Main blog animations
function initBlogAnimations() {
    // Animate blog header elements
    anime({
        targets: '.blog-main-title',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuad',
        delay: 200
    });

    anime({
        targets: '.blog-subtitle',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 400
    });

    anime({
        targets: '.blog-controls',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 600
    });

    // Animate sidebar widgets with stagger
    anime({
        targets: '.sidebar-widget',
        translateX: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: anime.stagger(100, {start: 800})
    });
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.classList.contains('blog-post-card')) {
                    animatePostCard(element);
                } else if (element.classList.contains('fade-in')) {
                    element.classList.add('visible');
                } else if (element.classList.contains('slide-in-left')) {
                    element.classList.add('visible');
                } else if (element.classList.contains('slide-in-right')) {
                    element.classList.add('visible');
                }
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.blog-post-card, .fade-in, .slide-in-left, .slide-in-right').forEach(el => {
        observer.observe(el);
    });
}

// Animate individual post cards (set opacity to 1 for visibility, but don't animate it)
function animatePostCard(card) {
    // Ensure card is visible
    anime.set(card, { opacity: 1 });

    anime({
        targets: card,
        translateY: [50, 0],
        scale: [0.95, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
    });
}

// Navigation animations
function initNavigationAnimations() {
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    // Navbar scroll behavior
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Search and filter animations
function initSearchAnimations() {
    const searchInput = document.getElementById('blogSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortBy');

    // Search input focus animations
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            anime({
                targets: this.parentElement,
                scale: [1, 1.02],
                duration: 200,
                easing: 'easeOutQuad'
            });
        });

        searchInput.addEventListener('blur', function() {
            anime({
                targets: this.parentElement,
                scale: [1.02, 1],
                duration: 200,
                easing: 'easeOutQuad'
            });
        });

        // Search input typing animation
        searchInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                anime({
                    targets: this.parentElement.querySelector('i'),
                    scale: [1, 1.2, 1],
                    duration: 300,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
        });
    }

    // Filter change animations
    [categoryFilter, sortSelect].forEach(element => {
        if (element) {
            element.addEventListener('change', function() {
                anime({
                    targets: this,
                    scale: [1, 1.05, 1],
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('active');
            
            if (isOpen) {
                // Close menu
                anime({
                    targets: navMenu,
                    opacity: [1, 0],
                    translateY: [0, -20],
                    duration: 300,
                    easing: 'easeInQuad',
                    complete: function() {
                        navMenu.classList.remove('active');
                    }
                });
            } else {
                // Open menu
                navMenu.classList.add('active');
                anime({
                    targets: navMenu,
                    opacity: [0, 1],
                    translateY: [-20, 0],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
            
            // Animate hamburger
            hamburger.classList.toggle('active');
        });
    }
}

// Pagination animations
function animatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (paginationContainer) {
        anime({
            targets: paginationContainer,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad'
        });
    }
}

// Post grid animations
function animatePostGrid() {
    const postCards = document.querySelectorAll('.blog-post-card');
    
    // Reset and animate all cards (set opacity to 1 for visibility, but don't animate it)
    anime.set(postCards, {
        opacity: 1,
        translateY: 50,
        scale: 0.95
    });

    anime({
        targets: postCards,
        translateY: [50, 0],
        scale: [0.95, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .8)',
        delay: anime.stagger(100)
    });
}

// Loading state animations
function showLoadingState() {
    const postsGrid = document.getElementById('postsGrid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="loading-posts">
                <div class="loading-spinner"></div>
                <p>Loading amazing content...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    const loadingPosts = document.querySelector('.loading-posts');
    if (loadingPosts) {
        anime({
            targets: loadingPosts,
            opacity: [1, 0],
            duration: 300,
            easing: 'easeOutQuad',
            complete: function() {
                loadingPosts.remove();
            }
        });
    }
}

// True Qoder-style mouse-following conic gradient border effect
function initQoderMouseEffect() {
    console.log('🎬 [BLOG] Initializing Qoder mouse effect...');

    // Function to add mouse tracking to cards
    function addMouseTracking() {
        const cards = document.querySelectorAll('.blog-post-card');

        cards.forEach(card => {
            // Remove existing listeners to prevent duplicates
            card.removeEventListener('mouseenter', card._qoderMouseEnter);
            card.removeEventListener('mousemove', card._qoderMouseMove);
            card.removeEventListener('mouseleave', card._qoderMouseLeave);

            // Create new event handlers
            card._qoderMouseEnter = function(e) {
                updateBorderGradient(e, card);
            };

            card._qoderMouseMove = function(e) {
                updateBorderGradient(e, card);
            };

            card._qoderMouseLeave = function() {
                // Border effect will deactivate via CSS hover state
            };

            // Add event listeners
            card.addEventListener('mouseenter', card._qoderMouseEnter);
            card.addEventListener('mousemove', card._qoderMouseMove);
            card.addEventListener('mouseleave', card._qoderMouseLeave);
        });
    }

    // Update rounded border gradient position based on mouse coordinates
    function updateBorderGradient(event, card) {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate percentage positions
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // Calculate angle from center to mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);

        // Update CSS custom properties for pseudo-element background
        card.style.setProperty('--mouse-x', `${xPercent}%`);
        card.style.setProperty('--mouse-y', `${yPercent}%`);
        card.style.setProperty('--angle', `${angle}deg`);
    }

    // Initial setup
    addMouseTracking();

    // Re-initialize when new cards are added (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.classList.contains('blog-post-card') || node.querySelector('.blog-post-card'))) {
                        setTimeout(addMouseTracking, 100);
                    }
                });
            }
        });
    });

    const postsGrid = document.getElementById('postsGrid');
    if (postsGrid) {
        observer.observe(postsGrid, { childList: true, subtree: true });
    }
}

// Utility functions for external use
window.BlogAnimations = {
    animatePostGrid,
    animatePagination,
    showLoadingState,
    hideLoadingState,
    animatePostCard,
    initQoderMouseEffect
};

// Add CSS for navbar scroll behavior
const style = document.createElement('style');
style.textContent = `
    .navbar {
        transition: transform 0.3s ease, background-color 0.3s ease;
    }
    
    .navbar.scrolled {
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(20px);
        box-shadow: 0 2px 20px rgba(0, 212, 255, 0.1);
    }
    
    .nav-menu.active {
        display: flex !important;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 1rem;
            border-radius: 0 0 20px 20px;
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-top: none;
            display: none;
        }
        
        .hamburger {
            display: flex;
            flex-direction: column;
            gap: 3px;
            cursor: pointer;
            padding: 5px;
        }
        
        .hamburger span {
            width: 20px;
            height: 2px;
            background: var(--primary-color);
            transition: all 0.3s ease;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(style);
