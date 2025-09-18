# Accessibility Guide - WCAG Compliance & Universal Design

## Quick Start Accessibility

### Check Color Contrast
```javascript
const result = await fetch('/api/accessibility/check', {
  method: 'POST',
  body: JSON.stringify({
    foreground: '#3E1E3F',
    background: '#FFFFFF'
  })
});
// Returns: contrastRatio, WCAG ratings
```

### Minimum Requirements

| Content Type | WCAG AA | WCAG AAA |
|--------------|---------|----------|
| Normal Text | 4.5:1 | 7:1 |
| Large Text (18pt+) | 3:1 | 4.5:1 |
| UI Components | 3:1 | 4.5:1 |
| Graphics | 3:1 | N/A |

## Color Blind Simulations

### Supported Types
```javascript
const simulation = await fetch('/api/accessibility/simulate', {
  method: 'POST',
  body: JSON.stringify({
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    type: 'protanopia' // red-blind
  })
});
```

| Type | Affects | Population |
|------|---------|------------|
| **Protanopia** | Red perception | 1.3% males |
| **Deuteranopia** | Green perception | 5% males |
| **Tritanopia** | Blue perception | 0.001% |
| **Achromatopsia** | No color | 0.003% |

## Accessible Palettes

### High Contrast Mode
```json
{
  "text": "#000000",
  "background": "#FFFFFF",
  "primary": "#0066CC",
  "secondary": "#666666",
  "accent": "#FF6600",
  "error": "#CC0000",
  "success": "#008800",
  "warning": "#FF9900"
}
```

### Dark Mode Accessible
```json
{
  "text": "#F0F0F0",
  "background": "#1A1A1A",
  "primary": "#5EB3FF",
  "secondary": "#B0B0B0",
  "accent": "#FFB366",
  "error": "#FF6B6B",
  "success": "#51CF66",
  "warning": "#FFD93D"
}
```

## Best Practices

### 1. Don't Rely on Color Alone
```html
<!-- Bad -->
<span style="color: red">Error</span>

<!-- Good -->
<span style="color: red">⚠️ Error: Invalid input</span>
```

### 2. Provide Multiple Indicators
- **Color** + Icon
- **Color** + Pattern
- **Color** + Text label
- **Color** + Position

### 3. Test Everything
```javascript
// Full accessibility audit
const audit = await fetch('/api/accessibility/audit', {
  method: 'POST',
  body: JSON.stringify({
    palette: [...yourColors],
    includeSimulations: true,
    includeRecommendations: true
  })
});
```

## Room-Specific Accessibility

### Elderly-Friendly Rooms
```javascript
const elderlyPalette = await fetch('/api/rooms/elderly', {
  method: 'POST',
  body: JSON.stringify({
    visionIssues: ['cataracts', 'macular'],
    contrastRequirement: 'high'
  })
});
```

**Key Considerations:**
- Higher contrast (7:1 minimum)
- Warmer tones (yellowing vision)
- Avoid blue/purple (harder to see)
- Larger color blocks

### Children with Special Needs
```javascript
const specialNeeds = await fetch('/api/rooms/special-needs', {
  method: 'POST',
  body: JSON.stringify({
    conditions: ['autism', 'sensory'],
    sensitivity: 'high'
  })
});
```

**Key Considerations:**
- Muted colors (reduce overstimulation)
- Predictable patterns
- Clear zones/boundaries
- Calming base colors

## Tools & Testing

### Built-in Tools
1. **Contrast Checker**: Real-time ratio calculation
2. **Color Blind Simulator**: 8 vision types
3. **WCAG Validator**: Automatic compliance check
4. **Suggestion Engine**: Alternative color recommendations

### API Testing Endpoints
```bash
# Test single combination
curl -X POST /api/accessibility/check \
  -d '{"fg":"#000","bg":"#FFF"}'

# Batch test palette
curl -X POST /api/accessibility/batch \
  -d '{"combinations":[...]}'

# Get accessible alternatives
curl -X POST /api/accessibility/alternatives \
  -d '{"color":"#FF0000","minContrast":4.5}'
```

## Common Issues & Solutions

| Issue | Solution | API Helper |
|-------|----------|------------|
| Low contrast | Lighten/darken colors | `/api/accessibility/adjust` |
| Color-only info | Add icons/patterns | `/api/accessibility/enhance` |
| Red-green confusion | Use blue-orange | `/api/accessibility/safe-palette` |
| Small text | Increase size or contrast | `/api/accessibility/text-safe` |

## Quick Compliance Checklist

- [ ] All text meets 4.5:1 contrast minimum
- [ ] Large text meets 3:1 contrast minimum
- [ ] Interactive elements have 3:1 contrast
- [ ] Error states use more than color
- [ ] Success states use more than color
- [ ] Links are underlined or bold
- [ ] Focus indicators visible
- [ ] Color blind safe palette used
- [ ] High contrast mode available
- [ ] Tested with screen readers

## Keyboard Navigation

### Focus States
```css
/* Accessible focus indicator */
:focus {
  outline: 3px solid #0066CC;
  outline-offset: 2px;
}
```

### Skip Links
```html
<a href="#main" class="skip-link">Skip to main content</a>
```

## Screen Reader Support

### ARIA Labels
```html
<div role="region" aria-label="Color palette selector">
  <button aria-label="Select purple color, hex 3E1E3F">
    Purple
  </button>
</div>
```

### Live Regions
```html
<div aria-live="polite" aria-atomic="true">
  Color contrast: 7.2:1 - WCAG AAA compliant
</div>
```

## Performance & Accessibility

### Reduced Motion
```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Disable animations
}
```

### High Contrast Mode
```javascript
const prefersHighContrast = window.matchMedia(
  '(prefers-contrast: high)'
).matches;

if (prefersHighContrast) {
  // Load high contrast palette
}
```

## Resources & References

- **WCAG 2.1 Guidelines**: [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/quickref/)
- **Color Contrast Analyzer**: Built into API
- **Screen Reader Testing**: NVDA, JAWS, VoiceOver
- **Browser Extensions**: axe DevTools, WAVE

---

**Need help?** Our API automatically suggests accessible alternatives for any color combination.