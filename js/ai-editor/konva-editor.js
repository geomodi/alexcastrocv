/**
 * Konva Editor - Handles canvas-based image editing using Konva.js
 * Provides image loading, manipulation, and export functionality
 */

class KonvaEditor {
    constructor(app) {
        this.app = app;
        this.stage = null;
        this.layerManager = null; // NEW: Layer manager instance
        this.layer = null; // DEPRECATED: Will be replaced by layerManager.getActiveLayer()
        this.imageNode = null;
        this.transformer = null;
        this.history = [];
        this.historyStep = -1;
        this.maxHistorySteps = 50;

        // Filter state
        this.filterState = {
            brightness: 1,
            contrast: 0,
            blur: 0,
            saturation: 0,
            hue: 0,
            luminance: 0,
            pixelate: 1,
            noise: 0,
            grayscale: false,
            sepia: false,
            invert: false,
            emboss: false,
            posterize: false,
            solarize: false,
            enhance: false
        };

        // Drawing state
        this.drawingState = {
            activeTool: null,
            isDrawing: false,
            strokeColor: '#00d4ff',
            fillColor: '#00d4ff',
            enableFill: false,
            strokeWidth: 3,
            fontSize: 32,
            opacity: 0.5,
            currentLine: null,
            currentShape: null
        };

        // Drawing layer (separate from image layer)
        this.drawingLayer = null;

        // Drawing history (separate from main history)
        this.drawingHistory = [];
        this.drawingHistoryStep = -1;
        this.maxDrawingHistorySteps = 50;

        // Crop state
        this.cropState = {
            active: false,
            aspectRatio: 'free', // 'free', 1, 16/9, 9/16
            cropLayer: null,
            cropRect: null,
            cropTransformer: null,
            darkRects: [], // 4 overlay rectangles
            previousTool: null
        };

        // Window dimensions for resize detection
        this.lastWindowWidth = window.innerWidth;
        this.lastWindowHeight = window.innerHeight;

        console.log('🎨 [KONVA] Konva Editor initialized');
    }

    /**
     * Initialize the Konva stage and layers
     */
    async init() {
        try {
            console.log('🎨 [KONVA] Initializing Konva stage...');
            
            if (typeof Konva === 'undefined') {
                throw new Error('Konva.js is not loaded');
            }

            const container = document.getElementById('konvaContainer');
            if (!container) {
                throw new Error('Konva container not found');
            }

            // Hide placeholder
            const placeholder = document.getElementById('canvasPlaceholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }

            // Calculate container dimensions with better fallbacks
            const containerRect = container.getBoundingClientRect();
            const width = Math.max(containerRect.width || 800, 400);
            const height = Math.max(containerRect.height || 600, 400);

            // Create Konva stage
            this.stage = new Konva.Stage({
                container: 'konvaContainer',
                width: width,
                height: height,
                draggable: false
            });

            // Create LayerManager
            this.layerManager = new LayerManager(this.stage);

            // Create main layer for image (will be managed by LayerManager)
            this.layer = new Konva.Layer();
            this.stage.add(this.layer);

            // Initialize LayerManager with base layer
            this.layerManager.initializeWithBaseLayer(this.layer, 'Background');

            // Create drawing layer (on top of image layer)
            this.drawingLayer = new Konva.Layer();
            this.stage.add(this.drawingLayer);

            // Create transformer for object manipulation
            this.transformer = new Konva.Transformer({
                nodes: [],
                keepRatio: true,
                enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                borderStroke: '#00d4ff',
                borderStrokeWidth: 2,
                anchorStroke: '#00d4ff',
                anchorFill: '#ffffff',
                anchorSize: 8
            });
            this.drawingLayer.add(this.transformer);

            // Setup event listeners
            this.setupEventListeners();

            // Initialize history
            this.saveState();

            // Initialize drawing history
            this.saveDrawingState();

            console.log('✅ [KONVA] Konva stage initialized successfully');
        } catch (error) {
            console.error('❌ [KONVA] Failed to initialize Konva stage:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners for the stage
     */
    setupEventListeners() {
        // Click on empty area to deselect
        this.stage.on('click tap', (e) => {
            if (e.target === this.stage) {
                this.transformer.nodes([]);
                this.layer.batchDraw();
            }
        });

        // Handle object selection
        this.stage.on('click tap', (e) => {
            if (e.target !== this.stage && e.target.draggable) {
                this.transformer.nodes([e.target]);
                this.layer.batchDraw();
            }
        });

        // Save state after transformations
        this.stage.on('dragend transformend', () => {
            this.saveState();
        });

        // Handle mouse wheel for zooming
        this.stage.on('wheel', (e) => {
            e.evt.preventDefault();

            const oldScale = this.stage.scaleX();
            const pointer = this.stage.getPointerPosition();

            const mousePointTo = {
                x: (pointer.x - this.stage.x()) / oldScale,
                y: (pointer.y - this.stage.y()) / oldScale,
            };

            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const scaleBy = 1.1;
            const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            // Limit zoom levels
            const minScale = 0.1;
            const maxScale = 5;
            const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));

            this.stage.scale({ x: clampedScale, y: clampedScale });

            const newPos = {
                x: pointer.x - mousePointTo.x * clampedScale,
                y: pointer.y - mousePointTo.y * clampedScale,
            };

            this.stage.position(newPos);
            this.stage.batchDraw();

            // Update status bar with new zoom level
            this.updateStatusBar();
        });

        // Setup keyboard listener for delete key
        this.setupKeyboardListeners();
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardListeners() {
        // Store bound handler for cleanup
        this.keyboardHandler = (e) => {
            // Handle Delete or Backspace key
            if (e.key === 'Delete' || e.key === 'Backspace') {
                console.log('⌨️ [KONVA] Delete/Backspace key pressed');

                // Don't handle if user is typing in an input field
                const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
                if (isTyping) {
                    console.log('⌨️ [KONVA] Ignoring - user is typing in input field');
                    return;
                }

                // Check if we have an image to delete
                if (this.imageNode) {
                    e.preventDefault();
                    console.log('⌨️ [KONVA] Clearing canvas...');
                    this.clearCanvas();
                    console.log('🗑️ [KONVA] Image deleted via keyboard');
                } else {
                    console.log('⌨️ [KONVA] No image to delete');
                }
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);
        console.log('⌨️ [KONVA] Keyboard listeners initialized');
    }

    /**
     * Remove keyboard event listeners
     */
    removeKeyboardListeners() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
            console.log('⌨️ [KONVA] Keyboard listeners removed');
        }
    }

    /**
     * Clear the canvas and remove the current image
     */
    clearCanvas() {
        try {
            if (this.imageNode) {
                this.imageNode.destroy();
                this.imageNode = null;
            }

            // Clear transformer
            if (this.transformer) {
                this.transformer.nodes([]);
            }

            // Redraw layer
            if (this.layer) {
                this.layer.batchDraw();
            }

            // Show placeholder
            const placeholder = document.getElementById('canvasPlaceholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
            }

            // Update status bar to show no image
            this.updateStatusBar();

            // Notify app that image was cleared
            if (this.app && this.app.state) {
                this.app.state.currentImage = null;
            }

            // Update tools visibility
            if (this.app && this.app.updateToolsVisibility) {
                this.app.updateToolsVisibility(false);
            }

            // Update edit button state
            if (this.app && this.app.updateEditButtonState) {
                this.app.updateEditButtonState();
            }

            console.log('🗑️ [KONVA] Canvas cleared');
        } catch (error) {
            console.error('❌ [KONVA] Failed to clear canvas:', error);
        }
    }

    /**
     * Load an image into the canvas
     * @param {string} imageUrl - URL or base64 data of the image
     */
    async loadImage(imageUrl) {
        try {
            console.log('🖼️ [KONVA] Loading image into canvas...');
            console.log('🔍 [KONVA] Image URL type:', imageUrl ? imageUrl.substring(0, 50) : 'null');

            if (!this.stage || !this.layerManager) {
                throw new Error('Konva stage or LayerManager not initialized');
            }

            // Deactivate any active drawing tools
            if (this.drawingState.activeTool) {
                console.log('🔄 [KONVA] Deactivating drawing tool before loading new image');
                this.deactivateDrawingTool();
            }

            // Get active layer from LayerManager
            const activeLayerObj = this.layerManager.getActiveLayer();
            if (!activeLayerObj) {
                throw new Error('No active layer found');
            }
            this.layer = activeLayerObj.konvaLayer;

            // Reset crop state if active (prevents crop overlay from appearing on new images)
            if (this.cropState.active) {
                console.log('🔄 [KONVA] Resetting crop state before loading new image');
                this.cancelCrop();
            }

            // Always reset UI state when loading a new image (even if crop was already inactive)
            const cropActions = document.getElementById('cropActions');
            const cropRatioBtns = document.querySelectorAll('.crop-ratio-btn');

            if (cropActions) cropActions.style.display = 'none';
            cropRatioBtns.forEach(btn => btn.classList.remove('active'));

            // Remove existing image if any
            if (this.imageNode) {
                console.log('🔄 [KONVA] Removing existing image from layer');
                this.imageNode.destroy();
                this.imageNode = null;
            }

            // Track if we need to revoke a Blob URL later
            let processedUrl = imageUrl;
            let blobUrl = null;

            // Check if this is a Blob URL (starts with 'blob:')
            if (imageUrl.startsWith('blob:')) {
                console.log('🔗 [KONVA] Using Blob URL from API');
                blobUrl = imageUrl;
                processedUrl = imageUrl;
            } else {
                console.log('⚠️ [KONVA] Not a Blob URL, received:', imageUrl.substring(0, 100));
            }

            // Create image object
            const imageObj = new Image();
            imageObj.crossOrigin = 'anonymous';

            return new Promise((resolve, reject) => {
                imageObj.onload = () => {
                    try {
                        console.log('✅ [KONVA] Image object loaded, creating Konva node...');

                        // Revoke blob URL if created
                        if (blobUrl) {
                            URL.revokeObjectURL(blobUrl);
                        }

                        // Verify layer still exists
                        if (!this.layer) {
                            throw new Error('Layer reference lost during image load');
                        }

                        // Create Konva image node
                        this.imageNode = new Konva.Image({
                            image: imageObj,
                            draggable: true,
                            name: 'mainImage'
                        });

                        // Calculate scaling to fit the stage
                        const scale = this.calculateImageScale(imageObj.width, imageObj.height);
                        this.imageNode.scale({ x: scale, y: scale });

                        // Center the image
                        this.centerImage();

                        // Add to layer
                        this.layer.add(this.imageNode);
                        this.layer.batchDraw();

                        // Update layer thumbnail (for layer panel)
                        if (this.layerManager) {
                            this.layerManager.updateActiveLayerThumbnail();
                        }

                        // Save state
                        this.saveState();

                        // Update status bar with image info
                        this.updateStatusBar();

                        console.log('✅ [KONVA] Image loaded successfully');
                        resolve();
                    } catch (error) {
                        console.error('❌ [KONVA] Error creating Konva image:', error);
                        reject(error);
                    }
                };

                imageObj.onerror = (err) => {
                    // Revoke blob URL if created
                    if (blobUrl) {
                        URL.revokeObjectURL(blobUrl);
                    }
                    console.error('❌ [KONVA] Failed to load image object:', err);
                    reject(new Error('Failed to load image'));
                };

                console.log('🔄 [KONVA] Setting image src...');
                imageObj.src = processedUrl;
            });
        } catch (error) {
            console.error('❌ [KONVA] Failed to load image:', error);
            throw error;
        }
    }

    /**
     * Load an image into a specific layer
     * @param {string} imageUrl - URL or base64 data of the image
     * @param {string} layerId - ID of the layer to load the image into
     */
    async loadImageIntoLayer(imageUrl, layerId) {
        try {
            console.log('🖼️ [KONVA] Loading image into layer:', layerId);

            if (!this.stage || !this.layerManager) {
                throw new Error('Konva stage or LayerManager not initialized');
            }

            // Get the target layer
            const layerObj = this.layerManager.getLayer(layerId);
            if (!layerObj) {
                throw new Error(`Layer ${layerId} not found`);
            }

            const targetLayer = layerObj.konvaLayer;

            // Create image object
            const imageObj = new Image();
            imageObj.crossOrigin = 'anonymous';

            return new Promise((resolve, reject) => {
                imageObj.onload = () => {
                    try {
                        console.log('✅ [KONVA] Image object loaded, creating Konva node for layer...');

                        // Create Konva image node
                        const imageNode = new Konva.Image({
                            image: imageObj,
                            draggable: true,
                            name: 'layerImage'
                        });

                        // Calculate scaling to fit the stage
                        const scale = this.calculateImageScale(imageObj.width, imageObj.height);
                        imageNode.scale({ x: scale, y: scale });

                        // Center the image
                        const stageWidth = this.stage.width();
                        const stageHeight = this.stage.height();
                        const imageWidth = imageNode.width() * imageNode.scaleX();
                        const imageHeight = imageNode.height() * imageNode.scaleY();

                        imageNode.position({
                            x: (stageWidth - imageWidth) / 2,
                            y: (stageHeight - imageHeight) / 2
                        });

                        // Add to target layer
                        targetLayer.add(imageNode);
                        targetLayer.batchDraw();

                        // Store reference to the image node (for status bar and other operations)
                        this.imageNode = imageNode;

                        // Update layer thumbnail
                        if (this.layerManager) {
                            this.layerManager.updateLayerThumbnail(layerId);
                        }

                        // Save state
                        this.saveState();

                        // Update status bar with image info
                        this.updateStatusBar();

                        console.log('✅ [KONVA] Image loaded into layer successfully');
                        resolve();
                    } catch (error) {
                        console.error('❌ [KONVA] Error creating Konva image for layer:', error);
                        reject(error);
                    }
                };

                imageObj.onerror = (err) => {
                    console.error('❌ [KONVA] Failed to load image object:', err);
                    reject(new Error('Failed to load image'));
                };

                console.log('🔄 [KONVA] Setting image src for layer...');
                imageObj.src = imageUrl;
            });
        } catch (error) {
            console.error('❌ [KONVA] Failed to load image into layer:', error);
            throw error;
        }
    }

    /**
     * Calculate appropriate scale for image to fit stage
     * @param {number} imageWidth - Original image width
     * @param {number} imageHeight - Original image height
     * @returns {number} Scale factor
     */
    calculateImageScale(imageWidth, imageHeight) {
        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();

        const scaleX = (stageWidth * 0.8) / imageWidth;
        const scaleY = (stageHeight * 0.8) / imageHeight;

        return Math.min(scaleX, scaleY);
    }

    /**
     * Center the image on the stage
     */
    centerImage() {
        if (!this.imageNode) return;
        
        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();
        
        const imageWidth = this.imageNode.width() * this.imageNode.scaleX();
        const imageHeight = this.imageNode.height() * this.imageNode.scaleY();
        
        this.imageNode.position({
            x: (stageWidth - imageWidth) / 2,
            y: (stageHeight - imageHeight) / 2
        });
    }

    /**
     * Zoom in
     */
    zoomIn() {
        const oldScale = this.stage.scaleX();
        const newScale = Math.min(oldScale * 1.2, 5);
        
        this.stage.scale({ x: newScale, y: newScale });
        this.stage.batchDraw();
    }

    /**
     * Zoom out
     */
    zoomOut() {
        const oldScale = this.stage.scaleX();
        const newScale = Math.max(oldScale / 1.2, 0.1);
        
        this.stage.scale({ x: newScale, y: newScale });
        this.stage.batchDraw();
    }

    /**
     * Fit image to screen
     */
    fitToScreen() {
        if (!this.imageNode) return;
        
        const scale = this.calculateImageScale(
            this.imageNode.width(),
            this.imageNode.height()
        );
        
        this.stage.scale({ x: 1, y: 1 });
        this.stage.position({ x: 0, y: 0 });
        this.imageNode.scale({ x: scale, y: scale });
        this.centerImage();
        this.stage.batchDraw();
    }

    /**
     * Reset view to default
     */
    resetView() {
        this.stage.scale({ x: 1, y: 1 });
        this.stage.position({ x: 0, y: 0 });
        
        if (this.imageNode) {
            const scale = this.calculateImageScale(
                this.imageNode.width(),
                this.imageNode.height()
            );
            this.imageNode.scale({ x: scale, y: scale });
            this.centerImage();
        }
        
        this.stage.batchDraw();
    }

    /**
     * Rotate image 90 degrees clockwise
     */
    rotateCW() {
        if (!this.imageNode) {
            console.warn('⚠️ [KONVA] No image to rotate');
            return;
        }

        const currentRotation = this.imageNode.rotation();
        this.imageNode.rotation(currentRotation + 90);
        this.centerImage();
        this.stage.batchDraw();
        this.saveState();

        console.log('🔄 [KONVA] Rotated 90° clockwise');
    }

    /**
     * Rotate image 90 degrees counter-clockwise
     */
    rotateCCW() {
        if (!this.imageNode) {
            console.warn('⚠️ [KONVA] No image to rotate');
            return;
        }

        const currentRotation = this.imageNode.rotation();
        this.imageNode.rotation(currentRotation - 90);
        this.centerImage();
        this.stage.batchDraw();
        this.saveState();

        console.log('🔄 [KONVA] Rotated 90° counter-clockwise');
    }

    /**
     * Rotate image 180 degrees
     */
    rotate180() {
        if (!this.imageNode) {
            console.warn('⚠️ [KONVA] No image to rotate');
            return;
        }

        const currentRotation = this.imageNode.rotation();
        this.imageNode.rotation(currentRotation + 180);
        this.centerImage();
        this.stage.batchDraw();
        this.saveState();

        console.log('🔄 [KONVA] Rotated 180°');
    }

    /**
     * Flip image horizontally
     */
    flipHorizontal() {
        if (!this.imageNode) {
            console.warn('⚠️ [KONVA] No image to flip');
            return;
        }

        const currentScaleX = this.imageNode.scaleX();
        this.imageNode.scaleX(currentScaleX * -1);
        this.stage.batchDraw();
        this.saveState();

        console.log('↔️ [KONVA] Flipped horizontally');
    }

    /**
     * Flip image vertically
     */
    flipVertical() {
        if (!this.imageNode) {
            console.warn('⚠️ [KONVA] No image to flip');
            return;
        }

        const currentScaleY = this.imageNode.scaleY();
        this.imageNode.scaleY(currentScaleY * -1);
        this.stage.batchDraw();
        this.saveState();

        console.log('↕️ [KONVA] Flipped vertically');
    }

    /**
     * Resize image to specific dimensions
     * @param {number} width - New width
     * @param {number} height - New height
     * @param {boolean} lockAspectRatio - Whether to maintain aspect ratio
     */
    resizeImage(width, height, lockAspectRatio = true) {
        if (!this.imageNode) {
            console.warn('⚠️ [KONVA] No image to resize');
            return;
        }

        const originalWidth = this.imageNode.width();
        const originalHeight = this.imageNode.height();

        if (lockAspectRatio) {
            const aspectRatio = originalWidth / originalHeight;

            // Calculate new dimensions maintaining aspect ratio
            if (width / height > aspectRatio) {
                width = height * aspectRatio;
            } else {
                height = width / aspectRatio;
            }
        }

        // Calculate new scale
        const scaleX = width / originalWidth;
        const scaleY = height / originalHeight;

        this.imageNode.scale({ x: scaleX, y: scaleY });
        this.centerImage();
        this.stage.batchDraw();
        this.saveState();

        console.log(`📏 [KONVA] Resized to ${Math.round(width)}x${Math.round(height)}`);
    }

    /**
     * Apply all active filters to the image
     */
    applyFilters() {
        if (!this.imageNode) {
            console.warn('⚠️ [KONVA] No image to apply filters to');
            return;
        }

        // Cache the image for filter application
        this.imageNode.cache();

        // Build filter array based on current state
        const filters = [];

        // Brightness (CSS-compatible)
        if (this.filterState.brightness !== 1) {
            filters.push(Konva.Filters.Brightness);
        }

        // Contrast
        if (this.filterState.contrast !== 0) {
            filters.push(Konva.Filters.Contrast);
        }

        // Blur
        if (this.filterState.blur > 0) {
            filters.push(Konva.Filters.Blur);
        }

        // HSL (Hue, Saturation, Luminance)
        if (this.filterState.saturation !== 0 || this.filterState.hue !== 0 || this.filterState.luminance !== 0) {
            filters.push(Konva.Filters.HSL);
        }

        // Pixelate
        if (this.filterState.pixelate > 1) {
            filters.push(Konva.Filters.Pixelate);
        }

        // Noise
        if (this.filterState.noise > 0) {
            filters.push(Konva.Filters.Noise);
        }

        // Toggle filters
        if (this.filterState.grayscale) {
            filters.push(Konva.Filters.Grayscale);
        }

        if (this.filterState.sepia) {
            filters.push(Konva.Filters.Sepia);
        }

        if (this.filterState.invert) {
            filters.push(Konva.Filters.Invert);
        }

        if (this.filterState.emboss) {
            filters.push(Konva.Filters.Emboss);
        }

        if (this.filterState.posterize) {
            filters.push(Konva.Filters.Posterize);
        }

        if (this.filterState.solarize) {
            filters.push(Konva.Filters.Solarize);
        }

        if (this.filterState.enhance) {
            filters.push(Konva.Filters.Enhance);
        }

        // Apply filters
        this.imageNode.filters(filters);

        // Set filter parameters
        this.imageNode.brightness(this.filterState.brightness);
        this.imageNode.contrast(this.filterState.contrast);
        this.imageNode.blurRadius(this.filterState.blur);
        this.imageNode.saturation(this.filterState.saturation);
        this.imageNode.hue(this.filterState.hue);
        this.imageNode.luminance(this.filterState.luminance);
        this.imageNode.pixelSize(this.filterState.pixelate);
        this.imageNode.noise(this.filterState.noise);

        // Redraw
        this.layer.batchDraw();

        console.log('🎨 [KONVA] Filters applied:', filters.length);
    }

    /**
     * Update a specific filter value
     * @param {string} filterName - Name of the filter
     * @param {any} value - Filter value
     */
    updateFilter(filterName, value) {
        if (this.filterState.hasOwnProperty(filterName)) {
            this.filterState[filterName] = value;
            this.applyFilters();
            console.log(`🎨 [KONVA] Updated ${filterName}:`, value);
        }
    }

    /**
     * Check if any filters are currently active
     * @returns {boolean}
     */
    hasActiveFilters() {
        return (
            this.filterState.brightness !== 1 ||
            this.filterState.contrast !== 0 ||
            this.filterState.blur !== 0 ||
            this.filterState.saturation !== 0 ||
            this.filterState.hue !== 0 ||
            this.filterState.luminance !== 0 ||
            this.filterState.pixelate !== 1 ||
            this.filterState.noise !== 0 ||
            this.filterState.grayscale ||
            this.filterState.sepia ||
            this.filterState.invert ||
            this.filterState.emboss ||
            this.filterState.posterize ||
            this.filterState.solarize ||
            this.filterState.enhance
        );
    }

    /**
     * Reset all filters to default values
     */
    resetFilters() {
        this.filterState = {
            brightness: 1,
            contrast: 0,
            blur: 0,
            saturation: 0,
            hue: 0,
            luminance: 0,
            pixelate: 1,
            noise: 0,
            grayscale: false,
            sepia: false,
            invert: false,
            emboss: false,
            posterize: false,
            solarize: false,
            enhance: false
        };

        if (this.imageNode) {
            this.imageNode.filters([]);
            this.imageNode.clearCache();
            this.layer.batchDraw();
        }

        this.saveState();
        console.log('🔄 [KONVA] All filters reset');
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.stage) return;

        const container = document.getElementById('konvaContainer');
        if (!container) return;

        // Store the current window dimensions to detect actual window resize
        const currentWindowWidth = window.innerWidth;
        const currentWindowHeight = window.innerHeight;

        // Only resize if the window dimensions actually changed
        // This prevents resizing when collapsible panels expand/collapse
        if (this.lastWindowWidth === currentWindowWidth && this.lastWindowHeight === currentWindowHeight) {
            console.log('📱 [KONVA] Skipping resize - window dimensions unchanged');
            return;
        }

        this.lastWindowWidth = currentWindowWidth;
        this.lastWindowHeight = currentWindowHeight;

        // Wait a bit for layout to settle
        setTimeout(() => {
            const containerRect = container.getBoundingClientRect();
            const width = Math.max(containerRect.width || 800, 400);
            const height = Math.max(containerRect.height || 600, 400);

            this.stage.width(width);
            this.stage.height(height);

            // Re-center image if it exists
            if (this.imageNode) {
                this.centerImage();
            }

            this.stage.batchDraw();

            console.log('📱 [KONVA] Canvas resized to:', width, 'x', height);
        }, 100);
    }

    /**
     * Save current state to history
     */
    saveState() {
        if (!this.stage) return;
        
        this.historyStep++;
        
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        
        this.history.push(this.stage.toJSON());
        
        if (this.history.length > this.maxHistorySteps) {
            this.history.shift();
            this.historyStep--;
        }
        
        console.log('💾 [KONVA] State saved to history');
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.loadState(this.history[this.historyStep]);
            console.log('↶ [KONVA] Undo performed');
        }
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.loadState(this.history[this.historyStep]);
            console.log('↷ [KONVA] Redo performed');
        }
    }

    /**
     * Load state from history
     * @param {string} state - JSON state string
     */
    loadState(state) {
        if (!this.stage) return;
        
        this.stage.destroy();
        this.stage = Konva.Node.create(state, 'konvaContainer');
        
        // Re-setup event listeners
        this.setupEventListeners();
        
        // Update references
        this.layer = this.stage.children[0];
        this.transformer = this.layer.findOne('Transformer');
        this.imageNode = this.layer.findOne('.mainImage');
    }

    /**
     * Export canvas as image
     * @param {string} format - Image format ('png', 'jpeg', 'webp')
     * @param {number} quality - Image quality (0-1)
     * @returns {string} Base64 image data
     */
    export(format = 'png', quality = 0.9) {
        if (!this.stage) {
            throw new Error('No canvas to export');
        }
        
        // Hide transformer during export
        const transformerVisible = this.transformer.visible();
        this.transformer.visible(false);
        this.layer.batchDraw();
        
        let dataURL;
        
        if (format === 'jpeg') {
            dataURL = this.stage.toDataURL({
                mimeType: 'image/jpeg',
                quality: quality
            });
        } else if (format === 'webp') {
            dataURL = this.stage.toDataURL({
                mimeType: 'image/webp',
                quality: quality
            });
        } else {
            dataURL = this.stage.toDataURL({
                mimeType: 'image/png'
            });
        }
        
        // Restore transformer visibility
        this.transformer.visible(transformerVisible);
        this.layer.batchDraw();
        
        console.log('📤 [KONVA] Canvas exported as', format);
        return dataURL;
    }

    /**
     * Download exported image
     * @param {string} filename - Filename for download
     * @param {string} format - Image format
     * @param {number} quality - Image quality
     */
    download(filename = 'ai-generated-image', format = 'png', quality = 0.9) {
        try {
            const dataURL = this.export(format, quality);
            
            const link = document.createElement('a');
            link.download = `${filename}.${format}`;
            link.href = dataURL;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('⬇️ [KONVA] Image downloaded:', filename);
        } catch (error) {
            console.error('❌ [KONVA] Failed to download image:', error);
            throw error;
        }
    }

    /**
     * Clear the canvas
     */
    clear() {
        if (!this.layer) return;
        
        this.layer.destroyChildren();
        this.layer.add(this.transformer);
        this.layer.batchDraw();
        
        this.imageNode = null;
        this.saveState();
        
        console.log('🗑️ [KONVA] Canvas cleared');
    }

    /**
     * Get canvas dimensions
     * @returns {object} Width and height
     */
    getDimensions() {
        return {
            width: this.stage ? this.stage.width() : 0,
            height: this.stage ? this.stage.height() : 0
        };
    }

    /**
     * Check if canvas has content
     * @returns {boolean} True if canvas has content
     */
    hasContent() {
        return this.imageNode !== null;
    }

    /**
     * Set active drawing tool
     * @param {string} tool - Tool name (brush, highlighter, text, arrow, rectangle, circle, star, polygon)
     */
    setDrawingTool(tool) {
        this.drawingState.activeTool = tool;
        this.drawingState.isDrawing = false;

        // Remove previous drawing event listeners
        this.removeDrawingListeners();

        // Handle tool activation/deactivation
        if (tool) {
            // Disable imageNode dragging when a drawing tool is active
            if (this.imageNode) {
                this.imageNode.draggable(false);
            }
            // Setup new drawing listeners
            this.setupDrawingListeners(tool);
        } else {
            // Tool is null, properly deactivate
            this.deactivateDrawingTool();
        }

        console.log(`🖌️ [KONVA] Active drawing tool:`, tool || 'none', '| Image dragging:', tool ? 'disabled' : 'enabled');
    }

    /**
     * Deactivate drawing tool and restore imageNode dragging
     */
    deactivateDrawingTool() {
        // Clear the active tool
        this.drawingState.activeTool = null;

        // Ensure no drawing is in progress
        this.drawingState.isDrawing = false;

        // Clean up all drawing event listeners
        this.removeDrawingListeners();

        // Re-enable imageNode dragging
        if (this.imageNode) {
            this.imageNode.draggable(true);
        }

        console.log('🖌️ [KONVA] Drawing tool deactivated, image dragging restored');
    }

    /**
     * Deactivate drawing tool and update UI (buttons and app state)
     * This is called when undoing back to initial state or when clearing all drawings
     */
    deactivateDrawingToolAndUI() {
        // Deactivate the tool internally
        this.deactivateDrawingTool();

        // Remove active class from all drawing tool buttons
        const drawingToolButtons = document.querySelectorAll('.drawing-tool');
        drawingToolButtons.forEach(btn => btn.classList.remove('active'));

        // Update the app state if available
        if (this.app && this.app.state) {
            this.app.state.activeDrawingTool = null;
        }

        console.log('🔄 [KONVA] Drawing tool and UI deactivated');
    }

    /**
     * Setup drawing event listeners for the active tool
     */
    setupDrawingListeners(tool) {
        if (!this.stage) return;

        if (tool === 'brush' || tool === 'highlighter') {
            this.setupFreeDrawListeners();
        } else if (tool === 'text') {
            this.setupTextListeners();
        } else {
            this.setupShapeListeners(tool);
        }
    }

    /**
     * Setup free draw (brush/highlighter) listeners
     */
    setupFreeDrawListeners() {
        this.stage.on('mousedown touchstart', (e) => {
            if (e.target !== this.stage && e.target !== this.layer && e.target !== this.imageNode) return;

            this.drawingState.isDrawing = true;
            const pos = this.stage.getPointerPosition();

            const opacity = this.drawingState.activeTool === 'highlighter' ? this.drawingState.opacity : 1;

            this.drawingState.currentLine = new Konva.Line({
                stroke: this.drawingState.strokeColor,
                strokeWidth: this.drawingState.strokeWidth,
                globalCompositeOperation: 'source-over',
                lineCap: 'round',
                lineJoin: 'round',
                points: [pos.x, pos.y],
                opacity: opacity
            });

            this.drawingLayer.add(this.drawingState.currentLine);
        });

        this.stage.on('mousemove touchmove', (e) => {
            if (!this.drawingState.isDrawing) return;

            const pos = this.stage.getPointerPosition();
            const newPoints = this.drawingState.currentLine.points().concat([pos.x, pos.y]);
            this.drawingState.currentLine.points(newPoints);
            this.drawingLayer.batchDraw();
        });

        this.stage.on('mouseup touchend', () => {
            if (this.drawingState.isDrawing) {
                this.drawingState.isDrawing = false;
                this.saveDrawingState();
            }
        });
    }

    /**
     * Setup text tool listeners
     */
    setupTextListeners() {
        this.stage.on('click tap', (e) => {
            if (e.target !== this.stage && e.target !== this.layer && e.target !== this.imageNode) return;

            const pos = this.stage.getPointerPosition();
            const text = prompt('Enter text:');

            if (text) {
                const textNode = new Konva.Text({
                    x: pos.x,
                    y: pos.y,
                    text: text,
                    fontSize: this.drawingState.fontSize,
                    fill: this.drawingState.strokeColor,
                    draggable: true
                });

                this.drawingLayer.add(textNode);
                this.drawingLayer.batchDraw();
                this.saveDrawingState();
            }
        });
    }

    /**
     * Setup shape drawing listeners
     */
    setupShapeListeners(tool) {
        let startPos = null;

        this.stage.on('mousedown touchstart', (e) => {
            if (e.target !== this.stage && e.target !== this.layer && e.target !== this.imageNode) return;

            this.drawingState.isDrawing = true;
            startPos = this.stage.getPointerPosition();

            // Create shape based on tool
            const shapeConfig = {
                stroke: this.drawingState.strokeColor,
                strokeWidth: this.drawingState.strokeWidth,
                fill: this.drawingState.enableFill ? this.drawingState.fillColor : 'transparent',
                draggable: true
            };

            if (tool === 'rectangle') {
                this.drawingState.currentShape = new Konva.Rect({
                    ...shapeConfig,
                    x: startPos.x,
                    y: startPos.y,
                    width: 0,
                    height: 0
                });
            } else if (tool === 'circle') {
                this.drawingState.currentShape = new Konva.Ellipse({
                    ...shapeConfig,
                    x: startPos.x,
                    y: startPos.y,
                    radiusX: 0,
                    radiusY: 0
                });
            } else if (tool === 'arrow') {
                this.drawingState.currentShape = new Konva.Arrow({
                    ...shapeConfig,
                    points: [startPos.x, startPos.y, startPos.x, startPos.y],
                    pointerLength: 10,
                    pointerWidth: 10
                });
            } else if (tool === 'star') {
                this.drawingState.currentShape = new Konva.Star({
                    ...shapeConfig,
                    x: startPos.x,
                    y: startPos.y,
                    numPoints: 5,
                    innerRadius: 0,
                    outerRadius: 0
                });
            } else if (tool === 'polygon') {
                // Simple triangle for polygon
                this.drawingState.currentShape = new Konva.RegularPolygon({
                    ...shapeConfig,
                    x: startPos.x,
                    y: startPos.y,
                    sides: 6,
                    radius: 0
                });
            }

            if (this.drawingState.currentShape) {
                this.drawingLayer.add(this.drawingState.currentShape);
            }
        });

        this.stage.on('mousemove touchmove', (e) => {
            if (!this.drawingState.isDrawing || !this.drawingState.currentShape) return;

            const pos = this.stage.getPointerPosition();
            const width = pos.x - startPos.x;
            const height = pos.y - startPos.y;

            if (tool === 'rectangle') {
                this.drawingState.currentShape.width(width);
                this.drawingState.currentShape.height(height);
            } else if (tool === 'circle') {
                this.drawingState.currentShape.radiusX(Math.abs(width) / 2);
                this.drawingState.currentShape.radiusY(Math.abs(height) / 2);
                this.drawingState.currentShape.x(startPos.x + width / 2);
                this.drawingState.currentShape.y(startPos.y + height / 2);
            } else if (tool === 'arrow') {
                this.drawingState.currentShape.points([startPos.x, startPos.y, pos.x, pos.y]);
            } else if (tool === 'star') {
                const radius = Math.sqrt(width * width + height * height) / 2;
                this.drawingState.currentShape.outerRadius(radius);
                this.drawingState.currentShape.innerRadius(radius / 2);
            } else if (tool === 'polygon') {
                const radius = Math.sqrt(width * width + height * height) / 2;
                this.drawingState.currentShape.radius(radius);
            }

            this.drawingLayer.batchDraw();
        });

        this.stage.on('mouseup touchend', () => {
            if (this.drawingState.isDrawing) {
                this.drawingState.isDrawing = false;
                this.drawingState.currentShape = null;
                this.saveDrawingState();
            }
        });
    }

    /**
     * Remove drawing event listeners
     */
    removeDrawingListeners() {
        if (this.stage) {
            this.stage.off('mousedown touchstart');
            this.stage.off('mousemove touchmove');
            this.stage.off('mouseup touchend');
            this.stage.off('click tap');
        }
    }

    /**
     * Update drawing tool options
     */
    updateDrawingOption(option, value) {
        if (this.drawingState.hasOwnProperty(option)) {
            this.drawingState[option] = value;
            console.log(`🎨 [KONVA] Updated ${option}:`, value);
        }
    }

    /**
     * Clear all drawings
     */
    clearDrawings() {
        if (this.drawingLayer) {
            // Remove all children except transformer
            // Important: Get a copy of children array before destroying to avoid iteration issues
            const children = this.drawingLayer.getChildren().slice();
            children.forEach(child => {
                if (child !== this.transformer) {
                    child.destroy();
                }
            });
            this.drawingLayer.batchDraw();
            this.saveDrawingState();

            // Deactivate the drawing tool and update UI
            this.deactivateDrawingToolAndUI();

            console.log('🗑️ [KONVA] All drawings cleared and tool deactivated');
        }
    }

    /**
     * Convert a Konva shape to a simple state object
     * Following Konva best practices: save only essential data, not the full visual tree
     */
    shapeToState(shape) {
        const className = shape.getClassName();
        const baseState = {
            id: shape.id() || shape._id,
            className: className,
            draggable: shape.draggable()
        };

        // Common properties for all shapes
        if (className === 'Line') {
            return {
                ...baseState,
                points: shape.points(),
                stroke: shape.stroke(),
                strokeWidth: shape.strokeWidth(),
                opacity: shape.opacity(),
                lineCap: shape.lineCap(),
                lineJoin: shape.lineJoin()
            };
        } else if (className === 'Text') {
            return {
                ...baseState,
                x: shape.x(),
                y: shape.y(),
                text: shape.text(),
                fontSize: shape.fontSize(),
                fill: shape.fill()
            };
        } else if (className === 'Rect') {
            return {
                ...baseState,
                x: shape.x(),
                y: shape.y(),
                width: shape.width(),
                height: shape.height(),
                stroke: shape.stroke(),
                strokeWidth: shape.strokeWidth(),
                fill: shape.fill()
            };
        } else if (className === 'Ellipse') {
            return {
                ...baseState,
                x: shape.x(),
                y: shape.y(),
                radiusX: shape.radiusX(),
                radiusY: shape.radiusY(),
                stroke: shape.stroke(),
                strokeWidth: shape.strokeWidth(),
                fill: shape.fill()
            };
        } else if (className === 'Arrow') {
            return {
                ...baseState,
                points: shape.points(),
                stroke: shape.stroke(),
                strokeWidth: shape.strokeWidth(),
                fill: shape.fill(),
                pointerLength: shape.pointerLength(),
                pointerWidth: shape.pointerWidth()
            };
        } else if (className === 'Star') {
            return {
                ...baseState,
                x: shape.x(),
                y: shape.y(),
                numPoints: shape.numPoints(),
                innerRadius: shape.innerRadius(),
                outerRadius: shape.outerRadius(),
                stroke: shape.stroke(),
                strokeWidth: shape.strokeWidth(),
                fill: shape.fill()
            };
        } else if (className === 'RegularPolygon') {
            return {
                ...baseState,
                x: shape.x(),
                y: shape.y(),
                sides: shape.sides(),
                radius: shape.radius(),
                stroke: shape.stroke(),
                strokeWidth: shape.strokeWidth(),
                fill: shape.fill()
            };
        }

        return baseState;
    }

    /**
     * Create a Konva shape from a simple state object
     */
    stateToShape(state) {
        const { className, ...config } = state;

        if (className === 'Line') {
            return new Konva.Line(config);
        } else if (className === 'Text') {
            return new Konva.Text(config);
        } else if (className === 'Rect') {
            return new Konva.Rect(config);
        } else if (className === 'Ellipse') {
            return new Konva.Ellipse(config);
        } else if (className === 'Arrow') {
            return new Konva.Arrow(config);
        } else if (className === 'Star') {
            return new Konva.Star(config);
        } else if (className === 'RegularPolygon') {
            return new Konva.RegularPolygon(config);
        }

        return null;
    }

    /**
     * Save current drawing layer state to drawing history
     * Following Konva best practices: save simple state array, not full layer JSON
     */
    saveDrawingState() {
        if (!this.drawingLayer) return;

        this.drawingHistoryStep++;

        // Remove any future states if we're not at the end
        if (this.drawingHistoryStep < this.drawingHistory.length) {
            this.drawingHistory.length = this.drawingHistoryStep;
        }

        // Convert all drawing shapes to simple state objects
        const drawings = [];
        this.drawingLayer.getChildren().forEach(child => {
            // Skip transformer
            if (child.getClassName() === 'Transformer') return;

            const state = this.shapeToState(child);
            if (state) {
                drawings.push(state);
            }
        });

        // Save as JSON string (following Konva best practices)
        this.drawingHistory.push(JSON.stringify(drawings));

        // Limit history size
        if (this.drawingHistory.length > this.maxDrawingHistorySteps) {
            this.drawingHistory.shift();
            this.drawingHistoryStep--;
        }

        console.log(`💾 [KONVA] Drawing state saved to history (${drawings.length} shapes)`);
    }

    /**
     * Undo last drawing action
     */
    undoDrawing() {
        if (this.drawingHistoryStep > 0) {
            this.drawingHistoryStep--;
            this.loadDrawingState(this.drawingHistory[this.drawingHistoryStep]);
            console.log('↶ [KONVA] Drawing undo performed');

            // If we've undone back to the initial empty state, deactivate the drawing tool
            if (this.drawingHistoryStep === 0) {
                this.deactivateDrawingToolAndUI();
                console.log('🔄 [KONVA] Undone to initial state, drawing tool deactivated');
            }
        } else {
            console.log('⚠️ [KONVA] No drawing actions to undo');
        }
    }

    /**
     * Redo last undone drawing action
     */
    redoDrawing() {
        if (this.drawingHistoryStep < this.drawingHistory.length - 1) {
            this.drawingHistoryStep++;
            this.loadDrawingState(this.drawingHistory[this.drawingHistoryStep]);
            console.log('↷ [KONVA] Drawing redo performed');
        } else {
            console.log('⚠️ [KONVA] No drawing actions to redo');
        }
    }

    /**
     * Load drawing state from history
     * Following Konva best practices: recreate shapes from simple state array
     * @param {string} stateJson - JSON string of simple state array
     */
    loadDrawingState(stateJson) {
        if (!this.drawingLayer) return;

        // Clear current drawing layer (except transformer)
        // Important: Get a copy of children array before destroying to avoid iteration issues
        const children = this.drawingLayer.getChildren().slice();
        children.forEach(child => {
            if (child !== this.transformer) {
                child.destroy();
            }
        });

        // Parse the simple state array
        const drawings = JSON.parse(stateJson);

        // Recreate all shapes from simple state objects
        drawings.forEach(drawingState => {
            const shape = this.stateToShape(drawingState);
            if (shape) {
                this.drawingLayer.add(shape);
            }
        });

        this.drawingLayer.batchDraw();
        console.log(`🔄 [KONVA] Loaded ${drawings.length} shapes from history`);
    }

    /**
     * Get the current canvas image as base64 string (without data URL prefix)
     * Exports at the original image resolution, not the display size
     * @returns {Promise<string>} Base64 encoded image data
     */
    async getImageAsBase64() {
        try {
            if (!this.stage || !this.imageNode) {
                throw new Error('No image loaded on canvas');
            }

            // Get the original image dimensions from the underlying image object
            const originalImage = this.imageNode.image();
            const originalWidth = originalImage ? originalImage.naturalWidth || originalImage.width : this.imageNode.width();
            const originalHeight = originalImage ? originalImage.naturalHeight || originalImage.height : this.imageNode.height();

            // Get the displayed dimensions (after scaling)
            const displayedWidth = this.imageNode.width() * this.imageNode.scaleX();
            const displayedHeight = this.imageNode.height() * this.imageNode.scaleY();

            // Calculate pixelRatio to export at original resolution
            // This compensates for the scaling applied when displaying the image
            const pixelRatio = Math.max(
                originalWidth / displayedWidth,
                originalHeight / displayedHeight,
                1 // Minimum pixelRatio of 1
            );

            // Cap pixelRatio to prevent extremely large exports (max ~4K)
            const maxPixelRatio = Math.min(pixelRatio, 4);

            console.log('📐 [KONVA] Original image dimensions:', originalWidth, 'x', originalHeight);
            console.log('📐 [KONVA] Displayed dimensions:', Math.round(displayedWidth), 'x', Math.round(displayedHeight));
            console.log('📐 [KONVA] Export pixelRatio:', maxPixelRatio.toFixed(2));
            console.log('📐 [KONVA] Expected export size:', Math.round(displayedWidth * maxPixelRatio), 'x', Math.round(displayedHeight * maxPixelRatio));

            // Export the image node at high resolution
            const dataURL = this.imageNode.toDataURL({
                mimeType: 'image/png',
                quality: 1,
                pixelRatio: maxPixelRatio
            });

            // Extract base64 data (remove "data:image/png;base64," prefix)
            const base64Data = dataURL.split(',')[1];

            console.log('📸 [KONVA] Extracted image as base64, length:', base64Data.length);
            return base64Data;

        } catch (error) {
            console.error('❌ [KONVA] Failed to get image as base64:', error);
            throw error;
        }
    }

    /**
     * Get current image information for the status bar
     * @returns {object} Image info object with resolution, format, size, etc.
     */
    getImageInfo() {
        if (!this.imageNode) {
            return null;
        }

        try {
            const originalImage = this.imageNode.image();
            const originalWidth = originalImage ? (originalImage.naturalWidth || originalImage.width) : 0;
            const originalHeight = originalImage ? (originalImage.naturalHeight || originalImage.height) : 0;

            // Calculate aspect ratio
            let aspectRatioText = '--';
            if (originalWidth > 0 && originalHeight > 0) {
                const ratio = originalWidth / originalHeight;
                // Match common aspect ratios
                const commonRatios = [
                    { value: 1, label: '1:1' },
                    { value: 16/9, label: '16:9' },
                    { value: 9/16, label: '9:16' },
                    { value: 4/3, label: '4:3' },
                    { value: 3/4, label: '3:4' },
                    { value: 3/2, label: '3:2' },
                    { value: 2/3, label: '2:3' },
                    { value: 5/4, label: '5:4' },
                    { value: 4/5, label: '4:5' },
                    { value: 21/9, label: '21:9' }
                ];

                let closestMatch = null;
                let closestDiff = Infinity;
                for (const r of commonRatios) {
                    const diff = Math.abs(ratio - r.value);
                    if (diff < closestDiff && diff < 0.05) {
                        closestDiff = diff;
                        closestMatch = r.label;
                    }
                }
                aspectRatioText = closestMatch || ratio.toFixed(2);
            }

            // Estimate file size (rough estimate based on pixel count)
            const pixelCount = originalWidth * originalHeight;
            let estimatedSize = '--';
            if (pixelCount > 0) {
                // PNG is roughly 3-4 bytes per pixel uncompressed, ~1 byte compressed
                const estimatedBytes = pixelCount * 1.5; // rough average for PNG
                if (estimatedBytes > 1024 * 1024) {
                    estimatedSize = (estimatedBytes / (1024 * 1024)).toFixed(1) + ' MB';
                } else if (estimatedBytes > 1024) {
                    estimatedSize = Math.round(estimatedBytes / 1024) + ' KB';
                } else {
                    estimatedSize = Math.round(estimatedBytes) + ' B';
                }
            }

            // Determine resolution category for color coding
            let resolutionCategory = 'low';
            if (originalWidth >= 2048 || originalHeight >= 2048) {
                resolutionCategory = 'high';
            } else if (originalWidth >= 1024 || originalHeight >= 1024) {
                resolutionCategory = 'medium';
            }

            // Get zoom level from stage (not imageNode)
            const stageScale = this.stage ? this.stage.scaleX() : 1;
            const zoomPercent = Math.round(stageScale * 100);

            return {
                width: originalWidth,
                height: originalHeight,
                resolution: `${originalWidth} × ${originalHeight}`,
                resolutionCategory: resolutionCategory,
                aspectRatio: aspectRatioText,
                format: 'PNG',
                estimatedSize: estimatedSize,
                zoom: `${zoomPercent}%`
            };
        } catch (error) {
            console.error('❌ [KONVA] Failed to get image info:', error);
            return null;
        }
    }

    /**
     * Update the status bar with current image information
     */
    updateStatusBar() {
        console.log('📊 [KONVA] updateStatusBar called');

        const info = this.getImageInfo();
        console.log('📊 [KONVA] Image info:', info);

        const resolutionEl = document.getElementById('statusResolutionValue');
        const aspectRatioEl = document.getElementById('statusAspectRatioValue');
        const formatEl = document.getElementById('statusFormatValue');
        const fileSizeEl = document.getElementById('statusFileSizeValue');
        const zoomEl = document.getElementById('statusZoomValue');
        const resolutionItem = document.getElementById('statusResolution');

        console.log('📊 [KONVA] DOM elements found:', {
            resolutionEl: !!resolutionEl,
            aspectRatioEl: !!aspectRatioEl,
            formatEl: !!formatEl,
            fileSizeEl: !!fileSizeEl,
            zoomEl: !!zoomEl,
            resolutionItem: !!resolutionItem
        });

        if (!info) {
            // No image loaded
            console.log('📊 [KONVA] No image info, clearing status bar');
            if (resolutionEl) resolutionEl.textContent = '--';
            if (aspectRatioEl) aspectRatioEl.textContent = '--';
            if (formatEl) formatEl.textContent = '--';
            if (fileSizeEl) fileSizeEl.textContent = '--';
            if (zoomEl) zoomEl.textContent = '--';
            if (resolutionItem) {
                resolutionItem.classList.remove('resolution-high', 'resolution-medium', 'resolution-low');
            }
            return;
        }

        // Update values
        if (resolutionEl) resolutionEl.textContent = info.resolution;
        if (aspectRatioEl) aspectRatioEl.textContent = info.aspectRatio;
        if (formatEl) formatEl.textContent = info.format;
        if (fileSizeEl) fileSizeEl.textContent = info.estimatedSize;
        if (zoomEl) zoomEl.textContent = info.zoom;

        // Apply resolution color coding
        if (resolutionItem) {
            resolutionItem.classList.remove('resolution-high', 'resolution-medium', 'resolution-low');
            resolutionItem.classList.add(`resolution-${info.resolutionCategory}`);
        }

        console.log('📊 [KONVA] Status bar updated successfully:', info);
    }

    /**
     * Destroy the editor and clean up resources
     */
    destroy() {
        this.removeDrawingListeners();
        this.removeKeyboardListeners();

        if (this.stage) {
            this.stage.destroy();
            this.stage = null;
        }

        this.layer = null;
        this.drawingLayer = null;
        this.imageNode = null;
        this.transformer = null;
        this.history = [];
        this.historyStep = -1;

        // Update status bar to show no image
        this.updateStatusBar();

        console.log('🗑️ [KONVA] Editor destroyed');
    }

    // ==================== CROP TOOL METHODS ====================

    /**
     * Initialize crop mode
     * @param {string|number} aspectRatio - 'free', 1, 16/9, or 9/16
     */
    startCrop(aspectRatio = 'free') {
        if (this.cropState.active) {
            console.warn('⚠️ [KONVA] Crop mode already active');
            return;
        }

        if (!this.imageNode) {
            throw new Error('No image loaded');
        }

        console.log('✂️ [KONVA] Starting crop mode with aspect ratio:', aspectRatio);

        // Set crop state
        this.cropState.active = true;
        this.cropState.aspectRatio = aspectRatio;

        // Disable image dragging
        this.imageNode.draggable(false);

        // Create crop overlay
        this.createCropOverlay();

        // Disable drawing tools
        this.disableDrawingTools();

        console.log('✅ [KONVA] Crop mode activated');
    }

    /**
     * Create the visual crop rectangle and overlay
     */
    createCropOverlay() {
        // Create crop layer
        this.cropState.cropLayer = new Konva.Layer();
        this.stage.add(this.cropState.cropLayer);

        // Move crop layer between main layer and drawing layer
        this.cropState.cropLayer.moveToTop();
        this.drawingLayer.moveToTop();

        // Get image bounds
        const imageBounds = this.getImageBoundsInStageCoords();

        // Calculate initial crop rectangle (80% of image, centered)
        let initialWidth = imageBounds.width * 0.8;
        let initialHeight = imageBounds.height * 0.8;

        // Apply aspect ratio to initial size
        if (this.cropState.aspectRatio !== 'free') {
            initialHeight = initialWidth / this.cropState.aspectRatio;

            // If height exceeds image, scale down
            if (initialHeight > imageBounds.height * 0.8) {
                initialHeight = imageBounds.height * 0.8;
                const newWidth = initialHeight * this.cropState.aspectRatio;
                if (newWidth <= imageBounds.width * 0.8) {
                    initialWidth = newWidth;
                }
            }
        }

        const initialX = imageBounds.x + (imageBounds.width - initialWidth) / 2;
        const initialY = imageBounds.y + (imageBounds.height - initialHeight) / 2;

        // Create crop rectangle (transparent, just shows the border)
        this.cropState.cropRect = new Konva.Rect({
            x: initialX,
            y: initialY,
            width: initialWidth,
            height: initialHeight,
            stroke: '#00d4ff',
            strokeWidth: 1.5, // Thin line
            dash: [10, 5],
            draggable: true,
            name: 'cropRect',
            dragBoundFunc: (pos) => this.cropDragBoundFunc(pos)
        });

        this.cropState.cropLayer.add(this.cropState.cropRect);

        // Create 4 dark overlay rectangles
        for (let i = 0; i < 4; i++) {
            const darkRect = new Konva.Rect({
                fill: 'rgba(0, 0, 0, 0.5)',
                listening: false // Don't intercept mouse events
            });
            this.cropState.darkRects.push(darkRect);
            this.cropState.cropLayer.add(darkRect);
        }

        // Create transformer
        // Note: We set keepRatio to false and handle ALL aspect ratio logic in boundBoxFunc
        // This prevents conflicts between Konva's built-in ratio maintenance and our custom logic
        this.cropState.cropTransformer = new Konva.Transformer({
            nodes: [this.cropState.cropRect],
            keepRatio: false, // We handle aspect ratio in boundBoxFunc
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            borderStroke: '#00d4ff',
            borderStrokeWidth: 2,
            anchorStroke: '#00d4ff',
            anchorFill: '#ffffff',
            anchorSize: 8,
            boundBoxFunc: (oldBox, newBox) => this.cropBoundBoxFunc(oldBox, newBox)
        });

        this.cropState.cropLayer.add(this.cropState.cropTransformer);

        // Update overlay positions
        this.updateCropOverlay();

        // Listen for transform/drag events
        this.cropState.cropRect.on('transform dragmove', () => {
            this.updateCropOverlay();
        });

        this.cropState.cropLayer.batchDraw();
    }

    /**
     * Update the dark overlay rectangles to match crop selection
     */
    updateCropOverlay() {
        if (!this.cropState.active) return;

        const imageBounds = this.getImageBoundsInStageCoords();
        const cropX = this.cropState.cropRect.x();
        const cropY = this.cropState.cropRect.y();
        const cropWidth = this.cropState.cropRect.width() * this.cropState.cropRect.scaleX();
        const cropHeight = this.cropState.cropRect.height() * this.cropState.cropRect.scaleY();

        // Reset scale (transformer changes scale, we want to work with width/height)
        this.cropState.cropRect.scaleX(1);
        this.cropState.cropRect.scaleY(1);
        this.cropState.cropRect.width(cropWidth);
        this.cropState.cropRect.height(cropHeight);

        // Update dark rectangles
        const [top, right, bottom, left] = this.cropState.darkRects;

        // Top overlay (covers area above crop)
        top.setAttrs({
            x: imageBounds.x,
            y: imageBounds.y,
            width: imageBounds.width,
            height: Math.max(0, cropY - imageBounds.y)
        });

        // Right overlay (covers area to the right of crop)
        right.setAttrs({
            x: cropX + cropWidth,
            y: cropY,
            width: Math.max(0, imageBounds.right - (cropX + cropWidth)),
            height: cropHeight
        });

        // Bottom overlay (covers area below crop)
        bottom.setAttrs({
            x: imageBounds.x,
            y: cropY + cropHeight,
            width: imageBounds.width,
            height: Math.max(0, imageBounds.bottom - (cropY + cropHeight))
        });

        // Left overlay (covers area to the left of crop)
        left.setAttrs({
            x: imageBounds.x,
            y: cropY,
            width: Math.max(0, cropX - imageBounds.x),
            height: cropHeight
        });

        this.cropState.cropLayer.batchDraw();
    }

    /**
     * Get image boundaries in stage coordinates
     * @returns {Object} {x, y, width, height, right, bottom}
     */
    getImageBoundsInStageCoords() {
        if (!this.imageNode) {
            throw new Error('No image loaded');
        }

        const imageX = this.imageNode.x();
        const imageY = this.imageNode.y();
        const imageWidth = this.imageNode.width() * this.imageNode.scaleX();
        const imageHeight = this.imageNode.height() * this.imageNode.scaleY();

        return {
            x: imageX,
            y: imageY,
            width: imageWidth,
            height: imageHeight,
            right: imageX + imageWidth,
            bottom: imageY + imageHeight
        };
    }

    /**
     * Constrain crop rectangle resize to image bounds and aspect ratio
     * @param {Object} oldBox - Previous bounding box {x, y, width, height}
     * @param {Object} newBox - New bounding box {x, y, width, height}
     * @returns {Object} Constrained bounding box
     */
    cropBoundBoxFunc(oldBox, newBox) {
        const imageBounds = this.getImageBoundsInStageCoords();

        // 1. Minimum size constraint (prevent too small crops)
        const minSize = 50;
        if (Math.abs(newBox.width) < minSize || Math.abs(newBox.height) < minSize) {
            return oldBox;
        }

        // 2. Apply aspect ratio constraint FIRST
        if (this.cropState.aspectRatio !== 'free') {
            const ratio = this.cropState.aspectRatio;

            // Determine which dimension changed more
            const widthChange = Math.abs(newBox.width - oldBox.width);
            const heightChange = Math.abs(newBox.height - oldBox.height);

            if (widthChange > heightChange) {
                // Width changed, adjust height to maintain ratio
                newBox.height = newBox.width / ratio;
            } else {
                // Height changed, adjust width to maintain ratio
                newBox.width = newBox.height * ratio;
            }
        }

        // 3. Boundary constraint - ensure crop doesn't exceed image bounds
        // For aspect ratio locked crops, we need to maintain the ratio while constraining
        if (this.cropState.aspectRatio !== 'free') {
            const ratio = this.cropState.aspectRatio;

            // Check if crop exceeds any boundary
            let needsAdjustment = false;
            let maxWidth = newBox.width;
            let maxHeight = newBox.height;

            // Check left boundary
            if (newBox.x < imageBounds.x) {
                maxWidth = Math.min(maxWidth, newBox.width - (imageBounds.x - newBox.x));
                newBox.x = imageBounds.x;
                needsAdjustment = true;
            }

            // Check top boundary
            if (newBox.y < imageBounds.y) {
                maxHeight = Math.min(maxHeight, newBox.height - (imageBounds.y - newBox.y));
                newBox.y = imageBounds.y;
                needsAdjustment = true;
            }

            // Check right boundary
            if (newBox.x + newBox.width > imageBounds.right) {
                maxWidth = Math.min(maxWidth, imageBounds.right - newBox.x);
                needsAdjustment = true;
            }

            // Check bottom boundary
            if (newBox.y + newBox.height > imageBounds.bottom) {
                maxHeight = Math.min(maxHeight, imageBounds.bottom - newBox.y);
                needsAdjustment = true;
            }

            // If we need adjustment, scale down while maintaining aspect ratio
            if (needsAdjustment) {
                // Calculate the maximum size that fits within bounds while maintaining aspect ratio
                const maxWidthByHeight = maxHeight * ratio;
                const maxHeightByWidth = maxWidth / ratio;

                if (maxWidthByHeight <= maxWidth) {
                    // Height is the limiting factor
                    newBox.height = maxHeight;
                    newBox.width = maxHeight * ratio;
                } else {
                    // Width is the limiting factor
                    newBox.width = maxWidth;
                    newBox.height = maxWidth / ratio;
                }
            }
        } else {
            // Free crop - apply boundary constraints independently
            if (newBox.x < imageBounds.x) {
                newBox.width = newBox.width - (imageBounds.x - newBox.x);
                newBox.x = imageBounds.x;
            }

            if (newBox.y < imageBounds.y) {
                newBox.height = newBox.height - (imageBounds.y - newBox.y);
                newBox.y = imageBounds.y;
            }

            if (newBox.x + newBox.width > imageBounds.right) {
                newBox.width = imageBounds.right - newBox.x;
            }

            if (newBox.y + newBox.height > imageBounds.bottom) {
                newBox.height = imageBounds.bottom - newBox.y;
            }
        }

        // 4. Final minimum size check
        if (Math.abs(newBox.width) < minSize || Math.abs(newBox.height) < minSize) {
            return oldBox;
        }

        return newBox;
    }

    /**
     * Constrain crop rectangle dragging to image bounds
     * @param {Object} pos - New position {x, y}
     * @returns {Object} Constrained position
     */
    cropDragBoundFunc(pos) {
        const imageBounds = this.getImageBoundsInStageCoords();
        const cropWidth = this.cropState.cropRect.width() * this.cropState.cropRect.scaleX();
        const cropHeight = this.cropState.cropRect.height() * this.cropState.cropRect.scaleY();

        // Constrain x
        let x = pos.x;
        if (x < imageBounds.x) {
            x = imageBounds.x;
        }
        if (x + cropWidth > imageBounds.right) {
            x = imageBounds.right - cropWidth;
        }

        // Constrain y
        let y = pos.y;
        if (y < imageBounds.y) {
            y = imageBounds.y;
        }
        if (y + cropHeight > imageBounds.bottom) {
            y = imageBounds.bottom - cropHeight;
        }

        return { x, y };
    }

    /**
     * Disable drawing tools during crop mode
     */
    disableDrawingTools() {
        // Store current tool
        this.cropState.previousTool = this.drawingState.activeTool;

        // Deactivate drawing tool
        if (this.drawingState.activeTool) {
            this.deactivateDrawingTool();
        }

        // Hide drawing layer transformer
        if (this.transformer) {
            this.transformer.visible(false);
            this.drawingLayer.batchDraw();
        }
    }

    /**
     * Re-enable drawing tools after crop mode
     */
    enableDrawingTools() {
        // Show drawing layer transformer
        if (this.transformer) {
            this.transformer.visible(true);
            this.drawingLayer.batchDraw();
        }

        // Restore previous tool if any
        if (this.cropState.previousTool) {
            // Don't auto-activate, just clear the stored value
            this.cropState.previousTool = null;
        }
    }

    /**
     * Apply the crop and replace the current image
     */
    async applyCrop() {
        if (!this.cropState.active) {
            console.warn('⚠️ [KONVA] Crop mode not active');
            return;
        }

        try {
            console.log('✂️ [KONVA] Applying crop...');

            // 1. Get crop rectangle position/size in stage coordinates
            const cropX = this.cropState.cropRect.x();
            const cropY = this.cropState.cropRect.y();
            const cropWidth = this.cropState.cropRect.width();
            const cropHeight = this.cropState.cropRect.height();

            // 2. Get image position/size in stage coordinates
            const imageX = this.imageNode.x();
            const imageY = this.imageNode.y();
            const imageScale = this.imageNode.scaleX(); // Assuming uniform scale

            // 3. Convert crop coordinates to image space (original image pixels)
            const cropXInImage = (cropX - imageX) / imageScale;
            const cropYInImage = (cropY - imageY) / imageScale;
            const cropWidthInImage = cropWidth / imageScale;
            const cropHeightInImage = cropHeight / imageScale;

            console.log('📐 [KONVA] Crop in image space:', {
                x: cropXInImage,
                y: cropYInImage,
                width: cropWidthInImage,
                height: cropHeightInImage
            });

            // 4. Create a temporary canvas to extract cropped region
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(cropWidthInImage);
            canvas.height = Math.round(cropHeightInImage);
            const ctx = canvas.getContext('2d');

            // 5. Draw the cropped portion from the original image
            ctx.drawImage(
                this.imageNode.image(), // Source image
                Math.round(cropXInImage),
                Math.round(cropYInImage),
                Math.round(cropWidthInImage),
                Math.round(cropHeightInImage), // Source rect
                0, 0,
                Math.round(cropWidthInImage),
                Math.round(cropHeightInImage) // Dest rect
            );

            // 6. Get data URL of cropped image
            const croppedDataURL = canvas.toDataURL('image/png');

            // 7. Clean up crop mode
            this.cancelCrop();

            // 8. Load the cropped image as the new main image
            await this.loadImage(croppedDataURL);

            // 9. Save to history
            this.saveState();

            console.log('✅ [KONVA] Crop applied successfully');

        } catch (error) {
            console.error('❌ [KONVA] Crop failed:', error);
            this.cancelCrop();
            throw error;
        }
    }

    /**
     * Cancel crop mode and clean up
     */
    cancelCrop() {
        if (!this.cropState.active) {
            console.log('⚠️ [KONVA] Crop mode not active, nothing to cancel');
            return;
        }

        console.log('❌ [KONVA] Canceling crop mode');
        console.log('🔍 [KONVA] Crop layer exists:', !!this.cropState.cropLayer);

        // 1. Destroy crop layer and all its children
        if (this.cropState.cropLayer) {
            console.log('🗑️ [KONVA] Destroying crop layer...');
            this.cropState.cropLayer.destroy();
            console.log('✅ [KONVA] Crop layer destroyed');
        }

        // 2. Re-enable image dragging
        if (this.imageNode) {
            this.imageNode.draggable(true);
            console.log('✅ [KONVA] Image dragging re-enabled');
        }

        // 3. Re-enable drawing tools
        this.enableDrawingTools();

        // 4. Remove active state from all aspect ratio buttons
        const cropRatioBtns = document.querySelectorAll('.crop-ratio-btn');
        cropRatioBtns.forEach(btn => btn.classList.remove('active'));
        console.log('✅ [KONVA] Aspect ratio buttons reset');

        // 5. Reset crop state
        this.cropState = {
            active: false,
            aspectRatio: 'free',
            cropLayer: null,
            cropRect: null,
            cropTransformer: null,
            darkRects: [],
            previousTool: null
        };

        // 6. Force stage redraw to ensure crop overlay is removed
        this.stage.batchDraw();
        console.log('🎨 [KONVA] Stage redrawn');

        console.log('✅ [KONVA] Crop mode canceled successfully');
    }

    /**
     * Change the aspect ratio of the current crop
     * @param {string|number} aspectRatio - 'free', 1, 16/9, or 9/16
     */
    changeCropRatio(aspectRatio) {
        if (!this.cropState.active) {
            console.warn('⚠️ [KONVA] Crop mode not active, cannot change aspect ratio');
            return;
        }

        console.log('📐 [KONVA] Changing crop aspect ratio to:', aspectRatio);
        console.log('📐 [KONVA] Current crop state:', {
            active: this.cropState.active,
            currentRatio: this.cropState.aspectRatio,
            newRatio: aspectRatio
        });

        // 1. Update state
        this.cropState.aspectRatio = aspectRatio;

        // 2. Keep transformer keepRatio as false - we handle aspect ratio in boundBoxFunc
        // This prevents conflicts between Konva's built-in ratio and our custom logic
        this.cropState.cropTransformer.keepRatio(false);
        console.log('📐 [KONVA] Transformer keepRatio kept as false (handled in boundBoxFunc)');

        // 3. If not free, adjust current crop to match new ratio
        if (aspectRatio !== 'free') {
            const currentWidth = this.cropState.cropRect.width();
            const newHeight = currentWidth / aspectRatio;

            console.log('📐 [KONVA] Adjusting crop dimensions:', {
                currentWidth,
                newHeight,
                aspectRatio
            });

            // Check if new height fits within image bounds
            const imageBounds = this.getImageBoundsInStageCoords();
            const cropY = this.cropState.cropRect.y();

            if (cropY + newHeight > imageBounds.bottom) {
                // Height doesn't fit, adjust width instead
                const maxHeight = imageBounds.bottom - cropY;
                const newWidth = maxHeight * aspectRatio;
                console.log('📐 [KONVA] Height overflow, adjusting width:', { newWidth, maxHeight });
                this.cropState.cropRect.width(newWidth);
                this.cropState.cropRect.height(maxHeight);
            } else {
                // Height fits, use it
                console.log('📐 [KONVA] Height fits, using new height:', newHeight);
                this.cropState.cropRect.height(newHeight);
            }

            // Update overlay
            this.updateCropOverlay();

            // Force transformer update
            this.cropState.cropTransformer.forceUpdate();
        }

        this.cropState.cropLayer.batchDraw();
        console.log('✅ [KONVA] Aspect ratio changed successfully');
    }

    /**
     * Start crop mode with custom pixel dimensions
     * @param {number} width - Desired crop width in pixels
     * @param {number} height - Desired crop height in pixels
     */
    startCropWithCustomDimensions(width, height) {
        if (this.cropState.active) {
            console.warn('⚠️ [KONVA] Crop mode already active');
            return;
        }

        if (!this.imageNode) {
            throw new Error('No image loaded');
        }

        console.log('✂️ [KONVA] Starting crop mode with custom dimensions:', { width, height });

        // Set crop state with custom dimensions
        this.cropState.active = true;
        this.cropState.aspectRatio = 'custom';
        this.cropState.customWidth = width;
        this.cropState.customHeight = height;

        // Disable image dragging
        this.imageNode.draggable(false);

        // Create crop overlay with custom dimensions
        this.createCropOverlayWithCustomDimensions(width, height);

        // Disable drawing tools
        this.disableDrawingTools();

        console.log('✅ [KONVA] Crop mode activated with custom dimensions');
    }

    /**
     * Create crop overlay with specific pixel dimensions
     * @param {number} width - Desired crop width in pixels
     * @param {number} height - Desired crop height in pixels
     */
    createCropOverlayWithCustomDimensions(width, height) {
        // Create crop layer
        this.cropState.cropLayer = new Konva.Layer();
        this.stage.add(this.cropState.cropLayer);

        // Move crop layer between main layer and drawing layer
        this.cropState.cropLayer.moveToTop();
        this.drawingLayer.moveToTop();

        // Get image bounds
        const imageBounds = this.getImageBoundsInStageCoords();

        // Get current stage scale to convert pixel dimensions to stage coordinates
        const stageScale = this.stage.scaleX(); // Assuming uniform scale

        // Convert pixel dimensions to stage coordinates
        const cropWidth = width * stageScale;
        const cropHeight = height * stageScale;

        // Validate that custom dimensions fit within image bounds
        if (cropWidth > imageBounds.width || cropHeight > imageBounds.height) {
            throw new Error(`Custom dimensions (${width}x${height}px) exceed image size. Please use smaller dimensions.`);
        }

        // Center the crop rectangle
        const cropX = imageBounds.x + (imageBounds.width - cropWidth) / 2;
        const cropY = imageBounds.y + (imageBounds.height - cropHeight) / 2;

        console.log('📐 [KONVA] Creating crop with custom dimensions:', {
            pixelDimensions: { width, height },
            stageDimensions: { width: cropWidth, height: cropHeight },
            position: { x: cropX, y: cropY },
            imageBounds,
            stageScale
        });

        // Create crop rectangle with exact pixel dimensions
        this.cropState.cropRect = new Konva.Rect({
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
            stroke: '#00d4ff',
            strokeWidth: 1.5,
            dash: [10, 5],
            draggable: true,
            name: 'cropRect',
            dragBoundFunc: (pos) => this.cropDragBoundFunc(pos)
        });

        this.cropState.cropLayer.add(this.cropState.cropRect);

        // Create 4 dark overlay rectangles
        for (let i = 0; i < 4; i++) {
            const darkRect = new Konva.Rect({
                fill: 'rgba(0, 0, 0, 0.5)',
                listening: false
            });
            this.cropState.darkRects.push(darkRect);
            this.cropState.cropLayer.add(darkRect);
        }

        // Create transformer with fixed dimensions (no resizing for custom dimensions)
        this.cropState.cropTransformer = new Konva.Transformer({
            nodes: [this.cropState.cropRect],
            keepRatio: true, // Keep the exact dimensions
            enabledAnchors: [], // Disable resizing - only allow dragging
            borderStroke: '#00d4ff',
            borderStrokeWidth: 2,
            anchorStroke: '#00d4ff',
            anchorFill: '#ffffff',
            anchorSize: 8
        });

        this.cropState.cropLayer.add(this.cropState.cropTransformer);

        // Update overlay
        this.updateCropOverlay();

        this.cropState.cropLayer.batchDraw();
    }

    /**
     * Change current crop to custom pixel dimensions
     * @param {number} width - Desired crop width in pixels
     * @param {number} height - Desired crop height in pixels
     */
    changeCropToCustomDimensions(width, height) {
        if (!this.cropState.active) {
            console.warn('⚠️ [KONVA] Crop mode not active, cannot change to custom dimensions');
            return;
        }

        console.log('📐 [KONVA] Changing crop to custom dimensions:', { width, height });

        // Get image bounds
        const imageBounds = this.getImageBoundsInStageCoords();

        // Get current stage scale
        const stageScale = this.stage.scaleX();

        // Convert pixel dimensions to stage coordinates
        const cropWidth = width * stageScale;
        const cropHeight = height * stageScale;

        // Validate dimensions
        if (cropWidth > imageBounds.width || cropHeight > imageBounds.height) {
            throw new Error(`Custom dimensions (${width}x${height}px) exceed image size. Please use smaller dimensions.`);
        }

        // Update crop state
        this.cropState.aspectRatio = 'custom';
        this.cropState.customWidth = width;
        this.cropState.customHeight = height;

        // Get current crop position (keep it centered if possible)
        const currentX = this.cropState.cropRect.x();
        const currentY = this.cropState.cropRect.y();

        // Calculate new position (try to keep centered, but ensure it stays within bounds)
        let newX = currentX;
        let newY = currentY;

        // Adjust position if crop would exceed image bounds
        if (newX + cropWidth > imageBounds.right) {
            newX = imageBounds.right - cropWidth;
        }
        if (newY + cropHeight > imageBounds.bottom) {
            newY = imageBounds.bottom - cropHeight;
        }
        if (newX < imageBounds.x) {
            newX = imageBounds.x;
        }
        if (newY < imageBounds.y) {
            newY = imageBounds.y;
        }

        // Update crop rectangle dimensions and position
        this.cropState.cropRect.x(newX);
        this.cropState.cropRect.y(newY);
        this.cropState.cropRect.width(cropWidth);
        this.cropState.cropRect.height(cropHeight);

        // Update transformer to disable resizing for custom dimensions
        this.cropState.cropTransformer.keepRatio(true);
        this.cropState.cropTransformer.enabledAnchors([]); // Disable all anchors

        // Update overlay
        this.updateCropOverlay();

        // Force transformer update
        this.cropState.cropTransformer.forceUpdate();

        this.cropState.cropLayer.batchDraw();
        console.log('✅ [KONVA] Changed to custom dimensions successfully');
    }
}
