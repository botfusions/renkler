/**
 * MobileAccessibilityEnhancer.js - Mobile Accessibility Improvements
 * Enhances accessibility specifically for mobile devices and touch interfaces
 */

class MobileAccessibilityEnhancer {
    constructor() {
        this.isActive = false;
        this.currentFocusElement = null;
        this.touchStartTime = 0;
        this.gestureRecognition = new Map();

        this.config = {
            minTouchTargetSize: 44, // WCAG AA minimum
            comfortableTouchTargetSize: 48,
            largeeTouchTargetSize: 56,
            gestureTimeout: 300,
            voiceOverSupport: true,
            talkBackSupport: true
        };

        this.screenReaderInfo = this.detectScreenReader();
        this.motionPreferences = this.detectMotionPreferences();

        console.log('MobileAccessibilityEnhancer initialized');
        this.init();
    }

    /**
     * Initialize mobile accessibility enhancements
     */
    init() {
        this.enhanceTouchTargets();
        this.setupGestureAccessibility();
        this.setupScreenReaderOptimizations();
        this.enhanceFocusManagement();
        this.setupVoiceControl();
        this.setupHighContrastMode();
        this.enhanceColorAccessibility();
        this.setupMotionControls();
        this.addMobileARIA();
        this.isActive = true;
    }

    /**
     * Enhance touch targets for accessibility
     */
    enhanceTouchTargets() {
        const interactiveElements = document.querySelectorAll([
            'button',
            'input',
            'select',
            'textarea',
            'a[href]',
            '[tabindex]',
            '[role="button"]',
            '[role="link"]',
            '.color-input',
            '.color-preview',
            '.swatch-color'
        ].join(','));

        interactiveElements.forEach(element => {
            this.enhanceElementTouchTarget(element);
        });

        // Setup mutation observer for dynamic content
        this.setupTouchTargetObserver();
    }

    /**
     * Enhance individual element touch target
     */
    enhanceElementTouchTarget(element) {
        const computedStyle = window.getComputedStyle(element);
        const currentHeight = parseInt(computedStyle.height) || 0;
        const currentWidth = parseInt(computedStyle.width) || 0;

        // Ensure minimum touch target size
        if (currentHeight < this.config.minTouchTargetSize ||
            currentWidth < this.config.minTouchTargetSize) {

            this.expandTouchTarget(element);
        }

        // Add touch target indicator for screen readers
        this.addTouchTargetAria(element);

        // Add visual touch feedback
        this.addTouchFeedback(element);
    }

    /**
     * Expand touch target using padding or wrapper
     */
    expandTouchTarget(element) {
        const rect = element.getBoundingClientRect();
        const needsHeight = this.config.minTouchTargetSize - rect.height;
        const needsWidth = this.config.minTouchTargetSize - rect.width;

        if (needsHeight > 0 || needsWidth > 0) {
            // Use padding if element can accommodate it
            if (this.canUsePadding(element)) {
                const paddingY = Math.max(0, needsHeight / 2);
                const paddingX = Math.max(0, needsWidth / 2);

                element.style.paddingTop = `${paddingY}px`;
                element.style.paddingBottom = `${paddingY}px`;
                element.style.paddingLeft = `${paddingX}px`;
                element.style.paddingRight = `${paddingX}px`;
            } else {
                // Create touch target wrapper
                this.createTouchTargetWrapper(element, needsWidth, needsHeight);
            }
        }

        element.classList.add('touch-target-enhanced');
    }

    /**
     * Setup gesture accessibility
     */
    setupGestureAccessibility() {
        // Add gesture descriptions for screen readers
        this.addGestureDescriptions();

        // Setup alternative gesture methods
        this.setupAlternativeGestures();

        // Add gesture help
        this.createGestureHelp();

        // Setup gesture timeout for users with motor impairments
        this.setupGestureTimeout();
    }

    /**
     * Add gesture descriptions for screen readers
     */
    addGestureDescriptions() {
        const gestureElements = document.querySelectorAll([
            '.color-palette',
            '.room-preview',
            '.modal',
            '.swipe-container'
        ].join(','));

        gestureElements.forEach(element => {
            const gestures = this.getElementGestures(element);
            if (gestures.length > 0) {
                const description = `Available gestures: ${gestures.join(', ')}`;

                // Add to aria-describedby
                this.addAriaDescription(element, description);

                // Add gesture help button
                this.addGestureHelpButton(element, gestures);
            }
        });
    }

    /**
     * Setup screen reader optimizations
     */
    setupScreenReaderOptimizations() {
        // Optimize for VoiceOver (iOS)
        if (this.screenReaderInfo.isVoiceOver) {
            this.optimizeForVoiceOver();
        }

        // Optimize for TalkBack (Android)
        if (this.screenReaderInfo.isTalkBack) {
            this.optimizeForTalkBack();
        }

        // Setup live regions for dynamic content
        this.setupLiveRegions();

        // Enhance color announcements
        this.enhanceColorAnnouncements();

        // Setup rotor navigation
        this.setupRotorNavigation();
    }

    /**
     * Enhance focus management for mobile
     */
    enhanceFocusManagement() {
        // Custom focus ring for touch devices
        this.setupMobileFocusRing();

        // Focus trap for modals
        this.setupMobileFocusTrap();

        // Skip links optimization
        this.enhanceSkipLinks();

        // Focus restoration
        this.setupFocusRestoration();

        // Virtual cursor support
        this.setupVirtualCursorSupport();
    }

    /**
     * Setup voice control features
     */
    setupVoiceControl() {
        if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
            this.setupSpeechRecognition();
        }

        // Voice labels for elements
        this.addVoiceLabels();

        // Voice commands help
        this.createVoiceCommandsHelp();
    }

    /**
     * Setup high contrast mode for mobile
     */
    setupHighContrastMode() {
        // Detect system high contrast preference
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

        if (highContrastQuery.matches) {
            this.enableHighContrastMode();
        }

        highContrastQuery.addEventListener('change', (e) => {
            if (e.matches) {
                this.enableHighContrastMode();
            } else {
                this.disableHighContrastMode();
            }
        });

        // Manual high contrast toggle
        this.addHighContrastToggle();
    }

    /**
     * Enhance color accessibility for mobile
     */
    enhanceColorAccessibility() {
        // Add color names to color elements
        this.addColorNames();

        // Setup color pattern indicators
        this.setupColorPatterns();

        // Add color contrast information
        this.addContrastInformation();

        // Setup color blind simulation
        this.enhanceColorBlindSimulation();
    }

    /**
     * Setup motion controls and preferences
     */
    setupMotionControls() {
        // Respect reduced motion preference
        if (this.motionPreferences.reducedMotion) {
            this.enableReducedMotion();
        }

        // Setup motion sensitivity controls
        this.addMotionSensitivityControls();

        // Alternative to motion-based interactions
        this.addMotionAlternatives();
    }

    /**
     * Add mobile-specific ARIA enhancements
     */
    addMobileARIA() {
        // Touch-specific roles and properties
        this.addTouchARIA();

        // Mobile navigation ARIA
        this.enhanceMobileNavigationARIA();

        // Gesture-specific ARIA
        this.addGestureARIA();

        // Mobile form ARIA
        this.enhanceMobileFormARIA();
    }

    /**
     * Utility functions for screen reader detection
     */
    detectScreenReader() {
        const userAgent = navigator.userAgent.toLowerCase();

        return {
            isVoiceOver: /iphone|ipad|ipod/.test(userAgent) && 'speechSynthesis' in window,
            isTalkBack: /android/.test(userAgent) && 'speechSynthesis' in window,
            isScreenReader: 'speechSynthesis' in window
        };
    }

    /**
     * Detect motion preferences
     */
    detectMotionPreferences() {
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        return {
            reducedMotion: reducedMotionQuery.matches
        };
    }

    /**
     * Implementation of enhancement methods
     */
    canUsePadding(element) {
        const style = window.getComputedStyle(element);
        return style.boxSizing === 'border-box' ||
               element.tagName.toLowerCase() === 'button';
    }

    createTouchTargetWrapper(element, needsWidth, needsHeight) {
        const wrapper = document.createElement('div');
        wrapper.className = 'touch-target-wrapper';
        wrapper.style.cssText = `
            position: relative;
            display: inline-block;
            padding: ${Math.max(0, needsHeight / 2)}px ${Math.max(0, needsWidth / 2)}px;
        `;

        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    }

    addTouchTargetAria(element) {
        // Add touch target size information for screen readers
        const rect = element.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);

        if (size >= this.config.comfortableTouchTargetSize) {
            element.setAttribute('aria-label',
                (element.getAttribute('aria-label') || element.textContent || 'Interactive element') +
                ' (comfortable touch target)');
        }
    }

    addTouchFeedback(element) {
        element.addEventListener('touchstart', () => {
            element.classList.add('touch-active');
        }, { passive: true });

        element.addEventListener('touchend', () => {
            element.classList.remove('touch-active');
        }, { passive: true });

        element.addEventListener('touchcancel', () => {
            element.classList.remove('touch-active');
        }, { passive: true });
    }

    setupTouchTargetObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const interactiveElements = node.querySelectorAll([
                            'button', 'input', 'select', 'a[href]', '[tabindex]'
                        ].join(','));

                        interactiveElements.forEach(element => {
                            this.enhanceElementTouchTarget(element);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    getElementGestures(element) {
        const gestures = [];

        if (element.classList.contains('color-palette')) {
            gestures.push('swipe left or right to navigate colors');
            gestures.push('pinch to zoom');
        }

        if (element.classList.contains('modal')) {
            gestures.push('swipe down to close');
        }

        if (element.classList.contains('room-preview')) {
            gestures.push('pinch to zoom');
            gestures.push('double tap to reset zoom');
        }

        return gestures;
    }

    addAriaDescription(element, description) {
        let describedBy = element.getAttribute('aria-describedby') || '';
        const descId = 'gesture-desc-' + Math.random().toString(36).substr(2, 9);

        // Create description element
        const descElement = document.createElement('div');
        descElement.id = descId;
        descElement.className = 'sr-only';
        descElement.textContent = description;
        document.body.appendChild(descElement);

        // Update aria-describedby
        describedBy = describedBy ? `${describedBy} ${descId}` : descId;
        element.setAttribute('aria-describedby', describedBy);
    }

    addGestureHelpButton(element, gestures) {
        const helpButton = document.createElement('button');
        helpButton.className = 'gesture-help-btn sr-only';
        helpButton.textContent = 'Gesture help';
        helpButton.type = 'button';

        helpButton.addEventListener('click', () => {
            this.announceGestures(gestures);
        });

        element.appendChild(helpButton);
    }

    announceGestures(gestures) {
        const announcement = `Available gestures: ${gestures.join(', ')}`;
        this.announceToScreenReader(announcement);
    }

    setupAlternativeGestures() {
        // Add keyboard alternatives to gestures
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.color-palette')) {
                this.handlePaletteKeyboard(e);
            }

            if (e.target.closest('.modal')) {
                this.handleModalKeyboard(e);
            }
        });
    }

    handlePaletteKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.navigatePalette('previous');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigatePalette('next');
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.zoomPalette('in');
                break;
            case '-':
                e.preventDefault();
                this.zoomPalette('out');
                break;
        }
    }

    handleModalKeyboard(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.closeModal(e.target.closest('.modal'));
        }
    }

    optimizeForVoiceOver() {
        // iOS VoiceOver optimizations
        document.documentElement.setAttribute('lang', 'en');

        // Improve rotor navigation
        this.addLandmarks();

        // Optimize for swipe navigation
        this.optimizeSwipeNavigation();
    }

    optimizeForTalkBack() {
        // Android TalkBack optimizations
        this.addContentDescriptions();

        // Optimize for explore by touch
        this.optimizeExploreByTouch();
    }

    setupLiveRegions() {
        // Create live regions for announcements
        const politeRegion = document.createElement('div');
        politeRegion.id = 'polite-announcements';
        politeRegion.className = 'sr-only';
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(politeRegion);

        const assertiveRegion = document.createElement('div');
        assertiveRegion.id = 'assertive-announcements';
        assertiveRegion.className = 'sr-only';
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(assertiveRegion);
    }

    enhanceColorAnnouncements() {
        const colorElements = document.querySelectorAll('.color-input, .color-preview, .swatch-color');

        colorElements.forEach(element => {
            element.addEventListener('focus', () => {
                const colorValue = this.getElementColor(element);
                const colorName = this.getColorName(colorValue);
                const announcement = `Color: ${colorName} (${colorValue})`;
                this.announceToScreenReader(announcement);
            });
        });
    }

    setupMobileFocusRing() {
        // Enhanced focus ring for mobile devices
        const style = document.createElement('style');
        style.textContent = `
            .mobile-focus-ring {
                outline: 3px solid #0066cc;
                outline-offset: 2px;
                box-shadow: 0 0 0 2px #ffffff, 0 0 0 5px #0066cc;
            }

            @media (max-width: 768px) {
                *:focus {
                    outline: 3px solid #0066cc;
                    outline-offset: 2px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addColorNames() {
        const colorElements = document.querySelectorAll('.color-input, .color-preview, .swatch-color');

        colorElements.forEach(element => {
            const colorValue = this.getElementColor(element);
            const colorName = this.getColorName(colorValue);

            // Add color name as data attribute
            element.setAttribute('data-color-name', colorName);

            // Update aria-label
            const currentLabel = element.getAttribute('aria-label') || '';
            element.setAttribute('aria-label', `${currentLabel} ${colorName}`.trim());
        });
    }

    setupColorPatterns() {
        const colorElements = document.querySelectorAll('.color-preview, .swatch-color');

        colorElements.forEach((element, index) => {
            // Add pattern overlay for color differentiation
            const pattern = this.getPatternForIndex(index);
            element.style.backgroundImage = pattern;
            element.setAttribute('data-pattern', pattern);
        });
    }

    enableHighContrastMode() {
        document.documentElement.classList.add('high-contrast-mode');
        this.announceToScreenReader('High contrast mode enabled');
    }

    disableHighContrastMode() {
        document.documentElement.classList.remove('high-contrast-mode');
        this.announceToScreenReader('High contrast mode disabled');
    }

    addHighContrastToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'high-contrast-toggle';
        toggle.className = 'accessibility-toggle';
        toggle.textContent = 'Toggle High Contrast';
        toggle.setAttribute('aria-pressed', 'false');

        toggle.addEventListener('click', () => {
            const isEnabled = document.documentElement.classList.contains('high-contrast-mode');

            if (isEnabled) {
                this.disableHighContrastMode();
                toggle.setAttribute('aria-pressed', 'false');
            } else {
                this.enableHighContrastMode();
                toggle.setAttribute('aria-pressed', 'true');
            }
        });

        // Add to accessibility panel
        const accessibilityPanel = document.querySelector('.accessibility-panel .panel-body');
        if (accessibilityPanel) {
            accessibilityPanel.appendChild(toggle);
        }
    }

    announceToScreenReader(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'assertive-announcements' : 'polite-announcements';
        const region = document.getElementById(regionId);

        if (region) {
            region.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }

    // Utility functions
    getElementColor(element) {
        if (element.value) return element.value;
        if (element.style.backgroundColor) return element.style.backgroundColor;
        return window.getComputedStyle(element).backgroundColor;
    }

    getColorName(colorValue) {
        // Simple color name mapping - could be enhanced with a full color library
        const colorNames = {
            '#FF0000': 'Red',
            '#00FF00': 'Green',
            '#0000FF': 'Blue',
            '#FFFF00': 'Yellow',
            '#FF00FF': 'Magenta',
            '#00FFFF': 'Cyan',
            '#FFFFFF': 'White',
            '#000000': 'Black',
            '#808080': 'Gray'
        };

        return colorNames[colorValue.toUpperCase()] || colorValue;
    }

    getPatternForIndex(index) {
        const patterns = [
            'none',
            'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            'radial-gradient(circle, transparent 1px, rgba(255,255,255,0.1) 1px)'
        ];

        return patterns[index % patterns.length];
    }

    // Stub implementations for demonstration
    navigatePalette(direction) {
        console.log('Navigate palette:', direction);
    }

    zoomPalette(direction) {
        console.log('Zoom palette:', direction);
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    addLandmarks() {
        // Add ARIA landmarks for better navigation
        const main = document.querySelector('main');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
        }
    }

    optimizeSwipeNavigation() {
        // Optimize for VoiceOver swipe navigation
        const swipeableElements = document.querySelectorAll('.color-palette, .results-section');

        swipeableElements.forEach(element => {
            element.setAttribute('role', 'region');
            element.setAttribute('aria-label', 'Swipeable content area');
        });
    }

    addContentDescriptions() {
        // Add content descriptions for TalkBack
        const interactiveElements = document.querySelectorAll('button, [role="button"]');

        interactiveElements.forEach(element => {
            if (!element.hasAttribute('aria-label') && !element.textContent.trim()) {
                element.setAttribute('aria-label', 'Interactive element');
            }
        });
    }

    optimizeExploreByTouch() {
        // Optimize for TalkBack explore by touch
        const touchElements = document.querySelectorAll('.color-input, .color-preview');

        touchElements.forEach(element => {
            element.setAttribute('role', 'button');
            element.setAttribute('tabindex', '0');
        });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileAccessibilityEnhancer = new MobileAccessibilityEnhancer();
    });
} else {
    window.mobileAccessibilityEnhancer = new MobileAccessibilityEnhancer();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileAccessibilityEnhancer;
}