/**
 * OptimizedDeltaE.js - High-Performance Color Difference Calculations
 * Implements optimized Delta E algorithms with lookup tables and spatial indexing
 *
 * Performance Features:
 * - Pre-computed trigonometric lookup tables
 * - KD-tree spatial indexing for nearest neighbor search
 * - Vectorized batch calculations
 * - Early termination optimizations
 * - Memory-efficient data structures
 */

class OptimizedDeltaE {
    constructor() {
        this.cache = new Map();
        this.cacheSize = 5000;
        this.spatialIndex = null;

        // Performance metrics
        this.metrics = {
            calculationsPerformed: 0,
            totalTime: 0,
            cacheHitRate: 0,
            spatialSearches: 0
        };

        // Initialize optimization tables
        this.initializeLookupTables();

        console.log('OptimizedDeltaE initialized with advanced optimizations');
    }

    /**
     * Initialize pre-computed lookup tables for trigonometric functions
     */
    initializeLookupTables() {
        // Pre-compute common trigonometric values for CIEDE2000
        this.cosTable = new Float32Array(3600); // 0.1 degree precision
        this.sinTable = new Float32Array(3600);

        for (let i = 0; i < 3600; i++) {
            const angle = (i / 10) * Math.PI / 180; // Convert to radians
            this.cosTable[i] = Math.cos(angle);
            this.sinTable[i] = Math.sin(angle);
        }

        // Pre-compute power values for CIEDE2000 calculations
        this.pow25_7 = Math.pow(25, 7);

        // Pre-compute square root lookup table for distances up to 400 (Delta E range)
        this.sqrtTable = new Float32Array(40000); // 0.01 precision
        for (let i = 0; i < 40000; i++) {
            this.sqrtTable[i] = Math.sqrt(i / 100);
        }

        console.log('Lookup tables initialized for trigonometric optimizations');
    }

    /**
     * Fast cosine lookup with linear interpolation
     */
    fastCos(degrees) {
        const index = Math.abs(degrees % 360) * 10;
        const baseIndex = Math.floor(index);
        const fraction = index - baseIndex;

        if (baseIndex >= 3599) return this.cosTable[0];

        return this.cosTable[baseIndex] +
               fraction * (this.cosTable[baseIndex + 1] - this.cosTable[baseIndex]);
    }

    /**
     * Fast sine lookup with linear interpolation
     */
    fastSin(degrees) {
        const index = Math.abs(degrees % 360) * 10;
        const baseIndex = Math.floor(index);
        const fraction = index - baseIndex;

        if (baseIndex >= 3599) return this.sinTable[0];

        return this.sinTable[baseIndex] +
               fraction * (this.sinTable[baseIndex + 1] - this.sinTable[baseIndex]);
    }

    /**
     * Fast square root using lookup table
     */
    fastSqrt(value) {
        if (value <= 0) return 0;
        if (value >= 400) return Math.sqrt(value);

        const index = Math.floor(value * 100);
        const fraction = (value * 100) - index;

        if (index >= 39999) return Math.sqrt(value);

        return this.sqrtTable[index] +
               fraction * (this.sqrtTable[index + 1] - this.sqrtTable[index]);
    }

    /**
     * Optimized CIE76 Delta E calculation
     */
    cie76(lab1, lab2) {
        const startTime = performance.now();

        const key = `cie76:${lab1.l.toFixed(2)},${lab1.a.toFixed(2)},${lab1.b.toFixed(2)}-${lab2.l.toFixed(2)},${lab2.a.toFixed(2)},${lab2.b.toFixed(2)}`;

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;

        const distanceSquared = deltaL * deltaL + deltaA * deltaA + deltaB * deltaB;
        const result = this.fastSqrt(distanceSquared);

        // Cache result
        this.cacheResult(key, result);

        // Update metrics
        this.updateMetrics(performance.now() - startTime);

        return result;
    }

    /**
     * Optimized CIE94 Delta E calculation
     */
    cie94(lab1, lab2, constants = { kL: 1, kC: 1, kH: 1, k1: 0.045, k2: 0.015 }) {
        const startTime = performance.now();

        const key = `cie94:${lab1.l.toFixed(2)},${lab1.a.toFixed(2)},${lab1.b.toFixed(2)}-${lab2.l.toFixed(2)},${lab2.a.toFixed(2)},${lab2.b.toFixed(2)}`;

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const { kL, kC, kH, k1, k2 } = constants;

        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;

        // Pre-compute chroma values
        const c1Squared = lab1.a * lab1.a + lab1.b * lab1.b;
        const c2Squared = lab2.a * lab2.a + lab2.b * lab2.b;
        const c1 = this.fastSqrt(c1Squared);
        const c2 = this.fastSqrt(c2Squared);
        const deltaC = c1 - c2;

        // Calculate Delta H using optimized formula
        const deltaHSquared = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        const deltaH = deltaHSquared > 0 ? this.fastSqrt(deltaHSquared) : 0;

        // Weighting functions
        const sl = 1.0;
        const sc = 1.0 + k1 * c1;
        const sh = 1.0 + k2 * c1;

        // Final calculation
        const term1 = deltaL / (kL * sl);
        const term2 = deltaC / (kC * sc);
        const term3 = deltaH / (kH * sh);

        const result = this.fastSqrt(term1 * term1 + term2 * term2 + term3 * term3);

        // Cache result
        this.cacheResult(key, result);

        // Update metrics
        this.updateMetrics(performance.now() - startTime);

        return result;
    }

    /**
     * Highly optimized CIEDE2000 Delta E calculation with lookup tables
     */
    ciede2000(lab1, lab2) {
        const startTime = performance.now();

        const key = `ciede2000:${lab1.l.toFixed(2)},${lab1.a.toFixed(2)},${lab1.b.toFixed(2)}-${lab2.l.toFixed(2)},${lab2.a.toFixed(2)},${lab2.b.toFixed(2)}`;

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const { l: l1, a: a1, b: b1 } = lab1;
        const { l: l2, a: a2, b: b2 } = lab2;

        // Calculate Chroma and mean Chroma
        const c1Squared = a1 * a1 + b1 * b1;
        const c2Squared = a2 * a2 + b2 * b2;
        const c1 = this.fastSqrt(c1Squared);
        const c2 = this.fastSqrt(c2Squared);
        const cMean = (c1 + c2) * 0.5;

        // Calculate G factor (optimized)
        const cMean7 = Math.pow(cMean, 7);
        const g = 0.5 * (1 - this.fastSqrt(cMean7 / (cMean7 + this.pow25_7)));

        // Calculate a' values
        const a1Prime = (1 + g) * a1;
        const a2Prime = (1 + g) * a2;

        // Calculate C' values
        const c1Prime = this.fastSqrt(a1Prime * a1Prime + b1 * b1);
        const c2Prime = this.fastSqrt(a2Prime * a2Prime + b2 * b2);

        // Calculate h' values using fast atan2 approximation
        let h1Prime = this.fastAtan2(b1, a1Prime) * 180 / Math.PI;
        let h2Prime = this.fastAtan2(b2, a2Prime) * 180 / Math.PI;

        if (h1Prime < 0) h1Prime += 360;
        if (h2Prime < 0) h2Prime += 360;

        // Calculate deltas
        const deltaLPrime = l2 - l1;
        const deltaCPrime = c2Prime - c1Prime;

        // Calculate Delta H' (optimized)
        let deltaHPrime;
        if (c1Prime * c2Prime === 0) {
            deltaHPrime = 0;
        } else {
            const hueDiff = h2Prime - h1Prime;
            if (Math.abs(hueDiff) <= 180) {
                deltaHPrime = hueDiff;
            } else if (hueDiff > 180) {
                deltaHPrime = hueDiff - 360;
            } else {
                deltaHPrime = hueDiff + 360;
            }
        }

        const deltaHPrimeRadians = 2 * this.fastSqrt(c1Prime * c2Prime) *
                                   this.fastSin(deltaHPrime * 0.5);

        // Calculate means
        const lMean = (l1 + l2) * 0.5;
        const cPrimeMean = (c1Prime + c2Prime) * 0.5;

        let hPrimeMean;
        if (c1Prime * c2Prime === 0) {
            hPrimeMean = h1Prime + h2Prime;
        } else {
            const hueDiffAbs = Math.abs(h1Prime - h2Prime);
            if (hueDiffAbs <= 180) {
                hPrimeMean = (h1Prime + h2Prime) * 0.5;
            } else if (hueDiffAbs > 180 && (h1Prime + h2Prime) < 360) {
                hPrimeMean = (h1Prime + h2Prime + 360) * 0.5;
            } else {
                hPrimeMean = (h1Prime + h2Prime - 360) * 0.5;
            }
        }

        // Calculate T using fast trigonometric functions
        const t = 1 - 0.17 * this.fastCos(hPrimeMean - 30) +
                     0.24 * this.fastCos(2 * hPrimeMean) +
                     0.32 * this.fastCos(3 * hPrimeMean + 6) -
                     0.20 * this.fastCos(4 * hPrimeMean - 63);

        // Calculate delta Theta
        const deltaTheta = 30 * Math.exp(-Math.pow((hPrimeMean - 275) / 25, 2));

        // Calculate RC
        const cPrimeMean7 = Math.pow(cPrimeMean, 7);
        const rc = 2 * this.fastSqrt(cPrimeMean7 / (cPrimeMean7 + this.pow25_7));

        // Calculate weighting functions
        const lMeanMinusFiftySquared = (lMean - 50) * (lMean - 50);
        const sl = 1 + (0.015 * lMeanMinusFiftySquared) / this.fastSqrt(20 + lMeanMinusFiftySquared);
        const sc = 1 + 0.045 * cPrimeMean;
        const sh = 1 + 0.015 * cPrimeMean * t;
        const rt = -this.fastSin(2 * deltaTheta) * rc;

        // Final Delta E 2000 calculation
        const kL = 1, kC = 1, kH = 1;

        const term1 = deltaLPrime / (kL * sl);
        const term2 = deltaCPrime / (kC * sc);
        const term3 = deltaHPrimeRadians / (kH * sh);
        const rtTerm = rt * term2 * term3;

        const result = this.fastSqrt(term1 * term1 + term2 * term2 + term3 * term3 + rtTerm);

        // Cache result
        this.cacheResult(key, result);

        // Update metrics
        this.updateMetrics(performance.now() - startTime);

        return result;
    }

    /**
     * Fast atan2 approximation for hue calculations
     */
    fastAtan2(y, x) {
        if (x === 0 && y === 0) return 0;

        const abs_y = Math.abs(y);
        const abs_x = Math.abs(x);

        let angle;
        if (abs_x >= abs_y) {
            angle = Math.atan(y / x);
            if (x < 0) {
                angle = y >= 0 ? angle + Math.PI : angle - Math.PI;
            }
        } else {
            angle = Math.PI * 0.5 - Math.atan(x / y);
            if (y < 0) {
                angle -= Math.PI;
            }
        }

        return angle;
    }

    /**
     * Batch Delta E calculations for multiple color pairs
     */
    batchCalculateDistances(labColors, algorithm = 'ciede2000') {
        const startTime = performance.now();
        const distances = new Float32Array(labColors.length * labColors.length);

        const calculateFn = this.getCalculationFunction(algorithm);

        // Symmetric matrix calculation - only compute upper triangle
        for (let i = 0; i < labColors.length; i++) {
            for (let j = i; j < labColors.length; j++) {
                const distance = i === j ? 0 : calculateFn(labColors[i], labColors[j]);

                // Fill symmetric positions
                distances[i * labColors.length + j] = distance;
                distances[j * labColors.length + i] = distance;
            }
        }

        this.updateMetrics(performance.now() - startTime);

        return distances;
    }

    /**
     * Build spatial index for fast nearest neighbor search
     */
    buildSpatialIndex(colors) {
        const startTime = performance.now();

        // Create KD-tree for 3D LAB space
        this.spatialIndex = this.buildKDTree(colors, 0);

        console.log(`Spatial index built with ${colors.length} colors in ${(performance.now() - startTime).toFixed(2)}ms`);

        return this.spatialIndex;
    }

    /**
     * Build KD-tree for spatial indexing
     */
    buildKDTree(colors, depth) {
        if (colors.length === 0) return null;
        if (colors.length === 1) return { color: colors[0], left: null, right: null };

        const axis = depth % 3; // 0=L, 1=a, 2=b
        const axisKey = ['l', 'a', 'b'][axis];

        // Sort colors by current axis
        colors.sort((a, b) => a.lab[axisKey] - b.lab[axisKey]);

        const median = Math.floor(colors.length / 2);

        return {
            color: colors[median],
            left: this.buildKDTree(colors.slice(0, median), depth + 1),
            right: this.buildKDTree(colors.slice(median + 1), depth + 1),
            axis: axis
        };
    }

    /**
     * Fast nearest neighbor search using spatial index
     */
    findNearestNeighbor(targetLab, algorithm = 'ciede2000') {
        if (!this.spatialIndex) {
            throw new Error('Spatial index not built. Call buildSpatialIndex first.');
        }

        const startTime = performance.now();
        this.metrics.spatialSearches++;

        const calculateFn = this.getCalculationFunction(algorithm);
        let bestMatch = null;
        let bestDistance = Infinity;

        const searchKDTree = (node, depth) => {
            if (!node) return;

            const distance = calculateFn(targetLab, node.color.lab);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = { ...node.color, distance };
            }

            const axis = depth % 3;
            const axisKey = ['l', 'a', 'b'][axis];
            const targetValue = targetLab[axisKey];
            const nodeValue = node.color.lab[axisKey];

            // Determine which side to search first
            const diff = targetValue - nodeValue;
            const primarySide = diff < 0 ? node.left : node.right;
            const secondarySide = diff < 0 ? node.right : node.left;

            // Search primary side
            searchKDTree(primarySide, depth + 1);

            // Search secondary side only if it could contain a closer point
            if (Math.abs(diff) < bestDistance) {
                searchKDTree(secondarySide, depth + 1);
            }
        };

        searchKDTree(this.spatialIndex, 0);

        this.updateMetrics(performance.now() - startTime);

        return bestMatch;
    }

    /**
     * Find K nearest neighbors using spatial index
     */
    findKNearestNeighbors(targetLab, k, algorithm = 'ciede2000') {
        if (!this.spatialIndex) {
            throw new Error('Spatial index not built. Call buildSpatialIndex first.');
        }

        const startTime = performance.now();
        const calculateFn = this.getCalculationFunction(algorithm);
        const results = [];

        const searchKDTree = (node, depth) => {
            if (!node) return;

            const distance = calculateFn(targetLab, node.color.lab);
            const candidate = { ...node.color, distance };

            // Add to results
            if (results.length < k) {
                results.push(candidate);
                results.sort((a, b) => a.distance - b.distance);
            } else if (distance < results[k - 1].distance) {
                results[k - 1] = candidate;
                results.sort((a, b) => a.distance - b.distance);
            }

            const axis = depth % 3;
            const axisKey = ['l', 'a', 'b'][axis];
            const targetValue = targetLab[axisKey];
            const nodeValue = node.color.lab[axisKey];

            const diff = targetValue - nodeValue;
            const primarySide = diff < 0 ? node.left : node.right;
            const secondarySide = diff < 0 ? node.right : node.left;

            searchKDTree(primarySide, depth + 1);

            // Search secondary side if it could contain better results
            const worstBestDistance = results.length < k ? Infinity : results[k - 1].distance;
            if (Math.abs(diff) < worstBestDistance) {
                searchKDTree(secondarySide, depth + 1);
            }
        };

        searchKDTree(this.spatialIndex, 0);
        this.updateMetrics(performance.now() - startTime);

        return results.slice(0, k);
    }

    /**
     * Optimized color harmony score calculation
     */
    calculateHarmonyScore(colors) {
        if (colors.length < 2) {
            return { score: 100, type: 'monochromatic', description: 'Single color harmony' };
        }

        const startTime = performance.now();

        // Use batch calculation for efficiency
        const distances = this.batchCalculateDistances(colors, 'ciede2000');
        const colorCount = colors.length;

        let totalDistance = 0;
        let comparisons = 0;
        const distanceArray = [];

        // Extract upper triangle distances
        for (let i = 0; i < colorCount; i++) {
            for (let j = i + 1; j < colorCount; j++) {
                const distance = distances[i * colorCount + j];
                distanceArray.push(distance);
                totalDistance += distance;
                comparisons++;
            }
        }

        const averageDistance = totalDistance / comparisons;

        // Calculate variance efficiently
        let sumSquaredDiffs = 0;
        for (const distance of distanceArray) {
            const diff = distance - averageDistance;
            sumSquaredDiffs += diff * diff;
        }
        const distanceVariance = sumSquaredDiffs / distanceArray.length;

        // Determine harmony type and score
        let harmonyType, harmonyScore;
        if (averageDistance < 5) {
            harmonyType = 'analogous';
            harmonyScore = Math.max(0, 100 - averageDistance * 10);
        } else if (averageDistance > 40) {
            harmonyType = 'complementary';
            harmonyScore = Math.max(0, 100 - Math.abs(averageDistance - 50) * 2);
        } else {
            harmonyType = 'triadic';
            harmonyScore = Math.max(0, 100 - Math.abs(averageDistance - 25) * 3);
        }

        // Consistency bonus
        const consistencyBonus = Math.max(0, 20 - distanceVariance);
        harmonyScore = Math.min(100, harmonyScore + consistencyBonus);

        this.updateMetrics(performance.now() - startTime);

        return {
            score: Math.round(harmonyScore),
            type: harmonyType,
            averageDistance: Math.round(averageDistance * 100) / 100,
            consistency: Math.round((20 - distanceVariance) * 5),
            description: this.getHarmonyDescription(harmonyType, harmonyScore)
        };
    }

    /**
     * Get appropriate calculation function
     */
    getCalculationFunction(algorithm) {
        switch (algorithm) {
            case 'cie76': return this.cie76.bind(this);
            case 'cie94': return this.cie94.bind(this);
            case 'ciede2000': return this.ciede2000.bind(this);
            default: return this.ciede2000.bind(this);
        }
    }

    /**
     * Cache management
     */
    cacheResult(key, result) {
        if (this.cache.size >= this.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, result);
    }

    /**
     * Update performance metrics
     */
    updateMetrics(executionTime) {
        this.metrics.calculationsPerformed++;
        this.metrics.totalTime += executionTime;

        const cacheHits = this.cache.size;
        const totalAccesses = this.metrics.calculationsPerformed;
        this.metrics.cacheHitRate = cacheHits / totalAccesses;
    }

    /**
     * Get harmony description
     */
    getHarmonyDescription(type, score) {
        const quality = score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor';

        const descriptions = {
            analogous: `Colors are closely related and create a ${quality} unified, harmonious feeling`,
            complementary: `Colors provide ${quality} contrast and visual excitement`,
            triadic: `Colors offer ${quality} balanced variety and visual interest`,
            monochromatic: 'Single color provides perfect unity'
        };

        return descriptions[type] || 'Color relationship creates a unique visual experience';
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheSize: this.cache.size,
            maxCacheSize: this.cacheSize,
            averageCalculationTime: this.metrics.calculationsPerformed > 0
                ? this.metrics.totalTime / this.metrics.calculationsPerformed
                : 0,
            spatialIndexBuilt: this.spatialIndex !== null
        };
    }

    /**
     * Clear cache and reset metrics
     */
    clearCache() {
        this.cache.clear();
        this.metrics = {
            calculationsPerformed: 0,
            totalTime: 0,
            cacheHitRate: 0,
            spatialSearches: 0
        };
        console.log('OptimizedDeltaE cache cleared');
    }

    /**
     * Benchmark different algorithms
     */
    benchmark(testColors, iterations = 1000) {
        const algorithms = ['cie76', 'cie94', 'ciede2000'];
        const results = {};

        console.log(`Starting benchmark with ${testColors.length} colors, ${iterations} iterations each`);

        algorithms.forEach(algorithm => {
            const startTime = performance.now();
            const calculateFn = this.getCalculationFunction(algorithm);

            for (let i = 0; i < iterations; i++) {
                const color1 = testColors[i % testColors.length];
                const color2 = testColors[(i + 1) % testColors.length];
                calculateFn(color1, color2);
            }

            const totalTime = performance.now() - startTime;
            results[algorithm] = {
                totalTime: totalTime.toFixed(2),
                averageTime: (totalTime / iterations).toFixed(4),
                calculationsPerSecond: Math.round(iterations / (totalTime / 1000))
            };
        });

        console.log('Benchmark results:', results);
        return results;
    }
}

module.exports = OptimizedDeltaE;