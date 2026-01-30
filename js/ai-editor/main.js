/**
 * AI Image Editor - Main Application Controller
 * Coordinates all modules and manages application state
 */

class AIImageEditor {
    constructor() {
        this.modules = {};
        this.state = {
            apiKeyValid: false,
            currentImage: null,
            isGenerating: false,
            canvas: null,
            activeDrawingTool: null
        };

        this.init();
    }

    async init() {
        console.log('🎨 [AI EDITOR] Initializing AI Image Editor...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        try {
            // Initialize modules
            await this.initializeModules();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI state
            this.initializeUI();
            
            console.log('✅ [AI EDITOR] Application initialized successfully');
        } catch (error) {
            console.error('❌ [AI EDITOR] Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async initializeModules() {
        // Initialize Storage Manager
        this.modules.storage = new StorageManager();

        // Initialize UI Manager
        this.modules.ui = new UIManager(this);

        // Initialize Gemini API
        this.modules.gemini = new GeminiAPI(this);

        // Initialize Background Removal Manager
        this.modules.backgroundRemoval = new BackgroundRemovalManager(this);

        // Initialize Gallery Manager
        this.modules.gallery = new GalleryManager(this);

        // Initialize Object Transfer Manager
        this.modules.objectTransfer = new ObjectTransferManager(this);

        // Initialize Style Transfer Manager
        this.modules.styleTransfer = new StyleTransferManager(this);

        // Initialize LinkedIn Studio Manager
        this.modules.linkedinStudio = new LinkedInStudioManager(this);

        // Initialize Face & Body Editor Manager
        this.modules.faceBodyEditor = new FaceBodyEditorManager(this);

        // Initialize Ad Studio Manager
        this.modules.adStudio = new AdStudioManager(this);
        this.modules.adStudio.initialize();

        // Initialize Prompt Enhancer Manager
        this.modules.promptEnhancer = new PromptEnhancerManager(this);
        this.modules.promptEnhancer.initialize(); // Initialize event listeners

        // Initialize Text Editor Manager
        this.modules.textEditor = new TextEditorManager(this);
        this.modules.textEditor.initialize();

        // Initialize Konva Editor (will be created when needed)
        this.modules.editor = null;

        console.log('📦 [AI EDITOR] All modules initialized');
    }

    setupEventListeners() {
        // API Key Management
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        const testApiKeyBtn = document.getElementById('testApiKey');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const editApiKeyBtn = document.getElementById('editApiKeyBtn');

        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => this.handleSaveApiKey());
        }

        if (testApiKeyBtn) {
            testApiKeyBtn.addEventListener('click', () => this.handleTestApiKey());
        }

        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', () => this.handleApiKeyInput());
        }

        if (editApiKeyBtn) {
            editApiKeyBtn.addEventListener('click', () => this.handleExpandApiKeySection());
        }

        // Click on "API Key Required" status pill to expand
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            apiStatus.addEventListener('click', () => {
                // Only expand if API key is not valid (i.e., showing "API Key Required")
                if (!this.state.apiKeyValid) {
                    this.handleExpandApiKeySection();
                }
            });
            // Add cursor pointer style when hovering over the status pill
            apiStatus.style.cursor = 'pointer';
        }

        // Prompt Examples
        const exampleTags = document.querySelectorAll('.example-tag');
        exampleTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const prompt = e.target.dataset.prompt;
                if (prompt) {
                    document.getElementById('promptInput').value = prompt;
                    this.updateGenerateButtonState();
                }
            });
        });

        // Edit Prompt Examples
        const editExampleTags = document.querySelectorAll('.edit-example-tag');
        editExampleTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const prompt = e.target.dataset.prompt;
                if (prompt) {
                    document.getElementById('editPromptInput').value = prompt;
                    this.updateEditButtonState();
                }
            });
        });

        // Generate Image
        const generateBtn = document.getElementById('generateImage');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerateImage());
        }

        // Enhance Prompt (for initial generation)
        const enhancePromptBtn = document.getElementById('enhancePrompt');
        if (enhancePromptBtn) {
            enhancePromptBtn.addEventListener('click', () => this.handleEnhancePrompt());
        }

        // Apply Edit
        const applyEditBtn = document.getElementById('applyEdit');
        if (applyEditBtn) {
            applyEditBtn.addEventListener('click', () => this.handleApplyEdit());
        }

        // Analyze Canvas
        const analyzeCanvasBtn = document.getElementById('analyzeCanvasBtn');
        if (analyzeCanvasBtn) {
            analyzeCanvasBtn.addEventListener('click', () => this.handleAnalyzeCanvas());
        }

        // Extract & Edit Text
        const extractEditTextBtn = document.getElementById('extractEditTextBtn');
        if (extractEditTextBtn) {
            extractEditTextBtn.addEventListener('click', () => this.handleExtractEditText());
        }

        // Close text extract modal
        const textExtractCloseBtn = document.getElementById('textExtractCloseBtn');
        if (textExtractCloseBtn) {
            textExtractCloseBtn.addEventListener('click', () => this.closeTextExtractModal());
        }

        // Enhance Edit Prompt
        const enhanceEditPromptBtn = document.getElementById('enhanceEditPrompt');
        if (enhanceEditPromptBtn) {
            enhanceEditPromptBtn.addEventListener('click', () => this.handleEnhanceEditPrompt());
        }

        // Prompt Input
        const promptInput = document.getElementById('promptInput');
        if (promptInput) {
            promptInput.addEventListener('input', () => this.updateGenerateButtonState());
        }

        // Edit Prompt Input
        const editPromptInput = document.getElementById('editPromptInput');
        if (editPromptInput) {
            editPromptInput.addEventListener('input', () => this.updateEditButtonState());
        }

        // Canvas Controls
        this.setupCanvasControls();

        // Editing Tools
        this.setupEditingTools();

        // Object Transfer Module
        if (this.modules.objectTransfer) {
            this.modules.objectTransfer.setupEventListeners();
        }

        // Style Transfer Module
        if (this.modules.styleTransfer) {
            this.modules.styleTransfer.setupEventListeners();
        }

        // LinkedIn Studio Module
        if (this.modules.linkedinStudio) {
            this.modules.linkedinStudio.initialize();
        }

        // Face & Body Editor Module
        if (this.modules.faceBodyEditor) {
            this.modules.faceBodyEditor.initialize();
        }

        // Window resize handler for canvas
        window.addEventListener('resize', () => {
            if (this.modules.editor && this.modules.editor.stage) {
                this.modules.editor.handleResize();
            }
        });

        console.log('🔗 [AI EDITOR] Event listeners set up');

        // Initialize tab switching
        this.initTabSwitching();
    }

    /**
     * Initialize tab switching functionality for Transfers panel
     */
    initTabSwitching() {
        console.log('🔄 [TABS] Initializing tab switching...');

        const tabButtons = document.querySelectorAll('.tab-btn');

        if (tabButtons.length === 0) {
            console.warn('⚠️ [TABS] No tab buttons found');
            return;
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');

                console.log(`🔄 [TABS] Switching to tab: ${tabId}`);

                // Remove active class from all tabs and contents
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                const tabContent = document.getElementById(tabId + '-tab');
                if (tabContent) {
                    tabContent.classList.add('active');
                } else {
                    console.error(`❌ [TABS] Tab content not found: ${tabId}-tab`);
                }
            });
        });

        console.log('✅ [TABS] Tab switching initialized');
    }

    setupCanvasControls() {
        const controls = {
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            fitToScreen: document.getElementById('fitToScreen'),
            resetView: document.getElementById('resetView')
        };

        Object.entries(controls).forEach(([action, button]) => {
            if (button) {
                button.addEventListener('click', () => {
                    if (this.modules.editor) {
                        this.modules.editor[action]();
                    }
                });
            }
        });
    }

    setupEditingTools() {
        // Transformation tools (Category 1)
        const rotateCWBtn = document.getElementById('rotateCW');
        const rotateCCWBtn = document.getElementById('rotateCCW');
        const rotate180Btn = document.getElementById('rotate180');
        const flipHorizontalBtn = document.getElementById('flipHorizontal');
        const flipVerticalBtn = document.getElementById('flipVertical');
        const resizeToolBtn = document.getElementById('resizeTool');
        const applyResizeBtn = document.getElementById('applyResize');

        if (rotateCWBtn) {
            rotateCWBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.rotateCW();
                    this.modules.ui.showNotification('Rotated 90° clockwise', 'success', 2000);
                }
            });
        }

        if (rotateCCWBtn) {
            rotateCCWBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.rotateCCW();
                    this.modules.ui.showNotification('Rotated 90° counter-clockwise', 'success', 2000);
                }
            });
        }

        if (rotate180Btn) {
            rotate180Btn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.rotate180();
                    this.modules.ui.showNotification('Rotated 180°', 'success', 2000);
                }
            });
        }

        if (flipHorizontalBtn) {
            flipHorizontalBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.flipHorizontal();
                    this.modules.ui.showNotification('Flipped horizontally', 'success', 2000);
                }
            });
        }

        if (flipVerticalBtn) {
            flipVerticalBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.flipVertical();
                    this.modules.ui.showNotification('Flipped vertically', 'success', 2000);
                }
            });
        }

        if (resizeToolBtn) {
            resizeToolBtn.addEventListener('click', () => {
                this.toggleResizeControls();
            });
        }

        if (applyResizeBtn) {
            applyResizeBtn.addEventListener('click', () => {
                this.handleApplyResize();
            });
        }

        // Background Removal tool
        const removeBackgroundBtn = document.getElementById('removeBackground');
        if (removeBackgroundBtn) {
            removeBackgroundBtn.addEventListener('click', () => {
                this.handleRemoveBackground();
            });
        }

        // Gallery controls
        const clearGalleryBtn = document.getElementById('clearGallery');
        if (clearGalleryBtn) {
            clearGalleryBtn.addEventListener('click', () => {
                this.handleClearGallery();
            });
        }

        const galleryNavLeft = document.getElementById('galleryNavLeft');
        const galleryNavRight = document.getElementById('galleryNavRight');

        if (galleryNavLeft) {
            galleryNavLeft.addEventListener('click', () => {
                this.scrollGallery('left');
            });
        }

        if (galleryNavRight) {
            galleryNavRight.addEventListener('click', () => {
                this.scrollGallery('right');
            });
        }

        // Image Upload
        const selectFileBtn = document.getElementById('selectFileBtn');
        const imageFileInput = document.getElementById('imageFileInput');
        const uploadZone = document.getElementById('uploadZone');

        if (selectFileBtn && imageFileInput) {
            selectFileBtn.addEventListener('click', () => {
                imageFileInput.click();
            });

            imageFileInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
            });
        }

        if (uploadZone) {
            // Click to upload
            uploadZone.addEventListener('click', (e) => {
                if (e.target !== selectFileBtn && !selectFileBtn.contains(e.target)) {
                    imageFileInput.click();
                }
            });

            // Drag and drop
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });

            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('drag-over');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');

                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleImageUpload(file);
                }
            });
        }

        // Setup resize input synchronization
        this.setupResizeInputs();

        // View tools
        const resetTransformBtn = document.getElementById('resetTransform');
        const fitToScreenToolBtn = document.getElementById('fitToScreenTool');

        if (resetTransformBtn) {
            resetTransformBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.resetView();
                }
            });
        }

        if (fitToScreenToolBtn) {
            fitToScreenToolBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.fitToScreen();
                }
            });
        }

        // History tools
        const undoBtn = document.getElementById('undoAction');
        const redoBtn = document.getElementById('redoAction');

        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.undo();
                }
            });
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.redo();
                }
            });
        }

        // Crop Tool
        this.setupCropToolListeners();

        // Filter tools (Category 2)
        this.setupFilterControls();

        // Drawing tools (Category 3)
        this.setupDrawingTools();

        // Export tools
        const downloadBtn = document.getElementById('downloadImage');
        const qualitySlider = document.getElementById('exportQuality');
        const qualityValue = document.getElementById('qualityValue');

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.handleDownloadImage());
        }

        if (qualitySlider && qualityValue) {
            qualitySlider.addEventListener('input', (e) => {
                const value = Math.round(e.target.value * 100);
                qualityValue.textContent = `${value}%`;
            });
        }

        // Show tools by default (no need to wait for image)
        this.updateToolsVisibility(true);
    }

    /**
     * Setup crop tool event listeners
     */
    setupCropToolListeners() {
        const applyCropBtn = document.getElementById('applyCropBtn');
        const cancelCropBtn = document.getElementById('cancelCropBtn');
        const cropRatioBtns = document.querySelectorAll('.crop-ratio-btn');
        const cropActions = document.getElementById('cropActions');
        const applyCustomCropBtn = document.getElementById('applyCustomCropBtn');
        const customCropWidth = document.getElementById('customCropWidth');
        const customCropHeight = document.getElementById('customCropHeight');

        // Apply crop
        if (applyCropBtn) {
            applyCropBtn.addEventListener('click', async () => {
                try {
                    this.showLoading('Applying Crop...', 'Please wait');
                    await this.modules.editor.applyCrop();
                    this.hideLoading();
                    this.showSuccess('Crop applied successfully!');

                    // Hide crop actions and remove active state from all aspect ratio buttons
                    cropActions.style.display = 'none';
                    cropRatioBtns.forEach(b => b.classList.remove('active'));

                    // Clear custom dimension inputs
                    if (customCropWidth) customCropWidth.value = '';
                    if (customCropHeight) customCropHeight.value = '';
                } catch (error) {
                    this.hideLoading();
                    this.showError('Failed to apply crop: ' + error.message);
                }
            });
        }

        // Cancel crop
        if (cancelCropBtn) {
            cancelCropBtn.addEventListener('click', () => {
                this.modules.editor.cancelCrop();

                // Hide crop actions and remove active state from all aspect ratio buttons
                cropActions.style.display = 'none';
                cropRatioBtns.forEach(b => b.classList.remove('active'));

                // Clear custom dimension inputs
                if (customCropWidth) customCropWidth.value = '';
                if (customCropHeight) customCropHeight.value = '';
            });
        }

        // Custom crop dimensions button
        if (applyCustomCropBtn) {
            applyCustomCropBtn.addEventListener('click', () => {
                console.log('📐 [CROP] Custom crop button clicked');

                // Check if editor is initialized
                if (!this.modules.editor) {
                    console.warn('⚠️ [CROP] Editor not initialized yet. Please load an image first.');
                    this.showError('Please load an image first');
                    return;
                }

                // Get custom dimensions
                const width = parseInt(customCropWidth.value);
                const height = parseInt(customCropHeight.value);

                // Validate inputs
                if (!width || !height || width <= 0 || height <= 0) {
                    this.showError('Please enter valid width and height values');
                    return;
                }

                console.log('📐 [CROP] Custom dimensions:', { width, height });

                // Check if crop is already active
                if (this.modules.editor.cropState && this.modules.editor.cropState.active) {
                    console.log('✂️ [CROP] Crop is active, changing to custom dimensions...');

                    // Remove active state from aspect ratio buttons
                    cropRatioBtns.forEach(b => b.classList.remove('active'));

                    // Change to custom dimensions
                    this.modules.editor.changeCropToCustomDimensions(width, height);
                } else {
                    console.log('✂️ [CROP] Starting crop mode with custom dimensions:', { width, height });

                    try {
                        // Remove active state from aspect ratio buttons
                        cropRatioBtns.forEach(b => b.classList.remove('active'));

                        // Start crop mode with custom dimensions
                        this.modules.editor.startCropWithCustomDimensions(width, height);

                        // Show crop actions
                        cropActions.style.display = 'flex';

                        console.log('✅ [CROP] Crop mode activated with custom dimensions');
                    } catch (error) {
                        this.showError('Failed to start crop: ' + error.message);
                    }
                }
            });
        }

        // Aspect ratio buttons - clicking directly activates crop mode
        cropRatioBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('🔘 [CROP] Aspect ratio button clicked:', btn.dataset.ratio);

                // Check if editor is initialized
                if (!this.modules.editor) {
                    console.warn('⚠️ [CROP] Editor not initialized yet. Please load an image first.');
                    this.showError('Please load an image first');
                    return;
                }

                const ratio = btn.dataset.ratio === 'free' ? 'free' : parseFloat(btn.dataset.ratio);

                // Clear custom dimension inputs when using aspect ratio buttons
                if (customCropWidth) customCropWidth.value = '';
                if (customCropHeight) customCropHeight.value = '';

                // Check if crop is already active
                if (this.modules.editor.cropState && this.modules.editor.cropState.active) {
                    console.log('✂️ [CROP] Crop is active, changing ratio...');

                    // Update active state
                    cropRatioBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Change the aspect ratio
                    this.modules.editor.changeCropRatio(ratio);
                } else {
                    console.log('✂️ [CROP] Starting crop mode with ratio:', ratio);

                    try {
                        // Update active state
                        cropRatioBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        // Start crop mode with selected aspect ratio
                        this.modules.editor.startCrop(ratio);

                        // Show crop actions
                        cropActions.style.display = 'flex';

                        console.log('✅ [CROP] Crop mode activated');
                    } catch (error) {
                        this.showError('Failed to start crop: ' + error.message);
                        btn.classList.remove('active');
                    }
                }
            });
        });
    }

    /**
     * Setup filter controls
     */
    setupFilterControls() {
        // Reset filters button
        const resetFiltersBtn = document.getElementById('resetFilters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.handleResetFilters();
            });
        }

        // Slider filters
        const sliderFilters = [
            { id: 'filterBrightness', name: 'brightness', valueId: 'filterBrightnessValue', format: (v) => `${Math.round(v * 100)}%` },
            { id: 'filterContrast', name: 'contrast', valueId: 'filterContrastValue', format: (v) => v },
            { id: 'filterBlur', name: 'blur', valueId: 'filterBlurValue', format: (v) => v },
            { id: 'filterSaturation', name: 'saturation', valueId: 'filterSaturationValue', format: (v) => v.toFixed(1) },
            { id: 'filterHue', name: 'hue', valueId: 'filterHueValue', format: (v) => `${v}°` },
            { id: 'filterLuminance', name: 'luminance', valueId: 'filterLuminanceValue', format: (v) => v.toFixed(1) },
            { id: 'filterPixelate', name: 'pixelate', valueId: 'filterPixelateValue', format: (v) => v },
            { id: 'filterNoise', name: 'noise', valueId: 'filterNoiseValue', format: (v) => v.toFixed(2) }
        ];

        sliderFilters.forEach(filter => {
            const slider = document.getElementById(filter.id);
            const valueDisplay = document.getElementById(filter.valueId);

            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = filter.format(value);

                    if (this.modules.editor) {
                        this.modules.editor.updateFilter(filter.name, value);
                    }
                });
            }
        });

        // Toggle filters
        const toggleFilters = [
            { id: 'toggleGrayscale', name: 'grayscale' },
            { id: 'toggleSepia', name: 'sepia' },
            { id: 'toggleInvert', name: 'invert' },
            { id: 'toggleEmboss', name: 'emboss' },
            { id: 'togglePosterize', name: 'posterize' },
            { id: 'toggleSolarize', name: 'solarize' },
            { id: 'toggleEnhance', name: 'enhance' }
        ];

        toggleFilters.forEach(filter => {
            const button = document.getElementById(filter.id);
            if (button) {
                button.addEventListener('click', () => {
                    const isActive = button.classList.toggle('active');

                    if (this.modules.editor) {
                        this.modules.editor.updateFilter(filter.name, isActive);
                    }
                });
            }
        });
    }

    /**
     * Setup drawing tools
     */
    setupDrawingTools() {
        // Drawing tool buttons
        const drawingTools = document.querySelectorAll('.drawing-tool');
        drawingTools.forEach(button => {
            button.addEventListener('click', () => {
                const tool = button.dataset.tool;

                // Toggle active state
                drawingTools.forEach(btn => btn.classList.remove('active'));

                if (this.state.activeDrawingTool === tool) {
                    // Deactivate if clicking the same tool
                    this.state.activeDrawingTool = null;
                    if (this.modules.editor) {
                        this.modules.editor.setDrawingTool(null);
                    }
                } else {
                    // Activate new tool
                    button.classList.add('active');
                    this.state.activeDrawingTool = tool;
                    if (this.modules.editor) {
                        this.modules.editor.setDrawingTool(tool);
                    }

                    // Show/hide relevant controls
                    this.updateDrawingControls(tool);
                }
            });
        });

        // Stroke color
        const strokeColorInput = document.getElementById('strokeColor');
        const strokeColorPreview = document.getElementById('strokeColorPreview');
        if (strokeColorInput && strokeColorPreview) {
            strokeColorInput.addEventListener('input', (e) => {
                const color = e.target.value;
                // Update the color preview in the toolbar
                strokeColorPreview.style.backgroundColor = color;
                if (this.modules.editor) {
                    this.modules.editor.updateDrawingOption('strokeColor', color);
                }
            });
        }

        // Fill color
        const fillColorInput = document.getElementById('fillColor');
        const fillColorValue = document.getElementById('fillColorValue');
        const enableFillCheckbox = document.getElementById('enableFill');

        if (fillColorInput && fillColorValue) {
            fillColorInput.addEventListener('input', (e) => {
                const color = e.target.value;
                fillColorValue.textContent = color;
                if (this.modules.editor) {
                    this.modules.editor.updateDrawingOption('fillColor', color);
                }
            });
        }

        if (enableFillCheckbox) {
            enableFillCheckbox.addEventListener('change', (e) => {
                if (this.modules.editor) {
                    this.modules.editor.updateDrawingOption('enableFill', e.target.checked);
                }
            });
        }

        // Stroke width
        const strokeWidthSlider = document.getElementById('strokeWidth');
        const strokeWidthValue = document.getElementById('strokeWidthValue');
        if (strokeWidthSlider && strokeWidthValue) {
            strokeWidthSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                strokeWidthValue.textContent = `${value}px`;
                if (this.modules.editor) {
                    this.modules.editor.updateDrawingOption('strokeWidth', value);
                }
            });
        }

        // Font size
        const fontSizeSlider = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                fontSizeValue.textContent = `${value}px`;
                if (this.modules.editor) {
                    this.modules.editor.updateDrawingOption('fontSize', value);
                }
            });
        }

        // Opacity (for highlighter)
        const opacitySlider = document.getElementById('drawingOpacity');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                opacityValue.textContent = `${Math.round(value * 100)}%`;
                if (this.modules.editor) {
                    this.modules.editor.updateDrawingOption('opacity', value);
                }
            });
        }

        // Undo drawing button
        const undoDrawingBtn = document.getElementById('undoDrawing');
        if (undoDrawingBtn) {
            undoDrawingBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.undoDrawing();
                }
            });
        }

        // Redo drawing button
        const redoDrawingBtn = document.getElementById('redoDrawing');
        if (redoDrawingBtn) {
            redoDrawingBtn.addEventListener('click', () => {
                if (this.modules.editor) {
                    this.modules.editor.redoDrawing();
                }
            });
        }

        // Clear drawing button
        const clearDrawingBtn = document.getElementById('clearDrawing');
        if (clearDrawingBtn) {
            clearDrawingBtn.addEventListener('click', () => {
                if (this.modules.editor && confirm('Clear all drawings? This cannot be undone.')) {
                    this.modules.editor.clearDrawings();
                    this.modules.ui.showNotification('All drawings cleared', 'success', 2000);
                }
            });
        }
    }

    /**
     * Update drawing controls visibility based on active tool
     */
    updateDrawingControls(tool) {
        const fillColorGroup = document.getElementById('fillColorGroup');
        const fontSizeGroup = document.getElementById('fontSizeGroup');
        const opacityGroup = document.getElementById('opacityGroup');

        // Hide all optional controls
        if (fillColorGroup) fillColorGroup.style.display = 'none';
        if (fontSizeGroup) fontSizeGroup.style.display = 'none';
        if (opacityGroup) opacityGroup.style.display = 'none';

        // Show relevant controls based on tool
        if (tool === 'text') {
            if (fontSizeGroup) fontSizeGroup.style.display = 'flex';
        } else if (tool === 'highlighter') {
            if (opacityGroup) opacityGroup.style.display = 'flex';
        } else if (['rectangle', 'circle', 'star', 'polygon'].includes(tool)) {
            if (fillColorGroup) fillColorGroup.style.display = 'flex';
        }
    }

    initializeUI() {
        // Load saved API key
        const savedApiKey = this.modules.storage.getApiKey();
        if (savedApiKey) {
            document.getElementById('apiKeyInput').value = savedApiKey;
            this.handleTestApiKey();
            // Note: handleTestApiKey() will call showCondensedApiKeyView() if valid
        } else {
            // No API key saved, show expanded view
            this.showExpandedApiKeyView();
        }

        // Update initial UI state
        this.updateGenerateButtonState();
        this.updateApiStatus('offline', 'API Key Required');

        // Render gallery
        this.renderGallery();
    }

    // API Key Management
    handleApiKeyInput() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const saveBtn = document.getElementById('saveApiKey');
        const testBtn = document.getElementById('testApiKey');
        
        const hasKey = apiKeyInput.value.trim().length > 0;
        saveBtn.disabled = !hasKey;
        testBtn.disabled = !hasKey;
        
        if (!hasKey) {
            this.state.apiKeyValid = false;
            this.updateApiStatus('offline', 'API Key Required');
            this.updateGenerateButtonState();
        }
    }

    async handleSaveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showError('Please enter an API key');
            return;
        }

        try {
            this.modules.storage.saveApiKey(apiKey);
            this.showSuccess('API key saved successfully');
            console.log('💾 [AI EDITOR] API key saved');
        } catch (error) {
            console.error('❌ [AI EDITOR] Failed to save API key:', error);
            this.showError('Failed to save API key');
        }
    }

    async handleTestApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            this.showError('Please enter an API key');
            return;
        }

        this.updateApiStatus('testing', 'Testing API Key...');

        try {
            const isValid = await this.modules.gemini.testApiKey(apiKey);

            if (isValid) {
                this.state.apiKeyValid = true;
                this.updateApiStatus('online', 'Valid');
                this.showApiKeyInlineNotification();

                // Save the validated API key
                this.modules.storage.saveApiKey(apiKey);

                // Switch to condensed view after notification
                setTimeout(() => {
                    this.showCondensedApiKeyView();
                }, 2500);
            } else {
                this.state.apiKeyValid = false;
                this.updateApiStatus('offline', 'Invalid API Key');
                this.showError('API key is invalid. Please check your key and try again.');
            }
        } catch (error) {
            console.error('❌ [AI EDITOR] API key test failed:', error);
            this.state.apiKeyValid = false;
            this.updateApiStatus('offline', 'API Key Error');
            this.showError('Failed to validate API key. Please check your key and try again.');
        }

        this.updateGenerateButtonState();
    }

    /**
     * Show the condensed API key view (when key is valid)
     */
    showCondensedApiKeyView() {
        const condensedView = document.getElementById('apiKeyCondensed');
        const expandedView = document.getElementById('apiKeyExpanded');

        if (condensedView && expandedView) {
            condensedView.style.display = 'block';
            expandedView.style.display = 'none';
            console.log('🔒 [API KEY] Switched to condensed view');
        }
    }

    /**
     * Show the expanded API key view (for editing)
     */
    showExpandedApiKeyView() {
        const condensedView = document.getElementById('apiKeyCondensed');
        const expandedView = document.getElementById('apiKeyExpanded');

        if (condensedView && expandedView) {
            condensedView.style.display = 'none';
            expandedView.style.display = 'block';
            console.log('🔓 [API KEY] Switched to expanded view');
        }
    }

    /**
     * Handle click on the "API Key Valid" badge to expand the section
     */
    handleExpandApiKeySection() {
        console.log('✏️ [API KEY] User clicked to edit API key');
        this.showExpandedApiKeyView();

        // Focus on the input field
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            setTimeout(() => {
                apiKeyInput.focus();
                apiKeyInput.select();
            }, 100);
        }
    }

    // Image Generation
    async handleGenerateImage() {
        const promptInput = document.getElementById('promptInput');
        const userPrompt = promptInput.value.trim();

        if (!userPrompt) {
            this.showError('Please enter a prompt');
            return;
        }

        if (!this.state.apiKeyValid) {
            this.showError('Please enter and validate your API key first');
            return;
        }

        // Enhance prompt with selected style preset
        const enhancedPrompt = this.modules.promptEnhancer.enhanceGenerationPrompt(userPrompt);

        // Get selected aspect ratio and resolution
        const aspectRatio = this.modules.promptEnhancer.getSelectedAspectRatio();
        const resolution = this.modules.promptEnhancer.getSelectedResolution();

        // Log enhancement for debugging
        if (enhancedPrompt !== userPrompt) {
            console.log('🎨 [MAIN] Prompt enhanced:', {
                original: userPrompt,
                enhanced: enhancedPrompt,
                aspectRatio: aspectRatio,
                resolution: resolution
            });
        }

        this.state.isGenerating = true;
        this.updateGenerateButtonState();
        this.showLoading('Generating Image with Gemini AI...', 'This may take 10-30 seconds');

        try {
            const imageUrl = await this.modules.gemini.generateImage(enhancedPrompt, aspectRatio, resolution);

            if (imageUrl) {
                await this.loadImageToCanvas(imageUrl);

                // Save to gallery using the base64 data from API (not the Blob URL)
                try {
                    const imageDataForGallery = this.modules.gemini.getLastGeneratedImageData();

                    if (imageDataForGallery) {
                        console.log('📸 [AI EDITOR] Using stored base64 data for gallery');
                        const imageId = await this.modules.gallery.addImage(imageDataForGallery, enhancedPrompt, {
                            type: 'generated',
                            model: 'gemini-2.5-flash-image'
                        });
                        this.modules.gallery.setActiveImage(imageId);
                        this.renderGallery();
                        console.log('✅ [AI EDITOR] Image saved to gallery');
                    } else {
                        console.warn('⚠️ [AI EDITOR] No base64 data available for gallery');
                    }
                } catch (galleryError) {
                    console.warn('⚠️ [AI EDITOR] Failed to save to gallery:', galleryError);
                    // Don't fail the whole operation if gallery save fails
                }

                this.showSuccess('Image generated successfully!');
            } else {
                throw new Error('No image data returned from API');
            }
        } catch (error) {
            console.error('❌ [AI EDITOR] Image generation failed:', error);

            // Provide user-friendly error messages
            let errorMessage = 'Failed to generate image. ';

            if (error.message.includes('401')) {
                errorMessage += 'Invalid API key. Please check your Gemini API key.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
            } else if (error.message.includes('403')) {
                errorMessage += 'Access denied. Please check your API key permissions.';
            } else if (error.message.includes('No image data')) {
                errorMessage += 'The API did not return an image. Please try a different prompt.';
            } else {
                errorMessage += 'Please try again or check your API key.';
            }

            this.showError(errorMessage);
        } finally {
            this.state.isGenerating = false;
            this.updateGenerateButtonState();
            this.hideLoading();
        }
    }

    async loadImageToCanvas(imageUrl) {
        console.log('🚀 [MAIN DEBUG] loadImageToCanvas called with URL:', imageUrl?.substring(0, 100));
        console.log('🔍 [MAIN DEBUG] URL type:', typeof imageUrl);
        console.log('🔍 [MAIN DEBUG] URL length:', imageUrl?.length);
        console.log('🔍 [MAIN DEBUG] Is data URL:', imageUrl?.startsWith('data:'));
        console.log('🔍 [MAIN DEBUG] Is blob URL:', imageUrl?.startsWith('blob:'));
        
        try {
            console.log('🔧 [MAIN DEBUG] Checking if Konva editor exists:', !!this.modules.editor);
            
            // Initialize Konva editor if not already done
            if (!this.modules.editor) {
                console.log('🔧 [MAIN DEBUG] Initializing new KonvaEditor...');
                this.modules.editor = new KonvaEditor(this);
                console.log('🔧 [MAIN DEBUG] KonvaEditor created, calling init()...');
                await this.modules.editor.init();
                console.log('✅ [MAIN DEBUG] KonvaEditor initialized successfully');

                // Initialize Layer Panel UI
                console.log('🔧 [MAIN DEBUG] Initializing LayerPanelUI...');
                this.modules.layerPanel = new LayerPanelUI(
                    this.modules.editor.layerManager,
                    'layerPanel',
                    this.modules.editor
                );
                console.log('✅ [AI EDITOR] Layer Panel UI initialized');
            } else {
                console.log('✅ [MAIN DEBUG] KonvaEditor already exists, skipping initialization');
            }

            // Load image into canvas
            console.log('🖼️ [MAIN DEBUG] About to call editor.loadImage()...');
            await this.modules.editor.loadImage(imageUrl);
            console.log('✅ [MAIN DEBUG] editor.loadImage() completed successfully');
            
            this.state.currentImage = imageUrl;
            console.log('✅ [MAIN DEBUG] currentImage state updated');

            // Show editing tools
            console.log('🔧 [MAIN DEBUG] Updating tools visibility...');
            this.updateToolsVisibility(true);
            console.log('✅ [MAIN DEBUG] Tools visibility updated');

            // Ensure edit controls reflect new image state
            this.updateEditButtonState();

            // Update LinkedIn Studio state
            if (this.modules.linkedinStudio) {
                console.log('🔧 [MAIN DEBUG] Updating LinkedIn Studio state...');
                this.modules.linkedinStudio.updateUIState();
                console.log('✅ [MAIN DEBUG] LinkedIn Studio state updated');
            }

            // Update Face & Body Editor state
            if (this.modules.faceBodyEditor) {
                console.log('🔧 [MAIN DEBUG] Updating Face & Body Editor state...');
                this.modules.faceBodyEditor.updateUIState();
                console.log('✅ [MAIN DEBUG] Face & Body Editor state updated');
            }

            // Update Text Editor state
            if (this.modules.textEditor) {
                console.log('🔧 [MAIN DEBUG] Updating Text Editor state...');
                this.modules.textEditor.updateUIState();
                console.log('✅ [MAIN DEBUG] Text Editor state updated');
            }

            // Refresh tooltips for dynamically shown elements
            if (this.modules.ui) {
                console.log('🔧 [MAIN DEBUG] Refreshing tooltips...');
                this.modules.ui.refreshTooltips();
                console.log('✅ [MAIN DEBUG] Tooltips refreshed');
            }

            console.log('🎉 [MAIN DEBUG] loadImageToCanvas completed successfully!');
            console.log('🖼️ [AI EDITOR] Image loaded to canvas successfully');
        } catch (error) {
            console.error('❌ [MAIN DEBUG] Failed to load image to canvas:', error);
            console.error('❌ [MAIN DEBUG] Error stack:', error.stack);
            console.error('❌ [MAIN DEBUG] Error context:', {
                imageUrl: imageUrl?.substring(0, 100),
                editorExists: !!this.modules.editor,
                layerPanelExists: !!this.modules.layerPanel
            });
            console.error('❌ [AI EDITOR] Failed to load image to canvas:', error);
            throw error;
        }
    }

    // AI Prompt Enhancement
    async handleEnhancePrompt() {
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput.value.trim();

        if (!prompt) {
            this.showError('Please enter a prompt first');
            return;
        }

        if (!this.state.apiKeyValid) {
            this.showError('Please enter and validate your API key first');
            return;
        }

        const enhanceBtn = document.getElementById('enhancePrompt');
        const originalText = enhanceBtn.innerHTML;

        try {
            // Show loading state
            enhanceBtn.disabled = true;
            enhanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Enhancing...</span>';

            const enhancedPrompt = await this.modules.gemini.enhancePrompt(prompt);

            // Update the prompt input with enhanced version
            promptInput.value = enhancedPrompt;
            this.showSuccess('Prompt enhanced successfully!');

        } catch (error) {
            console.error('❌ [AI EDITOR] Prompt enhancement failed:', error);
            this.showError('Failed to enhance prompt. Please try again.');
        } finally {
            enhanceBtn.disabled = false;
            enhanceBtn.innerHTML = originalText;
        }
    }

    async handleAnalyzeCanvas() {
        // Check if canvas has an image
        if (!this.modules.editor || !this.modules.editor.imageNode) {
            this.showError('Please load an image onto the canvas first');
            return;
        }

        if (!this.state.apiKeyValid) {
            this.showError('Please enter and validate your API key first');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeCanvasBtn');
        const editPromptInput = document.getElementById('editPromptInput');
        const editStatus = document.getElementById('editStatus');
        const originalText = analyzeBtn.innerHTML;

        try {
            // Show loading state
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Analyzing...</span>';

            if (editStatus) {
                editStatus.textContent = 'Analyzing canvas image...';
                editStatus.className = 'generation-status status-analyzing';
            }

            console.log('🔍 [AI EDITOR] Analyzing canvas image...');

            // Get canvas image data
            const canvasImageData = await this.modules.editor.getImageAsBase64();

            if (!canvasImageData) {
                throw new Error('Failed to get canvas image data');
            }

            // Call Gemini API to analyze the image
            const description = await this.modules.gemini.analyzeCanvasImage(canvasImageData);

            // Populate the edit prompt textarea with the description
            if (editPromptInput) {
                editPromptInput.value = description;
                editPromptInput.focus();
            }

            // Update button states
            this.updateEditButtonState();

            if (editStatus) {
                editStatus.textContent = '✅ Analysis complete! Edit the description or add your editing instructions.';
                editStatus.className = 'generation-status status-success';
            }

            console.log('✅ [AI EDITOR] Canvas analysis complete');

        } catch (error) {
            console.error('❌ [AI EDITOR] Canvas analysis failed:', error);

            let errorMessage = 'Canvas analysis failed. ';
            if (error.message.includes('API key')) {
                errorMessage += 'Please check your API key.';
            } else if (error.message.includes('quota')) {
                errorMessage += 'API quota exceeded.';
            } else {
                errorMessage += 'Please try again.';
            }

            if (editStatus) {
                editStatus.textContent = errorMessage;
                editStatus.className = 'generation-status status-error';
            }

            this.showError(errorMessage);

        } finally {
            // Restore button state
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalText;
        }
    }

    // Extract & Edit Text
    async handleExtractEditText() {
        // Check if canvas has an image
        if (!this.modules.editor || !this.modules.editor.imageNode) {
            this.showError('Please load an image onto the canvas first');
            return;
        }

        if (!this.state.apiKeyValid) {
            this.showError('Please enter and validate your API key first');
            return;
        }

        const extractBtn = document.getElementById('extractEditTextBtn');
        const editStatus = document.getElementById('editStatus');
        const originalText = extractBtn ? extractBtn.innerHTML : '';

        try {
            if (extractBtn) {
                extractBtn.disabled = true;
                extractBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Extracting...</span>';
            }

            if (editStatus) {
                editStatus.textContent = 'Extracting text from image...';
                editStatus.className = 'generation-status status-analyzing';
            }

            console.log('🔎 [AI EDITOR] Extracting embedded text from canvas image...');

            const canvasImageData = await this.modules.editor.getImageAsBase64();
            if (!canvasImageData) {
                throw new Error('Failed to get canvas image data');
            }

            const result = await this.modules.gemini.analyzeTextInImage(canvasImageData);
            const segments = Array.isArray(result?.segments) ? result.segments : [];
            const texts = segments.map(s => (s.text || '').trim()).filter(t => t.length > 0);
            const uniqueTexts = [...new Set(texts)];

            this.renderTextExtractList(uniqueTexts);
            this.openTextExtractModal();

            if (editStatus) {
                editStatus.textContent = '✅ Text detected. Click any entry to add to the edit prompt.';
                editStatus.className = 'generation-status status-success';
            }

            console.log('✅ [AI EDITOR] Text extraction complete. Found', uniqueTexts.length, 'items');
        } catch (error) {
            console.error('❌ [AI EDITOR] Text extraction failed:', error);
            if (editStatus) {
                editStatus.textContent = 'Text extraction failed. Please try again.';
                editStatus.className = 'generation-status status-error';
            }
            this.showError('Text extraction failed. Please try again.');
        } finally {
            if (extractBtn) {
                extractBtn.disabled = false;
                extractBtn.innerHTML = originalText || '<i class="fas fa-font"></i><span>Text Edit</span>';
            }
        }
    }

    renderTextExtractList(texts) {
        const list = document.getElementById('textExtractList');
        if (!list) return;
        list.innerHTML = '';

        if (!texts || texts.length === 0) {
            const p = document.createElement('p');
            p.className = 'modal-hint';
            p.textContent = 'No text detected.';
            list.appendChild(p);
            return;
        }

        texts.forEach(text => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'text-chip';
            btn.title = 'Add to edit prompt';
            btn.textContent = text;
            btn.addEventListener('click', () => this.addTextToEditPrompt(text));
            list.appendChild(btn);
        });
    }

    addTextToEditPrompt(text) {
        const input = document.getElementById('editPromptInput');
        if (!input) return;
        const phrase = `change this text (${text}) to `;
        if (input.value && input.value.trim().length > 0) {
            input.value = input.value.trim() + '\n' + phrase;
        } else {
            input.value = phrase;
        }
        input.focus();
        this.updateEditButtonState();
        // Do not auto-close; user closes via the X button
    }

    openTextExtractModal() {
        const modal = document.getElementById('textExtractModal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.remove('closing');
            modal.classList.add('showing');

            const handleAnimationEnd = (e) => {
                if (e.animationName === 'modalFadeIn') {
                    modal.classList.remove('showing');
                    modal.removeEventListener('animationend', handleAnimationEnd);
                }
            };
            modal.addEventListener('animationend', handleAnimationEnd);
        }
    }

    closeTextExtractModal() {
        const modal = document.getElementById('textExtractModal');
        if (modal) {
            if (modal.classList.contains('closing')) return;
            modal.classList.remove('showing');
            modal.classList.add('closing');

            const handleAnimationEnd = (e) => {
                if (e.animationName === 'modalFadeOut') {
                    modal.classList.remove('closing');
                    modal.style.display = 'none';
                    modal.removeEventListener('animationend', handleAnimationEnd);
                }
            };
            modal.addEventListener('animationend', handleAnimationEnd);
        }
    }

    async handleEnhanceEditPrompt() {
        const editPromptInput = document.getElementById('editPromptInput');
        const prompt = editPromptInput.value.trim();

        if (!prompt) {
            this.showError('Please enter an edit instruction first');
            return;
        }

        if (!this.state.apiKeyValid) {
            this.showError('Please enter and validate your API key first');
            return;
        }

        const enhanceBtn = document.getElementById('enhanceEditPrompt');
        const originalText = enhanceBtn.innerHTML;

        try {
            // Show loading state
            enhanceBtn.disabled = true;
            enhanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Enhancing...</span>';

            const enhancedPrompt = await this.modules.gemini.enhancePrompt(prompt);

            // Update the edit prompt input with enhanced version
            editPromptInput.value = enhancedPrompt;
            this.showSuccess('Edit instruction enhanced successfully!');

        } catch (error) {
            console.error('❌ [AI EDITOR] Edit prompt enhancement failed:', error);
            this.showError('Failed to enhance edit instruction. Please try again.');
        } finally {
            enhanceBtn.disabled = false;
            enhanceBtn.innerHTML = originalText;
        }
    }

    // AI Image Editing
    async handleApplyEdit() {
        const editPromptInput = document.getElementById('editPromptInput');
        const userEditPrompt = editPromptInput.value.trim();

        if (!userEditPrompt) {
            this.showError('Please enter an edit instruction');
            return;
        }

        if (!this.state.apiKeyValid) {
            this.showError('Please enter and validate your API key first');
            return;
        }

        if (!this.modules.editor || !this.modules.editor.imageNode) {
            this.showError('Please generate or load an image first');
            return;
        }

        // Enhance edit prompt with selected style preset
        const enhancedEditPrompt = this.modules.promptEnhancer.enhanceEditPrompt(userEditPrompt);

        // Get selected aspect ratio and resolution for the edit
        const aspectRatio = this.modules.promptEnhancer.getSelectedAspectRatio();
        const resolution = this.modules.promptEnhancer.getSelectedResolution();

        // Log enhancement for debugging
        if (enhancedEditPrompt !== userEditPrompt) {
            console.log('🎨 [MAIN] Edit prompt enhanced:', {
                original: userEditPrompt,
                enhanced: enhancedEditPrompt,
                aspectRatio: aspectRatio,
                resolution: resolution
            });
        }

        this.state.isGenerating = true;
        this.updateEditButtonState();
        this.showLoading('Editing Image with AI...', 'This may take 10-30 seconds');

        try {
            // Get current canvas image as base64 (at high resolution)
            const baseImageData = await this.modules.editor.getImageAsBase64();

            if (!baseImageData) {
                throw new Error('Failed to extract image data from canvas');
            }

            // Call AI to edit the image with resolution and aspect ratio settings
            const editedImageUrl = await this.modules.gemini.editImage(baseImageData, enhancedEditPrompt, {
                preserveOriginal: true,
                aspectRatio: aspectRatio,
                imageSize: resolution
            });

            if (editedImageUrl) {
                // Load edited image to canvas (already a Blob URL from API)
                await this.modules.editor.loadImage(editedImageUrl);
                this.state.currentImage = editedImageUrl;

                // Save edited image to gallery using the base64 data from API
                try {
                    const imageDataForGallery = this.modules.gemini.getLastGeneratedImageData();

                    if (imageDataForGallery) {
                        console.log('📸 [AI EDITOR] Using stored base64 data for gallery (edited image)');
                        const imageId = await this.modules.gallery.addImage(imageDataForGallery, enhancedEditPrompt, {
                            type: 'edited',
                            model: 'gemini-2.5-flash-image'
                        });
                        this.modules.gallery.setActiveImage(imageId);
                        this.renderGallery();
                        console.log('✅ [AI EDITOR] Edited image saved to gallery');
                    } else {
                        console.warn('⚠️ [AI EDITOR] No base64 data available for gallery (edited image)');
                    }
                } catch (galleryError) {
                    console.warn('⚠️ [AI EDITOR] Failed to save edited image to gallery:', galleryError);
                    // Don't fail the whole operation if gallery save fails
                }

                this.showSuccess('Image edited successfully!');

                // Clear the edit prompt
                editPromptInput.value = '';
                this.updateEditButtonState();
            } else {
                throw new Error('No image data returned from API');
            }
        } catch (error) {
            console.error('❌ [AI EDITOR] Image editing failed:', error);

            let errorMessage = 'Failed to edit image. ';
            if (error.message.includes('401')) {
                errorMessage += 'Invalid API key.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Rate limit exceeded. Please wait and try again.';
            } else {
                errorMessage += 'Please try again.';
            }

            this.showError(errorMessage);
        } finally {
            this.state.isGenerating = false;
            this.updateEditButtonState();
            this.hideLoading();
        }
    }

    // Image Upload Handler
    async handleImageUpload(file) {
        if (!file) {
            this.showError('No file selected');
            return;
        }

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            this.showError('Invalid file type. Please upload PNG, JPEG, WebP, or GIF');
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            this.showError('File too large. Maximum size is 10MB');
            return;
        }

        try {
            this.showLoading('Loading Image...', 'Please wait');

            // Convert file to data URL
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const imageUrl = e.target.result;

                    // Check if editor is already initialized (meaning there's already an image on canvas)
                    if (this.modules.editor && this.modules.editor.layerManager) {
                        // Editor exists - add image as a NEW LAYER
                        console.log('🖼️ [AI EDITOR] Adding uploaded image as new layer...');

                        // Create new layer
                        const newLayer = this.modules.editor.layerManager.addLayer(`Uploaded ${this.modules.editor.layerManager.getAllLayers().length + 1}`);
                        if (!newLayer) {
                            this.hideLoading();
                            this.showError(`Maximum ${this.modules.editor.layerManager.maxLayers} layers reached`);
                            return;
                        }

                        // Load image into the new layer
                        await this.modules.editor.loadImageIntoLayer(imageUrl, newLayer.id);
                        console.log('✅ [AI EDITOR] Image added as new layer successfully');

                        // Reflect new image state in edit controls
                        this.updateEditButtonState();

                    } else {
                        // Editor doesn't exist - this is the FIRST IMAGE, initialize canvas
                        console.log('🖼️ [AI EDITOR] Loading first image to canvas...');
                        await this.loadImageToCanvas(imageUrl);

                        // Reflect new image state in edit controls
                        this.updateEditButtonState();
                    }

                    // Set aspect ratio to auto so the uploaded image's aspect ratio is preserved
                    if (this.modules.promptEnhancer) {
                        this.modules.promptEnhancer.setAspectRatioToAuto();
                    }

                    // Save to gallery
                    try {
                        const imageId = await this.modules.gallery.addImage(imageUrl, `Uploaded: ${file.name}`, {
                            type: 'uploaded',
                            filename: file.name
                        });
                        this.modules.gallery.setActiveImage(imageId);
                        this.renderGallery();
                        console.log('✅ [AI EDITOR] Uploaded image saved to gallery');
                    } catch (galleryError) {
                        console.warn('⚠️ [AI EDITOR] Failed to save uploaded image to gallery:', galleryError);
                    }

                    this.hideLoading();
                    this.showSuccess('Image uploaded successfully!');
                } catch (error) {
                    this.hideLoading();
                    this.showError('Failed to load image: ' + error.message);
                    console.error('❌ [AI EDITOR] Image load error:', error);
                }
            };

            reader.onerror = () => {
                this.hideLoading();
                this.showError('Failed to read file');
            };

            reader.readAsDataURL(file);
        } catch (error) {
            this.hideLoading();
            this.showError('Upload failed: ' + error.message);
            console.error('❌ [AI EDITOR] Upload error:', error);
        }
    }

    handleDownloadImage() {
        if (!this.modules.editor || !this.state.currentImage) {
            this.showError('No image to download');
            return;
        }

        try {
            const formatSelect = document.getElementById('exportFormat');
            const qualitySlider = document.getElementById('exportQuality');

            const format = formatSelect ? formatSelect.value : 'png';
            const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.9;

            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `ai-generated-image-${timestamp}`;

            this.modules.editor.download(filename, format, quality);
            this.showSuccess(`Image downloaded as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('❌ [AI EDITOR] Failed to download image:', error);
            this.showError('Failed to download image');
        }
    }

    updateToolsVisibility(hasImage) {
        const toolSections = document.querySelectorAll('.tool-section');
        const toolCategories = document.querySelectorAll('.tool-category');
        const cropToolPanel = document.getElementById('cropToolCategory');
        const placeholder = document.getElementById('toolsPlaceholder');

        toolSections.forEach(section => {
            section.style.display = hasImage ? 'block' : 'none';
        });

        // Use 'flex' instead of 'block' for tool-category (they use flex layout)
        toolCategories.forEach(category => {
            category.style.display = hasImage ? 'flex' : 'none';
        });

        // Also handle the crop tool panel (uses panel-card class, not tool-category)
        if (cropToolPanel) {
            cropToolPanel.style.display = hasImage ? 'block' : 'none';
        }

        if (placeholder) {
            placeholder.style.display = hasImage ? 'none' : 'block';
        }

        console.log('🔧 [UI] Tools visibility updated:', hasImage ? 'visible' : 'hidden');
    }

    /**
     * Toggle resize controls visibility
     */
    toggleResizeControls() {
        const resizeControls = document.getElementById('resizeControls');
        const resizeToolBtn = document.getElementById('resizeTool');

        if (resizeControls) {
            const isVisible = resizeControls.style.display !== 'none';
            resizeControls.style.display = isVisible ? 'none' : 'block';

            if (resizeToolBtn) {
                resizeToolBtn.classList.toggle('active', !isVisible);
            }

            // Update resize inputs with current image dimensions
            if (!isVisible && this.modules.editor && this.modules.editor.imageNode) {
                this.updateResizeInputs();
            }
        }
    }

    /**
     * Setup resize input synchronization
     */
    setupResizeInputs() {
        const widthInput = document.getElementById('resizeWidth');
        const heightInput = document.getElementById('resizeHeight');
        const lockAspectRatio = document.getElementById('lockAspectRatio');

        if (widthInput && heightInput && lockAspectRatio) {
            let aspectRatio = 1;

            widthInput.addEventListener('input', () => {
                if (lockAspectRatio.checked) {
                    heightInput.value = Math.round(widthInput.value / aspectRatio);
                }
            });

            heightInput.addEventListener('input', () => {
                if (lockAspectRatio.checked) {
                    widthInput.value = Math.round(heightInput.value * aspectRatio);
                }
            });

            // Update aspect ratio when lock is toggled
            lockAspectRatio.addEventListener('change', () => {
                if (lockAspectRatio.checked) {
                    aspectRatio = widthInput.value / heightInput.value;
                }
            });

            // Store aspect ratio for later use
            this.resizeAspectRatio = aspectRatio;
        }
    }

    /**
     * Update resize inputs with current image dimensions
     */
    updateResizeInputs() {
        if (!this.modules.editor || !this.modules.editor.imageNode) return;

        const widthInput = document.getElementById('resizeWidth');
        const heightInput = document.getElementById('resizeHeight');
        const lockAspectRatio = document.getElementById('lockAspectRatio');

        const imageNode = this.modules.editor.imageNode;
        const currentWidth = Math.round(imageNode.width() * Math.abs(imageNode.scaleX()));
        const currentHeight = Math.round(imageNode.height() * Math.abs(imageNode.scaleY()));

        if (widthInput) widthInput.value = currentWidth;
        if (heightInput) heightInput.value = currentHeight;

        // Update aspect ratio
        if (lockAspectRatio && lockAspectRatio.checked) {
            this.resizeAspectRatio = currentWidth / currentHeight;
        }
    }

    /**
     * Handle apply resize button click
     */
    handleApplyResize() {
        const widthInput = document.getElementById('resizeWidth');
        const heightInput = document.getElementById('resizeHeight');
        const lockAspectRatio = document.getElementById('lockAspectRatio');

        if (!widthInput || !heightInput || !this.modules.editor) return;

        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        const lock = lockAspectRatio ? lockAspectRatio.checked : true;

        if (width > 0 && height > 0) {
            this.modules.editor.resizeImage(width, height, lock);
            this.modules.ui.showNotification(`Resized to ${width}x${height}`, 'success', 2000);
            this.toggleResizeControls();
        } else {
            this.modules.ui.showNotification('Invalid dimensions', 'error', 2000);
        }
    }

    /**
     * Handle remove background button click
     */
    async handleRemoveBackground() {
        try {
            // Check if editor exists and has a layer manager with an active layer
            if (!this.modules.editor || !this.modules.editor.layerManager) {
                this.modules.ui.showNotification('Please load an image first', 'error', 3000);
                return;
            }

            const activeLayer = this.modules.editor.layerManager.getActiveLayer();
            if (!activeLayer) {
                this.modules.ui.showNotification('No active layer selected', 'error', 3000);
                return;
            }

            const imageNode = activeLayer.konvaLayer.findOne('Image');
            if (!imageNode) {
                this.modules.ui.showNotification('No image found in the active layer', 'error', 3000);
                return;
            }

            // Check if already processing
            if (this.modules.backgroundRemoval.getProcessingStatus()) {
                this.modules.ui.showNotification('Background removal already in progress', 'warning', 3000);
                return;
            }

            console.log('✂️ [MAIN] Starting background removal on layer:', activeLayer.name);

            // Call background removal
            await this.modules.backgroundRemoval.removeBackground();

            console.log('✅ [MAIN] Background removal completed');

        } catch (error) {
            console.error('❌ [MAIN] Background removal error:', error);
            // Error is already handled in BackgroundRemovalManager
        }
    }

    /**
     * Handle reset filters button click
     */
    handleResetFilters() {
        if (!this.modules.editor) return;

        // Reset editor filters
        this.modules.editor.resetFilters();

        // Reset UI controls
        document.getElementById('filterBrightness').value = 1;
        document.getElementById('filterBrightnessValue').textContent = '100%';

        document.getElementById('filterContrast').value = 0;
        document.getElementById('filterContrastValue').textContent = '0';

        document.getElementById('filterBlur').value = 0;
        document.getElementById('filterBlurValue').textContent = '0';

        document.getElementById('filterSaturation').value = 0;
        document.getElementById('filterSaturationValue').textContent = '0';

        document.getElementById('filterHue').value = 0;
        document.getElementById('filterHueValue').textContent = '0°';

        document.getElementById('filterLuminance').value = 0;
        document.getElementById('filterLuminanceValue').textContent = '0';

        document.getElementById('filterPixelate').value = 1;
        document.getElementById('filterPixelateValue').textContent = '1';

        document.getElementById('filterNoise').value = 0;
        document.getElementById('filterNoiseValue').textContent = '0';

        // Reset toggle buttons
        const toggleButtons = document.querySelectorAll('.filter-toggle-btn');
        toggleButtons.forEach(btn => btn.classList.remove('active'));

        this.modules.ui.showNotification('All filters reset', 'success', 2000);
    }

    // UI State Management
    updateGenerateButtonState() {
        const generateBtn = document.getElementById('generateImage');
        const enhanceBtn = document.getElementById('enhancePrompt');
        const promptInput = document.getElementById('promptInput');

        if (generateBtn && promptInput) {
            const hasPrompt = promptInput.value.trim().length > 0;
            const canGenerate = hasPrompt && this.state.apiKeyValid && !this.state.isGenerating;

            generateBtn.disabled = !canGenerate;

            if (this.state.isGenerating) {
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>';
            } else {
                generateBtn.innerHTML = '<i class="fas fa-magic"></i><span>Generate Image</span>';
            }

            // Update enhance button state
            if (enhanceBtn) {
                enhanceBtn.disabled = !hasPrompt || !this.state.apiKeyValid;
            }
        }
    }

    updateEditButtonState() {
        const applyEditBtn = document.getElementById('applyEdit');
        const analyzeCanvasBtn = document.getElementById('analyzeCanvasBtn');
        const enhanceEditBtn = document.getElementById('enhanceEditPrompt');
        const editPromptInput = document.getElementById('editPromptInput');

        if (applyEditBtn && editPromptInput) {
            const hasPrompt = editPromptInput.value.trim().length > 0;
            const hasImage = this.modules.editor && this.modules.editor.imageNode;
            const canEdit = hasPrompt && hasImage && this.state.apiKeyValid && !this.state.isGenerating;

            applyEditBtn.disabled = !canEdit;

            if (this.state.isGenerating) {
                applyEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Editing...</span>';
            } else {
                applyEditBtn.innerHTML = '<i class="fas fa-check"></i><span>Apply Edit</span>';
            }

            // Update analyze canvas button state
            if (analyzeCanvasBtn) {
                analyzeCanvasBtn.disabled = !hasImage || !this.state.apiKeyValid || this.state.isGenerating;
            }

            // Update extract & edit text button state
            const extractEditTextBtn = document.getElementById('extractEditTextBtn');
            if (extractEditTextBtn) {
                extractEditTextBtn.disabled = !hasImage || !this.state.apiKeyValid || this.state.isGenerating;
            }

            // Update enhance button state
            if (enhanceEditBtn) {
                enhanceEditBtn.disabled = !hasPrompt || !this.state.apiKeyValid;
            }
        }
    }

    updateApiStatus(status, message) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator ${status}`;
            statusText.textContent = message;
        }
    }

    // Utility Methods
    showLoading(title, message) {
        const overlay = document.getElementById('loadingOverlay');
        const titleEl = document.getElementById('loadingTitle');
        const messageEl = document.getElementById('loadingMessage');
        
        if (overlay && titleEl && messageEl) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            overlay.classList.add('active');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    showSuccess(message) {
        this.showStatus(message, 'success');
    }

    showError(message) {
        this.showStatus(message, 'error');
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('generationStatus');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `generation-status ${type}`;
            statusEl.style.display = 'block';

            // Auto-hide after 5 seconds
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    }

    showApiKeyInlineNotification() {
        const notification = document.getElementById('apiInlineNotification');
        if (!notification) return;

        // Show notification with fade-in animation
        notification.style.display = 'inline-flex';
        notification.classList.remove('fade-out');

        // Auto-hide after 2.5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.style.display = 'none';
                notification.classList.remove('fade-out');
            }, 300); // Wait for fade-out animation to complete
        }, 2500);
    }

    // Gallery Methods
    renderGallery() {
        const container = document.getElementById('galleryThumbnails');
        if (!container) {
            console.warn('⚠️ [GALLERY] Gallery container not found');
            return;
        }

        const images = this.modules.gallery.getAllImages();
        const activeId = this.modules.gallery.getActiveImageId();

        console.log('🖼️ [GALLERY] Rendering gallery with', images.length, 'images');

        if (images.length === 0) {
            container.innerHTML = `
                <div class="gallery-empty">
                    <i class="fas fa-images"></i>
                    <p>No images yet</p>
                    <small>Generated images will appear here</small>
                </div>
            `;
            return;
        }

        container.innerHTML = images.map(img => `
            <div class="gallery-thumbnail ${img.id === activeId ? 'active' : ''}" data-image-id="${img.id}">
                <img src="${img.dataUrl}" alt="Generated image">
                <div class="gallery-thumbnail-overlay">
                    <div class="gallery-thumbnail-info">
                        <div class="gallery-thumbnail-prompt">${this.escapeHtml(img.prompt || 'No prompt')}</div>
                        <div class="gallery-thumbnail-date">${this.formatDate(img.date)}</div>
                    </div>
                </div>
                <button class="gallery-thumbnail-delete" data-image-id="${img.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
            const imageId = thumb.dataset.imageId;

            // Load image on click
            thumb.addEventListener('click', (e) => {
                if (!e.target.closest('.gallery-thumbnail-delete')) {
                    this.handleLoadGalleryImage(imageId);
                }
            });
        });

        // Add delete handlers
        container.querySelectorAll('.gallery-thumbnail-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const imageId = btn.dataset.imageId;
                this.handleDeleteGalleryImage(imageId);
            });
        });

        console.log('🖼️ [GALLERY] Rendered', images.length, 'thumbnails');
    }

    async handleLoadGalleryImage(imageId) {
        try {
            const image = this.modules.gallery.getImage(imageId);
            if (!image) {
                this.showError('Image not found in gallery');
                return;
            }

            console.log('📂 [GALLERY] Loading image from gallery:', imageId);

            await this.loadImageToCanvas(image.dataUrl);
            this.modules.gallery.setActiveImage(imageId);
            this.renderGallery();

            // Set aspect ratio to auto so the loaded image's aspect ratio is preserved
            if (this.modules.promptEnhancer) {
                this.modules.promptEnhancer.setAspectRatioToAuto();
            }

            this.showSuccess('Image loaded from gallery');
        } catch (error) {
            console.error('❌ [GALLERY] Failed to load image:', error);
            this.showError('Failed to load image from gallery');
        }
    }

    handleDeleteGalleryImage(imageId) {
        if (confirm('Are you sure you want to delete this image?')) {
            const success = this.modules.gallery.deleteImage(imageId);
            if (success) {
                this.renderGallery();
                this.showSuccess('Image deleted from gallery');
            } else {
                this.showError('Failed to delete image');
            }
        }
    }

    handleClearGallery() {
        const count = this.modules.gallery.getAllImages().length;
        if (count === 0) {
            this.showError('Gallery is already empty');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${count} images from the gallery?`)) {
            this.modules.gallery.clearGallery();
            this.renderGallery();
            this.showSuccess('Gallery cleared');
        }
    }

    scrollGallery(direction) {
        const container = document.getElementById('galleryThumbnails');
        if (!container) return;

        const scrollAmount = 300;
        const currentScroll = container.scrollLeft;

        if (direction === 'left') {
            container.scrollTo({
                left: currentScroll - scrollAmount,
                behavior: 'smooth'
            });
        } else {
            container.scrollTo({
                left: currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }
}

// Initialize the application when the script loads
window.aiImageEditor = new AIImageEditor();
