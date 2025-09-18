/**
 * Advanced Color Psychology Engine
 * Sophisticated mood-based color analysis and recommendation system for the Sanzo Color Advisor
 *
 * Features:
 * - Comprehensive mood mapping and analysis
 * - Room-specific psychological color effects
 * - Emotional color mapping with cultural considerations
 * - Personality-based color recommendations
 * - Circadian rhythm and lighting psychology
 * - Therapeutic color applications
 * - Cultural color psychology variations
 */

const ColorConversions = require('./colorConversions');
const DeltaE = require('./deltaE');

class AdvancedColorPsychology {

    constructor() {
        this.initializeMoodMappings();
        this.initializeRoomPsychology();
        this.initializePersonalityTypes();
        this.initializeCulturalPsychology();
        this.initializeTherapeuticColors();
        this.initializeCircadianEffects();
        this.initializeEmotionalStates();
        this.initializeContextualFactors();
    }

    /**
     * Initialize comprehensive mood mapping system
     */
    initializeMoodMappings() {
        this.moodMappings = {
            // Primary mood categories with detailed color associations
            energetic: {
                description: 'High energy, motivation, action-oriented feelings',
                primaryColors: {
                    'vibrant_red': {
                        hex: '#e53e3e',
                        intensity: 95,
                        triggers: ['urgency', 'passion', 'physical_energy'],
                        physiological: 'Increases heart rate, blood pressure'
                    },
                    'electric_orange': {
                        hex: '#ff6b35',
                        intensity: 90,
                        triggers: ['enthusiasm', 'creativity', 'warmth'],
                        physiological: 'Stimulates appetite, increases alertness'
                    },
                    'sunny_yellow': {
                        hex: '#ffd60a',
                        intensity: 85,
                        triggers: ['optimism', 'mental_clarity', 'joy'],
                        physiological: 'Enhances mental activity, improves mood'
                    }
                },
                secondaryColors: {
                    'lime_green': '#32de84',
                    'hot_pink': '#ff006e',
                    'electric_blue': '#0077be'
                },
                avoidColors: ['gray', 'brown', 'dark_blue', 'black'],
                contextualFactors: {
                    time_sensitivity: 'More effective in morning and early afternoon',
                    space_size: 'Use sparingly in small spaces to avoid overwhelming',
                    lighting: 'Natural light enhances effect, artificial may appear harsh'
                },
                applications: ['gym', 'office', 'kitchen', 'creative_spaces'],
                contraindications: ['bedroom', 'meditation_space', 'healthcare']
            },

            calming: {
                description: 'Peaceful, relaxing, stress-reducing feelings',
                primaryColors: {
                    'soft_blue': {
                        hex: '#a8dadc',
                        intensity: 80,
                        triggers: ['tranquility', 'trust', 'mental_clarity'],
                        physiological: 'Lowers blood pressure, reduces stress hormones'
                    },
                    'sage_green': {
                        hex: '#b7c3a0',
                        intensity: 75,
                        triggers: ['balance', 'harmony', 'restoration'],
                        physiological: 'Reduces eye strain, promotes relaxation'
                    },
                    'lavender': {
                        hex: '#c7a8d8',
                        intensity: 70,
                        triggers: ['spiritual_calm', 'meditation', 'healing'],
                        physiological: 'May improve sleep quality, reduce anxiety'
                    }
                },
                secondaryColors: {
                    'pearl_white': '#f8f9fa',
                    'cream': '#fdf2e9',
                    'dusty_rose': '#ddbea9'
                },
                avoidColors: ['bright_red', 'electric_orange', 'neon_colors'],
                contextualFactors: {
                    time_sensitivity: 'Most effective in evening and rest periods',
                    space_size: 'Excellent for small spaces, creates expansion feeling',
                    lighting: 'Warm, dim lighting enhances calming effect'
                },
                applications: ['bedroom', 'bathroom', 'meditation_room', 'healthcare'],
                contraindications: ['workout_spaces', 'high_energy_areas']
            },

            focused: {
                description: 'Concentration, mental clarity, productivity',
                primaryColors: {
                    'navy_blue': {
                        hex: '#1e3a8a',
                        intensity: 85,
                        triggers: ['mental_focus', 'reliability', 'depth'],
                        physiological: 'Enhances cognitive function, improves concentration'
                    },
                    'forest_green': {
                        hex: '#1f4037',
                        intensity: 80,
                        triggers: ['stability', 'growth', 'natural_focus'],
                        physiological: 'Reduces mental fatigue, improves decision-making'
                    },
                    'charcoal_gray': {
                        hex: '#36454f',
                        intensity: 75,
                        triggers: ['sophistication', 'neutrality', 'timelessness'],
                        physiological: 'Reduces distractions, promotes mental clarity'
                    }
                },
                secondaryColors: {
                    'crisp_white': '#ffffff',
                    'light_gray': '#f7fafc',
                    'sage_blue': '#6ba3d0'
                },
                avoidColors: ['pink', 'bright_yellow', 'hot_pink', 'lime_green'],
                contextualFactors: {
                    time_sensitivity: 'Effective throughout work hours',
                    space_size: 'Works well in any size space',
                    lighting: 'Good task lighting essential'
                },
                applications: ['office', 'study', 'library', 'conference_room'],
                contraindications: ['social_spaces', 'creative_brainstorming']
            },

            creative: {
                description: 'Innovation, artistic expression, open thinking',
                primaryColors: {
                    'violet': {
                        hex: '#8b5cf6',
                        intensity: 90,
                        triggers: ['imagination', 'spirituality', 'innovation'],
                        physiological: 'Stimulates right brain activity, enhances creativity'
                    },
                    'teal': {
                        hex: '#2dd4bf',
                        intensity: 85,
                        triggers: ['clarity', 'communication', 'balance'],
                        physiological: 'Promotes mental clarity while maintaining creativity'
                    },
                    'coral': {
                        hex: '#ff7875',
                        intensity: 80,
                        triggers: ['enthusiasm', 'warmth', 'approachability'],
                        physiological: 'Stimulates social interaction, reduces inhibition'
                    }
                },
                secondaryColors: {
                    'golden_yellow': '#f59e0b',
                    'mint_green': '#34d399',
                    'sky_blue': '#0ea5e9'
                },
                avoidColors: ['black', 'dark_gray', 'brown'],
                contextualFactors: {
                    time_sensitivity: 'Peak effectiveness during natural creativity hours',
                    space_size: 'Benefits from variety and visual interest',
                    lighting: 'Natural light preferred, color-balanced artificial'
                },
                applications: ['studio', 'brainstorm_room', 'children_playroom', 'art_space'],
                contraindications: ['formal_office', 'medical_facility']
            },

            sophisticated: {
                description: 'Elegance, refinement, luxury, maturity',
                primaryColors: {
                    'deep_burgundy': {
                        hex: '#7c2d12',
                        intensity: 95,
                        triggers: ['luxury', 'tradition', 'power'],
                        physiological: 'Creates sense of importance, increases perceived value'
                    },
                    'midnight_blue': {
                        hex: '#1e1b4b',
                        intensity: 90,
                        triggers: ['authority', 'depth', 'intelligence'],
                        physiological: 'Promotes serious contemplation, reduces frivolity'
                    },
                    'charcoal_black': {
                        hex: '#1f2937',
                        intensity: 85,
                        triggers: ['elegance', 'mystery', 'formality'],
                        physiological: 'Creates psychological weight, commands attention'
                    }
                },
                secondaryColors: {
                    'champagne_gold': '#d4af37',
                    'silver_gray': '#9ca3af',
                    'ivory': '#fef7cd'
                },
                avoidColors: ['bright_pink', 'lime_green', 'electric_blue'],
                contextualFactors: {
                    time_sensitivity: 'Particularly effective in evening settings',
                    space_size: 'Excellent for creating intimate, upscale feeling',
                    lighting: 'Sophisticated lighting design essential'
                },
                applications: ['formal_dining', 'luxury_hotel', 'upscale_retail', 'executive_office'],
                contraindications: ['children_spaces', 'casual_areas']
            },

            social: {
                description: 'Connection, communication, warmth, friendliness',
                primaryColors: {
                    'warm_orange': {
                        hex: '#fb923c',
                        intensity: 85,
                        triggers: ['friendliness', 'approachability', 'enthusiasm'],
                        physiological: 'Increases social confidence, promotes conversation'
                    },
                    'golden_yellow': {
                        hex: '#fbbf24',
                        intensity: 80,
                        triggers: ['happiness', 'optimism', 'mental_stimulation'],
                        physiological: 'Elevates mood, encourages social interaction'
                    },
                    'coral_pink': {
                        hex: '#f87171',
                        intensity: 75,
                        triggers: ['nurturing', 'compassion', 'love'],
                        physiological: 'Promotes emotional openness, reduces aggression'
                    }
                },
                secondaryColors: {
                    'peach': '#fed7aa',
                    'mint': '#a7f3d0',
                    'lavender_blue': '#bfdbfe'
                },
                avoidColors: ['black', 'dark_gray', 'deep_purple'],
                contextualFactors: {
                    time_sensitivity: 'Most effective during social hours',
                    space_size: 'Works well in gathering spaces',
                    lighting: 'Warm, inviting lighting enhances effect'
                },
                applications: ['living_room', 'restaurant', 'community_center', 'retail'],
                contraindications: ['private_office', 'meditation_space']
            },

            restorative: {
                description: 'Healing, recovery, renewal, balance',
                primaryColors: {
                    'eucalyptus_green': {
                        hex: '#6ee7b7',
                        intensity: 80,
                        triggers: ['healing', 'growth', 'renewal'],
                        physiological: 'Promotes cellular regeneration, reduces inflammation'
                    },
                    'sky_blue': {
                        hex: '#7dd3fc',
                        intensity: 75,
                        triggers: ['peace', 'clarity', 'hope'],
                        physiological: 'Lowers stress hormones, improves immune function'
                    },
                    'soft_purple': {
                        hex: '#c084fc',
                        intensity: 70,
                        triggers: ['spiritual_healing', 'transformation', 'wisdom'],
                        physiological: 'May enhance meditation, reduce chronic pain'
                    }
                },
                secondaryColors: {
                    'pearl_white': '#fefefe',
                    'warm_beige': '#f5f5dc',
                    'soft_gray': '#e5e7eb'
                },
                avoidColors: ['harsh_red', 'electric_yellow', 'neon_colors'],
                contextualFactors: {
                    time_sensitivity: 'Effective during rest and recovery periods',
                    space_size: 'Creates expansion and breathing room',
                    lighting: 'Natural light preferred, soft artificial lighting'
                },
                applications: ['healthcare', 'spa', 'recovery_room', 'senior_living'],
                contraindications: ['high_energy_spaces', 'entertainment_areas']
            }
        };
    }

    /**
     * Initialize room-specific psychological effects
     */
    initializeRoomPsychology() {
        this.roomPsychology = {
            bedroom: {
                primary_function: 'Rest, intimacy, personal retreat',
                psychological_needs: ['relaxation', 'security', 'comfort', 'privacy'],
                optimal_moods: ['calming', 'restorative', 'intimate'],
                color_temperature: 'warm',
                recommended_colors: {
                    primary: ['soft_blue', 'sage_green', 'lavender', 'warm_gray'],
                    accent: ['dusty_rose', 'cream', 'pearl_white'],
                    avoid: ['bright_red', 'electric_orange', 'neon_yellow']
                },
                lighting_psychology: {
                    morning: 'Gradually increasing light to aid awakening',
                    evening: 'Dim, warm light to promote sleep preparation',
                    night: 'Minimal light to support circadian rhythm'
                },
                cultural_considerations: {
                    western: 'Blue associated with calm and trust',
                    eastern: 'Green for harmony and growth',
                    universal: 'Soft, muted tones for universal appeal'
                },
                special_considerations: [
                    'Avoid stimulating colors near bed',
                    'Consider blackout capability',
                    'Personal color preferences more important'
                ]
            },

            living_room: {
                primary_function: 'Socializing, relaxation, entertainment',
                psychological_needs: ['comfort', 'warmth', 'conversation', 'flexibility'],
                optimal_moods: ['social', 'comfortable', 'welcoming'],
                color_temperature: 'balanced',
                recommended_colors: {
                    primary: ['warm_beige', 'soft_gray', 'sage_green', 'cream'],
                    accent: ['coral', 'golden_yellow', 'teal', 'warm_orange'],
                    avoid: ['harsh_black', 'electric_blue', 'neon_pink']
                },
                lighting_psychology: {
                    day: 'Natural light maximized for openness',
                    evening: 'Layered lighting for different activities',
                    night: 'Warm, dim lighting for intimate conversations'
                },
                cultural_considerations: {
                    family_oriented: 'Warm, inviting colors',
                    entertainment_focused: 'More dynamic color palette',
                    formal: 'Sophisticated, muted tones'
                },
                special_considerations: [
                    'Flexible for different activities',
                    'Consider TV viewing environment',
                    'Balance stimulation and relaxation'
                ]
            },

            kitchen: {
                primary_function: 'Food preparation, gathering, nourishment',
                psychological_needs: ['energy', 'cleanliness', 'appetite', 'efficiency'],
                optimal_moods: ['energetic', 'social', 'focused'],
                color_temperature: 'warm_to_neutral',
                recommended_colors: {
                    primary: ['warm_white', 'cream', 'light_gray', 'sage_green'],
                    accent: ['warm_orange', 'golden_yellow', 'coral', 'apple_green'],
                    avoid: ['blue', 'purple', 'black', 'dark_colors']
                },
                lighting_psychology: {
                    task_areas: 'Bright, focused lighting for safety',
                    dining_area: 'Warm, social lighting for meals',
                    ambient: 'Balanced lighting for general comfort'
                },
                cultural_considerations: {
                    appetite_psychology: 'Warm colors stimulate appetite',
                    cleanliness_perception: 'Light colors suggest hygiene',
                    cultural_food_associations: 'Colors that complement cuisine'
                },
                special_considerations: [
                    'Safety requires good visibility',
                    'Easy to clean surfaces',
                    'Appetite stimulation important'
                ]
            },

            home_office: {
                primary_function: 'Work, concentration, productivity',
                psychological_needs: ['focus', 'mental_clarity', 'motivation', 'comfort'],
                optimal_moods: ['focused', 'energetic', 'professional'],
                color_temperature: 'cool_to_neutral',
                recommended_colors: {
                    primary: ['navy_blue', 'forest_green', 'warm_gray', 'crisp_white'],
                    accent: ['sage_blue', 'golden_yellow', 'coral', 'mint_green'],
                    avoid: ['hot_pink', 'bright_red', 'purple', 'neon_colors']
                },
                lighting_psychology: {
                    task_lighting: 'Bright, focused light for detail work',
                    ambient: 'Balanced lighting to reduce eye strain',
                    break_areas: 'Softer lighting for mental rest'
                },
                cultural_considerations: {
                    professional_norms: 'Colors that convey competence',
                    personal_preference: 'Individual productivity preferences',
                    video_calls: 'Colors that look good on camera'
                },
                special_considerations: [
                    'Extended viewing time requires eye comfort',
                    'Minimize distractions',
                    'Support long-term concentration'
                ]
            },

            bathroom: {
                primary_function: 'Personal care, cleansing, renewal',
                psychological_needs: ['cleanliness', 'privacy', 'renewal', 'calm'],
                optimal_moods: ['restorative', 'calming', 'clean'],
                color_temperature: 'cool_to_neutral',
                recommended_colors: {
                    primary: ['soft_blue', 'sage_green', 'pearl_white', 'light_gray'],
                    accent: ['seafoam', 'lavender', 'mint', 'cream'],
                    avoid: ['dark_colors', 'harsh_red', 'electric_colors']
                },
                lighting_psychology: {
                    mirror_lighting: 'Even, flattering light for grooming',
                    shower_area: 'Bright, safe lighting',
                    ambience: 'Soft lighting for relaxation'
                },
                cultural_considerations: {
                    cleanliness_associations: 'Colors that suggest purity',
                    spa_influence: 'Colors that promote wellness',
                    size_perception: 'Light colors to enhance space'
                },
                special_considerations: [
                    'Humidity resistance important',
                    'Easy maintenance essential',
                    'Good lighting for grooming'
                ]
            },

            children_room: {
                primary_function: 'Play, learning, rest, development',
                psychological_needs: ['stimulation', 'safety', 'creativity', 'growth'],
                optimal_moods: ['creative', 'energetic', 'safe', 'happy'],
                color_temperature: 'warm_and_cheerful',
                recommended_colors: {
                    primary: ['soft_yellow', 'mint_green', 'lavender', 'peach'],
                    accent: ['coral', 'sky_blue', 'golden_yellow', 'soft_pink'],
                    avoid: ['dark_colors', 'overstimulating_neons', 'harsh_contrasts']
                },
                lighting_psychology: {
                    play_areas: 'Bright, cheerful lighting',
                    sleep_areas: 'Dimmable, warm lighting',
                    study_areas: 'Focused task lighting'
                },
                cultural_considerations: {
                    gender_neutrality: 'Avoid stereotypical color assumptions',
                    developmental_stages: 'Colors appropriate for age',
                    educational_value: 'Colors that support learning'
                },
                special_considerations: [
                    'Safety in color choices',
                    'Flexibility for growth',
                    'Balance stimulation and calm'
                ]
            }
        };
    }

    /**
     * Initialize personality type color preferences
     */
    initializePersonalityTypes() {
        this.personalityTypes = {
            extrovert: {
                description: 'Outgoing, social, energized by interaction',
                preferred_moods: ['energetic', 'social', 'creative'],
                color_preferences: {
                    primary: ['warm_orange', 'golden_yellow', 'coral_pink', 'lime_green'],
                    secondary: ['electric_blue', 'hot_pink', 'turquoise'],
                    neutral: ['warm_gray', 'cream', 'light_beige']
                },
                psychological_drivers: [
                    'Social interaction stimulation',
                    'Energy and enthusiasm',
                    'Openness and approachability',
                    'Dynamic visual interest'
                ],
                room_adaptations: {
                    living_room: 'Bright, welcoming colors for entertaining',
                    home_office: 'Energizing colors to maintain motivation',
                    bedroom: 'Balanced approach - some energy, some calm'
                }
            },

            introvert: {
                description: 'Reflective, private, energized by solitude',
                preferred_moods: ['calming', 'focused', 'restorative'],
                color_preferences: {
                    primary: ['soft_blue', 'sage_green', 'lavender', 'warm_gray'],
                    secondary: ['dusty_rose', 'pearl_white', 'sage_blue'],
                    neutral: ['cool_gray', 'off_white', 'soft_beige']
                },
                psychological_drivers: [
                    'Stress reduction',
                    'Mental clarity and focus',
                    'Sense of security and comfort',
                    'Minimal overstimulation'
                ],
                room_adaptations: {
                    home_office: 'Calming colors to reduce distractions',
                    bedroom: 'Maximum relaxation and restoration',
                    living_room: 'Comfortable but not overwhelming'
                }
            },

            analytical: {
                description: 'Logical, detail-oriented, systematic thinking',
                preferred_moods: ['focused', 'sophisticated', 'organized'],
                color_preferences: {
                    primary: ['navy_blue', 'forest_green', 'charcoal_gray', 'crisp_white'],
                    secondary: ['sage_blue', 'steel_gray', 'mint_green'],
                    neutral: ['cool_gray', 'white', 'light_gray']
                },
                psychological_drivers: [
                    'Mental clarity and concentration',
                    'Reduced distractions',
                    'Sense of order and control',
                    'Professional competence'
                ],
                room_adaptations: {
                    home_office: 'Maximum focus and productivity colors',
                    living_room: 'Organized, systematic color schemes',
                    bedroom: 'Minimal, clean approach'
                }
            },

            creative: {
                description: 'Artistic, innovative, imaginative thinking',
                preferred_moods: ['creative', 'energetic', 'inspired'],
                color_preferences: {
                    primary: ['violet', 'teal', 'coral', 'golden_yellow'],
                    secondary: ['mint_green', 'sky_blue', 'lavender', 'peach'],
                    neutral: ['warm_white', 'natural_beige', 'soft_gray']
                },
                psychological_drivers: [
                    'Inspiration and imagination stimulation',
                    'Emotional expression',
                    'Visual variety and interest',
                    'Breaking conventional boundaries'
                ],
                room_adaptations: {
                    studio_space: 'Full creative color expression',
                    living_room: 'Artistic, inspiring combinations',
                    bedroom: 'Dreamy, imaginative but restful'
                }
            },

            practical: {
                description: 'Realistic, efficient, focused on function',
                preferred_moods: ['focused', 'organized', 'comfortable'],
                color_preferences: {
                    primary: ['warm_gray', 'sage_green', 'navy_blue', 'cream'],
                    secondary: ['earth_brown', 'forest_green', 'steel_blue'],
                    neutral: ['beige', 'taupe', 'off_white']
                },
                psychological_drivers: [
                    'Functionality over aesthetics',
                    'Timeless, enduring appeal',
                    'Easy maintenance and durability',
                    'Cost-effectiveness'
                ],
                room_adaptations: {
                    kitchen: 'Practical, easy-to-maintain colors',
                    home_office: 'Efficient, no-nonsense approach',
                    living_room: 'Comfortable, family-friendly choices'
                }
            },

            emotional: {
                description: 'Feeling-oriented, empathetic, relationship-focused',
                preferred_moods: ['calming', 'social', 'nurturing'],
                color_preferences: {
                    primary: ['soft_pink', 'lavender', 'sage_green', 'warm_beige'],
                    secondary: ['dusty_rose', 'pearl_white', 'mint_green'],
                    neutral: ['warm_gray', 'cream', 'soft_white']
                },
                psychological_drivers: [
                    'Emotional comfort and security',
                    'Nurturing environment creation',
                    'Relationship harmony',
                    'Stress reduction and healing'
                ],
                room_adaptations: {
                    bedroom: 'Maximum emotional comfort',
                    living_room: 'Warm, welcoming family space',
                    children_room: 'Nurturing, protective colors'
                }
            }
        };
    }

    /**
     * Initialize cultural color psychology variations
     */
    initializeCulturalPsychology() {
        this.culturalPsychology = {
            western: {
                red: {
                    positive: ['passion', 'love', 'energy', 'power'],
                    negative: ['anger', 'danger', 'aggression'],
                    cultural_context: 'Stop signals, emergency, Valentine\'s Day',
                    psychological_impact: 'Increases arousal, grabs attention'
                },
                blue: {
                    positive: ['trust', 'calm', 'reliability', 'professionalism'],
                    negative: ['sadness', 'coldness'],
                    cultural_context: 'Corporate colors, law enforcement',
                    psychological_impact: 'Lowers blood pressure, promotes focus'
                },
                green: {
                    positive: ['nature', 'growth', 'money', 'go'],
                    negative: ['envy', 'inexperience'],
                    cultural_context: 'Environmental movement, financial success',
                    psychological_impact: 'Reduces eye strain, promotes balance'
                },
                white: {
                    positive: ['purity', 'cleanliness', 'simplicity', 'peace'],
                    negative: ['sterility', 'emptiness'],
                    cultural_context: 'Weddings, healthcare, minimalism',
                    psychological_impact: 'Creates sense of space, cleanliness'
                },
                black: {
                    positive: ['elegance', 'sophistication', 'authority'],
                    negative: ['death', 'evil', 'mourning'],
                    cultural_context: 'Formal events, luxury brands',
                    psychological_impact: 'Commands attention, creates drama'
                }
            },

            eastern: {
                red: {
                    positive: ['luck', 'prosperity', 'joy', 'celebration'],
                    negative: ['aggression', 'danger'],
                    cultural_context: 'Chinese New Year, weddings, festivals',
                    psychological_impact: 'Brings good fortune, energizes'
                },
                yellow: {
                    positive: ['imperial_power', 'wisdom', 'prosperity'],
                    negative: ['cowardice', 'betrayal'],
                    cultural_context: 'Imperial China, Buddhism',
                    psychological_impact: 'Enhances mental clarity, brings joy'
                },
                white: {
                    positive: ['purity', 'spiritual_transcendence'],
                    negative: ['death', 'mourning'],
                    cultural_context: 'Funerals, spiritual practices',
                    psychological_impact: 'Promotes meditation, cleansing'
                },
                green: {
                    positive: ['harmony', 'growth', 'balance', 'youth'],
                    negative: ['inexperience'],
                    cultural_context: 'Feng shui, natural harmony',
                    psychological_impact: 'Brings balance, promotes healing'
                }
            },

            middle_eastern: {
                green: {
                    positive: ['Islam', 'paradise', 'nature', 'fertility'],
                    negative: [],
                    cultural_context: 'Religious significance, Prophet Muhammad',
                    psychological_impact: 'Spiritual connection, peace'
                },
                blue: {
                    positive: ['protection', 'wisdom', 'eternity'],
                    negative: [],
                    cultural_context: 'Evil eye protection, ceramics',
                    psychological_impact: 'Provides protection, calms fears'
                },
                gold: {
                    positive: ['divine_light', 'wealth', 'wisdom'],
                    negative: [],
                    cultural_context: 'Islamic art, calligraphy',
                    psychological_impact: 'Elevates spirit, increases value perception'
                }
            },

            african: {
                earth_tones: {
                    positive: ['connection_to_land', 'heritage', 'stability'],
                    negative: [],
                    cultural_context: 'Traditional architecture, ceremonies',
                    psychological_impact: 'Grounding, ancestral connection'
                },
                bright_colors: {
                    positive: ['celebration', 'life_force', 'community'],
                    negative: [],
                    cultural_context: 'Festivals, traditional clothing',
                    psychological_impact: 'Energizes community, celebrates life'
                }
            }
        };
    }

    /**
     * Initialize therapeutic color applications
     */
    initializeTherapeuticColors() {
        this.therapeuticColors = {
            chromotherapy: {
                description: 'Color therapy for healing and wellness',
                applications: {
                    red: {
                        therapeutic_uses: ['circulation_improvement', 'energy_boosting', 'depression_treatment'],
                        physiological_effects: 'Increases blood circulation, raises blood pressure',
                        psychological_effects: 'Boosts confidence, overcomes lethargy',
                        contraindications: ['hypertension', 'anxiety_disorders', 'insomnia'],
                        application_methods: ['colored_light', 'visualization', 'environmental_color']
                    },
                    orange: {
                        therapeutic_uses: ['digestive_health', 'social_anxiety', 'creativity_blocks'],
                        physiological_effects: 'Stimulates appetite, improves digestion',
                        psychological_effects: 'Increases social confidence, enhances creativity',
                        contraindications: ['hyperactivity', 'manic_episodes'],
                        application_methods: ['ambient_lighting', 'art_therapy', 'meditation']
                    },
                    yellow: {
                        therapeutic_uses: ['depression', 'mental_fatigue', 'digestive_issues'],
                        physiological_effects: 'Stimulates nervous system, aids digestion',
                        psychological_effects: 'Improves mood, enhances mental clarity',
                        contraindications: ['anxiety', 'agitation', 'hyperactivity'],
                        application_methods: ['bright_lighting', 'color_meditation', 'art_therapy']
                    },
                    green: {
                        therapeutic_uses: ['stress_reduction', 'eye_strain', 'heart_conditions'],
                        physiological_effects: 'Lowers blood pressure, reduces muscle tension',
                        psychological_effects: 'Promotes balance, reduces anxiety',
                        contraindications: ['severe_depression', 'lethargy'],
                        application_methods: ['natural_environments', 'green_walls', 'meditation']
                    },
                    blue: {
                        therapeutic_uses: ['insomnia', 'hypertension', 'inflammation'],
                        physiological_effects: 'Lowers heart rate, reduces inflammation',
                        psychological_effects: 'Calms mind, promotes sleep',
                        contraindications: ['depression', 'seasonal_affective_disorder'],
                        application_methods: ['blue_light_therapy', 'bedroom_colors', 'relaxation_spaces']
                    },
                    indigo: {
                        therapeutic_uses: ['migraine_relief', 'insomnia', 'mental_clarity'],
                        physiological_effects: 'Reduces brain activity, promotes deep rest',
                        psychological_effects: 'Enhances intuition, promotes meditation',
                        contraindications: ['depression', 'low_energy'],
                        application_methods: ['meditation_rooms', 'sleep_therapy', 'spiritual_practices']
                    },
                    violet: {
                        therapeutic_uses: ['spiritual_healing', 'addiction_recovery', 'mental_transformation'],
                        physiological_effects: 'Affects pineal gland, influences sleep cycles',
                        psychological_effects: 'Promotes spiritual growth, mental transformation',
                        contraindications: ['psychosis', 'severe_mental_illness'],
                        application_methods: ['spiritual_spaces', 'therapy_rooms', 'meditation']
                    }
                }
            },

            clinical_applications: {
                hospitals: {
                    patient_rooms: {
                        recommended: ['soft_blue', 'sage_green', 'warm_beige'],
                        avoid: ['bright_red', 'electric_yellow', 'harsh_white'],
                        psychological_rationale: 'Reduce stress, promote healing, comfort patients'
                    },
                    operating_rooms: {
                        recommended: ['sea_green', 'blue_green', 'light_gray'],
                        avoid: ['red', 'pink', 'bright_colors'],
                        psychological_rationale: 'Reduce eye fatigue, enhance focus, complement blood color'
                    },
                    waiting_areas: {
                        recommended: ['warm_beige', 'soft_green', 'light_blue'],
                        avoid: ['dark_colors', 'overstimulating_colors'],
                        psychological_rationale: 'Reduce anxiety, promote calm waiting experience'
                    }
                },

                mental_health_facilities: {
                    therapy_rooms: {
                        recommended: ['neutral_beige', 'soft_gray', 'warm_white'],
                        avoid: ['stimulating_colors', 'personal_preference_colors'],
                        psychological_rationale: 'Neutral environment for emotional exploration'
                    },
                    group_therapy: {
                        recommended: ['warm_earth_tones', 'soft_greens', 'gentle_blues'],
                        avoid: ['cold_colors', 'harsh_contrasts'],
                        psychological_rationale: 'Promote group cohesion, emotional safety'
                    }
                },

                senior_care: {
                    living_areas: {
                        recommended: ['warm_yellows', 'coral', 'sage_green'],
                        avoid: ['cool_blues', 'dark_colors', 'low_contrast_combinations'],
                        psychological_rationale: 'Combat depression, improve visibility, maintain warmth'
                    },
                    dining_areas: {
                        recommended: ['warm_orange', 'golden_yellow', 'coral'],
                        avoid: ['blue', 'purple', 'cold_colors'],
                        psychological_rationale: 'Stimulate appetite, encourage social interaction'
                    }
                }
            }
        };
    }

    /**
     * Initialize circadian rhythm and lighting psychology
     */
    initializeCircadianEffects() {
        this.circadianEffects = {
            color_temperature_psychology: {
                description: 'How color temperature affects biological rhythms',
                warm_light: {
                    kelvin_range: '2700K-3000K',
                    psychological_effects: 'Relaxation, sleep preparation, comfort',
                    physiological_effects: 'Melatonin production, reduced cortisol',
                    optimal_times: ['evening', 'night', 'early_morning'],
                    room_applications: ['bedroom', 'living_room_evening', 'bathroom_night']
                },
                neutral_light: {
                    kelvin_range: '3500K-4000K',
                    psychological_effects: 'Balance, comfort, natural feeling',
                    physiological_effects: 'Balanced hormone production',
                    optimal_times: ['morning', 'afternoon'],
                    room_applications: ['living_room', 'kitchen', 'general_areas']
                },
                cool_light: {
                    kelvin_range: '5000K-6500K',
                    psychological_effects: 'Alertness, focus, energy',
                    physiological_effects: 'Cortisol production, suppressed melatonin',
                    optimal_times: ['morning', 'daytime', 'work_hours'],
                    room_applications: ['office', 'kitchen_morning', 'workout_areas']
                }
            },

            daily_color_rhythm: {
                morning: {
                    recommended_colors: ['golden_yellow', 'warm_orange', 'coral', 'light_blue'],
                    psychological_goals: 'Energy activation, mood elevation, alertness',
                    physiological_goals: 'Cortisol regulation, metabolism boost',
                    implementation: 'Sunrise simulation, energizing accent colors'
                },
                midday: {
                    recommended_colors: ['bright_white', 'clear_blue', 'vibrant_green'],
                    psychological_goals: 'Sustained focus, productivity, clarity',
                    physiological_goals: 'Maintain alertness, support metabolism',
                    implementation: 'Maximum brightness, color variety'
                },
                afternoon: {
                    recommended_colors: ['warm_white', 'soft_yellow', 'sage_green'],
                    psychological_goals: 'Sustained energy, comfort, balance',
                    physiological_goals: 'Energy maintenance, stress management',
                    implementation: 'Balanced lighting, comfortable colors'
                },
                evening: {
                    recommended_colors: ['warm_amber', 'soft_orange', 'dim_yellow'],
                    psychological_goals: 'Relaxation preparation, stress reduction',
                    physiological_goals: 'Melatonin preparation, cortisol reduction',
                    implementation: 'Warm lighting, sunset simulation'
                },
                night: {
                    recommended_colors: ['deep_red', 'amber', 'minimal_lighting'],
                    psychological_goals: 'Sleep preparation, deep relaxation',
                    physiological_goals: 'Melatonin production, sleep cycle support',
                    implementation: 'Red-shifted lighting, minimal brightness'
                }
            },

            seasonal_affective_considerations: {
                winter_support: {
                    color_therapy: ['bright_yellow', 'warm_orange', 'energizing_red'],
                    light_therapy: 'Full spectrum lighting, increased brightness',
                    psychological_support: 'Combat seasonal depression, energy boost'
                },
                spring_renewal: {
                    color_therapy: ['fresh_green', 'sky_blue', 'sunny_yellow'],
                    light_therapy: 'Natural light maximization, color variety',
                    psychological_support: 'Renewal feeling, optimism, growth'
                },
                summer_energy: {
                    color_therapy: ['vibrant_blues', 'energetic_greens', 'warm_colors'],
                    light_therapy: 'Abundant natural light, bright spaces',
                    psychological_support: 'Energy maximization, social connection'
                },
                autumn_grounding: {
                    color_therapy: ['earth_tones', 'warm_oranges', 'rich_reds'],
                    light_therapy: 'Warm lighting compensation for reduced daylight',
                    psychological_support: 'Grounding, comfort, preparation for winter'
                }
            }
        };
    }

    /**
     * Initialize emotional state mappings
     */
    initializeEmotionalStates() {
        this.emotionalStates = {
            anxiety: {
                description: 'Worry, nervousness, unease',
                beneficial_colors: {
                    'soft_blue': {
                        mechanism: 'Activates parasympathetic nervous system',
                        application: 'Wall colors, ambient lighting',
                        effectiveness: 85
                    },
                    'sage_green': {
                        mechanism: 'Promotes natural calm, reduces cortisol',
                        application: 'Natural elements, soft furnishings',
                        effectiveness: 80
                    },
                    'lavender': {
                        mechanism: 'Aromatherapy association, spiritual calm',
                        application: 'Accent colors, textiles',
                        effectiveness: 75
                    }
                },
                avoid_colors: ['bright_red', 'electric_yellow', 'neon_colors', 'harsh_contrasts'],
                environmental_factors: [
                    'Soft, even lighting',
                    'Natural textures',
                    'Minimal visual clutter',
                    'Escape routes visible'
                ]
            },

            depression: {
                description: 'Low mood, hopelessness, lack of energy',
                beneficial_colors: {
                    'warm_yellow': {
                        mechanism: 'Stimulates serotonin production, mimics sunlight',
                        application: 'Accent walls, artwork, natural light enhancement',
                        effectiveness: 90
                    },
                    'coral_orange': {
                        mechanism: 'Increases energy, promotes social connection',
                        application: 'Social areas, dining spaces',
                        effectiveness: 80
                    },
                    'energizing_green': {
                        mechanism: 'Represents growth, hope, renewal',
                        application: 'Plants, nature views, green accents',
                        effectiveness: 75
                    }
                },
                avoid_colors: ['dark_gray', 'black', 'cold_blue', 'muted_colors'],
                environmental_factors: [
                    'Maximum natural light',
                    'Bright, cheerful accents',
                    'Living plants',
                    'Varied textures and interest'
                ]
            },

            stress: {
                description: 'Tension, overwhelm, pressure',
                beneficial_colors: {
                    'earth_brown': {
                        mechanism: 'Grounding effect, stability association',
                        application: 'Foundation colors, natural materials',
                        effectiveness: 85
                    },
                    'neutral_beige': {
                        mechanism: 'Reduces overstimulation, promotes calm',
                        application: 'Large surfaces, backgrounds',
                        effectiveness: 80
                    },
                    'soft_gray': {
                        mechanism: 'Neutral calming, reduces decision fatigue',
                        application: 'Wall colors, organizational systems',
                        effectiveness: 75
                    }
                },
                avoid_colors: ['busy_patterns', 'high_contrast', 'stimulating_colors'],
                environmental_factors: [
                    'Organized, clutter-free spaces',
                    'Consistent lighting',
                    'Natural materials',
                    'Quiet color palettes'
                ]
            },

            fatigue: {
                description: 'Physical and mental exhaustion',
                beneficial_colors: {
                    'energizing_red': {
                        mechanism: 'Stimulates circulation, increases alertness',
                        application: 'Small accents, workout areas',
                        effectiveness: 85
                    },
                    'bright_orange': {
                        mechanism: 'Boosts energy, improves mood',
                        application: 'Kitchen, morning areas',
                        effectiveness: 80
                    },
                    'clear_blue': {
                        mechanism: 'Mental clarity, reduces mental fatigue',
                        application: 'Work areas, study spaces',
                        effectiveness: 75
                    }
                },
                avoid_colors: ['dark_colors', 'muted_tones', 'low_contrast'],
                environmental_factors: [
                    'Bright lighting',
                    'Color variety',
                    'Natural light access',
                    'Energizing patterns'
                ]
            },

            anger: {
                description: 'Frustration, irritation, aggression',
                beneficial_colors: {
                    'cool_blue': {
                        mechanism: 'Lowers blood pressure, promotes calm',
                        application: 'Dominant color scheme, cooling effect',
                        effectiveness: 90
                    },
                    'soft_green': {
                        mechanism: 'Natural harmony, reduces tension',
                        application: 'Natural elements, balancing colors',
                        effectiveness: 85
                    },
                    'neutral_white': {
                        mechanism: 'Clean slate feeling, mental reset',
                        application: 'Clean, minimal environments',
                        effectiveness: 70
                    }
                },
                avoid_colors: ['red', 'orange', 'bright_yellow', 'stimulating_colors'],
                environmental_factors: [
                    'Cool temperature',
                    'Minimal stimulation',
                    'Soft lighting',
                    'Natural elements'
                ]
            }
        };
    }

    /**
     * Initialize contextual factors affecting color psychology
     */
    initializeContextualFactors() {
        this.contextualFactors = {
            lighting_conditions: {
                natural_light: {
                    effects: 'Enhances true color perception, supports circadian rhythm',
                    color_modifications: 'Colors appear more vibrant and accurate',
                    psychological_impact: 'Improves mood, energy, and overall well-being',
                    recommendations: 'Maximize natural light, use colors that complement daylight'
                },
                incandescent: {
                    effects: 'Warm, yellowish cast, cozy feeling',
                    color_modifications: 'Warms all colors, reduces blue perception',
                    psychological_impact: 'Promotes relaxation, intimacy, comfort',
                    recommendations: 'Use cool colors to balance warmth, avoid yellow overload'
                },
                fluorescent: {
                    effects: 'Cool, sometimes harsh light, institutional feeling',
                    color_modifications: 'Enhances blues and greens, washes out reds',
                    psychological_impact: 'Can increase stress, reduce comfort',
                    recommendations: 'Use warm colors to counteract coolness, improve lighting quality'
                },
                led_adjustable: {
                    effects: 'Customizable color temperature, energy efficient',
                    color_modifications: 'Can match any lighting condition',
                    psychological_impact: 'Supports natural rhythms when properly programmed',
                    recommendations: 'Program for daily rhythm, adjust seasonally'
                }
            },

            space_size: {
                small_spaces: {
                    psychological_effects: 'Can feel cramped, intimate, or cozy',
                    color_strategies: [
                        'Light colors to expand space',
                        'Monochromatic schemes for unity',
                        'Strategic accent colors for interest',
                        'Avoid dark colors that close in space'
                    ],
                    special_considerations: 'Balance expansion with coziness'
                },
                large_spaces: {
                    psychological_effects: 'Can feel grand, cold, or overwhelming',
                    color_strategies: [
                        'Warm colors to create intimacy',
                        'Color zones for different functions',
                        'Darker colors to bring walls closer',
                        'Multiple color families for variety'
                    ],
                    special_considerations: 'Create intimate zones within large space'
                }
            },

            ceiling_height: {
                low_ceilings: {
                    psychological_effects: 'Can feel oppressive or cozy',
                    color_strategies: [
                        'Light ceiling colors to raise perceived height',
                        'Vertical stripes or patterns',
                        'Avoid dark overhead colors'
                    ]
                },
                high_ceilings: {
                    psychological_effects: 'Can feel grand or cold',
                    color_strategies: [
                        'Darker ceiling colors to lower perceived height',
                        'Warm colors to create intimacy',
                        'Horizontal elements to ground space'
                    ]
                }
            },

            climate_considerations: {
                hot_climates: {
                    psychological_needs: 'Cooling, refreshing, stress reduction',
                    recommended_colors: ['cool_blues', 'sea_greens', 'ice_whites'],
                    avoid_colors: ['warm_reds', 'oranges', 'dark_colors'],
                    physiological_benefits: 'Lower perceived temperature, reduce heat stress'
                },
                cold_climates: {
                    psychological_needs: 'Warming, energizing, mood boosting',
                    recommended_colors: ['warm_oranges', 'golden_yellows', 'earth_reds'],
                    avoid_colors: ['cold_blues', 'icy_whites', 'gray_tones'],
                    physiological_benefits: 'Higher perceived temperature, combat SAD'
                },
                humid_climates: {
                    psychological_needs: 'Fresh, clean, airy feeling',
                    recommended_colors: ['crisp_whites', 'fresh_greens', 'light_blues'],
                    avoid_colors: ['heavy_colors', 'dense_patterns'],
                    physiological_benefits: 'Reduce feeling of oppressiveness'
                }
            }
        };
    }

    /**
     * Analyze mood requirements and generate color recommendations
     * @param {Object} requirements - Mood and context requirements
     * @returns {Object} Comprehensive mood-based color analysis
     */
    analyzeMoodRequirements(requirements) {
        try {
            const {
                primary_mood = 'balanced',
                secondary_moods = [],
                room_type = 'living_room',
                personality_type = 'balanced',
                cultural_context = 'western',
                emotional_state = 'neutral',
                special_needs = [],
                contextual_factors = {}
            } = requirements;

            // Analyze primary mood requirements
            const primaryMoodAnalysis = this.analyzePrimaryMood(primary_mood);

            // Integrate secondary moods
            const moodIntegration = this.integrateMoods(primary_mood, secondary_moods);

            // Apply room-specific psychology
            const roomPsychology = this.applyRoomPsychology(room_type, moodIntegration);

            // Consider personality type
            const personalityInfluence = this.applyPersonalityInfluence(personality_type, roomPsychology);

            // Apply cultural considerations
            const culturalAdaptation = this.applyCulturalConsiderations(cultural_context, personalityInfluence);

            // Address emotional state needs
            const emotionalSupport = this.addressEmotionalState(emotional_state, culturalAdaptation);

            // Handle special needs
            const specialNeedsAdaptation = this.handleSpecialNeeds(special_needs, emotionalSupport);

            // Apply contextual factors
            const contextualAdaptation = this.applyContextualFactors(contextual_factors, specialNeedsAdaptation);

            // Generate final recommendations
            const recommendations = this.generateMoodRecommendations(contextualAdaptation, requirements);

            // Create implementation guide
            const implementationGuide = this.createImplementationGuide(recommendations, requirements);

            return {
                success: true,
                analysis: {
                    primary_mood: primaryMoodAnalysis,
                    mood_integration: moodIntegration,
                    room_psychology: roomPsychology,
                    personality_influence: personalityInfluence,
                    cultural_adaptation: culturalAdaptation,
                    emotional_support: emotionalSupport,
                    special_needs: specialNeedsAdaptation,
                    contextual_factors: contextualAdaptation
                },
                recommendations,
                implementation: implementationGuide,
                metadata: {
                    analysis_date: new Date().toISOString(),
                    requirements_processed: Object.keys(requirements).length,
                    confidence_score: this.calculateConfidenceScore(requirements)
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
     * Analyze primary mood requirements
     */
    analyzePrimaryMood(primaryMood) {
        const moodData = this.moodMappings[primaryMood];
        if (!moodData) {
            return {
                error: `Unknown mood: ${primaryMood}`,
                fallback: this.moodMappings.calming
            };
        }

        return {
            mood: primaryMood,
            description: moodData.description,
            primary_colors: moodData.primaryColors,
            secondary_colors: moodData.secondaryColors,
            avoid_colors: moodData.avoidColors,
            psychological_effects: Object.values(moodData.primaryColors).map(color => ({
                color: color.hex,
                triggers: color.triggers,
                physiological: color.physiological,
                intensity: color.intensity
            })),
            applications: moodData.applications,
            contraindications: moodData.contraindications
        };
    }

    /**
     * Integrate multiple moods for balanced recommendations
     */
    integrateMoods(primaryMood, secondaryMoods) {
        const integration = {
            dominant_mood: primaryMood,
            supporting_moods: secondaryMoods,
            color_blend: {},
            potential_conflicts: [],
            resolution_strategies: []
        };

        // Analyze each secondary mood
        secondaryMoods.forEach(mood => {
            const moodData = this.moodMappings[mood];
            if (moodData) {
                // Check for conflicts with primary mood
                const conflicts = this.identifyMoodConflicts(primaryMood, mood);
                if (conflicts.length > 0) {
                    integration.potential_conflicts.push({
                        moods: [primaryMood, mood],
                        conflicts,
                        resolution: this.resolveMoodConflict(primaryMood, mood)
                    });
                }

                // Blend colors appropriately
                integration.color_blend[mood] = this.blendMoodColors(primaryMood, mood);
            }
        });

        return integration;
    }

    /**
     * Identify conflicts between moods
     */
    identifyMoodConflicts(mood1, mood2) {
        const conflicts = [];
        const mood1Data = this.moodMappings[mood1];
        const mood2Data = this.moodMappings[mood2];

        if (!mood1Data || !mood2Data) return conflicts;

        // Check color conflicts
        const mood1Colors = Object.keys(mood1Data.primaryColors);
        const mood2AvoidColors = mood2Data.avoidColors;

        mood1Colors.forEach(color => {
            if (mood2AvoidColors.includes(color)) {
                conflicts.push({
                    type: 'color_conflict',
                    description: `${mood1} requires ${color} but ${mood2} avoids it`
                });
            }
        });

        // Check application conflicts
        const conflictingApplications = mood1Data.contraindications.filter(app =>
            mood2Data.applications.includes(app)
        );

        if (conflictingApplications.length > 0) {
            conflicts.push({
                type: 'application_conflict',
                description: `Conflicting space applications: ${conflictingApplications.join(', ')}`
            });
        }

        return conflicts;
    }

    /**
     * Resolve mood conflicts through compromise strategies
     */
    resolveMoodConflict(mood1, mood2) {
        const strategies = {
            'energetic_calming': {
                solution: 'Use energetic colors as accents in predominantly calming space',
                ratio: '20% energetic, 80% calming',
                implementation: 'Energetic artwork or accessories in calm base'
            },
            'focused_creative': {
                solution: 'Create zones - focused work area with creative inspiration elements',
                ratio: '70% focused, 30% creative',
                implementation: 'Structured base with creative accent wall or corner'
            },
            'social_sophisticated': {
                solution: 'Sophisticated base with warmer social accent elements',
                ratio: '60% sophisticated, 40% social',
                implementation: 'Elegant foundation with inviting lighting and textures'
            }
        };

        const conflictKey = `${mood1}_${mood2}`;
        return strategies[conflictKey] || {
            solution: 'Balance through spatial separation or time-based transitions',
            ratio: '60% primary mood, 40% secondary mood',
            implementation: 'Use primary mood as base, secondary as accent'
        };
    }

    /**
     * Blend colors from different moods
     */
    blendMoodColors(primaryMood, secondaryMood) {
        const primaryColors = this.moodMappings[primaryMood]?.primaryColors || {};
        const secondaryColors = this.moodMappings[secondaryMood]?.primaryColors || {};

        const blend = {
            primary_dominant: Object.keys(primaryColors).slice(0, 2),
            secondary_support: Object.keys(secondaryColors).slice(0, 1),
            blend_strategy: this.determineBlendStrategy(primaryMood, secondaryMood),
            application_ratios: {
                primary_mood: 70,
                secondary_mood: 30
            }
        };

        return blend;
    }

    /**
     * Determine blending strategy for mood colors
     */
    determineBlendStrategy(mood1, mood2) {
        const strategies = {
            'complementary': 'Use colors that complement each other across moods',
            'gradient': 'Create smooth transitions between mood colors',
            'zonal': 'Separate spaces for each mood with transitional elements',
            'layered': 'Base layer of one mood with accents of another',
            'temporal': 'Colors that can shift mood through lighting changes'
        };

        // Simplified strategy selection based on mood compatibility
        if (['energetic', 'creative'].includes(mood1) && ['calming', 'restorative'].includes(mood2)) {
            return strategies.zonal;
        } else if (['focused', 'sophisticated'].includes(mood1) && ['social', 'creative'].includes(mood2)) {
            return strategies.layered;
        } else {
            return strategies.complementary;
        }
    }

    /**
     * Apply room-specific psychological considerations
     */
    applyRoomPsychology(roomType, moodIntegration) {
        const roomData = this.roomPsychology[roomType];
        if (!roomData) {
            return {
                error: `Unknown room type: ${roomType}`,
                fallback: this.roomPsychology.living_room
            };
        }

        // Check mood compatibility with room function
        const moodCompatibility = this.assessMoodRoomCompatibility(moodIntegration.dominant_mood, roomType);

        // Adapt colors for room-specific needs
        const adaptedColors = this.adaptColorsForRoom(moodIntegration, roomData);

        // Consider lighting psychology
        const lightingConsiderations = this.applyLightingPsychology(roomData, adaptedColors);

        return {
            room_type: roomType,
            room_function: roomData.primary_function,
            psychological_needs: roomData.psychological_needs,
            mood_compatibility: moodCompatibility,
            adapted_colors: adaptedColors,
            lighting_psychology: lightingConsiderations,
            special_considerations: roomData.special_considerations
        };
    }

    /**
     * Assess compatibility between mood and room function
     */
    assessMoodRoomCompatibility(mood, roomType) {
        const roomData = this.roomPsychology[roomType];
        const moodData = this.moodMappings[mood];

        if (!roomData || !moodData) {
            return { compatible: false, score: 0 };
        }

        let compatibilityScore = 0;

        // Check if mood is in room's optimal moods
        if (roomData.optimal_moods.includes(mood)) {
            compatibilityScore += 40;
        }

        // Check if room is in mood's applications
        if (moodData.applications.includes(roomType)) {
            compatibilityScore += 30;
        }

        // Check if room is NOT in mood's contraindications
        if (!moodData.contraindications.includes(roomType)) {
            compatibilityScore += 20;
        }

        // Assess psychological needs alignment
        const needsAlignment = this.assessPsychologicalNeedsAlignment(roomData, moodData);
        compatibilityScore += needsAlignment;

        return {
            compatible: compatibilityScore >= 60,
            score: compatibilityScore,
            reasoning: this.generateCompatibilityReasoning(mood, roomType, compatibilityScore)
        };
    }

    /**
     * Assess alignment between room psychological needs and mood effects
     */
    assessPsychologicalNeedsAlignment(roomData, moodData) {
        const roomNeeds = roomData.psychological_needs;
        const moodTriggers = Object.values(moodData.primaryColors)
            .flatMap(color => color.triggers);

        const alignedNeeds = roomNeeds.filter(need =>
            moodTriggers.some(trigger => trigger.includes(need) || need.includes(trigger))
        );

        return Math.round((alignedNeeds.length / roomNeeds.length) * 10);
    }

    /**
     * Generate reasoning for compatibility assessment
     */
    generateCompatibilityReasoning(mood, roomType, score) {
        if (score >= 80) {
            return `Excellent match: ${mood} mood perfectly supports ${roomType} function`;
        } else if (score >= 60) {
            return `Good match: ${mood} mood generally compatible with ${roomType} use`;
        } else if (score >= 40) {
            return `Moderate match: ${mood} mood needs adaptation for ${roomType} function`;
        } else {
            return `Poor match: ${mood} mood may conflict with ${roomType} requirements`;
        }
    }

    /**
     * Adapt colors for specific room requirements
     */
    adaptColorsForRoom(moodIntegration, roomData) {
        const adaptedColors = {
            primary: [],
            secondary: [],
            accent: [],
            avoid: []
        };

        // Get base mood colors
        const moodData = this.moodMappings[moodIntegration.dominant_mood];
        const roomRecommended = roomData.recommended_colors;

        // Find intersection between mood colors and room recommendations
        Object.entries(moodData.primaryColors).forEach(([colorName, colorData]) => {
            const colorCategory = this.categorizeColorForRoom(colorData.hex);

            if (roomRecommended.primary.includes(colorCategory)) {
                adaptedColors.primary.push({
                    color: colorData.hex,
                    name: colorName,
                    suitability: 'excellent',
                    intensity: colorData.intensity
                });
            } else if (roomRecommended.accent.includes(colorCategory)) {
                adaptedColors.accent.push({
                    color: colorData.hex,
                    name: colorName,
                    suitability: 'good_as_accent',
                    intensity: colorData.intensity
                });
            } else if (roomRecommended.avoid.includes(colorCategory)) {
                adaptedColors.avoid.push({
                    color: colorData.hex,
                    name: colorName,
                    reason: 'conflicts_with_room_function'
                });
            }
        });

        // Add room-recommended colors not in mood palette
        roomRecommended.primary.forEach(colorCategory => {
            if (!adaptedColors.primary.some(c => this.categorizeColorForRoom(c.color) === colorCategory)) {
                const roomColor = this.generateRoomSpecificColor(colorCategory, roomData);
                adaptedColors.secondary.push(roomColor);
            }
        });

        return adaptedColors;
    }

    /**
     * Categorize color for room matching
     */
    categorizeColorForRoom(hex) {
        const rgb = ColorConversions.hexToRgb(hex);
        const hsl = ColorConversions.rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Simplified color categorization
        if (hsl.s < 20) return hsl.l > 80 ? 'white' : hsl.l > 50 ? 'light_gray' : 'dark_gray';
        if (hsl.h >= 345 || hsl.h < 15) return hsl.l > 70 ? 'light_red' : 'red';
        if (hsl.h >= 15 && hsl.h < 45) return hsl.l > 70 ? 'peach' : 'orange';
        if (hsl.h >= 45 && hsl.h < 75) return hsl.l > 70 ? 'cream' : 'yellow';
        if (hsl.h >= 75 && hsl.h < 165) return hsl.l > 70 ? 'sage_green' : 'green';
        if (hsl.h >= 165 && hsl.h < 255) return hsl.l > 70 ? 'light_blue' : 'blue';
        if (hsl.h >= 255 && hsl.h < 315) return hsl.l > 70 ? 'lavender' : 'purple';
        return 'neutral';
    }

    /**
     * Generate room-specific color
     */
    generateRoomSpecificColor(colorCategory, roomData) {
        const colorMap = {
            'white': '#f8f9fa',
            'cream': '#fef7cd',
            'light_gray': '#e5e7eb',
            'sage_green': '#a7f3d0',
            'light_blue': '#bfdbfe',
            'warm_gray': '#d6d3d1',
            'beige': '#f5f5dc'
        };

        return {
            color: colorMap[colorCategory] || '#f8f9fa',
            name: colorCategory,
            source: 'room_specific',
            suitability: 'room_optimized'
        };
    }

    /**
     * Apply lighting psychology considerations
     */
    applyLightingPsychology(roomData, adaptedColors) {
        const lightingPsychology = roomData.lighting_psychology;
        const recommendations = {};

        Object.entries(lightingPsychology).forEach(([timeOfDay, description]) => {
            recommendations[timeOfDay] = {
                description,
                color_temperature: this.recommendColorTemperature(timeOfDay),
                color_adjustments: this.recommendColorAdjustments(timeOfDay, adaptedColors),
                psychological_goals: this.identifyPsychologicalGoals(timeOfDay)
            };
        });

        return recommendations;
    }

    /**
     * Recommend color temperature for time of day
     */
    recommendColorTemperature(timeOfDay) {
        const temperatureMap = {
            morning: { kelvin: '4000K-5000K', type: 'neutral_to_cool', mood: 'alerting' },
            day: { kelvin: '5000K-6500K', type: 'cool', mood: 'focusing' },
            evening: { kelvin: '2700K-3000K', type: 'warm', mood: 'relaxing' },
            night: { kelvin: '2200K-2700K', type: 'very_warm', mood: 'sleep_preparing' }
        };

        return temperatureMap[timeOfDay] || temperatureMap.day;
    }

    /**
     * Recommend color adjustments for time of day
     */
    recommendColorAdjustments(timeOfDay, adaptedColors) {
        const adjustments = {
            morning: 'Increase brightness and saturation for energy',
            day: 'Maintain full color intensity for alertness',
            evening: 'Warm color temperature, reduce blue content',
            night: 'Minimize blue light, use red-shifted spectrum'
        };

        return adjustments[timeOfDay] || adjustments.day;
    }

    /**
     * Identify psychological goals for time of day
     */
    identifyPsychologicalGoals(timeOfDay) {
        const goals = {
            morning: ['energy_activation', 'mood_elevation', 'alertness_increase'],
            day: ['sustained_focus', 'productivity', 'comfort'],
            evening: ['stress_reduction', 'relaxation_preparation', 'social_comfort'],
            night: ['sleep_preparation', 'melatonin_production', 'deep_relaxation']
        };

        return goals[timeOfDay] || goals.day;
    }

    /**
     * Apply personality type influences
     */
    applyPersonalityInfluence(personalityType, roomPsychology) {
        const personalityData = this.personalityTypes[personalityType];
        if (!personalityData) {
            return {
                error: `Unknown personality type: ${personalityType}`,
                fallback: roomPsychology
            };
        }

        // Check mood compatibility with personality
        const moodPersonalityAlignment = this.assessMoodPersonalityAlignment(
            roomPsychology.room_type,
            personalityData
        );

        // Adapt colors for personality preferences
        const personalityColorAdaptations = this.adaptColorsForPersonality(
            roomPsychology.adapted_colors,
            personalityData
        );

        // Generate personality-specific room adaptations
        const roomAdaptations = personalityData.room_adaptations[roomPsychology.room_type] ||
                               'Apply general personality color preferences';

        return {
            personality_type: personalityType,
            personality_description: personalityData.description,
            mood_alignment: moodPersonalityAlignment,
            color_adaptations: personalityColorAdaptations,
            room_adaptations: roomAdaptations,
            psychological_drivers: personalityData.psychological_drivers
        };
    }

    /**
     * Assess alignment between mood and personality
     */
    assessMoodPersonalityAlignment(roomType, personalityData) {
        // This would check if the current mood requirements align with personality preferences
        return {
            alignment_score: 75, // Placeholder
            compatible_moods: personalityData.preferred_moods,
            adaptation_needed: false
        };
    }

    /**
     * Adapt colors for personality type
     */
    adaptColorsForPersonality(roomColors, personalityData) {
        const personalityColors = personalityData.color_preferences;
        const adaptations = {
            enhanced: [],
            modified: [],
            added: []
        };

        // Enhance colors that align with personality
        roomColors.primary.forEach(color => {
            const colorCategory = this.categorizeColorForRoom(color.color);
            if (personalityColors.primary.includes(colorCategory)) {
                adaptations.enhanced.push({
                    ...color,
                    enhancement: 'personality_aligned',
                    confidence: 'high'
                });
            }
        });

        // Add personality-preferred colors not in room selection
        personalityColors.primary.forEach(colorCategory => {
            if (!roomColors.primary.some(c => this.categorizeColorForRoom(c.color) === colorCategory)) {
                const personalityColor = this.generatePersonalityColor(colorCategory);
                adaptations.added.push(personalityColor);
            }
        });

        return adaptations;
    }

    /**
     * Generate color based on personality preference
     */
    generatePersonalityColor(colorCategory) {
        const colorMap = {
            'warm_orange': '#fb923c',
            'golden_yellow': '#fbbf24',
            'soft_blue': '#a8dadc',
            'sage_green': '#a7f3d0',
            'lavender': '#c7a8d8',
            'coral_pink': '#f87171'
        };

        return {
            color: colorMap[colorCategory] || '#f8f9fa',
            name: colorCategory,
            source: 'personality_preference',
            suitability: 'personality_aligned'
        };
    }

    /**
     * Apply cultural considerations to color recommendations
     */
    applyCulturalConsiderations(culturalContext, personalityInfluence) {
        const culturalData = this.culturalPsychology[culturalContext];
        if (!culturalData) {
            return {
                error: `Unknown cultural context: ${culturalContext}`,
                fallback: personalityInfluence
            };
        }

        // Analyze cultural color associations
        const culturalColorAnalysis = this.analyzeCulturalColorMeanings(
            personalityInfluence.color_adaptations,
            culturalData
        );

        // Check for cultural conflicts
        const culturalConflicts = this.identifyCulturalConflicts(
            personalityInfluence.color_adaptations,
            culturalData
        );

        // Generate cultural adaptations
        const culturalAdaptations = this.generateCulturalAdaptations(
            culturalConflicts,
            culturalData
        );

        return {
            cultural_context: culturalContext,
            color_analysis: culturalColorAnalysis,
            cultural_conflicts: culturalConflicts,
            cultural_adaptations: culturalAdaptations,
            cultural_recommendations: this.generateCulturalRecommendations(culturalContext, culturalData)
        };
    }

    /**
     * Analyze cultural meanings of selected colors
     */
    analyzeCulturalColorMeanings(colorAdaptations, culturalData) {
        const analysis = {};

        ['enhanced', 'added'].forEach(category => {
            if (colorAdaptations[category]) {
                colorAdaptations[category].forEach(colorItem => {
                    const colorCategory = this.categorizeColorForRoom(colorItem.color);
                    const culturalMeaning = culturalData[colorCategory];

                    if (culturalMeaning) {
                        analysis[colorItem.color] = {
                            positive_associations: culturalMeaning.positive,
                            negative_associations: culturalMeaning.negative,
                            cultural_context: culturalMeaning.cultural_context,
                            psychological_impact: culturalMeaning.psychological_impact,
                            overall_suitability: this.assessCulturalSuitability(culturalMeaning)
                        };
                    }
                });
            }
        });

        return analysis;
    }

    /**
     * Assess cultural suitability of color meanings
     */
    assessCulturalSuitability(culturalMeaning) {
        const positiveCount = culturalMeaning.positive?.length || 0;
        const negativeCount = culturalMeaning.negative?.length || 0;

        if (positiveCount > negativeCount * 2) return 'highly_suitable';
        if (positiveCount > negativeCount) return 'suitable';
        if (positiveCount === negativeCount) return 'neutral';
        return 'use_with_caution';
    }

    /**
     * Identify cultural conflicts in color choices
     */
    identifyCulturalConflicts(colorAdaptations, culturalData) {
        const conflicts = [];

        ['enhanced', 'added'].forEach(category => {
            if (colorAdaptations[category]) {
                colorAdaptations[category].forEach(colorItem => {
                    const colorCategory = this.categorizeColorForRoom(colorItem.color);
                    const culturalMeaning = culturalData[colorCategory];

                    if (culturalMeaning && culturalMeaning.negative && culturalMeaning.negative.length > 0) {
                        conflicts.push({
                            color: colorItem.color,
                            category: colorCategory,
                            conflicts: culturalMeaning.negative,
                            severity: this.assessConflictSeverity(culturalMeaning),
                            recommendations: this.generateConflictResolution(culturalMeaning)
                        });
                    }
                });
            }
        });

        return conflicts;
    }

    /**
     * Assess severity of cultural conflict
     */
    assessConflictSeverity(culturalMeaning) {
        const severeNegatives = ['death', 'evil', 'bad_luck', 'mourning'];
        const moderateNegatives = ['sadness', 'anger', 'aggression'];

        const negatives = culturalMeaning.negative || [];

        if (negatives.some(neg => severeNegatives.includes(neg))) return 'high';
        if (negatives.some(neg => moderateNegatives.includes(neg))) return 'medium';
        return 'low';
    }

    /**
     * Generate conflict resolution recommendations
     */
    generateConflictResolution(culturalMeaning) {
        return [
            'Use as accent rather than dominant color',
            'Combine with positive cultural colors',
            'Consider cultural context of space usage',
            'Educate users about intended positive meanings'
        ];
    }

    /**
     * Generate cultural adaptations
     */
    generateCulturalAdaptations(culturalConflicts, culturalData) {
        const adaptations = {
            color_substitutions: [],
            context_modifications: [],
            cultural_enhancements: []
        };

        culturalConflicts.forEach(conflict => {
            if (conflict.severity === 'high') {
                // Suggest alternative colors
                const alternative = this.findCulturalAlternative(conflict.category, culturalData);
                adaptations.color_substitutions.push({
                    original: conflict.color,
                    alternative: alternative.color,
                    reason: `Avoid negative association: ${conflict.conflicts.join(', ')}`
                });
            } else {
                // Suggest context modifications
                adaptations.context_modifications.push({
                    color: conflict.color,
                    modifications: conflict.recommendations
                });
            }
        });

        return adaptations;
    }

    /**
     * Find cultural alternative for problematic color
     */
    findCulturalAlternative(colorCategory, culturalData) {
        // Find colors with positive associations in the same family
        const alternatives = Object.entries(culturalData).filter(([color, data]) =>
            data.positive && data.positive.length > 0 && data.negative.length === 0
        );

        if (alternatives.length > 0) {
            const [altCategory, altData] = alternatives[0];
            return {
                category: altCategory,
                color: this.generatePersonalityColor(altCategory),
                positive_associations: altData.positive
            };
        }

        // Fallback to neutral colors
        return {
            category: 'neutral',
            color: '#f8f9fa',
            positive_associations: ['safe', 'neutral', 'universally_acceptable']
        };
    }

    /**
     * Generate cultural recommendations
     */
    generateCulturalRecommendations(culturalContext, culturalData) {
        const recommendations = [
            `Consider ${culturalContext} cultural color associations`,
            'Test color choices with target cultural group',
            'Provide cultural context education when needed',
            'Balance cultural sensitivity with design goals'
        ];

        // Add specific recommendations based on cultural data
        const positiveColors = Object.entries(culturalData)
            .filter(([, data]) => data.positive?.length > 0)
            .map(([color]) => color);

        if (positiveColors.length > 0) {
            recommendations.push(`Emphasize culturally positive colors: ${positiveColors.slice(0, 3).join(', ')}`);
        }

        return recommendations;
    }

    /**
     * Address specific emotional state needs
     */
    addressEmotionalState(emotionalState, culturalAdaptation) {
        if (emotionalState === 'neutral') return culturalAdaptation;

        const emotionalData = this.emotionalStates[emotionalState];
        if (!emotionalData) {
            return {
                error: `Unknown emotional state: ${emotionalState}`,
                fallback: culturalAdaptation
            };
        }

        // Analyze beneficial colors for emotional state
        const emotionalColorSupport = this.analyzeEmotionalColorSupport(
            culturalAdaptation.color_analysis,
            emotionalData
        );

        // Identify colors to avoid for emotional state
        const colorsToAvoid = this.identifyEmotionalColorsToAvoid(
            culturalAdaptation.color_analysis,
            emotionalData
        );

        // Generate emotional support strategies
        const emotionalStrategies = this.generateEmotionalSupportStrategies(
            emotionalState,
            emotionalData
        );

        return {
            emotional_state: emotionalState,
            emotional_description: emotionalData.description,
            color_support: emotionalColorSupport,
            colors_to_avoid: colorsToAvoid,
            support_strategies: emotionalStrategies,
            environmental_factors: emotionalData.environmental_factors
        };
    }

    /**
     * Analyze how colors support emotional state
     */
    analyzeEmotionalColorSupport(colorAnalysis, emotionalData) {
        const support = {};

        Object.entries(emotionalData.beneficial_colors).forEach(([colorName, colorInfo]) => {
            support[colorName] = {
                mechanism: colorInfo.mechanism,
                application: colorInfo.application,
                effectiveness: colorInfo.effectiveness,
                present_in_palette: this.checkColorPresence(colorName, colorAnalysis)
            };
        });

        return support;
    }

    /**
     * Check if beneficial color is present in current palette
     */
    checkColorPresence(colorName, colorAnalysis) {
        // Simplified check - in real implementation would do color matching
        return Object.keys(colorAnalysis).some(color =>
            this.categorizeColorForRoom(color).includes(colorName.split('_')[0])
        );
    }

    /**
     * Identify colors to avoid for emotional state
     */
    identifyEmotionalColorsToAvoid(colorAnalysis, emotionalData) {
        const avoid = [];
        const avoidColors = emotionalData.avoid_colors || [];

        Object.keys(colorAnalysis).forEach(color => {
            const colorCategory = this.categorizeColorForRoom(color);
            if (avoidColors.some(avoidColor => colorCategory.includes(avoidColor))) {
                avoid.push({
                    color,
                    category: colorCategory,
                    reason: `May exacerbate ${emotionalData.description}`,
                    recommendation: 'Remove or minimize usage'
                });
            }
        });

        return avoid;
    }

    /**
     * Generate emotional support strategies
     */
    generateEmotionalSupportStrategies(emotionalState, emotionalData) {
        const strategies = [];

        // Add color-specific strategies
        Object.entries(emotionalData.beneficial_colors).forEach(([colorName, colorInfo]) => {
            strategies.push({
                type: 'color_therapy',
                color: colorName,
                strategy: colorInfo.application,
                expected_outcome: colorInfo.mechanism
            });
        });

        // Add environmental strategies
        emotionalData.environmental_factors.forEach(factor => {
            strategies.push({
                type: 'environmental',
                strategy: factor,
                implementation: this.generateEnvironmentalImplementation(factor)
            });
        });

        return strategies;
    }

    /**
     * Generate implementation details for environmental factors
     */
    generateEnvironmentalImplementation(factor) {
        const implementations = {
            'soft_even_lighting': 'Use multiple light sources, avoid harsh overhead lighting',
            'natural_textures': 'Include wood, stone, fabric textures for grounding',
            'minimal_visual_clutter': 'Organize spaces, use hidden storage, clean lines',
            'escape_routes_visible': 'Ensure clear pathways, avoid blocked exits',
            'maximum_natural_light': 'Remove window obstructions, use mirrors to reflect light',
            'bright_cheerful_accents': 'Add colorful artwork, fresh flowers, bright textiles',
            'living_plants': 'Include low-maintenance plants for air quality and mood',
            'organized_clutter_free_spaces': 'Use storage solutions, maintain clean surfaces'
        };

        return implementations[factor.replace(/[,\s]/g, '_')] || 'Implement as appropriate for space';
    }

    /**
     * Handle special needs requirements
     */
    handleSpecialNeeds(specialNeeds, emotionalSupport) {
        if (!specialNeeds || specialNeeds.length === 0) return emotionalSupport;

        const specialNeedsAdaptations = {
            accessibility_requirements: [],
            therapeutic_modifications: [],
            sensory_considerations: []
        };

        specialNeeds.forEach(need => {
            const adaptations = this.generateSpecialNeedsAdaptations(need);
            specialNeedsAdaptations.accessibility_requirements.push(...adaptations.accessibility);
            specialNeedsAdaptations.therapeutic_modifications.push(...adaptations.therapeutic);
            specialNeedsAdaptations.sensory_considerations.push(...adaptations.sensory);
        });

        return {
            ...emotionalSupport,
            special_needs: specialNeeds,
            adaptations: specialNeedsAdaptations
        };
    }

    /**
     * Generate adaptations for specific special needs
     */
    generateSpecialNeedsAdaptations(need) {
        const adaptationsMap = {
            vision_impairment: {
                accessibility: ['High contrast color combinations', 'Tactile indicators for color changes'],
                therapeutic: ['Consistent color patterns for navigation'],
                sensory: ['Audio descriptions of color schemes']
            },
            autism_spectrum: {
                accessibility: ['Predictable color patterns', 'Avoid overwhelming sensory input'],
                therapeutic: ['Calming, non-stimulating color palettes'],
                sensory: ['Minimize visual noise and busy patterns']
            },
            dementia: {
                accessibility: ['Clear color coding for wayfinding', 'Familiar, comforting colors'],
                therapeutic: ['Memory-supportive color associations'],
                sensory: ['High contrast for safety and recognition']
            },
            ptsd: {
                accessibility: ['Avoid trigger colors if known', 'Escape route visibility'],
                therapeutic: ['Grounding colors, earth tones'],
                sensory: ['Soft, non-jarring color transitions']
            }
        };

        return adaptationsMap[need] || {
            accessibility: ['Consider individual needs'],
            therapeutic: ['Consult with healthcare professionals'],
            sensory: ['Monitor individual responses']
        };
    }

    /**
     * Apply contextual factors to color recommendations
     */
    applyContextualFactors(contextualFactors, specialNeedsAdaptation) {
        const adaptedRecommendations = { ...specialNeedsAdaptation };

        Object.entries(contextualFactors).forEach(([factor, value]) => {
            const adaptations = this.generateContextualAdaptations(factor, value);
            adaptedRecommendations[`${factor}_adaptations`] = adaptations;
        });

        return adaptedRecommendations;
    }

    /**
     * Generate adaptations for contextual factors
     */
    generateContextualAdaptations(factor, value) {
        const factorAdaptations = {
            lighting_type: {
                natural: 'Optimize for daylight viewing, maintain color accuracy',
                led: 'Ensure LED spectrum doesn\'t shift color perception',
                incandescent: 'Account for warm color cast, enhance cool colors',
                fluorescent: 'Compensate for cool cast, add warm accents'
            },
            room_size: {
                small: 'Use light colors to expand space, limit dark colors',
                large: 'Use warm colors to create intimacy, color zones possible',
                medium: 'Balanced approach, flexible color strategies'
            },
            climate: {
                hot: 'Emphasize cooling colors, blues and greens',
                cold: 'Emphasize warming colors, oranges and reds',
                humid: 'Use fresh, airy colors to counteract oppression',
                dry: 'Include hydrating blues and greens'
            }
        };

        return factorAdaptations[factor]?.[value] || 'Consider individual context requirements';
    }

    /**
     * Generate final mood-based recommendations
     */
    generateMoodRecommendations(contextualAdaptation, originalRequirements) {
        const recommendations = {
            primary_palette: this.compilePrimaryPalette(contextualAdaptation),
            secondary_palette: this.compileSecondaryPalette(contextualAdaptation),
            accent_colors: this.compileAccentColors(contextualAdaptation),
            implementation_strategy: this.generateImplementationStrategy(contextualAdaptation),
            mood_optimization: this.generateMoodOptimization(contextualAdaptation),
            special_considerations: this.compileSpecialConsiderations(contextualAdaptation)
        };

        return recommendations;
    }

    /**
     * Compile primary color palette from all adaptations
     */
    compilePrimaryPalette(adaptations) {
        const primaryColors = [];

        // Extract colors from various adaptation layers
        if (adaptations.color_adaptations?.enhanced) {
            primaryColors.push(...adaptations.color_adaptations.enhanced.slice(0, 2));
        }

        if (adaptations.cultural_adaptations?.color_substitutions) {
            adaptations.cultural_adaptations.color_substitutions.forEach(sub => {
                primaryColors.push({
                    color: sub.alternative,
                    source: 'cultural_adaptation',
                    reason: sub.reason
                });
            });
        }

        return primaryColors.slice(0, 3); // Limit to 3 primary colors
    }

    /**
     * Compile secondary color palette
     */
    compileSecondaryPalette(adaptations) {
        const secondaryColors = [];

        if (adaptations.color_adaptations?.added) {
            secondaryColors.push(...adaptations.color_adaptations.added);
        }

        return secondaryColors.slice(0, 4); // Limit to 4 secondary colors
    }

    /**
     * Compile accent colors
     */
    compileAccentColors(adaptations) {
        const accentColors = [];

        // Generate accent colors based on emotional support needs
        if (adaptations.color_support) {
            Object.entries(adaptations.color_support).forEach(([colorName, support]) => {
                if (support.effectiveness > 70) {
                    accentColors.push({
                        color: this.generatePersonalityColor(colorName).color,
                        purpose: 'emotional_support',
                        effectiveness: support.effectiveness
                    });
                }
            });
        }

        return accentColors.slice(0, 3); // Limit to 3 accent colors
    }

    /**
     * Generate implementation strategy
     */
    generateImplementationStrategy(adaptations) {
        const strategy = {
            phased_approach: true,
            phases: [
                {
                    phase: 1,
                    description: 'Implement primary colors and base elements',
                    timeline: '1-2 weeks',
                    focus: 'Foundation colors, major surfaces'
                },
                {
                    phase: 2,
                    description: 'Add secondary colors and supporting elements',
                    timeline: '2-3 weeks',
                    focus: 'Furniture, larger accessories'
                },
                {
                    phase: 3,
                    description: 'Fine-tune with accent colors and details',
                    timeline: '1 week',
                    focus: 'Small accessories, artwork, lighting'
                }
            ],
            testing_period: {
                duration: '2 weeks minimum',
                evaluation_criteria: [
                    'Mood impact assessment',
                    'Comfort level evaluation',
                    'Functionality verification',
                    'Aesthetic satisfaction'
                ]
            }
        };

        return strategy;
    }

    /**
     * Generate mood optimization recommendations
     */
    generateMoodOptimization(adaptations) {
        return {
            daily_adjustments: 'Use lighting to enhance colors throughout the day',
            seasonal_variations: 'Adjust accent colors seasonally for mood support',
            activity_specific: 'Consider different color emphasis for different activities',
            maintenance: 'Regular evaluation and adjustment of color impact'
        };
    }

    /**
     * Compile special considerations
     */
    compileSpecialConsiderations(adaptations) {
        const considerations = [];

        if (adaptations.cultural_conflicts?.length > 0) {
            considerations.push('Monitor cultural sensitivity in color choices');
        }

        if (adaptations.colors_to_avoid?.length > 0) {
            considerations.push(`Avoid colors that may worsen ${adaptations.emotional_state}`);
        }

        if (adaptations.special_needs) {
            considerations.push('Regular assessment of special needs accommodation');
        }

        return considerations;
    }

    /**
     * Create implementation guide
     */
    createImplementationGuide(recommendations, requirements) {
        return {
            step_by_step: this.generateStepByStepGuide(recommendations),
            budget_considerations: this.generateBudgetGuidance(recommendations),
            timeline: this.generateTimeline(recommendations),
            success_metrics: this.generateSuccessMetrics(requirements),
            troubleshooting: this.generateTroubleshooting(requirements)
        };
    }

    /**
     * Generate step-by-step implementation guide
     */
    generateStepByStepGuide(recommendations) {
        return [
            'Assess current color situation and plan removal/changes',
            'Implement primary colors on major surfaces (walls, large furniture)',
            'Add secondary colors through medium-sized elements',
            'Introduce accent colors through accessories and artwork',
            'Adjust lighting to support color psychology goals',
            'Live with changes for evaluation period',
            'Make fine-tuning adjustments based on actual mood impact'
        ];
    }

    /**
     * Generate budget guidance
     */
    generateBudgetGuidance(recommendations) {
        return {
            high_impact_low_cost: ['Paint walls', 'Add colorful accessories', 'Change lighting'],
            medium_impact_medium_cost: ['Replace textiles', 'Add artwork', 'Update window treatments'],
            high_impact_high_cost: ['Replace furniture', 'Renovate surfaces', 'Custom lighting systems'],
            cost_saving_tips: ['Paint before buying new items', 'Use removable elements first', 'Test with temporary changes']
        };
    }

    /**
     * Generate implementation timeline
     */
    generateTimeline(recommendations) {
        return {
            planning_phase: '1 week - finalize colors and gather materials',
            implementation_phase: '2-4 weeks - phased color introduction',
            evaluation_phase: '2-4 weeks - live with changes and assess impact',
            adjustment_phase: '1 week - make final modifications'
        };
    }

    /**
     * Generate success metrics
     */
    generateSuccessMetrics(requirements) {
        const metrics = [
            'Improved mood ratings in target space',
            'Increased comfort and time spent in space',
            'Positive feedback from users',
            'Achievement of specific mood goals'
        ];

        if (requirements.emotional_state && requirements.emotional_state !== 'neutral') {
            metrics.push(`Reduced symptoms of ${requirements.emotional_state}`);
        }

        return metrics;
    }

    /**
     * Generate troubleshooting guide
     */
    generateTroubleshooting(requirements) {
        return {
            mood_not_achieved: 'Adjust lighting, increase/decrease color intensity, add missing color elements',
            colors_feel_wrong: 'Check lighting conditions, verify color accuracy, consider personal associations',
            space_feels_unbalanced: 'Adjust color proportions, add neutral elements, check color distribution',
            unexpected_negative_reaction: 'Identify specific trigger colors, provide transition period, consider cultural factors'
        };
    }

    /**
     * Calculate confidence score for recommendations
     */
    calculateConfidenceScore(requirements) {
        let score = 50; // Base score

        // Add points for complete information
        if (requirements.primary_mood) score += 15;
        if (requirements.room_type) score += 15;
        if (requirements.personality_type) score += 10;
        if (requirements.cultural_context) score += 10;
        if (requirements.emotional_state) score += 10;

        // Subtract points for conflicts or missing critical info
        if (!requirements.primary_mood) score -= 20;
        if (requirements.special_needs?.length > 0) score -= 5; // More complexity

        return Math.max(30, Math.min(100, score));
    }
}

module.exports = AdvancedColorPsychology;