/**
 * AI Ad Studio Manager
 * Handles AI-powered advertisement generation with platform-aware formatting
 */

class AdStudioManager {
    constructor(app) {
        this.app = app;
        
        // Platform format mappings
        this.platformFormats = {
            instagram: [
                { value: 'post-square', label: 'Post (1:1 Square)', ratio: '1:1', width: 1080, height: 1080 },
                { value: 'story', label: 'Story (9:16 Vertical)', ratio: '9:16', width: 1080, height: 1920 },
                { value: 'reel', label: 'Reel (9:16 Vertical)', ratio: '9:16', width: 1080, height: 1920 }
            ],
            facebook: [
                { value: 'post', label: 'Post (1.91:1)', ratio: '1.91:1', width: 1200, height: 628 },
                { value: 'story', label: 'Story (9:16 Vertical)', ratio: '9:16', width: 1080, height: 1920 },
                { value: 'square', label: 'Square (1:1)', ratio: '1:1', width: 1080, height: 1080 }
            ],
            linkedin: [
                { value: 'post', label: 'Post (1.91:1)', ratio: '1.91:1', width: 1200, height: 627 },
                { value: 'article', label: 'Article Header (4:1)', ratio: '4:1', width: 1200, height: 300 }
            ],
            twitter: [
                { value: 'post', label: 'Post (16:9)', ratio: '16:9', width: 1200, height: 675 },
                { value: 'card', label: 'Card (2:1)', ratio: '2:1', width: 1200, height: 600 }
            ],
            tiktok: [
                { value: 'video', label: 'Video (9:16 Vertical)', ratio: '9:16', width: 1080, height: 1920 }
            ],
            pinterest: [
                { value: 'pin', label: 'Pin (2:3 Vertical)', ratio: '2:3', width: 1000, height: 1500 },
                { value: 'square', label: 'Square (1:1)', ratio: '1:1', width: 1000, height: 1000 }
            ]
        };

        // Vibe style mappings
        this.vibeStyles = {
            minimalist: 'clean, minimal, white space, simple, uncluttered, modern typography',
            bold: 'vibrant colors, high contrast, energetic, dynamic composition, eye-catching',
            elegant: 'sophisticated, luxury, premium feel, refined, subtle gradients, gold accents',
            playful: 'fun, colorful, whimsical, friendly, approachable, casual',
            professional: 'corporate, trustworthy, clean, business-like, authoritative',
            vintage: 'retro, nostalgic, aged textures, classic typography, warm tones',
            modern: 'sleek, tech-forward, futuristic, innovative, cutting-edge',
            natural: 'organic, earthy tones, natural textures, eco-friendly, sustainable'
        };

        // Text style mappings
        this.textStyles = {
            'modern-bold': 'bold modern sans-serif, high contrast, uppercase or strong weight',
            'elegant-serif': 'refined serif typography, elegant, premium, balanced kerning',
            'tech-sans': 'clean minimal sans-serif, geometric, contemporary, high legibility',
            'handwritten-playful': 'handwritten playful script, friendly, casual, dynamic',
            'classic-serif': 'classic serif, traditional, trustworthy, readable'
        };

        // UI Elements
        this.elements = {
            // Ad Type
            adTypeBtns: [],
            productAssetSection: null,
            conceptAssetSection: null,
            
            // Core Components
            platformSelect: null,
            formatSelect: null,
            headlineInput: null,
            ctaInput: null,
            brandNameInput: null,
            textStyleSelect: null,
            variationCountSelect: null,
            lockCopyCheckbox: null,
            
            // Assets
            productImageUpload: null,
            productImagePreview: null,
            productPreviewImg: null,
            removeProductBtn: null,
            isolateProductCheckbox: null,
            conceptTextarea: null,
            
            // Vibe
            vibeTags: [],
            
            // Prompt
            masterPromptTextarea: null,
            
            // Results
            resultsGrid: null,
            
            // Actions
            generateBtn: null,
            sendToCanvasBtn: null,
            statusDiv: null
        };

        // State
        this.state = {
            adType: 'product', // 'product' or 'concept'
            platform: '',
            format: null,
            headline: '',
            cta: '',
            brandName: '',
            productImage: null,
            productImageDataUrl: null,
            isolateProduct: false,
            concept: '',
            selectedVibes: [],
            masterPrompt: '',
            generatedAds: [],
            selectedAdIndex: null,
            isGenerating: false,
            
            // New controls
            textStyle: 'modern-bold',
            lockCopy: false,
            variationCount: 4
        };

        console.log('🎨 [AD STUDIO] Ad Studio Manager initialized');
    }

    /**
     * Initialize the Ad Studio Manager
     */
    initialize() {
        this.cacheElements();
        this.attachEventListeners();
        this.updateUIState();
        console.log('✅ [AD STUDIO] Ad Studio Manager ready');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        // Ad Type
        this.elements.adTypeBtns = document.querySelectorAll('.ad-type-btn');
        this.elements.productAssetSection = document.getElementById('productAssetSection');
        this.elements.conceptAssetSection = document.getElementById('conceptAssetSection');
        
        // Core Components
        this.elements.platformSelect = document.getElementById('adPlatform');
        this.elements.formatSelect = document.getElementById('adFormat');
        this.elements.headlineInput = document.getElementById('adHeadline');
        this.elements.ctaInput = document.getElementById('adCTA');
        this.elements.brandNameInput = document.getElementById('adBrandName');
        this.elements.textStyleSelect = document.getElementById('adTextStyle');
        this.elements.variationCountSelect = document.getElementById('variationCount');
        this.elements.lockCopyCheckbox = document.getElementById('lockCopy');
        
        // Assets
        this.elements.productImageUpload = document.getElementById('productImageUpload');
        this.elements.productImagePreview = document.getElementById('productImagePreview');
        this.elements.productPreviewImg = document.getElementById('productPreviewImg');
        this.elements.removeProductBtn = document.querySelector('.remove-product-btn');
        this.elements.isolateProductCheckbox = document.getElementById('isolateProduct');
        this.elements.conceptTextarea = document.getElementById('adConcept');
        
        // Vibe
        this.elements.vibeTags = document.querySelectorAll('.vibe-tag');
        
        // Prompt
        this.elements.masterPromptTextarea = document.getElementById('adMasterPrompt');
        
        // Results
        this.elements.resultsGrid = document.getElementById('adResultsGrid');
        
        // Actions
        this.elements.generateBtn = document.getElementById('generateAdsBtn');
        this.elements.sendToCanvasBtn = document.getElementById('sendToCanvasBtn');
        this.elements.statusDiv = document.getElementById('adStudioStatus');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Ad Type Toggle
        this.elements.adTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleAdTypeChange(btn.dataset.adType));
        });

        // Platform Selection
        if (this.elements.platformSelect) {
            this.elements.platformSelect.addEventListener('change', (e) => this.handlePlatformChange(e.target.value));
        }

        // Format Selection
        if (this.elements.formatSelect) {
            this.elements.formatSelect.addEventListener('change', (e) => this.handleFormatChange(e.target.value));
        }

        // Text Inputs
        if (this.elements.headlineInput) {
            this.elements.headlineInput.addEventListener('input', (e) => {
                this.state.headline = e.target.value;
                this.updateMasterPrompt();
                this.updateGenerateButtonState();
            });
        }

        if (this.elements.ctaInput) {
            this.elements.ctaInput.addEventListener('input', (e) => {
                this.state.cta = e.target.value;
                this.updateMasterPrompt();
            });
        }

        if (this.elements.brandNameInput) {
            this.elements.brandNameInput.addEventListener('input', (e) => {
                this.state.brandName = e.target.value;
                this.updateMasterPrompt();
            });
        }

        // Text Style Selection
        if (this.elements.textStyleSelect) {
            this.elements.textStyleSelect.addEventListener('change', (e) => {
                this.state.textStyle = e.target.value;
                this.updateMasterPrompt();
            });
        }

        // Variation Count Selection
        if (this.elements.variationCountSelect) {
            this.elements.variationCountSelect.addEventListener('change', (e) => {
                const val = parseInt(e.target.value, 10);
                this.state.variationCount = isNaN(val) ? 4 : val;
            });
        }

        // Lock Copy Checkbox
        if (this.elements.lockCopyCheckbox) {
            this.elements.lockCopyCheckbox.addEventListener('change', (e) => {
                this.state.lockCopy = e.target.checked;
                this.updateMasterPrompt();
            });
        }

        // Product Image Upload
        if (this.elements.productImageUpload) {
            this.elements.productImageUpload.addEventListener('change', (e) => this.handleProductImageUpload(e));
        }

        // Remove Product Button
        if (this.elements.removeProductBtn) {
            this.elements.removeProductBtn.addEventListener('click', () => this.removeProductImage());
        }

        // Isolate Product Checkbox
        if (this.elements.isolateProductCheckbox) {
            this.elements.isolateProductCheckbox.addEventListener('change', (e) => {
                this.state.isolateProduct = e.target.checked;
                this.updateMasterPrompt();
            });
        }

        // Concept Textarea
        if (this.elements.conceptTextarea) {
            this.elements.conceptTextarea.addEventListener('input', (e) => {
                this.state.concept = e.target.value;
                this.updateMasterPrompt();
                this.updateGenerateButtonState();
            });
        }

        // Vibe Tags
        this.elements.vibeTags.forEach(tag => {
            tag.addEventListener('click', () => this.handleVibeToggle(tag.dataset.vibe, tag));
        });

        // Master Prompt (allow manual editing)
        if (this.elements.masterPromptTextarea) {
            this.elements.masterPromptTextarea.addEventListener('input', (e) => {
                this.state.masterPrompt = e.target.value;
            });
        }

        // Generate Ads Button
        if (this.elements.generateBtn) {
            this.elements.generateBtn.addEventListener('click', () => this.generateAds());
        }

        // Send to Canvas Button
        if (this.elements.sendToCanvasBtn) {
            this.elements.sendToCanvasBtn.addEventListener('click', () => this.sendToCanvas());
        }
    }

    /**
     * Update UI state based on current state
     */
    updateUIState() {
        // Update ad type buttons
        this.elements.adTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.adType === this.state.adType);
        });

        // Show/hide asset sections
        if (this.elements.productAssetSection && this.elements.conceptAssetSection) {
            this.elements.productAssetSection.style.display = this.state.adType === 'product' ? 'block' : 'none';
            this.elements.conceptAssetSection.style.display = this.state.adType === 'concept' ? 'block' : 'none';
        }

        this.updateGenerateButtonState();
    }

    /**
     * Handle ad type change (Product vs Concept)
     */
    handleAdTypeChange(adType) {
        this.state.adType = adType;
        this.updateUIState();
        this.updateMasterPrompt();
        this.updateGenerateButtonState();
    }

    /**
     * Handle platform selection change
     */
    handlePlatformChange(platform) {
        this.state.platform = platform;
        this.state.format = null;

        // Update format dropdown
        if (this.elements.formatSelect) {
            this.elements.formatSelect.innerHTML = '';
            this.elements.formatSelect.disabled = false;

            if (platform && this.platformFormats[platform]) {
                const formats = this.platformFormats[platform];
                formats.forEach(format => {
                    const option = document.createElement('option');
                    option.value = format.value;
                    option.textContent = format.label;
                    this.elements.formatSelect.appendChild(option);
                });

                // Auto-select first format
                this.state.format = formats[0];
                this.elements.formatSelect.value = formats[0].value;
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Select platform first';
                this.elements.formatSelect.appendChild(option);
                this.elements.formatSelect.disabled = true;
            }
        }

        this.updateMasterPrompt();
        this.updateGenerateButtonState();
        this.updateGridAspectRatio();
    }

    /**
     * Handle format selection change
     */
    handleFormatChange(formatValue) {
        if (this.state.platform && this.platformFormats[this.state.platform]) {
            const format = this.platformFormats[this.state.platform].find(f => f.value === formatValue);
            this.state.format = format || null;
            this.updateMasterPrompt();
            this.updateGridAspectRatio();
        }
    }

    /**
     * Update the results grid aspect ratio based on selected format
     */
    updateGridAspectRatio() {
        const resultsGrid = this.elements.resultsGrid;
        if (!resultsGrid) return;

        // Default aspect ratio (1:1 square)
        let aspectRatio = '1 / 1';

        if (this.state.format && this.state.format.ratio) {
            // Convert ratio string to CSS aspect-ratio value
            const ratio = this.state.format.ratio;

            // Handle ratio formats like "16:9", "1:1", "9:16", "1.91:1", "4:1", "2:3"
            if (ratio.includes(':')) {
                const parts = ratio.split(':');
                const width = parseFloat(parts[0]);
                const height = parseFloat(parts[1]);
                aspectRatio = `${width} / ${height}`;
            }
        }

        // Apply aspect ratio to grid using CSS custom property
        resultsGrid.style.setProperty('--ad-card-aspect-ratio', aspectRatio);

        console.log(`📐 [AD STUDIO] Updated grid aspect ratio to ${aspectRatio} (${this.state.format?.ratio || 'default'})`);
    }

    /**
     * Get aspect ratio in format expected by Gemini API
     * @returns {string} Aspect ratio like "1:1", "16:9", "9:16"
     */
    getAspectRatioForApi() {
        if (!this.state.format || !this.state.format.ratio) {
            return '1:1'; // Default to square
        }
        return this.state.format.ratio;
    }

    /**
     * Handle product image upload
     */
    handleProductImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showStatus('Please upload a valid image file', 'error');
            return;
        }

        // Read file as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.productImage = file;
            this.state.productImageDataUrl = e.target.result;

            // Show preview
            if (this.elements.productPreviewImg && this.elements.productImagePreview) {
                this.elements.productPreviewImg.src = e.target.result;
                this.elements.productImagePreview.style.display = 'block';

                // Hide upload label
                const uploadLabel = document.querySelector('.upload-label');
                if (uploadLabel) uploadLabel.style.display = 'none';
            }

            this.updateMasterPrompt();
            this.updateGenerateButtonState();
        };
        reader.readAsDataURL(file);
    }

    /**
     * Remove product image
     */
    removeProductImage() {
        this.state.productImage = null;
        this.state.productImageDataUrl = null;

        if (this.elements.productImageUpload) {
            this.elements.productImageUpload.value = '';
        }

        if (this.elements.productImagePreview) {
            this.elements.productImagePreview.style.display = 'none';
        }

        // Show upload label
        const uploadLabel = document.querySelector('.upload-label');
        if (uploadLabel) uploadLabel.style.display = 'flex';

        this.updateMasterPrompt();
        this.updateGenerateButtonState();
    }

    /**
     * Handle vibe tag toggle
     */
    handleVibeToggle(vibe, tagElement) {
        const index = this.state.selectedVibes.indexOf(vibe);

        if (index > -1) {
            // Remove vibe
            this.state.selectedVibes.splice(index, 1);
            tagElement.classList.remove('active');
        } else {
            // Add vibe
            this.state.selectedVibes.push(vibe);
            tagElement.classList.add('active');
        }

        this.updateMasterPrompt();
    }

    /**
     * Update the master prompt based on current state
     */
    updateMasterPrompt() {
        let prompt = '';

        // Platform and format
        if (this.state.platform && this.state.format) {
            prompt += `Create a professional ${this.state.platform} advertisement in ${this.state.format.label} format (${this.state.format.ratio} aspect ratio).\n\n`;
        }

        // Ad Type specific content
        if (this.state.adType === 'product') {
            if (this.state.productImageDataUrl) {
                prompt += `PRODUCT IMAGE: [Uploaded product image will be used]\n`;
                if (this.state.isolateProduct) {
                    prompt += `- First isolate the product from its background\n`;
                    prompt += `- Place the isolated product in a new, professional scene\n`;
                }
                prompt += `\n`;
            }
        } else {
            if (this.state.concept) {
                prompt += `CONCEPT/SERVICE:\n${this.state.concept}\n\n`;
            }
        }

        // Text content
        if (this.state.headline) {
            prompt += `HEADLINE: "${this.state.headline}"\n`;
        }
        if (this.state.cta) {
            prompt += `CALL TO ACTION: "${this.state.cta}"\n`;
        }
        if (this.state.brandName) {
            prompt += `BRAND: ${this.state.brandName}\n`;
        }

        if (this.state.headline || this.state.cta || this.state.brandName) {
            prompt += `\n`;
        }

        // Vibe/Style
        if (this.state.selectedVibes.length > 0) {
            prompt += `VISUAL STYLE:\n`;
            this.state.selectedVibes.forEach(vibe => {
                const style = this.vibeStyles[vibe];
                prompt += `- ${vibe.charAt(0).toUpperCase() + vibe.slice(1)}: ${style}\n`;
            });
            prompt += `\n`;
        }

        // Typography
        if (this.state.textStyle && this.textStyles[this.state.textStyle]) {
            prompt += `TYPOGRAPHY STYLE:\n- ${this.textStyles[this.state.textStyle]}\n\n`;
        }

        // Instructions
        prompt += `REQUIREMENTS:\n`;
        prompt += `- High-quality, professional advertisement image\n`;
        prompt += `- Optimized for ${this.state.platform || 'social media'} platform\n`;
        prompt += `- Eye-catching and engaging composition\n`;
        prompt += `- Clear visual hierarchy\n`;
        if (this.state.headline) {
            prompt += `- Include the headline text in the image\n`;
        }
        if (this.state.cta) {
            prompt += `- Include the CTA prominently\n`;
        }
        if (this.state.lockCopy && (this.state.headline || this.state.cta)) {
            prompt += `- Use the exact HEADLINE and CTA text verbatim. Do not paraphrase, reword, or change punctuation.\n`;
        }

        this.state.masterPrompt = prompt;

        // Update textarea
        if (this.elements.masterPromptTextarea) {
            this.elements.masterPromptTextarea.value = prompt;
        }
    }

    /**
     * Update generate button state
     */
    updateGenerateButtonState() {
        if (!this.elements.generateBtn) return;

        let canGenerate = false;

        // Check if we have minimum required inputs
        if (this.state.platform && this.state.format && this.state.headline) {
            if (this.state.adType === 'product') {
                canGenerate = this.state.productImageDataUrl !== null;
            } else {
                canGenerate = this.state.concept.trim().length > 0;
            }
        }

        this.elements.generateBtn.disabled = !canGenerate || this.state.isGenerating;
    }

    /**
     * Generate ads using Gemini API
     */
    async generateAds() {
        if (this.state.isGenerating) return;

        this.state.isGenerating = true;
        this.elements.generateBtn.disabled = true;
        this.showStatus('Generating ads...', 'loading');

        try {
            // Show loading placeholders
            this.showLoadingPlaceholders();

            // Step 1: If product isolation is needed, do that first
            let productImageToUse = this.state.productImageDataUrl;

            if (this.state.adType === 'product' && this.state.isolateProduct && this.state.productImageDataUrl) {
                this.showStatus('Isolating product from background...', 'loading');
                productImageToUse = await this.isolateProductBackground(this.state.productImageDataUrl);
            }

            // Step 2: Generate 4 ad variations
            this.showStatus('Generating 4 ad variations...', 'loading');
            const ads = await this.generateAdVariations(productImageToUse);

            // Step 3: Display results
            this.displayAdResults(ads);
            this.showStatus(`Successfully generated ${ads.length} ad variations!`, 'success');

        } catch (error) {
            console.error('❌ [AD STUDIO] Generation failed:', error);
            this.showStatus(`Generation failed: ${error.message}`, 'error');
            this.showPlaceholders();
        } finally {
            this.state.isGenerating = false;
            this.updateGenerateButtonState();
        }
    }

    /**
     * Isolate product from background using Gemini API
     */
    async isolateProductBackground(imageDataUrl) {
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = `Isolate the main product from this image and return it with a transparent background.
Remove all background elements, keeping only the product itself.
Ensure clean edges and professional quality.`;

        // Use Gemini API's editImage method
        const result = await this.app.modules.gemini.editImage(imageDataUrl, prompt);
        return result;
    }

    /**
     * Generate ad variations using Gemini API
     */
    async generateAdVariations(productImage) {
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const ads = [];

        // Generate N variations based on UI selection
        const count = this.state.variationCount || 4;
        for (let i = 0; i < count; i++) {
            try {
                let imageUrl;

                if (this.state.adType === 'product' && productImage) {
                    // Product showcase: use the uploaded product image and create ad composition
                    const scenePrompt = this.buildProductScenePrompt(i);
                    // Use editImage with preserveOriginal=false to transform the product into a full ad
                    imageUrl = await this.app.modules.gemini.editImage(productImage, scenePrompt, false);
                } else {
                    // Concept/Service: generate from scratch
                    const conceptPrompt = this.buildConceptPrompt(i);
                    imageUrl = await this.app.modules.gemini.generateImage(conceptPrompt, this.getAspectRatioForApi());
                }

                ads.push({
                    imageUrl,
                    headline: this.state.headline,
                    cta: this.state.cta,
                    variation: i + 1
                });

            } catch (error) {
                console.error(`❌ [AD STUDIO] Failed to generate variation ${i + 1}:`, error);
                // Continue with other variations
            }
        }

        if (ads.length === 0) {
            throw new Error('Failed to generate any ad variations');
        }

        this.state.generatedAds = ads;
        return ads;
    }

    /**
     * Build prompt for product scene (with variations)
     * This is used with editImage() to place the uploaded product in a new advertisement scene
     */
    buildProductScenePrompt(variationIndex) {
        const scenes = [
            'a modern, minimalist studio setting with soft, professional lighting and clean white background',
            'a lifestyle context with natural outdoor environment',
            'a dramatic scene with bold, cinematic lighting and rich colors',
            'an elegant, luxury setting with premium atmosphere'
        ];

        let prompt = `Transform this product image into a professional advertisement photograph. `;

        const sceneIdx = variationIndex % scenes.length;
        prompt += `Place the product in ${scenes[sceneIdx]}. `;

        if (this.state.selectedVibes.length > 0) {
            const styleDescriptions = this.state.selectedVibes.map(vibe => this.vibeStyles[vibe]);
            prompt += `Style: ${styleDescriptions.join(', ')}. `;
        }

        if (this.state.platform && this.state.format) {
            prompt += `Format: ${this.state.platform} ${this.state.format.label} (${this.state.format.ratio}). `;
        }

        if (this.state.textStyle && this.textStyles[this.state.textStyle]) {
            prompt += `Typography: ${this.textStyles[this.state.textStyle]}. `;
        }

        const texts = [];
        if (this.state.headline) texts.push(`HEADLINE: "${this.state.headline}"`);
        if (this.state.cta) texts.push(`CTA: "${this.state.cta}"`);
        if (this.state.brandName) texts.push(`BRAND: ${this.state.brandName}`);
        if (texts.length > 0) {
            prompt += `Render ${texts.join(', ')} directly embedded into the image using the model's native high-quality text rendering. Do not create separate overlay layers; integrate text with consistent typographic design and visual hierarchy. `;
        }

        if (this.state.lockCopy && (this.state.headline || this.state.cta)) {
            prompt += `Use the exact HEADLINE and CTA text verbatim; do not paraphrase or alter punctuation. `;
        }

        prompt += `Create a high-quality advertisement image with professional composition, eye-catching lighting, and the product as the clear focal point.`;

        return prompt;
    }

    /**
     * Build prompt for concept generation (with variations)
     */
    buildConceptPrompt(variationIndex) {
        const variations = [
            'Variation 1: Focus on emotional connection and storytelling',
            'Variation 2: Emphasize bold visuals and eye-catching design',
            'Variation 3: Highlight professionalism and trust',
            'Variation 4: Create a unique, creative interpretation'
        ];

        const varIdx = variationIndex % variations.length;
        let prompt = this.state.masterPrompt + `\n\n${variations[varIdx]}\n`;

        if (this.state.textStyle && this.textStyles[this.state.textStyle]) {
            prompt += `\nTypography: ${this.textStyles[this.state.textStyle]}.`;
        }
        if (this.state.headline || this.state.cta || this.state.brandName) {
            const parts = [];
            if (this.state.headline) parts.push(`HEADLINE: "${this.state.headline}"`);
            if (this.state.cta) parts.push(`CTA: "${this.state.cta}"`);
            if (this.state.brandName) parts.push(`BRAND: ${this.state.brandName}`);
            prompt += `\nRender ${parts.join(', ')} directly embedded in the image with high-quality native text rendering; do not add separate overlay layers.`;
        }
        if (this.state.lockCopy && (this.state.headline || this.state.cta)) {
            prompt += `\nUse the exact HEADLINE and CTA verbatim; do not paraphrase or alter punctuation.`;
        }
        return prompt;
    }

    /**
     * Display ad results in the grid
     */
    displayAdResults(ads) {
        if (!this.elements.resultsGrid) return;

        this.elements.resultsGrid.innerHTML = '';

        ads.forEach((ad, index) => {
            const card = this.createAdCard(ad, index);
            this.elements.resultsGrid.appendChild(card);
        });

        // Enable send to canvas button
        if (this.elements.sendToCanvasBtn) {
            this.elements.sendToCanvasBtn.disabled = false;
        }
    }

    /**
     * Create an ad card element
     */
    createAdCard(ad, index) {
        console.log(`🎯 [AD STUDIO DEBUG] Creating ad card for index ${index}:`, ad);
        
        const card = document.createElement('div');
        card.className = 'ad-card';
        card.dataset.index = index;

        // Image
        const img = document.createElement('img');
        img.className = 'ad-card-image';
        img.src = ad.imageUrl;
        img.alt = `Ad variation ${ad.variation}`;
        card.appendChild(img);

        console.log(`🖼️ [AD STUDIO DEBUG] Created image element with src: ${ad.imageUrl}`);

        // Text overlay
        if (ad.headline || ad.cta) {
            const overlay = document.createElement('div');
            overlay.className = 'ad-card-overlay';

            if (ad.headline) {
                const headline = document.createElement('div');
                headline.className = 'ad-card-headline';
                headline.textContent = ad.headline;
                overlay.appendChild(headline);
            }

            if (ad.cta) {
                const cta = document.createElement('div');
                cta.className = 'ad-card-cta';
                cta.textContent = ad.cta;
                overlay.appendChild(cta);
            }

            card.appendChild(overlay);
            console.log(`📝 [AD STUDIO DEBUG] Added text overlay with headline: "${ad.headline}", CTA: "${ad.cta}"`);
        }

        // Single-click to open on canvas (and select)
        card.addEventListener('click', (e) => {
            console.log(`👆 [AD STUDIO DEBUG] Card clicked for index ${index}`, e);
            this.selectAd(index);
            this.sendToCanvasWithIndex(index);
        });
        
        // Also handle click directly on the image
        img.addEventListener('click', (e) => {
            console.log(`🖼️👆 [AD STUDIO DEBUG] Image clicked for index ${index}`, e);
            e.stopPropagation(); // Prevent card click from firing twice
            this.selectAd(index);
            this.sendToCanvasWithIndex(index);
        });

        console.log(`✅ [AD STUDIO DEBUG] Ad card created successfully for index ${index}`);
        return card;
    }

    /**
     * Select an ad
     */
    selectAd(index) {
        this.state.selectedAdIndex = index;

        // Update UI
        const cards = this.elements.resultsGrid.querySelectorAll('.ad-card');
        cards.forEach((card, i) => {
            card.classList.toggle('selected', i === index);
        });
    }

    /**
     * Send selected ad to main canvas
     */
    async sendToCanvasWithIndex(index) {
        console.log(`🎯 [AD STUDIO DEBUG] sendToCanvasWithIndex called with index: ${index}`);
        console.log(`📊 [AD STUDIO DEBUG] Current state:`, {
            selectedAdIndex: this.state.selectedAdIndex,
            generatedAdsCount: this.state.generatedAds.length,
            generatedAds: this.state.generatedAds
        });
        
        this.state.selectedAdIndex = index;
        console.log(`✅ [AD STUDIO DEBUG] Updated selectedAdIndex to: ${index}`);
        
        await this.sendToCanvas();
    }

    async sendToCanvas() {
        console.log(`🚀 [AD STUDIO DEBUG] sendToCanvas called`);
        console.log(`📊 [AD STUDIO DEBUG] Validation check:`, {
            selectedAdIndex: this.state.selectedAdIndex,
            isNull: this.state.selectedAdIndex === null,
            generatedAdsLength: this.state.generatedAds.length,
            selectedAdExists: this.state.generatedAds[this.state.selectedAdIndex] !== undefined
        });
        
        if (this.state.selectedAdIndex === null || !this.state.generatedAds[this.state.selectedAdIndex]) {
            console.error(`❌ [AD STUDIO DEBUG] Validation failed - no ad selected or ad doesn't exist`);
            this.showStatus('Please select an ad first', 'error');
            return;
        }

        const selectedAd = this.state.generatedAds[this.state.selectedAdIndex];
        let imageUrlToLoad = selectedAd.imageUrl;
        
        console.log(`🖼️ [AD STUDIO DEBUG] Selected ad:`, selectedAd);
        console.log(`🔗 [AD STUDIO DEBUG] Original image URL:`, imageUrlToLoad);
        console.log(`🔍 [AD STUDIO DEBUG] URL type:`, typeof imageUrlToLoad);
        console.log(`🔍 [AD STUDIO DEBUG] Is blob URL:`, typeof imageUrlToLoad === 'string' && imageUrlToLoad.startsWith('blob:'));

        try {
            this.showStatus('Sending to canvas...', 'loading');
            console.log(`📤 [AD STUDIO DEBUG] Starting canvas send process...`);

            // If the URL is a blob from a different origin, convert to base64 for safety
            if (typeof imageUrlToLoad === 'string' && imageUrlToLoad.startsWith('blob:')) {
                console.log(`🔄 [AD STUDIO DEBUG] Attempting blob to base64 conversion...`);
                console.log(`🔍 [AD STUDIO DEBUG] Gallery module exists:`, !!this.app.modules.gallery);
                console.log(`🔍 [AD STUDIO DEBUG] blobUrlToBase64 function exists:`, typeof this.app.modules.gallery?.blobUrlToBase64);
                
                if (this.app.modules.gallery && typeof this.app.modules.gallery.blobUrlToBase64 === 'function') {
                    try {
                        console.log(`🔄 [AD STUDIO DEBUG] Calling blobUrlToBase64...`);
                        imageUrlToLoad = await this.app.modules.gallery.blobUrlToBase64(imageUrlToLoad);
                        console.log(`✅ [AD STUDIO DEBUG] Blob conversion successful, new URL length:`, imageUrlToLoad.length);
                        console.log(`🔍 [AD STUDIO DEBUG] New URL starts with:`, imageUrlToLoad.substring(0, 50));
                    } catch (convErr) {
                        console.warn('⚠️ [AD STUDIO DEBUG] Blob to base64 conversion failed:', convErr);
                        console.log(`🔄 [AD STUDIO DEBUG] Will attempt direct load with original blob URL`);
                    }
                } else {
                    console.warn('⚠️ [AD STUDIO DEBUG] Gallery module or blobUrlToBase64 function not available');
                }
            }

            console.log(`🎯 [AD STUDIO DEBUG] About to call app.loadImageToCanvas with URL:`, imageUrlToLoad.substring(0, 100));
            console.log(`🔍 [AD STUDIO DEBUG] App object exists:`, !!this.app);
            console.log(`🔍 [AD STUDIO DEBUG] loadImageToCanvas function exists:`, typeof this.app.loadImageToCanvas);
            
            await this.app.loadImageToCanvas(imageUrlToLoad);
            console.log(`✅ [AD STUDIO DEBUG] app.loadImageToCanvas completed successfully`);

            // NOTE: We no longer add separate Konva text layers here.
            // Text is now expected to be embedded directly by Gemini during generation/edit.

            this.showStatus('Ad sent to canvas successfully!', 'success');
            console.log(`🎉 [AD STUDIO DEBUG] Canvas send process completed successfully`);
        } catch (error) {
            console.error('❌ [AD STUDIO DEBUG] Failed to send to canvas:', error);
            console.error('❌ [AD STUDIO DEBUG] Error stack:', error.stack);
            console.log(`📊 [AD STUDIO DEBUG] Error context:`, {
                selectedAdIndex: this.state.selectedAdIndex,
                imageUrl: imageUrlToLoad?.substring(0, 100),
                appExists: !!this.app,
                loadImageToCanvasExists: typeof this.app?.loadImageToCanvas
            });
            this.showStatus('Failed to send to canvas', 'error');
        }
    }

    /**
     * Show loading placeholders
     */
    showLoadingPlaceholders() {
        if (!this.elements.resultsGrid) return;

        this.elements.resultsGrid.innerHTML = '';

        const count = this.state.variationCount || 4;
        for (let i = 0; i < count; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'ad-card-placeholder';
            placeholder.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <p>Generating variation ${i + 1}...</p>
            `;
            this.elements.resultsGrid.appendChild(placeholder);
        }
    }

    /**
     * Show empty placeholders
     */
    showPlaceholders() {
        if (!this.elements.resultsGrid) return;

        const count = this.state.variationCount || 4;
        this.elements.resultsGrid.innerHTML = `
            <div class="ad-card-placeholder">
                <i class="fas fa-image"></i>
                <p>Your ads will appear here</p>
            </div>
            <div class="ad-card-placeholder">
                <i class="fas fa-image"></i>
                <p>Generate to see results</p>
            </div>
            <div class="ad-card-placeholder">
                <i class="fas fa-image"></i>
                <p>${count} variations per generation</p>
            </div>
            <div class="ad-card-placeholder">
                <i class="fas fa-image"></i>
                <p>Click Generate Ads below</p>
            </div>
        `;
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        if (!this.elements.statusDiv) return;

        this.elements.statusDiv.textContent = message;
        this.elements.statusDiv.className = 'generation-status';

        if (type === 'error') {
            this.elements.statusDiv.classList.add('error');
        } else if (type === 'success') {
            this.elements.statusDiv.classList.add('success');
        } else if (type === 'loading') {
            this.elements.statusDiv.classList.add('loading');
        }

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (this.elements.statusDiv) {
                    this.elements.statusDiv.textContent = '';
                }
            }, 5000);
        }
    }
}
