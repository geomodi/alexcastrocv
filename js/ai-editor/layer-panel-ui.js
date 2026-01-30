/**
 * LayerPanelUI - Renders and manages the layer panel interface
 * Handles user interactions and updates the visual state
 */

class LayerPanelUI {
    constructor(layerManager, containerId, editor = null) {
        this.layerManager = layerManager;
        this.editor = editor;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error('Layer panel container not found:', containerId);
            return;
        }

        // Bind layer manager callback
        this.layerManager.onLayerChange = () => this.render();

        // Debounce thumbnail updates
        this.thumbnailUpdateTimeout = null;

        // Initialize
        this.render();
    }

    /**
     * Render the entire layer panel
     */
    render() {
        const layers = this.layerManager.getAllLayers();
        const activeLayer = this.layerManager.getActiveLayer();
        
        // Clear container
        this.container.innerHTML = '';
        
        // Create header
        const header = this._createHeader();
        this.container.appendChild(header);
        
        // Create layer list
        const layerList = document.createElement('div');
        layerList.className = 'layer-list';
        
        // Render layers in reverse order (top layer first visually)
        const reversedLayers = [...layers].reverse();
        reversedLayers.forEach(layer => {
            const layerItem = this._createLayerItem(layer, layer.id === activeLayer?.id);
            layerList.appendChild(layerItem);
        });
        
        this.container.appendChild(layerList);
        
        // Create footer with quick actions
        const footer = this._createFooter();
        this.container.appendChild(footer);
        
        // Update thumbnails (debounced)
        this._scheduleThumbnailUpdate();
    }

    /**
     * Create panel header
     * @private
     */
    _createHeader() {
        const header = document.createElement('div');
        header.className = 'layer-panel-header';
        
        const title = document.createElement('h5');
        title.innerHTML = '<i class="fas fa-layer-group"></i> Layers';
        
        const addButton = document.createElement('button');
        addButton.className = 'layer-add-btn';
        addButton.innerHTML = '<i class="fas fa-plus"></i>';
        addButton.title = 'Add blank layer (use Upload Image button to add image layers)';
        addButton.onclick = () => this._handleAddLayer();

        // Disable if at limit
        if (this.layerManager.isAtLayerLimit()) {
            addButton.disabled = true;
            addButton.title = `Maximum ${this.layerManager.maxLayers} layers reached`;
        }
        
        header.appendChild(title);
        header.appendChild(addButton);
        
        return header;
    }

    /**
     * Create layer item element
     * @private
     */
    _createLayerItem(layer, isActive) {
        const item = document.createElement('div');
        item.className = 'layer-item' + (isActive ? ' active' : '');
        item.dataset.layerId = layer.id;
        
        // Click to select layer
        item.onclick = (e) => {
            if (!e.target.closest('.layer-action-btn')) {
                this._handleLayerClick(layer.id);
            }
        };
        
        // Thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'layer-thumbnail';
        if (layer.thumbnail) {
            thumbnail.style.backgroundImage = `url(${layer.thumbnail})`;
        } else {
            thumbnail.innerHTML = '<i class="fas fa-image"></i>';
        }
        
        // Info section
        const info = document.createElement('div');
        info.className = 'layer-info';
        
        // Name (editable)
        const name = document.createElement('div');
        name.className = 'layer-name';
        name.textContent = layer.name;
        name.title = 'Double-click to rename';
        name.ondblclick = () => this._handleRename(layer.id, name);
        
        // Controls
        const controls = document.createElement('div');
        controls.className = 'layer-controls';
        
        // Visibility toggle
        const visibilityBtn = document.createElement('button');
        visibilityBtn.className = 'layer-action-btn';
        visibilityBtn.innerHTML = layer.visible 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
        visibilityBtn.title = layer.visible ? 'Hide layer' : 'Show layer';
        visibilityBtn.onclick = (e) => {
            e.stopPropagation();
            this._handleVisibilityToggle(layer.id);
        };
        
        controls.appendChild(visibilityBtn);
        
        info.appendChild(name);
        info.appendChild(controls);
        
        // Opacity slider (only for active layer)
        if (isActive) {
            const opacityControl = this._createOpacityControl(layer);
            info.appendChild(opacityControl);
        }
        
        item.appendChild(thumbnail);
        item.appendChild(info);
        
        // Apply opacity to item if layer is hidden
        if (!layer.visible) {
            item.style.opacity = '0.5';
        }
        
        return item;
    }

    /**
     * Create opacity control slider
     * @private
     */
    _createOpacityControl(layer) {
        const opacityDiv = document.createElement('div');
        opacityDiv.className = 'layer-opacity-control';

        const label = document.createElement('label');
        label.textContent = 'Opacity:';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = Math.round(layer.opacity * 100);
        slider.className = 'layer-opacity-slider';

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'opacity-value';
        valueDisplay.textContent = `${Math.round(layer.opacity * 100)}%`;

        // Use oninput for live preview (updates display only, no re-render)
        slider.oninput = (e) => {
            const value = parseInt(e.target.value);
            valueDisplay.textContent = `${value}%`;
            // Update Konva layer opacity directly without triggering re-render
            const layerObj = this.layerManager.getLayer(layer.id);
            if (layerObj && layerObj.konvaLayer) {
                layerObj.konvaLayer.opacity(value / 100);
            }
        };

        // Use onchange to save the final value (fires after drag is complete)
        slider.onchange = (e) => {
            const value = parseInt(e.target.value);
            // Update the layer manager state (this will trigger re-render, but only after drag is done)
            this.layerManager.setOpacity(layer.id, value / 100);
        };

        opacityDiv.appendChild(label);
        opacityDiv.appendChild(slider);
        opacityDiv.appendChild(valueDisplay);

        return opacityDiv;
    }

    /**
     * Create footer with quick actions
     * @private
     */
    _createFooter() {
        const footer = document.createElement('div');
        footer.className = 'layer-panel-footer';

        const layers = this.layerManager.getAllLayers();
        const activeLayer = this.layerManager.getActiveLayer();
        const canDelete = layers.length > 1;
        const canAdd = !this.layerManager.isAtLayerLimit();
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'layer-footer-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = canDelete ? 'Delete layer' : 'Cannot delete the only layer';
        deleteBtn.disabled = !canDelete;
        deleteBtn.onclick = () => this._handleDelete(activeLayer?.id);
        
        // Duplicate button
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'layer-footer-btn';
        duplicateBtn.innerHTML = '<i class="fas fa-copy"></i>';
        duplicateBtn.title = canAdd ? 'Duplicate layer' : `Maximum ${this.layerManager.maxLayers} layers reached`;
        duplicateBtn.disabled = !canAdd;
        duplicateBtn.onclick = () => this._handleDuplicate(activeLayer?.id);
        
        // Move up button
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'layer-footer-btn';
        moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        moveUpBtn.title = 'Move layer up';
        moveUpBtn.onclick = () => this._handleMoveUp(activeLayer?.id);
        
        // Move down button
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'layer-footer-btn';
        moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
        moveDownBtn.title = 'Move layer down';
        moveDownBtn.onclick = () => this._handleMoveDown(activeLayer?.id);

        // Merge down button
        const mergeDownBtn = document.createElement('button');
        mergeDownBtn.className = 'layer-footer-btn';
        mergeDownBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
        mergeDownBtn.title = 'Merge down';
        mergeDownBtn.disabled = layers.length < 2;
        mergeDownBtn.onclick = () => this._handleMergeDown();

        // Flatten all button
        const flattenBtn = document.createElement('button');
        flattenBtn.className = 'layer-footer-btn';
        flattenBtn.innerHTML = '<i class="fas fa-layer-group"></i>';
        flattenBtn.title = 'Flatten all layers';
        flattenBtn.disabled = layers.length < 2;
        flattenBtn.onclick = () => this._handleFlattenAll();

        footer.appendChild(deleteBtn);
        footer.appendChild(duplicateBtn);
        footer.appendChild(moveUpBtn);
        footer.appendChild(moveDownBtn);
        footer.appendChild(mergeDownBtn);
        footer.appendChild(flattenBtn);

        return footer;
    }

    /**
     * Handle add layer - creates a blank layer
     * To add an image layer, use the "Upload Image" button instead
     * @private
     */
    _handleAddLayer() {
        const newLayer = this.layerManager.addLayer();
        if (!newLayer) {
            alert(`Maximum ${this.layerManager.maxLayers} layers reached`);
        }
    }

    /**
     * Handle layer click (select)
     * @private
     */
    _handleLayerClick(layerId) {
        this.layerManager.setActiveLayer(layerId);
    }

    /**
     * Handle visibility toggle
     * @private
     */
    _handleVisibilityToggle(layerId) {
        this.layerManager.toggleVisibility(layerId);
    }

    /**
     * Handle layer rename
     * @private
     */
    _handleRename(layerId, nameElement) {
        const currentName = nameElement.textContent;
        const newName = prompt('Enter new layer name:', currentName);
        
        if (newName && newName.trim() !== '' && newName !== currentName) {
            this.layerManager.renameLayer(layerId, newName.trim());
        }
    }

    /**
     * Handle layer delete
     * @private
     */
    _handleDelete(layerId) {
        if (!layerId) return;
        
        const layer = this.layerManager.getLayer(layerId);
        if (!layer) return;
        
        // Confirm if layer has content (has thumbnail)
        if (layer.thumbnail) {
            if (!confirm(`Delete layer "${layer.name}"?`)) {
                return;
            }
        }
        
        this.layerManager.deleteLayer(layerId);
    }

    /**
     * Handle layer duplicate
     * @private
     */
    _handleDuplicate(layerId) {
        if (!layerId) return;
        
        const newLayer = this.layerManager.duplicateLayer(layerId);
        if (!newLayer) {
            alert(`Maximum ${this.layerManager.maxLayers} layers reached`);
        }
    }

    /**
     * Handle move layer up
     * @private
     */
    _handleMoveUp(layerId) {
        if (!layerId) return;
        this.layerManager.moveLayerUp(layerId);
    }

    /**
     * Handle move layer down
     * @private
     */
    _handleMoveDown(layerId) {
        if (!layerId) return;
        this.layerManager.moveLayerDown(layerId);
    }

    /**
     * Schedule thumbnail update (debounced)
     * @private
     */
    _scheduleThumbnailUpdate() {
        if (this.thumbnailUpdateTimeout) {
            clearTimeout(this.thumbnailUpdateTimeout);
        }
        
        this.thumbnailUpdateTimeout = setTimeout(() => {
            this._updateAllThumbnails();
        }, 500); // 500ms debounce
    }

    /**
     * Update all layer thumbnails
     * @private
     */
    _updateAllThumbnails() {
        const layers = this.layerManager.getAllLayers();
        
        layers.forEach(layer => {
            const thumbnail = this.layerManager.generateThumbnail(layer.id);

            if (thumbnail) {
                // Update thumbnail in DOM
                const layerItem = this.container.querySelector(`[data-layer-id="${layer.id}"]`);
                if (layerItem) {
                    const thumbnailEl = layerItem.querySelector('.layer-thumbnail');
                    if (thumbnailEl) {
                        thumbnailEl.style.backgroundImage = `url(${thumbnail})`;
                        thumbnailEl.innerHTML = ''; // Remove placeholder icon
                    }
                }
            }
        });
    }

    /**
     * Handle merge down
     * @private
     */
    _handleMergeDown() {
        if (confirm('Merge active layer with the layer below? This cannot be undone.')) {
            const success = this.layerManager.mergeDown();
            if (!success) {
                alert('Cannot merge: active layer is at bottom or only one layer exists');
            }
        }
    }

    /**
     * Handle flatten all
     * @private
     */
    _handleFlattenAll() {
        if (confirm('Flatten all visible layers into one? This cannot be undone.')) {
            const success = this.layerManager.flattenAll();
            if (!success) {
                alert('Cannot flatten: only one layer exists');
            }
        }
    }
}

