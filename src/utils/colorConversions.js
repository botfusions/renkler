/**
 * Color conversion utilities for RGB, HEX, LAB, and HSL color spaces
 * Based on scientific color theory for accurate Sanzo Wada color matching
 */

class ColorConversions {

    /**
     * Convert HEX to RGB
     * @param {string} hex - Hex color code (e.g., "#FF0000")
     * @returns {Object} RGB object {r, g, b}
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to HEX
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {string} HEX color code
     */
    static rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const clamped = Math.max(0, Math.min(255, Math.round(x)));
            const hex = clamped.toString(16).toUpperCase();
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    /**
     * Convert RGB to XYZ color space (intermediate for LAB conversion)
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {Object} XYZ object {x, y, z}
     */
    static rgbToXyz(r, g, b) {
        // Normalize RGB values to 0-1
        let rNorm = r / 255;
        let gNorm = g / 255;
        let bNorm = b / 255;

        // Apply gamma correction
        rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
        gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
        bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

        // Convert to XYZ using sRGB matrix
        const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
        const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
        const z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;

        return { x: x * 100, y: y * 100, z: z * 100 };
    }

    /**
     * Convert XYZ to LAB color space
     * @param {number} x - X value
     * @param {number} y - Y value
     * @param {number} z - Z value
     * @returns {Object} LAB object {l, a, b}
     */
    static xyzToLab(x, y, z) {
        // D65 illuminant reference values
        const xn = 95.047;
        const yn = 100.000;
        const zn = 108.883;

        // Normalize
        const xr = x / xn;
        const yr = y / yn;
        const zr = z / zn;

        // Apply LAB transformation
        const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr + 16/116);
        const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr + 16/116);
        const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr + 16/116);

        const l = 116 * fy - 16;
        const a = 500 * (fx - fy);
        const b = 200 * (fy - fz);

        return { l, a, b };
    }

    /**
     * Convert RGB directly to LAB color space
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {Object} LAB object {l, a, b}
     */
    static rgbToLab(r, g, b) {
        const xyz = this.rgbToXyz(r, g, b);
        return this.xyzToLab(xyz.x, xyz.y, xyz.z);
    }

    /**
     * Convert HEX directly to LAB color space
     * @param {string} hex - Hex color code
     * @returns {Object} LAB object {l, a, b}
     */
    static hexToLab(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return null;
        return this.rgbToLab(rgb.r, rgb.g, rgb.b);
    }

    /**
     * Convert RGB to HSL color space
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {Object} HSL object {h, s, l}
     */
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

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
     * Convert HSL to RGB color space
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {Object} RGB object {r, g, b}
     */
    static hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * Get color temperature classification
     * @param {Object} rgb - RGB color object {r, g, b}
     * @returns {Object} Temperature info {type, warmth, description}
     */
    static getColorTemperature(rgb) {
        const { r, g, b } = rgb;

        // Calculate relative warmth based on red/blue ratio
        const warmth = (r - b) / 255;

        let type, description;
        if (warmth > 0.2) {
            type = 'warm';
            description = 'Warm colors create cozy, inviting atmospheres';
        } else if (warmth < -0.2) {
            type = 'cool';
            description = 'Cool colors promote calm, peaceful environments';
        } else {
            type = 'neutral';
            description = 'Neutral colors provide balanced, versatile foundations';
        }

        return { type, warmth: Math.round(warmth * 100), description };
    }

    /**
     * Validate color input formats
     * @param {string|Object} color - Color in various formats
     * @returns {Object} Normalized color data or null if invalid
     */
    static validateAndNormalize(color) {
        if (typeof color === 'string') {
            // Handle HEX colors
            if (color.match(/^#?[0-9A-Fa-f]{6}$/)) {
                const hex = color.startsWith('#') ? color : `#${color}`;
                const rgb = this.hexToRgb(hex);
                const lab = this.hexToLab(hex);
                const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
                const temp = this.getColorTemperature(rgb);

                return { hex, rgb, lab, hsl, temperature: temp };
            }

            // Handle named colors (basic set)
            const namedColors = {
                'white': '#FFFFFF',
                'black': '#000000',
                'red': '#FF0000',
                'green': '#008000',
                'blue': '#0000FF',
                'yellow': '#FFFF00',
                'oak_wood': '#DEB887',
                'cream': '#F5F5DC'
            };

            if (namedColors[color.toLowerCase()]) {
                return this.validateAndNormalize(namedColors[color.toLowerCase()]);
            }
        }

        if (typeof color === 'object' && color !== null && color.r !== undefined) {
            // Handle RGB objects
            const { r, g, b } = color;
            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                const hex = this.rgbToHex(r, g, b);
                const lab = this.rgbToLab(r, g, b);
                const hsl = this.rgbToHsl(r, g, b);
                const temp = this.getColorTemperature({ r, g, b });

                return { hex, rgb: { r, g, b }, lab, hsl, temperature: temp };
            }
        }

        return null;
    }
}

module.exports = ColorConversions;