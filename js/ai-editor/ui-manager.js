/**
 * UI Manager - Handles user interface interactions and state management
 * Manages animations, notifications, and responsive behavior
 */

class UIManager {
    constructor(app) {
        this.app = app;
        this.notifications = [];
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.init();
        console.log('🎨 [UI] UI Manager initialized');
    }

    init() {
        this.setupResponsiveHandlers();
        this.setupKeyboardShortcuts();
        this.setupNavigationHandlers();
        this.initializeAnimations();
        this.setupTooltips();
        this.setupCollapsibleCategories();
    }

    /**
     * Setup responsive behavior handlers
     */
    setupResponsiveHandlers() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 500);
        });
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        console.log('📱 [UI] Handling resize event');
        
        // Update canvas size if editor exists
        if (this.app.modules.editor) {
            this.app.modules.editor.handleResize();
        }

        // Update panel layout for mobile
        this.updatePanelLayout();
        
        // Trigger custom resize event
        window.dispatchEvent(new CustomEvent('ai-editor-resize'));
    }

    /**
     * Update panel layout based on screen size
     */
    updatePanelLayout() {
        const workspace = document.querySelector('.editor-workspace');
        const isMobile = window.innerWidth <= 968;
        
        if (workspace) {
            workspace.classList.toggle('mobile-layout', isMobile);
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const isCtrl = e.ctrlKey || e.metaKey;
            
            switch (e.key.toLowerCase()) {
                case 'g':
                    if (isCtrl) {
                        e.preventDefault();
                        this.triggerImageGeneration();
                    }
                    break;
                    
                case 'z':
                    if (isCtrl && !e.shiftKey) {
                        e.preventDefault();
                        this.triggerUndo();
                    }
                    break;
                    
                case 'y':
                    if (isCtrl) {
                        e.preventDefault();
                        this.triggerRedo();
                    }
                    break;
                    
                case 'z':
                    if (isCtrl && e.shiftKey) {
                        e.preventDefault();
                        this.triggerRedo();
                    }
                    break;
                    
                case 's':
                    if (isCtrl) {
                        e.preventDefault();
                        this.triggerSave();
                    }
                    break;
                    
                case 'e':
                    if (isCtrl) {
                        e.preventDefault();
                        this.triggerExport();
                    }
                    break;
                    
                case 'escape':
                    this.handleEscape();
                    break;
            }
        });
    }

    /**
     * Setup navigation handlers
     */
    setupNavigationHandlers() {
        // Handle hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    }

    /**
     * Initialize UI animations
     */
    initializeAnimations() {
        // Animate panels on load
        this.animatePanelsIn();
        
        // Setup hover effects
        this.setupHoverEffects();
    }

    /**
     * Animate panels sliding in
     */
    animatePanelsIn() {
        if (typeof anime === 'undefined') {
            console.warn('⚠️ [UI] Anime.js not loaded, skipping animations');
            return;
        }

        const panels = document.querySelectorAll('.panel-card, .canvas-container, .gallery-panel');

        anime({
            targets: panels,
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 800,
            delay: anime.stagger(100),
            easing: 'easeOutCubic'
        });
    }

    /**
     * Setup hover effects for interactive elements
     */
    setupHoverEffects() {
        // Button hover effects
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-icon');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: button,
                        scale: 1.05,
                        duration: 200,
                        easing: 'easeOutCubic'
                    });
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: button,
                        scale: 1,
                        duration: 200,
                        easing: 'easeOutCubic'
                    });
                }
            });
        });

        // Example tag hover effects
        const exampleTags = document.querySelectorAll('.example-tag');
        
        exampleTags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: tag,
                        scale: 1.02,
                        duration: 150,
                        easing: 'easeOutCubic'
                    });
                }
            });
            
            tag.addEventListener('mouseleave', () => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: tag,
                        scale: 1,
                        duration: 150,
                        easing: 'easeOutCubic'
                    });
                }
            });
        });
    }

    /**
     * Show notification message in header
     * @param {string} message - The message to show
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 2500) {
        const headerNotification = document.getElementById('headerNotification');
        if (!headerNotification) {
            console.warn('⚠️ [UI] Header notification element not found');
            return;
        }

        // Clear any existing timeout
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        // Set icon based on type
        const iconElement = headerNotification.querySelector('.notification-icon');
        const textElement = headerNotification.querySelector('.notification-text');

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        iconElement.className = `notification-icon ${icons[type] || icons.info}`;
        textElement.textContent = message;

        // Remove all type classes and add current type
        headerNotification.classList.remove('success', 'error', 'warning', 'info', 'hide');
        headerNotification.classList.add(type);

        // Show notification
        headerNotification.style.display = 'inline-flex';

        // Trigger reflow to ensure animation plays
        void headerNotification.offsetWidth;

        headerNotification.classList.add('show');

        // Auto hide after duration
        this.notificationTimeout = setTimeout(() => {
            this.hideHeaderNotification();
        }, duration);
    }

    /**
     * Hide header notification
     */
    hideHeaderNotification() {
        const headerNotification = document.getElementById('headerNotification');
        if (!headerNotification) return;

        headerNotification.classList.remove('show');
        headerNotification.classList.add('hide');

        // Remove from DOM after animation
        setTimeout(() => {
            headerNotification.style.display = 'none';
            headerNotification.classList.remove('hide');
        }, 300);
    }

    /**
     * Legacy: Create notification element (kept for compatibility)
     * Now all notifications use header notification system
     */
    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas ${this.getNotificationIcon(type)}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000',
            minWidth: '300px',
            maxWidth: '400px',
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-medium)',
            transform: 'translateX(300px)',
            opacity: '0'
        });
        
        // Type-specific styles
        const typeStyles = {
            success: {
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                color: '#4ade80'
            },
            error: {
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                color: '#f87171'
            },
            warning: {
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                color: '#fbbf24'
            },
            info: {
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff'
            }
        };
        
        Object.assign(notification.style, typeStyles[type] || typeStyles.info);
        
        return notification;
    }

    /**
     * Get icon for notification type
     * @param {string} type - The notification type
     * @returns {string} The icon class
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        return icons[type] || icons.info;
    }

    /**
     * Remove notification
     * @param {HTMLElement} notification - The notification element
     */
    removeNotification(notification) {
        if (typeof anime !== 'undefined') {
            anime({
                targets: notification,
                translateX: 300,
                opacity: 0,
                duration: 300,
                easing: 'easeInCubic',
                complete: () => {
                    if (notification.parentElement) {
                        notification.parentElement.removeChild(notification);
                    }
                }
            });
        } else {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }
        
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    // Keyboard shortcut handlers
    triggerImageGeneration() {
        const generateBtn = document.getElementById('generateImage');
        if (generateBtn && !generateBtn.disabled) {
            generateBtn.click();
        }
    }

    triggerUndo() {
        if (this.app.modules.editor) {
            // If a drawing tool is active, undo drawing actions
            if (this.app.modules.editor.drawingState.activeTool) {
                this.app.modules.editor.undoDrawing();
            } else {
                // Otherwise, undo canvas actions
                this.app.modules.editor.undo();
            }
        }
    }

    triggerRedo() {
        if (this.app.modules.editor) {
            // If a drawing tool is active, redo drawing actions
            if (this.app.modules.editor.drawingState.activeTool) {
                this.app.modules.editor.redoDrawing();
            } else {
                // Otherwise, redo canvas actions
                this.app.modules.editor.redo();
            }
        }
    }

    triggerSave() {
        if (this.app.modules.editor) {
            this.app.modules.editor.save();
        }
    }

    triggerExport() {
        if (this.app.modules.editor) {
            this.app.modules.editor.export();
        }
    }

    handleEscape() {
        // Close any open modals or overlays
        const overlay = document.getElementById('loadingOverlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    }

    /**
     * Update UI theme
     * @param {string} theme - Theme name ('dark' or 'light')
     */
    updateTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.app.modules.storage.updateSetting('theme', theme);
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    /**
     * Toggle between themes
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.updateTheme(newTheme);
    }

    /**
     * Setup tooltip system with 500ms delay and intelligent positioning
     */
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        const tooltipDelay = 500; // 500ms delay

        tooltipElements.forEach(element => {
            let tooltipTimeout = null;

            // Show tooltip after delay with intelligent positioning
            element.addEventListener('mouseenter', () => {
                tooltipTimeout = setTimeout(() => {
                    // Determine best position for tooltip
                    this.positionTooltip(element);
                    element.classList.add('show-tooltip');
                }, tooltipDelay);
            });

            // Hide tooltip and clear timeout
            element.addEventListener('mouseleave', () => {
                clearTimeout(tooltipTimeout);
                element.classList.remove('show-tooltip');
            });

            // Hide tooltip on click
            element.addEventListener('click', () => {
                clearTimeout(tooltipTimeout);
                element.classList.remove('show-tooltip');
            });
        });

        console.log(`✅ [UI] Tooltip system initialized for ${tooltipElements.length} elements`);
    }

    /**
     * Intelligently position tooltip to avoid being blocked by other elements
     */
    positionTooltip(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Estimated tooltip height (approximate)
        const tooltipHeight = 40;
        const tooltipWidth = 200;

        // Calculate available space in each direction
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = viewportWidth - rect.right;

        // Remove any existing position attribute
        element.removeAttribute('data-tooltip-position');

        // Determine best position based on available space
        // Priority: top > bottom > left > right
        if (spaceAbove >= tooltipHeight) {
            // Default position (top) - do nothing
            return;
        } else if (spaceBelow >= tooltipHeight) {
            element.setAttribute('data-tooltip-position', 'bottom');
        } else if (spaceRight >= tooltipWidth) {
            element.setAttribute('data-tooltip-position', 'right');
        } else if (spaceLeft >= tooltipWidth) {
            element.setAttribute('data-tooltip-position', 'left');
        } else {
            // If no good position, use bottom as fallback
            element.setAttribute('data-tooltip-position', 'bottom');
        }
    }

    /**
     * Refresh tooltip system (call after dynamically adding new tooltip elements)
     */
    refreshTooltips() {
        this.setupTooltips();
    }

    /**
     * Setup collapsible category functionality
     */
    setupCollapsibleCategories() {
        const collapsibleTitles = document.querySelectorAll('.category-title.collapsible');

        collapsibleTitles.forEach(title => {
            title.addEventListener('click', (e) => {
                // Get the content element (next sibling)
                const content = title.nextElementSibling;

                if (!content || !content.classList.contains('tool-category-content')) {
                    return;
                }

                // Toggle collapsed state
                const isCollapsed = title.classList.contains('collapsed');

                if (isCollapsed) {
                    // Expand
                    title.classList.remove('collapsed');
                    content.classList.remove('collapsed');
                } else {
                    // Collapse
                    title.classList.add('collapsed');
                    content.classList.add('collapsed');
                }

                console.log(`🎨 [UI] Category "${title.textContent.trim()}" ${isCollapsed ? 'expanded' : 'collapsed'}`);
            });
        });

        console.log(`✅ [UI] Collapsible categories initialized for ${collapsibleTitles.length} categories`);
    }

    /**
     * Show loading overlay
     * @param {string} title - Loading title
     * @param {string} message - Loading message
     */
    showLoading(title = 'Processing...', message = 'Please wait') {
        const overlay = document.getElementById('loadingOverlay');
        const titleElement = document.getElementById('loadingTitle');
        const messageElement = document.getElementById('loadingMessage');

        if (overlay) {
            if (titleElement) titleElement.textContent = title;
            if (messageElement) messageElement.textContent = message;
            overlay.style.display = 'flex';
            console.log('⏳ [UI] Loading overlay shown');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ [UI] Loading overlay hidden');
        }
    }

    /**
     * Update loading overlay message
     * @param {string} title - New title
     * @param {string} message - New message
     */
    updateLoadingMessage(title, message) {
        const titleElement = document.getElementById('loadingTitle');
        const messageElement = document.getElementById('loadingMessage');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        console.log(`⏳ [UI] Loading message updated: ${title} - ${message}`);
    }

    /**
     * Show status message (alias for showNotification)
     * @param {string} message - The message to show
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds
     */
    showStatus(message, type = 'info', duration = 5000) {
        this.showNotification(message, type, duration);
    }
}
