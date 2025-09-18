/**
 * Advanced Color Harmony Algorithms
 * Implements sophisticated color theory for the Sanzo Color Advisor
 *
 * Features:
 * - Traditional harmony schemes (complementary, triadic, tetradic, analogous)
 * - Advanced harmony algorithms (split-complementary, double-complementary)
 * - Sophisticated palette generation with cultural awareness
 * - Color relationship analysis and optimization
 */

const ColorConversions = require('./colorConversions');
const DeltaE = require('./deltaE');

class AdvancedColorHarmony {

    constructor() {
        this.initializeHarmonyTypes();
        this.initializeGoldenRatios();
        this.initializeCulturalMappings();
    }

    /**
     * Initialize color harmony type definitions
     */
    initializeHarmonyTypes() {
        this.harmonyTypes = {
            complementary: {
                name: 'Complementary',
                description: 'Colors opposite on the color wheel',
                angles: [0, 180],
                characteristics: ['high contrast', 'vibrant', 'dynamic'],
                psychological: 'energizing, attention-grabbing, bold',
                bestFor: ['accent walls', 'focal points', 'modern designs'],
                culturalSignificance: {
                    turkish: 'Represents balance and opposing forces in Ottoman design'
                }
            },
            splitComplementary: {
                name: 'Split Complementary',
                description: 'Base color plus two colors adjacent to its complement',
                angles: [0, 150, 210],
                characteristics: ['vibrant', 'balanced', 'sophisticated'],
                psychological: 'confident, stable yet energetic',
                bestFor: ['living rooms', 'creative spaces', 'children areas'],
                culturalSignificance: {
                    turkish: 'Mirrors the three-color harmony in traditional Turkish ceramics'
                }
            },
            triadic: {
                name: 'Triadic',
                description: 'Three colors equally spaced on the color wheel',
                angles: [0, 120, 240],
                characteristics: ['balanced', 'vibrant', 'playful'],
                psychological: 'creative, energetic, harmonious',
                bestFor: ['playrooms', 'children bedrooms', 'creative studios'],
                culturalSignificance: {
                    turkish: 'Sacred triangle concept in Islamic geometric patterns'
                }
            },
            tetradic: {
                name: 'Tetradic (Rectangle)',
                description: 'Four colors forming a rectangle on the color wheel',
                angles: [0, 60, 180, 240],
                characteristics: ['rich', 'complex', 'sophisticated'],
                psychological: 'luxurious, complex, stimulating',
                bestFor: ['dining rooms', 'luxury spaces', 'art galleries'],
                culturalSignificance: {
                    turkish: 'Four seasons concept in traditional Turkish garden design'
                }
            },
            square: {
                name: 'Square',
                description: 'Four colors equally spaced on the color wheel',
                angles: [0, 90, 180, 270],
                characteristics: ['bold', 'balanced', 'diverse'],
                psychological: 'dynamic, balanced, confident',
                bestFor: ['modern spaces', 'eclectic designs', 'commercial areas'],
                culturalSignificance: {
                    turkish: 'Four directions in traditional compass designs'
                }
            },
            analogous: {
                name: 'Analogous',
                description: 'Colors adjacent on the color wheel',
                angles: [0, 30, 60],
                characteristics: ['harmonious', 'serene', 'natural'],
                psychological: 'peaceful, comfortable, unified',
                bestFor: ['bedrooms', 'relaxation areas', 'nature-inspired designs'],
                culturalSignificance: {
                    turkish: 'Flow of time and seasons in Turkish landscape art'
                }
            },
            monochromatic: {
                name: 'Monochromatic',
                description: 'Variations of a single hue',
                angles: [0],
                characteristics: ['subtle', 'sophisticated', 'calming'],
                psychological: 'serene, elegant, focused',
                bestFor: ['minimalist designs', 'professional spaces', 'meditation areas'],
                culturalSignificance: {
                    turkish: 'Unity and simplicity in Islamic calligraphy'
                }
            }
        };
    }

    /**
     * Initialize golden ratio proportions for advanced harmonies
     */
    initializeGoldenRatios() {
        this.goldenRatio = 1.618;
        this.goldenAngle = 137.508; // Degrees

        this.harmonicProportions = {
            fibonacci: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
            golden: [this.goldenRatio, Math.pow(this.goldenRatio, 2), Math.pow(this.goldenRatio, 3)],
            musical: [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875, 2.0] // Just intonation ratios
        };
    }

    /**
     * Initialize cultural color mappings
     */
    initializeCulturalMappings() {
        this.culturalMappings = {
            turkish: {
                traditional: {
                    'ottoman_blue': { hex: '#1e3a8a', significance: 'Royal power and divine protection' },
                    'iznik_turquoise': { hex: '#22d3ee', significance: 'Artistic excellence and craftsmanship' },
                    'seljuk_red': { hex: '#dc2626', significance: 'Strength and valor' },
                    'byzantine_gold': { hex: '#facc15', significance: 'Divine light and prosperity' },
                    'anatolian_green': { hex: '#15803d', significance: 'Paradise and nature' },
                    'bosphorus_gray': { hex: '#6b7280', significance: 'Wisdom and endurance' }
                },
                modern: {
                    'istanbul_sunset': { hex: '#f97316', significance: 'Urban energy and transformation' },
                    'aegean_blue': { hex: '#0ea5e9', significance: 'Freedom and openness' },
                    'cappadocia_rose': { hex: '#f472b6', significance: 'Natural wonder and romance' },
                    'black_sea_deep': { hex: '#1f2937', significance: 'Mystery and depth' }
                },
                symbolic: {
                    'crescent_silver': { hex: '#e5e7eb', significance: 'Islamic heritage and purity' },
                    'star_white': { hex: '#ffffff', significance: 'Peace and unity' },
                    'tulip_red': { hex: '#ef4444', significance: 'Love and passion' },
                    'evil_eye_blue': { hex: '#3b82f6', significance: 'Protection and good fortune' }
                }
            }
        };
    }

    /**
     * Generate comprehensive color harmony based on a base color
     * @param {string} baseColorHex - Base color in hex format
     * @param {string} harmonyType - Type of harmony to generate
     * @param {Object} options - Additional options
     * @returns {Object} Complete harmony analysis
     */
    generateHarmony(baseColorHex, harmonyType, options = {}) {
        try {
            const baseRgb = ColorConversions.hexToRgb(baseColorHex);
            if (!baseRgb) {
                throw new Error('Invalid base color format');
            }

            const baseHsl = ColorConversions.rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
            const harmonyDefinition = this.harmonyTypes[harmonyType];

            if (!harmonyDefinition) {
                throw new Error('Unknown harmony type');
            }

            // Generate core harmony colors
            const harmonyColors = this.generateHarmonyColors(baseHsl, harmonyDefinition, options);

            // Generate extended palette with variations
            const extendedPalette = this.generateExtendedPalette(harmonyColors, options);

            // Analyze harmony quality
            const harmonyAnalysis = this.analyzeHarmonyQuality(harmonyColors);

            // Cultural context analysis
            const culturalAnalysis = this.analyzeCulturalContext(harmonyColors, options.culture || 'turkish');

            // Generate mood associations
            const moodAnalysis = this.analyzeMoodAssociations(harmonyColors, harmonyDefinition);

            return {
                success: true,
                harmonyType: harmonyType,
                baseColor: {
                    hex: baseColorHex,
                    rgb: baseRgb,
                    hsl: baseHsl,
                    lab: ColorConversions.hexToLab(baseColorHex)
                },
                harmonyDefinition,
                coreColors: harmonyColors,
                extendedPalette,
                analysis: {
                    harmony: harmonyAnalysis,
                    cultural: culturalAnalysis,
                    mood: moodAnalysis
                },
                recommendations: this.generateHarmonyRecommendations(harmonyColors, harmonyDefinition, options)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate core harmony colors based on angles
     */
    generateHarmonyColors(baseHsl, harmonyDefinition, options) {
        const colors = [];
        const saturationVariation = options.saturationVariation || 0.1;
        const lightnessVariation = options.lightnessVariation || 0.1;

        harmonyDefinition.angles.forEach((angle, index) => {
            let hue = (baseHsl.h + angle) % 360;
            let saturation = baseHsl.s;
            let lightness = baseHsl.l;

            // Apply subtle variations for more natural look
            if (index > 0) {
                saturation = Math.max(0, Math.min(100,
                    saturation + (Math.random() - 0.5) * saturationVariation * 100
                ));
                lightness = Math.max(0, Math.min(100,
                    lightness + (Math.random() - 0.5) * lightnessVariation * 100
                ));
            }

            const rgb = ColorConversions.hslToRgb(hue, saturation, lightness);
            const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);
            const lab = ColorConversions.rgbToLab(rgb.r, rgb.g, rgb.b);

            colors.push({
                index,
                role: index === 0 ? 'primary' : `harmony_${index}`,
                hex,
                rgb,
                hsl: { h: hue, s: saturation, l: lightness },
                lab,
                temperature: ColorConversions.getColorTemperature(rgb),
                angle,
                significance: this.getColorSignificance(hue, options.culture || 'turkish')
            });
        });

        return colors;
    }

    /**
     * Generate extended palette with tints, shades, and tones
     */
    generateExtendedPalette(coreColors, options) {
        const palette = {
            tints: [],      // Lighter versions (adding white)
            shades: [],     // Darker versions (adding black)
            tones: [],      // Muted versions (adding gray)
            accents: []     // Complementary accents
        };

        coreColors.forEach(color => {
            // Generate tints (lighter)
            for (let i = 1; i <= 3; i++) {
                const lightness = Math.min(95, color.hsl.l + (i * 15));
                const saturation = Math.max(5, color.hsl.s - (i * 10));
                const tintRgb = ColorConversions.hslToRgb(color.hsl.h, saturation, lightness);
                const tintHex = ColorConversions.rgbToHex(tintRgb.r, tintRgb.g, tintRgb.b);

                palette.tints.push({
                    baseColor: color.hex,
                    level: i,
                    hex: tintHex,
                    rgb: tintRgb,
                    hsl: { h: color.hsl.h, s: saturation, l: lightness },
                    usage: i === 1 ? 'subtle backgrounds' : i === 2 ? 'light accents' : 'minimal highlights'
                });
            }

            // Generate shades (darker)
            for (let i = 1; i <= 3; i++) {
                const lightness = Math.max(10, color.hsl.l - (i * 15));
                const saturation = Math.min(100, color.hsl.s + (i * 5));
                const shadeRgb = ColorConversions.hslToRgb(color.hsl.h, saturation, lightness);
                const shadeHex = ColorConversions.rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);

                palette.shades.push({
                    baseColor: color.hex,
                    level: i,
                    hex: shadeHex,
                    rgb: shadeRgb,
                    hsl: { h: color.hsl.h, s: saturation, l: lightness },
                    usage: i === 1 ? 'deeper accents' : i === 2 ? 'bold statements' : 'dramatic contrast'
                });
            }

            // Generate tones (muted)
            for (let i = 1; i <= 2; i++) {
                const saturation = Math.max(5, color.hsl.s - (i * 20));
                const toneRgb = ColorConversions.hslToRgb(color.hsl.h, saturation, color.hsl.l);
                const toneHex = ColorConversions.rgbToHex(toneRgb.r, toneRgb.g, toneRgb.b);

                palette.tones.push({
                    baseColor: color.hex,
                    level: i,
                    hex: toneHex,
                    rgb: toneRgb,
                    hsl: { h: color.hsl.h, s: saturation, l: color.hsl.l },
                    usage: i === 1 ? 'sophisticated neutrals' : 'subtle backgrounds'
                });
            }
        });

        return palette;
    }

    /**
     * Analyze harmony quality using multiple metrics
     */
    analyzeHarmonyQuality(colors) {
        const analysis = {
            score: 0,
            factors: {},
            recommendations: []
        };

        // Color distance analysis
        const distances = this.calculateColorDistances(colors);
        analysis.factors.spacing = this.evaluateColorSpacing(distances);

        // Saturation balance
        analysis.factors.saturationBalance = this.evaluateSaturationBalance(colors);

        // Lightness distribution
        analysis.factors.lightnessDistribution = this.evaluateLightnessDistribution(colors);

        // Temperature harmony
        analysis.factors.temperatureHarmony = this.evaluateTemperatureHarmony(colors);

        // Calculate overall score
        const weights = {
            spacing: 0.3,
            saturationBalance: 0.25,
            lightnessDistribution: 0.25,
            temperatureHarmony: 0.2
        };

        analysis.score = Object.entries(analysis.factors).reduce((total, [key, value]) => {
            return total + (value.score * weights[key]);
        }, 0);

        // Generate recommendations
        analysis.recommendations = this.generateQualityRecommendations(analysis.factors);

        return analysis;
    }

    /**
     * Calculate distances between all color pairs
     */
    calculateColorDistances(colors) {
        const distances = [];
        for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                const distance = DeltaE.cie94(colors[i].lab, colors[j].lab);
                distances.push({
                    color1: colors[i],
                    color2: colors[j],
                    distance,
                    relationship: this.classifyColorRelationship(distance)
                });
            }
        }
        return distances;
    }

    /**
     * Classify color relationships based on Delta E distance
     */
    classifyColorRelationship(distance) {
        if (distance < 2) return 'identical';
        if (distance < 5) return 'very_similar';
        if (distance < 10) return 'similar';
        if (distance < 25) return 'noticeable';
        if (distance < 50) return 'distinct';
        return 'very_distinct';
    }

    /**
     * Evaluate color spacing quality
     */
    evaluateColorSpacing(distances) {
        const avgDistance = distances.reduce((sum, d) => sum + d.distance, 0) / distances.length;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d.distance - avgDistance, 2), 0) / distances.length;
        const standardDeviation = Math.sqrt(variance);

        let score = 100;

        // Penalize if colors are too similar or too different
        if (avgDistance < 15) score -= 30; // Too similar
        if (avgDistance > 70) score -= 20; // Too different

        // Penalize high variance (uneven spacing)
        if (standardDeviation > 20) score -= 25;

        return {
            score: Math.max(0, score),
            averageDistance: Math.round(avgDistance),
            variance: Math.round(variance),
            recommendation: avgDistance < 15 ? 'Increase color contrast' :
                          avgDistance > 70 ? 'Reduce color contrast' :
                          standardDeviation > 20 ? 'Balance color spacing' : 'Good color spacing'
        };
    }

    /**
     * Evaluate saturation balance
     */
    evaluateSaturationBalance(colors) {
        const saturations = colors.map(c => c.hsl.s);
        const avgSaturation = saturations.reduce((sum, s) => sum + s, 0) / saturations.length;
        const maxSat = Math.max(...saturations);
        const minSat = Math.min(...saturations);
        const range = maxSat - minSat;

        let score = 100;

        // Ideal range is 20-60 points
        if (range < 10) score -= 20; // Too uniform
        if (range > 80) score -= 30; // Too varied

        // Penalize extreme saturations
        if (maxSat > 90) score -= 15;
        if (minSat < 5 && avgSaturation > 50) score -= 10;

        return {
            score: Math.max(0, score),
            average: Math.round(avgSaturation),
            range: Math.round(range),
            recommendation: range < 10 ? 'Add saturation variety' :
                          range > 80 ? 'Reduce saturation contrast' :
                          'Good saturation balance'
        };
    }

    /**
     * Evaluate lightness distribution
     */
    evaluateLightnessDistribution(colors) {
        const lightnesses = colors.map(c => c.hsl.l);
        const avgLightness = lightnesses.reduce((sum, l) => sum + l, 0) / lightnesses.length;
        const maxLight = Math.max(...lightnesses);
        const minLight = Math.min(...lightnesses);
        const range = maxLight - minLight;

        let score = 100;

        // Good range is 30-70 points
        if (range < 20) score -= 25; // Too uniform
        if (range > 80) score -= 20; // Too extreme

        // Check for balanced distribution
        const lightCount = lightnesses.filter(l => l > 70).length;
        const darkCount = lightnesses.filter(l => l < 30).length;
        const midCount = lightnesses.filter(l => l >= 30 && l <= 70).length;

        if (lightCount === colors.length || darkCount === colors.length) {
            score -= 30; // All light or all dark
        }

        return {
            score: Math.max(0, score),
            average: Math.round(avgLightness),
            range: Math.round(range),
            distribution: { light: lightCount, dark: darkCount, medium: midCount },
            recommendation: range < 20 ? 'Add lightness variety' :
                          range > 80 ? 'Reduce lightness contrast' :
                          'Good lightness distribution'
        };
    }

    /**
     * Evaluate temperature harmony
     */
    evaluateTemperatureHarmony(colors) {
        const temperatures = colors.map(c => c.temperature.type);
        const warmCount = temperatures.filter(t => t === 'warm').length;
        const coolCount = temperatures.filter(t => t === 'cool').length;
        const neutralCount = temperatures.filter(t => t === 'neutral').length;

        let score = 100;
        let harmonyType = '';

        if (warmCount === colors.length) {
            harmonyType = 'warm';
            score = 85; // Good but could use cool accents
        } else if (coolCount === colors.length) {
            harmonyType = 'cool';
            score = 85; // Good but could use warm accents
        } else if (neutralCount === colors.length) {
            harmonyType = 'neutral';
            score = 70; // Safe but lacks energy
        } else {
            harmonyType = 'mixed';
            score = 95; // Best balance
        }

        return {
            score,
            harmonyType,
            distribution: { warm: warmCount, cool: coolCount, neutral: neutralCount },
            recommendation: harmonyType === 'warm' ? 'Consider adding cool accents' :
                          harmonyType === 'cool' ? 'Consider adding warm accents' :
                          harmonyType === 'neutral' ? 'Add warm or cool colors for energy' :
                          'Excellent temperature balance'
        };
    }

    /**
     * Generate quality improvement recommendations
     */
    generateQualityRecommendations(factors) {
        const recommendations = [];

        Object.entries(factors).forEach(([key, value]) => {
            if (value.score < 80) {
                recommendations.push({
                    factor: key,
                    score: value.score,
                    recommendation: value.recommendation,
                    priority: value.score < 60 ? 'high' : 'medium'
                });
            }
        });

        // Sort by priority and score
        return recommendations.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            return a.score - b.score;
        });
    }

    /**
     * Analyze cultural context of colors
     */
    analyzeCulturalContext(colors, culture) {
        const culturalData = this.culturalMappings[culture];
        if (!culturalData) {
            return { available: false, culture };
        }

        const analysis = {
            culture,
            matches: [],
            symbolism: [],
            recommendations: []
        };

        colors.forEach(color => {
            // Find closest cultural color matches
            const matches = this.findCulturalMatches(color, culturalData);
            if (matches.length > 0) {
                analysis.matches.push({
                    color: color.hex,
                    culturalMatches: matches
                });
            }

            // Add symbolic meanings
            const symbolism = this.getColorSymbolism(color.hsl.h, culture);
            if (symbolism) {
                analysis.symbolism.push({
                    color: color.hex,
                    symbolism
                });
            }
        });

        // Generate cultural recommendations
        analysis.recommendations = this.generateCulturalRecommendations(colors, culturalData);

        return analysis;
    }

    /**
     * Find cultural color matches
     */
    findCulturalMatches(color, culturalData) {
        const matches = [];
        const threshold = 15; // Delta E threshold for cultural matches

        Object.entries(culturalData).forEach(([category, colors]) => {
            Object.entries(colors).forEach(([name, data]) => {
                const culturalRgb = ColorConversions.hexToRgb(data.hex);
                const culturalLab = ColorConversions.rgbToLab(culturalRgb.r, culturalRgb.g, culturalRgb.b);
                const distance = DeltaE.cie94(color.lab, culturalLab);

                if (distance <= threshold) {
                    matches.push({
                        name,
                        category,
                        hex: data.hex,
                        significance: data.significance,
                        distance: Math.round(distance),
                        similarity: Math.round((1 - distance / threshold) * 100)
                    });
                }
            });
        });

        return matches.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Get color significance based on hue
     */
    getColorSignificance(hue, culture) {
        if (culture !== 'turkish') return null;

        const hueRanges = {
            red: { min: 345, max: 15, significance: 'Passion, strength, Turkish flag heritage' },
            orange: { min: 15, max: 45, significance: 'Warmth, hospitality, spice trade history' },
            yellow: { min: 45, max: 75, significance: 'Gold, prosperity, Byzantine influence' },
            green: { min: 75, max: 165, significance: 'Paradise, nature, Islamic symbolism' },
            blue: { min: 165, max: 255, significance: 'Protection, divinity, Bosphorus waters' },
            purple: { min: 255, max: 285, significance: 'Royalty, Byzantine purple, luxury' },
            pink: { min: 285, max: 345, significance: 'Tenderness, rose gardens, romance' }
        };

        for (const [colorName, range] of Object.entries(hueRanges)) {
            if ((hue >= range.min && hue <= range.max) ||
                (range.min > range.max && (hue >= range.min || hue <= range.max))) {
                return {
                    colorName,
                    significance: range.significance
                };
            }
        }

        return null;
    }

    /**
     * Get symbolic meaning based on color properties
     */
    getColorSymbolism(hue, culture) {
        const significance = this.getColorSignificance(hue, culture);
        return significance ? significance.significance : null;
    }

    /**
     * Generate cultural recommendations
     */
    generateCulturalRecommendations(colors, culturalData) {
        const recommendations = [];

        // Check if palette incorporates traditional elements
        const hasTraditional = colors.some(color =>
            this.findCulturalMatches(color, { traditional: culturalData.traditional }).length > 0
        );

        if (!hasTraditional) {
            recommendations.push({
                type: 'cultural_integration',
                priority: 'medium',
                suggestion: 'Consider incorporating traditional Turkish colors for cultural authenticity',
                examples: Object.keys(culturalData.traditional).slice(0, 3)
            });
        }

        // Suggest symbolic balance
        const colorTypes = colors.map(c => this.getColorSignificance(c.hsl.h, 'turkish')).filter(Boolean);
        if (colorTypes.length < colors.length / 2) {
            recommendations.push({
                type: 'symbolic_enhancement',
                priority: 'low',
                suggestion: 'Add colors with cultural symbolism to enhance meaning',
                symbolism: 'Consider colors representing protection, prosperity, or natural harmony'
            });
        }

        return recommendations;
    }

    /**
     * Analyze mood associations of color harmony
     */
    analyzeMoodAssociations(colors, harmonyDefinition) {
        const moodMap = {
            energetic: { warm: 2, high_saturation: 2, bright: 1 },
            calming: { cool: 2, low_saturation: 2, soft: 1 },
            sophisticated: { neutral: 1, balanced_saturation: 2, medium_light: 1 },
            playful: { high_saturation: 2, bright: 2, varied_hues: 1 },
            romantic: { warm: 1, soft: 2, pink_red: 2 },
            professional: { neutral: 2, low_saturation: 1, balanced: 2 },
            natural: { green_brown: 2, medium_saturation: 1, earth_tones: 2 },
            luxurious: { deep: 2, rich_saturation: 2, gold_accents: 1 }
        };

        const moodScores = {};
        Object.keys(moodMap).forEach(mood => moodScores[mood] = 0);

        // Calculate mood scores based on color properties
        colors.forEach(color => {
            const { h, s, l } = color.hsl;
            const temp = color.temperature.type;

            // Temperature influences
            if (temp === 'warm') {
                moodScores.energetic += 1;
                moodScores.romantic += 0.5;
            } else if (temp === 'cool') {
                moodScores.calming += 1;
                moodScores.professional += 0.5;
            } else {
                moodScores.sophisticated += 1;
                moodScores.professional += 1;
            }

            // Saturation influences
            if (s > 70) {
                moodScores.energetic += 1;
                moodScores.playful += 1;
            } else if (s < 30) {
                moodScores.calming += 1;
                moodScores.sophisticated += 1;
            }

            // Lightness influences
            if (l > 80) {
                moodScores.playful += 0.5;
                moodScores.romantic += 0.5;
            } else if (l < 30) {
                moodScores.luxurious += 1;
                moodScores.sophisticated += 0.5;
            }

            // Hue-specific influences
            if (h >= 75 && h <= 165) moodScores.natural += 1; // Green range
            if (h >= 285 && h <= 15) moodScores.romantic += 1; // Pink-red range
            if (h >= 45 && h <= 75) moodScores.luxurious += 0.5; // Gold range
        });

        // Normalize scores
        const maxScore = Math.max(...Object.values(moodScores));
        if (maxScore > 0) {
            Object.keys(moodScores).forEach(mood => {
                moodScores[mood] = Math.round((moodScores[mood] / maxScore) * 100);
            });
        }

        // Get top 3 moods
        const topMoods = Object.entries(moodScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([mood, score]) => ({ mood, score }));

        return {
            scores: moodScores,
            primaryMoods: topMoods,
            description: this.generateMoodDescription(topMoods, harmonyDefinition),
            applications: this.getMoodApplications(topMoods)
        };
    }

    /**
     * Generate mood description
     */
    generateMoodDescription(topMoods, harmonyDefinition) {
        const primaryMood = topMoods[0];
        const secondaryMood = topMoods[1];

        let description = `This ${harmonyDefinition.name.toLowerCase()} harmony creates a primarily ${primaryMood.mood} atmosphere`;

        if (secondaryMood && secondaryMood.score > 50) {
            description += ` with ${secondaryMood.mood} undertones`;
        }

        description += `. ${harmonyDefinition.psychological}.`;

        return description;
    }

    /**
     * Get mood-based applications
     */
    getMoodApplications(topMoods) {
        const applications = {
            energetic: ['exercise rooms', 'playrooms', 'creative studios', 'cafes'],
            calming: ['bedrooms', 'meditation spaces', 'spas', 'reading nooks'],
            sophisticated: ['home offices', 'dining rooms', 'luxury spaces', 'galleries'],
            playful: ['children\'s rooms', 'creative spaces', 'casual dining', 'game rooms'],
            romantic: ['bedrooms', 'intimate dining', 'lounges', 'gardens'],
            professional: ['offices', 'meeting rooms', 'studies', 'formal spaces'],
            natural: ['living rooms', 'kitchens', 'sunrooms', 'outdoor spaces'],
            luxurious: ['master suites', 'formal dining', 'home theaters', 'wine cellars']
        };

        const suggestedSpaces = [];
        topMoods.forEach(({ mood, score }) => {
            if (score > 60 && applications[mood]) {
                suggestedSpaces.push(...applications[mood]);
            }
        });

        return [...new Set(suggestedSpaces)].slice(0, 6);
    }

    /**
     * Generate comprehensive harmony recommendations
     */
    generateHarmonyRecommendations(colors, harmonyDefinition, options) {
        const recommendations = [];

        // Usage recommendations
        recommendations.push({
            category: 'usage',
            title: 'Best Applications',
            items: harmonyDefinition.bestFor.map(use => ({
                application: use,
                reasoning: `${harmonyDefinition.name} harmonies are ${harmonyDefinition.characteristics.join(', ')}`
            }))
        });

        // Implementation recommendations
        recommendations.push({
            category: 'implementation',
            title: 'Implementation Tips',
            items: [
                {
                    tip: 'Proportion Guidelines',
                    details: 'Use 60% dominant color, 30% secondary, 10% accent for balanced application'
                },
                {
                    tip: 'Lighting Considerations',
                    details: 'Test colors under different lighting conditions - natural, warm LED, and cool fluorescent'
                },
                {
                    tip: 'Material Selection',
                    details: 'Consider how different materials (matte, glossy, textured) affect color perception'
                }
            ]
        });

        // Cultural recommendations if applicable
        if (options.culture === 'turkish') {
            recommendations.push({
                category: 'cultural',
                title: 'Turkish Cultural Context',
                items: [
                    {
                        aspect: 'Traditional Integration',
                        suggestion: 'Incorporate traditional patterns and textures to enhance cultural authenticity'
                    },
                    {
                        aspect: 'Symbolic Meaning',
                        suggestion: harmonyDefinition.culturalSignificance?.turkish || 'Colors carry deep cultural significance in Turkish design'
                    }
                ]
            });
        }

        return recommendations;
    }

    /**
     * Generate harmony comparison between multiple schemes
     * @param {Array} harmonies - Array of harmony objects to compare
     * @returns {Object} Comparison analysis
     */
    compareHarmonies(harmonies) {
        if (!harmonies || harmonies.length < 2) {
            return { error: 'At least two harmonies required for comparison' };
        }

        const comparison = {
            harmonies: harmonies.map(h => ({
                type: h.harmonyType,
                score: h.analysis.harmony.score,
                primaryMood: h.analysis.mood.primaryMoods[0]?.mood,
                culturalFit: h.analysis.cultural.matches.length
            })),
            recommendations: []
        };

        // Find best overall harmony
        const bestHarmony = harmonies.reduce((best, current) =>
            current.analysis.harmony.score > best.analysis.harmony.score ? current : best
        );

        comparison.recommended = bestHarmony.harmonyType;
        comparison.reasoning = `${bestHarmony.harmonyType} scored highest (${bestHarmony.analysis.harmony.score}/100) with excellent ${bestHarmony.analysis.mood.primaryMoods[0]?.mood} mood characteristics`;

        // Generate comparative recommendations
        harmonies.forEach(harmony => {
            if (harmony.analysis.harmony.score < 70) {
                comparison.recommendations.push({
                    harmony: harmony.harmonyType,
                    issue: 'Low harmony score',
                    suggestion: 'Consider adjusting color balance or choosing alternative harmony type'
                });
            }
        });

        return comparison;
    }

    /**
     * ADVANCED MATHEMATICAL MODELS FOR COLOR HARMONY
     * Enhanced algorithms using sophisticated mathematical foundations
     */

    /**
     * Generate Fibonacci-based harmony using golden ratio proportions
     * @param {Object} baseHsl - Base color in HSL format
     * @param {Object} options - Configuration options
     * @returns {Array} Array of harmonious colors based on Fibonacci sequence
     */
    generateFibonacciHarmony(baseHsl, options = {}) {
        const colors = [];
        const fibSequence = this.harmonicProportions.fibonacci.slice(0, 8);
        const goldenAngle = this.goldenAngle;

        fibSequence.forEach((fibNumber, index) => {
            if (index === 0) {
                // Base color
                colors.push(this.createColorObject(baseHsl, 'fibonacci_base', 0));
                return;
            }

            // Calculate hue using Fibonacci-based golden angle progression
            const hueShift = (goldenAngle * fibNumber) % 360;
            const newHue = (baseHsl.h + hueShift) % 360;

            // Apply Fibonacci ratio to saturation and lightness
            const fibRatio = fibSequence[index] / fibSequence[Math.max(0, index - 1)];
            const saturation = Math.max(10, Math.min(90, baseHsl.s * (0.8 + (fibRatio - 1) * 0.3)));
            const lightness = Math.max(15, Math.min(85, baseHsl.l * (0.9 + Math.sin(fibRatio) * 0.2)));

            colors.push(this.createColorObject(
                { h: newHue, s: saturation, l: lightness },
                `fibonacci_${index}`,
                hueShift
            ));
        });

        return colors;
    }

    /**
     * Generate harmony using Bezier curve color interpolation
     * @param {Object} baseHsl - Base color in HSL format
     * @param {Array} controlPoints - Control points for Bezier curve [hue1, hue2, hue3, hue4]
     * @param {number} steps - Number of interpolation steps
     * @returns {Array} Array of colors along Bezier curve
     */
    generateBezierHarmony(baseHsl, controlPoints = null, steps = 5) {
        if (!controlPoints) {
            // Generate intelligent control points based on color theory
            controlPoints = [
                baseHsl.h,
                (baseHsl.h + 120) % 360,
                (baseHsl.h + 240) % 360,
                (baseHsl.h + 360) % 360
            ];
        }

        const colors = [];
        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const hue = this.calculateBezierPoint(controlPoints, t);

            // Apply mathematical progression to saturation and lightness
            const saturationCurve = Math.sin(t * Math.PI) * 0.3 + 0.7;
            const lightnessCurve = Math.cos(t * Math.PI * 0.5) * 0.2 + 0.6;

            const saturation = baseHsl.s * saturationCurve;
            const lightness = baseHsl.l * lightnessCurve;

            colors.push(this.createColorObject(
                { h: hue, s: saturation, l: lightness },
                `bezier_${i}`,
                hue - baseHsl.h
            ));
        }

        return colors;
    }

    /**
     * Calculate point on cubic Bezier curve
     * @param {Array} points - Control points
     * @param {number} t - Parameter (0-1)
     * @returns {number} Interpolated value
     */
    calculateBezierPoint(points, t) {
        const [p0, p1, p2, p3] = points;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
    }

    /**
     * Generate harmony using Fourier transform analysis
     * @param {Object} baseHsl - Base color in HSL format
     * @param {number} harmonics - Number of harmonic frequencies to analyze
     * @returns {Array} Array of colors based on harmonic analysis
     */
    generateFourierHarmony(baseHsl, harmonics = 7) {
        const colors = [];
        const fundamentalFreq = baseHsl.h / 360; // Normalize to 0-1

        for (let n = 1; n <= harmonics; n++) {
            // Calculate harmonic frequencies
            const harmonicFreq = fundamentalFreq * n;
            const hue = (harmonicFreq * 360) % 360;

            // Apply Fourier coefficients to color properties
            const amplitude = 1 / n; // Decreasing amplitude for higher harmonics
            const phase = Math.sin(n * Math.PI / 4); // Phase shift

            const saturation = Math.max(20, Math.min(80,
                baseHsl.s * (0.7 + amplitude * 0.3) + phase * 10
            ));
            const lightness = Math.max(25, Math.min(75,
                baseHsl.l * (0.8 + amplitude * 0.2) + phase * 5
            ));

            colors.push(this.createColorObject(
                { h: hue, s: saturation, l: lightness },
                `fourier_harmonic_${n}`,
                hue - baseHsl.h
            ));
        }

        return colors;
    }

    /**
     * Generate harmony using geometric progression models
     * @param {Object} baseHsl - Base color in HSL format
     * @param {number} ratio - Geometric progression ratio
     * @param {number} count - Number of colors to generate
     * @returns {Array} Array of colors in geometric progression
     */
    generateGeometricProgressionHarmony(baseHsl, ratio = 1.618, count = 6) {
        const colors = [];
        let currentMultiplier = 1;

        for (let i = 0; i < count; i++) {
            const hueShift = (currentMultiplier * 30) % 360; // Scale to reasonable hue shifts
            const hue = (baseHsl.h + hueShift) % 360;

            // Apply geometric progression to saturation and lightness
            const saturationFactor = Math.pow(0.95, i); // Gentle decrease
            const lightnessFactor = 1 + Math.sin(currentMultiplier) * 0.1; // Oscillating pattern

            const saturation = Math.max(15, Math.min(85, baseHsl.s * saturationFactor));
            const lightness = Math.max(20, Math.min(80, baseHsl.l * lightnessFactor));

            colors.push(this.createColorObject(
                { h: hue, s: saturation, l: lightness },
                `geometric_${i}`,
                hueShift
            ));

            currentMultiplier *= ratio;
        }

        return colors;
    }

    /**
     * Apply matrix transformations to color space
     * @param {Array} colors - Array of color objects
     * @param {Array} transformMatrix - 3x3 transformation matrix
     * @returns {Array} Transformed colors
     */
    applyMatrixTransformation(colors, transformMatrix = null) {
        if (!transformMatrix) {
            // Default transformation matrix for color enhancement
            transformMatrix = [
                [1.1, 0.1, 0.0],   // Enhance red component
                [0.0, 1.0, 0.1],   // Enhance green component
                [0.1, 0.0, 1.1]    // Enhance blue component
            ];
        }

        return colors.map(color => {
            const { r, g, b } = ColorConversions.hslToRgb(color.hsl.h, color.hsl.s, color.hsl.l);
            const rgbVector = [r / 255, g / 255, b / 255];

            // Apply matrix transformation
            const transformedRgb = this.multiplyMatrixVector(transformMatrix, rgbVector);

            // Clamp values and convert back
            const clampedRgb = transformedRgb.map(val => Math.max(0, Math.min(255, val * 255)));
            const transformedHsl = ColorConversions.rgbToHsl(clampedRgb[0], clampedRgb[1], clampedRgb[2]);

            return this.createColorObject(transformedHsl, `matrix_${color.role}`, color.angle);
        });
    }

    /**
     * Matrix-vector multiplication
     * @param {Array} matrix - 3x3 matrix
     * @param {Array} vector - 3D vector
     * @returns {Array} Result vector
     */
    multiplyMatrixVector(matrix, vector) {
        return matrix.map(row =>
            row.reduce((sum, element, index) => sum + element * vector[index], 0)
        );
    }

    /**
     * Calculate color relationships using wavelength analysis
     * @param {Object} baseHsl - Base color in HSL format
     * @param {Array} targetHues - Array of target hues for analysis
     * @returns {Object} Wavelength-based analysis
     */
    analyzeWavelengthRelationships(baseHsl, targetHues = []) {
        const baseWavelength = this.hueToWavelength(baseHsl.h);
        const analysis = {
            baseWavelength,
            harmonicRelationships: [],
            dissonantRelationships: [],
            recommendations: []
        };

        targetHues.forEach(hue => {
            const targetWavelength = this.hueToWavelength(hue);
            const wavelengthRatio = targetWavelength / baseWavelength;
            const frequency = 299792458 / (targetWavelength * 1e-9); // Speed of light / wavelength
            const baseFrequency = 299792458 / (baseWavelength * 1e-9);
            const frequencyRatio = frequency / baseFrequency;

            // Check for harmonic relationships (simple ratios)
            const isHarmonic = this.isHarmonicRatio(frequencyRatio);

            const relationship = {
                hue,
                wavelength: targetWavelength,
                wavelengthRatio: Math.round(wavelengthRatio * 1000) / 1000,
                frequencyRatio: Math.round(frequencyRatio * 1000) / 1000,
                isHarmonic,
                quality: isHarmonic ? 'harmonic' : 'dissonant'
            };

            if (isHarmonic) {
                analysis.harmonicRelationships.push(relationship);
            } else {
                analysis.dissonantRelationships.push(relationship);
            }
        });

        return analysis;
    }

    /**
     * Convert hue to approximate wavelength
     * @param {number} hue - Hue value (0-360)
     * @returns {number} Wavelength in nanometers
     */
    hueToWavelength(hue) {
        // Approximate mapping of hue to visible spectrum wavelength
        const hueNormalized = hue / 360;
        return 380 + (700 - 380) * hueNormalized; // 380nm (violet) to 700nm (red)
    }

    /**
     * Check if a ratio represents a harmonic relationship
     * @param {number} ratio - Frequency ratio
     * @returns {boolean} True if harmonic
     */
    isHarmonicRatio(ratio) {
        const harmonicRatios = [1, 2, 3/2, 4/3, 5/4, 6/5, 8/7, 9/8, 16/15];
        const tolerance = 0.05;

        return harmonicRatios.some(harmonic =>
            Math.abs(ratio - harmonic) < tolerance ||
            Math.abs(ratio - 1/harmonic) < tolerance
        );
    }

    /**
     * Optimize color harmony using genetic algorithm
     * @param {Object} baseHsl - Base color in HSL format
     * @param {string} harmonyType - Type of harmony to optimize
     * @param {Object} options - Optimization parameters
     * @returns {Object} Optimized harmony
     */
    optimizeHarmonyGenetic(baseHsl, harmonyType, options = {}) {
        const populationSize = options.populationSize || 50;
        const generations = options.generations || 100;
        const mutationRate = options.mutationRate || 0.1;
        const crossoverRate = options.crossoverRate || 0.7;

        // Initialize population
        let population = this.initializePopulation(baseHsl, harmonyType, populationSize);

        for (let generation = 0; generation < generations; generation++) {
            // Evaluate fitness
            const fitnessScores = population.map(individual =>
                this.evaluateHarmonyFitness(individual)
            );

            // Selection, crossover, and mutation
            population = this.evolvePopulation(population, fitnessScores, crossoverRate, mutationRate);
        }

        // Return best individual
        const finalFitness = population.map(individual => this.evaluateHarmonyFitness(individual));
        const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));

        return {
            optimizedColors: population[bestIndex],
            fitness: finalFitness[bestIndex],
            generations,
            optimization: 'genetic_algorithm'
        };
    }

    /**
     * Initialize genetic algorithm population
     * @param {Object} baseHsl - Base color in HSL format
     * @param {string} harmonyType - Type of harmony
     * @param {number} populationSize - Size of population
     * @returns {Array} Initial population
     */
    initializePopulation(baseHsl, harmonyType, populationSize) {
        const population = [];
        const harmonyDefinition = this.harmonyTypes[harmonyType];

        for (let i = 0; i < populationSize; i++) {
            const individual = this.generateHarmonyColors(baseHsl, harmonyDefinition, {
                saturationVariation: Math.random() * 0.3,
                lightnessVariation: Math.random() * 0.3
            });
            population.push(individual);
        }

        return population;
    }

    /**
     * Evaluate fitness of harmony individual
     * @param {Array} individual - Array of colors representing an individual
     * @returns {number} Fitness score
     */
    evaluateHarmonyFitness(individual) {
        const harmonyAnalysis = this.analyzeHarmonyQuality(individual);
        return harmonyAnalysis.score;
    }

    /**
     * Evolve population using genetic operators
     * @param {Array} population - Current population
     * @param {Array} fitnessScores - Fitness scores for each individual
     * @param {number} crossoverRate - Crossover probability
     * @param {number} mutationRate - Mutation probability
     * @returns {Array} New population
     */
    evolvePopulation(population, fitnessScores, crossoverRate, mutationRate) {
        const newPopulation = [];
        const populationSize = population.length;

        // Elitism: keep best individuals
        const eliteCount = Math.floor(populationSize * 0.1);
        const sortedIndices = fitnessScores
            .map((score, index) => ({ score, index }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.index);

        for (let i = 0; i < eliteCount; i++) {
            newPopulation.push([...population[sortedIndices[i]]]);
        }

        // Generate offspring
        while (newPopulation.length < populationSize) {
            const parent1 = this.tournamentSelection(population, fitnessScores);
            const parent2 = this.tournamentSelection(population, fitnessScores);

            let offspring1, offspring2;
            if (Math.random() < crossoverRate) {
                [offspring1, offspring2] = this.crossover(parent1, parent2);
            } else {
                offspring1 = [...parent1];
                offspring2 = [...parent2];
            }

            if (Math.random() < mutationRate) {
                offspring1 = this.mutate(offspring1);
            }
            if (Math.random() < mutationRate) {
                offspring2 = this.mutate(offspring2);
            }

            newPopulation.push(offspring1);
            if (newPopulation.length < populationSize) {
                newPopulation.push(offspring2);
            }
        }

        return newPopulation;
    }

    /**
     * Tournament selection for genetic algorithm
     * @param {Array} population - Current population
     * @param {Array} fitnessScores - Fitness scores
     * @returns {Array} Selected individual
     */
    tournamentSelection(population, fitnessScores) {
        const tournamentSize = 3;
        let best = Math.floor(Math.random() * population.length);

        for (let i = 1; i < tournamentSize; i++) {
            const candidate = Math.floor(Math.random() * population.length);
            if (fitnessScores[candidate] > fitnessScores[best]) {
                best = candidate;
            }
        }

        return [...population[best]];
    }

    /**
     * Crossover operation for genetic algorithm
     * @param {Array} parent1 - First parent
     * @param {Array} parent2 - Second parent
     * @returns {Array} Two offspring
     */
    crossover(parent1, parent2) {
        const crossoverPoint = Math.floor(Math.random() * parent1.length);
        const offspring1 = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
        const offspring2 = [...parent2.slice(0, crossoverPoint), ...parent1.slice(crossoverPoint)];

        return [offspring1, offspring2];
    }

    /**
     * Mutation operation for genetic algorithm
     * @param {Array} individual - Individual to mutate
     * @returns {Array} Mutated individual
     */
    mutate(individual) {
        const mutated = [...individual];
        const mutationIndex = Math.floor(Math.random() * mutated.length);
        const color = mutated[mutationIndex];

        // Mutate HSL values slightly
        const mutatedHsl = {
            h: (color.hsl.h + (Math.random() - 0.5) * 20) % 360,
            s: Math.max(0, Math.min(100, color.hsl.s + (Math.random() - 0.5) * 20)),
            l: Math.max(0, Math.min(100, color.hsl.l + (Math.random() - 0.5) * 20))
        };

        mutated[mutationIndex] = this.createColorObject(mutatedHsl, color.role, color.angle);
        return mutated;
    }

    /**
     * Create standardized color object
     * @param {Object} hsl - HSL color values
     * @param {string} role - Color role/name
     * @param {number} angle - Hue angle from base
     * @returns {Object} Standardized color object
     */
    createColorObject(hsl, role, angle) {
        const rgb = ColorConversions.hslToRgb(hsl.h, hsl.s, hsl.l);
        const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);
        const lab = ColorConversions.rgbToLab(rgb.r, rgb.g, rgb.b);

        return {
            role,
            hex,
            rgb,
            hsl,
            lab,
            temperature: ColorConversions.getColorTemperature(rgb),
            angle,
            significance: this.getColorSignificance(hsl.h, 'turkish')
        };
    }

    /**
     * Advanced harmony generation with multiple mathematical models
     * @param {string} baseColorHex - Base color in hex format
     * @param {Object} options - Advanced options
     * @returns {Object} Comprehensive harmony with multiple mathematical approaches
     */
    generateAdvancedMathematicalHarmony(baseColorHex, options = {}) {
        try {
            const baseRgb = ColorConversions.hexToRgb(baseColorHex);
            const baseHsl = ColorConversions.rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

            const analysis = {
                success: true,
                baseColor: { hex: baseColorHex, rgb: baseRgb, hsl: baseHsl },
                mathematicalHarmonies: {}
            };

            // Apply different mathematical models
            if (options.includeFibonacci !== false) {
                analysis.mathematicalHarmonies.fibonacci = this.generateFibonacciHarmony(baseHsl, options);
            }

            if (options.includeBezier !== false) {
                analysis.mathematicalHarmonies.bezier = this.generateBezierHarmony(baseHsl, options.bezierControls, options.bezierSteps);
            }

            if (options.includeFourier !== false) {
                analysis.mathematicalHarmonies.fourier = this.generateFourierHarmony(baseHsl, options.harmonics);
            }

            if (options.includeGeometric !== false) {
                analysis.mathematicalHarmonies.geometric = this.generateGeometricProgressionHarmony(baseHsl, options.geometricRatio, options.geometricCount);
            }

            if (options.includeWavelength !== false && options.targetHues) {
                analysis.wavelengthAnalysis = this.analyzeWavelengthRelationships(baseHsl, options.targetHues);
            }

            if (options.optimizeGenetic) {
                analysis.geneticOptimization = this.optimizeHarmonyGenetic(baseHsl, options.harmonyType || 'triadic', options.geneticOptions);
            }

            // Calculate cross-model compatibility scores
            analysis.compatibilityAnalysis = this.analyzeCrossModelCompatibility(analysis.mathematicalHarmonies);

            return analysis;

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze compatibility between different mathematical models
     * @param {Object} harmonies - Object containing different harmony models
     * @returns {Object} Compatibility analysis
     */
    analyzeCrossModelCompatibility(harmonies) {
        const modelKeys = Object.keys(harmonies);
        const compatibility = {
            overallScore: 0,
            pairwiseScores: {},
            recommendations: []
        };

        let totalComparisons = 0;
        let totalScore = 0;

        for (let i = 0; i < modelKeys.length; i++) {
            for (let j = i + 1; j < modelKeys.length; j++) {
                const model1 = modelKeys[i];
                const model2 = modelKeys[j];
                const score = this.calculateModelCompatibility(harmonies[model1], harmonies[model2]);

                compatibility.pairwiseScores[`${model1}_${model2}`] = score;
                totalScore += score;
                totalComparisons++;
            }
        }

        compatibility.overallScore = totalComparisons > 0 ? Math.round(totalScore / totalComparisons) : 0;

        // Generate recommendations based on compatibility
        if (compatibility.overallScore < 60) {
            compatibility.recommendations.push('Consider using fewer mathematical models for better harmony consistency');
        } else if (compatibility.overallScore > 85) {
            compatibility.recommendations.push('Excellent mathematical harmony - all models complement each other well');
        }

        return compatibility;
    }

    /**
     * Calculate compatibility between two harmony models
     * @param {Array} harmony1 - First harmony colors
     * @param {Array} harmony2 - Second harmony colors
     * @returns {number} Compatibility score (0-100)
     */
    calculateModelCompatibility(harmony1, harmony2) {
        if (!harmony1 || !harmony2 || harmony1.length === 0 || harmony2.length === 0) {
            return 0;
        }

        let totalDistance = 0;
        let comparisons = 0;

        harmony1.forEach(color1 => {
            harmony2.forEach(color2 => {
                const distance = DeltaE.cie94(color1.lab, color2.lab);
                totalDistance += distance;
                comparisons++;
            });
        });

        const averageDistance = totalDistance / comparisons;

        // Convert distance to compatibility score (closer colors = higher compatibility)
        // Optimal distance is around 15-25 Delta E units
        let score = 100;
        if (averageDistance < 10) score = 70; // Too similar
        else if (averageDistance > 40) score = 60; // Too different
        else if (averageDistance >= 15 && averageDistance <= 25) score = 100; // Perfect
        else score = 85; // Good

        return Math.max(0, Math.min(100, score));
    }
}

module.exports = AdvancedColorHarmony;