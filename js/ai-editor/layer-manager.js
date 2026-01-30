/**
 * LayerManager - Manages Konva layers for the AI Image Editor
 * Handles layer lifecycle, operations, and state management
 * Maximum 3 layers enforced for optimal performance
 */

class LayerManager {
    constructor(stage) {
        this.stage = stage;
        this.layers = []; // Array of LayerObject
        this.activeLayerId = null;
        this.layerIdCounter = 0;
        this.maxLayers = 3; // Performance limit
        
        // Callbacks for UI updates
        this.onLayerChange = null; // Called when layers change
    }

    /**
     * Initialize with the first base layer
     * @param {Konva.Layer} konvaLayer - Initial Konva layer
     * @param {string} name - Layer name (default: "Background")
     */
    initializeWithBaseLayer(konvaLayer, name = "Background") {
        const layerId = this._generateLayerId();
        const layerObject = {
            id: layerId,
            name: name,
            konvaLayer: konvaLayer,
            visible: true,
            locked: false,
            opacity: 1,
            thumbnail: null,
            type: 'image'
        };
        
        this.layers.push(layerObject);
        this.activeLayerId = layerId;
        
        // Set initial opacity
        konvaLayer.opacity(1);
        
        this._notifyChange();
        return layerObject;
    }

    /**
     * Add a new layer
     * @param {string} name - Layer name
     * @param {object} options - Layer options (type, opacity, etc.)
     * @returns {object|null} Created layer object or null if limit reached
     */
    addLayer(name = null, options = {}) {
        // Check layer limit
        if (this.layers.length >= this.maxLayers) {
            console.warn(`Maximum layer limit (${this.maxLayers}) reached`);
            return null;
        }

        const layerId = this._generateLayerId();
        const layerName = name || `Layer ${this.layers.length + 1}`;
        
        // Create new Konva layer
        const konvaLayer = new Konva.Layer();
        konvaLayer.opacity(options.opacity || 1);
        
        // Add to stage
        this.stage.add(konvaLayer);
        
        // Create layer object
        const layerObject = {
            id: layerId,
            name: layerName,
            konvaLayer: konvaLayer,
            visible: true,
            locked: false,
            opacity: options.opacity || 1,
            thumbnail: null,
            type: options.type || 'image'
        };
        
        this.layers.push(layerObject);
        this.activeLayerId = layerId;
        
        this._notifyChange();
        return layerObject;
    }

    /**
     * Delete a layer
     * @param {string} layerId - Layer ID to delete
     * @returns {boolean} Success status
     */
    deleteLayer(layerId) {
        // Prevent deleting the only layer
        if (this.layers.length <= 1) {
            console.warn('Cannot delete the only layer');
            return false;
        }

        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1) {
            console.warn('Layer not found:', layerId);
            return false;
        }

        const layer = this.layers[index];
        
        // Destroy Konva layer
        layer.konvaLayer.destroy();
        
        // Remove from array
        this.layers.splice(index, 1);
        
        // If deleted layer was active, select another
        if (this.activeLayerId === layerId) {
            // Select previous layer, or next if first was deleted
            const newIndex = Math.max(0, index - 1);
            this.activeLayerId = this.layers[newIndex].id;
        }
        
        this._notifyChange();
        return true;
    }

    /**
     * Duplicate a layer
     * @param {string} layerId - Layer ID to duplicate
     * @returns {object|null} New layer object or null if limit reached
     */
    duplicateLayer(layerId) {
        // Check layer limit
        if (this.layers.length >= this.maxLayers) {
            console.warn(`Maximum layer limit (${this.maxLayers}) reached`);
            return null;
        }

        const sourceLayer = this.getLayer(layerId);
        if (!sourceLayer) {
            console.warn('Layer not found:', layerId);
            return null;
        }

        // Create new layer
        const newLayerId = this._generateLayerId();
        const newName = `${sourceLayer.name} Copy`;
        
        const konvaLayer = new Konva.Layer();
        konvaLayer.opacity(sourceLayer.opacity);
        
        // Clone all children from source layer
        sourceLayer.konvaLayer.children.forEach(child => {
            const clone = child.clone();
            konvaLayer.add(clone);
        });
        
        this.stage.add(konvaLayer);
        
        const layerObject = {
            id: newLayerId,
            name: newName,
            konvaLayer: konvaLayer,
            visible: sourceLayer.visible,
            locked: false,
            opacity: sourceLayer.opacity,
            thumbnail: null,
            type: sourceLayer.type
        };
        
        this.layers.push(layerObject);
        this.activeLayerId = newLayerId;
        
        this._notifyChange();
        return layerObject;
    }

    /**
     * Set active layer
     * @param {string} layerId - Layer ID to activate
     * @returns {boolean} Success status
     */
    setActiveLayer(layerId) {
        const layer = this.getLayer(layerId);
        if (!layer) {
            console.warn('Layer not found:', layerId);
            return false;
        }

        this.activeLayerId = layerId;
        this._notifyChange();
        return true;
    }

    /**
     * Get active layer
     * @returns {object|null} Active layer object
     */
    getActiveLayer() {
        return this.getLayer(this.activeLayerId);
    }

    /**
     * Get layer by ID
     * @param {string} layerId - Layer ID
     * @returns {object|null} Layer object
     */
    getLayer(layerId) {
        return this.layers.find(l => l.id === layerId) || null;
    }

    /**
     * Get all layers
     * @returns {array} Array of layer objects
     */
    getAllLayers() {
        return [...this.layers];
    }

    /**
     * Toggle layer visibility
     * @param {string} layerId - Layer ID
     * @returns {boolean} New visibility state
     */
    toggleVisibility(layerId) {
        const layer = this.getLayer(layerId);
        if (!layer) {
            console.warn('Layer not found:', layerId);
            return false;
        }

        layer.visible = !layer.visible;
        layer.konvaLayer.visible(layer.visible);
        
        this._notifyChange();
        return layer.visible;
    }

    /**
     * Set layer opacity
     * @param {string} layerId - Layer ID
     * @param {number} opacity - Opacity value (0-1)
     */
    setOpacity(layerId, opacity) {
        const layer = this.getLayer(layerId);
        if (!layer) {
            console.warn('Layer not found:', layerId);
            return;
        }

        opacity = Math.max(0, Math.min(1, opacity));
        layer.opacity = opacity;
        layer.konvaLayer.opacity(opacity);
        
        this._notifyChange();
    }

    /**
     * Rename layer
     * @param {string} layerId - Layer ID
     * @param {string} newName - New layer name
     */
    renameLayer(layerId, newName) {
        const layer = this.getLayer(layerId);
        if (!layer) {
            console.warn('Layer not found:', layerId);
            return;
        }

        layer.name = newName;
        this._notifyChange();
    }

    /**
     * Move layer up in z-index
     * @param {string} layerId - Layer ID
     */
    moveLayerUp(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1 || index === this.layers.length - 1) {
            return; // Already at top or not found
        }

        // Swap in array
        [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
        
        // Update Konva z-index
        this.layers[index + 1].konvaLayer.moveUp();
        
        this._notifyChange();
    }

    /**
     * Move layer down in z-index
     * @param {string} layerId - Layer ID
     */
    moveLayerDown(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1 || index === 0) {
            return; // Already at bottom or not found
        }

        // Swap in array
        [this.layers[index], this.layers[index - 1]] = [this.layers[index - 1], this.layers[index]];
        
        // Update Konva z-index
        this.layers[index - 1].konvaLayer.moveDown();
        
        this._notifyChange();
    }

    /**
     * Generate thumbnail for a layer
     * @param {string} layerId - Layer ID
     * @returns {string|null} Data URL of thumbnail
     */
    generateThumbnail(layerId) {
        const layer = this.getLayer(layerId);
        if (!layer) {
            console.warn('Layer not found:', layerId);
            return null;
        }

        try {
            // Generate low-res thumbnail for performance
            const thumbnail = layer.konvaLayer.toDataURL({
                pixelRatio: 0.1, // Low resolution for performance
                mimeType: 'image/jpeg',
                quality: 0.6
            });
            
            layer.thumbnail = thumbnail;
            return thumbnail;
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
        }
    }

    /**
     * Generate unique layer ID
     * @private
     */
    _generateLayerId() {
        return `layer-${++this.layerIdCounter}`;
    }

    /**
     * Notify UI of changes
     * @private
     */
    _notifyChange() {
        if (this.onLayerChange && typeof this.onLayerChange === 'function') {
            this.onLayerChange();
        }
    }

    /**
     * Check if at layer limit
     * @returns {boolean}
     */
    isAtLayerLimit() {
        return this.layers.length >= this.maxLayers;
    }

    /**
     * Update thumbnail for active layer (useful after AI operations)
     * Call this after AI operations modify the canvas
     */
    updateActiveLayerThumbnail() {
        if (!this.activeLayerId) {
            console.warn('No active layer to update thumbnail');
            return;
        }

        const layer = this.getLayer(this.activeLayerId);
        if (layer) {
            layer.thumbnail = this.generateThumbnail(this.activeLayerId);
            this._notifyChange();
            console.log('✅ [LAYER MANAGER] Active layer thumbnail updated');
        }
    }

    /**
     * Update thumbnail for a specific layer
     * @param {string} layerId - ID of the layer to update
     */
    updateLayerThumbnail(layerId) {
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.thumbnail = this.generateThumbnail(layerId);
            this._notifyChange();
            console.log('✅ [LAYER MANAGER] Layer thumbnail updated:', layerId);
        } else {
            console.warn('Layer not found for thumbnail update:', layerId);
        }
    }

    /**
     * Merge active layer down with the layer below it
     * @returns {boolean} Success status
     */
    mergeDown() {
        if (this.layers.length < 2) {
            console.warn('Cannot merge: need at least 2 layers');
            return false;
        }

        const activeIndex = this.layers.findIndex(l => l.id === this.activeLayerId);
        if (activeIndex === -1 || activeIndex === 0) {
            console.warn('Cannot merge down: active layer is at bottom or not found');
            return false;
        }

        const activeLayer = this.layers[activeIndex];
        const belowLayer = this.layers[activeIndex - 1];

        console.log(`🔀 [LAYER MANAGER] Merging "${activeLayer.name}" down into "${belowLayer.name}"`);

        try {
            // Create a temporary stage to merge layers
            const tempStage = new Konva.Stage({
                container: document.createElement('div'),
                width: this.stage.width(),
                height: this.stage.height()
            });

            const tempLayer = new Konva.Layer();
            tempStage.add(tempLayer);

            // Clone both layers' content
            const belowClone = belowLayer.konvaLayer.clone();
            const activeClone = activeLayer.konvaLayer.clone();

            // Add to temp layer (below first, then active on top)
            belowClone.children.forEach(child => {
                tempLayer.add(child.clone());
            });
            activeClone.children.forEach(child => {
                tempLayer.add(child.clone());
            });

            // Export merged result
            const mergedDataURL = tempLayer.toDataURL();

            // Clear below layer and add merged image
            belowLayer.konvaLayer.destroyChildren();

            Konva.Image.fromURL(mergedDataURL, (image) => {
                belowLayer.konvaLayer.add(image);
                belowLayer.konvaLayer.batchDraw();

                // Update thumbnail
                belowLayer.thumbnail = this.generateThumbnail(belowLayer.id);
            });

            // Remove active layer
            this.deleteLayer(activeLayer.id);

            // Set below layer as active
            this.setActiveLayer(belowLayer.id);

            console.log('✅ [LAYER MANAGER] Layers merged successfully');
            return true;

        } catch (error) {
            console.error('❌ [LAYER MANAGER] Failed to merge layers:', error);
            return false;
        }
    }

    /**
     * Flatten all visible layers into a single layer
     * @returns {boolean} Success status
     */
    flattenAll() {
        if (this.layers.length === 1) {
            console.warn('Only one layer exists, nothing to flatten');
            return false;
        }

        console.log('🔀 [LAYER MANAGER] Flattening all visible layers...');

        try {
            // Export entire stage (all visible layers merged)
            const flattenedDataURL = this.stage.toDataURL();

            // Keep only the first layer, destroy others
            const firstLayer = this.layers[0];

            // Destroy all other layers
            for (let i = this.layers.length - 1; i > 0; i--) {
                this.layers[i].konvaLayer.destroy();
            }

            // Clear layers array, keep only first
            this.layers = [firstLayer];

            // Clear first layer and add flattened image
            firstLayer.konvaLayer.destroyChildren();
            firstLayer.name = 'Flattened';
            firstLayer.opacity = 1;
            firstLayer.visible = true;

            Konva.Image.fromURL(flattenedDataURL, (image) => {
                firstLayer.konvaLayer.add(image);
                firstLayer.konvaLayer.batchDraw();

                // Update thumbnail
                firstLayer.thumbnail = this.generateThumbnail(firstLayer.id);

                // Set as active
                this.setActiveLayer(firstLayer.id);

                console.log('✅ [LAYER MANAGER] All layers flattened successfully');
            });

            return true;

        } catch (error) {
            console.error('❌ [LAYER MANAGER] Failed to flatten layers:', error);
            return false;
        }
    }
}

