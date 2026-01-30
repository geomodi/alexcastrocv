# 🔬 AI-Powered Clothing Swap Research Report
## Google Gemini 2.5 Flash API - Aspect Ratio Solutions

---

## 📋 Executive Summary

**Problem:** When using Gemini 2.5 Flash API with multiple images of different aspect ratios for clothing transfer, the output image adopts the aspect ratio of the **last image** in the array, causing distortion of the primary subject.

**Root Cause:** Confirmed from official Google documentation - this is expected API behavior, not a bug.

**Solution:** Multiple viable approaches exist, with **Hybrid Pre-processing + Prompt Engineering** being the most reliable.

---

## 🎯 ROOT CAUSE ANALYSIS

### Why This Happens

From the official [Google Developers Blog](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/):

> **"If you upload multiple images with different aspect ratios, the model will adopt the aspect ratio of the last image provided."**

This is **intentional API behavior**, not a bug. The Gemini 2.5 Flash Image model:
1. Processes images in the order they appear in the `parts` array
2. Uses the **last image's aspect ratio** as the output canvas size
3. Attempts to compose all elements onto this canvas
4. May distort, crop, or resize earlier images to fit

### Impact on Clothing Swap

**Scenario:**
- **Image 1:** Person (e.g., 1080x1920 portrait - 9:16 ratio)
- **Image 2:** Clothing item (e.g., 800x600 landscape - 4:3 ratio)
- **Result:** Output is 4:3 landscape, person is distorted/cropped

---

## 💡 SOLUTION 1: Pre-processing (Image Padding/Letterboxing)
### ⭐ RECOMMENDED - Most Reliable

### Concept
Resize the clothing image to match the person image's aspect ratio by adding padding (letterboxing/pillarboxing) before sending to the API.

### Implementation

```javascript
/**
 * Pad an image to match a target aspect ratio
 * @param {HTMLImageElement} image - Source image
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @param {string} paddingColor - Padding color (default: white)
 * @returns {Promise<string>} Base64 padded image
 */
async function padImageToAspectRatio(image, targetWidth, targetHeight, paddingColor = '#FFFFFF') {
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
    
    // Return as base64
    return canvas.toDataURL('image/png').split(',')[1];
}

/**
 * Clothing swap with aspect ratio matching
 */
async function clothingSwapWithPadding(personImageUrl, clothingImageUrl, prompt) {
    // Load both images
    const personImg = await loadImage(personImageUrl);
    const clothingImg = await loadImage(clothingImageUrl);
    
    // Get person image dimensions (this is our target)
    const targetWidth = personImg.width;
    const targetHeight = personImg.height;
    
    console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);
    
    // Pad clothing image to match person's aspect ratio
    const paddedClothingBase64 = await padImageToAspectRatio(
        clothingImg, 
        targetWidth, 
        targetHeight,
        '#FFFFFF' // White padding
    );
    
    // Get person image as base64
    const personBase64 = await imageToBase64(personImg);
    
    // Call Gemini API with matched aspect ratios
    const requestBody = {
        contents: [{
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: personBase64
                    }
                },
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: paddedClothingBase64
                    }
                },
                {
                    text: prompt
                }
            ]
        }],
        generationConfig: {
            responseModalities: ['Image']
        }
    };
    
    // Make API call...
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    
    return response;
}

// Helper function to load image
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

// Helper function to convert image to base64
async function imageToBase64(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
}
```

### Pros
✅ **Most reliable** - Guarantees aspect ratio match  
✅ **No API limitations** - Works within documented behavior  
✅ **Predictable results** - Output always matches person's dimensions  
✅ **Clean composition** - Padding provides neutral background  

### Cons
❌ Requires client-side image processing  
❌ Slightly larger file sizes due to padding  
❌ May need to crop padding from final result if clothing was small  

---

## 💡 SOLUTION 2: Image Order Strategy
### ⚡ Simplest Implementation

### Concept
Place the person image **last** in the parts array so the output adopts the person's aspect ratio.

### Implementation

```javascript
async function clothingSwapWithOrderStrategy(personImageUrl, clothingImageUrl, prompt) {
    const personBase64 = await urlToBase64(personImageUrl);
    const clothingBase64 = await urlToBase64(clothingImageUrl);
    
    const requestBody = {
        contents: [{
            parts: [
                // CLOTHING FIRST
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: clothingBase64
                    }
                },
                // PERSON LAST (determines output aspect ratio)
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: personBase64
                    }
                },
                {
                    text: `Take the clothing from the first image and transfer it onto the person in the second image. ${prompt}`
                }
            ]
        }],
        generationConfig: {
            responseModalities: ['Image']
        }
    };
    
    // Make API call...
}
```

### Pros
✅ **Simplest** - Just reorder the images  
✅ **No preprocessing** - Works with original images  
✅ **Fast** - No additional processing time  

### Cons
❌ **Less reliable** - Clothing may still be distorted to fit  
❌ **Unpredictable** - AI may not understand the intent correctly  
❌ **Composition issues** - Clothing might not transfer cleanly  

---

## 💡 SOLUTION 3: Prompt Engineering
### 📝 Supplementary Technique

### Concept
Use explicit prompts to instruct the API to preserve the original image's dimensions and aspect ratio.

### Implementation

```javascript
async function clothingSwapWithPromptEngineering(personImageUrl, clothingImageUrl) {
    const personBase64 = await urlToBase64(personImageUrl);
    const clothingBase64 = await urlToBase64(clothingImageUrl);
    
    // Get original dimensions
    const personImg = await loadImage(personImageUrl);
    const originalWidth = personImg.width;
    const originalHeight = personImg.height;
    const aspectRatio = (originalWidth / originalHeight).toFixed(2);
    
    const enhancedPrompt = `
        Take the clothing item from the second image and transfer it onto the person in the first image.
        
        CRITICAL REQUIREMENTS:
        - Preserve the EXACT composition and framing of the first image
        - Maintain the original aspect ratio of ${aspectRatio}:1 (${originalWidth}x${originalHeight})
        - Keep the person's pose, position, and proportions EXACTLY as shown
        - Do NOT crop, resize, or reframe the person
        - Only modify the clothing while keeping everything else identical
        - Ensure the output image has the same dimensions as the first image
        
        The person should remain in the exact same position with the exact same framing.
    `;
    
    const requestBody = {
        contents: [{
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: personBase64
                    }
                },
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: clothingBase64
                    }
                },
                {
                    text: enhancedPrompt
                }
            ]
        }],
        generationConfig: {
            responseModalities: ['Image']
        }
    };
    
    // Make API call...
}
```

### Pros
✅ **Easy to implement** - Just modify the prompt  
✅ **No preprocessing** - Works with original images  
✅ **Can be combined** with other solutions  

### Cons
❌ **Least reliable** - API may ignore dimension instructions  
❌ **Inconsistent** - Results vary based on AI interpretation  
❌ **Not guaranteed** - Documented behavior overrides prompts  

---

## 💡 SOLUTION 4: Post-processing
### 🔧 Fallback Option

### Concept
Accept the distorted output and crop/resize it back to the original aspect ratio.

### Implementation

```javascript
async function postProcessClothingSwap(resultImageUrl, originalWidth, originalHeight) {
    const resultImg = await loadImage(resultImageUrl);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    
    // Calculate crop area to maintain aspect ratio
    const resultAspect = resultImg.width / resultImg.height;
    const targetAspect = originalWidth / originalHeight;
    
    let sourceX, sourceY, sourceWidth, sourceHeight;
    
    if (resultAspect > targetAspect) {
        // Result is wider - crop sides
        sourceHeight = resultImg.height;
        sourceWidth = resultImg.height * targetAspect;
        sourceX = (resultImg.width - sourceWidth) / 2;
        sourceY = 0;
    } else {
        // Result is taller - crop top/bottom
        sourceWidth = resultImg.width;
        sourceHeight = resultImg.width / targetAspect;
        sourceX = 0;
        sourceY = (resultImg.height - sourceHeight) / 2;
    }
    
    // Draw cropped result
    ctx.drawImage(
        resultImg,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, originalWidth, originalHeight
    );
    
    return canvas.toDataURL('image/png');
}
```

### Pros
✅ **Salvages bad results** - Can fix aspect ratio issues  
✅ **Simple** - Just crop/resize after generation  

### Cons
❌ **Quality loss** - May crop important parts  
❌ **Doesn't fix distortion** - Person may still look stretched  
❌ **Wasteful** - Generates then discards parts of image  

---

## 💡 SOLUTION 5: Hybrid Approach (RECOMMENDED)
### 🏆 Best of All Worlds

### Concept
Combine **pre-processing + prompt engineering + image order** for maximum reliability.

### Full Implementation

```javascript
/**
 * RECOMMENDED: Hybrid clothing swap implementation
 */
class ClothingSwapManager {
    constructor(geminiApiKey) {
        this.apiKey = geminiApiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-2.5-flash-image';
    }
    
    async performClothingSwap(personImageUrl, clothingImageUrl, options = {}) {
        try {
            console.log('🔄 Starting hybrid clothing swap...');
            
            // Step 1: Load images
            const personImg = await this.loadImage(personImageUrl);
            const clothingImg = await this.loadImage(clothingImageUrl);
            
            // Step 2: Get target dimensions from person image
            const targetWidth = personImg.width;
            const targetHeight = personImg.height;
            
            console.log(`Target dimensions: ${targetWidth}x${targetHeight}`);
            
            // Step 3: Pad clothing image to match aspect ratio
            const paddedClothingBase64 = await this.padImageToAspectRatio(
                clothingImg,
                targetWidth,
                targetHeight,
                options.paddingColor || '#FFFFFF'
            );
            
            // Step 4: Convert person image to base64
            const personBase64 = await this.imageToBase64(personImg);
            
            // Step 5: Create enhanced prompt
            const enhancedPrompt = this.createEnhancedPrompt(
                targetWidth,
                targetHeight,
                options.customPrompt
            );
            
            // Step 6: Call API with optimized configuration
            const result = await this.callGeminiAPI(
                personBase64,
                paddedClothingBase64,
                enhancedPrompt
            );
            
            console.log('✅ Clothing swap completed successfully');
            return result;
            
        } catch (error) {
            console.error('❌ Clothing swap failed:', error);
            throw error;
        }
    }
    
    createEnhancedPrompt(width, height, customPrompt = '') {
        const aspectRatio = (width / height).toFixed(2);
        
        return `
            Transfer the clothing from the second image onto the person in the first image.
            
            CRITICAL REQUIREMENTS:
            - Preserve the EXACT composition, pose, and framing of the person from the first image
            - Maintain the original aspect ratio of ${aspectRatio}:1 (${width}x${height} pixels)
            - Keep the person's facial features, body proportions, and position IDENTICAL
            - Only change the clothing - everything else must remain the same
            - Ensure realistic lighting and shadows that match the original scene
            - The clothing should fit naturally on the person's body
            
            ${customPrompt}
            
            Output must be ${width}x${height} pixels with the person in the exact same position.
        `.trim();
    }
    
    async callGeminiAPI(personBase64, clothingBase64, prompt) {
        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [
                    // Person FIRST (primary subject)
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: personBase64
                        }
                    },
                    // Padded clothing LAST (determines aspect ratio, but matches person)
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: clothingBase64
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }],
            generationConfig: {
                responseModalities: ['Image'],
                temperature: 0.4, // Lower temperature for more consistent results
            }
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return this.extractImageFromResponse(data);
    }
    
    async padImageToAspectRatio(image, targetWidth, targetHeight, paddingColor) {
        // Implementation from Solution 1
        // ... (same as above)
    }
    
    loadImage(url) {
        // Implementation from Solution 1
        // ... (same as above)
    }
    
    async imageToBase64(image) {
        // Implementation from Solution 1
        // ... (same as above)
    }
    
    extractImageFromResponse(response) {
        const candidate = response.candidates[0];
        const imagePart = candidate.content.parts.find(part => part.inlineData);
        
        if (!imagePart) {
            throw new Error('No image in response');
        }
        
        return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
}

// Usage Example
const swapManager = new ClothingSwapManager('YOUR_API_KEY');

const result = await swapManager.performClothingSwap(
    'path/to/person.jpg',
    'path/to/clothing.jpg',
    {
        paddingColor: '#FFFFFF',
        customPrompt: 'Make sure the jeans fit naturally with realistic wrinkles'
    }
);
```

### Pros
✅ **Highest reliability** - Combines multiple techniques  
✅ **Predictable results** - Aspect ratio guaranteed  
✅ **Professional quality** - Best composition and detail  
✅ **Flexible** - Can customize each component  

### Cons
❌ More complex implementation  
❌ Slightly slower due to preprocessing  

---

## 📊 COMPARISON TABLE

| Solution | Reliability | Complexity | Speed | Quality | Recommended |
|----------|-------------|------------|-------|---------|-------------|
| **1. Pre-processing** | ⭐⭐⭐⭐⭐ | Medium | Medium | ⭐⭐⭐⭐⭐ | ✅ Yes |
| **2. Image Order** | ⭐⭐ | Low | Fast | ⭐⭐ | ❌ No |
| **3. Prompt Engineering** | ⭐⭐ | Low | Fast | ⭐⭐⭐ | ⚠️ Supplement only |
| **4. Post-processing** | ⭐⭐⭐ | Medium | Medium | ⭐⭐ | ⚠️ Fallback only |
| **5. Hybrid** | ⭐⭐⭐⭐⭐ | High | Medium | ⭐⭐⭐⭐⭐ | ✅ **BEST** |

---

## 🎯 RECOMMENDED IMPLEMENTATION STRATEGY

### Phase 1: Core Implementation (Week 1)
1. ✅ Implement **Solution 1** (Pre-processing with padding)
2. ✅ Add basic clothing swap UI in AI Image Editor
3. ✅ Test with various aspect ratios

### Phase 2: Enhancement (Week 2)
1. ✅ Add **Solution 3** (Prompt engineering) to improve results
2. ✅ Implement **Solution 5** (Hybrid approach)
3. ✅ Add user options for padding color

### Phase 3: Polish (Week 3)
1. ✅ Add **Solution 4** (Post-processing) as fallback
2. ✅ Implement sophisticated clothing analysis (from memories)
3. ✅ Add preview/comparison features

---

## 🚀 PRIORITY RANKING

### **Priority 1: MUST IMPLEMENT**
- ✅ **Solution 1: Pre-processing** - Core functionality
- ✅ **Solution 5: Hybrid Approach** - Production-ready

### **Priority 2: SHOULD IMPLEMENT**
- ⚠️ **Solution 3: Prompt Engineering** - Improves quality
- ⚠️ **Solution 4: Post-processing** - Safety net

### **Priority 3: OPTIONAL**
- ❌ **Solution 2: Image Order** - Too unreliable

---

## 📚 ADDITIONAL RESOURCES

### Official Documentation
- [Gemini Image Generation Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [Prompting Best Practices](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)

### Related Research
- Virtual Try-On techniques using GANs
- Garment transfer learning methods
- Image composition best practices

---

## ✅ CONCLUSION

The **Hybrid Approach (Solution 5)** combining pre-processing, prompt engineering, and proper image ordering provides the most reliable solution for clothing swap functionality in your AI Image Editor.

**Key Takeaways:**
1. ✅ Pre-process images to match aspect ratios (padding/letterboxing)
2. ✅ Use detailed prompts to preserve composition
3. ✅ Order images strategically (person last if not padded)
4. ✅ Implement post-processing as a fallback
5. ✅ Test extensively with various aspect ratios

**Next Steps:**
1. Implement the `ClothingSwapManager` class in your codebase
2. Add UI controls for clothing swap feature
3. Test with real-world images
4. Iterate based on results

---

**Report Generated:** 2025-10-18  
**API Version:** Gemini 2.5 Flash Image  
**Status:** Ready for Implementation ✅

