# Sanzo Color Advisor - Color Theory Guide

## Table of Contents

1. [Introduction to Sanzo Wada](#introduction-to-sanzo-wada)
2. [The Sanzo Color System](#the-sanzo-color-system)
3. [Color Science Fundamentals](#color-science-fundamentals)
4. [Color Spaces Explained](#color-spaces-explained)
5. [Delta E and Color Difference](#delta-e-and-color-difference)
6. [Color Harmony Principles](#color-harmony-principles)
7. [Psychological Effects of Color](#psychological-effects-of-color)
8. [Cultural Color Meanings](#cultural-color-meanings)
9. [Technical Implementation](#technical-implementation)
10. [Practical Applications](#practical-applications)

## Introduction to Sanzo Wada

### The Master of Color Combinations

Sanzo Wada (1883-1967) was a Japanese artist, designer, and color theorist who revolutionized our understanding of color harmony. His masterwork, **"A Dictionary of Color Combinations"** (配色事典, Haishoku Jiten), published in 1918, remains one of the most influential color references in design history.

### Historical Context

```
Timeline of Sanzo Wada's Contributions:

1883 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1967
  │                                              │
  │  1918: Dictionary of Color Combinations       │
  │    ↓                                          │
  │  348 color combinations                       │
  │  159 individual colors                        │
  │  Systematic approach to harmony               │
  │                                               │
  └───────────────────────────────────────────────┘
```

### Why Sanzo Wada Matters Today

1. **Timeless Principles**: His combinations remain aesthetically pleasing after 100+ years
2. **Scientific Approach**: Combined artistic intuition with systematic methodology
3. **Cultural Bridge**: Merged Eastern and Western color sensibilities
4. **Practical Focus**: Created combinations for real-world applications

## The Sanzo Color System

### Core Components

#### 1. The 159 Original Colors

Sanzo Wada carefully selected 159 colors that form the foundation of his system:

```
Color Categories:
├── Reds (紅) - 24 colors
├── Oranges (橙) - 18 colors
├── Yellows (黄) - 22 colors
├── Greens (緑) - 28 colors
├── Blues (青) - 31 colors
├── Purples (紫) - 19 colors
└── Neutrals (無彩色) - 17 colors
```

#### 2. The 348 Combinations

Each combination follows specific harmony rules:

```javascript
// Example Sanzo Combination Structure
{
  combinationNumber: 47,
  colors: [
    { sanzoId: 'S023', hex: '#4876B4', name: 'Horizon Blue' },
    { sanzoId: 'S067', hex: '#87CEEB', name: 'Sky Blue' },
    { sanzoId: 'S134', hex: '#F0F8FF', name: 'Morning Mist' }
  ],
  harmonyType: 'analogous',
  mood: 'tranquil',
  applications: ['bedroom', 'meditation_space']
}
```

### Sanzo's Harmony Principles

#### 1. Balance Theory (均衡理論)

```
Visual Weight Distribution:

Heavy ████████░░ Light
Dark  ████████░░ Bright
Warm  ████████░░ Cool

Balanced Combination = Equilibrium of Forces
```

#### 2. Transition Principle (移行原理)

Colors should flow naturally from one to another:

```
Smooth Transition:
#FF6347 → #FF7F50 → #FFA07A → #FFDAB9
(Tomato → Coral → Light Salmon → Peach Puff)

Contrast Transition:
#4682B4 → #FFFFFF → #FF6347
(Steel Blue → White → Tomato)
```

#### 3. Proportion Rules (比例規則)

The 60-30-10 rule predates modern design but was inherent in Sanzo's work:

```
┌─────────────────────────────────┐
│ ████████████ 60% Primary        │
│ ██████ 30% Secondary            │
│ ██ 10% Accent                   │
└─────────────────────────────────┘
```

## Color Science Fundamentals

### Light and Color Perception

#### The Electromagnetic Spectrum

```
Wavelength (nm):
380 ─────── 450 ─────── 500 ─────── 550 ─────── 600 ─────── 650 ─────── 700
 │          │          │          │          │          │          │
Violet     Blue      Green     Yellow    Orange      Red
```

#### Human Color Vision

```
The Eye's Color Receptors:

S-Cones (Blue):    Peak: 420nm  │████░░░░░░│
M-Cones (Green):   Peak: 530nm  │░░░████░░░│
L-Cones (Red):     Peak: 560nm  │░░░░░░████│
                                380nm    700nm
```

### Color Dimensions

Every color can be described by three properties:

#### 1. Hue (Color Family)
```
Color Wheel (0-360°):
      0° Red
       │
270° ──┼── 90°
Purple │  Yellow
       │
    180° Cyan
```

#### 2. Saturation (Purity)
```
0% ░░░░░░░░░░ Gray (No Color)
50% ████░░░░░ Muted
100% ████████ Pure Color
```

#### 3. Lightness (Brightness)
```
0% ████████ Black
50% ████████ Middle Gray
100% ░░░░░░░ White
```

## Color Spaces Explained

### RGB (Red, Green, Blue)

Used for screens and digital displays:

```javascript
// RGB Color Model
{
  red: 0-255,    // Additive primary
  green: 0-255,  // Additive primary
  blue: 0-255    // Additive primary
}

// Example: Steel Blue
rgb(70, 130, 180)
```

### HSL (Hue, Saturation, Lightness)

Intuitive for human understanding:

```javascript
// HSL Color Model
{
  hue: 0-360,         // Color wheel position
  saturation: 0-100%, // Color intensity
  lightness: 0-100%   // Brightness level
}

// Example: Steel Blue
hsl(207, 44%, 49%)
```

### LAB (Lightness, A, B)

Perceptually uniform color space:

```javascript
// CIE LAB Color Model
{
  L: 0-100,    // Lightness (black to white)
  a: -128-127, // Green to red axis
  b: -128-127  // Blue to yellow axis
}

// Example: Steel Blue
lab(52.18, -4.88, -32.20)
```

### Why LAB Matters

LAB is crucial for accurate color matching because:

1. **Perceptual Uniformity**: Equal numerical changes = equal visual changes
2. **Device Independence**: Not tied to any display technology
3. **Complete Gamut**: Can represent all visible colors

## Delta E and Color Difference

### Understanding Delta E (ΔE)

Delta E measures the perceptual difference between two colors:

```
ΔE Scale:
0-1:   Not perceptible by human eye
1-2:   Perceptible through close observation
2-10:  Perceptible at a glance
11-49: Colors are more similar than opposite
50-100: Colors are opposite
```

### Delta E Formulas

#### CIE1976 (ΔE*ab)
```javascript
// Simple Euclidean distance in LAB space
ΔE76 = sqrt((L2-L1)² + (a2-a1)² + (b2-b1)²)
```

#### CIE2000 (ΔE*00)
```javascript
// Most accurate, accounts for human perception
ΔE00 = Complex weighted formula considering:
- Lightness differences
- Chroma differences
- Hue differences
- Rotation term for blue colors
```

### Practical Delta E Applications

```javascript
// Color matching thresholds
const thresholds = {
  exactMatch: 1.0,      // Printing industry standard
  goodMatch: 2.3,       // Consumer products
  acceptableMatch: 5.0, // General use
  poorMatch: 10.0       // Noticeable difference
};
```

## Color Harmony Principles

### 1. Complementary Harmony

Colors opposite on the wheel (180° apart):

```
     Red
      │
      │
Blue ─┼─ Yellow
      │
      │
   Green

Example: Red (#FF0000) ↔ Cyan (#00FFFF)
```

### 2. Analogous Harmony

Adjacent colors (30-60° apart):

```
Selected Range: 150°-210°
├─ Blue-Green (150°)
├─ Cyan (180°)
└─ Blue (210°)

Creates: Peaceful, comfortable designs
```

### 3. Triadic Harmony

Three colors equally spaced (120° apart):

```
    ▲ Red (0°)
   / \
  /   \
 /     \
▲───────▲
Green   Blue
(120°) (240°)

Creates: Vibrant, balanced designs
```

### 4. Split-Complementary

Base color + two adjacent to its complement:

```
       Base
        │
    ┌───┼───┐
    │   │   │
Split1  │  Split2
   Complement
```

### 5. Tetradic (Square)

Four colors in rectangular arrangement:

```
Color1 ──── Color2
  │           │
  │           │
Color3 ──── Color4

Two complementary pairs
```

### Sanzo's Unique Harmonies

Beyond traditional harmonies, Sanzo identified:

#### Emotional Harmonies
```javascript
{
  joyful: ['#FFD700', '#FF69B4', '#87CEEB'],     // Gold, Pink, Sky
  serene: ['#E6E6FA', '#B0C4DE', '#F0F8FF'],     // Lavenders and Blues
  energetic: ['#FF4500', '#FFD700', '#32CD32'],  // Orange, Gold, Green
  sophisticated: ['#2F4F4F', '#708090', '#DCDCDC'] // Grays and Slates
}
```

## Psychological Effects of Color

### Color Psychology Matrix

| Color | Psychological Effect | Physical Response | Best Use Cases |
|-------|---------------------|-------------------|----------------|
| **Red** | Energy, passion, urgency | ↑ Heart rate, ↑ Blood pressure | Dining rooms, accent walls |
| **Blue** | Calm, trust, stability | ↓ Heart rate, ↓ Temperature perception | Bedrooms, offices |
| **Green** | Balance, growth, nature | Eye strain relief, ↓ Stress | Studies, bathrooms |
| **Yellow** | Happiness, creativity | ↑ Metabolism, ↑ Mental activity | Kitchens, children's rooms |
| **Purple** | Luxury, creativity | Stimulates problem solving | Creative spaces |
| **Orange** | Enthusiasm, warmth | ↑ Oxygen to brain | Exercise rooms, social spaces |
| **Neutral** | Balance, sophistication | Minimal distraction | Any room as base |

### Age-Specific Color Psychology

#### Children (0-12)
```
Development Stages:
0-3:  High contrast for visual development
      Primary colors for recognition

4-6:  Bright colors for creativity
      Multiple hues for learning

7-12: Personal preferences emerge
      Gender-neutral options important
```

#### Teenagers (13-18)
```
Preferences:
- Self-expression through color
- Trend-conscious choices
- Darker, sophisticated palettes
- Personal identity colors
```

#### Adults
```
Considerations:
- Professional environments
- Relaxation needs
- Cultural associations
- Personal history with colors
```

#### Elderly
```
Special Needs:
- Higher contrast requirements
- Warm colors for comfort
- Avoiding blue-green confusion
- Clear color boundaries
```

## Cultural Color Meanings

### Global Color Associations

```javascript
const culturalMeanings = {
  red: {
    western: 'Love, danger, power',
    eastern: 'Luck, prosperity, joy',
    middle_eastern: 'Danger, caution',
    african: 'Death, masculinity'
  },
  white: {
    western: 'Purity, weddings, cleanliness',
    eastern: 'Death, mourning',
    middle_eastern: 'Purity, mourning',
    african: 'Peace, spirituality'
  },
  blue: {
    western: 'Trust, stability, sadness',
    eastern: 'Immortality, spirituality',
    middle_eastern: 'Safety, protection',
    african: 'Harmony, love'
  }
};
```

### Sanzo's Japanese Influence

Traditional Japanese colors in Sanzo's work:

| Japanese Name | English | Hex | Cultural Significance |
|--------------|---------|-----|----------------------|
| 藍色 (Ai-iro) | Indigo | #234794 | Nobility, depth |
| 桜色 (Sakura-iro) | Cherry blossom | #FDBCB4 | Spring, life |
| 抹茶色 (Matcha-iro) | Matcha green | #C5E99B | Tea ceremony |
| 朱色 (Shu-iro) | Vermillion | #ED514E | Temples, celebration |

## Technical Implementation

### Color Conversion Algorithms

#### RGB to HSL
```javascript
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [h * 360, s * 100, l * 100];
}
```

#### RGB to LAB
```javascript
function rgbToLab(r, g, b) {
  // First convert to XYZ
  let [x, y, z] = rgbToXyz(r, g, b);

  // Then XYZ to LAB
  const xn = 95.047, yn = 100.0, zn = 108.883;
  x /= xn; y /= yn; z /= zn;

  const fx = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16/116);
  const fy = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16/116);
  const fz = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16/116);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}
```

### Delta E 2000 Implementation

```javascript
function deltaE2000(lab1, lab2) {
  // Complex implementation with multiple factors
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  // Calculate chroma
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);

  // ... 50+ lines of calculations ...

  // Weighted combination
  const deltaE = Math.sqrt(
    Math.pow(deltaL / SL, 2) +
    Math.pow(deltaC / SC, 2) +
    Math.pow(deltaH / SH, 2) +
    RT * (deltaC / SC) * (deltaH / SH)
  );

  return deltaE;
}
```

### Performance Optimization

#### WebAssembly for Color Calculations
```javascript
// Load WASM module for 10x speed improvement
const wasmModule = await WebAssembly.instantiateStreaming(
  fetch('color-calc.wasm')
);

const fastDeltaE = wasmModule.instance.exports.deltaE2000;
```

#### Worker Thread Processing
```javascript
// Offload heavy calculations to worker
const worker = new Worker('color-worker.js');

worker.postMessage({
  type: 'batch_analysis',
  colors: largeColorArray
});

worker.onmessage = (e) => {
  const results = e.data;
  // Process results without blocking UI
};
```

## Practical Applications

### Interior Design Workflows

#### 1. Room Analysis Pipeline
```
Input: Room photo
  ↓
Extract dominant colors
  ↓
Map to Sanzo combinations
  ↓
Apply room-specific filters
  ↓
Generate recommendations
```

#### 2. Color Matching Process
```javascript
function matchToSanzo(inputColor) {
  const inputLAB = rgbToLab(inputColor);
  let bestMatch = null;
  let minDeltaE = Infinity;

  for (const sanzoColor of sanzoDatabase) {
    const deltaE = deltaE2000(inputLAB, sanzoColor.lab);
    if (deltaE < minDeltaE) {
      minDeltaE = deltaE;
      bestMatch = sanzoColor;
    }
  }

  return {
    color: bestMatch,
    accuracy: 100 - minDeltaE,
    combinations: getSanzoCombinations(bestMatch.id)
  };
}
```

### Design System Integration

#### Creating a Sanzo-Based Design System
```javascript
const designSystem = {
  primary: {
    base: '#4876B4',    // Sanzo Blue 47
    light: '#87CEEB',   // Sanzo Blue 67
    dark: '#2C5282',    // Derived
    contrast: '#FFFFFF'
  },
  semantic: {
    success: '#90EE90', // Sanzo Green 112
    warning: '#FFD700', // Sanzo Gold 89
    error: '#FF6347',   // Sanzo Red 15
    info: '#87CEEB'     // Sanzo Blue 67
  },
  neutrals: {
    // Based on Sanzo's neutral palette
    100: '#F7FAFC',
    200: '#EDF2F7',
    300: '#E2E8F0',
    400: '#CBD5E0',
    500: '#A0AEC0',
    600: '#718096',
    700: '#4A5568',
    800: '#2D3748',
    900: '#1A202C'
  }
};
```

### Accessibility Considerations

#### WCAG Compliance with Sanzo Colors
```javascript
function ensureAccessibility(foreground, background) {
  const ratio = getContrastRatio(foreground, background);

  if (ratio < 4.5) {
    // Adjust colors while maintaining Sanzo harmony
    const adjusted = adjustForContrast(foreground, background, 4.5);
    return {
      original: { foreground, background },
      adjusted: adjusted,
      ratio: getContrastRatio(adjusted.fg, adjusted.bg),
      wcagLevel: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
    };
  }

  return { foreground, background, ratio, wcagLevel: 'Pass' };
}
```

## Advanced Topics

### Color Mixing in Different Color Spaces

```javascript
// RGB mixing (additive)
function mixRGB(color1, color2, ratio = 0.5) {
  return {
    r: color1.r * (1 - ratio) + color2.r * ratio,
    g: color1.g * (1 - ratio) + color2.g * ratio,
    b: color1.b * (1 - ratio) + color2.b * ratio
  };
}

// LAB mixing (perceptually uniform)
function mixLAB(color1, color2, ratio = 0.5) {
  return {
    L: color1.L * (1 - ratio) + color2.L * ratio,
    a: color1.a * (1 - ratio) + color2.a * ratio,
    b: color1.b * (1 - ratio) + color2.b * ratio
  };
}
```

### Color Temperature and Lighting

```javascript
const lightingAdjustments = {
  incandescent: { // 2700K - Warm
    redShift: +15,
    blueShift: -20
  },
  fluorescent: { // 4000K - Cool white
    redShift: -5,
    blueShift: +10
  },
  daylight: { // 6500K - Natural
    redShift: 0,
    blueShift: 0
  },
  led: { // Variable 2700-6500K
    redShift: -10,
    blueShift: +5
  }
};
```

## Conclusion

The Sanzo Color System represents a perfect marriage of artistic intuition and scientific methodology. By understanding both the historical context of Sanzo Wada's work and the modern color science that validates it, designers can create harmonious, psychologically effective, and culturally sensitive color palettes.

Key takeaways:
1. **Sanzo's combinations are timeless** because they're based on fundamental principles of human perception
2. **Color harmony is both art and science** - measurable yet subjective
3. **Context matters** - room type, age group, culture all influence color perception
4. **Technology enhances tradition** - modern algorithms help apply classical principles

## Further Reading

- Sanzo Wada's "A Dictionary of Color Combinations" (1918)
- "Interaction of Color" by Josef Albers
- CIE Color Space specifications
- WCAG 2.1 Color Contrast Guidelines
- "The Elements of Color" by Johannes Itten

---

*"Color is a power which directly influences the soul." - Wassily Kandinsky*