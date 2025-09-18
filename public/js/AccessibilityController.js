/**
 * AccessibilityController.js - Main Accessibility Feature Controller
 * Coordinates all accessibility features and user preferences
 * Integrates with AccessibilityUtils for WCAG 2.1 AA/AAA compliance
 */

class AccessibilityController {
    constructor() {
        this.utils = null; // Will be initialized when AccessibilityUtils is available
        this.preferences = this.loadPreferences();
        this.currentColorBlindnessSimulation = 'normal';

        // DOM references
        this.elements = {};

        // State management
        this.state = {
            panelOpen: false,
            highContrast: false,
            largeText: false,
            showPatterns: false,
            reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            colorBlindnessMode: 'normal'
        };

        this.initialize();
    }

    /**
     * Initialize the accessibility controller
     */
    async initialize() {
        // Wait for AccessibilityUtils to be available
        await this.waitForUtils();

        // Initialize utilities
        this.utils = new AccessibilityUtils();

        // Get DOM references
        this.setupDOMReferences();

        // Apply saved preferences
        this.applyPreferences();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize keyboard navigation
        this.setupKeyboardNavigation();

        // Setup color picker accessibility
        this.enhanceColorPickers();

        // Setup accessibility monitoring
        this.startAccessibilityMonitoring();

        console.log('AccessibilityController initialized');
    }

    /**
     * Wait for AccessibilityUtils to be available
     */
    waitForUtils() {
        return new Promise((resolve) => {
            if (window.AccessibilityUtils) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.AccessibilityUtils) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);
            }
        });
    }

    /**
     * Setup DOM element references
     */
    setupDOMReferences() {
        this.elements = {
            // Panel controls
            accessibilityBtn: document.getElementById('accessibility-btn'),
            accessibilityPanel: document.getElementById('accessibility-panel'),
            accessibilityClose: document.getElementById('accessibility-close'),
            panelBackdrop: document.querySelector('.panel-backdrop'),

            // Preference controls
            highContrastToggle: document.getElementById('high-contrast-toggle'),
            largeTextToggle: document.getElementById('large-text-toggle'),
            colorPatternsToggle: document.getElementById('color-patterns-toggle'),
            reduceMotionToggle: document.getElementById('reduce-motion-toggle'),

            // Color blindness simulation
            colorblindRadios: document.querySelectorAll('input[name="colorblind-simulation"]'),

            // Action buttons
            resetBtn: document.getElementById('reset-accessibility'),
            saveBtn: document.getElementById('save-accessibility'),

            // Color elements
            colorInputs: document.querySelectorAll('.color-input'),
            colorPreviews: document.querySelectorAll('.color-preview'),
            hexInputs: document.querySelectorAll('.hex-input'),

            // Form elements
            colorForm: document.getElementById('color-form'),
            colorGrid: document.querySelector('.color-pickers-grid'),

            // Announcer elements
            announcer: document.getElementById('sr-announcer'),
            urgentAnnouncer: document.getElementById('sr-announcer-urgent')
        };
    }

    /**
     * Setup event listeners for accessibility controls
     */
    setupEventListeners() {
        // Panel toggle
        this.elements.accessibilityBtn?.addEventListener('click', () => this.togglePanel());
        this.elements.accessibilityClose?.addEventListener('click', () => this.closePanel());
        this.elements.panelBackdrop?.addEventListener('click', () => this.closePanel());

        // Visual preference toggles
        this.elements.highContrastToggle?.addEventListener('change', (e) => {
            this.toggleHighContrast(e.target.checked);
        });

        this.elements.largeTextToggle?.addEventListener('change', (e) => {
            this.toggleLargeText(e.target.checked);
        });

        this.elements.colorPatternsToggle?.addEventListener('change', (e) => {
            this.toggleColorPatterns(e.target.checked);
        });

        this.elements.reduceMotionToggle?.addEventListener('change', (e) => {
            this.toggleReduceMotion(e.target.checked);
        });

        // Color blindness simulation
        this.elements.colorblindRadios?.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setColorBlindnessSimulation(e.target.value);
                }
            });
        });

        // Action buttons
        this.elements.resetBtn?.addEventListener('click', () => this.resetToDefaults());
        this.elements.saveBtn?.addEventListener('click', () => this.savePreferences());

        // Color input enhancements
        this.elements.colorInputs?.forEach(input => {
            input.addEventListener('change', (e) => this.handleColorChange(e));
        });

        this.elements.hexInputs?.forEach(input => {
            input.addEventListener('input', (e) => this.handleHexInput(e));
            input.addEventListener('blur', (e) => this.validateHexInput(e));
        });

        // Escape key to close panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.panelOpen) {
                this.closePanel();
            }
        });

        // Monitor system preferences
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.elements.reduceMotionToggle.checked = e.matches;
            this.toggleReduceMotion(e.matches);
        });

        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            this.elements.highContrastToggle.checked = e.matches;
            this.toggleHighContrast(e.matches);
        });
    }

    /**
     * Setup enhanced keyboard navigation
     */
    setupKeyboardNavigation() {
        // Color grid navigation
        if (this.elements.colorGrid && this.utils.keyboardNavigation) {
            this.utils.keyboardNavigation.setupColorGridNavigation(this.elements.colorGrid);
        }

        // Enhanced focus management for color previews
        this.elements.colorPreviews?.forEach((preview, index) => {
            preview.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        // Trigger color picker
                        const colorInput = preview.parentElement.querySelector('.color-input');
                        if (colorInput) colorInput.click();
                        break;
                    case 'c':
                        // Copy color value
                        const hexInput = preview.parentElement.querySelector('.hex-input');
                        if (hexInput) {
                            navigator.clipboard.writeText(hexInput.value);
                            this.announceToScreenReader(`Copied ${hexInput.value} to clipboard`);
                        }
                        break;
                }
            });
        });
    }

    /**
     * Enhance color picker accessibility
     */
    enhanceColorPickers() {
        this.elements.colorInputs?.forEach((input, index) => {
            // Add proper labeling and descriptions
            this.updateColorAccessibility(input);

            // Add change announcements
            input.addEventListener('change', () => {
                setTimeout(() => this.updateColorAccessibility(input), 100);
            });
        });

        // Sync hex inputs with color inputs
        this.elements.hexInputs?.forEach((hexInput, index) => {
            const colorInput = hexInput.parentElement.querySelector('.color-input');
            const preview = hexInput.parentElement.querySelector('.color-preview');

            if (colorInput && preview) {
                hexInput.addEventListener('input', () => {
                    if (this.isValidHex(hexInput.value)) {
                        colorInput.value = hexInput.value;
                        preview.style.backgroundColor = hexInput.value;
                        this.updateColorAccessibility(colorInput);
                    }
                });
            }
        });
    }

    /**
     * Update color accessibility information
     */
    updateColorAccessibility(colorInput) {
        const color = colorInput.value;
        const wrapper = colorInput.parentElement;
        const preview = wrapper.querySelector('.color-preview');
        const nameElement = wrapper.querySelector('[id$="-color-name"]');
        const contrastElement = wrapper.querySelector('[id$="-contrast-info"]');

        if (!this.utils) return;

        // Update color name for screen readers
        const colorName = this.utils.getAccessibleColorName(color);
        if (nameElement) {
            nameElement.textContent = colorName;
        }

        // Update preview aria-label
        if (preview) {
            const detailedDescription = this.utils.getDetailedColorDescription(color,
                colorInput.name.charAt(0).toUpperCase() + colorInput.name.slice(1));
            preview.setAttribute('aria-label', `${detailedDescription} color preview`);
        }

        // Update contrast information (will be populated after analysis)
        if (contrastElement) {
            contrastElement.textContent = 'Color selected. Contrast information will be available after analysis.';
        }

        // Apply color blindness simulation if active
        if (this.currentColorBlindnessSimulation !== 'normal' && this.utils.colorBlindnessSimulator) {
            const simulatedColor = this.utils.colorBlindnessSimulator.simulateColorBlindness(
                color, this.currentColorBlindnessSimulation
            );

            if (preview) {
                // Store original color for restoration
                preview.dataset.originalColor = color;
                preview.style.backgroundColor = simulatedColor;
            }
        }
    }

    /**
     * Handle color input changes
     */
    handleColorChange(event) {
        const input = event.target;
        const hexInput = input.parentElement.querySelector('.hex-input');
        const preview = input.parentElement.querySelector('.color-preview');

        if (hexInput) {
            hexInput.value = input.value;
        }

        if (preview) {
            preview.style.backgroundColor = input.value;
        }

        this.updateColorAccessibility(input);

        // Announce color change
        const colorName = this.utils.getAccessibleColorName(input.value);
        this.announceToScreenReader(`${input.name} color changed to ${colorName}`);
    }

    /**
     * Handle hex input changes
     */
    handleHexInput(event) {
        const hexInput = event.target;
        const value = hexInput.value;

        if (this.isValidHex(value)) {
            hexInput.classList.remove('form-error');
            hexInput.classList.add('form-success');
        } else {
            hexInput.classList.add('form-error');
            hexInput.classList.remove('form-success');
        }
    }

    /**
     * Validate hex input on blur
     */
    validateHexInput(event) {
        const hexInput = event.target;
        const value = hexInput.value;

        if (!this.isValidHex(value) && value !== '') {
            this.announceToScreenReader('Invalid hex color format. Please use format like #FF0000', 'assertive');
            hexInput.focus();
        }
    }

    /**
     * Check if a string is a valid hex color
     */
    isValidHex(hex) {
        return /^#[0-9A-Fa-f]{6}$/.test(hex);
    }

    /**
     * Toggle accessibility panel
     */
    togglePanel() {
        if (this.state.panelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    /**
     * Open accessibility panel
     */
    openPanel() {
        this.state.panelOpen = true;
        this.elements.accessibilityPanel?.setAttribute('aria-hidden', 'false');
        this.elements.accessibilityPanel?.classList.add('panel-open');
        this.elements.accessibilityBtn?.setAttribute('aria-expanded', 'true');

        // Focus management
        if (this.utils.focusManager) {
            this.utils.focusManager.storeFocus();
            this.utils.focusManager.trapFocus(this.elements.accessibilityPanel);
        }

        this.announceToScreenReader('Accessibility panel opened');
    }

    /**
     * Close accessibility panel
     */
    closePanel() {
        this.state.panelOpen = false;
        this.elements.accessibilityPanel?.setAttribute('aria-hidden', 'true');
        this.elements.accessibilityPanel?.classList.remove('panel-open');
        this.elements.accessibilityBtn?.setAttribute('aria-expanded', 'false');

        // Restore focus
        if (this.utils.focusManager) {
            this.utils.focusManager.releaseFocus(this.elements.accessibilityPanel);
            this.utils.focusManager.restoreFocus();
        }

        this.announceToScreenReader('Accessibility panel closed');
    }

    /**
     * Toggle high contrast mode
     */
    toggleHighContrast(enabled) {
        this.state.highContrast = enabled;
        document.documentElement.setAttribute('data-high-contrast', enabled);

        if (this.utils) {
            this.utils.setupHighContrastSupport(enabled);
        }

        this.announceToScreenReader(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle large text mode
     */
    toggleLargeText(enabled) {
        this.state.largeText = enabled;
        document.documentElement.classList.toggle('large-text', enabled);

        this.announceToScreenReader(`Large text mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle color patterns
     */
    toggleColorPatterns(enabled) {
        this.state.showPatterns = enabled;
        document.documentElement.setAttribute('data-show-patterns', enabled);

        this.announceToScreenReader(`Color patterns ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle reduced motion
     */
    toggleReduceMotion(enabled) {
        this.state.reduceMotion = enabled;

        if (this.utils) {
            this.utils.setupReducedMotionSupport(enabled);
        }

        this.announceToScreenReader(`Reduced motion ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set color blindness simulation mode
     */
    setColorBlindnessSimulation(mode) {
        this.currentColorBlindnessSimulation = mode;
        this.state.colorBlindnessMode = mode;

        // Apply simulation to all color previews
        this.elements.colorPreviews?.forEach(preview => {
            const originalColor = preview.dataset.originalColor ||
                preview.parentElement.querySelector('.color-input')?.value;

            if (originalColor && this.utils.colorBlindnessSimulator) {
                const simulatedColor = mode === 'normal'
                    ? originalColor
                    : this.utils.colorBlindnessSimulator.simulateColorBlindness(originalColor, mode);

                preview.style.backgroundColor = simulatedColor;
                preview.dataset.originalColor = originalColor;
            }
        });

        const simulationName = this.utils.colorBlindnessSimulator.simulationTypes[mode]?.name || mode;
        this.announceToScreenReader(`Color vision simulation set to ${simulationName}`);
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message, priority = 'polite') {
        if (this.utils) {
            this.utils.announceToScreenReader(message, priority);
        } else {
            // Fallback if utils not available
            const announcer = priority === 'assertive'
                ? this.elements.urgentAnnouncer
                : this.elements.announcer;

            if (announcer) {
                announcer.textContent = message;
                setTimeout(() => announcer.textContent = '', 1000);
            }
        }
    }

    /**
     * Start accessibility monitoring
     */
    startAccessibilityMonitoring() {
        // Monitor for accessibility issues
        this.monitorInterval = setInterval(() => {
            this.checkAccessibilityIssues();
        }, 5000);

        // Monitor color changes for contrast validation
        document.addEventListener('colorChanged', (event) => {
            this.validateColorContrast(event.detail);
        });
    }

    /**
     * Check for common accessibility issues
     */
    checkAccessibilityIssues() {
        if (!this.utils) return;

        // Check touch target sizes
        const interactiveElements = document.querySelectorAll('button, input, select, .color-input, .color-preview');
        interactiveElements.forEach(element => {
            const validation = this.utils.validateTouchTargetSize(element);
            if (!validation.passes) {
                element.dataset.smallTarget = 'true';
            } else {
                delete element.dataset.smallTarget;
            }
        });

        // Check for missing alt text on images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt && !img.getAttribute('aria-label')) {
                console.warn('Image missing alt text:', img);
            }
        });
    }

    /**
     * Validate color contrast
     */
    validateColorContrast(colors) {
        if (!this.utils || !colors.foreground || !colors.background) return;

        const ratio = this.utils.calculateContrastRatio(colors.foreground, colors.background);
        const compliance = this.utils.getContrastComplianceLevel(ratio);

        // Update UI with contrast information
        const contrastElement = document.querySelector(`[id="${colors.elementId}-contrast-info"]`);
        if (contrastElement) {
            contrastElement.textContent = `Contrast ratio: ${ratio.toFixed(1)}:1 (${compliance.level})`;
        }

        return compliance;
    }

    /**
     * Reset all accessibility preferences to defaults
     */
    resetToDefaults() {
        this.state = {
            panelOpen: false,
            highContrast: false,
            largeText: false,
            showPatterns: false,
            reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            colorBlindnessMode: 'normal'
        };

        this.applyPreferences();
        this.announceToScreenReader('Accessibility preferences reset to defaults');
    }

    /**
     * Apply current preferences to UI
     */
    applyPreferences() {
        // Update toggle states
        if (this.elements.highContrastToggle) {
            this.elements.highContrastToggle.checked = this.state.highContrast;
        }
        if (this.elements.largeTextToggle) {
            this.elements.largeTextToggle.checked = this.state.largeText;
        }
        if (this.elements.colorPatternsToggle) {
            this.elements.colorPatternsToggle.checked = this.state.showPatterns;
        }
        if (this.elements.reduceMotionToggle) {
            this.elements.reduceMotionToggle.checked = this.state.reduceMotion;
        }

        // Update color blindness simulation
        const targetRadio = document.querySelector(`input[name="colorblind-simulation"][value="${this.state.colorBlindnessMode}"]`);
        if (targetRadio) {
            targetRadio.checked = true;
        }

        // Apply settings
        this.toggleHighContrast(this.state.highContrast);
        this.toggleLargeText(this.state.largeText);
        this.toggleColorPatterns(this.state.showPatterns);
        this.toggleReduceMotion(this.state.reduceMotion);
        this.setColorBlindnessSimulation(this.state.colorBlindnessMode);
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        const preferences = {
            highContrast: this.state.highContrast,
            largeText: this.state.largeText,
            showPatterns: this.state.showPatterns,
            reduceMotion: this.state.reduceMotion,
            colorBlindnessMode: this.state.colorBlindnessMode
        };

        try {
            localStorage.setItem('sanzo-accessibility-preferences', JSON.stringify(preferences));
            this.announceToScreenReader('Accessibility preferences saved');
        } catch (error) {
            console.error('Failed to save preferences:', error);
            this.announceToScreenReader('Failed to save preferences', 'assertive');
        }
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('sanzo-accessibility-preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                return {
                    ...this.state,
                    ...preferences
                };
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }

        return {
            panelOpen: false,
            highContrast: false,
            largeText: false,
            showPatterns: false,
            reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            colorBlindnessMode: 'normal'
        };
    }

    /**
     * Get current accessibility status for testing
     */
    getAccessibilityStatus() {
        return {
            state: { ...this.state },
            preferences: this.preferences,
            utils: !!this.utils,
            wcagCompliance: this.checkWCAGCompliance()
        };
    }

    /**
     * Check overall WCAG compliance
     */
    checkWCAGCompliance() {
        const issues = [];

        // Check for missing alt text
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
            issues.push(`${imagesWithoutAlt.length} images missing alt text`);
        }

        // Check for insufficient touch targets
        const smallTargets = document.querySelectorAll('[data-small-target="true"]');
        if (smallTargets.length > 0) {
            issues.push(`${smallTargets.length} touch targets below 44px minimum`);
        }

        return {
            compliant: issues.length === 0,
            issues: issues,
            level: issues.length === 0 ? 'AA' : 'Partial'
        };
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.accessibilityController = new AccessibilityController();
    });
} else {
    window.accessibilityController = new AccessibilityController();
}

// Export for external use
window.AccessibilityController = AccessibilityController;