/**
 * wasmLoader.js - WebAssembly Module Loader and Interface
 * Provides high-level JavaScript interface to WebAssembly color calculations
 */

class WasmColorMath {
    constructor() {
        this.wasmModule = null;
        this.wasmMemory = null;
        this.isReady = false;
        this.loadPromise = null;

        // Performance metrics
        this.metrics = {
            wasmCalls: 0,
            totalWasmTime: 0,
            fallbackCalls: 0,
            totalFallbackTime: 0
        };

        console.log('WasmColorMath initializing...');
    }

    /**
     * Initialize WebAssembly module
     */
    async init() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.loadWasm();
        return this.loadPromise;
    }

    /**
     * Load and compile WebAssembly module
     */
    async loadWasm() {
        try {
            // Check WebAssembly support
            if (typeof WebAssembly === 'undefined') {
                console.warn('WebAssembly not supported, falling back to JavaScript');
                return false;
            }

            // Create shared memory
            this.wasmMemory = new WebAssembly.Memory({
                initial: 256, // 256 pages = 16MB
                maximum: 1024, // 1024 pages = 64MB
                shared: false
            });

            // Import object for WebAssembly module
            const importObject = {
                env: {
                    memory: this.wasmMemory
                },
                Math: {
                    pow: Math.pow,
                    sqrt: Math.sqrt,
                    atan2: Math.atan2,
                    cos: Math.cos,
                    sin: Math.sin,
                    exp: Math.exp
                }
            };

            let wasmModule;

            try {
                // Try to load compiled .wasm file first
                const response = await fetch('./wasm/colorMath.wasm');
                if (response.ok) {
                    const wasmBytes = await response.arrayBuffer();
                    wasmModule = await WebAssembly.instantiate(wasmBytes, importObject);
                } else {
                    throw new Error('WASM file not found, compiling from WAT');
                }
            } catch (error) {
                console.log('Compiling WASM from source:', error.message);
                // Fallback to compiling from WAT source
                wasmModule = await this.compileFromWat(importObject);
            }

            this.wasmModule = wasmModule.instance;
            this.isReady = true;

            console.log('WebAssembly color math module loaded successfully');

            // Test the module with a simple calculation
            await this.runSelfTest();

            return true;

        } catch (error) {
            console.error('Failed to load WebAssembly module:', error);
            this.isReady = false;
            return false;
        }
    }

    /**
     * Compile WebAssembly from WAT source (fallback)
     */
    async compileFromWat(importObject) {
        try {
            // Load WAT source
            const response = await fetch('./wasm/colorMath.wat');
            const watSource = await response.text();

            // Note: This requires a WAT-to-WASM compiler in the browser
            // In practice, you'd pre-compile the WASM file
            throw new Error('WAT compilation not implemented - please provide compiled WASM file');

        } catch (error) {
            console.error('WAT compilation failed:', error);
            throw error;
        }
    }

    /**
     * Run self-test to verify WASM functionality
     */
    async runSelfTest() {
        if (!this.isReady) return false;

        try {
            // Test RGB to LAB conversion
            const testRgb = [255, 0, 0]; // Red
            const result = this.rgbToLab(testRgb);

            // Expected LAB values for red (approximate)
            const expectedL = 53.2;
            const tolerance = 2.0;

            if (Math.abs(result.l - expectedL) < tolerance) {
                console.log('WASM self-test passed');
                return true;
            } else {
                console.warn('WASM self-test failed - results may be inaccurate');
                return false;
            }

        } catch (error) {
            console.error('WASM self-test failed:', error);
            return false;
        }
    }

    /**
     * Write RGB values to WASM memory
     */
    writeRgbToMemory(rgb, offset = 0) {
        const memory = new Float64Array(this.wasmMemory.buffer);
        const baseIndex = offset / 8; // 8 bytes per f64

        memory[baseIndex] = rgb.r || rgb[0];
        memory[baseIndex + 1] = rgb.g || rgb[1];
        memory[baseIndex + 2] = rgb.b || rgb[2];

        return offset;
    }

    /**
     * Write LAB values to WASM memory
     */
    writeLabToMemory(lab, offset = 0) {
        const memory = new Float64Array(this.wasmMemory.buffer);
        const baseIndex = offset / 8;

        memory[baseIndex] = lab.l || lab[0];
        memory[baseIndex + 1] = lab.a || lab[1];
        memory[baseIndex + 2] = lab.b || lab[2];

        return offset;
    }

    /**
     * Read LAB values from WASM memory
     */
    readLabFromMemory(offset = 0) {
        const memory = new Float64Array(this.wasmMemory.buffer);
        const baseIndex = offset / 8;

        return {
            l: memory[baseIndex],
            a: memory[baseIndex + 1],
            b: memory[baseIndex + 2]
        };
    }

    /**
     * Convert RGB to LAB using WebAssembly
     */
    rgbToLab(rgb) {
        if (!this.isReady) {
            return this.fallbackRgbToLab(rgb);
        }

        const startTime = performance.now();

        try {
            const rgbOffset = 0;
            const labOffset = 24; // 24 bytes after RGB

            // Write RGB to memory
            this.writeRgbToMemory(rgb, rgbOffset);

            // Call WASM function
            this.wasmModule.exports.rgb_to_lab(rgbOffset, labOffset);

            // Read result
            const result = this.readLabFromMemory(labOffset);

            // Update metrics
            this.metrics.wasmCalls++;
            this.metrics.totalWasmTime += (performance.now() - startTime);

            return result;

        } catch (error) {
            console.error('WASM RGB to LAB conversion failed:', error);
            return this.fallbackRgbToLab(rgb);
        }
    }

    /**
     * Calculate Delta E CIE76 using WebAssembly
     */
    deltaECie76(lab1, lab2) {
        if (!this.isReady) {
            return this.fallbackDeltaECie76(lab1, lab2);
        }

        const startTime = performance.now();

        try {
            const lab1Offset = 0;
            const lab2Offset = 24;

            // Write LAB values to memory
            this.writeLabToMemory(lab1, lab1Offset);
            this.writeLabToMemory(lab2, lab2Offset);

            // Call WASM function
            const result = this.wasmModule.exports.delta_e_cie76(lab1Offset, lab2Offset);

            // Update metrics
            this.metrics.wasmCalls++;
            this.metrics.totalWasmTime += (performance.now() - startTime);

            return result;

        } catch (error) {
            console.error('WASM Delta E calculation failed:', error);
            return this.fallbackDeltaECie76(lab1, lab2);
        }
    }

    /**
     * Calculate Delta E CIE94 using WebAssembly
     */
    deltaECie94(lab1, lab2) {
        if (!this.isReady) {
            return this.fallbackDeltaECie94(lab1, lab2);
        }

        const startTime = performance.now();

        try {
            const lab1Offset = 0;
            const lab2Offset = 24;

            this.writeLabToMemory(lab1, lab1Offset);
            this.writeLabToMemory(lab2, lab2Offset);

            const result = this.wasmModule.exports.delta_e_cie94(lab1Offset, lab2Offset);

            this.metrics.wasmCalls++;
            this.metrics.totalWasmTime += (performance.now() - startTime);

            return result;

        } catch (error) {
            console.error('WASM CIE94 calculation failed:', error);
            return this.fallbackDeltaECie94(lab1, lab2);
        }
    }

    /**
     * Batch convert RGB colors to LAB using WebAssembly
     */
    batchRgbToLab(rgbArray) {
        if (!this.isReady) {
            return this.fallbackBatchRgbToLab(rgbArray);
        }

        const startTime = performance.now();

        try {
            const colorCount = rgbArray.length;
            const rgbOffset = 0;
            const labOffset = colorCount * 24; // 24 bytes per color

            // Write all RGB values to memory
            const memory = new Float64Array(this.wasmMemory.buffer);
            for (let i = 0; i < colorCount; i++) {
                const baseIndex = (rgbOffset + i * 24) / 8;
                const rgb = rgbArray[i];

                memory[baseIndex] = rgb.r || rgb[0];
                memory[baseIndex + 1] = rgb.g || rgb[1];
                memory[baseIndex + 2] = rgb.b || rgb[2];
            }

            // Call batch conversion function
            this.wasmModule.exports.batch_rgb_to_lab(rgbOffset, labOffset, colorCount);

            // Read results
            const results = [];
            for (let i = 0; i < colorCount; i++) {
                const baseIndex = (labOffset + i * 24) / 8;
                results.push({
                    l: memory[baseIndex],
                    a: memory[baseIndex + 1],
                    b: memory[baseIndex + 2]
                });
            }

            this.metrics.wasmCalls++;
            this.metrics.totalWasmTime += (performance.now() - startTime);

            return results;

        } catch (error) {
            console.error('WASM batch conversion failed:', error);
            return this.fallbackBatchRgbToLab(rgbArray);
        }
    }

    /**
     * Calculate distance matrix using WebAssembly
     */
    calculateDistanceMatrix(labArray) {
        if (!this.isReady) {
            return this.fallbackCalculateDistanceMatrix(labArray);
        }

        const startTime = performance.now();

        try {
            const colorCount = labArray.length;
            const labOffset = 0;
            const distancesOffset = colorCount * 24; // After LAB data

            // Write LAB values to memory
            const memory = new Float64Array(this.wasmMemory.buffer);
            for (let i = 0; i < colorCount; i++) {
                const baseIndex = (labOffset + i * 24) / 8;
                const lab = labArray[i];

                memory[baseIndex] = lab.l;
                memory[baseIndex + 1] = lab.a;
                memory[baseIndex + 2] = lab.b;
            }

            // Call batch distance calculation
            this.wasmModule.exports.batch_delta_e_matrix(labOffset, colorCount, distancesOffset);

            // Read distance matrix
            const distances = new Float64Array(this.wasmMemory.buffer, distancesOffset, colorCount * colorCount);

            this.metrics.wasmCalls++;
            this.metrics.totalWasmTime += (performance.now() - startTime);

            return Array.from(distances);

        } catch (error) {
            console.error('WASM distance matrix calculation failed:', error);
            return this.fallbackCalculateDistanceMatrix(labArray);
        }
    }

    /**
     * Find nearest color using WebAssembly
     */
    findNearestColor(targetLab, candidatesLab) {
        if (!this.isReady) {
            return this.fallbackFindNearestColor(targetLab, candidatesLab);
        }

        const startTime = performance.now();

        try {
            const candidateCount = candidatesLab.length;
            const targetOffset = 0;
            const candidatesOffset = 24;

            // Write target LAB to memory
            this.writeLabToMemory(targetLab, targetOffset);

            // Write candidate LAB values
            const memory = new Float64Array(this.wasmMemory.buffer);
            for (let i = 0; i < candidateCount; i++) {
                const baseIndex = (candidatesOffset + i * 24) / 8;
                const lab = candidatesLab[i];

                memory[baseIndex] = lab.l;
                memory[baseIndex + 1] = lab.a;
                memory[baseIndex + 2] = lab.b;
            }

            // Call nearest color search
            const nearestIndex = this.wasmModule.exports.find_nearest_color(targetOffset, candidatesOffset, candidateCount);

            this.metrics.wasmCalls++;
            this.metrics.totalWasmTime += (performance.now() - startTime);

            return nearestIndex;

        } catch (error) {
            console.error('WASM nearest color search failed:', error);
            return this.fallbackFindNearestColor(targetLab, candidatesLab);
        }
    }

    // Fallback JavaScript implementations (simplified versions)

    fallbackRgbToLab(rgb) {
        const startTime = performance.now();

        // Simplified RGB to LAB conversion
        const r = (rgb.r || rgb[0]) / 255;
        const g = (rgb.g || rgb[1]) / 255;
        const b = (rgb.b || rgb[2]) / 255;

        // Simplified gamma correction
        const rLinear = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        const gLinear = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        const bLinear = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        // sRGB to XYZ
        const x = (rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375) * 100;
        const y = (rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750) * 100;
        const z = (rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041) * 100;

        // XYZ to LAB
        const xr = x / 95.047;
        const yr = y / 100.000;
        const zr = z / 108.883;

        const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr + 16/116);
        const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr + 16/116);
        const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr + 16/116);

        const result = {
            l: 116 * fy - 16,
            a: 500 * (fx - fy),
            b: 200 * (fy - fz)
        };

        this.metrics.fallbackCalls++;
        this.metrics.totalFallbackTime += (performance.now() - startTime);

        return result;
    }

    fallbackDeltaECie76(lab1, lab2) {
        const startTime = performance.now();

        const dl = lab1.l - lab2.l;
        const da = lab1.a - lab2.a;
        const db = lab1.b - lab2.b;

        const result = Math.sqrt(dl * dl + da * da + db * db);

        this.metrics.fallbackCalls++;
        this.metrics.totalFallbackTime += (performance.now() - startTime);

        return result;
    }

    fallbackDeltaECie94(lab1, lab2) {
        const startTime = performance.now();

        const dl = lab1.l - lab2.l;
        const da = lab1.a - lab2.a;
        const db = lab1.b - lab2.b;

        const c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
        const c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
        const dc = c1 - c2;

        const dh = Math.sqrt(da * da + db * db - dc * dc);

        const sl = 1.0;
        const sc = 1.0 + 0.045 * c1;
        const sh = 1.0 + 0.015 * c1;

        const result = Math.sqrt(
            (dl / sl) ** 2 +
            (dc / sc) ** 2 +
            (dh / sh) ** 2
        );

        this.metrics.fallbackCalls++;
        this.metrics.totalFallbackTime += (performance.now() - startTime);

        return result;
    }

    fallbackBatchRgbToLab(rgbArray) {
        const startTime = performance.now();
        const results = rgbArray.map(rgb => this.fallbackRgbToLab(rgb));
        this.metrics.fallbackCalls++;
        this.metrics.totalFallbackTime += (performance.now() - startTime);
        return results;
    }

    fallbackCalculateDistanceMatrix(labArray) {
        const startTime = performance.now();
        const colorCount = labArray.length;
        const distances = new Float64Array(colorCount * colorCount);

        for (let i = 0; i < colorCount; i++) {
            for (let j = 0; j < colorCount; j++) {
                if (i === j) {
                    distances[i * colorCount + j] = 0;
                } else {
                    distances[i * colorCount + j] = this.fallbackDeltaECie76(labArray[i], labArray[j]);
                }
            }
        }

        this.metrics.fallbackCalls++;
        this.metrics.totalFallbackTime += (performance.now() - startTime);

        return Array.from(distances);
    }

    fallbackFindNearestColor(targetLab, candidatesLab) {
        const startTime = performance.now();
        let bestIndex = 0;
        let bestDistance = Infinity;

        for (let i = 0; i < candidatesLab.length; i++) {
            const distance = this.fallbackDeltaECie76(targetLab, candidatesLab[i]);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        }

        this.metrics.fallbackCalls++;
        this.metrics.totalFallbackTime += (performance.now() - startTime);

        return bestIndex;
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        const totalCalls = this.metrics.wasmCalls + this.metrics.fallbackCalls;
        const totalTime = this.metrics.totalWasmTime + this.metrics.totalFallbackTime;

        return {
            isWasmReady: this.isReady,
            wasmCalls: this.metrics.wasmCalls,
            fallbackCalls: this.metrics.fallbackCalls,
            wasmUsageRate: totalCalls > 0 ? (this.metrics.wasmCalls / totalCalls * 100).toFixed(1) + '%' : '0%',
            averageWasmTime: this.metrics.wasmCalls > 0
                ? (this.metrics.totalWasmTime / this.metrics.wasmCalls).toFixed(4) + 'ms'
                : '0ms',
            averageFallbackTime: this.metrics.fallbackCalls > 0
                ? (this.metrics.totalFallbackTime / this.metrics.fallbackCalls).toFixed(4) + 'ms'
                : '0ms',
            speedupRatio: this.metrics.wasmCalls > 0 && this.metrics.fallbackCalls > 0
                ? ((this.metrics.totalFallbackTime / this.metrics.fallbackCalls) /
                   (this.metrics.totalWasmTime / this.metrics.wasmCalls)).toFixed(2) + 'x'
                : 'N/A'
        };
    }

    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.metrics = {
            wasmCalls: 0,
            totalWasmTime: 0,
            fallbackCalls: 0,
            totalFallbackTime: 0
        };
    }

    /**
     * Check if WebAssembly is ready
     */
    isWasmReady() {
        return this.isReady;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WasmColorMath;
} else if (typeof window !== 'undefined') {
    window.WasmColorMath = WasmColorMath;
}