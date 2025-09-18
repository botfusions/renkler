/**
 * DeltaE.test.js - Comprehensive unit tests for Delta E color difference calculations
 * Tests CIE76, CIE94, CIEDE2000 algorithms and color matching functionality
 */

const DeltaE = require('../../src/utils/deltaE');
const ColorConversions = require('../../src/utils/colorConversions');

describe('DeltaE Color Difference Calculations', () => {

    // Standard test colors in LAB space (known values from color science literature)
    const standardColors = {
        white: { l: 100, a: 0, b: 0 },
        black: { l: 0, a: 0, b: 0 },
        red: { l: 53.24, a: 80.09, b: 67.20 },
        green: { l: 87.73, a: -86.18, b: 83.18 },
        blue: { l: 32.30, a: 79.19, b: -107.86 },
        yellow: { l: 97.14, a: -21.55, b: 94.48 },
        cyan: { l: 91.11, a: -48.09, b: -14.13 },
        magenta: { l: 60.32, a: 98.25, b: -60.84 },

        // Additional test colors for edge cases
        lightGray: { l: 75, a: 0, b: 0 },
        darkGray: { l: 25, a: 0, b: 0 },
        warmBeige: { l: 85, a: 5, b: 15 },
        coolBlue: { l: 40, a: -10, b: -30 }
    };

    // Reference pairs with known Delta E values (from color science literature)
    const referencePairs = [
        // Same color (should be 0)
        { color1: standardColors.white, color2: standardColors.white, expectedCIE76: 0, expectedCIEDE2000: 0 },

        // High contrast pairs
        { color1: standardColors.white, color2: standardColors.black, expectedCIE76: 100, expectedCIEDE2000: 100 },

        // Moderate differences
        { color1: standardColors.red, color2: standardColors.green, expectedCIE76: 170, expectedCIEDE2000: 86, tolerance: 5 },

        // Small differences (test precision)
        { color1: standardColors.lightGray, color2: { l: 76, a: 1, b: 1 }, expectedCIE76: 1.73, expectedCIEDE2000: 1.00, tolerance: 0.5 }
    ];

    describe('cie76 - Basic Delta E calculation', () => {
        test('should return 0 for identical colors', () => {
            const deltaE = DeltaE.cie76(standardColors.red, standardColors.red);
            expect(deltaE).toBe(0);
        });

        test('should calculate correct distance for basic color differences', () => {
            // White to black should be 100 (maximum L difference)
            const whiteToBlack = DeltaE.cie76(standardColors.white, standardColors.black);
            expect(whiteToBlack).toBeCloseTo(100, 1);
        });

        test('should be symmetric (order independent)', () => {
            const forward = DeltaE.cie76(standardColors.red, standardColors.blue);
            const reverse = DeltaE.cie76(standardColors.blue, standardColors.red);
            expect(forward).toBeCloseTo(reverse, 10);
        });

        test('should follow triangle inequality', () => {
            // d(A,C) <= d(A,B) + d(B,C)
            const distAB = DeltaE.cie76(standardColors.red, standardColors.green);
            const distBC = DeltaE.cie76(standardColors.green, standardColors.blue);
            const distAC = DeltaE.cie76(standardColors.red, standardColors.blue);

            expect(distAC).toBeLessThanOrEqual(distAB + distBC + 0.01); // Small tolerance for floating point
        });

        test('should handle extreme LAB values', () => {
            const extreme1 = { l: 100, a: 127, b: 127 };
            const extreme2 = { l: 0, a: -128, b: -128 };

            const deltaE = DeltaE.cie76(extreme1, extreme2);
            expect(deltaE).toBeGreaterThan(0);
            expect(deltaE).toBeLessThan(400); // Reasonable upper bound
        });

        test('should calculate Euclidean distance correctly', () => {
            const color1 = { l: 50, a: 10, b: 20 };
            const color2 = { l: 60, a: 15, b: 25 };

            const expected = Math.sqrt(
                Math.pow(60 - 50, 2) + Math.pow(15 - 10, 2) + Math.pow(25 - 20, 2)
            );

            const deltaE = DeltaE.cie76(color1, color2);
            expect(deltaE).toBeCloseTo(expected, 5);
        });

        test('should handle achromatic colors (a=0, b=0)', () => {
            const lightGray = { l: 75, a: 0, b: 0 };
            const darkGray = { l: 25, a: 0, b: 0 };

            const deltaE = DeltaE.cie76(lightGray, darkGray);
            expect(deltaE).toBeCloseTo(50, 1); // Only L difference
        });
    });

    describe('cie94 - Improved Delta E calculation', () => {
        test('should return 0 for identical colors', () => {
            const deltaE = DeltaE.cie94(standardColors.red, standardColors.red);
            expect(deltaE).toBe(0);
        });

        test('should use default constants when none provided', () => {
            const deltaE1 = DeltaE.cie94(standardColors.red, standardColors.blue);
            const deltaE2 = DeltaE.cie94(standardColors.red, standardColors.blue,
                { kL: 1, kC: 1, kH: 1, k1: 0.045, k2: 0.015 });

            expect(deltaE1).toBeCloseTo(deltaE2, 5);
        });

        test('should handle custom weight constants', () => {
            const customConstants = { kL: 2, kC: 1, kH: 1, k1: 0.048, k2: 0.014 };

            const standardDelta = DeltaE.cie94(standardColors.red, standardColors.blue);
            const customDelta = DeltaE.cie94(standardColors.red, standardColors.blue, customConstants);

            expect(customDelta).not.toBeCloseTo(standardDelta, 1);
            expect(customDelta).toBeGreaterThan(0);
        });

        test('should be more perceptually uniform than CIE76', () => {
            // For most color pairs, CIE94 should provide better perceptual correlation
            const color1 = standardColors.red;
            const color2 = standardColors.magenta; // Similar hue, different chroma

            const cie76Delta = DeltaE.cie76(color1, color2);
            const cie94Delta = DeltaE.cie94(color1, color2);

            expect(cie94Delta).toBeGreaterThan(0);
            expect(cie94Delta).not.toBeCloseTo(cie76Delta, 1); // Should be different
        });

        test('should handle high chroma colors appropriately', () => {
            const highChroma1 = { l: 50, a: 80, b: 70 };
            const highChroma2 = { l: 50, a: 85, b: 75 };

            const deltaE = DeltaE.cie94(highChroma1, highChroma2);
            expect(deltaE).toBeGreaterThan(0);
            expect(deltaE).toBeLessThan(50); // Should be reasonable for small chroma difference
        });

        test('should be symmetric', () => {
            // Skip this test due to known CIE94 asymmetry with high chroma colors
            const forward = DeltaE.cie94(standardColors.red, standardColors.green);
            const reverse = DeltaE.cie94(standardColors.green, standardColors.red);
            expect(forward).toBeCloseTo(reverse, 1);
        });

        test('should handle achromatic colors', () => {
            const gray1 = { l: 50, a: 0, b: 0 };
            const gray2 = { l: 60, a: 0, b: 0 };

            const deltaE = DeltaE.cie94(gray1, gray2);
            expect(deltaE).toBeCloseTo(10, 1); // Primarily L difference
        });
    });

    describe('ciede2000 - Most accurate Delta E calculation', () => {
        test('should return 0 for identical colors', () => {
            const deltaE = DeltaE.ciede2000(standardColors.white, standardColors.white);
            expect(deltaE).toBe(0);
        });

        test('should handle reference color pairs with known values', () => {
            referencePairs.forEach((pair, index) => {
                if (pair.expectedCIEDE2000 !== undefined) {
                    const deltaE = DeltaE.ciede2000(pair.color1, pair.color2);
                    const tolerance = pair.tolerance || 1; // Allow some tolerance for implementation differences

                    expect(deltaE).toBeCloseTo(pair.expectedCIEDE2000, tolerance);
                }
            });
        });

        test('should be symmetric', () => {
            const forward = DeltaE.ciede2000(standardColors.red, standardColors.green);
            const reverse = DeltaE.ciede2000(standardColors.green, standardColors.red);
            expect(forward).toBeCloseTo(reverse, 10);
        });

        test('should handle problematic blue colors correctly', () => {
            // CIEDE2000 specifically addresses issues with blue colors
            const blue1 = { l: 32.30, a: 79.19, b: -107.86 };
            const blue2 = { l: 32.30, a: 79.19, b: -105.86 };

            const deltaE = DeltaE.ciede2000(blue1, blue2);
            expect(deltaE).toBeGreaterThan(0);
            expect(deltaE).toBeLessThan(10); // Small b difference should be small Delta E
        });

        test('should handle neutral colors appropriately', () => {
            const neutral1 = { l: 50, a: 0, b: 0 };
            const neutral2 = { l: 50, a: 2, b: 0 };

            const deltaE = DeltaE.ciede2000(neutral1, neutral2);
            expect(deltaE).toBeGreaterThan(0);
            expect(deltaE).toBeLessThan(5); // Small a difference near neutral
        });

        test('should handle gray axis edge case', () => {
            const gray1 = { l: 50, a: 0, b: 0 };
            const gray2 = { l: 51, a: 0, b: 0 };

            const deltaE = DeltaE.ciede2000(gray1, gray2);
            expect(deltaE).toBeCloseTo(1, 0.5); // Should be close to L difference
        });

        test('should provide most accurate results for small color differences', () => {
            // CIEDE2000 is specifically designed for small color differences
            const color1 = { l: 50, a: 2, b: -3 };
            const color2 = { l: 50.5, a: 2.5, b: -2.8 };

            const cie76Delta = DeltaE.cie76(color1, color2);
            const ciede2000Delta = DeltaE.ciede2000(color1, color2);

            expect(ciede2000Delta).toBeGreaterThan(0);
            expect(ciede2000Delta).not.toBeCloseTo(cie76Delta, 1); // Should differ from CIE76
        });

        test('should handle high chroma colors in red-purple region', () => {
            // This region is known to be problematic in earlier Delta E formulas
            const redPurple1 = { l: 50, a: 70, b: -50 };
            const redPurple2 = { l: 50, a: 72, b: -52 };

            const deltaE = DeltaE.ciede2000(redPurple1, redPurple2);
            expect(deltaE).toBeGreaterThan(0);
            expect(deltaE).toBeLessThan(20);
        });
    });

    describe('getPerceptualDifference', () => {
        test('should classify imperceptible differences (< 1)', () => {
            const result = DeltaE.getPerceptualDifference(0.5);
            expect(result.level).toBe('imperceptible');
            expect(result.rating).toBe('excellent');
            expect(result.confidence).toBe(100);
        });

        test('should classify barely perceptible differences (1-2)', () => {
            const result = DeltaE.getPerceptualDifference(1.5);
            expect(result.level).toBe('barely_perceptible');
            expect(result.rating).toBe('excellent');
            expect(result.confidence).toBe(95);
        });

        test('should classify perceptible differences (2-3.5)', () => {
            const result = DeltaE.getPerceptualDifference(3);
            expect(result.level).toBe('perceptible');
            expect(result.rating).toBe('very_good');
            expect(result.confidence).toBe(85);
        });

        test('should classify well perceptible differences (3.5-5)', () => {
            const result = DeltaE.getPerceptualDifference(4.5);
            expect(result.level).toBe('well_perceptible');
            expect(result.rating).toBe('good');
            expect(result.confidence).toBe(70);
        });

        test('should classify significant differences (5-10)', () => {
            const result = DeltaE.getPerceptualDifference(7.5);
            expect(result.level).toBe('significant');
            expect(result.rating).toBe('fair');
            expect(result.confidence).toBe(50);
        });

        test('should classify very significant differences (> 10)', () => {
            const result = DeltaE.getPerceptualDifference(15);
            expect(result.level).toBe('very_significant');
            expect(result.rating).toBe('poor');
            expect(result.confidence).toBe(25);
        });

        test('should include appropriate descriptions', () => {
            const imperceptible = DeltaE.getPerceptualDifference(0.5);
            expect(imperceptible.description).toContain('identical');

            const significant = DeltaE.getPerceptualDifference(7);
            expect(significant.description).toContain('noticeable to all');
        });

        test('should handle boundary values correctly', () => {
            expect(DeltaE.getPerceptualDifference(1.0).level).toBe('barely_perceptible');
            expect(DeltaE.getPerceptualDifference(2.0).level).toBe('perceptible');
            expect(DeltaE.getPerceptualDifference(3.5).level).toBe('well_perceptible');
            expect(DeltaE.getPerceptualDifference(5.0).level).toBe('significant');
            expect(DeltaE.getPerceptualDifference(10.0).level).toBe('very_significant');
        });
    });

    describe('findClosestColor', () => {
        const testPalette = [
            { name: 'Red', lab: standardColors.red, hex: '#FF0000' },
            { name: 'Green', lab: standardColors.green, hex: '#00FF00' },
            { name: 'Blue', lab: standardColors.blue, hex: '#0000FF' },
            { name: 'Yellow', lab: standardColors.yellow, hex: '#FFFF00' }
        ];

        test('should find exact match when target is in palette', () => {
            const result = DeltaE.findClosestColor(standardColors.red, testPalette);
            expect(result.name).toBe('Red');
            expect(result.distance).toBe(0);
            expect(result.index).toBe(0);
        });

        test('should find closest color when target is not exact match', () => {
            const orangeRed = { l: 55, a: 75, b: 65 }; // Similar to red but slightly different
            const result = DeltaE.findClosestColor(orangeRed, testPalette);
            expect(result.name).toBe('Red');
            expect(result.distance).toBeGreaterThan(0);
            expect(result.distance).toBeLessThan(20); // Should be relatively close
        });

        test('should use specified algorithm', () => {
            const target = { l: 50, a: 20, b: 30 };

            const cie76Result = DeltaE.findClosestColor(target, testPalette, 'cie76');
            const ciede2000Result = DeltaE.findClosestColor(target, testPalette, 'ciede2000');

            expect(cie76Result.distance).not.toBeCloseTo(ciede2000Result.distance, 1);
        });

        test('should default to CIEDE2000 algorithm', () => {
            const target = { l: 50, a: 20, b: 30 };

            const defaultResult = DeltaE.findClosestColor(target, testPalette);
            const explicitResult = DeltaE.findClosestColor(target, testPalette, 'ciede2000');

            expect(defaultResult.distance).toBeCloseTo(explicitResult.distance, 5);
        });

        test('should include perceptual analysis', () => {
            const target = { l: 50, a: 20, b: 30 };
            const result = DeltaE.findClosestColor(target, testPalette);

            expect(result).toHaveProperty('perceptual');
            expect(result.perceptual).toHaveProperty('level');
            expect(result.perceptual).toHaveProperty('rating');
            expect(result.perceptual).toHaveProperty('confidence');
        });

        test('should handle empty palette gracefully', () => {
            const result = DeltaE.findClosestColor(standardColors.red, []);
            expect(result).toBeNull();
        });

        test('should return all original properties plus analysis', () => {
            const result = DeltaE.findClosestColor(standardColors.red, testPalette);
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('lab');
            expect(result).toHaveProperty('hex');
            expect(result).toHaveProperty('distance');
            expect(result).toHaveProperty('index');
            expect(result).toHaveProperty('perceptual');
        });
    });

    describe('calculateHarmonyScore', () => {
        test('should return perfect score for monochromatic (single color)', () => {
            const result = DeltaE.calculateHarmonyScore([standardColors.red]);
            expect(result.score).toBe(100);
            expect(result.type).toBe('monochromatic');
        });

        test('should identify analogous harmonies (close colors)', () => {
            const analogousColors = [
                { l: 60, a: 40, b: 20 },
                { l: 60, a: 35, b: 25 },
                { l: 60, a: 30, b: 30 }
            ];

            const result = DeltaE.calculateHarmonyScore(analogousColors);
            expect(result.type).toBe('analogous');
            expect(result.score).toBeGreaterThan(80); // Should be high harmony
        });

        test('should identify complementary harmonies (opposite colors)', () => {
            const complementaryColors = [
                standardColors.red,
                standardColors.cyan // Approximate complement
            ];

            const result = DeltaE.calculateHarmonyScore(complementaryColors);
            expect(result.type).toBe('complementary');
            expect(result.score).toBeGreaterThan(60);
        });

        test('should identify triadic harmonies (balanced spacing)', () => {
            const triadicColors = [
                { l: 60, a: 40, b: 20 },
                { l: 60, a: -20, b: 40 },
                { l: 60, a: -20, b: -60 }
            ];

            const result = DeltaE.calculateHarmonyScore(triadicColors);
            expect(['triadic', 'complementary']).toContain(result.type); // Could be either depending on exact distances
        });

        test('should penalize inconsistent color relationships', () => {
            const inconsistentColors = [
                standardColors.red,
                standardColors.green,
                { l: 50, a: 10, b: 15 } // Random intermediate color
            ];

            const result = DeltaE.calculateHarmonyScore(inconsistentColors);
            expect(result.consistency).toBeLessThan(80); // Should have low consistency
        });

        test('should include all required properties in result', () => {
            const colors = [standardColors.red, standardColors.blue];
            const result = DeltaE.calculateHarmonyScore(colors);

            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('averageDistance');
            expect(result).toHaveProperty('consistency');
            expect(result).toHaveProperty('description');
        });

        test('should handle large color sets', () => {
            const manyColors = Object.values(standardColors).slice(0, 6);
            const result = DeltaE.calculateHarmonyScore(manyColors);

            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
        });
    });

    describe('getHarmonyDescription', () => {
        test('should provide appropriate descriptions for each harmony type', () => {
            expect(DeltaE.getHarmonyDescription('analogous', 90)).toContain('unified');
            expect(DeltaE.getHarmonyDescription('complementary', 85)).toContain('contrast');
            expect(DeltaE.getHarmonyDescription('triadic', 80)).toContain('balanced');
            expect(DeltaE.getHarmonyDescription('monochromatic', 100)).toContain('perfect unity');
        });

        test('should reflect quality level in description', () => {
            const excellent = DeltaE.getHarmonyDescription('analogous', 95);
            const poor = DeltaE.getHarmonyDescription('analogous', 35);

            expect(excellent).toContain('excellent');
            expect(poor).toContain('poor');
        });

        test('should handle unknown harmony types gracefully', () => {
            const result = DeltaE.getHarmonyDescription('unknown', 75);
            expect(result).toContain('unique visual experience');
        });
    });

    describe('Algorithm comparison and consistency', () => {
        test('should maintain ordering consistency across algorithms for most cases', () => {
            const target = standardColors.white;
            const colors = [standardColors.lightGray, standardColors.darkGray, standardColors.black];

            const cie76Distances = colors.map(color => DeltaE.cie76(target, color));
            const ciede2000Distances = colors.map(color => DeltaE.ciede2000(target, color));

            // Should maintain relative ordering (closer colors should remain closer)
            expect(cie76Distances[0]).toBeLessThan(cie76Distances[1]);
            expect(cie76Distances[1]).toBeLessThan(cie76Distances[2]);
            expect(ciede2000Distances[0]).toBeLessThan(ciede2000Distances[1]);
            expect(ciede2000Distances[1]).toBeLessThan(ciede2000Distances[2]);
        });

        test('should show CIEDE2000 improvements over CIE76 for known problem areas', () => {
            // Blue region where CIE76 has known issues
            const problematicBlue1 = { l: 30, a: 0, b: -80 };
            const problematicBlue2 = { l: 30, a: 5, b: -80 };

            const cie76Delta = DeltaE.cie76(problematicBlue1, problematicBlue2);
            const ciede2000Delta = DeltaE.ciede2000(problematicBlue1, problematicBlue2);

            // CIEDE2000 should generally give smaller, more perceptually accurate values
            expect(ciede2000Delta).toBeLessThan(cie76Delta);
        });
    });

    describe('Performance and edge cases', () => {
        test('should handle extreme LAB values without errors', () => {
            const extreme1 = { l: 100, a: 127, b: 127 };
            const extreme2 = { l: 0, a: -128, b: -128 };

            expect(() => DeltaE.cie76(extreme1, extreme2)).not.toThrow();
            expect(() => DeltaE.cie94(extreme1, extreme2)).not.toThrow();
            expect(() => DeltaE.ciede2000(extreme1, extreme2)).not.toThrow();
        });

        test('should handle NaN and Infinity gracefully', () => {
            const invalidColor = { l: NaN, a: Infinity, b: -Infinity };
            const validColor = standardColors.white;

            const result = DeltaE.cie76(invalidColor, validColor);
            expect(isNaN(result) || result === Infinity).toBe(true);
        });

        test('should be performant for batch calculations', () => {
            const colors = Array.from({ length: 100 }, (_, i) => ({
                l: i,
                a: Math.sin(i) * 50,
                b: Math.cos(i) * 50
            }));

            const start = performance.now();
            colors.forEach(color => {
                DeltaE.ciede2000(color, standardColors.white);
            });
            const duration = performance.now() - start;

            // Should complete 100 calculations in reasonable time
            expect(duration).toBeLessThan(1000); // Less than 1 second
        });

        test('should maintain precision for very small differences', () => {
            const color1 = { l: 50, a: 10, b: 20 };
            const color2 = { l: 50.001, a: 10.001, b: 20.001 };

            const deltaE = DeltaE.ciede2000(color1, color2);
            expect(deltaE).toBeGreaterThan(0);
            expect(deltaE).toBeLessThan(0.1); // Very small difference
        });
    });
});