# Sanzo Color Advisor - Tutorial Documentation

## Table of Contents

1. [Getting Started Tutorials](#getting-started-tutorials)
2. [Basic Color Analysis](#basic-color-analysis)
3. [Advanced Features](#advanced-features)
4. [Room-Specific Tutorials](#room-specific-tutorials)
5. [API Integration Tutorials](#api-integration-tutorials)
6. [Performance Optimization](#performance-optimization)
7. [Accessibility Implementation](#accessibility-implementation)
8. [Video Tutorials](#video-tutorials)

---

## Getting Started Tutorials

### Tutorial 1: Your First Color Analysis (5 minutes)

#### Objective
Learn how to perform a basic color analysis for a living room.

#### Prerequisites
- Sanzo Color Advisor installed and running
- Web browser (Chrome, Firefox, Safari, or Edge)

#### Steps

1. **Launch the Application**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:3000` in your browser.

2. **Select Room Type**
   - Click on the room selector dropdown
   - Choose "Living Room" from the options

   ![Room Selector Location: Top of interface, first input field]

3. **Enter a Base Color**
   - In the color input field, type: `#8B4513` (Saddle Brown)
   - Alternatively, click the color picker icon and visually select a warm brown

4. **Configure Basic Options**
   - Leave age group as "All Ages"
   - Check "Modern" style preference

5. **Run Analysis**
   - Click the "Analyze Color" button
   - Wait 2-3 seconds for results

6. **Interpret Results**
   ```
   Expected Output:
   - Primary Palette: 4-5 complementary colors
   - Confidence Score: 85-95%
   - Psychological Impact: "Warm, inviting, grounded"
   - Alternative Options: 2-3 variations
   ```

7. **Save Your Palette**
   - Click "Export" button
   - Choose "JSON" format
   - Save as `my-first-palette.json`

#### What You Learned
- Basic interface navigation
- Color input methods
- Understanding analysis results
- Exporting color palettes

---

### Tutorial 2: Working with Color Harmonies (10 minutes)

#### Objective
Master different color harmony types and their applications.

#### Color Harmony Types

1. **Complementary Colors**
   ```javascript
   // Example: Blue and Orange
   baseColor: "#0066CC"  // Blue
   complement: "#FF9933" // Orange
   ```

   **Try This:**
   - Enter `#0066CC` as base color
   - Select "Complementary" harmony
   - Observe the high contrast palette

2. **Analogous Colors**
   ```javascript
   // Example: Blue family
   baseColor: "#0066CC"    // Blue
   analogous1: "#0099CC"   // Cyan-Blue
   analogous2: "#0033CC"   // Violet-Blue
   ```

   **Try This:**
   - Enter `#00AA00` as base color
   - Select "Analogous" harmony
   - Note the smooth color transitions

3. **Triadic Colors**
   ```javascript
   // Example: Primary triad
   baseColor: "#FF0000"   // Red
   triad1: "#00FF00"      // Green
   triad2: "#0000FF"      // Blue
   ```

   **Try This:**
   - Enter `#FF6600` as base color
   - Select "Triadic" harmony
   - See the balanced, vibrant palette

4. **Split-Complementary**
   ```javascript
   // Example: Blue with warm accents
   baseColor: "#0066CC"        // Blue
   splitComp1: "#FFCC33"       // Yellow-Orange
   splitComp2: "#FF6633"       // Red-Orange
   ```

#### Practical Exercise

1. Create a palette for each harmony type
2. Compare the results side-by-side
3. Note which harmony works best for:
   - High energy spaces (Complementary)
   - Calm environments (Analogous)
   - Playful designs (Triadic)
   - Sophisticated looks (Split-Complementary)

---

## Basic Color Analysis

### Tutorial 3: Understanding Confidence Scores (15 minutes)

#### What Are Confidence Scores?

Confidence scores (0-100%) indicate how well a color recommendation matches:
- Historical Sanzo Wada combinations
- Room type requirements
- Age appropriateness
- Style preferences

#### Score Interpretation Guide

| Score Range | Meaning | Recommendation |
|-------------|---------|----------------|
| 90-100% | Excellent Match | Use with confidence |
| 75-89% | Good Match | Consider with minor adjustments |
| 60-74% | Moderate Match | Review alternatives |
| Below 60% | Weak Match | Try different base color |

#### Hands-On Exercise

1. **Test High Confidence Colors**
   ```
   Input: #4682B4 (Steel Blue)
   Room: Bedroom
   Expected Score: 90-95%
   ```

2. **Test Medium Confidence Colors**
   ```
   Input: #FF1493 (Deep Pink)
   Room: Office
   Expected Score: 65-75%
   ```

3. **Test Low Confidence Colors**
   ```
   Input: #000000 (Black)
   Room: Child's Room (Age 3-6)
   Expected Score: 30-40%
   ```

#### Improving Confidence Scores

1. **Adjust Saturation**
   - Overly saturated colors may score lower
   - Try reducing saturation by 10-20%

2. **Consider Room Context**
   - Match color temperature to room purpose
   - Cool colors for rest, warm for activity

3. **Age Appropriateness**
   - Younger children: Brighter, clearer colors
   - Teens: More sophisticated palettes
   - Adults: Full range available

---

### Tutorial 4: Batch Color Processing (20 minutes)

#### When to Use Batch Mode

- Comparing multiple color options
- Creating seasonal palettes
- Designing multi-room schemes
- A/B testing color choices

#### Step-by-Step Batch Analysis

1. **Enable Batch Mode**
   ```javascript
   // Click "Batch Mode" toggle or press Ctrl+B
   ```

2. **Prepare Color List**
   ```
   #336699
   #669933
   #993366
   #996633
   #339966
   ```

3. **Input Colors**
   - Paste the list into batch input area
   - One color per line
   - Maximum 20 colors per batch

4. **Configure Batch Settings**
   ```javascript
   batchConfig = {
     roomType: "all",      // Analyze for all room types
     compareMode: true,    // Enable comparison view
     exportFormat: "csv"   // Bulk export format
   }
   ```

5. **Run Batch Analysis**
   - Click "Analyze Batch"
   - Processing time: ~2 seconds per color

6. **Review Results**
   ```
   Color       | Best Room  | Score | Harmony Type
   ------------|------------|-------|---------------
   #336699     | Office     | 94%   | Analogous
   #669933     | Kitchen    | 91%   | Complementary
   #993366     | Bedroom    | 87%   | Triadic
   ```

7. **Export Comparison Report**
   - Click "Export Batch Results"
   - Choose format: CSV, JSON, or PDF
   - File includes all palettes and scores

---

## Advanced Features

### Tutorial 5: Custom Color Algorithms (30 minutes)

#### Understanding the Delta E Algorithm

Delta E measures perceived color difference:
- ΔE < 1: Not perceptible
- ΔE 1-2: Barely perceptible
- ΔE 2-10: Perceptible
- ΔE 10+: Different colors

#### Implementing Custom Matching

1. **Access Advanced Settings**
   ```javascript
   // Navigate to Settings > Advanced > Algorithms
   ```

2. **Adjust Algorithm Parameters**
   ```javascript
   colorMatchConfig = {
     algorithm: "CIEDE2000",    // Most accurate
     threshold: 5.0,            // Matching tolerance
     weights: {
       lightness: 1.0,
       chroma: 1.0,
       hue: 1.0
     }
   }
   ```

3. **Create Custom Harmony Rules**
   ```javascript
   // Example: Golden Ratio Harmony
   customHarmony = {
     name: "Golden Ratio",
     formula: (baseHue) => {
       return [
         baseHue,
         (baseHue + 222.5) % 360,  // Golden angle
         (baseHue + 137.5) % 360   // Inverse golden
       ];
     }
   }
   ```

4. **Test Custom Algorithm**
   - Input base color: `#DAA520` (Goldenrod)
   - Select "Custom: Golden Ratio"
   - Analyze results

5. **Save Custom Settings**
   ```javascript
   // Export configuration
   localStorage.setItem('customAlgorithm', JSON.stringify(customHarmony));
   ```

---

### Tutorial 6: WebAssembly Acceleration (25 minutes)

#### Enabling WASM Optimization

1. **Check WASM Support**
   ```javascript
   // In browser console
   if (typeof WebAssembly !== 'undefined') {
     console.log('WASM supported!');
   }
   ```

2. **Load WASM Module**
   ```javascript
   // Automatic on startup, or manually:
   await loadWasmModule();
   ```

3. **Performance Comparison**
   ```javascript
   // JavaScript version
   console.time('JS Processing');
   processColors(largeDataset);  // ~3000ms
   console.timeEnd('JS Processing');

   // WASM version
   console.time('WASM Processing');
   processColorsWasm(largeDataset);  // ~300ms
   console.timeEnd('WASM Processing');
   ```

4. **Monitor Performance**
   - Open Developer Tools (F12)
   - Go to Performance tab
   - Record color analysis
   - Review flame graph

#### Optimization Tips

1. **Batch Operations**
   - Process multiple colors simultaneously
   - Reduces overhead

2. **Cache Results**
   - Repeated queries use cache
   - 0ms response time

3. **Use Web Workers**
   - Non-blocking UI
   - Parallel processing

---

## Room-Specific Tutorials

### Tutorial 7: Designing a Child's Bedroom (20 minutes)

#### Age-Appropriate Color Selection

**Ages 0-3: Soft & Soothing**

1. **Setup**
   ```
   Room Type: Child's Room
   Age Group: 0-3
   Style: Soft
   ```

2. **Recommended Base Colors**
   ```
   #FFE4E1 - Misty Rose (Calming)
   #E0F2E9 - Mint Cream (Fresh)
   #F0E68C - Khaki (Warm)
   ```

3. **Step-by-Step Design**
   - Enter `#FFE4E1` as base
   - Enable "Safety Mode" (non-stimulating)
   - Generate palette
   - Expected: Soft pastels, low contrast

**Ages 4-6: Playful & Educational**

1. **Setup**
   ```
   Room Type: Child's Room
   Age Group: 4-6
   Style: Playful
   ```

2. **Educational Color Zones**
   ```javascript
   zones = {
     learning: "#4169E1",    // Royal Blue (focus)
     play: "#FFD700",        // Gold (energy)
     rest: "#98FB98"         // Pale Green (calm)
   }
   ```

3. **Create Zoned Palette**
   - Analyze each zone color
   - Combine recommendations
   - Ensure smooth transitions

**Ages 7-12: Personal Expression**

1. **Interactive Selection**
   - Let child choose base color
   - Apply age-appropriate filters
   - Generate 3 options
   - Let child pick favorite

2. **Growth-Friendly Choices**
   - Avoid overly childish themes
   - Choose colors that age well
   - Plan for easy updates

---

### Tutorial 8: Professional Office Design (25 minutes)

#### Productivity-Focused Colors

1. **Cognitive Performance Colors**
   ```javascript
   productivityPalette = {
     focus: "#4682B4",       // Steel Blue
     creativity: "#9370DB",  // Medium Purple
     energy: "#FF8C00",      // Dark Orange
     calm: "#3CB371"         // Medium Sea Green
   }
   ```

2. **Design Process**

   **Step 1: Assess Work Type**
   - Creative work → Warmer palettes
   - Analytical work → Cooler palettes
   - Mixed tasks → Balanced approach

   **Step 2: Consider Lighting**
   ```
   Natural Light: Use saturated colors
   Fluorescent: Warm up cool tones
   LED: Full spectrum works well
   ```

   **Step 3: Create Zones**
   - Work area: Focus colors
   - Meeting space: Collaborative colors
   - Break area: Relaxing colors

3. **Sample Office Palette**
   ```
   Base: #2C3E50 (Midnight Blue)
   Accent 1: #E74C3C (Alizarin)
   Accent 2: #F39C12 (Orange)
   Neutral: #ECF0F1 (Clouds)
   ```

4. **Test for Screen Fatigue**
   - View palette for 5 minutes
   - Check eye comfort
   - Adjust if needed

---

### Tutorial 9: Kitchen Color Psychology (20 minutes)

#### Appetite-Enhancing Colors

1. **Color Psychology in Kitchens**
   ```javascript
   kitchenPsychology = {
     appetizing: ["#FF6347", "#FFA500", "#FFD700"],  // Warm tones
     clean: ["#FFFFFF", "#F0F8FF", "#F5FFFA"],       // Whites/Light blues
     avoid: ["#0000FF", "#4B0082", "#800080"]        // Blues/Purples
   }
   ```

2. **Practical Exercise**

   **Morning Kitchen** (Energizing)
   ```
   Base: #FFA500 (Orange)
   Style: Bright & Fresh
   Expected: Citrus-inspired palette
   ```

   **Evening Kitchen** (Sophisticated)
   ```
   Base: #8B4513 (Saddle Brown)
   Style: Warm & Cozy
   Expected: Earth-toned palette
   ```

3. **Material Coordination**
   - Input countertop color
   - Input cabinet color
   - Generate bridging palette
   - Ensure harmony

---

## API Integration Tutorials

### Tutorial 10: Basic API Integration (30 minutes)

#### Setting Up API Access

1. **Start the API Server**
   ```bash
   npm start
   # API available at http://localhost:3000/api
   ```

2. **Test API Health**
   ```bash
   curl http://localhost:3000/api/health
   # Expected: {"status":"ok","timestamp":"..."}
   ```

#### Making Your First API Call

1. **Simple Color Analysis**
   ```javascript
   // Using fetch
   async function analyzeColor() {
     const response = await fetch('http://localhost:3000/api/analyze', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         hex: '#4682B4',
         roomType: 'bedroom'
       })
     });

     const result = await response.json();
     console.log(result);
   }
   ```

2. **Using Axios**
   ```javascript
   const axios = require('axios');

   async function analyzeWithAxios() {
     try {
       const { data } = await axios.post('http://localhost:3000/api/analyze', {
         hex: '#4682B4',
         roomType: 'bedroom',
         options: {
           ageGroup: 'adult',
           style: 'modern'
         }
       });

       console.log('Palette:', data.palette);
       console.log('Confidence:', data.confidence);
     } catch (error) {
       console.error('API Error:', error.message);
     }
   }
   ```

3. **Batch Processing via API**
   ```javascript
   async function batchAnalyze() {
     const colors = ['#FF0000', '#00FF00', '#0000FF'];

     const requests = colors.map(hex =>
       fetch('http://localhost:3000/api/analyze', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ hex })
       }).then(r => r.json())
     );

     const results = await Promise.all(requests);
     return results;
   }
   ```

---

### Tutorial 11: Building a Color Picker Widget (45 minutes)

#### Creating an Embedded Widget

1. **HTML Structure**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Sanzo Color Widget</title>
   </head>
   <body>
     <div id="sanzo-widget">
       <input type="color" id="color-input" />
       <button id="analyze-btn">Get Palette</button>
       <div id="results"></div>
     </div>

     <script src="widget.js"></script>
   </body>
   </html>
   ```

2. **Widget JavaScript**
   ```javascript
   // widget.js
   class SanzoWidget {
     constructor(apiUrl = 'http://localhost:3000/api') {
       this.apiUrl = apiUrl;
       this.init();
     }

     init() {
       const btn = document.getElementById('analyze-btn');
       btn.addEventListener('click', () => this.analyze());
     }

     async analyze() {
       const color = document.getElementById('color-input').value;

       try {
         const response = await fetch(`${this.apiUrl}/analyze`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ hex: color })
         });

         const data = await response.json();
         this.displayResults(data);
       } catch (error) {
         console.error('Widget error:', error);
       }
     }

     displayResults(data) {
       const resultsDiv = document.getElementById('results');

       resultsDiv.innerHTML = `
         <h3>Your Palette (${data.confidence}% match)</h3>
         <div class="palette">
           ${data.palette.map(color => `
             <div class="color-swatch"
                  style="background-color: ${color.hex}">
               ${color.name}
             </div>
           `).join('')}
         </div>
       `;
     }
   }

   // Initialize widget
   new SanzoWidget();
   ```

3. **Styling the Widget**
   ```css
   #sanzo-widget {
     width: 300px;
     padding: 20px;
     border: 1px solid #ddd;
     border-radius: 8px;
   }

   .palette {
     display: flex;
     gap: 10px;
     margin-top: 15px;
   }

   .color-swatch {
     width: 50px;
     height: 50px;
     border-radius: 4px;
     display: flex;
     align-items: center;
     justify-content: center;
     color: white;
     font-size: 10px;
     text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
   }
   ```

4. **Embedding in External Sites**
   ```html
   <!-- On external website -->
   <iframe src="https://your-domain.com/widget.html"
           width="350"
           height="400"
           frameborder="0">
   </iframe>
   ```

---

## Performance Optimization

### Tutorial 12: Optimizing API Response Times (30 minutes)

#### Measuring Performance

1. **Setup Performance Monitoring**
   ```javascript
   // Add to API middleware
   app.use((req, res, next) => {
     const start = Date.now();

     res.on('finish', () => {
       const duration = Date.now() - start;
       console.log(`${req.method} ${req.url} - ${duration}ms`);
     });

     next();
   });
   ```

2. **Implement Caching**
   ```javascript
   const cache = new Map();

   function getCachedResult(key) {
     if (cache.has(key)) {
       const { data, timestamp } = cache.get(key);
       const age = Date.now() - timestamp;

       if (age < 3600000) { // 1 hour
         return data;
       }
     }
     return null;
   }

   function setCachedResult(key, data) {
     cache.set(key, {
       data,
       timestamp: Date.now()
     });
   }
   ```

3. **Optimize Database Queries**
   ```javascript
   // Bad: Multiple queries
   async function slowMethod(colorId) {
     const color = await getColor(colorId);
     const combinations = await getCombinations(colorId);
     const metadata = await getMetadata(colorId);
     return { color, combinations, metadata };
   }

   // Good: Single optimized query
   async function fastMethod(colorId) {
     const sql = `
       SELECT c.*,
              comb.data as combinations,
              m.data as metadata
       FROM colors c
       LEFT JOIN combinations comb ON c.id = comb.color_id
       LEFT JOIN metadata m ON c.id = m.color_id
       WHERE c.id = ?
     `;
     return await db.query(sql, [colorId]);
   }
   ```

4. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression({
     filter: (req, res) => {
       if (req.headers['x-no-compression']) {
         return false;
       }
       return compression.filter(req, res);
     }
   }));
   ```

#### Performance Benchmarks

Run performance tests:
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test single endpoint
ab -n 1000 -c 10 http://localhost:3000/api/analyze

# Expected results:
# Requests per second: 500+ [#/sec]
# Time per request: <2ms
# Transfer rate: 100+ [Kbytes/sec]
```

---

## Accessibility Implementation

### Tutorial 13: Implementing WCAG Compliance (35 minutes)

#### Color Contrast Validation

1. **Setup Contrast Checker**
   ```javascript
   function getContrastRatio(color1, color2) {
     const l1 = getLuminance(color1);
     const l2 = getLuminance(color2);

     const lighter = Math.max(l1, l2);
     const darker = Math.min(l1, l2);

     return (lighter + 0.05) / (darker + 0.05);
   }

   function meetsWCAG(ratio, level = 'AA') {
     if (level === 'AA') {
       return ratio >= 4.5; // Normal text
     } else if (level === 'AAA') {
       return ratio >= 7.0; // Enhanced
     }
   }
   ```

2. **Implement Color Blind Simulation**
   ```javascript
   function simulateColorBlindness(hex, type) {
     const rgb = hexToRgb(hex);

     switch(type) {
       case 'protanopia': // Red-blind
         return {
           r: 0.567 * rgb.r + 0.433 * rgb.g,
           g: 0.558 * rgb.r + 0.442 * rgb.g,
           b: 0.242 * rgb.g + 0.758 * rgb.b
         };

       case 'deuteranopia': // Green-blind
         return {
           r: 0.625 * rgb.r + 0.375 * rgb.g,
           g: 0.7 * rgb.r + 0.3 * rgb.g,
           b: 0.3 * rgb.g + 0.7 * rgb.b
         };

       case 'tritanopia': // Blue-blind
         return {
           r: 0.95 * rgb.r + 0.05 * rgb.g,
           g: 0.433 * rgb.g + 0.567 * rgb.b,
           b: 0.475 * rgb.g + 0.525 * rgb.b
         };
     }
   }
   ```

3. **Add Accessibility Warnings**
   ```javascript
   function checkAccessibility(palette) {
     const warnings = [];

     // Check text contrast
     palette.forEach(color => {
       const ratio = getContrastRatio(color, '#FFFFFF');
       if (ratio < 4.5) {
         warnings.push({
           type: 'contrast',
           color: color,
           message: 'Insufficient contrast for text'
         });
       }
     });

     // Check color blind safety
     const types = ['protanopia', 'deuteranopia', 'tritanopia'];
     types.forEach(type => {
       const simulated = palette.map(c => simulateColorBlindness(c, type));
       if (hasConfusingSimilarity(simulated)) {
         warnings.push({
           type: 'colorblind',
           condition: type,
           message: `May be confusing for ${type}`
         });
       }
     });

     return warnings;
   }
   ```

4. **Implement Screen Reader Support**
   ```html
   <!-- Add ARIA labels -->
   <div role="main" aria-label="Color Analysis Tool">
     <form role="form" aria-label="Color Input Form">
       <label for="color-input">
         Select a base color for analysis
       </label>
       <input
         type="color"
         id="color-input"
         aria-describedby="color-help"
         aria-required="true"
       />
       <span id="color-help" class="sr-only">
         Choose a color using the color picker or enter a hex code
       </span>
     </form>

     <div role="region" aria-live="polite" aria-label="Analysis Results">
       <!-- Results appear here -->
     </div>
   </div>
   ```

---

## Video Tutorials

### Available Video Tutorials

#### Getting Started Series
1. **Installation and Setup** (5:23)
   - System requirements
   - Installation process
   - First launch

2. **Interface Tour** (7:45)
   - Main components
   - Navigation tips
   - Hidden features

3. **Your First Palette** (4:12)
   - Step-by-step color selection
   - Understanding results
   - Saving palettes

#### Advanced Techniques
1. **Color Theory Masterclass** (15:30)
   - Sanzo Wada principles
   - Harmony types explained
   - Practical applications

2. **API Integration Workshop** (22:15)
   - Setting up API access
   - Building integrations
   - Real-world examples

3. **Performance Optimization** (18:45)
   - WASM acceleration
   - Caching strategies
   - Monitoring tools

#### Room Design Series
1. **Living Room Design** (12:30)
2. **Bedroom Aesthetics** (11:15)
3. **Kitchen Colors** (9:45)
4. **Office Productivity** (13:20)
5. **Children's Rooms** (14:50)

### Creating Your Own Tutorial Content

#### Recording Setup
```javascript
// Enable tutorial mode for clean recordings
const tutorialConfig = {
  hidePersonalData: true,
  showKeystrokes: true,
  highlightClicks: true,
  slowAnimations: 1.5
};

enableTutorialMode(tutorialConfig);
```

#### Best Practices for Tutorials
1. Keep videos under 15 minutes
2. Include chapter markers
3. Provide downloadable examples
4. Add closed captions
5. Create companion written guides

---

## Practice Exercises

### Exercise Set 1: Basic Skills

1. **Color Matching Challenge**
   - Find 3 colors that match `#6B8E23` (Olive Drab)
   - Achieve >85% confidence score
   - Time limit: 5 minutes

2. **Room Type Comparison**
   - Use base color `#CD5C5C` (Indian Red)
   - Analyze for all room types
   - Identify best and worst matches

3. **Harmony Exploration**
   - Pick any base color
   - Generate all harmony types
   - Create mood board

### Exercise Set 2: Advanced Skills

1. **Custom Algorithm Design**
   - Create a "Sunset" harmony algorithm
   - Test with 5 different base colors
   - Document the formula

2. **Performance Challenge**
   - Process 100 colors in <5 seconds
   - Maintain <100ms response time
   - Use caching effectively

3. **Accessibility Audit**
   - Take any generated palette
   - Ensure WCAG AAA compliance
   - Test with all colorblind types

### Exercise Set 3: Real-World Projects

1. **Complete Home Design**
   - Design palettes for 5 rooms
   - Ensure cohesive flow
   - Create presentation document

2. **Brand Color System**
   - Start with brand color
   - Generate complete system
   - Include usage guidelines

3. **Seasonal Collection**
   - Create Spring, Summer, Fall, Winter palettes
   - Base on seasonal psychology
   - Export as design system

---

## Certification Path

### Level 1: Color Advisor User
- Complete all basic tutorials
- Pass online quiz (80% required)
- Submit 3 palette designs

### Level 2: Advanced Practitioner
- Complete advanced tutorials
- Build one integration
- Design 10 room palettes

### Level 3: Sanzo Expert
- Master all features
- Contribute to documentation
- Create original tutorial

---

## Support Resources

### Getting Help
- **Documentation**: `/docs` folder
- **API Reference**: `/api/docs` endpoint
- **Community Forum**: community.sanzocolor.com
- **Email Support**: support@sanzocolor.com
- **Video Library**: youtube.com/sanzocolor

### Troubleshooting Quick Fixes

#### Application Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

#### API Not Responding
```bash
# Check service status
npm run health

# Restart services
pm2 restart all

# Check logs
pm2 logs
```

#### Colors Look Wrong
1. Calibrate monitor
2. Check browser zoom (should be 100%)
3. Verify color profile settings
4. Test in different browser

---

## Next Steps

After completing these tutorials:

1. **Read the [Developer Guide](DEVELOPER_GUIDE.md)** for extending the system
2. **Check the [API Reference](API_REFERENCE.md)** for complete endpoint documentation
3. **Explore [Room Design Examples](ROOM_DESIGN_EXAMPLES.md)** for inspiration
4. **Review [Color Theory Guide](COLOR_THEORY_GUIDE.md)** for deeper understanding

---

*Last Updated: September 2024*
*Version: 1.0.0*