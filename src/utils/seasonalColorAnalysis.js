/**
 * Seasonal Color Analysis System
 * Implements sophisticated seasonal color theory for the Sanzo Color Advisor
 *
 * Features:
 * - Four-season color analysis (Spring, Summer, Autumn, Winter)
 * - Sub-seasonal categories (Light Spring, Deep Winter, etc.)
 * - Personal color temperature analysis
 * - Seasonal palette generation with cultural adaptations
 * - Undertone analysis and matching
 * - Lifestyle-based seasonal recommendations
 */

const ColorConversions = require('./colorConversions');
const DeltaE = require('./deltaE');

class SeasonalColorAnalysis {

    constructor() {
        this.initializeSeasonalProfiles();
        this.initializeSubSeasons();
        this.initializeUndertoneMap();
        this.initializeCulturalSeasons();
    }

    /**
     * Initialize main seasonal color profiles
     */
    initializeSeasonalProfiles() {
        this.seasonalProfiles = {
            spring: {
                name: 'Spring',
                description: 'Warm, light, and clear colors with yellow undertones',
                characteristics: {
                    temperature: 'warm',
                    clarity: 'clear',
                    intensity: 'bright',
                    undertone: 'yellow-based'
                },
                colorProperties: {
                    hue: {
                        preferred: [30, 60, 90, 150, 300], // Yellow-greens, warm blues, coral
                        avoid: [210, 240, 270] // Cool blues, purples
                    },
                    saturation: { min: 40, max: 85, optimal: 65 },
                    lightness: { min: 50, max: 90, optimal: 70 },
                    contrast: 'medium'
                },
                psychology: 'Energetic, optimistic, fresh, youthful',
                bestFor: ['casual wear', 'creative spaces', 'children areas', 'spring decorating'],
                personality: ['outgoing', 'creative', 'energetic', 'friendly'],
                lifestyle: ['active', 'social', 'outdoor-loving', 'spontaneous'],
                coreColors: {
                    // Warm, clear colors
                    'spring_coral': '#FF7F7F',
                    'spring_peach': '#FFCC99',
                    'spring_yellow': '#FFD700',
                    'spring_green': '#90EE90',
                    'spring_turquoise': '#40E0D0',
                    'spring_periwinkle': '#CCCCFF'
                }
            },

            summer: {
                name: 'Summer',
                description: 'Cool, light, and soft colors with blue undertones',
                characteristics: {
                    temperature: 'cool',
                    clarity: 'soft',
                    intensity: 'muted',
                    undertone: 'blue-based'
                },
                colorProperties: {
                    hue: {
                        preferred: [180, 210, 240, 270, 330], // Cool blues, lavenders, soft pinks
                        avoid: [30, 45, 60] // Warm yellows, oranges
                    },
                    saturation: { min: 20, max: 60, optimal: 40 },
                    lightness: { min: 60, max: 95, optimal: 80 },
                    contrast: 'low'
                },
                psychology: 'Serene, elegant, refined, gentle',
                bestFor: ['formal wear', 'bedrooms', 'relaxation spaces', 'elegant interiors'],
                personality: ['gentle', 'refined', 'diplomatic', 'graceful'],
                lifestyle: ['sophisticated', 'cultural', 'peaceful', 'traditional'],
                coreColors: {
                    // Cool, muted colors
                    'summer_rose': '#F4C2C2',
                    'summer_lavender': '#E6E6FA',
                    'summer_powder_blue': '#B0E0E6',
                    'summer_sage': '#9CAF88',
                    'summer_pearl': '#F8F8FF',
                    'summer_mauve': '#E0B0FF'
                }
            },

            autumn: {
                name: 'Autumn',
                description: 'Warm, deep, and rich colors with golden undertones',
                characteristics: {
                    temperature: 'warm',
                    clarity: 'muted',
                    intensity: 'deep',
                    undertone: 'golden-based'
                },
                colorProperties: {
                    hue: {
                        preferred: [15, 45, 75, 105, 315], // Warm oranges, golds, olive greens
                        avoid: [195, 225, 255] // Cool blues, icy colors
                    },
                    saturation: { min: 35, max: 80, optimal: 60 },
                    lightness: { min: 25, max: 70, optimal: 45 },
                    contrast: 'medium-high'
                },
                psychology: 'Rich, sophisticated, earthy, grounded',
                bestFor: ['formal spaces', 'libraries', 'warm interiors', 'traditional settings'],
                personality: ['sophisticated', 'reliable', 'warm', 'grounded'],
                lifestyle: ['traditional', 'comfortable', 'nature-loving', 'established'],
                coreColors: {
                    // Warm, rich colors
                    'autumn_rust': '#B7410E',
                    'autumn_gold': '#FFD700',
                    'autumn_olive': '#808000',
                    'autumn_burgundy': '#800020',
                    'autumn_bronze': '#CD7F32',
                    'autumn_terracotta': '#E2725B'
                }
            },

            winter: {
                name: 'Winter',
                description: 'Cool, deep, and clear colors with blue undertones',
                characteristics: {
                    temperature: 'cool',
                    clarity: 'clear',
                    intensity: 'vivid',
                    undertone: 'blue-based'
                },
                colorProperties: {
                    hue: {
                        preferred: [195, 225, 255, 285, 315], // Cool blues, purples, cool reds
                        avoid: [30, 45, 60] // Warm yellows, oranges
                    },
                    saturation: { min: 50, max: 100, optimal: 75 },
                    lightness: { min: 15, max: 85, optimal: 50 },
                    contrast: 'high'
                },
                psychology: 'Bold, confident, dramatic, sophisticated',
                bestFor: ['dramatic interiors', 'modern spaces', 'formal settings', 'statement pieces'],
                personality: ['confident', 'dramatic', 'sophisticated', 'bold'],
                lifestyle: ['modern', 'urban', 'professional', 'trendsetting'],
                coreColors: {
                    // Cool, vivid colors
                    'winter_navy': '#000080',
                    'winter_royal_blue': '#4169E1',
                    'winter_emerald': '#50C878',
                    'winter_magenta': '#FF00FF',
                    'winter_black': '#000000',
                    'winter_white': '#FFFFFF'
                }
            }
        };
    }

    /**
     * Initialize sub-seasonal categories for more precise analysis
     */
    initializeSubSeasons() {
        this.subSeasons = {
            // Spring variants
            light_spring: {
                parent: 'spring',
                name: 'Light Spring',
                description: 'The lightest and most delicate of springs',
                adjustments: {
                    lightness: { min: 70, max: 95, optimal: 85 },
                    saturation: { min: 30, max: 65, optimal: 50 }
                },
                keyCharacteristics: ['very light', 'delicate', 'fresh']
            },
            warm_spring: {
                parent: 'spring',
                name: 'Warm Spring',
                description: 'The warmest spring with golden undertones',
                adjustments: {
                    hue: { emphasis: [30, 45, 60] }, // More golden/orange
                    saturation: { min: 50, max: 85, optimal: 70 }
                },
                keyCharacteristics: ['golden', 'warm', 'vibrant']
            },
            clear_spring: {
                parent: 'spring',
                name: 'Clear Spring',
                description: 'The most vivid spring with high clarity',
                adjustments: {
                    saturation: { min: 60, max: 90, optimal: 80 },
                    contrast: 'high'
                },
                keyCharacteristics: ['vivid', 'clear', 'bright']
            },

            // Summer variants
            light_summer: {
                parent: 'summer',
                name: 'Light Summer',
                description: 'The lightest summer with ash undertones',
                adjustments: {
                    lightness: { min: 75, max: 95, optimal: 85 },
                    saturation: { min: 15, max: 45, optimal: 30 }
                },
                keyCharacteristics: ['ash', 'light', 'subtle']
            },
            cool_summer: {
                parent: 'summer',
                name: 'Cool Summer',
                description: 'The coolest summer with blue undertones',
                adjustments: {
                    hue: { emphasis: [210, 240, 270] }, // More blue/purple
                    saturation: { min: 25, max: 55, optimal: 40 }
                },
                keyCharacteristics: ['cool', 'blue-based', 'refined']
            },
            soft_summer: {
                parent: 'summer',
                name: 'Soft Summer',
                description: 'The most muted summer',
                adjustments: {
                    saturation: { min: 15, max: 40, optimal: 25 },
                    contrast: 'very_low'
                },
                keyCharacteristics: ['muted', 'soft', 'gentle']
            },

            // Autumn variants
            soft_autumn: {
                parent: 'autumn',
                name: 'Soft Autumn',
                description: 'The most muted autumn',
                adjustments: {
                    saturation: { min: 25, max: 55, optimal: 40 },
                    lightness: { min: 35, max: 75, optimal: 55 }
                },
                keyCharacteristics: ['muted', 'gentle', 'natural']
            },
            warm_autumn: {
                parent: 'autumn',
                name: 'Warm Autumn',
                description: 'The warmest autumn with golden undertones',
                adjustments: {
                    hue: { emphasis: [30, 45] }, // More golden
                    saturation: { min: 45, max: 80, optimal: 65 }
                },
                keyCharacteristics: ['golden', 'warm', 'rich']
            },
            deep_autumn: {
                parent: 'autumn',
                name: 'Deep Autumn',
                description: 'The darkest autumn',
                adjustments: {
                    lightness: { min: 20, max: 60, optimal: 40 },
                    saturation: { min: 50, max: 85, optimal: 70 }
                },
                keyCharacteristics: ['deep', 'rich', 'intense']
            },

            // Winter variants
            deep_winter: {
                parent: 'winter',
                name: 'Deep Winter',
                description: 'The darkest winter',
                adjustments: {
                    lightness: { min: 10, max: 70, optimal: 35 },
                    saturation: { min: 60, max: 100, optimal: 80 }
                },
                keyCharacteristics: ['deep', 'dramatic', 'intense']
            },
            cool_winter: {
                parent: 'winter',
                name: 'Cool Winter',
                description: 'The coolest winter with icy undertones',
                adjustments: {
                    hue: { emphasis: [195, 225, 255] }, // More blue/icy
                    saturation: { min: 40, max: 90, optimal: 65 }
                },
                keyCharacteristics: ['icy', 'cool', 'sharp']
            },
            clear_winter: {
                parent: 'winter',
                name: 'Clear Winter',
                description: 'The most vivid winter',
                adjustments: {
                    saturation: { min: 70, max: 100, optimal: 85 },
                    contrast: 'very_high'
                },
                keyCharacteristics: ['vivid', 'clear', 'striking']
            }
        };
    }

    /**
     * Initialize undertone mapping system
     */
    initializeUndertoneMap() {
        this.undertoneMap = {
            warm: {
                indicators: ['golden', 'yellow', 'orange', 'peach'],
                hueRanges: [
                    { min: 15, max: 75 }, // Yellow-orange range
                    { min: 315, max: 360 } // Red range
                ],
                seasons: ['spring', 'autumn']
            },
            cool: {
                indicators: ['blue', 'pink', 'purple', 'ash'],
                hueRanges: [
                    { min: 180, max: 300 } // Blue-purple range
                ],
                seasons: ['summer', 'winter']
            },
            neutral: {
                indicators: ['beige', 'gray', 'balanced'],
                hueRanges: [
                    { min: 75, max: 180 } // Green range (can be warm or cool)
                ],
                seasons: ['any'] // Can work with any season with adjustments
            }
        };
    }

    /**
     * Initialize cultural seasonal adaptations
     */
    initializeCulturalSeasons() {
        this.culturalSeasons = {
            turkish: {
                spring: {
                    culturalColors: {
                        'tulip_red': '#E53E3E',
                        'bosphorus_blue': '#3182CE',
                        'anatolian_green': '#38A169',
                        'saffron_yellow': '#F6AD55'
                    },
                    festivals: ['Nevruz', 'Hıdırellez'],
                    significance: 'Rebirth and renewal in Turkish culture'
                },
                summer: {
                    culturalColors: {
                        'aegean_azure': '#4299E1',
                        'mediterranean_turquoise': '#38B2AC',
                        'lavender_fields': '#9F7AEA',
                        'pearl_white': '#F7FAFC'
                    },
                    festivals: ['Yaz Bayramı'],
                    significance: 'Coastal life and summer traditions'
                },
                autumn: {
                    culturalColors: {
                        'harvest_gold': '#D69E2E',
                        'pomegranate_red': '#C53030',
                        'hazelnut_brown': '#9C4221',
                        'olive_green': '#68D391'
                    },
                    festivals: ['Hasat Bayramı'],
                    significance: 'Harvest time and preparation for winter'
                },
                winter: {
                    culturalColors: {
                        'snow_white': '#FFFFFF',
                        'evergreen': '#22543D',
                        'burgundy_wine': '#742A2A',
                        'midnight_blue': '#1A202C'
                    },
                    festivals: ['Kış Gündönümü'],
                    significance: 'Contemplation and inner strength'
                }
            }
        };
    }

    /**
     * Analyze user's seasonal color profile
     * @param {Object} options - Analysis options
     * @returns {Object} Seasonal analysis results
     */
    analyzeSeasonalProfile(options = {}) {
        const {
            providedColors = [],
            personalPreferences = {},
            lifestyle = {},
            culture = 'general'
        } = options;

        try {
            // Analyze provided colors for seasonal tendencies
            const colorAnalysis = this.analyzeColorTendencies(providedColors);

            // Determine primary season
            const primarySeason = this.determinePrimarySeason(colorAnalysis, personalPreferences);

            // Determine sub-season for more precision
            const subSeason = this.determineSubSeason(primarySeason, colorAnalysis, personalPreferences);

            // Generate personalized palette
            const personalizedPalette = this.generatePersonalizedPalette(
                primarySeason, subSeason, culture, lifestyle
            );

            // Analyze lifestyle compatibility
            const lifestyleAnalysis = this.analyzeLifestyleCompatibility(
                primarySeason, lifestyle
            );

            // Generate recommendations
            const recommendations = this.generateSeasonalRecommendations(
                primarySeason, subSeason, personalizedPalette, lifestyle
            );

            return {
                success: true,
                profile: {
                    primarySeason,
                    subSeason,
                    confidence: this.calculateSeasonalConfidence(colorAnalysis, personalPreferences),
                    characteristics: this.seasonalProfiles[primarySeason].characteristics
                },
                analysis: {
                    colorTendencies: colorAnalysis,
                    lifestyle: lifestyleAnalysis,
                    culturalAlignment: culture !== 'general' ? this.culturalSeasons[culture] : null
                },
                palette: personalizedPalette,
                recommendations,
                metadata: {
                    analysisDate: new Date().toISOString(),
                    colorCount: providedColors.length,
                    culture
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze color tendencies from provided colors
     */
    analyzeColorTendencies(colors) {
        if (!colors || colors.length === 0) {
            return {
                temperature: { warm: 0, cool: 0, neutral: 0 },
                saturation: { average: 50, range: 0 },
                lightness: { average: 50, range: 0 },
                hueDistribution: {},
                seasonalLeanings: {}
            };
        }

        const analysis = {
            temperature: { warm: 0, cool: 0, neutral: 0 },
            saturation: { values: [], average: 0, range: 0 },
            lightness: { values: [], average: 0, range: 0 },
            hueDistribution: {},
            seasonalLeanings: { spring: 0, summer: 0, autumn: 0, winter: 0 }
        };

        colors.forEach(colorHex => {
            const rgb = ColorConversions.hexToRgb(colorHex);
            if (!rgb) return;

            const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const temp = ColorConversions.getColorTemperature(rgb);

            // Temperature analysis
            analysis.temperature[temp.type]++;

            // Saturation and lightness collection
            analysis.saturation.values.push(hsl.s);
            analysis.lightness.values.push(hsl.l);

            // Hue distribution
            const hueGroup = Math.floor(hsl.h / 30) * 30;
            analysis.hueDistribution[hueGroup] = (analysis.hueDistribution[hueGroup] || 0) + 1;

            // Seasonal leaning analysis
            this.evaluateColorSeasonality(hsl, analysis.seasonalLeanings);
        });

        // Calculate averages and ranges
        if (analysis.saturation.values.length > 0) {
            analysis.saturation.average = Math.round(
                analysis.saturation.values.reduce((sum, val) => sum + val, 0) / analysis.saturation.values.length
            );
            analysis.saturation.range = Math.max(...analysis.saturation.values) - Math.min(...analysis.saturation.values);

            analysis.lightness.average = Math.round(
                analysis.lightness.values.reduce((sum, val) => sum + val, 0) / analysis.lightness.values.length
            );
            analysis.lightness.range = Math.max(...analysis.lightness.values) - Math.min(...analysis.lightness.values);
        }

        return analysis;
    }

    /**
     * Evaluate how well a color fits each season
     */
    evaluateColorSeasonality(hsl, seasonalLeanings) {
        Object.entries(this.seasonalProfiles).forEach(([season, profile]) => {
            let score = 0;

            // Check saturation fit
            const satRange = profile.colorProperties.saturation;
            if (hsl.s >= satRange.min && hsl.s <= satRange.max) {
                score += 2;
                if (Math.abs(hsl.s - satRange.optimal) < 10) score += 1;
            }

            // Check lightness fit
            const lightRange = profile.colorProperties.lightness;
            if (hsl.l >= lightRange.min && hsl.l <= lightRange.max) {
                score += 2;
                if (Math.abs(hsl.l - lightRange.optimal) < 10) score += 1;
            }

            // Check hue preferences
            const preferredHues = profile.colorProperties.hue.preferred;
            const avoidHues = profile.colorProperties.hue.avoid;

            for (const preferredHue of preferredHues) {
                if (Math.abs(hsl.h - preferredHue) < 15) {
                    score += 3;
                    break;
                }
            }

            for (const avoidHue of avoidHues) {
                if (Math.abs(hsl.h - avoidHue) < 15) {
                    score -= 2;
                    break;
                }
            }

            seasonalLeanings[season] += score;
        });
    }

    /**
     * Determine primary season based on analysis
     */
    determinePrimarySeason(colorAnalysis, personalPreferences) {
        const scores = { ...colorAnalysis.seasonalLeanings };

        // Apply personal preference adjustments
        if (personalPreferences.preferredTemperature) {
            if (personalPreferences.preferredTemperature === 'warm') {
                scores.spring += 2;
                scores.autumn += 2;
            } else if (personalPreferences.preferredTemperature === 'cool') {
                scores.summer += 2;
                scores.winter += 2;
            }
        }

        if (personalPreferences.preferredIntensity) {
            if (personalPreferences.preferredIntensity === 'bright') {
                scores.spring += 2;
                scores.winter += 1;
            } else if (personalPreferences.preferredIntensity === 'soft') {
                scores.summer += 2;
                scores.autumn += 1;
            }
        }

        // Find highest scoring season
        return Object.entries(scores).reduce((best, [season, score]) =>
            score > scores[best] ? season : best
        , 'spring');
    }

    /**
     * Determine sub-season for more precise categorization
     */
    determineSubSeason(primarySeason, colorAnalysis, personalPreferences) {
        const subSeasonOptions = Object.entries(this.subSeasons)
            .filter(([_, subSeason]) => subSeason.parent === primarySeason);

        if (subSeasonOptions.length === 0) return null;

        let bestSubSeason = null;
        let bestScore = -1;

        subSeasonOptions.forEach(([subSeasonKey, subSeason]) => {
            let score = 0;

            // Check if color characteristics match adjustments
            const adjustments = subSeason.adjustments;

            if (adjustments.lightness) {
                const avgLight = colorAnalysis.lightness.average;
                if (avgLight >= adjustments.lightness.min && avgLight <= adjustments.lightness.max) {
                    score += 3;
                    if (Math.abs(avgLight - adjustments.lightness.optimal) < 10) score += 2;
                }
            }

            if (adjustments.saturation) {
                const avgSat = colorAnalysis.saturation.average;
                if (avgSat >= adjustments.saturation.min && avgSat <= adjustments.saturation.max) {
                    score += 3;
                    if (Math.abs(avgSat - adjustments.saturation.optimal) < 10) score += 2;
                }
            }

            // Personal preference alignment
            if (personalPreferences.personalityTraits) {
                const personalityMatch = personalPreferences.personalityTraits.some(trait =>
                    subSeason.keyCharacteristics.includes(trait.toLowerCase())
                );
                if (personalityMatch) score += 2;
            }

            if (score > bestScore) {
                bestScore = score;
                bestSubSeason = subSeasonKey;
            }
        });

        return bestSubSeason;
    }

    /**
     * Calculate confidence in seasonal analysis
     */
    calculateSeasonalConfidence(colorAnalysis, personalPreferences) {
        let confidence = 60; // Base confidence

        // Color count factor
        const colorCount = colorAnalysis.saturation.values.length;
        if (colorCount >= 5) confidence += 20;
        else if (colorCount >= 3) confidence += 10;
        else if (colorCount === 0) confidence = 30;

        // Seasonal leaning clarity
        const seasonalScores = Object.values(colorAnalysis.seasonalLeanings);
        const maxScore = Math.max(...seasonalScores);
        const secondMaxScore = seasonalScores.sort((a, b) => b - a)[1] || 0;

        if (maxScore > secondMaxScore * 1.5) confidence += 15;
        else if (maxScore > secondMaxScore * 1.2) confidence += 8;

        // Personal preference alignment
        if (personalPreferences.preferredTemperature || personalPreferences.preferredIntensity) {
            confidence += 10;
        }

        return Math.min(100, Math.max(30, confidence));
    }

    /**
     * Generate personalized color palette
     */
    generatePersonalizedPalette(primarySeason, subSeason, culture, lifestyle) {
        const seasonProfile = this.seasonalProfiles[primarySeason];
        const subSeasonProfile = subSeason ? this.subSeasons[subSeason] : null;

        const palette = {
            primary: [],
            secondary: [],
            accent: [],
            neutral: []
        };

        // Base palette from seasonal profile
        const coreColors = Object.entries(seasonProfile.coreColors);

        // Apply sub-season adjustments if available
        const colorProperties = subSeasonProfile ?
            this.mergeColorProperties(seasonProfile.colorProperties, subSeasonProfile.adjustments) :
            seasonProfile.colorProperties;

        // Generate primary colors (main seasonal colors)
        coreColors.slice(0, 3).forEach(([name, hex]) => {
            palette.primary.push(this.adjustColorForProfile(hex, colorProperties, 'primary'));
        });

        // Generate secondary colors (supporting colors)
        for (let i = 0; i < 4; i++) {
            const baseHue = (i * 90) % 360;
            const secondaryColor = this.generateColorWithProperties(baseHue, colorProperties, 'secondary');
            palette.secondary.push(secondaryColor);
        }

        // Generate accent colors (small doses, high impact)
        for (let i = 0; i < 3; i++) {
            const baseHue = (i * 120 + 60) % 360;
            const accentColor = this.generateColorWithProperties(baseHue, colorProperties, 'accent');
            palette.accent.push(accentColor);
        }

        // Generate neutral colors
        palette.neutral = this.generateNeutralPalette(colorProperties);

        // Add cultural colors if specified
        if (culture !== 'general' && this.culturalSeasons[culture]) {
            const culturalColors = this.culturalSeasons[culture][primarySeason]?.culturalColors;
            if (culturalColors) {
                palette.cultural = Object.entries(culturalColors).map(([name, hex]) => ({
                    name,
                    hex,
                    significance: `Traditional ${culture} ${primarySeason} color`,
                    ...this.analyzeColorProperties(hex)
                }));
            }
        }

        return palette;
    }

    /**
     * Merge color properties with sub-season adjustments
     */
    mergeColorProperties(baseProperties, adjustments) {
        const merged = JSON.parse(JSON.stringify(baseProperties)); // Deep copy

        Object.entries(adjustments).forEach(([key, adjustment]) => {
            if (merged[key] && typeof adjustment === 'object') {
                Object.assign(merged[key], adjustment);
            }
        });

        return merged;
    }

    /**
     * Adjust existing color to fit seasonal profile
     */
    adjustColorForProfile(hex, colorProperties, role) {
        const rgb = ColorConversions.hexToRgb(hex);
        const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Adjust to fit properties while maintaining hue character
        const adjustedHsl = {
            h: hsl.h,
            s: Math.max(colorProperties.saturation.min, Math.min(colorProperties.saturation.max, hsl.s)),
            l: Math.max(colorProperties.lightness.min, Math.min(colorProperties.lightness.max, hsl.l))
        };

        const adjustedRgb = ColorConversions.hslToRgb(adjustedHsl.h, adjustedHsl.s, adjustedHsl.l);
        const adjustedHex = ColorConversions.rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);

        return {
            original: hex,
            adjusted: adjustedHex,
            role,
            properties: adjustedHsl,
            ...this.analyzeColorProperties(adjustedHex)
        };
    }

    /**
     * Generate color with specific properties
     */
    generateColorWithProperties(baseHue, colorProperties, role) {
        const roleAdjustments = {
            primary: { saturationMultiplier: 1.0, lightnessMultiplier: 1.0 },
            secondary: { saturationMultiplier: 0.8, lightnessMultiplier: 1.1 },
            accent: { saturationMultiplier: 1.2, lightnessMultiplier: 0.9 }
        };

        const adjustment = roleAdjustments[role] || roleAdjustments.primary;

        const saturation = Math.max(
            colorProperties.saturation.min,
            Math.min(
                colorProperties.saturation.max,
                colorProperties.saturation.optimal * adjustment.saturationMultiplier
            )
        );

        const lightness = Math.max(
            colorProperties.lightness.min,
            Math.min(
                colorProperties.lightness.max,
                colorProperties.lightness.optimal * adjustment.lightnessMultiplier
            )
        );

        const rgb = ColorConversions.hslToRgb(baseHue, saturation, lightness);
        const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);

        return {
            hex,
            role,
            properties: { h: baseHue, s: saturation, l: lightness },
            ...this.analyzeColorProperties(hex)
        };
    }

    /**
     * Generate neutral color palette
     */
    generateNeutralPalette(colorProperties) {
        const neutrals = [];
        const neutralHues = [0, 30, 60]; // Warm neutrals that work with most seasons

        neutralHues.forEach((hue, index) => {
            const saturation = Math.min(20, colorProperties.saturation.optimal * 0.3);
            const lightness = 20 + (index * 30); // Range from dark to light

            const rgb = ColorConversions.hslToRgb(hue, saturation, lightness);
            const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);

            neutrals.push({
                hex,
                role: 'neutral',
                name: index === 0 ? 'dark_neutral' : index === 1 ? 'medium_neutral' : 'light_neutral',
                properties: { h: hue, s: saturation, l: lightness },
                ...this.analyzeColorProperties(hex)
            });
        });

        return neutrals;
    }

    /**
     * Analyze color properties for additional context
     */
    analyzeColorProperties(hex) {
        const rgb = ColorConversions.hexToRgb(hex);
        const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const lab = ColorConversions.hexToLab(hex);
        const temperature = ColorConversions.getColorTemperature(rgb);

        return {
            rgb,
            hsl,
            lab,
            temperature,
            undertone: this.determineUndertone(hsl, temperature)
        };
    }

    /**
     * Determine color undertone
     */
    determineUndertone(hsl, temperature) {
        for (const [undertone, data] of Object.entries(this.undertoneMap)) {
            for (const range of data.hueRanges) {
                if (hsl.h >= range.min && hsl.h <= range.max) {
                    return {
                        type: undertone,
                        confidence: temperature.type === undertone ? 90 : 70,
                        indicators: data.indicators
                    };
                }
            }
        }

        return {
            type: 'neutral',
            confidence: 60,
            indicators: ['balanced']
        };
    }

    /**
     * Analyze lifestyle compatibility
     */
    analyzeLifestyleCompatibility(season, lifestyle) {
        const seasonProfile = this.seasonalProfiles[season];
        const compatibility = {
            score: 0,
            matches: [],
            suggestions: []
        };

        // Check lifestyle alignment
        if (lifestyle.activities) {
            const seasonalLifestyle = seasonProfile.lifestyle;
            const matches = lifestyle.activities.filter(activity =>
                seasonalLifestyle.some(trait => activity.toLowerCase().includes(trait))
            );

            compatibility.score += matches.length * 20;
            compatibility.matches.push(...matches);
        }

        // Check personality alignment
        if (lifestyle.personality) {
            const seasonalPersonality = seasonProfile.personality;
            const matches = lifestyle.personality.filter(trait =>
                seasonalPersonality.includes(trait.toLowerCase())
            );

            compatibility.score += matches.length * 15;
            compatibility.matches.push(...matches);
        }

        // Generate suggestions
        if (compatibility.score < 50) {
            compatibility.suggestions.push(
                `Consider incorporating ${season} colors gradually to find your comfort zone`
            );
        }

        if (compatibility.score > 80) {
            compatibility.suggestions.push(
                `Strong alignment with ${season} - embrace these colors confidently`
            );
        }

        return {
            ...compatibility,
            score: Math.min(100, compatibility.score)
        };
    }

    /**
     * Generate comprehensive seasonal recommendations
     */
    generateSeasonalRecommendations(primarySeason, subSeason, palette, lifestyle) {
        const seasonProfile = this.seasonalProfiles[primarySeason];
        const recommendations = [];

        // Color usage recommendations
        recommendations.push({
            category: 'color_usage',
            title: 'Color Application Guidelines',
            items: [
                {
                    area: 'Wall Colors',
                    recommendation: `Use ${primarySeason} secondary colors for main walls`,
                    colors: palette.secondary.slice(0, 2).map(c => c.hex)
                },
                {
                    area: 'Accent Colors',
                    recommendation: `Apply ${primarySeason} accent colors sparingly for impact`,
                    colors: palette.accent.map(c => c.hex)
                },
                {
                    area: 'Neutral Base',
                    recommendation: 'Use neutral colors as foundation',
                    colors: palette.neutral.map(c => c.hex)
                }
            ]
        });

        // Seasonal transition recommendations
        recommendations.push({
            category: 'seasonal_adaptation',
            title: 'Seasonal Adaptation Tips',
            items: [
                {
                    season: 'Spring',
                    tip: 'Add fresh flowers and lighter textiles'
                },
                {
                    season: 'Summer',
                    tip: 'Introduce cooling blues and whites'
                },
                {
                    season: 'Autumn',
                    tip: 'Incorporate warm textures and earth tones'
                },
                {
                    season: 'Winter',
                    tip: 'Add dramatic contrasts and rich textures'
                }
            ]
        });

        // Lifestyle integration
        if (lifestyle.roomTypes) {
            recommendations.push({
                category: 'room_application',
                title: 'Room-Specific Applications',
                items: lifestyle.roomTypes.map(room => ({
                    room,
                    recommendation: this.generateRoomRecommendation(room, primarySeason, palette)
                }))
            });
        }

        return recommendations;
    }

    /**
     * Generate room-specific recommendations
     */
    generateRoomRecommendation(room, season, palette) {
        const roomGuidelines = {
            bedroom: {
                spring: 'Use soft spring colors for energy and optimism',
                summer: 'Cool summer tones promote restful sleep',
                autumn: 'Warm autumn colors create cozy retreat',
                winter: 'Bold winter colors add drama and sophistication'
            },
            living_room: {
                spring: 'Bright spring colors encourage social interaction',
                summer: 'Elegant summer palette creates refined atmosphere',
                autumn: 'Rich autumn tones provide warmth and comfort',
                winter: 'Dramatic winter colors make bold statement'
            },
            kitchen: {
                spring: 'Fresh spring colors stimulate appetite and creativity',
                summer: 'Cool summer tones create clean, airy feeling',
                autumn: 'Warm autumn colors enhance cooking experience',
                winter: 'Strong winter colors add modern sophistication'
            }
        };

        return roomGuidelines[room]?.[season] || `Apply ${season} colors according to room function and natural light`;
    }

    /**
     * Compare seasonal palettes
     * @param {Array} seasons - Array of season names to compare
     * @param {Object} options - Comparison options
     * @returns {Object} Comparison results
     */
    compareSeasonalPalettes(seasons, options = {}) {
        if (!seasons || seasons.length < 2) {
            return { error: 'At least two seasons required for comparison' };
        }

        const comparison = {
            seasons: [],
            analysis: {
                temperatureDistribution: {},
                saturationRanges: {},
                lightnessRanges: {},
                recommendations: []
            }
        };

        // Analyze each season
        seasons.forEach(season => {
            if (!this.seasonalProfiles[season]) return;

            const profile = this.seasonalProfiles[season];
            const seasonData = {
                name: season,
                characteristics: profile.characteristics,
                colorProperties: profile.colorProperties,
                psychology: profile.psychology,
                bestFor: profile.bestFor
            };

            comparison.seasons.push(seasonData);

            // Aggregate for analysis
            const temp = profile.characteristics.temperature;
            comparison.analysis.temperatureDistribution[temp] =
                (comparison.analysis.temperatureDistribution[temp] || 0) + 1;
        });

        // Generate comparative recommendations
        comparison.analysis.recommendations = this.generateComparativeRecommendations(comparison.seasons);

        return comparison;
    }

    /**
     * Generate recommendations based on seasonal comparison
     */
    generateComparativeRecommendations(seasons) {
        const recommendations = [];

        // Temperature balance recommendation
        const warmSeasons = seasons.filter(s => s.characteristics.temperature === 'warm').length;
        const coolSeasons = seasons.filter(s => s.characteristics.temperature === 'cool').length;

        if (warmSeasons > coolSeasons) {
            recommendations.push({
                type: 'balance',
                suggestion: 'Consider incorporating cool accents to balance warm palette',
                impact: 'Prevents overwhelming warmth'
            });
        } else if (coolSeasons > warmSeasons) {
            recommendations.push({
                type: 'balance',
                suggestion: 'Consider incorporating warm accents to balance cool palette',
                impact: 'Adds warmth and energy'
            });
        }

        // Intensity variation recommendation
        const intensities = seasons.map(s => s.characteristics.intensity);
        if (new Set(intensities).size === 1) {
            recommendations.push({
                type: 'variety',
                suggestion: 'Mix different intensities for visual interest',
                impact: 'Creates depth and prevents monotony'
            });
        }

        return recommendations;
    }
}

module.exports = SeasonalColorAnalysis;