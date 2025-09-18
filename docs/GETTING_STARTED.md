# Getting Started with Sanzo Color Advisor

## Welcome to Sanzo Color Advisor! 🎨

This guide will help you get up and running with the Sanzo Color Advisor in just a few minutes. Whether you're a designer, developer, or homeowner looking for the perfect color palette, this guide will walk you through everything you need to know.

## Table of Contents

1. [What is Sanzo Color Advisor?](#what-is-sanzo-color-advisor)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Your First Color Analysis](#your-first-color-analysis)
6. [Understanding the Results](#understanding-the-results)
7. [Next Steps](#next-steps)
8. [Common Issues and Solutions](#common-issues-and-solutions)

## What is Sanzo Color Advisor?

The Sanzo Color Advisor is an AI-powered color recommendation system based on Sanzo Wada's legendary "Dictionary of Color Combinations" from 1918. It combines:

- **Historical Wisdom**: 348 time-tested color combinations from Sanzo Wada's research
- **Modern Technology**: Advanced color science algorithms (Delta E 2000) for precise matching
- **Smart Recommendations**: Room-specific and age-appropriate color suggestions
- **Performance**: Optimized to handle 300,000+ color calculations per second
- **Accessibility**: Full WCAG compliance checking for all recommendations

### Key Features at a Glance

| Feature | Description |
|---------|------------|
| **AI Color Matching** | Intelligent color recommendations based on your room specifications |
| **Room-Specific Advice** | Tailored suggestions for bedrooms, living rooms, children's spaces, etc. |
| **Age-Appropriate Colors** | Psychology-based color selection for different age groups |
| **Accessibility Checking** | Ensures all color combinations meet WCAG standards |
| **Real-time Preview** | Instant visualization of color combinations |
| **API Access** | RESTful API for integration with other applications |

## Prerequisites

Before installing Sanzo Color Advisor, ensure you have:

### Required Software

- **Node.js** (v18.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** (v9.0 or higher, comes with Node.js)
  - Verify installation: `npm --version`

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10, macOS 10.14, Ubuntu 18.04 | Latest versions |
| **RAM** | 2 GB | 4 GB or more |
| **Storage** | 500 MB | 1 GB |
| **Processor** | Dual-core 2.0 GHz | Quad-core 2.5 GHz+ |
| **Network** | Basic internet connection | High-speed for API sync |

### Supported Browsers

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Installation

### Step 1: Clone the Repository

```bash
# Using Git (recommended)
git clone https://github.com/yourusername/sanzo-color-advisor.git
cd sanzo-color-advisor

# Or download the ZIP file from GitHub and extract it
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This will install:
# - Express.js (web server)
# - Chroma.js (color manipulation)
# - Axios (HTTP client)
# - And other dependencies
```

### Step 3: Environment Configuration (Optional)

Create a `.env` file in the root directory for custom settings:

```bash
# Create .env file
cp .env.example .env

# Edit the file with your preferences
```

Example `.env` configuration:

```env
# Server Configuration
PORT=3000
HOST=localhost

# API Settings
API_RATE_LIMIT=100
API_TIMEOUT=30000

# Feature Flags
ENABLE_CACHING=true
ENABLE_WASM=true
ENABLE_WORKERS=true

# External APIs (optional)
GITHUB_TOKEN=your_token_here
```

### Step 4: Verify Installation

```bash
# Run the test suite
npm test

# If all tests pass, you're ready to go!
```

## Quick Start

### Starting the Server

```bash
# Production mode (recommended for first-time users)
npm start

# Development mode (with auto-reload)
npm run dev

# The server will start on http://localhost:3000
```

### Accessing the Application

1. Open your browser
2. Navigate to `http://localhost:3000`
3. You'll see the Sanzo Color Advisor homepage

### Using the Web Interface

The web interface provides an intuitive way to:

1. **Select Room Type**: Choose from bedroom, living room, kitchen, etc.
2. **Specify Current Colors**: Enter your existing wall, floor, and furniture colors
3. **Set Age Group**: For children's rooms, specify the age range
4. **Get Recommendations**: Click "Analyze" to receive AI-powered suggestions

## Your First Color Analysis

Let's walk through a complete example:

### Example 1: Children's Bedroom

```javascript
// Using the API directly
const analysis = {
    wall: "white",
    floor: "oak_wood",
    furniture: "light_wood",
    roomType: "child_bedroom",
    ageGroup: "4-6"
};

// Make the API call
fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(analysis)
})
.then(response => response.json())
.then(data => {
    console.log('Recommended colors:', data.recommendations);
});
```

### Example 2: Living Room Analysis

```javascript
const livingRoomAnalysis = {
    wall: "#F5F5F5",      // Light gray
    floor: "#8B4513",     // Saddle brown (wood)
    furniture: "#2F4F4F", // Dark slate gray
    roomType: "living_room",
    style: "modern"
};

// Using async/await
async function analyzeRoom() {
    const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livingRoomAnalysis)
    });

    const result = await response.json();
    console.log('Analysis complete:', result);
}
```

### Example 3: Using cURL

```bash
# Basic analysis request
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "wall": "white",
    "floor": "dark_wood",
    "furniture": "gray",
    "roomType": "bedroom"
  }'

# With additional options
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "wall": "#FFFFFF",
    "floor": "#654321",
    "furniture": "#808080",
    "roomType": "study",
    "preferences": {
      "mood": "calm",
      "lightLevel": "bright"
    }
  }'
```

## Understanding the Results

### Response Structure

The API returns a comprehensive analysis:

```json
{
  "status": "success",
  "data": {
    "primaryRecommendation": {
      "color": {
        "hex": "#33FF7D",
        "name": "Sea Green",
        "rgb": [51, 255, 125],
        "lab": [87.52, -63.28, 44.31]
      },
      "confidence": 92,
      "reasoning": "Perfect for young children - stimulates creativity while maintaining calm",
      "psychologicalEffects": "Promotes growth, balance, and learning",
      "harmonyScore": 94
    },
    "alternatives": [
      {
        "hex": "#87CEEB",
        "name": "Sky Blue",
        "confidence": 88,
        "reasoning": "Calming alternative that promotes focus"
      },
      {
        "hex": "#FFB6C1",
        "name": "Light Pink",
        "confidence": 85,
        "reasoning": "Warm and nurturing option"
      }
    ],
    "colorHarmony": {
      "complementary": ["#FF3380"],
      "analogous": ["#33FFD4", "#33D4FF"],
      "triadic": ["#FF7D33", "#7D33FF"]
    },
    "accessibility": {
      "wcagCompliance": "AAA",
      "contrastRatio": 7.2,
      "colorBlindSafe": true
    }
  }
}
```

### Confidence Scores

Understanding confidence levels:

| Score | Meaning | Recommendation |
|-------|---------|----------------|
| 90-100% | Excellent Match | Highly recommended, ideal choice |
| 80-89% | Good Match | Solid choice with minor compromises |
| 70-79% | Acceptable | Works but consider alternatives |
| Below 70% | Poor Match | Look for better options |

### Color Harmony Types

- **Complementary**: Colors opposite on the color wheel (high contrast)
- **Analogous**: Adjacent colors (harmonious and peaceful)
- **Triadic**: Three equidistant colors (vibrant and balanced)
- **Split-Complementary**: Base color + two adjacent to complement

## Next Steps

### 1. Explore Advanced Features

- **Batch Analysis**: Analyze multiple rooms at once
- **Color Palettes**: Generate complete home color schemes
- **Historical Combinations**: Browse Sanzo Wada's original palettes
- **Custom Preferences**: Fine-tune recommendations

### 2. Learn More

- Read the [User Guide](USER_GUIDE.md) for detailed features
- Check the [API Reference](API_REFERENCE.md) for all endpoints
- Study the [Color Theory Guide](COLOR_THEORY_GUIDE.md) to understand the science
- Browse [Room Design Examples](ROOM_DESIGN_EXAMPLES.md) for inspiration

### 3. Integration Options

```javascript
// Node.js/npm package (coming soon)
const SanzoAdvisor = require('sanzo-color-advisor');
const advisor = new SanzoAdvisor();

// Browser SDK (coming soon)
<script src="https://cdn.sanzo-advisor.com/v1/sdk.js"></script>
```

### 4. Join the Community

- **GitHub Issues**: Report bugs or request features
- **Discord Server**: Join our design community
- **Newsletter**: Get color trend updates

## Common Issues and Solutions

### Issue 1: Port Already in Use

```bash
# Error: EADDRINUSE: address already in use :::3000

# Solution 1: Use a different port
PORT=3001 npm start

# Solution 2: Kill the process using the port
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Issue 2: Module Not Found

```bash
# Error: Cannot find module 'xyz'

# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Slow Performance

```bash
# Enable performance optimizations
ENABLE_WASM=true ENABLE_WORKERS=true npm start

# Check system resources
npm run diagnostics
```

### Issue 4: API Rate Limiting

```javascript
// If you hit rate limits, implement retry logic:
async function makeRequest(data, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.status === 429) {
                // Rate limited, wait and retry
                await new Promise(r => setTimeout(r, 2000 * (i + 1)));
                continue;
            }

            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
        }
    }
}
```

## Getting Help

### Resources

- **Documentation**: Full docs at `/docs` in this repository
- **API Explorer**: Interactive API testing at `http://localhost:3000/api-explorer`
- **Health Check**: Verify system status at `http://localhost:3000/api/health`

### Support Channels

1. **GitHub Issues**: For bugs and feature requests
2. **Stack Overflow**: Tag questions with `sanzo-color-advisor`
3. **Email Support**: support@sanzo-advisor.com (coming soon)

### Quick Commands Reference

```bash
# Development
npm run dev           # Start with hot reload
npm test             # Run test suite
npm run test:watch   # Continuous testing
npm run lint         # Check code style
npm run lint:fix     # Auto-fix style issues

# Production
npm start            # Start production server
npm run build        # Create production build

# Data Management
npm run sync:github  # Sync with GitHub repository
npm run sync:web     # Update from web sources

# Utilities
npm run health       # Check system health
npm run docs         # View API documentation
```

## Ready to Create Beautiful Spaces? 🏡

You're now ready to use the Sanzo Color Advisor! Start with simple analyses and gradually explore the advanced features. Remember:

- **Trust the Science**: Our recommendations are based on decades of color research
- **Consider Context**: Room purpose and occupant age matter
- **Test First**: Always test colors in your actual space before committing
- **Have Fun**: Color selection should be enjoyable!

Happy color matching! 🎨

---

*Need more help? Check our [Tutorials](TUTORIALS.md) for step-by-step walkthroughs or consult the [Troubleshooting Guide](TROUBLESHOOTING_FAQ.md) for solutions to common problems.*