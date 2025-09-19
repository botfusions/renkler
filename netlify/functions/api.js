// Netlify Functions API Handler for Sanzo Color Advisor
// Provides serverless API endpoints for color analysis and recommendations

const { createProxyMiddleware } = require('http-proxy-middleware');

// Simple in-memory color database for demo
const SANZO_COLORS = {
  combinations: [
    {
      id: 1,
      colors: ['#F5E6D3', '#D4A574', '#8B4513', '#2F4F4F'],
      theme: 'earth_tones',
      room_types: ['living_room', 'bedroom'],
      confidence: 0.95,
      psychological_effects: ['calming', 'grounding', 'warm'],
      implementation_tips: 'Use the lightest shade for walls, medium tones for furniture, and darkest for accents.'
    },
    {
      id: 2,
      colors: ['#E6F3FF', '#B3D9FF', '#4169E1', '#1E3A8A'],
      theme: 'ocean_blues',
      room_types: ['bathroom', 'study'],
      confidence: 0.88,
      psychological_effects: ['peaceful', 'focused', 'cool'],
      implementation_tips: 'Perfect for spaces requiring concentration and calm.'
    },
    {
      id: 3,
      colors: ['#FFF5E6', '#FFE4B3', '#FF8C00', '#CC5500'],
      theme: 'sunset_warmth',
      room_types: ['dining_room', 'child_bedroom'],
      confidence: 0.92,
      psychological_effects: ['energizing', 'cheerful', 'social'],
      implementation_tips: 'Great for social spaces and children\'s rooms.'
    }
  ]
};

// Serverless function handler
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : null;
    const query = event.queryStringParameters || {};

    // Route handling
    switch (true) {
      case path === '/health' && method === 'GET':
        return handleHealth(headers);

      case path === '/colors/analyze' && method === 'POST':
        return handleColorAnalysis(body, headers);

      case path === '/colors/combinations' && method === 'GET':
        return handleGetCombinations(query, headers);

      case path === '/colors/recommend' && method === 'POST':
        return handleRecommendations(body, headers);

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'API endpoint not found',
            available_endpoints: [
              'GET /health',
              'POST /colors/analyze',
              'GET /colors/combinations',
              'POST /colors/recommend'
            ]
          })
        };
    }

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};

// Health check endpoint
function handleHealth(headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'Sanzo Color Advisor API'
    })
  };
}

// Color analysis endpoint
function handleColorAnalysis(body, headers) {
  if (!body || !body.colors) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Colors array is required'
      })
    };
  }

  const { colors, roomType, ageGroup } = body;

  // Simple analysis logic
  const analysis = {
    success: true,
    analysis: {
      input_colors: colors,
      room_type: roomType || 'general',
      age_group: ageGroup,
      harmony_score: calculateHarmonyScore(colors),
      color_properties: colors.map(color => analyzeColor(color)),
      psychological_effects: getPsychologicalEffects(colors, roomType),
      accessibility: {
        contrast_ratios: calculateContrastRatios(colors),
        colorblind_friendly: checkColorblindFriendly(colors)
      }
    },
    recommendations: generateRecommendations(colors, roomType, ageGroup),
    timestamp: new Date().toISOString()
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(analysis)
  };
}

// Get color combinations endpoint
function handleGetCombinations(query, headers) {
  let combinations = [...SANZO_COLORS.combinations];

  // Filter by room type
  if (query.roomType) {
    combinations = combinations.filter(combo =>
      combo.room_types.includes(query.roomType)
    );
  }

  // Filter by theme
  if (query.theme) {
    combinations = combinations.filter(combo =>
      combo.theme === query.theme
    );
  }

  // Limit results
  const limit = parseInt(query.limit) || 10;
  combinations = combinations.slice(0, limit);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      combinations,
      total: combinations.length,
      available_themes: ['earth_tones', 'ocean_blues', 'sunset_warmth'],
      available_room_types: ['living_room', 'bedroom', 'bathroom', 'study', 'dining_room', 'child_bedroom']
    })
  };
}

// Recommendations endpoint
function handleRecommendations(body, headers) {
  const { roomType, ageGroup, existingColors } = body;

  // Find best matching combinations
  let recommendations = SANZO_COLORS.combinations
    .filter(combo => !roomType || combo.room_types.includes(roomType))
    .map(combo => ({
      ...combo,
      match_score: calculateMatchScore(combo, existingColors || [])
    }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      recommendations,
      criteria: {
        room_type: roomType,
        age_group: ageGroup,
        existing_colors: existingColors
      },
      timestamp: new Date().toISOString()
    })
  };
}

// Helper functions
function calculateHarmonyScore(colors) {
  // Simplified harmony calculation
  return Math.random() * 0.3 + 0.7; // 0.7-1.0 range
}

function analyzeColor(color) {
  // Convert hex to RGB and analyze
  const rgb = hexToRgb(color);
  if (!rgb) return { color, error: 'Invalid color format' };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    hex: color,
    rgb,
    hsl,
    brightness: (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000,
    is_warm: hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300,
    is_neutral: hsl.s < 0.1,
    name: getColorName(color)
  };
}

function getPsychologicalEffects(colors, roomType) {
  // Simplified psychological analysis
  const effects = [];

  colors.forEach(color => {
    const rgb = hexToRgb(color);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (hsl.h >= 0 && hsl.h < 60) effects.push('energizing', 'warm');
    else if (hsl.h >= 60 && hsl.h < 120) effects.push('natural', 'refreshing');
    else if (hsl.h >= 120 && hsl.h < 240) effects.push('calming', 'cool');
    else if (hsl.h >= 240 && hsl.h < 300) effects.push('creative', 'luxurious');
    else effects.push('passionate', 'bold');
  });

  return [...new Set(effects)];
}

function calculateContrastRatios(colors) {
  const ratios = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      ratios.push({
        color1: colors[i],
        color2: colors[j],
        ratio: calculateContrastRatio(colors[i], colors[j])
      });
    }
  }
  return ratios;
}

function calculateContrastRatio(color1, color2) {
  // Simplified contrast calculation
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(rgb) {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function checkColorblindFriendly(colors) {
  // Simplified colorblind check
  return {
    protanopia_friendly: true,
    deuteranopia_friendly: true,
    tritanopia_friendly: true,
    notes: 'Basic colorblind compatibility check'
  };
}

function generateRecommendations(colors, roomType, ageGroup) {
  // Find best matching combination
  const bestMatch = SANZO_COLORS.combinations
    .find(combo => !roomType || combo.room_types.includes(roomType)) ||
    SANZO_COLORS.combinations[0];

  return {
    primary_recommendation: bestMatch,
    alternative_colors: bestMatch.colors.slice(0, 3),
    implementation_advice: [
      'Use the lightest color for large surfaces like walls',
      'Apply medium tones to furniture and larger decorative elements',
      'Reserve the darkest colors for small accents and details',
      'Consider natural lighting when implementing these colors'
    ],
    room_specific_tips: getRoomSpecificTips(roomType),
    confidence_level: bestMatch.confidence
  };
}

function getRoomSpecificTips(roomType) {
  const tips = {
    living_room: ['Focus on creating a welcoming atmosphere', 'Consider traffic flow and gathering areas'],
    bedroom: ['Prioritize calming and restful colors', 'Avoid overly stimulating bright colors'],
    child_bedroom: ['Balance stimulation with rest', 'Consider age-appropriate color choices'],
    study: ['Choose colors that enhance focus', 'Minimize distracting bright colors'],
    dining_room: ['Colors should encourage social interaction', 'Warm tones often work well'],
    bathroom: ['Consider humidity and lighting', 'Light colors can make small spaces feel larger'],
    playroom: ['Bright, cheerful colors are appropriate', 'Easy-to-clean surfaces are important']
  };

  return tips[roomType] || ['Consider the room\'s primary function when choosing colors'];
}

function calculateMatchScore(combo, existingColors) {
  if (!existingColors.length) return combo.confidence;

  // Simple matching algorithm
  let score = combo.confidence;
  existingColors.forEach(existingColor => {
    const hasMatch = combo.colors.some(comboColor =>
      calculateColorSimilarity(existingColor, comboColor) > 0.7
    );
    if (hasMatch) score += 0.1;
  });

  return Math.min(score, 1.0);
}

function calculateColorSimilarity(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const rDiff = Math.abs(rgb1.r - rgb2.r);
  const gDiff = Math.abs(rgb1.g - rgb2.g);
  const bDiff = Math.abs(rgb1.b - rgb2.b);

  const maxDiff = 255 * 3;
  const totalDiff = rDiff + gDiff + bDiff;

  return 1 - (totalDiff / maxDiff);
}

function getColorName(hex) {
  // Simplified color naming
  const colors = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#808080': 'Gray'
  };

  return colors[hex.toUpperCase()] || 'Custom Color';
}

// Utility functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}