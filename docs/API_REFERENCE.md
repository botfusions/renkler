# Sanzo Color Advisor - API Reference

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Rate Limiting](#rate-limiting)
5. [Core Endpoints](#core-endpoints)
6. [SanzoColorAgent API](#sanzocoloragent-api)
7. [JavaScript SDK](#javascript-sdk)
8. [Code Examples](#code-examples)
9. [WebSocket API](#websocket-api)
10. [Error Handling](#error-handling)
11. [Response Formats](#response-formats)

## Overview

The Sanzo Color Advisor API provides programmatic access to advanced color analysis and recommendation features. Built on RESTful principles with additional WebSocket support for real-time operations.

### Key Features
- 🎨 Color harmony analysis based on Sanzo Wada's principles
- 🏠 Room-specific color recommendations
- 👶 Age-appropriate color selection
- ♿ WCAG accessibility validation
- ⚡ High-performance calculations (300k+ ops/sec)
- 🔄 Real-time WebSocket updates

## Authentication

### API Key Authentication

```http
Authorization: Bearer YOUR_API_KEY
```

### Obtaining an API Key

```bash
# Register for an API key
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Your Name"}'
```

### API Key Usage

```javascript
const headers = {
  'Authorization': 'Bearer sk_live_abc123xyz789',
  'Content-Type': 'application/json'
};
```

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.sanzocolor.com/v1
```

## Rate Limiting

| Endpoint | Limit | Window | Headers |
|----------|-------|--------|---------|
| General API | 100 requests | 15 minutes | `X-RateLimit-Limit` |
| Analysis | 10 requests | 1 minute | `X-RateLimit-Remaining` |
| Batch | 5 requests | 5 minutes | `X-RateLimit-Reset` |

### Rate Limit Response

```json
{
  "error": "Too many requests",
  "code": 429,
  "retryAfter": 60
}
```

## Core Endpoints

### 1. Color Analysis

#### `POST /api/analyze`

Analyze a color and get harmonious recommendations.

**Request:**
```json
{
  "color": "#4682B4",
  "roomType": "bedroom",
  "ageGroup": "adult",
  "style": ["modern", "minimalist"],
  "options": {
    "includeAccessibility": true,
    "maxRecommendations": 5,
    "confidenceThreshold": 0.8
  }
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "req_abc123",
  "data": {
    "inputColor": {
      "hex": "#4682B4",
      "rgb": [70, 130, 180],
      "hsl": [207, 44, 49],
      "lab": [52.18, -4.88, -32.20],
      "name": "Steel Blue"
    },
    "recommendations": [
      {
        "palette": {
          "name": "Wada Tranquil Blues",
          "colors": [
            {
              "hex": "#4682B4",
              "role": "primary",
              "coverage": 60
            },
            {
              "hex": "#87CEEB",
              "role": "secondary",
              "coverage": 30
            },
            {
              "hex": "#F0F8FF",
              "role": "accent",
              "coverage": 10
            }
          ]
        },
        "confidence": 92,
        "harmony": "analogous",
        "psychology": "Promotes relaxation and mental clarity",
        "accessibility": {
          "wcagAA": true,
          "wcagAAA": false,
          "contrastRatio": 4.52
        }
      }
    ],
    "alternatives": [...],
    "metadata": {
      "processingTime": 12,
      "deltaEMethod": "CIE2000",
      "sanzoReference": "Combination #47"
    }
  }
}
```

### 2. Batch Analysis

#### `POST /api/analyze/batch`

Analyze multiple colors simultaneously.

**Request:**
```json
{
  "colors": ["#FF6347", "#4169E1", "#32CD32"],
  "roomType": "living_room",
  "compareMode": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": [...],
    "comparison": {
      "compatibility": 0.73,
      "recommendation": "Good combination with minor adjustments",
      "suggestedPalette": [...]
    }
  }
}
```

### 3. Color Matching

#### `GET /api/match`

Find the closest Sanzo color to any input.

**Query Parameters:**
- `color` (required): Hex color code
- `count` (optional): Number of matches (default: 5)
- `threshold` (optional): Delta E threshold (default: 10)

**Example:**
```bash
curl "http://localhost:3000/api/match?color=%234682B4&count=3"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inputColor": "#4682B4",
    "matches": [
      {
        "sanzoColor": "#4876B4",
        "name": "Sanzo Blue 47",
        "deltaE": 2.3,
        "combinations": [23, 47, 89]
      }
    ]
  }
}
```

### 4. Palette Generation

#### `POST /api/palette`

Generate custom color palettes.

**Request:**
```json
{
  "baseColor": "#8B4513",
  "harmonyType": "tetradic",
  "count": 4,
  "constraints": {
    "minContrast": 3.0,
    "maxColors": 6,
    "excludeColors": ["#FF0000"]
  }
}
```

### 5. Accessibility Validation

#### `POST /api/accessibility`

Check color combinations for WCAG compliance.

**Request:**
```json
{
  "foreground": "#333333",
  "background": "#FFFFFF",
  "fontSize": 16,
  "fontWeight": 400
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contrastRatio": 12.63,
    "wcagAA": {
      "normal": true,
      "large": true
    },
    "wcagAAA": {
      "normal": true,
      "large": true
    },
    "recommendations": []
  }
}
```

### 6. Room Profiles

#### `GET /api/rooms`

Get available room profiles and their characteristics.

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "bedroom",
        "name": "Bedroom",
        "characteristics": {
          "lightingType": "ambient",
          "activityLevel": "low",
          "preferredTemperature": "cool",
          "psychologicalGoals": ["relaxation", "sleep"]
        },
        "recommendedPalettes": [...]
      }
    ]
  }
}
```

## SanzoColorAgent API

### Class: `SanzoColorAgent`

The core color analysis engine.

#### Constructor

```javascript
const agent = new SanzoColorAgent(options);
```

**Options:**
```javascript
{
  deltaEMethod: 'CIE2000',  // or 'CIE1976', 'CIE1994'
  cacheEnabled: true,
  maxCacheSize: 1000,
  workerThreads: 4
}
```

#### Methods

##### `analyzeColor(color, options)`

```javascript
const result = await agent.analyzeColor('#4682B4', {
  roomType: 'bedroom',
  ageGroup: 'adult',
  style: ['modern']
});
```

##### `findHarmony(baseColor, harmonyType)`

```javascript
const harmony = agent.findHarmony('#FF6347', 'complementary');
// Returns: { colors: [...], confidence: 0.92 }
```

##### `calculateDeltaE(color1, color2)`

```javascript
const deltaE = agent.calculateDeltaE('#FF0000', '#FF0033');
// Returns: 5.23
```

##### `generatePalette(options)`

```javascript
const palette = agent.generatePalette({
  baseColor: '#4682B4',
  count: 5,
  method: 'monochromatic'
});
```

##### `validateAccessibility(foreground, background)`

```javascript
const result = agent.validateAccessibility('#333', '#FFF');
// Returns: { ratio: 12.63, wcagAA: true, wcagAAA: true }
```

## JavaScript SDK

### Installation

```bash
npm install @sanzo/color-advisor-sdk
```

### Basic Usage

```javascript
import { SanzoClient } from '@sanzo/color-advisor-sdk';

const client = new SanzoClient({
  apiKey: 'sk_live_abc123',
  baseURL: 'https://api.sanzocolor.com/v1'
});

// Simple analysis
const result = await client.analyze('#4682B4', {
  room: 'bedroom'
});

// Batch processing
const results = await client.analyzeBatch([
  '#FF6347',
  '#4169E1'
]);

// Real-time updates
client.on('paletteUpdate', (data) => {
  console.log('New palette:', data);
});
```

### Advanced Features

```javascript
// Custom harmony calculation
const harmony = await client.harmony.calculate({
  base: '#8B4513',
  type: 'split-complementary',
  variations: 3
});

// Room-specific optimization
const optimized = await client.rooms.optimize('living_room', {
  existingColors: ['#FFFFFF', '#333333'],
  style: 'modern',
  lighting: 'natural-north'
});

// Age-group filtering
const childSafe = await client.ageGroups.filter('4-6', {
  palette: ['#FF6347', '#4169E1', '#32CD32'],
  safetyLevel: 'strict'
});
```

## Code Examples

### Example 1: Basic Color Analysis

```javascript
// Node.js example
const axios = require('axios');

async function analyzeColor(hexColor) {
  try {
    const response = await axios.post('http://localhost:3000/api/analyze', {
      color: hexColor,
      roomType: 'living_room',
      options: {
        includeAccessibility: true
      }
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error.response?.data || error.message);
  }
}

// Usage
const result = await analyzeColor('#4682B4');
console.log('Recommended palette:', result.data.recommendations[0].palette);
```

### Example 2: React Component

```jsx
import React, { useState, useEffect } from 'react';
import { SanzoClient } from '@sanzo/color-advisor-sdk';

function ColorAdvisor() {
  const [color, setColor] = useState('#4682B4');
  const [palette, setPalette] = useState(null);
  const [loading, setLoading] = useState(false);

  const client = new SanzoClient({
    apiKey: process.env.REACT_APP_SANZO_API_KEY
  });

  const analyzColor = async () => {
    setLoading(true);
    try {
      const result = await client.analyze(color, {
        room: 'bedroom',
        style: ['modern', 'minimalist']
      });
      setPalette(result.recommendations[0]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="color-advisor">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <button onClick={analyzColor} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Color'}
      </button>

      {palette && (
        <div className="palette-display">
          <h3>{palette.name}</h3>
          <div className="colors">
            {palette.colors.map((c, i) => (
              <div
                key={i}
                className="color-swatch"
                style={{ backgroundColor: c.hex }}
              >
                {c.hex}
              </div>
            ))}
          </div>
          <p>Confidence: {palette.confidence}%</p>
        </div>
      )}
    </div>
  );
}
```

### Example 3: Python Integration

```python
import requests
import json

class SanzoColorClient:
    def __init__(self, api_key, base_url='http://localhost:3000/api'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def analyze_color(self, hex_color, room_type='living_room', **options):
        """Analyze a color and get recommendations."""
        endpoint = f'{self.base_url}/analyze'
        payload = {
            'color': hex_color,
            'roomType': room_type,
            'options': options
        }

        response = requests.post(endpoint,
                                json=payload,
                                headers=self.headers)
        response.raise_for_status()
        return response.json()

    def validate_accessibility(self, fg_color, bg_color):
        """Check WCAG compliance for color combination."""
        endpoint = f'{self.base_url}/accessibility'
        payload = {
            'foreground': fg_color,
            'background': bg_color
        }

        response = requests.post(endpoint,
                                json=payload,
                                headers=self.headers)
        response.raise_for_status()
        return response.json()

# Usage
client = SanzoColorClient('your_api_key')

# Analyze a color
result = client.analyze_color('#4682B4', 'bedroom',
                             includeAccessibility=True,
                             maxRecommendations=3)

print(f"Best match: {result['data']['recommendations'][0]['palette']['name']}")
print(f"Confidence: {result['data']['recommendations'][0]['confidence']}%")

# Check accessibility
accessibility = client.validate_accessibility('#333333', '#FFFFFF')
print(f"Contrast ratio: {accessibility['data']['contrastRatio']}")
print(f"WCAG AA compliant: {accessibility['data']['wcagAA']['normal']}")
```

### Example 4: CLI Tool

```bash
#!/bin/bash
# sanzo-cli - Command line color advisor

analyze_color() {
  local color=$1
  local room=${2:-"living_room"}

  curl -s -X POST http://localhost:3000/api/analyze \
    -H "Authorization: Bearer $SANZO_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"color\": \"$color\", \"roomType\": \"$room\"}" \
    | jq '.data.recommendations[0].palette'
}

# Usage: ./sanzo-cli "#4682B4" bedroom
analyze_color "$@"
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'your_api_key'
  }));
});
```

### Real-time Analysis

```javascript
// Subscribe to real-time updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'analysis',
  color: '#4682B4'
}));

// Receive updates
ws.on('message', (data) => {
  const update = JSON.parse(data);
  if (update.type === 'palette_update') {
    console.log('New palette:', update.palette);
  }
});
```

### Collaborative Sessions

```javascript
// Create a session
ws.send(JSON.stringify({
  type: 'create_session',
  roomId: 'design_team_123'
}));

// Share color selections
ws.send(JSON.stringify({
  type: 'share_color',
  roomId: 'design_team_123',
  color: '#4682B4',
  user: 'designer1'
}));
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_COLOR",
    "message": "Invalid color format",
    "details": {
      "provided": "#GGGGGG",
      "expected": "Valid hex color code"
    }
  },
  "requestId": "req_xyz789"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_COLOR` | 400 | Invalid color format |
| `INVALID_ROOM_TYPE` | 400 | Unknown room type |
| `RATE_LIMITED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `SERVER_ERROR` | 500 | Internal server error |
| `TIMEOUT` | 504 | Request timeout |

### Error Handling Best Practices

```javascript
try {
  const result = await client.analyze(color);
  // Handle success
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // Wait and retry
    await sleep(error.retryAfter * 1000);
    return retry();
  } else if (error.code === 'INVALID_COLOR') {
    // Validate input
    console.error('Invalid color provided:', error.details);
  } else {
    // Log unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

## Response Formats

### JSON (Default)

```json
{
  "success": true,
  "data": {...},
  "metadata": {...}
}
```

### CSV Export

```http
GET /api/export?format=csv&paletteId=pal_123
```

```csv
color,role,coverage,confidence
#4682B4,primary,60,92
#87CEEB,secondary,30,92
#F0F8FF,accent,10,92
```

### XML Format

```http
Accept: application/xml
```

```xml
<response>
  <success>true</success>
  <data>
    <palette>
      <color hex="#4682B4" role="primary"/>
    </palette>
  </data>
</response>
```

## Performance Optimization

### Caching

Include cache headers for better performance:

```javascript
const headers = {
  'Cache-Control': 'max-age=3600',
  'ETag': 'W/"123-abc"'
};
```

### Batch Requests

Combine multiple operations:

```javascript
const batchRequest = {
  operations: [
    { method: 'analyze', params: { color: '#FF0000' } },
    { method: 'analyze', params: { color: '#00FF00' } },
    { method: 'analyze', params: { color: '#0000FF' } }
  ]
};
```

### Compression

Enable gzip compression:

```javascript
const headers = {
  'Accept-Encoding': 'gzip, deflate'
};
```

## SDK Methods Reference

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `analyze(color, options)` | Analyze a single color | `Promise<Analysis>` |
| `analyzeBatch(colors, options)` | Analyze multiple colors | `Promise<Analysis[]>` |
| `match(color, count)` | Find closest Sanzo colors | `Promise<Match[]>` |
| `generatePalette(options)` | Create custom palette | `Promise<Palette>` |
| `validateAccessibility(fg, bg)` | Check WCAG compliance | `Promise<Validation>` |

### Utility Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `convertColor(color, format)` | Convert between formats | `string` |
| `calculateDeltaE(c1, c2)` | Calculate color difference | `number` |
| `getColorName(hex)` | Get descriptive name | `string` |
| `isValidColor(color)` | Validate color format | `boolean` |

## Migration Guide

### From v1 to v2

```javascript
// v1 (deprecated)
const result = agent.analyze('#4682B4');

// v2 (current)
const result = await agent.analyzeColor('#4682B4', {
  roomType: 'bedroom'
});
```

## Support

- **Documentation**: https://docs.sanzocolor.com
- **API Status**: https://status.sanzocolor.com
- **Support Email**: api-support@sanzocolor.com
- **GitHub**: https://github.com/sanzocolor/api

---

*Last updated: September 2025*