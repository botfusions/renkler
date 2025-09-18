/**
 * ScreenReaderEnhanced.js - Advanced Screen Reader Support
 * Enhanced screen reader announcements and ARIA live region management
 */

class ScreenReaderEnhanced {
    constructor() {
        this.liveRegions = {};
        this.announcementQueue = [];
        this.isProcessingQueue = false;
        this.lastAnnouncement = '';
        this.lastAnnouncementTime = 0;
        this.announceRate = 500; // Minimum time between announcements

        this.initialize();
    }

    /**
     * Initialize enhanced screen reader support
     */
    initialize() {
        this.createLiveRegions();
        this.setupFormEnhancements();
        this.setupColorAccessibilityEnhancements();
        this.setupProgressAnnouncements();
        this.setupDynamicContentAnnouncements();
        console.log('Enhanced screen reader support initialized');
    }

    /**
     * Create comprehensive live regions for different announcement types
     */
    createLiveRegions() {
        // Primary announcer for general messages
        this.liveRegions.polite = this.createLiveRegion('polite', 'polite');

        // Urgent announcer for errors and critical information
        this.liveRegions.assertive = this.createLiveRegion('assertive', 'assertive');

        // Status announcer for status updates
        this.liveRegions.status = this.createLiveRegion('status', 'polite', 'status');

        // Form announcer for form-specific feedback
        this.liveRegions.form = this.createLiveRegion('form', 'polite');

        // Color announcer for color-specific information
        this.liveRegions.color = this.createLiveRegion('color', 'polite');

        // Progress announcer for loading and progress updates
        this.liveRegions.progress = this.createLiveRegion('progress', 'polite', 'progressbar');
    }

    /**
     * Create a live region with specific properties
     */
    createLiveRegion(id, politeness, role = null) {
        const region = document.createElement('div');
        region.id = `sr-${id}`;
        region.className = 'sr-only';
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', 'true');

        if (role) {
            region.setAttribute('role', role);
        }

        // Insert at the beginning of body for better screen reader priority
        document.body.insertBefore(region, document.body.firstChild);
        return region;
    }

    /**
     * Enhanced announcement system with queuing and rate limiting
     */
    announce(message, options = {}) {
        const {
            priority = 'polite',
            category = 'general',
            delay = 0,
            unique = true,
            context = null
        } = options;

        // Skip duplicate announcements within rate limit
        if (unique && this.isDuplicateAnnouncement(message)) {
            return;
        }

        const announcement = {
            message,
            priority,
            category,
            delay,
            context,
            timestamp: Date.now()
        };

        if (delay > 0) {
            setTimeout(() => {
                this.processAnnouncement(announcement);
            }, delay);
        } else {
            this.processAnnouncement(announcement);
        }
    }

    /**
     * Process announcement with appropriate live region
     */
    processAnnouncement(announcement) {
        const { message, priority, category } = announcement;

        let targetRegion = this.liveRegions.polite;

        switch (priority) {
            case 'assertive':
            case 'urgent':
            case 'error':
                targetRegion = this.liveRegions.assertive;
                break;
            case 'status':
                targetRegion = this.liveRegions.status;
                break;
            case 'progress':
                targetRegion = this.liveRegions.progress;
                break;
        }

        switch (category) {
            case 'form':
                targetRegion = this.liveRegions.form;
                break;
            case 'color':
                targetRegion = this.liveRegions.color;
                break;
        }

        this.updateLiveRegion(targetRegion, message);
        this.lastAnnouncement = message;
        this.lastAnnouncementTime = Date.now();
    }

    /**
     * Update live region with timing considerations
     */
    updateLiveRegion(region, message) {
        // Clear the region first to ensure re-announcement
        region.textContent = '';

        // Use a small delay to ensure screen readers detect the change
        setTimeout(() => {
            region.textContent = message;
        }, 50);

        // Clear after announcement to allow for re-announcement of same text
        setTimeout(() => {
            region.textContent = '';
        }, 3000);
    }

    /**
     * Check if announcement is duplicate within rate limit
     */
    isDuplicateAnnouncement(message) {
        const now = Date.now();
        return this.lastAnnouncement === message &&
               (now - this.lastAnnouncementTime) < this.announceRate;
    }

    /**
     * Setup enhanced form accessibility announcements
     */
    setupFormEnhancements() {
        // Form validation announcements
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.handleFormInput(e.target);
            }
        });

        // Form submission feedback
        document.addEventListener('submit', (e) => {
            this.announce('Form submitted, processing...', {
                priority: 'status',
                category: 'form'
            });
        });

        // Form reset feedback
        document.addEventListener('reset', (e) => {
            this.announce('Form reset to default values', {
                priority: 'polite',
                category: 'form'
            });
        });
    }

    /**
     * Handle form input changes with accessibility feedback
     */
    handleFormInput(input) {
        const value = input.value;
        const label = this.getInputLabel(input);

        // Special handling for different input types
        switch (input.type) {
            case 'color':
                this.handleColorInputChange(input, value, label);
                break;
            case 'range':
                this.handleRangeInputChange(input, value, label);
                break;
            case 'file':
                this.handleFileInputChange(input, label);
                break;
            default:
                // Standard input validation feedback
                if (input.checkValidity && !input.checkValidity()) {
                    this.announceValidationError(input, label);
                }
                break;
        }
    }

    /**
     * Handle color input changes with detailed announcements
     */
    handleColorInputChange(input, value, label) {
        // Get color name if AccessibilityUtils is available
        let colorName = value;
        if (window.AccessibilityUtils) {
            const utils = new window.AccessibilityUtils();
            colorName = utils.getAccessibleColorName(value);
        }

        this.announce(`${label} changed to ${colorName}`, {
            priority: 'polite',
            category: 'color',
            delay: 300 // Small delay to avoid overwhelming announcements
        });

        // Update associated preview elements
        this.updateColorPreviewAnnouncements(input, colorName);
    }

    /**
     * Update color preview announcements
     */
    updateColorPreviewAnnouncements(input, colorName) {
        const preview = input.parentElement.querySelector('.color-preview');
        if (preview) {
            const contextName = input.name || 'color';
            preview.setAttribute('aria-label', `${contextName} preview: ${colorName}`);
        }
    }

    /**
     * Handle range input changes
     */
    handleRangeInputChange(input, value, label) {
        const min = input.min || 0;
        const max = input.max || 100;
        const percentage = Math.round(((value - min) / (max - min)) * 100);

        this.announce(`${label}: ${value}, ${percentage} percent`, {
            priority: 'polite',
            delay: 200
        });
    }

    /**
     * Handle file input changes
     */
    handleFileInputChange(input, label) {
        const files = input.files;
        if (files.length > 0) {
            const fileNames = Array.from(files).map(f => f.name).join(', ');
            this.announce(`${label}: ${files.length} file${files.length > 1 ? 's' : ''} selected: ${fileNames}`, {
                priority: 'polite',
                category: 'form'
            });
        }
    }

    /**
     * Announce validation errors with context
     */
    announceValidationError(input, label) {
        const errorMessage = input.validationMessage || 'Invalid input';
        this.announce(`${label}: ${errorMessage}`, {
            priority: 'assertive',
            category: 'form'
        });
    }

    /**
     * Get accessible label for input element
     */
    getInputLabel(input) {
        // Try multiple methods to get label
        if (input.labels && input.labels.length > 0) {
            return input.labels[0].textContent.trim();
        }

        if (input.getAttribute('aria-label')) {
            return input.getAttribute('aria-label');
        }

        const labelledBy = input.getAttribute('aria-labelledby');
        if (labelledBy) {
            const labelElement = document.getElementById(labelledBy);
            if (labelElement) {
                return labelElement.textContent.trim();
            }
        }

        const placeholder = input.placeholder;
        if (placeholder) {
            return placeholder;
        }

        return input.name || 'Input field';
    }

    /**
     * Setup color-specific accessibility enhancements
     */
    setupColorAccessibilityEnhancements() {
        // Monitor color changes throughout the application
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' ||
                     mutation.attributeName === 'data-color')) {
                    this.handleColorChange(mutation.target);
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'data-color', 'aria-label']
        });

        // Setup color pattern announcements
        this.setupColorPatternAnnouncements();
    }

    /**
     * Handle dynamic color changes
     */
    handleColorChange(element) {
        if (element.matches('.color-preview, .color-swatch')) {
            const bgColor = element.style.backgroundColor;
            if (bgColor && window.AccessibilityUtils) {
                const utils = new window.AccessibilityUtils();
                const colorName = utils.getAccessibleColorName(this.rgbToHex(bgColor));

                // Update aria-label if it's currently focused
                if (document.activeElement === element) {
                    this.announce(`Color changed to ${colorName}`, {
                        priority: 'polite',
                        category: 'color'
                    });
                }
            }
        }
    }

    /**
     * Setup color pattern announcements for accessibility
     */
    setupColorPatternAnnouncements() {
        // Announce when color patterns are toggled
        document.addEventListener('change', (e) => {
            if (e.target.matches('#color-patterns-toggle')) {
                const enabled = e.target.checked;
                this.announce(
                    `Color patterns ${enabled ? 'enabled' : 'disabled'}. ${enabled ? 'Visual patterns added to help distinguish colors.' : 'Visual patterns removed.'}`,
                    { priority: 'polite' }
                );
            }
        });
    }

    /**
     * Setup progress announcements for loading states
     */
    setupProgressAnnouncements() {
        // Monitor loading states
        document.addEventListener('loading:start', (e) => {
            this.announce('Processing started...', {
                priority: 'status',
                category: 'progress'
            });
        });

        document.addEventListener('loading:progress', (e) => {
            const { detail } = e;
            if (detail && detail.percentage !== undefined) {
                this.announce(`${detail.percentage}% complete`, {
                    priority: 'polite',
                    category: 'progress',
                    unique: false // Allow progress updates
                });
            }
        });

        document.addEventListener('loading:complete', (e) => {
            this.announce('Processing complete', {
                priority: 'status',
                category: 'progress'
            });
        });

        document.addEventListener('loading:error', (e) => {
            const { detail } = e;
            this.announce(`Error: ${detail?.message || 'An error occurred'}`, {
                priority: 'assertive',
                category: 'form'
            });
        });
    }

    /**
     * Setup announcements for dynamic content changes
     */
    setupDynamicContentAnnouncements() {
        // Monitor for new content being added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.handleNewContent(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Handle announcements for new content
     */
    handleNewContent(element) {
        // Announce new results or content sections
        if (element.matches('.results-section, .color-recommendations')) {
            this.announce('New color recommendations available', {
                priority: 'polite',
                delay: 500
            });
        }

        // Announce new modal or dialog content
        if (element.matches('.modal, .dialog, .panel') &&
            element.getAttribute('aria-hidden') !== 'true') {
            const title = element.querySelector('h1, h2, h3, .modal-title, .panel-title')?.textContent;
            if (title) {
                this.announce(`${title} opened`, {
                    priority: 'polite'
                });
            }
        }

        // Announce new error messages
        if (element.matches('.error, .alert-error, [role="alert"]')) {
            const errorText = element.textContent.trim();
            if (errorText) {
                this.announce(errorText, {
                    priority: 'assertive'
                });
            }
        }
    }

    /**
     * Provide contextual help announcements
     */
    announceContextualHelp(element) {
        const helpText = this.getContextualHelpText(element);
        if (helpText) {
            this.announce(helpText, {
                priority: 'polite',
                delay: 1000 // Delay to avoid interference with other announcements
            });
        }
    }

    /**
     * Get contextual help text for elements
     */
    getContextualHelpText(element) {
        const describedBy = element.getAttribute('aria-describedby');
        if (describedBy) {
            const helpElement = document.getElementById(describedBy);
            if (helpElement) {
                return helpElement.textContent.trim();
            }
        }

        const title = element.getAttribute('title');
        if (title) {
            return title;
        }

        // Element-specific help text
        if (element.matches('.color-input')) {
            return 'Use this color picker to select colors for your room design. Press Enter or Space to open the color picker.';
        }

        if (element.matches('.color-preview')) {
            return 'This shows a preview of the selected color. Press Enter to open the color picker.';
        }

        return null;
    }

    /**
     * Announce keyboard shortcuts when appropriate
     */
    announceKeyboardShortcuts(context = 'general') {
        const shortcuts = this.getKeyboardShortcuts(context);
        if (shortcuts.length > 0) {
            const shortcutText = shortcuts.map(s => `${s.keys}: ${s.description}`).join('. ');
            this.announce(`Available shortcuts: ${shortcutText}`, {
                priority: 'polite',
                delay: 2000
            });
        }
    }

    /**
     * Get context-specific keyboard shortcuts
     */
    getKeyboardShortcuts(context) {
        const allShortcuts = {
            general: [
                { keys: 'Alt+M', description: 'Skip to main content' },
                { keys: 'Alt+H', description: 'Open help' },
                { keys: 'Alt+A', description: 'Open accessibility panel' }
            ],
            form: [
                { keys: 'Alt+Enter', description: 'Analyze colors' },
                { keys: 'Alt+R', description: 'Reset colors' },
                { keys: 'Alt+1-4', description: 'Focus color picker' }
            ],
            grid: [
                { keys: 'Arrow keys', description: 'Navigate grid' },
                { keys: 'Home/End', description: 'Go to first/last in row' },
                { keys: 'Enter/Space', description: 'Activate element' }
            ]
        };

        return allShortcuts[context] || [];
    }

    /**
     * Utility: Convert RGB to hex (simplified)
     */
    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '#000000';

        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return '#000000';

        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');

        return `#${r}${g}${b}`;
    }

    /**
     * Manual announcement method for external use
     */
    announceMessage(message, priority = 'polite') {
        this.announce(message, { priority });
    }

    /**
     * Announce loading state changes
     */
    announceLoading(state, context = '') {
        const messages = {
            start: `Loading ${context}...`,
            progress: `Loading in progress ${context}`,
            complete: `Loading complete ${context}`,
            error: `Loading failed ${context}`
        };

        this.announce(messages[state] || messages.start, {
            priority: state === 'error' ? 'assertive' : 'status',
            category: 'progress'
        });
    }

    /**
     * Cleanup method
     */
    destroy() {
        // Remove live regions
        Object.values(this.liveRegions).forEach(region => {
            if (region && region.parentNode) {
                region.parentNode.removeChild(region);
            }
        });
        this.liveRegions = {};
    }
}

// Export for global use
window.ScreenReaderEnhanced = ScreenReaderEnhanced;