/**
 * Object Transfer Manager
 * Handles AI-powered object transfer functionality including:
 * - Source image upload and storage
 * - AI-powered image analysis
 * - Aspect ratio pre-processing
 * - Object transfer execution via Gemini API
 */

class ObjectTransferManager {
    /**
     * Initialize the Object Transfer Manager
     * @param {AIImageEditor} app - Reference to main application
     */
    constructor(app) {
        this.app = app;
        
        // Source image storage
        this.sourceImage = null;           // HTMLImageElement
        this.sourceImageUrl = null;        // Blob URL for preview
        this.sourceImageData = null;       // Base64 for API
        
        // Transfer description
        this.transferDescription = '';     // User/AI-generated description
        
        // UI elements (will be initialized in setupEventListeners)
        this.elements = {
            uploadBtn: null,
            fileInput: null,
            preview: null,
            previewImg: null,
            removeBtn: null,
            descriptionSection: null,
            descriptionInput: null,
            analyzeBtn: null,
            transferBtn: null,
            status: null
        };
        
        console.log('✅ ObjectTransferManager initialized');
    }
    
    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        // Get UI elements
        this.elements.uploadBtn = document.getElementById('uploadSourceBtn');
        this.elements.fileInput = document.getElementById('sourceImageInput');
        this.elements.preview = document.getElementById('sourcePreview');
        this.elements.previewImg = document.getElementById('sourcePreviewImg');
        this.elements.removeBtn = document.getElementById('removeSourceBtn');
        this.elements.descriptionSection = document.getElementById('transferDescriptionSection');
        this.elements.descriptionInput = document.getElementById('transferDescriptionInput');
        this.elements.analyzeBtn = document.getElementById('analyzeImageBtn');
        this.elements.transferBtn = document.getElementById('transferObjectBtn');
        this.elements.status = document.getElementById('transferStatus');
        
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
            this.elements.removeBtn.addEventListener('click', () => this.removeSource());
        }
        
        // Analyze button click
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.addEventListener('click', () => this.analyzeSourceImage());
        }
        
        // Transfer button click
        if (this.elements.transferBtn) {
            this.elements.transferBtn.addEventListener('click', () => this.performObjectTransfer());
        }
        
        // Description textarea input
        if (this.elements.descriptionInput) {
            this.elements.descriptionInput.addEventListener('input', (e) => {
                this.transferDescription = e.target.value;
                this.updateButtonStates();
            });
        }
        
        console.log('✅ ObjectTransferManager event listeners setup');
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
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.showStatus('Invalid file type. Please upload PNG, JPEG, or WebP.', 'error');
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            this.showStatus('Image too large (max 10MB). Please use a smaller image.', 'error');
            return;
        }
        
        try {
            this.showStatus('Loading image...', 'info');
            
            // Create blob URL for preview
            this.sourceImageUrl = URL.createObjectURL(file);
            
            // Load image
            this.sourceImage = await this.loadImage(this.sourceImageUrl);
            
            // Convert to base64 for API
            this.sourceImageData = await this.imageToBase64(this.sourceImage);
            
            // Update UI
            this.updatePreview(this.sourceImageUrl);
            this.showDescriptionSection();
            this.updateButtonStates();
            
            this.showStatus('Source image loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error loading source image:', error);
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
     * @param {HTMLImageElement} image - Image element
     * @returns {Promise<string>} Base64 encoded image (without data URL prefix)
     */
    async imageToBase64(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        
        // Get base64 without the data URL prefix
        const dataUrl = canvas.toDataURL('image/png');
        return dataUrl.split(',')[1];
    }
    
    /**
     * Update preview display
     * @param {string} imageUrl - Image URL to display
     */
    updatePreview(imageUrl) {
        if (this.elements.previewImg) {
            this.elements.previewImg.src = imageUrl;
        }
        
        if (this.elements.preview) {
            this.elements.preview.style.display = 'block';
        }
    }
    
    /**
     * Show description section
     */
    showDescriptionSection() {
        if (this.elements.descriptionSection) {
            this.elements.descriptionSection.style.display = 'block';
        }
        
        // Enable textarea
        if (this.elements.descriptionInput) {
            this.elements.descriptionInput.disabled = false;
        }
    }
    
    /**
     * Remove source image
     */
    removeSource() {
        // Revoke blob URL to free memory
        if (this.sourceImageUrl) {
            URL.revokeObjectURL(this.sourceImageUrl);
        }
        
        // Clear stored data
        this.sourceImage = null;
        this.sourceImageUrl = null;
        this.sourceImageData = null;
        this.transferDescription = '';
        
        // Hide preview
        if (this.elements.preview) {
            this.elements.preview.style.display = 'none';
        }
        
        // Hide description section
        if (this.elements.descriptionSection) {
            this.elements.descriptionSection.style.display = 'none';
        }
        
        // Clear description input
        if (this.elements.descriptionInput) {
            this.elements.descriptionInput.value = '';
            this.elements.descriptionInput.disabled = true;
        }
        
        // Reset file input
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
        
        // Update button states
        this.updateButtonStates();
        
        // Clear status
        this.showStatus('', 'info');
    }
    
    /**
     * Update button states based on current state
     */
    updateButtonStates() {
        // Analyze button: enabled if source image exists
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.disabled = !this.sourceImageData;
        }
        
        // Transfer button: enabled if source image AND description exist
        const hasDescription = this.transferDescription && this.transferDescription.trim().length > 0;
        if (this.elements.transferBtn) {
            this.elements.transferBtn.disabled = !this.sourceImageData || !hasDescription;
        }
    }
    
    /**
     * Show status message
     * @param {string} message - Status message
     * @param {string} type - Status type (info, success, error, analyzing, transferring)
     */
    showStatus(message, type = 'info') {
        if (!this.elements.status) return;
        
        this.elements.status.textContent = message;
        
        // Remove all status classes
        this.elements.status.className = 'generation-status';
        
        // Add appropriate class
        if (type) {
            this.elements.status.classList.add(`status-${type}`);
        }
        
        // Auto-clear success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (this.elements.status.classList.contains('status-success')) {
                    this.elements.status.textContent = '';
                    this.elements.status.className = 'generation-status';
                }
            }, 3000);
        }
    }
    
    /**
     * Analyze source image using AI
     */
    async analyzeSourceImage() {
        if (!this.sourceImageData) {
            this.showStatus('Please upload a source image first', 'error');
            return;
        }

        // Check if API key is set
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            this.showStatus('Please set your Gemini API key first', 'error');
            return;
        }

        try {
            // Disable analyze button and add loading state
            if (this.elements.analyzeBtn) {
                this.elements.analyzeBtn.disabled = true;
                this.elements.analyzeBtn.classList.add('loading');
            }

            // Show analyzing status
            this.showStatus('Analyzing image...', 'analyzing');

            console.log('🔍 [OBJECT TRANSFER] Starting AI analysis...');

            // Call Gemini API to analyze the image
            const description = await this.app.modules.gemini.analyzeImageForTransfer(
                this.sourceImageData,
                '' // No hint - let AI identify the main object
            );

            // Populate textarea with the description
            if (this.elements.descriptionInput) {
                this.elements.descriptionInput.value = description;
                this.transferDescription = description;
            }

            // Update button states
            this.updateButtonStates();

            // Show success status
            this.showStatus('✅ Analysis complete! Review and edit the description if needed.', 'success');

            console.log('✅ [OBJECT TRANSFER] Analysis complete');

        } catch (error) {
            console.error('❌ [OBJECT TRANSFER] Analysis failed:', error);

            // Show error message
            let errorMessage = 'Analysis failed. ';
            if (error.message.includes('API key')) {
                errorMessage += 'Please check your API key.';
            } else if (error.message.includes('quota')) {
                errorMessage += 'API quota exceeded.';
            } else {
                errorMessage += 'Please try again.';
            }

            this.showStatus(errorMessage, 'error');

        } finally {
            // Re-enable analyze button and remove loading state
            if (this.elements.analyzeBtn) {
                this.elements.analyzeBtn.disabled = false;
                this.elements.analyzeBtn.classList.remove('loading');
            }
        }
    }
    
    /**
     * Perform object transfer
     */
    async performObjectTransfer() {
        // Validate prerequisites
        if (!this.sourceImageData) {
            this.showStatus('Please upload a source image first', 'error');
            return;
        }

        if (!this.transferDescription || this.transferDescription.trim().length === 0) {
            this.showStatus('Please provide a transfer description', 'error');
            return;
        }

        // Check if there's an image on the canvas
        const canvasImageData = await this.getCanvasImageData();
        if (!canvasImageData) {
            this.showStatus('Please load an image onto the canvas first', 'error');
            return;
        }

        // Check if API key is set
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            this.showStatus('Please set your Gemini API key first', 'error');
            return;
        }

        try {
            // Disable transfer button and add loading state
            if (this.elements.transferBtn) {
                this.elements.transferBtn.disabled = true;
                this.elements.transferBtn.classList.add('loading');
            }

            console.log('✨ [OBJECT TRANSFER] Starting object transfer...');

            // Step 1: Get canvas dimensions
            this.showStatus('Preparing images...', 'transferring');
            const canvasDimensions = this.getCanvasDimensions();
            if (!canvasDimensions) {
                throw new Error('Failed to get canvas dimensions');
            }

            console.log(`📐 [OBJECT TRANSFER] Canvas dimensions: ${canvasDimensions.width}x${canvasDimensions.height}`);

            // Step 2: Pad source image to match canvas aspect ratio
            this.showStatus('Matching aspect ratios...', 'transferring');
            const paddedSourceData = await this.padImageToAspectRatio(
                this.sourceImage,
                canvasDimensions.width,
                canvasDimensions.height,
                '#FFFFFF'  // White padding
            );

            // Step 3: Perform the transfer via Gemini API
            this.showStatus('Transferring object...', 'transferring');
            console.log('📤 [OBJECT TRANSFER] Calling Gemini API for transfer...');

            const resultDataUrl = await this.app.modules.gemini.objectTransfer(
                canvasImageData,
                paddedSourceData,
                this.transferDescription
            );

            // Step 4: Load result onto canvas
            this.showStatus('Loading result...', 'transferring');
            console.log('🖼️ [OBJECT TRANSFER] Loading result onto canvas...');

            // Load onto canvas using the editor
            if (this.app.modules.editor) {
                await this.app.modules.editor.loadImage(resultDataUrl);
            } else {
                // Create editor if it doesn't exist
                await this.app.createKonvaEditor(resultDataUrl);
            }

            // Step 5: Add to gallery
            if (this.app.modules.gallery) {
                const prompt = `Object Transfer: ${this.transferDescription.substring(0, 50)}...`;
                const metadata = { timestamp: Date.now() };
                this.app.modules.gallery.addImage(resultDataUrl, prompt, metadata);
            }

            // Show success
            this.showStatus('✅ Transfer complete! Result loaded onto canvas.', 'success');
            console.log('✅ [OBJECT TRANSFER] Transfer complete!');

        } catch (error) {
            console.error('❌ [OBJECT TRANSFER] Transfer failed:', error);

            // Show error message
            let errorMessage = 'Transfer failed. ';
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
            // Re-enable transfer button and remove loading state
            if (this.elements.transferBtn) {
                this.elements.transferBtn.disabled = false;
                this.elements.transferBtn.classList.remove('loading');
            }

            // Update button states
            this.updateButtonStates();
        }
    }
    
    /**
     * Pad image to match aspect ratio
     * This is critical for the hybrid approach - ensures both images have the same aspect ratio
     * to prevent the Gemini API from distorting the base image
     * @param {HTMLImageElement} image - Image to pad
     * @param {number} targetWidth - Target width
     * @param {number} targetHeight - Target height
     * @param {string} paddingColor - Padding color (default: white)
     * @returns {Promise<string>} Base64 encoded padded image (without data URL prefix)
     */
    async padImageToAspectRatio(image, targetWidth, targetHeight, paddingColor = '#FFFFFF') {
        console.log('📐 [OBJECT TRANSFER] Padding image to aspect ratio...');
        console.log(`   Source: ${image.width}x${image.height}`);
        console.log(`   Target: ${targetWidth}x${targetHeight}`);

        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas to target dimensions
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Fill with padding color
                ctx.fillStyle = paddingColor;
                ctx.fillRect(0, 0, targetWidth, targetHeight);

                // Calculate scaling to fit image inside canvas while maintaining aspect ratio
                const imageAspect = image.width / image.height;
                const targetAspect = targetWidth / targetHeight;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (imageAspect > targetAspect) {
                    // Image is wider - fit to width
                    drawWidth = targetWidth;
                    drawHeight = targetWidth / imageAspect;
                    offsetX = 0;
                    offsetY = (targetHeight - drawHeight) / 2;
                } else {
                    // Image is taller - fit to height
                    drawHeight = targetHeight;
                    drawWidth = targetHeight * imageAspect;
                    offsetX = (targetWidth - drawWidth) / 2;
                    offsetY = 0;
                }

                console.log(`   Draw size: ${Math.round(drawWidth)}x${Math.round(drawHeight)}`);
                console.log(`   Offset: (${Math.round(offsetX)}, ${Math.round(offsetY)})`);

                // Draw image centered
                ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

                // Return as base64 (without data URL prefix)
                const dataUrl = canvas.toDataURL('image/png');
                const base64 = dataUrl.split(',')[1];

                console.log('✅ [OBJECT TRANSFER] Image padded successfully');
                resolve(base64);

            } catch (error) {
                console.error('❌ [OBJECT TRANSFER] Failed to pad image:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Get canvas image data (helper method)
     * @returns {Promise<string|null>} Base64 encoded canvas image
     */
    async getCanvasImageData() {
        if (!this.app.modules.editor) return null;
        return await this.app.modules.editor.getImageAsBase64();
    }
    
    /**
     * Get canvas dimensions (helper method)
     * @returns {{width: number, height: number}|null}
     */
    getCanvasDimensions() {
        if (!this.app.modules.editor || !this.app.modules.editor.imageNode) return null;
        
        const imageNode = this.app.modules.editor.imageNode;
        return {
            width: imageNode.width(),
            height: imageNode.height()
        };
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectTransferManager;
}

