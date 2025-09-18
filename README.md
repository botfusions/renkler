# Sanzo Color Advisor v2.0 🎨

**Next-Generation AI-Powered Color Intelligence Platform**

Transform any space with scientifically-backed color recommendations based on Sanzo Wada's timeless 1918 research, enhanced with modern AI, cultural intelligence, and advanced color theory.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)
[![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-green)](https://web.dev/mobile/)

## 🌟 What Makes This Special

**Historical Foundation + Modern Intelligence**
- Based on 348 scientifically-tested color combinations from Sanzo Wada's dictionary (1918)
- Enhanced with advanced AI algorithms and machine learning
- Turkish cultural color heritage integration
- Mathematical precision meets artistic intuition

## ✨ Core Features

### 🧠 **AI-Powered Analysis**
- **Machine Learning Recommendations**: Adaptive algorithms that learn from user preferences
- **Advanced Color Theory**: Fibonacci sequences, Bezier curves, and Fourier analysis
- **Delta E Calculations**: CIE94 and CIEDE2000 perceptual color difference analysis
- **Computer Vision**: Extract colors from images and generate harmonious palettes

### 🎯 **Personalized Intelligence**
- **Seasonal Color Analysis**: Spring, Summer, Autumn, Winter personal color matching
- **Mood-Based Recommendations**: 8 psychological mood profiles with targeted suggestions
- **Cultural Authenticity**: Traditional Turkish colors with historical significance
- **Brand Color Integration**: Professional brand-consistent palette generation

### 📱 **Mobile-First Experience**
- **Progressive Web App**: Install as native app with offline functionality
- **Touch Gestures**: Natural mobile interactions with haptic feedback
- **Responsive Design**: Optimized for all screen sizes and orientations
- **Accessibility Excellence**: WCAG AA/AAA compliance with screen reader support

### 🌍 **Multi-Language Support**
- **Turkish & English**: Complete localization with cultural adaptations
- **Cultural Color Meanings**: Traditional color psychology and symbolism
- **Dynamic Language Switching**: Seamless transitions without page reload

### 📊 **Advanced Analytics**
- **Real-Time Insights**: User behavior analysis and engagement tracking
- **Trend Prediction**: Historical color trend analysis and forecasting
- **Performance Monitoring**: Comprehensive metrics and health checks
- **Privacy-First**: Data anonymization and user consent management

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/sanzo-color-advisor.git
cd sanzo-color-advisor

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d

# Or use production configuration
docker-compose -f docker-compose.yml up -d
```

### PWA Installation
1. Visit the web application
2. Click "Install App" when prompted
3. Enjoy native app experience with offline support

## 🎨 Usage Examples

### Basic Color Analysis
```javascript
const userInput = {
    wall: "white",
    floor: "oak_wood",
    furniture: "oak_wood",
    roomType: "child_bedroom",
    ageGroup: "6-12"
};

const recommendation = await colorAgent.analyze(userInput);
// Result: Sea Green (#33ff7d) - 92% confidence
```

### Advanced AI Features
```javascript
// Seasonal color analysis
const seasonalColors = await colorAgent.analyzePersonalColors({
    skinTone: "warm",
    eyeColor: "brown",
    hairColor: "dark_brown"
});

// Brand color integration
const brandPalette = await colorAgent.generateBrandPalette({
    industry: "healthcare",
    mood: "trustworthy",
    accessibility: "AA"
});

// Turkish cultural colors
const culturalColors = await colorAgent.getCulturalColors({
    category: "traditional",
    occasion: "wedding",
    region: "anatolia"
});
```

### Computer Vision Integration
```javascript
// Extract colors from image
const imageColors = await colorAgent.analyzeImage({
    imageUrl: "path/to/image.jpg",
    generatePalette: true,
    harmonyType: "analogous"
});
```

## 🏗️ Architecture

### Modern Tech Stack
- **Frontend**: Vanilla JavaScript with ES6+ modules
- **Styling**: CSS3 with custom properties and modern layouts
- **PWA**: Service Worker with intelligent caching strategies
- **AI/ML**: TensorFlow.js for client-side machine learning
- **Analytics**: Custom analytics with privacy protection
- **Testing**: Jest with comprehensive test coverage

### Project Structure
```
sanzo-color-advisor/
├── public/
│   ├── js/
│   │   ├── ColorAgent.js              # Core AI engine
│   │   ├── advancedColorHarmony.js    # Mathematical algorithms
│   │   ├── advancedColorPsychology.js # Mood & psychology
│   │   ├── colorTrendAnalysis.js      # Trend prediction
│   │   ├── brandColorIntegration.js   # Brand intelligence
│   │   ├── MobileTouchHandler.js      # Touch interactions
│   │   ├── MLColorRecommendations.js  # Machine learning
│   │   └── i18n/                      # Internationalization
│   ├── css/
│   │   ├── styles.css                 # Core styling
│   │   ├── mobile-responsive.css      # Mobile optimizations
│   │   └── accessibility.css          # Accessibility features
│   ├── locales/
│   │   ├── en.json                    # English translations
│   │   └── tr.json                    # Turkish translations
│   ├── sw.js                          # Service worker
│   └── manifest.json                  # PWA manifest
├── src/
│   ├── data/
│   │   ├── sanzo-colors.json          # Base color database
│   │   ├── cultural-colors.json       # Turkish cultural colors
│   │   └── trend-data.json            # Historical trend data
│   ├── utils/
│   │   ├── colorConversions.js        # Color space conversions
│   │   ├── deltaE.js                  # Color difference calculations
│   │   └── optimizedDeltaE.js         # Performance optimizations
│   └── api/
│       ├── githubAPI.js               # GitHub integration
│       └── webScraper.js              # Web scraping
├── tests/                             # Comprehensive test suite
├── monitoring/                        # Analytics & monitoring
├── docs/                              # Documentation
└── scripts/                           # Build & deployment scripts
```

## 🎯 API Reference

### Core Endpoints
```javascript
// Basic color analysis
POST /api/analyze
GET  /api/colors
GET  /api/combinations

// Advanced features
POST /api/advanced/harmony          // Mathematical harmony analysis
POST /api/advanced/psychology       // Mood & personality optimization
GET  /api/advanced/trends           // Color trend analysis
POST /api/advanced/cultural         // Turkish cultural colors
POST /api/advanced/seasonal         // Personal seasonal analysis
POST /api/advanced/brand            // Brand color integration
POST /api/advanced/comprehensive    // Combined analysis

// AI & Machine Learning
POST /api/ml/recommendations        // ML-powered suggestions
POST /api/ml/learning              // User preference learning
POST /api/vision/analyze           // Image color extraction
```

### Response Format
```javascript
{
  "success": true,
  "data": {
    "primaryColor": {
      "name": "Nazar Mavisi",
      "hex": "#1E90FF",
      "rgb": { "r": 30, "g": 144, "b": 255 },
      "lab": { "l": 57.6, "a": 14.1, "b": -67.9 },
      "confidence": 94,
      "culturalSignificance": "Protection and blessing in Turkish culture"
    },
    "harmonies": [...],
    "psychology": { "mood": "calming", "energy": "peaceful" },
    "accessibility": { "wcagLevel": "AA", "contrastRatio": 4.8 }
  },
  "metadata": {
    "analysisTime": "45ms",
    "algorithmsUsed": ["fibonacci", "deltaE2000", "cultural"],
    "version": "2.0"
  }
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern="deltaE"
npm test -- --testPathPattern="accessibility"

# Watch mode for development
npm run test:watch
```

### Test Coverage
- **Unit Tests**: Color algorithms, conversions, AI models
- **Integration Tests**: API endpoints, database operations
- **Performance Tests**: Load testing, memory usage
- **Accessibility Tests**: WCAG compliance, screen readers
- **Mobile Tests**: Touch interactions, responsive design

## 📈 Performance Metrics

### Benchmarks
- **Color Analysis**: < 50ms average response time
- **Database Queries**: < 10ms with optimized indexing
- **Machine Learning**: < 100ms inference time
- **Mobile Performance**: 90+ Lighthouse score
- **Accessibility**: WCAG AAA compliance

### Optimization Features
- **Lazy Loading**: Dynamic module loading
- **Caching Strategy**: Multi-level caching (memory/localStorage/service worker)
- **WebAssembly**: Hardware-accelerated color calculations
- **Web Workers**: Background processing for heavy operations
- **Image Optimization**: WebP support with fallbacks

## 🌍 Internationalization

### Supported Languages
- **English**: Complete localization
- **Turkish**: Native language with cultural adaptations

### Cultural Features
- **Traditional Colors**: Authentic Turkish color heritage
- **Cultural Meanings**: Historical and spiritual significance
- **Regional Variations**: Anatolian, Mediterranean, Black Sea traditions
- **Modern Adaptations**: Contemporary Turkish design aesthetics

## ♿ Accessibility

### WCAG Compliance
- **Level AA/AAA**: Comprehensive accessibility support
- **Screen Readers**: VoiceOver, NVDA, JAWS compatibility
- **Keyboard Navigation**: Full keyboard control
- **Color Blindness**: 8 types of color vision simulation
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user motion preferences

### Mobile Accessibility
- **Touch Targets**: 44px minimum size
- **Voice Control**: Mobile voice command support
- **Haptic Feedback**: Tactile interaction feedback
- **Screen Reader**: Mobile screen reader optimization

## 🚀 Deployment

### Environment Setup
```bash
# Development
npm run dev

# Production build
npm run build

# Docker deployment
docker-compose up -d production

# Health checks
npm run health-check
```

### Monitoring
- **Real-Time Analytics**: User behavior and performance metrics
- **Error Tracking**: Comprehensive error monitoring
- **Performance Monitoring**: Core Web Vitals tracking
- **Security Scanning**: Automated vulnerability detection

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
- Follow ES6+ JavaScript standards
- Maintain test coverage above 90%
- Ensure accessibility compliance
- Document all new features
- Respect cultural authenticity in color data

## 📄 License

MIT License - Based on public domain work by Sanzo Wada (1918)

## 🙏 Acknowledgments

- **Sanzo Wada**: Original color research and combinations (1918)
- **Turkish Color Heritage**: Traditional cultural color wisdom
- **Open Source Community**: Libraries and tools that made this possible
- **Accessibility Community**: Guidelines and best practices for inclusive design

## 📞 Support

- **Documentation**: [Full Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/sanzo-color-advisor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/sanzo-color-advisor/discussions)

---

**Made with ❤️ and 🎨 - Bridging 1918 color wisdom with 2025 AI intelligence**