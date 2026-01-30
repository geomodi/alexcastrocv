# Layer Manager Implementation

## Complete `js/ai-editor/layer-manager.js` File

This is the complete implementation for the LayerManager class that should be created as a new file.

```javascript
/**
 * Layer Manager - Handles layer operations for Konva editor
 * Provides layer creation, deletion, reordering, visibility, and merging
 */

class LayerManager {
    constructor(app) {
        this.app = app;
        this.layers = []; // Array of layer objects
        this.activeLayerId = null;
        this.layerIdCounter = 0;

        console.log('📚 [LAYER MANAGER] Layer Manager initialized');
    }

    /**
     * Initialize layer system with base image layer
     * @param {Konva.Layer} baseLayer - The initial Konva layer
     */
    initializeWithBaseLayer(baseLayer) {
        this.layers = [{
            id: this.generateLayerId(),
            name: 'Background',
            konvaLayer: baseLayer,
            visible: true,
            locked: false
        }];

        this.activeLayerId = this.layers[0].id;
        console.log('📚 [LAYER MANAGER] Initialized with base layer');
    }

    /**
     * Generate unique layer ID
     * @returns {string} Layer ID
     */
    generateLayerId() {
        return `layer-${++this.layerIdCounter}`;
    }

    /**
     * Add new layer
     * @param {string} name - Layer name
     * @returns {object} New layer object
     */
    addLayer(name = null) {
        const layerId = this.generateLayerId();
        const layerName = name || `Layer ${this.layers.length + 1}`;

        // Create new Konva layer
        const konvaLayer = new Konva.Layer();
        
        // Get stage from editor
        const stage = this.app.modules.editor.stage;
        stage.add(konvaLayer);

        const newLayer = {
            id: layerId,
            name: layerName,
            konvaLayer: konvaLayer,
            visible: true,
            locked: false
        };

        this.layers.push(newLayer);
        this.activeLayerId = layerId;

        console.log('➕ [LAYER MANAGER] Added new layer:', layerName);
        return newLayer;
    }

    /**
     * Delete layer
     * @param {string} layerId - Layer ID to delete
     */
    deleteLayer(layerId) {
        const layerIndex = this.layers.findIndex(l => l.id === layerId);
        
        if (layerIndex === -1) {
            console.warn('⚠️ [LAYER MANAGER] Layer not found:', layerId);
            return;
        }

        // Can't delete if it's the only layer
        if (this.layers.length === 1) {
            console.warn('⚠️ [LAYER MANAGER] Cannot delete the only layer');
            return;
        }

        const layer = this.layers[layerIndex];
        
        // Destroy Konva layer
        layer.konvaLayer.destroy();

        // Remove from array
        this.layers.splice(layerIndex, 1);

        // Update active layer if needed
        if (this.activeLayerId === layerId) {
            this.activeLayerId = this.layers[Math.max(0, layerIndex - 1)].id;
        }

        console.log('🗑️ [LAYER MANAGER] Deleted layer:', layer.name);
    }

    /**
     * Toggle layer visibility
     * @param {string} layerId - Layer ID
     */
    toggleVisibility(layerId) {
        const layer = this.getLayer(layerId);
        if (!layer) return;

        layer.visible = !layer.visible;
        layer.konvaLayer.visible(layer.visible);
        layer.konvaLayer.batchDraw();

        console.log('👁️ [LAYER MANAGER] Toggled visibility for:', layer.name, layer.visible);
    }

    /**
     * Rename layer
     * @param {string} layerId - Layer ID
     * @param {string} newName - New layer name
     */
    renameLayer(layerId, newName) {
        const layer = this.getLayer(layerId);
        if (!layer) return;

        layer.name = newName;
        console.log('✏️ [LAYER MANAGER] Renamed layer to:', newName);
    }

    /**
     * Move layer up in stack
     * @param {string} layerId - Layer ID
     */
    moveLayerUp(layerId) {
        const layerIndex = this.layers.findIndex(l => l.id === layerId);
        
        if (layerIndex === -1 || layerIndex === this.layers.length - 1) {
            return; // Already at top or not found
        }

        // Swap in array
        [this.layers[layerIndex], this.layers[layerIndex + 1]] = 
        [this.layers[layerIndex + 1], this.layers[layerIndex]];

        // Move in Konva stage
        this.layers[layerIndex + 1].konvaLayer.moveUp();

        console.log('⬆️ [LAYER MANAGER] Moved layer up:', this.layers[layerIndex + 1].name);
    }

    /**
     * Move layer down in stack
     * @param {string} layerId - Layer ID
     */
    moveLayerDown(layerId) {
        const layerIndex = this.layers.findIndex(l => l.id === layerId);
        
        if (layerIndex === -1 || layerIndex === 0) {
            return; // Already at bottom or not found
        }

        // Swap in array
        [this.layers[layerIndex], this.layers[layerIndex - 1]] = 
        [this.layers[layerIndex - 1], this.layers[layerIndex]];

        // Move in Konva stage
        this.layers[layerIndex - 1].konvaLayer.moveDown();

        console.log('⬇️ [LAYER MANAGER] Moved layer down:', this.layers[layerIndex - 1].name);
    }

    /**
     * Set active layer
     * @param {string} layerId - Layer ID
     */
    setActiveLayer(layerId) {
        const layer = this.getLayer(layerId);
        if (!layer) return;

        this.activeLayerId = layerId;
        console.log('🎯 [LAYER MANAGER] Active layer set to:', layer.name);
    }

    /**
     * Get layer by ID
     * @param {string} layerId - Layer ID
     * @returns {object|null} Layer object or null
     */
    getLayer(layerId) {
        return this.layers.find(l => l.id === layerId) || null;
    }

    /**
     * Get active layer
     * @returns {object|null} Active layer object or null
     */
    getActiveLayer() {
        return this.getLayer(this.activeLayerId);
    }

    /**
     * Get all layers
     * @returns {array} Array of layer objects
     */
    getAllLayers() {
        return [...this.layers];
    }

    /**
     * Merge selected layers (merge all visible layers for now)
     */
    async mergeLayers() {
        console.log('🔗 [LAYER MANAGER] Merging layers...');

        // Get stage
        const stage = this.app.modules.editor.stage;

        // Create merged image
        const mergedDataURL = stage.toDataURL();

        // Clear all layers except first
        while (this.layers.length > 1) {
            this.deleteLayer(this.layers[this.layers.length - 1].id);
        }

        // Load merged image to first layer
        const baseLayer = this.layers[0];
        baseLayer.konvaLayer.destroyChildren();

        // Load merged image
        const imageObj = new Image();
        await new Promise((resolve, reject) => {
            imageObj.onload = resolve;
            imageObj.onerror = reject;
            imageObj.src = mergedDataURL;
        });

        const konvaImage = new Konva.Image({
            image: imageObj,
            x: 0,
            y: 0
        });

        baseLayer.konvaLayer.add(konvaImage);
        baseLayer.konvaLayer.batchDraw();
        baseLayer.name = 'Merged';

        console.log('✅ [LAYER MANAGER] Layers merged successfully');
    }

    /**
     * Generate layer thumbnail
     * @param {string} layerId - Layer ID
     * @returns {string} Data URL of thumbnail
     */
    generateThumbnail(layerId) {
        const layer = this.getLayer(layerId);
        if (!layer) return null;

        try {
            return layer.konvaLayer.toDataURL({
                pixelRatio: 0.1 // Small thumbnail
            });
        } catch (error) {
            console.warn('⚠️ [LAYER MANAGER] Failed to generate thumbnail:', error);
            return null;
        }
    }

    /**
     * Clear all layers
     */
    clear() {
        this.layers.forEach(layer => {
            if (layer.konvaLayer) {
                layer.konvaLayer.destroy();
            }
        });

        this.layers = [];
        this.activeLayerId = null;
        this.layerIdCounter = 0;

        console.log('🗑️ [LAYER MANAGER] All layers cleared');
    }
}
```

## Integration with konva-editor.js

The `konva-editor.js` file needs to be modified to work with the LayerManager instead of managing layers directly.

### Key Changes Required:

1. **Remove direct layer management from constructor:**
```javascript
// REMOVE these lines:
// this.layer = null;
// this.drawingLayer = null;
```

2. **Update init() method:**
```javascript
// Don't create layers directly
// Instead, let LayerManager handle it
this.stage = new Konva.Stage({
    container: 'konvaContainer',
    width: container.clientWidth,
    height: container.clientHeight
});

// LayerManager will be initialized in main.js
```

3. **Update loadImage() method to use active layer:**
```javascript
async loadImage(imageUrl) {
    // Get active layer from LayerManager
    const activeLayer = this.app.modules.layerManager.getActiveLayer();
    if (!activeLayer) {
        throw new Error('No active layer');
    }

    // ... existing image loading code ...

    // Add to active layer instead of this.layer
    activeLayer.konvaLayer.add(this.imageNode);
    activeLayer.konvaLayer.batchDraw();
}
```

4. **Update all references to `this.layer` and `this.drawingLayer`:**
- Replace with `this.app.modules.layerManager.getActiveLayer().konvaLayer`
- Or store reference to active layer at the beginning of methods

## Notes

- The LayerManager maintains an array of layer objects, each containing:
  - `id`: Unique identifier
  - `name`: User-friendly name
  - `konvaLayer`: Reference to Konva.Layer instance
  - `visible`: Visibility state
  - `locked`: Lock state (for future use)

- Layer operations automatically update the Konva stage
- Thumbnails are generated on-demand using `toDataURL()` with low pixel ratio
- The active layer is tracked and can be retrieved for drawing operations


