/**
 * Modern Preloader System with Service Worker Integration
 * Follows modern loading patterns and best practices
 */

// IMMEDIATE TEST - This should show in console if file loads
console.log('🔥 [IMMEDIATE TEST] preloader-modern.js file loaded successfully!');
console.log('🔥 [IMMEDIATE TEST] Timestamp:', new Date().toISOString());
console.log('🔥 [IMMEDIATE TEST] Document readyState:', document.readyState);
console.log('🔥 [IMMEDIATE TEST] Anime.js available:', typeof anime !== 'undefined');

class ModernPreloader {
  constructor(options = {}) {
    this.config = {
      maxDuration: 1000, // Reduced by another 500ms (from 1500ms to 1000ms)
      minDuration: 400,  // Reduced proportionally (from 600ms to 400ms)
      targetText: 'LOADING',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      debug: false,
      ...options
    };

    this.state = {
      isActive: false,
      isCompleted: false,
      isSkipped: false,
      startTime: null,
      progress: 0,
      resourcesLoaded: 0,
      totalResources: 0,
      cacheStatus: null,
      intervals: new Set(),
      timeouts: new Set(),
      animations: new Set()
    };

    this.elements = {};
    this.loadingStages = [
      { name: 'INITIALIZING SYSTEMS...', weight: 0.1 },
      { name: 'LOADING RESOURCES...', weight: 0.3 },
      { name: 'PROCESSING DATA...', weight: 0.3 },
      { name: 'FINALIZING INTERFACE...', weight: 0.2 },
      { name: 'READY TO LAUNCH...', weight: 0.1 }
    ];

    this.init();
  }

  async init() {
    try {
      this.cacheElements();
      this.setupEventListeners();
      await this.start();
    } catch (error) {
      this.handleError('Initialization failed', error);
    }
  }

  cacheElements() {
    const elementIds = [
      'preloader', 'decodedName', 'decodingOverlay', 'orbitContainer',
      'progressFill', 'loadingText', 'loadingPercentage', 'loadingStatus',
      'loadingStatusText', 'skipPreloader'
    ];

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });

    // Validate critical elements
    if (!this.elements.preloader) {
      throw new Error('Preloader element not found');
    }
  }

  setupEventListeners() {
    // Skip button
    if (this.elements.skipPreloader) {
      this.elements.skipPreloader.addEventListener('click', () => this.skip());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isActive) {
        this.skip();
      }
    });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.isActive) {
        this.skip();
      }
    });

    // Window beforeunload
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  // Service Worker functionality removed - not needed for simple portfolio

  async start() {
    if (this.state.isActive) return;

    this.state.isActive = true;
    this.state.startTime = performance.now();
    this.log('Preloader started');

    // Show preloader
    if (this.elements.preloader) {
      this.elements.preloader.style.display = 'flex';
      this.elements.preloader.classList.remove('hidden');
    }

    // Start loading sequence
    await Promise.all([
      this.startResourceMonitoring(),
      this.startAnimationSequence(),
      this.startProgressTracking()
    ]);
  }

  async startResourceMonitoring() {
    // Simplified resource monitoring without service worker complexity
    this.log('Starting simplified resource monitoring');

    // Quick resource simulation for smooth progress animation (faster timing)
    setTimeout(() => {
      this.state.resourcesLoaded = 0.3;
      this.log('Resource loading: 30%');
    }, 50);

    setTimeout(() => {
      this.state.resourcesLoaded = 0.7;
      this.log('Resource loading: 70%');
    }, 150);

    setTimeout(() => {
      this.state.resourcesLoaded = 1;
      this.log('Resource loading complete');
    }, 250);
  }

  async startAnimationSequence() {
    if (this.config.reducedMotion) {
      return this.startReducedMotionSequence();
    }

    // Start orbit animations
    this.animateOrbits();
    
    // Start name decoding
    await this.delay(600);
    this.startNameDecoding();
  }

  startReducedMotionSequence() {
    // Show elements immediately without complex animations
    const elements = document.querySelectorAll('.orbit, .skill-icon');
    elements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    this.startNameDecoding();
  }

  animateOrbits() {
    const orbits = document.querySelectorAll('.orbit');
    const skillIcons = document.querySelectorAll('.skill-icon');

    if (!orbits.length) return;

    // Set initial state
    anime.set(orbits, {
      scale: 0.1,
      opacity: 0
    });

    anime.set(skillIcons, {
      scale: 0,
      opacity: 0
    });

    // Animate orbits entrance
    const orbitAnimation = anime({
      targets: orbits,
      scale: [0.1, 1],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(200),
      easing: 'easeOutCubic'
    });

    this.state.animations.add(orbitAnimation);

    // Animate skill icons
    const iconAnimation = anime({
      targets: skillIcons,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(80, { start: 800 }),
      easing: 'easeOutBack(1.7)'
    });

    this.state.animations.add(iconAnimation);
  }

  startNameDecoding() {
    if (!this.elements.decodingOverlay || !this.elements.decodedName) return;

    let iterations = 0;
    const maxIterations = this.config.reducedMotion ? 3 : 12;
    const speed = this.config.reducedMotion ? 300 : 80;

    anime.set(this.elements.decodingOverlay, { opacity: 1 });

    const intervalId = setInterval(() => {
      if (this.state.isCompleted || this.state.isSkipped) {
        clearInterval(intervalId);
        return;
      }

      let decodedText = '';
      for (let i = 0; i < this.config.targetText.length; i++) {
        if (iterations > i * 1.2 + 2) {
          decodedText += this.config.targetText[i];
        } else {
          decodedText += this.config.characters[Math.floor(Math.random() * this.config.characters.length)];
        }
      }

      this.elements.decodingOverlay.textContent = decodedText;
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(intervalId);
        this.finishNameDecoding();
      }
    }, speed);

    this.state.intervals.add(intervalId);
  }

  finishNameDecoding() {
    if (!this.elements.decodingOverlay) return;

    const fadeAnimation = anime({
      targets: this.elements.decodingOverlay,
      opacity: [1, 0],
      duration: 400,
      easing: 'easeOutQuad'
    });

    this.state.animations.add(fadeAnimation);

    // DISABLED: Pulse animation to prevent conflicts with hero section Alex Castro text
    // if (!this.config.reducedMotion && this.elements.decodedName) {
    //   const pulseAnimation = anime({
    //     targets: this.elements.decodedName,
    //     scale: [1, 1.05, 1],
    //     duration: 600,
    //     easing: 'easeOutElastic(1, .8)'
    //   });

    //   this.state.animations.add(pulseAnimation);
    // }
  }

  async startProgressTracking() {
    let currentStage = 0;
    let displayProgress = 0;

    const intervalId = setInterval(() => {
      if (this.state.isCompleted || this.state.isSkipped) {
        clearInterval(intervalId);
        return;
      }

      // Simplified progress calculation
      const elapsed = performance.now() - this.state.startTime;
      const timeProgress = Math.min((elapsed / this.config.maxDuration) * 100, 100);
      const resourceProgress = this.state.resourcesLoaded * 100;

      // Combine time and resource progress
      const targetProgress = Math.max(timeProgress, resourceProgress);

      // Balanced progress update
      if (displayProgress < targetProgress) {
        const increment = Math.min(targetProgress - displayProgress, Math.random() * 6 + 3); // Balanced increment
        displayProgress += increment;
      }

      displayProgress = Math.min(displayProgress, 100);
      this.state.progress = displayProgress;

      // Update UI
      this.updateProgressUI(displayProgress);

      // Update stage
      const newStage = Math.floor((displayProgress / 100) * this.loadingStages.length);
      if (newStage > currentStage && newStage < this.loadingStages.length) {
        currentStage = newStage;
        this.updateLoadingStage(currentStage);
      }

      // Check completion
      if (displayProgress >= 100 && this.state.resourcesLoaded >= 0.8) {
        clearInterval(intervalId);
        this.scheduleCompletion();
      }
    }, 50); // Faster update interval (was 100ms)

    this.state.intervals.add(intervalId);
  }

  updateProgressUI(progress) {
    if (this.elements.progressFill) {
      // Use direct style update for smoother progress bar
      this.elements.progressFill.style.width = progress + '%';

      // Optional: Add smooth transition via CSS
      this.elements.progressFill.style.transition = 'width 0.2s ease-out';

      this.log(`Progress updated: ${progress.toFixed(1)}%`);
    }

    if (this.elements.loadingPercentage) {
      this.elements.loadingPercentage.textContent = Math.floor(progress) + '%';
    }
  }

  updateLoadingStage(stageIndex) {
    const stage = this.loadingStages[stageIndex];
    if (!stage) return;

    if (this.elements.loadingText) {
      this.elements.loadingText.textContent = stage.name;
    }

    if (this.elements.loadingStatusText) {
      const statusMessages = [
        'Initializing...',
        'Loading assets...',
        'Processing...',
        'Finalizing...',
        'Ready!'
      ];
      this.elements.loadingStatusText.textContent = statusMessages[stageIndex] || 'Loading...';
    }

    this.log(`Stage ${stageIndex + 1}: ${stage.name}`);
  }

  scheduleCompletion() {
    const elapsed = performance.now() - this.state.startTime;
    const remainingTime = Math.max(this.config.minDuration - elapsed, 0);

    const timeoutId = setTimeout(() => {
      this.complete();
    }, remainingTime);

    this.state.timeouts.add(timeoutId);
  }

  skip() {
    if (this.state.isCompleted || this.state.isSkipped) return;

    this.log('Preloader skipped by user');
    this.state.isSkipped = true;
    this.complete();
  }

  async complete() {
    if (this.state.isCompleted) return;

    this.state.isCompleted = true;
    this.log('Preloader completing...');

    // Cleanup
    this.cleanup();

    // Final animation
    await this.playExitAnimation();

    // Hide preloader
    if (this.elements.preloader) {
      this.elements.preloader.style.display = 'none';
    }

    // Initialize main site
    this.initializeMainSite();

    this.log('Preloader completed');
  }

  async playExitAnimation() {
    if (this.config.reducedMotion) {
      return anime({
        targets: this.elements.preloader,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeOutQuad'
      }).finished;
    }

    // Complex exit animation
    const timeline = anime.timeline({
      easing: 'easeInOutQuad'
    });

    timeline
      .add({
        targets: '.loading-progress-container',
        opacity: [1, 0],
        translateY: [0, 20],
        duration: 400
      })
      .add({
        targets: '.orbit',
        scale: [1, 0],
        opacity: [1, 0],
        duration: 500,
        delay: anime.stagger(100)
      }, '-=200')
      .add({
        targets: '.skill-icon',
        scale: [1, 0],
        opacity: [1, 0],
        duration: 400,
        delay: anime.stagger(50)
      }, '-=300')
      .add({
        targets: ['.name-decoder', '.decoded-name', '.decoding-overlay'],
        scale: [1, 0.8],
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 500,
        delay: anime.stagger(50)
      }, '-=250')
      .add({
        targets: this.elements.preloader,
        opacity: [1, 0],
        duration: 600
      }, '-=300');

    return timeline.finished;
  }

  cleanup() {
    // Clear intervals
    this.state.intervals.forEach(id => clearInterval(id));
    this.state.intervals.clear();

    // Clear timeouts
    this.state.timeouts.forEach(id => clearTimeout(id));
    this.state.timeouts.clear();

    // Stop animations
    this.state.animations.forEach(animation => {
      if (animation.pause) animation.pause();
    });
    this.state.animations.clear();
  }

  initializeMainSite() {
    // Dispatch custom event for main site initialization
    document.dispatchEvent(new CustomEvent('preloaderComplete', {
      detail: {
        duration: performance.now() - this.state.startTime,
        resourcesLoaded: this.state.resourcesLoaded,
        wasSkipped: this.state.isSkipped
      }
    }));

    // Initialize main animations if function exists
    if (typeof initMainAnimations === 'function') {
      initMainAnimations();
    }
  }

  handleError(message, error) {
    console.error(`Preloader Error: ${message}`, error);
    
    if (this.elements.preloader) {
      this.elements.preloader.classList.add('error');
    }

    if (this.elements.loadingText) {
      this.elements.loadingText.textContent = 'Error occurred, continuing...';
    }

    // Continue with completion after short delay
    setTimeout(() => this.complete(), 1000);
  }

  delay(ms) {
    return new Promise(resolve => {
      const timeoutId = setTimeout(resolve, ms);
      this.state.timeouts.add(timeoutId);
    });
  }

  log(...args) {
    if (this.config.debug) {
      console.log('[Preloader]', ...args);
    }
  }
}

// TEMPORARILY DISABLED FOR TESTING - Initialize when DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//   window.preloader = new ModernPreloader({
//     debug: true // Set to false in production
//   });
// });

// Temporary: Hide preloader immediately and trigger animations
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚫 [PRELOADER] DISABLED FOR TESTING');

  // Hide preloader immediately
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.display = 'none';
    console.log('🚫 [PRELOADER] Hidden immediately');
  }

  // Add loaded class to body
  document.body.classList.add('loaded');

  // Trigger preloader complete event after short delay
  setTimeout(() => {
    console.log('🚫 [PRELOADER] Triggering fake completion event');
    document.dispatchEvent(new CustomEvent('preloaderComplete', {
      detail: {
        duration: 0,
        resourcesLoaded: 1,
        wasSkipped: true
      }
    }));
  }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernPreloader;
}
