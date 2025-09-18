# API Quick Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

## Core Endpoints

### 1. Color Analysis
```http
POST /analyze
```

**Request:**
```json
{
  "roomType": "living|bedroom|kitchen|bathroom|office|children",
  "style": "modern|traditional|minimal|eclectic",
  "lighting": "natural|artificial|mixed",
  "preferences": {
    "warmth": "cool|neutral|warm",
    "energy": "calm|balanced|vibrant"
  }
}
```

**Response:**
```json
{
  "primaryColor": { "name": "Kokimurasaki", "hex": "#3E1E3F" },
  "palette": [...],
  "harmony": "complementary|analogous|triadic",
  "accessibility": { "wcagRating": "AAA", "contrastRatio": 8.5 }
}
```

### 2. Color Search
```http
GET /colors/search?q={query}
```

**Parameters:**
- `q`: Search term (name, hex, or keyword)
- `limit`: Max results (default: 10)
- `category`: Filter by category

**Example:**
```bash
curl "http://localhost:3000/api/colors/search?q=purple&limit=5"
```

### 3. Palette Generation
```http
POST /palette/generate
```

**Request:**
```json
{
  "baseColor": "#3E1E3F",
  "harmony": "complementary|split|analogous|triadic|tetradic",
  "count": 5,
  "constraints": {
    "minContrast": 4.5,
    "avoidColors": ["#FF0000"]
  }
}
```

### 4. Accessibility Check
```http
POST /accessibility/check
```

**Request:**
```json
{
  "foreground": "#3E1E3F",
  "background": "#FFFFFF",
  "fontSize": 16,
  "fontWeight": 400
}
```

**Response:**
```json
{
  "contrastRatio": 12.63,
  "wcagAA": { "normal": true, "large": true },
  "wcagAAA": { "normal": true, "large": true },
  "recommendations": [...]
}
```

### 5. Room-Specific Recommendations

#### Children's Room
```http
POST /rooms/children
```

**Request:**
```json
{
  "ageGroup": "0-2|3-6|7-12|13+",
  "gender": "neutral|masculine|feminine",
  "theme": "nature|space|animals|fantasy"
}
```

#### Office Space
```http
POST /rooms/office
```

**Request:**
```json
{
  "workType": "creative|analytical|collaborative",
  "screenTime": "low|medium|high",
  "naturalLight": true
}
```

### 6. Color Combinations
```http
GET /combinations/{paletteId}
```

**Example:**
```bash
curl "http://localhost:3000/api/combinations/158"
```

### 7. Export Palette
```http
POST /export
```

**Request:**
```json
{
  "palette": [...],
  "format": "json|css|scss|xml|ase",
  "options": {
    "includeVariations": true,
    "darkMode": true
  }
}
```

## Advanced Endpoints

### Batch Processing
```http
POST /batch/analyze
```

Process multiple rooms at once:
```json
{
  "rooms": [
    { "type": "living", "style": "modern" },
    { "type": "bedroom", "style": "minimal" }
  ]
}
```

### Historical Analysis
```http
GET /analytics/trends
```

**Parameters:**
- `period`: day|week|month|year
- `metric`: popularity|usage|combinations

### WebSocket Streaming
```javascript
// Real-time color analysis
const ws = new WebSocket('ws://localhost:3000/stream');

ws.send(JSON.stringify({
  event: 'subscribe',
  channel: 'color-analysis'
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Resource created |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Verify API key |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Contact support |

## Rate Limits

| Tier | Requests/Min | Requests/Day |
|------|-------------|--------------|
| Free | 10 | 100 |
| Pro | 60 | 1000 |
| Enterprise | Unlimited | Unlimited |

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "INVALID_COLOR",
    "message": "The provided color format is invalid",
    "details": "Expected hex format: #RRGGBB"
  }
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const SanzoAPI = require('sanzo-color-advisor');
const api = new SanzoAPI({ apiKey: 'YOUR_KEY' });

// Analyze room
const result = await api.analyze({
  roomType: 'living',
  style: 'modern'
});

// Generate palette
const palette = await api.generatePalette({
  baseColor: '#3E1E3F',
  harmony: 'complementary'
});
```

### Python
```python
import sanzo_color_advisor as sanzo

api = sanzo.Client(api_key='YOUR_KEY')

# Analyze room
result = api.analyze(
    room_type='living',
    style='modern'
)

# Check accessibility
accessibility = api.check_accessibility(
    foreground='#3E1E3F',
    background='#FFFFFF'
)
```

### cURL Examples
```bash
# Health check
curl http://localhost:3000/api/health

# Get all colors
curl http://localhost:3000/api/colors

# Search colors
curl "http://localhost:3000/api/colors/search?q=blue"

# Analyze with data
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"roomType":"living","style":"modern"}'
```

## Response Headers

```http
X-Request-ID: abc123
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1632835200
Content-Type: application/json
Cache-Control: max-age=3600
```

## Webhooks (Pro/Enterprise)

Register webhook endpoints for events:
```http
POST /webhooks
```

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["analysis.complete", "palette.generated"],
  "secret": "your-webhook-secret"
}
```

---

**Need complete documentation?** See [Full API Reference](./API_REFERENCE.md)