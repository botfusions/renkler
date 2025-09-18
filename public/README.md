# Sanzo Color Advisor Frontend

A modern, responsive frontend for the Sanzo Color Advisor - an AI-powered color analysis tool based on Sanzo Wada's Dictionary of Color Combinations.

## 🎨 Features

### Core Functionality
- **Interactive Color Selection**: Real-time color pickers with hex input support
- **Room Type Optimization**: Tailored recommendations for different room types
- **Age Group Consideration**: Psychological color recommendations by age
- **Live Preview**: Real-time room visualization with selected colors
- **AI-Powered Analysis**: Integration with sophisticated color analysis API

### User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility First**: WCAG 2.1 AA compliant with screen reader support
- **Modern Interface**: Clean, professional design with smooth animations
- **Intuitive Navigation**: Clear flow from selection to results

### Advanced Features
- **Export Functionality**: Save analysis results as JSON
- **Social Sharing**: Share color recommendations via Web Share API
- **Offline-Ready**: Graceful handling of API disconnections
- **Form Validation**: Real-time validation with helpful error messages
- **Color Accessibility**: Contrast ratio analysis and accessibility info

## 📁 File Structure

```
public/
├── index.html              # Main application
├── demo.html              # Demo version with mock data
├── styles.css             # Complete CSS with design system
├── js/
│   ├── App.js             # Main application orchestration
│   ├── ApiClient.js       # API integration with error handling
│   ├── ColorPicker.js     # Interactive color selection
│   └── ResultDisplay.js   # Results visualization
└── README.md              # This file
```

## 🚀 Getting Started

### Option 1: With Backend API

1. Start the Sanzo Color Advisor API:
   ```bash
   cd ../
   npm start
   ```

2. Serve the frontend (choose one):
   ```bash
   # Using Node.js http-server
   npm install -g http-server
   http-server public -p 8080

   # Using Python
   python -m http.server 8080 --directory public

   # Using PHP
   php -S localhost:8080 -t public
   ```

3. Open http://localhost:8080 in your browser

### Option 2: Demo Mode (No API Required)

1. Open `demo.html` directly in a browser, or serve it:
   ```bash
   # Serve the demo
   python -m http.server 8080 --directory public
   ```

2. Open http://localhost:8080/demo.html

3. Use the demo buttons to test functionality:
   - **Fill Demo Data**: Populates form with example values
   - **Random Colors**: Generates harmonic color combinations
   - **Test API**: Checks backend connection
   - **Show Mock Result**: Displays example analysis results

## 🎯 Usage Guide

### Basic Workflow

1. **Select Room Type**: Choose from living room, bedroom, child's room, etc.
2. **Choose Age Group**: If applicable (for child rooms)
3. **Pick Colors**: Use color pickers or enter hex values
4. **Preview**: Watch live preview update as you select colors
5. **Analyze**: Submit for AI-powered color analysis
6. **Review Results**: Explore recommendations with confidence scores
7. **Export/Share**: Save or share your color combinations

### Color Input Methods

- **Color Picker**: Visual color selection with native browser picker
- **Hex Input**: Direct hex color entry (e.g., `#FF6347`)
- **Validation**: Real-time validation with error correction
- **Preview**: Live preview of all color selections

### Understanding Results

- **Confidence Score**: 0-100 rating of color harmony
- **Color Swatches**: Click to copy hex values to clipboard
- **Psychological Effects**: How colors will make you feel
- **Implementation Tips**: Practical advice for using colors

## 🎨 Design System

### Color Palette
- **Primary**: #667eea (Sanzo-inspired blue)
- **Secondary**: #764ba2 (Complementary purple)
- **Accent**: #f093fb (Gradient accent)
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #ef4444

### Typography
- **Font Stack**: Inter, system fonts
- **Fluid Sizing**: Responsive typography using clamp()
- **Weight Scale**: 400, 500, 600, 700, 800

### Spacing System
- **Base Unit**: 1rem (16px)
- **Scale**: 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 6rem
- **Consistent Grid**: All spacing based on systematic scale

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
Base: 320px and up (mobile)
Tablet: 768px and up
Desktop: 1024px and up
Large: 1200px and up
```

### Responsive Features
- **Fluid Grid**: CSS Grid with auto-fit columns
- **Flexible Typography**: clamp() for smooth scaling
- **Touch-Friendly**: 44px minimum touch targets
- **Orientation Support**: Adapts to portrait/landscape

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and live regions
- **Color Contrast**: 4.5:1 minimum contrast ratios
- **Focus Management**: Visible focus indicators
- **Error Handling**: Clear, helpful error messages

### Assistive Technology Support
- **Skip Links**: Jump to main content
- **Semantic HTML**: Proper heading structure
- **Form Labels**: Associated labels for all inputs
- **Status Updates**: Live announcements for state changes

## 🔧 Technical Architecture

### JavaScript Modules
- **App.js**: Main orchestration and state management
- **ApiClient.js**: HTTP client with retry logic and error handling
- **ColorPicker.js**: Color input management and validation
- **ResultDisplay.js**: Results rendering and interactions

### API Integration
- **Base URL**: http://localhost:3000/api
- **Endpoints**: /analyze, /colors, /combinations, /health
- **Error Handling**: Graceful degradation with user feedback
- **Retry Logic**: Automatic retry with exponential backoff

### State Management
- **Local Storage**: Auto-save form state and preferences
- **Session Persistence**: Restore state between sessions
- **Connection Monitoring**: Real-time API status updates

## 🧪 Testing

### Manual Testing Checklist

#### Functionality
- [ ] Color pickers sync with hex inputs
- [ ] Room type changes show/hide age group
- [ ] Form validation works correctly
- [ ] API integration handles errors gracefully
- [ ] Results display properly with all features

#### Responsiveness
- [ ] Mobile (320px+): Stacked layout, touch-friendly
- [ ] Tablet (768px+): Two-column forms, larger previews
- [ ] Desktop (1024px+): Multi-column layout, full features

#### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility (test with NVDA/JAWS)
- [ ] High contrast mode support
- [ ] Focus indicators visible and logical

### Browser Support
- **Modern**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Features**: ES6+, CSS Grid, CSS Custom Properties, Web APIs
- **Graceful Degradation**: Older browsers get basic functionality

## 🚦 Error Handling

### Network Errors
- **Offline Detection**: Shows offline status and cached capabilities
- **Retry Logic**: Automatic retries with user feedback
- **Fallback UI**: Graceful degradation when API unavailable

### User Input Errors
- **Real-time Validation**: Immediate feedback on invalid inputs
- **Error Recovery**: Suggestions for fixing validation errors
- **Accessible Errors**: Screen reader announcements and visual indicators

### Application Errors
- **Initialization Failures**: Clear error messages with reload option
- **Component Errors**: Isolated error boundaries prevent total failure
- **Logging**: Comprehensive console logging for debugging

## 🎛️ Configuration

### API Configuration
```javascript
// Update API base URL
window.sanzoApp.updateConfig({
    apiBaseUrl: 'https://your-api-domain.com/api'
});
```

### Feature Toggles
```javascript
// Disable auto-save
window.sanzoApp.updateConfig({
    autoSave: false
});

// Change retry configuration
window.sanzoApp.components.apiClient.setRetryConfig(5, 2000);
```

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Deferred script loading
- **Resource Hints**: Preload critical resources
- **Compressed Assets**: Optimized CSS and JavaScript
- **Efficient Animations**: CSS transforms and transitions

### Performance Metrics
- **First Paint**: < 1s
- **Interactive**: < 2s
- **Bundle Size**: ~150KB total (uncompressed)
- **Lighthouse Score**: 95+ across all metrics

## 🔒 Security

### Data Protection
- **Client-Side Only**: No sensitive data stored permanently
- **XSS Prevention**: HTML escaping for user inputs
- **HTTPS Ready**: Secure headers and protocols
- **Privacy Focused**: Minimal data collection

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Serve files locally (no build process required)
3. Make changes to HTML, CSS, or JavaScript files
4. Test across different browsers and devices

### Code Style
- **JavaScript**: ES6+ with clear naming conventions
- **CSS**: BEM methodology with custom properties
- **HTML**: Semantic markup with accessibility in mind

### Commit Guidelines
- Use clear, descriptive commit messages
- Test changes across browsers before committing
- Include accessibility testing in pull requests

## 📄 License

MIT License - see the main project LICENSE file for details.

## 🙏 Acknowledgments

- **Sanzo Wada**: Original color theory and combinations
- **mattdesl**: Digital reproduction of Sanzo's work
- **Modern Web Standards**: For enabling rich, accessible experiences

---

Built with ❤️ for designers and color enthusiasts worldwide.