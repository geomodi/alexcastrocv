/**
 * Prompt Enhancer Manager
 * Handles intelligent prompt enhancement with style presets
 */

class PromptEnhancerManager {
    constructor(app) {
        this.app = app;
        
        // UI Elements
        this.elements = {
            // Generation presets
            generationPresets: [],
            generationPresetsContainer: null,

            // Edit presets
            editPresets: [],
            editPresetsContainer: null,

            // Aspect ratio buttons
            aspectRatioButtons: [],
            aspectRatioContainer: null,

            // Resolution buttons
            resolutionButtons: [],
            resolutionContainer: null
        };

        // State
        this.selectedGenerationPreset = null;
        this.selectedEditPreset = null;
        this.selectedAspectRatio = 'auto'; // Default to auto (use source image ratio)
        this.selectedResolution = '2K'; // Default to 2K for better quality (Nano Banana Pro supports 1K, 2K, 4K)
        
        // Preset definitions
        this.generationPresets = {
            photorealistic: {
                name: 'Photorealistic',
                icon: 'bxs-camera',
                modifier: 'photorealistic, 8K resolution, professional photography, sharp focus, natural lighting, DSLR quality, high detail'
            },
            anime: {
                name: 'Anime',
                icon: 'bxs-palette',
                modifier: 'anime style, vibrant colors, cel-shaded, detailed illustration, Studio Ghibli inspired, high quality anime art'
            },
            oilPainting: {
                name: 'Oil Painting',
                icon: 'bxs-brush',
                modifier: 'oil painting style, classical art, rich textures, visible brushstrokes, museum quality, artistic masterpiece'
            },
            cinematic: {
                name: 'Cinematic',
                icon: 'bxs-movie',
                modifier: 'cinematic lighting, dramatic composition, film grain, color graded, Hollywood quality, epic atmosphere'
            },
            fantasy: {
                name: 'Fantasy',
                icon: 'bxs-magic-wand',
                modifier: 'fantasy art style, magical atmosphere, highly detailed, concept art, trending on ArtStation, ethereal quality'
            },
            minimalist: {
                name: 'Minimalist',
                icon: 'bxs-cube',
                modifier: 'minimalist design, clean lines, simple composition, modern aesthetic, negative space, elegant simplicity'
            },
            cyberpunk: {
                name: 'Cyberpunk',
                icon: 'bxs-chip',
                modifier: 'cyberpunk style, neon lights, futuristic, high contrast, sci-fi atmosphere, dystopian aesthetic, vibrant neon colors'
            },
            landscape: {
                name: 'Landscape',
                icon: 'bxs-landscape',
                modifier: 'landscape photography, golden hour lighting, wide angle, depth of field, National Geographic quality, breathtaking vista'
            }
        };
        
        this.editPresets = {
            enhance: {
                name: 'Enhance',
                icon: 'bxs-star',
                modifier: 'enhance quality, improve details, sharpen, professional grade, increase clarity, optimize image'
            },
            vibrant: {
                name: 'Vibrant',
                icon: 'bxs-color-fill',
                modifier: 'increase saturation, vibrant colors, pop, eye-catching, bold and vivid, color boost'
            },
            moody: {
                name: 'Moody',
                icon: 'bxs-moon',
                modifier: 'moody atmosphere, dramatic lighting, deep shadows, cinematic mood, atmospheric depth, emotional tone'
            },
            bright: {
                name: 'Bright',
                icon: 'bxs-sun',
                modifier: 'brighten, increase exposure, airy, light and fresh, luminous, radiant quality'
            },
            cinematicEdit: {
                name: 'Cinematic',
                icon: 'bxs-film',
                modifier: 'cinematic color grading, film look, professional color correction, movie-quality enhancement'
            },
            portrait: {
                name: 'Portrait',
                icon: 'bxs-user-circle',
                modifier: 'portrait enhancement, skin smoothing, professional retouching, flattering lighting, beauty enhancement'
            },
            artistic: {
                name: 'Artistic',
                icon: 'bxs-brush-alt',
                modifier: 'artistic interpretation, painterly effect, creative enhancement, stylized rendering, artistic flair'
            },
            dramatic: {
                name: 'Dramatic',
                icon: 'bxs-bolt',
                modifier: 'dramatic enhancement, high contrast, bold impact, striking visual, powerful composition'
            }
        };
    }
    
    /**
     * Initialize the Prompt Enhancer Manager
     */
    initialize() {
        this.cacheElements();
        this.attachEventListeners();
        console.log('✅ [PROMPT ENHANCER] Prompt Enhancer Manager initialized');
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        // Generation presets container
        this.elements.generationPresetsContainer = document.getElementById('generationStylePresets');

        // Edit presets container
        this.elements.editPresetsContainer = document.getElementById('editStylePresets');

        // Cache all generation preset buttons
        if (this.elements.generationPresetsContainer) {
            this.elements.generationPresets = this.elements.generationPresetsContainer.querySelectorAll('.style-preset-btn');
        }

        // Cache all edit preset buttons
        if (this.elements.editPresetsContainer) {
            this.elements.editPresets = this.elements.editPresetsContainer.querySelectorAll('.style-preset-btn');
        }

        // Cache all aspect ratio buttons (now in footer)
        this.elements.aspectRatioButtons = document.querySelectorAll('.aspect-ratio-footer-btn');

        // Cache all resolution buttons (in footer)
        this.elements.resolutionButtons = document.querySelectorAll('.resolution-footer-btn');

        console.log('📦 [PROMPT ENHANCER] Cached elements:', {
            generationPresets: this.elements.generationPresets.length,
            editPresets: this.elements.editPresets.length,
            aspectRatioButtons: this.elements.aspectRatioButtons.length,
            resolutionButtons: this.elements.resolutionButtons.length
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Generation preset buttons
        this.elements.generationPresets.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleGenerationPresetClick(e));
        });

        // Edit preset buttons
        this.elements.editPresets.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditPresetClick(e));
        });

        // Aspect ratio buttons
        this.elements.aspectRatioButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAspectRatioClick(e));
        });

        // Resolution buttons
        this.elements.resolutionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleResolutionClick(e));
        });
    }
    
    /**
     * Handle generation preset button click
     */
    handleGenerationPresetClick(event) {
        const button = event.currentTarget;
        const presetKey = button.dataset.preset;
        
        // Toggle selection
        if (this.selectedGenerationPreset === presetKey) {
            // Deselect
            this.selectedGenerationPreset = null;
            button.classList.remove('active');
            console.log('🔄 [PROMPT ENHANCER] Deselected generation preset:', presetKey);
        } else {
            // Deselect all other presets
            this.elements.generationPresets.forEach(btn => btn.classList.remove('active'));
            
            // Select this preset
            this.selectedGenerationPreset = presetKey;
            button.classList.add('active');
            console.log('✅ [PROMPT ENHANCER] Selected generation preset:', presetKey);
        }
    }
    
    /**
     * Handle edit preset button click
     */
    handleEditPresetClick(event) {
        const button = event.currentTarget;
        const presetKey = button.dataset.preset;

        // Toggle selection
        if (this.selectedEditPreset === presetKey) {
            // Deselect
            this.selectedEditPreset = null;
            button.classList.remove('active');
            console.log('🔄 [PROMPT ENHANCER] Deselected edit preset:', presetKey);
        } else {
            // Deselect all other presets
            this.elements.editPresets.forEach(btn => btn.classList.remove('active'));

            // Select this preset
            this.selectedEditPreset = presetKey;
            button.classList.add('active');
            console.log('✅ [PROMPT ENHANCER] Selected edit preset:', presetKey);
        }
    }

    /**
     * Handle aspect ratio button click
     */
    handleAspectRatioClick(event) {
        const button = event.currentTarget;
        const ratio = button.dataset.ratio;

        // Don't allow deselection - one must always be active
        if (this.selectedAspectRatio === ratio) {
            return; // Already selected, do nothing
        }

        // Deselect all other aspect ratio buttons
        this.elements.aspectRatioButtons.forEach(btn => btn.classList.remove('active'));

        // Select this aspect ratio
        this.selectedAspectRatio = ratio;
        button.classList.add('active');
        console.log('✅ [PROMPT ENHANCER] Selected aspect ratio:', ratio);
    }

    /**
     * Handle resolution button click
     */
    handleResolutionClick(event) {
        const button = event.currentTarget;
        const resolution = button.dataset.resolution;

        // Don't allow deselection - one must always be active
        if (this.selectedResolution === resolution) {
            return; // Already selected, do nothing
        }

        // Deselect all other resolution buttons
        this.elements.resolutionButtons.forEach(btn => btn.classList.remove('active'));

        // Select this resolution
        this.selectedResolution = resolution;
        button.classList.add('active');
        console.log('✅ [PROMPT ENHANCER] Selected resolution:', resolution);
    }

    /**
     * Enhance a generation prompt with the selected preset
     * Note: Aspect ratio is NOT added to the prompt - it's passed as a separate API parameter
     * @param {string} userPrompt - The user's original prompt
     * @returns {string} - Enhanced prompt with style modifiers
     */
    enhanceGenerationPrompt(userPrompt) {
        let enhancedPrompt = userPrompt;

        // Add style preset modifiers if selected
        if (this.selectedGenerationPreset) {
            const preset = this.generationPresets[this.selectedGenerationPreset];
            if (preset) {
                enhancedPrompt = this.buildEnhancedPrompt(enhancedPrompt, preset.modifier);
            } else {
                console.warn('⚠️ [PROMPT ENHANCER] Invalid generation preset:', this.selectedGenerationPreset);
            }
        }

        console.log('🎨 [PROMPT ENHANCER] Enhanced generation prompt:', {
            original: userPrompt,
            preset: this.selectedGenerationPreset ? this.generationPresets[this.selectedGenerationPreset].name : 'None',
            aspectRatio: this.selectedAspectRatio,
            enhanced: enhancedPrompt
        });

        return enhancedPrompt;
    }
    
    /**
     * Enhance an edit prompt with the selected preset
     * @param {string} userPrompt - The user's original edit instruction
     * @returns {string} - Enhanced prompt with edit modifiers
     */
    enhanceEditPrompt(userPrompt) {
        if (!this.selectedEditPreset) {
            // No preset selected, return original prompt
            return userPrompt;
        }
        
        const preset = this.editPresets[this.selectedEditPreset];
        if (!preset) {
            console.warn('⚠️ [PROMPT ENHANCER] Invalid edit preset:', this.selectedEditPreset);
            return userPrompt;
        }
        
        // Intelligently enhance the edit instruction
        const enhancedPrompt = this.buildEnhancedPrompt(userPrompt, preset.modifier);
        
        console.log('🎨 [PROMPT ENHANCER] Enhanced edit prompt:', {
            original: userPrompt,
            preset: preset.name,
            enhanced: enhancedPrompt
        });
        
        return enhancedPrompt;
    }
    
    /**
     * Build enhanced prompt by intelligently combining user input with modifiers
     * @param {string} userPrompt - User's original prompt
     * @param {string} modifier - Style modifier to add
     * @returns {string} - Combined enhanced prompt
     */
    buildEnhancedPrompt(userPrompt, modifier) {
        // Trim user prompt
        const trimmedPrompt = userPrompt.trim();
        
        if (!trimmedPrompt) {
            // If user prompt is empty, just return the modifier
            return modifier;
        }
        
        // Combine user prompt with modifier
        // Format: "user prompt, style modifiers"
        return `${trimmedPrompt}, ${modifier}`;
    }
    
    /**
     * Get the currently selected generation preset
     * @returns {object|null} - Preset object or null
     */
    getSelectedGenerationPreset() {
        if (!this.selectedGenerationPreset) return null;
        return this.generationPresets[this.selectedGenerationPreset];
    }
    
    /**
     * Get the currently selected edit preset
     * @returns {object|null} - Preset object or null
     */
    getSelectedEditPreset() {
        if (!this.selectedEditPreset) return null;
        return this.editPresets[this.selectedEditPreset];
    }

    /**
     * Get the currently selected aspect ratio
     * @returns {string|null} - Aspect ratio (e.g., '1:1', '16:9', '9:16') or null for 'auto'
     */
    getSelectedAspectRatio() {
        // Return null for 'auto' so the API uses the source image's aspect ratio
        return this.selectedAspectRatio === 'auto' ? null : this.selectedAspectRatio;
    }

    /**
     * Set aspect ratio to auto (use source image ratio)
     * Called when an image is uploaded/opened
     */
    setAspectRatioToAuto() {
        this.selectedAspectRatio = 'auto';
        this.elements.aspectRatioButtons.forEach(btn => {
            if (btn.dataset.ratio === 'auto') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        console.log('✅ [PROMPT ENHANCER] Aspect ratio set to auto (use source image ratio)');
    }

    /**
     * Get the currently selected resolution
     * @returns {string} - Resolution (e.g., '1K', '2K', '4K')
     */
    getSelectedResolution() {
        return this.selectedResolution;
    }

    /**
     * Reset all preset selections
     */
    resetAllPresets() {
        // Reset generation presets
        this.selectedGenerationPreset = null;
        this.elements.generationPresets.forEach(btn => btn.classList.remove('active'));

        // Reset edit presets
        this.selectedEditPreset = null;
        this.elements.editPresets.forEach(btn => btn.classList.remove('active'));

        // Reset aspect ratio to default (auto)
        this.selectedAspectRatio = 'auto';
        this.elements.aspectRatioButtons.forEach(btn => {
            if (btn.dataset.ratio === 'auto') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Reset resolution to default (2K)
        this.selectedResolution = '2K';
        this.elements.resolutionButtons.forEach(btn => {
            if (btn.dataset.resolution === '2K') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        console.log('🔄 [PROMPT ENHANCER] All presets reset');
    }
}

