# Room-Specific Design Guide

## Living Room

### Purpose & Psychology
- **Primary Functions**: Socializing, relaxation, entertainment
- **Psychological Needs**: Comfort, conversation, flexibility
- **Traffic**: High, multiple users

### Recommended Palettes

#### Modern Minimal
```json
{
  "primary": "#F5F5F0",    // Kinari (Natural)
  "secondary": "#949194",  // Ginnezumi (Silver Gray)
  "accent": "#3E1E3F"      // Kokimurasaki (Deep Purple)
}
```
**Why**: Clean, sophisticated, timeless

#### Warm Traditional
```json
{
  "primary": "#E8D3A9",    // Usuki (Light Yellow)
  "secondary": "#A55A3C",  // Kaba (Birch Brown)
  "accent": "#D05A3A"      // Karakurenai (Chinese Red)
}
```
**Why**: Inviting, cozy, conversation-friendly

### API Call Example
```javascript
const livingRoom = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({
    roomType: 'living',
    style: 'modern',
    lighting: 'natural',
    preferences: {
      warmth: 'neutral',
      energy: 'balanced'
    }
  })
});
```

### Pro Tips
- Use 60-30-10 rule strictly
- Test colors at different times of day
- Consider TV glare with dark walls
- Add texture for visual interest

---

## Bedroom

### Purpose & Psychology
- **Primary Functions**: Sleep, rest, intimacy
- **Psychological Needs**: Calm, security, personal expression
- **Traffic**: Low, private

### Recommended Palettes

#### Restful Retreat
```json
{
  "primary": "#C5DDE7",    // Mizuiro (Light Blue)
  "secondary": "#F8F4E6",  // Zougeiro (Ivory)
  "accent": "#7B6C8E"      // Fujimurasaki (Wisteria Purple)
}
```
**Why**: Promotes sleep, reduces anxiety

#### Romantic Warmth
```json
{
  "primary": "#F4DCD0",    // Sakura (Cherry Blossom)
  "secondary": "#E5C9B5",  // Shiracha (Light Tea)
  "accent": "#A25768"      // Azukiiro (Red Bean)
}
```
**Why**: Intimate, warm, comforting

### API Call Example
```javascript
const bedroom = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({
    roomType: 'bedroom',
    style: 'traditional',
    lighting: 'artificial',
    preferences: {
      warmth: 'warm',
      energy: 'calm'
    }
  })
});
```

### Pro Tips
- Avoid bright reds (increase heart rate)
- Layer lighting for flexibility
- Consider blackout compatibility
- Test colors in evening light

---

## Kitchen

### Purpose & Psychology
- **Primary Functions**: Cooking, eating, gathering
- **Psychological Needs**: Cleanliness, energy, appetite
- **Traffic**: High, functional

### Recommended Palettes

#### Clean & Bright
```json
{
  "primary": "#FFFFFF",    // Pure White
  "secondary": "#E8E3D3",  // Shironezu (Off-White)
  "accent": "#86C166"      // Wakakusa (Young Grass)
}
```
**Why**: Clean feeling, fresh, appetizing

#### Warm Chef's Kitchen
```json
{
  "primary": "#F7E8D0",    // Torinokoiro (Eggshell)
  "secondary": "#D4A168",  // Kohaku (Amber)
  "accent": "#B44C43"      // Tobi (Kite Brown)
}
```
**Why**: Appetite stimulation, warmth, professional

### API Call Example
```javascript
const kitchen = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({
    roomType: 'kitchen',
    style: 'modern',
    lighting: 'mixed',
    preferences: {
      warmth: 'neutral',
      energy: 'vibrant'
    }
  })
});
```

### Pro Tips
- Consider splashback compatibility
- Account for steam and moisture
- Ensure good light reflection
- Easy-clean finishes important

---

## Home Office

### Purpose & Psychology
- **Primary Functions**: Work, focus, video calls
- **Psychological Needs**: Concentration, professionalism, reduced eye strain
- **Traffic**: Low-medium, single user

### Recommended Palettes

#### Focused Productivity
```json
{
  "primary": "#E8F0E8",    // Byakuroku (Pale Green)
  "secondary": "#D6D6D6",  // Haiiro (Ash Gray)
  "accent": "#4A6FA5"      // Hanada (Flower Blue)
}
```
**Why**: Reduces eye strain, maintains focus

#### Creative Energy
```json
{
  "primary": "#FFF9E9",    // Geppaku (Moon White)
  "secondary": "#F5B199",  // Shuiro (Vermillion)
  "accent": "#5B8767"      // Rokusho (Verdigris)
}
```
**Why**: Stimulates creativity, energizing

### API Call Example
```javascript
const office = await fetch('/api/rooms/office', {
  method: 'POST',
  body: JSON.stringify({
    workType: 'analytical',
    screenTime: 'high',
    naturalLight: true
  })
});
```

### Pro Tips
- Avoid glare behind monitors
- Consider video call backgrounds
- Green reduces eye fatigue
- Test under work lighting

---

## Children's Room

### Purpose & Psychology
- **Primary Functions**: Sleep, play, study, growth
- **Psychological Needs**: Stimulation, safety, age-appropriate
- **Traffic**: Medium, evolving use

### Age-Specific Palettes

#### Ages 0-2 (Nursery)
```json
{
  "primary": "#FFF5E1",    // Kinumeiro (Silk)
  "secondary": "#E6D5C3",  // Sunagaki (Sand)
  "accent": "#B8D4CE"      // Seiheki (Blue-Green)
}
```
**Why**: Calming, soft visual development

#### Ages 3-6 (Toddler)
```json
{
  "primary": "#F9E8D0",    // Usumomo (Pale Peach)
  "secondary": "#A7D5A7",  // Wakaba (Young Leaves)
  "accent": "#F5B05C"      // Yamabuki (Mountain Rose)
}
```
**Why**: Playful, educational, cheerful

#### Ages 7-12 (School Age)
```json
{
  "primary": "#E8ECF5",    // Fujiiro (Wisteria)
  "secondary": "#C8B8D8",  // Usubeni (Light Pink)
  "accent": "#5B9BD5"      // Sora (Sky)
}
```
**Why**: Balanced energy, study-friendly

### API Call Example
```javascript
const childRoom = await fetch('/api/rooms/children', {
  method: 'POST',
  body: JSON.stringify({
    ageGroup: '3-6',
    gender: 'neutral',
    theme: 'nature'
  })
});
```

### Pro Tips
- Plan for age transitions
- Washable finishes essential
- Avoid overstimulation
- Include child preferences

---

## Bathroom

### Purpose & Psychology
- **Primary Functions**: Hygiene, relaxation, preparation
- **Psychological Needs**: Cleanliness, calm, privacy
- **Traffic**: High, moisture exposure

### Recommended Palettes

#### Spa Retreat
```json
{
  "primary": "#E6EBE6",    // Shirahana (White Flower)
  "secondary": "#B4C4CE",  // Kamenozoki (Celadon)
  "accent": "#7B8B7B"      // Rikyucha (Green Tea)
}
```
**Why**: Calming, clean feeling, spa-like

#### Modern Minimal
```json
{
  "primary": "#FFFFFF",    // Pure White
  "secondary": "#3E3E3E",  // Sumi (Charcoal)
  "accent": "#B8956A"      // Kitsune (Fox Brown)
}
```
**Why**: Timeless, easy maintenance

### API Call Example
```javascript
const bathroom = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({
    roomType: 'bathroom',
    style: 'modern',
    lighting: 'artificial',
    preferences: {
      warmth: 'cool',
      energy: 'calm'
    }
  })
});
```

### Pro Tips
- Consider moisture resistance
- Test in artificial light
- Mirror reflection important
- Avoid dark colors in small spaces

---

## Quick Selection Guide

| Room | Priority | Best Colors | Avoid |
|------|----------|------------|-------|
| Living | Social comfort | Warm neutrals, earth tones | Aggressive reds |
| Bedroom | Rest | Cool blues, soft greens | Bright yellows |
| Kitchen | Cleanliness | Whites, light yellows | Dark browns |
| Office | Focus | Greens, light blues | Hot pinks |
| Children | Age-appropriate | Pastels, nature colors | Neon brights |
| Bathroom | Clean feeling | Whites, light blues | Dark purples |

## Multi-Room Coordination

### Creating Flow
1. **Maintain undertones**: Consistent warm/cool throughout
2. **Use transitional colors**: Hallways as bridges
3. **Repeat accent colors**: Unity across spaces
4. **Consider sightlines**: Visible rooms should harmonize

### API Batch Example
```javascript
const wholeHouse = await fetch('/api/batch/analyze', {
  method: 'POST',
  body: JSON.stringify({
    rooms: [
      { type: 'living', style: 'modern' },
      { type: 'kitchen', style: 'modern' },
      { type: 'bedroom', style: 'modern' }
    ],
    coordination: true
  })
});
```

---

**Need implementation help?** Check [API Quick Reference](./API_QUICK_REFERENCE.md) or [Tutorials](./TUTORIALS.md).