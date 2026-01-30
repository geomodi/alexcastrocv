/**
 * Style Transfer Manager
 * Handles AI-powered style transfer functionality including:
 * - Style reference image upload and storage
 * - AI-powered style analysis
 * - Style transfer execution via Gemini API
 */

class StyleTransferManager {
    /**
     * Initialize the Style Transfer Manager
     * @param {AIImageEditor} app - Reference to main application
     */
    constructor(app) {
        this.app = app;
        
        // Style image storage
        this.styleImage = null;           // HTMLImageElement
        this.styleImageUrl = null;        // Blob URL for preview
        this.styleImageData = null;       // Base64 for API
        
        // Style description
        this.styleDescription = '';       // User/AI-generated description

        // Target element (optional)
        this.targetElement = '';          // Specific element to transform

        // Pending gallery image (for save icon functionality)
        this.pendingGalleryImage = null;  // Stores result before user saves to gallery

        // UI elements (will be initialized in setupEventListeners)
        this.elements = {
            uploadBtn: null,
            fileInput: null,
            preview: null,
            previewImg: null,
            removeBtn: null,
            descriptionSection: null,
            descriptionInput: null,
            targetElementInput: null,
            analyzeBtn: null,
            transferBtn: null,
            status: null,
            saveToGalleryBtn: null
        };
        
        console.log('✅ [STYLE TRANSFER] StyleTransferManager initialized');
    }
    
    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        // Get UI elements
        this.elements.uploadBtn = document.getElementById('uploadStyleBtn');
        this.elements.fileInput = document.getElementById('styleImageInput');
        this.elements.preview = document.getElementById('stylePreview');
        this.elements.previewImg = document.getElementById('stylePreviewImg');
        this.elements.removeBtn = document.getElementById('removeStyleBtn');
        this.elements.descriptionSection = document.getElementById('styleDescriptionSection');
        this.elements.descriptionInput = document.getElementById('styleDescriptionInput');
        this.elements.targetElementInput = document.getElementById('targetElementInput');
        this.elements.analyzeBtn = document.getElementById('analyzeStyleBtn');
        this.elements.transferBtn = document.getElementById('transferStyleBtn');
        this.elements.status = document.getElementById('styleTransferStatus');
        this.elements.saveToGalleryBtn = document.getElementById('saveToGalleryBtn');
        
        // Upload button click
        if (this.elements.uploadBtn) {
            this.elements.uploadBtn.addEventListener('click', () => this.handleUploadClick());
        }
        
        // File input change
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // Remove button click
        if (this.elements.removeBtn) {
            this.elements.removeBtn.addEventListener('click', () => this.removeStyle());
        }
        
        // Analyze button click
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.addEventListener('click', () => this.analyzeStyleImage());
        }
        
        // Transfer button click
        if (this.elements.transferBtn) {
            this.elements.transferBtn.addEventListener('click', () => this.performStyleTransfer());
        }
        
        // Description textarea input
        if (this.elements.descriptionInput) {
            this.elements.descriptionInput.addEventListener('input', (e) => {
                this.styleDescription = e.target.value;
                this.updateButtonStates();
            });
        }

        // Target element input
        if (this.elements.targetElementInput) {
            this.elements.targetElementInput.addEventListener('input', (e) => {
                this.targetElement = e.target.value;
                // No need to update button states - target element is optional
            });
        }

        // Save to gallery button click
        if (this.elements.saveToGalleryBtn) {
            this.elements.saveToGalleryBtn.addEventListener('click', () => this.saveToGallery());
        }

        console.log('✅ [STYLE TRANSFER] Event listeners setup');
    }
    
    /**
     * Handle upload button click
     */
    handleUploadClick() {
        if (this.elements.fileInput) {
            this.elements.fileInput.click();
        }
    }
    
    /**
     * Handle file selection
     * @param {Event} event - File input change event
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }
        
        // Validate file type
        if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
            this.showStatus('Please select a PNG, JPEG, or WebP image', 'error');
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showStatus('Image size must be less than 10MB', 'error');
            return;
        }
        
        try {
            this.showStatus('Loading style image...', 'analyzing');
            
            // Create blob URL for preview
            if (this.styleImageUrl) {
                URL.revokeObjectURL(this.styleImageUrl);
            }
            this.styleImageUrl = URL.createObjectURL(file);
            
            // Load image
            const img = await this.loadImage(this.styleImageUrl);
            this.styleImage = img;
            
            // Convert to base64 for API
            this.styleImageData = await this.imageToBase64(img);
            
            // Show preview
            this.showPreview();
            
            // Enable analyze button and textarea
            if (this.elements.analyzeBtn) {
                this.elements.analyzeBtn.disabled = false;
            }
            if (this.elements.descriptionInput) {
                this.elements.descriptionInput.disabled = false;
            }
            
            this.showStatus('✅ Style image loaded successfully', 'success');
            console.log('✅ [STYLE TRANSFER] Style image loaded');
            
        } catch (error) {
            console.error('❌ [STYLE TRANSFER] Failed to load image:', error);
            this.showStatus('Failed to load image. Please try again.', 'error');
        }
    }
    
    /**
     * Load image from URL
     * @param {string} url - Image URL
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }
    
    /**
     * Convert image to base64
     * @param {HTMLImageElement} img - Image element
     * @returns {Promise<string>} Base64 string (without data URL prefix)
     */
    imageToBase64(img) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/png');
                const base64 = dataUrl.split(',')[1];
                
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Show preview of uploaded style image
     */
    showPreview() {
        if (this.elements.preview && this.elements.previewImg && this.styleImageUrl) {
            this.elements.previewImg.src = this.styleImageUrl;
            this.elements.preview.style.display = 'block';
            
            // Show description section
            if (this.elements.descriptionSection) {
                this.elements.descriptionSection.style.display = 'block';
            }
        }
    }
    
    /**
     * Remove style image
     */
    removeStyle() {
        // Revoke blob URL
        if (this.styleImageUrl) {
            URL.revokeObjectURL(this.styleImageUrl);
        }
        
        // Clear data
        this.styleImage = null;
        this.styleImageUrl = null;
        this.styleImageData = null;
        this.styleDescription = '';
        
        // Reset UI
        if (this.elements.preview) {
            this.elements.preview.style.display = 'none';
        }
        if (this.elements.previewImg) {
            this.elements.previewImg.src = '';
        }
        if (this.elements.descriptionSection) {
            this.elements.descriptionSection.style.display = 'none';
        }
        if (this.elements.descriptionInput) {
            this.elements.descriptionInput.value = '';
            this.elements.descriptionInput.disabled = true;
        }
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
        
        this.updateButtonStates();
        this.showStatus('', '');
        
        console.log('✅ [STYLE TRANSFER] Style image removed');
    }
    
    /**
     * Update button states based on current data
     */
    updateButtonStates() {
        // Analyze button: enabled if style image is loaded
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.disabled = !this.styleImageData;
        }

        // Transfer button: enabled if we have style description and canvas has image
        if (this.elements.transferBtn) {
            const hasDescription = this.styleDescription && this.styleDescription.trim().length > 0;
            const hasCanvasImage = this.app.modules.editor && this.app.modules.editor.imageNode;
            this.elements.transferBtn.disabled = !(hasDescription && hasCanvasImage);
        }
    }
    
    /**
     * Show status message
     * @param {string} message - Status message
     * @param {string} type - Status type: 'analyzing', 'transferring', 'success', 'error'
     */
    showStatus(message, type) {
        if (!this.elements.status) return;
        
        this.elements.status.textContent = message;
        this.elements.status.className = 'generation-status';
        
        if (type) {
            this.elements.status.classList.add(`status-${type}`);
        }
    }
    
    /**
     * Analyze style image using Gemini API
     */
    async analyzeStyleImage() {
        if (!this.styleImageData) {
            this.showStatus('Please upload a style image first', 'error');
            return;
        }

        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            this.showStatus('Please set your Gemini API key first', 'error');
            return;
        }

        try {
            // Disable analyze button and show loading state
            if (this.elements.analyzeBtn) {
                this.elements.analyzeBtn.disabled = true;
                this.elements.analyzeBtn.classList.add('loading');
            }

            this.showStatus('Analyzing artistic style...', 'analyzing');
            console.log('🎨 [STYLE TRANSFER] Starting AI style analysis...');

            // Call Gemini API to analyze style
            const description = await this.app.modules.gemini.analyzeStyleImage(this.styleImageData);

            // Populate textarea with description
            if (this.elements.descriptionInput) {
                this.elements.descriptionInput.value = description;
                this.styleDescription = description;
            }

            this.updateButtonStates();
            this.showStatus('✅ Style analysis complete! Review and edit the description if needed.', 'success');
            console.log('✅ [STYLE TRANSFER] Style analysis complete');

        } catch (error) {
            console.error('❌ [STYLE TRANSFER] Style analysis failed:', error);

            let errorMessage = 'Style analysis failed. ';
            if (error.message.includes('API key')) {
                errorMessage += 'Please check your API key.';
            } else if (error.message.includes('quota')) {
                errorMessage += 'API quota exceeded.';
            } else {
                errorMessage += 'Please try again.';
            }

            this.showStatus(errorMessage, 'error');

        } finally {
            // Re-enable analyze button
            if (this.elements.analyzeBtn) {
                this.elements.analyzeBtn.disabled = false;
                this.elements.analyzeBtn.classList.remove('loading');
            }
        }
    }

    /**
     * Perform style transfer
     */
    async performStyleTransfer() {
        // Validate prerequisites
        if (!this.styleImageData) {
            this.showStatus('Please upload a style image first', 'error');
            return;
        }

        if (!this.styleDescription || this.styleDescription.trim().length === 0) {
            this.showStatus('Please provide a style description', 'error');
            return;
        }

        // Get canvas image data
        const canvasImageData = await this.getCanvasImageData();
        if (!canvasImageData) {
            this.showStatus('Please load an image onto the canvas first', 'error');
            return;
        }

        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            this.showStatus('Please set your Gemini API key first', 'error');
            return;
        }

        try {
            // Disable transfer button and show loading state
            if (this.elements.transferBtn) {
                this.elements.transferBtn.disabled = true;
                this.elements.transferBtn.classList.add('loading');
            }

            console.log('🎨 [STYLE TRANSFER] Starting style transfer...');
            if (this.targetElement && this.targetElement.trim().length > 0) {
                console.log('🎯 [STYLE TRANSFER] Target element:', this.targetElement);
                this.showStatus(`Transferring style to "${this.targetElement}"...`, 'transferring');
            } else {
                this.showStatus('Transferring artistic style...', 'transferring');
            }

            // Call Gemini API to perform style transfer
            // NOTE: Only sending canvas image + text description to preserve aspect ratio
            console.log('📤 [STYLE TRANSFER] Calling Gemini API for style transfer (text-based)...');
            const resultDataUrl = await this.app.modules.gemini.styleTransfer(
                canvasImageData,
                this.styleDescription,
                this.targetElement  // Pass the optional target element
            );

            // Load result onto canvas
            this.showStatus('Loading result...', 'transferring');
            console.log('🖼️ [STYLE TRANSFER] Loading result onto canvas...');

            if (this.app.modules.editor) {
                await this.app.modules.editor.loadImage(resultDataUrl);
            } else {
                await this.app.createKonvaEditor(resultDataUrl);
            }

            // Store the result data for potential gallery save
            this.pendingGalleryImage = {
                dataUrl: resultDataUrl,
                prompt: `Style Transfer: ${this.styleDescription.substring(0, 50)}...`,
                timestamp: Date.now(),
                targetElement: this.targetElement || 'entire image'
            };

            // Show save to gallery icon instead of auto-saving
            this.showSaveToGalleryIcon();

            this.showStatus('✅ Style transfer complete! Click the save icon to add to gallery.', 'success');
            console.log('✅ [STYLE TRANSFER] Style transfer complete!');

        } catch (error) {
            console.error('❌ [STYLE TRANSFER] Style transfer failed:', error);

            let errorMessage = 'Style transfer failed. ';
            if (error.message.includes('API key')) {
                errorMessage += 'Please check your API key.';
            } else if (error.message.includes('quota')) {
                errorMessage += 'API quota exceeded.';
            } else if (error.message.includes('canvas')) {
                errorMessage += 'Please load an image onto the canvas first.';
            } else {
                errorMessage += 'Please try again.';
            }

            this.showStatus(errorMessage, 'error');

        } finally {
            // Re-enable transfer button
            if (this.elements.transferBtn) {
                this.elements.transferBtn.disabled = false;
                this.elements.transferBtn.classList.remove('loading');
            }

            this.updateButtonStates();
        }
    }

    /**
     * Get canvas image data as base64
     * @returns {Promise<string|null>} Base64 string without data URL prefix
     */
    async getCanvasImageData() {
        if (!this.app.modules.editor) return null;
        return await this.app.modules.editor.getImageAsBase64();
    }

    /**
     * Show the save to gallery button in canvas header
     */
    showSaveToGalleryIcon() {
        if (this.elements.saveToGalleryBtn) {
            this.elements.saveToGalleryBtn.style.display = 'flex';
            console.log('💾 [STYLE TRANSFER] Save to gallery button shown');
        }
    }

    /**
     * Hide the save to gallery button in canvas header
     */
    hideSaveToGalleryIcon() {
        if (this.elements.saveToGalleryBtn) {
            this.elements.saveToGalleryBtn.style.display = 'none';
            console.log('💾 [STYLE TRANSFER] Save to gallery button hidden');
        }
    }

    /**
     * Save the pending image to gallery
     */
    async saveToGallery() {
        if (!this.pendingGalleryImage) {
            console.warn('⚠️ [STYLE TRANSFER] No pending image to save');
            return;
        }

        try {
            console.log('💾 [STYLE TRANSFER] Saving image to gallery...');

            // Add to gallery
            if (this.app.modules.gallery) {
                const imageId = await this.app.modules.gallery.addImage(
                    this.pendingGalleryImage.dataUrl,
                    this.pendingGalleryImage.prompt,
                    {
                        type: 'style-transfer',
                        targetElement: this.pendingGalleryImage.targetElement,
                        timestamp: this.pendingGalleryImage.timestamp
                    }
                );

                // Set as active image
                this.app.modules.gallery.setActiveImage(imageId);

                // Re-render gallery
                if (this.app.renderGallery) {
                    this.app.renderGallery();
                }

                console.log('✅ [STYLE TRANSFER] Image saved to gallery with ID:', imageId);
                this.showStatus('✅ Image saved to gallery!', 'success');
            }

            // Hide the save icon
            this.hideSaveToGalleryIcon();

            // Clear pending image
            this.pendingGalleryImage = null;

        } catch (error) {
            console.error('❌ [STYLE TRANSFER] Failed to save to gallery:', error);
            this.showStatus('Failed to save to gallery', 'error');
        }
    }
}

