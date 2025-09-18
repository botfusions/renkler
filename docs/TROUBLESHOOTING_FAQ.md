# Sanzo Color Advisor - Troubleshooting & FAQ

## Table of Contents

1. [Common Issues](#common-issues)
2. [Installation Problems](#installation-problems)
3. [Runtime Errors](#runtime-errors)
4. [Performance Issues](#performance-issues)
5. [API Problems](#api-problems)
6. [Color Analysis Issues](#color-analysis-issues)
7. [Browser Compatibility](#browser-compatibility)
8. [Frequently Asked Questions](#frequently-asked-questions)
9. [Error Messages Guide](#error-messages-guide)
10. [Getting Support](#getting-support)

---

## Common Issues

### Issue: Application Won't Start

**Symptoms:**
- Server fails to start
- Port already in use error
- Module not found errors

**Solutions:**

1. **Check if port is in use:**
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```

   Kill the process or change port:
   ```bash
   # Change port
   PORT=3001 npm start
   ```

2. **Clear and reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   npm start
   ```

3. **Check Node.js version:**
   ```bash
   node --version  # Should be >= 18.0.0
   ```

   Update if needed:
   ```bash
   # Using nvm
   nvm install 18
   nvm use 18
   ```

4. **Verify environment variables:**
   ```bash
   # Check .env file exists
   ls -la .env

   # Copy from template if missing
   cp .env.example .env
   ```

---

### Issue: Colors Look Different Than Expected

**Symptoms:**
- Colors appear washed out
- Colors too bright/dark
- Colors don't match samples

**Solutions:**

1. **Calibrate your monitor:**
   - Windows: Settings → Display → Advanced → Color Calibration
   - Mac: System Preferences → Displays → Color → Calibrate
   - Use online calibration tool: [displaycal.net](https://displaycal.net)

2. **Check browser zoom level:**
   - Should be at 100%
   - Reset: Ctrl+0 (Windows) or Cmd+0 (Mac)

3. **Verify color profile:**
   ```javascript
   // In browser console
   window.matchMedia('(color-gamut: srgb)').matches  // Should be true
   ```

4. **Test with known colors:**
   ```javascript
   // These should appear as pure colors
   testColors = {
     red: '#FF0000',
     green: '#00FF00',
     blue: '#0000FF',
     white: '#FFFFFF',
     black: '#000000'
   }
   ```

---

## Installation Problems

### NPM Install Fails

**Error:** `npm ERR! code EINTEGRITY`

**Solution:**
```bash
# Clear npm cache
npm cache verify
npm cache clean --force

# Delete lock file
rm package-lock.json

# Reinstall
npm install
```

---

### Node-gyp Build Errors

**Error:** `gyp ERR! build error`

**Solutions:**

**Windows:**
```bash
# Install Windows build tools
npm install -g windows-build-tools

# Or install Visual Studio Build Tools manually
# Download from Microsoft website
```

**Mac:**
```bash
# Install Xcode command line tools
xcode-select --install
```

**Linux:**
```bash
# Install build essentials
sudo apt-get install build-essential
# or
sudo yum groupinstall 'Development Tools'
```

---

### Permission Errors

**Error:** `EACCES: permission denied`

**Solutions:**

1. **Change npm default directory:**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Fix ownership (Linux/Mac):**
   ```bash
   sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
   ```

3. **Use npx instead of global install:**
   ```bash
   npx nodemon src/index.js
   ```

---

## Runtime Errors

### WebAssembly Not Loading

**Error:** `WebAssembly is not defined`

**Solutions:**

1. **Check browser support:**
   ```javascript
   if (typeof WebAssembly === 'undefined') {
     console.log('WebAssembly not supported');
     // Fall back to JavaScript implementation
   }
   ```

2. **Verify WASM file path:**
   ```bash
   # Check file exists
   ls src/wasm/color_math.wasm
   ```

3. **Check MIME type:**
   ```javascript
   // Add to server configuration
   app.use(express.static('public', {
     setHeaders: (res, path) => {
       if (path.endsWith('.wasm')) {
         res.set('Content-Type', 'application/wasm');
       }
     }
   }));
   ```

---

### Memory Leak Detected

**Symptoms:**
- Increasing memory usage
- Application slows down over time
- Browser tab crashes

**Solutions:**

1. **Clear cache periodically:**
   ```javascript
   // Add cache cleanup
   setInterval(() => {
     if (cache.size > 1000) {
       cache.clear();
     }
   }, 60000); // Every minute
   ```

2. **Limit worker threads:**
   ```javascript
   // In .env
   WORKER_THREADS=2  // Reduce from default 4
   ```

3. **Monitor memory usage:**
   ```javascript
   // Add memory monitoring
   setInterval(() => {
     const usage = process.memoryUsage();
     console.log('Memory:', {
       rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
       heap: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`
     });
   }, 30000);
   ```

---

## Performance Issues

### Slow Color Analysis

**Symptoms:**
- Analysis takes >500ms
- UI freezes during analysis
- Timeout errors

**Solutions:**

1. **Enable caching:**
   ```javascript
   // Check cache is working
   const cacheEnabled = process.env.ENABLE_CACHE !== 'false';
   console.log('Cache enabled:', cacheEnabled);
   ```

2. **Use WebAssembly:**
   ```javascript
   // Verify WASM is loaded
   const wasmEnabled = process.env.ENABLE_WASM !== 'false';
   console.log('WASM enabled:', wasmEnabled);
   ```

3. **Reduce color database size:**
   ```javascript
   // Use subset for testing
   const colors = production
     ? require('./data/sanzo-colors.json')
     : require('./data/sanzo-colors-subset.json');
   ```

4. **Profile performance:**
   ```javascript
   console.time('Analysis');
   const result = await analyze(input);
   console.timeEnd('Analysis');
   ```

---

### High CPU Usage

**Symptoms:**
- Fan noise increases
- System becomes unresponsive
- Browser warns about high CPU

**Solutions:**

1. **Limit concurrent operations:**
   ```javascript
   // Add throttling
   const pLimit = require('p-limit');
   const limit = pLimit(2); // Max 2 concurrent

   const results = await Promise.all(
     colors.map(color =>
       limit(() => analyzeColor(color))
     )
   );
   ```

2. **Use request debouncing:**
   ```javascript
   let timeout;
   function debounceAnalysis(input) {
     clearTimeout(timeout);
     timeout = setTimeout(() => {
       analyze(input);
     }, 300); // 300ms delay
   }
   ```

3. **Reduce worker thread count:**
   ```bash
   WORKER_THREADS=1 npm start
   ```

---

## API Problems

### CORS Errors

**Error:** `Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:3001' has been blocked by CORS policy`

**Solutions:**

1. **Configure CORS properly:**
   ```javascript
   // src/app.js
   const cors = require('cors');

   app.use(cors({
     origin: process.env.CLIENT_URL || '*',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **For development, allow all origins:**
   ```javascript
   app.use(cors()); // Allow all origins in development
   ```

3. **Check preflight requests:**
   ```javascript
   app.options('*', cors()); // Enable pre-flight for all routes
   ```

---

### Rate Limiting Issues

**Error:** `429 Too Many Requests`

**Solutions:**

1. **Check rate limit status:**
   ```bash
   curl -I http://localhost:3000/api/analyze
   # Check headers:
   # X-RateLimit-Limit: 100
   # X-RateLimit-Remaining: 95
   ```

2. **Implement retry logic:**
   ```javascript
   async function fetchWithRetry(url, options, retries = 3) {
     try {
       const response = await fetch(url, options);
       if (response.status === 429 && retries > 0) {
         const retryAfter = response.headers.get('Retry-After') || 1;
         await new Promise(r => setTimeout(r, retryAfter * 1000));
         return fetchWithRetry(url, options, retries - 1);
       }
       return response;
     } catch (error) {
       if (retries > 0) {
         return fetchWithRetry(url, options, retries - 1);
       }
       throw error;
     }
   }
   ```

3. **Request API key for higher limits:**
   ```javascript
   // Include API key in headers
   headers: {
     'Authorization': `Bearer ${API_KEY}`,
     'Content-Type': 'application/json'
   }
   ```

---

### API Response Errors

**Error:** `Invalid JSON response`

**Solutions:**

1. **Check response format:**
   ```javascript
   fetch('/api/analyze')
     .then(res => {
       console.log('Content-Type:', res.headers.get('content-type'));
       if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
       }
       return res.text(); // Get as text first
     })
     .then(text => {
       try {
         return JSON.parse(text);
       } catch (e) {
         console.error('Invalid JSON:', text);
         throw e;
       }
     });
   ```

2. **Validate API endpoint:**
   ```bash
   # Test endpoint directly
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"hex":"#4682B4","roomType":"bedroom"}'
   ```

---

## Color Analysis Issues

### Incorrect Color Matching

**Symptoms:**
- Wrong colors suggested
- Low confidence scores
- Unexpected palettes

**Solutions:**

1. **Verify color input format:**
   ```javascript
   // Ensure proper hex format
   function validateHex(hex) {
     const valid = /^#[0-9A-Fa-f]{6}$/.test(hex);
     if (!valid) {
       console.error('Invalid hex:', hex);
     }
     return valid;
   }
   ```

2. **Check color conversion accuracy:**
   ```javascript
   // Test conversion round-trip
   const hex = '#4682B4';
   const rgb = hexToRgb(hex);
   const lab = rgbToLab(rgb);
   const backToHex = labToHex(lab);

   console.log('Original:', hex);
   console.log('Converted back:', backToHex);
   // Should be very close
   ```

3. **Verify Sanzo color database:**
   ```javascript
   // Check database integrity
   const colors = require('./data/sanzo-colors.json');
   console.log('Total colors:', colors.length); // Should be 159
   console.log('Sample color:', colors[0]);
   ```

---

### Age Group Filtering Not Working

**Symptoms:**
- Inappropriate colors for children
- Age filter ignored

**Solutions:**

1. **Check filter implementation:**
   ```javascript
   function filterByAge(colors, ageGroup) {
     console.log('Filtering for age:', ageGroup);

     const filtered = colors.filter(color => {
       // Log what's being filtered
       const appropriate = isAgeAppropriate(color, ageGroup);
       console.log(`Color ${color.hex}: ${appropriate}`);
       return appropriate;
     });

     console.log(`Filtered ${colors.length} to ${filtered.length}`);
     return filtered;
   }
   ```

2. **Verify age group values:**
   ```javascript
   const validAgeGroups = ['0-3', '4-6', '7-12', '13-18', 'adult', 'all'];
   if (!validAgeGroups.includes(ageGroup)) {
     console.error('Invalid age group:', ageGroup);
   }
   ```

---

## Browser Compatibility

### Feature Not Working in Safari

**Common Safari Issues:**

1. **WebAssembly:**
   ```javascript
   // Check Safari version
   const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
   const safariVersion = navigator.userAgent.match(/Version\/(\d+)/);

   if (isSafari && safariVersion && parseInt(safariVersion[1]) < 14) {
     console.warn('WebAssembly may not work properly');
     // Use JavaScript fallback
   }
   ```

2. **Color picker:**
   ```html
   <!-- Safari color picker workaround -->
   <input type="color"
          list="color-presets"
          value="#4682B4">
   <datalist id="color-presets">
     <option>#FF0000</option>
     <option>#00FF00</option>
     <option>#0000FF</option>
   </datalist>
   ```

---

### Internet Explorer Support

**Note:** IE is not supported. Show warning:

```javascript
// Detect IE
const isIE = /MSIE|Trident/.test(navigator.userAgent);

if (isIE) {
  document.body.innerHTML = `
    <div style="text-align: center; padding: 50px;">
      <h1>Browser Not Supported</h1>
      <p>Please use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
      <p>
        <a href="https://www.google.com/chrome/">Download Chrome</a> |
        <a href="https://www.mozilla.org/firefox/">Download Firefox</a>
      </p>
    </div>
  `;
}
```

---

## Frequently Asked Questions

### General Questions

**Q: What is Sanzo Wada's color system?**

A: Sanzo Wada was a Japanese artist who published "A Dictionary of Color Combinations" in 1918. His work contains 348 carefully selected color combinations that have stood the test of time. Our system uses these historical combinations as a foundation for modern color recommendations.

---

**Q: How accurate are the color recommendations?**

A: Our system achieves 85-95% accuracy when matching against Sanzo Wada's original combinations. The confidence score indicates how closely your input matches historical data. Scores above 90% are considered excellent matches.

---

**Q: Can I use this commercially?**

A: Yes, the Sanzo Color Advisor is MIT licensed. Sanzo Wada's original work from 1918 is in the public domain. You can use the color combinations and recommendations for commercial projects.

---

### Technical Questions

**Q: Why is WebAssembly used?**

A: WebAssembly provides 10x performance improvement for color calculations. The Delta E algorithm involves complex mathematical operations that benefit significantly from WASM's near-native performance. This enables real-time analysis of hundreds of colors.

---

**Q: How does caching work?**

A: The system implements multi-level caching:
1. **Memory cache**: Instant retrieval for repeated queries
2. **Redis cache**: Shared cache across instances
3. **Browser cache**: Client-side caching for API responses

Cache invalidation occurs after 1 hour or when color database updates.

---

**Q: What's the difference between Delta E formulas?**

A: We support multiple Delta E formulas:
- **CIE76**: Fastest, good for rough matching
- **CIE94**: Better perceptual uniformity
- **CIEDE2000**: Most accurate, industry standard
- **CMC**: Optimized for textiles

Default is CIEDE2000 for best accuracy.

---

### API Questions

**Q: What's the rate limit?**

A: Default rate limits:
- **Anonymous**: 100 requests per 15 minutes
- **Authenticated**: 1000 requests per 15 minutes
- **Premium**: 10000 requests per 15 minutes

Rate limit info is included in response headers.

---

**Q: Can I batch process colors?**

A: Yes, use the batch endpoint:
```javascript
POST /api/batch
{
  "colors": ["#FF0000", "#00FF00", "#0000FF"],
  "roomType": "living_room",
  "options": { "parallel": true }
}
```

Maximum 100 colors per batch request.

---

**Q: Is there a GraphQL API?**

A: Not currently. The REST API is optimized for color operations. GraphQL may be added in future versions based on demand.

---

### Color Theory Questions

**Q: What color harmonies are supported?**

A: We support:
- Complementary (opposite on color wheel)
- Analogous (adjacent colors)
- Triadic (three equidistant colors)
- Tetradic (four colors in rectangle)
- Split-complementary (base + two adjacent to complement)
- Custom (user-defined rules)

---

**Q: How are room-specific recommendations made?**

A: Each room type has optimized parameters:
- **Bedrooms**: Cool, calming colors (blues, greens)
- **Kitchens**: Warm, appetizing colors (avoid blues)
- **Offices**: Focus-enhancing colors (blues, greens)
- **Living Rooms**: Social, energizing colors
- **Children's Rooms**: Age-appropriate brightness and safety

---

**Q: Can I override the AI recommendations?**

A: Yes, you can:
1. Adjust confidence thresholds
2. Apply custom filters
3. Use manual color selection
4. Create custom harmony rules

The AI provides guidance, not restrictions.

---

## Error Messages Guide

### Common Error Codes

| Code | Message | Meaning | Solution |
|------|---------|---------|----------|
| 400 | Invalid hex color | Malformed color input | Use format #RRGGBB |
| 401 | Unauthorized | Missing API key | Include Authorization header |
| 403 | Forbidden | Invalid API key | Check API key validity |
| 404 | Color not found | Color not in database | Use closest match |
| 429 | Too many requests | Rate limit exceeded | Wait and retry |
| 500 | Internal server error | Server issue | Report to support |
| 503 | Service unavailable | Server overloaded | Try again later |

### JavaScript Console Errors

**Error:** `Uncaught TypeError: Cannot read property 'hex' of undefined`

**Meaning:** Trying to access color that doesn't exist

**Fix:**
```javascript
// Add null check
if (color && color.hex) {
  processColor(color.hex);
} else {
  console.error('Invalid color object:', color);
}
```

---

**Error:** `Failed to fetch`

**Meaning:** Network request failed

**Fix:**
```javascript
// Add error handling
fetch(url)
  .then(response => response.json())
  .catch(error => {
    console.error('Network error:', error);
    // Show user-friendly message
    showError('Unable to connect to server. Please try again.');
  });
```

---

## Getting Support

### Self-Service Resources

1. **Documentation**
   - User Guide: `/docs/USER_GUIDE.md`
   - API Reference: `/docs/API_REFERENCE.md`
   - Developer Guide: `/docs/DEVELOPER_GUIDE.md`

2. **Interactive Help**
   ```bash
   # Built-in help
   npm run help

   # API documentation
   curl http://localhost:3000/api/docs
   ```

3. **Diagnostic Tools**
   ```bash
   # Run diagnostic
   npm run diagnose

   # Check system compatibility
   npm run check-system

   # Validate configuration
   npm run validate-config
   ```

### Community Support

1. **GitHub Issues**
   - Search existing issues: [github.com/sanzo-color/issues](https://github.com)
   - Create new issue with template
   - Include error logs and steps to reproduce

2. **Discord Community**
   - Join: [discord.gg/sanzocolor](https://discord.gg)
   - Channels: #help, #bugs, #feature-requests

3. **Stack Overflow**
   - Tag: `sanzo-color-advisor`
   - Include minimal reproducible example

### Professional Support

1. **Email Support**
   - Standard: support@sanzocolor.com (48hr response)
   - Priority: priority@sanzocolor.com (4hr response)
   - Enterprise: enterprise@sanzocolor.com (1hr response)

2. **Support Ticket System**
   - Portal: [support.sanzocolor.com](https://support.sanzocolor.com)
   - Include:
     - Error messages
     - Screenshots
     - System information
     - Steps to reproduce

3. **Emergency Hotline**
   - For production outages only
   - Available for Enterprise customers
   - Contact sales for access

### Reporting Bugs

**Template for bug reports:**

```markdown
## Bug Description
Brief description of the issue

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Node.js: [e.g., 18.0.0]
- Browser: [e.g., Chrome 95]
- Package Version: [e.g., 1.0.0]

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Error Messages
```
Paste any error messages here
```

## Screenshots
If applicable, add screenshots

## Additional Context
Any other relevant information
```

### Contributing Fixes

If you've found a solution:

1. Fork the repository
2. Create a fix branch
3. Submit a pull request
4. Include:
   - Problem description
   - Solution explanation
   - Test cases
   - Documentation updates

---

## Quick Diagnostic Script

Save this as `diagnose.js` and run with `node diagnose.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');

console.log('Sanzo Color Advisor - System Diagnostic\n');

// Check Node.js version
console.log('Node.js version:', process.version);
if (process.version < 'v18.0.0') {
  console.error('⚠️  Node.js 18.0.0 or higher required');
}

// Check npm version
exec('npm --version', (err, stdout) => {
  console.log('NPM version:', stdout.trim());
});

// Check for required files
const requiredFiles = [
  '.env',
  'package.json',
  'src/index.js',
  'src/data/sanzo-colors.json'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.error(`✗ ${file} missing`);
  }
});

// Check environment variables
const requiredEnvVars = ['PORT', 'NODE_ENV'];
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✓ ${varName} is set`);
  } else {
    console.warn(`⚠️  ${varName} not set`);
  }
});

// Test port availability
const net = require('net');
const port = process.env.PORT || 3000;
const server = net.createServer();

server.listen(port, () => {
  console.log(`✓ Port ${port} is available`);
  server.close();
});

server.on('error', () => {
  console.error(`✗ Port ${port} is in use`);
});

// Memory check
const totalMemory = require('os').totalmem() / 1024 / 1024 / 1024;
const freeMemory = require('os').freemem() / 1024 / 1024 / 1024;

console.log(`\nSystem Memory: ${freeMemory.toFixed(2)}GB free of ${totalMemory.toFixed(2)}GB`);

if (freeMemory < 0.5) {
  console.warn('⚠️  Low memory available');
}

console.log('\nDiagnostic complete!');
```

---

## Conclusion

This troubleshooting guide covers the most common issues and their solutions. If you encounter a problem not listed here:

1. Check the [GitHub Issues](https://github.com/sanzo-color/issues) for similar problems
2. Search the [community forum](https://community.sanzocolor.com)
3. Contact [support](mailto:support@sanzocolor.com) with diagnostic information

Remember to always include:
- Error messages
- Steps to reproduce
- System information
- What you've already tried

---

*Last Updated: September 2024*
*Version: 1.0.0*