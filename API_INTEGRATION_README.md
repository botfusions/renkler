# Sanzo Color Advisor API Integration

This document provides comprehensive documentation for the API integration modules of the Sanzo Color Advisor system.

## 🎯 Overview

The Sanzo Color Advisor API provides three main integration modules:

1. **GitHub API Integration** - Fetches color data from mattdesl/dictionary-of-colour-combinations
2. **Web Scraper Module** - Respectfully scrapes wada-sanzo-colors.com for additional data
3. **Express.js API Server** - RESTful API with comprehensive endpoints

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev

# Or start production server
npm start
```

### Basic Usage

```bash
# Health check
curl http://localhost:3000/api/health

# Analyze colors
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "roomType": "living_room",
    "ageGroup": "adult",
    "wall": "#F5F5F5",
    "furniture": "#8B4513"
  }'

# Get color combinations
curl http://localhost:3000/api/combinations?roomType=child_bedroom
```

## 📡 API Endpoints

### Core Endpoints

#### `POST /api/analyze`
Analyzes color schemes and provides recommendations based on Sanzo Wada's principles.

**Request Body:**
```json
{
  "roomType": "living_room",      // Required: child_bedroom, living_room, bedroom, study, dining_room, bathroom, playroom
  "ageGroup": "adult",            // Optional: 0-3, 4-6, 7-12, 13-18, adult, elderly
  "wall": "#F5F5F5",             // Optional: hex color
  "floor": "#8B4513",            // Optional: hex color
  "furniture": "#A0522D",        // Optional: hex color
  "accent": "#FF6347",           // Optional: hex color
  "preferences": {}              // Optional: additional preferences
}
```

**Response:**
```json
{
  "success": true,
  "message": "Color analysis completed successfully",
  "data": {
    "recommendations": [
      {
        "id": "sanzo_wada_classic_warm",
        "name": "Wada Classic Warm",
        "type": "sanzo_harmony",
        "confidence": 95,
        "colors": {
          "accent": {
            "hex": "#D2691E",
            "rgb": {"r": 210, "g": 105, "b": 30},
            "lab": {"l": 58.2, "a": 25.4, "b": 61.3},
            "hsl": {"h": 25, "s": 75, "l": 47}
          }
        },
        "reasoning": "Based on Sanzo Wada's \"Wada Classic Warm\" harmony...",
        "psychologicalEffects": "comfort, warmth, traditional elegance",
        "suitabilityScore": 92,
        "implementationTips": ["Consider using removable wall decals..."]
      }
    ],
    "analysis": {
      "existingColors": {...},
      "roomRequirements": {...},
      "ageGroupRequirements": {...},
      "psychologicalProfile": {...}
    }
  },
  "timestamp": "2025-09-15T10:30:00.000Z"
}
```

#### `GET /api/colors`
Retrieves paginated list of Sanzo colors.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)
- `search` (string): Search term for color names or hex values
- `category` (string): Filter by color category

#### `GET /api/combinations`
Retrieves paginated list of color combinations.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)
- `roomType` (string): Filter by room type
- `ageGroup` (string): Filter by age group
- `style` (string): Filter by style

#### `POST /api/colors/similar`
Finds similar colors using perceptual color distance.

**Request Body:**
```json
{
  "color": "#FF0000",           // Required: hex color
  "limit": 10,                  // Optional: max results (default: 10, max: 50)
  "threshold": 20               // Optional: distance threshold (default: 10, max: 100)
}
```

### Data Sync Endpoints

#### `POST /api/sync`
Synchronizes with external data sources.

**Request Body:**
```json
{
  "source": "all",              // Required: all, github, web
  "force": false                // Optional: force sync even if cache is valid
}
```

### System Endpoints

#### `GET /api/health`
Health check endpoint with service status.

#### `GET /api/docs`
API documentation endpoint.

#### `GET /api/cache/status`
Cache status information.

#### `DELETE /api/cache`
Clear all caches.

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ANALYSIS_RATE_LIMIT_WINDOW_MS=60000
ANALYSIS_RATE_LIMIT_MAX_REQUESTS=10

# Cache Configuration
CACHE_EXPIRY_MS=3600000
GITHUB_CACHE_EXPIRY_MS=3600000
WEB_SCRAPER_CACHE_EXPIRY_MS=86400000

# Web Scraper Configuration
WEB_SCRAPER_REQUEST_DELAY=2000
WEB_SCRAPER_MAX_RETRIES=3
WEB_SCRAPER_TIMEOUT=30000
```

## 📚 Integration Modules

### 1. GitHub API Integration (`src/api/githubAPI.js`)

**Features:**
- Connects to mattdesl/dictionary-of-colour-combinations repository
- Fetches latest color data and combinations
- Converts GitHub data format to standardized JSON structure
- Implements rate limiting and error handling
- Provides offline capability through caching
- Synchronizes with local database

**Key Methods:**
```javascript
const githubAPI = new GitHubAPI();

// Get repository information
const repoInfo = await githubAPI.getRepositoryInfo();

// Fetch color combinations
const combinations = await githubAPI.fetchColorCombinations();

// Sync with repository
const syncResult = await githubAPI.syncWithRepository();

// Health check
const health = await githubAPI.healthCheck();
```

**Rate Limiting:**
- 1 second delay between requests
- Respects GitHub API rate limits
- Automatic retry with exponential backoff
- Rate limit headers monitoring

### 2. Web Scraper Module (`src/api/webScraper.js`)

**Features:**
- Respectful scraping of wada-sanzo-colors.com
- Extracts LAB values and color information
- Handles dynamic content loading
- Implements proper delays and robots.txt compliance
- Data validation and error handling
- Fallback mechanisms for site changes

**Key Methods:**
```javascript
const webScraper = new WebScraper();

// Check robots.txt compliance
const robotsRules = await webScraper.checkRobotsTxt();

// Discover color pages
const pages = await webScraper.discoverColorPages();

// Scrape specific page
const colorData = await webScraper.scrapeColorPage(url);

// Scrape all pages
const allData = await webScraper.scrapeAllColorPages();
```

**Respectful Scraping:**
- 2-second delay between requests
- Maximum 1 concurrent request
- Robots.txt compliance checking
- Proper User-Agent identification
- Request queue management

### 3. Express.js API Server (`src/index.js`)

**Features:**
- Production-ready Express.js server
- Comprehensive error handling and logging
- Rate limiting and security headers
- CORS setup for frontend integration
- Request validation and sanitization
- API documentation endpoints

**Security Features:**
- Helmet.js for security headers
- Rate limiting per IP and endpoint
- Request size limits
- CORS configuration
- Input validation and sanitization

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:api

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

### API Testing Script

```bash
# Test against local server
node scripts/test-api.js

# Test against custom URL
node scripts/test-api.js http://localhost:8080

# Wait for server and then test
node scripts/test-api.js --wait
```

### Manual Testing

```bash
# Health check
npm run health

# API documentation
npm run docs

# Sync GitHub data
npm run sync:github

# Sync web data
npm run sync:web
```

## 🔍 Color Analysis Engine

The system uses the advanced `SanzoColorAgent` which implements:

- **Sanzo Wada's Color Harmony Principles** from his 1918 Dictionary
- **Room-specific Optimization** for different spaces
- **Age-group Psychological Effects** for appropriate recommendations
- **Color Temperature Analysis** and perceptual color matching
- **Confidence Scoring** for recommendation quality
- **Implementation Tips** for practical application

### Analysis Process

1. **Input Validation** - Validates room type, age group, and color formats
2. **Existing Color Analysis** - Analyzes provided colors for harmony and properties
3. **Requirement Matching** - Matches against room and age group requirements
4. **Recommendation Generation** - Creates multiple recommendations using different strategies
5. **Confidence Scoring** - Scores recommendations based on multiple factors
6. **Psychological Analysis** - Analyzes psychological effects of recommendations

## 📊 Data Sources

### Primary Sources
- **Sanzo Wada's Original Work** - 1918 Dictionary of Color Combinations
- **mattdesl/dictionary-of-colour-combinations** - Digital reproduction
- **wada-sanzo-colors.com** - Additional color data and LAB values

### Data Processing
- **Color Space Conversions** - Hex, RGB, LAB, HSL conversions
- **Perceptual Color Matching** - Delta E 2000 color distance
- **Harmony Analysis** - Based on color theory principles
- **Psychological Mapping** - Color-to-emotion associations

## 🚦 Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "status": 400,
    "timestamp": "2025-09-15T10:30:00.000Z",
    "details": "Additional error information"
  }
}
```

### Common Error Codes

- **400 Bad Request** - Invalid input parameters
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - External service unavailable

## 🎨 Development

### Project Structure

```
src/
├── api/
│   ├── githubAPI.js          # GitHub integration
│   ├── webScraper.js         # Web scraping module
│   └── index.js              # Main API server
├── components/
│   └── ColorAgent.js         # Color analysis engine
├── utils/
│   ├── colorConversions.js   # Color space conversions
│   ├── deltaE.js             # Color distance calculations
│   ├── validators.js         # Input validation
│   └── responseHelpers.js    # Response formatting
├── data/
│   ├── sanzo-colors.json     # Sanzo color database
│   └── combinations.json     # Color combinations
└── tests/
    └── api/                  # API integration tests
```

### Adding New Endpoints

1. Add route to `src/index.js`
2. Implement validation using `src/utils/validators.js`
3. Format responses using `src/utils/responseHelpers.js`
4. Add tests to `tests/api/`
5. Update API documentation

### Extending Color Analysis

1. Modify `src/components/ColorAgent.js`
2. Add new color theories or principles
3. Update psychological effects mapping
4. Add age group or room type support
5. Test with various color combinations

## 🌐 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup

```bash
# Production environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Enable trust proxy for load balancers
TRUST_PROXY=true

# Configure logging
LOG_LEVEL=info
LOG_FORMAT=combined
```

### Health Monitoring

The API provides comprehensive health monitoring:

- Service availability checks
- Response time monitoring
- External service status
- Cache health validation
- Rate limit monitoring

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Submit pull request

## 📞 Support

For issues and questions:
- Check the API documentation at `/api/docs`
- Review test examples in `tests/api/`
- Use the health check endpoint for diagnostics
- Check logs for detailed error information