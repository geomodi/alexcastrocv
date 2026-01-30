# 🎯 Clothing Swap Implementation Plan
## AI Image Editor - Second Image Upload Feature

---

## 📋 Overview

This plan outlines how to add a **second image upload feature** specifically for AI-powered clothing transfer in the AI Image Editor. The feature will allow users to:
1. Load a person image onto the canvas (existing functionality)
2. Upload a separate clothing/garment image
3. Transfer the clothing from the second image onto the person in the first image
4. See a preview of the clothing before applying the transfer

---

## 🎨 1. UI/UX DESIGN

### Proposed Layout

**Add a new panel card in the LEFT PANEL** between "Upload Image" and "Edit Current Image":

```
LEFT PANEL (420px width):
├── AI Generation (existing)
├── Upload Image (existing)
├── 🆕 Clothing Transfer (NEW)
│   ├── Upload Clothing Image button
│   ├── Clothing preview thumbnail (when uploaded)
│   ├── Clothing analysis display (optional)
│   ├── Transfer button
│   └── Status/progress indicator
├── Edit Current Image (existing)
```

### Visual Design

**Panel Card Structure:**
```html
<div class="panel-card compact-panel" id="clothingTransferPanel">
    <div class="panel-header">
        <h3><i class="fas fa-tshirt"></i> Clothing Transfer</h3>
    </div>
    <div class="panel-content">
        <!-- Upload button -->
        <button id="uploadClothingBtn" class="upload-btn">
            <i class="fas fa-upload"></i>
            <span>Upload Clothing Image</span>
        </button>
        
        <!-- Preview area (hidden until image uploaded) -->
        <div id="clothingPreview" class="clothing-preview" style="display: none;">
            <div class="preview-header">
                <span>Clothing Preview</span>
                <button id="removeClothingBtn" class="btn-icon-small">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <img id="clothingPreviewImg" alt="Clothing preview">
            
            <!-- Optional: Clothing analysis -->
            <div id="clothingAnalysis" class="clothing-analysis">
                <small>Analyzing clothing...</small>
            </div>
        </div>
        
        <!-- Transfer button (enabled only when both images loaded) -->
        <button id="transferClothingBtn" class="btn-primary" disabled>
            <i class="fas fa-exchange-alt"></i>
            <span>Transfer Clothing</span>
        </button>
        
        <!-- Status -->
        <div id="clothingTransferStatus" class="generation-status"></div>
    </div>
</div>
```

### UI States

1. **Initial State:** Only "Upload Clothing Image" button visible
2. **Clothing Uploaded:** Preview thumbnail appears, "Transfer Clothing" button enabled (if canvas has image)
3. **Transferring:** Loading indicator, button disabled
4. **Complete:** Result appears on canvas, clothing image remains for re-use

### Styling Considerations

- **Compact design** to fit in left panel (420px width)
- **Preview thumbnail:** Max 200px width, maintain aspect ratio
- **Consistent styling** with existing panel cards
- **Visual feedback:** Highlight when both images are ready
- **Disabled state:** Clear indication when transfer button is disabled

---

## 💾 2. STORAGE STRATEGY

### Approach: In-Memory Storage (Recommended)

Store the clothing image as a **class property** in a new `ClothingSwapManager` module.

**Why this approach:**
- ✅ Temporary storage (not needed after session)
- ✅ No localStorage pollution
- ✅ Easy to clear/reset
- ✅ Fast access for processing
- ✅ No size limitations (unlike localStorage)

### Data Structure

```javascript
class ClothingSwapManager {
    constructor(app) {
        this.app = app;
        this.clothingImage = null;        // HTMLImageElement
        this.clothingImageUrl = null;     // Blob URL for preview
        this.clothingImageData = null;    // Base64 for API
        this.clothingAnalysis = null;     // Optional: AI analysis results
    }
}
```

### Alternative: SessionStorage

If persistence across page refreshes is desired (but not recommended):
```javascript
// Store in sessionStorage (cleared when tab closes)
sessionStorage.setItem('clothingImage', base64Data);
```

**Recommendation:** Use in-memory storage for simplicity and performance.

---

## 🖼️ 3. PREVIEW DISPLAY

### Preview Location

**Inside the Clothing Transfer panel card** (left panel), below the upload button.

### Preview Features

1. **Thumbnail Display:**
   - Max width: 200px
   - Maintain aspect ratio
   - Rounded corners for polish
   - Border to distinguish from background

2. **Remove Button:**
   - Small "X" button in top-right corner
   - Clears the clothing image
   - Resets the panel to initial state

3. **Optional - Clothing Analysis Display:**
   - Show detected clothing type (e.g., "T-shirt", "Jeans")
   - Show dominant colors
   - Show fabric texture description
   - Helps user confirm correct clothing detected

### Preview Implementation

```javascript
function displayClothingPreview(imageUrl) {
    const preview = document.getElementById('clothingPreview');
    const previewImg = document.getElementById('clothingPreviewImg');
    
    previewImg.src = imageUrl;
    preview.style.display = 'block';
    
    // Enable transfer button if canvas has image
    updateTransferButtonState();
}

function removeClothingPreview() {
    const preview = document.getElementById('clothingPreview');
    preview.style.display = 'none';
    
    // Clear stored data
    this.clothingImage = null;
    this.clothingImageUrl = null;
    this.clothingImageData = null;
    
    // Disable transfer button
    document.getElementById('transferClothingBtn').disabled = true;
}
```

---

## 🔄 4. USER WORKFLOW

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Load Person Image                                  │
├─────────────────────────────────────────────────────────────┤
│ User generates image with AI OR uploads image               │
│ → Image appears on Konva canvas                            │
│ → "Clothing Transfer" panel becomes available              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Upload Clothing Image                              │
├─────────────────────────────────────────────────────────────┤
│ User clicks "Upload Clothing Image" button                  │
│ → File picker opens                                         │
│ → User selects clothing image (can be clothing alone OR    │
│   another person wearing different clothes)                 │
│ → Preview thumbnail appears in panel                        │
│ → Optional: AI analyzes clothing (color, type, texture)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Review & Confirm                                   │
├─────────────────────────────────────────────────────────────┤
│ User sees:                                                  │
│ - Person image on canvas                                    │
│ - Clothing preview in left panel                            │
│ - "Transfer Clothing" button is now ENABLED                │
│ → User can adjust canvas image if needed (crop, etc.)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Transfer Clothing                                  │
├─────────────────────────────────────────────────────────────┤
│ User clicks "Transfer Clothing" button                      │
│ → Loading indicator appears                                 │
│ → Behind the scenes:                                        │
│   1. Get canvas image dimensions                            │
│   2. Pad clothing image to match aspect ratio               │
│   3. Create enhanced prompt                                 │
│   4. Call Gemini API with both images                       │
│   5. Receive result                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: View Result                                        │
├─────────────────────────────────────────────────────────────┤
│ → Result image appears on canvas                            │
│ → Clothing preview remains (can transfer again)             │
│ → User can:                                                 │
│   - Save to gallery                                         │
│   - Export image                                            │
│   - Try different clothing                                  │
│   - Edit result with other tools                            │
└─────────────────────────────────────────────────────────────┘
```

### Error Handling

**Scenario 1:** User tries to transfer without canvas image
- **Action:** Show notification "Please load a person image onto the canvas first"
- **UI:** Transfer button remains disabled

**Scenario 2:** User tries to transfer without clothing image
- **Action:** Show notification "Please upload a clothing image first"
- **UI:** Transfer button remains disabled

**Scenario 3:** API call fails
- **Action:** Show error notification with retry option
- **UI:** Reset to ready state, allow retry

**Scenario 4:** Invalid image format
- **Action:** Show notification "Please upload a valid image file (PNG, JPEG, WebP)"
- **UI:** Clear invalid upload, return to upload state

---

## 🏗️ 5. CODE ARCHITECTURE

### New Module: `clothing-swap-manager.js`

**Purpose:** Handle all clothing swap functionality including upload, storage, pre-processing, and API integration.

**Location:** `js/ai-editor/clothing-swap-manager.js`

**Class Structure:**
```javascript
class ClothingSwapManager {
    constructor(app) {
        this.app = app;
        this.clothingImage = null;
        this.clothingImageUrl = null;
        this.clothingImageData = null;
        this.clothingAnalysis = null;
    }
    
    // Upload & Storage
    async handleClothingUpload(file) { }
    removeClothing() { }
    
    // Pre-processing
    async padImageToAspectRatio(image, targetWidth, targetHeight, paddingColor) { }
    async imageToBase64(image) { }
    loadImage(url) { }
    
    // Clothing Analysis (Optional)
    async analyzeClothing(imageData) { }
    
    // Main Transfer Function
    async performClothingTransfer(customPrompt = '') { }
    
    // UI Updates
    updatePreview(imageUrl) { }
    updateTransferButtonState() { }
    showStatus(message, type) { }
    
    // Helpers
    getCanvasImageData() { }
    getCanvasDimensions() { }
}
```

### Modified Modules

#### 1. **main.js** (AIImageEditor class)
**Changes:**
- Add `clothingSwap` to modules
- Initialize ClothingSwapManager
- Add event listeners for clothing upload/transfer buttons

```javascript
async initializeModules() {
    // ... existing modules ...
    
    // Initialize Clothing Swap Manager
    this.modules.clothingSwap = new ClothingSwapManager(this);
    
    console.log('📦 [AI EDITOR] All modules initialized');
}

setupEventListeners() {
    // ... existing listeners ...
    
    // Clothing Transfer
    const uploadClothingBtn = document.getElementById('uploadClothingBtn');
    const transferClothingBtn = document.getElementById('transferClothingBtn');
    const removeClothingBtn = document.getElementById('removeClothingBtn');
    
    if (uploadClothingBtn) {
        uploadClothingBtn.addEventListener('click', () => {
            this.modules.clothingSwap.handleUploadClick();
        });
    }
    
    if (transferClothingBtn) {
        transferClothingBtn.addEventListener('click', () => {
            this.modules.clothingSwap.performClothingTransfer();
        });
    }
    
    if (removeClothingBtn) {
        removeClothingBtn.addEventListener('click', () => {
            this.modules.clothingSwap.removeClothing();
        });
    }
}
```

#### 2. **gemini-api.js** (GeminiAPI class)
**Changes:**
- Add new method `clothingSwap(personImageData, clothingImageData, prompt)`
- Implement hybrid approach from research document

```javascript
/**
 * Perform clothing swap using hybrid approach
 * @param {string} personImageData - Base64 encoded person image
 * @param {string} clothingImageData - Base64 encoded clothing image (already padded)
 * @param {string} prompt - Custom prompt for clothing transfer
 * @returns {Promise<string>} Base64 encoded result image
 */
async clothingSwap(personImageData, clothingImageData, prompt) {
    // Implementation from CLOTHING_SWAP_RESEARCH.md Solution 5
}
```

#### 3. **ai-image-editor.html**
**Changes:**
- Add new panel card for Clothing Transfer (after Upload Image section)
- Add hidden file input for clothing upload
- Add CSS classes for clothing preview

#### 4. **css/ai-editor.css**
**Changes:**
- Add styles for clothing transfer panel
- Add styles for clothing preview thumbnail
- Add styles for clothing analysis display

### File Modification Summary

| File | Modification Type | Complexity |
|------|------------------|------------|
| `js/ai-editor/clothing-swap-manager.js` | **NEW FILE** | High |
| `js/ai-editor/main.js` | Add module init + event listeners | Low |
| `js/ai-editor/gemini-api.js` | Add `clothingSwap()` method | Medium |
| `ai-image-editor.html` | Add panel card + file input | Low |
| `css/ai-editor.css` | Add styling for new components | Low |

---

## 🔧 6. PRE-PROCESSING LOGIC

### Location: `ClothingSwapManager` class

**Why here:**
- ✅ Keeps all clothing swap logic in one place
- ✅ Separates concerns (Gemini API stays focused on API calls)
- ✅ Easier to test and maintain
- ✅ Can be reused for other features

### Implementation

```javascript
/**
 * Pad clothing image to match canvas aspect ratio
 * @param {HTMLImageElement} image - Clothing image
 * @param {number} targetWidth - Canvas width
 * @param {number} targetHeight - Canvas height
 * @param {string} paddingColor - Padding color (default: white)
 * @returns {Promise<string>} Base64 padded image
 */
async padImageToAspectRatio(image, targetWidth, targetHeight, paddingColor = '#FFFFFF') {
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
    
    // Draw image centered
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    
    // Return as base64 (without data URL prefix)
    return canvas.toDataURL('image/png').split(',')[1];
}
```

### Pre-processing Flow

```
Clothing Image Upload
        ↓
Load as HTMLImageElement
        ↓
Get Canvas Dimensions (from Konva editor)
        ↓
Pad Image to Match Aspect Ratio
        ↓
Convert to Base64
        ↓
Store in ClothingSwapManager
        ↓
Ready for API Call
```

---

## ⚠️ 7. CHALLENGES & CONSIDERATIONS

### Challenge 1: Canvas Image Access
**Issue:** Need to get current canvas image as base64  
**Solution:** Use existing `KonvaEditor.getImageAsBase64()` method  
**Code:**
```javascript
getCanvasImageData() {
    if (!this.app.modules.editor) {
        throw new Error('No image on canvas');
    }
    return this.app.modules.editor.getImageAsBase64();
}
```

### Challenge 2: Aspect Ratio Calculation
**Issue:** Need accurate canvas dimensions  
**Solution:** Get from Konva image node, not stage  
**Code:**
```javascript
getCanvasDimensions() {
    const editor = this.app.modules.editor;
    if (!editor || !editor.imageNode) {
        throw new Error('No image on canvas');
    }
    return {
        width: editor.imageNode.width(),
        height: editor.imageNode.height()
    };
}
```

### Challenge 3: Large Image Processing
**Issue:** Padding large images may be slow  
**Solution:** Show loading indicator during pre-processing  
**Code:**
```javascript
async performClothingTransfer() {
    this.showStatus('Preparing images...', 'loading');
    
    // Pre-process (may take time for large images)
    const paddedClothingData = await this.padImageToAspectRatio(...);
    
    this.showStatus('Transferring clothing...', 'loading');
    
    // API call
    const result = await this.app.modules.gemini.clothingSwap(...);
    
    this.showStatus('Complete!', 'success');
}
```

### Challenge 4: Memory Management
**Issue:** Storing multiple large images in memory  
**Solution:** Revoke blob URLs when no longer needed  
**Code:**
```javascript
removeClothing() {
    // Revoke blob URL to free memory
    if (this.clothingImageUrl) {
        URL.revokeObjectURL(this.clothingImageUrl);
    }
    
    this.clothingImage = null;
    this.clothingImageUrl = null;
    this.clothingImageData = null;
}
```

### Challenge 5: User Experience
**Issue:** Users may not understand the feature  
**Solution:** Add helpful tooltips and instructions  
**UI Elements:**
- Tooltip on upload button: "Upload an image of clothing or a person wearing clothes"
- Help text: "The clothing from this image will be transferred onto the person on the canvas"
- Visual indicators when both images are ready

---

## 📊 8. IMPLEMENTATION PHASES

### Phase 1: Basic UI & Upload (2-3 hours)
- ✅ Add HTML panel card
- ✅ Add CSS styling
- ✅ Create ClothingSwapManager class skeleton
- ✅ Implement file upload handling
- ✅ Display preview thumbnail
- ✅ Add remove functionality

### Phase 2: Pre-processing Logic (2-3 hours)
- ✅ Implement `padImageToAspectRatio()`
- ✅ Implement `imageToBase64()`
- ✅ Implement `loadImage()`
- ✅ Test with various aspect ratios
- ✅ Add error handling

### Phase 3: API Integration (2-3 hours)
- ✅ Add `clothingSwap()` method to GeminiAPI
- ✅ Implement hybrid approach from research
- ✅ Create enhanced prompt generation
- ✅ Handle API responses
- ✅ Load result onto canvas

### Phase 4: Polish & Testing (2-3 hours)
- ✅ Add loading indicators
- ✅ Add error messages
- ✅ Add success notifications
- ✅ Test with various image combinations
- ✅ Add tooltips and help text
- ✅ Optimize performance

### Phase 5: Optional Enhancements (Future)
- ⚠️ Add clothing analysis with Gemini
- ⚠️ Add before/after comparison view
- ⚠️ Add ability to adjust padding color
- ⚠️ Add prompt customization options
- ⚠️ Add clothing history (multiple clothing options)

---

## ✅ 9. SUCCESS CRITERIA

### Functional Requirements
- ✅ User can upload a clothing image
- ✅ Preview thumbnail displays correctly
- ✅ Transfer button enables only when both images present
- ✅ Clothing image is padded to match canvas aspect ratio
- ✅ API call succeeds with both images
- ✅ Result appears on canvas with correct aspect ratio
- ✅ User can remove clothing and upload different one

### Quality Requirements
- ✅ No aspect ratio distortion in results
- ✅ Fast pre-processing (<1 second for typical images)
- ✅ Clear error messages for all failure cases
- ✅ Responsive UI (works on different screen sizes)
- ✅ Memory efficient (no leaks from blob URLs)

### User Experience Requirements
- ✅ Intuitive workflow (clear next steps)
- ✅ Visual feedback at each stage
- ✅ Helpful tooltips and instructions
- ✅ Professional appearance (matches existing design)

---

## 🚀 10. NEXT STEPS

### Before Implementation
1. **Review this plan** - Confirm approach is correct
2. **Discuss any concerns** - Address potential issues
3. **Finalize UI design** - Confirm panel placement and styling
4. **Prepare test images** - Gather various aspect ratios for testing

### During Implementation
1. **Start with Phase 1** - Get basic UI working first
2. **Test incrementally** - Verify each phase before moving on
3. **Use console logging** - Track progress and debug issues
4. **Commit frequently** - Save progress at each milestone

### After Implementation
1. **Test thoroughly** - Try various image combinations
2. **Gather feedback** - See if workflow makes sense
3. **Iterate** - Refine based on real usage
4. **Document** - Add comments and usage instructions

---

## 📝 SUMMARY

**Recommended Approach:**
- ✅ Add new panel card in left panel for Clothing Transfer
- ✅ Create new `ClothingSwapManager` module for all functionality
- ✅ Store clothing image in-memory (class property)
- ✅ Display preview thumbnail in panel
- ✅ Pre-process clothing image to match canvas aspect ratio
- ✅ Use hybrid approach from research document for API call
- ✅ Implement in 4 phases over ~10 hours

**Key Benefits:**
- ✅ Clean separation of concerns
- ✅ Modular architecture (easy to maintain)
- ✅ Follows existing code patterns
- ✅ Minimal changes to existing modules
- ✅ Scalable for future enhancements

---

**Plan Created:** 2025-10-18  
**Status:** Ready for Review ✅  
**Estimated Implementation Time:** 10-12 hours

