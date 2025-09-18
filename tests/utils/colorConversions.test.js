/**
 * ColorConversions.test.js - Comprehensive unit tests for color conversion utilities
 * Tests all color space conversions, validations, and edge cases
 */

const ColorConversions = require('../../src/utils/colorConversions');

describe('ColorConversions', () => {

    // Test data with known correct values
    const testColors = {
        red: { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, hsl: { h: 0, s: 100, l: 50 } },
        green: { hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 }, hsl: { h: 120, s: 100, l: 50 } },
        blue: { hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, hsl: { h: 240, s: 100, l: 50 } },
        white: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
        black: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } },
        gray: { hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, hsl: { h: 0, s: 0, l: 50 } },
        yellow: { hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 }, hsl: { h: 60, s: 100, l: 50 } },
        cyan: { hex: '#00FFFF', rgb: { r: 0, g: 255, b: 255 }, hsl: { h: 180, s: 100, l: 50 } },
        magenta: { hex: '#FF00FF', rgb: { r: 255, g: 0, b: 255 }, hsl: { h: 300, s: 100, l: 50 } }
    };

    describe('hexToRgb', () => {
        test('should convert valid hex colors to RGB', () => {
            Object.entries(testColors).forEach(([name, color]) => {
                const result = ColorConversions.hexToRgb(color.hex);
                expect(result).toEqual(color.rgb);
            });
        });

        test('should handle hex colors without # prefix', () => {
            const result = ColorConversions.hexToRgb('FF0000');
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        });

        test('should handle lowercase hex colors', () => {
            const result = ColorConversions.hexToRgb('#ff0000');
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        });

        test('should return null for invalid hex colors', () => {
            expect(ColorConversions.hexToRgb('#GGGGGG')).toBeNull();
            expect(ColorConversions.hexToRgb('#FFF')).toBeNull();
            expect(ColorConversions.hexToRgb('#FFFFFFF')).toBeNull();
            expect(ColorConversions.hexToRgb('invalid')).toBeNull();
            expect(ColorConversions.hexToRgb('')).toBeNull();
            expect(ColorConversions.hexToRgb(null)).toBeNull();
        });

        test('should handle edge case color values', () => {
            expect(ColorConversions.hexToRgb('#123456')).toEqual({ r: 18, g: 52, b: 86 });
            expect(ColorConversions.hexToRgb('#ABCDEF')).toEqual({ r: 171, g: 205, b: 239 });
        });
    });

    describe('rgbToHex', () => {
        test('should convert valid RGB values to hex', () => {
            Object.entries(testColors).forEach(([name, color]) => {
                const { r, g, b } = color.rgb;
                const result = ColorConversions.rgbToHex(r, g, b);
                expect(result).toBe(color.hex);
            });
        });

        test('should handle floating point RGB values', () => {
            expect(ColorConversions.rgbToHex(255.7, 0.3, 0.8)).toBe('#FF0001');
            expect(ColorConversions.rgbToHex(127.4, 127.6, 127.9)).toBe('#7F8080');
        });

        test('should pad single digit hex values', () => {
            expect(ColorConversions.rgbToHex(1, 2, 3)).toBe('#010203');
            expect(ColorConversions.rgbToHex(15, 15, 15)).toBe('#0F0F0F');
        });

        test('should clamp values outside 0-255 range', () => {
            expect(ColorConversions.rgbToHex(-10, 300, 128)).toBe('#00FF80');
        });
    });

    describe('rgbToXyz', () => {
        test('should convert RGB to XYZ color space correctly', () => {
            // Test with known values - white point D65
            const whiteXyz = ColorConversions.rgbToXyz(255, 255, 255);
            expect(whiteXyz.x).toBeCloseTo(95.05, 1);
            expect(whiteXyz.y).toBeCloseTo(100.0, 1);
            expect(whiteXyz.z).toBeCloseTo(108.9, 1);
        });

        test('should handle gamma correction properly', () => {
            // Test with mid-gray values that require gamma correction
            const result = ColorConversions.rgbToXyz(128, 128, 128);
            expect(result.x).toBeGreaterThan(0);
            expect(result.y).toBeGreaterThan(0);
            expect(result.z).toBeGreaterThan(0);
        });

        test('should return zero XYZ for black', () => {
            const result = ColorConversions.rgbToXyz(0, 0, 0);
            expect(result.x).toBeCloseTo(0, 5);
            expect(result.y).toBeCloseTo(0, 5);
            expect(result.z).toBeCloseTo(0, 5);
        });
    });

    describe('xyzToLab', () => {
        test('should convert XYZ to LAB correctly', () => {
            // Test with white point (should give L=100, a=0, b=0)
            const whiteLab = ColorConversions.xyzToLab(95.047, 100.000, 108.883);
            expect(whiteLab.l).toBeCloseTo(100, 0);
            expect(whiteLab.a).toBeCloseTo(0, 0);
            expect(whiteLab.b).toBeCloseTo(0, 0);
        });

        test('should handle black point correctly', () => {
            const blackLab = ColorConversions.xyzToLab(0, 0, 0);
            expect(blackLab.l).toBeCloseTo(0, 1);
        });

        test('should use correct illuminant values (D65)', () => {
            const result = ColorConversions.xyzToLab(50, 50, 50);
            expect(result).toHaveProperty('l');
            expect(result).toHaveProperty('a');
            expect(result).toHaveProperty('b');
        });
    });

    describe('rgbToLab', () => {
        test('should convert RGB directly to LAB', () => {
            const whiteLab = ColorConversions.rgbToLab(255, 255, 255);
            expect(whiteLab.l).toBeCloseTo(100, 0);

            const blackLab = ColorConversions.rgbToLab(0, 0, 0);
            expect(blackLab.l).toBeCloseTo(0, 1);
        });

        test('should match composition of rgbToXyz and xyzToLab', () => {
            const rgb = { r: 128, g: 64, b: 192 };

            const directLab = ColorConversions.rgbToLab(rgb.r, rgb.g, rgb.b);
            const xyz = ColorConversions.rgbToXyz(rgb.r, rgb.g, rgb.b);
            const composedLab = ColorConversions.xyzToLab(xyz.x, xyz.y, xyz.z);

            expect(directLab.l).toBeCloseTo(composedLab.l, 5);
            expect(directLab.a).toBeCloseTo(composedLab.a, 5);
            expect(directLab.b).toBeCloseTo(composedLab.b, 5);
        });
    });

    describe('hexToLab', () => {
        test('should convert hex to LAB correctly', () => {
            const whiteLab = ColorConversions.hexToLab('#FFFFFF');
            expect(whiteLab.l).toBeCloseTo(100, 0);

            const blackLab = ColorConversions.hexToLab('#000000');
            expect(blackLab.l).toBeCloseTo(0, 1);
        });

        test('should return null for invalid hex colors', () => {
            expect(ColorConversions.hexToLab('invalid')).toBeNull();
            expect(ColorConversions.hexToLab('#GGG')).toBeNull();
            expect(ColorConversions.hexToLab(null)).toBeNull();
        });
    });

    describe('rgbToHsl', () => {
        test('should convert RGB to HSL correctly', () => {
            Object.entries(testColors).forEach(([name, color]) => {
                const { r, g, b } = color.rgb;
                const result = ColorConversions.rgbToHsl(r, g, b);

                // Allow small rounding differences
                expect(result.h).toBeCloseTo(color.hsl.h, 0);
                expect(result.s).toBeCloseTo(color.hsl.s, 0);
                expect(result.l).toBeCloseTo(color.hsl.l, 0);
            });
        });

        test('should handle achromatic colors (gray scale)', () => {
            const grayHsl = ColorConversions.rgbToHsl(128, 128, 128);
            expect(grayHsl.s).toBe(0); // No saturation for gray
            expect(grayHsl.l).toBe(50); // 50% lightness
        });

        test('should produce hue in 0-360 range', () => {
            const result = ColorConversions.rgbToHsl(255, 128, 64);
            expect(result.h).toBeGreaterThanOrEqual(0);
            expect(result.h).toBeLessThan(360);
        });

        test('should produce saturation and lightness in 0-100 range', () => {
            const result = ColorConversions.rgbToHsl(200, 100, 50);
            expect(result.s).toBeGreaterThanOrEqual(0);
            expect(result.s).toBeLessThanOrEqual(100);
            expect(result.l).toBeGreaterThanOrEqual(0);
            expect(result.l).toBeLessThanOrEqual(100);
        });
    });

    describe('hslToRgb', () => {
        test('should convert HSL to RGB correctly', () => {
            Object.entries(testColors).forEach(([name, color]) => {
                const { h, s, l } = color.hsl;
                const result = ColorConversions.hslToRgb(h, s, l);

                // Allow small rounding differences
                expect(result.r).toBeCloseTo(color.rgb.r, 0);
                expect(result.g).toBeCloseTo(color.rgb.g, 0);
                expect(result.b).toBeCloseTo(color.rgb.b, 0);
            });
        });

        test('should handle achromatic colors', () => {
            const result = ColorConversions.hslToRgb(0, 0, 50);
            expect(result.r).toBe(result.g);
            expect(result.g).toBe(result.b);
            expect(result.r).toBe(128);
        });

        test('should be inverse of rgbToHsl', () => {
            const originalRgb = { r: 200, g: 100, b: 50 };
            const hsl = ColorConversions.rgbToHsl(originalRgb.r, originalRgb.g, originalRgb.b);
            const convertedRgb = ColorConversions.hslToRgb(hsl.h, hsl.s, hsl.l);

            expect(convertedRgb.r).toBeCloseTo(originalRgb.r, 0);
            expect(convertedRgb.g).toBeCloseTo(originalRgb.g, 0);
            expect(convertedRgb.b).toBeCloseTo(originalRgb.b, 0);
        });

        test('should produce RGB values in 0-255 range', () => {
            const result = ColorConversions.hslToRgb(210, 75, 65);
            expect(result.r).toBeGreaterThanOrEqual(0);
            expect(result.r).toBeLessThanOrEqual(255);
            expect(result.g).toBeGreaterThanOrEqual(0);
            expect(result.g).toBeLessThanOrEqual(255);
            expect(result.b).toBeGreaterThanOrEqual(0);
            expect(result.b).toBeLessThanOrEqual(255);
        });
    });

    describe('getColorTemperature', () => {
        test('should classify warm colors correctly', () => {
            const red = ColorConversions.getColorTemperature({ r: 255, g: 100, b: 100 });
            expect(red.type).toBe('warm');
            expect(red.warmth).toBeGreaterThan(20);

            const orange = ColorConversions.getColorTemperature({ r: 255, g: 165, b: 0 });
            expect(orange.type).toBe('warm');
        });

        test('should classify cool colors correctly', () => {
            const blue = ColorConversions.getColorTemperature({ r: 100, g: 100, b: 255 });
            expect(blue.type).toBe('cool');
            expect(blue.warmth).toBeLessThan(-20);

            const cyan = ColorConversions.getColorTemperature({ r: 0, g: 255, b: 255 });
            expect(cyan.type).toBe('cool');
        });

        test('should classify neutral colors correctly', () => {
            const gray = ColorConversions.getColorTemperature({ r: 128, g: 128, b: 128 });
            expect(gray.type).toBe('neutral');
            expect(Math.abs(gray.warmth)).toBeLessThanOrEqual(20);

            const green = ColorConversions.getColorTemperature({ r: 100, g: 255, b: 100 });
            expect(green.type).toBe('neutral');
        });

        test('should include appropriate descriptions', () => {
            const warm = ColorConversions.getColorTemperature({ r: 255, g: 0, b: 0 });
            expect(warm.description).toContain('cozy');

            const cool = ColorConversions.getColorTemperature({ r: 0, g: 0, b: 255 });
            expect(cool.description).toContain('calm');

            const neutral = ColorConversions.getColorTemperature({ r: 128, g: 128, b: 128 });
            expect(neutral.description).toContain('balanced');
        });

        test('should calculate warmth value correctly', () => {
            const result = ColorConversions.getColorTemperature({ r: 200, g: 100, b: 50 });
            const expectedWarmth = Math.round((200 - 50) / 255 * 100);
            expect(result.warmth).toBe(expectedWarmth);
        });
    });

    describe('validateAndNormalize', () => {
        test('should validate and normalize hex colors', () => {
            const result = ColorConversions.validateAndNormalize('#FF0000');
            expect(result).not.toBeNull();
            expect(result.hex).toBe('#FF0000');
            expect(result.rgb).toEqual({ r: 255, g: 0, b: 0 });
            expect(result.lab).toBeDefined();
            expect(result.hsl).toBeDefined();
            expect(result.temperature).toBeDefined();
        });

        test('should handle hex colors without # prefix', () => {
            const result = ColorConversions.validateAndNormalize('FF0000');
            expect(result).not.toBeNull();
            expect(result.hex).toBe('#FF0000');
        });

        test('should validate RGB objects', () => {
            const result = ColorConversions.validateAndNormalize({ r: 255, g: 0, b: 0 });
            expect(result).not.toBeNull();
            expect(result.hex).toBe('#FF0000');
            expect(result.rgb).toEqual({ r: 255, g: 0, b: 0 });
        });

        test('should handle named colors', () => {
            const result = ColorConversions.validateAndNormalize('white');
            expect(result).not.toBeNull();
            expect(result.hex).toBe('#FFFFFF');

            const redResult = ColorConversions.validateAndNormalize('red');
            expect(redResult.hex).toBe('#FF0000');
        });

        test('should handle case-insensitive named colors', () => {
            const result = ColorConversions.validateAndNormalize('WHITE');
            expect(result).not.toBeNull();
            expect(result.hex).toBe('#FFFFFF');
        });

        test('should return null for invalid inputs', () => {
            expect(ColorConversions.validateAndNormalize('#GGG')).toBeNull();
            expect(ColorConversions.validateAndNormalize('invalid_color')).toBeNull();
            expect(ColorConversions.validateAndNormalize({ r: -10, g: 300, b: 'invalid' })).toBeNull();
            expect(ColorConversions.validateAndNormalize(null)).toBeNull();
            expect(ColorConversions.validateAndNormalize(undefined)).toBeNull();
            expect(ColorConversions.validateAndNormalize(123)).toBeNull();
        });

        test('should validate RGB range constraints', () => {
            expect(ColorConversions.validateAndNormalize({ r: -1, g: 0, b: 0 })).toBeNull();
            expect(ColorConversions.validateAndNormalize({ r: 256, g: 0, b: 0 })).toBeNull();
            expect(ColorConversions.validateAndNormalize({ r: 255, g: 255, b: 255.5 })).toBeNull();
        });

        test('should include all required properties in result', () => {
            const result = ColorConversions.validateAndNormalize('#808080');
            expect(result).toHaveProperty('hex');
            expect(result).toHaveProperty('rgb');
            expect(result).toHaveProperty('lab');
            expect(result).toHaveProperty('hsl');
            expect(result).toHaveProperty('temperature');

            expect(result.temperature).toHaveProperty('type');
            expect(result.temperature).toHaveProperty('warmth');
            expect(result.temperature).toHaveProperty('description');
        });
    });

    describe('Edge cases and error handling', () => {
        test('should handle extreme RGB values gracefully', () => {
            expect(() => ColorConversions.rgbToHex(0, 0, 0)).not.toThrow();
            expect(() => ColorConversions.rgbToHex(255, 255, 255)).not.toThrow();
            expect(() => ColorConversions.rgbToLab(0, 0, 0)).not.toThrow();
            expect(() => ColorConversions.rgbToLab(255, 255, 255)).not.toThrow();
        });

        test('should handle extreme HSL values gracefully', () => {
            expect(() => ColorConversions.hslToRgb(0, 0, 0)).not.toThrow();
            expect(() => ColorConversions.hslToRgb(359, 100, 100)).not.toThrow();
            expect(() => ColorConversions.hslToRgb(720, 200, 150)).not.toThrow(); // Should handle overflow
        });

        test('should maintain precision for color space conversions', () => {
            // Test roundtrip accuracy
            const originalHex = '#7F4080';
            const rgb = ColorConversions.hexToRgb(originalHex);
            const convertedHex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);
            expect(convertedHex).toBe(originalHex);
        });

        test('should handle scientific notation and floating points', () => {
            const result = ColorConversions.rgbToXyz(1e-10, 255, 128.5);
            expect(result).toBeDefined();
            expect(result.x).toBeGreaterThanOrEqual(0);
            expect(result.y).toBeGreaterThanOrEqual(0);
            expect(result.z).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Performance characteristics', () => {
        test('should handle batch color conversions efficiently', () => {
            const colors = Array.from({ length: 1000 }, (_, i) => `#${i.toString(16).padStart(6, '0')}`);

            const start = performance.now();
            colors.forEach(color => {
                if (ColorConversions.hexToRgb(color)) {
                    ColorConversions.hexToLab(color);
                }
            });
            const duration = performance.now() - start;

            // Should process 1000 colors in reasonable time (less than 1 second)
            expect(duration).toBeLessThan(1000);
        });

        test('should cache-friendly for repeated conversions', () => {
            const color = '#FF8040';

            const start1 = performance.now();
            for (let i = 0; i < 100; i++) {
                ColorConversions.hexToLab(color);
            }
            const duration1 = performance.now() - start1;

            // Should complete without significant slowdown
            expect(duration1).toBeLessThan(100);
        });
    });
});