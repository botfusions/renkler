# Sanzo Color Advisor - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Basic Usage](#basic-usage)
5. [Features Overview](#features-overview)
6. [Interface Navigation](#interface-navigation)
7. [Accessibility Features](#accessibility-features)
8. [Tips for Best Results](#tips-for-best-results)

## Introduction

Welcome to the **Sanzo Color Advisor**, an AI-powered interior design tool based on Sanzo Wada's legendary "Dictionary of Color Combinations" (1918). This application helps you:

- 🎨 Find perfect color combinations for any room
- 🏠 Get room-specific color recommendations
- 👶 Choose age-appropriate colors for children's rooms
- ♿ Ensure WCAG accessibility compliance
- 🚀 Experience blazing-fast color calculations (300k+ operations/second)

## Installation

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)
- **Node.js**: Version 18.0 or higher
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: 500MB free space

### Installation Steps

#### Option 1: Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/sanzo-color-advisor.git

# Navigate to project directory
cd sanzo-color-advisor

# Install dependencies
npm install

# Start the application
npm start
```

The application will be available at `http://localhost:3000`

#### Option 2: Docker Installation

```bash
# Pull the Docker image
docker pull sanzo-color-advisor:latest

# Run the container
docker run -p 3000:3000 sanzo-color-advisor
```

#### Option 3: Production Deployment

```bash
# Install dependencies
npm install --production

# Build for production
npm run build

# Start with PM2 (recommended for production)
pm2 start ecosystem.config.js
```

### Verification

After installation, verify everything is working:

```bash
# Check health status
npm run health

# Run basic tests
npm test
```

## Quick Start

### 5-Minute Tutorial

1. **Start the Application**
   ```bash
   npm start
   ```
   Open your browser to `http://localhost:3000`

2. **Select a Room Type**
   - Click on the room selector dropdown
   - Choose from: Living Room, Bedroom, Kitchen, Office, Bathroom, Child's Room

3. **Input a Base Color**
   - Enter a hex color code (e.g., `#4682B4`)
   - Or use the color picker tool
   - Or select from preset colors

4. **Get Recommendations**
   - Click "Analyze Color"
   - View AI-generated color palettes
   - See harmony scores and psychological effects

5. **Apply Filters** (Optional)
   - Set age group for child-appropriate colors
   - Choose style preferences (Modern, Traditional, Minimalist)
   - Enable accessibility mode for WCAG compliance

### Your First Color Analysis

Let's create a calming bedroom palette:

1. Navigate to the main interface
2. Select **"Bedroom"** from the room dropdown
3. Enter base color: `#87CEEB` (Sky Blue)
4. Click **"Analyze Color"**

You'll receive:
- **Primary Palette**: 4-5 harmonious colors
- **Confidence Score**: AI's confidence in the recommendation (0-100%)
- **Psychological Impact**: "Promotes relaxation and sleep quality"
- **Alternative Options**: 2-3 alternative palettes

## Basic Usage

### Understanding the Interface

```
┌─────────────────────────────────────────────┐
│  🎨 Sanzo Color Advisor                    │
├─────────────────────────────────────────────┤
│                                             │
│  Room Type:    [Dropdown Menu      ▼]      │
│                                             │
│  Base Color:   [#______] [Color Picker]    │
│                                             │
│  Age Group:    [○ All] [○ 0-3] [○ 4-6]    │
│                [○ 7-12] [○ 13-18] [○ Adult]│
│                                             │
│  Style:        [□ Modern] [□ Traditional]  │
│                [□ Minimalist] [□ Bold]     │
│                                             │
│         [Analyze Color] [Clear]            │
│                                             │
├─────────────────────────────────────────────┤
│  Results:                                   │
│  ┌─────────────────────────────────────┐   │
│  │ Recommended Palette                  │   │
│  │ [Color] [Color] [Color] [Color]     │   │
│  │ Confidence: 92%                      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Color Input Methods

#### 1. Hex Code Entry
Enter colors in standard hex format:
- Full hex: `#4682B4`
- Short hex: `#469` (expands to `#446699`)

#### 2. Color Picker
Click the color picker icon to visually select colors

#### 3. Named Colors
Use CSS color names:
- `steelblue`
- `coral`
- `forestgreen`

#### 4. RGB Values
Enter RGB values:
- `rgb(70, 130, 180)`
- `rgba(70, 130, 180, 0.8)`

### Room-Specific Settings

Each room type has optimized parameters:

| Room Type | Optimization Focus | Default Style |
|-----------|-------------------|---------------|
| Living Room | Social, energizing | Warm & inviting |
| Bedroom | Calming, restful | Soft & serene |
| Kitchen | Clean, appetizing | Bright & fresh |
| Office | Productive, focused | Professional |
| Bathroom | Clean, spa-like | Light & airy |
| Child's Room | Stimulating, safe | Playful & bright |

## Features Overview

### 1. AI-Powered Analysis

The system uses advanced algorithms to:
- Calculate color harmonies based on Sanzo Wada's principles
- Compute Delta E color differences for perceptual accuracy
- Generate confidence scores for recommendations
- Provide multiple palette options

### 2. Performance Optimization

- **WebAssembly acceleration**: 10x faster color calculations
- **Web Worker processing**: Non-blocking UI operations
- **Smart caching**: Instant repeated queries
- **Batch processing**: Handle multiple colors simultaneously

### 3. Accessibility Features

#### WCAG 2.1 Compliance
- **AA Level**: Minimum contrast ratio 4.5:1 for normal text
- **AAA Level**: Enhanced contrast ratio 7:1 for maximum readability

#### Color Blind Modes
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Achromatopsia (complete color blindness)

#### Screen Reader Support
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators for all controls

### 4. Export Options

Save your color palettes in multiple formats:

- **JSON**: For developers and API integration
- **CSS**: Ready-to-use CSS variables
- **Adobe Swatch Exchange (.ASE)**: For Adobe Creative Suite
- **Image**: PNG palette preview
- **PDF Report**: Complete analysis document

## Interface Navigation

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Focus color input |
| `Ctrl + Enter` | Analyze color |
| `Ctrl + R` | Reset form |
| `Ctrl + E` | Export palette |
| `Tab` | Navigate between fields |
| `Space` | Toggle checkboxes |
| `Esc` | Close modals |

### Advanced Controls

#### Harmony Type Selection
Choose specific color harmony rules:
- Complementary
- Analogous
- Triadic
- Tetradic
- Split-complementary

#### Fine-Tuning Options
- **Saturation**: Adjust color intensity (0-100%)
- **Brightness**: Control lightness/darkness (0-100%)
- **Temperature**: Warm/cool balance (-50 to +50)

#### Batch Mode
Analyze multiple colors at once:
1. Click "Batch Mode"
2. Enter multiple hex codes (one per line)
3. Click "Analyze All"
4. Compare results side-by-side

## Accessibility Features

### Visual Accessibility

#### High Contrast Mode
Enable for better visibility:
```
Settings → Accessibility → High Contrast [ON]
```

#### Large Text Mode
Increase font sizes:
```
Settings → Accessibility → Text Size [Large]
```

#### Focus Indicators
Enhanced focus outlines for keyboard navigation

### Motor Accessibility

- **Large Click Targets**: Minimum 44x44 pixel touch targets
- **Reduced Motion**: Disable animations for motion sensitivity
- **Sticky Controls**: Keep frequently used controls visible

### Cognitive Accessibility

- **Simple Language**: Clear, jargon-free explanations
- **Guided Workflows**: Step-by-step processes
- **Undo/Redo**: Easily reverse actions
- **Help Tooltips**: Contextual help on hover

## Tips for Best Results

### Color Selection Best Practices

1. **Start with a Mood**
   - Calming: Blues, greens, soft purples
   - Energizing: Reds, oranges, bright yellows
   - Neutral: Grays, beiges, soft whites

2. **Consider Natural Light**
   - North-facing rooms: Warm colors compensate for cool light
   - South-facing rooms: Cool colors balance warm sunlight
   - East/West rooms: Neutral tones work best

3. **Follow the 60-30-10 Rule**
   - 60% dominant color (walls)
   - 30% secondary color (furniture)
   - 10% accent color (accessories)

### Room-Specific Tips

#### Living Rooms
- Use warm neutrals as base colors
- Add personality with accent colors
- Consider traffic flow and durability

#### Bedrooms
- Stick to cool, muted tones
- Avoid bright reds and oranges
- Test colors in evening light

#### Children's Rooms
- Use age-appropriate color intensities
- Include educational color elements
- Plan for easy updates as children grow

#### Kitchens
- Choose appetizing colors (avoid blues)
- Consider cabinet and countertop colors
- Ensure good contrast for food preparation

#### Home Offices
- Select focus-enhancing colors
- Avoid overly stimulating palettes
- Consider video call backgrounds

### Troubleshooting Common Issues

#### Colors Look Different on Screen
- Calibrate your monitor
- Check lighting conditions
- Order physical color samples

#### Palette Doesn't Match Expectations
- Try different base colors
- Adjust style preferences
- Use manual fine-tuning

#### Performance Issues
- Clear browser cache
- Close unnecessary tabs
- Update to latest browser version

## Next Steps

Now that you understand the basics:

1. **Explore Advanced Features**
   - Read the [API Reference](API_REFERENCE.md) for programmatic access
   - Check [Room Design Examples](ROOM_DESIGN_EXAMPLES.md) for inspiration

2. **Learn Color Theory**
   - Study [Color Theory Guide](COLOR_THEORY_GUIDE.md)
   - Understand Sanzo Wada's principles

3. **Get Support**
   - Join our community forum
   - Read the [FAQ](TROUBLESHOOTING_FAQ.md)
   - Contact support@sanzocolor.com

## Conclusion

The Sanzo Color Advisor combines century-old color wisdom with modern AI technology to help you create beautiful, harmonious spaces. Whether you're a professional designer or a homeowner, this tool provides the guidance you need to make confident color choices.

Happy designing! 🎨

---

*For technical documentation, see the [Developer Guide](DEVELOPER_GUIDE.md)*
*For troubleshooting, see the [FAQ & Troubleshooting Guide](TROUBLESHOOTING_FAQ.md)*