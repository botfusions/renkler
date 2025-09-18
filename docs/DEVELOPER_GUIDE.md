# Sanzo Color Advisor - Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Core Components](#core-components)
4. [Extending the System](#extending-the-system)
5. [API Development](#api-development)
6. [Database Schema](#database-schema)
7. [Plugin Architecture](#plugin-architecture)
8. [Testing Framework](#testing-framework)
9. [Performance Optimization](#performance-optimization)
10. [Deployment Guide](#deployment-guide)
11. [Contributing Guidelines](#contributing-guidelines)
12. [Advanced Topics](#advanced-topics)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │     React    │ │   Vue.js     │ │   Vanilla    │          │
│  │   Component  │ │   Component  │ │   JavaScript │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                             │
│  ┌──────────────────────────────────────────────────────┐     │
│  │   Express.js Server with Rate Limiting & Auth        │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                ▼                            ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   Core Processing Engine │   │   External Services       │
│  ┌────────────────────┐  │   │  ┌────────────────────┐  │
│  │   Color Agent      │  │   │  │   GitHub API      │  │
│  │   (Analysis Core)  │  │   │  │   (Data Sync)     │  │
│  ├────────────────────┤  │   │  ├────────────────────┤  │
│  │   WebAssembly      │  │   │  │   Web Scraper     │  │
│  │   (Performance)    │  │   │  │   (LAB Values)    │  │
│  ├────────────────────┤  │   │  └────────────────────┘  │
│  │   Web Workers      │  │   └──────────────────────────┘
│  │   (Parallelism)    │  │
│  └────────────────────┘  │
└──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Sanzo Colors  │  │  Combinations  │  │     Cache      │  │
│  │   (159 base)   │  │   (348 sets)   │  │   (Redis)      │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | HTML5/CSS3/JS | User Interface |
| Framework | Express.js | API Server |
| Processing | WebAssembly | Performance-critical calculations |
| Parallelism | Web Workers | Non-blocking operations |
| Data Format | JSON | Data interchange |
| Cache | Redis/Memory | Performance optimization |
| Testing | Jest | Unit and integration tests |
| Build | Webpack | Module bundling |
| Container | Docker | Deployment |

### Design Principles

1. **Modularity**: Loosely coupled, highly cohesive components
2. **Performance**: Sub-200ms response times
3. **Scalability**: Horizontal scaling capability
4. **Maintainability**: Clean code, comprehensive documentation
5. **Extensibility**: Plugin architecture for custom features

---

## Development Environment Setup

### Prerequisites

```bash
# Required software versions
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
git --version   # >= 2.30.0

# Optional but recommended
docker --version  # >= 20.10.0
redis-cli --version  # >= 6.0.0
```

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/sanzo-color-advisor.git
   cd sanzo-color-advisor
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies
   npm install

   # Install global tools
   npm install -g nodemon eslint jest
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit configuration
   nano .env
   ```

   Required environment variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # API Keys
   GITHUB_TOKEN=your_github_token

   # Cache Configuration
   REDIS_URL=redis://localhost:6379
   CACHE_TTL=3600

   # Performance Settings
   ENABLE_WASM=true
   WORKER_THREADS=4

   # Feature Flags
   ENABLE_EXPERIMENTAL=false
   DEBUG_MODE=true
   ```

4. **Database Setup**
   ```bash
   # Initialize local database
   npm run db:init

   # Seed with sample data
   npm run db:seed
   ```

5. **Verify Installation**
   ```bash
   # Run health check
   npm run health

   # Run test suite
   npm test

   # Start development server
   npm run dev
   ```

### IDE Configuration

#### VS Code Settings

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"],
  "files.exclude": {
    "node_modules": true,
    "coverage": true
  },
  "javascript.preferences.quoteStyle": "single",
  "editor.tabSize": 2
}
```

#### Recommended Extensions

- ESLint
- Prettier
- GitLens
- Thunder Client (API testing)
- Color Highlight
- IntelliCode

---

## Core Components

### ColorAgent Class

The heart of the color analysis system:

```javascript
// src/components/ColorAgent.js

class ColorAgent {
  constructor(options = {}) {
    this.sanzoColors = options.colors || defaultColors;
    this.combinations = options.combinations || defaultCombinations;
    this.algorithm = options.algorithm || 'CIEDE2000';
    this.cache = new Map();
  }

  /**
   * Main analysis method
   * @param {Object} input - User input parameters
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(input) {
    // Validate input
    const validated = this.validateInput(input);

    // Check cache
    const cacheKey = this.getCacheKey(validated);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Perform analysis
    const result = await this.performAnalysis(validated);

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  /**
   * Core analysis logic
   * @private
   */
  async performAnalysis(input) {
    const { hex, roomType, ageGroup, style } = input;

    // Convert to LAB color space
    const labColor = this.hexToLab(hex);

    // Find closest Sanzo colors
    const matches = this.findClosestColors(labColor, 5);

    // Get historical combinations
    const combinations = this.getRelevantCombinations(matches[0]);

    // Apply room-specific logic
    const roomOptimized = this.optimizeForRoom(combinations, roomType);

    // Calculate confidence
    const confidence = this.calculateConfidence(
      matches[0],
      roomType,
      ageGroup,
      style
    );

    return {
      palette: roomOptimized,
      confidence,
      metadata: {
        baseColor: hex,
        closestSanzo: matches[0],
        algorithm: this.algorithm,
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

### Color Conversion Module

```javascript
// src/utils/colorConversions.js

/**
 * Optimized color conversion functions
 */

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToLab(rgb) {
  // Convert RGB to XYZ
  let { r, g, b } = rgb;

  r = r / 255;
  g = g / 255;
  b = b / 255;

  // Gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Observer = 2°, Illuminant = D65
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000;
  const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;

  // XYZ to LAB
  const fx = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16/116);
  const fy = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16/116);
  const fz = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16/116);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

export function labToHex(lab) {
  // LAB to XYZ
  const fy = (lab.l + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;

  const x = fx ** 3 > 0.008856 ? fx ** 3 : (fx - 16/116) / 7.787;
  const y = fy ** 3 > 0.008856 ? fy ** 3 : (fy - 16/116) / 7.787;
  const z = fz ** 3 > 0.008856 ? fz ** 3 : (fz - 16/116) / 7.787;

  // XYZ to RGB
  let r = x *  3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y *  1.8760108 + z *  0.0415560;
  let b = x *  0.0556434 + y * -0.2040259 + z *  1.0572252;

  // Gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;

  // Clamp and convert to hex
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  b = Math.max(0, Math.min(1, b));

  const toHex = (val) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
```

### Delta E Calculation

```javascript
// src/utils/deltaE.js

/**
 * CIEDE2000 color difference formula
 * Most accurate perceptual color difference
 */
export function deltaE2000(lab1, lab2) {
  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  // Weight factors
  const kL = 1, kC = 1, kH = 1;

  // Calculate C1, C2
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);

  // Calculate a'
  const meanC = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(meanC, 7) / (Math.pow(meanC, 7) + Math.pow(25, 7))));

  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;

  const Cp1 = Math.sqrt(ap1 * ap1 + b1 * b1);
  const Cp2 = Math.sqrt(ap2 * ap2 + b2 * b2);

  // Calculate h'
  const hp1 = Math.atan2(b1, ap1) * 180 / Math.PI;
  const hp2 = Math.atan2(b2, ap2) * 180 / Math.PI;

  // Calculate deltas
  const dLp = L2 - L1;
  const dCp = Cp2 - Cp1;

  let dhp = hp2 - hp1;
  if (Math.abs(dhp) > 180) {
    dhp = dhp > 180 ? dhp - 360 : dhp + 360;
  }

  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dhp * Math.PI / 180 / 2);

  // Calculate means
  const meanLp = (L1 + L2) / 2;
  const meanCp = (Cp1 + Cp2) / 2;

  let meanHp = (hp1 + hp2) / 2;
  if (Math.abs(hp1 - hp2) > 180) {
    meanHp = meanHp < 180 ? meanHp + 180 : meanHp - 180;
  }

  // Calculate T
  const T = 1
    - 0.17 * Math.cos((meanHp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * meanHp * Math.PI / 180)
    + 0.32 * Math.cos((3 * meanHp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * meanHp - 63) * Math.PI / 180);

  // Calculate SL, SC, SH
  const SL = 1 + (0.015 * Math.pow(meanLp - 50, 2)) / Math.sqrt(20 + Math.pow(meanLp - 50, 2));
  const SC = 1 + 0.045 * meanCp;
  const SH = 1 + 0.015 * meanCp * T;

  // Calculate RT
  const dTheta = 30 * Math.exp(-Math.pow((meanHp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(meanCp, 7) / (Math.pow(meanCp, 7) + Math.pow(25, 7)));
  const RT = -RC * Math.sin(2 * dTheta * Math.PI / 180);

  // Final calculation
  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

/**
 * Simpler CIE76 formula for faster calculations
 */
export function deltaE76(lab1, lab2) {
  const dL = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}
```

---

## Extending the System

### Creating Custom Color Algorithms

1. **Algorithm Interface**
   ```javascript
   // src/algorithms/AlgorithmInterface.js

   export class ColorAlgorithm {
     /**
      * Algorithm name
      * @returns {string}
      */
     getName() {
       throw new Error('getName must be implemented');
     }

     /**
      * Generate palette from base color
      * @param {Object} baseColor - LAB color
      * @param {Object} options - Algorithm options
      * @returns {Array} Generated palette
      */
     generatePalette(baseColor, options) {
       throw new Error('generatePalette must be implemented');
     }

     /**
      * Calculate harmony score
      * @param {Array} palette - Color palette
      * @returns {number} Harmony score 0-100
      */
     calculateHarmony(palette) {
       throw new Error('calculateHarmony must be implemented');
     }
   }
   ```

2. **Custom Algorithm Implementation**
   ```javascript
   // src/algorithms/GoldenRatioAlgorithm.js

   import { ColorAlgorithm } from './AlgorithmInterface.js';

   export class GoldenRatioAlgorithm extends ColorAlgorithm {
     constructor() {
       super();
       this.phi = 1.618033988749;
       this.goldenAngle = 137.507764; // degrees
     }

     getName() {
       return 'Golden Ratio Harmony';
     }

     generatePalette(baseColor, options = {}) {
       const { count = 5 } = options;
       const palette = [baseColor];

       // Convert to HSL for hue manipulation
       const hsl = this.labToHsl(baseColor);

       for (let i = 1; i < count; i++) {
         // Apply golden angle rotation
         const newHue = (hsl.h + this.goldenAngle * i) % 360;

         // Vary saturation and lightness using phi
         const newSat = this.clamp(
           hsl.s * (1 + (Math.sin(i * this.phi) * 0.2)),
           0, 100
         );
         const newLight = this.clamp(
           hsl.l * (1 + (Math.cos(i * this.phi) * 0.15)),
           20, 80
         );

         const newColor = this.hslToLab({
           h: newHue,
           s: newSat,
           l: newLight
         });

         palette.push(newColor);
       }

       return palette;
     }

     calculateHarmony(palette) {
       // Implement golden ratio verification
       let score = 100;

       for (let i = 1; i < palette.length; i++) {
         const hue1 = this.labToHsl(palette[i - 1]).h;
         const hue2 = this.labToHsl(palette[i]).h;
         const angleDiff = Math.abs(hue2 - hue1);

         // Check if angle follows golden ratio
         const expectedAngle = this.goldenAngle * i;
         const deviation = Math.abs(angleDiff - expectedAngle % 360);

         score -= deviation * 0.5;
       }

       return Math.max(0, score);
     }

     // Helper methods
     labToHsl(lab) {
       // Implementation
     }

     hslToLab(hsl) {
       // Implementation
     }

     clamp(value, min, max) {
       return Math.max(min, Math.min(max, value));
     }
   }
   ```

3. **Register Algorithm**
   ```javascript
   // src/algorithms/index.js

   import { GoldenRatioAlgorithm } from './GoldenRatioAlgorithm.js';
   import { ComplementaryAlgorithm } from './ComplementaryAlgorithm.js';
   import { AnalogousAlgorithm } from './AnalogousAlgorithm.js';

   const algorithms = new Map();

   // Register built-in algorithms
   algorithms.set('complementary', new ComplementaryAlgorithm());
   algorithms.set('analogous', new AnalogousAlgorithm());

   // Register custom algorithm
   algorithms.set('golden', new GoldenRatioAlgorithm());

   export function getAlgorithm(name) {
     if (!algorithms.has(name)) {
       throw new Error(`Algorithm ${name} not found`);
     }
     return algorithms.get(name);
   }

   export function registerAlgorithm(name, algorithm) {
     if (algorithms.has(name)) {
       console.warn(`Overwriting algorithm: ${name}`);
     }
     algorithms.set(name, algorithm);
   }
   ```

### Adding Room Type Handlers

```javascript
// src/rooms/RoomHandler.js

export class RoomHandler {
  constructor(roomType) {
    this.roomType = roomType;
    this.preferences = this.loadPreferences();
  }

  /**
   * Apply room-specific color adjustments
   */
  optimizeColors(palette) {
    throw new Error('optimizeColors must be implemented');
  }

  /**
   * Get room-specific constraints
   */
  getConstraints() {
    throw new Error('getConstraints must be implemented');
  }
}

// src/rooms/NurseryRoom.js

export class NurseryRoom extends RoomHandler {
  constructor() {
    super('nursery');
  }

  optimizeColors(palette) {
    return palette.map(color => {
      // Reduce saturation for calming effect
      const adjusted = { ...color };
      adjusted.a *= 0.7; // Reduce red-green
      adjusted.b *= 0.7; // Reduce yellow-blue

      // Increase lightness
      adjusted.l = Math.min(adjusted.l * 1.2, 95);

      return adjusted;
    });
  }

  getConstraints() {
    return {
      minLightness: 60,    // No dark colors
      maxSaturation: 50,   // Avoid overstimulation
      avoidColors: ['#FF0000', '#000000'], // No pure red or black
      preferredHues: [120, 180, 210] // Greens and blues
    };
  }

  validateSafety(color) {
    // Check for age-appropriate colors
    const rgb = labToRgb(color);

    // Avoid high red values (overstimulating)
    if (rgb.r > 200 && rgb.g < 100) return false;

    // Ensure sufficient lightness
    if (color.l < 60) return false;

    return true;
  }
}
```

---

## API Development

### Creating New Endpoints

```javascript
// src/api/routes/palette.js

import express from 'express';
import { validateRequest } from '../middleware/validation.js';
import { rateLimiter } from '../middleware/rateLimit.js';
import { ColorAgent } from '../../components/ColorAgent.js';

const router = express.Router();
const colorAgent = new ColorAgent();

/**
 * @api {post} /api/palette/generate Generate Color Palette
 * @apiName GeneratePalette
 * @apiGroup Palette
 *
 * @apiParam {String} hex Base color in hex format
 * @apiParam {String} [algorithm=complementary] Algorithm type
 * @apiParam {Number} [count=5] Number of colors
 *
 * @apiSuccess {Array} palette Generated color palette
 * @apiSuccess {Number} confidence Confidence score
 */
router.post('/generate',
  rateLimiter({ max: 100, window: '15m' }),
  validateRequest({
    hex: 'required|hex',
    algorithm: 'string|in:complementary,analogous,triadic,golden',
    count: 'integer|min:3|max:10'
  }),
  async (req, res) => {
    try {
      const { hex, algorithm = 'complementary', count = 5 } = req.body;

      // Generate palette
      const result = await colorAgent.generatePalette({
        hex,
        algorithm,
        count
      });

      // Track metrics
      req.metrics.record('palette.generated', {
        algorithm,
        count,
        confidence: result.confidence
      });

      res.json({
        success: true,
        data: result,
        meta: {
          algorithm,
          timestamp: new Date().toISOString(),
          processingTime: req.processingTime
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * @api {post} /api/palette/validate Validate Color Palette
 * @apiName ValidatePalette
 * @apiGroup Palette
 */
router.post('/validate',
  validateRequest({
    palette: 'required|array',
    criteria: 'object'
  }),
  async (req, res) => {
    const { palette, criteria } = req.body;

    const validation = {
      contrast: checkContrast(palette),
      harmony: checkHarmony(palette),
      accessibility: checkAccessibility(palette),
      roomSuitability: checkRoomSuitability(palette, criteria.roomType)
    };

    const score = Object.values(validation)
      .reduce((sum, val) => sum + val.score, 0) / 4;

    res.json({
      success: true,
      validation,
      overallScore: score,
      passed: score >= 70
    });
  }
);

export default router;
```

### Middleware Development

```javascript
// src/api/middleware/validation.js

export function validateRequest(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      const validators = rule.split('|');

      for (const validator of validators) {
        const [validatorName, ...params] = validator.split(':');

        switch (validatorName) {
          case 'required':
            if (!value) {
              errors.push(`${field} is required`);
            }
            break;

          case 'hex':
            if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
              errors.push(`${field} must be valid hex color`);
            }
            break;

          case 'integer':
            if (value && !Number.isInteger(value)) {
              errors.push(`${field} must be an integer`);
            }
            break;

          case 'min':
            if (value && value < parseInt(params[0])) {
              errors.push(`${field} must be at least ${params[0]}`);
            }
            break;

          case 'max':
            if (value && value > parseInt(params[0])) {
              errors.push(`${field} must be at most ${params[0]}`);
            }
            break;

          case 'in':
            const allowed = params[0].split(',');
            if (value && !allowed.includes(value)) {
              errors.push(`${field} must be one of: ${allowed.join(', ')}`);
            }
            break;

          case 'array':
            if (value && !Array.isArray(value)) {
              errors.push(`${field} must be an array`);
            }
            break;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    next();
  };
}

// src/api/middleware/rateLimit.js

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export function rateLimiter(options = {}) {
  const {
    max = 100,
    window = '15m',
    message = 'Too many requests, please try again later.'
  } = options;

  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:'
    }),
    max,
    windowMs: parseWindow(window),
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: res.getHeader('Retry-After')
      });
    }
  });
}

function parseWindow(window) {
  const unit = window.slice(-1);
  const value = parseInt(window.slice(0, -1));

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return 15 * 60 * 1000; // 15 minutes default
  }
}
```

---

## Database Schema

### Color Data Models

```sql
-- Main color table
CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  sanzo_id VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  hex VARCHAR(7) NOT NULL,
  rgb_r INTEGER NOT NULL CHECK (rgb_r >= 0 AND rgb_r <= 255),
  rgb_g INTEGER NOT NULL CHECK (rgb_g >= 0 AND rgb_g <= 255),
  rgb_b INTEGER NOT NULL CHECK (rgb_b >= 0 AND rgb_b <= 255),
  lab_l DECIMAL(5,2) NOT NULL,
  lab_a DECIMAL(5,2) NOT NULL,
  lab_b DECIMAL(5,2) NOT NULL,
  hsl_h DECIMAL(5,2) NOT NULL,
  hsl_s DECIMAL(5,2) NOT NULL,
  hsl_l DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Color combinations
CREATE TABLE combinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship
CREATE TABLE combination_colors (
  combination_id INTEGER REFERENCES combinations(id),
  color_id INTEGER REFERENCES colors(id),
  position INTEGER NOT NULL,
  PRIMARY KEY (combination_id, color_id)
);

-- Analysis results cache
CREATE TABLE analysis_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  confidence DECIMAL(5,2),
  algorithm VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  access_count INTEGER DEFAULT 1
);

-- User preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  favorite_colors JSONB,
  room_preferences JSONB,
  style_preferences JSONB,
  accessibility_needs JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_colors_hex ON colors(hex);
CREATE INDEX idx_colors_lab ON colors(lab_l, lab_a, lab_b);
CREATE INDEX idx_cache_key ON analysis_cache(cache_key);
CREATE INDEX idx_cache_created ON analysis_cache(created_at);
```

### Data Access Layer

```javascript
// src/data/ColorRepository.js

import { Pool } from 'pg';

export class ColorRepository {
  constructor(connectionString) {
    this.pool = new Pool({ connectionString });
  }

  async findByHex(hex) {
    const query = 'SELECT * FROM colors WHERE hex = $1';
    const result = await this.pool.query(query, [hex]);
    return result.rows[0];
  }

  async findClosestByLab(lab, limit = 5) {
    const query = `
      SELECT *,
        SQRT(
          POWER(lab_l - $1, 2) +
          POWER(lab_a - $2, 2) +
          POWER(lab_b - $3, 2)
        ) as distance
      FROM colors
      ORDER BY distance
      LIMIT $4
    `;

    const result = await this.pool.query(
      query,
      [lab.l, lab.a, lab.b, limit]
    );

    return result.rows;
  }

  async getCombinationsByColorId(colorId) {
    const query = `
      SELECT c.*, cc.position,
        array_agg(
          json_build_object(
            'id', col.id,
            'hex', col.hex,
            'name', col.name
          ) ORDER BY cc2.position
        ) as colors
      FROM combinations c
      JOIN combination_colors cc ON c.id = cc.combination_id
      JOIN combination_colors cc2 ON c.id = cc2.combination_id
      JOIN colors col ON cc2.color_id = col.id
      WHERE cc.color_id = $1
      GROUP BY c.id, cc.position
    `;

    const result = await this.pool.query(query, [colorId]);
    return result.rows;
  }

  async saveAnalysisResult(cacheKey, input, result) {
    const query = `
      INSERT INTO analysis_cache
        (cache_key, input_data, result_data, confidence, algorithm)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (cache_key)
      DO UPDATE SET
        accessed_at = CURRENT_TIMESTAMP,
        access_count = analysis_cache.access_count + 1
      RETURNING *
    `;

    const values = [
      cacheKey,
      JSON.stringify(input),
      JSON.stringify(result),
      result.confidence,
      input.algorithm || 'default'
    ];

    const dbResult = await this.pool.query(query, values);
    return dbResult.rows[0];
  }

  async cleanupOldCache(daysOld = 30) {
    const query = `
      DELETE FROM analysis_cache
      WHERE accessed_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
      AND access_count < 10
    `;

    const result = await this.pool.query(query);
    return result.rowCount;
  }
}
```

---

## Plugin Architecture

### Plugin System Design

```javascript
// src/plugins/PluginManager.js

export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  /**
   * Register a plugin
   */
  async register(plugin) {
    if (!plugin.name || !plugin.version) {
      throw new Error('Plugin must have name and version');
    }

    // Check compatibility
    if (!this.isCompatible(plugin)) {
      throw new Error(`Plugin ${plugin.name} is not compatible`);
    }

    // Initialize plugin
    if (plugin.init) {
      await plugin.init(this.getAPI());
    }

    // Register hooks
    if (plugin.hooks) {
      for (const [hookName, handler] of Object.entries(plugin.hooks)) {
        this.registerHook(hookName, handler, plugin.name);
      }
    }

    this.plugins.set(plugin.name, plugin);
    console.log(`Plugin ${plugin.name} v${plugin.version} registered`);
  }

  /**
   * Register a hook handler
   */
  registerHook(hookName, handler, pluginName) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    this.hooks.get(hookName).push({
      pluginName,
      handler
    });
  }

  /**
   * Execute hooks
   */
  async executeHook(hookName, data) {
    if (!this.hooks.has(hookName)) {
      return data;
    }

    let result = data;
    const handlers = this.hooks.get(hookName);

    for (const { handler, pluginName } of handlers) {
      try {
        result = await handler(result);
      } catch (error) {
        console.error(`Hook error in ${pluginName}: ${error.message}`);
        // Continue with other hooks
      }
    }

    return result;
  }

  /**
   * Get plugin API
   */
  getAPI() {
    return {
      colors: this.getColorsAPI(),
      utils: this.getUtilsAPI(),
      events: this.getEventsAPI()
    };
  }

  getColorsAPI() {
    return {
      hexToRgb,
      rgbToLab,
      labToHex,
      deltaE2000
    };
  }

  getUtilsAPI() {
    return {
      cache: new Map(),
      config: process.env
    };
  }

  getEventsAPI() {
    return {
      emit: (event, data) => this.executeHook(event, data),
      on: (event, handler) => this.registerHook(event, handler, 'api')
    };
  }

  isCompatible(plugin) {
    // Check API version compatibility
    const requiredVersion = plugin.requires || '1.0.0';
    const currentVersion = process.env.API_VERSION || '1.0.0';

    return this.compareVersions(currentVersion, requiredVersion) >= 0;
  }

  compareVersions(current, required) {
    const c = current.split('.').map(Number);
    const r = required.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (c[i] > r[i]) return 1;
      if (c[i] < r[i]) return -1;
    }

    return 0;
  }
}
```

### Example Plugin

```javascript
// plugins/seasonal-colors/index.js

export default {
  name: 'seasonal-colors',
  version: '1.0.0',
  requires: '1.0.0',
  description: 'Adds seasonal color palette generation',

  async init(api) {
    this.api = api;
    this.seasons = this.loadSeasonalData();
  },

  hooks: {
    'beforeAnalysis': async (input) => {
      // Add seasonal context
      if (input.season) {
        input.seasonalColors = this.getSeasonalColors(input.season);
      }
      return input;
    },

    'afterAnalysis': async (result) => {
      // Adjust for seasonal preferences
      if (result.input.season) {
        result.palette = this.adjustForSeason(
          result.palette,
          result.input.season
        );
      }
      return result;
    }
  },

  methods: {
    getSeasonalColors(season) {
      const palettes = {
        spring: ['#98FB98', '#FFB6C1', '#FFFFE0'],
        summer: ['#87CEEB', '#FFD700', '#98D8C8'],
        autumn: ['#D2691E', '#FF8C00', '#8B4513'],
        winter: ['#4682B4', '#708090', '#F0F8FF']
      };

      return palettes[season] || palettes.spring;
    },

    adjustForSeason(palette, season) {
      const seasonalAdjustments = {
        spring: { saturation: 1.1, lightness: 1.05 },
        summer: { saturation: 1.2, lightness: 1.1 },
        autumn: { saturation: 0.9, lightness: 0.95 },
        winter: { saturation: 0.8, lightness: 1.0 }
      };

      const adjustment = seasonalAdjustments[season];

      return palette.map(color => {
        const hsl = this.api.colors.labToHsl(color);
        hsl.s *= adjustment.saturation;
        hsl.l *= adjustment.lightness;
        return this.api.colors.hslToLab(hsl);
      });
    },

    loadSeasonalData() {
      // Load seasonal color data
      return require('./seasonal-data.json');
    }
  },

  // API endpoints provided by plugin
  routes: [
    {
      method: 'GET',
      path: '/seasonal/:season',
      handler: async (req, res) => {
        const { season } = req.params;
        const colors = this.methods.getSeasonalColors(season);
        res.json({ season, colors });
      }
    }
  ]
};
```

---

## Testing Framework

### Unit Testing

```javascript
// tests/unit/colorConversions.test.js

import { hexToRgb, rgbToLab, labToHex } from '../../src/utils/colorConversions';

describe('Color Conversions', () => {
  describe('hexToRgb', () => {
    test('converts valid hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    test('handles lowercase hex', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('handles hex without #', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('returns null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GGG')).toBeNull();
    });
  });

  describe('rgbToLab', () => {
    test('converts RGB to LAB correctly', () => {
      const white = rgbToLab({ r: 255, g: 255, b: 255 });
      expect(white.l).toBeCloseTo(100, 1);
      expect(white.a).toBeCloseTo(0, 1);
      expect(white.b).toBeCloseTo(0, 1);

      const black = rgbToLab({ r: 0, g: 0, b: 0 });
      expect(black.l).toBeCloseTo(0, 1);
    });
  });

  describe('round-trip conversion', () => {
    test('hex -> rgb -> lab -> hex maintains color', () => {
      const originalHex = '#4682B4';
      const rgb = hexToRgb(originalHex);
      const lab = rgbToLab(rgb);
      const resultHex = labToHex(lab);

      // Allow small deviation due to rounding
      const original = hexToRgb(originalHex);
      const result = hexToRgb(resultHex);

      expect(result.r).toBeCloseTo(original.r, -1); // ±10
      expect(result.g).toBeCloseTo(original.g, -1);
      expect(result.b).toBeCloseTo(original.b, -1);
    });
  });
});
```

### Integration Testing

```javascript
// tests/integration/api.test.js

import request from 'supertest';
import app from '../../src/app';

describe('API Integration Tests', () => {
  describe('POST /api/analyze', () => {
    test('successful color analysis', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          hex: '#4682B4',
          roomType: 'bedroom'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('palette');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data.confidence).toBeGreaterThan(0);
      expect(response.body.data.confidence).toBeLessThanOrEqual(100);
    });

    test('validation error for invalid hex', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          hex: 'invalid',
          roomType: 'bedroom'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    test('rate limiting works', async () => {
      // Make many requests
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .post('/api/analyze')
          .send({ hex: '#000000', roomType: 'bedroom' })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/health', () => {
    test('returns health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
```

### Performance Testing

```javascript
// tests/performance/colorAgent.perf.js

import { ColorAgent } from '../../src/components/ColorAgent';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  let agent;

  beforeAll(() => {
    agent = new ColorAgent();
  });

  test('single color analysis < 50ms', async () => {
    const start = performance.now();

    await agent.analyze({
      hex: '#4682B4',
      roomType: 'bedroom'
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });

  test('batch processing 100 colors < 2s', async () => {
    const colors = Array(100).fill(null).map((_, i) => ({
      hex: `#${i.toString(16).padStart(6, '0')}`,
      roomType: 'living_room'
    }));

    const start = performance.now();

    await Promise.all(colors.map(c => agent.analyze(c)));

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test('cache hit < 1ms', async () => {
    const input = { hex: '#FF0000', roomType: 'kitchen' };

    // Warm cache
    await agent.analyze(input);

    // Test cache hit
    const start = performance.now();
    await agent.analyze(input);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1);
  });

  test('memory usage stays below 100MB', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Process many colors
    for (let i = 0; i < 1000; i++) {
      await agent.analyze({
        hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        roomType: 'office'
      });
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

    expect(memoryIncrease).toBeLessThan(100); // MB
  });
});
```

---

## Performance Optimization

### WebAssembly Integration

```c
// src/wasm/color_math.c

#include <math.h>
#include <emscripten.h>

// Export function for JavaScript
EMSCRIPTEN_KEEPALIVE
double deltaE2000_wasm(
    double L1, double a1, double b1,
    double L2, double a2, double b2
) {
    // CIEDE2000 implementation in C
    double C1 = sqrt(a1 * a1 + b1 * b1);
    double C2 = sqrt(a2 * a2 + b2 * b2);
    double meanC = (C1 + C2) / 2.0;

    double G = 0.5 * (1 - sqrt(pow(meanC, 7) / (pow(meanC, 7) + pow(25, 7))));
    double ap1 = (1 + G) * a1;
    double ap2 = (1 + G) * a2;

    double Cp1 = sqrt(ap1 * ap1 + b1 * b1);
    double Cp2 = sqrt(ap2 * ap2 + b2 * b2);

    // Continue with full CIEDE2000 calculation...
    // (abbreviated for space)

    return deltaE;
}

EMSCRIPTEN_KEEPALIVE
void batch_deltaE(
    double* lab1_array,
    double* lab2_array,
    double* results,
    int count
) {
    for (int i = 0; i < count; i++) {
        int idx = i * 3;
        results[i] = deltaE2000_wasm(
            lab1_array[idx], lab1_array[idx + 1], lab1_array[idx + 2],
            lab2_array[idx], lab2_array[idx + 1], lab2_array[idx + 2]
        );
    }
}
```

Compile WASM:
```bash
emcc src/wasm/color_math.c \
  -o src/wasm/color_math.js \
  -s EXPORTED_FUNCTIONS='["_deltaE2000_wasm", "_batch_deltaE"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='ColorMathWASM' \
  -O3
```

JavaScript wrapper:
```javascript
// src/wasm/wasmWrapper.js

let wasmModule = null;

export async function loadWasmModule() {
  if (wasmModule) return wasmModule;

  const ColorMathWASM = await import('./color_math.js');
  wasmModule = await ColorMathWASM.default();

  return wasmModule;
}

export async function deltaE2000Wasm(lab1, lab2) {
  const module = await loadWasmModule();

  return module.ccall(
    'deltaE2000_wasm',
    'number',
    ['number', 'number', 'number', 'number', 'number', 'number'],
    [lab1.l, lab1.a, lab1.b, lab2.l, lab2.a, lab2.b]
  );
}

export async function batchDeltaE(lab1Array, lab2Array) {
  const module = await loadWasmModule();
  const count = lab1Array.length;

  // Allocate memory
  const lab1Ptr = module._malloc(count * 3 * 8); // 3 values * 8 bytes
  const lab2Ptr = module._malloc(count * 3 * 8);
  const resultsPtr = module._malloc(count * 8);

  // Copy data to WASM memory
  const lab1Heap = new Float64Array(
    module.HEAPF64.buffer,
    lab1Ptr,
    count * 3
  );
  const lab2Heap = new Float64Array(
    module.HEAPF64.buffer,
    lab2Ptr,
    count * 3
  );

  lab1Array.forEach((lab, i) => {
    lab1Heap[i * 3] = lab.l;
    lab1Heap[i * 3 + 1] = lab.a;
    lab1Heap[i * 3 + 2] = lab.b;
  });

  lab2Array.forEach((lab, i) => {
    lab2Heap[i * 3] = lab.l;
    lab2Heap[i * 3 + 1] = lab.a;
    lab2Heap[i * 3 + 2] = lab.b;
  });

  // Call WASM function
  module.ccall(
    'batch_deltaE',
    null,
    ['number', 'number', 'number', 'number'],
    [lab1Ptr, lab2Ptr, resultsPtr, count]
  );

  // Read results
  const results = new Float64Array(
    module.HEAPF64.buffer,
    resultsPtr,
    count
  );
  const output = Array.from(results);

  // Free memory
  module._free(lab1Ptr);
  module._free(lab2Ptr);
  module._free(resultsPtr);

  return output;
}
```

### Web Worker Implementation

```javascript
// src/workers/colorWorker.js

self.importScripts('/wasm/color_math.js');

let wasmModule = null;

self.onmessage = async function(e) {
  const { type, data, id } = e.data;

  try {
    let result;

    switch (type) {
      case 'init':
        wasmModule = await ColorMathWASM();
        result = { status: 'ready' };
        break;

      case 'analyze':
        result = await analyzeColors(data);
        break;

      case 'batch':
        result = await batchProcess(data);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};

async function analyzeColors(data) {
  const { baseColor, sanzoColors } = data;

  // Calculate distances using WASM
  const distances = await Promise.all(
    sanzoColors.map(color =>
      calculateDeltaE(baseColor, color)
    )
  );

  // Find best matches
  const matches = sanzoColors
    .map((color, i) => ({ ...color, distance: distances[i] }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return matches;
}

async function batchProcess(colors) {
  const results = [];

  // Process in chunks to avoid blocking
  const chunkSize = 100;
  for (let i = 0; i < colors.length; i += chunkSize) {
    const chunk = colors.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(color => analyzeColors(color))
    );
    results.push(...chunkResults);
  }

  return results;
}
```

Worker manager:
```javascript
// src/workers/workerPool.js

export class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.queue = [];
    this.busy = new Set();

    // Create workers
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.id = i;
      this.workers.push(worker);
    }
  }

  async execute(type, data) {
    return new Promise((resolve, reject) => {
      const task = { type, data, resolve, reject, id: Date.now() };

      // Find available worker
      const worker = this.getAvailableWorker();
      if (worker) {
        this.runTask(worker, task);
      } else {
        this.queue.push(task);
      }
    });
  }

  getAvailableWorker() {
    return this.workers.find(w => !this.busy.has(w.id));
  }

  runTask(worker, task) {
    this.busy.add(worker.id);

    const handler = (e) => {
      if (e.data.id === task.id) {
        worker.removeEventListener('message', handler);
        this.busy.delete(worker.id);

        if (e.data.error) {
          task.reject(new Error(e.data.error));
        } else {
          task.resolve(e.data.result);
        }

        // Process next task in queue
        if (this.queue.length > 0) {
          const nextTask = this.queue.shift();
          this.runTask(worker, nextTask);
        }
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({
      type: task.type,
      data: task.data,
      id: task.id
    });
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
  }
}
```

---

## Deployment Guide

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

RUN apk add --no-cache tini

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sanzo-color-advisor
  labels:
    app: sanzo-color-advisor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sanzo-color-advisor
  template:
    metadata:
      labels:
        app: sanzo-color-advisor
    spec:
      containers:
      - name: app
        image: sanzo-color-advisor:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: sanzo-color-advisor
spec:
  selector:
    app: sanzo-color-advisor
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sanzo-color-advisor-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sanzo-color-advisor
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Run performance tests
      run: npm run test:perf

    - name: Upload coverage
      uses: codecov/codecov-action@v2

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Build Docker image
      run: docker build -t sanzo-color-advisor:${{ github.sha }} .

    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push sanzo-color-advisor:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/sanzo-color-advisor \
          app=sanzo-color-advisor:${{ github.sha }}
        kubectl rollout status deployment/sanzo-color-advisor
```

---

## Contributing Guidelines

### Code Style

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'arrow-spacing': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'comma-dangle': ['error', 'never']
  }
};
```

### Pull Request Process

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Update documentation
7. Commit: `git commit -m 'Add amazing feature'`
8. Push: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Refactoring
- perf: Performance improvement
- test: Testing
- chore: Maintenance

Example:
```
feat(api): add batch color processing endpoint

- Implement POST /api/batch endpoint
- Add rate limiting for batch operations
- Support up to 100 colors per request

Closes #123
```

---

## Advanced Topics

### Machine Learning Integration

```python
# ml/color_predictor.py

import tensorflow as tf
import numpy as np
from sklearn.preprocessing import StandardScaler

class ColorPredictor:
    def __init__(self, model_path='models/color_harmony.h5'):
        self.model = tf.keras.models.load_model(model_path)
        self.scaler = StandardScaler()

    def predict_harmony(self, color_pair):
        """Predict harmony score for color pair"""
        features = self.extract_features(color_pair)
        features_scaled = self.scaler.transform([features])

        prediction = self.model.predict(features_scaled)[0][0]
        return float(prediction)

    def extract_features(self, color_pair):
        """Extract features from color pair"""
        lab1, lab2 = color_pair

        return [
            lab1['l'], lab1['a'], lab1['b'],
            lab2['l'], lab2['a'], lab2['b'],
            self.delta_e(lab1, lab2),
            self.hue_difference(lab1, lab2),
            self.saturation_ratio(lab1, lab2),
            self.lightness_contrast(lab1, lab2)
        ]

    def train_model(self, training_data):
        """Train harmony prediction model"""
        X, y = self.prepare_training_data(training_data)

        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])

        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )

        history = model.fit(
            X, y,
            epochs=50,
            batch_size=32,
            validation_split=0.2,
            callbacks=[
                tf.keras.callbacks.EarlyStopping(patience=5),
                tf.keras.callbacks.ModelCheckpoint(
                    'models/best_model.h5',
                    save_best_only=True
                )
            ]
        )

        return model, history
```

### Real-time Collaboration

```javascript
// src/collaboration/realtimeSync.js

import { Server } from 'socket.io';

export class RealtimeCollaboration {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
      }
    });

    this.rooms = new Map();
    this.setupHandlers();
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('join-room', (roomId) => {
        socket.join(roomId);

        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, {
            users: new Set(),
            palette: null,
            history: []
          });
        }

        const room = this.rooms.get(roomId);
        room.users.add(socket.id);

        // Send current state
        socket.emit('room-state', {
          palette: room.palette,
          users: Array.from(room.users)
        });

        // Notify others
        socket.to(roomId).emit('user-joined', socket.id);
      });

      socket.on('palette-update', ({ roomId, palette }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          room.palette = palette;
          room.history.push({
            userId: socket.id,
            palette,
            timestamp: Date.now()
          });

          // Broadcast to room
          socket.to(roomId).emit('palette-changed', {
            palette,
            userId: socket.id
          });
        }
      });

      socket.on('cursor-move', ({ roomId, position }) => {
        socket.to(roomId).emit('cursor-update', {
          userId: socket.id,
          position
        });
      });

      socket.on('disconnect', () => {
        // Clean up user from all rooms
        this.rooms.forEach((room, roomId) => {
          if (room.users.has(socket.id)) {
            room.users.delete(socket.id);
            this.io.to(roomId).emit('user-left', socket.id);
          }
        });
      });
    });
  }
}
```

---

## Conclusion

This Developer Guide provides comprehensive documentation for extending and maintaining the Sanzo Color Advisor system. Key areas covered include:

1. **Architecture**: Modular, scalable design
2. **Core Components**: ColorAgent, conversion utilities, algorithms
3. **Extension Points**: Plugins, custom algorithms, room handlers
4. **API Development**: RESTful endpoints, middleware, validation
5. **Performance**: WebAssembly, Web Workers, caching
6. **Testing**: Unit, integration, performance tests
7. **Deployment**: Docker, Kubernetes, CI/CD
8. **Advanced Features**: ML integration, real-time collaboration

For questions or contributions, please refer to our [Contributing Guidelines](#contributing-guidelines) or contact the development team.

---

*Last Updated: September 2024*
*Version: 1.0.0*