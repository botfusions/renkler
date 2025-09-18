/**
 * Delta E color difference calculation utilities
 * Implements CIE76, CIE94, and CIEDE2000 algorithms for precise color matching
 * Essential for Sanzo Wada color advisor accuracy
 */

class DeltaE {

    /**
     * Calculate Delta E CIE76 (basic color difference)
     * @param {Object} lab1 - First LAB color {l, a, b}
     * @param {Object} lab2 - Second LAB color {l, a, b}
     * @returns {number} Color difference value (0-100+)
     */
    static cie76(lab1, lab2) {
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;

        return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    }

    /**
     * Calculate Delta E CIE94 (improved color difference for textiles)
     * @param {Object} lab1 - First LAB color {l, a, b}
     * @param {Object} lab2 - Second LAB color {l, a, b}
     * @param {Object} constants - Weight constants {kL, kC, kH, k1, k2}
     * @returns {number} Color difference value
     */
    static cie94(lab1, lab2, constants = { kL: 1, kC: 1, kH: 1, k1: 0.045, k2: 0.015 }) {
        const { kL, kC, kH, k1, k2 } = constants;

        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;

        const c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
        const c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
        const deltaC = c1 - c2;

        const deltaH = Math.sqrt(Math.abs(deltaA * deltaA + deltaB * deltaB - deltaC * deltaC));

        const sl = 1.0;
        const sc = 1.0 + k1 * c1;
        const sh = 1.0 + k2 * c1;

        const deltaLKlsl = deltaL / (kL * sl);
        const deltaCkcsc = deltaC / (kC * sc);
        const deltaHkhsh = deltaH / (kH * sh);

        return Math.sqrt(deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh);
    }

    /**
     * Calculate Delta E CIEDE2000 (most accurate modern standard)
     * @param {Object} lab1 - First LAB color {l, a, b}
     * @param {Object} lab2 - Second LAB color {l, a, b}
     * @returns {number} Color difference value
     */
    static ciede2000(lab1, lab2) {
        const { l: l1, a: a1, b: b1 } = lab1;
        const { l: l2, a: a2, b: b2 } = lab2;

        // Calculate Chroma and mean Chroma
        const c1 = Math.sqrt(a1 * a1 + b1 * b1);
        const c2 = Math.sqrt(a2 * a2 + b2 * b2);
        const cMean = (c1 + c2) / 2;

        // Calculate G factor
        const g = 0.5 * (1 - Math.sqrt(Math.pow(cMean, 7) / (Math.pow(cMean, 7) + Math.pow(25, 7))));

        // Calculate a'
        const a1Prime = (1 + g) * a1;
        const a2Prime = (1 + g) * a2;

        // Calculate C' and h'
        const c1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
        const c2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);

        let h1Prime = Math.atan2(b1, a1Prime) * 180 / Math.PI;
        if (h1Prime < 0) h1Prime += 360;

        let h2Prime = Math.atan2(b2, a2Prime) * 180 / Math.PI;
        if (h2Prime < 0) h2Prime += 360;

        // Calculate deltas
        const deltaLPrime = l2 - l1;
        const deltaCPrime = c2Prime - c1Prime;

        let deltaHPrime;
        if (c1Prime * c2Prime === 0) {
            deltaHPrime = 0;
        } else if (Math.abs(h2Prime - h1Prime) <= 180) {
            deltaHPrime = h2Prime - h1Prime;
        } else if (h2Prime - h1Prime > 180) {
            deltaHPrime = h2Prime - h1Prime - 360;
        } else {
            deltaHPrime = h2Prime - h1Prime + 360;
        }

        const deltaHPrimeRadians = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(deltaHPrime * Math.PI / 360);

        // Calculate means
        const lMean = (l1 + l2) / 2;
        const cPrimeMean = (c1Prime + c2Prime) / 2;

        let hPrimeMean;
        if (c1Prime * c2Prime === 0) {
            hPrimeMean = h1Prime + h2Prime;
        } else if (Math.abs(h1Prime - h2Prime) <= 180) {
            hPrimeMean = (h1Prime + h2Prime) / 2;
        } else if (Math.abs(h1Prime - h2Prime) > 180 && h1Prime + h2Prime < 360) {
            hPrimeMean = (h1Prime + h2Prime + 360) / 2;
        } else {
            hPrimeMean = (h1Prime + h2Prime - 360) / 2;
        }

        // Calculate T
        const t = 1 - 0.17 * Math.cos((hPrimeMean - 30) * Math.PI / 180) +
                     0.24 * Math.cos(2 * hPrimeMean * Math.PI / 180) +
                     0.32 * Math.cos((3 * hPrimeMean + 6) * Math.PI / 180) -
                     0.20 * Math.cos((4 * hPrimeMean - 63) * Math.PI / 180);

        // Calculate delta Theta
        const deltaTheta = 30 * Math.exp(-Math.pow((hPrimeMean - 275) / 25, 2));

        // Calculate RC
        const rc = 2 * Math.sqrt(Math.pow(cPrimeMean, 7) / (Math.pow(cPrimeMean, 7) + Math.pow(25, 7)));

        // Calculate weighting functions
        const sl = 1 + (0.015 * Math.pow(lMean - 50, 2)) / Math.sqrt(20 + Math.pow(lMean - 50, 2));
        const sc = 1 + 0.045 * cPrimeMean;
        const sh = 1 + 0.015 * cPrimeMean * t;
        const rt = -Math.sin(2 * deltaTheta * Math.PI / 180) * rc;

        // Calculate final Delta E 2000
        const kL = 1;
        const kC = 1;
        const kH = 1;

        const deltaE = Math.sqrt(
            Math.pow(deltaLPrime / (kL * sl), 2) +
            Math.pow(deltaCPrime / (kC * sc), 2) +
            Math.pow(deltaHPrimeRadians / (kH * sh), 2) +
            rt * (deltaCPrime / (kC * sc)) * (deltaHPrimeRadians / (kH * sh))
        );

        return deltaE;
    }

    /**
     * Get perceptual difference description based on Delta E value
     * @param {number} deltaE - Delta E value
     * @returns {Object} Difference description and rating
     */
    static getPerceptualDifference(deltaE) {
        if (deltaE < 1) {
            return {
                level: 'imperceptible',
                description: 'Colors are virtually identical to the human eye',
                rating: 'excellent',
                confidence: 100
            };
        } else if (deltaE < 2) {
            return {
                level: 'barely_perceptible',
                description: 'Very slight difference, only noticeable by trained observers',
                rating: 'excellent',
                confidence: 95
            };
        } else if (deltaE < 3.5) {
            return {
                level: 'perceptible',
                description: 'Noticeable difference but still very close match',
                rating: 'very_good',
                confidence: 85
            };
        } else if (deltaE < 5) {
            return {
                level: 'well_perceptible',
                description: 'Clear difference but acceptable for most applications',
                rating: 'good',
                confidence: 70
            };
        } else if (deltaE < 10) {
            return {
                level: 'significant',
                description: 'Significant color difference, noticeable to all observers',
                rating: 'fair',
                confidence: 50
            };
        } else {
            return {
                level: 'very_significant',
                description: 'Very large color difference, completely different colors',
                rating: 'poor',
                confidence: 25
            };
        }
    }

    /**
     * Find the closest color from a palette
     * @param {Object} targetLab - Target LAB color {l, a, b}
     * @param {Array} palette - Array of LAB colors with metadata
     * @param {string} algorithm - Delta E algorithm ('cie76', 'cie94', 'ciede2000')
     * @returns {Object} Best match with distance and confidence
     */
    static findClosestColor(targetLab, palette, algorithm = 'ciede2000') {
        let bestMatch = null;
        let minDistance = Infinity;

        const calculateDistance = (lab1, lab2) => {
            switch (algorithm) {
                case 'cie76': return this.cie76(lab1, lab2);
                case 'cie94': return this.cie94(lab1, lab2);
                case 'ciede2000': return this.ciede2000(lab1, lab2);
                default: return this.ciede2000(lab1, lab2);
            }
        };

        palette.forEach((color, index) => {
            const distance = calculateDistance(targetLab, color.lab);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = {
                    ...color,
                    distance,
                    index,
                    perceptual: this.getPerceptualDifference(distance)
                };
            }
        });

        return bestMatch;
    }

    /**
     * Calculate color harmony score based on multiple factors
     * @param {Array} colors - Array of LAB colors
     * @returns {Object} Harmony analysis
     */
    static calculateHarmonyScore(colors) {
        if (colors.length < 2) {
            return { score: 100, type: 'monochromatic', description: 'Single color harmony' };
        }

        let totalDistance = 0;
        let comparisons = 0;
        const distances = [];

        // Calculate all pairwise distances
        for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                const distance = this.ciede2000(colors[i], colors[j]);
                distances.push(distance);
                totalDistance += distance;
                comparisons++;
            }
        }

        const averageDistance = totalDistance / comparisons;
        const distanceVariance = distances.reduce((sum, d) => sum + Math.pow(d - averageDistance, 2), 0) / distances.length;

        // Determine harmony type based on more specific thresholds
        let harmonyType, harmonyScore;
        if (averageDistance < 15) {
            harmonyType = 'analogous';
            harmonyScore = Math.max(0, 100 - averageDistance * 5);
        } else if (averageDistance > 50) {
            harmonyType = 'complementary';
            harmonyScore = Math.max(0, 100 - Math.abs(averageDistance - 65) * 1.5);
        } else {
            harmonyType = 'triadic';
            harmonyScore = Math.max(0, 100 - Math.abs(averageDistance - 35) * 2);
        }

        // Adjust for consistency (lower variance = higher score)
        const consistencyBonus = Math.max(0, 20 - distanceVariance);
        harmonyScore = Math.min(100, harmonyScore + consistencyBonus);

        return {
            score: Math.round(harmonyScore),
            type: harmonyType,
            averageDistance: Math.round(averageDistance * 100) / 100,
            consistency: Math.round((20 - distanceVariance) * 5),
            description: this.getHarmonyDescription(harmonyType, harmonyScore)
        };
    }

    /**
     * Get harmony description based on type and score
     * @param {string} type - Harmony type
     * @param {number} score - Harmony score
     * @returns {string} Description
     */
    static getHarmonyDescription(type, score) {
        const quality = score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor';

        const descriptions = {
            analogous: `Colors are closely related and create a ${quality} unified, harmonious feeling`,
            complementary: `Colors provide ${quality} contrast and visual excitement`,
            triadic: `Colors offer ${quality} balanced variety and visual interest`,
            monochromatic: 'Single color provides perfect unity'
        };

        return descriptions[type] || 'Color relationship creates a unique visual experience';
    }
}

module.exports = DeltaE;