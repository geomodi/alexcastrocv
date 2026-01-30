/**
 * Gallery Manager Module
 * Handles storage, retrieval, and management of generated images
 * Stores images in localStorage with metadata (prompt, date, etc.)
 */

class GalleryManager {
    constructor(app) {
        this.app = app;
        this.storageKey = 'ai-editor-gallery';
        this.maxImages = 30; // Maximum number of images to store (reduced to allow larger images)
        this.maxImageSize = 8 * 1024 * 1024; // 8MB per image (base64) - increased for high-res images
        this.images = [];
        this.activeImageId = null;

        this.loadGallery();
        console.log('🖼️ [GALLERY] Gallery Manager initialized with', this.images.length, 'images');
    }

    /**
     * Load gallery from localStorage
     */
    loadGallery() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.images = JSON.parse(stored);
                console.log('✅ [GALLERY] Loaded', this.images.length, 'images from storage');
            } else {
                this.images = [];
                console.log('📭 [GALLERY] No stored images found');
            }
        } catch (error) {
            console.error('❌ [GALLERY] Failed to load gallery:', error);
            this.images = [];
        }
    }

    /**
     * Save gallery to localStorage
     */
    saveGallery() {
        try {
            const data = JSON.stringify(this.images);
            localStorage.setItem(this.storageKey, data);
            console.log('💾 [GALLERY] Saved', this.images.length, 'images to storage');
        } catch (error) {
            console.error('❌ [GALLERY] Failed to save gallery:', error);
            
            // If storage is full, try removing oldest images
            if (error.name === 'QuotaExceededError') {
                console.warn('⚠️ [GALLERY] Storage quota exceeded, removing oldest images...');
                this.removeOldestImages(5);
                this.saveGallery(); // Retry
            }
        }
    }

    /**
     * Add a new image to the gallery
     * @param {string} imageUrl - Blob URL or data URL of the image
     * @param {string} prompt - The prompt used to generate the image
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<string>} The ID of the saved image
     */
    async addImage(imageUrl, prompt = '', metadata = {}) {
        try {
            console.log('➕ [GALLERY] Adding new image to gallery...');

            // Convert Blob URL to base64 for storage
            let base64Data;
            if (imageUrl.startsWith('blob:')) {
                base64Data = await this.blobUrlToBase64(imageUrl);
            } else if (imageUrl.startsWith('data:')) {
                base64Data = imageUrl;
            } else {
                throw new Error('Invalid image URL format');
            }

            const originalSize = (base64Data.length / 1024 / 1024).toFixed(2);
            console.log(`📊 [GALLERY] Original image size: ${originalSize}MB (max allowed: ${(this.maxImageSize / 1024 / 1024).toFixed(0)}MB)`);

            // Check size - only compress if exceeds max
            if (base64Data.length > this.maxImageSize) {
                console.warn(`⚠️ [GALLERY] Image too large (${originalSize}MB > ${(this.maxImageSize / 1024 / 1024).toFixed(0)}MB), compressing...`);
                base64Data = await this.compressImage(base64Data);
                console.log(`✅ [GALLERY] Compressed to: ${(base64Data.length / 1024 / 1024).toFixed(2)}MB`);
            } else {
                console.log(`✅ [GALLERY] Image size OK, no compression needed`);
            }

            // Create image entry
            const imageEntry = {
                id: this.generateId(),
                dataUrl: base64Data,
                prompt: prompt,
                timestamp: Date.now(),
                date: new Date().toISOString(),
                ...metadata
            };

            // Add to beginning of array (newest first)
            this.images.unshift(imageEntry);

            // Enforce max images limit
            if (this.images.length > this.maxImages) {
                console.warn('⚠️ [GALLERY] Max images reached, removing oldest...');
                this.images = this.images.slice(0, this.maxImages);
            }

            // Save to localStorage
            this.saveGallery();

            console.log('✅ [GALLERY] Image added successfully, ID:', imageEntry.id);
            return imageEntry.id;

        } catch (error) {
            console.error('❌ [GALLERY] Failed to add image:', error);
            throw error;
        }
    }

    /**
     * Get an image by ID
     * @param {string} id - Image ID
     * @returns {Object|null} Image entry or null
     */
    getImage(id) {
        return this.images.find(img => img.id === id) || null;
    }

    /**
     * Get all images
     * @returns {Array} Array of image entries
     */
    getAllImages() {
        return this.images;
    }

    /**
     * Delete an image by ID
     * @param {string} id - Image ID
     * @returns {boolean} Success status
     */
    deleteImage(id) {
        try {
            const index = this.images.findIndex(img => img.id === id);
            if (index !== -1) {
                this.images.splice(index, 1);
                this.saveGallery();
                console.log('🗑️ [GALLERY] Image deleted:', id);
                
                // Clear active image if it was deleted
                if (this.activeImageId === id) {
                    this.activeImageId = null;
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ [GALLERY] Failed to delete image:', error);
            return false;
        }
    }

    /**
     * Clear all images from gallery
     */
    clearGallery() {
        try {
            this.images = [];
            this.activeImageId = null;
            this.saveGallery();
            console.log('🗑️ [GALLERY] Gallery cleared');
        } catch (error) {
            console.error('❌ [GALLERY] Failed to clear gallery:', error);
        }
    }

    /**
     * Set the active image ID
     * @param {string} id - Image ID
     */
    setActiveImage(id) {
        this.activeImageId = id;
        console.log('🎯 [GALLERY] Active image set to:', id);
    }

    /**
     * Get the active image ID
     * @returns {string|null} Active image ID
     */
    getActiveImageId() {
        return this.activeImageId;
    }

    /**
     * Remove oldest images
     * @param {number} count - Number of images to remove
     */
    removeOldestImages(count) {
        const removed = this.images.splice(-count);
        console.log('🗑️ [GALLERY] Removed', removed.length, 'oldest images');
    }

    /**
     * Convert Blob URL to base64 data URL
     * @param {string} blobUrl - Blob URL
     * @returns {Promise<string>} Base64 data URL
     */
    async blobUrlToBase64(blobUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Don't set crossOrigin for Blob URLs - it causes CORS errors

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const dataUrl = canvas.toDataURL('image/png');
                    console.log('✅ [GALLERY] Converted Blob URL to base64, length:', dataUrl.length);
                    resolve(dataUrl);
                } catch (error) {
                    console.error('❌ [GALLERY] Failed to convert to canvas:', error);
                    reject(error);
                }
            };

            img.onerror = (error) => {
                console.error('❌ [GALLERY] Failed to load image from Blob URL:', error);
                reject(new Error('Failed to load image from Blob URL'));
            };

            img.src = blobUrl;
        });
    }

    /**
     * Compress image to reduce storage size
     * @param {string} dataUrl - Data URL
     * @returns {Promise<string>} Compressed data URL
     */
    async compressImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');

                // Preserve higher resolution - only reduce if extremely large
                let width = img.width;
                let height = img.height;
                const maxDimension = 2048; // Increased from 1024 to preserve 2K images

                if (width > maxDimension || height > maxDimension) {
                    const scale = maxDimension / Math.max(width, height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                    console.log(`📐 [GALLERY] Resizing from ${img.width}x${img.height} to ${width}x${height}`);
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Use JPEG with quality 0.92 for better quality (slight compression trade-off)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
                console.log(`📦 [GALLERY] Compressed: ${(dataUrl.length / 1024 / 1024).toFixed(2)}MB → ${(compressedDataUrl.length / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedDataUrl);
            };

            img.onerror = () => reject(new Error('Failed to compress image'));
            img.src = dataUrl;
        });
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get gallery statistics
     * @returns {Object} Statistics
     */
    getStats() {
        const totalSize = this.images.reduce((sum, img) => sum + img.dataUrl.length, 0);
        return {
            count: this.images.length,
            totalSize: totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            maxImages: this.maxImages
        };
    }
}

