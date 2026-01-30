/* =============================================
   PITCH PAGE: For 8020REI
   JavaScript - Animations & Interactivity
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initParticleBackground();
    initScrollReveal();
    initProblemSection();
    initMetricCounters();
    initSmoothScroll();
});

/* =============================================
   PARTICLE BACKGROUND
   ============================================= */
function initParticleBackground() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('particleBg');

    if (!container) return;

    container.appendChild(canvas);

    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${particle.alpha})`;
            ctx.fill();

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });

        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - dist / 120)})`;
                    ctx.stroke();
                }
            });
        });

        animationId = requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    // Pause when not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            drawParticles();
        }
    });
}

/* =============================================
   SCROLL REVEAL ANIMATIONS
   ============================================= */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.skill-card, .metric-card, .tech-category, .why-card, .ai-showcase, .proof-tag, .help-card'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

/* =============================================
   PROBLEM SECTION - LINE BY LINE REVEAL
   ============================================= */
function initProblemSection() {
    const problemLines = document.querySelectorAll('.problem-line, .problem-summary');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay * 300);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    problemLines.forEach(line => {
        observer.observe(line);
    });
}

/* =============================================
   METRIC COUNTERS - COUNT UP ANIMATION
   ============================================= */
function initMetricCounters() {
    const metricNumbers = document.querySelectorAll('.metric-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    metricNumbers.forEach(num => {
        observer.observe(num);
    });
}

function animateCounter(element, target) {
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

/* =============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================= */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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

/* =============================================
   HERO ENTRANCE ANIMATION
   ============================================= */
window.addEventListener('load', function() {
    // Animate hero elements on page load
    const heroContent = document.querySelector('.hero-content');

    if (heroContent && typeof anime !== 'undefined') {
        anime.timeline({
            easing: 'easeOutExpo'
        })
        .add({
            targets: '.hero-label',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800
        })
        .add({
            targets: '.hero-headline',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 1000
        }, '-=400')
        .add({
            targets: '.hero-subheadline',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800
        }, '-=600')
        .add({
            targets: '.hero-cta',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800
        }, '-=400')
        .add({
            targets: '.scroll-indicator',
            opacity: [0, 1],
            duration: 600
        }, '-=200');
    }
});
