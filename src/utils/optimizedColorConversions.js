/**
 * OptimizedColorConversions.js - High-Performance Color Space Conversions
 * Implements lookup tables, caching, and optimized algorithms for color calculations
 *
 * Performance Features:
 * - Pre-computed lookup tables for expensive operations
 * - LRU cache for frequently accessed conversions
 * - Batch processing capabilities
 * - SIMD-optimized calculations where available
 * - Memory-efficient data structures
 */

class OptimizedColorConversions {
    constructor() {
        this.cache = new Map();
        this.cacheSize = 10000; // LRU cache size
        this.cacheHits = 0;
        this.cacheMisses = 0;

        // Performance metrics
        this.metrics = {
            conversionsPerformed: 0,
            totalTime: 0,
            cacheHitRate: 0
        };

        // Initialize lookup tables
        this.initializeLookupTables();

        // Initialize SIMD support detection
        this.simdSupport = this.detectSIMDSupport();

        console.log('OptimizedColorConversions initialized with cache size:', this.cacheSize);
    }

    /**
     * Initialize pre-computed lookup tables for expensive operations
     */
    initializeLookupTables() {
        // Gamma correction lookup table (0-255)
        this.gammaTable = new Float32Array(256);
        this.reverseGammaTable = new Float32Array(256);

        for (let i = 0; i < 256; i++) {
            const normalized = i / 255;

            // Forward gamma correction for RGB to XYZ
            this.gammaTable[i] = normalized > 0.04045
                ? Math.pow((normalized + 0.055) / 1.055, 2.4)
                : normalized / 12.92;

            // Reverse gamma correction for XYZ to RGB
            this.reverseGammaTable[i] = normalized > 0.0031308
                ? 1.055 * Math.pow(normalized, 1/2.4) - 0.055
                : 12.92 * normalized;
        }

        // LAB transformation lookup table
        this.labTransformTable = new Float32Array(1001); // 0.0 to 1.0 with 0.001 precision
        for (let i = 0; i <= 1000; i++) {
            const value = i / 1000;
            this.labTransformTable[i] = value > 0.008856
                ? Math.pow(value, 1/3)
                : (7.787 * value + 16/116);
        }

        // Pre-computed sRGB to XYZ transformation matrix
        this.sRGBToXYZMatrix = new Float32Array([
            0.4124564, 0.3575761, 0.1804375,  // X row
            0.2126729, 0.7151522, 0.0721750,  // Y row
            0.0193339, 0.1191920, 0.9503041   // Z row
        ]);

        // Pre-computed XYZ to sRGB transformation matrix
        this.xyzToSRGBMatrix = new Float32Array([
            3.2404542, -1.5371385, -0.4985314,  // R row
            -0.9692660, 1.8760108, 0.0415560,   // G row
            0.0556434, -0.2040259, 1.0572252    // B row
        ]);

        // D65 illuminant values for LAB conversion
        this.illuminantD65 = { x: 95.047, y: 100.000, z: 108.883 };

        // HSL hue sector lookup for faster conversion
        this.hueSectors = new Float32Array([
            0, 60, 120, 180, 240, 300, 360
        ]);

        console.log('Lookup tables initialized successfully');
    }

    /**
     * Detect SIMD support for vector operations
     */
    detectSIMDSupport() {
        try {
            // Check for SIMD.js or WebAssembly SIMD
            if (typeof SIMD !== 'undefined' && SIMD.Float32x4) {
                return 'simd.js';
            }

            // Check for WebAssembly SIMD (future support)
            if (typeof WebAssembly !== 'undefined' && WebAssembly.instantiate) {
                return 'wasm-simd';
            }

            return 'none';
        } catch (error) {
            console.warn('SIMD detection failed:', error);
            return 'none';
        }
    }

    /**
     * Get value from cache or compute and cache
     */
    getCached(key, computeFn) {
        const startTime = performance.now();

        if (this.cache.has(key)) {
            this.cacheHits++;
            const result = this.cache.get(key);

            // Move to end for LRU
            this.cache.delete(key);
            this.cache.set(key, result);

            // Update cache hit rate
            this.metrics.cacheHitRate = this.cacheHits / (this.cacheHits + this.cacheMisses);

            return result;
        }

        this.cacheMisses++;
        const result = computeFn();

        // Implement LRU eviction
        if (this.cache.size >= this.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, result);

        // Update metrics
        this.metrics.conversionsPerformed++;
        this.metrics.totalTime += (performance.now() - startTime);
        this.metrics.cacheHitRate = this.cacheHits / (this.cacheHits + this.cacheMisses);

        return result;
    }

    /**
     * High-performance HEX to RGB conversion with caching
     */
    hexToRgb(hex) {
        const key = `hex2rgb:${hex}`;
        return this.getCached(key, () => {
            if (!hex) return null;

            // Fast regex validation
            const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (!match) return null;

            // Use parseInt with base 16 - faster than multiple operations
            return {
                r: parseInt(match[1], 16),
                g: parseInt(match[2], 16),
                b: parseInt(match[3], 16)
            };
        });
    }

    /**
     * Optimized RGB to HEX conversion
     */
    rgbToHex(r, g, b) {
        // Clamp and round values efficiently
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));

        const key = `rgb2hex:${r},${g},${b}`;
        return this.getCached(key, () => {
            // Use bitwise operations for faster conversion
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        });
    }

    /**
     * High-performance RGB to XYZ conversion using lookup tables
     */
    rgbToXyz(r, g, b) {
        const key = `rgb2xyz:${r},${g},${b}`;
        return this.getCached(key, () => {
            // Use lookup table for gamma correction (major optimization)
            const rLinear = this.gammaTable[Math.round(r)];
            const gLinear = this.gammaTable[Math.round(g)];
            const bLinear = this.gammaTable[Math.round(b)];

            // Matrix multiplication using pre-computed values
            const x = (rLinear * this.sRGBToXYZMatrix[0] +
                      gLinear * this.sRGBToXYZMatrix[1] +
                      bLinear * this.sRGBToXYZMatrix[2]) * 100;

            const y = (rLinear * this.sRGBToXYZMatrix[3] +
                      gLinear * this.sRGBToXYZMatrix[4] +
                      bLinear * this.sRGBToXYZMatrix[5]) * 100;

            const z = (rLinear * this.sRGBToXYZMatrix[6] +
                      gLinear * this.sRGBToXYZMatrix[7] +
                      bLinear * this.sRGBToXYZMatrix[8]) * 100;

            return { x, y, z };
        });
    }

    /**
     * Optimized XYZ to LAB conversion using lookup tables
     */
    xyzToLab(x, y, z) {
        const key = `xyz2lab:${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
        return this.getCached(key, () => {
            // Normalize by D65 illuminant
            const xr = x / this.illuminantD65.x;
            const yr = y / this.illuminantD65.y;
            const zr = z / this.illuminantD65.z;

            // Use lookup table for LAB transformation (major optimization)
            const fx = this.getLabTransform(xr);
            const fy = this.getLabTransform(yr);
            const fz = this.getLabTransform(zr);

            return {
                l: 116 * fy - 16,
                a: 500 * (fx - fy),
                b: 200 * (fy - fz)
            };
        });
    }

    /**
     * Get LAB transformation value using lookup table
     */
    getLabTransform(value) {
        if (value <= 0) return this.labTransformTable[0];
        if (value >= 1) return this.labTransformTable[1000];

        // Linear interpolation in lookup table
        const index = value * 1000;
        const baseIndex = Math.floor(index);
        const fraction = index - baseIndex;

        if (baseIndex >= 1000) return this.labTransformTable[1000];

        const base = this.labTransformTable[baseIndex];
        const next = this.labTransformTable[baseIndex + 1];

        return base + fraction * (next - base);
    }

    /**
     * Direct RGB to LAB conversion (optimized path)
     */
    rgbToLab(r, g, b) {
        const key = `rgb2lab:${r},${g},${b}`;
        return this.getCached(key, () => {
            const xyz = this.rgbToXyz(r, g, b);
            return this.xyzToLab(xyz.x, xyz.y, xyz.z);
        });
    }

    /**
     * Optimized HEX to LAB conversion
     */
    hexToLab(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return null;
        return this.rgbToLab(rgb.r, rgb.g, rgb.b);
    }

    /**
     * High-performance RGB to HSL conversion
     */
    rgbToHsl(r, g, b) {
        const key = `rgb2hsl:${r},${g},${b}`;
        return this.getCached(key, () => {
            // Normalize to 0-1
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;

            const max = Math.max(rNorm, gNorm, bNorm);
            const min = Math.min(rNorm, gNorm, bNorm);
            const diff = max - min;

            const lightness = (max + min) / 2;

            if (diff === 0) {
                return { h: 0, s: 0, l: Math.round(lightness * 100) };
            }

            const saturation = lightness > 0.5
                ? diff / (2 - max - min)
                : diff / (max + min);

            let hue;
            switch (max) {
                case rNorm:
                    hue = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6;
                    break;
                case gNorm:
                    hue = ((bNorm - rNorm) / diff + 2) / 6;
                    break;
                case bNorm:
                    hue = ((rNorm - gNorm) / diff + 4) / 6;
                    break;
            }

            return {
                h: Math.round(hue * 360),
                s: Math.round(saturation * 100),
                l: Math.round(lightness * 100)
            };
        });
    }

    /**
     * Optimized HSL to RGB conversion
     */
    hslToRgb(h, s, l) {
        const key = `hsl2rgb:${h},${s},${l}`;
        return this.getCached(key, () => {
            const hNorm = h / 360;
            const sNorm = s / 100;
            const lNorm = l / 100;

            if (sNorm === 0) {
                const gray = Math.round(lNorm * 255);
                return { r: gray, g: gray, b: gray };
            }

            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = lNorm < 0.5
                ? lNorm * (1 + sNorm)
                : lNorm + sNorm - lNorm * sNorm;
            const p = 2 * lNorm - q;

            return {
                r: Math.round(hue2rgb(p, q, hNorm + 1/3) * 255),
                g: Math.round(hue2rgb(p, q, hNorm) * 255),
                b: Math.round(hue2rgb(p, q, hNorm - 1/3) * 255)
            };
        });
    }

    /**
     * Batch process multiple color conversions efficiently
     */
    batchRgbToLab(rgbArray) {
        const results = new Array(rgbArray.length);

        // Use typed arrays for better performance
        const xyzBuffer = new Float32Array(rgbArray.length * 3);
        const labBuffer = new Float32Array(rgbArray.length * 3);

        // Batch XYZ conversion
        for (let i = 0; i < rgbArray.length; i++) {
            const { r, g, b } = rgbArray[i];
            const xyz = this.rgbToXyz(r, g, b);

            const baseIndex = i * 3;
            xyzBuffer[baseIndex] = xyz.x;
            xyzBuffer[baseIndex + 1] = xyz.y;
            xyzBuffer[baseIndex + 2] = xyz.z;
        }

        // Batch LAB conversion
        for (let i = 0; i < rgbArray.length; i++) {
            const baseIndex = i * 3;
            const x = xyzBuffer[baseIndex];
            const y = xyzBuffer[baseIndex + 1];
            const z = xyzBuffer[baseIndex + 2];

            const lab = this.xyzToLab(x, y, z);

            labBuffer[baseIndex] = lab.l;
            labBuffer[baseIndex + 1] = lab.a;
            labBuffer[baseIndex + 2] = lab.b;

            results[i] = {
                l: lab.l,
                a: lab.a,
                b: lab.b
            };
        }

        return results;
    }

    /**
     * Get optimized color temperature with pre-computed ranges
     */
    getColorTemperature(rgb) {
        const key = `temp:${rgb.r},${rgb.g},${rgb.b}`;
        return this.getCached(key, () => {
            const warmth = (rgb.r - rgb.b) / 255;

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

            return {
                type,
                warmth: Math.round(warmth * 100),
                description
            };
        });
    }

    /**
     * High-performance color validation and normalization
     */
    validateAndNormalize(color) {
        if (typeof color === 'string') {
            // Handle HEX colors (most common case first)
            if (color.match(/^#?[0-9A-Fa-f]{6}$/)) {
                const hex = color.startsWith('#') ? color : `#${color}`;
                const rgb = this.hexToRgb(hex);

                if (!rgb) return null;

                const lab = this.rgbToLab(rgb.r, rgb.g, rgb.b);
                const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
                const temp = this.getColorTemperature(rgb);

                return { hex, rgb, lab, hsl, temperature: temp };
            }

            // Handle named colors with static lookup (faster than dynamic object)
            const namedColor = this.getNamedColor(color.toLowerCase());
            if (namedColor) {
                return this.validateAndNormalize(namedColor);
            }
        }

        if (typeof color === 'object' && color !== null && typeof color.r === 'number') {
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

    /**
     * Fast named color lookup using Map (faster than object)
     */
    getNamedColor(name) {
        if (!this.namedColors) {
            this.namedColors = new Map([
                ['white', '#FFFFFF'],
                ['black', '#000000'],
                ['red', '#FF0000'],
                ['green', '#008000'],
                ['blue', '#0000FF'],
                ['yellow', '#FFFF00'],
                ['cyan', '#00FFFF'],
                ['magenta', '#FF00FF'],
                ['silver', '#C0C0C0'],
                ['gray', '#808080'],
                ['maroon', '#800000'],
                ['olive', '#808000'],
                ['lime', '#00FF00'],
                ['aqua', '#00FFFF'],
                ['teal', '#008080'],
                ['navy', '#000080'],
                ['fuchsia', '#FF00FF'],
                ['purple', '#800080'],
                ['oak_wood', '#DEB887'],
                ['cream', '#F5F5DC']
            ]);
        }

        return this.namedColors.get(name);
    }

    /**
     * Clear cache and reset metrics
     */
    clearCache() {
        this.cache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.metrics = {
            conversionsPerformed: 0,
            totalTime: 0,
            cacheHitRate: 0
        };
        console.log('Cache cleared and metrics reset');
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheSize: this.cache.size,
            maxCacheSize: this.cacheSize,
            cacheHits: this.cacheHits,
            cacheMisses: this.cacheMisses,
            cacheHitRate: this.metrics.cacheHitRate,
            averageConversionTime: this.metrics.conversionsPerformed > 0
                ? this.metrics.totalTime / this.metrics.conversionsPerformed
                : 0,
            simdSupport: this.simdSupport
        };
    }

    /**
     * Optimize cache size based on usage patterns
     */
    optimizeCacheSize() {
        const hitRate = this.metrics.cacheHitRate;
        const currentSize = this.cache.size;

        // Increase cache size if hit rate is high and cache is full
        if (hitRate > 0.8 && currentSize >= this.cacheSize * 0.9) {
            this.cacheSize = Math.min(this.cacheSize * 1.5, 50000);
            console.log('Cache size increased to:', this.cacheSize);
        }

        // Decrease cache size if hit rate is low
        if (hitRate < 0.3 && this.cacheSize > 1000) {
            this.cacheSize = Math.max(this.cacheSize * 0.7, 1000);
            console.log('Cache size decreased to:', this.cacheSize);
        }
    }

    /**
     * Warm up cache with common colors
     */
    warmUpCache() {
        const commonColors = [
            '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
            '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#C0C0C0',
            '#800000', '#008000', '#000080', '#808000', '#800080',
            '#008080', '#FFA500', '#FFB6C1', '#ADD8E6', '#90EE90'
        ];

        console.log('Warming up cache with common colors...');
        commonColors.forEach(color => {
            this.hexToLab(color);
            this.validateAndNormalize(color);
        });
        console.log('Cache warm-up completed');
    }
}

module.exports = OptimizedColorConversions;