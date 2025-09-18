/**
 * Localized Color Data
 * Provides culturally adapted color names, descriptions, and meanings
 * for Turkish and English locales
 */

class LocalizedColorData {
    constructor() {
        this.currentLanguage = 'en';
        this.colorData = this.initializeColorData();
        this.culturalColorMeanings = this.initializeCulturalMeanings();
        this.sanzoHarmonies = this.initializeSanzoHarmonies();

        // Listen for language changes
        if (window.i18nManager) {
            window.i18nManager.onLanguageChange((language) => {
                this.currentLanguage = language;
            });
        }
    }

    /**
     * Initialize base color data with multilingual names and cultural meanings
     */
    initializeColorData() {
        return {
            // Basic colors with cultural names
            colors: {
                '#FF0000': {
                    en: { name: 'Red', meaning: 'passion, energy, power', cultural: 'courage, strength' },
                    tr: { name: 'Kırmızı', meaning: 'tutku, enerji, güç', cultural: 'cesaret, vatan, bayrak' }
                },
                '#00FF00': {
                    en: { name: 'Green', meaning: 'nature, growth, harmony', cultural: 'freshness, life' },
                    tr: { name: 'Yeşil', meaning: 'doğa, büyüme, uyum', cultural: 'İslam, umut, bereket' }
                },
                '#0000FF': {
                    en: { name: 'Blue', meaning: 'trust, stability, calm', cultural: 'wisdom, loyalty' },
                    tr: { name: 'Mavi', meaning: 'güven, istikrar, sakinlik', cultural: 'nazar, koruma, sonsuzluk' }
                },
                '#FFFF00': {
                    en: { name: 'Yellow', meaning: 'happiness, optimism, creativity', cultural: 'sun, gold' },
                    tr: { name: 'Sarı', meaning: 'mutluluk, iyimserlik, yaratıcılık', cultural: 'altın, güneş, hastalık (eski)' }
                },
                '#FFA500': {
                    en: { name: 'Orange', meaning: 'enthusiasm, creativity, warmth', cultural: 'autumn, harvest' },
                    tr: { name: 'Turuncu', meaning: 'coşku, yaratıcılık, sıcaklık', cultural: 'güz, hasat, neşe' }
                },
                '#800080': {
                    en: { name: 'Purple', meaning: 'luxury, mystery, spirituality', cultural: 'royalty, magic' },
                    tr: { name: 'Mor', meaning: 'lüks, gizem, maneviyat', cultural: 'asalet, gizemli, menekşe' }
                },
                '#FFC0CB': {
                    en: { name: 'Pink', meaning: 'love, femininity, nurturing', cultural: 'romance, softness' },
                    tr: { name: 'Pembe', meaning: 'sevgi, kadınsılık, şefkat', cultural: 'romantizm, incelik, gül' }
                },
                '#A52A2A': {
                    en: { name: 'Brown', meaning: 'stability, comfort, earth', cultural: 'reliability, nature' },
                    tr: { name: 'Kahverengi', meaning: 'istikrar, konfor, toprak', cultural: 'güvenilirlik, kahve, toprak' }
                },
                '#000000': {
                    en: { name: 'Black', meaning: 'elegance, power, mystery', cultural: 'sophistication, formality' },
                    tr: { name: 'Siyah', meaning: 'zarafet, güç, gizem', cultural: 'resmiyet, ağırlık, yas' }
                },
                '#FFFFFF': {
                    en: { name: 'White', meaning: 'purity, cleanliness, simplicity', cultural: 'peace, innocence' },
                    tr: { name: 'Beyaz', meaning: 'saflık, temizlik, sadelik', cultural: 'barış, masumiyet, kar' }
                },
                '#808080': {
                    en: { name: 'Gray', meaning: 'neutrality, balance, sophistication', cultural: 'wisdom, stability' },
                    tr: { name: 'Gri', meaning: 'tarafsızlık, denge, sofistike', cultural: 'bilgelik, olgunluk, sis' }
                },
                '#F5DEB3': {
                    en: { name: 'Wheat', meaning: 'warmth, harvest, abundance', cultural: 'prosperity, agriculture' },
                    tr: { name: 'Buğday', meaning: 'sıcaklık, hasat, bolluk', cultural: 'bereket, tarım, ekmek' }
                },
                '#DEB887': {
                    en: { name: 'Burlywood', meaning: 'natural, rustic, warm', cultural: 'countryside, simplicity' },
                    tr: { name: 'Deve Tüyü', meaning: 'doğal, rustik, sıcak', cultural: 'kırsal, sadelik, çöl' }
                },
                '#8B4513': {
                    en: { name: 'Saddle Brown', meaning: 'durability, tradition, earth', cultural: 'leather, craftsmanship' },
                    tr: { name: 'Koyu Kahve', meaning: 'dayanıklılık, gelenek, toprak', cultural: 'deri, zanaat, köklü' }
                },
                '#CD853F': {
                    en: { name: 'Peru', meaning: 'warmth, spice, richness', cultural: 'exotic, adventure' },
                    tr: { name: 'Tarçın', meaning: 'sıcaklık, baharat, zenginlik', cultural: 'egzotik, baharat yolu' }
                },
                '#D2691E': {
                    en: { name: 'Chocolate', meaning: 'comfort, luxury, indulgence', cultural: 'sweetness, reward' },
                    tr: { name: 'Çikolata', meaning: 'konfor, lüks, keyif', cultural: 'tatlılık, ödül, Afrika' }
                }
            },

            // Turkish traditional colors with cultural significance
            turkishTraditionalColors: {
                '#DC143C': {
                    name: 'Türk Kırmızısı',
                    meaning: 'vatanseverlik, cesaret, şehitlik',
                    cultural: 'Türk bayrağı, tarih, milli değerler',
                    usage: ['living_room', 'study', 'ceremonial']
                },
                '#1E90FF': {
                    name: 'Nazar Mavisi',
                    meaning: 'koruma, bereket, huzur',
                    cultural: 'nazar boncuğu, kötülükten korunma',
                    usage: ['child_bedroom', 'entrance', 'bathroom']
                },
                '#228B22': {
                    name: 'İslam Yeşili',
                    meaning: 'huzur, umut, doğa',
                    cultural: 'İslami değerler, bereket, cennet',
                    usage: ['study', 'living_room', 'bedroom']
                },
                '#FFD700': {
                    name: 'Osmanlı Altını',
                    meaning: 'zenginlik, asalet, ihtişam',
                    cultural: 'Osmanlı sarayı, sanat, el sanatları',
                    usage: ['dining_room', 'formal_areas']
                },
                '#800080': {
                    name: 'Menekşe Moru',
                    meaning: 'incelik, zarafet, gizem',
                    cultural: 'İstanbul, çiçekler, romantizm',
                    usage: ['bedroom', 'bathroom', 'reading_nook']
                },
                '#8B4513': {
                    name: 'Anadolu Toprağı',
                    meaning: 'köklülük, sağlamlık, geleneksellik',
                    cultural: 'Anadolu toprakları, tarih, köklü geçmiş',
                    usage: ['study', 'living_room', 'rustic_design']
                },
                '#F0E68C': {
                    name: 'Ballık Sarı',
                    meaning: 'tatlılık, doğallık, bereket',
                    cultural: 'Anadolu balı, arıcılık, doğal ürünler',
                    usage: ['kitchen', 'breakfast_nook', 'child_bedroom']
                },
                '#FA8072': {
                    name: 'Ege Güneşi',
                    meaning: 'sıcaklık, yaşam sevinci, enerji',
                    cultural: 'Ege kıyıları, tatil, deniz',
                    usage: ['living_room', 'terrace', 'social_areas']
                },
                '#20B2AA': {
                    name: 'Karadeniz Yeşili',
                    meaning: 'doğa, yaşam, bereket',
                    cultural: 'Karadeniz ormanları, çay, fındık',
                    usage: ['kitchen', 'bathroom', 'fresh_areas']
                },
                '#B22222': {
                    name: 'Çini Kırmızı',
                    meaning: 'sanat, zanaat, geleneksel güzellik',
                    cultural: 'İznik çinileri, Ottoman sanatı',
                    usage: ['decorative_accents', 'artistic_areas']
                },
                '#4B0082': {
                    name: 'Sultanı Mor',
                    meaning: 'asalet, mistik güç, derin düşünce',
                    cultural: 'Osmanlı sarayı, kraliyet, maneviyat',
                    usage: ['meditation_room', 'luxury_spaces', 'evening_areas']
                },
                '#CD5C5C': {
                    name: 'Şafak Kırmızısı',
                    meaning: 'yeni başlangıçlar, umut, enerji',
                    cultural: 'İstanbul şafağı, sabah namazı, yeni gün',
                    usage: ['bedroom', 'prayer_room', 'east_facing_rooms']
                },
                '#2E8B57': {
                    name: 'Hurma Yeşili',
                    meaning: 'bolluk, bereket, doğal zenginlik',
                    cultural: 'Akdeniz hurmaları, oasis, bolluk',
                    usage: ['dining_room', 'garden_room', 'abundance_spaces']
                },
                '#DDA0DD': {
                    name: 'Lale Moru',
                    meaning: 'incelik, şiir, Osmanlı zarafeti',
                    cultural: 'Lale Devri, şiir, İstanbul bahçeleri',
                    usage: ['reading_nook', 'artistic_spaces', 'romantic_areas']
                },
                '#F4A460': {
                    name: 'Kumsal Bej',
                    meaning: 'sakinlik, doğallık, topraklanma',
                    cultural: 'Türk rivierası, tatil, dinginlik',
                    usage: ['bedroom', 'spa_areas', 'relaxation_zones']
                },
                '#6B8E23': {
                    name: 'Zeytinyağı Yeşili',
                    meaning: 'beslenme, geleneksel yaşam, sağlık',
                    cultural: 'Ege zeytinleri, geleneksel mutfak, sağlık',
                    usage: ['kitchen', 'dining_room', 'health_focused_areas']
                }
            }
        };
    }

    /**
     * Initialize cultural color meanings for different contexts
     */
    initializeCulturalMeanings() {
        return {
            turkish: {
                red: {
                    positive: ['cesaret', 'vatan sevgisi', 'güç', 'tutku'],
                    negative: ['öfke', 'tehlike', 'saldırganlık'],
                    cultural: ['Türk bayrağı', 'şehitlik', 'milli değerler'],
                    occasions: ['milli bayramlar', 'düğünler', 'özel günler']
                },
                blue: {
                    positive: ['koruma', 'huzur', 'sonsuzluk', 'güven'],
                    negative: ['soğukluk', 'mesafeli'],
                    cultural: ['nazar boncuğu', 'gökyüzü', 'deniz'],
                    occasions: ['çocuk odası', 'koruma amaçlı']
                },
                green: {
                    positive: ['umut', 'bereket', 'huzur', 'İslami değerler'],
                    negative: ['deneyimsizlik'],
                    cultural: ['İslam', 'doğa', 'cennet'],
                    occasions: ['dini günler', 'doğa temalı']
                },
                white: {
                    positive: ['saflık', 'temizlik', 'barış', 'masumiyet'],
                    negative: ['sterillik', 'soğukluk'],
                    cultural: ['nikah', 'temizlik', 'kar'],
                    occasions: ['düğünler', 'dini törenleri', 'yeni başlangıçlar']
                },
                yellow: {
                    positive: ['güneş', 'neşe', 'altın', 'bolluk'],
                    negative: ['hastalık (geleneksel)', 'kıskançlık'],
                    cultural: ['sonbahar', 'hasat', 'altın'],
                    occasions: ['neşeli etkinlikler', 'çocuk aktiviteleri']
                }
            },
            english: {
                red: {
                    positive: ['passion', 'energy', 'power', 'love'],
                    negative: ['anger', 'danger', 'aggression'],
                    cultural: ['roses', 'valentine', 'power'],
                    occasions: ['romantic', 'energetic spaces', 'dining']
                },
                blue: {
                    positive: ['trust', 'loyalty', 'wisdom', 'calm'],
                    negative: ['coldness', 'sadness'],
                    cultural: ['ocean', 'sky', 'corporate'],
                    occasions: ['bedrooms', 'offices', 'bathrooms']
                },
                green: {
                    positive: ['nature', 'growth', 'harmony', 'fresh'],
                    negative: ['inexperience', 'envy'],
                    cultural: ['nature', 'money', 'ecology'],
                    occasions: ['living rooms', 'studies', 'natural themes']
                }
            }
        };
    }

    /**
     * Initialize localized Sanzo harmony descriptions
     */
    initializeSanzoHarmonies() {
        return {
            'Wada Classic Warm': {
                en: {
                    name: 'Wada Classic Warm',
                    description: 'A timeless combination inspired by traditional Japanese warmth',
                    psychology: 'Creates feelings of comfort, warmth, and traditional elegance',
                    culturalNotes: 'Perfect for creating welcoming, family-oriented spaces',
                    implementation: 'Use warmer tones on larger surfaces, cooler as accents'
                },
                tr: {
                    name: 'Wada Klasik Sıcaklık',
                    description: 'Geleneksel Japon sıcaklığından ilham alan zamansız kombinasyon',
                    psychology: 'Konfor, sıcaklık ve geleneksel zarafet hissi yaratır',
                    culturalNotes: 'Misafirperver, aile odaklı mekanlar yaratmak için mükemmel',
                    implementation: 'Daha sıcak tonları geniş yüzeylerde, soğuk tonları vurgu olarak kullanın'
                }
            },
            'Wada Tranquil Blues': {
                en: {
                    name: 'Wada Tranquil Blues',
                    description: 'Serene blue palette promoting calm and mental clarity',
                    psychology: 'Encourages calm, serenity, and mental clarity',
                    culturalNotes: 'Ideal for spaces requiring focus and relaxation',
                    implementation: 'Layer different shades for depth without overwhelming'
                },
                tr: {
                    name: 'Wada Huzurlu Maviler',
                    description: 'Sakinlik ve zihinsel berraklığı destekleyen dingin mavi paletİ',
                    psychology: 'Sakinlik, huzur ve zihinsel berraklığı teşvik eder',
                    culturalNotes: 'Odaklanma ve rahatlama gerektiren mekanlar için ideal',
                    implementation: 'Boğucu olmadan derinlik için farklı tonları katmanlayın'
                }
            },
            'Wada Earth Tones': {
                en: {
                    name: 'Wada Earth Tones',
                    description: 'Grounding palette connecting with natural elements',
                    psychology: 'Provides grounding, stability, and natural harmony',
                    culturalNotes: 'Brings the outdoors inside, very calming',
                    implementation: 'Combine with natural textures and materials'
                },
                tr: {
                    name: 'Wada Toprak Tonları',
                    description: 'Doğal unsurlarla bağlantı kuran topraklayıcı palet',
                    psychology: 'Topraklanma, istikrar ve doğal uyum sağlar',
                    culturalNotes: 'Dış mekanı içeri taşır, çok sakinleştirici',
                    implementation: 'Doğal dokular ve malzemelerle birleştirin'
                }
            }
        };
    }

    /**
     * Get localized color name
     */
    getColorName(hexColor, language = null) {
        const lang = language || this.currentLanguage;
        const color = this.colorData.colors[hexColor.toUpperCase()];

        if (color && color[lang]) {
            return color[lang].name;
        }

        // Check Turkish traditional colors
        const traditionalColor = this.colorData.turkishTraditionalColors[hexColor.toUpperCase()];
        if (traditionalColor && lang === 'tr') {
            return traditionalColor.name;
        }

        // Fallback to basic color detection
        return this.detectBasicColorName(hexColor, lang);
    }

    /**
     * Get color meaning with cultural context
     */
    getColorMeaning(hexColor, language = null) {
        const lang = language || this.currentLanguage;
        const color = this.colorData.colors[hexColor.toUpperCase()];

        if (color && color[lang]) {
            return {
                meaning: color[lang].meaning,
                cultural: color[lang].cultural
            };
        }

        // Check Turkish traditional colors
        const traditionalColor = this.colorData.turkishTraditionalColors[hexColor.toUpperCase()];
        if (traditionalColor && lang === 'tr') {
            return {
                meaning: traditionalColor.meaning,
                cultural: traditionalColor.cultural
            };
        }

        return { meaning: '', cultural: '' };
    }

    /**
     * Get culturally appropriate Sanzo harmony for room and culture
     */
    getCulturallyAdaptedHarmony(roomType, ageGroup, language = null) {
        const lang = language || this.currentLanguage;

        // Turkish cultural adaptations
        if (lang === 'tr') {
            return this.getTurkishCulturalHarmony(roomType, ageGroup);
        }

        // English/Western adaptations
        return this.getWesternCulturalHarmony(roomType, ageGroup);
    }

    /**
     * Get Turkish cultural harmony recommendations
     */
    getTurkishCulturalHarmony(roomType, ageGroup) {
        const recommendations = {
            living_room: {
                colors: ['#DC143C', '#FFD700', '#F5DEB3', '#8B4513'], // Türk kırmızısı, altın, buğday, kahve
                name: 'Misafirperver Anadolu',
                psychology: 'Misafirperverlik, sıcaklık, aile bağları',
                cultural: 'Türk misafirperverliği ve aile odaklı yaşam tarzını yansıtır'
            },
            child_bedroom: {
                colors: ['#1E90FF', '#F0E68C', '#98FB98', '#FFB6C1'], // Nazar mavisi, bal sarısı, açık yeşil, pembe
                name: 'Korunaklı Çocukluk',
                psychology: 'Güvenlik, neşe, koruma, yaratıcılık',
                cultural: 'Nazar boncuğu koruması ve Türk çocukluk gelenekleri'
            },
            bedroom: {
                colors: ['#800080', '#F0E68C', '#DEB887', '#FFFFFF'], // Menekşe, bal sarısı, deve tüyü, beyaz
                name: 'Huzurlu İstanbul',
                psychology: 'Huzur, romantizm, dinginlik',
                cultural: 'İstanbul\'un romantik atmosferi ve menekşe bahçeleri'
            },
            study: {
                colors: ['#228B22', '#8B4513', '#F5DEB3', '#FFD700'], // İslam yeşili, toprak, buğday, altın
                name: 'Bilgin Odası',
                psychology: 'Odaklanma, bilgelik, denge',
                cultural: 'Osmanlı medrese geleneği ve bilgi arayışı'
            }
        };

        return recommendations[roomType] || recommendations.living_room;
    }

    /**
     * Get Western cultural harmony recommendations
     */
    getWesternCulturalHarmony(roomType, ageGroup) {
        const recommendations = {
            living_room: {
                colors: ['#4682B4', '#DEB887', '#F4A460', '#FFFFFF'],
                name: 'Classic Comfort',
                psychology: 'Comfort, reliability, warmth',
                cultural: 'Traditional Western home values and hospitality'
            },
            child_bedroom: {
                colors: ['#87CEEB', '#FFB6C1', '#98FB98', '#F0E68C'],
                name: 'Playful Wonder',
                psychology: 'Joy, creativity, growth, energy',
                cultural: 'Western emphasis on creativity and individual expression'
            },
            bedroom: {
                colors: ['#E6E6FA', '#F0E68C', '#DEB887', '#FFFFFF'],
                name: 'Serene Retreat',
                psychology: 'Relaxation, peace, comfort',
                cultural: 'Western emphasis on personal sanctuary and rest'
            }
        };

        return recommendations[roomType] || recommendations.living_room;
    }

    /**
     * Detect basic color name from hex
     */
    detectBasicColorName(hexColor, language) {
        // Convert hex to RGB for basic color detection
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return hexColor;

        const { r, g, b } = rgb;

        // Basic color detection logic
        if (r > 200 && g < 100 && b < 100) {
            return language === 'tr' ? 'Kırmızı' : 'Red';
        } else if (r < 100 && g > 200 && b < 100) {
            return language === 'tr' ? 'Yeşil' : 'Green';
        } else if (r < 100 && g < 100 && b > 200) {
            return language === 'tr' ? 'Mavi' : 'Blue';
        } else if (r > 200 && g > 200 && b < 100) {
            return language === 'tr' ? 'Sarı' : 'Yellow';
        } else if (r > 150 && g > 150 && b > 150) {
            return language === 'tr' ? 'Açık Gri' : 'Light Gray';
        } else if (r < 100 && g < 100 && b < 100) {
            return language === 'tr' ? 'Koyu Gri' : 'Dark Gray';
        }

        return hexColor;
    }

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Get localized Sanzo harmony
     */
    getLocalizedSanzoHarmony(harmonyName, language = null) {
        const lang = language || this.currentLanguage;
        const harmony = this.sanzoHarmonies[harmonyName];

        return harmony && harmony[lang] ? harmony[lang] : harmony?.en || {};
    }

    /**
     * Get room-appropriate colors with cultural context
     */
    getRoomColorRecommendations(roomType, language = null, culturalPreference = 'traditional') {
        const lang = language || this.currentLanguage;

        if (lang === 'tr' && culturalPreference === 'traditional') {
            return this.getTurkishTraditionalRoomColors(roomType);
        }

        return this.getModernRoomColors(roomType);
    }

    /**
     * Get Turkish traditional room colors
     */
    getTurkishTraditionalRoomColors(roomType) {
        const roomColors = {
            living_room: {
                primary: '#DC143C', // Türk kırmızısı
                secondary: '#FFD700', // Osmanlı altını
                accent: '#228B22', // İslam yeşili
                neutral: '#F5DEB3' // Buğday
            },
            child_bedroom: {
                primary: '#1E90FF', // Nazar mavisi
                secondary: '#F0E68C', // Bal sarısı
                accent: '#FFB6C1', // Açık pembe
                neutral: '#FFFFFF' // Beyaz
            },
            bedroom: {
                primary: '#800080', // Menekşe moru
                secondary: '#DEB887', // Deve tüyü
                accent: '#F0E68C', // Bal sarısı
                neutral: '#FFFFFF' // Beyaz
            },
            study: {
                primary: '#228B22', // İslam yeşili
                secondary: '#8B4513', // Anadolu toprağı
                accent: '#FFD700', // Osmanlı altını
                neutral: '#F5DEB3' // Buğday
            }
        };

        return roomColors[roomType] || roomColors.living_room;
    }

    /**
     * Get modern room colors
     */
    getModernRoomColors(roomType) {
        const roomColors = {
            living_room: {
                primary: '#4682B4', // Steel blue
                secondary: '#DEB887', // Burlywood
                accent: '#FF6347', // Tomato
                neutral: '#F5F5F5' // White smoke
            },
            child_bedroom: {
                primary: '#87CEEB', // Sky blue
                secondary: '#FFB6C1', // Light pink
                accent: '#98FB98', // Pale green
                neutral: '#FFFFFF' // White
            },
            bedroom: {
                primary: '#E6E6FA', // Lavender
                secondary: '#F0E68C', // Khaki
                accent: '#DDA0DD', // Plum
                neutral: '#FFFFFF' // White
            }
        };

        return roomColors[roomType] || roomColors.living_room;
    }

    /**
     * Set current language
     */
    setLanguage(language) {
        if (['en', 'tr'].includes(language)) {
            this.currentLanguage = language;
        }
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get all available Turkish traditional colors
     */
    getTurkishTraditionalColors() {
        return Object.keys(this.colorData.turkishTraditionalColors).map(hex => ({
            hex,
            ...this.colorData.turkishTraditionalColors[hex]
        }));
    }

    /**
     * Check if a color has cultural significance
     */
    hasCulturalSignificance(hexColor, language = null) {
        const lang = language || this.currentLanguage;

        if (lang === 'tr') {
            return this.colorData.turkishTraditionalColors.hasOwnProperty(hexColor.toUpperCase());
        }

        return this.colorData.colors.hasOwnProperty(hexColor.toUpperCase());
    }
}

// Create global instance
window.localizedColorData = new LocalizedColorData();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalizedColorData;
}