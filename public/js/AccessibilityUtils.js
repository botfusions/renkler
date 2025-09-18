/**
 * AccessibilityUtils.js - Comprehensive Accessibility Utilities
 * WCAG 2.1 AA/AAA compliance utilities for the Sanzo Color Advisor
 * Handles color contrast, keyboard navigation, screen readers, and motor accessibility
 */

class AccessibilityUtils {
    constructor() {
        this.colorNames = this.initializeColorNames();
        this.contrastCache = new Map();
        this.screenReaderAnnouncer = this.createScreenReaderAnnouncer();
        this.focusManager = new FocusManager();
        this.keyboardNavigation = new KeyboardNavigation();
        this.colorBlindnessSimulator = new ColorBlindnessSimulator();
        this.reduceMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.highContrastPreference = window.matchMedia('(prefers-contrast: high)');

        this.initialize();
    }

    /**
     * Initialize accessibility utilities
     */
    initialize() {
        this.setupReducedMotionSupport();
        this.setupHighContrastSupport();
        this.setupColorSchemeSupport();
        this.monitorAccessibilityPreferences();
        console.log('AccessibilityUtils initialized');
    }

    /**
     * Get WCAG-compliant color name for screen readers
     */
    getAccessibleColorName(hex) {
        const color = this.parseHexColor(hex);
        if (!color) return 'Unknown color';

        // Try exact match first
        const exactMatch = this.colorNames.exact[hex.toLowerCase()];
        if (exactMatch) return exactMatch;

        // Find closest named color
        const closestColor = this.findClosestNamedColor(color);
        return closestColor || this.generateDescriptiveColorName(color);
    }

    /**
     * Calculate WCAG contrast ratio between two colors
     */
    calculateContrastRatio(color1, color2) {
        const cacheKey = `${color1}-${color2}`;
        if (this.contrastCache.has(cacheKey)) {
            return this.contrastCache.get(cacheKey);
        }

        const rgb1 = this.parseHexColor(color1);
        const rgb2 = this.parseHexColor(color2);

        if (!rgb1 || !rgb2) return null;

        const luminance1 = this.calculateLuminance(rgb1);
        const luminance2 = this.calculateLuminance(rgb2);

        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);

        const ratio = (lighter + 0.05) / (darker + 0.05);

        this.contrastCache.set(cacheKey, ratio);
        return ratio;
    }

    /**
     * Enhanced contrast validation with specific recommendations
     */
    validateContrastForContext(foreground, background, context = 'normal') {
        const ratio = this.calculateContrastRatio(foreground, background);
        if (!ratio) return null;

        const isLargeText = context === 'large' || context === 'heading';
        const aaThreshold = isLargeText ? 3 : 4.5;
        const aaaThreshold = isLargeText ? 4.5 : 7;

        return {
            ratio: ratio,
            ratioFormatted: ratio.toFixed(2),
            aa: {
                passes: ratio >= aaThreshold,
                threshold: aaThreshold,
                level: 'AA'
            },
            aaa: {
                passes: ratio >= aaaThreshold,
                threshold: aaaThreshold,
                level: 'AAA'
            },
            recommendations: this.getContrastRecommendations(ratio, aaThreshold, aaaThreshold),
            context: context,
            isLargeText: isLargeText
        };
    }

    /**
     * Get specific recommendations for improving contrast
     */
    getContrastRecommendations(ratio, aaThreshold, aaaThreshold) {
        const recommendations = [];

        if (ratio < aaThreshold) {
            recommendations.push({
                level: 'critical',
                message: 'Does not meet WCAG AA standards. Immediate action required.',
                suggestion: 'Increase contrast between text and background colors.'
            });
        } else if (ratio < aaaThreshold) {
            recommendations.push({
                level: 'improvement',
                message: 'Meets WCAG AA but could be improved for AAA compliance.',
                suggestion: 'Consider darker text or lighter background for enhanced accessibility.'
            });
        } else {
            recommendations.push({
                level: 'excellent',
                message: 'Excellent contrast! Meets WCAG AAA standards.',
                suggestion: 'This color combination provides optimal accessibility.'
            });
        }

        return recommendations;
    }

    /**
     * Get WCAG compliance level for contrast ratio
     */
    getContrastComplianceLevel(ratio, isLargeText = false) {
        if (ratio >= (isLargeText ? 4.5 : 7)) {
            return { level: 'AAA', passes: true, grade: 'A+' };
        } else if (ratio >= (isLargeText ? 3 : 4.5)) {
            return { level: 'AA', passes: true, grade: 'A' };
        } else if (ratio >= 2.5) {
            return { level: 'Partial', passes: false, grade: 'C' };
        }
        return { level: 'Fail', passes: false, grade: 'F' };
    }

    /**
     * Generate comprehensive color accessibility report
     */
    generateColorAccessibilityReport(colors) {
        const report = {
            timestamp: new Date().toISOString(),
            colors: {},
            combinations: {},
            overallScore: 0,
            recommendations: [],
            wcagCompliance: {
                aa: true,
                aaa: true
            }
        };

        // Analyze individual colors
        Object.entries(colors).forEach(([name, hex]) => {
            report.colors[name] = {
                hex: hex,
                name: this.getAccessibleColorName(hex),
                description: this.getDetailedColorDescription(hex, name),
                colorBlindnessSimulations: this.colorBlindnessSimulator.getAllSimulations(hex)
            };
        });

        // Analyze color combinations
        const colorEntries = Object.entries(colors);
        for (let i = 0; i < colorEntries.length; i++) {
            for (let j = i + 1; j < colorEntries.length; j++) {
                const [name1, color1] = colorEntries[i];
                const [name2, color2] = colorEntries[j];
                const combinationKey = `${name1}-${name2}`;

                const validation = this.validateContrastForContext(color1, color2);
                if (validation) {
                    report.combinations[combinationKey] = validation;

                    if (!validation.aa.passes) {
                        report.wcagCompliance.aa = false;
                    }
                    if (!validation.aaa.passes) {
                        report.wcagCompliance.aaa = false;
                    }
                }
            }
        }

        // Calculate overall score
        const combinations = Object.values(report.combinations);
        if (combinations.length > 0) {
            const averageRatio = combinations.reduce((sum, combo) => sum + combo.ratio, 0) / combinations.length;
            report.overallScore = Math.min(100, Math.round((averageRatio / 7) * 100));
        }

        // Generate recommendations
        report.recommendations = this.generateAccessibilityRecommendations(report);

        return report;
    }

    /**
     * Generate accessibility recommendations based on analysis
     */
    generateAccessibilityRecommendations(report) {
        const recommendations = [];

        if (!report.wcagCompliance.aa) {
            recommendations.push({
                priority: 'high',
                category: 'contrast',
                title: 'Improve Color Contrast',
                description: 'Some color combinations do not meet WCAG AA standards.',
                action: 'Adjust colors to achieve minimum 4.5:1 contrast ratio for normal text, 3:1 for large text.'
            });
        }

        if (report.overallScore < 70) {
            recommendations.push({
                priority: 'medium',
                category: 'overall',
                title: 'Enhance Overall Accessibility',
                description: 'The color scheme could be more accessible overall.',
                action: 'Consider using darker text colors or lighter background colors.'
            });
        }

        // Color blindness considerations
        const hasRedGreenIssues = this.checkColorBlindnessIssues(report.colors, ['deuteranopia', 'protanopia']);
        if (hasRedGreenIssues) {
            recommendations.push({
                priority: 'medium',
                category: 'colorblindness',
                title: 'Color Blindness Considerations',
                description: 'Some colors may be difficult to distinguish for users with color vision deficiencies.',
                action: 'Consider adding patterns, shapes, or text labels to convey information beyond color alone.'
            });
        }

        return recommendations;
    }

    /**
     * Check for color blindness accessibility issues
     */
    checkColorBlindnessIssues(colors, simulationTypes) {
        const colorValues = Object.values(colors);

        for (const type of simulationTypes) {
            const simulatedColors = colorValues.map(color =>
                this.colorBlindnessSimulator.simulateColorBlindness(color.hex || color, type)
            );

            // Check if any colors become too similar after simulation
            for (let i = 0; i < simulatedColors.length; i++) {
                for (let j = i + 1; j < simulatedColors.length; j++) {
                    const distance = this.calculateColorDistance(
                        this.parseHexColor(simulatedColors[i]),
                        this.parseHexColor(simulatedColors[j])
                    );

                    if (distance < 50) { // Threshold for "too similar"
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Announce text to screen readers
     */
    announceToScreenReader(text, priority = 'polite') {
        const announcer = priority === 'assertive'
            ? this.screenReaderAnnouncer.assertive
            : this.screenReaderAnnouncer.polite;

        announcer.textContent = text;

        // Clear after announcement to allow re-announcement of same text
        setTimeout(() => {
            announcer.textContent = '';
        }, 100);
    }

    /**
     * Create screen reader announcement elements
     */
    createScreenReaderAnnouncer() {
        const container = document.createElement('div');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        container.className = 'sr-only';
        container.id = 'accessibility-announcer';

        const polite = document.createElement('div');
        polite.setAttribute('aria-live', 'polite');
        polite.className = 'sr-only';

        const assertive = document.createElement('div');
        assertive.setAttribute('aria-live', 'assertive');
        assertive.className = 'sr-only';

        container.appendChild(polite);
        container.appendChild(assertive);
        document.body.appendChild(container);

        return { polite, assertive };
    }

    /**
     * Enhanced color descriptions for screen readers
     */
    getDetailedColorDescription(hex, context = '') {
        const colorName = this.getAccessibleColorName(hex);
        const hsl = this.hexToHsl(hex);
        const brightness = this.getBrightnessDescription(hsl.l);
        const saturation = this.getSaturationDescription(hsl.s);

        let description = colorName;

        if (context) {
            description = `${context}: ${description}`;
        }

        // Add descriptive qualities for better understanding
        if (saturation !== 'moderate') {
            description += `, ${saturation}`;
        }

        if (brightness !== 'medium') {
            description += `, ${brightness}`;
        }

        return description;
    }

    /**
     * Check if element meets minimum touch target size (44x44px)
     */
    validateTouchTargetSize(element) {
        const rect = element.getBoundingClientRect();
        const minSize = 44; // WCAG 2.1 AA minimum

        return {
            passes: rect.width >= minSize && rect.height >= minSize,
            width: rect.width,
            height: rect.height,
            required: minSize
        };
    }

    /**
     * Provide alternative text for color-only information
     */
    generateColorPatternDescription(colors) {
        const patterns = [];

        colors.forEach((color, index) => {
            const colorName = this.getAccessibleColorName(color);
            const pattern = this.getColorPatternIndicator(index);
            patterns.push(`${colorName} (${pattern})`);
        });

        return patterns.join(', ');
    }

    /**
     * Get pattern indicator for color differentiation
     */
    getColorPatternIndicator(index) {
        const patterns = [
            'solid', 'dotted', 'striped', 'checkered',
            'wavy', 'zigzag', 'diamond', 'cross-hatch'
        ];
        return patterns[index % patterns.length];
    }

    /**
     * Monitor user preferences for accessibility
     */
    monitorAccessibilityPreferences() {
        // Monitor reduced motion preference
        this.reduceMotionPreference.addEventListener('change', (e) => {
            this.setupReducedMotionSupport(e.matches);
            this.announceToScreenReader('Animation preferences updated');
        });

        // Monitor high contrast preference
        this.highContrastPreference.addEventListener('change', (e) => {
            this.setupHighContrastSupport(e.matches);
            this.announceToScreenReader('Contrast preferences updated');
        });

        // Monitor color scheme changes
        const colorSchemePreference = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemePreference.addEventListener('change', () => {
            this.announceToScreenReader('Color scheme updated');
        });
    }

    /**
     * Setup reduced motion support
     */
    setupReducedMotionSupport(forceReduce = null) {
        const shouldReduce = forceReduce !== null
            ? forceReduce
            : this.reduceMotionPreference.matches;

        document.documentElement.setAttribute('data-reduce-motion', shouldReduce);

        if (shouldReduce) {
            // Disable non-essential animations
            this.disableAnimations();
        }
    }

    /**
     * Setup high contrast support
     */
    setupHighContrastSupport(forceHigh = null) {
        const shouldUseHigh = forceHigh !== null
            ? forceHigh
            : this.highContrastPreference.matches;

        document.documentElement.setAttribute('data-high-contrast', shouldUseHigh);

        if (shouldUseHigh) {
            this.applyHighContrastStyles();
        }
    }

    /**
     * Setup color scheme support
     */
    setupColorSchemeSupport() {
        const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
        document.documentElement.setAttribute('data-color-scheme',
            darkModePreference.matches ? 'dark' : 'light');
    }

    /**
     * Calculate relative luminance for contrast calculations
     */
    calculateLuminance(rgb) {
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Parse hex color to RGB
     */
    parseHexColor(hex) {
        const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        return match ? [
            parseInt(match[1], 16),
            parseInt(match[2], 16),
            parseInt(match[3], 16)
        ] : null;
    }

    /**
     * Convert hex to HSL
     */
    hexToHsl(hex) {
        const rgb = this.parseHexColor(hex);
        if (!rgb) return null;

        const [r, g, b] = rgb.map(c => c / 255);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * Get brightness description from lightness value
     */
    getBrightnessDescription(lightness) {
        if (lightness < 20) return 'very dark';
        if (lightness < 40) return 'dark';
        if (lightness < 60) return 'medium';
        if (lightness < 80) return 'light';
        return 'very light';
    }

    /**
     * Get saturation description from saturation value
     */
    getSaturationDescription(saturation) {
        if (saturation < 10) return 'desaturated';
        if (saturation < 30) return 'muted';
        if (saturation < 70) return 'moderate';
        return 'vivid';
    }

    /**
     * Initialize comprehensive color name database
     */
    initializeColorNames() {
        return {
            exact: {
                '#000000': 'black',
                '#ffffff': 'white',
                '#ff0000': 'red',
                '#00ff00': 'lime',
                '#0000ff': 'blue',
                '#ffff00': 'yellow',
                '#ff00ff': 'magenta',
                '#00ffff': 'cyan',
                '#800000': 'maroon',
                '#008000': 'green',
                '#000080': 'navy',
                '#808000': 'olive',
                '#800080': 'purple',
                '#008080': 'teal',
                '#c0c0c0': 'silver',
                '#808080': 'gray',
                '#f5f5dc': 'beige',
                '#a52a2a': 'brown',
                '#daa520': 'goldenrod',
                '#4b0082': 'indigo',
                '#ffa500': 'orange',
                '#ffc0cb': 'pink',
                '#40e0d0': 'turquoise',
                '#ee82ee': 'violet'
            }
        };
    }

    /**
     * Find closest named color using color distance
     */
    findClosestNamedColor(targetRgb) {
        let minDistance = Infinity;
        let closestColor = null;

        for (const [hex, name] of Object.entries(this.colorNames.exact)) {
            const rgb = this.parseHexColor(hex);
            if (!rgb) continue;

            const distance = this.calculateColorDistance(targetRgb, rgb);
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = name;
            }
        }

        return closestColor;
    }

    /**
     * Calculate Euclidean distance between two RGB colors
     */
    calculateColorDistance(rgb1, rgb2) {
        return Math.sqrt(
            Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
        );
    }

    /**
     * Generate descriptive color name when no close match found
     */
    generateDescriptiveColorName(rgb) {
        const hsl = this.hexToHsl('#' + rgb.map(c =>
            Math.round(c).toString(16).padStart(2, '0')).join(''));

        if (!hsl) return 'color';

        const hue = this.getHueName(hsl.h);
        const brightness = this.getBrightnessDescription(hsl.l);
        const saturation = this.getSaturationDescription(hsl.s);

        if (hsl.s < 10) return `${brightness} gray`;
        if (saturation === 'muted') return `muted ${hue}`;
        if (brightness !== 'medium') return `${brightness} ${hue}`;

        return hue;
    }

    /**
     * Get hue name from hue angle
     */
    getHueName(hue) {
        const hues = [
            { name: 'red', min: 0, max: 15 },
            { name: 'red-orange', min: 15, max: 30 },
            { name: 'orange', min: 30, max: 45 },
            { name: 'yellow-orange', min: 45, max: 60 },
            { name: 'yellow', min: 60, max: 75 },
            { name: 'yellow-green', min: 75, max: 90 },
            { name: 'green', min: 90, max: 150 },
            { name: 'blue-green', min: 150, max: 180 },
            { name: 'cyan', min: 180, max: 210 },
            { name: 'blue', min: 210, max: 270 },
            { name: 'blue-purple', min: 270, max: 300 },
            { name: 'purple', min: 300, max: 330 },
            { name: 'red-purple', min: 330, max: 360 }
        ];

        const match = hues.find(h => hue >= h.min && hue < h.max) || hues[0];
        return match.name;
    }

    /**
     * Disable animations for reduced motion preference
     */
    disableAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        style.id = 'reduced-motion-styles';

        // Remove existing reduced motion styles
        const existing = document.getElementById('reduced-motion-styles');
        if (existing) existing.remove();

        document.head.appendChild(style);
    }

    /**
     * Apply high contrast styles
     */
    applyHighContrastStyles() {
        const style = document.createElement('style');
        style.textContent = `
            [data-high-contrast="true"] {
                --color-primary: #0066cc;
                --color-primary-dark: #004499;
                --color-error: #cc0000;
                --color-success: #006600;
                --color-warning: #cc6600;
                --shadow-sm: 0 0 0 1px currentColor;
                --shadow-md: 0 0 0 2px currentColor;
                --shadow-lg: 0 0 0 3px currentColor;
            }

            [data-high-contrast="true"] .color-preview {
                border: 2px solid currentColor !important;
            }

            [data-high-contrast="true"] button:focus,
            [data-high-contrast="true"] input:focus,
            [data-high-contrast="true"] select:focus {
                outline: 3px solid currentColor !important;
                outline-offset: 2px !important;
            }
        `;
        style.id = 'high-contrast-styles';

        // Remove existing high contrast styles
        const existing = document.getElementById('high-contrast-styles');
        if (existing) existing.remove();

        document.head.appendChild(style);
    }
}

/**
 * Focus Management Class
 * Handles focus trapping, restoration, and keyboard navigation
 */
class FocusManager {
    constructor() {
        this.focusHistory = [];
        this.trapStack = [];
    }

    /**
     * Store current focus for later restoration
     */
    storeFocus() {
        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
            this.focusHistory.push(activeElement);
        }
    }

    /**
     * Restore previously stored focus
     */
    restoreFocus() {
        const element = this.focusHistory.pop();
        if (element && this.isFocusable(element)) {
            element.focus();
            return true;
        }
        return false;
    }

    /**
     * Trap focus within a container
     */
    trapFocus(container) {
        const focusableElements = this.getFocusableElements(container);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                this.releaseFocus(container);
            }
        };

        container.addEventListener('keydown', handleTabKey);

        this.trapStack.push({
            container,
            handler: handleTabKey,
            firstElement,
            lastElement
        });

        // Focus first element
        firstElement.focus();
    }

    /**
     * Release focus trap
     */
    releaseFocus(container) {
        const trapIndex = this.trapStack.findIndex(trap => trap.container === container);
        if (trapIndex !== -1) {
            const trap = this.trapStack[trapIndex];
            container.removeEventListener('keydown', trap.handler);
            this.trapStack.splice(trapIndex, 1);
        }
    }

    /**
     * Get all focusable elements in container
     */
    getFocusableElements(container) {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(',');

        return Array.from(container.querySelectorAll(focusableSelectors))
            .filter(el => this.isFocusable(el));
    }

    /**
     * Check if element is focusable
     */
    isFocusable(element) {
        if (!element || element.offsetParent === null) return false;
        if (element.disabled || element.hasAttribute('disabled')) return false;
        if (element.tabIndex < 0) return false;
        return true;
    }
}

/**
 * Keyboard Navigation Class
 * Enhanced keyboard navigation patterns
 */
class KeyboardNavigation {
    constructor() {
        this.setupGlobalKeyboardHandlers();
    }

    /**
     * Setup global keyboard navigation
     */
    setupGlobalKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            // Skip to main content (Alt + M)
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // Skip to navigation (Alt + N)
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                const nav = document.querySelector('[role="navigation"]');
                if (nav) {
                    const firstLink = nav.querySelector('a, button');
                    if (firstLink) firstLink.focus();
                }
            }

            // Quick help (Alt + H)
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                const helpBtn = document.getElementById('help-btn');
                if (helpBtn) helpBtn.click();
            }
        });
    }

    /**
     * Setup arrow key navigation for color grids
     */
    setupColorGridNavigation(container) {
        const colorElements = Array.from(container.querySelectorAll('[role="gridcell"], .color-swatch'));

        colorElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                let targetIndex = index;

                switch (e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = (index + 1) % colorElements.length;
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = (index - 1 + colorElements.length) % colorElements.length;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = colorElements.length - 1;
                        break;
                }

                if (targetIndex !== index) {
                    colorElements[targetIndex].focus();
                }
            });
        });
    }
}

/**
 * Color Blindness Simulator Class
 * Simulates different types of color vision deficiencies
 */
class ColorBlindnessSimulator {
    constructor() {
        this.simulationTypes = {
            normal: { name: 'Normal Vision', matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
            protanopia: { name: 'Protanopia (Red-blind)', matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758] },
            deuteranopia: { name: 'Deuteranopia (Green-blind)', matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7] },
            tritanopia: { name: 'Tritanopia (Blue-blind)', matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525] },
            protanomaly: { name: 'Protanomaly (Red-weak)', matrix: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875] },
            deuteranomaly: { name: 'Deuteranomaly (Green-weak)', matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858] },
            tritanomaly: { name: 'Tritanomaly (Blue-weak)', matrix: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817] },
            achromatopsia: { name: 'Achromatopsia (Monochrome)', matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114] }
        };
    }

    /**
     * Simulate color blindness for a hex color
     */
    simulateColorBlindness(hex, type = 'deuteranopia') {
        const simulation = this.simulationTypes[type];
        if (!simulation) return hex;

        const rgb = this.parseHexColor(hex);
        if (!rgb) return hex;

        const [r, g, b] = rgb.map(c => c / 255);
        const matrix = simulation.matrix;

        const newR = r * matrix[0] + g * matrix[1] + b * matrix[2];
        const newG = r * matrix[3] + g * matrix[4] + b * matrix[5];
        const newB = r * matrix[6] + g * matrix[7] + b * matrix[8];

        const clamp = val => Math.max(0, Math.min(1, val));
        const toHex = val => Math.round(clamp(val) * 255).toString(16).padStart(2, '0');

        return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
    }

    /**
     * Get all simulations for a color
     */
    getAllSimulations(hex) {
        const simulations = {};
        for (const [type, config] of Object.entries(this.simulationTypes)) {
            simulations[type] = {
                name: config.name,
                color: this.simulateColorBlindness(hex, type)
            };
        }
        return simulations;
    }

    /**
     * Parse hex color (shared utility)
     */
    parseHexColor(hex) {
        const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        return match ? [
            parseInt(match[1], 16),
            parseInt(match[2], 16),
            parseInt(match[3], 16)
        ] : null;
    }
}

// Export for global use
window.AccessibilityUtils = AccessibilityUtils;