/**
 * Gemini API Client - Handles communication with Google's Gemini 2.5 Flash Image API
 * Provides image generation and API validation functionality
 */

class GeminiAPI {
    constructor(app) {
        this.app = app;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-3-pro-image-preview'; // Nano Banana Pro - Most advanced image generation & editing model (Dec 2025)
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        this.lastGeneratedImageData = null; // Store last generated image base64 for gallery

        console.log('🤖 [GEMINI] Gemini API client initialized with Nano Banana Pro (gemini-3-pro-image-preview)');
    }

    /**
     * Test if the provided API key is valid
     * @param {string} apiKey - The API key to test
     * @returns {Promise<boolean>} True if valid, false otherwise
     */
    async testApiKey(apiKey) {
        try {
            console.log('🔑 [GEMINI] Testing API key...');
            
            if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
                console.warn('⚠️ [GEMINI] Invalid API key format');
                return false;
            }

            // Test with a simple text generation request
            const testUrl = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;
            
            const response = await fetch(testUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Hello"
                        }]
                    }]
                })
            });

            if (response.ok) {
                console.log('✅ [GEMINI] API key is valid');
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.warn('⚠️ [GEMINI] API key test failed:', response.status, errorData);
                return false;
            }
        } catch (error) {
            console.error('❌ [GEMINI] API key test error:', error);
            return false;
        }
    }

    /**
     * Generate an image using Gemini API
     * @param {string} prompt - The text prompt for image generation
     * @param {string} aspectRatio - Optional aspect ratio (e.g., '1:1', '16:9', '9:16')
     * @param {string} imageSize - Optional image size/resolution (e.g., '1K', '2K', '4K') - Nano Banana Pro only
     * @returns {Promise<string>} The generated image URL or base64 data
     */
    async generateImage(prompt, aspectRatio = null, imageSize = null) {
        try {
            console.log('🎨 [GEMINI] Starting image generation...');

            if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
                throw new Error('Invalid prompt provided');
            }

            const apiKey = this.app.modules.storage.getApiKey();
            if (!apiKey) {
                throw new Error('No API key available');
            }

            // Enhance the prompt for better image generation
            const enhancedPrompt = await this.enhancePrompt(prompt);
            console.log('📝 [GEMINI] Enhanced prompt:', enhancedPrompt);

            const imageData = await this.makeImageRequest(apiKey, enhancedPrompt, aspectRatio, imageSize);

            if (!imageData) {
                throw new Error('No image data received from API');
            }

            console.log('✅ [GEMINI] Image generated successfully');
            return imageData;
        } catch (error) {
            console.error('❌ [GEMINI] Image generation failed:', error);
            throw error;
        }
    }

    /**
     * Make the actual image generation request with retry logic
     * @param {string} apiKey - The API key
     * @param {string} prompt - The enhanced prompt
     * @param {string} aspectRatio - Optional aspect ratio (e.g., '1:1', '16:9', '9:16')
     * @param {string} imageSize - Optional image size/resolution (e.g., '1K', '2K', '4K') - Nano Banana Pro only
     * @returns {Promise<string>} The image data
     */
    async makeImageRequest(apiKey, prompt, aspectRatio = null, imageSize = null) {
        let lastError;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔄 [GEMINI] Attempt ${attempt}/${this.maxRetries}`);

                const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

                const generationConfig = {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                    responseModalities: ["IMAGE"]
                };

                // Add image configuration (aspect ratio and/or resolution)
                if (aspectRatio || imageSize) {
                    generationConfig.imageConfig = {};

                    if (aspectRatio) {
                        generationConfig.imageConfig.aspectRatio = aspectRatio;
                        console.log(`📐 [GEMINI] Using aspect ratio: ${aspectRatio}`);
                    }

                    // imageSize is only supported by Gemini 3 Pro Image (Nano Banana Pro)
                    if (imageSize && this.model.includes('gemini-3')) {
                        generationConfig.imageConfig.imageSize = imageSize;
                        console.log(`📏 [GEMINI] Using image size: ${imageSize}`);
                    }
                }

                const requestBody = {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: generationConfig
                };

                console.log('📤 [GEMINI] Sending request to Gemini API...');

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || 'Unknown error';
                    throw new Error(`API request failed: ${response.status} - ${errorMessage}`);
                }

                const data = await response.json();
                console.log('📥 [GEMINI] Received response from API');

                // Extract image from response
                const imageData = await this.extractImageFromResponse(data);

                if (!imageData) {
                    throw new Error('No image data found in API response');
                }

                return imageData;
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ [GEMINI] Attempt ${attempt} failed:`, error.message);

                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * attempt;
                    console.log(`⏳ [GEMINI] Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }

        // If all attempts failed, throw the error
        console.error('❌ [GEMINI] All attempts failed');
        throw lastError || new Error('Image generation failed after all retry attempts');
    }

    /**
     * Extract image data from Gemini API response and convert to Blob URL
     * @param {object} response - The API response
     * @returns {string|null} Blob URL or null
     */
    async extractImageFromResponse(response) {
        try {
            // Debug: Log the full response structure (truncated for readability)
            console.log('🔍 [GEMINI] Processing API response...');
            console.log('📊 [GEMINI] Number of candidates:', response.candidates?.length || 0);

            // Navigate through the response structure to find image data
            if (!response.candidates || response.candidates.length === 0) {
                console.warn('⚠️ [GEMINI] No candidates in response');
                return null;
            }

            const candidate = response.candidates[0];
            console.log('📊 [GEMINI] Number of parts in candidate:', candidate.content?.parts?.length || 0);

            // Debug: Log the full candidate structure
            console.log('🔍 [GEMINI] Candidate structure:', JSON.stringify(candidate, null, 2));

            if (!candidate.content || !candidate.content.parts) {
                console.warn('⚠️ [GEMINI] No content parts in response');
                console.warn('🔍 [GEMINI] Candidate content:', candidate.content);
                return null;
            }

            // Count how many image parts we have
            let imageCount = 0;
            for (const part of candidate.content.parts) {
                if ((part.inline_data && part.inline_data.mime_type?.startsWith('image/')) ||
                    (part.inlineData && part.inlineData.mimeType?.startsWith('image/'))) {
                    imageCount++;
                }
            }
            console.log('📊 [GEMINI] Number of images in response:', imageCount);

            // Look for inline_data with image mime type (try both snake_case and camelCase)
            for (const part of candidate.content.parts) {
                let mimeType = null;
                let base64Data = null;

                // Try snake_case (inline_data)
                if (part.inline_data && part.inline_data.mime_type) {
                    mimeType = part.inline_data.mime_type;
                    base64Data = part.inline_data.data;
                    console.log('✅ [GEMINI] Found image data in response (snake_case)');
                }
                // Try camelCase (inlineData)
                else if (part.inlineData && part.inlineData.mimeType) {
                    mimeType = part.inlineData.mimeType;
                    base64Data = part.inlineData.data;
                    console.log('✅ [GEMINI] Found image data in response (camelCase)');
                }

                if (mimeType && mimeType.startsWith('image/') && base64Data) {
                    try {
                        console.log('🔄 [GEMINI] Preparing image data for possible border trim...');

                        // Clean base64 string (remove whitespace/newlines)
                        const cleanBase64 = base64Data.replace(/\s/g, '');
                        const dataUrl = `data:${mimeType};base64,${cleanBase64}`;

                        // Helper to sample whether a pixel is near a target color
                        const near = (r, g, b, a, tr, tg, tb, threshold = 12) => {
                            return Math.abs(r - tr) <= threshold && Math.abs(g - tg) <= threshold && Math.abs(b - tb) <= threshold && a > 0; // non-transparent
                        };

                        // Load image for analysis
                        const img = await new Promise((resolve, reject) => {
                            const image = new Image();
                            image.onload = () => resolve(image);
                            image.onerror = reject;
                            image.src = dataUrl;
                        });

                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);

                        const getPixel = (x, y) => {
                            const d = ctx.getImageData(x, y, 1, 1).data;
                            return [d[0], d[1], d[2], d[3]];
                        };

                        // Detect uniform border color (assume black bars issue)
                        const corners = [
                            getPixel(0, 0),
                            getPixel(img.width - 1, 0),
                            getPixel(0, img.height - 1),
                            getPixel(img.width - 1, img.height - 1)
                        ];

                        // Determine background color candidate; default to first corner
                        let [br, bg, bb, ba] = corners[0];
                        // If all corners near black, set bg color to black
                        const allCornersNearBlack = corners.every(([r, g, b, a]) => near(r, g, b, a, 0, 0, 0, 12));
                        if (allCornersNearBlack) {
                            br = 0; bg = 0; bb = 0; ba = 255;
                        } else {
                            // If corners are similar, keep that as background; otherwise skip trimming
                            const similarCorners = corners.every(([r, g, b, a]) => Math.abs(r - br) < 12 && Math.abs(g - bg) < 12 && Math.abs(b - bb) < 12);
                            if (!similarCorners) {
                                console.log('ℹ️ [GEMINI] Corners not uniform; skipping border trim');
                                // Store original and return
                                this.lastGeneratedImageData = dataUrl;
                                const blob = await (await fetch(dataUrl)).blob();
                                const blobUrl = URL.createObjectURL(blob);
                                console.log('✅ [GEMINI] Returning original image Blob URL:', blobUrl);
                                return blobUrl;
                            }
                        }

                        // Scan edges to find trim margins
                        const sampleCols = 8;
                        const stepX = Math.max(1, Math.floor(img.width / (sampleCols + 1)));
                        const sampleXs = Array.from({ length: sampleCols }, (_, i) => Math.min(img.width - 1, (i + 1) * stepX));

                        const isRowUniform = (y) => sampleXs.every((x) => {
                            const [r, g, b, a] = getPixel(x, y);
                            return near(r, g, b, a, br, bg, bb, 14);
                        });
                        const isColUniform = (x) => {
                            const sampleRows = 8;
                            const stepY = Math.max(1, Math.floor(img.height / (sampleRows + 1)));
                            for (let i = 1; i <= sampleRows; i++) {
                                const y = Math.min(img.height - 1, i * stepY);
                                const [r, g, b, a] = getPixel(x, y);
                                if (!near(r, g, b, a, br, bg, bb, 14)) return false;
                            }
                            return true;
                        };

                        let top = 0;
                        while (top < img.height && isRowUniform(top)) top++;
                        let bottom = img.height - 1;
                        while (bottom > top && isRowUniform(bottom)) bottom--;
                        let left = 0;
                        while (left < img.width && isColUniform(left)) left++;
                        let right = img.width - 1;
                        while (right > left && isColUniform(right)) right--;

                        // Compute crop rect
                        const cropX = left;
                        const cropY = top;
                        const cropW = Math.max(1, right - left + 1);
                        const cropH = Math.max(1, bottom - top + 1);

                        let finalDataUrl = dataUrl;
                        if (cropW < img.width || cropH < img.height) {
                            const out = document.createElement('canvas');
                            out.width = cropW;
                            out.height = cropH;
                            const octx = out.getContext('2d');
                            octx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                            finalDataUrl = out.toDataURL(mimeType);
                            console.log(`✂️ [GEMINI] Trimmed borders: top=${top}, bottom=${img.height - 1 - bottom}, left=${left}, right=${img.width - 1 - right}`);
                        } else {
                            console.log('ℹ️ [GEMINI] No borders detected for trimming');
                        }

                        // Store base64 for gallery and return Blob URL
                        this.lastGeneratedImageData = finalDataUrl;
                        const finalBlob = await (await fetch(finalDataUrl)).blob();
                        const finalBlobUrl = URL.createObjectURL(finalBlob);
                        console.log('✅ [GEMINI] Prepared final Blob URL:', finalBlobUrl);
                        return finalBlobUrl;
                    } catch (conversionError) {
                        console.error('❌ [GEMINI] Image processing failed:', conversionError);
                        console.log('⚠️ [GEMINI] Falling back to original base64 Blob conversion...');

                        // Fallback to original logic
                        const cleanBase64 = base64Data.replace(/\s/g, '');
                        this.lastGeneratedImageData = `data:${mimeType};base64,${cleanBase64}`;
                        const binaryString = atob(cleanBase64);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                        const blob = new Blob([bytes], { type: mimeType });
                        const blobUrl = URL.createObjectURL(blob);
                        return blobUrl;
                    }
                }
            }

            console.warn('⚠️ [GEMINI] No image parts found in response');
            return null;
        } catch (error) {
            console.error('❌ [GEMINI] Error extracting image from response:', error);
            return null;
        }
    }

    /**
     * Validate prompt for content and length
     * @param {string} prompt - The prompt to validate
     * @returns {object} Validation result
     */
    validatePrompt(prompt) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };
        
        if (!prompt || typeof prompt !== 'string') {
            result.valid = false;
            result.errors.push('Prompt must be a non-empty string');
            return result;
        }
        
        const trimmedPrompt = prompt.trim();
        
        if (trimmedPrompt.length === 0) {
            result.valid = false;
            result.errors.push('Prompt cannot be empty');
        }
        
        if (trimmedPrompt.length < 3) {
            result.valid = false;
            result.errors.push('Prompt must be at least 3 characters long');
        }
        
        if (trimmedPrompt.length > 1000) {
            result.valid = false;
            result.errors.push('Prompt must be less than 1000 characters');
        }
        
        // Check for potentially problematic content
        const problematicWords = ['nsfw', 'explicit', 'violence', 'gore'];
        const hasProblematicContent = problematicWords.some(word => 
            trimmedPrompt.toLowerCase().includes(word)
        );
        
        if (hasProblematicContent) {
            result.warnings.push('Prompt may contain content that could be filtered');
        }
        
        return result;
    }

    /**
     * Get API usage statistics (placeholder for future implementation)
     * @returns {object} Usage statistics
     */
    getUsageStats() {
        return {
            requestsToday: 0,
            requestsThisMonth: 0,
            lastRequest: null,
            rateLimitRemaining: 100
        };
    }

    /**
     * Sleep utility for retry delays
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after the delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Format error messages for user display
     * @param {Error} error - The error to format
     * @returns {string} User-friendly error message
     */
    formatError(error) {
        if (error.message.includes('API request failed: 401')) {
            return 'Invalid API key. Please check your Gemini API key.';
        }
        
        if (error.message.includes('API request failed: 429')) {
            return 'Rate limit exceeded. Please wait a moment and try again.';
        }
        
        if (error.message.includes('API request failed: 403')) {
            return 'Access denied. Please check your API key permissions.';
        }
        
        if (error.message.includes('Network')) {
            return 'Network error. Please check your internet connection.';
        }

        return 'An unexpected error occurred. Please try again.';
    }

    /**
     * Enhance a user's prompt using AI to make it more detailed and effective
     * @param {string} userPrompt - The original user prompt
     * @returns {Promise<string>} Enhanced prompt
     */
    async enhancePrompt(userPrompt) {
        try {
            console.log('✨ [GEMINI] Enhancing prompt...');

            if (!userPrompt || userPrompt.trim().length === 0) {
                throw new Error('Prompt cannot be empty');
            }

            const apiKey = this.app.modules.storage.getApiKey();
            if (!apiKey) {
                throw new Error('API key not found. Please set your API key first.');
            }

            // Use unified model (Gemini 2.5 Flash Image) for text-only enhancement
            const enhanceUrl = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            const enhanceSystemPrompt = `You are an expert at writing image generation prompts. Your task is to enhance the user's prompt to be more detailed, specific, and effective for AI image generation.

Guidelines:
- Add specific details about style, lighting, composition, colors, mood
- Include technical photography/art terms when appropriate
- Keep the core idea but make it more vivid and descriptive
- Aim for 2-3 sentences maximum
- Return ONLY the enhanced prompt, no explanations or additional text

User's original prompt: "${userPrompt}"

Enhanced prompt:`;

            const response = await fetch(enhanceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: enhanceSystemPrompt
                        }]
                    }],
                    generationConfig: {
                        responseModalities: ["TEXT"],
                        candidateCount: 1
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ [GEMINI] Prompt enhancement failed:', errorData);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const enhancedPrompt = this.extractTextFromResponse(data);

            console.log('✅ [GEMINI] Prompt enhanced successfully');
            console.log('📝 [GEMINI] Original:', userPrompt);
            console.log('✨ [GEMINI] Enhanced:', enhancedPrompt);

            return enhancedPrompt;

        } catch (error) {
            console.error('❌ [GEMINI] Error enhancing prompt:', error);
            throw error;
        }
    }

    /**
     * Edit an existing image using AI based on text instructions
     * @param {string} baseImageData - Base64 encoded image data
     * @param {string} editPrompt - Description of what to change
     * @param {object} options - Optional settings { preserveOriginal, aspectRatio, imageSize }
     * @returns {Promise<string>} Base64 encoded edited image
     */
    async editImage(baseImageData, editPrompt, options = {}) {
        // Support legacy boolean parameter for preserveOriginal
        if (typeof options === 'boolean') {
            options = { preserveOriginal: options };
        }

        const { preserveOriginal = true, aspectRatio = null, imageSize = null } = options;

        try {
            console.log('🎨 [GEMINI] Editing image with AI...');
            console.log('📐 [GEMINI] Edit options:', { aspectRatio, imageSize, preserveOriginal });

            if (!baseImageData || !editPrompt) {
                throw new Error('Both image data and edit prompt are required');
            }

            const apiKey = this.app.modules.storage.getApiKey();
            if (!apiKey) {
                throw new Error('API key not found. Please set your API key first.');
            }

            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            // Format the edit instruction with smart deduplication of "preserve" clauses
            const baseText = editPrompt.trim().replace(/\s+/g, ' ');
            const endsWithPeriod = baseText.endsWith('.');
            let formattedPrompt = baseText;

            if (preserveOriginal) {
                const lower = baseText.toLowerCase();
                const hasPreserve = (
                    lower.includes('keep everything else') ||
                    lower.includes('do not change anything else') ||
                    lower.includes('only modify') ||
                    lower.includes('only replace') ||
                    lower.includes('preserve') ||
                    lower.includes('unchanged')
                );

                if (!hasPreserve) {
                    formattedPrompt = (endsWithPeriod ? baseText : baseText + '.') +
                        ' Keep everything else in the image exactly the same, preserving the original style, lighting, and composition. Only modify what was specifically requested.';
                }
            }

            // Remove any redundant prefix if present
            formattedPrompt = formattedPrompt.replace(/^Using the provided image,\s*/i, '');

            console.log('📝 [GEMINI] Edit instruction:', formattedPrompt);

            // Strip data URL prefix if present (e.g., "data:image/png;base64,")
            let cleanImageData = baseImageData;
            if (baseImageData.includes(',')) {
                cleanImageData = baseImageData.split(',')[1];
            }

            // Build generation config with resolution and aspect ratio
            const generationConfig = {
                responseModalities: ["IMAGE"]
            };

            // Add image configuration if aspectRatio or imageSize is provided
            if (aspectRatio || imageSize) {
                generationConfig.imageConfig = {};

                if (aspectRatio) {
                    generationConfig.imageConfig.aspectRatio = aspectRatio;
                    console.log(`📐 [GEMINI] Edit using aspect ratio: ${aspectRatio}`);
                }

                // imageSize is only supported by Gemini 3 Pro Image (Nano Banana Pro)
                if (imageSize && this.model.includes('gemini-3')) {
                    generationConfig.imageConfig.imageSize = imageSize;
                    console.log(`📏 [GEMINI] Edit using image size: ${imageSize}`);
                }
            }

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: cleanImageData
                            }
                        },
                        {
                            text: formattedPrompt
                        }
                    ]
                }],
                generationConfig: generationConfig
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ [GEMINI] Image edit failed:', errorData);
                const errorMessage = errorData?.error?.message || JSON.stringify(errorData);
                throw new Error(`API request failed: ${response.status} - ${errorMessage}`);
            }

            const data = await response.json();
            const editedImageData = await this.extractImageFromResponse(data);

            console.log('✅ [GEMINI] Image edited successfully');

            return editedImageData;

        } catch (error) {
            console.error('❌ [GEMINI] Error editing image:', error);
            throw error;
        }
    }

    /**
     * Extract text from Gemini API response
     * @param {Object} response - API response object
     * @returns {string} Extracted text
     */
    extractTextFromResponse(response) {
        try {
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No candidates in response');
            }

            const candidate = response.candidates[0];
            if (!candidate.content || !candidate.content.parts) {
                throw new Error('Invalid response structure');
            }

            // Find the first text part
            for (const part of candidate.content.parts) {
                if (part.text) {
                    return part.text.trim();
                }
            }

            throw new Error('No text found in response');
        } catch (error) {
            console.error('❌ [GEMINI] Error extracting text from response:', error);
            throw new Error('Failed to extract text from API response');
        }
    }

    /**
     * Get the last generated image data (base64 data URL)
     * @returns {string|null} Base64 data URL or null
     */
    getLastGeneratedImageData() {
        return this.lastGeneratedImageData;
    }

    /**
     * Clear the last generated image data
     */
    clearLastGeneratedImageData() {
        this.lastGeneratedImageData = null;
    }

    /**
     * Analyze an image to generate detailed object description for transfer
     * @param {string} imageData - Base64 encoded image (without data URL prefix)
     * @param {string} objectHint - Optional hint about what to analyze (e.g., "clothing", "furniture", "person")
     * @returns {Promise<string>} Detailed description of the object
     */
    async analyzeImageForTransfer(imageData, objectHint = '') {
        const apiKey = this.app.modules.storage.getApiKey();

        if (!apiKey) {
            throw new Error('API key not found. Please set your API key first.');
        }

        console.log('🔍 [GEMINI] Analyzing image for object transfer...');

        try {
            // Create detailed analysis prompt
            const basePrompt = objectHint
                ? `Analyze this image and provide a highly detailed description of the ${objectHint} shown.`
                : `Analyze this image and identify the main object or element shown, then provide a highly detailed description of it.`;

            const detailedInstructions = `
Include the following details in your description:
1. Object type and category (e.g., "blue cotton t-shirt", "wooden dining table", "person wearing red jacket")
2. Exact colors and shades (be very specific - e.g., "navy blue", "crimson red", "forest green")
3. Textures and materials (e.g., "smooth cotton fabric", "rough wood grain", "glossy leather")
4. Distinctive features and details (e.g., "v-neck collar", "carved legs", "brass buttons")
5. Style characteristics (e.g., "casual modern", "vintage rustic", "formal business")
6. Any patterns, logos, or decorative elements
7. Fit, cut, or shape details

Provide a concise but comprehensive description (2-4 sentences) that would help accurately transfer this object to another image. Focus on visual details that are important for recreating the object.`;

            const fullPrompt = basePrompt + detailedInstructions;

            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: imageData
                            }
                        },
                        {
                            text: fullPrompt
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,  // Lower temperature for more consistent, factual descriptions
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 500  // Enough for detailed description
                }
            };

            console.log('📤 [GEMINI] Sending analysis request to API...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [GEMINI] API error:', errorData);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ [GEMINI] Analysis response received');

            // Extract text from response
            if (data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].text) {

                const description = data.candidates[0].content.parts[0].text.trim();
                console.log('📝 [GEMINI] Generated description:', description.substring(0, 100) + '...');
                return description;
            }

            throw new Error('Failed to extract description from API response');

        } catch (error) {
            console.error('❌ [GEMINI] Analysis failed:', error);
            throw error;
        }
    }

    /**
     * Analyze canvas image to help users write better inpainting/editing prompts
     * @param {string} imageData - Base64 encoded canvas image (without data URL prefix)
     * @returns {Promise<string>} Detailed image description
     */
    async analyzeCanvasImage(imageData) {
        const apiKey = this.app.modules.storage.getApiKey();

        if (!apiKey) {
            throw new Error('API key not found. Please set your API key first.');
        }

        console.log('🔍 [GEMINI] Analyzing canvas image for editing...');

        try {
            const analysisPrompt = `Analyze this image in detail to help with precise image editing and object removal/replacement.

Provide a comprehensive description including:
1. **Main Subjects**: Identify all people, animals, or primary objects (e.g., "a woman in her 30s standing on the left", "a golden retriever sitting in the center")
2. **Background Elements**: Describe the setting and background (e.g., "modern office with glass windows", "beach at sunset with palm trees")
3. **Objects and Details**: List specific objects and their locations (e.g., "red car parked on the right side", "wooden table in the foreground", "blue vase on the shelf")
4. **Colors and Lighting**: Describe the color scheme and lighting conditions (e.g., "warm golden hour lighting", "cool blue tones", "bright daylight")
5. **Composition**: Describe the spatial arrangement (e.g., "subject centered", "rule of thirds composition", "foreground, middle ground, background layers")
6. **Distinctive Features**: Note any unique or notable elements (e.g., "person wearing red jacket", "graffiti on the wall", "reflection in the water")

Provide a detailed, structured description (4-6 sentences) that would help someone precisely identify and edit specific elements in this image. Use clear spatial references (left, right, center, foreground, background) and specific descriptors.`;

            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: imageData
                            }
                        },
                        {
                            text: analysisPrompt
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.3,  // Low temperature for factual, consistent descriptions
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 700  // Enough for detailed description
                }
            };

            console.log('📤 [GEMINI] Sending canvas analysis request to API...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [GEMINI] API error:', errorData);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ [GEMINI] Canvas analysis response received');

            // Extract text from response
            if (data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].text) {

                const description = data.candidates[0].content.parts[0].text.trim();
                console.log('📝 [GEMINI] Generated canvas description:', description.substring(0, 100) + '...');
                return description;
            }

            throw new Error('Failed to extract description from API response');

        } catch (error) {
            console.error('❌ [GEMINI] Canvas analysis failed:', error);
            throw error;
        }
    }

    /**
     * Analyze style image to extract artistic style characteristics
     * @param {string} imageData - Base64 encoded style image (without data URL prefix)
     * @returns {Promise<string>} Detailed style description
     */
    async analyzeStyleImage(imageData) {
        const apiKey = this.app.modules.storage.getApiKey();

        if (!apiKey) {
            throw new Error('API key not found. Please set your API key first.');
        }

        console.log('🎨 [GEMINI] Analyzing artistic style...');

        try {
            const stylePrompt = `Analyze the artistic style of this image and provide a detailed description of its visual characteristics.

**IMPORTANT: First, detect and read any visible text in the image** (artist name, title, art movement labels, signatures, captions, etc.). Include this text in your analysis as it provides valuable context about the style.

Include the following details:
1. **Visible Text** (if any): Quote any text found in the image (artist name, title, labels, signatures, etc.)
2. **Art Movement/Style**: Identify the artistic style or movement (e.g., "Impressionism", "Cubism", "Abstract Expressionism", "Pop Art", "Photorealism", "Manga/Anime")
3. **Color Palette**: Describe the dominant colors, color harmony, and color temperature (e.g., "vibrant blues and yellows with warm undertones", "muted earth tones", "high-contrast black and white")
4. **Brushwork/Technique**: Describe the painting technique or visual texture (e.g., "thick impasto brushstrokes", "smooth gradients", "pointillist dots", "geometric shapes", "bold manga linework")
5. **Composition**: Describe the compositional style (e.g., "dynamic diagonal lines", "balanced symmetry", "chaotic overlapping forms")
6. **Lighting**: Describe the lighting characteristics (e.g., "dramatic chiaroscuro", "soft diffused light", "high-key brightness", "cel-shaded anime lighting")
7. **Mood/Atmosphere**: Describe the emotional quality (e.g., "dreamy and ethereal", "bold and energetic", "melancholic and somber")
8. **Distinctive Features**: Any unique visual elements that define this style (e.g., "swirling patterns", "fragmented perspectives", "bold outlines", "speed lines", "dramatic poses")

Provide a comprehensive description (4-6 sentences) that captures the essence of this artistic style, including any text context found. This description will be used to transfer the style to another image.`;

            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: imageData
                            }
                        },
                        {
                            text: stylePrompt
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.5,  // Balanced temperature for creative yet accurate descriptions
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 600  // Enough for detailed style description
                }
            };

            console.log('📤 [GEMINI] Sending style analysis request to API...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [GEMINI] API error:', errorData);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ [GEMINI] Style analysis response received');

            // Extract text from response
            if (data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].text) {

                const description = data.candidates[0].content.parts[0].text.trim();
                console.log('🎨 [GEMINI] Generated style description:', description.substring(0, 100) + '...');
                return description;
            }

            throw new Error('Failed to extract style description from API response');

        } catch (error) {
            console.error('❌ [GEMINI] Style analysis failed:', error);
            throw error;
        }
    }

    /**
     * Transfer artistic style to target image using text-based style description
     * NOTE: Only sends the target image to preserve aspect ratio. Style is applied via text description only.
     * @param {string} targetImageData - Base64 encoded target image (without data URL prefix)
     * @param {string} styleDescription - Detailed description of the artistic style (from analyzeStyleImage)
     * @param {string} targetElement - Optional: specific element/region to transform (e.g., "the person", "the background")
     * @returns {Promise<string>} Base64 encoded result image (with data URL prefix)
     */
    async styleTransfer(targetImageData, styleDescription, targetElement = '') {
        const apiKey = this.app.modules.storage.getApiKey();

        if (!apiKey) {
            throw new Error('API key not found. Please set your API key first.');
        }

        console.log('🎨 [GEMINI] Performing style transfer (text-based, preserving aspect ratio)...');
        if (targetElement) {
            console.log('🎯 [GEMINI] Target element:', targetElement);
        }

        try {
            // Build the prompt based on whether a target element is specified
            let transferPrompt;

            if (targetElement && targetElement.trim().length > 0) {
                // Targeted style transfer
                transferPrompt = `Transform ONLY "${targetElement}" in this image by applying the artistic style described below.

**Element to Transform:**
${targetElement}

**Artistic Style to Apply:**
${styleDescription}

**CRITICAL INSTRUCTIONS:**
- Transform ONLY the specified element: "${targetElement}"
- Keep ALL other parts of the image completely unchanged
- Apply the artistic style characteristics (colors, brushwork, textures, lighting) ONLY to the specified element
- Blend the styled element naturally with the rest of the image to avoid harsh edges
- Preserve the original composition and structure of the image
- MAINTAIN THE EXACT ASPECT RATIO AND DIMENSIONS of the input image
- Make the transformation look seamless and professional

The result should show "${targetElement}" reimagined in the artistic style, while everything else remains exactly as it was in the original image.`;
            } else {
                // Full image style transfer
                transferPrompt = `Transform this image by applying the artistic style described below.

**Artistic Style to Apply:**
${styleDescription}

**CRITICAL INSTRUCTIONS:**
- Preserve the original composition, subjects, and structure of the image
- Apply ONLY the artistic style characteristics (colors, brushwork, textures, lighting) from the style description
- Do NOT change the content or subjects of the image
- Ensure the result looks like the original image painted/rendered in the described artistic style
- MAINTAIN THE EXACT ASPECT RATIO AND DIMENSIONS of the input image
- Make the transformation look natural and cohesive

The result should be the original image reimagined in the artistic style described above.`;
            }

            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: targetImageData
                            }
                        },
                        {
                            text: transferPrompt
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"],  // Must be uppercase
                    temperature: 0.7,  // Higher temperature for creative style transfer
                    topK: 40,
                    topP: 0.95
                }
            };

            console.log('📤 [GEMINI] Sending style transfer request to API (text-based style only)...');
            console.log('📋 [GEMINI] Request config:', {
                targetImageLength: targetImageData.length,
                promptLength: transferPrompt.length,
                targetElement: targetElement || 'entire image',
                generationConfig: requestBody.generationConfig
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [GEMINI] API error:', errorData);
                console.error('❌ [GEMINI] Error details:', JSON.stringify(errorData, null, 2));

                let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                if (errorData.error && errorData.error.message) {
                    errorMessage += ` - ${errorData.error.message}`;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ [GEMINI] Style transfer response received');

            // Extract image data from response
            if (data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].inlineData) {

                const imageData = data.candidates[0].content.parts[0].inlineData.data;
                const mimeType = data.candidates[0].content.parts[0].inlineData.mimeType || 'image/png';

                const dataUrl = `data:${mimeType};base64,${imageData}`;
                console.log('🎨 [GEMINI] Style transfer complete, image generated');

                this.lastGeneratedImageData = dataUrl;

                return dataUrl;
            }

            throw new Error('Failed to extract image from API response');

        } catch (error) {
            console.error('❌ [GEMINI] Style transfer failed:', error);
            throw error;
        }
    }

    /**
     * Perform object transfer using hybrid approach
     * @param {string} baseImageData - Base64 encoded base image (without data URL prefix)
     * @param {string} sourceImageData - Base64 encoded source image (already padded to match aspect ratio)
     * @param {string} transferDescription - Detailed description of what to transfer
     * @returns {Promise<string>} Base64 encoded result image (with data URL prefix)
     */
    async objectTransfer(baseImageData, sourceImageData, transferDescription) {
        const apiKey = this.app.modules.storage.getApiKey();

        if (!apiKey) {
            throw new Error('API key not found. Please set your API key first.');
        }

        console.log('✨ [GEMINI] Performing object transfer...');

        try {
            // Create enhanced prompt using the hybrid approach from research
            const enhancedPrompt = `Transfer the following element from the second image onto the person/scene in the first image: ${transferDescription}.

IMPORTANT INSTRUCTIONS:
- Preserve the original composition, pose, lighting, and style of the first image
- Only add the specified element from the second image
- Keep everything else in the first image exactly the same
- Ensure the transferred element fits naturally and realistically
- Match the lighting and perspective of the first image
- Maintain the aspect ratio and dimensions of the first image

The result should look natural and seamless, as if the element was always part of the first image.`;

            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: baseImageData
                            }
                        },
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: sourceImageData
                            }
                        },
                        {
                            text: enhancedPrompt
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"],  // Must be uppercase
                    temperature: 0.6,  // Balanced creativity and consistency
                    topK: 40,
                    topP: 0.95
                }
            };

            console.log('📤 [GEMINI] Sending transfer request to API...');
            console.log('📋 [GEMINI] Request config:', {
                baseImageLength: baseImageData.length,
                sourceImageLength: sourceImageData.length,
                promptLength: enhancedPrompt.length,
                generationConfig: requestBody.generationConfig
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [GEMINI] API error:', errorData);
                console.error('❌ [GEMINI] Error details:', JSON.stringify(errorData, null, 2));

                // Extract specific error message if available
                let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                if (errorData.error && errorData.error.message) {
                    errorMessage += ` - ${errorData.error.message}`;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ [GEMINI] Transfer response received');

            // Extract image from response
            if (data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].inlineData) {

                const imageData = data.candidates[0].content.parts[0].inlineData.data;
                const mimeType = data.candidates[0].content.parts[0].inlineData.mimeType || 'image/png';

                // Return as data URL
                const dataUrl = `data:${mimeType};base64,${imageData}`;
                console.log('🖼️ [GEMINI] Transfer complete, image generated');

                // Store for gallery
                this.lastGeneratedImageData = dataUrl;

                return dataUrl;
            }

            throw new Error('Failed to extract image from API response');

        } catch (error) {
            console.error('❌ [GEMINI] Transfer failed:', error);
            throw error;
        }
    }

    /**
     * Apply face and body enhancements to an image
     * @param {string} imageData - Base64 encoded image data
     * @param {string} enhancementPrompt - Detailed enhancement instructions
     * @returns {Promise<string>} Data URL of the enhanced image
     */
    async faceBodyEnhancement(imageData, enhancementPrompt) {
        try {
            console.log('🎨 [GEMINI] Performing face & body enhancement...');
            console.log('📝 [GEMINI] Enhancement prompt:', enhancementPrompt);

            const apiKey = this.app.modules.storage.getApiKey();
            if (!apiKey) {
                throw new Error('API key not set. Please configure your Gemini API key.');
            }

            // Prepare the API request
            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            // Remove data URL prefix if present
            let base64Data = imageData;
            if (imageData.includes('base64,')) {
                base64Data = imageData.split('base64,')[1];
            }

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            text: enhancementPrompt
                        },
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64Data
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4, // Lower temperature for consistent, natural results
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 4096
                }
            };

            console.log('📤 [GEMINI] Sending face & body enhancement request...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [GEMINI] API error:', errorData);

                let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                if (errorData.error && errorData.error.message) {
                    errorMessage += ` - ${errorData.error.message}`;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ [GEMINI] Enhancement response received');

            // Extract image from response using the helper method
            const enhancedImageUrl = await this.extractImageFromResponse(data);

            if (!enhancedImageUrl) {
                throw new Error('Failed to extract enhanced image from API response');
            }

            console.log('✨ [GEMINI] Face & body enhancement complete');

            // Store for gallery
            this.lastGeneratedImageData = enhancedImageUrl;

            return enhancedImageUrl;

        } catch (error) {
            console.error('❌ [GEMINI] Face & body enhancement failed:', error);
            throw error;
        }
    }

    /**
     * Analyze hair style from reference image
     * @param {string} imageData - Base64 encoded reference image
     * @returns {Promise<string>} Detailed hair style description
     */
    async analyzeHairStyle(imageData) {
        try {
            console.log('💇 [GEMINI] Analyzing hair style from reference image...');

            const apiKey = this.app.modules.storage.getApiKey();
            if (!apiKey) {
                throw new Error('API key not set. Please configure your Gemini API key.');
            }

            // Prepare the API request
            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;

            // Remove data URL prefix if present
            let base64Data = imageData;
            if (imageData.includes('base64,')) {
                base64Data = imageData.split('base64,')[1];
            }

            const analysisPrompt = `Analyze the hair style in this image and provide a detailed, professional description suitable for recreating this style in a portrait transformation.

Focus on these specific aspects:

1. HAIR LENGTH:
   - Exact length (e.g., "shoulder-length", "chin-length", "mid-back length")
   - Layering details (if any)

2. HAIR COLOR:
   - Primary color with specific shade (e.g., "warm chestnut brown", "platinum blonde", "jet black")
   - Highlights, lowlights, or ombre effects (if present)
   - Color depth and tone (warm/cool)

3. HAIR TEXTURE & VOLUME:
   - Natural texture (straight, wavy, curly, coily)
   - Volume level (flat, moderate, voluminous, very full)
   - Thickness appearance

4. HAIR STYLE & CUT:
   - Overall style name (if recognizable, e.g., "bob", "pixie", "long layers")
   - Parting (center, side, no visible part)
   - Bangs/fringe (if present, describe type and length)
   - Face-framing layers or specific cut details

5. STYLING:
   - How it's styled (sleek and straight, tousled waves, tight curls, etc.)
   - Any visible styling products effects (shine, matte, textured)
   - Professional finish level

Provide your response as a single, comprehensive paragraph that flows naturally and can be directly used in an AI image generation prompt. Be specific and detailed, but concise. Focus on visual characteristics that can be recreated.

Example format: "Shoulder-length warm chestnut brown hair with subtle caramel highlights, featuring soft, loose waves with moderate volume. The hair has a center part with long, face-framing layers that create movement. The style appears professionally blow-dried with a natural, healthy shine and slightly tousled, effortless finish."`;

            const requestBody = {
                contents: [{
                    parts: [
                        {
                            text: analysisPrompt
                        },
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64Data
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.3, // Lower temperature for consistent, accurate analysis
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            };

            console.log('📤 [GEMINI] Sending hair analysis request...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [GEMINI] API error:', errorData);

                let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                if (errorData.error && errorData.error.message) {
                    errorMessage += ` - ${errorData.error.message}`;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ [GEMINI] Hair analysis response received');

            // Extract text description from response
            if (data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].text) {

                const hairDescription = data.candidates[0].content.parts[0].text.trim();
                console.log('💇 [GEMINI] Hair style analyzed:', hairDescription);

                return hairDescription;
            }

            throw new Error('Failed to extract hair description from API response');

        } catch (error) {
            console.error('❌ [GEMINI] Hair analysis failed:', error);
            throw error;
        }
    }

    // Analyze embedded text in image (OCR + typography)
    async analyzeTextInImage(imageData) {
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) {
            throw new Error('API key not found. Please set your API key first.');
        }
        console.log('🔎 [GEMINI] Analyzing embedded text in image...');
        try {
            const prompt = `You are an advanced visual OCR and typography analyzer. Read ALL embedded text in this image with high accuracy. Return STRICT JSON ONLY with this schema:
{
  "segments": [
    {
      "text": "string",
      "confidence": 0.0 to 1.0,
      "font": {"family": "string", "style": "string", "weight": "string", "sizePxApprox": number},
      "color": {"hex": "#RRGGBB", "rgba": [r,g,b,a]},
      "position": {"bbox": {"x": number, "y": number, "width": number, "height": number}}
    }
  ],
  "summary": "short one-paragraph description of text layout and hierarchy"
}
If no text is detected, return {"segments":[],"summary":"no text"}. Do NOT include markdown or code fences.`;
            const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;
            const requestBody = {
                contents: [{
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: imageData } },
                        { text: prompt }
                    ]
                }],
                generationConfig: { temperature: 0.2, topK: 32, topP: 1, maxOutputTokens: 1024 }
            };
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData?.error?.message || ''}`);
            }
            const data = await response.json();
            const textOut = this.extractTextFromResponse(data);
            try { return JSON.parse(textOut); } catch (_) { return textOut; }
        } catch (error) {
            console.error('❌ [GEMINI] Text analysis failed:', error);
            throw error;
        }
    }

    // Edit embedded text while preserving layout and non-text content
    async editTextInImage(baseImageData, editInstruction) {
        if (!baseImageData || !editInstruction) {
            throw new Error('Both image data and edit instruction are required');
        }
        const apiKey = this.app.modules.storage.getApiKey();
        if (!apiKey) { throw new Error('API key not found. Please set your API key first.'); }
        console.log('🧩 [GEMINI] Editing embedded text in image...');
        // Strip data URL prefix if present
        let cleanImageData = baseImageData.includes(',') ? baseImageData.split(',')[1] : baseImageData;
        const safety = 'Preserve all non-text content, layout, composition, lighting, and style. Use high-quality, legible typography without artifacts.';
        const prompt = `${editInstruction.trim()}. ${safety}`;
        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;
        const requestBody = {
            contents: [{ parts: [ { inlineData: { mimeType: 'image/png', data: cleanImageData } }, { text: prompt } ] }],
            generationConfig: { responseModalities: ["IMAGE"] }
        };
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || JSON.stringify(errorData);
            throw new Error(`API request failed: ${response.status} - ${errorMessage}`);
        }
        const data = await response.json();
        const editedImageData = await this.extractImageFromResponse(data);
        console.log('✅ [GEMINI] Text edit applied successfully');
        return editedImageData;
    }
}
