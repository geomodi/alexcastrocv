// TextEditorManager: AI Text analysis and editing panel
(function(){
  class TextEditorManager {
    constructor(app) {
      this.app = app;
      this.elements = {
        tabContent: null,
        analyzeBtn: null,
        applyEditBtn: null,
        detectedTextOutput: null,
        editInstruction: null,
        editStyle: null,
        status: null
      };
      this.state = {
        hasImage: false,
        busy: false
      };
    }

    initialize() {
      this.elements.tabContent = document.getElementById('text-studio-tab');
      if (!this.elements.tabContent) {
        console.warn('[TextEditor] Text Studio tab content not found.');
        return;
      }

      this.elements.analyzeBtn = document.getElementById('analyzeTextBtn');
      this.elements.applyEditBtn = document.getElementById('applyTextEditBtn');
      this.elements.detectedTextOutput = document.getElementById('detectedTextOutput');
      this.elements.editInstruction = document.getElementById('textEditInstruction');
      this.elements.editStyle = document.getElementById('textEditStyle');
      this.elements.status = document.getElementById('textStudioStatus');

      this.bindEvents();
      this.updateUIState();
    }

    bindEvents() {
      if (this.elements.analyzeBtn) {
        this.elements.analyzeBtn.addEventListener('click', () => this.handleAnalyze());
      }
      if (this.elements.applyEditBtn) {
        this.elements.applyEditBtn.addEventListener('click', () => this.handleApplyEdit());
      }
    }

    setBusy(isBusy, message = '') {
      this.state.busy = isBusy;
      if (this.elements.analyzeBtn) this.elements.analyzeBtn.disabled = !this.state.hasImage || isBusy;
      if (this.elements.applyEditBtn) this.elements.applyEditBtn.disabled = !this.state.hasImage || isBusy;
      if (this.elements.status) {
        this.elements.status.textContent = message || '';
      }
    }

    updateUIState() {
      const editor = this.app?.modules?.editor;
      const imageLoaded = !!(editor && editor.imageNode);
      this.state.hasImage = imageLoaded;
      if (this.elements.analyzeBtn) this.elements.analyzeBtn.disabled = !imageLoaded || this.state.busy;
      if (this.elements.applyEditBtn) this.elements.applyEditBtn.disabled = !imageLoaded || this.state.busy;
    }

    async handleAnalyze() {
      if (!this.state.hasImage || this.state.busy) return;
      try {
        this.setBusy(true, 'Analyzing text in the current image...');
        const editor = this.app.modules.editor;
        const base64 = await editor.getImageAsBase64();
        if (!base64) {
          this.setBusy(false, 'No image available for analysis.');
          return;
        }
        const gemini = this.app.modules.gemini;
        let resultText = '';
        if (typeof gemini.analyzeTextInImage === 'function') {
          const structured = await gemini.analyzeTextInImage(base64);
          resultText = this.formatAnalysis(structured);
        } else {
          // Fallback to style analysis which also detects visible text
          const summary = await gemini.analyzeStyleImage(base64);
          resultText = summary;
        }
        if (this.elements.detectedTextOutput) {
          this.elements.detectedTextOutput.value = resultText || '';
        }
        this.setBusy(false, 'Analysis complete.');
      } catch (err) {
        console.error('[TextEditor] Analyze failed:', err);
        this.setBusy(false, 'Analysis failed: ' + (err?.message || err));
      }
    }

    formatAnalysis(structured) {
      if (!structured) return '';
      try {
        if (typeof structured === 'string') {
          // Try parse JSON, otherwise return as-is
          const maybeJson = structured.trim();
          if (maybeJson.startsWith('{') || maybeJson.startsWith('[')) {
            const obj = JSON.parse(maybeJson);
            return this.renderSegments(obj);
          }
          return structured;
        }
        return this.renderSegments(structured);
      } catch (e) {
        return typeof structured === 'string' ? structured : JSON.stringify(structured, null, 2);
      }
    }

    renderSegments(obj) {
      if (!obj) return '';
      const segments = Array.isArray(obj) ? obj : obj.segments || obj.textSegments || [];
      if (!segments.length) return JSON.stringify(obj, null, 2);
      return segments.map((s, i) => {
        const text = s.text || s.content || '';
        const font = s.font || s.typeface || s.style || '';
        const pos = s.position || s.boundingBox || '';
        return `#${i+1} ${text}${font?` — ${font}`:''}${pos?` (${JSON.stringify(pos)})`:''}`;
      }).join('\n');
    }

    async handleApplyEdit() {
      if (!this.state.hasImage || this.state.busy) return;
      const instruction = (this.elements.editInstruction?.value || '').trim();
      const style = (this.elements.editStyle?.value || '').trim();
      if (!instruction) {
        this.setBusy(false, 'Please enter an edit instruction.');
        return;
      }
      try {
        this.setBusy(true, 'Applying text edit...');
        const editor = this.app.modules.editor;
        const base64 = await editor.getImageAsBase64();
        const gemini = this.app.modules.gemini;

        const fullInstruction = this.composeEditInstruction(instruction, style);
        let edited;
        if (typeof gemini.editTextInImage === 'function') {
          edited = await gemini.editTextInImage(base64, fullInstruction);
        } else {
          const prompt = `Edit the embedded text in this image. ${fullInstruction}\nPreserve all non-text content, layout, colors, and composition.`;
          edited = await gemini.editImage(base64, prompt, true);
        }

        if (edited) {
          await editor.loadImage(edited);
          this.setBusy(false, 'Text edit applied.');
        } else {
          this.setBusy(false, 'No edited image returned.');
        }
      } catch (err) {
        console.error('[TextEditor] Edit failed:', err);
        this.setBusy(false, 'Edit failed: ' + (err?.message || err));
      }
    }

    composeEditInstruction(instruction, style) {
      const safety = 'Use high-quality, legible, consistent typography. Avoid artifacts and keep anti-aliasing clean.';
      if (style) {
        return `${instruction} Style: ${style}. ${safety}`;
      }
      return `${instruction}. ${safety}`;
    }
  }

  window.TextEditorManager = TextEditorManager;
})();