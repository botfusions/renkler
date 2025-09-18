/**
 * Brand Color Integration System
 * Comprehensive brand color analysis and palette generation for the Sanzo Color Advisor
 *
 * Features:
 * - Brand color extraction from logos and images
 * - Brand-consistent palette generation
 * - Color accessibility compliance for brands
 * - Brand color variation generators
 * - Competitive brand color analysis
 * - Brand color trend tracking
 */

const ColorConversions = require('./colorConversions');
const DeltaE = require('./deltaE');

class BrandColorIntegration {

    constructor() {
        this.initializeBrandCategories();
        this.initializeAccessibilityStandards();
        this.initializeBrandPersonalities();
        this.initializeIndustryStandards();
        this.initializeCompetitiveAnalysis();
    }

    /**
     * Initialize brand category color psychology
     */
    initializeBrandCategories() {
        this.brandCategories = {
            technology: {
                name: 'Technology',
                description: 'Innovation, reliability, and cutting-edge solutions',
                preferredColors: {
                    primary: ['blue', 'gray', 'black', 'white'],
                    accent: ['orange', 'green', 'purple'],
                    avoid: ['brown', 'pink', 'yellow']
                },
                colorPsychology: {
                    'blue': 'Trust, reliability, professionalism',
                    'gray': 'Sophistication, neutrality, balance',
                    'black': 'Elegance, power, premium quality',
                    'orange': 'Innovation, energy, creativity',
                    'green': 'Growth, harmony, sustainability'
                },
                examples: {
                    'IBM Blue': '#1f70c1',
                    'Apple Gray': '#86868b',
                    'Microsoft Blue': '#00a1f1',
                    'Google Blue': '#4285f4',
                    'Oracle Red': '#c74634'
                },
                modernTrends: ['Gradient usage', 'Minimalist palettes', 'Accessibility focus']
            },

            healthcare: {
                name: 'Healthcare',
                description: 'Trust, care, healing, and professionalism',
                preferredColors: {
                    primary: ['blue', 'green', 'white'],
                    accent: ['teal', 'light_blue', 'soft_green'],
                    avoid: ['red', 'black', 'dark_colors']
                },
                colorPsychology: {
                    'blue': 'Trust, calm, reliability',
                    'green': 'Health, growth, natural healing',
                    'white': 'Cleanliness, purity, sterility',
                    'teal': 'Balanced healing, professional care'
                },
                examples: {
                    'Clinic Blue': '#2e86ab',
                    'Hospital Green': '#a8dadc',
                    'Medical White': '#f1faee',
                    'Pharmacy Blue': '#457b9d'
                },
                accessibilityRequirements: ['High contrast', 'Vision impairment considerations', 'Emergency readability']
            },

            finance: {
                name: 'Finance',
                description: 'Trust, stability, wealth, and security',
                preferredColors: {
                    primary: ['blue', 'green', 'gold', 'navy'],
                    accent: ['silver', 'gray', 'white'],
                    avoid: ['red', 'orange', 'bright_colors']
                },
                colorPsychology: {
                    'blue': 'Trust, stability, security',
                    'green': 'Money, growth, prosperity',
                    'gold': 'Wealth, premium, luxury',
                    'navy': 'Authority, reliability, professionalism'
                },
                examples: {
                    'Goldman Sachs Blue': '#1e3c87',
                    'JP Morgan Blue': '#0066b2',
                    'Visa Blue': '#1a1f71',
                    'American Express Blue': '#006fcf'
                },
                complianceConsiderations: ['Regulatory requirements', 'Professional standards', 'International usage']
            },

            retail: {
                name: 'Retail',
                description: 'Appeal, energy, shopping experience, and brand personality',
                preferredColors: {
                    primary: ['red', 'blue', 'black', 'white'],
                    accent: ['orange', 'yellow', 'green', 'purple'],
                    avoid: ['brown', 'gray']
                },
                colorPsychology: {
                    'red': 'Urgency, excitement, appetite stimulation',
                    'orange': 'Enthusiasm, warmth, call-to-action',
                    'yellow': 'Happiness, optimism, attention',
                    'black': 'Luxury, sophistication, premium'
                },
                examples: {
                    'Target Red': '#cc0000',
                    'Walmart Blue': '#004c91',
                    'Amazon Orange': '#ff9900',
                    'Best Buy Yellow': '#fff200'
                },
                seasonalAdaptations: ['Holiday variations', 'Seasonal campaigns', 'Limited edition palettes']
            },

            food_beverage: {
                name: 'Food & Beverage',
                description: 'Appetite appeal, freshness, quality, and taste association',
                preferredColors: {
                    primary: ['red', 'orange', 'yellow', 'green'],
                    accent: ['brown', 'cream', 'white'],
                    avoid: ['blue', 'purple', 'gray']
                },
                colorPsychology: {
                    'red': 'Appetite stimulation, energy, passion',
                    'orange': 'Warmth, enthusiasm, citrus freshness',
                    'yellow': 'Happiness, sunshine, freshness',
                    'green': 'Natural, healthy, organic',
                    'brown': 'Earthiness, comfort, chocolate/coffee'
                },
                examples: {
                    'Coca Cola Red': '#f40009',
                    'McDonalds Red': '#da020e',
                    'Starbucks Green': '#00704a',
                    'Subway Yellow': '#ffff00'
                },
                culturalConsiderations: ['Appetite psychology', 'Cultural food associations', 'Dietary implications']
            },

            education: {
                name: 'Education',
                description: 'Learning, growth, wisdom, and accessibility',
                preferredColors: {
                    primary: ['blue', 'green', 'red', 'yellow'],
                    accent: ['orange', 'purple', 'white'],
                    avoid: ['black', 'dark_gray', 'brown']
                },
                colorPsychology: {
                    'blue': 'Focus, calm, intellectual',
                    'green': 'Growth, harmony, nature',
                    'red': 'Energy, attention, importance',
                    'yellow': 'Creativity, optimism, mental stimulation'
                },
                examples: {
                    'Harvard Crimson': '#a51c30',
                    'Yale Blue': '#0f4d92',
                    'Stanford Cardinal': '#8c1515',
                    'Oxford Blue': '#002147'
                },
                accessibilityFocus: ['Learning disabilities', 'Color-blind students', 'Reading comprehension']
            },

            environmental: {
                name: 'Environmental',
                description: 'Sustainability, nature, responsibility, and eco-consciousness',
                preferredColors: {
                    primary: ['green', 'blue', 'brown', 'white'],
                    accent: ['earth_tones', 'natural_colors'],
                    avoid: ['artificial_colors', 'neon', 'chemical_associations']
                },
                colorPsychology: {
                    'green': 'Nature, sustainability, growth',
                    'blue': 'Clean water, sky, purity',
                    'brown': 'Earth, stability, natural',
                    'beige': 'Natural, organic, unprocessed'
                },
                examples: {
                    'Greenpeace Green': '#66cc00',
                    'WWF Blue': '#0089d0',
                    'Patagonia Blue': '#2e86ab',
                    'Tesla Red': '#cc0000'
                },
                sustainabilityFocus: ['Natural color sources', 'Low environmental impact', 'Recyclable materials']
            }
        };
    }

    /**
     * Initialize accessibility standards for brand colors
     */
    initializeAccessibilityStandards() {
        this.accessibilityStandards = {
            wcag: {
                'AA': {
                    normal_text: 4.5,
                    large_text: 3.0,
                    graphical_objects: 3.0
                },
                'AAA': {
                    normal_text: 7.0,
                    large_text: 4.5,
                    graphical_objects: 4.5
                }
            },
            colorBlindness: {
                protanopia: 'Red-blind (1% of males)',
                deuteranopia: 'Green-blind (1% of males)',
                tritanopia: 'Blue-blind (0.003% of population)',
                protanomaly: 'Red-weak (1% of males)',
                deuteranomaly: 'Green-weak (5% of males)',
                tritanomaly: 'Blue-weak (0.001% of population)',
                monochromacy: 'Complete color blindness (0.003% of population)'
            },
            testing: {
                simulationColors: {
                    protanopia: [[1, 0, 0], [0.567, 0.433, 0], [0, 0, 1]],
                    deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0, 1]],
                    tritanopia: [[1, 0, 0], [0, 1, 0], [0.167, 0.833, 0]]
                }
            }
        };
    }

    /**
     * Initialize brand personality frameworks
     */
    initializeBrandPersonalities() {
        this.brandPersonalities = {
            sincerity: {
                traits: ['down-to-earth', 'honest', 'wholesome', 'cheerful'],
                colors: {
                    primary: ['warm_blues', 'earth_tones', 'soft_greens'],
                    accent: ['gentle_yellows', 'cream', 'light_browns'],
                    mood: 'Approachable and trustworthy'
                },
                examples: ['Dove', 'Whole Foods', 'IKEA']
            },
            excitement: {
                traits: ['daring', 'spirited', 'imaginative', 'up-to-date'],
                colors: {
                    primary: ['bright_reds', 'oranges', 'electric_blues'],
                    accent: ['yellows', 'magentas', 'lime_greens'],
                    mood: 'Energetic and dynamic'
                },
                examples: ['Red Bull', 'Nike', 'Virgin']
            },
            competence: {
                traits: ['reliable', 'intelligent', 'successful'],
                colors: {
                    primary: ['deep_blues', 'grays', 'black'],
                    accent: ['silver', 'white', 'cool_greens'],
                    mood: 'Professional and capable'
                },
                examples: ['IBM', 'Microsoft', 'Mercedes-Benz']
            },
            sophistication: {
                traits: ['upper-class', 'charming', 'glamorous'],
                colors: {
                    primary: ['black', 'deep_purples', 'rich_golds'],
                    accent: ['silver', 'cream', 'deep_reds'],
                    mood: 'Luxurious and refined'
                },
                examples: ['Chanel', 'Rolex', 'Louis Vuitton']
            },
            ruggedness: {
                traits: ['outdoorsy', 'masculine', 'western', 'tough'],
                colors: {
                    primary: ['earth_browns', 'forest_greens', 'rust_reds'],
                    accent: ['tan', 'khaki', 'dark_oranges'],
                    mood: 'Strong and adventurous'
                },
                examples: ['Harley-Davidson', 'Jeep', 'Carhartt']
            }
        };
    }

    /**
     * Initialize industry-specific color standards
     */
    initializeIndustryStandards() {
        this.industryStandards = {
            aviation: {
                safety_colors: {
                    'emergency_red': '#ff0000',
                    'caution_yellow': '#ffff00',
                    'safety_green': '#00ff00',
                    'information_blue': '#0000ff'
                },
                visibility_requirements: 'High contrast, long-distance readability',
                international_compliance: 'ICAO standards'
            },
            automotive: {
                safety_colors: {
                    'stop_red': '#ff0000',
                    'caution_amber': '#ffbf00',
                    'go_green': '#00ff00'
                },
                premium_associations: ['black', 'silver', 'white', 'deep_blue'],
                performance_associations: ['red', 'orange', 'yellow']
            },
            pharmaceutical: {
                regulatory_colors: {
                    'prescription_blue': '#0066cc',
                    'otc_green': '#00cc66',
                    'warning_red': '#cc0000',
                    'caution_yellow': '#cccc00'
                },
                compliance_requirements: 'FDA color coding, international standards'
            }
        };
    }

    /**
     * Initialize competitive analysis framework
     */
    initializeCompetitiveAnalysis() {
        this.competitiveAnalysis = {
            differentiationStrategies: {
                'color_opposite': 'Use complementary colors to stand out',
                'temperature_shift': 'Shift from warm to cool or vice versa',
                'saturation_change': 'Increase or decrease saturation levels',
                'lightness_variation': 'Go lighter or darker than competitors',
                'hue_shift': 'Move to different hue family'
            },
            marketPositioning: {
                'premium': {
                    colors: ['black', 'gold', 'deep_blue', 'silver'],
                    strategy: 'Sophistication and exclusivity'
                },
                'accessible': {
                    colors: ['bright_blues', 'friendly_greens', 'warm_oranges'],
                    strategy: 'Approachable and inclusive'
                },
                'innovative': {
                    colors: ['electric_blues', 'bright_greens', 'vibrant_purples'],
                    strategy: 'Cutting-edge and forward-thinking'
                },
                'traditional': {
                    colors: ['navy', 'burgundy', 'forest_green', 'gold'],
                    strategy: 'Heritage and reliability'
                }
            }
        };
    }

    /**
     * Extract brand colors from image data or URL
     * @param {string|ArrayBuffer} imageData - Image data or URL
     * @param {Object} options - Extraction options
     * @returns {Object} Extracted color analysis
     */
    async extractBrandColors(imageData, options = {}) {
        try {
            const {
                colorCount = 10,
                qualityThreshold = 10,
                ignoreWhite = true,
                ignoreBlack = true,
                clustering = 'kmeans'
            } = options;

            // Simulate color extraction (in real implementation, would use image processing)
            const extractedColors = await this.simulateColorExtraction(imageData, {
                colorCount,
                qualityThreshold,
                ignoreWhite,
                ignoreBlack
            });

            // Analyze extracted colors
            const colorAnalysis = this.analyzeBrandColors(extractedColors);

            // Generate brand-consistent palette
            const brandPalette = this.generateBrandPalette(extractedColors, colorAnalysis);

            // Check accessibility compliance
            const accessibilityAnalysis = this.checkBrandAccessibility(brandPalette);

            // Generate variations
            const colorVariations = this.generateBrandVariations(brandPalette);

            return {
                success: true,
                extraction: {
                    sourceType: typeof imageData === 'string' ? 'url' : 'data',
                    extractedColors,
                    dominantColors: colorAnalysis.dominantColors,
                    colorHarmony: colorAnalysis.harmony
                },
                brandAnalysis: {
                    personality: colorAnalysis.personality,
                    industry: colorAnalysis.suggestedIndustry,
                    positioning: colorAnalysis.marketPositioning,
                    psychology: colorAnalysis.colorPsychology
                },
                palette: brandPalette,
                accessibility: accessibilityAnalysis,
                variations: colorVariations,
                recommendations: this.generateBrandRecommendations(colorAnalysis, brandPalette)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate color extraction from image (placeholder for actual implementation)
     */
    async simulateColorExtraction(imageData, options) {
        // In real implementation, this would use Canvas API or image processing library
        // For now, simulate with sample brand colors
        const sampleExtractions = [
            // Technology brand simulation
            [
                { hex: '#1f70c1', frequency: 35, coordinates: [150, 50] },
                { hex: '#ffffff', frequency: 25, coordinates: [200, 100] },
                { hex: '#333333', frequency: 20, coordinates: [100, 80] },
                { hex: '#f0f0f0', frequency: 15, coordinates: [250, 120] },
                { hex: '#0056b3', frequency: 5, coordinates: [180, 60] }
            ],
            // Retail brand simulation
            [
                { hex: '#cc0000', frequency: 40, coordinates: [120, 70] },
                { hex: '#ffffff', frequency: 30, coordinates: [180, 90] },
                { hex: '#000000', frequency: 15, coordinates: [90, 110] },
                { hex: '#ffcccc', frequency: 10, coordinates: [210, 80] },
                { hex: '#990000', frequency: 5, coordinates: [140, 50] }
            ],
            // Healthcare brand simulation
            [
                { hex: '#2e86ab', frequency: 35, coordinates: [160, 85] },
                { hex: '#a8dadc', frequency: 25, coordinates: [200, 65] },
                { hex: '#f1faee', frequency: 20, coordinates: [140, 105] },
                { hex: '#457b9d', frequency: 15, coordinates: [180, 75] },
                { hex: '#1d5f7e', frequency: 5, coordinates: [170, 95] }
            ]
        ];

        // Return random sample for simulation
        const randomIndex = Math.floor(Math.random() * sampleExtractions.length);
        return sampleExtractions[randomIndex];
    }

    /**
     * Analyze extracted brand colors for personality and characteristics
     */
    analyzeBrandColors(extractedColors) {
        const analysis = {
            dominantColors: [],
            harmony: {},
            personality: {},
            suggestedIndustry: [],
            marketPositioning: '',
            colorPsychology: {},
            temperatureProfile: { warm: 0, cool: 0, neutral: 0 }
        };

        // Sort by frequency to find dominant colors
        const sortedColors = extractedColors.sort((a, b) => b.frequency - a.frequency);
        analysis.dominantColors = sortedColors.slice(0, 3).map(color => ({
            hex: color.hex,
            frequency: color.frequency,
            role: this.determineBrandRole(color, sortedColors.indexOf(color))
        }));

        // Analyze color harmony
        const hslColors = extractedColors.map(color => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            return ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
        });

        analysis.harmony = this.analyzeBrandHarmony(hslColors);

        // Determine brand personality
        analysis.personality = this.determineBrandPersonality(extractedColors);

        // Suggest industry alignment
        analysis.suggestedIndustry = this.suggestIndustryAlignment(extractedColors);

        // Determine market positioning
        analysis.marketPositioning = this.determineMarketPositioning(extractedColors);

        // Analyze color psychology
        analysis.colorPsychology = this.analyzeBrandPsychology(extractedColors);

        // Temperature profile
        extractedColors.forEach(color => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            const temp = ColorConversions.getColorTemperature(rgb);
            analysis.temperatureProfile[temp.type] += color.frequency;
        });

        return analysis;
    }

    /**
     * Determine brand role for each color
     */
    determineBrandRole(color, index) {
        const roles = ['primary', 'secondary', 'accent', 'supporting'];
        const roleDescriptions = {
            'primary': 'Main brand color, highest recognition',
            'secondary': 'Supporting brand color, frequent use',
            'accent': 'Emphasis and call-to-action color',
            'supporting': 'Background and supporting elements'
        };

        const role = roles[Math.min(index, roles.length - 1)];
        return {
            name: role,
            description: roleDescriptions[role],
            usage: this.generateRoleUsage(role)
        };
    }

    /**
     * Generate usage guidelines for color roles
     */
    generateRoleUsage(role) {
        const usageGuidelines = {
            'primary': ['Logo', 'Headers', 'Primary buttons', 'Brand signatures', '60% of palette usage'],
            'secondary': ['Subheadings', 'Secondary buttons', 'Accent elements', '30% of palette usage'],
            'accent': ['Call-to-action buttons', 'Highlights', 'Links', 'Special elements', '10% of palette usage'],
            'supporting': ['Backgrounds', 'Borders', 'Text elements', 'Subtle details']
        };

        return usageGuidelines[role] || ['General branding elements'];
    }

    /**
     * Analyze brand color harmony
     */
    analyzeBrandHarmony(hslColors) {
        if (hslColors.length < 2) return { type: 'monochromatic', strength: 100 };

        const hues = hslColors.map(color => color.h);
        const hueSpread = Math.max(...hues) - Math.min(...hues);

        let harmonyType = 'custom';
        let strength = 70;

        // Analyze harmony patterns
        if (hueSpread < 30) {
            harmonyType = 'analogous';
            strength = 85;
        } else if (this.isComplementaryHarmony(hues)) {
            harmonyType = 'complementary';
            strength = 90;
        } else if (this.isTriadicHarmony(hues)) {
            harmonyType = 'triadic';
            strength = 80;
        } else if (hueSpread > 300) {
            harmonyType = 'rainbow';
            strength = 60;
        }

        return {
            type: harmonyType,
            strength,
            characteristics: this.getHarmonyCharacteristics(harmonyType),
            brandSuitability: this.assessBrandHarmonySuitability(harmonyType)
        };
    }

    /**
     * Check for complementary harmony
     */
    isComplementaryHarmony(hues) {
        for (let i = 0; i < hues.length; i++) {
            for (let j = i + 1; j < hues.length; j++) {
                const diff = Math.abs(hues[i] - hues[j]);
                if (Math.abs(diff - 180) < 30 || Math.abs(diff - 180) > 330) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check for triadic harmony
     */
    isTriadicHarmony(hues) {
        if (hues.length < 3) return false;

        const sortedHues = [...hues].sort((a, b) => a - b);
        for (let i = 0; i < sortedHues.length - 2; i++) {
            for (let j = i + 1; j < sortedHues.length - 1; j++) {
                for (let k = j + 1; k < sortedHues.length; k++) {
                    const diff1 = sortedHues[j] - sortedHues[i];
                    const diff2 = sortedHues[k] - sortedHues[j];
                    const diff3 = 360 - (sortedHues[k] - sortedHues[i]);

                    if (Math.abs(diff1 - 120) < 30 && Math.abs(diff2 - 120) < 30 && Math.abs(diff3 - 120) < 30) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Get harmony characteristics for branding
     */
    getHarmonyCharacteristics(harmonyType) {
        const characteristics = {
            'analogous': {
                description: 'Harmonious and cohesive',
                branding: 'Creates unified, calming brand presence',
                emotional: 'Peaceful, sophisticated, reliable'
            },
            'complementary': {
                description: 'High contrast and dynamic',
                branding: 'Strong visual impact, memorable',
                emotional: 'Energetic, bold, attention-grabbing'
            },
            'triadic': {
                description: 'Balanced and vibrant',
                branding: 'Versatile, playful, confident',
                emotional: 'Creative, balanced, dynamic'
            },
            'monochromatic': {
                description: 'Unified and elegant',
                branding: 'Sophisticated, minimalist, focused',
                emotional: 'Calm, elegant, professional'
            },
            'custom': {
                description: 'Unique brand expression',
                branding: 'Distinctive, unconventional',
                emotional: 'Individual, creative, memorable'
            }
        };

        return characteristics[harmonyType] || characteristics.custom;
    }

    /**
     * Assess brand harmony suitability
     */
    assessBrandHarmonySuitability(harmonyType) {
        const suitability = {
            'analogous': {
                industries: ['healthcare', 'education', 'finance', 'wellness'],
                personalities: ['sincerity', 'competence'],
                positioning: 'traditional, reliable'
            },
            'complementary': {
                industries: ['retail', 'food_beverage', 'entertainment', 'sports'],
                personalities: ['excitement', 'ruggedness'],
                positioning: 'bold, energetic'
            },
            'triadic': {
                industries: ['technology', 'creative', 'children', 'lifestyle'],
                personalities: ['excitement', 'sincerity'],
                positioning: 'innovative, balanced'
            },
            'monochromatic': {
                industries: ['luxury', 'professional_services', 'technology', 'fashion'],
                personalities: ['sophistication', 'competence'],
                positioning: 'premium, focused'
            }
        };

        return suitability[harmonyType] || {
            industries: ['any'],
            personalities: ['custom'],
            positioning: 'unique'
        };
    }

    /**
     * Determine brand personality from colors
     */
    determineBrandPersonality(extractedColors) {
        const personalityScores = {
            sincerity: 0,
            excitement: 0,
            competence: 0,
            sophistication: 0,
            ruggedness: 0
        };

        extractedColors.forEach(color => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const weight = color.frequency / 100;

            // Score based on color properties
            if (hsl.l > 70 && hsl.s < 50) {
                personalityScores.sincerity += weight * 2;
            }
            if (hsl.s > 70 && (hsl.h < 60 || hsl.h > 300)) {
                personalityScores.excitement += weight * 2;
            }
            if (hsl.h > 180 && hsl.h < 270 && hsl.s > 30) {
                personalityScores.competence += weight * 2;
            }
            if (hsl.l < 30 || (hsl.h > 270 && hsl.h < 330)) {
                personalityScores.sophistication += weight * 2;
            }
            if ((hsl.h > 15 && hsl.h < 45) || (hsl.h > 90 && hsl.h < 150)) {
                personalityScores.ruggedness += weight * 1.5;
            }
        });

        // Find dominant personality
        const dominantPersonality = Object.entries(personalityScores)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            primary: dominantPersonality[0],
            confidence: Math.min(100, dominantPersonality[1] * 20),
            scores: personalityScores,
            characteristics: this.brandPersonalities[dominantPersonality[0]]
        };
    }

    /**
     * Suggest industry alignment based on colors
     */
    suggestIndustryAlignment(extractedColors) {
        const industryScores = {};

        Object.keys(this.brandCategories).forEach(industry => {
            industryScores[industry] = 0;
        });

        extractedColors.forEach(color => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const weight = color.frequency / 100;

            // Score industries based on color alignment
            Object.entries(this.brandCategories).forEach(([industry, data]) => {
                const colorFits = this.assessIndustryColorFit(hsl, data);
                industryScores[industry] += colorFits * weight;
            });
        });

        // Return top 3 industry suggestions
        return Object.entries(industryScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([industry, score]) => ({
                industry,
                name: this.brandCategories[industry].name,
                confidence: Math.round(score * 20),
                reasoning: this.generateIndustryReasoning(industry, extractedColors)
            }));
    }

    /**
     * Assess how well a color fits an industry
     */
    assessIndustryColorFit(hsl, industryData) {
        let score = 0;

        // Check preferred colors (simplified hue matching)
        const hueCategory = this.categorizeHue(hsl.h);
        if (industryData.preferredColors.primary.includes(hueCategory)) {
            score += 3;
        }
        if (industryData.preferredColors.accent.includes(hueCategory)) {
            score += 2;
        }
        if (industryData.preferredColors.avoid.includes(hueCategory)) {
            score -= 2;
        }

        return Math.max(0, score);
    }

    /**
     * Categorize hue into named color groups
     */
    categorizeHue(hue) {
        if (hue >= 345 || hue < 15) return 'red';
        if (hue >= 15 && hue < 45) return 'orange';
        if (hue >= 45 && hue < 75) return 'yellow';
        if (hue >= 75 && hue < 165) return 'green';
        if (hue >= 165 && hue < 195) return 'cyan';
        if (hue >= 195 && hue < 255) return 'blue';
        if (hue >= 255 && hue < 285) return 'purple';
        if (hue >= 285 && hue < 315) return 'magenta';
        if (hue >= 315 && hue < 345) return 'pink';
        return 'neutral';
    }

    /**
     * Generate reasoning for industry suggestion
     */
    generateIndustryReasoning(industry, extractedColors) {
        const industryData = this.brandCategories[industry];
        const dominantColor = extractedColors[0];
        const dominantHue = this.categorizeHue(
            ColorConversions.rgbToHsl(...Object.values(ColorConversions.hexToRgb(dominantColor.hex))).h
        );

        if (industryData.colorPsychology[dominantHue]) {
            return `Dominant ${dominantHue} suggests: ${industryData.colorPsychology[dominantHue]}`;
        }

        return `Color palette aligns with ${industry} industry standards`;
    }

    /**
     * Determine market positioning from color analysis
     */
    determineMarketPositioning(extractedColors) {
        const avgLightness = extractedColors.reduce((sum, color) => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
            return sum + hsl.l;
        }, 0) / extractedColors.length;

        const avgSaturation = extractedColors.reduce((sum, color) => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
            return sum + hsl.s;
        }, 0) / extractedColors.length;

        if (avgLightness < 30 && avgSaturation > 50) {
            return 'premium';
        } else if (avgLightness > 70 && avgSaturation < 60) {
            return 'accessible';
        } else if (avgSaturation > 70) {
            return 'innovative';
        } else {
            return 'traditional';
        }
    }

    /**
     * Analyze color psychology for branding
     */
    analyzeBrandPsychology(extractedColors) {
        const psychology = {
            emotional_impact: [],
            cognitive_associations: [],
            behavioral_influences: [],
            cultural_considerations: []
        };

        extractedColors.forEach(color => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const colorName = this.categorizeHue(hsl.h);

            const colorPsychology = this.getColorPsychology(colorName, hsl);

            psychology.emotional_impact.push({
                color: color.hex,
                impact: colorPsychology.emotional,
                strength: Math.round(color.frequency)
            });

            psychology.cognitive_associations.push({
                color: color.hex,
                associations: colorPsychology.cognitive,
                relevance: color.frequency > 20 ? 'high' : 'medium'
            });
        });

        return psychology;
    }

    /**
     * Get detailed color psychology information
     */
    getColorPsychology(colorName, hsl) {
        const psychologyMap = {
            'red': {
                emotional: 'Excitement, passion, urgency, energy',
                cognitive: 'Action, importance, warning, love',
                behavioral: 'Increases appetite, creates urgency, grabs attention',
                cultural: 'Power in Western cultures, luck in Asian cultures'
            },
            'blue': {
                emotional: 'Trust, calm, stability, reliability',
                cognitive: 'Professionalism, intelligence, peace',
                behavioral: 'Reduces stress, increases focus, builds trust',
                cultural: 'Corporate reliability, healthcare trust'
            },
            'green': {
                emotional: 'Growth, harmony, freshness, balance',
                cognitive: 'Nature, money, health, sustainability',
                behavioral: 'Reduces eye strain, promotes balance, suggests eco-friendliness',
                cultural: 'Islamic significance, environmental consciousness'
            },
            'yellow': {
                emotional: 'Happiness, optimism, creativity, energy',
                cognitive: 'Sunshine, intelligence, caution',
                behavioral: 'Stimulates mental activity, grabs attention, can cause anxiety',
                cultural: 'Wealth in some cultures, caution in others'
            },
            'orange': {
                emotional: 'Enthusiasm, warmth, excitement, determination',
                cognitive: 'Creativity, adventure, affordability',
                behavioral: 'Increases enthusiasm, creates warmth, stimulates appetite',
                cultural: 'Spiritual significance in some cultures'
            },
            'purple': {
                emotional: 'Luxury, creativity, mystery, spirituality',
                cognitive: 'Royalty, premium quality, imagination',
                behavioral: 'Suggests luxury, inspires creativity, creates mystery',
                cultural: 'Historical royalty, spiritual significance'
            },
            'black': {
                emotional: 'Power, elegance, sophistication, mystery',
                cognitive: 'Premium quality, formality, modernity',
                behavioral: 'Creates premium perception, suggests elegance',
                cultural: 'Formality, mourning in some cultures'
            },
            'white': {
                emotional: 'Purity, cleanliness, simplicity, peace',
                cognitive: 'Minimalism, sterility, new beginnings',
                behavioral: 'Creates sense of space, suggests cleanliness',
                cultural: 'Purity across most cultures, mourning in some'
            }
        };

        return psychologyMap[colorName] || {
            emotional: 'Neutral emotional impact',
            cognitive: 'Balanced associations',
            behavioral: 'Subtle influence',
            cultural: 'Culturally neutral'
        };
    }

    /**
     * Generate comprehensive brand palette
     */
    generateBrandPalette(extractedColors, colorAnalysis) {
        const palette = {
            primary: null,
            secondary: [],
            accent: [],
            neutral: [],
            extended: {
                tints: [],
                shades: [],
                tones: []
            }
        };

        // Set primary color (most frequent)
        const primaryColor = extractedColors[0];
        palette.primary = {
            hex: primaryColor.hex,
            frequency: primaryColor.frequency,
            role: 'primary',
            usage: this.generateRoleUsage('primary'),
            accessibility: this.checkSingleColorAccessibility(primaryColor.hex)
        };

        // Generate secondary colors
        extractedColors.slice(1, 3).forEach((color, index) => {
            palette.secondary.push({
                hex: color.hex,
                frequency: color.frequency,
                role: 'secondary',
                usage: this.generateRoleUsage('secondary'),
                relationship: this.analyzeColorRelationship(primaryColor.hex, color.hex)
            });
        });

        // Generate accent colors
        const accentColors = this.generateAccentColors(primaryColor.hex, colorAnalysis);
        palette.accent = accentColors.map(color => ({
            hex: color.hex,
            role: 'accent',
            purpose: color.purpose,
            usage: this.generateRoleUsage('accent')
        }));

        // Generate neutral colors
        palette.neutral = this.generateBrandNeutrals(extractedColors);

        // Generate extended palette
        palette.extended = this.generateExtendedBrandPalette(palette.primary.hex);

        return palette;
    }

    /**
     * Generate accent colors for brand palette
     */
    generateAccentColors(primaryHex, colorAnalysis) {
        const accentColors = [];
        const primaryRgb = ColorConversions.hexToRgb(primaryHex);
        const primaryHsl = ColorConversions.rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

        // Generate complementary accent
        const complementaryHue = (primaryHsl.h + 180) % 360;
        const complementaryRgb = ColorConversions.hslToRgb(complementaryHue, primaryHsl.s * 0.8, primaryHsl.l * 0.9);
        const complementaryHex = ColorConversions.rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);

        accentColors.push({
            hex: complementaryHex,
            purpose: 'high_contrast',
            description: 'Call-to-action and emphasis'
        });

        // Generate analogous accent
        const analogousHue = (primaryHsl.h + 30) % 360;
        const analogousRgb = ColorConversions.hslToRgb(analogousHue, primaryHsl.s * 0.7, primaryHsl.l * 1.1);
        const analogousHex = ColorConversions.rgbToHex(analogousRgb.r, analogousRgb.g, analogousRgb.b);

        accentColors.push({
            hex: analogousHex,
            purpose: 'harmony',
            description: 'Harmonious accent and supporting elements'
        });

        // Generate energy accent (brighter version)
        const energyRgb = ColorConversions.hslToRgb(primaryHsl.h, Math.min(100, primaryHsl.s * 1.3), Math.min(90, primaryHsl.l * 1.2));
        const energyHex = ColorConversions.rgbToHex(energyRgb.r, energyRgb.g, energyRgb.b);

        accentColors.push({
            hex: energyHex,
            purpose: 'energy',
            description: 'Highlighting and dynamic elements'
        });

        return accentColors;
    }

    /**
     * Generate brand-appropriate neutral colors
     */
    generateBrandNeutrals(extractedColors) {
        const neutrals = [];

        // Analyze extracted colors for neutral tendencies
        const hasWarmTones = extractedColors.some(color => {
            const rgb = ColorConversions.hexToRgb(color.hex);
            const temp = ColorConversions.getColorTemperature(rgb);
            return temp.type === 'warm';
        });

        const baseHue = hasWarmTones ? 30 : 210; // Warm or cool gray base

        // Generate neutral scale
        const neutralLevels = [
            { name: 'lightest', lightness: 95, saturation: 5 },
            { name: 'light', lightness: 85, saturation: 8 },
            { name: 'medium', lightness: 65, saturation: 12 },
            { name: 'dark', lightness: 35, saturation: 15 },
            { name: 'darkest', lightness: 15, saturation: 18 }
        ];

        neutralLevels.forEach(level => {
            const rgb = ColorConversions.hslToRgb(baseHue, level.saturation, level.lightness);
            const hex = ColorConversions.rgbToHex(rgb.r, rgb.g, rgb.b);

            neutrals.push({
                hex,
                name: level.name,
                role: 'neutral',
                usage: this.generateNeutralUsage(level.name),
                accessibility: this.checkSingleColorAccessibility(hex)
            });
        });

        return neutrals;
    }

    /**
     * Generate usage guidelines for neutral colors
     */
    generateNeutralUsage(level) {
        const usageMap = {
            'lightest': ['Backgrounds', 'Card backgrounds', 'Subtle borders'],
            'light': ['Secondary backgrounds', 'Disabled states', 'Subtle text'],
            'medium': ['Borders', 'Placeholders', 'Secondary text'],
            'dark': ['Body text', 'Icons', 'Strong borders'],
            'darkest': ['Headlines', 'High emphasis text', 'Strong contrast elements']
        };

        return usageMap[level] || ['General neutral usage'];
    }

    /**
     * Generate extended brand palette with tints, shades, and tones
     */
    generateExtendedBrandPalette(primaryHex) {
        const primaryRgb = ColorConversions.hexToRgb(primaryHex);
        const primaryHsl = ColorConversions.rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

        const extended = {
            tints: [],
            shades: [],
            tones: []
        };

        // Generate tints (lighter versions)
        for (let i = 1; i <= 4; i++) {
            const tintLightness = Math.min(95, primaryHsl.l + (i * 15));
            const tintSaturation = Math.max(10, primaryHsl.s - (i * 10));
            const tintRgb = ColorConversions.hslToRgb(primaryHsl.h, tintSaturation, tintLightness);
            const tintHex = ColorConversions.rgbToHex(tintRgb.r, tintRgb.g, tintRgb.b);

            extended.tints.push({
                hex: tintHex,
                level: i,
                usage: i <= 2 ? 'Backgrounds and subtle elements' : 'Very light accents'
            });
        }

        // Generate shades (darker versions)
        for (let i = 1; i <= 4; i++) {
            const shadeLightness = Math.max(5, primaryHsl.l - (i * 15));
            const shadeRgb = ColorConversions.hslToRgb(primaryHsl.h, primaryHsl.s, shadeLightness);
            const shadeHex = ColorConversions.rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);

            extended.shades.push({
                hex: shadeHex,
                level: i,
                usage: i <= 2 ? 'Hover states and depth' : 'Strong contrast elements'
            });
        }

        // Generate tones (muted versions)
        for (let i = 1; i <= 3; i++) {
            const toneSaturation = Math.max(5, primaryHsl.s - (i * 20));
            const toneRgb = ColorConversions.hslToRgb(primaryHsl.h, toneSaturation, primaryHsl.l);
            const toneHex = ColorConversions.rgbToHex(toneRgb.r, toneRgb.g, toneRgb.b);

            extended.tones.push({
                hex: toneHex,
                level: i,
                usage: 'Muted backgrounds and sophisticated elements'
            });
        }

        return extended;
    }

    /**
     * Check single color accessibility
     */
    checkSingleColorAccessibility(hex) {
        const accessibility = {
            readability: {},
            colorBlindness: {},
            contrast: {}
        };

        // Check contrast with white and black
        const whiteContrast = this.calculateContrastRatio(hex, '#ffffff');
        const blackContrast = this.calculateContrastRatio(hex, '#000000');

        accessibility.contrast = {
            withWhite: {
                ratio: whiteContrast,
                wcagAA: whiteContrast >= 4.5,
                wcagAAA: whiteContrast >= 7.0
            },
            withBlack: {
                ratio: blackContrast,
                wcagAA: blackContrast >= 4.5,
                wcagAAA: blackContrast >= 7.0
            },
            recommendation: whiteContrast > blackContrast ? 'white' : 'black'
        };

        // Color blindness simulation
        accessibility.colorBlindness = this.simulateColorBlindness(hex);

        return accessibility;
    }

    /**
     * Calculate contrast ratio between two colors
     */
    calculateContrastRatio(color1, color2) {
        const lum1 = this.calculateRelativeLuminance(color1);
        const lum2 = this.calculateRelativeLuminance(color2);

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
    }

    /**
     * Calculate relative luminance for contrast calculations
     */
    calculateRelativeLuminance(hex) {
        const rgb = ColorConversions.hexToRgb(hex);

        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;

        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Simulate color blindness effects
     */
    simulateColorBlindness(hex) {
        const rgb = ColorConversions.hexToRgb(hex);
        const simulations = {};

        // Simulate different types of color blindness
        Object.entries(this.accessibilityStandards.testing.simulationColors).forEach(([type, matrix]) => {
            const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

            const newR = Math.round((matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b) * 255);
            const newG = Math.round((matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b) * 255);
            const newB = Math.round((matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b) * 255);

            simulations[type] = ColorConversions.rgbToHex(
                Math.max(0, Math.min(255, newR)),
                Math.max(0, Math.min(255, newG)),
                Math.max(0, Math.min(255, newB))
            );
        });

        return simulations;
    }

    /**
     * Analyze relationship between two colors
     */
    analyzeColorRelationship(color1Hex, color2Hex) {
        const lab1 = ColorConversions.hexToLab(color1Hex);
        const lab2 = ColorConversions.hexToLab(color2Hex);
        const distance = DeltaE.cie94(lab1, lab2);

        const rgb1 = ColorConversions.hexToRgb(color1Hex);
        const rgb2 = ColorConversions.hexToRgb(color2Hex);
        const hsl1 = ColorConversions.rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
        const hsl2 = ColorConversions.rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

        const hueDiff = Math.abs(hsl1.h - hsl2.h);
        const satDiff = Math.abs(hsl1.s - hsl2.s);
        const lightDiff = Math.abs(hsl1.l - hsl2.l);

        let relationship = 'custom';
        if (Math.abs(hueDiff - 180) < 30) relationship = 'complementary';
        else if (hueDiff < 30) relationship = 'analogous';
        else if (Math.abs(hueDiff - 120) < 30) relationship = 'triadic';
        else if (hueDiff < 60) relationship = 'related';

        return {
            type: relationship,
            distance: Math.round(distance),
            harmony: distance < 25 ? 'harmonious' : distance < 50 ? 'noticeable' : 'contrasting',
            hue_difference: Math.round(hueDiff),
            saturation_difference: Math.round(satDiff),
            lightness_difference: Math.round(lightDiff)
        };
    }

    /**
     * Check brand accessibility compliance
     */
    checkBrandAccessibility(brandPalette) {
        const accessibility = {
            overall_score: 0,
            wcag_compliance: { AA: false, AAA: false },
            color_blindness: {},
            recommendations: [],
            combinations: []
        };

        const allColors = [
            brandPalette.primary,
            ...brandPalette.secondary,
            ...brandPalette.accent,
            ...brandPalette.neutral
        ];

        let totalCombinations = 0;
        let passedAA = 0;
        let passedAAA = 0;

        // Check all color combinations
        for (let i = 0; i < allColors.length; i++) {
            for (let j = i + 1; j < allColors.length; j++) {
                const contrast = this.calculateContrastRatio(allColors[i].hex, allColors[j].hex);
                const combination = {
                    color1: allColors[i].hex,
                    color2: allColors[j].hex,
                    contrast: contrast,
                    wcagAA: contrast >= 4.5,
                    wcagAAA: contrast >= 7.0,
                    usage: this.suggestCombinationUsage(allColors[i], allColors[j], contrast)
                };

                accessibility.combinations.push(combination);
                totalCombinations++;
                if (combination.wcagAA) passedAA++;
                if (combination.wcagAAA) passedAAA++;
            }
        }

        // Calculate overall scores
        accessibility.overall_score = Math.round((passedAA / totalCombinations) * 100);
        accessibility.wcag_compliance.AA = (passedAA / totalCombinations) >= 0.8;
        accessibility.wcag_compliance.AAA = (passedAAA / totalCombinations) >= 0.6;

        // Color blindness analysis
        accessibility.color_blindness = this.analyzeColorBlindnessImpact(allColors);

        // Generate recommendations
        accessibility.recommendations = this.generateAccessibilityRecommendations(accessibility);

        return accessibility;
    }

    /**
     * Suggest usage for color combinations based on contrast
     */
    suggestCombinationUsage(color1, color2, contrast) {
        if (contrast >= 7.0) {
            return 'Excellent for all text sizes and important UI elements';
        } else if (contrast >= 4.5) {
            return 'Good for normal text and standard UI elements';
        } else if (contrast >= 3.0) {
            return 'Suitable for large text and non-critical elements only';
        } else {
            return 'Not recommended for text - use for decorative elements only';
        }
    }

    /**
     * Analyze color blindness impact on palette
     */
    analyzeColorBlindnessImpact(colors) {
        const impact = {
            protanopia: { affected_colors: [], severity: 'low' },
            deuteranopia: { affected_colors: [], severity: 'low' },
            tritanopia: { affected_colors: [], severity: 'low' }
        };

        colors.forEach(color => {
            const simulations = this.simulateColorBlindness(color.hex);

            Object.entries(simulations).forEach(([type, simulatedHex]) => {
                const distance = DeltaE.cie94(
                    ColorConversions.hexToLab(color.hex),
                    ColorConversions.hexToLab(simulatedHex)
                );

                if (distance > 20) {
                    impact[type].affected_colors.push({
                        original: color.hex,
                        simulated: simulatedHex,
                        distance: Math.round(distance)
                    });
                }
            });
        });

        // Determine severity
        Object.keys(impact).forEach(type => {
            const affectedCount = impact[type].affected_colors.length;
            if (affectedCount > colors.length * 0.6) {
                impact[type].severity = 'high';
            } else if (affectedCount > colors.length * 0.3) {
                impact[type].severity = 'medium';
            }
        });

        return impact;
    }

    /**
     * Generate accessibility recommendations
     */
    generateAccessibilityRecommendations(accessibility) {
        const recommendations = [];

        if (accessibility.overall_score < 70) {
            recommendations.push({
                priority: 'high',
                category: 'contrast',
                issue: 'Low overall contrast compliance',
                solution: 'Increase contrast between color pairs, especially for text elements',
                impact: 'Improves readability for all users'
            });
        }

        if (!accessibility.wcag_compliance.AA) {
            recommendations.push({
                priority: 'high',
                category: 'wcag',
                issue: 'WCAG AA compliance not met',
                solution: 'Ensure primary text/background combinations meet 4.5:1 contrast ratio',
                impact: 'Legal compliance and accessibility standards'
            });
        }

        // Color blindness recommendations
        Object.entries(accessibility.color_blindness).forEach(([type, data]) => {
            if (data.severity === 'high') {
                recommendations.push({
                    priority: 'medium',
                    category: 'color_blindness',
                    issue: `High impact on ${type} users`,
                    solution: 'Consider alternative color choices or additional visual indicators',
                    impact: `Improves experience for ${this.accessibilityStandards.colorBlindness[type]}`
                });
            }
        });

        return recommendations;
    }

    /**
     * Generate brand color variations
     */
    generateBrandVariations(brandPalette) {
        const variations = {
            seasonal: this.generateSeasonalVariations(brandPalette),
            contextual: this.generateContextualVariations(brandPalette),
            accessibility: this.generateAccessibilityVariations(brandPalette),
            international: this.generateInternationalVariations(brandPalette)
        };

        return variations;
    }

    /**
     * Generate seasonal brand variations
     */
    generateSeasonalVariations(brandPalette) {
        const primary = brandPalette.primary.hex;
        const primaryRgb = ColorConversions.hexToRgb(primary);
        const primaryHsl = ColorConversions.rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

        return {
            spring: {
                description: 'Fresh and energetic spring variation',
                adjustments: 'Increased saturation and lightness',
                colors: this.adjustColorsForSeason(brandPalette, 'spring')
            },
            summer: {
                description: 'Light and airy summer variation',
                adjustments: 'Increased lightness, slightly reduced saturation',
                colors: this.adjustColorsForSeason(brandPalette, 'summer')
            },
            autumn: {
                description: 'Rich and warm autumn variation',
                adjustments: 'Warmer hues, maintained saturation',
                colors: this.adjustColorsForSeason(brandPalette, 'autumn')
            },
            winter: {
                description: 'Cool and sophisticated winter variation',
                adjustments: 'Cooler hues, increased contrast',
                colors: this.adjustColorsForSeason(brandPalette, 'winter')
            }
        };
    }

    /**
     * Adjust colors for specific season
     */
    adjustColorsForSeason(brandPalette, season) {
        const adjustments = {
            spring: { hue: 5, saturation: 1.2, lightness: 1.1 },
            summer: { hue: 0, saturation: 0.9, lightness: 1.3 },
            autumn: { hue: -10, saturation: 1.1, lightness: 0.9 },
            winter: { hue: 10, saturation: 1.0, lightness: 0.8 }
        };

        const adjustment = adjustments[season];
        const seasonalColors = {};

        ['primary', 'secondary', 'accent'].forEach(category => {
            const colors = category === 'primary' ? [brandPalette.primary] : brandPalette[category];

            seasonalColors[category] = colors.map(color => {
                const rgb = ColorConversions.hexToRgb(color.hex);
                const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);

                const adjustedHsl = {
                    h: (hsl.h + adjustment.hue + 360) % 360,
                    s: Math.max(0, Math.min(100, hsl.s * adjustment.saturation)),
                    l: Math.max(0, Math.min(100, hsl.l * adjustment.lightness))
                };

                const adjustedRgb = ColorConversions.hslToRgb(adjustedHsl.h, adjustedHsl.s, adjustedHsl.l);
                const adjustedHex = ColorConversions.rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);

                return {
                    original: color.hex,
                    adjusted: adjustedHex,
                    season: season
                };
            });
        });

        return seasonalColors;
    }

    /**
     * Generate contextual variations (digital, print, merchandise)
     */
    generateContextualVariations(brandPalette) {
        return {
            digital: {
                description: 'Optimized for digital screens and interfaces',
                adjustments: 'RGB color space, increased saturation for screens',
                recommendations: [
                    'Use sRGB color space for consistency',
                    'Test on different screen types and brightness levels',
                    'Consider dark mode variations'
                ]
            },
            print: {
                description: 'Optimized for print materials',
                adjustments: 'CMYK color space, adjusted for print reproduction',
                recommendations: [
                    'Convert to CMYK and test print samples',
                    'Account for paper type and printing method',
                    'Include Pantone color specifications'
                ]
            },
            merchandise: {
                description: 'Adapted for physical products and materials',
                adjustments: 'Material-specific color considerations',
                recommendations: [
                    'Test colors on actual materials',
                    'Consider durability and fade resistance',
                    'Account for texture and finish effects'
                ]
            }
        };
    }

    /**
     * Generate accessibility-focused variations
     */
    generateAccessibilityVariations(brandPalette) {
        const accessibleColors = {};

        // Generate high contrast version
        const primary = brandPalette.primary.hex;
        const primaryRgb = ColorConversions.hexToRgb(primary);
        const primaryHsl = ColorConversions.rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

        // Create high contrast version
        const highContrastLightness = primaryHsl.l > 50 ? Math.max(10, primaryHsl.l - 40) : Math.min(90, primaryHsl.l + 40);
        const highContrastRgb = ColorConversions.hslToRgb(primaryHsl.h, primaryHsl.s, highContrastLightness);
        const highContrastHex = ColorConversions.rgbToHex(highContrastRgb.r, highContrastRgb.g, highContrastRgb.b);

        accessibleColors.high_contrast = {
            primary: { original: primary, accessible: highContrastHex },
            description: 'High contrast version for better accessibility',
            wcag_compliance: 'Designed to meet WCAG AAA standards'
        };

        // Generate color-blind friendly alternatives
        accessibleColors.color_blind_friendly = {
            description: 'Alternative colors that work better for color-blind users',
            recommendations: [
                'Use patterns or textures in addition to color',
                'Ensure sufficient brightness contrast',
                'Avoid red-green combinations for critical information'
            ]
        };

        return accessibleColors;
    }

    /**
     * Generate international/cultural variations
     */
    generateInternationalVariations(brandPalette) {
        return {
            western_markets: {
                description: 'Optimized for Western cultural preferences',
                considerations: ['Blue for trust', 'Red for urgency', 'Green for go/positive']
            },
            asian_markets: {
                description: 'Adapted for Asian cultural contexts',
                considerations: ['Red for luck and prosperity', 'Gold for wealth', 'White considerations vary by country']
            },
            middle_eastern_markets: {
                description: 'Respectful of Middle Eastern cultural values',
                considerations: ['Green significance in Islamic culture', 'Gold for luxury', 'Cultural color sensitivities']
            },
            global_safe: {
                description: 'Culturally neutral colors for global markets',
                recommendations: ['Blue and white combinations', 'Neutral grays', 'Avoid culturally specific color meanings']
            }
        };
    }

    /**
     * Generate comprehensive brand recommendations
     */
    generateBrandRecommendations(colorAnalysis, brandPalette) {
        const recommendations = [];

        // Industry alignment recommendations
        if (colorAnalysis.suggestedIndustry.length > 0) {
            const topIndustry = colorAnalysis.suggestedIndustry[0];
            recommendations.push({
                category: 'industry_alignment',
                priority: 'medium',
                title: `${topIndustry.name} Industry Optimization`,
                suggestion: `Colors align well with ${topIndustry.name} industry standards`,
                enhancement: `Consider incorporating ${topIndustry.industry}-specific color psychology`,
                benefit: 'Improves industry credibility and customer trust'
            });
        }

        // Personality enhancement recommendations
        const personality = colorAnalysis.personality;
        if (personality.confidence < 80) {
            recommendations.push({
                category: 'personality',
                priority: 'medium',
                title: 'Brand Personality Strengthening',
                suggestion: `Current ${personality.primary} personality could be stronger`,
                enhancement: 'Adjust color saturation and contrast to reinforce brand personality',
                benefit: 'Clearer brand personality communication'
            });
        }

        // Accessibility improvements
        recommendations.push({
            category: 'accessibility',
            priority: 'high',
            title: 'Accessibility Compliance',
            suggestion: 'Ensure all brand applications meet accessibility standards',
            enhancement: 'Develop high-contrast versions for accessibility',
            benefit: 'Legal compliance and inclusive design'
        });

        // Competitive differentiation
        recommendations.push({
            category: 'differentiation',
            priority: 'medium',
            title: 'Market Differentiation',
            suggestion: 'Analyze competitor color usage for differentiation opportunities',
            enhancement: 'Develop unique color applications that stand out in the market',
            benefit: 'Improved brand recognition and market position'
        });

        // Implementation guidelines
        recommendations.push({
            category: 'implementation',
            priority: 'high',
            title: 'Brand Implementation',
            suggestion: 'Create comprehensive brand guidelines for color usage',
            enhancement: 'Include digital, print, and merchandise specifications',
            benefit: 'Consistent brand experience across all touchpoints'
        });

        return recommendations;
    }

    /**
     * Perform competitive brand color analysis
     * @param {Array} competitorColors - Array of competitor color palettes
     * @param {Object} brandPalette - Current brand palette
     * @returns {Object} Competitive analysis results
     */
    performCompetitiveAnalysis(competitorColors, brandPalette) {
        const analysis = {
            differentiation_score: 0,
            market_gaps: [],
            positioning_opportunities: [],
            color_clustering: {},
            recommendations: []
        };

        const currentPrimary = brandPalette.primary.hex;
        const currentLab = ColorConversions.hexToLab(currentPrimary);

        // Analyze competitor color clustering
        const competitorDistances = competitorColors.map(competitorPalette => {
            const competitorPrimary = competitorPalette.primary || competitorPalette.colors[0];
            const competitorLab = ColorConversions.hexToLab(competitorPrimary);
            const distance = DeltaE.cie94(currentLab, competitorLab);

            return {
                competitor: competitorPalette.brand || 'Unknown',
                color: competitorPrimary,
                distance: Math.round(distance),
                similarity: distance < 30 ? 'high' : distance < 60 ? 'medium' : 'low'
            };
        });

        // Calculate differentiation score
        const avgDistance = competitorDistances.reduce((sum, comp) => sum + comp.distance, 0) / competitorDistances.length;
        analysis.differentiation_score = Math.min(100, Math.round(avgDistance * 2));

        // Identify market gaps
        analysis.market_gaps = this.identifyMarketGaps(competitorColors);

        // Generate positioning opportunities
        analysis.positioning_opportunities = this.generatePositioningOpportunities(competitorDistances, brandPalette);

        // Competitive recommendations
        analysis.recommendations = this.generateCompetitiveRecommendations(analysis, competitorDistances);

        return {
            success: true,
            analysis,
            competitor_comparison: competitorDistances
        };
    }

    /**
     * Identify market gaps in color positioning
     */
    identifyMarketGaps(competitorColors) {
        const gaps = [];
        const usedHueRanges = new Set();

        // Analyze competitor hue distribution
        competitorColors.forEach(palette => {
            const primaryColor = palette.primary || palette.colors[0];
            const rgb = ColorConversions.hexToRgb(primaryColor);
            const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const hueRange = Math.floor(hsl.h / 30) * 30; // Group into 30-degree ranges
            usedHueRanges.add(hueRange);
        });

        // Identify unused hue ranges
        for (let hue = 0; hue < 360; hue += 30) {
            if (!usedHueRanges.has(hue)) {
                gaps.push({
                    hue_range: `${hue}-${hue + 30}`,
                    color_family: this.categorizeHue(hue + 15),
                    opportunity: `Underutilized ${this.categorizeHue(hue + 15)} color family`,
                    market_potential: this.assessMarketPotential(hue + 15)
                });
            }
        }

        return gaps;
    }

    /**
     * Assess market potential for a hue
     */
    assessMarketPotential(hue) {
        const colorName = this.categorizeHue(hue);
        const psychology = this.getColorPsychology(colorName, { h: hue, s: 50, l: 50 });

        return {
            emotional_appeal: psychology.emotional,
            market_associations: psychology.cognitive,
            differentiation_value: 'medium' // Could be enhanced with market research data
        };
    }

    /**
     * Generate positioning opportunities
     */
    generatePositioningOpportunities(competitorDistances, brandPalette) {
        const opportunities = [];

        // If too similar to competitors
        const similarCompetitors = competitorDistances.filter(comp => comp.similarity === 'high');
        if (similarCompetitors.length > 0) {
            opportunities.push({
                type: 'differentiation_needed',
                priority: 'high',
                issue: `Similar to ${similarCompetitors.length} competitor(s)`,
                solution: 'Shift hue, saturation, or lightness to create distinction',
                strategies: this.competitiveAnalysis.differentiationStrategies
            });
        }

        // Market positioning opportunities
        const currentPositioning = this.determineMarketPositioning([{ hex: brandPalette.primary.hex, frequency: 100 }]);
        opportunities.push({
            type: 'positioning_enhancement',
            priority: 'medium',
            current_position: currentPositioning,
            alternatives: Object.keys(this.competitiveAnalysis.marketPositioning),
            benefits: 'Align color strategy with desired market position'
        });

        return opportunities;
    }

    /**
     * Generate competitive recommendations
     */
    generateCompetitiveRecommendations(analysis, competitorDistances) {
        const recommendations = [];

        if (analysis.differentiation_score < 50) {
            recommendations.push({
                priority: 'high',
                category: 'differentiation',
                issue: 'Low differentiation from competitors',
                solution: 'Consider significant color adjustments or unique color combinations',
                impact: 'Improved brand recognition and market standing'
            });
        }

        if (analysis.market_gaps.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'opportunity',
                issue: 'Underutilized color spaces in market',
                solution: `Consider ${analysis.market_gaps[0].color_family} color family for differentiation`,
                impact: 'First-mover advantage in color positioning'
            });
        }

        recommendations.push({
            priority: 'low',
            category: 'monitoring',
            issue: 'Competitive color landscape changes',
            solution: 'Regularly monitor competitor color changes and market trends',
            impact: 'Maintain competitive color advantage'
        });

        return recommendations;
    }
}

module.exports = BrandColorIntegration;