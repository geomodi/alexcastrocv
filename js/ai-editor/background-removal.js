/**
 * Background Removal Module
 * Handles background removal using @imgly/background-removal library
 * Integrates with Konva.js for seamless image editing
 */

class BackgroundRemovalManager {
    constructor(app) {
        this.app = app;
        this.isProcessing = false;
        this.imglyRemoveBackground = null;
        
        console.log('✂️ [BG REMOVAL] Background Removal Manager initialized');
    }

    /**
     * Load the @imgly/background-removal library from CDN
     * @returns {Promise<void>}
     */
    async loadLibrary() {
        try {
            if (this.imglyRemoveBackground) {
                console.log('✂️ [BG REMOVAL] Library already loaded');
                return;
            }

            console.log('✂️ [BG REMOVAL] Loading library from CDN...');

            // Import from CDN using dynamic import
            // The library exports 'removeBackground' as a named export, not default
            const module = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm');

            // Extract the removeBackground function (it's a named export)
            this.imglyRemoveBackground = module.removeBackground || module.default;

            console.log('✅ [BG REMOVAL] Library loaded successfully');
            console.log('🔍 [BG REMOVAL] Function type:', typeof this.imglyRemoveBackground);
        } catch (error) {
            console.error('❌ [BG REMOVAL] Failed to load library:', error);
            throw new Error('Failed to load background removal library. Please check your internet connection.');
        }
    }

    /**
     * Remove background from the current image on canvas
     * @returns {Promise<void>}
     */
    async removeBackground() {
        try {
            // Validate prerequisites - check if layer manager exists
            if (!this.app.modules.editor || !this.app.modules.editor.layerManager) {
                throw new Error('No image loaded. Please load an image first.');
            }

            // Get the currently active layer
            const activeLayer = this.app.modules.editor.layerManager.getActiveLayer();
            if (!activeLayer) {
                throw new Error('No active layer found. Please select a layer first.');
            }

            // Get the image node from the active layer
            const imageNode = activeLayer.konvaLayer.findOne('Image');
            if (!imageNode) {
                throw new Error('No image found in the active layer.');
            }

            if (this.isProcessing) {
                throw new Error('Background removal is already in progress');
            }

            this.isProcessing = true;

            // Show loading overlay
            this.app.modules.ui.showLoading(
                'Removing Background...',
                'This may take 5-10 seconds depending on image size and your device performance'
            );

            console.log('✂️ [BG REMOVAL] Starting background removal process...');
            console.log('✂️ [BG REMOVAL] Active layer:', activeLayer.name, '(ID:', activeLayer.id + ')');

            // Load library if not already loaded
            await this.loadLibrary();

            // Get current image as data URL from the active layer's image node
            const dataURL = imageNode.toDataURL({
                mimeType: 'image/png',
                quality: 1,
                pixelRatio: 1
            });

            console.log('✂️ [BG REMOVAL] Extracted image data from active layer, processing...');

            // Update loading message
            this.app.modules.ui.updateLoadingMessage(
                'Processing Image...',
                'AI is analyzing the image and removing the background'
            );

            // Remove background using imgly
            const blob = await this.imglyRemoveBackground(dataURL, {
                progress: (key, current, total) => {
                    const percentage = Math.round((current / total) * 100);
                    console.log(`✂️ [BG REMOVAL] Progress: ${key} - ${percentage}%`);
                    
                    // Update loading message with progress
                    this.app.modules.ui.updateLoadingMessage(
                        'Processing Image...',
                        `${key}: ${percentage}%`
                    );
                }
            });

            console.log('✅ [BG REMOVAL] Background removed successfully');

            // Update loading message
            this.app.modules.ui.updateLoadingMessage(
                'Applying Result...',
                'Loading the processed image back to canvas'
            );

            // Convert blob to data URL
            const resultDataURL = await this.blobToDataURL(blob);

            // Load the result back into Konva
            await this.loadResultToCanvas(resultDataURL);

            // Save to history
            this.app.modules.editor.saveState();

            console.log('✅ [BG REMOVAL] Result applied to canvas');

            // Hide loading overlay
            this.app.modules.ui.hideLoading();

            // Show success message
            this.app.modules.ui.showStatus('Background removed successfully!', 'success');

        } catch (error) {
            console.error('❌ [BG REMOVAL] Error:', error);
            
            // Hide loading overlay
            this.app.modules.ui.hideLoading();
            
            // Show error message
            this.app.modules.ui.showStatus(
                `Background removal failed: ${error.message}`,
                'error'
            );
            
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Convert Blob to Data URL
     * @param {Blob} blob - The blob to convert
     * @returns {Promise<string>} Data URL
     */
    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Load the processed image back to Konva canvas
     * @param {string} dataURL - The processed image data URL
     * @returns {Promise<void>}
     */
    loadResultToCanvas(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                try {
                    // Get the currently active layer
                    const activeLayer = this.app.modules.editor.layerManager.getActiveLayer();
                    if (!activeLayer) {
                        throw new Error('No active layer found');
                    }

                    // Get the image node from the active layer
                    const imageNode = activeLayer.konvaLayer.findOne('Image');
                    if (!imageNode) {
                        throw new Error('No image found in the active layer');
                    }

                    // Store current position and scale
                    const currentX = imageNode.x();
                    const currentY = imageNode.y();
                    const currentScaleX = imageNode.scaleX();
                    const currentScaleY = imageNode.scaleY();
                    const currentRotation = imageNode.rotation();

                    // Update image
                    imageNode.image(img);

                    // Restore position and scale
                    imageNode.x(currentX);
                    imageNode.y(currentY);
                    imageNode.scaleX(currentScaleX);
                    imageNode.scaleY(currentScaleY);
                    imageNode.rotation(currentRotation);

                    // Re-cache if filters are applied
                    if (this.app.modules.editor.hasActiveFilters()) {
                        imageNode.cache();
                        this.app.modules.editor.applyFilters();
                    }

                    // Redraw the active layer
                    activeLayer.konvaLayer.batchDraw();

                    // Update layer thumbnail (for layer panel)
                    this.app.modules.editor.layerManager.updateActiveLayerThumbnail();

                    console.log('✅ [BG REMOVAL] Image loaded to active layer:', activeLayer.name);
                    resolve();
                } catch (error) {
                    console.error('❌ [BG REMOVAL] Failed to load image to canvas:', error);
                    reject(error);
                }
            };

            img.onerror = (error) => {
                console.error('❌ [BG REMOVAL] Failed to load processed image:', error);
                reject(new Error('Failed to load processed image'));
            };

            img.src = dataURL;
        });
    }

    /**
     * Check if background removal is available
     * @returns {boolean}
     */
    isAvailable() {
        if (!this.app.modules.editor || !this.app.modules.editor.layerManager || this.isProcessing) {
            return false;
        }

        const activeLayer = this.app.modules.editor.layerManager.getActiveLayer();
        if (!activeLayer) {
            return false;
        }

        const imageNode = activeLayer.konvaLayer.findOne('Image');
        return imageNode !== null && imageNode !== undefined;
    }

    /**
     * Get processing status
     * @returns {boolean}
     */
    getProcessingStatus() {
        return this.isProcessing;
    }
}

