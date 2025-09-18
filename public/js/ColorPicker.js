/**
 * ColorPicker.js - Interactive Color Selection Component
 * Handles color input synchronization, validation, and real-time preview
 */

class ColorPicker {
    constructor() {
        this.colorInputs = new Map();
        this.previewElements = new Map();
        this.validationState = new Map();

        // Color validation patterns
        this.hexPattern = /^#[0-9A-Fa-f]{6}$/;

        // Default colors
        this.defaultColors = {
            wall: '#F5F5F5',
            floor: '#8B4513',
            furniture: '#A0522D',
            accent: '#FF6347'
        };

        this.initialize();
    }

    /**
     * Initialize all color picker functionality
     */
    initialize() {
        this.setupColorInputs();
        this.setupHexInputs();
        this.setupRoomPreview();
        this.setupRoomTypeListener();
        this.setupResetButton();
        this.setupFormValidation();

        // Initialize preview with default colors
        this.updateRoomPreview();

        console.log('ColorPicker initialized successfully');
    }

    /**
     * Set up color input elements and their event listeners
     */
    setupColorInputs() {
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];

        colorTypes.forEach(type => {
            const colorInput = document.getElementById(`${type}-color`);
            const hexInput = document.getElementById(`${type}-hex`);
            const preview = document.getElementById(`${type}-preview`);

            if (colorInput && hexInput && preview) {
                // Store references
                this.colorInputs.set(type, { colorInput, hexInput, preview });
                this.validationState.set(type, { isValid: true, lastValidColor: this.defaultColors[type] });

                // Color input change handler
                colorInput.addEventListener('input', (e) => {
                    this.handleColorInputChange(type, e.target.value);
                });

                colorInput.addEventListener('change', (e) => {
                    this.handleColorInputChange(type, e.target.value);
                });

                // Set initial value
                colorInput.value = this.defaultColors[type];
            }
        });
    }

    /**
     * Set up hex input fields with validation and synchronization
     */
    setupHexInputs() {
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];

        colorTypes.forEach(type => {
            const hexInput = document.getElementById(`${type}-hex`);

            if (hexInput) {
                // Real-time validation during typing
                hexInput.addEventListener('input', (e) => {
                    this.handleHexInputChange(type, e.target.value);
                });

                // Final validation on blur
                hexInput.addEventListener('blur', (e) => {
                    this.validateAndCorrectHexInput(type, e.target.value);
                });

                // Handle paste events
                hexInput.addEventListener('paste', (e) => {
                    setTimeout(() => {
                        this.validateAndCorrectHexInput(type, e.target.value);
                    }, 0);
                });
            }
        });
    }

    /**
     * Handle color input changes and synchronize with hex input
     */
    handleColorInputChange(type, color) {
        const { hexInput, preview } = this.colorInputs.get(type);

        // Validate color format
        if (!this.isValidHexColor(color)) {
            console.warn(`Invalid color format for ${type}:`, color);
            return;
        }

        // Update hex input
        hexInput.value = color.toUpperCase();

        // Update preview
        this.updateColorPreview(type, color);

        // Update room preview
        this.updateRoomPreview();

        // Update validation state
        this.validationState.set(type, {
            isValid: true,
            lastValidColor: color
        });

        // Remove error styling
        this.clearValidationError(hexInput);

        // Announce color change for accessibility
        this.announceColorChange(type, color);
    }

    /**
     * Handle hex input changes with validation
     */
    handleHexInputChange(type, value) {
        const { colorInput, preview } = this.colorInputs.get(type);

        // Clean input (add # if missing, convert to uppercase)
        const cleanValue = this.cleanHexInput(value);

        if (this.isValidHexColor(cleanValue)) {
            // Valid color - update everything
            colorInput.value = cleanValue;
            this.updateColorPreview(type, cleanValue);
            this.updateRoomPreview();

            // Update validation state
            this.validationState.set(type, {
                isValid: true,
                lastValidColor: cleanValue
            });

            // Clear error styling
            this.clearValidationError(document.getElementById(`${type}-hex`));
        } else if (cleanValue.length >= 7) {
            // Invalid color but full length - show error
            this.showValidationError(document.getElementById(`${type}-hex`), 'Invalid hex color format');
        }
    }

    /**
     * Validate and correct hex input on blur
     */
    validateAndCorrectHexInput(type, value) {
        const hexInput = document.getElementById(`${type}-hex`);
        const cleanValue = this.cleanHexInput(value);

        if (!this.isValidHexColor(cleanValue)) {
            // Invalid color - revert to last valid color
            const { lastValidColor } = this.validationState.get(type);
            hexInput.value = lastValidColor;
            this.handleColorInputChange(type, lastValidColor);

            // Show error message briefly
            this.showValidationError(hexInput, 'Reverted to last valid color');

            // Clear error after 3 seconds
            setTimeout(() => {
                this.clearValidationError(hexInput);
            }, 3000);
        } else if (cleanValue !== value) {
            // Valid color but formatting needed
            hexInput.value = cleanValue;
            this.handleColorInputChange(type, cleanValue);
        }
    }

    /**
     * Clean hex input by adding # and converting to uppercase
     */
    cleanHexInput(value) {
        if (!value) return '';

        // Remove whitespace
        let clean = value.trim();

        // Add # if missing
        if (!clean.startsWith('#')) {
            clean = '#' + clean;
        }

        // Convert to uppercase
        clean = clean.toUpperCase();

        return clean;
    }

    /**
     * Validate hex color format
     */
    isValidHexColor(color) {
        return this.hexPattern.test(color);
    }

    /**
     * Update individual color preview
     */
    updateColorPreview(type, color) {
        const { preview } = this.colorInputs.get(type);

        if (preview) {
            preview.style.backgroundColor = color;

            // Add subtle animation
            preview.style.transform = 'scale(1.05)';
            setTimeout(() => {
                preview.style.transform = 'scale(1)';
            }, 150);
        }
    }

    /**
     * Set up room preview elements
     */
    setupRoomPreview() {
        this.previewElements.set('wall', document.getElementById('preview-wall'));
        this.previewElements.set('floor', document.getElementById('preview-floor'));
        this.previewElements.set('furniture', document.getElementById('preview-furniture'));
        this.previewElements.set('accent', document.getElementById('preview-accent'));
    }

    /**
     * Update room preview with current colors
     */
    updateRoomPreview() {
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];

        colorTypes.forEach(type => {
            const colorInput = document.getElementById(`${type}-color`);
            const previewElement = this.previewElements.get(type);

            if (colorInput && previewElement) {
                const color = colorInput.value;
                previewElement.style.backgroundColor = color;
            }
        });

        // Add subtle preview animation
        const roomPreview = document.getElementById('room-preview');
        if (roomPreview) {
            roomPreview.style.opacity = '0.7';
            setTimeout(() => {
                roomPreview.style.opacity = '1';
            }, 100);
        }
    }

    /**
     * Set up room type listener to show/hide age group
     */
    setupRoomTypeListener() {
        const roomTypeSelect = document.getElementById('room-type');
        const ageGroupContainer = document.getElementById('age-group-container');

        if (roomTypeSelect && ageGroupContainer) {
            roomTypeSelect.addEventListener('change', (e) => {
                const isChildRoom = e.target.value === 'child_bedroom' || e.target.value === 'playroom';

                if (isChildRoom) {
                    ageGroupContainer.style.display = 'block';
                    ageGroupContainer.setAttribute('aria-hidden', 'false');

                    // Make age group required for child rooms
                    const ageGroupSelect = document.getElementById('age-group');
                    if (ageGroupSelect) {
                        ageGroupSelect.setAttribute('required', '');
                    }
                } else {
                    ageGroupContainer.style.display = 'none';
                    ageGroupContainer.setAttribute('aria-hidden', 'true');

                    // Remove age group requirement
                    const ageGroupSelect = document.getElementById('age-group');
                    if (ageGroupSelect) {
                        ageGroupSelect.removeAttribute('required');
                        ageGroupSelect.value = '';
                    }
                }
            });
        }
    }

    /**
     * Set up reset button functionality
     */
    setupResetButton() {
        const resetBtn = document.getElementById('reset-btn');

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetColors();
            });
        }
    }

    /**
     * Reset all colors to default values
     */
    resetColors() {
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];

        colorTypes.forEach(type => {
            const defaultColor = this.defaultColors[type];
            const { colorInput, hexInput } = this.colorInputs.get(type);

            if (colorInput && hexInput) {
                colorInput.value = defaultColor;
                hexInput.value = defaultColor;
                this.updateColorPreview(type, defaultColor);

                // Update validation state
                this.validationState.set(type, {
                    isValid: true,
                    lastValidColor: defaultColor
                });

                // Clear any error styling
                this.clearValidationError(hexInput);
            }
        });

        // Update room preview
        this.updateRoomPreview();

        // Reset form fields
        const roomTypeSelect = document.getElementById('room-type');
        const ageGroupSelect = document.getElementById('age-group');
        const ageGroupContainer = document.getElementById('age-group-container');

        if (roomTypeSelect) {
            roomTypeSelect.value = '';
        }

        if (ageGroupSelect) {
            ageGroupSelect.value = '';
            ageGroupSelect.removeAttribute('required');
        }

        if (ageGroupContainer) {
            ageGroupContainer.style.display = 'none';
            ageGroupContainer.setAttribute('aria-hidden', 'true');
        }

        // Announce reset for accessibility
        this.announceMessage('Colors reset to default values');

        console.log('Colors reset to defaults');
    }

    /**
     * Set up form validation
     */
    setupFormValidation() {
        const form = document.getElementById('color-form');

        if (form) {
            // Real-time validation
            form.addEventListener('input', () => {
                this.validateForm();
            });

            // Prevent invalid form submission
            form.addEventListener('submit', (e) => {
                if (!this.validateForm()) {
                    e.preventDefault();
                    this.showFormErrors();
                }
            });
        }
    }

    /**
     * Validate the entire form
     */
    validateForm() {
        let isValid = true;
        const errors = [];

        // Validate room type
        const roomTypeSelect = document.getElementById('room-type');
        if (!roomTypeSelect.value) {
            isValid = false;
            errors.push('Please select a room type');
            this.showValidationError(roomTypeSelect, 'Room type is required');
        } else {
            this.clearValidationError(roomTypeSelect);
        }

        // Validate age group for child rooms
        const ageGroupSelect = document.getElementById('age-group');
        if (ageGroupSelect && ageGroupSelect.hasAttribute('required') && !ageGroupSelect.value) {
            isValid = false;
            errors.push('Please select an age group for children\'s rooms');
            this.showValidationError(ageGroupSelect, 'Age group is required for children\'s rooms');
        } else if (ageGroupSelect) {
            this.clearValidationError(ageGroupSelect);
        }

        // Validate hex colors
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];
        colorTypes.forEach(type => {
            const hexInput = document.getElementById(`${type}-hex`);
            if (hexInput && hexInput.value && !this.isValidHexColor(hexInput.value)) {
                isValid = false;
                errors.push(`Invalid ${type} color format`);
                this.showValidationError(hexInput, 'Invalid hex color format');
            }
        });

        return isValid;
    }

    /**
     * Show form validation errors
     */
    showFormErrors() {
        const firstError = document.querySelector('[aria-invalid="true"]');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Show validation error on an element
     */
    showValidationError(element, message) {
        element.setAttribute('aria-invalid', 'true');
        element.style.borderColor = 'var(--color-error)';

        // Create or update error message
        let errorElement = element.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.cssText = `
                color: var(--color-error);
                font-size: var(--font-size-xs);
                margin-top: 4px;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
            element.parentNode.appendChild(errorElement);
        }

        errorElement.innerHTML = `<span>⚠️</span> ${message}`;
        errorElement.setAttribute('role', 'alert');
    }

    /**
     * Clear validation error from an element
     */
    clearValidationError(element) {
        element.removeAttribute('aria-invalid');
        element.style.borderColor = '';

        const errorElement = element.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Get current color values
     */
    getCurrentColors() {
        const colors = {};
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];

        colorTypes.forEach(type => {
            const colorInput = document.getElementById(`${type}-color`);
            if (colorInput && colorInput.value && this.isValidHexColor(colorInput.value)) {
                colors[type] = colorInput.value;
            }
        });

        return colors;
    }

    /**
     * Get current form values
     */
    getFormValues() {
        const roomTypeSelect = document.getElementById('room-type');
        const ageGroupSelect = document.getElementById('age-group');

        const formData = {
            roomType: roomTypeSelect?.value || '',
            ageGroup: ageGroupSelect?.value || '',
            colors: this.getCurrentColors()
        };

        // Only include non-empty values
        if (!formData.roomType) delete formData.roomType;
        if (!formData.ageGroup) delete formData.ageGroup;

        return formData;
    }

    /**
     * Set color values programmatically
     */
    setColors(colors) {
        Object.entries(colors).forEach(([type, color]) => {
            if (this.colorInputs.has(type) && this.isValidHexColor(color)) {
                const { colorInput, hexInput } = this.colorInputs.get(type);
                colorInput.value = color;
                hexInput.value = color.toUpperCase();
                this.updateColorPreview(type, color);
            }
        });

        this.updateRoomPreview();
    }

    /**
     * Generate random color palette
     */
    generateRandomPalette() {
        const harmonicColors = this.generateHarmonicColors();
        this.setColors(harmonicColors);
        this.announceMessage('New random color palette generated');
    }

    /**
     * Generate harmonic colors using color theory
     */
    generateHarmonicColors() {
        // Generate a base hue
        const baseHue = Math.floor(Math.random() * 360);

        return {
            wall: this.hslToHex(baseHue, 10, 95),           // Very light base color
            floor: this.hslToHex((baseHue + 180) % 360, 40, 35),  // Complementary, darker
            furniture: this.hslToHex((baseHue + 60) % 360, 30, 50), // Triadic
            accent: this.hslToHex((baseHue + 120) % 360, 70, 60)    // Triadic, more saturated
        };
    }

    /**
     * Convert HSL to hex color
     */
    hslToHex(h, s, l) {
        const hue = h / 360;
        const sat = s / 100;
        const light = l / 100;

        const c = (1 - Math.abs(2 * light - 1)) * sat;
        const x = c * (1 - Math.abs((hue * 6) % 2 - 1));
        const m = light - c / 2;

        let r, g, b;

        if (hue < 1/6) { r = c; g = x; b = 0; }
        else if (hue < 2/6) { r = x; g = c; b = 0; }
        else if (hue < 3/6) { r = 0; g = c; b = x; }
        else if (hue < 4/6) { r = 0; g = x; b = c; }
        else if (hue < 5/6) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    }

    /**
     * Announce color change for accessibility
     */
    announceColorChange(type, color) {
        this.announceMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} color changed to ${color}`);
    }

    /**
     * Announce message for screen readers
     */
    announceMessage(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Get accessibility information about current colors
     */
    getColorAccessibilityInfo() {
        const colors = this.getCurrentColors();
        const info = {};

        Object.entries(colors).forEach(([type, color]) => {
            info[type] = {
                color,
                luminance: this.getLuminance(color),
                contrastWith: {}
            };
        });

        // Calculate contrast ratios between colors
        const colorPairs = [
            ['wall', 'furniture'],
            ['wall', 'accent'],
            ['floor', 'furniture'],
            ['furniture', 'accent']
        ];

        colorPairs.forEach(([color1, color2]) => {
            if (info[color1] && info[color2]) {
                const contrast = this.getContrastRatio(info[color1].luminance, info[color2].luminance);
                info[color1].contrastWith[color2] = contrast;
                info[color2].contrastWith[color1] = contrast;
            }
        });

        return info;
    }

    /**
     * Calculate relative luminance of a color
     */
    getLuminance(hex) {
        const rgb = this.hexToRgb(hex);
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Calculate contrast ratio between two luminance values
     */
    getContrastRatio(lum1, lum2) {
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Destroy the color picker instance
     */
    destroy() {
        // Remove event listeners and clean up
        this.colorInputs.clear();
        this.previewElements.clear();
        this.validationState.clear();

        console.log('ColorPicker destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorPicker;
}

// Global availability
window.ColorPicker = ColorPicker;