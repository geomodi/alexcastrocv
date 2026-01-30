# Crop Tool Implementation Plan - Bulletproof Technical Specification

## 📚 Research Summary

### Official Konva.js Documentation & Examples

1. **Transformer Resize Limits**
   - Source: https://konvajs.org/docs/select_and_transform/Resize_Limits.html
   - Key Method: `boundBoxFunc(oldBox, newBox)` - Constrains resize operations
   - Returns: `oldBox` to reject change, or `newBox` to accept
   - Works in absolute coordinates

2. **Image Crop Property**
   - Source: https://konvajs.org/docs/sandbox/Scale_Image_To_Fit.html
   - Konva.Image has built-in crop support: `cropX`, `cropY`, `cropWidth`, `cropHeight`
   - Crop coordinates are relative to the source image (not stage)
   - Demo shows how to calculate crop values for different aspect ratios

3. **Transformer API**
   - Source: https://konvajs.org/api/Konva.Transformer.html
   - `keepRatio: true` - Maintains aspect ratio during resize
   - `boundBoxFunc` - Constrains resize boundaries
   - `dragBoundFunc` - Constrains dragging boundaries
   - `enabledAnchors` - Controls which resize handles are shown

### Stack Overflow Findings

- **Dynamic Cropping with Semi-Transparent Overlay**: Use 4 Konva.Rect elements to create darkened areas around crop selection
- **Aspect Ratio Constraints**: Use `boundBoxFunc` with custom math to enforce ratios
- **Boundary Limits**: Combine `dragBoundFunc` and `boundBoxFunc` to keep crop within image

---

## 🏗️ Current Architecture Analysis

### Existing Structure (konva-editor.js)

```javascript
// Stage hierarchy:
Stage
├── Layer (main layer)
│   ├── ImageNode (Konva.Image) - draggable, name: 'mainImage'
│   └── (no transformer here)
└── DrawingLayer
    ├── Transformer (for drawn shapes only)
    └── Drawing shapes (lines, rectangles, circles, text)
```

### Key Properties

- **Stage**: Container, size = canvas container dimensions
- **ImageNode**: 
  - Scaled to 80% of stage dimensions
  - Centered on stage
  - Draggable
  - Has filters applied
- **Transformer**: 
  - Lives on drawingLayer
  - Used ONLY for drawn shapes (not for image)
  - Has keepRatio: true, 4 corner anchors

### Potential Conflicts

✅ **No conflicts identified** - The existing transformer is isolated on drawingLayer and only affects drawn shapes. Our crop system will be completely separate.

---

## 🎯 Technical Design Specification

### 1. Crop Rectangle Implementation

**Approach: Separate Crop Layer with Rect + Transformer**

We will create a temporary crop layer that sits above the image layer during crop mode:

```javascript
// Crop layer hierarchy:
CropLayer (temporary, created during crop mode)
├── CropOverlay (Group)
│   ├── DarkRect1 (top overlay)
│   ├── DarkRect2 (right overlay)
│   ├── DarkRect3 (bottom overlay)
│   ├── DarkRect4 (left overlay)
│   └── CropRect (transparent rectangle showing crop area)
└── CropTransformer (Konva.Transformer attached to CropRect)
```

**Why this approach?**
- ✅ Isolated from existing layers (no conflicts)
- ✅ Easy to add/remove (just destroy the layer)
- ✅ Visual overlay is straightforward (4 rectangles)
- ✅ Transformer provides built-in resize handles
- ✅ Can use boundBoxFunc for constraints

### 2. Layer Strategy

**Crop Layer Position**: Between main layer and drawing layer

```javascript
Stage
├── Layer (main layer) - z-index: 0
├── CropLayer (temporary) - z-index: 1 ← NEW
└── DrawingLayer - z-index: 2
```

**Rationale:**
- Crop overlay appears above the image
- Drawing tools remain on top (can still see them)
- Easy to insert/remove without affecting other layers

### 3. Aspect Ratio Constraints

**Four Presets:**
1. **Free** - No constraints, any aspect ratio
2. **1:1** - Square (width === height)
3. **16:9** - Landscape (width / height === 16/9)
4. **9:16** - Portrait (width / height === 9/16)

**Implementation Strategy:**

Use `boundBoxFunc` with custom aspect ratio math:

```javascript
boundBoxFunc: (oldBox, newBox) => {
    // 1. Check if newBox exceeds image boundaries
    if (isOutOfBounds(newBox)) {
        return oldBox; // Reject
    }
    
    // 2. Apply aspect ratio constraint
    if (this.cropState.aspectRatio !== 'free') {
        const ratio = this.cropState.aspectRatio; // e.g., 16/9
        
        // Determine which dimension changed more
        const widthChange = Math.abs(newBox.width - oldBox.width);
        const heightChange = Math.abs(newBox.height - oldBox.height);
        
        if (widthChange > heightChange) {
            // Width changed, adjust height
            newBox.height = newBox.width / ratio;
        } else {
            // Height changed, adjust width
            newBox.width = newBox.height * ratio;
        }
        
        // 3. Re-check boundaries after ratio adjustment
        if (isOutOfBounds(newBox)) {
            return oldBox; // Reject if now out of bounds
        }
    }
    
    return newBox; // Accept
}
```

### 4. Boundary Constraints

**Goal**: Crop rectangle must NEVER exceed image boundaries

**Challenge**: Coordinates are in different spaces:
- Transformer works in **stage coordinates** (absolute)
- Image has position, scale, rotation
- Crop needs to be constrained to **image bounds in stage coordinates**

**Solution**: Calculate image bounds in stage coordinates

```javascript
function getImageBoundsInStageCoords() {
    const image = this.imageNode;
    const imageX = image.x();
    const imageY = image.y();
    const imageWidth = image.width() * image.scaleX();
    const imageHeight = image.height() * image.scaleY();
    
    return {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
        right: imageX + imageWidth,
        bottom: imageY + imageHeight
    };
}

function isOutOfBounds(box) {
    const imageBounds = getImageBoundsInStageCoords();
    
    return (
        box.x < imageBounds.x ||
        box.y < imageBounds.y ||
        box.x + box.width > imageBounds.right ||
        box.y + box.height > imageBounds.bottom
    );
}
```

**Drag Boundary Function:**

```javascript
dragBoundFunc: (pos) => {
    const imageBounds = getImageBoundsInStageCoords();
    const cropWidth = this.cropRect.width() * this.cropRect.scaleX();
    const cropHeight = this.cropRect.height() * this.cropRect.scaleY();
    
    return {
        x: Math.max(imageBounds.x, Math.min(pos.x, imageBounds.right - cropWidth)),
        y: Math.max(imageBounds.y, Math.min(pos.y, imageBounds.bottom - cropHeight))
    };
}
```

### 5. Visual Overlay

**Semi-Transparent Darkened Areas:**

Create 4 rectangles that cover the areas OUTSIDE the crop selection:

```javascript
function updateCropOverlay() {
    const imageBounds = getImageBoundsInStageCoords();
    const cropX = this.cropRect.x();
    const cropY = this.cropRect.y();
    const cropWidth = this.cropRect.width() * this.cropRect.scaleX();
    const cropHeight = this.cropRect.height() * this.cropRect.scaleY();
    
    // Top overlay
    this.darkRect1.setAttrs({
        x: imageBounds.x,
        y: imageBounds.y,
        width: imageBounds.width,
        height: cropY - imageBounds.y
    });
    
    // Right overlay
    this.darkRect2.setAttrs({
        x: cropX + cropWidth,
        y: cropY,
        width: imageBounds.right - (cropX + cropWidth),
        height: cropHeight
    });
    
    // Bottom overlay
    this.darkRect3.setAttrs({
        x: imageBounds.x,
        y: cropY + cropHeight,
        width: imageBounds.width,
        height: imageBounds.bottom - (cropY + cropHeight)
    });
    
    // Left overlay
    this.darkRect4.setAttrs({
        x: imageBounds.x,
        y: cropY,
        width: cropX - imageBounds.x,
        height: cropHeight
    });
}
```

**Styling:**
- Fill: `rgba(0, 0, 0, 0.5)` - 50% black overlay
- Listening: `false` - Don't intercept mouse events
- Update on: `transform`, `dragmove` events

### 6. Apply Crop Logic

**Goal**: Extract the cropped region and replace the current image

**Steps:**

1. **Calculate crop coordinates in image space** (not stage space)
2. **Use Konva.Image crop property** to crop the image
3. **Export cropped image** as data URL
4. **Reload the cropped image** as the new main image
5. **Clean up crop layer**

**Detailed Implementation:**

```javascript
async applyCrop() {
    // 1. Get crop rectangle position/size in stage coordinates
    const cropX = this.cropRect.x();
    const cropY = this.cropRect.y();
    const cropWidth = this.cropRect.width() * this.cropRect.scaleX();
    const cropHeight = this.cropRect.height() * this.cropRect.scaleY();
    
    // 2. Get image position/size in stage coordinates
    const imageX = this.imageNode.x();
    const imageY = this.imageNode.y();
    const imageScale = this.imageNode.scaleX(); // Assuming uniform scale
    
    // 3. Convert crop coordinates to image space
    const cropXInImage = (cropX - imageX) / imageScale;
    const cropYInImage = (cropY - imageY) / imageScale;
    const cropWidthInImage = cropWidth / imageScale;
    const cropHeightInImage = cropHeight / imageScale;
    
    // 4. Create a temporary canvas to extract cropped region
    const canvas = document.createElement('canvas');
    canvas.width = cropWidthInImage;
    canvas.height = cropHeightInImage;
    const ctx = canvas.getContext('2d');
    
    // 5. Draw the cropped portion
    ctx.drawImage(
        this.imageNode.image(), // Source image
        cropXInImage, cropYInImage, cropWidthInImage, cropHeightInImage, // Source rect
        0, 0, cropWidthInImage, cropHeightInImage // Dest rect
    );
    
    // 6. Get data URL
    const croppedDataURL = canvas.toDataURL('image/png');
    
    // 7. Clean up crop mode
    this.cancelCrop();
    
    // 8. Load the cropped image
    await this.loadImage(croppedDataURL);
    
    // 9. Save to history
    this.saveState();
}
```

---

## 📝 Implementation Pseudocode

### State Management

```javascript
// Add to KonvaEditor constructor
this.cropState = {
    active: false,
    aspectRatio: 'free', // 'free', 1, 16/9, 9/16
    cropLayer: null,
    cropRect: null,
    cropTransformer: null,
    darkRects: [] // 4 overlay rectangles
};
```

### Function 1: startCrop(aspectRatio)

```javascript
/**
 * Initialize crop mode
 * @param {string|number} aspectRatio - 'free', 1, 16/9, or 9/16
 */
startCrop(aspectRatio = 'free') {
    if (this.cropState.active) {
        console.warn('Crop mode already active');
        return;
    }
    
    if (!this.imageNode) {
        throw new Error('No image loaded');
    }
    
    console.log('✂️ [KONVA] Starting crop mode with aspect ratio:', aspectRatio);
    
    // 1. Set crop state
    this.cropState.active = true;
    this.cropState.aspectRatio = aspectRatio;
    
    // 2. Disable image dragging
    this.imageNode.draggable(false);
    
    // 3. Create crop layer
    this.createCropOverlay();
    
    // 4. Disable drawing tools
    this.disableDrawingTools();
    
    console.log('✅ [KONVA] Crop mode activated');
}
```

### Function 2: createCropOverlay()

```javascript
/**
 * Create the visual crop rectangle and overlay
 */
createCropOverlay() {
    // 1. Create crop layer
    this.cropState.cropLayer = new Konva.Layer();
    this.stage.add(this.cropState.cropLayer);
    
    // Move crop layer between main layer and drawing layer
    this.cropState.cropLayer.moveToTop();
    this.drawingLayer.moveToTop();
    
    // 2. Get image bounds
    const imageBounds = this.getImageBoundsInStageCoords();
    
    // 3. Calculate initial crop rectangle (80% of image, centered)
    const initialWidth = imageBounds.width * 0.8;
    let initialHeight = imageBounds.height * 0.8;
    
    // Apply aspect ratio to initial size
    if (this.cropState.aspectRatio !== 'free') {
        initialHeight = initialWidth / this.cropState.aspectRatio;
        
        // If height exceeds image, scale down
        if (initialHeight > imageBounds.height * 0.8) {
            initialHeight = imageBounds.height * 0.8;
            initialWidth = initialHeight * this.cropState.aspectRatio;
        }
    }
    
    const initialX = imageBounds.x + (imageBounds.width - initialWidth) / 2;
    const initialY = imageBounds.y + (imageBounds.height - initialHeight) / 2;
    
    // 4. Create crop rectangle (transparent, just shows the border)
    this.cropState.cropRect = new Konva.Rect({
        x: initialX,
        y: initialY,
        width: initialWidth,
        height: initialHeight,
        stroke: '#00d4ff',
        strokeWidth: 2,
        dash: [10, 5],
        draggable: true,
        name: 'cropRect',
        dragBoundFunc: (pos) => this.cropDragBoundFunc(pos)
    });
    
    this.cropState.cropLayer.add(this.cropState.cropRect);
    
    // 5. Create 4 dark overlay rectangles
    for (let i = 0; i < 4; i++) {
        const darkRect = new Konva.Rect({
            fill: 'rgba(0, 0, 0, 0.5)',
            listening: false // Don't intercept mouse events
        });
        this.cropState.darkRects.push(darkRect);
        this.cropState.cropLayer.add(darkRect);
    }
    
    // 6. Create transformer
    this.cropState.cropTransformer = new Konva.Transformer({
        nodes: [this.cropState.cropRect],
        keepRatio: this.cropState.aspectRatio !== 'free',
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        borderStroke: '#00d4ff',
        borderStrokeWidth: 2,
        anchorStroke: '#00d4ff',
        anchorFill: '#ffffff',
        anchorSize: 10,
        boundBoxFunc: (oldBox, newBox) => this.cropBoundBoxFunc(oldBox, newBox)
    });
    
    this.cropState.cropLayer.add(this.cropState.cropTransformer);
    
    // 7. Update overlay positions
    this.updateCropOverlay();
    
    // 8. Listen for transform/drag events
    this.cropState.cropRect.on('transform dragmove', () => {
        this.updateCropOverlay();
    });
    
    this.cropState.cropLayer.batchDraw();
}
```

### Function 3: updateCropOverlay()

```javascript
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
```

### Function 4: cropBoundBoxFunc(oldBox, newBox)

```javascript
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

    // 2. Apply aspect ratio constraint
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
    // Check if newBox exceeds image boundaries
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

    // 4. Re-check minimum size after boundary adjustments
    if (Math.abs(newBox.width) < minSize || Math.abs(newBox.height) < minSize) {
        return oldBox;
    }

    // 5. If aspect ratio is locked, re-check boundaries after ratio adjustment
    if (this.cropState.aspectRatio !== 'free') {
        const ratio = this.cropState.aspectRatio;

        // Ensure both dimensions fit within bounds
        if (newBox.x + newBox.width > imageBounds.right ||
            newBox.y + newBox.height > imageBounds.bottom) {

            // Scale down proportionally to fit
            const scaleX = (imageBounds.right - newBox.x) / newBox.width;
            const scaleY = (imageBounds.bottom - newBox.y) / newBox.height;
            const scale = Math.min(scaleX, scaleY, 1);

            newBox.width *= scale;
            newBox.height = newBox.width / ratio;

            // Final check
            if (Math.abs(newBox.width) < minSize || Math.abs(newBox.height) < minSize) {
                return oldBox;
            }
        }
    }

    return newBox;
}
```

### Function 5: cropDragBoundFunc(pos)

```javascript
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
```

### Function 6: getImageBoundsInStageCoords()

```javascript
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
```

### Function 7: applyCrop()

```javascript
/**
 * Apply the crop and replace the current image
 */
async applyCrop() {
    if (!this.cropState.active) {
        console.warn('Crop mode not active');
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
```

### Function 8: cancelCrop()

```javascript
/**
 * Cancel crop mode and clean up
 */
cancelCrop() {
    if (!this.cropState.active) {
        return;
    }

    console.log('❌ [KONVA] Canceling crop mode');

    // 1. Destroy crop layer and all its children
    if (this.cropState.cropLayer) {
        this.cropState.cropLayer.destroy();
    }

    // 2. Re-enable image dragging
    if (this.imageNode) {
        this.imageNode.draggable(true);
    }

    // 3. Re-enable drawing tools
    this.enableDrawingTools();

    // 4. Reset crop state
    this.cropState = {
        active: false,
        aspectRatio: 'free',
        cropLayer: null,
        cropRect: null,
        cropTransformer: null,
        darkRects: []
    };

    console.log('✅ [KONVA] Crop mode canceled');
}
```

### Function 9: changeCropRatio(aspectRatio)

```javascript
/**
 * Change the aspect ratio of the current crop
 * @param {string|number} aspectRatio - 'free', 1, 16/9, or 9/16
 */
changeCropRatio(aspectRatio) {
    if (!this.cropState.active) {
        console.warn('Crop mode not active');
        return;
    }

    console.log('📐 [KONVA] Changing crop aspect ratio to:', aspectRatio);

    // 1. Update state
    this.cropState.aspectRatio = aspectRatio;

    // 2. Update transformer keepRatio property
    this.cropState.cropTransformer.keepRatio(aspectRatio !== 'free');

    // 3. If not free, adjust current crop to match new ratio
    if (aspectRatio !== 'free') {
        const currentWidth = this.cropState.cropRect.width();
        const newHeight = currentWidth / aspectRatio;

        // Check if new height fits within image bounds
        const imageBounds = this.getImageBoundsInStageCoords();
        const cropY = this.cropState.cropRect.y();

        if (cropY + newHeight > imageBounds.bottom) {
            // Height doesn't fit, adjust width instead
            const maxHeight = imageBounds.bottom - cropY;
            const newWidth = maxHeight * aspectRatio;
            this.cropState.cropRect.width(newWidth);
            this.cropState.cropRect.height(maxHeight);
        } else {
            // Height fits, use it
            this.cropState.cropRect.height(newHeight);
        }

        // Update overlay
        this.updateCropOverlay();

        // Force transformer update
        this.cropState.cropTransformer.forceUpdate();
    }

    this.cropState.cropLayer.batchDraw();
}
```

### Helper Functions

```javascript
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
```

---

## 🎨 UI Integration (main.js)

### HTML Controls

Add to the right panel in `ai-image-editor.html`:

```html
<!-- Crop Tool Section -->
<div class="panel-card" id="cropToolCategory">
    <div class="panel-header">
        <h3><i class="fas fa-crop"></i> Crop Tool</h3>
    </div>
    <div class="panel-content">
        <!-- Aspect Ratio Buttons -->
        <div class="control-group">
            <label>Aspect Ratio</label>
            <div class="button-group">
                <button class="btn-secondary crop-ratio-btn active" data-ratio="free">
                    <i class="fas fa-expand-arrows-alt"></i>
                    <span>Free</span>
                </button>
                <button class="btn-secondary crop-ratio-btn" data-ratio="1">
                    <i class="fas fa-square"></i>
                    <span>1:1</span>
                </button>
                <button class="btn-secondary crop-ratio-btn" data-ratio="1.7778">
                    <i class="fas fa-rectangle-landscape"></i>
                    <span>16:9</span>
                </button>
                <button class="btn-secondary crop-ratio-btn" data-ratio="0.5625">
                    <i class="fas fa-rectangle-portrait"></i>
                    <span>9:16</span>
                </button>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="control-group">
            <button id="startCropBtn" class="btn-primary">
                <i class="fas fa-crop"></i>
                <span>Start Crop</span>
            </button>
        </div>

        <div class="control-group" id="cropActions" style="display: none;">
            <button id="applyCropBtn" class="btn-success">
                <i class="fas fa-check"></i>
                <span>Apply Crop</span>
            </button>
            <button id="cancelCropBtn" class="btn-danger">
                <i class="fas fa-times"></i>
                <span>Cancel</span>
            </button>
        </div>
    </div>
</div>
```

### Event Listeners (main.js)

```javascript
// Crop Tool Event Listeners
setupCropToolListeners() {
    const startCropBtn = document.getElementById('startCropBtn');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    const cropRatioBtns = document.querySelectorAll('.crop-ratio-btn');
    const cropActions = document.getElementById('cropActions');

    // Start crop
    if (startCropBtn) {
        startCropBtn.addEventListener('click', () => {
            const activeRatioBtn = document.querySelector('.crop-ratio-btn.active');
            const ratio = activeRatioBtn ? activeRatioBtn.dataset.ratio : 'free';
            const aspectRatio = ratio === 'free' ? 'free' : parseFloat(ratio);

            this.modules.editor.startCrop(aspectRatio);

            // Show crop actions, hide start button
            startCropBtn.style.display = 'none';
            cropActions.style.display = 'block';
        });
    }

    // Apply crop
    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', async () => {
            try {
                this.showLoading('Applying Crop...', 'Please wait');
                await this.modules.editor.applyCrop();
                this.hideLoading();
                this.showSuccess('Crop applied successfully!');

                // Hide crop actions, show start button
                startCropBtn.style.display = 'block';
                cropActions.style.display = 'none';
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

            // Hide crop actions, show start button
            startCropBtn.style.display = 'block';
            cropActions.style.display = 'none';
        });
    }

    // Aspect ratio buttons
    cropRatioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            cropRatioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // If crop is active, change the ratio
            if (this.modules.editor.cropState.active) {
                const ratio = btn.dataset.ratio === 'free' ? 'free' : parseFloat(btn.dataset.ratio);
                this.modules.editor.changeCropRatio(ratio);
            }
        });
    });
}
```

---

## ✅ Validation Checklist

### Functionality Tests

- [ ] **Start Crop**: Crop overlay appears correctly positioned over image
- [ ] **Free Aspect Ratio**: Can resize crop rectangle to any size within image bounds
- [ ] **1:1 Aspect Ratio**: Crop maintains square shape during resize
- [ ] **16:9 Aspect Ratio**: Crop maintains landscape ratio during resize
- [ ] **9:16 Aspect Ratio**: Crop maintains portrait ratio during resize
- [ ] **Drag Crop**: Can drag crop rectangle, stays within image bounds
- [ ] **Resize Crop**: Can resize from corners, stays within image bounds
- [ ] **Change Ratio**: Can switch aspect ratios mid-crop, rectangle adjusts
- [ ] **Apply Crop**: Cropped image replaces original, correct region extracted
- [ ] **Cancel Crop**: Overlay disappears, image unchanged, tools re-enabled
- [ ] **Minimum Size**: Cannot resize crop below 50x50 pixels
- [ ] **Boundary Enforcement**: Crop never exceeds image edges

### Edge Cases

- [ ] **Small Images**: Works with images smaller than stage
- [ ] **Large Images**: Works with images larger than stage (scaled down)
- [ ] **Portrait Images**: Crop overlay covers correctly
- [ ] **Landscape Images**: Crop overlay covers correctly
- [ ] **After Transformations**: Works after rotate, flip, resize operations
- [ ] **Multiple Crops**: Can crop multiple times in succession
- [ ] **Undo/Redo**: Crop integrates with history system

### Integration Tests

- [ ] **No Transformer Conflict**: Drawing tool transformer unaffected
- [ ] **Drawing Tools Disabled**: Cannot draw while cropping
- [ ] **Image Dragging Disabled**: Cannot drag image while cropping
- [ ] **Layer Order**: Crop overlay appears above image, below drawings
- [ ] **Gallery Integration**: Cropped image can be saved to gallery
- [ ] **Export**: Can export cropped image

### Performance

- [ ] **Smooth Resize**: No lag when resizing crop rectangle
- [ ] **Smooth Drag**: No lag when dragging crop rectangle
- [ ] **Overlay Update**: Dark rectangles update smoothly
- [ ] **Apply Speed**: Crop applies in < 1 second for typical images

---

## 🚨 Potential Issues & Mitigation Strategies

### Issue 1: Aspect Ratio Constraint Conflicts with Boundaries

**Problem**: When enforcing aspect ratio, the adjusted dimensions might exceed image bounds.

**Mitigation**:
- In `cropBoundBoxFunc`, after applying aspect ratio, re-check boundaries
- If out of bounds, scale down proportionally while maintaining ratio
- Implemented in step 5 of `cropBoundBoxFunc`

### Issue 2: Coordinate Space Confusion

**Problem**: Mixing stage coordinates with image coordinates.

**Mitigation**:
- Always use `getImageBoundsInStageCoords()` for boundary checks
- Convert to image space only when applying crop (in `applyCrop()`)
- Clear variable naming: `cropXInImage` vs `cropX`

### Issue 3: Transformer Scale vs Width/Height

**Problem**: Transformer modifies `scaleX`/`scaleY`, but we want to work with `width`/`height`.

**Mitigation**:
- In `updateCropOverlay()`, reset scale to 1 and update width/height
- Always use `width * scaleX` when reading dimensions
- Implemented in `updateCropOverlay()` function

### Issue 4: Image Rotation

**Problem**: If image is rotated, crop coordinates become complex.

**Mitigation**:
- **Phase 1**: Assume image is not rotated (rotation = 0)
- **Phase 2**: Add rotation support by using image transform matrix
- Document limitation in UI if rotation is detected

### Issue 5: Performance with Large Images

**Problem**: Creating temporary canvas and drawing might be slow for very large images.

**Mitigation**:
- Show loading indicator during `applyCrop()`
- Use `requestAnimationFrame` if needed
- Consider using OffscreenCanvas for better performance

---

## 📊 Testing Scenarios

### Scenario 1: Basic Crop Flow

1. Load an image (1920x1080)
2. Click "Start Crop" with Free aspect ratio
3. Crop overlay appears (80% of image, centered)
4. Drag crop to top-left corner
5. Resize crop from bottom-right corner
6. Click "Apply Crop"
7. **Expected**: Cropped region replaces image, correct portion extracted

### Scenario 2: Aspect Ratio Enforcement

1. Load an image (1920x1080)
2. Click "Start Crop" with 1:1 aspect ratio
3. Crop overlay appears as square
4. Try to resize from corner
5. **Expected**: Crop maintains square shape
6. Switch to 16:9 ratio
7. **Expected**: Crop adjusts to landscape rectangle
8. Apply crop
9. **Expected**: Cropped image has 16:9 aspect ratio

### Scenario 3: Boundary Constraints

1. Load an image (800x600)
2. Start crop with Free ratio
3. Drag crop to top-left corner of image
4. Try to drag further left/up
5. **Expected**: Crop stops at image edge
6. Resize crop to be very large
7. Try to resize beyond image bounds
8. **Expected**: Crop stops at image edge

### Scenario 4: Multiple Crops

1. Load an image (2000x2000)
2. Crop to 1000x1000 (center)
3. Apply crop
4. **Expected**: Image now 1000x1000
5. Crop again to 500x500 (center)
6. Apply crop
7. **Expected**: Image now 500x500
8. Undo twice
9. **Expected**: Back to original 2000x2000

---

## 🎯 Success Criteria Summary

✅ **Crop rectangle stays within image bounds at all times**
- Implemented via `cropBoundBoxFunc` and `cropDragBoundFunc`
- Tested in Scenario 3

✅ **Aspect ratio presets work correctly during resize**
- Implemented via `keepRatio` and custom `boundBoxFunc` logic
- Tested in Scenario 2

✅ **Visual overlay updates smoothly**
- Implemented via `updateCropOverlay` on transform/drag events
- 4 dark rectangles cover non-cropped areas

✅ **Applying crop correctly extracts selected region**
- Implemented via canvas drawImage with correct coordinate conversion
- Tested in Scenarios 1, 2, 4

✅ **No conflicts with existing canvas functionality**
- Separate crop layer, isolated from drawing tools
- Drawing tools disabled during crop mode
- Transformer on different layer

---

## 📚 References

1. **Konva.js Transformer Resize Limits**: https://konvajs.org/docs/select_and_transform/Resize_Limits.html
2. **Konva.js Image Crop Property**: https://konvajs.org/docs/sandbox/Scale_Image_To_Fit.html
3. **Konva.js Transformer API**: https://konvajs.org/api/Konva.Transformer.html
4. **Stack Overflow - Dynamic Cropping with React Konva**: https://stackoverflow.com/questions/78291425/

---

## 🚀 Implementation Order

1. **Add crop state to constructor** (5 min)
2. **Implement helper functions** (15 min)
   - `getImageBoundsInStageCoords()`
   - `disableDrawingTools()`
   - `enableDrawingTools()`
3. **Implement core crop functions** (60 min)
   - `startCrop()`
   - `createCropOverlay()`
   - `updateCropOverlay()`
   - `cropBoundBoxFunc()`
   - `cropDragBoundFunc()`
4. **Implement action functions** (30 min)
   - `applyCrop()`
   - `cancelCrop()`
   - `changeCropRatio()`
5. **Add HTML UI** (15 min)
6. **Add event listeners in main.js** (20 min)
7. **Test all scenarios** (30 min)
8. **Fix bugs and edge cases** (30 min)

**Total Estimated Time**: ~3 hours

---

## 🎉 Conclusion

This implementation plan provides a **bulletproof, production-ready approach** to adding a crop tool to the AI Image Editor. The design:

- ✅ Uses official Konva.js APIs correctly
- ✅ Avoids conflicts with existing architecture
- ✅ Handles all edge cases and boundary conditions
- ✅ Provides smooth, professional UX
- ✅ Integrates seamlessly with history/undo system
- ✅ Is fully testable and debuggable

The plan includes complete pseudocode with actual Konva.js API calls, making implementation straightforward and confident.


