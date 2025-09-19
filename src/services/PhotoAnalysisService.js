/**
 * Photo Analysis Service
 * AI-powered photo analysis for room color extraction and recommendations
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class PhotoAnalysisService {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
        this.analysisCache = new Map();
    }

    /**
     * Analyze uploaded photo for room colors
     * @param {Buffer} imageBuffer - Image file buffer
     * @param {Object} metadata - Upload metadata
     * @returns {Object} Color analysis results
     */
    async analyzeRoomPhoto(imageBuffer, metadata = {}) {
        try {
            // Validate and process image
            const processedImage = await this.preprocessImage(imageBuffer);

            // Extract dominant colors
            const dominantColors = await this.extractDominantColors(processedImage);

            // Detect room context
            const roomContext = await this.detectRoomContext(processedImage, metadata);

            // Analyze color distribution
            const colorDistribution = await this.analyzeColorDistribution(dominantColors);

            // Generate color mapping
            const colorMapping = await this.mapColorsToRoomElements(dominantColors, roomContext);

            // Create analysis results
            const analysis = {
                success: true,
                roomContext,
                dominantColors,
                colorDistribution,
                colorMapping,
                confidence: this.calculateConfidence(dominantColors, roomContext),
                recommendations: await this.generatePhotoBasedRecommendations(colorMapping, roomContext),
                metadata: {
                    processedAt: new Date().toISOString(),
                    imageFormat: processedImage.format,
                    imageDimensions: processedImage.dimensions,
                    colorsExtracted: dominantColors.length
                }
            };

            return analysis;
        } catch (error) {
            console.error('Photo analysis error:', error);
            return {
                success: false,
                error: 'Fotoğraf analizi başarısız oldu',
                details: error.message
            };
        }
    }

    /**
     * Preprocess image for analysis
     * @param {Buffer} imageBuffer - Raw image buffer
     * @returns {Object} Processed image data
     */
    async preprocessImage(imageBuffer) {
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        // Validate format
        if (!this.allowedFormats.includes(metadata.format)) {
            throw new Error(`Desteklenmeyen format: ${metadata.format}`);
        }

        // Resize for analysis (max 800px width)
        const maxWidth = 800;
        const processedBuffer = await image
            .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        const processedMetadata = await sharp(processedBuffer).metadata();

        return {
            buffer: processedBuffer,
            format: metadata.format,
            originalDimensions: { width: metadata.width, height: metadata.height },
            dimensions: { width: processedMetadata.width, height: processedMetadata.height }
        };
    }

    /**
     * Extract dominant colors from image using color quantization
     * @param {Object} processedImage - Processed image data
     * @returns {Array} Array of dominant colors with percentages
     */
    async extractDominantColors(processedImage, maxColors = 12) {
        try {
            // Get raw pixel data
            const { data, info } = await sharp(processedImage.buffer)
                .raw()
                .toBuffer({ resolveWithObject: true });

            // Simple color quantization algorithm
            const colorMap = new Map();
            const pixelCount = info.width * info.height;

            // Sample every 4th pixel for performance
            for (let i = 0; i < data.length; i += 12) { // Skip pixels (4 channels * 3)
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Skip very dark or very light pixels (likely shadows/highlights)
                const brightness = (r + g + b) / 3;
                if (brightness < 20 || brightness > 240) continue;

                // Quantize colors to reduce similar variations
                const quantR = Math.round(r / 16) * 16;
                const quantG = Math.round(g / 16) * 16;
                const quantB = Math.round(b / 16) * 16;

                const hex = this.rgbToHex(quantR, quantG, quantB);
                colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
            }

            // Sort by frequency and get top colors
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, maxColors)
                .map(([hex, count]) => ({
                    hex,
                    percentage: Math.round((count / (pixelCount / 3)) * 100 * 100) / 100,
                    rgb: this.hexToRgb(hex),
                    category: this.categorizeColor(hex)
                }));

            return sortedColors;
        } catch (error) {
            console.error('Color extraction error:', error);
            throw new Error('Renk çıkarma işlemi başarısız');
        }
    }

    /**
     * Detect room context from image
     * @param {Object} processedImage - Processed image data
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Room context information
     */
    async detectRoomContext(processedImage, metadata) {
        // Basic room detection based on color patterns and metadata
        // In a real implementation, this could use ML models like YOLO or semantic segmentation

        const { dimensions } = processedImage;
        const aspectRatio = dimensions.width / dimensions.height;

        // Simple heuristic-based room detection
        let roomType = metadata.roomType || 'unknown';
        let confidence = 0.6;

        // If no room type provided, try to guess from image characteristics
        if (roomType === 'unknown') {
            const detectedRoom = await this.heuristicRoomDetection(processedImage);
            roomType = detectedRoom.type;
            confidence = detectedRoom.confidence;
        }

        return {
            roomType,
            confidence,
            aspectRatio,
            dimensions,
            features: {
                hasLargeColorBlocks: true, // Would be detected via image analysis
                hasTextures: true,
                lightingCondition: this.detectLightingCondition(processedImage),
                estimatedPhotoAngle: aspectRatio > 1.5 ? 'wide' : aspectRatio < 0.8 ? 'tall' : 'square'
            }
        };
    }

    /**
     * Simple heuristic room detection
     * @param {Object} processedImage - Processed image
     * @returns {Object} Room type prediction
     */
    async heuristicRoomDetection(processedImage) {
        // This is a simplified version - in production, you'd use computer vision models
        const dominantColors = await this.extractDominantColors(processedImage, 6);

        // Analyze color patterns to guess room type
        const blueColors = dominantColors.filter(c => c.category === 'blue').length;
        const brownColors = dominantColors.filter(c => c.category === 'brown').length;
        const whiteColors = dominantColors.filter(c => c.category === 'neutral').length;

        if (blueColors > 1 && whiteColors > 0) {
            return { type: 'bathroom', confidence: 0.7 };
        } else if (brownColors > 1) {
            return { type: 'living_room', confidence: 0.6 };
        } else if (whiteColors > 2) {
            return { type: 'bedroom', confidence: 0.5 };
        } else {
            return { type: 'living_room', confidence: 0.4 };
        }
    }

    /**
     * Detect lighting condition
     * @param {Object} processedImage - Processed image
     * @returns {String} Lighting condition
     */
    detectLightingCondition(processedImage) {
        // Simple brightness analysis
        // In reality, this would analyze histograms and color temperature
        return 'natural'; // 'natural', 'artificial', 'mixed', 'dim'
    }

    /**
     * Analyze color distribution patterns
     * @param {Array} dominantColors - Extracted dominant colors
     * @returns {Object} Color distribution analysis
     */
    async analyzeColorDistribution(dominantColors) {
        const totalPercentage = dominantColors.reduce((sum, color) => sum + color.percentage, 0);

        const distribution = {
            primary: dominantColors[0] || null,
            secondary: dominantColors[1] || null,
            accent: dominantColors.slice(2, 5),
            categories: this.groupColorsByCategory(dominantColors),
            balance: this.analyzeColorBalance(dominantColors),
            harmony: this.analyzeColorHarmony(dominantColors)
        };

        return distribution;
    }

    /**
     * Map extracted colors to room elements
     * @param {Array} dominantColors - Dominant colors
     * @param {Object} roomContext - Room context
     * @returns {Object} Mapped colors to room elements
     */
    async mapColorsToRoomElements(dominantColors, roomContext) {
        // Intelligent mapping based on color frequency and position
        const mapping = {
            wall: null,
            floor: null,
            furniture: null,
            accent: null,
            detected: []
        };

        if (dominantColors.length > 0) {
            // Primary color is usually wall or large surface
            mapping.wall = dominantColors[0];
            mapping.detected.push({ element: 'wall', color: dominantColors[0], confidence: 0.8 });
        }

        if (dominantColors.length > 1) {
            // Secondary color could be floor or furniture
            const secondColor = dominantColors[1];
            if (secondColor.category === 'brown' || secondColor.category === 'neutral') {
                mapping.floor = secondColor;
                mapping.detected.push({ element: 'floor', color: secondColor, confidence: 0.7 });
            } else {
                mapping.furniture = secondColor;
                mapping.detected.push({ element: 'furniture', color: secondColor, confidence: 0.6 });
            }
        }

        if (dominantColors.length > 2) {
            // Accent colors
            mapping.accent = dominantColors[2];
            mapping.detected.push({ element: 'accent', color: dominantColors[2], confidence: 0.5 });
        }

        return mapping;
    }

    /**
     * Generate photo-based color recommendations
     * @param {Object} colorMapping - Mapped colors
     * @param {Object} roomContext - Room context
     * @returns {Array} Color recommendations
     */
    async generatePhotoBasedRecommendations(colorMapping, roomContext) {
        const recommendations = [];

        // Recommendation 1: Harmony with existing colors
        if (colorMapping.wall) {
            recommendations.push({
                id: 'photo_harmony',
                name: 'Mevcut Renklerle Uyumlu',
                type: 'photo_based',
                confidence: 90,
                colors: {
                    wall: colorMapping.wall,
                    floor: colorMapping.floor || this.generateComplementaryColor(colorMapping.wall),
                    furniture: colorMapping.furniture || this.generateAnalogousColor(colorMapping.wall),
                    accent: colorMapping.accent || this.generateContrastColor(colorMapping.wall)
                },
                description: 'Fotoğrafınızdaki mevcut renklerle uyumlu bir palet.',
                reasoning: 'Mevcut renk paletiyle harmonik bütünlük sağlar.'
            });
        }

        // Recommendation 2: Enhanced version of current palette
        recommendations.push({
            id: 'photo_enhanced',
            name: 'Geliştirilmiş Palet',
            type: 'enhanced',
            confidence: 85,
            colors: {
                wall: this.enhanceColor(colorMapping.wall),
                floor: this.enhanceColor(colorMapping.floor),
                furniture: this.enhanceColor(colorMapping.furniture),
                accent: this.generateVibrантAccent(colorMapping.wall)
            },
            description: 'Mevcut renklerinizin geliştirilmiş versiyonu.',
            reasoning: 'Renklerin canlılığını artırarak daha dinamik bir görünüm.'
        });

        // Recommendation 3: Contrast improvement
        if (colorMapping.wall && colorMapping.furniture) {
            recommendations.push({
                id: 'photo_contrast',
                name: 'Kontrast İyileştirmesi',
                type: 'contrast',
                confidence: 80,
                colors: {
                    wall: colorMapping.wall,
                    floor: colorMapping.floor,
                    furniture: this.improveContrast(colorMapping.wall, colorMapping.furniture),
                    accent: this.generateHighContrastAccent(colorMapping.wall)
                },
                description: 'Daha iyi kontrast için optimize edilmiş palet.',
                reasoning: 'Görsel derinlik ve netlik için kontrast dengelendi.'
            });
        }

        return recommendations;
    }

    /**
     * Helper methods for color operations
     */
    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    categorizeColor(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return 'unknown';

        const { r, g, b } = rgb;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        // Grayscale
        if (diff < 30) return 'neutral';

        // Color categories
        if (r > g && r > b) return 'red';
        if (g > r && g > b) return 'green';
        if (b > r && b > g) return 'blue';
        if (r > b && g > b) return 'yellow';
        if (r > g && b > g) return 'purple';
        if (g > r && b > r) return 'cyan';

        // Browns and earth tones
        if (r > 100 && g > 50 && b < 80 && r > g && g > b) return 'brown';

        return 'mixed';
    }

    groupColorsByCategory(colors) {
        const categories = {};
        colors.forEach(color => {
            const category = color.category;
            if (!categories[category]) categories[category] = [];
            categories[category].push(color);
        });
        return categories;
    }

    analyzeColorBalance(colors) {
        // Analyze warm vs cool balance
        const warm = colors.filter(c => ['red', 'yellow', 'brown'].includes(c.category));
        const cool = colors.filter(c => ['blue', 'green', 'cyan'].includes(c.category));
        const neutral = colors.filter(c => c.category === 'neutral');

        return {
            warm: warm.length,
            cool: cool.length,
            neutral: neutral.length,
            dominance: warm.length > cool.length ? 'warm' : cool.length > warm.length ? 'cool' : 'balanced'
        };
    }

    analyzeColorHarmony(colors) {
        // Simple harmony analysis
        if (colors.length < 2) return { type: 'monochromatic', score: 0.8 };

        const categories = new Set(colors.map(c => c.category));

        if (categories.size === 1) return { type: 'monochromatic', score: 0.9 };
        if (categories.size === 2) return { type: 'analogous', score: 0.8 };
        if (categories.size >= 3) return { type: 'triadic', score: 0.7 };

        return { type: 'complex', score: 0.6 };
    }

    generateComplementaryColor(baseColor) {
        if (!baseColor) return { hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, category: 'neutral' };
        // Simple complementary color generation
        const rgb = baseColor.rgb;
        return {
            hex: this.rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b),
            rgb: { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b },
            category: 'generated'
        };
    }

    generateAnalogousColor(baseColor) {
        if (!baseColor) return { hex: '#A0A0A0', rgb: { r: 160, g: 160, b: 160 }, category: 'neutral' };
        // Simple analogous color generation
        const rgb = baseColor.rgb;
        return {
            hex: this.rgbToHex(
                Math.min(255, rgb.r + 30),
                Math.min(255, rgb.g + 20),
                Math.min(255, rgb.b + 10)
            ),
            rgb: {
                r: Math.min(255, rgb.r + 30),
                g: Math.min(255, rgb.g + 20),
                b: Math.min(255, rgb.b + 10)
            },
            category: 'generated'
        };
    }

    generateContrastColor(baseColor) {
        if (!baseColor) return { hex: '#404040', rgb: { r: 64, g: 64, b: 64 }, category: 'neutral' };
        // Generate high contrast color
        const rgb = baseColor.rgb;
        const brightness = (rgb.r + rgb.g + rgb.b) / 3;

        if (brightness > 128) {
            // Dark contrast for light colors
            return {
                hex: this.rgbToHex(50, 50, 80),
                rgb: { r: 50, g: 50, b: 80 },
                category: 'generated'
            };
        } else {
            // Light contrast for dark colors
            return {
                hex: this.rgbToHex(240, 240, 220),
                rgb: { r: 240, g: 240, b: 220 },
                category: 'generated'
            };
        }
    }

    enhanceColor(color) {
        if (!color) return null;

        const rgb = color.rgb;
        // Enhance saturation and adjust brightness slightly
        return {
            hex: this.rgbToHex(
                Math.min(255, Math.max(0, rgb.r + 10)),
                Math.min(255, Math.max(0, rgb.g + 5)),
                Math.min(255, Math.max(0, rgb.b + 5))
            ),
            rgb: {
                r: Math.min(255, Math.max(0, rgb.r + 10)),
                g: Math.min(255, Math.max(0, rgb.g + 5)),
                b: Math.min(255, Math.max(0, rgb.b + 5))
            },
            category: color.category
        };
    }

    generateVibrантAccent(baseColor) {
        if (!baseColor) return { hex: '#FF6B6B', rgb: { r: 255, g: 107, b: 107 }, category: 'red' };

        // Generate a vibrant accent color
        return {
            hex: '#FF6B6B',
            rgb: { r: 255, g: 107, b: 107 },
            category: 'red'
        };
    }

    improveContrast(color1, color2) {
        if (!color1 || !color2) return color2;

        // Improve contrast between two colors
        const rgb1 = color1.rgb;
        const rgb2 = color2.rgb;

        const brightness1 = (rgb1.r + rgb1.g + rgb1.b) / 3;
        const brightness2 = (rgb2.r + rgb2.g + rgb2.b) / 3;

        if (Math.abs(brightness1 - brightness2) < 50) {
            // Not enough contrast, adjust the second color
            if (brightness1 > 128) {
                // Make second color darker
                return {
                    hex: this.rgbToHex(
                        Math.max(0, rgb2.r - 60),
                        Math.max(0, rgb2.g - 60),
                        Math.max(0, rgb2.b - 60)
                    ),
                    rgb: {
                        r: Math.max(0, rgb2.r - 60),
                        g: Math.max(0, rgb2.g - 60),
                        b: Math.max(0, rgb2.b - 60)
                    },
                    category: color2.category
                };
            } else {
                // Make second color lighter
                return {
                    hex: this.rgbToHex(
                        Math.min(255, rgb2.r + 60),
                        Math.min(255, rgb2.g + 60),
                        Math.min(255, rgb2.b + 60)
                    ),
                    rgb: {
                        r: Math.min(255, rgb2.r + 60),
                        g: Math.min(255, rgb2.g + 60),
                        b: Math.min(255, rgb2.b + 60)
                    },
                    category: color2.category
                };
            }
        }

        return color2;
    }

    generateHighContrastAccent(baseColor) {
        if (!baseColor) return { hex: '#FF4500', rgb: { r: 255, g: 69, b: 0 }, category: 'red' };

        const rgb = baseColor.rgb;
        const brightness = (rgb.r + rgb.g + rgb.b) / 3;

        if (brightness > 128) {
            return { hex: '#2E4057', rgb: { r: 46, g: 64, b: 87 }, category: 'blue' };
        } else {
            return { hex: '#FF7F50', rgb: { r: 255, g: 127, b: 80 }, category: 'red' };
        }
    }

    calculateConfidence(dominantColors, roomContext) {
        let confidence = 0.5;

        if (dominantColors.length >= 3) confidence += 0.2;
        if (roomContext.confidence > 0.7) confidence += 0.2;
        if (dominantColors[0]?.percentage > 15) confidence += 0.1;

        return Math.min(0.95, confidence);
    }

    /**
     * Validate uploaded file
     * @param {Object} file - Uploaded file
     * @returns {Object} Validation result
     */
    validateFile(file) {
        const errors = [];

        if (!file) {
            errors.push('Dosya yüklenmedi');
            return { valid: false, errors };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push(`Dosya boyutu çok büyük (max ${this.maxFileSize / 1024 / 1024}MB)`);
        }

        // Check file type
        const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
        if (!this.allowedFormats.includes(fileExtension)) {
            errors.push(`Desteklenmeyen format (${this.allowedFormats.join(', ')} kabul edilir)`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Clear analysis cache
     */
    clearCache() {
        this.analysisCache.clear();
    }

    /**
     * Get cache status
     */
    getCacheStatus() {
        return {
            size: this.analysisCache.size,
            maxSize: 100 // Could be configurable
        };
    }
}

module.exports = PhotoAnalysisService;