// Modern Animations with Anime.js

// IMMEDIATE TEST - This should show in console if file loads
console.log('🔥 [IMMEDIATE TEST] modern-animations.js file loaded successfully!');
console.log('🔥 [IMMEDIATE TEST] Timestamp:', new Date().toISOString());
console.log('🔥 [IMMEDIATE TEST] Document readyState:', document.readyState);
console.log('🔥 [IMMEDIATE TEST] Anime.js available:', typeof anime !== 'undefined');

// Remove this DOMContentLoaded listener to prevent conflicts
// All animations are now initialized through initMainAnimations() after preloader

// Preloader Animation
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const loadingProgress = document.querySelector('.loading-progress');
    const logoText = document.querySelector('.logo-text');
    const logoSubtitle = document.querySelector('.logo-subtitle');
    const loadingText = document.querySelector('.loading-text');

    // Animate logo entrance
    anime({
        targets: logoText,
        scale: [0, 1],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .8)',
        delay: 300
    });

    anime({
        targets: logoSubtitle,
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 800
    });

    // Loading bar animation
    anime({
        targets: loadingProgress,
        width: '100%',
        duration: 2000,
        easing: 'easeInOutQuad',
        delay: 1000,
        complete: function() {
            // Hide preloader after loading
            setTimeout(() => {
                anime({
                    targets: preloader,
                    opacity: 0,
                    duration: 500,
                    easing: 'easeOutQuad',
                    complete: function() {
                        preloader.style.display = 'none';
                        document.body.classList.add('loaded');
                        initHeroAnimations();
                    }
                });
            }, 500);
        }
    });

    // Loading text animation
    anime({
        targets: loadingText,
        opacity: [0.5, 1, 0.5],
        duration: 1500,
        easing: 'easeInOutSine',
        loop: true,
        delay: 1200
    });
}

// Hero Section Animations
function initHeroAnimations() {
    console.log('🎬 [HERO] Initializing hero animations...');

    // Check if hero animations already initialized OR completed
    if (document.body.hasAttribute('data-hero-animations-initialized') ||
        document.body.hasAttribute('data-hero-animations-completed')) {
        console.log('🎬 [HERO] ❌ Hero animations already initialized or completed, skipping...');
        return;
    }

    // Mark as started (not completed yet)
    document.body.setAttribute('data-hero-animations-initialized', 'true');
    console.log('🎬 [HERO] ✅ Marked hero animations as started');

    // Check if elements exist
    const greetingText = document.querySelector('.greeting-text');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroButtons = document.querySelectorAll('.hero-actions .btn-primary, .hero-actions .btn-secondary');
    const socialLinks = document.querySelectorAll('.social-link');
    const profileImage = document.querySelector('.profile-image');

    console.log('🎬 [HERO] Element check:');
    console.log('🎬 [HERO] - Greeting text:', !!greetingText);
    console.log('🎬 [HERO] - Hero title:', !!heroTitle);
    console.log('🎬 [HERO] - Hero description:', !!heroDescription);
    console.log('🎬 [HERO] - Hero buttons:', heroButtons.length);
    console.log('🎬 [HERO] - Social links:', socialLinks.length);
    console.log('🎬 [HERO] - Profile image:', !!profileImage);

    // Reset any existing transforms to prevent conflicts
    anime.set(['.greeting-text', '.hero-title', '.hero-description', '.hero-actions .btn-primary', '.hero-actions .btn-secondary', '.social-link', '.profile-image', '.scroll-indicator'], {
        translateY: 0,
        translateX: 0,
        scale: 1,
        opacity: 0
    });

    console.log('🎬 [HERO] Initial state set - all elements should be hidden');

    // Animate hero text elements (excluding name elements to prevent double animation)
    console.log('🎬 [HERO] Starting greeting text animation');
    anime({
        targets: '.greeting-text',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 200,
        complete: function() {
            console.log('🎬 [HERO] ✅ Greeting text animation completed');
        }
    });

    console.log('🎬 [HERO] Starting hero title animation');
    anime({
        targets: '.hero-title',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 400,
        complete: function() {
            console.log('🎬 [HERO] ✅ Hero title animation completed');
        }
    });

    console.log('🎬 [HERO] Starting hero description animation');
    anime({
        targets: '.hero-description',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 600,
        complete: function() {
            console.log('🎬 [HERO] ✅ Hero description animation completed');
        }
    });

    console.log('🎬 [HERO] Starting hero buttons animation');
    anime({
        targets: '.hero-actions .btn-primary, .hero-actions .btn-secondary',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: anime.stagger(100, {start: 800}),
        complete: function() {
            console.log('🎬 [HERO] ✅ Hero buttons animation completed');
            // Initialize CTA pulse effects after buttons are visible
            setTimeout(() => {
                initCTAPulseEffects();
            }, 500);
        }
    });

    console.log('🎬 [HERO] Starting social links animation');
    anime({
        targets: '.social-link',
        scale: [0, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutBack(1.7)',
        delay: anime.stagger(100, {start: 1000}),
        complete: function() {
            console.log('🎬 [HERO] ✅ Social links animation completed');
        }
    });

    // Profile image animation
    console.log('🎬 [HERO] Starting profile image animation');
    anime({
        targets: '.profile-image',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutElastic(1, .8)',
        delay: 400,
        complete: function() {
            console.log('🎬 [HERO] ✅ Profile image animation completed');
            // Initialize profile image scroll rotation after entrance animation
            initProfileImageScrollRotation();
        }
    });

    // Scroll indicator animation
    anime({
        targets: '.scroll-indicator',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 1200,
        complete: function() {
            console.log('🎬 [HERO] ✅ Scroll indicator animation completed');
            // Mark hero animations as fully completed
            document.body.setAttribute('data-hero-animations-completed', 'true');
            console.log('🎬 [HERO] 🎉 ALL HERO ANIMATIONS COMPLETED!');
        }
    });

    console.log('🎬 [HERO] ✅ Hero animations initialized successfully');
}

// Typing Animation for Dynamic Title (Fixed)
function initTypingAnimation() {
    console.log('⌨️ [TYPING] Initializing typing animation...');

    // Check if typing animation already initialized
    if (document.body.hasAttribute('data-typing-animation-initialized')) {
        console.log('⌨️ [TYPING] ❌ Typing animation already initialized, skipping...');
        return;
    }

    const dynamicTitle = document.getElementById('dynamic-title');
    if (!dynamicTitle) {
        console.log('⌨️ [TYPING] ❌ Dynamic title element not found');
        return;
    }

    // Mark as initialized
    document.body.setAttribute('data-typing-animation-initialized', 'true');
    console.log('⌨️ [TYPING] ✅ Marked typing animation as initialized');

    const titles = [
        'Sales Strategist',
        'Problem Solver',
        'AI Enthusiast',
        'Web Developer',
        'Automation Expert',
        'Virtual Assistant',
        'Creative Professional'
    ];

    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typingTimeout = null;

    function typeText() {
        // Check if we should stop (in case of cleanup)
        if (!document.body.hasAttribute('data-typing-animation-initialized')) {
            return;
        }

        const fullText = titles[currentIndex];

        if (isDeleting) {
            currentText = fullText.substring(0, currentText.length - 1);
        } else {
            currentText = fullText.substring(0, currentText.length + 1);
        }

        if (dynamicTitle) {
            dynamicTitle.textContent = currentText;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && currentText === fullText) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % titles.length;
            typeSpeed = 500; // Pause before next word
        }

        typingTimeout = setTimeout(typeText, typeSpeed);
    }

    // Start typing animation after preloader
    setTimeout(() => {
        console.log('⌨️ [TYPING] ✅ Starting typing animation');
        typeText();
    }, 1500);
}

// Profile Image Scroll Rotation Enhancement
function initProfileImageScrollRotation() {
    const profileImage = document.querySelector('.profile-image');
    if (!profileImage) {
        console.log('🎬 [PROFILE] Profile image not found for scroll rotation');
        return;
    }

    console.log('🎬 [PROFILE] Initializing profile image scroll rotation...');

    let lastScrollY = window.pageYOffset;
    let ticking = false;

    function updateProfileRotation() {
        const scrollY = window.pageYOffset;
        const scrollDelta = scrollY - lastScrollY;

        // Calculate rotation based on scroll position and direction
        const maxRotation = 15; // Maximum rotation in degrees
        const scrollSensitivity = 0.1;

        // Get current rotation or start from 0
        const currentTransform = profileImage.style.transform || '';
        const currentRotation = currentTransform.match(/rotateZ?\(([^)]+)deg\)/)
            ? parseFloat(currentTransform.match(/rotateZ?\(([^)]+)deg\)/)[1])
            : 0;

        // Calculate new rotation with smooth damping
        let newRotation = currentRotation + (scrollDelta * scrollSensitivity);

        // Apply limits and damping
        newRotation = Math.max(-maxRotation, Math.min(maxRotation, newRotation));

        // Apply subtle damping when not scrolling
        if (Math.abs(scrollDelta) < 1) {
            newRotation *= 0.95; // Gradually return to center
        }

        // Apply the rotation with smooth transition
        anime({
            targets: profileImage,
            rotate: newRotation,
            duration: 300,
            easing: 'easeOutQuad'
        });

        lastScrollY = scrollY;
        ticking = false;
    }

    function requestRotationUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateProfileRotation);
            ticking = true;
        }
    }

    // Throttled scroll listener for smooth performance
    window.addEventListener('scroll', requestRotationUpdate, { passive: true });

    console.log('🎬 [PROFILE] ✅ Profile image scroll rotation initialized');
}

// Enhanced Floating Icons with Mouse Influence and Orbital Motion
function initFloatingIcons() {
    const floatingIcons = document.querySelectorAll('.floating-icon');
    const profileContainer = document.querySelector('.profile-container');

    if (!floatingIcons.length || !profileContainer) {
        console.log('🎬 [FLOATING] Floating icons or profile container not found');
        return;
    }

    console.log('🎬 [FLOATING] Initializing enhanced floating icons...');

    // Initial entrance animation
    anime({
        targets: '.floating-icon',
        translateY: [20, 0],
        opacity: [0, 1],
        scale: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .8)',
        delay: anime.stagger(200, {start: 2000}),
        complete: function() {
            console.log('🎬 [FLOATING] ✅ Entrance animation completed, starting orbital motion');
            initFloatingIconsOrbit();
        }
    });
}

function initFloatingIconsOrbit() {
    const floatingIcons = document.querySelectorAll('.floating-icon');
    const profileContainer = document.querySelector('.profile-container');

    if (!floatingIcons.length || !profileContainer) return;

    let mouseX = 0.5;
    let mouseY = 0.5;
    let isMouseInside = false;

    // Set up orbital positions for each icon
    floatingIcons.forEach((icon, index) => {
        const angle = (index / floatingIcons.length) * Math.PI * 2;
        const radius = 120; // Base orbital radius

        // Store initial orbital data
        icon.dataset.angle = angle;
        icon.dataset.baseRadius = radius;
        icon.dataset.index = index;
    });

    // Mouse tracking for the profile container
    profileContainer.addEventListener('mouseenter', () => {
        isMouseInside = true;
        console.log('🎬 [FLOATING] Mouse entered profile area');
    });

    profileContainer.addEventListener('mouseleave', () => {
        isMouseInside = false;
        console.log('🎬 [FLOATING] Mouse left profile area');
    });

    profileContainer.addEventListener('mousemove', (e) => {
        if (!isMouseInside) return;

        const rect = profileContainer.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
    });

    // Continuous orbital animation with mouse influence
    function animateOrbit() {
        const time = Date.now() * 0.001; // Convert to seconds

        floatingIcons.forEach((icon, index) => {
            const baseAngle = parseFloat(icon.dataset.angle);
            const baseRadius = parseFloat(icon.dataset.baseRadius);

            // Orbital motion (slow rotation)
            const orbitSpeed = 0.3 + (index * 0.1); // Different speeds for each icon
            const currentAngle = baseAngle + (time * orbitSpeed);

            // Mouse influence
            let radius = baseRadius;
            let mouseInfluenceX = 0;
            let mouseInfluenceY = 0;

            if (isMouseInside) {
                // Icons are attracted to mouse but maintain orbital motion
                const attractionStrength = 30;
                mouseInfluenceX = (mouseX - 0.5) * attractionStrength;
                mouseInfluenceY = (mouseY - 0.5) * attractionStrength;

                // Slightly increase orbit radius when mouse is present
                radius = baseRadius + 20;
            }

            // Calculate final position
            const x = Math.cos(currentAngle) * radius + mouseInfluenceX;
            const y = Math.sin(currentAngle) * radius + mouseInfluenceY;

            // Apply smooth transform
            anime({
                targets: icon,
                translateX: x,
                translateY: y,
                rotate: currentAngle * 20, // Subtle rotation based on orbital position
                duration: 1000,
                easing: 'easeOutQuad'
            });
        });

        requestAnimationFrame(animateOrbit);
    }

    // Start the orbital animation
    animateOrbit();
    console.log('🎬 [FLOATING] ✅ Orbital motion with mouse influence started');
}

// Call-to-Action Pulse Effects for Important Buttons
function initCTAPulseEffects() {
    const ctaButtons = document.querySelectorAll('.btn-primary, .hero-actions .btn-secondary');

    if (!ctaButtons.length) {
        console.log('🎬 [CTA] No CTA buttons found for pulse effects');
        return;
    }

    console.log('🎬 [CTA] Initializing pulse effects for', ctaButtons.length, 'buttons...');

    ctaButtons.forEach((button, index) => {
        // Add pulse effect class for CSS styling
        button.classList.add('cta-pulse-enabled');

        // Create pulse ring element
        const pulseRing = document.createElement('div');
        pulseRing.className = 'pulse-ring';
        pulseRing.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            border: 2px solid var(--accent-color);
            border-radius: inherit;
            transform: translate(-50%, -50%);
            opacity: 0;
            pointer-events: none;
            z-index: -1;
        `;

        // Ensure button has relative positioning
        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }

        button.appendChild(pulseRing);

        // Continuous pulse animation with staggered timing
        function startPulse() {
            anime({
                targets: pulseRing,
                scale: [1, 1.5],
                opacity: [0.7, 0],
                duration: 2000,
                easing: 'easeOutQuad',
                complete: function() {
                    // Restart pulse with random delay for natural feel
                    setTimeout(startPulse, 1000 + Math.random() * 2000);
                }
            });
        }

        // Start pulse with staggered delay
        setTimeout(startPulse, 3000 + (index * 500));

        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            // Stop current pulse and start hover effect
            anime.remove(pulseRing);

            anime({
                targets: pulseRing,
                scale: [1, 1.2],
                opacity: [0, 0.3, 0],
                duration: 600,
                easing: 'easeOutElastic(1, .8)'
            });

            // Button lift effect
            anime({
                targets: button,
                translateY: -3,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        button.addEventListener('mouseleave', function() {
            // Reset button position
            anime({
                targets: button,
                translateY: 0,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });

            // Resume pulse after a short delay
            setTimeout(startPulse, 500);
        });

        // Click effect
        button.addEventListener('click', function() {
            // Create click ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 1;
            `;

            button.appendChild(ripple);

            anime({
                targets: ripple,
                width: '200%',
                height: '200%',
                opacity: [1, 0],
                duration: 600,
                easing: 'easeOutQuad',
                complete: function() {
                    ripple.remove();
                }
            });
        });
    });

    console.log('🎬 [CTA] ✅ Pulse effects initialized for all CTA buttons');
}

// Particles Animation
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
        `;
        particlesContainer.appendChild(particle);
    }
    
    // Animate particles
    anime({
        targets: '.particle',
        translateX: function() {
            return anime.random(-window.innerWidth, window.innerWidth);
        },
        translateY: function() {
            return anime.random(-window.innerHeight, window.innerHeight);
        },
        scale: function() {
            return anime.random(0.5, 2);
        },
        opacity: function() {
            return anime.random(0.2, 0.8);
        },
        duration: function() {
            return anime.random(10000, 20000);
        },
        easing: 'linear',
        loop: true,
        direction: 'alternate'
    });
}

// Navigation Animations
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
        }
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    // Scroll indicator click
    document.querySelector('.scroll-indicator').addEventListener('click', function() {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
    
    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-background');
        const speed = scrolled * 0.5;
        
        if (parallax) {
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
}

// Button Hover Animations
document.addEventListener('DOMContentLoaded', function() {
    // Primary button hover effect
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        btn.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // Social links hover effect
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.1,
                rotate: '5deg',
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        link.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                rotate: '0deg',
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Card Animations
function initCardAnimations() {
    // Animate cards on scroll with state management
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const sectionId = section.id || section.className;

                // Check if section has already been animated
                if (section.hasAttribute('data-cards-animated')) {
                    console.log(`🎬 [CARDS] Section ${sectionId} already animated, skipping`);
                    return;
                }

                console.log(`🎬 [CARDS] Starting animation for section: ${sectionId}`);
                section.setAttribute('data-animation-state', 'animating');

                const cards = section.querySelectorAll('.neon-card');

                if (cards.length === 0) {
                    console.log(`🎬 [CARDS] No cards found in section ${sectionId}`);
                    // Still animate titles if no cards
                    animateSectionTitles(section);
                    section.setAttribute('data-cards-animated', 'true');
                    section.setAttribute('data-animation-state', 'completed');
                    cardObserver.unobserve(entry.target);
                    return;
                }

                // Smooth scroll-reveal animation: fade-in + slide-up
                // Mobile-optimized for 60 FPS performance
                const isMobile = window.innerWidth <= 768;

                anime({
                    targets: cards,
                    translateY: [isMobile ? 30 : 40, 0], // Reduced distance on mobile for better performance
                    opacity: [0, 1],
                    duration: isMobile ? 800 : 1000, // Slightly faster on mobile
                    easing: 'cubicBezier(0.4, 0, 0.2, 1)', // Smooth easing as requested
                    delay: anime.stagger(isMobile ? 150 : 200), // Slightly faster stagger on mobile
                    complete: function() {
                        console.log(`🎬 [CARDS] Cards animation completed for section: ${sectionId}`);

                        // Mark section as animated
                        section.setAttribute('data-cards-animated', 'true');
                        section.setAttribute('data-animation-state', 'completed');

                        // Initialize hover effects for cards after entrance animation completes
                        setTimeout(() => {
                            initCardHoverEffectsForSection(section);
                        }, 100);
                    }
                });

                // Animate section titles
                animateSectionTitles(section);

                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    // Helper function to animate section titles
    function animateSectionTitles(section) {
        // Animate section title
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
            anime({
                targets: sectionTitle,
                translateY: [30, 0],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutQuad'
            });
        }

        // Animate section subtitle
        const sectionSubtitle = section.querySelector('.section-subtitle');
        if (sectionSubtitle) {
            anime({
                targets: sectionSubtitle,
                translateY: [20, 0],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutQuad',
                delay: 200
            });
        }
    }

    // Check for cards visible on page load and skip animation for them
    function handleCardsVisibleOnLoad() {
        const viewportHeight = window.innerHeight;

        document.querySelectorAll('.section-container').forEach(section => {
            const sectionRect = section.getBoundingClientRect();

            // If section is in viewport on page load (top is above viewport bottom)
            if (sectionRect.top < viewportHeight && sectionRect.bottom > 0) {
                const cards = section.querySelectorAll('.neon-card');

                cards.forEach(card => {
                    const cardRect = card.getBoundingClientRect();

                    // If card is visible on page load, skip animation
                    if (cardRect.top < viewportHeight && cardRect.bottom > 0) {
                        card.classList.add('no-animation');
                        console.log(`🎬 [CARDS] Card visible on load, skipping animation`);
                    }
                });

                // If all cards in section are visible, mark section as animated
                const visibleCards = section.querySelectorAll('.neon-card.no-animation');
                const allCards = section.querySelectorAll('.neon-card');

                if (visibleCards.length === allCards.length && allCards.length > 0) {
                    section.setAttribute('data-cards-animated', 'true');
                    section.setAttribute('data-animation-state', 'completed');
                    console.log(`🎬 [CARDS] All cards in section visible on load, marking as animated`);

                    // Initialize hover effects immediately for visible cards
                    initCardHoverEffectsForSection(section);
                }
            }
        });
    }

    // Run on page load
    handleCardsVisibleOnLoad();

    // Observe all section containers
    document.querySelectorAll('.section-container').forEach(section => {
        cardObserver.observe(section);
    });
}

// Card Hover Effects - Section-specific initialization
function initCardHoverEffectsForSection(section) {
    const sectionId = section.id || section.className;
    const cards = section.querySelectorAll('.neon-card');

    console.log(`🎬 [CARDS] Initializing hover effects for ${cards.length} cards in section: ${sectionId}`);

    cards.forEach(card => {
        // Skip if already has hover effects
        if (card.hasAttribute('data-hover-initialized')) {
            return;
        }

        // Add class to exclude from magnetic system
        card.classList.add('card-hover-enabled');

        card.addEventListener('mouseenter', function() {
            // Add hover class for CSS transitions
            this.classList.add('card-hover');

            // Animate the card lift
            anime({
                targets: this,
                translateY: [0, -15],
                duration: 400,
                easing: 'easeOutQuad'
            });
        });

        // Add mobile-specific scroll handling to prevent scroll trapping
        if (window.innerWidth <= 768) {
            card.addEventListener('wheel', function(e) {
                const scrollableContent = this.querySelector('.scrollable-content');
                if (scrollableContent) {
                    const isAtTop = scrollableContent.scrollTop === 0;
                    const isAtBottom = scrollableContent.scrollTop + scrollableContent.clientHeight >= scrollableContent.scrollHeight;

                    // Allow parent scroll when at boundaries
                    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
                        // Don't prevent default - allow parent scroll
                        return;
                    }

                    // Only prevent default if we're scrolling within the card content
                    if (!isAtTop && !isAtBottom) {
                        e.stopPropagation();
                    }
                }
            }, { passive: false });
        }

        card.addEventListener('mouseleave', function() {
            // Remove hover class
            this.classList.remove('card-hover');

            // Reset the card position
            anime({
                targets: this,
                translateY: [-15, 0],
                duration: 400,
                easing: 'easeOutQuad'
            });
        });

        card.setAttribute('data-hover-initialized', 'true');
    });

    console.log(`🎬 [CARDS] Hover effects initialized for section: ${sectionId}`);
}

// Legacy Card Hover Effects - for backwards compatibility
function initCardHoverEffects() {
    // This function is now handled by initCardHoverEffectsForSection
    // Called after entrance animations complete
    console.log('🎬 [CARDS] Legacy initCardHoverEffects called - using section-specific initialization instead');
}

// Skill Tag Animations
function initSkillTagAnimations() {
    const skillObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillTags = entry.target.querySelectorAll('.skill-tag');

                anime({
                    targets: skillTags,
                    scale: [0, 1],
                    opacity: [0, 1],
                    duration: 400,
                    easing: 'easeOutBack(1.7)',
                    delay: anime.stagger(50)
                });

                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.skill-tags').forEach(container => {
        skillObserver.observe(container);
    });
}

// Language Progress Bar Animations
function initLanguageProgressAnimations() {
    const languageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBars = entry.target.querySelectorAll('.language-progress');

                progressBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';

                    anime({
                        targets: bar,
                        width: width,
                        duration: 1500,
                        easing: 'easeOutQuad',
                        delay: 500
                    });
                });

                languageObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.language-skills').forEach(container => {
        languageObserver.observe(container);
    });
}

// Timeline Animations
function initTimelineAnimations() {
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const timelineItems = entry.target.querySelectorAll('.timeline-item');

                anime({
                    targets: timelineItems,
                    translateX: [-30, 0],
                    opacity: [0, 1],
                    duration: 600,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(200)
                });

                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.education-timeline').forEach(timeline => {
        timelineObserver.observe(timeline);
    });
}

// Enhanced Evolution Section Animations - Sequential Stage Animation with Navigation
function initEvolutionAnimations() {
    const stages = document.querySelectorAll('.evolution-stage');
    const navDots = document.querySelectorAll('.nav-dot');
    const navProgress = document.querySelector('.nav-progress');

    // Create individual observers for each stage
    stages.forEach((stage, index) => {
        const stageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    // Mark as animated to prevent re-triggering
                    entry.target.classList.add('animated');

                    // Animate the stage entrance
                    animateStageEntrance(entry.target, index);

                    // Update navigation
                    updateEvolutionNavigation(index);

                    // Unobserve this stage
                    stageObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: window.innerWidth <= 768 ? 0.1 : 0.3, // Lower threshold for mobile
            rootMargin: window.innerWidth <= 768 ? '0px 0px -20px 0px' : '0px 0px -50px 0px'
        });

        stageObserver.observe(stage);
    });

    // Initialize scroll-based navigation tracking
    initEvolutionScrollTracking();

    // Removed legacy stage click handler to avoid double-toggle
    // Expansion is handled exclusively in initInteractiveEvolution()
    // initializeStageClickHandlers();
}

// Enhanced stage entrance with state management
function animateStageEntrance(stage, index) {
    // Check if already animated to prevent conflicts
    if (stage.hasAttribute('data-animated') || stage.hasAttribute('data-animation-state')) {
        console.log(`🎬 [EVOLUTION] Stage ${index + 1} already animated, skipping`);
        return;
    }

    console.log(`🎬 [EVOLUTION] Animating stage ${index + 1}`);

    // Mark animation state
    stage.setAttribute('data-animated', 'true');
    stage.setAttribute('data-animation-state', 'animating');

    // Add the animate-in class for CSS transitions
    stage.classList.add('animate-in');

    // Mobile-optimized animation settings
    const isMobile = window.innerWidth <= 768;
    const duration = isMobile ? 400 : 800; // Faster on mobile
    const easing = isMobile ? 'easeOutQuad' : 'easeOutElastic(1, .8)'; // Simpler easing on mobile

    // Animate stage container entrance
    anime({
        targets: stage.querySelector('.stage-container'),
        translateY: [50, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: duration,
        easing: easing,
        complete: function() {
            // Mark entrance animation as completed
            stage.setAttribute('data-animation-state', 'entrance-completed');

            // After container animates, animate internal components
            animateStageComponents(stage, index);
        }
    });
}

// Enhanced stage components animation with completion tracking
function animateStageComponents(stage, index) {
    // Animate stage icon
    anime({
        targets: stage.querySelector('.stage-icon'),
        scale: [0, 1],
        rotate: [180, 0],
        duration: 600,
        easing: 'easeOutElastic(1, .8)',
        delay: 200
    });

    // Animate company card
    anime({
        targets: stage.querySelector('.company-card'),
        translateX: [-30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        delay: 400
    });

    // Animate skill nodes
    const skillNodes = stage.querySelectorAll('.skill-node');
    if (skillNodes.length > 0) {
        anime({
            targets: skillNodes,
            scale: [0, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutBack(1.7)',
            delay: anime.stagger(100, {start: 600})
        });
    }

    // Animate transformation arrow
    const transformationArrow = stage.querySelector('.transformation-arrow');
    if (transformationArrow) {
        anime({
            targets: transformationArrow,
            opacity: [0, 1],
            scaleX: [0, 1],
            duration: 700,
            easing: 'easeOutQuad',
            delay: 1000
        });
    }

    // Animate stage meta information with completion callback
    anime({
        targets: stage.querySelectorAll('.stage-year, .stage-title'),
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad',
        delay: anime.stagger(100, {start: 300}),
        complete: function() {
            // Mark all animations as completed
            stage.setAttribute('data-animation-state', 'completed');

            // Initialize hover effects now that entrance is complete
            initializeStageHoverEffects(stage, index);

            console.log(`🎬 [EVOLUTION] Stage ${index + 1} fully animated and ready for interactions`);
        }
    });
}

// Non-conflicting hover effects for evolution stages
function initializeStageHoverEffects(stage, index) {
    // Only initialize if animation is completed
    if (stage.getAttribute('data-animation-state') !== 'completed') {
        console.log(`🎬 [EVOLUTION] Delaying hover effects for stage ${index + 1} - animation not completed`);
        return;
    }

    // Remove from magnetic system to prevent conflicts
    stage.classList.remove('magnetic');

    // Add custom hover class for identification
    stage.classList.add('evolution-hover-enabled');

    console.log(`🎬 [EVOLUTION] Initializing hover effects for stage ${index + 1}`);

    // Subtle hover effects that don't conflict with entrance animations
    stage.addEventListener('mouseenter', function() {
        // Only apply hover if not currently animating
        if (stage.getAttribute('data-animation-state') === 'completed') {
            // Subtle glow effect
            anime({
                targets: stage,
                '--stage-glow': [0, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });

            // Subtle scale on company card only
            const companyCard = stage.querySelector('.company-card');
            if (companyCard) {
                anime({
                    targets: companyCard,
                    scale: [1, 1.05],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }

            // Enhance skill nodes
            const skillNodes = stage.querySelectorAll('.skill-node');
            if (skillNodes.length > 0) {
                anime({
                    targets: skillNodes,
                    scale: [1, 1.1],
                    duration: 200,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(50)
                });
            }
        }
    });

    stage.addEventListener('mouseleave', function() {
        // Reset hover effects
        if (stage.getAttribute('data-animation-state') === 'completed') {
            // Remove glow
            anime({
                targets: stage,
                '--stage-glow': [1, 0],
                duration: 400,
                easing: 'easeOutQuad'
            });

            // Reset company card scale
            const companyCard = stage.querySelector('.company-card');
            if (companyCard) {
                anime({
                    targets: companyCard,
                    scale: [1.05, 1],
                    duration: 400,
                    easing: 'easeOutQuad'
                });
            }

            // Reset skill nodes
            const skillNodes = stage.querySelectorAll('.skill-node');
            if (skillNodes.length > 0) {
                anime({
                    targets: skillNodes,
                    scale: [1.1, 1],
                    duration: 300,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(30)
                });
            }
        }
    });
}

// Initialize stage click handlers to prevent navigation conflicts
function initializeStageClickHandlers() {
    const stages = document.querySelectorAll('.evolution-stage');

    stages.forEach((stage, index) => {
        // Add click handler that doesn't interfere with navigation
        stage.addEventListener('click', function(e) {
            // Only handle expansion, don't update navigation
            if (stage.getAttribute('data-animation-state') === 'completed') {
                // Toggle expansion
                stage.classList.toggle('expanded');

                // Prevent navigation update on click
                e.stopPropagation();

                console.log(`🎬 [EVOLUTION] Stage ${index + 1} expansion toggled`);
            }
        });
    });

    console.log(`🎬 [EVOLUTION] Initialized click handlers for ${stages.length} stages`);
}

// Enhanced Evolution Navigation System
function updateEvolutionNavigation(activeIndex) {
    const navDots = document.querySelectorAll('.nav-dot');
    const navProgress = document.querySelector('.nav-progress');

    // Validate activeIndex
    if (activeIndex < 0 || activeIndex >= navDots.length) {
        console.log(`🧭 [EVOLUTION NAV] Invalid stage index: ${activeIndex}`);
        return;
    }

    console.log(`🧭 [EVOLUTION NAV] Updating navigation to stage ${activeIndex + 1}`);

    // Update active dots with proper logic
    navDots.forEach((dot, index) => {
        if (index <= activeIndex) {
            if (!dot.classList.contains('active')) {
                dot.classList.add('active');

                // Animate dot activation
                anime({
                    targets: dot,
                    scale: [1, 1.3, 1],
                    duration: 400,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
        } else {
            dot.classList.remove('active');
        }
    });

    // Update progress bar with proper calculation
    if (navProgress) {
        // Progress should start from 0% and end at 100%
        // When stage 0 is active, progress should be 1/6 = 16.67%
        // When stage 5 is active, progress should be 6/6 = 100%
        const progressPercent = ((activeIndex + 1) / navDots.length) * 100;

        anime({
            targets: navProgress,
            height: `${progressPercent}%`,
            duration: 600,
            easing: 'easeOutQuad'
        });

        // Add a subtle glow effect to the progress bar
        anime({
            targets: navProgress,
            boxShadow: [
                '0 0 0px rgba(0, 212, 255, 0)',
                '0 0 15px rgba(0, 212, 255, 0.5)',
                '0 0 8px rgba(0, 212, 255, 0.3)'
            ],
            duration: 800,
            easing: 'easeOutQuad'
        });

        console.log(`🧭 [EVOLUTION NAV] Progress updated to ${progressPercent.toFixed(1)}%`);
    }
}

// Enhanced Scroll-based Evolution Navigation Tracking
function initEvolutionScrollTracking() {
    const stages = document.querySelectorAll('.evolution-stage');
    const navDots = document.querySelectorAll('.nav-dot');
    const journeySection = document.getElementById('journey');

    if (!journeySection || stages.length === 0) return;

    let isScrolling = false;
    let scrollTimeout;

    // Calculate scroll-based navigation
    function calculateNavigationProgress() {
        const journeyRect = journeySection.getBoundingClientRect();
        const journeyTop = journeyRect.top + window.scrollY;
        const journeyHeight = journeyRect.height;
        const viewportCenter = window.scrollY + window.innerHeight / 2;

        // Calculate progress through the journey section (0 to 1)
        const journeyProgress = Math.max(0, Math.min(1,
            (viewportCenter - journeyTop) / journeyHeight
        ));

        // Determine active stage based on scroll progress
        let activeStageIndex;

        if (journeyProgress <= 0.05) {
            // Before journey section starts
            activeStageIndex = -1;
        } else if (journeyProgress >= 0.95) {
            // At the end of journey section
            activeStageIndex = stages.length - 1;
        } else {
            // Calculate which stage should be active based on progress
            // Divide the journey into equal segments for each stage
            const segmentSize = 0.9 / stages.length; // 0.9 because we reserve 0.05 at start and end
            const adjustedProgress = (journeyProgress - 0.05) / 0.9;
            activeStageIndex = Math.floor(adjustedProgress * stages.length);
            activeStageIndex = Math.max(0, Math.min(stages.length - 1, activeStageIndex));
        }

        return {
            progress: journeyProgress,
            activeStageIndex: activeStageIndex,
            inJourneySection: journeyProgress > 0 && journeyProgress < 1
        };
    }

    // Update navigation based on scroll position
    function updateNavigationOnScroll() {
        const navState = calculateNavigationProgress();

        if (navState.inJourneySection && navState.activeStageIndex >= 0) {
            updateEvolutionNavigation(navState.activeStageIndex);
        }

        // Debug logging
        if (!isScrolling) {
            console.log(`🧭 [EVOLUTION NAV] Progress: ${(navState.progress * 100).toFixed(1)}%, Active Stage: ${navState.activeStageIndex + 1}`);
        }
    }

    // Throttled scroll handler
    function handleScroll() {
        if (!isScrolling) {
            isScrolling = true;
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 150);

        updateNavigationOnScroll();
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Add click functionality to navigation dots
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            const targetStage = stages[index];
            if (targetStage) {
                // Calculate target scroll position (center the stage in viewport)
                const stageRect = targetStage.getBoundingClientRect();
                const stageTop = stageRect.top + window.scrollY;
                const targetScroll = stageTop - (window.innerHeight / 2) + (stageRect.height / 2);

                // Smooth scroll to the target position
                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });

                // Update navigation immediately
                updateEvolutionNavigation(index);

                // Add click feedback animation
                anime({
                    targets: this,
                    scale: [1, 1.3, 1],
                    duration: 300,
                    easing: 'easeOutElastic(1, .8)'
                });

                console.log(`🧭 [EVOLUTION NAV] Clicked navigation dot ${index + 1}`);
            }
        });

        // Add hover effects
        dot.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                anime({
                    targets: this,
                    scale: 1.2,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });

        dot.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
        });
    });

    // Initial navigation update
    setTimeout(() => {
        updateNavigationOnScroll();
    }, 100); // Small delay to ensure proper initialization

    console.log(`🧭 [EVOLUTION NAV] Initialized enhanced scroll tracking for ${stages.length} stages`);

    // Show/hide navigator based on journey section visibility
    initEvolutionNavigatorVisibility();
}

// Evolution Navigator Visibility Control
function initEvolutionNavigatorVisibility() {
    const navigator = document.querySelector('.evolution-navigator');
    const journeySection = document.getElementById('journey');

    if (!navigator || !journeySection) return;

    // Initially hide the navigator
    navigator.style.opacity = '0';
    navigator.style.transform = 'translateY(-50%) translateX(20px)';
    navigator.style.transition = 'all 0.4s ease';

    const visibilityObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Show navigator when journey section is visible
                anime({
                    targets: navigator,
                    opacity: [0, 1],
                    translateX: [20, 0],
                    duration: 600,
                    easing: 'easeOutQuad'
                });
                console.log('🧭 [EVOLUTION NAV] Navigator shown');
            } else {
                // Hide navigator when leaving journey section
                anime({
                    targets: navigator,
                    opacity: [1, 0],
                    translateX: [0, 20],
                    duration: 400,
                    easing: 'easeOutQuad'
                });
                console.log('🧭 [EVOLUTION NAV] Navigator hidden');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    visibilityObserver.observe(journeySection);
}

// Interactive Evolution Functionality
function initInteractiveEvolution() {
    const stages = document.querySelectorAll('.evolution-stage');
    const navDots = document.querySelectorAll('.nav-dot');
    const navProgress = document.querySelector('.nav-progress');

    // Stage click interactions
    stages.forEach((stage, index) => {
        stage.addEventListener('click', function() {
            // Toggle expanded state
            const isExpanded = stage.classList.contains('expanded');

            if (isExpanded) {
                // Collapse
                stage.classList.remove('expanded');

                const expandedContentEl = stage.querySelector('.expanded-content');
                if (expandedContentEl) {
                    anime({
                        targets: expandedContentEl,
                        maxHeight: [expandedContentEl.scrollHeight + 'px', '0px'],
                        opacity: [1, 0],
                        duration: 600,
                        easing: 'easeInOutQuad'
                    });
                }
            } else {
                // Expand
                stage.classList.add('expanded');

                const expandedContent = stage.querySelector('.expanded-content');
                if (expandedContent) {
                    const targetHeight = expandedContent.scrollHeight;

                    anime({
                        targets: expandedContent,
                        maxHeight: ['0px', targetHeight + 'px'],
                        opacity: [0, 1],
                        duration: 600,
                        easing: 'easeOutQuad'
                    });

                    // Animate detailed content elements
                    setTimeout(() => {
                        const detailElements = stage.querySelectorAll('.detailed-description h4, .detailed-description h5, .detailed-description p, .detailed-description li');
                        anime({
                            targets: detailElements,
                            translateY: [20, 0],
                            opacity: [0, 1],
                            duration: 400,
                            easing: 'easeOutQuad',
                            delay: anime.stagger(50)
                        });
                    }, 200);
                }
            }

            // Remove active class from all stages and nav dots
            stages.forEach(s => s.classList.remove('active'));
            navDots.forEach(dot => dot.classList.remove('active'));

            // Add active class to clicked stage and corresponding nav dot
            this.classList.add('active');
            if (navDots[index]) {
                navDots[index].classList.add('active');
            }

            // Update navigation progress
            const progressPercent = ((index + 1) / stages.length) * 100;
            if (navProgress) {
                anime({
                    targets: navProgress,
                    height: `${progressPercent}%`,
                    duration: 600,
                    easing: 'easeOutQuad'
                });
            }

            // Animate stage content
            anime({
                targets: this.querySelector('.stage-container'),
                scale: [1, 1.05, 1],
                duration: 600,
                easing: 'easeOutElastic(1, .8)'
            });

            // Animate skill nodes
            const skillNodes = this.querySelectorAll('.skill-node');
            anime({
                targets: skillNodes,
                scale: [1, 1.1, 1],
                duration: 400,
                easing: 'easeOutQuad',
                delay: anime.stagger(100)
            });

            // Animate company card
            anime({
                targets: this.querySelector('.company-card'),
                translateY: [-5, 0],
                duration: 400,
                easing: 'easeOutQuad'
            });
        });

        // Enhanced hover effects
        stage.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                anime({
                    targets: this.querySelector('.stage-icon'),
                    scale: 1.1,
                    rotate: '5deg',
                    duration: 300,
                    easing: 'easeOutQuad'
                });

                anime({
                    targets: this.querySelector('.stage-title'),
                    color: '#00d4ff',
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });

        stage.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                anime({
                    targets: this.querySelector('.stage-icon'),
                    scale: 1,
                    rotate: '0deg',
                    duration: 300,
                    easing: 'easeOutQuad'
                });

                anime({
                    targets: this.querySelector('.stage-title'),
                    color: '#ffffff',
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
    });

    // Navigation dot interactions
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            if (stages[index]) {
                stages[index].click();

                // Scroll to stage
                stages[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });

    // Ensure the first stage starts expanded (handled in HTML with 'expanded' class')
    // Removed auto-click to prevent unintended toggle of the initial expanded state.
}

// Network Animation
function initNetworkAnimation() {
    const networkObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const connectionLines = entry.target.querySelectorAll('.connection-line');
                const dataParticles = entry.target.querySelectorAll('.data-particle');

                // Reset and animate connection lines
                connectionLines.forEach((line, index) => {
                    line.style.strokeDashoffset = '1000';
                    line.style.animation = 'none';

                    setTimeout(() => {
                        line.style.animation = `drawNetwork 4s ease-in-out forwards`;
                        line.style.animationDelay = `${0.5 + index * 0.5}s`;
                    }, 100);
                });

                // Animate data particles
                dataParticles.forEach((particle, index) => {
                    particle.style.opacity = '0';
                    particle.style.animation = 'none';

                    setTimeout(() => {
                        particle.style.animation = 'particleFlow 3s ease-in-out infinite';
                        particle.style.animationDelay = `${3 + index * 0.5}s`;
                    }, 100);
                });

                networkObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    const networkBackground = document.querySelector('.network-background');
    if (networkBackground) {
        networkObserver.observe(networkBackground);
    }
}

// Portfolio Section Animations
function initPortfolioAnimations() {
    // Animate portfolio cards on scroll
    const portfolioObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const videoCards = entry.target.querySelectorAll('.video-card');
                const linkCards = entry.target.querySelectorAll('.portfolio-link-card');

                // Animate video cards
                anime({
                    targets: videoCards,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    scale: [0.9, 1],
                    duration: 800,
                    easing: 'easeOutElastic(1, .8)',
                    delay: anime.stagger(200)
                });

                // Animate link cards
                anime({
                    targets: linkCards,
                    translateY: [30, 0],
                    opacity: [0, 1],
                    duration: 600,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(150, {start: 600})
                });

                portfolioObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe portfolio section
    const portfolioSection = document.querySelector('#portfolio');
    if (portfolioSection) {
        portfolioObserver.observe(portfolioSection);
    }
}

// Video Modal Functionality
function initVideoModal() {
    const videoCards = document.querySelectorAll('.video-card');
    const videoModal = document.getElementById('videoModal');
    const modalClose = document.querySelector('.modal-close');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const videoPlayer = document.querySelector('.video-player');
    const modalVideoTitle = document.querySelector('.modal-video-title');
    const modalVideoDescription = document.querySelector('.modal-video-description');

    // Portfolio Videos Configuration - Replace PLACEHOLDER_ID with actual Google Drive file IDs
    // To get file ID: Share video from Google Drive → Copy link → Extract ID from URL
    // Example: https://drive.google.com/file/d/1ABC123XYZ789/view → ID is "1ABC123XYZ789"
    const portfolioVideos = {
        1: {
            id: 'PLACEHOLDER_ID_1', // Replace with Google Drive file ID
            title: 'Custom Dashboard Creation',
            description: 'A comprehensive demonstration of building analytics dashboards for performance tracking and metrics analysis.',
            category: 'Development',
            duration: '3:45'
        },
        2: {
            id: 'PLACEHOLDER_ID_2', // Replace with Google Drive file ID
            title: 'Process Automation Tool',
            description: 'Showcasing automated workflow solutions that improved efficiency by 300% through intelligent scripting.',
            category: 'Automation',
            duration: '2:30'
        },
        3: {
            id: 'PLACEHOLDER_ID_3', // Replace with Google Drive file ID
            title: 'CRM System Enhancement',
            description: 'Custom tools developed to enhance CRM functionality and improve user experience across multiple platforms.',
            category: 'Integration',
            duration: '4:15'
        },
        4: {
            id: 'PLACEHOLDER_ID_4', // Replace with Google Drive file ID
            title: 'AI-Powered Solutions',
            description: 'Implementation of AI tools for enhanced decision-making and automation in business processes.',
            category: 'AI/ML',
            duration: '5:20'
        },
        5: {
            id: 'PLACEHOLDER_ID_5', // Replace with Google Drive file ID
            title: 'B2B Marketing Campaign',
            description: 'Strategic marketing campaign showcasing lead generation and client acquisition techniques for B2B markets.',
            category: 'Marketing',
            duration: '3:15'
        },
        6: {
            id: 'PLACEHOLDER_ID_6', // Replace with Google Drive file ID
            title: 'Digital Marketing Strategy',
            description: 'Comprehensive digital marketing approach with analytics-driven campaign optimization and performance tracking.',
            category: 'Marketing',
            duration: '4:30'
        }
    };

    // Open video modal
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            const videoId = this.dataset.video;
            const video = portfolioVideos[videoId];

            if (video && video.id !== 'PLACEHOLDER_ID_' + videoId) {
                // Generate Google Drive embed URL
                const driveEmbedUrl = `https://drive.google.com/file/d/${video.id}/preview`;

                videoPlayer.src = driveEmbedUrl;
                modalVideoTitle.textContent = video.title;
                modalVideoDescription.textContent = video.description;

                videoModal.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Animate modal appearance
                anime({
                    targets: videoModal,
                    opacity: [0, 1],
                    duration: 400,
                    easing: 'easeOutQuad'
                });
            } else {
                // Show message if video ID is not configured
                console.log('Video ID not configured yet. Please replace PLACEHOLDER_ID_' + videoId + ' with actual Google Drive file ID.');
                alert('Video not available yet. Please configure the Google Drive file ID.');
            }
        });
    });

    // Close video modal
    function closeModal() {
        anime({
            targets: videoModal,
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInQuad',
            complete: function() {
                videoModal.classList.remove('active');
                videoPlayer.src = '';
                document.body.style.overflow = '';
            }
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Portfolio Links Functionality
function initPortfolioLinks() {
    const portfolioLinks = document.querySelectorAll('.portfolio-link-card');

    // Portfolio link URLs (Complete Portfolio Archive now handled by separate button)
    const linkData = {
        'WhatsApp Contact': 'https://wa.me/573012372817',
        'LinkedIn Profile': 'https://www.linkedin.com/in/alex-castro-422b39261',
        'Technical Blog': 'https://yourblog.com' // Replace with actual blog URL
    };

    // Handle Google Drive button separately
    const driveButton = document.querySelector('.portfolio-drive-button');
    if (driveButton) {
        driveButton.addEventListener('mouseenter', function() {
            anime({
                targets: this.querySelector('.button-icon'),
                scale: 1.1,
                rotate: '5deg',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        driveButton.addEventListener('mouseleave', function() {
            anime({
                targets: this.querySelector('.button-icon'),
                scale: 1,
                rotate: '0deg',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        driveButton.addEventListener('click', function(e) {
            // Add click animation before navigation
            e.preventDefault();
            anime({
                targets: this,
                scale: [1, 0.95, 1],
                duration: 200,
                easing: 'easeOutQuad',
                complete: function() {
                    // Navigate to the Google Drive folder
                    window.open(driveButton.href, '_blank');
                }
            });
        });
    }

    portfolioLinks.forEach(link => {
        link.addEventListener('click', function() {
            const linkTitle = this.querySelector('.link-title').textContent;
            const url = linkData[linkTitle];

            if (url) {
                // Animate click feedback
                anime({
                    targets: this,
                    scale: [1, 0.95, 1],
                    duration: 200,
                    easing: 'easeOutQuad',
                    complete: function() {
                        window.open(url, '_blank');
                    }
                });
            }
        });

        // Enhanced hover effects
        link.addEventListener('mouseenter', function() {
            anime({
                targets: this.querySelector('.link-icon'),
                scale: 1.1,
                rotate: '5deg',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        link.addEventListener('mouseleave', function() {
            anime({
                targets: this.querySelector('.link-icon'),
                scale: 1,
                rotate: '0deg',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
}

// Terminal Contact Functionality
function initTerminalContact() {
    const contactForm = document.getElementById('contactForm');
    const clearButton = document.getElementById('clearForm');
    const messageStatus = document.getElementById('messageStatus');

    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // Show loading state
            showTerminalMessage('Sending message...', 'loading');

            // Simulate sending email (replace with actual email service)
            sendEmail(email, subject, message)
                .then(() => {
                    showTerminalMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
                    contactForm.reset();
                    addTerminalOutput('Message sent successfully!', 'success');
                })
                .catch((error) => {
                    showTerminalMessage('Failed to send message. Please try again.', 'error');
                    addTerminalOutput('Error: ' + error.message, 'error');
                });
        });
    }

    // Clear form
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            contactForm.reset();
            addTerminalOutput('Buffer cleared.', 'system');

            // Animate clear action
            anime({
                targets: '.terminal-form input, .terminal-form textarea',
                scale: [1, 0.95, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    }
}

// Initialize EmailJS
function initEmailJS() {
    // Initialize EmailJS with your public key
    // You need to replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
    // Get it from: https://dashboard.emailjs.com/admin/account
    emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key
}

// Email sending function using EmailJS
function sendEmail(email, subject, message) {
    return new Promise((resolve, reject) => {
        // EmailJS service configuration
        // You need to set up these values in your EmailJS dashboard:
        const serviceID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
        const templateID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID

        const templateParams = {
            from_email: email,
            from_name: email.split('@')[0], // Extract name from email
            subject: subject,
            message: message,
            to_email: 'your.email@domain.com' // Replace with your actual email
        };

        emailjs.send(serviceID, templateID, templateParams)
            .then((response) => {
                console.log('Email sent successfully:', response);
                resolve(response);
            })
            .catch((error) => {
                console.error('Email sending failed:', error);
                reject(error);
            });
    });
}

// Show status message
function showTerminalMessage(text, type) {
    const messageStatus = document.getElementById('messageStatus');
    const statusContent = messageStatus.querySelector('.status-content');
    const statusText = messageStatus.querySelector('.status-text');

    statusText.textContent = text;
    statusContent.className = `status-content ${type}`;

    messageStatus.classList.add('show');

    // Auto hide after 5 seconds
    setTimeout(() => {
        messageStatus.classList.remove('show');
    }, 5000);
}

// Add output to terminal
function addTerminalOutput(text, type = 'system') {
    const terminalOutput = document.querySelector('.terminal-output');
    const outputLine = document.createElement('div');
    outputLine.className = `output-line ${type}-message`;

    const timestamp = new Date().toLocaleTimeString();
    outputLine.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${text}</span>
    `;

    terminalOutput.appendChild(outputLine);

    // Animate new line
    anime({
        targets: outputLine,
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 500,
        easing: 'easeOutQuad'
    });

    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Terminal animations on scroll
function initTerminalAnimations() {
    const terminalObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTerminalSequence();
                terminalObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    });

    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        terminalObserver.observe(contactSection);
    }
}

// Terminal sequence with smooth animations
function startTerminalSequence() {
    const terminal = document.querySelector('.terminal-window');
    const outputLines = document.querySelectorAll('.output-line');
    const terminalForm = document.querySelector('.terminal-form');

    if (!terminal) return;

    // Step 1: Terminal expansion animation
    anime({
        targets: terminal,
        scale: [0.1, 1.05, 1],
        opacity: [0, 1],
        duration: 1500,
        easing: 'easeOutElastic(1, .8)',
        complete: function() {
            // Step 2: Start typing sequence after terminal is expanded
            startTypingSequence(outputLines, terminalForm);
        }
    });
}

// Typing sequence for terminal output
function startTypingSequence(outputLines, terminalForm) {
    let currentLine = 0;

    function typeNextLine() {
        if (currentLine >= outputLines.length) {
            // All lines typed, show the form
            showTerminalForm(terminalForm);
            return;
        }

        const line = outputLines[currentLine];
        const prompt = line.querySelector('.prompt');
        const command = line.querySelector('.command');
        const timestamp = line.querySelector('.timestamp');
        const message = line.querySelector('.message');

        // Show the line first
        anime({
            targets: line,
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 300,
            easing: 'easeOutQuad',
            complete: function() {
                // Type the content
                if (command) {
                    typeText(command, 50, function() {
                        currentLine++;
                        setTimeout(typeNextLine, 300);
                    });
                } else if (message) {
                    typeText(message, 30, function() {
                        currentLine++;
                        setTimeout(typeNextLine, 500);
                    });
                } else {
                    currentLine++;
                    setTimeout(typeNextLine, 200);
                }
            }
        });
    }

    // Start typing the first line after a short delay
    setTimeout(typeNextLine, 500);
}

// Type text character by character
function typeText(element, speed, callback) {
    const text = element.textContent;
    element.textContent = '';
    element.style.borderRight = '2px solid var(--primary-color)'; // Cursor

    let i = 0;
    const timer = setInterval(function() {
        element.textContent += text.charAt(i);
        i++;

        if (i >= text.length) {
            clearInterval(timer);
            element.style.borderRight = 'none'; // Remove cursor
            if (callback) callback();
        }
    }, speed);
}

// Show terminal form
function showTerminalForm(terminalForm) {
    if (!terminalForm) return;

    anime({
        targets: terminalForm,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'easeOutQuad',
        delay: 500
    });
}

// Terminal typing effects
function initTerminalTyping() {
    const inputs = document.querySelectorAll('.terminal-form input, .terminal-form textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Add typing indicator
            const cursor = document.querySelector('.cursor');
            if (cursor) {
                cursor.style.animationDuration = '0.5s';
            }
        });

        input.addEventListener('blur', function() {
            // Reset cursor
            const cursor = document.querySelector('.cursor');
            if (cursor) {
                cursor.style.animationDuration = '1s';
            }
        });

        input.addEventListener('input', function() {
            // Add terminal-like typing sound effect (optional)
            // You could add a subtle audio feedback here
        });
    });
}

// Global Mouse Trail Particle System with Section Awareness
function initMouseTrailParticles() {
    console.log('🖱️ [GLOBAL PARTICLES] Initializing global mouse trail particles...');

    // Check if already initialized
    if (document.body.hasAttribute('data-mouse-particles-initialized')) {
        console.log('🖱️ [GLOBAL PARTICLES] ❌ Already initialized, skipping...');
        return;
    }

    // Create global canvas for cursor trail
    let globalCanvas = document.getElementById('globalParticleCanvas');
    if (!globalCanvas) {
        globalCanvas = document.createElement('canvas');
        globalCanvas.id = 'globalParticleCanvas';
        globalCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(globalCanvas);
        console.log('🖱️ [GLOBAL PARTICLES] ✅ Created global canvas');
    }

    // Mark as initialized
    document.body.setAttribute('data-mouse-particles-initialized', 'true');
    console.log('🖱️ [GLOBAL PARTICLES] ✅ Marked as initialized');

    const ctx = globalCanvas.getContext('2d');
    const particles = [];
    const backgroundParticles = [];
    // Mobile-optimized particle counts and performance settings
    const isMobile = window.innerWidth <= 768;
    const maxParticles = isMobile ? 20 : 60;
    const maxBackgroundParticles = isMobile ? 50 : 150;

    // Disable cursor trail on mobile for better performance
    if (isMobile) {
        document.body.style.cursor = 'auto';
    }
    let mouse = { x: 0, y: 0 };
    let currentSection = 'hero';
    let targetColors = getSectionColors('hero');
    let currentColors = { ...targetColors };
    let interactiveElements = [];
    let lastElementUpdate = 0;
    let particlePool = [];
    let lastMouseMove = Date.now();
    let globalIdleTime = 0;

    // Section color definitions - Fixed purple issue and refined colors
    function getSectionColors(section) {
        const colorMap = {
            hero: { hue: 190, saturation: 80, lightness: 60 }, // Cyan/blue
            about: { hue: 160, saturation: 70, lightness: 55 }, // Green/teal
            journey: { hue: 200, saturation: 60, lightness: 55 }, // Softer blue/cyan, less saturated
            portfolio: { hue: 35, saturation: 85, lightness: 60 }, // Orange/yellow
            contact: { hue: 350, saturation: 80, lightness: 65 } // Red/pink
        };
        return colorMap[section] || colorMap.hero;
    }

    // Set canvas size
    function resizeCanvas() {
        globalCanvas.width = window.innerWidth;
        globalCanvas.height = window.innerHeight;

        // Reinitialize background particles on resize
        if (backgroundParticles.length > 0) {
            initializeBackgroundParticles();
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Deep Space Background Particle Class
    class BackgroundParticle {
        constructor() {
            this.reset();
            // Start with random positions for initial spawn
            this.x = Math.random() * globalCanvas.width;
            this.y = Math.random() * globalCanvas.height;
            this.life = Math.random(); // Random initial life for variety
        }

        reset() {
            this.x = Math.random() * globalCanvas.width;
            this.y = Math.random() * globalCanvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.life = 1;
            this.maxLife = 1;
            this.decay = Math.random() * 0.002 + 0.001;
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.twinkleOffset = Math.random() * Math.PI * 2;

            // Create deep space colors with section awareness
            const baseHue = currentColors.hue;
            const hueVariation = (Math.random() - 0.5) * 60;
            this.hue = baseHue + hueVariation;
            this.saturation = Math.random() * 30 + 20; // Lower saturation for space feel
            this.lightness = Math.random() * 40 + 30; // Dimmer for background

            this.color = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Gentle floating motion
            this.x += Math.sin(Date.now() * 0.001 + this.twinkleOffset) * 0.1;
            this.y += Math.cos(Date.now() * 0.0008 + this.twinkleOffset) * 0.1;

            this.life -= this.decay;

            // Wrap around screen edges
            if (this.x < -10) this.x = globalCanvas.width + 10;
            if (this.x > globalCanvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = globalCanvas.height + 10;
            if (this.y > globalCanvas.height + 10) this.y = -10;

            // Reset when life is depleted
            if (this.life <= 0) {
                this.reset();
            }
        }

        draw() {
            ctx.save();

            // Twinkling effect
            const twinkle = Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset) * 0.3 + 0.7;
            const alpha = this.life * twinkle * 0.6;

            ctx.globalAlpha = alpha;

            // Main star/particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Subtle glow for larger particles
            if (this.size > 1.5) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
                ctx.globalAlpha = alpha * 0.3;
                ctx.fill();
            }

            // Cross-shaped twinkle for brightest stars
            if (this.size > 1.8 && twinkle > 0.8) {
                ctx.globalAlpha = alpha * 0.5;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(this.x - this.size * 2, this.y);
                ctx.lineTo(this.x + this.size * 2, this.y);
                ctx.moveTo(this.x, this.y - this.size * 2);
                ctx.lineTo(this.x, this.y + this.size * 2);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // Smart Particle class with shape-changing behavior and advanced interactions
    class SmartMagneticParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.originalSize = Math.random() * 4 + 1;
            this.size = this.originalSize;
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;
            this.life = 1;
            this.decay = Math.random() * 0.015 + 0.008;

            // Magnetic properties
            this.magneticForceX = 0;
            this.magneticForceY = 0;
            this.isAttracted = false;
            this.attractionStrength = 0;
            this.targetElement = null;

            // Smart behavior properties
            this.shape = 'circle'; // circle, star, diamond, triangle
            this.targetShape = 'circle';
            this.shapeTransition = 0;
            this.idleTime = 0;
            this.lastMouseDistance = Infinity;
            this.behaviorState = 'normal'; // normal, attracted, idle, excited
            this.rotationAngle = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.energy = Math.random() * 0.5 + 0.5; // Energy level affects behavior intensity

            // Use current section colors with slight variation
            const hueVariation = (Math.random() - 0.5) * 30;
            this.hue = currentColors.hue + hueVariation;
            this.saturation = currentColors.saturation + (Math.random() - 0.5) * 20;
            this.lightness = currentColors.lightness + (Math.random() - 0.5) * 20;

            this.color = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        }

        reset(x, y) {
            this.x = x;
            this.y = y;
            this.originalSize = Math.random() * 4 + 1;
            this.size = this.originalSize;
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;
            this.life = 1;
            this.decay = Math.random() * 0.015 + 0.008;

            // Reset magnetic properties
            this.magneticForceX = 0;
            this.magneticForceY = 0;
            this.isAttracted = false;
            this.attractionStrength = 0;
            this.targetElement = null;

            // Reset smart behavior properties
            this.shape = 'circle';
            this.targetShape = 'circle';
            this.shapeTransition = 0;
            this.idleTime = 0;
            this.lastMouseDistance = Infinity;
            this.behaviorState = 'normal';
            this.rotationAngle = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.energy = Math.random() * 0.5 + 0.5;

            // Update colors for current section
            const hueVariation = (Math.random() - 0.5) * 30;
            this.hue = currentColors.hue + hueVariation;
            this.saturation = currentColors.saturation + (Math.random() - 0.5) * 20;
            this.lightness = currentColors.lightness + (Math.random() - 0.5) * 20;
            this.color = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        }

        update() {
            // Apply magnetic forces
            this.applyMagneticForces();

            // Smart behavior analysis
            this.analyzeBehaviorState();

            // Update position with magnetic influence
            this.speedX += this.magneticForceX;
            this.speedY += this.magneticForceY;

            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;

            // Smart size and rotation updates
            this.updateSmartProperties();

            // Apply friction
            this.speedX *= 0.985;
            this.speedY *= 0.985;
            this.magneticForceX *= 0.8;
            this.magneticForceY *= 0.8;
        }

        analyzeBehaviorState() {
            // Calculate distance to mouse
            const mouseDistance = Math.sqrt(
                Math.pow(this.x - mouse.x, 2) +
                Math.pow(this.y - mouse.y, 2)
            );

            // Track idle time
            if (mouseDistance > 200) {
                this.idleTime += 1;
            } else {
                this.idleTime = Math.max(0, this.idleTime - 2);
            }

            // Determine behavior state and target shape - Reduced star usage
            if (this.isAttracted && this.attractionStrength > 0.8) {
                this.behaviorState = 'excited';
                this.targetShape = 'diamond'; // Use diamond instead of star for most cases
            } else if (this.isAttracted && this.attractionStrength > 0.3) {
                this.behaviorState = 'attracted';
                this.targetShape = 'diamond';
            } else if (this.idleTime > 120) { // ~2 seconds at 60fps
                this.behaviorState = 'idle';
                this.targetShape = 'circle'; // Keep circles for idle instead of triangles
            } else if (mouseDistance < 50) { // Reduced distance for star trigger
                this.behaviorState = 'excited';
                this.targetShape = 'star'; // Only very close to mouse
            } else {
                this.behaviorState = 'normal';
                this.targetShape = 'circle';
            }

            this.lastMouseDistance = mouseDistance;
        }

        updateSmartProperties() {
            // Shape transition
            if (this.shape !== this.targetShape) {
                this.shapeTransition += 0.05;
                if (this.shapeTransition >= 1) {
                    this.shape = this.targetShape;
                    this.shapeTransition = 0;
                }
            }

            // Size variation based on behavior state
            let targetSize = this.originalSize;
            switch (this.behaviorState) {
                case 'excited':
                    targetSize *= 1.5 + Math.sin(Date.now() * 0.01) * 0.2;
                    this.rotationSpeed = 0.05;
                    break;
                case 'attracted':
                    targetSize *= 1.2 + this.attractionStrength * 0.3;
                    this.rotationSpeed = 0.02;
                    break;
                case 'idle':
                    targetSize *= 0.8 + Math.sin(Date.now() * 0.005 + this.pulsePhase) * 0.1;
                    this.rotationSpeed = 0.01;
                    break;
                default:
                    this.rotationSpeed = 0.005;
            }

            this.size += (targetSize - this.size) * 0.1;
            this.rotationAngle += this.rotationSpeed;

            // Energy decay and regeneration
            if (this.behaviorState === 'excited') {
                this.energy = Math.min(1, this.energy + 0.02);
            } else {
                this.energy = Math.max(0.3, this.energy - 0.005);
            }
        }

        applyMagneticForces() {
            this.isAttracted = false;
            this.attractionStrength = 0;
            this.targetElement = null;

            // Check attraction to interactive elements
            for (const element of interactiveElements) {
                const distance = this.getDistanceToElement(element);
                const maxDistance = element.magneticRadius;

                if (distance < maxDistance) {
                    const force = this.calculateMagneticForce(element, distance, maxDistance);
                    this.magneticForceX += force.x;
                    this.magneticForceY += force.y;

                    if (distance < maxDistance * 0.7) {
                        this.isAttracted = true;
                        this.attractionStrength = Math.max(this.attractionStrength, 1 - distance / maxDistance);
                        this.targetElement = element;
                    }
                }
            }
        }

        getDistanceToElement(element) {
            const rect = element.rect;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            return Math.sqrt(
                Math.pow(this.x - centerX, 2) +
                Math.pow(this.y - centerY, 2)
            );
        }

        calculateMagneticForce(element, distance, maxDistance) {
            const rect = element.rect;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Direction vector toward element center
            const dx = centerX - this.x;
            const dy = centerY - this.y;

            // Normalize and apply force based on distance and element importance
            const normalizedDistance = distance / maxDistance;
            const forceStrength = (1 - normalizedDistance) * element.importance * 0.3;

            return {
                x: (dx / distance) * forceStrength,
                y: (dy / distance) * forceStrength
            };
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotationAngle);

            // Enhanced alpha based on behavior state
            const baseAlpha = this.life * 0.8;
            const energyBonus = this.energy * 0.2;
            const stateBonus = this.behaviorState === 'excited' ? 0.3 :
                             this.behaviorState === 'attracted' ? 0.2 : 0;
            ctx.globalAlpha = Math.min(baseAlpha + energyBonus + stateBonus, 1);

            // Draw shape based on current state
            this.drawShape();

            // Enhanced glow effect based on behavior
            const glowIntensity = this.calculateGlowIntensity();
            if (glowIntensity > 0) {
                ctx.shadowBlur = glowIntensity;
                ctx.shadowColor = this.color;
                ctx.globalAlpha = (this.life * 0.4) + (this.energy * 0.3);
                this.drawShape();
            }

            // Special effects for different states
            this.drawSpecialEffects();

            ctx.restore();
        }

        drawShape() {
            ctx.fillStyle = this.color;

            // Handle shape transitions
            if (this.shapeTransition > 0 && this.shape !== this.targetShape) {
                this.drawTransitionShape();
            } else {
                this.drawSingleShape(this.shape);
            }
        }

        drawSingleShape(shape) {
            ctx.beginPath();

            switch (shape) {
                case 'circle':
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    break;

                case 'star':
                    this.drawStar(0, 0, 5, this.size * 0.7, this.size * 0.3); // Smaller, more refined stars
                    break;

                case 'diamond':
                    this.drawDiamond(0, 0, this.size);
                    break;

                case 'triangle':
                    this.drawTriangle(0, 0, this.size);
                    break;
            }

            ctx.fill();
        }

        drawTransitionShape() {
            // Blend between current and target shape
            ctx.globalAlpha *= (1 - this.shapeTransition);
            this.drawSingleShape(this.shape);

            ctx.globalAlpha /= (1 - this.shapeTransition);
            ctx.globalAlpha *= this.shapeTransition;
            this.drawSingleShape(this.targetShape);
        }

        drawStar(x, y, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            const step = Math.PI / spikes;

            ctx.moveTo(x, y - outerRadius);

            for (let i = 0; i < spikes; i++) {
                ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
                rot += step;
                ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
                rot += step;
            }

            ctx.lineTo(x, y - outerRadius);
        }

        drawDiamond(x, y, size) {
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x - size, y);
            ctx.closePath();
        }

        drawTriangle(x, y, size) {
            const height = size * Math.sqrt(3) / 2;
            ctx.moveTo(x, y - height * 0.6);
            ctx.lineTo(x - size * 0.5, y + height * 0.4);
            ctx.lineTo(x + size * 0.5, y + height * 0.4);
            ctx.closePath();
        }

        calculateGlowIntensity() {
            let intensity = 10;

            switch (this.behaviorState) {
                case 'excited':
                    intensity = 25 + Math.sin(Date.now() * 0.02) * 5;
                    break;
                case 'attracted':
                    intensity = 20 + this.attractionStrength * 10;
                    break;
                case 'idle':
                    intensity = 8 + Math.sin(Date.now() * 0.01 + this.pulsePhase) * 3;
                    break;
                default:
                    intensity = 12;
            }

            return intensity * this.energy;
        }

        drawSpecialEffects() {
            // Orbital rings for excited particles
            if (this.behaviorState === 'excited' && this.energy > 0.8) {
                ctx.globalAlpha = 0.3 * this.energy;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;

                for (let i = 1; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size * (1.5 + i * 0.5), 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // Pulse waves for idle particles
            if (this.behaviorState === 'idle' && this.idleTime > 180) {
                const pulseSize = this.size * (2 + Math.sin(Date.now() * 0.008 + this.pulsePhase));
                ctx.globalAlpha = 0.2 * (1 - (this.idleTime - 180) / 120);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    // Section detection system
    function detectCurrentSection() {
        const sections = ['hero', 'about', 'journey', 'portfolio', 'contact'];
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        for (const sectionId of sections) {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const sectionBottom = sectionTop + rect.height;

                if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                    return sectionId;
                }
            }
        }
        return 'hero'; // Default fallback
    }

    // Smooth color transition system
    function updateSectionColors() {
        const newSection = detectCurrentSection();
        if (newSection !== currentSection) {
            currentSection = newSection;
            targetColors = getSectionColors(newSection);
            console.log(`🖱️ [GLOBAL PARTICLES] 🎨 Section changed to: ${newSection}`);
        }

        // Smooth color interpolation
        const lerpSpeed = 0.05;
        currentColors.hue = lerp(currentColors.hue, targetColors.hue, lerpSpeed);
        currentColors.saturation = lerp(currentColors.saturation, targetColors.saturation, lerpSpeed);
        currentColors.lightness = lerp(currentColors.lightness, targetColors.lightness, lerpSpeed);
    }

    // Linear interpolation helper
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Interactive elements detection and management
    function updateInteractiveElements() {
        const now = Date.now();
        // Mobile-optimized update frequency: 1000ms on mobile, 500ms on desktop
        const updateInterval = isMobile ? 1000 : 500;
        if (now - lastElementUpdate < updateInterval) return;
        lastElementUpdate = now;

        interactiveElements = [];

        // Define selectors and their importance levels
        const elementTypes = [
            { selector: '.btn-primary, .btn-secondary', importance: 1.0, radius: 120 },
            { selector: '.nav-link', importance: 0.8, radius: 100 },
            { selector: '.social-link', importance: 0.7, radius: 80 },
            // Neon cards excluded when they have custom hover effects
            { selector: '.neon-card:not(.card-hover-enabled)', importance: 0.9, radius: 150 },
            { selector: '.video-card', importance: 0.8, radius: 130 },
            { selector: '.portfolio-link-card', importance: 0.8, radius: 130 },
            // Evolution stages excluded - they have custom hover effects
            { selector: '.evolution-stage:not(.evolution-hover-enabled)', importance: 0.7, radius: 120 },
            { selector: '.skill-tag', importance: 0.5, radius: 60 },
            { selector: '.terminal-button', importance: 0.9, radius: 100 },
            { selector: '.scroll-indicator', importance: 0.6, radius: 80 },
            { selector: '.profile-image', importance: 0.8, radius: 140 }
        ];

        elementTypes.forEach(type => {
            const elements = document.querySelectorAll(type.selector);
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();

                // Only include visible elements
                if (rect.width > 0 && rect.height > 0 &&
                    rect.bottom > 0 && rect.top < window.innerHeight &&
                    rect.right > 0 && rect.left < window.innerWidth) {

                    interactiveElements.push({
                        element: element,
                        rect: rect,
                        importance: type.importance,
                        magneticRadius: type.radius,
                        selector: type.selector
                    });
                }
            });
        });

        // Reduce console logging on mobile for performance
        if (!isMobile || Math.random() < 0.1) {
            console.log(`🧲 [MAGNETIC] Updated ${interactiveElements.length} interactive elements`);
        }
    }

    // Particle pooling system for performance optimization
    function getPooledParticle(x, y) {
        if (particlePool.length > 0) {
            const particle = particlePool.pop();
            particle.reset(x, y);
            return particle;
        }
        return new SmartMagneticParticle(x, y);
    }

    function returnParticleToPool(particle) {
        if (particlePool.length < 20) { // Limit pool size
            particlePool.push(particle);
        }
    }

    // Global idle state management
    function updateGlobalIdleState() {
        const now = Date.now();
        if (now - lastMouseMove > 3000) { // 3 seconds of no mouse movement
            globalIdleTime += 1;
        } else {
            globalIdleTime = 0;
        }

        // Create ambient particles during long idle periods
        if (globalIdleTime > 300 && globalIdleTime % 60 === 0) { // Every second after 5 seconds idle
            createAmbientParticle();
        }
    }

    function createAmbientParticle() {
        if (particles.length < maxParticles) {
            const edge = Math.floor(Math.random() * 4);
            let x, y;

            switch (edge) {
                case 0: // Top
                    x = Math.random() * globalCanvas.width;
                    y = -10;
                    break;
                case 1: // Right
                    x = globalCanvas.width + 10;
                    y = Math.random() * globalCanvas.height;
                    break;
                case 2: // Bottom
                    x = Math.random() * globalCanvas.width;
                    y = globalCanvas.height + 10;
                    break;
                case 3: // Left
                    x = -10;
                    y = Math.random() * globalCanvas.height;
                    break;
            }

            const particle = getPooledParticle(x, y);
            particle.behaviorState = 'idle';
            particle.targetShape = 'triangle';
            particle.speedX = (Math.random() - 0.5) * 1;
            particle.speedY = (Math.random() - 0.5) * 1;
            particle.life = 0.6; // Dimmer ambient particles

            particles.push(particle);
        }
    }

    // Initialize background particles for deep space effect
    function initializeBackgroundParticles() {
        backgroundParticles.length = 0; // Clear existing

        for (let i = 0; i < maxBackgroundParticles; i++) {
            backgroundParticles.push(new BackgroundParticle());
        }

        console.log(`🌌 [DEEP SPACE] Initialized ${maxBackgroundParticles} background particles`);
    }

    // Enhanced hover detection for magnetic effects
    let hoveredElement = null;
    let hoverStartTime = 0;

    function detectHoveredElement() {
        const elementUnderMouse = document.elementFromPoint(mouse.x, mouse.y);
        if (!elementUnderMouse) return;

        // Check if the element or its parent matches our interactive selectors
        let currentElement = elementUnderMouse;
        let matchedElement = null;

        while (currentElement && currentElement !== document.body) {
            const found = interactiveElements.find(ie => ie.element === currentElement);
            if (found) {
                matchedElement = found;
                break;
            }
            currentElement = currentElement.parentElement;
        }

        if (matchedElement !== hoveredElement) {
            hoveredElement = matchedElement;
            hoverStartTime = Date.now();

            if (hoveredElement) {
                console.log(`🧲 [MAGNETIC] Hovering over: ${hoveredElement.selector}`);
            }
        }
    }

    // Smart global mouse move handler with enhanced magnetic effects
    function handleGlobalMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        lastMouseMove = Date.now();
        globalIdleTime = 0; // Reset global idle time

        // Detect hovered elements for enhanced effects
        detectHoveredElement();

        // Create new particles based on mouse movement
        const velocity = Math.sqrt(
            Math.pow(e.movementX || 0, 2) + Math.pow(e.movementY || 0, 2)
        );

        let particleCount = Math.min(Math.floor(velocity / 3) + 1, 5);

        // Increase particle generation when hovering over interactive elements
        if (hoveredElement) {
            const hoverDuration = Date.now() - hoverStartTime;
            const hoverBonus = Math.min(hoverDuration / 1000, 1) * hoveredElement.importance;
            particleCount = Math.min(particleCount + Math.floor(hoverBonus * 3), 8);
        }

        for (let i = 0; i < particleCount; i++) {
            if (particles.length < maxParticles) {
                const particle = getPooledParticle(
                    mouse.x + (Math.random() - 0.5) * 15,
                    mouse.y + (Math.random() - 0.5) * 15
                );

                // Give particles near hovered elements special properties
                if (hoveredElement) {
                    const distanceToHovered = particle.getDistanceToElement(hoveredElement);
                    if (distanceToHovered < hoveredElement.magneticRadius * 0.5) {
                        particle.life *= 1.3; // Live longer
                        particle.originalSize *= 1.2; // Slightly larger
                        particle.energy = 1.0; // Full energy
                    }
                }

                particles.push(particle);
            }
        }
    }

    // Smart animation loop with layered particle system and advanced behaviors
    function animate() {
        ctx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);

        // Update section colors
        updateSectionColors();

        // Update interactive elements for magnetic effects
        updateInteractiveElements();

        // Update global idle state and create ambient particles
        updateGlobalIdleState();

        // Draw background particles first (deep space layer)
        for (let i = 0; i < backgroundParticles.length; i++) {
            backgroundParticles[i].update();
            backgroundParticles[i].draw();
        }

        // Draw smart interactive particles on top
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            // Smart particle cleanup with pooling
            if (particles[i].life <= 0 || particles[i].size <= 0.1) {
                returnParticleToPool(particles[i]);
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    // Click burst effect for interactive elements
    function handleGlobalClick(e) {
        if (hoveredElement) {
            const burstCount = Math.floor(hoveredElement.importance * 15) + 5;
            const rect = hoveredElement.rect;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Create burst particles
            for (let i = 0; i < burstCount; i++) {
                if (particles.length < maxParticles + 10) { // Allow temporary overflow for bursts
                    const angle = (Math.PI * 2 * i) / burstCount;
                    const speed = 3 + Math.random() * 4;
                    const distance = 20 + Math.random() * 30;

                    const particle = getPooledParticle(
                        centerX + Math.cos(angle) * distance,
                        centerY + Math.sin(angle) * distance
                    );

                    // Give burst particles special properties
                    particle.speedX = Math.cos(angle) * speed;
                    particle.speedY = Math.sin(angle) * speed;
                    particle.originalSize *= 1.5;
                    particle.size = particle.originalSize;
                    particle.life = 1.2;
                    particle.decay *= 0.7; // Live longer

                    particles.push(particle);
                }
            }

            console.log(`🧲 [MAGNETIC] ✨ Click burst on ${hoveredElement.selector} with ${burstCount} particles`);
        }
    }

    // Initialize the deep space background
    initializeBackgroundParticles();

    // Start the global system
    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    document.addEventListener('click', handleGlobalClick, { passive: true });

    // Add scroll listener for section detection
    window.addEventListener('scroll', updateSectionColors, { passive: true });

    animate();
    console.log('🖱️ [SMART PARTICLES] ✅ Smart deep space particle system with advanced behaviors started');
    console.log(`🌌 [DEEP SPACE] Background: ${maxBackgroundParticles} particles | Interactive: ${maxParticles} particles`);
    console.log('🧠 [SMART BEHAVIORS] Shape-changing, magnetic attraction, idle states, and particle pooling active');
}

// Gradient Text Animation
function initGradientTextAnimation() {
    console.log('🎭 [GRADIENT] Initializing gradient text animation...');

    // Check if already initialized
    if (document.body.hasAttribute('data-gradient-text-initialized')) {
        console.log('🎭 [GRADIENT] ❌ Already initialized, skipping...');
        return;
    }

    const gradientTexts = document.querySelectorAll('.gradient-text');
    console.log('🎭 [GRADIENT] Found gradient text elements:', gradientTexts.length);

    if (!gradientTexts.length) {
        console.log('🎭 [GRADIENT] ❌ No gradient text elements found');
        return;
    }

    // Mark as initialized FIRST to prevent any race conditions
    document.body.setAttribute('data-gradient-text-initialized', 'true');
    console.log('🎭 [GRADIENT] ✅ Marked as initialized');

    // Enhanced gradient animation with Anime.js
    function createGradientFlow() {
        gradientTexts.forEach((text, index) => {
            // Create dynamic gradient positions
            anime({
                targets: text,
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                duration: 6000 + (index * 1000), // Stagger the animations
                easing: 'easeInOutSine',
                loop: true,
                delay: index * 500 // Delay each text element
            });
        });
    }

    // Hover effect for gradient text
    function addHoverEffects() {
        gradientTexts.forEach(text => {
            // Check if hover effects already added
            if (!text.hasAttribute('data-hover-initialized')) {
                text.addEventListener('mouseenter', function() {
                    anime({
                        targets: this,
                        scale: [1, 1.05],
                        duration: 400,
                        easing: 'easeOutQuad'
                    });

                    // Removed gradient flow animation to prevent repetitive movement
                });

                text.addEventListener('mouseleave', function() {
                    anime({
                        targets: this,
                        scale: [null, 1],
                        duration: 400,
                        easing: 'easeOutQuad'
                    });
                });

                text.setAttribute('data-hover-initialized', 'true');
            }
        });
    }

    // Name entrance animation (handles both position and gradient) - RUNS ONLY ONCE
    function createNameEntranceAnimation() {
        console.log('🎬 [ENTRANCE] Creating name entrance animation...');

        // TEMPORARILY DISABLED - Check if animation already ran
        // if (document.body.hasAttribute('data-name-entrance-completed')) {
        //     console.log('🎬 [ENTRANCE] ❌ Animation already completed, skipping...');
        //     return;
        // }

        console.log('🎬 [ENTRANCE] ⚠️ ENTRANCE ANIMATION GUARDS DISABLED FOR TESTING');

        // Check elements exist with detailed debugging
        const nameFirst = document.querySelector('.name-first.gradient-text');
        const nameLast = document.querySelector('.name-last.gradient-text');

        console.log('🎬 [ENTRANCE] nameFirst element:', nameFirst);
        console.log('🎬 [ENTRANCE] nameLast element:', nameLast);
        console.log('🎬 [ENTRANCE] Available .name-first elements:', document.querySelectorAll('.name-first'));
        console.log('🎬 [ENTRANCE] Available .name-last elements:', document.querySelectorAll('.name-last'));
        console.log('🎬 [ENTRANCE] Available .gradient-text elements:', document.querySelectorAll('.gradient-text'));

        if (!nameFirst || !nameLast) {
            console.log('🎬 [ENTRANCE] ❌ Required elements not found! Retrying in 100ms...');

            // Retry after a short delay in case elements aren't ready yet
            setTimeout(() => {
                createNameEntranceAnimation();
            }, 100);
            return;
        }

        console.log('🎬 [ENTRANCE] ✅ Elements found, proceeding with animation');

        // Set initial hidden state immediately
        console.log('🎬 [ENTRANCE] Setting initial hidden state...');
        anime.set([nameFirst, nameLast], {
            translateX: 0,
            translateY: 0,
            scale: 1,
            opacity: 0 // Make sure they start hidden
        });

        // Set specific initial positions for dramatic entrance
        anime.set(nameFirst, {
            translateX: -50,
            opacity: 0,
            scale: 0.8
        });

        anime.set(nameLast, {
            translateX: 50,
            opacity: 0,
            scale: 0.8
        });

        console.log('🎬 [ENTRANCE] Initial state set - elements should be hidden');

        console.log('🎬 [ENTRANCE] 🎬 Starting entrance animation...');

        // Mark as completed to prevent race conditions
        document.body.setAttribute('data-name-entrance-completed', 'true');
        console.log('🎬 [ENTRANCE] ✅ Marked as completed to prevent duplicates');

        // Start animation immediately since we're called after preloader
        console.log('🎬 [ENTRANCE] 🚀 Executing entrance animation now!');

        // Animate entrance - ONLY ONCE
        anime.timeline()
            .add({
                targets: nameFirst,
                translateX: [-50, 0],
                scale: [0.8, 1.1, 1],
                opacity: [0, 1],
                duration: 1200,
                easing: 'easeOutElastic(1, .8)',
                delay: 200,
                complete: function() {
                    console.log('🎬 [ENTRANCE] ✅ nameFirst animation completed');
                }
            })
            .add({
                targets: nameLast,
                translateX: [50, 0],
                scale: [0.8, 1.1, 1],
                opacity: [0, 1],
                duration: 1200,
                easing: 'easeOutElastic(1, .8)',
                delay: 100,
                complete: function() {
                    console.log('🎬 [ENTRANCE] ✅ nameLast animation completed');
                    console.log('🎬 [ENTRANCE] 🎉 Full entrance animation sequence completed!');
                }
            }, '-=1000');
    }

    // Initialize name entrance animation
    createNameEntranceAnimation();

    console.log('🎭 [GRADIENT] ✅ Gradient text initialization complete');
}

// Clean Animated Wave Effect
function initCleanAnimatedWave() {
    console.log('🌊 [WAVE] Initializing clean animated wave...');

    // Check if already initialized
    if (document.body.hasAttribute('data-wave-initialized')) {
        console.log('🌊 [WAVE] ❌ Already initialized, skipping...');
        return;
    }

    const waveContainer = document.querySelector('.wave-container');
    const wavePrimary = document.querySelector('.wave-primary');
    const waveSecondary = document.querySelector('.wave-secondary');
    const heroText = document.querySelector('.hero-text');
    const heroSection = document.getElementById('hero');

    console.log('🌊 [WAVE] Wave container found:', !!waveContainer);
    console.log('🌊 [WAVE] Primary wave found:', !!wavePrimary);
    console.log('🌊 [WAVE] Secondary wave found:', !!waveSecondary);
    console.log('🌊 [WAVE] Hero section found:', !!heroSection);

    if (!waveContainer || !wavePrimary || !waveSecondary) {
        console.log('🌊 [WAVE] ❌ Wave elements not found - cannot initialize');
        return;
    }

    // Mark as initialized
    document.body.setAttribute('data-wave-initialized', 'true');
    console.log('🌊 [WAVE] ✅ Marked as initialized');

    // Wave animation state
    let mouseX = 0.5;
    let mouseY = 0.5;
    let scrollProgress = 0;
    let isAnimating = true;

    console.log('🌊 [WAVE] Wave system ready, setting up interactions...');

    // Subtle mouse interaction effects - barely noticeable
    function handleWaveMouseMove(e) {
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;

        // Very subtle wave opacity change on mouse move
        const intensity = 0.18 + (mouseY * 0.05);
        if (wavePrimary) {
            anime({
                targets: wavePrimary,
                opacity: intensity,
                duration: 600,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }

        // Minimal hero text movement for subtle parallax
        if (heroText) {
            const moveX = (mouseX - 0.5) * 3;
            const moveY = (mouseY - 0.5) * 2;

            anime({
                targets: heroText,
                translateX: moveX,
                translateY: moveY,
                duration: 1200,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }
    }

    // Smooth scroll-based wave behavior for seamless transition
    function handleWaveScroll() {
        const scrollY = window.scrollY;
        const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
        scrollProgress = Math.min(scrollY / heroHeight, 1);

        // Apply smooth scroll-based transformations to wave container
        if (waveContainer) {
            // Gentle fade out and transform as user scrolls - creates seamless transition
            const opacity = Math.max(1 - scrollProgress * 2, 0);
            const translateY = scrollProgress * 100;
            const scaleY = Math.max(1 - scrollProgress * 0.4, 0.6);

            anime({
                targets: waveContainer,
                translateY: translateY,
                opacity: opacity,
                scaleY: scaleY,
                duration: 200,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }

        // Subtle parallax effect on hero content
        if (heroText) {
            const parallaxOffset = scrollProgress * 20;
            anime({
                targets: heroText,
                translateY: -parallaxOffset,
                duration: 200,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }
    }

    // Subtle hover effect - barely noticeable enhancement
    function handleMouseEnter() {
        console.log('🌊 [WAVE] Mouse entered - subtle enhancement');
        if (wavePrimary) {
            anime({
                targets: wavePrimary,
                opacity: 0.25,
                filter: 'brightness(1.05)',
                duration: 800,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }
        if (waveSecondary) {
            anime({
                targets: waveSecondary,
                opacity: 0.15,
                filter: 'brightness(1.03)',
                duration: 800,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }
    }

    // Mouse leave - return to subtle state
    function handleMouseLeave() {
        console.log('🌊 [WAVE] Mouse left - returning to subtle state');
        if (wavePrimary) {
            anime({
                targets: wavePrimary,
                opacity: 0.2,
                filter: 'brightness(1)',
                duration: 800,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }
        if (waveSecondary) {
            anime({
                targets: waveSecondary,
                opacity: 0.12,
                filter: 'brightness(1)',
                duration: 800,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }
    }

    // Subtle click effect - gentle wave pulse
    function handleMouseClick(e) {
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / rect.width;
        const clickY = (e.clientY - rect.top) / rect.height;

        // Create subtle wave pulse effect
        createWavePulse();

        console.log('🌊 [WAVE] Subtle pulse effect triggered at', clickX, clickY);
    }

    // Create subtle wave pulse effect
    function createWavePulse() {
        // Gentle pulse on both waves
        if (wavePrimary) {
            anime({
                targets: wavePrimary,
                opacity: [0.2, 0.3, 0.2],
                filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'],
                duration: 1000,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)'
            });
        }

        if (waveSecondary) {
            anime({
                targets: waveSecondary,
                opacity: [0.12, 0.18, 0.12],
                filter: ['brightness(1)', 'brightness(1.05)', 'brightness(1)'],
                duration: 1000,
                easing: 'cubicBezier(0.4, 0, 0.2, 1)',
                delay: 150
            });
        }

        console.log('🌊 [WAVE] Subtle pulse effect applied');
    }





    // Initialize clean wave system
    console.log('🌊 [WAVE] Initializing clean wave animations...');

    // Add mouse interaction (prevent duplicate listeners)
    if (heroSection && !heroSection.hasAttribute('data-wave-initialized')) {
        heroSection.addEventListener('mousemove', handleWaveMouseMove);
        heroSection.addEventListener('mouseenter', handleMouseEnter);
        heroSection.addEventListener('mouseleave', handleMouseLeave);
        heroSection.addEventListener('click', handleMouseClick);

        // Prevent text selection on rapid clicks
        heroSection.addEventListener('selectstart', function(e) {
            e.preventDefault();
        });

        // Add scroll listener for wave behavior
        window.addEventListener('scroll', handleWaveScroll, { passive: true });

        heroSection.setAttribute('data-wave-initialized', 'true');
        console.log('🌊 [WAVE] ✅ Clean wave interactions and scroll behavior initialized');
    }
}

// Legacy Orbital Preloader (replaced by modern preloader)
function initOrbitalPreloader() {
    console.log('Legacy preloader disabled - using modern preloader instead');
    return;
    const preloader = document.getElementById('preloader');
    const decodedName = document.getElementById('decodedName');
    const decodingOverlay = document.getElementById('decodingOverlay');
    const orbitContainer = document.getElementById('orbitContainer');
    const progressFill = document.getElementById('progressFill');
    const loadingText = document.getElementById('loadingText');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingStatusText = document.getElementById('loadingStatusText');
    const skipButton = document.getElementById('skipPreloader');

    if (!preloader) return;

    // Configuration
    const config = {
        maxDuration: 2500, // Reduced from 4500ms
        targetText: 'LOADING',
        characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*',
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // State management
    let state = {
        progress: 0,
        isSkipped: false,
        isCompleted: false,
        intervals: [],
        timeouts: [],
        resourcesLoaded: 0,
        totalResources: 0
    };

    // Loading messages
    const loadingMessages = [
        'INITIALIZING SYSTEMS...',
        'LOADING RESOURCES...',
        'CALIBRATING INTERFACE...',
        'DECODING IDENTITY...',
        'ESTABLISHING CONNECTION...',
        'READY TO LAUNCH...'
    ];

    // Cleanup function
    function cleanup() {
        state.intervals.forEach(id => clearInterval(id));
        state.timeouts.forEach(id => clearTimeout(id));
        state.intervals = [];
        state.timeouts = [];
    }

    // Skip functionality
    function skipPreloader() {
        if (state.isCompleted) return;
        state.isSkipped = true;
        cleanup();
        completePreloader();
    }

    // Resource loading monitoring
    function initResourceMonitoring() {
        const resources = [
            ...document.querySelectorAll('img'),
            ...document.querySelectorAll('link[rel="stylesheet"]'),
            ...document.querySelectorAll('script[src]')
        ];

        state.totalResources = resources.length;

        if (state.totalResources === 0) {
            state.resourcesLoaded = 1;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            let loadedCount = 0;

            const checkComplete = () => {
                loadedCount++;
                state.resourcesLoaded = loadedCount / state.totalResources;

                if (loadedCount >= state.totalResources) {
                    resolve();
                }
            };

            resources.forEach(resource => {
                if (resource.complete || resource.readyState === 'complete') {
                    checkComplete();
                } else {
                    resource.addEventListener('load', checkComplete);
                    resource.addEventListener('error', checkComplete);
                }
            });

            // Fallback timeout
            const timeoutId = setTimeout(() => {
                state.resourcesLoaded = 1;
                resolve();
            }, 3000);
            state.timeouts.push(timeoutId);
        });
    }

    // Start the preloader sequence
    function startPreloaderSequence() {
        // Skip button event
        skipButton.addEventListener('click', skipPreloader);

        // Start resource monitoring
        initResourceMonitoring().then(() => {
            if (!state.isSkipped) {
                updateLoadingStatus('Resources loaded');
            }
        });

        if (config.reducedMotion) {
            // Simplified sequence for reduced motion
            startSimplifiedSequence();
        } else {
            // Full animation sequence
            startFullSequence();
        }
    }

    function startSimplifiedSequence() {
        // Show elements immediately without complex animations
        anime.set('.orbit', { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' });
        anime.set('.skill-icon', { opacity: 1, transform: 'scale(1)' });

        startDecoding();
        startProgressAnimation();

        const timeoutId = setTimeout(() => completePreloader(), config.maxDuration);
        state.timeouts.push(timeoutId);
    }

    function startFullSequence() {
        // 1. Start 3D orbit approach
        expandOrbits();

        // 2. Start decoding animation when orbits are approaching
        const timeout1 = setTimeout(() => startDecoding(), 600);
        state.timeouts.push(timeout1);

        // 3. Start progress animation
        const timeout2 = setTimeout(() => startProgressAnimation(), 800);
        state.timeouts.push(timeout2);

        // 4. Complete after reduced duration
        const timeout3 = setTimeout(() => completePreloader(), config.maxDuration);
        state.timeouts.push(timeout3);
    }

    // Update loading status
    function updateLoadingStatus(message) {
        if (loadingStatusText) {
            loadingStatusText.textContent = message;
        }
    }

    // 3D Orbit approach animation (optimized)
    function expandOrbits() {
        const orbits = document.querySelectorAll('.orbit');
        const skillIcons = document.querySelectorAll('.skill-icon');

        // Error handling
        if (!orbits.length) return;

        // Orbits start far away in 3D space
        anime.set(orbits, {
            translateZ: -500,
            scale: 0.1,
            opacity: 0
        });

        anime.set(skillIcons, {
            scale: 0,
            opacity: 0,
            translateZ: 0
        });

        // Reduced animation durations for better performance
        const baseAnimation = {
            translateZ: [-500, 0],
            scale: [0.1, 1],
            opacity: [0, 1],
            easing: 'easeOutCubic'
        };

        // Mobile optimization
        const isMobile = window.innerWidth <= 768;
        const duration = isMobile ? 800 : 1200;

        anime({
            targets: '.orbit-inner',
            ...baseAnimation,
            rotateY: [0, 180],
            duration: duration,
            delay: 0
        });

        anime({
            targets: '.orbit-middle',
            ...baseAnimation,
            rotateY: [0, 180],
            duration: duration + 100,
            delay: 150
        });

        anime({
            targets: '.orbit-outer',
            ...baseAnimation,
            rotateY: [0, 180],
            duration: duration + 200,
            delay: 300
        });

        // Skill icons appear after orbits arrive
        anime({
            targets: skillIcons,
            scale: [0, 1],
            opacity: [0, 1],
            rotateX: [90, 0],
            duration: 400,
            delay: anime.stagger(40, {start: duration + 200}),
            easing: 'easeOutBack(1.7)'
        });
    }

    // Decoding animation for the name (optimized)
    function startDecoding() {
        if (!decodingOverlay || !decodedName) return;

        let iterations = 0;
        const maxIterations = config.reducedMotion ? 5 : 15; // Faster decoding
        let decodingSpeed = config.reducedMotion ? 200 : 60; // Faster initial speed

        // Show decoding overlay initially
        anime.set(decodingOverlay, { opacity: 1 });

        const decodingInterval = setInterval(() => {
            if (state.isSkipped || state.isCompleted) {
                clearInterval(decodingInterval);
                return;
            }

            let decodedText = '';

            // Progressive decoding - each character locks in place
            for (let i = 0; i < config.targetText.length; i++) {
                if (iterations > i * 1.2 + 3) { // Faster character reveal
                    decodedText += config.targetText[i];
                } else {
                    decodedText += config.characters[Math.floor(Math.random() * config.characters.length)];
                }
            }

            decodingOverlay.textContent = decodedText;
            iterations++;

            // Speed up decoding over time
            if (iterations > 8) {
                decodingSpeed = Math.max(30, decodingSpeed - 2);
            }

            if (iterations >= maxIterations) {
                clearInterval(decodingInterval);

                if (config.reducedMotion) {
                    // Simple fade for reduced motion
                    anime({
                        targets: decodingOverlay,
                        opacity: [1, 0],
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                } else {
                    // Final reveal with glitch effect
                    anime({
                        targets: decodingOverlay,
                        opacity: [1, 0, 1, 0],
                        duration: 200,
                        easing: 'steps(4)',
                        complete: function() {
                            // Smooth fade to reveal real name
                            anime({
                                targets: decodingOverlay,
                                opacity: [1, 0],
                                duration: 300,
                                easing: 'easeOutQuad'
                            });

                            // DISABLED: Pulse the decoded name to prevent conflicts with hero section
                            // anime({
                            //     targets: decodedName,
                            //     scale: [1, 1.05, 1],
                            //     textShadow: [
                            //         '0 0 10px rgba(0, 212, 255, 0.5)',
                            //         '0 0 15px rgba(0, 212, 255, 0.8)',
                            //         '0 0 10px rgba(0, 212, 255, 0.5)'
                            //     ],
                            //     duration: 400,
                            //     easing: 'easeOutElastic(1, .8)'
                            // });
                        }
                    });
                }
            }
        }, decodingSpeed);

        state.intervals.push(decodingInterval);
    }

    // Progress animation with real resource monitoring
    function startProgressAnimation() {
        let messageIndex = 0;
        let displayProgress = 0;

        const progressInterval = setInterval(() => {
            if (state.isSkipped || state.isCompleted) {
                clearInterval(progressInterval);
                return;
            }

            // Combine real resource loading with simulated progress
            const targetProgress = Math.min(
                (state.resourcesLoaded * 70) + (displayProgress * 0.3),
                100
            );

            // Smooth progress increment
            if (displayProgress < targetProgress) {
                displayProgress += Math.random() * 8 + 2;
            }

            if (displayProgress >= 100) {
                displayProgress = 100;
                clearInterval(progressInterval);
            }

            // Update progress bar with hardware acceleration
            if (progressFill) {
                anime({
                    targets: progressFill,
                    width: displayProgress + '%',
                    duration: 150,
                    easing: 'easeOutQuad'
                });
            }

            // Update percentage
            if (loadingPercentage) {
                loadingPercentage.textContent = Math.floor(displayProgress) + '%';
            }

            // Update loading message based on progress
            const newMessageIndex = Math.min(
                Math.floor((displayProgress / 100) * loadingMessages.length),
                loadingMessages.length - 1
            );

            if (newMessageIndex > messageIndex && loadingText) {
                messageIndex = newMessageIndex;
                loadingText.textContent = loadingMessages[messageIndex];

                // Update status based on progress
                if (displayProgress < 30) {
                    updateLoadingStatus('Loading assets...');
                } else if (displayProgress < 70) {
                    updateLoadingStatus('Processing data...');
                } else if (displayProgress < 90) {
                    updateLoadingStatus('Finalizing...');
                } else {
                    updateLoadingStatus('Ready!');
                }
            }

            state.progress = displayProgress;
        }, 100);

        state.intervals.push(progressInterval);
    }

    // Complete preloader and transition to main site
    function completePreloader() {
        if (state.isCompleted) return;
        state.isCompleted = true;

        // Cleanup all intervals and timeouts
        cleanup();

        // Final message with glow effect
        if (loadingText) {
            loadingText.textContent = 'LAUNCH COMPLETE!';
        }

        updateLoadingStatus('Complete!');

        if (config.reducedMotion) {
            // Simple fade out for reduced motion
            anime({
                targets: preloader,
                opacity: [1, 0],
                duration: 500,
                easing: 'easeOutQuad',
                complete: function() {
                    preloader.style.display = 'none';
                    initMainAnimations();
                }
            });
            return;
        }

        // Animate final elements
        anime({
            targets: [loadingText, loadingPercentage],
            color: ['#00d4ff', '#4ecdcc', '#00d4ff'],
            textShadow: [
                '0 0 5px rgba(0, 212, 255, 0.5)',
                '0 0 15px rgba(0, 212, 255, 0.8)',
                '0 0 5px rgba(0, 212, 255, 0.5)'
            ],
            duration: 600,
            easing: 'easeInOutSine'
        });

        // Smooth multi-stage exit with error handling
        const timeout1 = setTimeout(() => {
            // Stage 1: Fade out progress and text
            anime({
                targets: '.loading-progress-container',
                opacity: [1, 0],
                translateY: [0, 20],
                duration: 400,
                easing: 'easeInQuad'
            });

            // Stage 2: Shrink orbits
            const timeout2 = setTimeout(() => {
                anime({
                    targets: '.orbit',
                    scale: [1, 0],
                    opacity: [1, 0],
                    duration: 500,
                    delay: anime.stagger(50),
                    easing: 'easeInBack(1.7)'
                });

                anime({
                    targets: '.skill-icon',
                    scale: [1, 0],
                    opacity: [1, 0],
                    duration: 400,
                    delay: anime.stagger(30),
                    easing: 'easeInQuad'
                });
            }, 200);

            // Stage 3: DISABLED Final name pulse and fade to prevent conflicts
            const timeout3 = setTimeout(() => {
                // DISABLED: decodedName animation to prevent conflicts with hero section
                // if (decodedName) {
                //     anime({
                //         targets: decodedName,
                //         scale: [1, 1.2],
                //         opacity: [1, 0],
                //         textShadow: [
                //             '0 0 10px rgba(0, 212, 255, 0.5)',
                //             '0 0 30px rgba(0, 212, 255, 1)'
                //         ],
                //         duration: 600,
                //         easing: 'easeInQuad'
                //     });
                // }
            }, 500);

            // Stage 4: Final preloader fade
            const timeout4 = setTimeout(() => {
                anime({
                    targets: preloader,
                    opacity: [1, 0],
                    duration: 600,
                    easing: 'easeInOutQuad',
                    complete: function() {
                        preloader.style.display = 'none';
                        // Initialize main animations
                        initMainAnimations();
                    }
                });
            }, 1000);
        }, 400);
    }

    // Error handling
    function handleError(error) {
        console.warn('Preloader error:', error);
        preloader.classList.add('error');
        updateLoadingStatus('Error occurred, continuing...');

        // Continue with simplified completion
        const timeoutId = setTimeout(() => {
            completePreloader();
        }, 1000);
        state.timeouts.push(timeoutId);
    }

    // Initialize with error handling
    try {
        startPreloaderSequence();
    } catch (error) {
        handleError(error);
    }

    // Fallback timeout to ensure preloader never gets stuck
    const fallbackTimeout = setTimeout(() => {
        if (!state.isCompleted) {
            console.warn('Preloader fallback timeout triggered');
            completePreloader();
        }
    }, 5000); // 5 second maximum
    state.timeouts.push(fallbackTimeout);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && !state.isCompleted) {
            // Page is hidden, speed up completion
            state.isSkipped = true;
            completePreloader();
        }
    });

    // Handle window beforeunload
    window.addEventListener('beforeunload', () => {
        cleanup();
    });
}

// CV Download Button Animation
function initCVDownloadButton() {
    const cvButton = document.querySelector('.cv-download');

    if (!cvButton) {
        console.log('🔗 [CV BUTTON] CV download button not found');
        return;
    }

    console.log('🔗 [CV BUTTON] Initializing CV download button animations');

    // Add click animation
    cvButton.addEventListener('click', function(e) {
        // Add download animation
        anime({
            targets: this,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuad'
        });

        // Animate the icon
        anime({
            targets: this.querySelector('i'),
            translateY: [0, -2, 0],
            duration: 300,
            easing: 'easeOutElastic(1, .8)',
            delay: 100
        });

        console.log('🔗 [CV BUTTON] CV download initiated');
    });

    // Enhanced hover effects
    cvButton.addEventListener('mouseenter', function() {
        anime({
            targets: this.querySelector('i'),
            scale: 1.1,
            rotate: '5deg',
            duration: 300,
            easing: 'easeOutQuad'
        });
    });

    cvButton.addEventListener('mouseleave', function() {
        anime({
            targets: this.querySelector('i'),
            scale: 1,
            rotate: '0deg',
            duration: 300,
            easing: 'easeOutQuad'
        });
    });

    console.log('🔗 [CV BUTTON] CV download button animations initialized');
}

// Enhanced initialization state tracking to prevent double animations
const AnimationManager = {
    initialized: false,
    initializationPromise: null,
    initializationSource: null,

    async initialize(source = 'unknown') {
        console.log('🚀 [ANIMATION MANAGER] ===== INITIALIZATION REQUEST =====');
        console.log('🚀 [ANIMATION MANAGER] Source:', source);
        console.log('🚀 [ANIMATION MANAGER] Current status:', this.initialized);
        console.log('🚀 [ANIMATION MANAGER] Timestamp:', new Date().toISOString());

        // If already initialized, return immediately
        if (this.initialized) {
            console.log('🚀 [ANIMATION MANAGER] ❌ Already initialized by:', this.initializationSource);
            return Promise.resolve();
        }

        // If initialization is in progress, return the existing promise
        if (this.initializationPromise) {
            console.log('🚀 [ANIMATION MANAGER] ⏳ Initialization in progress, waiting...');
            return this.initializationPromise;
        }

        // Start new initialization
        console.log('🚀 [ANIMATION MANAGER] ✅ Starting new initialization...');
        this.initializationSource = source;

        this.initializationPromise = this._performInitialization();

        try {
            await this.initializationPromise;
            this.initialized = true;
            console.log('🚀 [ANIMATION MANAGER] ✅ Initialization completed successfully');
        } catch (error) {
            console.error('🚀 [ANIMATION MANAGER] ❌ Initialization failed:', error);
            this.initializationPromise = null; // Allow retry
            throw error;
        }

        return this.initializationPromise;
    },

    async _performInitialization() {
        console.log('🚀 [ANIMATION MANAGER] 🎬 Performing initialization...');

        // Wait for DOM to be ready if needed
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }

        // Initialize hero animations first with detailed logging
        console.log('🚀 [ANIMATION MANAGER] 📍 Step 1: Calling initHeroAnimations()');
        initHeroAnimations();

        console.log('🚀 [ANIMATION MANAGER] 📍 Step 2: Calling initTypingAnimation()');
        initTypingAnimation();

        console.log('🚀 [ANIMATION MANAGER] 📍 Step 3: Calling initGradientTextAnimation()');
        initGradientTextAnimation();

        console.log('🚀 [ANIMATION MANAGER] 📍 Step 4: Calling initMouseTrailParticles()');
        initMouseTrailParticles();

        console.log('🚀 [ANIMATION MANAGER] 📍 Step 5: Calling initCleanAnimatedWave()');
        initCleanAnimatedWave();

        // Initialize other sections
        console.log('🚀 [ANIMATION MANAGER] 📍 Step 6: Initializing other sections...');
        initCardAnimations();
        initCardHoverEffects();
        initSkillTagAnimations();
        initLanguageProgressAnimations();
        initTimelineAnimations();
        initEvolutionAnimations();
        initInteractiveEvolution();
        initNetworkAnimation();
        initPortfolioAnimations();
        initVideoModal();
        initPortfolioLinks();
        initTerminalContact();
        initTerminalAnimations();
        initTerminalTyping();
        initCVDownloadButton();

        console.log('🚀 [ANIMATION MANAGER] ✅ All animations initialized successfully');
    }
};

// Legacy function for backward compatibility
function initMainAnimations() {
    return AnimationManager.initialize('legacy-call');
}

// Listen for preloader completion
document.addEventListener('preloaderComplete', function(event) {
    console.log('🎯 [EVENT DEBUG] ===== PRELOADER COMPLETE EVENT FIRED =====');
    console.log('🎯 [EVENT DEBUG] Event detail:', event.detail);
    console.log('🎯 [EVENT DEBUG] Timestamp:', new Date().toISOString());
    console.log('🎯 [EVENT DEBUG] About to initialize animations via AnimationManager...');
    AnimationManager.initialize('preloader-complete');
});

// TESTING: Direct animation initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 [EVENT DEBUG] ===== DOM CONTENT LOADED EVENT FIRED =====');
    console.log('🎯 [EVENT DEBUG] Timestamp:', new Date().toISOString());
    console.log('🎯 [EVENT DEBUG] Document readyState:', document.readyState);

    // Initialize EmailJS first
    console.log('🎯 [EVENT DEBUG] Initializing EmailJS...');
    initEmailJS();

    // TESTING: Start animations immediately without preloader
    console.log('🎯 [EVENT DEBUG] ⚠️ STARTING ANIMATIONS IMMEDIATELY FOR TESTING');
    setTimeout(() => {
        console.log('🎯 [EVENT DEBUG] ===== DIRECT ANIMATION INITIALIZATION =====');
        AnimationManager.initialize('direct-testing');
    }, 500); // Short delay to ensure DOM is ready
});

// Cleanup function to prevent memory leaks and animation conflicts
function cleanupAnimations() {
    console.log('🧹 [CLEANUP] Cleaning up animations...');

    // Stop all anime.js animations
    anime.running.forEach(animation => {
        if (animation.pause) animation.pause();
    });

    // Clear any timeouts and intervals
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
    }

    const highestIntervalId = setInterval(() => {}, 0);
    clearInterval(highestIntervalId);
    for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
    }

    // Reset initialization flags
    document.body.removeAttribute('data-hero-animations-initialized');
    document.body.removeAttribute('data-hero-animations-completed');
    document.body.removeAttribute('data-typing-animation-initialized');
    document.body.removeAttribute('data-gradient-text-initialized');
    document.body.removeAttribute('data-name-entrance-completed');
    document.body.removeAttribute('data-mouse-particles-initialized');
    document.body.removeAttribute('data-wave-distortion-initialized');

    // Reset AnimationManager
    AnimationManager.initialized = false;
    AnimationManager.initializationPromise = null;
    AnimationManager.initializationSource = null;

    console.log('🧹 [CLEANUP] Cleanup complete');
}

// Add cleanup listeners
window.addEventListener('beforeunload', cleanupAnimations);
window.addEventListener('pagehide', cleanupAnimations);

// For development: add a global cleanup function
window.cleanupAnimations = cleanupAnimations;
