/**
 * OptimizedColorPicker.js - High-Performance React-Style Color Picker
 * Implements virtual scrolling, memoization, and optimized rendering
 *
 * Performance Features:
 * - Virtual scrolling for large color lists
 * - Debounced real-time preview updates
 * - Memoized expensive calculations
 * - Efficient DOM updates using RAF
 * - Progressive color loading
 * - Memory-efficient event handling
 */

class OptimizedColorPicker {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = {
            debounceMs: 16, // ~60fps
            virtualScrolling: true,
            virtualItemHeight: 60,
            virtualBufferSize: 10,
            progressiveLoading: true,
            chunkSize: 50,
            maxColors: 10000,
            enableMemoization: true,
            ...options
        };

        // State management
        this.state = {
            colors: new Map(),
            selectedColors: new Map(),
            filterQuery: '',
            sortBy: 'name',
            viewMode: 'grid',
            isLoading: false,
            virtualScrollTop: 0,
            visibleRange: { start: 0, end: 0 }
        };

        // Performance optimization
        this.memoCache = new Map();
        this.debounceTimers = new Map();
        this.rafId = null;
        this.intersectionObserver = null;
        this.colorLoadingQueue = [];

        // DOM elements
        this.elements = {};

        // Event handlers (bound once)
        this.boundHandlers = {
            onColorInputChange: this.handleColorInputChange.bind(this),
            onHexInputChange: this.handleHexInputChange.bind(this),
            onVirtualScroll: this.handleVirtualScroll.bind(this),
            onFilterChange: this.handleFilterChange.bind(this),
            onSortChange: this.handleSortChange.bind(this),
            onViewModeChange: this.handleViewModeChange.bind(this),
            onColorSelect: this.handleColorSelect.bind(this),
            onPreviewUpdate: this.updatePreview.bind(this)
        };

        this.init();
    }

    /**
     * Initialize the optimized color picker
     */
    init() {
        this.createDOM();
        this.setupEventListeners();
        this.setupVirtualScrolling();
        this.setupIntersectionObserver();
        this.loadInitialColors();

        console.log('OptimizedColorPicker initialized with options:', this.options);
    }

    /**
     * Create optimized DOM structure
     */
    createDOM() {
        this.container.innerHTML = `
            <div class="optimized-color-picker">
                <!-- Header Controls -->
                <div class="picker-header">
                    <div class="search-section">
                        <input type="text" id="color-search" placeholder="Search colors..."
                               class="search-input" autocomplete="off">
                        <div class="search-suggestions" id="search-suggestions"></div>
                    </div>

                    <div class="controls-section">
                        <select id="sort-select" class="sort-select">
                            <option value="name">Sort by Name</option>
                            <option value="hue">Sort by Hue</option>
                            <option value="lightness">Sort by Lightness</option>
                            <option value="saturation">Sort by Saturation</option>
                        </select>

                        <div class="view-toggle">
                            <button type="button" class="view-btn active" data-view="grid">Grid</button>
                            <button type="button" class="view-btn" data-view="list">List</button>
                        </div>
                    </div>
                </div>

                <!-- Selected Colors Bar -->
                <div class="selected-colors-bar" id="selected-colors-bar">
                    <div class="selected-colors-container" id="selected-colors-container"></div>
                    <button type="button" class="clear-selection-btn" id="clear-selection">Clear All</button>
                </div>

                <!-- Virtual Scrolling Container -->
                <div class="colors-viewport" id="colors-viewport">
                    <div class="colors-scroll-container" id="colors-scroll-container">
                        <div class="colors-list" id="colors-list"></div>
                    </div>

                    <!-- Loading indicator -->
                    <div class="loading-indicator" id="loading-indicator">
                        <div class="loading-spinner"></div>
                        <span>Loading colors...</span>
                    </div>
                </div>

                <!-- Real-time Preview -->
                <div class="preview-section" id="preview-section">
                    <div class="preview-container">
                        <div class="color-preview" id="color-preview">
                            <div class="preview-swatch" id="preview-swatch"></div>
                            <div class="preview-info" id="preview-info">
                                <div class="color-name" id="preview-name">Select a color</div>
                                <div class="color-values" id="preview-values"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Metrics (Debug) -->
                <div class="performance-metrics" id="performance-metrics" style="display: none;">
                    <div class="metrics-content">
                        <span id="render-time">Render: 0ms</span>
                        <span id="colors-count">Colors: 0</span>
                        <span id="visible-count">Visible: 0</span>
                        <span id="memory-usage">Memory: 0MB</span>
                    </div>
                </div>
            </div>
        `;

        // Cache DOM elements
        this.elements = {
            header: this.container.querySelector('.picker-header'),
            searchInput: this.container.querySelector('#color-search'),
            searchSuggestions: this.container.querySelector('#search-suggestions'),
            sortSelect: this.container.querySelector('#sort-select'),
            viewButtons: this.container.querySelectorAll('.view-btn'),
            selectedColorsBar: this.container.querySelector('#selected-colors-bar'),
            selectedColorsContainer: this.container.querySelector('#selected-colors-container'),
            clearSelectionBtn: this.container.querySelector('#clear-selection'),
            viewport: this.container.querySelector('#colors-viewport'),
            scrollContainer: this.container.querySelector('#colors-scroll-container'),
            colorsList: this.container.querySelector('#colors-list'),
            loadingIndicator: this.container.querySelector('#loading-indicator'),
            previewSection: this.container.querySelector('#preview-section'),
            previewSwatch: this.container.querySelector('#preview-swatch'),
            previewInfo: this.container.querySelector('#preview-info'),
            previewName: this.container.querySelector('#preview-name'),
            previewValues: this.container.querySelector('#preview-values'),
            performanceMetrics: this.container.querySelector('#performance-metrics')
        };
    }

    /**
     * Setup optimized event listeners with delegation
     */
    setupEventListeners() {
        // Search with debouncing
        this.elements.searchInput.addEventListener('input', (e) => {
            this.debounce('search', () => {
                this.boundHandlers.onFilterChange(e.target.value);
            }, 300);
        });

        // Sort change
        this.elements.sortSelect.addEventListener('change', (e) => {
            this.boundHandlers.onSortChange(e.target.value);
        });

        // View mode toggle
        this.elements.viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewMode = e.target.dataset.view;
                this.boundHandlers.onViewModeChange(viewMode);
            });
        });

        // Clear selection
        this.elements.clearSelectionBtn.addEventListener('click', () => {
            this.clearSelection();
        });

        // Virtual scrolling
        if (this.options.virtualScrolling) {
            this.elements.viewport.addEventListener('scroll', (e) => {
                this.debounce('scroll', () => {
                    this.boundHandlers.onVirtualScroll(e.target.scrollTop);
                }, this.options.debounceMs);
            });
        }

        // Color selection (event delegation)
        this.elements.colorsList.addEventListener('click', (e) => {
            const colorItem = e.target.closest('.color-item');
            if (colorItem) {
                const colorId = colorItem.dataset.colorId;
                this.boundHandlers.onColorSelect(colorId, e.ctrlKey || e.metaKey);
            }
        });

        // Color preview on hover (event delegation)
        this.elements.colorsList.addEventListener('mouseover', (e) => {
            const colorItem = e.target.closest('.color-item');
            if (colorItem) {
                const colorId = colorItem.dataset.colorId;
                this.debounce('preview', () => {
                    this.boundHandlers.onPreviewUpdate(colorId);
                }, 50);
            }
        });

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    /**
     * Setup virtual scrolling optimization
     */
    setupVirtualScrolling() {
        if (!this.options.virtualScrolling) return;

        // Calculate initial visible range
        this.updateVisibleRange();

        // Setup scroll container height based on total items
        this.updateScrollContainerHeight();
    }

    /**
     * Setup intersection observer for progressive loading
     */
    setupIntersectionObserver() {
        if (!this.options.progressiveLoading) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const colorItem = entry.target;
                    this.loadColorDetails(colorItem.dataset.colorId);
                }
            });
        }, {
            root: this.elements.viewport,
            rootMargin: '100px',
            threshold: 0.1
        });
    }

    /**
     * Load initial color set
     */
    async loadInitialColors() {
        this.state.isLoading = true;
        this.showLoading(true);

        try {
            // Load Sanzo colors first
            const sanzoColors = await this.loadSanzoColors();

            // Add to state
            sanzoColors.forEach(color => {
                this.state.colors.set(color.id, color);
            });

            // Initial render
            this.renderColors();

            // Load additional colors progressively
            if (this.options.progressiveLoading) {
                this.loadAdditionalColors();
            }

        } catch (error) {
            console.error('Failed to load initial colors:', error);
        } finally {
            this.state.isLoading = false;
            this.showLoading(false);
        }
    }

    /**
     * Load Sanzo color database
     */
    async loadSanzoColors() {
        try {
            const response = await fetch('/src/data/sanzo-colors.json');
            const data = await response.json();

            return data.colors.map(color => ({
                id: `sanzo_${color.id}`,
                name: color.name_english,
                nameJapanese: color.name_japanese,
                hex: color.hex,
                rgb: color.rgb,
                lab: color.lab,
                hsl: color.hsl,
                category: color.category,
                culturalSignificance: color.cultural_significance,
                season: color.season_association,
                source: 'sanzo',
                metadata: {
                    frequency: color.frequency_in_combinations,
                    psychologicalEffects: color.psychological_effects,
                    textures: color.texture_affinity
                }
            }));

        } catch (error) {
            console.error('Failed to load Sanzo colors:', error);
            return [];
        }
    }

    /**
     * Load additional color libraries progressively
     */
    async loadAdditionalColors() {
        const colorLibraries = [
            { name: 'css-colors', url: '/data/css-colors.json' },
            { name: 'material-colors', url: '/data/material-colors.json' },
            { name: 'pantone-colors', url: '/data/pantone-colors.json' }
        ];

        for (const library of colorLibraries) {
            try {
                const response = await fetch(library.url);
                if (response.ok) {
                    const colors = await response.json();
                    this.addColorsToState(colors, library.name);
                }
            } catch (error) {
                console.log(`Optional library ${library.name} not available`);
            }
        }
    }

    /**
     * Add colors to state with deduplication
     */
    addColorsToState(colors, source) {
        let addedCount = 0;

        colors.forEach((color, index) => {
            if (this.state.colors.size >= this.options.maxColors) return;

            const colorId = `${source}_${index}`;
            if (!this.state.colors.has(colorId)) {
                this.state.colors.set(colorId, {
                    id: colorId,
                    name: color.name || `Color ${index}`,
                    hex: color.hex,
                    rgb: color.rgb,
                    source,
                    ...color
                });
                addedCount++;
            }
        });

        if (addedCount > 0) {
            console.log(`Added ${addedCount} colors from ${source}`);
            this.renderColors();
        }
    }

    /**
     * Render colors with virtual scrolling optimization
     */
    renderColors() {
        const startTime = performance.now();

        // Get filtered and sorted colors
        const filteredColors = this.getFilteredColors();
        const sortedColors = this.getSortedColors(filteredColors);

        // Update virtual scrolling
        if (this.options.virtualScrolling) {
            this.renderVirtualColors(sortedColors);
        } else {
            this.renderAllColors(sortedColors);
        }

        // Update performance metrics
        const renderTime = performance.now() - startTime;
        this.updatePerformanceMetrics(renderTime, sortedColors.length);

        // Update selected colors bar
        this.updateSelectedColorsBar();
    }

    /**
     * Render colors using virtual scrolling
     */
    renderVirtualColors(colors) {
        const { start, end } = this.state.visibleRange;
        const visibleColors = colors.slice(start, end);

        // Update scroll container height
        const totalHeight = colors.length * this.options.virtualItemHeight;
        this.elements.scrollContainer.style.height = `${totalHeight}px`;

        // Update colors list position
        const offsetY = start * this.options.virtualItemHeight;
        this.elements.colorsList.style.transform = `translateY(${offsetY}px)`;

        // Render visible colors
        this.elements.colorsList.innerHTML = visibleColors.map((color, index) =>
            this.createColorItemHTML(color, start + index)
        ).join('');

        // Setup intersection observer for visible items
        if (this.intersectionObserver) {
            this.elements.colorsList.querySelectorAll('.color-item').forEach(item => {
                this.intersectionObserver.observe(item);
            });
        }
    }

    /**
     * Render all colors (non-virtual mode)
     */
    renderAllColors(colors) {
        const colorItems = colors.map((color, index) =>
            this.createColorItemHTML(color, index)
        ).join('');

        this.elements.colorsList.innerHTML = colorItems;
    }

    /**
     * Create HTML for a color item with memoization
     */
    createColorItemHTML(color, index) {
        const cacheKey = `color_item_${color.id}_${this.state.viewMode}`;

        if (this.options.enableMemoization && this.memoCache.has(cacheKey)) {
            return this.memoCache.get(cacheKey);
        }

        const isSelected = this.state.selectedColors.has(color.id);
        const rgbValues = color.rgb || this.hexToRgb(color.hex) || { r: 0, g: 0, b: 0 };

        const html = `
            <div class="color-item ${isSelected ? 'selected' : ''} ${this.state.viewMode}-mode"
                 data-color-id="${color.id}"
                 data-index="${index}"
                 style="background-color: ${color.hex};">

                <div class="color-overlay">
                    <div class="color-info">
                        <div class="color-name">${this.escapeHtml(color.name)}</div>
                        <div class="color-hex">${color.hex}</div>

                        ${this.state.viewMode === 'list' ? `
                            <div class="color-details">
                                <div class="color-rgb">RGB(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})</div>
                                ${color.category ? `<div class="color-category">${color.category}</div>` : ''}
                                ${color.source ? `<div class="color-source">${color.source}</div>` : ''}
                            </div>
                        ` : ''}
                    </div>

                    <div class="color-actions">
                        <button class="select-btn" title="Select color">
                            ${isSelected ? '✓' : '+'}
                        </button>
                    </div>
                </div>

                ${isSelected ? '<div class="selection-indicator"></div>' : ''}
            </div>
        `;

        // Cache the result
        if (this.options.enableMemoization) {
            this.memoCache.set(cacheKey, html);
        }

        return html;
    }

    /**
     * Update visible range for virtual scrolling
     */
    updateVisibleRange() {
        if (!this.options.virtualScrolling) return;

        const scrollTop = this.elements.viewport.scrollTop;
        const viewportHeight = this.elements.viewport.clientHeight;
        const itemHeight = this.options.virtualItemHeight;

        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - this.options.virtualBufferSize);
        const visibleCount = Math.ceil(viewportHeight / itemHeight);
        const end = start + visibleCount + (this.options.virtualBufferSize * 2);

        this.state.visibleRange = { start, end };
    }

    /**
     * Get filtered colors based on search query
     */
    getFilteredColors() {
        const query = this.state.filterQuery.toLowerCase().trim();

        if (!query) {
            return Array.from(this.state.colors.values());
        }

        const cacheKey = `filter_${query}`;
        if (this.options.enableMemoization && this.memoCache.has(cacheKey)) {
            return this.memoCache.get(cacheKey);
        }

        const filtered = Array.from(this.state.colors.values()).filter(color => {
            return color.name.toLowerCase().includes(query) ||
                   color.hex.toLowerCase().includes(query) ||
                   (color.category && color.category.toLowerCase().includes(query)) ||
                   (color.nameJapanese && color.nameJapanese.includes(query));
        });

        if (this.options.enableMemoization) {
            this.memoCache.set(cacheKey, filtered);
        }

        return filtered;
    }

    /**
     * Get sorted colors based on current sort criteria
     */
    getSortedColors(colors) {
        const cacheKey = `sort_${this.state.sortBy}_${colors.length}`;
        if (this.options.enableMemoization && this.memoCache.has(cacheKey)) {
            return this.memoCache.get(cacheKey);
        }

        const sorted = [...colors].sort((a, b) => {
            switch (this.state.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);

                case 'hue':
                    const hslA = a.hsl || this.rgbToHsl(a.rgb || this.hexToRgb(a.hex));
                    const hslB = b.hsl || this.rgbToHsl(b.rgb || this.hexToRgb(b.hex));
                    return (hslA?.h || 0) - (hslB?.h || 0);

                case 'lightness':
                    const hslA2 = a.hsl || this.rgbToHsl(a.rgb || this.hexToRgb(a.hex));
                    const hslB2 = b.hsl || this.rgbToHsl(b.rgb || this.hexToRgb(b.hex));
                    return (hslB2?.l || 0) - (hslA2?.l || 0); // Descending

                case 'saturation':
                    const hslA3 = a.hsl || this.rgbToHsl(a.rgb || this.hexToRgb(a.hex));
                    const hslB3 = b.hsl || this.rgbToHsl(b.rgb || this.hexToRgb(b.hex));
                    return (hslB3?.s || 0) - (hslA3?.s || 0); // Descending

                default:
                    return 0;
            }
        });

        if (this.options.enableMemoization) {
            this.memoCache.set(cacheKey, sorted);
        }

        return sorted;
    }

    // Event Handlers

    handleFilterChange(query) {
        this.state.filterQuery = query;
        this.clearMemoCache(['filter_', 'sort_']);
        this.renderColors();
    }

    handleSortChange(sortBy) {
        this.state.sortBy = sortBy;
        this.clearMemoCache(['sort_']);
        this.renderColors();
    }

    handleViewModeChange(viewMode) {
        this.state.viewMode = viewMode;

        // Update button states
        this.elements.viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewMode);
        });

        // Clear memoized color items
        this.clearMemoCache(['color_item_']);
        this.renderColors();
    }

    handleVirtualScroll(scrollTop) {
        this.state.virtualScrollTop = scrollTop;
        this.updateVisibleRange();
        this.renderColors();
    }

    handleColorSelect(colorId, isMultiSelect = false) {
        if (!isMultiSelect && !this.state.selectedColors.has(colorId)) {
            this.state.selectedColors.clear();
        }

        if (this.state.selectedColors.has(colorId)) {
            this.state.selectedColors.delete(colorId);
        } else {
            const color = this.state.colors.get(colorId);
            if (color) {
                this.state.selectedColors.set(colorId, color);
            }
        }

        // Clear color item cache to update selection state
        this.clearMemoCache(['color_item_']);
        this.renderColors();

        // Trigger selection change event
        this.dispatchCustomEvent('selectionchange', {
            selectedColors: Array.from(this.state.selectedColors.values())
        });
    }

    updatePreview(colorId) {
        const color = this.state.colors.get(colorId);
        if (!color) return;

        this.elements.previewSwatch.style.backgroundColor = color.hex;
        this.elements.previewName.textContent = color.name;

        const rgbValues = color.rgb || this.hexToRgb(color.hex);
        const hslValues = color.hsl || this.rgbToHsl(rgbValues);

        this.elements.previewValues.innerHTML = `
            <div class="value-row">HEX: ${color.hex}</div>
            <div class="value-row">RGB: ${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}</div>
            <div class="value-row">HSL: ${hslValues.h}°, ${hslValues.s}%, ${hslValues.l}%</div>
            ${color.category ? `<div class="value-row">Category: ${color.category}</div>` : ''}
        `;
    }

    // Utility Methods

    debounce(key, func, delay) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        const timerId = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);

        this.debounceTimers.set(key, timerId);
    }

    clearMemoCache(prefixes = []) {
        if (prefixes.length === 0) {
            this.memoCache.clear();
            return;
        }

        for (const key of this.memoCache.keys()) {
            if (prefixes.some(prefix => key.startsWith(prefix))) {
                this.memoCache.delete(key);
            }
        }
    }

    updateSelectedColorsBar() {
        const selectedCount = this.state.selectedColors.size;

        if (selectedCount === 0) {
            this.elements.selectedColorsBar.style.display = 'none';
            return;
        }

        this.elements.selectedColorsBar.style.display = 'flex';

        const selectedColorsHtml = Array.from(this.state.selectedColors.values())
            .map(color => `
                <div class="selected-color-item" data-color-id="${color.id}">
                    <div class="selected-swatch" style="background-color: ${color.hex};"></div>
                    <div class="selected-name">${this.escapeHtml(color.name)}</div>
                    <button class="remove-selected-btn" title="Remove">×</button>
                </div>
            `).join('');

        this.elements.selectedColorsContainer.innerHTML = selectedColorsHtml;
    }

    showLoading(show) {
        this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    }

    updatePerformanceMetrics(renderTime, colorCount) {
        if (!this.options.debugMode) return;

        this.elements.performanceMetrics.style.display = 'block';

        const memoryUsage = (performance.memory?.usedJSHeapSize || 0) / (1024 * 1024);

        this.elements.performanceMetrics.querySelector('#render-time').textContent =
            `Render: ${renderTime.toFixed(2)}ms`;
        this.elements.performanceMetrics.querySelector('#colors-count').textContent =
            `Colors: ${this.state.colors.size}`;
        this.elements.performanceMetrics.querySelector('#visible-count').textContent =
            `Visible: ${colorCount}`;
        this.elements.performanceMetrics.querySelector('#memory-usage').textContent =
            `Memory: ${memoryUsage.toFixed(1)}MB`;
    }

    clearSelection() {
        this.state.selectedColors.clear();
        this.clearMemoCache(['color_item_']);
        this.renderColors();

        this.dispatchCustomEvent('selectionchange', {
            selectedColors: []
        });
    }

    dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        this.container.dispatchEvent(event);
    }

    // Color conversion utilities

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHsl(rgb) {
        if (!rgb) return null;

        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        const lightness = (max + min) / 2;

        if (diff === 0) {
            return { h: 0, s: 0, l: Math.round(lightness * 100) };
        }

        const saturation = lightness > 0.5 ? diff / (2 - max - min) : diff / (max + min);

        let hue;
        switch (max) {
            case r: hue = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
            case g: hue = ((b - r) / diff + 2) / 6; break;
            case b: hue = ((r - g) / diff + 4) / 6; break;
        }

        return {
            h: Math.round(hue * 360),
            s: Math.round(saturation * 100),
            l: Math.round(lightness * 100)
        };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Keyboard navigation
    handleKeyboardNavigation(e) {
        // Implementation for keyboard navigation
        // Arrow keys, Enter, Space, etc.
    }

    // Public API

    getSelectedColors() {
        return Array.from(this.state.selectedColors.values());
    }

    setSelectedColors(colorIds) {
        this.state.selectedColors.clear();
        colorIds.forEach(id => {
            const color = this.state.colors.get(id);
            if (color) {
                this.state.selectedColors.set(id, color);
            }
        });
        this.renderColors();
    }

    addCustomColor(color) {
        const colorId = `custom_${Date.now()}`;
        this.state.colors.set(colorId, {
            id: colorId,
            source: 'custom',
            ...color
        });
        this.clearMemoCache();
        this.renderColors();
        return colorId;
    }

    removeColor(colorId) {
        this.state.colors.delete(colorId);
        this.state.selectedColors.delete(colorId);
        this.clearMemoCache();
        this.renderColors();
    }

    destroy() {
        // Cleanup event listeners
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        // Clear timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // Clear caches
        this.memoCache.clear();
        this.state.colors.clear();
        this.state.selectedColors.clear();

        console.log('OptimizedColorPicker destroyed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedColorPicker;
} else if (typeof window !== 'undefined') {
    window.OptimizedColorPicker = OptimizedColorPicker;
}