/**
 * Face & Body Editor Manager
 * Manages face and body enhancement features for LinkedIn Studio Pro
 */

class FaceBodyEditorManager {
    constructor(app) {
        this.app = app;
        this.elements = {};
        
        // State for all controls
        this.state = {
            // Preset selection
            selectedPreset: null,
            
            // Skin & Age
            wrinkleReduction: 0,
            skinSmoothing: 0,
            removeBlemishes: false,
            ageAdjustment: 0,
            
            // Face Shape
            faceSlimming: 0,
            noseRefinement: 0,
            
            // Eyes
            eyeColor: 'original',
            eyeShape: 'original',
            
            // Teeth
            teethWhitening: 0,
            
            // Hair
            hairColor: 'original',
            customHairColor: '#000000',
            hairLength: 0,
            hairVolume: 0,
            hairStyleDescription: null,
            hairReferenceUrl: null,
            hairReferenceData: null,
            
            // Body
            postureCorrection: false,
            shoulderWidth: 0,

            // Enhancement Strength
            enhancementStrength: 100
        };

        // Store image before enhancement for undo
        this.imageBeforeEnhancement = null;

        // Preset configurations
        this.presets = {
            natural: {
                name: 'Natural Enhancement',
                wrinkleReduction: 30,
                skinSmoothing: 30,
                removeBlemishes: true,
                teethWhitening: 30,
                faceSlimming: 0,
                noseRefinement: 0,
                ageAdjustment: 0
            },
            professional: {
                name: 'Professional Polish',
                wrinkleReduction: 50,
                skinSmoothing: 50,
                removeBlemishes: true,
                teethWhitening: 50,
                faceSlimming: 20,
                noseRefinement: 15,
                ageAdjustment: -5
            },
            dramatic: {
                name: 'Dramatic Transformation',
                wrinkleReduction: 70,
                skinSmoothing: 70,
                removeBlemishes: true,
                teethWhitening: 70,
                faceSlimming: 40,
                noseRefinement: 30,
                ageAdjustment: -10
            }
        };
    }

    /**
     * Initialize the Face & Body Editor
     */
    initialize() {
        console.log('🎨 [FACE & BODY] Initializing Face & Body Editor...');
        this.initializeElements();
        this.setupEventListeners();
        this.updateUIState();
        console.log('✅ [FACE & BODY] Face & Body Editor initialized');
    }

    /**
     * Get all DOM element references
     */
    initializeElements() {
        // Preset cards
        this.elements.presetCards = document.querySelectorAll('.face-preset-card');
        
        // Sliders
        this.elements.wrinkleReduction = document.getElementById('wrinkleReduction');
        this.elements.wrinkleReductionValue = document.getElementById('wrinkleReductionValue');
        this.elements.skinSmoothing = document.getElementById('skinSmoothing');
        this.elements.skinSmoothingValue = document.getElementById('skinSmoothingValue');
        this.elements.faceSlimming = document.getElementById('faceSlimming');
        this.elements.faceSlimmingValue = document.getElementById('faceSlimmingValue');
        this.elements.noseRefinement = document.getElementById('noseRefinement');
        this.elements.noseRefinementValue = document.getElementById('noseRefinementValue');
        this.elements.teethWhitening = document.getElementById('teethWhitening');
        this.elements.teethWhiteningValue = document.getElementById('teethWhiteningValue');
        this.elements.hairLength = document.getElementById('hairLength');
        this.elements.hairLengthValue = document.getElementById('hairLengthValue');
        this.elements.hairVolume = document.getElementById('hairVolume');
        this.elements.hairVolumeValue = document.getElementById('hairVolumeValue');
        this.elements.shoulderWidth = document.getElementById('shoulderWidth');
        this.elements.shoulderWidthValue = document.getElementById('shoulderWidthValue');
        
        // Toggles
        this.elements.removeBlemishes = document.getElementById('removeBlemishes');
        this.elements.removeBlemishesValue = document.getElementById('removeBlemishesValue');
        this.elements.postureCorrection = document.getElementById('postureCorrection');
        this.elements.postureCorrectionValue = document.getElementById('postureCorrectionValue');
        
        // Dropdowns
        this.elements.eyeColor = document.getElementById('eyeColor');
        this.elements.eyeShape = document.getElementById('eyeShape');
        this.elements.hairColor = document.getElementById('hairColor');
        this.elements.customHairColor = document.getElementById('customHairColor');
        this.elements.customHairColorGroup = document.getElementById('customHairColorGroup');
        this.elements.customHairColorValue = document.getElementById('customHairColorValue');
        
        // Age adjustment buttons
        this.elements.ageButtons = document.querySelectorAll('.age-btn');
        
        // Collapsible sections
        this.elements.collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        
        // Hair reference
        this.elements.uploadHairReferenceBtn = document.getElementById('uploadHairReferenceBtn');
        this.elements.hairReferenceInput = document.getElementById('hairReferenceInput');
        this.elements.hairReferencePreview = document.getElementById('hairReferencePreview');
        this.elements.hairReferenceImage = document.getElementById('hairReferenceImage');
        this.elements.removeHairReferenceBtn = document.getElementById('removeHairReferenceBtn');
        this.elements.hairAnalysisStatus = document.getElementById('hairAnalysisStatus');
        this.elements.hairDescriptionDisplay = document.getElementById('hairDescriptionDisplay');
        this.elements.hairDescriptionText = document.getElementById('hairDescriptionText');

        // Enhancement strength
        this.elements.enhancementStrength = document.getElementById('enhancementStrength');
        this.elements.enhancementStrengthValue = document.getElementById('enhancementStrengthValue');
        this.elements.enhancementStrengthLabel = document.getElementById('enhancementStrengthLabel');
        this.elements.strengthWarning = document.getElementById('strengthWarning');

        // Action buttons
        this.elements.resetBtn = document.getElementById('resetFaceBodyControls');
        this.elements.applyBtn = document.getElementById('applyFaceBodyEnhancements');
        this.elements.undoBtn = document.getElementById('undoFaceBodyEnhancement');
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Preset cards
        this.elements.presetCards.forEach(card => {
            card.addEventListener('click', () => {
                const preset = card.dataset.preset;
                this.selectPreset(preset);
            });
        });
        
        // Sliders
        this.setupSliderListener('wrinkleReduction', (value) => `${value}%`);
        this.setupSliderListener('skinSmoothing', (value) => `${value}%`);
        this.setupSliderListener('faceSlimming', (value) => `${value}%`);
        this.setupSliderListener('noseRefinement', (value) => `${value}%`);
        this.setupSliderListener('teethWhitening', (value) => `${value}%`);
        this.setupSliderListener('hairVolume', (value) => `${value}%`);
        
        // Hair Length (special formatting)
        if (this.elements.hairLength) {
            this.elements.hairLength.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.state.hairLength = value;
                if (value === 0) {
                    this.elements.hairLengthValue.textContent = 'No Change';
                } else if (value > 0) {
                    this.elements.hairLengthValue.textContent = `${value}% Longer`;
                } else {
                    this.elements.hairLengthValue.textContent = `${Math.abs(value)}% Shorter`;
                }
                this.updateUIState();
            });
        }
        
        // Shoulder Width (special formatting)
        if (this.elements.shoulderWidth) {
            this.elements.shoulderWidth.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.state.shoulderWidth = value;
                this.elements.shoulderWidthValue.textContent = `${value > 0 ? '+' : ''}${value}%`;
                this.updateUIState();
            });
        }
        
        // Toggles
        this.setupToggleListener('removeBlemishes');
        this.setupToggleListener('postureCorrection');
        
        // Dropdowns
        this.setupDropdownListener('eyeColor');
        this.setupDropdownListener('eyeShape');
        
        // Hair Color (with custom color support)
        if (this.elements.hairColor) {
            this.elements.hairColor.addEventListener('change', (e) => {
                this.state.hairColor = e.target.value;
                // Show/hide custom color picker
                if (e.target.value === 'custom') {
                    this.elements.customHairColorGroup.style.display = 'flex';
                } else {
                    this.elements.customHairColorGroup.style.display = 'none';
                }
                this.updateUIState();
            });
        }
        
        // Custom Hair Color
        if (this.elements.customHairColor) {
            this.elements.customHairColor.addEventListener('input', (e) => {
                this.state.customHairColor = e.target.value;
                this.elements.customHairColorValue.textContent = e.target.value;
                this.updateUIState();
            });
        }
        
        // Age adjustment buttons
        this.elements.ageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const age = parseInt(btn.dataset.age);
                this.state.ageAdjustment = age;
                // Update active state
                this.elements.ageButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateUIState();
            });
        });
        
        // Collapsible sections
        this.elements.collapsibleHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                section.classList.toggle('expanded');
            });
        });
        
        // Hair reference upload
        if (this.elements.uploadHairReferenceBtn) {
            this.elements.uploadHairReferenceBtn.addEventListener('click', () => {
                this.elements.hairReferenceInput.click();
            });
        }
        
        if (this.elements.hairReferenceInput) {
            this.elements.hairReferenceInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.uploadHairReference(e.target.files[0]);
                }
            });
        }
        
        if (this.elements.removeHairReferenceBtn) {
            this.elements.removeHairReferenceBtn.addEventListener('click', () => {
                this.removeHairReference();
            });
        }
        
        // Enhancement strength slider
        if (this.elements.enhancementStrength) {
            this.elements.enhancementStrength.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.state.enhancementStrength = value;
                this.updateStrengthDisplay(value);
            });
        }

        // Action buttons
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => {
                this.resetControls();
            });
        }

        if (this.elements.applyBtn) {
            this.elements.applyBtn.addEventListener('click', () => {
                this.applyEnhancements();
            });
        }

        if (this.elements.undoBtn) {
            this.elements.undoBtn.addEventListener('click', () => {
                this.undoEnhancement();
            });
        }
    }

    /**
     * Helper: Set up slider listener
     */
    setupSliderListener(name, formatter) {
        const slider = this.elements[name];
        const valueDisplay = this.elements[name + 'Value'];
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.state[name] = value;
                valueDisplay.textContent = formatter(value);
                this.updateUIState();
            });
        }
    }

    /**
     * Helper: Set up toggle listener
     */
    setupToggleListener(name) {
        const toggle = this.elements[name];
        const valueDisplay = this.elements[name + 'Value'];
        
        if (toggle && valueDisplay) {
            toggle.addEventListener('change', (e) => {
                this.state[name] = e.target.checked;
                valueDisplay.textContent = e.target.checked ? 'ON' : 'OFF';
                this.updateUIState();
            });
        }
    }

    /**
     * Helper: Set up dropdown listener
     */
    setupDropdownListener(name) {
        const dropdown = this.elements[name];

        if (dropdown) {
            dropdown.addEventListener('change', (e) => {
                this.state[name] = e.target.value;
                this.updateUIState();
            });
        }
    }

    /**
     * Select a preset enhancement
     */
    selectPreset(presetName) {
        console.log(`🎨 [FACE & BODY] Selecting preset: ${presetName}`);

        this.state.selectedPreset = presetName;
        const preset = this.presets[presetName];

        if (!preset) {
            console.error(`❌ [FACE & BODY] Unknown preset: ${presetName}`);
            return;
        }

        // Update UI - highlight selected card
        this.elements.presetCards.forEach(card => {
            if (card.dataset.preset === presetName) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        // Apply preset values to state (but don't update controls yet - that's for Phase 2)
        this.state.wrinkleReduction = preset.wrinkleReduction;
        this.state.skinSmoothing = preset.skinSmoothing;
        this.state.removeBlemishes = preset.removeBlemishes;
        this.state.teethWhitening = preset.teethWhitening;
        this.state.faceSlimming = preset.faceSlimming;
        this.state.noseRefinement = preset.noseRefinement;
        this.state.ageAdjustment = preset.ageAdjustment;

        this.updateUIState();

        console.log(`✅ [FACE & BODY] Preset "${preset.name}" selected`);
    }

    /**
     * Reset all controls to default values
     */
    resetControls() {
        console.log('🔄 [FACE & BODY] Resetting all controls...');

        // Reset state
        this.state.selectedPreset = null;
        this.state.wrinkleReduction = 0;
        this.state.skinSmoothing = 0;
        this.state.removeBlemishes = false;
        this.state.ageAdjustment = 0;
        this.state.faceSlimming = 0;
        this.state.noseRefinement = 0;
        this.state.eyeColor = 'original';
        this.state.eyeShape = 'original';
        this.state.teethWhitening = 0;
        this.state.hairColor = 'original';
        this.state.customHairColor = '#000000';
        this.state.hairLength = 0;
        this.state.hairVolume = 0;
        this.state.postureCorrection = false;
        this.state.shoulderWidth = 0;

        // Reset UI controls
        if (this.elements.wrinkleReduction) this.elements.wrinkleReduction.value = 0;
        if (this.elements.wrinkleReductionValue) this.elements.wrinkleReductionValue.textContent = '0%';
        if (this.elements.skinSmoothing) this.elements.skinSmoothing.value = 0;
        if (this.elements.skinSmoothingValue) this.elements.skinSmoothingValue.textContent = '0%';
        if (this.elements.faceSlimming) this.elements.faceSlimming.value = 0;
        if (this.elements.faceSlimmingValue) this.elements.faceSlimmingValue.textContent = '0%';
        if (this.elements.noseRefinement) this.elements.noseRefinement.value = 0;
        if (this.elements.noseRefinementValue) this.elements.noseRefinementValue.textContent = '0%';
        if (this.elements.teethWhitening) this.elements.teethWhitening.value = 0;
        if (this.elements.teethWhiteningValue) this.elements.teethWhiteningValue.textContent = '0%';
        if (this.elements.hairLength) this.elements.hairLength.value = 0;
        if (this.elements.hairLengthValue) this.elements.hairLengthValue.textContent = 'No Change';
        if (this.elements.hairVolume) this.elements.hairVolume.value = 0;
        if (this.elements.hairVolumeValue) this.elements.hairVolumeValue.textContent = '0%';
        if (this.elements.shoulderWidth) this.elements.shoulderWidth.value = 0;
        if (this.elements.shoulderWidthValue) this.elements.shoulderWidthValue.textContent = '0%';

        if (this.elements.removeBlemishes) this.elements.removeBlemishes.checked = false;
        if (this.elements.removeBlemishesValue) this.elements.removeBlemishesValue.textContent = 'OFF';
        if (this.elements.postureCorrection) this.elements.postureCorrection.checked = false;
        if (this.elements.postureCorrectionValue) this.elements.postureCorrectionValue.textContent = 'OFF';

        if (this.elements.eyeColor) this.elements.eyeColor.value = 'original';
        if (this.elements.eyeShape) this.elements.eyeShape.value = 'original';
        if (this.elements.hairColor) this.elements.hairColor.value = 'original';
        if (this.elements.customHairColorGroup) this.elements.customHairColorGroup.style.display = 'none';

        // Reset age buttons
        this.elements.ageButtons.forEach(btn => {
            if (btn.dataset.age === '0') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Reset preset selection
        this.elements.presetCards.forEach(card => {
            card.classList.remove('selected');
        });

        // Reset enhancement strength
        this.state.enhancementStrength = 100;
        if (this.elements.enhancementStrength) {
            this.elements.enhancementStrength.value = 100;
            this.updateStrengthDisplay(100);
        }

        // Remove hair reference
        this.removeHairReference();

        this.updateUIState();

        console.log('✅ [FACE & BODY] All controls reset');
    }

    /**
     * Upload hair style reference image
     */
    async uploadHairReference(file) {
        try {
            console.log('📸 [FACE & BODY] Uploading hair reference...');

            // Validate file
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file');
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('Image file is too large. Please use an image under 10MB.');
            }

            // Create preview
            this.state.hairReferenceUrl = URL.createObjectURL(file);
            this.elements.hairReferenceImage.src = this.state.hairReferenceUrl;
            this.elements.hairReferencePreview.style.display = 'block';
            this.elements.uploadHairReferenceBtn.style.display = 'none';

            // Show analysis status
            this.elements.hairAnalysisStatus.style.display = 'block';
            this.elements.hairAnalysisStatus.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Analyzing hair style...';

            // Convert to base64 for API
            const base64Data = await this.fileToBase64(file);
            this.state.hairReferenceData = base64Data;

            console.log('✅ [FACE & BODY] Hair reference uploaded, starting analysis...');

            // Analyze hair style with Gemini
            try {
                const hairDescription = await this.app.modules.gemini.analyzeHairStyle(base64Data);

                // Store description
                this.state.hairStyleDescription = hairDescription;

                // Update UI
                this.elements.hairAnalysisStatus.innerHTML = '<i class="bx bx-check-circle"></i> Analysis complete!';
                this.elements.hairAnalysisStatus.style.color = 'var(--success-color)';

                // Show description
                this.elements.hairDescriptionText.textContent = hairDescription;
                this.elements.hairDescriptionDisplay.style.display = 'block';

                console.log('✅ [FACE & BODY] Hair style analyzed successfully');

                // Update UI state
                this.updateUIState();

                // Show success notification
                if (this.app.modules.ui) {
                    this.app.modules.ui.showNotification('Hair style analyzed successfully!', 'success', 3000);
                }

            } catch (analysisError) {
                console.error('❌ [FACE & BODY] Hair analysis failed:', analysisError);

                // Show error in status
                this.elements.hairAnalysisStatus.innerHTML = '<i class="bx bx-error-circle"></i> Analysis failed';
                this.elements.hairAnalysisStatus.style.color = 'var(--error-color)';

                // Show error notification
                let errorMessage = 'Failed to analyze hair style. ';

                if (analysisError.message.includes('401')) {
                    errorMessage += 'Invalid API key.';
                } else if (analysisError.message.includes('429')) {
                    errorMessage += 'Rate limit exceeded. Please wait a moment.';
                } else {
                    errorMessage += 'Please try again.';
                }

                if (this.app.modules.ui) {
                    this.app.modules.ui.showNotification(errorMessage, 'error', 5000);
                }
            }

        } catch (error) {
            console.error('❌ [FACE & BODY] Error uploading hair reference:', error);
            if (this.app.modules.ui) {
                this.app.modules.ui.showNotification(error.message || 'Failed to upload reference image', 'error', 3000);
            }
        }
    }

    /**
     * Convert file to base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Update enhancement strength display
     */
    updateStrengthDisplay(value) {
        if (!this.elements.enhancementStrengthValue || !this.elements.enhancementStrengthLabel) {
            return;
        }

        // Update value
        this.elements.enhancementStrengthValue.textContent = `${value}%`;

        // Update label and color based on strength level
        let label = '';
        let level = '';

        if (value === 0) {
            label = 'No Effect';
            level = 'very-low';
        } else if (value <= 25) {
            label = 'Very Subtle';
            level = 'very-low';
        } else if (value <= 50) {
            label = 'Subtle';
            level = 'low';
        } else if (value <= 75) {
            label = 'Moderate';
            level = 'medium';
        } else if (value < 100) {
            label = 'Strong';
            level = 'high';
        } else {
            label = 'Full Strength';
            level = 'full';
        }

        this.elements.enhancementStrengthLabel.textContent = label;
        this.elements.enhancementStrengthValue.setAttribute('data-level', level);

        // Show warning for very low values
        if (this.elements.strengthWarning) {
            this.elements.strengthWarning.style.display = value <= 25 ? 'flex' : 'none';
        }
    }

    /**
     * Remove hair style reference
     */
    removeHairReference() {
        console.log('🗑️ [FACE & BODY] Removing hair reference...');

        // Clean up blob URL
        if (this.state.hairReferenceUrl) {
            URL.revokeObjectURL(this.state.hairReferenceUrl);
        }

        // Reset state
        this.state.hairReferenceUrl = null;
        this.state.hairReferenceData = null;
        this.state.hairStyleDescription = null;

        // Reset UI
        this.elements.hairReferencePreview.style.display = 'none';
        this.elements.uploadHairReferenceBtn.style.display = 'flex';
        this.elements.hairAnalysisStatus.style.display = 'none';
        this.elements.hairDescriptionDisplay.style.display = 'none';

        this.updateUIState();

        console.log('✅ [FACE & BODY] Hair reference removed');
    }

    /**
     * Undo last enhancement
     */
    async undoEnhancement() {
        if (!this.imageBeforeEnhancement) {
            console.warn('⚠️ [FACE & BODY] No enhancement to undo');
            return;
        }

        try {
            console.log('↩️ [FACE & BODY] Undoing enhancement...');

            // Reload the image before enhancement
            await this.app.modules.editor.loadImage(this.imageBeforeEnhancement);

            // Clear the stored image
            this.imageBeforeEnhancement = null;

            // Update UI
            this.updateUIState();

            // Show notification
            if (this.app.modules.ui) {
                this.app.modules.ui.showNotification('Enhancement undone', 'success', 2000);
            }

            console.log('✅ [FACE & BODY] Enhancement undone');

        } catch (error) {
            console.error('❌ [FACE & BODY] Failed to undo enhancement:', error);
            if (this.app.modules.ui) {
                this.app.modules.ui.showNotification('Failed to undo enhancement', 'error', 3000);
            }
        }
    }

    /**
     * Update UI state (enable/disable buttons)
     */
    updateUIState() {
        // Check if we have an image loaded
        const hasImage = this.app.modules.editor && this.app.modules.editor.imageNode;

        // Check if any enhancements are selected
        const hasPreset = this.state.selectedPreset !== null;
        const hasCustomChanges = this.hasCustomChanges();

        // Enable apply button if image exists AND (preset OR custom changes)
        if (this.elements.applyBtn) {
            this.elements.applyBtn.disabled = !hasImage || (!hasPreset && !hasCustomChanges);
        }

        // Enable undo button if we have a stored image
        if (this.elements.undoBtn) {
            this.elements.undoBtn.disabled = !this.imageBeforeEnhancement;
        }
    }

    /**
     * Check if any custom changes have been made
     */
    hasCustomChanges() {
        return (
            this.state.wrinkleReduction > 0 ||
            this.state.skinSmoothing > 0 ||
            this.state.removeBlemishes ||
            this.state.ageAdjustment !== 0 ||
            this.state.faceSlimming > 0 ||
            this.state.noseRefinement > 0 ||
            this.state.eyeColor !== 'original' ||
            this.state.eyeShape !== 'original' ||
            this.state.teethWhitening > 0 ||
            this.state.hairColor !== 'original' ||
            this.state.hairLength !== 0 ||
            this.state.hairVolume > 0 ||
            this.state.hairStyleDescription !== null ||
            this.state.postureCorrection ||
            this.state.shoulderWidth !== 0
        );
    }

    /**
     * Apply enhancements
     */
    async applyEnhancements() {
        console.log('🎨 [FACE & BODY] Apply enhancements clicked');

        // Check if we have an image
        if (!this.app.modules.editor || !this.app.modules.editor.imageNode) {
            console.error('❌ [FACE & BODY] No image loaded');
            if (this.app.modules.ui) {
                this.app.modules.ui.showNotification('Please load an image first', 'error', 3000);
            }
            return;
        }

        // Check if we have a preset or custom changes
        if (!this.state.selectedPreset && !this.hasCustomChanges()) {
            console.error('❌ [FACE & BODY] No preset or custom changes selected');
            if (this.app.modules.ui) {
                this.app.modules.ui.showNotification('Please select a preset or make custom changes', 'error', 3000);
            }
            return;
        }

        try {
            // Store current image for undo
            this.imageBeforeEnhancement = await this.app.modules.editor.getImageAsBase64();
            console.log('💾 [FACE & BODY] Stored image for undo');

            // Show loading
            if (this.app.showLoading) {
                this.app.showLoading('Applying Face & Body Enhancements...', 'This may take 10-30 seconds');
            }

            // Get current canvas image as base64
            const baseImageData = await this.app.modules.editor.getImageAsBase64();

            if (!baseImageData) {
                throw new Error('Failed to extract image data from canvas');
            }

            // Generate enhancement prompt
            const prompt = this.generateEnhancementPrompt();
            console.log('📝 [FACE & BODY] Generated prompt:', prompt);

            // Call Gemini API
            const enhancedImageUrl = await this.app.modules.gemini.faceBodyEnhancement(
                baseImageData,
                prompt
            );

            if (!enhancedImageUrl) {
                throw new Error('No enhanced image returned from API');
            }

            // Load enhanced image onto canvas
            await this.app.modules.editor.loadImage(enhancedImageUrl);

            // Save to gallery
            try {
                const imageDataForGallery = this.app.modules.gemini.getLastGeneratedImageData();

                if (imageDataForGallery) {
                    const promptSummary = this.state.selectedPreset
                        ? `Face & Body: ${this.presets[this.state.selectedPreset].name}`
                        : 'Face & Body: Custom Enhancements';

                    const imageId = await this.app.modules.gallery.addImage(
                        imageDataForGallery,
                        promptSummary,
                        {
                            type: 'face-body-enhancement',
                            preset: this.state.selectedPreset,
                            customChanges: this.hasCustomChanges()
                        }
                    );

                    this.app.modules.gallery.setActiveImage(imageId);
                    this.app.renderGallery();
                    console.log('✅ [FACE & BODY] Enhanced image saved to gallery');
                }
            } catch (galleryError) {
                console.warn('⚠️ [FACE & BODY] Failed to save to gallery:', galleryError);
            }

            // Hide loading
            if (this.app.hideLoading) {
                this.app.hideLoading();
            }

            // Show success
            if (this.app.showSuccess) {
                this.app.showSuccess('Face & Body enhancements applied successfully!');
            }

            console.log('✅ [FACE & BODY] Enhancements applied successfully');

        } catch (error) {
            console.error('❌ [FACE & BODY] Enhancement failed:', error);

            // Hide loading
            if (this.app.hideLoading) {
                this.app.hideLoading();
            }

            // Show error
            let errorMessage = 'Failed to apply enhancements. ';

            if (error.message.includes('401')) {
                errorMessage += 'Invalid API key. Please check your Gemini API key.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (error.message.includes('403')) {
                errorMessage += 'Access denied. Please check your API key permissions.';
            } else {
                errorMessage += 'Please try again or check your API key.';
            }

            if (this.app.showError) {
                this.app.showError(errorMessage);
            }
        }
    }

    /**
     * Generate enhancement prompt based on current state
     */
    generateEnhancementPrompt() {
        let basePrompt = '';

        // If preset is selected, use preset prompt
        if (this.state.selectedPreset) {
            basePrompt = this.generatePresetPrompt(this.state.selectedPreset);
        } else {
            // Otherwise, build custom prompt
            basePrompt = this.buildCustomEnhancementPrompt();
        }

        // Apply strength modifier if not at 100%
        if (this.state.enhancementStrength < 100) {
            const strengthPercent = this.state.enhancementStrength;
            basePrompt += `\n\nIMPORTANT - ENHANCEMENT STRENGTH MODIFIER:
Apply all the above enhancements at ${strengthPercent}% intensity.
- At ${strengthPercent}%, changes should be ${this.getStrengthDescription(strengthPercent)}.
- Scale all percentage-based adjustments proportionally (e.g., 50% wrinkle reduction becomes ${Math.round(50 * strengthPercent / 100)}%).
- Maintain photorealistic quality while reducing enhancement visibility.`;
        }

        return basePrompt;
    }

    /**
     * Get strength description for prompt
     */
    getStrengthDescription(strength) {
        if (strength <= 25) return 'barely noticeable, extremely subtle';
        if (strength <= 50) return 'subtle and natural';
        if (strength <= 75) return 'noticeable but still natural';
        return 'clearly visible but professional';
    }

    /**
     * Generate preset prompt
     */
    generatePresetPrompt(presetName) {
        const presetPrompts = {
            natural: `Transform this professional portrait with subtle, natural enhancements:

SKIN IMPROVEMENTS:
- Gently reduce visible wrinkles and fine lines by 30%
- Lightly smooth skin texture by 30% while preserving natural pores and skin detail
- Remove obvious blemishes, spots, and temporary skin imperfections
- Maintain natural skin texture and realistic appearance

TEETH:
- Brighten teeth by 30% to a natural, healthy white (avoid artificial brightness)

QUALITY REQUIREMENTS:
- Maintain completely photorealistic quality
- Enhancements should be barely noticeable - aim for "naturally good photo"
- Preserve all natural features, expressions, and character
- Avoid any artificial or over-processed appearance

PRESERVE UNCHANGED:
- Exact same facial expression and pose
- Identical background, lighting, and composition
- Same clothing, accessories, and hair
- Overall photo dimensions and framing
- Natural skin tone and complexion`,

            professional: `Transform this professional portrait with polished, corporate-level enhancements:

SKIN & COMPLEXION:
- Reduce visible wrinkles and fine lines by 50%
- Smooth skin texture by 50% while maintaining natural pores
- Remove all blemishes, moles, spots, and skin imperfections
- Even out skin tone for a healthy, professional appearance
- Rejuvenate appearance by approximately 5 years

FACIAL FEATURES:
- Slim face by 20% for more defined jawline and cheekbones
- Refine nose shape by 15% for a more balanced, proportional appearance

TEETH:
- Whiten teeth by 50% to a bright, professional white (natural-looking, not artificial)

QUALITY REQUIREMENTS:
- Maintain photorealistic quality with professional polish
- Enhancements should look like "best professional headshot"
- Avoid over-processed or artificial appearance
- Preserve natural character and authenticity

PRESERVE UNCHANGED:
- Exact same facial expression and pose
- Identical background, lighting, and composition
- Same clothing, accessories, and hair style/color
- Overall photo dimensions and framing`,

            dramatic: `Transform this professional portrait with significant, dramatic enhancements:

SKIN & COMPLEXION:
- Substantially reduce wrinkles and fine lines by 70%
- Heavily smooth skin texture by 70% for flawless appearance
- Remove all blemishes, moles, spots, scars, and skin imperfections
- Create perfectly even skin tone with healthy glow
- Rejuvenate appearance by approximately 10 years

FACIAL FEATURES:
- Slim face by 40% for dramatically defined jawline and cheekbones
- Refine nose shape by 30% for more refined, balanced proportions

TEETH:
- Whiten teeth by 70% to bright, camera-ready white

QUALITY REQUIREMENTS:
- Maintain photorealistic quality despite heavy enhancements
- Aim for "magazine cover" or "professional model" appearance
- Balance dramatic improvements with natural believability
- Avoid obviously artificial or plastic appearance

PRESERVE UNCHANGED:
- Exact same facial expression and pose
- Identical background, lighting, and composition
- Same clothing, accessories, and hair style/color
- Overall photo dimensions and framing

WARNING: This is a dramatic transformation. Results may look significantly different from original.`
        };

        return presetPrompts[presetName] || presetPrompts.professional;
    }

    /**
     * Build custom enhancement prompt from current state
     */
    buildCustomEnhancementPrompt() {
        let prompt = 'Transform this professional portrait with the following custom enhancements:\n\n';

        // Skin & Age Section
        const skinEnhancements = [];
        if (this.state.wrinkleReduction > 0) {
            skinEnhancements.push(`- Reduce visible wrinkles and fine lines by ${this.state.wrinkleReduction}%`);
        }
        if (this.state.skinSmoothing > 0) {
            skinEnhancements.push(`- Smooth skin texture by ${this.state.skinSmoothing}% while preserving natural detail`);
        }
        if (this.state.removeBlemishes) {
            skinEnhancements.push(`- Remove all blemishes, moles, spots, and skin imperfections`);
        }
        if (this.state.ageAdjustment < 0) {
            skinEnhancements.push(`- Rejuvenate appearance by approximately ${Math.abs(this.state.ageAdjustment)} years`);
        }

        if (skinEnhancements.length > 0) {
            prompt += 'SKIN & COMPLEXION:\n' + skinEnhancements.join('\n') + '\n\n';
        }

        // Face Shape Section
        const faceEnhancements = [];
        if (this.state.faceSlimming > 0) {
            faceEnhancements.push(`- Slim face by ${this.state.faceSlimming}% for more defined features`);
        }
        if (this.state.noseRefinement > 0) {
            faceEnhancements.push(`- Refine nose shape by ${this.state.noseRefinement}% for better proportions`);
        }

        if (faceEnhancements.length > 0) {
            prompt += 'FACIAL FEATURES:\n' + faceEnhancements.join('\n') + '\n\n';
        }

        // Eyes Section
        if (this.state.eyeColor !== 'original') {
            prompt += `EYES:\n- Change eye color to ${this.state.eyeColor}\n\n`;
        }
        if (this.state.eyeShape !== 'original') {
            const shapeDescriptions = {
                'rounder': 'rounder, more open appearance',
                'almond': 'almond-shaped, classic balanced look',
                'wider': 'wider, more alert appearance'
            };
            const description = shapeDescriptions[this.state.eyeShape] || this.state.eyeShape;
            prompt += `EYE SHAPE:\n- Modify eye shape to be ${description}\n\n`;
        }

        // Teeth Section
        if (this.state.teethWhitening > 0) {
            prompt += `TEETH:\n- Whiten teeth by ${this.state.teethWhitening}% to natural bright white\n\n`;
        }

        // Hair Section
        const hairEnhancements = [];

        // If hair reference is provided, use the detailed description
        if (this.state.hairStyleDescription) {
            hairEnhancements.push(`- Transform hair to match this style: ${this.state.hairStyleDescription}`);

            // If additional color/length/volume adjustments are specified, add them as modifications
            if (this.state.hairColor !== 'original') {
                if (this.state.hairColor === 'custom') {
                    hairEnhancements.push(`  * Adjust color to ${this.state.customHairColor}`);
                } else {
                    hairEnhancements.push(`  * Adjust color to ${this.state.hairColor}`);
                }
            }
            if (this.state.hairLength !== 0) {
                const direction = this.state.hairLength > 0 ? 'longer' : 'shorter';
                hairEnhancements.push(`  * Make ${Math.abs(this.state.hairLength)}% ${direction}`);
            }
            if (this.state.hairVolume > 0) {
                hairEnhancements.push(`  * Increase volume by ${this.state.hairVolume}%`);
            }
        } else {
            // No reference image - use individual controls
            if (this.state.hairColor !== 'original') {
                if (this.state.hairColor === 'custom') {
                    hairEnhancements.push(`- Change hair color to ${this.state.customHairColor}`);
                } else {
                    hairEnhancements.push(`- Change hair color to ${this.state.hairColor}`);
                }
            }
            if (this.state.hairLength !== 0) {
                const direction = this.state.hairLength > 0 ? 'longer' : 'shorter';
                hairEnhancements.push(`- Make hair ${Math.abs(this.state.hairLength)}% ${direction}`);
            }
            if (this.state.hairVolume > 0) {
                hairEnhancements.push(`- Increase hair volume and thickness by ${this.state.hairVolume}%`);
            }
        }

        if (hairEnhancements.length > 0) {
            prompt += 'HAIR:\n' + hairEnhancements.join('\n') + '\n\n';
        }

        // Body Section
        const bodyEnhancements = [];
        if (this.state.postureCorrection) {
            bodyEnhancements.push(`- Improve posture for more confident, upright appearance`);
        }
        if (this.state.shoulderWidth !== 0) {
            const direction = this.state.shoulderWidth > 0 ? 'wider' : 'narrower';
            bodyEnhancements.push(`- Adjust shoulder width ${Math.abs(this.state.shoulderWidth)}% ${direction} for better proportions`);
        }

        if (bodyEnhancements.length > 0) {
            prompt += 'BODY & POSTURE:\n' + bodyEnhancements.join('\n') + '\n\n';
        }

        // Quality & Preservation
        prompt += `QUALITY REQUIREMENTS:
- Maintain photorealistic quality
- Enhancements should look natural and professional
- Avoid over-processed or artificial appearance

PRESERVE UNCHANGED:
- Exact same facial expression and pose
- Identical background, lighting, and composition
- Same clothing and accessories (unless hair style affects clothing)
- Overall photo dimensions and framing`;

        return prompt;
    }
}
