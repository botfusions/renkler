/**
 * SanzoColorAgent - Advanced AI Color Advisory System
 * Based on Sanzo Wada's 1918 "Dictionary of Color Combinations"
 *
 * Implements sophisticated color analysis algorithms combining:
 * - Sanzo Wada's color harmony principles
 * - Room-specific optimization
 * - Age-group psychological effects
 * - Color temperature analysis
 * - Confidence scoring and multiple recommendations
 */

const ColorConversions = require('../utils/colorConversions');
const DeltaE = require('../utils/deltaE');

// Import advanced color analysis systems
const AdvancedColorHarmony = require('../utils/advancedColorHarmony');
const BrandColorIntegration = require('../utils/brandColorIntegration');
const AdvancedColorPsychology = require('../utils/advancedColorPsychology');
const ColorTrendAnalysis = require('../utils/colorTrendAnalysis');
const SeasonalColorAnalysis = require('../utils/seasonalColorAnalysis');
const TurkishCulturalColors = require('../utils/turkishCulturalColors');

class SanzoColorAgent {

    constructor() {
        this.initializeSanzoColorDatabase();
        this.initializeRoomProfiles();
        this.initializeAgeGroupProfiles();
        this.initializePsychologicalEffects();

        // Initialize advanced color analysis systems
        this.advancedHarmony = new AdvancedColorHarmony();
        this.brandIntegration = new BrandColorIntegration();
        this.advancedPsychology = new AdvancedColorPsychology();
        this.trendAnalysis = new ColorTrendAnalysis();
        this.seasonalAnalysis = new SeasonalColorAnalysis();
        this.culturalColors = new TurkishCulturalColors();
    }

    /**
     * Initialize Sanzo Wada's classic color combinations database
     * Based on his 1918 research on harmonious color relationships
     */
    initializeSanzoColorDatabase() {
        this.sanzoHarmonies = {
            // Classic Sanzo combinations with modern interpretations
            traditionalHarmonies: [
                {
                    name: 'Wada Classic Warm',
                    colors: ['#D2691E', '#CD853F', '#F4A460', '#DEB887'],
                    psychology: 'comfort, warmth, traditional elegance',
                    suitableRooms: ['living_room', 'dining_room', 'child_bedroom'],
                    ageGroups: ['0-3', '4-6', 'adult', 'elderly'],
                    confidence: 95
                },
                {
                    name: 'Wada Tranquil Blues',
                    colors: ['#4682B4', '#87CEEB', '#B0E0E6', '#F0F8FF'],
                    psychology: 'calm, serenity, mental clarity',
                    suitableRooms: ['bedroom', 'study', 'bathroom'],
                    ageGroups: ['7-12', '13-18', 'adult'],
                    confidence: 90
                },
                {
                    name: 'Wada Earth Tones',
                    colors: ['#8B4513', '#A0522D', '#D2B48C', '#F5DEB3'],
                    psychology: 'grounding, stability, natural harmony',
                    suitableRooms: ['study', 'living_room', 'child_bedroom'],
                    ageGroups: ['4-6', '7-12', 'adult', 'elderly'],
                    confidence: 88
                },
                {
                    name: 'Wada Gentle Greens',
                    colors: ['#228B22', '#32CD32', '#90EE90', '#F0FFF0'],
                    psychology: 'growth, balance, rejuvenation',
                    suitableRooms: ['child_bedroom', 'study', 'living_room'],
                    ageGroups: ['0-3', '4-6', '7-12', 'adult'],
                    confidence: 92
                },
                {
                    name: 'Wada Sunset Warmth',
                    colors: ['#FF6347', '#FF7F50', '#FFA07A', '#FFE4E1'],
                    psychology: 'energy, creativity, social warmth',
                    suitableRooms: ['living_room', 'dining_room', 'playroom'],
                    ageGroups: ['4-6', '7-12', '13-18'],
                    confidence: 85
                }
            ],

            // Modern interpretations of Sanzo principles
            modernAdaptations: [
                {
                    name: 'Contemporary Sanzo Neutral',
                    colors: ['#F5F5F5', '#E5E5E5', '#DCDCDC', '#FFFFFF'],
                    psychology: 'minimalism, clarity, spaciousness',
                    suitableRooms: ['bedroom', 'study', 'bathroom'],
                    ageGroups: ['adult', 'elderly'],
                    confidence: 80
                },
                {
                    name: 'Sanzo Child Wonder',
                    colors: ['#FFB6C1', '#87CEFA', '#98FB98', '#F0E68C'],
                    psychology: 'joy, creativity, learning stimulation',
                    suitableRooms: ['child_bedroom', 'playroom'],
                    ageGroups: ['0-3', '4-6', '7-12'],
                    confidence: 93
                }
            ]
        };

        // Convert color database to LAB space for accurate matching
        this.processColorDatabase();
    }

    /**
     * Initialize room-specific optimization profiles
     */
    initializeRoomProfiles() {
        this.roomProfiles = {
            child_bedroom: {
                lightness: { min: 70, max: 95, optimal: 85 },
                saturation: { min: 20, max: 60, optimal: 40 },
                temperature: ['warm', 'neutral'],
                psychologyPriority: ['comfort', 'creativity', 'calm'],
                avoidColors: ['#000000', '#8B0000'], // Very dark or intense colors
                specialConsiderations: 'Stimulate creativity while promoting restful sleep'
            },
            living_room: {
                lightness: { min: 40, max: 90, optimal: 70 },
                saturation: { min: 15, max: 80, optimal: 50 },
                temperature: ['warm', 'neutral', 'cool'],
                psychologyPriority: ['social', 'comfort', 'balance'],
                avoidColors: [],
                specialConsiderations: 'Balance social energy with relaxation'
            },
            bedroom: {
                lightness: { min: 60, max: 95, optimal: 80 },
                saturation: { min: 10, max: 40, optimal: 25 },
                temperature: ['cool', 'neutral'],
                psychologyPriority: ['calm', 'rest', 'comfort'],
                avoidColors: ['#FF0000', '#FF4500'], // Overstimulating colors
                specialConsiderations: 'Promote restful sleep and relaxation'
            },
            study: {
                lightness: { min: 70, max: 95, optimal: 85 },
                saturation: { min: 10, max: 50, optimal: 30 },
                temperature: ['cool', 'neutral'],
                psychologyPriority: ['focus', 'clarity', 'calm'],
                avoidColors: ['#FF1493', '#FF6347'], // Distracting bright colors
                specialConsiderations: 'Enhance concentration and mental clarity'
            },
            dining_room: {
                lightness: { min: 45, max: 85, optimal: 65 },
                saturation: { min: 20, max: 70, optimal: 45 },
                temperature: ['warm', 'neutral'],
                psychologyPriority: ['social', 'appetite', 'comfort'],
                avoidColors: ['#0000FF', '#800080'], // Colors that suppress appetite
                specialConsiderations: 'Stimulate appetite and social interaction'
            },
            bathroom: {
                lightness: { min: 75, max: 98, optimal: 90 },
                saturation: { min: 5, max: 30, optimal: 15 },
                temperature: ['cool', 'neutral'],
                psychologyPriority: ['clean', 'fresh', 'calm'],
                avoidColors: ['#8B4513', '#A0522D'], // Earth tones that may appear dirty
                specialConsiderations: 'Create sense of cleanliness and freshness'
            },
            playroom: {
                lightness: { min: 60, max: 90, optimal: 75 },
                saturation: { min: 30, max: 80, optimal: 55 },
                temperature: ['warm', 'neutral'],
                psychologyPriority: ['energy', 'creativity', 'joy'],
                avoidColors: ['#000000', '#696969'], // Somber colors
                specialConsiderations: 'Stimulate play and creative activity'
            }
        };
    }

    /**
     * Initialize age-group specific color preferences and psychological effects
     */
    initializeAgeGroupProfiles() {
        this.ageGroups = {
            '0-3': {
                preferredColors: ['#FFB6C1', '#87CEFA', '#98FB98', '#F0E68C'],
                avoidColors: ['#000000', '#8B0000', '#4B0082'],
                psychologicalNeeds: ['safety', 'comfort', 'stimulation'],
                colorTemperature: 'warm',
                lightnessRange: { min: 75, max: 95 },
                saturationRange: { min: 30, max: 60 },
                description: 'Soft, comforting colors that provide security and gentle stimulation'
            },
            '4-6': {
                preferredColors: ['#FF6347', '#32CD32', '#FFD700', '#FF69B4'],
                avoidColors: ['#000000', '#2F4F4F', '#8B0000'],
                psychologicalNeeds: ['creativity', 'energy', 'learning'],
                colorTemperature: 'warm',
                lightnessRange: { min: 65, max: 90 },
                saturationRange: { min: 40, max: 75 },
                description: 'Vibrant, energetic colors that encourage creativity and play'
            },
            '7-12': {
                preferredColors: ['#4169E1', '#FF8C00', '#9ACD32', '#FF1493'],
                avoidColors: ['#000000', '#696969'],
                psychologicalNeeds: ['focus', 'confidence', 'self-expression'],
                colorTemperature: 'neutral',
                lightnessRange: { min: 55, max: 85 },
                saturationRange: { min: 35, max: 70 },
                description: 'Bold, confident colors that support learning and self-expression'
            },
            '13-18': {
                preferredColors: ['#6A5ACD', '#20B2AA', '#FF4500', '#DA70D6'],
                avoidColors: ['#FFB6C1', '#F0E68C'], // "Childish" pastels
                psychologicalNeeds: ['identity', 'independence', 'sophistication'],
                colorTemperature: 'cool',
                lightnessRange: { min: 40, max: 80 },
                saturationRange: { min: 30, max: 80 },
                description: 'Sophisticated, modern colors that reflect growing independence'
            },
            'adult': {
                preferredColors: ['#2F4F4F', '#8FBC8F', '#CD853F', '#4682B4'],
                avoidColors: [],
                psychologicalNeeds: ['balance', 'sophistication', 'comfort'],
                colorTemperature: 'any',
                lightnessRange: { min: 30, max: 90 },
                saturationRange: { min: 15, max: 75 },
                description: 'Balanced, sophisticated colors that create comfortable living spaces'
            },
            'elderly': {
                preferredColors: ['#F5DEB3', '#E6E6FA', '#F0F8FF', '#FFF8DC'],
                avoidColors: ['#FF0000', '#FF4500', '#FF1493'], // Overstimulating colors
                psychologicalNeeds: ['calm', 'comfort', 'clarity'],
                colorTemperature: 'warm',
                lightnessRange: { min: 70, max: 95 },
                saturationRange: { min: 10, max: 40 },
                description: 'Gentle, calming colors that provide comfort and visual clarity'
            }
        };
    }

    /**
     * Initialize psychological effects database
     */
    initializePsychologicalEffects() {
        this.psychologicalEffects = {
            warm_colors: {
                effects: ['energy', 'comfort', 'social stimulation', 'appetite enhancement'],
                bestFor: ['dining areas', 'social spaces', 'creative activities'],
                cautions: ['may increase agitation in hyperactive children', 'can be overwhelming in large doses']
            },
            cool_colors: {
                effects: ['calm', 'focus', 'relaxation', 'mental clarity'],
                bestFor: ['bedrooms', 'study areas', 'meditation spaces'],
                cautions: ['may feel cold or unwelcoming', 'can reduce appetite']
            },
            neutral_colors: {
                effects: ['balance', 'sophistication', 'versatility', 'spaciousness'],
                bestFor: ['any room', 'professional spaces', 'minimalist designs'],
                cautions: ['may appear bland without accent colors', 'can lack personality']
            },
            high_saturation: {
                effects: ['energy', 'excitement', 'creativity', 'attention-grabbing'],
                bestFor: ['playrooms', 'exercise areas', 'accent walls'],
                cautions: ['can be overwhelming', 'may cause eye strain', 'difficult to live with long-term']
            },
            low_saturation: {
                effects: ['calm', 'sophistication', 'relaxation', 'easy on eyes'],
                bestFor: ['bedrooms', 'meditation areas', 'professional spaces'],
                cautions: ['may appear dull', 'can lack visual interest']
            }
        };
    }

    /**
     * Process color database to LAB space for accurate color matching
     */
    processColorDatabase() {
        const processColorSet = (colorSet) => {
            return colorSet.map(harmony => ({
                ...harmony,
                colorsLab: harmony.colors.map(hex => ColorConversions.hexToLab(hex)),
                colorsRgb: harmony.colors.map(hex => ColorConversions.hexToRgb(hex)),
                colorsHsl: harmony.colors.map(hex => {
                    const rgb = ColorConversions.hexToRgb(hex);
                    return ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
                })
            }));
        };

        this.sanzoHarmonies.traditionalHarmonies = processColorSet(this.sanzoHarmonies.traditionalHarmonies);
        this.sanzoHarmonies.modernAdaptations = processColorSet(this.sanzoHarmonies.modernAdaptations);
    }

    /**
     * Main analysis method - analyzes user input and provides comprehensive recommendations
     * @param {Object} input - User input with room context
     * @returns {Object} Comprehensive color recommendations with confidence scores
     */
    async analyzeColorScheme(input) {
        try {
            // Validate and normalize input
            const normalizedInput = this.validateAndNormalizeInput(input);
            if (!normalizedInput.isValid) {
                return this.createErrorResponse(normalizedInput.errors);
            }

            // Analyze existing colors
            const existingColorAnalysis = this.analyzeExistingColors(normalizedInput);

            // Get room and age group requirements
            const roomRequirements = this.getRoomRequirements(normalizedInput.roomType);
            const ageRequirements = this.getAgeGroupRequirements(normalizedInput.ageGroup);

            // ADVANCED ANALYSIS INTEGRATION
            const advancedAnalysis = await this.performAdvancedAnalysis(normalizedInput, existingColorAnalysis);

            // Generate recommendations (enhanced with advanced features)
            const recommendations = this.generateEnhancedRecommendations(
                existingColorAnalysis,
                roomRequirements,
                ageRequirements,
                normalizedInput,
                advancedAnalysis
            );

            // Calculate confidence scores
            const scoredRecommendations = this.calculateConfidenceScores(
                recommendations,
                existingColorAnalysis,
                roomRequirements,
                ageRequirements
            );

            // Provide psychological analysis (enhanced)
            const psychologicalAnalysis = this.analyzeEnhancedPsychologicalEffects(
                scoredRecommendations,
                normalizedInput.ageGroup,
                normalizedInput.roomType,
                advancedAnalysis
            );

            return this.createAdvancedComprehensiveResponse(
                normalizedInput,
                existingColorAnalysis,
                scoredRecommendations,
                psychologicalAnalysis,
                advancedAnalysis
            );

        } catch (error) {
            return this.createErrorResponse([`Analysis error: ${error.message}`]);
        }
    }

    /**
     * Validate and normalize user input
     * @param {Object} input - Raw user input
     * @returns {Object} Validation result with normalized data
     */
    validateAndNormalizeInput(input) {
        const errors = [];
        const normalized = {};

        // Validate required fields
        if (!input.roomType) {
            errors.push('Room type is required');
        } else if (!this.roomProfiles[input.roomType]) {
            errors.push(`Unsupported room type: ${input.roomType}`);
        } else {
            normalized.roomType = input.roomType;
        }

        // Validate age group
        if (input.ageGroup && !this.ageGroups[input.ageGroup]) {
            errors.push(`Unsupported age group: ${input.ageGroup}`);
        } else {
            normalized.ageGroup = input.ageGroup || 'adult';
        }

        // Validate and normalize colors
        normalized.colors = {};
        const colorFields = ['wall', 'floor', 'furniture', 'accent'];

        colorFields.forEach(field => {
            if (input[field]) {
                const colorData = ColorConversions.validateAndNormalize(input[field]);
                if (colorData) {
                    normalized.colors[field] = colorData;
                } else {
                    errors.push(`Invalid color format for ${field}: ${input[field]}`);
                }
            }
        });

        // Ensure at least one color is provided
        if (Object.keys(normalized.colors).length === 0) {
            errors.push('At least one color must be provided (wall, floor, furniture, or accent)');
        }

        return {
            isValid: errors.length === 0,
            errors,
            ...normalized
        };
    }

    /**
     * Analyze existing colors in the scheme
     * @param {Object} normalizedInput - Validated input data
     * @returns {Object} Color analysis results
     */
    analyzeExistingColors(normalizedInput) {
        const analysis = {
            colors: normalizedInput.colors,
            colorCount: Object.keys(normalizedInput.colors).length,
            temperatureProfile: {},
            harmonyAnalysis: {},
            lightnessProfile: {},
            saturationProfile: {}
        };

        // Analyze color temperatures
        Object.entries(normalizedInput.colors).forEach(([type, colorData]) => {
            analysis.temperatureProfile[type] = colorData.temperature;
        });

        // Calculate overall temperature tendency
        const temps = Object.values(analysis.temperatureProfile);
        const warmCount = temps.filter(t => t.type === 'warm').length;
        const coolCount = temps.filter(t => t.type === 'cool').length;
        const neutralCount = temps.filter(t => t.type === 'neutral').length;

        analysis.overallTemperature = warmCount > coolCount ? 'warm' :
                                     coolCount > warmCount ? 'cool' : 'neutral';

        // Analyze harmony if multiple colors present
        if (analysis.colorCount > 1) {
            const labColors = Object.values(normalizedInput.colors).map(c => c.lab);
            analysis.harmonyAnalysis = DeltaE.calculateHarmonyScore(labColors);
        }

        // Analyze lightness and saturation distributions
        const hslColors = Object.values(normalizedInput.colors).map(c => c.hsl);
        analysis.lightnessProfile = {
            average: Math.round(hslColors.reduce((sum, c) => sum + c.l, 0) / hslColors.length),
            range: Math.max(...hslColors.map(c => c.l)) - Math.min(...hslColors.map(c => c.l))
        };

        analysis.saturationProfile = {
            average: Math.round(hslColors.reduce((sum, c) => sum + c.s, 0) / hslColors.length),
            range: Math.max(...hslColors.map(c => c.s)) - Math.min(...hslColors.map(c => c.s))
        };

        return analysis;
    }

    /**
     * Get room-specific requirements
     * @param {string} roomType - Type of room
     * @returns {Object} Room requirements
     */
    getRoomRequirements(roomType) {
        return this.roomProfiles[roomType] || this.roomProfiles.living_room;
    }

    /**
     * Get age group-specific requirements
     * @param {string} ageGroup - Age group identifier
     * @returns {Object} Age group requirements
     */
    getAgeGroupRequirements(ageGroup) {
        return this.ageGroups[ageGroup] || this.ageGroups.adult;
    }

    /**
     * Generate color recommendations based on analysis
     * @param {Object} existingAnalysis - Analysis of existing colors
     * @param {Object} roomReqs - Room requirements
     * @param {Object} ageReqs - Age group requirements
     * @param {Object} input - Original input
     * @returns {Array} Array of recommendations
     */
    generateRecommendations(existingAnalysis, roomReqs, ageReqs, input) {
        const recommendations = [];

        // Find Sanzo harmonies that match the context
        const allHarmonies = [
            ...this.sanzoHarmonies.traditionalHarmonies,
            ...this.sanzoHarmonies.modernAdaptations
        ];

        allHarmonies.forEach(harmony => {
            // Check if harmony is suitable for the room and age group
            if (harmony.suitableRooms.includes(input.roomType) &&
                harmony.ageGroups.includes(input.ageGroup)) {

                const recommendation = this.createRecommendationFromHarmony(
                    harmony,
                    existingAnalysis,
                    roomReqs,
                    ageReqs,
                    input
                );

                if (recommendation) {
                    recommendations.push(recommendation);
                }
            }
        });

        // Generate custom recommendations based on existing colors
        const customRecommendations = this.generateCustomRecommendations(
            existingAnalysis,
            roomReqs,
            ageReqs,
            input
        );

        recommendations.push(...customRecommendations);

        // Sort by initial confidence and return top 5
        return recommendations
            .sort((a, b) => b.baseConfidence - a.baseConfidence)
            .slice(0, 5);
    }

    /**
     * Create recommendation from Sanzo harmony
     * @param {Object} harmony - Sanzo harmony data
     * @param {Object} existingAnalysis - Existing color analysis
     * @param {Object} roomReqs - Room requirements
     * @param {Object} ageReqs - Age requirements
     * @param {Object} input - Original input
     * @returns {Object} Recommendation object
     */
    createRecommendationFromHarmony(harmony, existingAnalysis, roomReqs, ageReqs, input) {
        // Create recommendation based on what colors are missing
        const missingElements = this.identifyMissingElements(input.colors);

        if (missingElements.length === 0) {
            return null; // All elements provided, no recommendation needed
        }

        const recommendation = {
            id: `sanzo_${harmony.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: harmony.name,
            type: 'sanzo_harmony',
            baseConfidence: harmony.confidence,
            colors: {},
            reasoning: `Based on Sanzo Wada's "${harmony.name}" harmony, known for ${harmony.psychology}`,
            psychologicalEffects: harmony.psychology,
            sanzoOrigin: true
        };

        // Assign harmony colors to missing elements
        missingElements.forEach((element, index) => {
            if (index < harmony.colors.length) {
                const colorHex = harmony.colors[index];
                recommendation.colors[element] = {
                    hex: colorHex,
                    rgb: ColorConversions.hexToRgb(colorHex),
                    lab: ColorConversions.hexToLab(colorHex),
                    hsl: (() => {
                        const rgb = ColorConversions.hexToRgb(colorHex);
                        return ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
                    })(),
                    temperature: ColorConversions.getColorTemperature(ColorConversions.hexToRgb(colorHex))
                };
            }
        });

        return recommendation;
    }

    /**
     * Generate custom recommendations based on color theory
     * @param {Object} existingAnalysis - Existing color analysis
     * @param {Object} roomReqs - Room requirements
     * @param {Object} ageReqs - Age requirements
     * @param {Object} input - Original input
     * @returns {Array} Custom recommendations
     */
    generateCustomRecommendations(existingAnalysis, roomReqs, ageReqs, input) {
        const customRecs = [];
        const missingElements = this.identifyMissingElements(input.colors);

        if (missingElements.length === 0) {
            return customRecs;
        }

        // Generate complementary recommendation
        if (Object.keys(existingAnalysis.colors).length > 0) {
            const complementaryRec = this.generateComplementaryRecommendation(
                existingAnalysis, roomReqs, ageReqs, input, missingElements
            );
            if (complementaryRec) customRecs.push(complementaryRec);
        }

        // Generate analogous recommendation
        const analogousRec = this.generateAnalogousRecommendation(
            existingAnalysis, roomReqs, ageReqs, input, missingElements
        );
        if (analogousRec) customRecs.push(analogousRec);

        // Generate neutral recommendation
        const neutralRec = this.generateNeutralRecommendation(
            existingAnalysis, roomReqs, ageReqs, input, missingElements
        );
        if (neutralRec) customRecs.push(neutralRec);

        return customRecs;
    }

    /**
     * Generate complementary color recommendation
     */
    generateComplementaryRecommendation(existingAnalysis, roomReqs, ageReqs, input, missingElements) {
        const firstColor = Object.values(existingAnalysis.colors)[0];
        const hsl = firstColor.hsl;

        // Calculate complementary hue
        const compHue = (hsl.h + 180) % 360;

        const recommendation = {
            id: 'complementary_scheme',
            name: 'Complementary Harmony',
            type: 'complementary',
            baseConfidence: 75,
            colors: {},
            reasoning: 'Creates visual interest through complementary color relationships',
            psychologicalEffects: 'dynamic balance, visual excitement, energizing'
        };

        missingElements.forEach((element, index) => {
            const targetLightness = this.calculateTargetLightness(element, roomReqs, ageReqs);
            const targetSaturation = this.calculateTargetSaturation(element, roomReqs, ageReqs);

            const newHsl = {
                h: compHue,
                s: targetSaturation,
                l: targetLightness
            };

            const rgb = ColorConversions.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
            const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);
            const lab = ColorConversions.rgbToLab(rgb.r, rgb.g, rgb.b);

            recommendation.colors[element] = {
                hex, rgb, lab, hsl: newHsl,
                temperature: ColorConversions.getColorTemperature(rgb)
            };
        });

        return recommendation;
    }

    /**
     * Generate analogous color recommendation
     */
    generateAnalogousRecommendation(existingAnalysis, roomReqs, ageReqs, input, missingElements) {
        const baseHue = Object.keys(existingAnalysis.colors).length > 0
            ? Object.values(existingAnalysis.colors)[0].hsl.h
            : ageReqs.preferredColors.length > 0
                ? ColorConversions.hexToRgb(ageReqs.preferredColors[0])
                    ? ColorConversions.rgbToHsl(
                        ...Object.values(ColorConversions.hexToRgb(ageReqs.preferredColors[0]))
                      ).h
                    : 180
                : 180;

        const recommendation = {
            id: 'analogous_scheme',
            name: 'Analogous Harmony',
            type: 'analogous',
            baseConfidence: 85,
            colors: {},
            reasoning: 'Creates gentle, cohesive color flow using neighboring hues',
            psychologicalEffects: 'harmony, unity, peaceful atmosphere'
        };

        missingElements.forEach((element, index) => {
            const hueShift = (index + 1) * 30; // 30-degree shifts
            const newHue = (baseHue + hueShift) % 360;

            const targetLightness = this.calculateTargetLightness(element, roomReqs, ageReqs);
            const targetSaturation = this.calculateTargetSaturation(element, roomReqs, ageReqs);

            const newHsl = {
                h: newHue,
                s: targetSaturation,
                l: targetLightness
            };

            const rgb = ColorConversions.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
            const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);
            const lab = ColorConversions.rgbToLab(rgb.r, rgb.g, rgb.b);

            recommendation.colors[element] = {
                hex, rgb, lab, hsl: newHsl,
                temperature: ColorConversions.getColorTemperature(rgb)
            };
        });

        return recommendation;
    }

    /**
     * Generate neutral color recommendation
     */
    generateNeutralRecommendation(existingAnalysis, roomReqs, ageReqs, input, missingElements) {
        const recommendation = {
            id: 'neutral_scheme',
            name: 'Sophisticated Neutrals',
            type: 'neutral',
            baseConfidence: 70,
            colors: {},
            reasoning: 'Timeless neutral palette that provides versatile foundation',
            psychologicalEffects: 'calm, sophisticated, versatile, spacious'
        };

        const neutralHues = [0, 30, 60]; // Warm neutrals

        missingElements.forEach((element, index) => {
            const targetLightness = this.calculateTargetLightness(element, roomReqs, ageReqs);
            const targetSaturation = Math.min(20, this.calculateTargetSaturation(element, roomReqs, ageReqs));

            const newHsl = {
                h: neutralHues[index % neutralHues.length],
                s: targetSaturation,
                l: targetLightness
            };

            const rgb = ColorConversions.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
            const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);
            const lab = ColorConversions.rgbToLab(rgb.r, rgb.g, rgb.b);

            recommendation.colors[element] = {
                hex, rgb, lab, hsl: newHsl,
                temperature: ColorConversions.getColorTemperature(rgb)
            };
        });

        return recommendation;
    }

    /**
     * Calculate target lightness for element based on requirements
     */
    calculateTargetLightness(element, roomReqs, ageReqs) {
        const elementMultipliers = {
            wall: 0.9,      // Walls generally lighter
            floor: 0.6,     // Floors generally darker
            furniture: 0.7, // Furniture medium
            accent: 0.8     // Accents flexible
        };

        const baseTarget = (roomReqs.lightness.optimal + ageReqs.lightnessRange.min + ageReqs.lightnessRange.max) / 3;
        const multiplier = elementMultipliers[element] || 0.75;

        return Math.max(
            Math.min(baseTarget * multiplier, 95),
            Math.max(roomReqs.lightness.min, ageReqs.lightnessRange.min)
        );
    }

    /**
     * Calculate target saturation for element based on requirements
     */
    calculateTargetSaturation(element, roomReqs, ageReqs) {
        const elementMultipliers = {
            wall: 0.7,      // Walls less saturated
            floor: 0.8,     // Floors moderate
            furniture: 0.9, // Furniture can be more saturated
            accent: 1.2     // Accents most saturated
        };

        const baseTarget = (roomReqs.saturation.optimal + ageReqs.saturationRange.min + ageReqs.saturationRange.max) / 3;
        const multiplier = elementMultipliers[element] || 1.0;

        return Math.max(
            Math.min(baseTarget * multiplier, 100),
            Math.max(roomReqs.saturation.min, ageReqs.saturationRange.min)
        );
    }

    /**
     * Identify missing color elements
     * @param {Object} providedColors - Colors provided by user
     * @returns {Array} Array of missing element names
     */
    identifyMissingElements(providedColors) {
        const allElements = ['wall', 'floor', 'furniture', 'accent'];
        return allElements.filter(element => !providedColors[element]);
    }

    /**
     * Calculate confidence scores for recommendations
     * @param {Array} recommendations - Array of recommendations
     * @param {Object} existingAnalysis - Existing color analysis
     * @param {Object} roomReqs - Room requirements
     * @param {Object} ageReqs - Age requirements
     * @returns {Array} Recommendations with confidence scores
     */
    calculateConfidenceScores(recommendations, existingAnalysis, roomReqs, ageReqs) {
        return recommendations.map(rec => {
            let confidence = rec.baseConfidence;

            // Age appropriateness boost
            if (this.checkAgeAppropriateness(rec, ageReqs)) {
                confidence += 10;
            } else {
                confidence -= 15;
            }

            // Room suitability boost
            if (this.checkRoomSuitability(rec, roomReqs)) {
                confidence += 8;
            } else {
                confidence -= 12;
            }

            // Harmony with existing colors
            if (Object.keys(existingAnalysis.colors).length > 0) {
                const harmonyScore = this.calculateHarmonyWithExisting(rec, existingAnalysis);
                confidence += (harmonyScore - 50) * 0.3; // Scale harmony score impact
            }

            // Sanzo origin bonus
            if (rec.sanzoOrigin) {
                confidence += 5;
            }

            // Ensure confidence stays within bounds
            confidence = Math.max(0, Math.min(100, confidence));

            return {
                ...rec,
                confidence: Math.round(confidence),
                confidenceFactors: this.getConfidenceFactors(rec, existingAnalysis, roomReqs, ageReqs)
            };
        });
    }

    /**
     * Check if recommendation is age-appropriate
     */
    checkAgeAppropriateness(recommendation, ageReqs) {
        const recColors = Object.values(recommendation.colors);

        return recColors.every(color => {
            const { l, s } = color.hsl;
            return l >= ageReqs.lightnessRange.min &&
                   l <= ageReqs.lightnessRange.max &&
                   s >= ageReqs.saturationRange.min &&
                   s <= ageReqs.saturationRange.max;
        });
    }

    /**
     * Check if recommendation suits the room
     */
    checkRoomSuitability(recommendation, roomReqs) {
        const recColors = Object.values(recommendation.colors);

        return recColors.every(color => {
            const { l, s } = color.hsl;
            return l >= roomReqs.lightness.min &&
                   l <= roomReqs.lightness.max &&
                   s >= roomReqs.saturation.min &&
                   s <= roomReqs.saturation.max;
        });
    }

    /**
     * Calculate harmony score with existing colors
     */
    calculateHarmonyWithExisting(recommendation, existingAnalysis) {
        const existingLabs = Object.values(existingAnalysis.colors).map(c => c.lab);
        const recLabs = Object.values(recommendation.colors).map(c => c.lab);
        const allLabs = [...existingLabs, ...recLabs];

        const harmony = DeltaE.calculateHarmonyScore(allLabs);
        return harmony.score;
    }

    /**
     * Get detailed confidence factors for transparency
     */
    getConfidenceFactors(recommendation, existingAnalysis, roomReqs, ageReqs) {
        const factors = [];

        if (recommendation.sanzoOrigin) {
            factors.push('Based on authentic Sanzo Wada color theory (+5)');
        }

        if (this.checkAgeAppropriateness(recommendation, ageReqs)) {
            factors.push('Appropriate for specified age group (+10)');
        } else {
            factors.push('May not be optimal for specified age group (-15)');
        }

        if (this.checkRoomSuitability(recommendation, roomReqs)) {
            factors.push('Well-suited for room type (+8)');
        } else {
            factors.push('May not be optimal for room type (-12)');
        }

        return factors;
    }

    /**
     * Analyze psychological effects of recommendations
     */
    analyzePsychologicalEffects(recommendations, ageGroup, roomType) {
        const analysis = {
            ageGroupEffects: this.ageGroups[ageGroup]?.psychologicalNeeds || [],
            roomTypeEffects: this.roomProfiles[roomType]?.psychologyPriority || [],
            recommendationEffects: {}
        };

        recommendations.forEach(rec => {
            const colors = Object.values(rec.colors);
            const effects = [];

            // Analyze temperature effects
            const temps = colors.map(c => c.temperature.type);
            const warmCount = temps.filter(t => t === 'warm').length;
            const coolCount = temps.filter(t => t === 'cool').length;

            if (warmCount > coolCount) {
                effects.push(...this.psychologicalEffects.warm_colors.effects);
            } else if (coolCount > warmCount) {
                effects.push(...this.psychologicalEffects.cool_colors.effects);
            } else {
                effects.push(...this.psychologicalEffects.neutral_colors.effects);
            }

            // Analyze saturation effects
            const avgSaturation = colors.reduce((sum, c) => sum + c.hsl.s, 0) / colors.length;
            if (avgSaturation > 50) {
                effects.push(...this.psychologicalEffects.high_saturation.effects);
            } else {
                effects.push(...this.psychologicalEffects.low_saturation.effects);
            }

            analysis.recommendationEffects[rec.id] = [...new Set(effects)]; // Remove duplicates
        });

        return analysis;
    }

    /**
     * Create comprehensive response object
     */
    createComprehensiveResponse(input, existingAnalysis, recommendations, psychologicalAnalysis) {
        return {
            success: true,
            timestamp: new Date().toISOString(),
            input: {
                roomType: input.roomType,
                ageGroup: input.ageGroup,
                providedColors: Object.keys(input.colors)
            },
            analysis: {
                existingColors: existingAnalysis,
                roomRequirements: this.roomProfiles[input.roomType],
                ageGroupRequirements: this.ageGroups[input.ageGroup],
                psychologicalProfile: psychologicalAnalysis
            },
            recommendations: recommendations.map(rec => ({
                ...rec,
                suitabilityScore: this.calculateSuitabilityScore(rec, input),
                implementationTips: this.generateImplementationTips(rec, input)
            })),
            metadata: {
                totalRecommendations: recommendations.length,
                averageConfidence: Math.round(
                    recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
                ),
                sanzoBasedCount: recommendations.filter(rec => rec.sanzoOrigin).length,
                recommendationTypes: [...new Set(recommendations.map(rec => rec.type))]
            }
        };
    }

    /**
     * Calculate overall suitability score
     */
    calculateSuitabilityScore(recommendation, input) {
        const roomProfile = this.roomProfiles[input.roomType];
        const ageProfile = this.ageGroups[input.ageGroup];

        let score = recommendation.confidence;

        // Bonus for meeting special considerations
        if (recommendation.psychologicalEffects) {
            const effects = recommendation.psychologicalEffects.split(', ');
            const matchingPriorities = roomProfile.psychologyPriority.filter(p =>
                effects.some(e => e.includes(p))
            );
            score += matchingPriorities.length * 5;
        }

        return Math.min(100, Math.max(0, Math.round(score)));
    }

    /**
     * Generate implementation tips for recommendation
     */
    generateImplementationTips(recommendation, input) {
        const tips = [];
        const roomType = input.roomType;

        // Room-specific tips
        if (roomType === 'child_bedroom') {
            tips.push('Consider using removable wall decals for easy updates as child grows');
            tips.push('Ensure adequate lighting to showcase colors properly');
        } else if (roomType === 'living_room') {
            tips.push('Test colors in different lighting conditions before final decision');
            tips.push('Consider the room\'s natural light exposure throughout the day');
        }

        // Color-specific tips
        Object.entries(recommendation.colors).forEach(([element, color]) => {
            if (element === 'wall' && color.hsl.l < 50) {
                tips.push('Dark wall colors work best as accent walls rather than all walls');
            }
            if (element === 'accent' && color.hsl.s > 70) {
                tips.push('High-saturation accent colors are most effective in small doses');
            }
        });

        return tips;
    }

    /**
     * Create error response
     */
    createErrorResponse(errors) {
        return {
            success: false,
            timestamp: new Date().toISOString(),
            errors: errors,
            suggestions: [
                'Ensure all color inputs are in valid HEX format (e.g., #FF0000) or supported color names',
                'Verify room type is one of: child_bedroom, living_room, bedroom, study, dining_room, bathroom, playroom',
                'Verify age group is one of: 0-3, 4-6, 7-12, 13-18, adult, elderly'
            ]
        };
    }

    /**
     * ADVANCED ANALYSIS INTEGRATION METHODS
     * These methods integrate all the new advanced color analysis systems
     */

    /**
     * Perform comprehensive advanced analysis using all new systems
     * @param {Object} normalizedInput - Normalized user input
     * @param {Object} existingColorAnalysis - Basic color analysis
     * @returns {Object} Advanced analysis results
     */
    async performAdvancedAnalysis(normalizedInput, existingColorAnalysis) {
        const analysis = {
            timestamp: new Date().toISOString(),
            systems: {}
        };

        // Get primary color for analysis
        const primaryColor = existingColorAnalysis.wall?.hex ||
                           existingColorAnalysis.floor?.hex ||
                           existingColorAnalysis.furniture?.hex ||
                           existingColorAnalysis.accent?.hex ||
                           '#FFFFFF';

        try {
            // Advanced Color Harmony Analysis
            analysis.systems.harmony = this.advancedHarmony.generateAdvancedMathematicalHarmony(primaryColor, {
                includeFibonacci: true,
                includeBezier: true,
                includeFourier: true,
                includeGeometric: true,
                optimizeGenetic: normalizedInput.preferences?.optimization === 'genetic'
            });

            // Advanced Psychology Analysis
            analysis.systems.psychology = this.advancedPsychology.generateMoodBasedRecommendation({
                currentMood: normalizedInput.preferences?.mood || 'balanced',
                desiredMood: normalizedInput.preferences?.desiredMood || 'comfortable',
                roomType: normalizedInput.roomType,
                personalityType: normalizedInput.preferences?.personalityType || 'balanced',
                activityLevel: normalizedInput.preferences?.activityLevel || 'moderate'
            });

            // Color Trend Analysis
            analysis.systems.trends = this.trendAnalysis.getCurrentTrendAnalysis({
                year: new Date().getFullYear(),
                region: normalizedInput.preferences?.region || 'global',
                industry: 'interior_design',
                baseColor: primaryColor
            });

            // Seasonal Color Analysis
            if (normalizedInput.preferences?.personalColors) {
                analysis.systems.seasonal = this.seasonalAnalysis.analyzePersonalColors({
                    skinTone: normalizedInput.preferences.personalColors.skinTone,
                    eyeColor: normalizedInput.preferences.personalColors.eyeColor,
                    hairColor: normalizedInput.preferences.personalColors.hairColor
                });
            }

            // Turkish Cultural Color Analysis
            analysis.systems.cultural = this.culturalColors.analyzeCulturalHarmony(primaryColor, {
                includeTraditional: true,
                includeModern: true,
                includeSymbolic: true,
                roomType: normalizedInput.roomType
            });

            // Brand Integration (if brand colors provided)
            if (normalizedInput.preferences?.brandColors) {
                analysis.systems.brand = await this.brandIntegration.generateBrandConsistentPalette(
                    normalizedInput.preferences.brandColors,
                    {
                        roomType: normalizedInput.roomType,
                        industry: normalizedInput.preferences.industry || 'general',
                        brandPersonality: normalizedInput.preferences.brandPersonality || 'balanced'
                    }
                );
            }

            // Cross-system compatibility analysis
            analysis.compatibility = this.analyzeSystemCompatibility(analysis.systems);

        } catch (error) {
            console.error('Advanced analysis error:', error);
            analysis.error = error.message;
        }

        return analysis;
    }

    /**
     * Generate enhanced recommendations using advanced analysis
     * @param {Object} existingColorAnalysis - Basic color analysis
     * @param {Object} roomRequirements - Room requirements
     * @param {Object} ageRequirements - Age group requirements
     * @param {Object} normalizedInput - Normalized input
     * @param {Object} advancedAnalysis - Advanced analysis results
     * @returns {Object} Enhanced recommendations
     */
    generateEnhancedRecommendations(existingColorAnalysis, roomRequirements, ageRequirements, normalizedInput, advancedAnalysis) {
        // Start with basic recommendations
        const basicRecommendations = this.generateRecommendations(
            existingColorAnalysis,
            roomRequirements,
            ageRequirements,
            normalizedInput
        );

        // Enhance with advanced analysis
        const enhancedRecommendations = {
            ...basicRecommendations,
            advanced: {
                harmonyBased: [],
                psychologyBased: [],
                trendBased: [],
                culturalBased: [],
                seasonalBased: [],
                brandBased: []
            }
        };

        try {
            // Add harmony-based recommendations
            if (advancedAnalysis.systems.harmony?.success) {
                const harmonyRecs = this.extractHarmonyRecommendations(advancedAnalysis.systems.harmony);
                enhancedRecommendations.advanced.harmonyBased = harmonyRecs;
            }

            // Add psychology-based recommendations
            if (advancedAnalysis.systems.psychology?.success) {
                const psychRecs = this.extractPsychologyRecommendations(advancedAnalysis.systems.psychology);
                enhancedRecommendations.advanced.psychologyBased = psychRecs;
            }

            // Add trend-based recommendations
            if (advancedAnalysis.systems.trends?.success) {
                const trendRecs = this.extractTrendRecommendations(advancedAnalysis.systems.trends);
                enhancedRecommendations.advanced.trendBased = trendRecs;
            }

            // Add cultural recommendations
            if (advancedAnalysis.systems.cultural?.success) {
                const culturalRecs = this.extractCulturalRecommendations(advancedAnalysis.systems.cultural);
                enhancedRecommendations.advanced.culturalBased = culturalRecs;
            }

            // Add seasonal recommendations
            if (advancedAnalysis.systems.seasonal?.success) {
                const seasonalRecs = this.extractSeasonalRecommendations(advancedAnalysis.systems.seasonal);
                enhancedRecommendations.advanced.seasonalBased = seasonalRecs;
            }

            // Add brand recommendations
            if (advancedAnalysis.systems.brand?.success) {
                const brandRecs = this.extractBrandRecommendations(advancedAnalysis.systems.brand);
                enhancedRecommendations.advanced.brandBased = brandRecs;
            }

        } catch (error) {
            console.error('Enhanced recommendations error:', error);
            enhancedRecommendations.error = error.message;
        }

        return enhancedRecommendations;
    }

    /**
     * Analyze enhanced psychological effects using advanced psychology system
     * @param {Object} recommendations - Color recommendations
     * @param {string} ageGroup - Age group
     * @param {string} roomType - Room type
     * @param {Object} advancedAnalysis - Advanced analysis results
     * @returns {Object} Enhanced psychological analysis
     */
    analyzeEnhancedPsychologicalEffects(recommendations, ageGroup, roomType, advancedAnalysis) {
        // Start with basic psychological analysis
        const basicAnalysis = this.analyzePsychologicalEffects(recommendations, ageGroup, roomType);

        // Enhance with advanced psychology
        const enhancedAnalysis = {
            ...basicAnalysis,
            advanced: {
                moodAnalysis: null,
                personalityFit: null,
                circadianEffects: null,
                culturalPsychology: null,
                cognitiveImpact: null
            }
        };

        try {
            if (advancedAnalysis.systems.psychology?.success) {
                const advPsych = advancedAnalysis.systems.psychology;

                enhancedAnalysis.advanced.moodAnalysis = {
                    currentMoodSupport: advPsych.moodAlignment?.current || 'neutral',
                    desiredMoodAchievement: advPsych.moodAlignment?.desired || 'comfortable',
                    moodTransitionSupport: advPsych.recommendations?.moodTransition || 'gradual'
                };

                enhancedAnalysis.advanced.personalityFit = {
                    personalityMatch: advPsych.personalityAlignment?.match || 'good',
                    cognitiveStyle: advPsych.personalityAlignment?.cognitiveStyle || 'balanced',
                    energyLevel: advPsych.personalityAlignment?.energyLevel || 'moderate'
                };

                enhancedAnalysis.advanced.circadianEffects = {
                    lightingInteraction: advPsych.circadianConsiderations?.lighting || 'neutral',
                    timeOfDayOptimization: advPsych.circadianConsiderations?.timeOptimization || 'allDay',
                    sleepQualityImpact: advPsych.circadianConsiderations?.sleepImpact || 'neutral'
                };
            }

            // Add cultural psychology from cultural analysis
            if (advancedAnalysis.systems.cultural?.success) {
                enhancedAnalysis.advanced.culturalPsychology = {
                    culturalResonance: advancedAnalysis.systems.cultural.significance || 'neutral',
                    traditionalValues: advancedAnalysis.systems.cultural.traditionalAlignment || 'balanced',
                    modernAdaptation: advancedAnalysis.systems.cultural.modernRelevance || 'contemporary'
                };
            }

        } catch (error) {
            console.error('Enhanced psychological analysis error:', error);
            enhancedAnalysis.error = error.message;
        }

        return enhancedAnalysis;
    }

    /**
     * Create advanced comprehensive response with all analysis results
     * @param {Object} normalizedInput - Normalized input
     * @param {Object} existingColorAnalysis - Existing color analysis
     * @param {Object} scoredRecommendations - Scored recommendations
     * @param {Object} psychologicalAnalysis - Psychological analysis
     * @param {Object} advancedAnalysis - Advanced analysis results
     * @returns {Object} Comprehensive response with advanced features
     */
    createAdvancedComprehensiveResponse(normalizedInput, existingColorAnalysis, scoredRecommendations, psychologicalAnalysis, advancedAnalysis) {
        // Start with basic response
        const basicResponse = this.createComprehensiveResponse(
            normalizedInput,
            existingColorAnalysis,
            scoredRecommendations,
            psychologicalAnalysis
        );

        // Enhance with advanced features
        const enhancedResponse = {
            ...basicResponse,
            advanced: {
                analysis: advancedAnalysis,
                features: {
                    mathematicalHarmony: advancedAnalysis.systems.harmony?.success || false,
                    advancedPsychology: advancedAnalysis.systems.psychology?.success || false,
                    trendAnalysis: advancedAnalysis.systems.trends?.success || false,
                    culturalIntegration: advancedAnalysis.systems.cultural?.success || false,
                    seasonalAnalysis: advancedAnalysis.systems.seasonal?.success || false,
                    brandIntegration: advancedAnalysis.systems.brand?.success || false
                },
                compatibility: advancedAnalysis.compatibility,
                recommendations: {
                    priority: 'mathematical_harmony',
                    alternatives: this.generateAlternativeApproaches(advancedAnalysis),
                    implementation: this.generateImplementationGuidance(scoredRecommendations, advancedAnalysis)
                }
            },
            metadata: {
                ...basicResponse.metadata,
                advancedFeaturesUsed: Object.keys(advancedAnalysis.systems).length,
                analysisComplexity: this.calculateAnalysisComplexity(advancedAnalysis),
                processingTime: Date.now() - new Date(advancedAnalysis.timestamp).getTime()
            }
        };

        return enhancedResponse;
    }

    /**
     * Analyze compatibility between different analysis systems
     * @param {Object} systems - Analysis results from different systems
     * @returns {Object} Compatibility analysis
     */
    analyzeSystemCompatibility(systems) {
        const compatibility = {
            overallScore: 0,
            systemPairs: {},
            conflicts: [],
            synergies: []
        };

        const systemKeys = Object.keys(systems).filter(key => systems[key].success);
        let totalComparisons = 0;
        let totalScore = 0;

        for (let i = 0; i < systemKeys.length; i++) {
            for (let j = i + 1; j < systemKeys.length; j++) {
                const system1 = systemKeys[i];
                const system2 = systemKeys[j];
                const score = this.calculateSystemCompatibility(systems[system1], systems[system2]);

                compatibility.systemPairs[`${system1}_${system2}`] = score;
                totalScore += score;
                totalComparisons++;

                if (score < 60) {
                    compatibility.conflicts.push({ systems: [system1, system2], score });
                } else if (score > 85) {
                    compatibility.synergies.push({ systems: [system1, system2], score });
                }
            }
        }

        compatibility.overallScore = totalComparisons > 0 ? Math.round(totalScore / totalComparisons) : 100;

        return compatibility;
    }

    /**
     * Calculate compatibility score between two analysis systems
     * @param {Object} system1 - First system analysis
     * @param {Object} system2 - Second system analysis
     * @returns {number} Compatibility score (0-100)
     */
    calculateSystemCompatibility(system1, system2) {
        // Implement compatibility scoring logic
        // This is a simplified version - can be made more sophisticated
        try {
            let score = 80; // Base compatibility score

            // Check for contradictory recommendations
            if (this.hasContradictoryRecommendations(system1, system2)) {
                score -= 20;
            }

            // Check for complementary insights
            if (this.hasComplementaryInsights(system1, system2)) {
                score += 15;
            }

            return Math.max(0, Math.min(100, score));
        } catch (error) {
            return 70; // Default moderate compatibility
        }
    }

    /**
     * Check if two systems have contradictory recommendations
     * @param {Object} system1 - First system
     * @param {Object} system2 - Second system
     * @returns {boolean} True if contradictory
     */
    hasContradictoryRecommendations(system1, system2) {
        // Simplified contradiction detection
        // In a real implementation, this would be more sophisticated
        return false;
    }

    /**
     * Check if two systems have complementary insights
     * @param {Object} system1 - First system
     * @param {Object} system2 - Second system
     * @returns {boolean} True if complementary
     */
    hasComplementaryInsights(system1, system2) {
        // Simplified complementarity detection
        // In a real implementation, this would analyze overlapping benefits
        return true;
    }

    /**
     * Extract harmony-based recommendations from advanced harmony analysis
     * @param {Object} harmonyAnalysis - Harmony analysis results
     * @returns {Array} Harmony-based recommendations
     */
    extractHarmonyRecommendations(harmonyAnalysis) {
        const recommendations = [];

        try {
            if (harmonyAnalysis.mathematicalHarmonies) {
                Object.entries(harmonyAnalysis.mathematicalHarmonies).forEach(([type, colors]) => {
                    if (colors && colors.length > 0) {
                        recommendations.push({
                            type: 'mathematical_harmony',
                            subtype: type,
                            colors: colors.slice(0, 4), // Take first 4 colors
                            description: `Colors based on ${type} mathematical model`,
                            confidence: 85
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Harmony recommendation extraction error:', error);
        }

        return recommendations;
    }

    /**
     * Extract psychology-based recommendations
     * @param {Object} psychologyAnalysis - Psychology analysis results
     * @returns {Array} Psychology-based recommendations
     */
    extractPsychologyRecommendations(psychologyAnalysis) {
        const recommendations = [];

        try {
            if (psychologyAnalysis.recommendations) {
                psychologyAnalysis.recommendations.forEach(rec => {
                    recommendations.push({
                        type: 'psychological',
                        colors: rec.colors || [],
                        description: rec.reasoning || 'Psychology-based color selection',
                        moodTarget: rec.moodTarget || 'balanced',
                        confidence: rec.confidence || 80
                    });
                });
            }
        } catch (error) {
            console.error('Psychology recommendation extraction error:', error);
        }

        return recommendations;
    }

    /**
     * Extract trend-based recommendations
     * @param {Object} trendAnalysis - Trend analysis results
     * @returns {Array} Trend-based recommendations
     */
    extractTrendRecommendations(trendAnalysis) {
        const recommendations = [];

        try {
            if (trendAnalysis.trendingColors) {
                recommendations.push({
                    type: 'trend_based',
                    colors: trendAnalysis.trendingColors.slice(0, 4),
                    description: 'Colors based on current design trends',
                    trendScore: trendAnalysis.trendScore || 75,
                    confidence: 75
                });
            }
        } catch (error) {
            console.error('Trend recommendation extraction error:', error);
        }

        return recommendations;
    }

    /**
     * Extract cultural recommendations
     * @param {Object} culturalAnalysis - Cultural analysis results
     * @returns {Array} Cultural recommendations
     */
    extractCulturalRecommendations(culturalAnalysis) {
        const recommendations = [];

        try {
            if (culturalAnalysis.harmonies) {
                culturalAnalysis.harmonies.forEach(harmony => {
                    recommendations.push({
                        type: 'cultural',
                        colors: harmony.colors || [],
                        description: harmony.description || 'Turkish cultural color harmony',
                        significance: harmony.significance || 'traditional',
                        confidence: harmony.confidence || 70
                    });
                });
            }
        } catch (error) {
            console.error('Cultural recommendation extraction error:', error);
        }

        return recommendations;
    }

    /**
     * Extract seasonal recommendations
     * @param {Object} seasonalAnalysis - Seasonal analysis results
     * @returns {Array} Seasonal recommendations
     */
    extractSeasonalRecommendations(seasonalAnalysis) {
        const recommendations = [];

        try {
            if (seasonalAnalysis.recommendations) {
                seasonalAnalysis.recommendations.forEach(rec => {
                    recommendations.push({
                        type: 'seasonal',
                        colors: rec.colors || [],
                        description: rec.description || 'Seasonal color selection',
                        season: rec.season || 'universal',
                        confidence: rec.confidence || 75
                    });
                });
            }
        } catch (error) {
            console.error('Seasonal recommendation extraction error:', error);
        }

        return recommendations;
    }

    /**
     * Extract brand-based recommendations
     * @param {Object} brandAnalysis - Brand analysis results
     * @returns {Array} Brand-based recommendations
     */
    extractBrandRecommendations(brandAnalysis) {
        const recommendations = [];

        try {
            if (brandAnalysis.palette) {
                recommendations.push({
                    type: 'brand_consistent',
                    colors: brandAnalysis.palette.colors || [],
                    description: 'Colors consistent with brand identity',
                    brandAlignment: brandAnalysis.alignment || 'good',
                    confidence: brandAnalysis.confidence || 80
                });
            }
        } catch (error) {
            console.error('Brand recommendation extraction error:', error);
        }

        return recommendations;
    }

    /**
     * Generate alternative approaches based on advanced analysis
     * @param {Object} advancedAnalysis - Advanced analysis results
     * @returns {Array} Alternative approaches
     */
    generateAlternativeApproaches(advancedAnalysis) {
        const alternatives = [];

        try {
            // Mathematical approach
            if (advancedAnalysis.systems.harmony?.success) {
                alternatives.push({
                    approach: 'mathematical',
                    description: 'Use mathematically derived color harmonies for perfect balance',
                    strength: 'Scientifically optimized relationships',
                    suitability: 'Ideal for modern, sophisticated spaces'
                });
            }

            // Psychological approach
            if (advancedAnalysis.systems.psychology?.success) {
                alternatives.push({
                    approach: 'psychological',
                    description: 'Focus on mood and psychological effects of colors',
                    strength: 'Optimized for emotional well-being',
                    suitability: 'Perfect for spaces focused on specific activities'
                });
            }

            // Cultural approach
            if (advancedAnalysis.systems.cultural?.success) {
                alternatives.push({
                    approach: 'cultural',
                    description: 'Incorporate Turkish cultural color traditions',
                    strength: 'Rich cultural significance and meaning',
                    suitability: 'Excellent for spaces celebrating heritage'
                });
            }

            // Trend-based approach
            if (advancedAnalysis.systems.trends?.success) {
                alternatives.push({
                    approach: 'contemporary',
                    description: 'Follow current design trends and fashions',
                    strength: 'Modern, up-to-date aesthetic',
                    suitability: 'Great for style-conscious environments'
                });
            }

        } catch (error) {
            console.error('Alternative approaches generation error:', error);
        }

        return alternatives;
    }

    /**
     * Generate implementation guidance
     * @param {Object} recommendations - Color recommendations
     * @param {Object} advancedAnalysis - Advanced analysis results
     * @returns {Object} Implementation guidance
     */
    generateImplementationGuidance(recommendations, advancedAnalysis) {
        const guidance = {
            priorityOrder: [],
            stepByStep: [],
            considerations: [],
            timeline: 'flexible'
        };

        try {
            // Determine priority order based on compatibility scores
            if (advancedAnalysis.compatibility.overallScore > 80) {
                guidance.priorityOrder = ['mathematical_harmony', 'psychological', 'cultural', 'trend_based'];
                guidance.timeline = 'coordinated';
            } else {
                guidance.priorityOrder = ['psychological', 'mathematical_harmony', 'cultural'];
                guidance.timeline = 'phased';
            }

            // Generate step-by-step guidance
            guidance.stepByStep = [
                'Start with the primary color from mathematical harmony analysis',
                'Apply psychological considerations for mood optimization',
                'Integrate cultural elements for authenticity',
                'Add contemporary touches based on current trends',
                'Test color combinations in different lighting conditions',
                'Make final adjustments based on personal preferences'
            ];

            // Add important considerations
            guidance.considerations = [
                'Consider natural lighting conditions in the space',
                'Test colors at different times of day',
                'Account for existing furniture and fixtures',
                'Plan for seasonal lighting changes',
                'Consider the primary users of the space'
            ];

        } catch (error) {
            console.error('Implementation guidance generation error:', error);
        }

        return guidance;
    }

    /**
     * Calculate analysis complexity score
     * @param {Object} advancedAnalysis - Advanced analysis results
     * @returns {string} Complexity level
     */
    calculateAnalysisComplexity(advancedAnalysis) {
        try {
            const systemCount = Object.keys(advancedAnalysis.systems).length;
            const successfulSystems = Object.values(advancedAnalysis.systems).filter(s => s.success).length;

            if (successfulSystems >= 5) return 'comprehensive';
            if (successfulSystems >= 3) return 'advanced';
            if (successfulSystems >= 2) return 'enhanced';
            return 'basic';
        } catch (error) {
            return 'basic';
        }
    }
}

module.exports = SanzoColorAgent;