/**
 * colorCalculationWorker.js - Web Worker for Heavy Color Calculations
 * Moves intensive color calculations to background thread to maintain UI responsiveness
 *
 * Supported Operations:
 * - Batch color conversions
 * - Delta E calculations for large datasets
 * - Color palette generation
 * - Spatial indexing operations
 */

// Import optimized calculation classes
importScripts('../utils/optimizedColorConversions.js');
importScripts('../utils/optimizedDeltaE.js');

class ColorCalculationWorker {
    constructor() {
        this.colorConverter = new OptimizedColorConversions();
        this.deltaE = new OptimizedDeltaE();

        // Warm up caches with common colors
        this.colorConverter.warmUpCache();

        // Performance tracking
        this.taskCount = 0;
        this.totalProcessingTime = 0;

        console.log('ColorCalculationWorker initialized');
    }

    /**
     * Process incoming messages from main thread
     */
    processMessage(event) {
        const { id, operation, data, options = {} } = event.data;
        const startTime = performance.now();

        try {
            let result;

            switch (operation) {
                case 'batchConvertColors':
                    result = this.batchConvertColors(data, options);
                    break;

                case 'calculateColorDistances':
                    result = this.calculateColorDistances(data, options);
                    break;

                case 'findNearestColors':
                    result = this.findNearestColors(data, options);
                    break;

                case 'generateHarmonicPalette':
                    result = this.generateHarmonicPalette(data, options);
                    break;

                case 'buildColorIndex':
                    result = this.buildColorIndex(data, options);
                    break;

                case 'calculateHarmonyScores':
                    result = this.calculateHarmonyScores(data, options);
                    break;

                case 'optimizeColorPalette':
                    result = this.optimizeColorPalette(data, options);
                    break;

                case 'getWorkerMetrics':
                    result = this.getWorkerMetrics();
                    break;

                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            const processingTime = performance.now() - startTime;
            this.updateMetrics(processingTime);

            // Send result back to main thread
            self.postMessage({
                id,
                success: true,
                result,
                metrics: {
                    processingTime: processingTime.toFixed(2),
                    operation
                }
            });

        } catch (error) {
            console.error('Worker error:', error);

            self.postMessage({
                id,
                success: false,
                error: error.message,
                metrics: {
                    processingTime: (performance.now() - startTime).toFixed(2),
                    operation
                }
            });
        }
    }

    /**
     * Batch convert colors between different formats
     */
    batchConvertColors(colors, options) {
        const { inputFormat = 'hex', outputFormat = 'lab', chunkSize = 1000 } = options;
        const results = [];

        // Process in chunks to allow for progress reporting
        for (let i = 0; i < colors.length; i += chunkSize) {
            const chunk = colors.slice(i, i + chunkSize);
            const chunkResults = chunk.map((color, index) => {
                try {
                    let convertedColor;

                    // Input conversion
                    let normalizedColor = color;
                    if (inputFormat === 'hex') {
                        normalizedColor = this.colorConverter.validateAndNormalize(color);
                    } else if (inputFormat === 'rgb') {
                        normalizedColor = this.colorConverter.validateAndNormalize(color);
                    }

                    if (!normalizedColor) {
                        return {
                            originalIndex: i + index,
                            error: 'Invalid color format',
                            originalColor: color
                        };
                    }

                    // Output conversion
                    switch (outputFormat) {
                        case 'lab':
                            convertedColor = normalizedColor.lab;
                            break;
                        case 'hsl':
                            convertedColor = normalizedColor.hsl;
                            break;
                        case 'rgb':
                            convertedColor = normalizedColor.rgb;
                            break;
                        case 'hex':
                            convertedColor = normalizedColor.hex;
                            break;
                        case 'all':
                            convertedColor = normalizedColor;
                            break;
                        default:
                            convertedColor = normalizedColor.lab;
                    }

                    return {
                        originalIndex: i + index,
                        originalColor: color,
                        convertedColor,
                        temperature: normalizedColor.temperature
                    };

                } catch (error) {
                    return {
                        originalIndex: i + index,
                        error: error.message,
                        originalColor: color
                    };
                }
            });

            results.push(...chunkResults);

            // Report progress for large batches
            if (colors.length > 5000 && i % (chunkSize * 10) === 0) {
                self.postMessage({
                    type: 'progress',
                    operation: 'batchConvertColors',
                    completed: Math.min(i + chunkSize, colors.length),
                    total: colors.length,
                    percentage: Math.round((Math.min(i + chunkSize, colors.length) / colors.length) * 100)
                });
            }
        }

        return {
            results,
            totalProcessed: colors.length,
            successCount: results.filter(r => !r.error).length,
            errorCount: results.filter(r => r.error).length
        };
    }

    /**
     * Calculate color distances for all pairs in a dataset
     */
    calculateColorDistances(data, options) {
        const { colors, algorithm = 'ciede2000', symmetric = true } = data;
        const { includeMatrix = false, topK = null } = options;

        // Convert colors to LAB if needed
        const labColors = colors.map(color => {
            if (color.lab) return color.lab;

            const normalized = this.colorConverter.validateAndNormalize(color);
            return normalized ? normalized.lab : null;
        }).filter(lab => lab !== null);

        if (labColors.length === 0) {
            throw new Error('No valid colors provided for distance calculation');
        }

        // Use optimized batch calculation
        const distanceMatrix = this.deltaE.batchCalculateDistances(labColors, algorithm);

        const results = {
            colorCount: labColors.length,
            algorithm,
            averageDistance: 0,
            minDistance: Infinity,
            maxDistance: 0,
            calculations: labColors.length * labColors.length
        };

        // Calculate statistics
        let totalDistance = 0;
        let validDistances = 0;

        for (let i = 0; i < labColors.length; i++) {
            for (let j = symmetric ? i + 1 : 0; j < labColors.length; j++) {
                if (i === j && !symmetric) continue;

                const distance = distanceMatrix[i * labColors.length + j];
                totalDistance += distance;
                validDistances++;

                if (distance < results.minDistance) results.minDistance = distance;
                if (distance > results.maxDistance) results.maxDistance = distance;
            }
        }

        results.averageDistance = totalDistance / validDistances;

        // Include distance matrix if requested
        if (includeMatrix) {
            results.distanceMatrix = Array.from(distanceMatrix);
        }

        // Find top K pairs if requested
        if (topK && topK > 0) {
            const pairs = [];

            for (let i = 0; i < labColors.length; i++) {
                for (let j = i + 1; j < labColors.length; j++) {
                    pairs.push({
                        index1: i,
                        index2: j,
                        distance: distanceMatrix[i * labColors.length + j],
                        color1: colors[i],
                        color2: colors[j]
                    });
                }
            }

            pairs.sort((a, b) => a.distance - b.distance);
            results.topPairs = pairs.slice(0, topK);
        }

        return results;
    }

    /**
     * Find nearest colors using spatial indexing
     */
    findNearestColors(data, options) {
        const { targetColors, candidateColors, k = 5, algorithm = 'ciede2000' } = data;
        const { buildIndex = true, includeDistances = true } = options;

        // Convert colors to LAB and prepare candidate set
        const candidatesWithLab = candidateColors.map((color, index) => {
            const normalized = this.colorConverter.validateAndNormalize(color);
            return normalized ? {
                ...color,
                originalIndex: index,
                lab: normalized.lab,
                rgb: normalized.rgb,
                hex: normalized.hex
            } : null;
        }).filter(c => c !== null);

        if (candidatesWithLab.length === 0) {
            throw new Error('No valid candidate colors provided');
        }

        // Build spatial index for fast searches
        if (buildIndex) {
            this.deltaE.buildSpatialIndex(candidatesWithLab);
        }

        const results = [];

        for (const targetColor of targetColors) {
            const targetNormalized = this.colorConverter.validateAndNormalize(targetColor);
            if (!targetNormalized) {
                results.push({
                    targetColor,
                    error: 'Invalid target color format',
                    matches: []
                });
                continue;
            }

            try {
                let matches;

                if (buildIndex && this.deltaE.spatialIndex) {
                    // Use spatial index for fast search
                    matches = this.deltaE.findKNearestNeighbors(targetNormalized.lab, k, algorithm);
                } else {
                    // Brute force search
                    const distances = candidatesWithLab.map(candidate => ({
                        ...candidate,
                        distance: this.deltaE[algorithm](targetNormalized.lab, candidate.lab)
                    }));

                    distances.sort((a, b) => a.distance - b.distance);
                    matches = distances.slice(0, k);
                }

                // Add perceptual difference information
                matches.forEach(match => {
                    match.perceptual = this.getPerceptualDifference(match.distance);
                });

                results.push({
                    targetColor,
                    targetLab: targetNormalized.lab,
                    matches: includeDistances ? matches : matches.map(m => {
                        const { distance, perceptual, ...rest } = m;
                        return rest;
                    })
                });

            } catch (error) {
                results.push({
                    targetColor,
                    error: error.message,
                    matches: []
                });
            }
        }

        return {
            results,
            totalTargets: targetColors.length,
            totalCandidates: candidatesWithLab.length,
            algorithm,
            spatialIndexUsed: buildIndex
        };
    }

    /**
     * Generate harmonic color palettes
     */
    generateHarmonicPalette(data, options) {
        const { baseColor, paletteSize = 5, harmonyType = 'analogous' } = data;
        const { includeMetadata = true, temperatureRange = 'any' } = options;

        const baseNormalized = this.colorConverter.validateAndNormalize(baseColor);
        if (!baseNormalized) {
            throw new Error('Invalid base color format');
        }

        const palette = [];
        const baseHsl = baseNormalized.hsl;

        switch (harmonyType) {
            case 'analogous':
                palette.push(...this.generateAnalogousPalette(baseHsl, paletteSize));
                break;
            case 'complementary':
                palette.push(...this.generateComplementaryPalette(baseHsl, paletteSize));
                break;
            case 'triadic':
                palette.push(...this.generateTriadicPalette(baseHsl, paletteSize));
                break;
            case 'tetradic':
                palette.push(...this.generateTetradicPalette(baseHsl, paletteSize));
                break;
            case 'monochromatic':
                palette.push(...this.generateMonochromaticPalette(baseHsl, paletteSize));
                break;
            default:
                throw new Error(`Unknown harmony type: ${harmonyType}`);
        }

        // Convert palette to multiple formats
        const enhancedPalette = palette.map((hsl, index) => {
            const rgb = this.colorConverter.hslToRgb(hsl.h, hsl.s, hsl.l);
            const hex = this.colorConverter.rgbToHex(rgb.r, rgb.g, rgb.b);
            const lab = this.colorConverter.rgbToLab(rgb.r, rgb.g, rgb.b);
            const temperature = this.colorConverter.getColorTemperature(rgb);

            const color = {
                index,
                hex,
                rgb,
                hsl,
                lab,
                temperature
            };

            if (includeMetadata) {
                color.metadata = {
                    role: index === 0 ? 'base' : 'harmony',
                    harmonyType,
                    hueRelation: this.getHueRelation(baseHsl.h, hsl.h),
                    lightnessLevel: this.getLightnessLevel(hsl.l),
                    saturationLevel: this.getSaturationLevel(hsl.s)
                };
            }

            return color;
        });

        // Calculate harmony score
        const harmonyScore = this.deltaE.calculateHarmonyScore(enhancedPalette.map(c => c.lab));

        return {
            baseColor: baseNormalized,
            harmonyType,
            palette: enhancedPalette,
            harmonyScore,
            paletteSize: enhancedPalette.length
        };
    }

    /**
     * Build spatial color index for fast searches
     */
    buildColorIndex(data, options) {
        const { colors } = data;
        const { includeMetadata = false } = options;

        // Prepare colors with LAB values
        const processedColors = colors.map((color, index) => {
            const normalized = this.colorConverter.validateAndNormalize(color);
            return normalized ? {
                originalIndex: index,
                originalColor: color,
                ...normalized
            } : null;
        }).filter(c => c !== null);

        if (processedColors.length === 0) {
            throw new Error('No valid colors provided for indexing');
        }

        // Build spatial index
        this.deltaE.buildSpatialIndex(processedColors);

        const result = {
            indexSize: processedColors.length,
            indexType: 'kd-tree',
            searchOptimization: 'enabled'
        };

        if (includeMetadata) {
            result.metadata = {
                colorSpaceStatistics: this.calculateColorSpaceStatistics(processedColors),
                temperatureDistribution: this.calculateTemperatureDistribution(processedColors),
                lightnessDistribution: this.calculateLightnessDistribution(processedColors)
            };
        }

        return result;
    }

    /**
     * Calculate harmony scores for multiple color combinations
     */
    calculateHarmonyScores(data, options) {
        const { colorCombinations } = data;
        const { algorithm = 'ciede2000', includeDetails = false } = options;

        const results = colorCombinations.map((combination, index) => {
            try {
                // Convert colors to LAB
                const labColors = combination.map(color => {
                    const normalized = this.colorConverter.validateAndNormalize(color);
                    return normalized ? normalized.lab : null;
                }).filter(lab => lab !== null);

                if (labColors.length < 2) {
                    return {
                        index,
                        error: 'Insufficient valid colors for harmony calculation',
                        colors: combination
                    };
                }

                const harmonyScore = this.deltaE.calculateHarmonyScore(labColors);

                const result = {
                    index,
                    colors: combination,
                    harmonyScore: harmonyScore.score,
                    harmonyType: harmonyScore.type,
                    averageDistance: harmonyScore.averageDistance
                };

                if (includeDetails) {
                    result.details = harmonyScore;
                    result.labColors = labColors;
                }

                return result;

            } catch (error) {
                return {
                    index,
                    error: error.message,
                    colors: combination
                };
            }
        });

        // Sort by harmony score (descending)
        const validResults = results.filter(r => !r.error);
        validResults.sort((a, b) => b.harmonyScore - a.harmonyScore);

        return {
            results: validResults,
            totalCombinations: colorCombinations.length,
            validCombinations: validResults.length,
            algorithm,
            bestHarmony: validResults[0] || null,
            averageHarmonyScore: validResults.length > 0
                ? validResults.reduce((sum, r) => sum + r.harmonyScore, 0) / validResults.length
                : 0
        };
    }

    /**
     * Optimize color palette by adjusting colors for better harmony
     */
    optimizeColorPalette(data, options) {
        const { colors, targetHarmonyScore = 80, maxIterations = 100 } = data;
        const { preserveBaseColor = false, adjustmentStrength = 0.1 } = options;

        let currentPalette = colors.map(color => {
            const normalized = this.colorConverter.validateAndNormalize(color);
            if (!normalized) throw new Error(`Invalid color: ${color}`);
            return normalized;
        });

        let currentScore = this.deltaE.calculateHarmonyScore(currentPalette.map(c => c.lab)).score;
        let iterations = 0;

        const history = [{
            iteration: 0,
            score: currentScore,
            palette: currentPalette.map(c => c.hex)
        }];

        while (currentScore < targetHarmonyScore && iterations < maxIterations) {
            // Try small adjustments to each color (except base if preserved)
            const startIndex = preserveBaseColor ? 1 : 0;

            for (let i = startIndex; i < currentPalette.length; i++) {
                const originalHsl = currentPalette[i].hsl;

                // Try small adjustments in hue, saturation, and lightness
                const adjustments = [
                    { h: adjustmentStrength * 360, s: 0, l: 0 },
                    { h: -adjustmentStrength * 360, s: 0, l: 0 },
                    { h: 0, s: adjustmentStrength * 100, l: 0 },
                    { h: 0, s: -adjustmentStrength * 100, l: 0 },
                    { h: 0, s: 0, l: adjustmentStrength * 100 },
                    { h: 0, s: 0, l: -adjustmentStrength * 100 }
                ];

                let bestAdjustment = null;
                let bestScore = currentScore;

                for (const adj of adjustments) {
                    const newHsl = {
                        h: Math.max(0, Math.min(360, originalHsl.h + adj.h)),
                        s: Math.max(0, Math.min(100, originalHsl.s + adj.s)),
                        l: Math.max(0, Math.min(100, originalHsl.l + adj.l))
                    };

                    const newRgb = this.colorConverter.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                    const newLab = this.colorConverter.rgbToLab(newRgb.r, newRgb.g, newRgb.b);

                    // Create test palette
                    const testPalette = [...currentPalette];
                    testPalette[i] = {
                        ...testPalette[i],
                        hsl: newHsl,
                        rgb: newRgb,
                        lab: newLab,
                        hex: this.colorConverter.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
                    };

                    const testScore = this.deltaE.calculateHarmonyScore(testPalette.map(c => c.lab)).score;

                    if (testScore > bestScore) {
                        bestScore = testScore;
                        bestAdjustment = { index: i, color: testPalette[i] };
                    }
                }

                // Apply best adjustment if found
                if (bestAdjustment) {
                    currentPalette[bestAdjustment.index] = bestAdjustment.color;
                    currentScore = bestScore;
                }
            }

            iterations++;

            // Record progress
            if (iterations % 10 === 0) {
                history.push({
                    iteration: iterations,
                    score: currentScore,
                    palette: currentPalette.map(c => c.hex)
                });
            }
        }

        return {
            originalPalette: colors,
            optimizedPalette: currentPalette.map(c => c.hex),
            originalScore: history[0].score,
            finalScore: currentScore,
            improvement: currentScore - history[0].score,
            iterations,
            converged: currentScore >= targetHarmonyScore,
            history
        };
    }

    // Helper methods for palette generation

    generateAnalogousPalette(baseHsl, size) {
        const palette = [baseHsl];
        const step = 30; // degrees

        for (let i = 1; i < size; i++) {
            const hue = (baseHsl.h + (i * step)) % 360;
            palette.push({
                h: hue,
                s: Math.max(10, baseHsl.s - (i * 5)), // Gradually reduce saturation
                l: baseHsl.l
            });
        }

        return palette;
    }

    generateComplementaryPalette(baseHsl, size) {
        const palette = [baseHsl];
        const complement = (baseHsl.h + 180) % 360;

        if (size >= 2) {
            palette.push({ h: complement, s: baseHsl.s, l: baseHsl.l });
        }

        // Add split-complementary colors
        for (let i = 2; i < size; i++) {
            const offset = (i - 1) * 30;
            const hue = (complement + offset) % 360;
            palette.push({
                h: hue,
                s: Math.max(20, baseHsl.s - (i * 10)),
                l: baseHsl.l
            });
        }

        return palette;
    }

    generateTriadicPalette(baseHsl, size) {
        const palette = [baseHsl];
        const angles = [120, 240];

        for (let i = 0; i < Math.min(angles.length, size - 1); i++) {
            const hue = (baseHsl.h + angles[i]) % 360;
            palette.push({
                h: hue,
                s: baseHsl.s,
                l: baseHsl.l
            });
        }

        // Fill remaining with variations
        while (palette.length < size) {
            const baseIndex = (palette.length - 1) % 3;
            const base = palette[baseIndex];
            palette.push({
                h: base.h,
                s: Math.max(10, base.s - 20),
                l: Math.min(90, base.l + 20)
            });
        }

        return palette;
    }

    generateTetradicPalette(baseHsl, size) {
        const palette = [baseHsl];
        const angles = [90, 180, 270];

        for (let i = 0; i < Math.min(angles.length, size - 1); i++) {
            const hue = (baseHsl.h + angles[i]) % 360;
            palette.push({
                h: hue,
                s: baseHsl.s,
                l: baseHsl.l
            });
        }

        // Fill remaining with tints and shades
        while (palette.length < size) {
            const baseIndex = (palette.length - 1) % 4;
            const base = palette[baseIndex];
            const lightnessVar = (palette.length % 2 === 0) ? 20 : -20;
            palette.push({
                h: base.h,
                s: Math.max(10, base.s - 10),
                l: Math.max(10, Math.min(90, base.l + lightnessVar))
            });
        }

        return palette;
    }

    generateMonochromaticPalette(baseHsl, size) {
        const palette = [baseHsl];
        const lightnessStep = 80 / (size - 1);

        for (let i = 1; i < size; i++) {
            palette.push({
                h: baseHsl.h,
                s: baseHsl.s,
                l: Math.max(10, Math.min(90, 20 + (i * lightnessStep)))
            });
        }

        return palette;
    }

    // Utility methods

    getPerceptualDifference(deltaE) {
        if (deltaE < 1) {
            return { level: 'imperceptible', description: 'Colors are virtually identical' };
        } else if (deltaE < 2) {
            return { level: 'barely_perceptible', description: 'Very slight difference' };
        } else if (deltaE < 3.5) {
            return { level: 'perceptible', description: 'Noticeable but close match' };
        } else if (deltaE < 5) {
            return { level: 'well_perceptible', description: 'Clear difference but acceptable' };
        } else if (deltaE < 10) {
            return { level: 'significant', description: 'Significant color difference' };
        } else {
            return { level: 'very_significant', description: 'Very different colors' };
        }
    }

    getHueRelation(baseHue, targetHue) {
        const diff = Math.abs(baseHue - targetHue);
        const minDiff = Math.min(diff, 360 - diff);

        if (minDiff < 30) return 'analogous';
        if (minDiff > 150 && minDiff < 210) return 'complementary';
        if (minDiff > 90 && minDiff < 150) return 'triadic';
        return 'custom';
    }

    getLightnessLevel(lightness) {
        if (lightness < 20) return 'very_dark';
        if (lightness < 40) return 'dark';
        if (lightness < 60) return 'medium';
        if (lightness < 80) return 'light';
        return 'very_light';
    }

    getSaturationLevel(saturation) {
        if (saturation < 20) return 'muted';
        if (saturation < 40) return 'moderate';
        if (saturation < 70) return 'vibrant';
        return 'intense';
    }

    calculateColorSpaceStatistics(colors) {
        const labs = colors.map(c => c.lab);

        return {
            lightness: {
                min: Math.min(...labs.map(l => l.l)),
                max: Math.max(...labs.map(l => l.l)),
                avg: labs.reduce((sum, l) => sum + l.l, 0) / labs.length
            },
            chromaA: {
                min: Math.min(...labs.map(l => l.a)),
                max: Math.max(...labs.map(l => l.a)),
                avg: labs.reduce((sum, l) => sum + l.a, 0) / labs.length
            },
            chromaB: {
                min: Math.min(...labs.map(l => l.b)),
                max: Math.max(...labs.map(l => l.b)),
                avg: labs.reduce((sum, l) => sum + l.b, 0) / labs.length
            }
        };
    }

    calculateTemperatureDistribution(colors) {
        const temperatures = colors.map(c => c.temperature.type);
        const distribution = {};

        temperatures.forEach(temp => {
            distribution[temp] = (distribution[temp] || 0) + 1;
        });

        return distribution;
    }

    calculateLightnessDistribution(colors) {
        const lightness = colors.map(c => c.hsl.l);
        const bins = { dark: 0, medium: 0, light: 0 };

        lightness.forEach(l => {
            if (l < 33) bins.dark++;
            else if (l < 66) bins.medium++;
            else bins.light++;
        });

        return bins;
    }

    updateMetrics(processingTime) {
        this.taskCount++;
        this.totalProcessingTime += processingTime;
    }

    getWorkerMetrics() {
        return {
            taskCount: this.taskCount,
            totalProcessingTime: this.totalProcessingTime.toFixed(2),
            averageTaskTime: this.taskCount > 0
                ? (this.totalProcessingTime / this.taskCount).toFixed(2)
                : 0,
            colorConverterMetrics: this.colorConverter.getMetrics(),
            deltaEMetrics: this.deltaE.getMetrics()
        };
    }
}

// Initialize worker
const worker = new ColorCalculationWorker();

// Listen for messages from main thread
self.onmessage = (event) => {
    worker.processMessage(event);
};