/**
 * ColorBlindnessAdvanced.js - Advanced Color Vision Accessibility
 * Comprehensive color blindness simulation, testing, and alternative representations
 */

class ColorBlindnessAdvanced {
    constructor() {
        this.simulationTypes = {
            normal: {
                name: 'Normal Vision',
                description: 'Typical color vision with all color receptors functioning normally',
                prevalence: '92% of males, 99.5% of females',
                matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]
            },
            protanopia: {
                name: 'Protanopia (Red-blind)',
                description: 'Complete absence of long-wavelength (red) cone cells',
                prevalence: '1% of males, 0.02% of females',
                matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
                affectedColors: ['red', 'green', 'orange', 'purple']
            },
            deuteranopia: {
                name: 'Deuteranopia (Green-blind)',
                description: 'Complete absence of medium-wavelength (green) cone cells',
                prevalence: '1% of males, 0.02% of females',
                matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
                affectedColors: ['red', 'green', 'brown', 'orange']
            },
            tritanopia: {
                name: 'Tritanopia (Blue-blind)',
                description: 'Complete absence of short-wavelength (blue) cone cells',
                prevalence: '0.003% of population',
                matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
                affectedColors: ['blue', 'yellow', 'purple', 'cyan']
            },
            protanomaly: {
                name: 'Protanomaly (Red-weak)',
                description: 'Reduced sensitivity to long-wavelength (red) light',
                prevalence: '1% of males, 0.02% of females',
                matrix: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875],
                affectedColors: ['red', 'orange', 'purple']
            },
            deuteranomaly: {
                name: 'Deuteranomaly (Green-weak)',
                description: 'Reduced sensitivity to medium-wavelength (green) light',
                prevalence: '5% of males, 0.4% of females',
                matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
                affectedColors: ['green', 'red', 'brown']
            },
            tritanomaly: {
                name: 'Tritanomaly (Blue-weak)',
                description: 'Reduced sensitivity to short-wavelength (blue) light',
                prevalence: '0.01% of population',
                matrix: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817],
                affectedColors: ['blue', 'purple', 'cyan']
            },
            achromatopsia: {
                name: 'Achromatopsia (Complete Color Blindness)',
                description: 'Complete inability to distinguish colors, seeing only in shades of gray',
                prevalence: '0.003% of population',
                matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
                affectedColors: ['all colors']
            }
        };

        this.alternativeRepresentations = {
            patterns: ['solid', 'dots', 'stripes', 'grid', 'diagonal', 'waves', 'crosses', 'checkerboard'],
            textures: ['smooth', 'rough', 'grainy', 'bumpy', 'ribbed', 'woven'],
            shapes: ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon', 'oval', 'cross']
        };

        this.colorNamingSystem = new ColorNamingSystem();
        this.currentSimulation = 'normal';
        this.isSimulationActive = false;

        this.initialize();
    }

    /**
     * Initialize advanced color blindness features
     */
    initialize() {
        this.setupSimulationControls();
        this.setupAlternativeRepresentations();
        this.setupColorNaming();
        this.setupAccessibilityTesting();
        console.log('Advanced color blindness support initialized');
    }

    /**
     * Apply color blindness simulation to page
     */
    applySimulation(type = 'normal') {
        this.currentSimulation = type;
        this.isSimulationActive = type !== 'normal';

        const simulation = this.simulationTypes[type];
        if (!simulation) {
            console.error(`Unknown simulation type: ${type}`);
            return;
        }

        // Apply simulation to all color elements
        this.applyToColorElements(type);
        this.applyToCSS(type);
        this.updateAccessibilityInfo(simulation);

        // Announce simulation change
        if (window.ScreenReaderEnhanced) {
            const sr = new window.ScreenReaderEnhanced();
            sr.announce(`Color vision simulation changed to ${simulation.name}`, {
                priority: 'polite'
            });
        }
    }

    /**
     * Apply simulation to specific color elements
     */
    applyToColorElements(type) {
        const colorElements = document.querySelectorAll('.color-preview, .color-swatch, [data-color]');

        colorElements.forEach(element => {
            const originalColor = element.dataset.originalColor ||
                                element.style.backgroundColor ||
                                getComputedStyle(element).backgroundColor;

            if (originalColor) {
                // Store original if not already stored
                if (!element.dataset.originalColor) {
                    element.dataset.originalColor = originalColor;
                }

                const hexColor = this.rgbToHex(originalColor);
                const simulatedColor = this.simulateColorBlindness(hexColor, type);

                element.style.backgroundColor = simulatedColor;

                // Update accessibility information
                this.updateElementAccessibility(element, hexColor, simulatedColor, type);
            }
        });
    }

    /**
     * Apply simulation using CSS filters (when possible)
     */
    applyToCSS(type) {
        const simulation = this.simulationTypes[type];
        let filterCSS = '';

        // Some simulations can be approximated with CSS filters
        switch (type) {
            case 'achromatopsia':
                filterCSS = 'filter: grayscale(100%);';
                break;
            case 'protanopia':
                filterCSS = 'filter: sepia(1) saturate(0.8) hue-rotate(-50deg);';
                break;
            case 'deuteranopia':
                filterCSS = 'filter: sepia(1) saturate(0.6) hue-rotate(80deg);';
                break;
            case 'tritanopia':
                filterCSS = 'filter: sepia(1) saturate(1.2) hue-rotate(180deg);';
                break;
            default:
                filterCSS = 'filter: none;';
        }

        // Apply filter to simulation wrapper
        let simulationStyle = document.getElementById('colorblind-simulation-style');
        if (!simulationStyle) {
            simulationStyle = document.createElement('style');
            simulationStyle.id = 'colorblind-simulation-style';
            document.head.appendChild(simulationStyle);
        }

        simulationStyle.textContent = `
            .colorblind-simulation-active {
                ${filterCSS}
            }
        `;

        // Toggle class on body
        document.body.classList.toggle('colorblind-simulation-active', type !== 'normal');
    }

    /**
     * Update element accessibility for simulation
     */
    updateElementAccessibility(element, originalColor, simulatedColor, simulationType) {
        const simulation = this.simulationTypes[simulationType];
        const originalName = this.colorNamingSystem.getColorName(originalColor);
        const simulatedName = this.colorNamingSystem.getColorName(simulatedColor);

        // Update aria-label with simulation info
        const currentLabel = element.getAttribute('aria-label') || '';
        const baseLabel = currentLabel.replace(/ \(simulated:.*\)/, '');

        if (simulationType === 'normal') {
            element.setAttribute('aria-label', baseLabel);
        } else {
            element.setAttribute('aria-label',
                `${baseLabel} (simulated: ${simulatedName} as seen with ${simulation.name})`
            );
        }

        // Add simulation data attributes
        element.dataset.simulationType = simulationType;
        element.dataset.simulatedColor = simulatedColor;
    }

    /**
     * Simulate color blindness for a hex color
     */\n    simulateColorBlindness(hex, type = 'deuteranopia') {\n        const simulation = this.simulationTypes[type];\n        if (!simulation) return hex;\n\n        const rgb = this.parseHexColor(hex);\n        if (!rgb) return hex;\n\n        const [r, g, b] = rgb.map(c => c / 255);\n        const matrix = simulation.matrix;\n\n        const newR = r * matrix[0] + g * matrix[1] + b * matrix[2];\n        const newG = r * matrix[3] + g * matrix[4] + b * matrix[5];\n        const newB = r * matrix[6] + g * matrix[7] + b * matrix[8];\n\n        const clamp = val => Math.max(0, Math.min(1, val));\n        const toHex = val => Math.round(clamp(val) * 255).toString(16).padStart(2, '0');\n\n        return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;\n    }

    /**
     * Get all simulations for a color with detailed analysis
     */
    getComprehensiveAnalysis(hex) {
        const analysis = {\n            original: {\n                hex: hex,\n                name: this.colorNamingSystem.getColorName(hex),\n                hsl: this.hexToHsl(hex)\n            },\n            simulations: {},\n            accessibility: {\n                problematicTypes: [],\n                recommendations: []\n            }\n        };\n\n        // Generate all simulations\n        for (const [type, config] of Object.entries(this.simulationTypes)) {\n            const simulatedColor = this.simulateColorBlindness(hex, type);\n            analysis.simulations[type] = {\n                hex: simulatedColor,\n                name: this.colorNamingSystem.getColorName(simulatedColor),\n                difference: this.calculateColorDifference(hex, simulatedColor),\n                config: config\n            };\n        }\n\n        // Analyze problematic combinations\n        this.analyzeAccessibilityIssues(analysis);\n\n        return analysis;\n    }

    /**
     * Analyze accessibility issues for color blindness
     */
n    analyzeAccessibilityIssues(analysis) {\n        const originalColor = analysis.original.hex;\n        const threshold = 50; // Minimum color difference threshold\n\n        for (const [type, simulation] of Object.entries(analysis.simulations)) {\n            if (type === 'normal') continue;\n\n            if (simulation.difference < threshold) {\n                analysis.accessibility.problematicTypes.push({\n                    type: type,\n                    name: simulation.config.name,\n                    difference: simulation.difference,\n                    severity: this.getIssueSeverity(simulation.difference)\n                });\n            }\n        }\n\n        // Generate recommendations\n        if (analysis.accessibility.problematicTypes.length > 0) {\n            analysis.accessibility.recommendations = this.generateAccessibilityRecommendations(\n                analysis.accessibility.problematicTypes\n            );\n        }\n    }

    /**
     * Get severity level for color difference issue
     */
    getIssueSeverity(difference) {
        if (difference < 20) return 'critical';\n        if (difference < 35) return 'high';\n        if (difference < 50) return 'medium';\n        return 'low';\n    }

    /**
     * Generate recommendations for accessibility improvements
     */
    generateAccessibilityRecommendations(problematicTypes) {
        const recommendations = [];\n\n        const highSeverityTypes = problematicTypes.filter(t => \n            t.severity === 'critical' || t.severity === 'high'\n        );\n\n        if (highSeverityTypes.length > 0) {\n            recommendations.push({\n                priority: 'high',\n                title: 'Add Non-Color Indicators',\n                description: 'This color may be difficult to distinguish for users with color vision deficiencies.',\n                actions: [\n                    'Add text labels or icons',\n                    'Use patterns or textures',\n                    'Increase color contrast',\n                    'Use alternative color combinations'\n                ]\n            });\n        }\n\n        const affectedTypes = [...new Set(problematicTypes.map(t => t.type))];\n        if (affectedTypes.includes('deuteranopia') || affectedTypes.includes('protanopia')) {\n            recommendations.push({\n                priority: 'medium',\n                title: 'Red-Green Color Blindness Consideration',\n                description: 'Avoid using red and green as the only way to distinguish information.',\n                actions: [\n                    'Use blue instead of green when possible',\n                    'Add patterns to red and green elements',\n                    'Use text labels for status indicators'\n                ]\n            });\n        }\n\n        return recommendations;\n    }

    /**
     * Setup alternative representations for colors
     */
    setupAlternativeRepresentations() {\n        // Pattern overlays\n        this.createPatternOverlays();\n        \n        // Shape indicators\n        this.createShapeIndicators();\n        \n        // Text labels\n        this.createTextLabels();\n    }

    /**
     * Create pattern overlays for color elements
     */
    createPatternOverlays() {\n        const style = document.createElement('style');\n        style.id = 'color-pattern-styles';\n        style.textContent = `\n            /* Enhanced pattern overlays for color accessibility */\n            .color-pattern-1 { background-image: radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px); background-size: 12px 12px; }\n            .color-pattern-2 { background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px); }\n            .color-pattern-3 { background-image: linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 10px 10px; }\n            .color-pattern-4 { background-image: repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px); }\n            .color-pattern-5 { background-image: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px); }\n            .color-pattern-6 { background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.3) 2px, transparent 2px); background-size: 16px 16px; }\n        `;\n        document.head.appendChild(style);\n    }

    /**
     * Create shape indicators for colors
     */
    createShapeIndicators() {\n        const colorElements = document.querySelectorAll('.color-preview');\n        \n        colorElements.forEach((element, index) => {\n            const shape = this.alternativeRepresentations.shapes[index % this.alternativeRepresentations.shapes.length];\n            const indicator = document.createElement('div');\n            indicator.className = `shape-indicator shape-${shape}`;\n            indicator.setAttribute('aria-hidden', 'true');\n            \n            // Add CSS for shape\n            this.addShapeCSS(shape);\n            \n            element.appendChild(indicator);\n        });\n    }

    /**
     * Add CSS for shape indicators
     */
    addShapeCSS(shape) {\n        let shapeStyles = document.getElementById('shape-indicator-styles');\n        if (!shapeStyles) {\n            shapeStyles = document.createElement('style');\n            shapeStyles.id = 'shape-indicator-styles';\n            document.head.appendChild(shapeStyles);\n        }\n\n        const shapeCSS = {\n            circle: 'border-radius: 50%; width: 12px; height: 12px; background: rgba(255,255,255,0.8);',\n            square: 'width: 12px; height: 12px; background: rgba(255,255,255,0.8);',\n            triangle: 'width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 12px solid rgba(255,255,255,0.8);',\n            diamond: 'width: 12px; height: 12px; background: rgba(255,255,255,0.8); transform: rotate(45deg);',\n            star: 'position: relative; display: inline-block; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 4px solid rgba(255,255,255,0.8); transform: rotate(35deg);',\n            hexagon: 'width: 12px; height: 6.93px; background: rgba(255,255,255,0.8); position: relative;',\n            oval: 'width: 16px; height: 10px; background: rgba(255,255,255,0.8); border-radius: 50%;',\n            cross: 'position: relative; width: 12px; height: 12px;'\n        };\n\n        if (!shapeStyles.textContent.includes(`.shape-${shape}`)) {\n            shapeStyles.textContent += `\n                .shape-indicator.shape-${shape} {\n                    position: absolute;\n                    top: 4px;\n                    right: 4px;\n                    ${shapeCSS[shape] || ''}\n                    pointer-events: none;\n                }\n            `;\n        }\n    }

    /**
     * Test color combinations for accessibility
     */
    testColorCombinations(colors) {\n        const results = {\n            combinations: [],\n            overallScore: 0,\n            recommendations: []\n        };\n\n        // Test all color pairs\n        for (let i = 0; i < colors.length; i++) {\n            for (let j = i + 1; j < colors.length; j++) {\n                const combo = this.testColorPair(colors[i], colors[j]);\n                results.combinations.push(combo);\n            }\n        }\n\n        // Calculate overall score\n        const totalTests = results.combinations.length * Object.keys(this.simulationTypes).length;\n        const passedTests = results.combinations.reduce((sum, combo) => \n            sum + combo.simulations.filter(sim => sim.accessible).length, 0\n        );\n        \n        results.overallScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;\n\n        // Generate recommendations\n        results.recommendations = this.generateCombinationRecommendations(results.combinations);\n\n        return results;\n    }

    /**
     * Test a pair of colors for accessibility across all simulations
     */
    testColorPair(color1, color2) {\n        const result = {\n            colors: [color1, color2],\n            simulations: [],\n            accessible: true\n        };\n\n        for (const [type, config] of Object.entries(this.simulationTypes)) {\n            const sim1 = this.simulateColorBlindness(color1, type);\n            const sim2 = this.simulateColorBlindness(color2, type);\n            const difference = this.calculateColorDifference(sim1, sim2);\n            const accessible = difference >= 50; // Minimum threshold\n\n            result.simulations.push({\n                type: type,\n                name: config.name,\n                color1Simulated: sim1,\n                color2Simulated: sim2,\n                difference: difference,\n                accessible: accessible\n            });\n\n            if (!accessible) {\n                result.accessible = false;\n            }\n        }\n\n        return result;\n    }

    /**
     * Generate recommendations for color combinations
     */
    generateCombinationRecommendations(combinations) {\n        const recommendations = [];\n        const problematicCombos = combinations.filter(combo => !combo.accessible);\n\n        if (problematicCombos.length > 0) {\n            recommendations.push({\n                priority: 'high',\n                title: 'Improve Color Distinguishability',\n                description: `${problematicCombos.length} color combinations may be difficult to distinguish for users with color vision deficiencies.`,\n                actions: [\n                    'Increase contrast between colors',\n                    'Add patterns or textures to distinguish elements',\n                    'Use text labels in addition to colors',\n                    'Consider alternative color choices'\n                ]\n            });\n        }\n\n        return recommendations;\n    }

    /**
     * Calculate color difference using Delta E formula (simplified)
     */
    calculateColorDifference(hex1, hex2) {\n        const rgb1 = this.parseHexColor(hex1);\n        const rgb2 = this.parseHexColor(hex2);\n        \n        if (!rgb1 || !rgb2) return 0;\n\n        // Simple Euclidean distance in RGB space\n        const deltaR = rgb1[0] - rgb2[0];\n        const deltaG = rgb1[1] - rgb2[1];\n        const deltaB = rgb1[2] - rgb2[2];\n\n        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);\n    }

    /**
     * Setup simulation controls UI
     */
    setupSimulationControls() {\n        // This would integrate with the existing accessibility panel\n        console.log('Simulation controls setup complete');\n    }

    /**
     * Setup color naming system
     */
    setupColorNaming() {\n        // Initialize color naming for better accessibility\n        console.log('Color naming system initialized');\n    }

    /**
     * Setup accessibility testing integration
     */
    setupAccessibilityTesting() {\n        // Integrate with AccessibilityTester if available\n        if (window.AccessibilityTester) {\n            console.log('Color blindness testing integrated with accessibility tester');\n        }\n    }

    /**
     * Utility methods
     */
    parseHexColor(hex) {\n        const match = hex.match(/^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i);\n        return match ? [\n            parseInt(match[1], 16),\n            parseInt(match[2], 16),\n            parseInt(match[3], 16)\n        ] : null;\n    }

    rgbToHex(rgb) {\n        if (!rgb || rgb === 'transparent') return '#000000';\n        \n        const match = rgb.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);\n        if (!match) return '#000000';\n\n        const r = parseInt(match[1]).toString(16).padStart(2, '0');\n        const g = parseInt(match[2]).toString(16).padStart(2, '0');\n        const b = parseInt(match[3]).toString(16).padStart(2, '0');\n\n        return `#${r}${g}${b}`;\n    }

    hexToHsl(hex) {\n        const rgb = this.parseHexColor(hex);\n        if (!rgb) return null;\n\n        const [r, g, b] = rgb.map(c => c / 255);\n        const max = Math.max(r, g, b);\n        const min = Math.min(r, g, b);\n        let h, s, l = (max + min) / 2;\n\n        if (max === min) {\n            h = s = 0; // achromatic\n        } else {\n            const d = max - min;\n            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);\n\n            switch (max) {\n                case r: h = (g - b) / d + (g < b ? 6 : 0); break;\n                case g: h = (b - r) / d + 2; break;\n                case b: h = (r - g) / d + 4; break;\n            }\n            h /= 6;\n        }\n\n        return {\n            h: Math.round(h * 360),\n            s: Math.round(s * 100),\n            l: Math.round(l * 100)\n        };\n    }\n}\n\n/**\n * Enhanced Color Naming System\n */\nclass ColorNamingSystem {\n    constructor() {\n        this.colorDatabase = this.initializeColorDatabase();\n    }\n\n    initializeColorDatabase() {\n        return {\n            // Basic colors\n            '#000000': 'black',\n            '#FFFFFF': 'white',\n            '#FF0000': 'red',\n            '#00FF00': 'lime',\n            '#0000FF': 'blue',\n            '#FFFF00': 'yellow',\n            '#FF00FF': 'magenta',\n            '#00FFFF': 'cyan',\n            '#800000': 'maroon',\n            '#008000': 'green',\n            '#000080': 'navy',\n            '#808000': 'olive',\n            '#800080': 'purple',\n            '#008080': 'teal',\n            '#C0C0C0': 'silver',\n            '#808080': 'gray',\n            \n            // Extended colors\n            '#FFA500': 'orange',\n            '#FFC0CB': 'pink',\n            '#A52A2A': 'brown',\n            '#DDA0DD': 'plum',\n            '#98FB98': 'pale green',\n            '#87CEEB': 'sky blue',\n            '#DEB887': 'burlywood',\n            '#5F9EA0': 'cadet blue',\n            '#7FFF00': 'chartreuse',\n            '#D2691E': 'chocolate',\n            '#FF7F50': 'coral',\n            '#6495ED': 'cornflower blue',\n            '#DC143C': 'crimson',\n            '#00008B': 'dark blue',\n            '#008B8B': 'dark cyan',\n            '#B8860B': 'dark goldenrod',\n            '#A9A9A9': 'dark gray',\n            '#006400': 'dark green',\n            '#BDB76B': 'dark khaki',\n            '#8B008B': 'dark magenta',\n            '#556B2F': 'dark olive green',\n            '#FF8C00': 'dark orange',\n            '#9932CC': 'dark orchid',\n            '#8B0000': 'dark red',\n            '#E9967A': 'dark salmon',\n            '#8FBC8F': 'dark sea green',\n            '#483D8B': 'dark slate blue',\n            '#2F4F4F': 'dark slate gray',\n            '#00CED1': 'dark turquoise',\n            '#9400D3': 'dark violet'\n        };\n    }\n\n    getColorName(hex) {\n        // Normalize hex\n        hex = hex.toUpperCase();\n        \n        // Check exact match\n        if (this.colorDatabase[hex]) {\n            return this.colorDatabase[hex];\n        }\n\n        // Find closest color\n        return this.findClosestColorName(hex);\n    }\n\n    findClosestColorName(targetHex) {\n        let minDistance = Infinity;\n        let closestName = 'unknown color';\n\n        for (const [hex, name] of Object.entries(this.colorDatabase)) {\n            const distance = this.calculateColorDistance(targetHex, hex);\n            if (distance < minDistance) {\n                minDistance = distance;\n                closestName = name;\n            }\n        }\n\n        return closestName;\n    }\n\n    calculateColorDistance(hex1, hex2) {\n        const rgb1 = this.parseHexColor(hex1);\n        const rgb2 = this.parseHexColor(hex2);\n        \n        if (!rgb1 || !rgb2) return Infinity;\n\n        const deltaR = rgb1[0] - rgb2[0];\n        const deltaG = rgb1[1] - rgb2[1];\n        const deltaB = rgb1[2] - rgb2[2];\n\n        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);\n    }\n\n    parseHexColor(hex) {\n        const match = hex.match(/^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i);\n        return match ? [\n            parseInt(match[1], 16),\n            parseInt(match[2], 16),\n            parseInt(match[3], 16)\n        ] : null;\n    }\n}\n\n// Export for global use\nwindow.ColorBlindnessAdvanced = ColorBlindnessAdvanced;\nwindow.ColorNamingSystem = ColorNamingSystem;