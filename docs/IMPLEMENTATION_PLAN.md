# AI Image Editor - Implementation Plan for 3 New Features

## 📋 Overview

This document provides a comprehensive implementation plan for:
1. **Image Upload Functionality** - Upload local images to canvas
2. **Crop Tool with Aspect Ratio Presets** - Crop with 1:1, 16:9, 9:16, freeform
3. **Layer System for Complex Edits** - Multi-layer management like Photoshop

---

## 🎯 FEATURE 1: Image Upload Functionality

### Objective
Allow users to upload images from their device and load them into the Konva canvas.

### Technical Approach
- HTML5 File API for file selection
- Drag-and-drop support
- File validation (type, size)
- Convert to data URL and load via existing `loadImage()` method

### Files to Modify

**1. `ai-image-editor.html` - Add upload section in left panel (after line 158)**
```html
<div class="panel-card">
    <div class="panel-header">
        <h3><i class="fas fa-upload"></i> Upload Image</h3>
    </div>
    <div class="panel-content">
        <div class="upload-zone" id="uploadZone">
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <p class="upload-text">Drag & drop an image here</p>
            <p class="upload-subtext">or</p>
            <button type="button" id="selectFileBtn" class="btn-secondary">
                <i class="fas fa-folder-open"></i> Browse Files
            </button>
            <input type="file" id="imageFileInput" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
        </div>
        <small class="help-text">Supported: PNG, JPEG, WebP, GIF (Max 10MB)</small>
    </div>
</div>
```

**2. `css/ai-editor.css` - Add upload styles (after line 400)**
```css
.upload-zone {
  border: 2px dashed rgba(0, 212, 255, 0.3);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  text-align: center;
  background: rgba(0, 212, 255, 0.02);
  transition: all 0.3s ease;
  cursor: pointer;
}
.upload-zone:hover, .upload-zone.drag-over {
  border-color: var(--primary-color);
  background: rgba(0, 212, 255, 0.05);
}
.upload-icon { font-size: 2.5rem; color: var(--primary-color); margin-bottom: 0.75rem; }
.upload-text { font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.25rem; }
.upload-subtext { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
```

**3. `js/ai-editor/main.js` - Add event listeners in `setupEventListeners()` (line 275)**
```javascript
// Image Upload
const selectFileBtn = document.getElementById('selectFileBtn');
const imageFileInput = document.getElementById('imageFileInput');
const uploadZone = document.getElementById('uploadZone');

if (selectFileBtn && imageFileInput) {
    selectFileBtn.addEventListener('click', () => imageFileInput.click());
    imageFileInput.addEventListener('change', (e) => this.handleImageUpload(e.target.files[0]));
}

if (uploadZone) {
    uploadZone.addEventListener('click', (e) => {
        if (!e.target.closest('#selectFileBtn')) imageFileInput.click();
    });
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) this.handleImageUpload(e.dataTransfer.files[0]);
    });
}
```

**4. `js/ai-editor/main.js` - Add upload handler method (line 900)**
```javascript
async handleImageUpload(file) {
    if (!file) return this.showError('No file selected');
    
    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        return this.showError('Invalid file type. Please upload PNG, JPEG, WebP, or GIF');
    }
    
    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        return this.showError('File too large. Maximum size is 10MB');
    }
    
    try {
        this.showLoading('Loading Image...', 'Please wait');
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                await this.loadImageToCanvas(e.target.result);
                
                // Save to gallery
                try {
                    const imageId = await this.modules.gallery.addImage(e.target.result, `Uploaded: ${file.name}`, {
                        type: 'uploaded',
                        filename: file.name
                    });
                    this.modules.gallery.setActiveImage(imageId);
                    this.renderGallery();
                } catch (galleryError) {
                    console.warn('⚠️ Failed to save to gallery:', galleryError);
                }
                
                this.hideLoading();
                this.showSuccess('Image uploaded successfully!');
            } catch (error) {
                this.hideLoading();
                this.showError('Failed to load image: ' + error.message);
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
    }
}
```

### Testing Checklist
- [ ] Upload PNG, JPEG, WebP, GIF files
- [ ] Test file size validation (>10MB)
- [ ] Test invalid file type
- [ ] Test drag-and-drop
- [ ] Verify image loads to canvas
- [ ] Verify image saves to gallery

---

## 🎯 FEATURE 2: Crop Tool with Aspect Ratio Presets

### Objective
Implement cropping tool using Konva.js with freeform and preset aspect ratios.

### Technical Approach
- Use `Konva.Rect` for crop selection
- Use `Konva.Transformer` for resizing with aspect ratio constraints
- Semi-transparent overlay for cropped-out area
- Extract cropped region using `stage.toDataURL()` with coordinates

### Files to Modify

**1. `ai-image-editor.html` - Add crop button and controls in right panel (after line 310)**
```html
<!-- Add to transformations tool-grid -->
<button type="button" id="cropTool" class="tool-icon-btn" data-tooltip="Crop Image">
    <i class="fas fa-crop-alt"></i>
</button>

<!-- Add crop controls after resize-controls -->
<div class="crop-controls" id="cropControls" style="display: none;">
    <div class="crop-presets">
        <label class="control-label"><i class="fas fa-crop"></i> Aspect Ratio</label>
        <div class="preset-buttons">
            <button type="button" class="preset-btn active" data-ratio="free">
                <i class="fas fa-expand"></i><span>Freeform</span>
            </button>
            <button type="button" class="preset-btn" data-ratio="1:1">
                <i class="fas fa-square"></i><span>1:1</span>
            </button>
            <button type="button" class="preset-btn" data-ratio="16:9">
                <i class="fas fa-rectangle-landscape"></i><span>16:9</span>
            </button>
            <button type="button" class="preset-btn" data-ratio="9:16">
                <i class="fas fa-rectangle-portrait"></i><span>9:16</span>
            </button>
        </div>
    </div>
    <div class="crop-actions">
        <button type="button" id="applyCrop" class="tool-btn primary">
            <i class="fas fa-check"></i> Apply Crop
        </button>
        <button type="button" id="cancelCrop" class="tool-btn secondary">
            <i class="fas fa-times"></i> Cancel
        </button>
    </div>
</div>
```

**2. `css/ai-editor.css` - Add crop styles (after line 500)**
```css
.crop-controls {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: var(--border-radius);
}
.preset-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.preset-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--primary-color);
}
.preset-btn.active {
  background: rgba(0, 212, 255, 0.15);
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.crop-actions { display: flex; gap: 0.5rem; }
.crop-actions .tool-btn { flex: 1; }
```

**3. `js/ai-editor/konva-editor.js` - Add crop state and methods**

Add to constructor (line 50):
```javascript
// Crop state
this.cropState = {
    active: false,
    cropRect: null,
    cropTransformer: null,
    aspectRatio: null,
    overlayRects: []
};
```

Add new methods (after line 500):
```javascript
parseAspectRatio(ratio) {
    switch (ratio) {
        case '1:1': return 1;
        case '16:9': return 16 / 9;
        case '9:16': return 9 / 16;
        default: return null;
    }
}

startCrop(ratio = 'free') {
    if (!this.imageNode) return console.warn('⚠️ No image to crop');
    
    this.cropState.aspectRatio = this.parseAspectRatio(ratio);
    
    const imageWidth = this.imageNode.width() * Math.abs(this.imageNode.scaleX());
    const imageHeight = this.imageNode.height() * Math.abs(this.imageNode.scaleY());
    const imageX = this.imageNode.x() - (imageWidth / 2);
    const imageY = this.imageNode.y() - (imageHeight / 2);
    
    let cropWidth = imageWidth * 0.8;
    let cropHeight = imageHeight * 0.8;
    
    if (this.cropState.aspectRatio) {
        const imageAspect = imageWidth / imageHeight;
        if (this.cropState.aspectRatio > imageAspect) {
            cropWidth = imageWidth * 0.8;
            cropHeight = cropWidth / this.cropState.aspectRatio;
        } else {
            cropHeight = imageHeight * 0.8;
            cropWidth = cropHeight * this.cropState.aspectRatio;
        }
    }
    
    const cropX = imageX + (imageWidth - cropWidth) / 2;
    const cropY = imageY + (imageHeight - cropHeight) / 2;
    
    this.cropState.cropRect = new Konva.Rect({
        x: cropX, y: cropY, width: cropWidth, height: cropHeight,
        stroke: '#00d4ff', strokeWidth: 2, dash: [10, 5],
        draggable: true, name: 'cropRect'
    });
    
    this.cropState.cropTransformer = new Konva.Transformer({
        nodes: [this.cropState.cropRect],
        keepRatio: this.cropState.aspectRatio !== null,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        borderStroke: '#00d4ff', borderStrokeWidth: 2,
        anchorStroke: '#00d4ff', anchorFill: '#ffffff', anchorSize: 10
    });
    
    this.createCropOverlay(imageX, imageY, imageWidth, imageHeight);
    this.drawingLayer.add(this.cropState.cropRect);
    this.drawingLayer.add(this.cropState.cropTransformer);
    this.drawingLayer.batchDraw();
    
    this.cropState.cropRect.on('dragmove transform', () => {
        this.updateCropOverlay(imageX, imageY, imageWidth, imageHeight);
    });
    
    this.cropState.active = true;
}

createCropOverlay(imageX, imageY, imageWidth, imageHeight) {
    const cropRect = this.cropState.cropRect;
    const overlayColor = 'rgba(0, 0, 0, 0.6)';
    
    this.cropState.overlayRects = [
        new Konva.Rect({ x: imageX, y: imageY, width: imageWidth, height: cropRect.y() - imageY, fill: overlayColor, listening: false }),
        new Konva.Rect({ x: imageX, y: cropRect.y() + cropRect.height(), width: imageWidth, height: imageY + imageHeight - (cropRect.y() + cropRect.height()), fill: overlayColor, listening: false }),
        new Konva.Rect({ x: imageX, y: cropRect.y(), width: cropRect.x() - imageX, height: cropRect.height(), fill: overlayColor, listening: false }),
        new Konva.Rect({ x: cropRect.x() + cropRect.width(), y: cropRect.y(), width: imageX + imageWidth - (cropRect.x() + cropRect.width()), height: cropRect.height(), fill: overlayColor, listening: false })
    ];
    
    this.cropState.overlayRects.forEach(overlay => {
        this.drawingLayer.add(overlay);
        overlay.moveToBottom();
    });
    this.drawingLayer.batchDraw();
}

updateCropOverlay(imageX, imageY, imageWidth, imageHeight) {
    const cropRect = this.cropState.cropRect;
    const [top, bottom, left, right] = this.cropState.overlayRects;
    
    top.height(cropRect.y() - imageY);
    bottom.y(cropRect.y() + cropRect.height());
    bottom.height(imageY + imageHeight - (cropRect.y() + cropRect.height()));
    left.y(cropRect.y());
    left.width(cropRect.x() - imageX);
    left.height(cropRect.height());
    right.x(cropRect.x() + cropRect.width());
    right.y(cropRect.y());
    right.width(imageX + imageWidth - (cropRect.x() + cropRect.width()));
    right.height(cropRect.height());
    
    this.drawingLayer.batchDraw();
}

async applyCrop() {
    if (!this.cropState.active) return;
    
    const cropRect = this.cropState.cropRect;
    this.cropState.cropRect.visible(false);
    this.cropState.cropTransformer.visible(false);
    this.cropState.overlayRects.forEach(o => o.visible(false));
    this.drawingLayer.batchDraw();
    
    const stageDataURL = this.stage.toDataURL({
        x: cropRect.x(), y: cropRect.y(),
        width: cropRect.width(), height: cropRect.height(),
        pixelRatio: 1
    });
    
    this.clear();
    await this.loadImage(stageDataURL);
    this.cancelCrop();
    this.saveState();
}

cancelCrop() {
    if (!this.cropState.active) return;
    
    if (this.cropState.cropRect) this.cropState.cropRect.destroy();
    if (this.cropState.cropTransformer) this.cropState.cropTransformer.destroy();
    this.cropState.overlayRects.forEach(o => o.destroy());
    this.cropState.overlayRects = [];
    this.drawingLayer.batchDraw();
    this.cropState.active = false;
}

changeCropRatio(ratio) {
    if (!this.cropState.active) return;
    
    const newAspectRatio = this.parseAspectRatio(ratio);
    this.cropState.aspectRatio = newAspectRatio;
    
    if (this.cropState.cropTransformer) {
        this.cropState.cropTransformer.keepRatio(newAspectRatio !== null);
        
        if (newAspectRatio) {
            const cropRect = this.cropState.cropRect;
            cropRect.height(cropRect.width() / newAspectRatio);
            
            const imageWidth = this.imageNode.width() * Math.abs(this.imageNode.scaleX());
            const imageHeight = this.imageNode.height() * Math.abs(this.imageNode.scaleY());
            const imageX = this.imageNode.x() - (imageWidth / 2);
            const imageY = this.imageNode.y() - (imageHeight / 2);
            this.updateCropOverlay(imageX, imageY, imageWidth, imageHeight);
        }
        this.drawingLayer.batchDraw();
    }
}
```


