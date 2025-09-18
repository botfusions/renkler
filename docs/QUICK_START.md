# Quick Start Guide - 5 Minutes to Color Excellence

## 1. Installation (2 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/sanzo-color-advisor.git
cd sanzo-color-advisor

# Install dependencies
npm install

# Start server
npm start
```

Server runs at `http://localhost:3000`

## 2. First API Call (1 minute)

### Get Color Recommendations

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "roomType": "living",
    "style": "modern",
    "lighting": "natural"
  }'
```

### Response Example
```json
{
  "success": true,
  "data": {
    "primaryColor": {
      "name": "Kokimurasaki",
      "hex": "#3E1E3F",
      "rgb": [62, 30, 63],
      "meaning": "deep purple"
    },
    "palette": [
      { "name": "Shironeri", "hex": "#FBF9ED" },
      { "name": "Ginnezumi", "hex": "#949194" }
    ],
    "harmony": "complementary",
    "accessibility": {
      "wcagRating": "AAA",
      "contrastRatio": 8.5
    }
  }
}
```

## 3. Web Interface (1 minute)

Open browser: `http://localhost:3000`

### Quick Features:
- **Color Picker**: Select base colors
- **Room Selector**: Choose room type
- **Instant Preview**: See combinations live
- **Export**: Download palettes as JSON/CSS

## 4. Essential Commands (1 minute)

```bash
# Development mode with hot reload
npm run dev

# Run tests
npm test

# Check API health
npm run health

# View metrics
npm run metrics

# Sync color database
npm run sync:github
```

## 5. Basic Usage Examples

### Living Room Palette
```javascript
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomType: 'living',
    style: 'traditional',
    lighting: 'mixed',
    preferences: {
      warmth: 'warm',
      energy: 'calm'
    }
  })
});
```

### Children's Room (Age-Specific)
```javascript
const response = await fetch('http://localhost:3000/api/children-room', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ageGroup: '3-6',
    gender: 'neutral',
    theme: 'nature'
  })
});
```

### Accessibility Check
```javascript
const response = await fetch('http://localhost:3000/api/accessibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    foreground: '#3E1E3F',
    background: '#FBF9ED'
  })
});
```

## Next Steps

- **Explore Features**: See [Essential Features](./ESSENTIAL_FEATURES.md)
- **Learn Color Theory**: Read [Color Essentials](./COLOR_ESSENTIALS.md)
- **Room Design**: Check [Room Guide](./ROOM_GUIDE.md)
- **API Documentation**: Review [API Quick Reference](./API_QUICK_REFERENCE.md)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change port: `PORT=3001 npm start` |
| Installation fails | Update Node.js to v18+ |
| API returns 429 | Rate limit hit, wait 60 seconds |
| CORS errors | Check allowed origins in `.env` |

---

**Need help?** Check [Troubleshooting FAQ](./TROUBLESHOOTING_FAQ.md) or open an issue.