/**
 * LinkedIn Pro Studio Manager
 * Handles professional LinkedIn profile picture transformations
 */

class LinkedInStudioManager {
    constructor(app) {
        this.app = app;
        
        // UI Elements
        this.elements = {
            panel: null,
            header: null,
            content: null,
            studioTabs: {}, // Outer tabs (LinkedIn Pro vs AD Studio)
            studioTabContents: {}, // Outer tab contents
            tabs: {}, // Inner tabs (Presets vs Virtual Studio)
            tabContents: {}, // Inner tab contents
            presetButtons: [],
            attirePresetButtons: [],
            outfitModeButtons: [],
            attireContents: {},
            referenceOutfitInput: null,
            uploadReferenceBtn: null,
            removeReferenceBtn: null,
            referenceOutfitPreview: null,
            referenceOutfitImg: null,
            outfitAnalysisStatus: null,
            outfitDescriptionDisplay: null,
            outfitDescriptionText: null,
            selectedAttireDisplay: null,
            selectedAttireName: null,
            controls: {},
            analyzeBtn: null,
            applyPresetBtn: null,
            applyBtn: null,
            resetBtn: null,
            contextToggle: null,
            statusDiv: null
        };

        // State
        this.currentStudioTab = 'linkedin-pro'; // Outer tab state
        this.currentTab = 'presets'; // Inner tab state
        this.selectedPreset = null;
        this.studioSettings = this.getDefaultSettings();
        this.portraitAnalysis = null;
        this.isCollapsed = true;

        // Outfit/Attire State
        this.outfitMode = 'preset'; // 'preset' or 'reference'
        this.selectedAttirePreset = null;
        this.referenceOutfitImageData = null;
        this.outfitDescription = null;
        
        // Contextual analysis toggle
        this.useContextualAnalysis = false;
    }
    
    /**
     * Initialize the LinkedIn Studio Manager
     */
    initialize() {
        this.cacheElements();
        this.attachEventListeners();
        this.updateUIState();
        console.log('LinkedIn Studio Manager initialized');
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        // Panel elements
        this.elements.panel = document.getElementById('linkedinStudioPanel');
        this.elements.header = document.getElementById('linkedinStudioHeader');
        this.elements.content = document.getElementById('linkedinStudioContent');
        this.elements.statusDiv = document.getElementById('linkedinStatus');
        this.elements.contextToggle = document.getElementById('linkedinContextToggle');

        // Outer studio tab elements (LinkedIn Pro vs AD Studio vs Text Studio)
        this.elements.studioTabs.linkedinPro = document.querySelector('[data-studio-tab="linkedin-pro"]');
        this.elements.studioTabs.adStudio = document.querySelector('[data-studio-tab="ad-studio"]');
        this.elements.studioTabs.textStudio = document.querySelector('[data-studio-tab="text-studio"]');
        this.elements.studioTabContents.linkedinPro = document.getElementById('linkedin-pro-tab');
        this.elements.studioTabContents.adStudio = document.getElementById('ad-studio-tab');
        this.elements.studioTabContents.textStudio = document.getElementById('text-studio-tab');

        // Inner tab elements (Presets vs Virtual Studio)
        this.elements.tabs.presets = document.querySelector('[data-tab="presets"]');
        this.elements.tabs.studio = document.querySelector('[data-tab="studio"]');
        this.elements.tabContents.presets = document.getElementById('presets-tab');
        this.elements.tabContents.studio = document.getElementById('studio-tab');
        
        // Preset buttons
        this.elements.presetButtons = document.querySelectorAll('.preset-card');

        // Attire/Outfit elements
        this.elements.outfitModeButtons = document.querySelectorAll('.outfit-mode-btn');
        this.elements.attirePresetButtons = document.querySelectorAll('.attire-preset-card');
        this.elements.attireContents.preset = document.getElementById('attire-preset-content');
        this.elements.attireContents.reference = document.getElementById('attire-reference-content');
        this.elements.referenceOutfitInput = document.getElementById('referenceOutfitInput');
        this.elements.uploadReferenceBtn = document.getElementById('uploadReferenceBtn');
        this.elements.removeReferenceBtn = document.getElementById('removeReferenceBtn');
        this.elements.referenceOutfitPreview = document.getElementById('referenceOutfitPreview');
        this.elements.referenceOutfitImg = document.getElementById('referenceOutfitImg');
        this.elements.outfitAnalysisStatus = document.getElementById('outfitAnalysisStatus');
        this.elements.outfitDescriptionDisplay = document.getElementById('outfitDescriptionDisplay');
        this.elements.outfitDescriptionText = document.getElementById('outfitDescriptionText');
        this.elements.selectedAttireDisplay = document.getElementById('selectedAttireDisplay');
        this.elements.selectedAttireName = document.getElementById('selectedAttireName');

        // Action buttons
        this.elements.analyzeBtn = document.getElementById('analyzePortraitBtn');
        this.elements.applyPresetBtn = document.getElementById('applyPresetTransform');
        this.elements.applyBtn = document.getElementById('applyStudioTransform');
        this.elements.resetBtn = document.getElementById('resetStudioSettings');

        // Control elements
        this.elements.controls = {
            // Lighting
            lightingDirection: document.getElementById('lightingDirection'),
            lightingIntensity: document.getElementById('lightingIntensity'),
            colorTemperature: document.getElementById('colorTemperature'),
            
            // Camera
            focalLength: document.getElementById('focalLength'),
            cameraAngle: document.getElementById('cameraAngle'),
            
            // Subject
            smileIntensity: document.getElementById('smileIntensity'),
            gazeDirection: document.getElementById('gazeDirection'),
            skinRetouching: document.getElementById('skinRetouching'),
            
            // Background
            backgroundStyle: document.getElementById('backgroundStyle'),
            backgroundBlur: document.getElementById('backgroundBlur')
        };
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Collapsible header
        if (this.elements.header) {
            this.elements.header.addEventListener('click', () => this.toggleCollapse());
        }

        // Outer studio tab navigation (LinkedIn Pro vs AD Studio)
        Object.values(this.elements.studioTabs).forEach(tab => {
            if (tab) {
                tab.addEventListener('click', (e) => {
                    const studioTab = e.target.closest('.studio-tab-btn').dataset.studioTab;
                    this.switchStudioTab(studioTab);
                });
            }
        });

        // Inner tab navigation (Presets vs Virtual Studio)
        Object.values(this.elements.tabs).forEach(tab => {
            if (tab) {
                tab.addEventListener('click', (e) => this.switchTab(e.target.closest('.tab-btn').dataset.tab));
            }
        });
        
        // Preset buttons
        this.elements.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectPreset(btn.dataset.preset));
        });

        // Outfit mode toggle buttons
        this.elements.outfitModeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchOutfitMode(btn.dataset.outfitMode));
        });

        // Attire preset buttons
        this.elements.attirePresetButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectAttirePreset(btn.dataset.attire));
        });

        // Reference outfit upload
        if (this.elements.uploadReferenceBtn) {
            this.elements.uploadReferenceBtn.addEventListener('click', () => {
                this.elements.referenceOutfitInput.click();
            });
        }

        if (this.elements.referenceOutfitInput) {
            this.elements.referenceOutfitInput.addEventListener('change', (e) => {
                this.handleReferenceOutfitUpload(e);
            });
        }

        if (this.elements.removeReferenceBtn) {
            this.elements.removeReferenceBtn.addEventListener('click', () => {
                this.removeReferenceOutfit();
            });
        }

        // Action buttons
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.addEventListener('click', () => this.analyzePortrait());
        }

        if (this.elements.applyPresetBtn) {
            this.elements.applyPresetBtn.addEventListener('click', () => this.applyTransformation());
        }

        if (this.elements.applyBtn) {
            this.elements.applyBtn.addEventListener('click', () => this.applyTransformation());
        }
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.resetSettings());
        }

        // Contextual analysis toggle
        if (this.elements.contextToggle) {
            this.elements.contextToggle.addEventListener('change', (e) => {
                this.useContextualAnalysis = e.target.checked;
                const msg = this.useContextualAnalysis ? 'Contextual analysis enabled' : 'Contextual analysis disabled';
                this.showStatus(msg, 'info');
            });
        }
        
        // Control sliders and selects - update value displays and persist settings
        Object.entries(this.elements.controls).forEach(([key, control]) => {
            if (control) {
                if (control.type === 'range') {
                    control.addEventListener('input', () => this.updateControlValue(key));
                } else if (control.tagName === 'SELECT') {
                    control.addEventListener('change', () => {
                        this.studioSettings[key] = control.value;
                    });
                }
            }
        });
    }
    
    /**
     * Toggle panel collapse/expand
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            this.elements.content.classList.add('collapsed');
            this.elements.header.classList.remove('expanded');
        } else {
            this.elements.content.classList.remove('collapsed');
            this.elements.header.classList.add('expanded');

            // Force reflow to trigger CSS transition
            void this.elements.content.offsetHeight;

            // Auto-scroll to bring panel into view
            setTimeout(() => {
                this.elements.panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
    
    /**
     * Switch between outer studio tabs (LinkedIn Pro vs AD Studio)
     */
    switchStudioTab(studioTabName) {
        this.currentStudioTab = studioTabName;

        // Update studio tab buttons
        Object.entries(this.elements.studioTabs).forEach(([name, btn]) => {
            if (btn) {
                const isActive = (name === 'linkedinPro' && studioTabName === 'linkedin-pro') ||
                                (name === 'adStudio' && studioTabName === 'ad-studio') ||
                                (name === 'textStudio' && studioTabName === 'text-studio');
                btn.classList.toggle('active', isActive);
            }
        });

        // Update studio tab contents with fade effect
        Object.entries(this.elements.studioTabContents).forEach(([name, content]) => {
            if (content) {
                const isActive = (name === 'linkedinPro' && studioTabName === 'linkedin-pro') ||
                                (name === 'adStudio' && studioTabName === 'ad-studio') ||
                                (name === 'textStudio' && studioTabName === 'text-studio');

                if (isActive) {
                    // Add fade-in effect
                    content.style.opacity = '0';
                    content.classList.add('active');

                    // Trigger reflow to ensure animation works
                    void content.offsetWidth;

                    // Fade in
                    setTimeout(() => {
                        content.style.opacity = '1';
                    }, 10);
                } else {
                    content.classList.remove('active');
                }
            }
        });

        // Auto-scroll to Studio section to make the change obvious
        const studioPanel = document.getElementById('linkedinStudioPanel');
        if (studioPanel) {
            studioPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Show visual feedback
        const tabLabel = studioTabName === 'linkedin-pro' ? 'LinkedIn Pro Studio'
            : studioTabName === 'ad-studio' ? 'AD Studio'
            : 'Text Studio';
        console.log(`🔄 [STUDIO] Switched to ${tabLabel}`);

        // Show a subtle notification (if UI manager has showNotification method)
        if (this.app && this.app.modules && this.app.modules.ui && this.app.modules.ui.showNotification) {
            this.app.modules.ui.showNotification(`Switched to ${tabLabel}`, 'info', 2000);
        }
    }

    /**
     * Switch between inner tabs (Presets vs Virtual Studio)
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        Object.entries(this.elements.tabs).forEach(([name, btn]) => {
            if (btn) {
                btn.classList.toggle('active', name === tabName);
            }
        });

        // Update tab contents
        Object.entries(this.elements.tabContents).forEach(([name, content]) => {
            if (content) {
                content.classList.toggle('active', name === tabName);
            }
        });
    }
    
    /**
     * Select or toggle a preset
     */
    selectPreset(presetName) {
        // If clicking the same preset again, deselect it
        if (this.selectedPreset === presetName) {
            this.selectedPreset = null;

            // Remove highlight from all preset cards
            this.elements.presetButtons.forEach(btn => {
                btn.classList.remove('selected');
            });

            // Disable the Apply Preset button when no preset is selected
            if (this.elements.applyPresetBtn) {
                this.elements.applyPresetBtn.disabled = true;
            }

            // Inform user
            this.showStatus('Preset deselected.', 'info');
            return;
        }

        // Select a new preset
        this.selectedPreset = presetName;

        // Highlight the selected preset and unhighlight others
        this.elements.presetButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.preset === presetName);
        });

        // Apply preset settings
        const preset = this.getPresets()[presetName];
        if (preset) {
            this.applyPresetSettings(preset.settings);
            this.showStatus(`Selected: ${preset.name}. Click "Apply Transform" to proceed.`, 'info');

            // Enable the Apply Preset button
            if (this.elements.applyPresetBtn) {
                this.elements.applyPresetBtn.disabled = false;
            }
        }
    }
    
    /**
     * Apply preset settings to controls
     */
    applyPresetSettings(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            if (this.elements.controls[key]) {
                this.elements.controls[key].value = value;
                this.updateControlValue(key);
            }
        });
        
        this.studioSettings = { ...this.studioSettings, ...settings };
    }
    
    /**
     * Update control value display
     */
    updateControlValue(controlName) {
        const control = this.elements.controls[controlName];
        if (!control) return;
        
        const valueDisplay = document.getElementById(`${controlName}Value`);
        if (!valueDisplay) return;
        
        const value = parseFloat(control.value);
        let displayText = value;
        
        // Format display text based on control type
        switch (controlName) {
            case 'lightingDirection':
                displayText = `${value}°`;
                break;
            case 'lightingIntensity':
                displayText = value <= 0.4 ? 'Soft' : value <= 0.7 ? 'Balanced' : 'Dramatic';
                break;
            case 'colorTemperature':
                displayText = `${value}K`;
                break;
            case 'focalLength':
                displayText = `${value}mm`;
                break;
            case 'cameraAngle':
                displayText = value < 0 ? 'Below' : value === 0 ? 'Eye Level' : 'Above';
                break;
            case 'smileIntensity':
                displayText = value <= 0.2 ? 'Neutral' : value <= 0.4 ? 'Subtle' : value <= 0.7 ? 'Warm' : 'Bright';
                break;
            case 'skinRetouching':
                displayText = value <= 0.3 ? 'Natural' : value <= 0.7 ? 'Light' : 'Professional';
                break;
            case 'backgroundBlur':
                displayText = value <= 0.4 ? 'Slight' : value <= 0.7 ? 'Medium' : 'Strong';
                break;
        }
        
        valueDisplay.textContent = displayText;
        this.studioSettings[controlName] = value;
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        this.studioSettings = this.getDefaultSettings();
        this.selectedPreset = null;

        // Update UI
        this.elements.presetButtons.forEach(btn => btn.classList.remove('selected'));

        // Disable Apply Preset button
        if (this.elements.applyPresetBtn) {
            this.elements.applyPresetBtn.disabled = true;
        }

        // Reset controls
        Object.entries(this.studioSettings).forEach(([key, value]) => {
            if (this.elements.controls[key]) {
                this.elements.controls[key].value = value;
                this.updateControlValue(key);
            }
        });

        this.showStatus('Settings reset to defaults', 'info');
    }
    
    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            // Lighting
            lightingDirection: 45,
            lightingIntensity: 0.6,
            colorTemperature: 5500,
            
            // Camera
            focalLength: 85,
            cameraAngle: 0,
            
            // Subject
            smileIntensity: 0.5,
            gazeDirection: 'direct',
            skinRetouching: 0.5,
            
            // Background
            backgroundStyle: 'keep',
            backgroundBlur: 0.6
        };
    }
    
    /**
     * Get preset definitions
     */
    getPresets() {
        return {
            'corporate': {
                name: 'Corporate Modern',
                icon: '💼',
                description: 'Clean, minimalist, neutral tones',
                settings: {
                    lightingDirection: 0,
                    lightingIntensity: 0.5,
                    colorTemperature: 5500,
                    focalLength: 85,
                    cameraAngle: 5,
                    smileIntensity: 0.3,
                    gazeDirection: 'direct',
                    skinRetouching: 0.6,
                    backgroundStyle: 'solid-gray',
                    backgroundBlur: 0
                },
                promptTemplate: 'Transform this portrait into a professional corporate LinkedIn profile picture. Use clean, even lighting from the front with minimal shadows. Apply a neutral, cool color temperature (5500K). Use an 85mm focal length for flattering compression. Position camera slightly above eye level for a confident look. Subject should have a subtle, professional smile. Direct eye contact with camera. Apply professional skin retouching while maintaining natural appearance. Replace background with a solid, neutral gray (#E5E5E5). Ensure sharp focus on subject with no background blur. Final image should convey professionalism, trustworthiness, and approachability in a corporate setting.'
            },
            'creative': {
                name: 'Creative Professional',
                icon: '🎨',
                description: 'Artistic, warm, approachable',
                settings: {
                    lightingDirection: 45,
                    lightingIntensity: 0.7,
                    colorTemperature: 6000,
                    focalLength: 50,
                    cameraAngle: 0,
                    smileIntensity: 0.6,
                    gazeDirection: 'direct',
                    skinRetouching: 0.4,
                    backgroundStyle: 'soft-bokeh',
                    backgroundBlur: 0.7
                },
                promptTemplate: 'Transform this portrait into a creative professional LinkedIn profile picture. Use dramatic side lighting at 45 degrees to create depth and dimension. Apply warm, inviting color temperature (6000K). Use a 50mm focal length for natural perspective. Camera at eye level for approachable feel. Subject should have a warm, genuine smile. Direct, engaging eye contact. Apply light, natural skin retouching. Create a soft, artistic bokeh background with warm tones and medium blur. Final image should convey creativity, approachability, and artistic sensibility while maintaining professional standards.'
            },
            'tech': {
                name: 'Tech Executive',
                icon: '💻',
                description: 'Modern, innovative, confident',
                settings: {
                    lightingDirection: 315,
                    lightingIntensity: 0.8,
                    colorTemperature: 6500,
                    focalLength: 85,
                    cameraAngle: 10,
                    smileIntensity: 0.4,
                    gazeDirection: 'direct',
                    skinRetouching: 0.7,
                    backgroundStyle: 'gradient-blue',
                    backgroundBlur: 0.5
                },
                promptTemplate: 'Transform this portrait into a tech executive LinkedIn profile picture. Use modern, high-key lighting from upper left (315°) with strong intensity for a contemporary look. Apply cool, crisp color temperature (6500K). Use 85mm focal length for professional compression. Camera positioned above eye level for authoritative presence. Subject should have a confident, subtle smile. Direct, commanding eye contact. Apply professional skin retouching. Create a modern gradient background with cool blue tones (#1E3A8A to #3B82F6) with medium blur. Final image should convey innovation, leadership, and technical expertise in the modern tech industry.'
            },
            'thought-leader': {
                name: 'Thought Leader',
                icon: '💡',
                description: 'Inspiring, authentic, engaging',
                settings: {
                    lightingDirection: 60,
                    lightingIntensity: 0.6,
                    colorTemperature: 5800,
                    focalLength: 70,
                    cameraAngle: 0,
                    smileIntensity: 0.7,
                    gazeDirection: 'direct',
                    skinRetouching: 0.3,
                    backgroundStyle: 'natural-office',
                    backgroundBlur: 0.8
                },
                promptTemplate: 'Transform this portrait into a thought leader LinkedIn profile picture. Use natural, soft lighting from 60 degrees to create an authentic, approachable atmosphere. Apply balanced, natural color temperature (5800K). Use 70mm focal length for engaging perspective. Camera at eye level for relatable connection. Subject should have a bright, genuine smile showing warmth and approachability. Direct, engaging eye contact. Minimal skin retouching for authentic appearance. Create a softly blurred natural office or library background with warm, professional tones. Final image should convey authenticity, wisdom, approachability, and thought leadership.'
            },
            'finance': {
                name: 'Finance/Legal',
                icon: '⚖️',
                description: 'Authoritative, trustworthy, formal',
                settings: {
                    lightingDirection: 0,
                    lightingIntensity: 0.4,
                    colorTemperature: 5200,
                    focalLength: 100,
                    cameraAngle: 15,
                    smileIntensity: 0.2,
                    gazeDirection: 'direct',
                    skinRetouching: 0.8,
                    backgroundStyle: 'solid-navy',
                    backgroundBlur: 0
                },
                promptTemplate: 'Transform this portrait into a finance/legal professional LinkedIn profile picture. Use soft, even frontal lighting with low intensity for a formal, serious atmosphere. Apply cool, professional color temperature (5200K). Use 100mm focal length for formal compression and distance. Camera positioned well above eye level for authoritative presence. Subject should have a minimal, serious expression conveying gravitas. Direct, steady eye contact. Apply professional skin retouching for polished appearance. Replace background with solid, deep navy blue (#1E293B). No background blur - sharp, formal presentation. Final image should convey authority, trustworthiness, expertise, and professionalism in finance or legal sectors.'
            },
            'healthcare': {
                name: 'Healthcare Professional',
                icon: '🏥',
                description: 'Caring, professional, trustworthy',
                settings: {
                    lightingDirection: 30,
                    lightingIntensity: 0.5,
                    colorTemperature: 5600,
                    focalLength: 85,
                    cameraAngle: 0,
                    smileIntensity: 0.5,
                    gazeDirection: 'direct',
                    skinRetouching: 0.5,
                    backgroundStyle: 'soft-white',
                    backgroundBlur: 0.3
                },
                promptTemplate: 'Transform this portrait into a healthcare professional LinkedIn profile picture. Use soft, gentle lighting from 30 degrees to create a caring, approachable atmosphere. Apply neutral, clean color temperature (5600K). Use 85mm focal length for professional yet approachable perspective. Camera at eye level for equal, caring connection. Subject should have a warm, reassuring smile conveying compassion. Direct, trustworthy eye contact. Apply balanced skin retouching for professional appearance. Create a soft, clean white background with slight blur for clinical professionalism. Final image should convey compassion, expertise, trustworthiness, and professional care in healthcare setting.'
            }
        };
    }

    /**
     * Get attire style preset definitions
     */
    getAttirePresets() {
        return {
            'casual': {
                name: 'Casual',
                icon: 'bx-t-shirt',
                description: 'Relaxed, comfortable, everyday wear',
                outfitDescription: 'A well-fitted casual t-shirt in a solid neutral color (navy blue, charcoal gray, or white), paired with dark denim jeans. The t-shirt should have a classic crew neck, short sleeves, and a slightly tailored fit that\'s neither too tight nor too loose. The fabric appears soft and high-quality cotton. The overall look is clean, modern casual with no visible logos or graphics.'
            },
            'smart-casual': {
                name: 'Smart Casual',
                icon: 'bx-shopping-bag',
                description: 'Polished yet relaxed, business casual',
                outfitDescription: 'A crisp button-down Oxford shirt in light blue or white, with long sleeves rolled up to mid-forearm. The shirt has a classic collar, visible button placket, and a tailored fit. Paired with well-fitted chino pants in khaki, navy, or charcoal. The fabric has a slight texture and professional appearance. Top button is unbuttoned for a relaxed yet polished look. No tie. The overall aesthetic is refined casual professionalism.'
            },
            'business-casual': {
                name: 'Business Casual',
                icon: 'bx-briefcase-alt',
                description: 'Professional without a tie, office-ready',
                outfitDescription: 'A high-quality dress shirt in white, light blue, or subtle stripe pattern, with long sleeves and French cuffs or button cuffs. Classic spread collar, fully buttoned except for the top button. Paired with tailored dress slacks in charcoal gray or navy blue with a clean, pressed appearance. Optional: a leather belt in brown or black. The fabric is crisp, wrinkle-free, and professional. No tie, but the overall look is polished and office-appropriate.'
            },
            'business-professional': {
                name: 'Business Professional',
                icon: 'bx-briefcase',
                description: 'Full suit and tie, formal business',
                outfitDescription: 'A classic two-piece business suit in navy blue, charcoal gray, or black. The suit jacket is single-breasted with notch lapels, two or three buttons, and a tailored fit. Crisp white or light blue dress shirt with a spread collar, fully buttoned. A silk tie in a solid color or subtle pattern (navy, burgundy, or gray) with a perfect Windsor or half-Windsor knot. The suit pants are tailored with a clean break at the shoes. The overall appearance is sharp, professional, and authoritative.'
            },
            'executive': {
                name: 'Executive',
                icon: 'bx-crown',
                description: 'Premium suit, luxury materials, power dressing',
                outfitDescription: 'A premium three-piece suit in deep navy blue or charcoal gray, made from high-quality wool with a subtle sheen. The suit jacket features peak lapels, working buttonholes, and impeccable tailoring. Matching vest (waistcoat) underneath. Crisp white dress shirt with French cuffs and silver or gold cufflinks. A luxury silk tie in a rich color (deep burgundy, royal blue, or elegant pattern) with a perfect knot. Pocket square in complementary color. The fabric drapes perfectly, and every detail exudes quality and authority. This is power dressing at its finest.'
            },
            'creative-professional': {
                name: 'Creative Professional',
                icon: 'bx-palette',
                description: 'Stylish blazer, modern cuts, bold colors',
                outfitDescription: 'A modern, well-fitted blazer in a bold color (deep burgundy, forest green, or rich navy) or interesting texture (herringbone, tweed). The blazer has contemporary styling with slim lapels and a tailored fit. Underneath, a high-quality crew-neck sweater or turtleneck in a complementary color, or a casual button-down shirt. Dark jeans or tailored chinos. The overall look is fashion-forward, creative, and professional with attention to color coordination and modern style. No tie, but the ensemble is polished and intentional.'
            },
            'tech-startup': {
                name: 'Tech Startup',
                icon: 'bx-code-alt',
                description: 'Hoodie, modern casual, Silicon Valley style',
                outfitDescription: 'A premium quality hoodie in a solid color (charcoal gray, navy blue, or black) with a clean, minimalist design. The hoodie is well-fitted, not oversized, made from high-quality cotton or tech fabric. Underneath, a simple crew-neck t-shirt in a neutral color. The hoodie may feature a subtle tech company logo or be completely plain. Paired with dark jeans or tech pants. The overall aesthetic is modern, comfortable, and Silicon Valley-inspired - professional in the tech world while being relaxed and approachable.'
            },
            'academic': {
                name: 'Academic',
                icon: 'bx-book',
                description: 'Blazer with sweater, scholarly appearance',
                outfitDescription: 'A classic tweed or wool blazer in brown, gray, or navy with subtle texture or pattern (herringbone, windowpane). The blazer has traditional styling with notch lapels and elbow patches (optional). Underneath, a V-neck sweater or cardigan in a complementary earth tone (burgundy, forest green, camel) over a collared shirt. The shirt collar is visible above the sweater. Optional: a subtle tie or bow tie. The overall look is scholarly, intellectual, and timeless - evoking the classic professor or researcher aesthetic with warmth and approachability.'
            },
            'formal-evening': {
                name: 'Formal Evening',
                icon: 'bx-diamond',
                description: 'Tuxedo, black tie attire',
                outfitDescription: 'A classic black tuxedo with satin peak lapels or shawl collar. The tuxedo jacket is single-breasted with one button and features satin-covered buttons. Crisp white formal dress shirt with a wing collar or turndown collar, French cuffs with elegant cufflinks. A black bow tie (self-tied appearance) or long black tie. Black tuxedo pants with a satin stripe down the side. Optional: black vest or cummerbund. The fabric is high-quality wool with a subtle sheen. Every detail is immaculate - this is formal black-tie elegance.'
            },
            'medical-professional': {
                name: 'Medical Professional',
                icon: 'bx-plus-medical',
                description: 'White coat, scrubs, healthcare attire',
                outfitDescription: 'A crisp white medical lab coat, knee-length, with long sleeves and a professional fit. The coat is made from high-quality, wrinkle-resistant fabric. Underneath, either professional business casual attire (dress shirt and slacks) or clean medical scrubs in navy blue or ceil blue. If wearing scrubs, they are well-fitted and professional-looking. Optional: a stethoscope draped around the neck. The overall appearance is clean, professional, and authoritative - conveying medical expertise and trustworthiness.'
            },
            'uniform-professional': {
                name: 'Industry Uniform',
                icon: 'bx-id-card',
                description: 'Professional uniform, industry-specific',
                outfitDescription: 'A professional industry-specific uniform appropriate for fields such as aviation (pilot uniform with epaulettes and tie), hospitality (formal vest and tie), or corporate services (branded polo shirt or uniform shirt). The uniform is clean, well-pressed, and properly fitted. Colors are typically navy blue, black, or company-specific branding colors. The appearance is polished, professional, and clearly represents a specific industry or organization. All details are crisp and authoritative.'
            },
            'minimalist-modern': {
                name: 'Minimalist Modern',
                icon: 'bx-minus-circle',
                description: 'Clean lines, monochrome, contemporary',
                outfitDescription: 'A minimalist, contemporary outfit featuring clean lines and monochromatic colors. A well-fitted black or charcoal turtleneck or mock-neck shirt made from high-quality fabric with a subtle sheen. Paired with tailored black pants or dark jeans. The overall aesthetic is sleek, modern, and sophisticated with no visible logos or patterns. The focus is on perfect fit, quality fabrics, and understated elegance. This is contemporary minimalism - think Steve Jobs or modern design aesthetic.'
            }
        };
    }

    /**
     * Switch outfit mode (preset vs reference)
     */
    switchOutfitMode(mode) {
        this.outfitMode = mode;

        // Update mode buttons
        this.elements.outfitModeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.outfitMode === mode);
        });

        // Update content visibility
        Object.entries(this.elements.attireContents).forEach(([contentMode, content]) => {
            if (content) {
                content.classList.toggle('active', contentMode === mode);
            }
        });

        // Clear selections when switching modes
        if (mode === 'preset') {
            this.referenceOutfitImageData = null;
            this.outfitDescription = null;
        } else {
            this.selectedAttirePreset = null;
            this.outfitDescription = null;
            this.elements.attirePresetButtons.forEach(btn => btn.classList.remove('selected'));
        }

        this.updateSelectedAttireDisplay();
        this.updateUIState(); // Update button state
    }

    /**
     * Select or toggle an attire preset
     */
    selectAttirePreset(attireKey) {
        // If clicking the same attire preset again, deselect it
        if (this.selectedAttirePreset === attireKey) {
            this.selectedAttirePreset = null;
            this.outfitDescription = null; // clear preset-provided description
            this.outfitMode = 'preset'; // remain in preset mode but with none selected

            // Remove highlight from all attire preset cards
            this.elements.attirePresetButtons.forEach(btn => {
                btn.classList.remove('selected');
            });

            // Update UI state and display
            this.updateSelectedAttireDisplay();
            this.updateUIState();

            // Inform user
            this.showStatus('Attire preset deselected.', 'info');
            return;
        }

        // Select a new attire preset
        this.selectedAttirePreset = attireKey;
        this.outfitMode = 'preset';

        // Highlight the selected attire preset and unhighlight others
        this.elements.attirePresetButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.attire === attireKey);
        });

        // Get outfit description from preset
        const attirePresets = this.getAttirePresets();
        if (attirePresets[attireKey]) {
            this.outfitDescription = attirePresets[attireKey].outfitDescription;
            this.updateSelectedAttireDisplay();
            this.updateUIState(); // Enable Apply button
            this.showStatus(`Selected attire: ${attirePresets[attireKey].name}`, 'info');
        }
    }

    /**
     * Handle reference outfit image upload
     */
    async handleReferenceOutfitUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showStatus('Please upload a valid image file', 'error');
            return;
        }

        try {
            // Read file as data URL
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageDataUrl = e.target.result;
                this.referenceOutfitImageData = imageDataUrl;

                // Display preview
                this.elements.referenceOutfitImg.src = imageDataUrl;
                this.elements.referenceOutfitPreview.style.display = 'block';
                this.elements.outfitAnalysisStatus.style.display = 'flex';
                this.elements.outfitDescriptionDisplay.style.display = 'none';

                // Analyze the outfit
                await this.analyzeOutfitImage(imageDataUrl);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading reference outfit:', error);
            this.showStatus('Failed to upload outfit image', 'error');
        }
    }

    /**
     * Analyze outfit image using Gemini API
     */
    async analyzeOutfitImage(imageDataUrl) {
        try {
            this.showStatus('Analyzing outfit...', 'loading');

            // Get API key
            const apiKey = this.app.modules.storage.getApiKey();
            if (!apiKey) {
                throw new Error('API key not found. Please set your API key first.');
            }

            // Strip data URL prefix to get clean base64
            const base64Data = imageDataUrl.split(',')[1];

            // Create detailed outfit analysis prompt
            const analysisPrompt = `Analyze this outfit image in extreme detail. Provide a comprehensive description that includes:

1. **Clothing Type**: Identify each garment (shirt, blazer, suit, dress, etc.)
2. **Colors**: Describe exact colors and shades (e.g., "navy blue", "charcoal gray", "crisp white")
3. **Patterns**: Note any patterns (solid, striped, checkered, herringbone, etc.)
4. **Fabric & Texture**: Describe fabric appearance (cotton, wool, silk, linen, etc.) and texture
5. **Fit & Cut**: Describe how the clothing fits (tailored, slim-fit, relaxed, etc.)
6. **Style Details**: Note specific features like:
   - Collar type (spread, button-down, crew neck, etc.)
   - Sleeves (long, short, rolled up, etc.)
   - Buttons, lapels, pockets, etc.
   - Any accessories (tie, pocket square, etc.)
7. **Formality Level**: Classify as casual, smart casual, business casual, business professional, or formal
8. **Overall Style**: Describe the overall aesthetic (modern, classic, minimalist, bold, etc.)

Provide a single, detailed paragraph that could be used to recreate this exact outfit on another person. Be specific about colors, materials, and style details.`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
            
            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64Data
                            }
                        },
                        {
                            text: analysisPrompt
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["TEXT"],
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            };

            console.log('🔍 [LINKEDIN STUDIO] Analyzing outfit image...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            const outfitDescription = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!outfitDescription) {
                throw new Error('No outfit description returned from API');
            }

            console.log('✅ [LINKEDIN STUDIO] Outfit analysis complete');
            console.log('👔 [LINKEDIN STUDIO] Outfit description:', outfitDescription);

            // Store the description
            this.outfitDescription = outfitDescription;
            this.outfitMode = 'reference';

            // Display the description
            this.elements.outfitAnalysisStatus.style.display = 'none';
            this.elements.outfitDescriptionDisplay.style.display = 'block';
            this.elements.outfitDescriptionText.textContent = outfitDescription;

            this.updateSelectedAttireDisplay();
            this.updateUIState(); // Enable Apply button
            this.showStatus('Outfit analyzed successfully! Ready to apply.', 'success');

        } catch (error) {
            console.error('❌ [LINKEDIN STUDIO] Outfit analysis failed:', error);
            this.elements.outfitAnalysisStatus.style.display = 'none';
            this.showStatus(`Outfit analysis failed: ${error.message}`, 'error');
        }
    }

    /**
     * Remove reference outfit
     */
    removeReferenceOutfit() {
        this.referenceOutfitImageData = null;
        this.outfitDescription = null;
        this.elements.referenceOutfitInput.value = '';
        this.elements.referenceOutfitPreview.style.display = 'none';
        this.updateSelectedAttireDisplay();
        this.updateUIState(); // Disable Apply button
        this.showStatus('Reference outfit removed', 'info');
    }

    /**
     * Update selected attire display
     */
    updateSelectedAttireDisplay() {
        if (this.outfitDescription) {
            this.elements.selectedAttireDisplay.style.display = 'block';

            if (this.outfitMode === 'preset' && this.selectedAttirePreset) {
                const attirePresets = this.getAttirePresets();
                this.elements.selectedAttireName.textContent = `Attire: ${attirePresets[this.selectedAttirePreset].name}`;
            } else if (this.outfitMode === 'reference') {
                this.elements.selectedAttireName.textContent = 'Attire: Custom Reference Outfit';
            }
        } else {
            this.elements.selectedAttireDisplay.style.display = 'none';
            this.elements.selectedAttireName.textContent = 'No attire selected';
        }
    }

    /**
     * Generate AI prompt for transformation
     */
    generatePrompt(presetName = null) {
        // Special case: Outfit-only transformation (no preset selected)
        if (!presetName && this.outfitDescription) {
            let prompt = 'Transform this portrait by changing ONLY the clothing/outfit. Keep everything else exactly the same - maintain the same pose, facial expression, background, lighting, and overall composition. ';
            prompt += '\n\nOUTFIT TO APPLY: The person in the photo must be wearing the following outfit: ';
            prompt += this.outfitDescription;
            prompt += '\n\nEnsure the outfit is accurately recreated with all the specified details including colors, style, fit, and accessories. The clothing should look natural and professionally fitted on the person. Do not change anything else about the image - only replace the clothing.';
            return prompt;
        }

        const settings = presetName ? this.getPresets()[presetName].settings : this.studioSettings;
        const template = presetName ? this.getPresets()[presetName].promptTemplate : null;

        // If using a preset with a template, use it as the base
        let prompt = '';
        if (template) {
            prompt = template;
        } else {
            // Otherwise, generate prompt from current studio settings
            prompt = 'Transform this portrait into a professional LinkedIn profile picture. ';
        }

        // Add outfit/attire description if available
        if (this.outfitDescription) {
            prompt += '\n\nIMPORTANT - OUTFIT REQUIREMENT: The person in the photo must be wearing the following outfit: ';
            prompt += this.outfitDescription;
            prompt += ' Ensure the outfit is accurately recreated with all the specified details including colors, style, fit, and accessories. The clothing should look natural and professionally fitted on the person.';
            prompt += '\n\n';
        }

        // If we had a template, return it with outfit description
        if (template) {
            return prompt;
        }

        // Continue with studio settings for custom prompts

        // Lighting description
        const lightingDir = settings.lightingDirection;
        const lightingInt = settings.lightingIntensity;
        const colorTemp = settings.colorTemperature;

        if (lightingDir === 0) {
            prompt += 'Use frontal lighting ';
        } else if (lightingDir > 0 && lightingDir <= 90) {
            prompt += `Use side lighting from ${lightingDir} degrees `;
        } else if (lightingDir > 90 && lightingDir <= 180) {
            prompt += `Use back lighting from ${lightingDir} degrees `;
        } else {
            prompt += `Use lighting from ${lightingDir} degrees `;
        }

        if (lightingInt <= 0.4) {
            prompt += 'with soft, gentle intensity. ';
        } else if (lightingInt <= 0.7) {
            prompt += 'with balanced intensity. ';
        } else {
            prompt += 'with dramatic, strong intensity. ';
        }

        if (colorTemp < 5000) {
            prompt += `Apply warm color temperature (${colorTemp}K) for a cozy feel. `;
        } else if (colorTemp <= 6000) {
            prompt += `Apply neutral color temperature (${colorTemp}K) for natural look. `;
        } else {
            prompt += `Apply cool color temperature (${colorTemp}K) for modern feel. `;
        }

        // Camera description
        prompt += `Use ${settings.focalLength}mm focal length. `;

        if (settings.cameraAngle < 0) {
            prompt += 'Position camera below eye level for dynamic perspective. ';
        } else if (settings.cameraAngle === 0) {
            prompt += 'Position camera at eye level for natural connection. ';
        } else {
            prompt += 'Position camera above eye level for authoritative presence. ';
        }

        // Subject enhancements
        const smileInt = settings.smileIntensity;
        if (smileInt <= 0.2) {
            prompt += 'Subject should have a neutral, serious expression. ';
        } else if (smileInt <= 0.4) {
            prompt += 'Subject should have a subtle, professional smile. ';
        } else if (smileInt <= 0.7) {
            prompt += 'Subject should have a warm, genuine smile. ';
        } else {
            prompt += 'Subject should have a bright, engaging smile. ';
        }

        // Gaze direction
        switch (settings.gazeDirection) {
            case 'direct':
                prompt += 'Direct eye contact with camera for strong connection. ';
                break;
            case 'left':
                prompt += 'Gaze slightly to the left for thoughtful, contemplative look. ';
                break;
            case 'right':
                prompt += 'Gaze slightly to the right for approachable, engaging expression. ';
                break;
            case 'up':
                prompt += 'Gaze slightly upward for aspirational, visionary appearance. ';
                break;
            default:
                prompt += 'Direct eye contact with camera. ';
        }

        const skinRetouch = settings.skinRetouching;
        if (skinRetouch <= 0.3) {
            prompt += 'Minimal skin retouching for natural appearance. ';
        } else if (skinRetouch <= 0.7) {
            prompt += 'Balanced skin retouching for professional look. ';
        } else {
            prompt += 'Professional skin retouching for polished appearance. ';
        }

        // Background description
        const bgStyle = settings.backgroundStyle;
        const bgBlur = settings.backgroundBlur;

        switch (bgStyle) {
            case 'keep':
                prompt += 'Keep original background ';
                break;
            case 'solid-gray':
                prompt += 'Replace background with solid neutral gray (#E5E5E5) ';
                break;
            case 'solid-blue':
                prompt += 'Replace background with solid professional blue (#1E40AF) ';
                break;
            case 'solid-beige':
                prompt += 'Replace background with solid warm beige (#D4C5B9) ';
                break;
            case 'gradient':
                prompt += 'Create modern gradient background with professional tones ';
                break;
            case 'blurred-office':
                prompt += 'Create blurred office environment background with professional setting ';
                break;
            case 'blurred-bookshelf':
                prompt += 'Create blurred bookshelf background suggesting knowledge and expertise ';
                break;
            case 'blurred-natural':
                prompt += 'Create blurred natural background with soft, organic elements ';
                break;
            case 'studio-white':
                prompt += 'Create clean studio white background with professional lighting ';
                break;
            case 'studio-dark':
                prompt += 'Create dramatic studio dark background for bold, confident look ';
                break;
            default:
                prompt += 'Keep original background ';
        }

        if (bgBlur <= 0.4) {
            prompt += 'with slight blur. ';
        } else if (bgBlur <= 0.7) {
            prompt += 'with medium blur. ';
        } else {
            prompt += 'with strong blur for maximum subject focus. ';
        }

        prompt += 'Ensure the final image is professional, high-quality, and suitable for LinkedIn profile use.';

        return prompt;
    }

    /**
     * Analyze portrait and recommend preset/settings
     */
    async analyzePortrait() {
        // Check if we have an image
        if (!this.app.modules.editor || !this.app.modules.editor.imageNode) {
            this.showStatus('Please load an image first', 'error');
            return;
        }

        // Check if API key is set
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            this.showStatus('Please set your Gemini API key first', 'error');
            return;
        }

        try {
            // Show loading state
            this.showStatus('Analyzing portrait...', 'loading');
            if (this.elements.analyzeBtn) {
                this.elements.analyzeBtn.disabled = true;
                this.elements.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyzing...</span>';
            }

            // Get current canvas image as base64
            const imageData = await this.app.modules.editor.getImageAsBase64();

            // Create analysis prompt
            const analysisPrompt = `Analyze this portrait image for LinkedIn profile picture optimization.

Provide a detailed analysis including:

1. **Current Lighting Quality** (1-10 score):
   - Direction (front, side, back, mixed)
   - Intensity (soft, balanced, dramatic)
   - Color temperature (warm, neutral, cool)
   - Overall quality assessment

2. **Background Assessment**:
   - Type (solid color, gradient, office, natural, cluttered, etc.)
   - Professionalism level (1-10)
   - Distraction level (low, medium, high)
   - Recommended changes

3. **Subject Presentation**:
   - Facial expression (neutral, smiling, serious, etc.)
   - Eye contact (direct, averted)
   - Clothing style (casual, business casual, formal, creative)
   - Professional appearance score (1-10)

4. **Technical Quality**:
   - Image sharpness (1-10)
   - Composition (centered, rule of thirds, etc.)
   - Camera angle (below, eye level, above)
   - Focal length estimate (wide, normal, telephoto)

5. **LinkedIn Suitability**:
   - Overall professional score (1-10)
   - Industry fit (corporate, creative, tech, healthcare, finance, etc.)
   - Recommended preset (Corporate Modern, Creative Professional, Tech Executive, Thought Leader, Finance/Legal, or Healthcare Professional)

6. **Specific Recommendations**:
   - What needs improvement
   - Suggested adjustments (lighting, background, expression, etc.)
   - Why the recommended preset is best for this portrait

Format your response as a structured analysis with clear sections and scores. Be specific and actionable.`;

            // Call Gemini API
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: imageData
                            }
                        },
                        {
                            text: analysisPrompt
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["TEXT"],
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            };

            console.log('🔍 [LINKEDIN STUDIO] Sending portrait for analysis...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!analysisText) {
                throw new Error('No analysis returned from API');
            }

            console.log('✅ [LINKEDIN STUDIO] Portrait analysis complete');
            console.log('📊 [LINKEDIN STUDIO] Analysis:', analysisText);

            // Extract recommended preset from analysis
            const recommendedPreset = this.extractRecommendedPreset(analysisText);

            // Display analysis results
            this.displayAnalysisResults(analysisText, recommendedPreset);

        } catch (error) {
            console.error('❌ [LINKEDIN STUDIO] Analysis error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            // Reset button state
            if (this.elements.analyzeBtn) {
                this.elements.analyzeBtn.disabled = false;
                this.elements.analyzeBtn.innerHTML = '<i class="fas fa-search"></i> <span>Analyze Portrait</span>';
            }
        }
    }

    /**
     * Extract recommended preset from analysis text
     */
    extractRecommendedPreset(analysisText) {
        const text = analysisText.toLowerCase();

        // Check for each preset name in the analysis
        if (text.includes('corporate modern') || text.includes('corporate')) {
            return 'corporate';
        } else if (text.includes('creative professional') || text.includes('creative')) {
            return 'creative';
        } else if (text.includes('tech executive') || text.includes('tech')) {
            return 'tech';
        } else if (text.includes('thought leader')) {
            return 'thought-leader';
        } else if (text.includes('finance') || text.includes('legal')) {
            return 'finance';
        } else if (text.includes('healthcare')) {
            return 'healthcare';
        }

        return null; // No specific preset recommended
    }

    /**
     * Display analysis results to user
     */
    displayAnalysisResults(analysisText, recommendedPreset) {
        // Create a modal or alert to show the analysis
        const modal = document.createElement('div');
        modal.className = 'analysis-modal';
        modal.innerHTML = `
            <div class="analysis-modal-content">
                <div class="analysis-modal-header">
                    <h3><i class="fas fa-chart-line"></i> Portrait Analysis Results</h3>
                    <button class="analysis-modal-close" onclick="this.closest('.analysis-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="analysis-modal-body">
                    <div class="analysis-text">${this.formatAnalysisText(analysisText)}</div>
                    ${recommendedPreset ? `
                        <div class="analysis-recommendation">
                            <h4><i class="fas fa-lightbulb"></i> Recommended Action</h4>
                            <p>Based on the analysis, we recommend the <strong>${this.getPresetName(recommendedPreset)}</strong> preset.</p>
                            <button class="btn-primary analysis-apply-btn" data-preset="${recommendedPreset}">
                                <i class="fas fa-magic"></i>
                                <span>Apply ${this.getPresetName(recommendedPreset)}</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listener for apply button
        const applyBtn = modal.querySelector('.analysis-apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const preset = applyBtn.dataset.preset;
                modal.remove();
                this.selectPreset(preset);
                // Auto-apply the transformation
                setTimeout(() => this.applyTransformation(), 300);
            });
        }

        this.showStatus('✅ Analysis complete! Review recommendations.', 'success');
    }

    /**
     * Format analysis text for display
     */
    formatAnalysisText(text) {
        // Convert markdown-style formatting to HTML
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\n\n/g, '</p><p>') // Paragraphs
            .replace(/\n/g, '<br>') // Line breaks
            .replace(/(\d+)\./g, '<br><strong>$1.</strong>') // Numbered lists
            .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>'); // Bullet points

        return `<p>${formatted}</p>`;
    }

    /**
     * Get preset display name
     */
    getPresetName(presetKey) {
        const names = {
            'corporate': 'Corporate Modern',
            'creative': 'Creative Professional',
            'tech': 'Tech Executive',
            'thought-leader': 'Thought Leader',
            'finance': 'Finance/Legal',
            'healthcare': 'Healthcare Professional'
        };
        return names[presetKey] || presetKey;
    }

    /**
     * Apply transformation
     */
    async applyTransformation() {
        // Check if we have an image
        if (!this.app.modules.editor || !this.app.modules.editor.imageNode) {
            this.showStatus('Please load an image first', 'error');
            return;
        }

        // Check if we have either a preset OR an outfit description
        if (!this.selectedPreset && !this.outfitDescription) {
            this.showStatus('Please select a LinkedIn preset or choose an attire style first', 'error');
            return;
        }

        // Check if API key is set
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            this.showStatus('Please set your Gemini API key first', 'error');
            return;
        }

        try {
            // Show loading state
            const transformationType = this.selectedPreset ? 'Transforming portrait...' : 'Applying outfit...';
            this.showStatus(transformationType, 'loading');
            if (this.elements.applyBtn) {
                this.elements.applyBtn.disabled = true;
                this.elements.applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Transforming...</span>';
            }
            if (this.elements.applyPresetBtn) {
                this.elements.applyPresetBtn.disabled = true;
                this.elements.applyPresetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Transforming...</span>';
            }

            // Get current canvas image as base64
            const imageData = await this.app.modules.editor.getImageAsBase64();

            // Generate prompt
            let prompt = this.generatePrompt(this.selectedPreset);

            // Optionally run contextual analysis and merge into prompt
            if (this.useContextualAnalysis) {
                this.showStatus('Running contextual analysis...', 'loading');
                console.log('🔍 [LINKEDIN STUDIO] Contextual analysis enabled; analyzing canvas image...');
                const analysisText = await this.app.modules.gemini.analyzeCanvasImage(imageData);
                if (analysisText && typeof analysisText === 'string') {
                    prompt = `${prompt}\n\nContextual analysis of current image:\n${analysisText}`;
                }
            }

            console.log('🎨 [LINKEDIN STUDIO] Generated prompt:', prompt);

            // Call Gemini API for image editing (returns Blob URL)
            const editedImageUrl = await this.app.modules.gemini.editImage(imageData, prompt);

            if (editedImageUrl) {
                // Load edited image to canvas (already a Blob URL from API)
                await this.app.modules.editor.loadImage(editedImageUrl);

                // Save to gallery using the base64 data from API
                try {
                    const imageDataForGallery = this.app.modules.gemini.getLastGeneratedImageData();

                    if (imageDataForGallery) {
                        console.log('📸 [LINKEDIN STUDIO] Saving transformed image to gallery');
                        const imageId = await this.app.modules.gallery.addImage(imageDataForGallery, prompt, {
                            type: 'linkedin-transformed',
                            model: 'gemini-2.5-flash-image',
                            preset: this.selectedPreset || 'custom'
                        });
                        this.app.modules.gallery.setActiveImage(imageId);
                        this.app.renderGallery();
                        console.log('✅ [LINKEDIN STUDIO] Transformed image saved to gallery');
                    }
                } catch (galleryError) {
                    console.warn('⚠️ [LINKEDIN STUDIO] Failed to save to gallery:', galleryError);
                    // Don't fail the whole operation if gallery save fails
                }

                this.showStatus('✅ Transformation complete!', 'success');
                console.log('✅ [LINKEDIN STUDIO] Transformation successful');
            } else {
                throw new Error('No image data returned from API');
            }

        } catch (error) {
            console.error('❌ [LINKEDIN STUDIO] Transformation error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            // Reset button states
            if (this.elements.applyBtn) {
                this.elements.applyBtn.disabled = false;
                this.elements.applyBtn.innerHTML = '<i class="fas fa-magic"></i> <span>Apply Transform</span>';
            }
            if (this.elements.applyPresetBtn) {
                this.elements.applyPresetBtn.disabled = false;
                this.elements.applyPresetBtn.innerHTML = '<i class="fas fa-magic"></i> <span>Apply Transform</span>';
            }
        }
    }
    
    /**
     * Update UI state based on canvas
     */
    updateUIState() {
        const hasImage = this.app.modules.editor && this.app.modules.editor.imageNode !== null;

        // IMPORTANT: Only disable LinkedIn Pro Studio tab content, NOT the entire panel
        // The AD Studio tab should always be enabled since it generates its own images
        if (this.elements.studioTabContents.linkedinPro) {
            this.elements.studioTabContents.linkedinPro.classList.toggle('disabled', !hasImage);
        }

        // Enable/disable buttons (LinkedIn Pro Studio only)
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.disabled = !hasImage;
        }

        // Toggle disabled when no image
        if (this.elements.contextToggle) {
            this.elements.contextToggle.disabled = !hasImage;
        }

        // Apply Preset button - enable if image exists AND (preset is selected OR outfit is selected)
        if (this.elements.applyPresetBtn) {
            const hasPresetOrOutfit = this.selectedPreset || this.outfitDescription;
            this.elements.applyPresetBtn.disabled = !hasImage || !hasPresetOrOutfit;
        }

        // Apply Studio button - enable if image exists AND (preset is selected OR outfit is selected)
        if (this.elements.applyBtn) {
            const hasPresetOrOutfit = this.selectedPreset || this.outfitDescription;
            this.elements.applyBtn.disabled = !hasImage || !hasPresetOrOutfit;
        }
    }
    
    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        if (!this.elements.statusDiv) return;
        
        this.elements.statusDiv.textContent = message;
        this.elements.statusDiv.className = `generation-status ${type}`;
        this.elements.statusDiv.style.display = 'block';
        
        // Auto-hide after 3 seconds for info messages
        if (type === 'info') {
            setTimeout(() => {
                this.elements.statusDiv.style.display = 'none';
            }, 3000);
        }
    }
}

// Export for use in main.js
window.LinkedInStudioManager = LinkedInStudioManager;

