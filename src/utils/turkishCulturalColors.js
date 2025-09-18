/**
 * Turkish Cultural Color System
 * Comprehensive integration of Turkish cultural color significance and historical period palettes
 *
 * Features:
 * - Historical period color palettes (Ottoman, Byzantine, Seljuk, Modern Turkish)
 * - Cultural symbolism and religious significance
 * - Regional color variations across Turkey
 * - Traditional craft color schemes (ceramics, textiles, carpets)
 * - Modern Turkish design integration
 * - Cultural context analysis and recommendations
 */

const ColorConversions = require('./colorConversions');
const DeltaE = require('./deltaE');

class TurkishCulturalColors {

    constructor() {
        this.initializeHistoricalPeriods();
        this.initializeCulturalSymbolism();
        this.initializeRegionalVariations();
        this.initializeTraditionalCrafts();
        this.initializeModernTurkishDesign();
        this.initializeReligiousSymbolism();
    }

    /**
     * Initialize historical period color palettes
     */
    initializeHistoricalPeriods() {
        this.historicalPeriods = {
            ottoman: {
                name: 'Ottoman Empire',
                period: '1299-1922',
                description: 'Rich, luxurious colors reflecting imperial grandeur and Islamic aesthetics',
                characteristics: {
                    dominantColors: ['blue', 'gold', 'white', 'green', 'red'],
                    symbolism: 'Power, divinity, purity, paradise, strength',
                    materials: 'Silk, gold thread, precious stones',
                    influences: 'Islamic art, Byzantine heritage, Persian aesthetics'
                },
                palette: {
                    'ottoman_blue': {
                        hex: '#1e3a8a',
                        name: 'Ottoman Royal Blue',
                        significance: 'Divine protection and royal authority',
                        usage: 'Palace decorations, royal robes, mosque tiles',
                        symbolism: 'Heaven, infinity, divine power',
                        historical_context: 'Used in Topkapi Palace ceramics and royal textiles'
                    },
                    'byzantine_gold': {
                        hex: '#ffd700',
                        name: 'Byzantine Gold',
                        significance: 'Divine light and earthly prosperity',
                        usage: 'Illuminated manuscripts, imperial regalia, mosque decorations',
                        symbolism: 'Divine presence, wisdom, eternal value',
                        historical_context: 'Inherited from Byzantine Empire, symbol of continuity'
                    },
                    'imperial_white': {
                        hex: '#f8f9fa',
                        name: 'Imperial White',
                        significance: 'Purity, peace, and divine blessing',
                        usage: 'Religious architecture, ceremonial dress, calligraphy backgrounds',
                        symbolism: 'Spiritual purity, new beginnings, peace',
                        historical_context: 'Sacred color in Islamic tradition'
                    },
                    'paradise_green': {
                        hex: '#16a085',
                        name: 'Paradise Green',
                        significance: 'Islamic paradise and natural harmony',
                        usage: 'Garden design, religious texts, ceramic work',
                        symbolism: 'Paradise, nature, renewal, Islam',
                        historical_context: 'Color of the Prophet, representing Islamic faith'
                    },
                    'sultan_red': {
                        hex: '#c0392b',
                        name: 'Sultan Red',
                        significance: 'Power, courage, and martial strength',
                        usage: 'Military banners, ceremonial robes, architectural accents',
                        symbolism: 'Courage, strength, passion, sacrifice',
                        historical_context: 'Color of Ottoman military and imperial power'
                    },
                    'iznik_turquoise': {
                        hex: '#48c9b0',
                        name: 'Iznik Turquoise',
                        significance: 'Artistic excellence and heavenly beauty',
                        usage: 'Famous Iznik ceramics, mosque decorations, luxury items',
                        symbolism: 'Artistic mastery, heavenly realm, protection',
                        historical_context: 'Signature color of world-renowned Iznik pottery'
                    }
                },
                patterns: {
                    'tulip_motif': 'Symbol of paradise and divine beauty',
                    'carnation_design': 'Representing the Prophet and divine love',
                    'geometric_patterns': 'Infinite nature of Allah through mathematical harmony',
                    'calligraphy_gold': 'Sacred texts in golden illumination'
                },
                modernAdaptations: {
                    'contemporary_ottoman_blue': '#2563eb',
                    'modern_byzantine_gold': '#f59e0b',
                    'updated_paradise_green': '#059669'
                }
            },

            byzantine: {
                name: 'Byzantine Empire (in Anatolia)',
                period: '330-1453',
                description: 'Sophisticated color schemes reflecting Christian Byzantine culture',
                characteristics: {
                    dominantColors: ['purple', 'gold', 'white', 'blue', 'red'],
                    symbolism: 'Imperial authority, divine connection, Christian faith',
                    materials: 'Purple silk, gold mosaics, precious metals',
                    influences: 'Christian symbolism, Roman heritage, Eastern traditions'
                },
                palette: {
                    'byzantine_purple': {
                        hex: '#6a0572',
                        name: 'Byzantine Purple',
                        significance: 'Imperial majesty and divine authority',
                        usage: 'Imperial robes, religious vestments, palace decorations',
                        symbolism: 'Royalty, divine right, spiritual authority',
                        historical_context: 'Reserved for emperors, symbol of ultimate power'
                    },
                    'mosaic_gold': {
                        hex: '#ffb347',
                        name: 'Mosaic Gold',
                        significance: 'Divine light and heavenly glory',
                        usage: 'Church mosaics, religious art, illuminated manuscripts',
                        symbolism: 'Divine presence, enlightenment, eternal value',
                        historical_context: 'Hagia Sophia mosaics, representing Christ\'s divinity'
                    },
                    'sacred_blue': {
                        hex: '#4169e1',
                        name: 'Sacred Blue',
                        significance: 'Virgin Mary and heavenly realm',
                        usage: 'Religious icons, church decorations, sacred vestments',
                        symbolism: 'Heaven, truth, divine wisdom, Virgin Mary',
                        historical_context: 'Marian devotion in Byzantine Christianity'
                    },
                    'martyr_red': {
                        hex: '#dc143c',
                        name: 'Martyr Red',
                        significance: 'Christ\'s sacrifice and martyrdom',
                        usage: 'Religious art, ceremonial items, symbolic decorations',
                        symbolism: 'Sacrifice, divine love, martyrdom, Christ\'s blood',
                        historical_context: 'Christian symbolism of ultimate sacrifice'
                    }
                }
            },

            seljuk: {
                name: 'Seljuk Empire',
                period: '1037-1194',
                description: 'Refined color palette reflecting early Turkish-Islamic synthesis',
                characteristics: {
                    dominantColors: ['turquoise', 'white', 'brown', 'gold', 'green'],
                    symbolism: 'Wisdom, purity, earth connection, prosperity, faith',
                    materials: 'Stone, ceramics, metalwork, textiles',
                    influences: 'Persian culture, Islamic art, Central Asian traditions'
                },
                palette: {
                    'seljuk_turquoise': {
                        hex: '#40e0d0',
                        name: 'Seljuk Turquoise',
                        significance: 'Wisdom and spiritual protection',
                        usage: 'Architectural decoration, ceramics, jewelry',
                        symbolism: 'Wisdom, protection from evil eye, spiritual clarity',
                        historical_context: 'Protection symbol in Anatolian culture'
                    },
                    'anatolian_brown': {
                        hex: '#8b4513',
                        name: 'Anatolian Earth Brown',
                        significance: 'Connection to Anatolian soil and heritage',
                        usage: 'Stone architecture, pottery, everyday items',
                        symbolism: 'Earth, stability, heritage, grounding',
                        historical_context: 'Color of Anatolian landscape and architecture'
                    },
                    'nomad_white': {
                        hex: '#f5f5dc',
                        name: 'Nomad White',
                        significance: 'Purity and simplicity of nomadic life',
                        usage: 'Tent decorations, clothing, ceremonial items',
                        symbolism: 'Purity, simplicity, new beginnings',
                        historical_context: 'Reflecting nomadic Turkish origins'
                    }
                }
            },

            modern_turkish: {
                name: 'Modern Republic',
                period: '1923-present',
                description: 'Contemporary Turkish design balancing tradition and modernity',
                characteristics: {
                    dominantColors: ['red', 'white', 'modern_blues', 'contemporary_greens'],
                    symbolism: 'National identity, progress, cultural continuity',
                    materials: 'Modern materials with traditional techniques',
                    influences: 'National symbolism, international design, cultural heritage'
                },
                palette: {
                    'republic_red': {
                        hex: '#e30a17',
                        name: 'Republic Red',
                        significance: 'Turkish flag and national identity',
                        usage: 'National symbols, modern architecture, contemporary design',
                        symbolism: 'National pride, modern Turkey, independence',
                        historical_context: 'Color of Turkish flag and national identity'
                    },
                    'atatürk_white': {
                        hex: '#ffffff',
                        name: 'Atatürk White',
                        significance: 'Peace, progress, and modernization',
                        usage: 'Government buildings, modern architecture, public spaces',
                        symbolism: 'Peace, progress, enlightenment, modernity',
                        historical_context: 'Symbol of modern Turkey\'s peaceful intentions'
                    },
                    'bosphorus_blue': {
                        hex: '#0ea5e9',
                        name: 'Bosphorus Blue',
                        significance: 'Istanbul\'s strategic importance and modernity',
                        usage: 'Urban design, modern architecture, contemporary art',
                        symbolism: 'Modernity, connection, international outlook',
                        historical_context: 'Representing modern Istanbul as global city'
                    },
                    'anatolian_green': {
                        hex: '#22c55e',
                        name: 'Modern Anatolian Green',
                        significance: 'Agricultural heritage and environmental consciousness',
                        usage: 'Sustainable design, agricultural projects, eco-friendly spaces',
                        symbolism: 'Sustainability, agricultural heritage, environmental awareness',
                        historical_context: 'Turkey\'s agricultural backbone and green future'
                    }
                }
            }
        };
    }

    /**
     * Initialize cultural symbolism system
     */
    initializeCulturalSymbolism() {
        this.culturalSymbolism = {
            religious: {
                islam: {
                    'green': {
                        significance: 'Color of Islam and the Prophet',
                        emotional_impact: 'Peace, paradise, renewal',
                        usage_guidelines: 'Sacred spaces, religious contexts, respectful application',
                        cultural_sensitivity: 'High - avoid casual or inappropriate use'
                    },
                    'white': {
                        significance: 'Purity, hajj pilgrimage, spiritual cleanliness',
                        emotional_impact: 'Purity, peace, new beginnings',
                        usage_guidelines: 'Religious spaces, ceremonial contexts',
                        cultural_sensitivity: 'Medium - generally positive associations'
                    },
                    'blue': {
                        significance: 'Protection, sky, infinity',
                        emotional_impact: 'Protection, calm, spiritual depth',
                        usage_guidelines: 'Protective items, spiritual spaces',
                        cultural_sensitivity: 'Low - widely accepted'
                    }
                },
                christianity: {
                    'purple': {
                        significance: 'Byzantine Christian heritage, imperial authority',
                        emotional_impact: 'Majesty, spiritual authority, reverence',
                        usage_guidelines: 'Formal, historical contexts',
                        cultural_sensitivity: 'Medium - historical significance'
                    },
                    'gold': {
                        significance: 'Divine light, heavenly glory',
                        emotional_impact: 'Reverence, divine presence, celebration',
                        usage_guidelines: 'Celebratory, formal religious contexts',
                        cultural_sensitivity: 'Low - universally positive'
                    }
                }
            },

            national: {
                'flag_red': {
                    significance: 'National identity, sacrifice for homeland',
                    emotional_impact: 'Pride, strength, patriotism',
                    usage_guidelines: 'Respectful patriotic contexts, national celebrations',
                    cultural_sensitivity: 'High - handle with respect and dignity'
                },
                'flag_white': {
                    significance: 'Peace, purity of intentions',
                    emotional_impact: 'Unity, peace, hope',
                    usage_guidelines: 'Peaceful contexts, unity themes',
                    cultural_sensitivity: 'Low - positive associations'
                }
            },

            folk_traditions: {
                'evil_eye_blue': {
                    hex: '#0066cc',
                    significance: 'Protection from evil eye (nazar)',
                    emotional_impact: 'Protection, safety, good fortune',
                    usage_guidelines: 'Protective contexts, traditional designs',
                    cultural_sensitivity: 'Medium - important cultural symbol'
                },
                'henna_orange': {
                    hex: '#ff6600',
                    significance: 'Celebration, fertility, joy',
                    emotional_impact: 'Celebration, happiness, life events',
                    usage_guidelines: 'Celebratory contexts, traditional ceremonies',
                    cultural_sensitivity: 'Low - celebratory associations'
                },
                'carpet_red': {
                    hex: '#cc0000',
                    significance: 'Traditional carpet making, home warmth',
                    emotional_impact: 'Warmth, tradition, craftsmanship',
                    usage_guidelines: 'Traditional contexts, craft appreciation',
                    cultural_sensitivity: 'Low - craft tradition'
                }
            }
        };
    }

    /**
     * Initialize regional color variations across Turkey
     */
    initializeRegionalVariations() {
        this.regionalVariations = {
            istanbul: {
                name: 'Istanbul',
                description: 'Cosmopolitan palette reflecting the city\'s unique character',
                characteristics: 'Urban sophistication, historical depth, cultural fusion',
                palette: {
                    'bosphorus_blue': '#0ea5e9',
                    'galata_gray': '#6b7280',
                    'sultanahmet_gold': '#f59e0b',
                    'taksim_modern': '#8b5cf6'
                },
                cultural_elements: ['Byzantine mosaics', 'Ottoman architecture', 'modern urban design']
            },

            cappadocia: {
                name: 'Cappadocia',
                description: 'Earth tones inspired by unique geological formations',
                characteristics: 'Natural wonder, earth connection, ancient heritage',
                palette: {
                    'fairy_chimney_beige': '#f5deb3',
                    'cave_brown': '#8b4513',
                    'sunset_orange': '#ff8c00',
                    'balloon_sky_blue': '#87ceeb'
                },
                cultural_elements: ['Underground cities', 'rock churches', 'hot air ballooning']
            },

            aegean: {
                name: 'Aegean Coast',
                description: 'Mediterranean-inspired coastal colors',
                characteristics: 'Coastal lifestyle, ancient ruins, olive groves',
                palette: {
                    'aegean_blue': '#4682b4',
                    'olive_green': '#808000',
                    'whitewash_white': '#f8f8ff',
                    'terracotta_red': '#cd853f'
                },
                cultural_elements: ['Ancient Greek ruins', 'Olive cultivation', 'Coastal villages']
            },

            anatolia: {
                name: 'Central Anatolia',
                description: 'Heartland colors reflecting agricultural heritage',
                characteristics: 'Agricultural abundance, traditional life, seasonal changes',
                palette: {
                    'wheat_gold': '#daa520',
                    'poppy_red': '#ff4500',
                    'steppe_brown': '#a0522d',
                    'mountain_blue': '#4169e1'
                },
                cultural_elements: ['Wheat fields', 'Poppy flowers', 'Traditional villages']
            },

            black_sea: {
                name: 'Black Sea Region',
                description: 'Rich greens and deep blues of the forested coast',
                characteristics: 'Lush forests, tea plantations, maritime culture',
                palette: {
                    'forest_green': '#228b22',
                    'tea_leaf_green': '#6b8e23',
                    'black_sea_navy': '#191970',
                    'highland_mist': '#f0f8ff'
                },
                cultural_elements: ['Tea culture', 'Highland plateaus', 'Wooden architecture']
            },

            mediterranean: {
                name: 'Mediterranean Coast',
                description: 'Bright, warm colors of the southern coast',
                characteristics: 'Tourism, ancient history, citrus cultivation',
                palette: {
                    'mediterranean_blue': '#1e90ff',
                    'citrus_orange': '#ffa500',
                    'pine_green': '#01796f',
                    'limestone_white': '#faf0e6'
                },
                cultural_elements: ['Ancient cities', 'Citrus groves', 'Coastal tourism']
            }
        };
    }

    /**
     * Initialize traditional crafts color schemes
     */
    initializeTraditionalCrafts() {
        this.traditionalCrafts = {
            ceramics: {
                iznik: {
                    name: 'Iznik Ceramics',
                    description: 'World-famous ceramic tradition with distinctive colors',
                    period: '15th-17th centuries',
                    masterColors: {
                        'iznik_blue': '#1e40af',
                        'iznik_turquoise': '#06b6d4',
                        'iznik_green': '#059669',
                        'iznik_red': '#dc2626', // Later period
                        'iznik_white': '#ffffff'
                    },
                    techniques: ['Underglaze painting', 'Tin-opacified glaze', 'Silica-rich clay'],
                    patterns: ['Tulip motifs', 'Carnation designs', 'Geometric patterns', 'Calligraphy'],
                    cultural_significance: 'Represents artistic peak of Ottoman ceramics'
                },

                kutahya: {
                    name: 'Kütahya Ceramics',
                    description: 'Traditional ceramic center with continuing tradition',
                    period: '18th century-present',
                    masterColors: {
                        'kutahya_blue': '#3b82f6',
                        'kutahya_green': '#10b981',
                        'kutahya_yellow': '#f59e0b',
                        'kutahya_purple': '#8b5cf6'
                    },
                    techniques: ['Hand painting', 'Traditional firing', 'Local clay'],
                    modern_adaptations: 'Contemporary designs with traditional techniques'
                }
            },

            textiles: {
                carpets: {
                    name: 'Turkish Carpets',
                    description: 'Rich color tradition in Turkish carpet weaving',
                    regional_styles: {
                        hereke: {
                            colors: { 'silk_gold': '#ffd700', 'royal_blue': '#4169e1', 'crimson_red': '#dc143c' },
                            characteristics: 'Finest silk carpets with imperial quality'
                        },
                        milas: {
                            colors: { 'milas_red': '#8b0000', 'cream_white': '#fffdd0', 'navy_blue': '#000080' },
                            characteristics: 'Prayer rugs with distinctive mihrab designs'
                        },
                        usak: {
                            colors: { 'usak_red': '#b22222', 'gold_yellow': '#ffd700', 'ivory_white': '#fffff0' },
                            characteristics: 'Large medallion designs with bold colors'
                        }
                    },
                    color_symbolism: {
                        'red': 'Joy, beauty, luck, courage',
                        'blue': 'Solitude, truth, meditation',
                        'green': 'Paradise, Islam, nature',
                        'yellow': 'Sun, glory, power',
                        'white': 'Purity, peace, grief'
                    }
                },

                kilims: {
                    name: 'Kilim Flat Weaves',
                    description: 'Geometric patterns with symbolic colors',
                    traditional_colors: {
                        'madder_red': '#cc0000',
                        'indigo_blue': '#4b0082',
                        'walnut_brown': '#654321',
                        'onion_yellow': '#ffdb58',
                        'natural_white': '#f8f8ff'
                    },
                    natural_dyes: {
                        'madder_root': 'Deep reds and pinks',
                        'indigo': 'Blues from light to deep navy',
                        'weld': 'Yellows and yellow-greens',
                        'cochineal': 'Crimsons and purples'
                    }
                }
            },

            calligraphy: {
                name: 'Islamic Calligraphy',
                description: 'Sacred art with specific color traditions',
                traditional_palette: {
                    'gold_ink': '#ffd700',
                    'black_ink': '#000000',
                    'lapis_blue': '#1e40af',
                    'cinnabar_red': '#dc2626',
                    'malachite_green': '#059669'
                },
                spiritual_significance: {
                    'gold': 'Divine light, importance of sacred text',
                    'black': 'Depth, mystery, formal beauty',
                    'blue': 'Heaven, infinity, divine wisdom'
                }
            }
        };
    }

    /**
     * Initialize modern Turkish design principles
     */
    initializeModernTurkishDesign() {
        this.modernTurkishDesign = {
            contemporary_turkish: {
                name: 'Contemporary Turkish Design',
                description: 'Modern interpretation of Turkish color heritage',
                principles: [
                    'Balance tradition with innovation',
                    'Respect cultural symbolism',
                    'Incorporate natural Turkish landscapes',
                    'Reflect cosmopolitan Turkish identity'
                ],
                color_philosophy: {
                    'cultural_continuity': 'Maintain connection to historical palettes',
                    'modern_interpretation': 'Update traditional colors for contemporary use',
                    'international_dialogue': 'Connect Turkish heritage with global design trends',
                    'sustainable_approach': 'Consider environmental impact and local materials'
                }
            },

            neo_ottoman: {
                name: 'Neo-Ottoman Style',
                description: 'Revival of Ottoman aesthetics in modern contexts',
                updated_palette: {
                    'modern_ottoman_blue': '#2563eb',
                    'contemporary_gold': '#f59e0b',
                    'updated_green': '#059669',
                    'refined_red': '#dc2626',
                    'elegant_white': '#f8fafc'
                },
                applications: ['Luxury hotels', 'Cultural centers', 'High-end residential', 'Corporate identity']
            },

            minimalist_turkish: {
                name: 'Turkish Minimalism',
                description: 'Simplified Turkish color palette for modern living',
                palette: {
                    'anatolian_beige': '#f5f5dc',
                    'cappadocia_stone': '#d2b48c',
                    'aegean_white': '#f8f8ff',
                    'bosphorus_gray': '#708090'
                },
                characteristics: ['Clean lines', 'Natural materials', 'Subtle cultural references']
            }
        };
    }

    /**
     * Initialize religious symbolism in colors
     */
    initializeReligiousSymbolism() {
        this.religiousSymbolism = {
            islamic_tradition: {
                sacred_colors: {
                    'prophet_green': {
                        hex: '#228b22',
                        significance: 'Color associated with Prophet Muhammad',
                        usage: 'Mosque decorations, religious texts, ceremonial items',
                        respect_guidelines: 'Use with appropriate reverence and context'
                    },
                    'kaaba_black': {
                        hex: '#000000',
                        significance: 'Kiswa (covering) of the Kaaba',
                        usage: 'Religious contexts, calligraphy backgrounds',
                        respect_guidelines: 'Sacred association, use respectfully'
                    },
                    'paradise_white': {
                        hex: '#ffffff',
                        significance: 'Purity, hajj pilgrimage garments',
                        usage: 'Religious architecture, ceremonial clothing',
                        respect_guidelines: 'Symbol of spiritual purity'
                    }
                },
                geometric_patterns: {
                    color_principles: [
                        'No representation of living beings',
                        'Mathematical harmony reflecting divine order',
                        'Infinite patterns symbolizing Allah\'s infinite nature',
                        'Color balance representing cosmic harmony'
                    ]
                }
            },

            sufism: {
                mystical_colors: {
                    'sufi_blue': {
                        hex: '#4169e1',
                        significance: 'Spiritual depth and divine connection',
                        meditation_use: 'Contemplation and spiritual practice'
                    },
                    'dervish_white': {
                        hex: '#f8f8ff',
                        significance: 'Purity of heart and spiritual cleansing',
                        ceremonial_use: 'Whirling dervish ceremonies'
                    }
                }
            }
        };
    }

    /**
     * Analyze cultural appropriateness of color combinations
     * @param {Array} colors - Array of color hex codes
     * @param {Object} context - Usage context and cultural considerations
     * @returns {Object} Cultural analysis results
     */
    analyzeCulturalAppropriateness(colors, context = {}) {
        try {
            const analysis = {
                appropriateness_score: 0,
                cultural_matches: [],
                sensitivity_warnings: [],
                historical_connections: [],
                recommendations: [],
                symbolism_analysis: {}
            };

            colors.forEach((colorHex, index) => {
                // Find historical period matches
                const historicalMatches = this.findHistoricalMatches(colorHex);
                analysis.historical_connections.push(...historicalMatches);

                // Check cultural symbolism
                const symbolism = this.analyzeCulturalSymbolism(colorHex, context);
                analysis.symbolism_analysis[`color_${index}`] = symbolism;

                // Check sensitivity concerns
                const sensitivityCheck = this.checkCulturalSensitivity(colorHex, context);
                if (sensitivityCheck.warnings.length > 0) {
                    analysis.sensitivity_warnings.push(...sensitivityCheck.warnings);
                }

                // Score appropriateness
                analysis.appropriateness_score += sensitivityCheck.score;
            });

            // Calculate average score
            analysis.appropriateness_score = Math.round(analysis.appropriateness_score / colors.length);

            // Generate recommendations
            analysis.recommendations = this.generateCulturalRecommendations(analysis, context);

            // Find matching traditional palettes
            analysis.traditional_palette_matches = this.findTraditionalPaletteMatches(colors);

            return {
                success: true,
                analysis,
                cultural_context: context,
                color_count: colors.length
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Find historical period matches for a color
     */
    findHistoricalMatches(colorHex, threshold = 20) {
        const matches = [];
        const targetLab = ColorConversions.hexToLab(colorHex);

        Object.entries(this.historicalPeriods).forEach(([period, data]) => {
            Object.entries(data.palette).forEach(([colorName, colorData]) => {
                const historicalLab = ColorConversions.hexToLab(colorData.hex);
                const distance = DeltaE.cie94(targetLab, historicalLab);

                if (distance <= threshold) {
                    matches.push({
                        period,
                        colorName: colorData.name,
                        historicalHex: colorData.hex,
                        inputHex: colorHex,
                        distance: Math.round(distance),
                        significance: colorData.significance,
                        historical_context: colorData.historical_context,
                        similarity: Math.round((1 - distance / threshold) * 100)
                    });
                }
            });
        });

        return matches.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Analyze cultural symbolism of a color
     */
    analyzeCulturalSymbolism(colorHex, context) {
        const rgb = ColorConversions.hexToRgb(colorHex);
        const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);

        const symbolism = {
            religious_significance: [],
            national_significance: [],
            folk_significance: [],
            regional_associations: [],
            modern_interpretations: []
        };

        // Check religious symbolism
        Object.entries(this.religiousSymbolism.islamic_tradition.sacred_colors).forEach(([name, data]) => {
            const religiousLab = ColorConversions.hexToLab(data.hex);
            const targetLab = ColorConversions.hexToLab(colorHex);
            const distance = DeltaE.cie94(targetLab, religiousLab);

            if (distance <= 15) {
                symbolism.religious_significance.push({
                    name,
                    significance: data.significance,
                    guidelines: data.respect_guidelines,
                    similarity: Math.round((1 - distance / 15) * 100)
                });
            }
        });

        // Check national symbolism
        if (this.isNationalColor(hsl)) {
            symbolism.national_significance.push({
                type: 'turkish_flag',
                significance: 'Associated with Turkish national identity',
                sensitivity: 'high'
            });
        }

        // Check folk traditions
        Object.entries(this.culturalSymbolism.folk_traditions).forEach(([name, data]) => {
            if (data.hex) {
                const folkLab = ColorConversions.hexToLab(data.hex);
                const targetLab = ColorConversions.hexToLab(colorHex);
                const distance = DeltaE.cie94(targetLab, folkLab);

                if (distance <= 20) {
                    symbolism.folk_significance.push({
                        name,
                        significance: data.significance,
                        emotional_impact: data.emotional_impact,
                        similarity: Math.round((1 - distance / 20) * 100)
                    });
                }
            }
        });

        return symbolism;
    }

    /**
     * Check if color matches Turkish national colors
     */
    isNationalColor(hsl) {
        // Turkish flag red
        if (hsl.h >= 345 || hsl.h <= 15) {
            if (hsl.s >= 70 && hsl.l >= 30 && hsl.l <= 60) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check cultural sensitivity concerns
     */
    checkCulturalSensitivity(colorHex, context) {
        const sensitivity = {
            score: 100,
            warnings: [],
            considerations: []
        };

        // Check religious color usage
        const religiousMatches = this.findReligiousColorMatches(colorHex);
        religiousMatches.forEach(match => {
            if (match.sensitivity === 'high' && context.usage !== 'religious') {
                sensitivity.warnings.push({
                    type: 'religious_sensitivity',
                    message: `Color closely matches ${match.name}, consider religious significance`,
                    recommendation: 'Use respectfully and appropriately to context'
                });
                sensitivity.score -= 20;
            }
        });

        // Check national color usage
        if (this.isNationalColor(ColorConversions.rgbToHsl(...Object.values(ColorConversions.hexToRgb(colorHex))))) {
            if (context.usage === 'commercial' && !context.respectful_national_use) {
                sensitivity.warnings.push({
                    type: 'national_sensitivity',
                    message: 'Color resembles Turkish flag red, ensure respectful usage',
                    recommendation: 'Use in appropriate patriotic or respectful contexts'
                });
                sensitivity.score -= 15;
            }
        }

        return sensitivity;
    }

    /**
     * Find religious color matches
     */
    findReligiousColorMatches(colorHex, threshold = 15) {
        const matches = [];
        const targetLab = ColorConversions.hexToLab(colorHex);

        // Check Islamic tradition colors
        Object.entries(this.religiousSymbolism.islamic_tradition.sacred_colors).forEach(([name, data]) => {
            const religiousLab = ColorConversions.hexToLab(data.hex);
            const distance = DeltaE.cie94(targetLab, religiousLab);

            if (distance <= threshold) {
                matches.push({
                    name: data.significance,
                    distance,
                    sensitivity: 'high',
                    guidelines: data.respect_guidelines
                });
            }
        });

        return matches;
    }

    /**
     * Generate cultural recommendations
     */
    generateCulturalRecommendations(analysis, context) {
        const recommendations = [];

        // Historical integration recommendations
        if (analysis.historical_connections.length > 0) {
            const bestMatch = analysis.historical_connections[0];
            recommendations.push({
                type: 'historical_integration',
                suggestion: `Colors show strong connection to ${bestMatch.period} period`,
                enhancement: `Consider incorporating other ${bestMatch.period} colors for authentic historical palette`,
                cultural_value: 'Enhances cultural authenticity and historical depth'
            });
        }

        // Cultural sensitivity recommendations
        if (analysis.sensitivity_warnings.length > 0) {
            recommendations.push({
                type: 'cultural_sensitivity',
                suggestion: 'Review cultural sensitivity concerns',
                details: analysis.sensitivity_warnings,
                action: 'Ensure respectful and appropriate usage context'
            });
        }

        // Regional enhancement recommendations
        if (context.region && this.regionalVariations[context.region]) {
            const regionalColors = this.regionalVariations[context.region].palette;
            recommendations.push({
                type: 'regional_enhancement',
                suggestion: `Enhance with ${context.region} regional colors`,
                colors: regionalColors,
                cultural_value: 'Connects to specific Turkish regional heritage'
            });
        }

        // Traditional craft integration
        if (context.craft_integration) {
            recommendations.push({
                type: 'craft_integration',
                suggestion: 'Consider traditional Turkish craft color schemes',
                options: Object.keys(this.traditionalCrafts),
                benefit: 'Adds artisanal authenticity and cultural depth'
            });
        }

        return recommendations;
    }

    /**
     * Find traditional palette matches
     */
    findTraditionalPaletteMatches(colors) {
        const matches = [];

        // Check against historical periods
        Object.entries(this.historicalPeriods).forEach(([period, data]) => {
            const periodColors = Object.values(data.palette).map(c => c.hex);
            const matchScore = this.calculatePaletteMatchScore(colors, periodColors);

            if (matchScore > 60) {
                matches.push({
                    period,
                    name: data.name,
                    score: matchScore,
                    description: data.description,
                    characteristics: data.characteristics
                });
            }
        });

        // Check against regional variations
        Object.entries(this.regionalVariations).forEach(([region, data]) => {
            const regionColors = Object.values(data.palette);
            const matchScore = this.calculatePaletteMatchScore(colors, regionColors);

            if (matchScore > 70) {
                matches.push({
                    region,
                    name: data.name,
                    score: matchScore,
                    type: 'regional',
                    description: data.description
                });
            }
        });

        return matches.sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate palette match score
     */
    calculatePaletteMatchScore(palette1, palette2) {
        let totalScore = 0;
        let comparisons = 0;

        palette1.forEach(color1 => {
            palette2.forEach(color2 => {
                const lab1 = ColorConversions.hexToLab(color1);
                const lab2 = ColorConversions.hexToLab(color2);
                const distance = DeltaE.cie94(lab1, lab2);

                // Score decreases with distance, max score at distance 0
                const score = Math.max(0, 100 - (distance * 2));
                totalScore += score;
                comparisons++;
            });
        });

        return comparisons > 0 ? Math.round(totalScore / comparisons) : 0;
    }

    /**
     * Generate period-specific palette
     * @param {string} period - Historical period
     * @param {Object} options - Generation options
     * @returns {Object} Generated palette with cultural context
     */
    generatePeriodPalette(period, options = {}) {
        if (!this.historicalPeriods[period]) {
            return { error: 'Unknown historical period' };
        }

        const periodData = this.historicalPeriods[period];
        const palette = {
            period,
            name: periodData.name,
            historical_context: periodData.description,
            colors: [],
            cultural_significance: periodData.characteristics,
            usage_guidelines: [],
            modern_adaptations: []
        };

        // Add core period colors
        Object.entries(periodData.palette).forEach(([key, colorData]) => {
            palette.colors.push({
                hex: colorData.hex,
                name: colorData.name,
                significance: colorData.significance,
                usage: colorData.usage,
                symbolism: colorData.symbolism,
                historical_context: colorData.historical_context
            });
        });

        // Add usage guidelines
        palette.usage_guidelines = this.generatePeriodUsageGuidelines(period, periodData);

        // Add modern adaptations if available
        if (periodData.modernAdaptations) {
            Object.entries(periodData.modernAdaptations).forEach(([name, hex]) => {
                palette.modern_adaptations.push({
                    name,
                    hex,
                    description: `Contemporary interpretation of ${period} colors`
                });
            });
        }

        return { success: true, palette };
    }

    /**
     * Generate usage guidelines for historical period
     */
    generatePeriodUsageGuidelines(period, periodData) {
        const guidelines = [];

        switch (period) {
            case 'ottoman':
                guidelines.push(
                    'Use gold sparingly as accent color for luxury feel',
                    'Ottoman blue works well for main color with white trim',
                    'Respect religious significance of green colors',
                    'Combine with geometric patterns for authenticity'
                );
                break;
            case 'byzantine':
                guidelines.push(
                    'Purple should be used as accent due to imperial associations',
                    'Gold works beautifully with white for elegant contrast',
                    'Suitable for formal, sophisticated spaces',
                    'Consider religious context when using sacred colors'
                );
                break;
            case 'seljuk':
                guidelines.push(
                    'Earth tones create grounding, stable feeling',
                    'Turquoise provides protection symbolism',
                    'Suitable for traditional, crafted environments',
                    'Works well with natural materials'
                );
                break;
            case 'modern_turkish':
                guidelines.push(
                    'Red requires respectful usage due to flag associations',
                    'Suitable for contemporary, international contexts',
                    'Balances tradition with modern sensibilities',
                    'Appropriate for public and commercial spaces'
                );
                break;
        }

        return guidelines;
    }

    /**
     * Get regional color recommendations
     * @param {string} region - Turkish region
     * @returns {Object} Regional color recommendations
     */
    getRegionalRecommendations(region) {
        if (!this.regionalVariations[region]) {
            return { error: 'Unknown region' };
        }

        const regionData = this.regionalVariations[region];

        return {
            success: true,
            region: regionData.name,
            description: regionData.description,
            characteristics: regionData.characteristics,
            palette: regionData.palette,
            cultural_elements: regionData.cultural_elements,
            usage_suggestions: this.generateRegionalUsageSuggestions(region, regionData)
        };
    }

    /**
     * Generate usage suggestions for regional colors
     */
    generateRegionalUsageSuggestions(region, regionData) {
        const suggestions = [];

        switch (region) {
            case 'istanbul':
                suggestions.push(
                    'Perfect for cosmopolitan, urban spaces',
                    'Combines historical depth with modern sophistication',
                    'Suitable for hospitality and cultural venues'
                );
                break;
            case 'cappadocia':
                suggestions.push(
                    'Ideal for natural, earthy interiors',
                    'Creates connection to unique geological heritage',
                    'Perfect for wellness and retreat spaces'
                );
                break;
            case 'aegean':
                suggestions.push(
                    'Excellent for coastal, Mediterranean-style spaces',
                    'Evokes relaxation and ancient heritage',
                    'Suitable for hospitality and leisure environments'
                );
                break;
        }

        return suggestions;
    }
}

module.exports = TurkishCulturalColors;