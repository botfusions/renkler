/**
 * Sanzo Color Advisor API Server
 * Express.js server for the color analysis and recommendation system
 * Integrates with SanzoColorAgent, GitHub API, and Web Scraper
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import our modules
const SanzoColorAgent = require('./components/ColorAgent');
const GitHubAPI = require('./api/githubAPI');
const WebScraper = require('./api/webScraper');
const MonitoringIntegration = require('./monitoring');

// Import utilities
const { validateColorInput, validateRoomType, validateAgeGroup } = require('./utils/validators');
const { formatResponse, formatError } = require('./utils/responseHelpers');
const { securityHeaders, sanitizeRequest, ipAuditLog } = require('./middleware/security');

class SanzoColorAPI {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.host = process.env.HOST || '0.0.0.0';

        // Initialize components
        this.colorAgent = new SanzoColorAgent();
        this.githubAPI = new GitHubAPI();
        this.webScraper = new WebScraper();
        this.monitoring = new MonitoringIntegration();

        this.setupMiddleware();
        this.setupRoutes();
        this.setupMonitoring();
        this.setupErrorHandling();
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Security middleware
        // Generate nonce for inline styles (if needed)
        this.app.use((req, res, next) => {
            res.locals.cspNonce = Buffer.from(Math.random().toString()).toString('base64');
            next();
        });

        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    // Allow external stylesheets, but not unsafe-inline
                    // Note: If you need inline styles, use nonce-based approach
                    styleSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    fontSrc: ["'self'", "data:"],
                    connectSrc: ["'self'", process.env.REACT_APP_SUPABASE_URL || "*"],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                    baseUri: ["'self'"],
                    formAction: ["'self'"],
                    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
                },
            },
            // Additional security headers
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            },
            frameguard: {
                action: 'deny'
            },
            noSniff: true,
            xssFilter: true,
            referrerPolicy: {
                policy: 'strict-origin-when-cross-origin'
            }
        }));

        // Additional security headers
        this.app.use(securityHeaders);

        // Request sanitization (prevent SQL injection, XSS)
        this.app.use(sanitizeRequest);

        // IP audit logging
        this.app.use(ipAuditLog);

        // Compression
        this.app.use(compression());

        // CORS configuration
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true
        }));

        // Rate limiting
        const generalLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: formatError('Too many requests from this IP', 429),
            standardHeaders: true,
            legacyHeaders: false,
        });

        const analysiLimiter = rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 10, // Limit analysis requests to 10 per minute
            message: formatError('Too many analysis requests', 429),
            standardHeaders: true,
            legacyHeaders: false,
        });

        this.app.use('/api/', generalLimiter);
        this.app.use('/api/analyze', analysiLimiter);

        // Request parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morgan('combined'));
        }

        // Request ID middleware
        this.app.use((req, res, next) => {
            req.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            res.setHeader('X-Request-ID', req.id);
            next();
        });
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/api/health', async (req, res) => {
            try {
                const [githubHealth, scraperHealth] = await Promise.all([
                    this.githubAPI.healthCheck(),
                    this.webScraper.healthCheck()
                ]);

                const health = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0',
                    uptime: process.uptime(),
                    services: {
                        colorAgent: { status: 'healthy' },
                        githubAPI: githubHealth,
                        webScraper: scraperHealth
                    }
                };

                res.json(formatResponse(health));
            } catch (error) {
                res.status(500).json(formatError('Health check failed', 500, error.message));
            }
        });

        // Main color analysis endpoint
        this.app.post('/api/analyze', async (req, res) => {
            try {
                const { roomType, ageGroup, wall, floor, furniture, accent, preferences } = req.body;

                // Validate required inputs
                if (!roomType) {
                    return res.status(400).json(formatError('roomType is required', 400));
                }

                if (!validateRoomType(roomType)) {
                    return res.status(400).json(formatError('Invalid roomType', 400));
                }

                if (ageGroup && !validateAgeGroup(ageGroup)) {
                    return res.status(400).json(formatError('Invalid ageGroup', 400));
                }

                // Validate colors if provided
                const colors = { wall, floor, furniture, accent };
                for (const [type, color] of Object.entries(colors)) {
                    if (color && !validateColorInput(color)) {
                        return res.status(400).json(formatError(`Invalid color format for ${type}`, 400));
                    }
                }

                // Check if at least one color is provided
                const providedColors = Object.values(colors).filter(Boolean);
                if (providedColors.length === 0) {
                    return res.status(400).json(formatError('At least one color must be provided', 400));
                }

                // Prepare input for color agent
                const input = {
                    roomType,
                    ageGroup: ageGroup || 'adult',
                    wall,
                    floor,
                    furniture,
                    accent,
                    preferences: preferences || {}
                };

                // Analyze color scheme
                const analysis = await this.colorAgent.analyzeColorScheme(input);

                if (!analysis.success) {
                    return res.status(400).json(formatError('Analysis failed', 400, analysis.errors));
                }

                // Add request metadata
                analysis.metadata.requestId = req.id;
                analysis.metadata.processingTime = Date.now() - parseInt(req.id, 36);

                res.json(formatResponse(analysis, 'Color analysis completed successfully'));
            } catch (error) {
                console.error('Analysis error:', error);
                res.status(500).json(formatError('Internal analysis error', 500, error.message));
            }
        });

        // Get all Sanzo colors
        this.app.get('/api/colors', (req, res) => {
            try {
                const { page = 1, limit = 50, search, category } = req.query;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);

                if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
                    return res.status(400).json(formatError('Invalid pagination parameters', 400));
                }

                // Get colors from color agent
                let colors = this.getColorsFromAgent();

                // Apply search filter
                if (search) {
                    const searchLower = search.toLowerCase();
                    colors = colors.filter(color =>
                        color.name.toLowerCase().includes(searchLower) ||
                        color.hex.toLowerCase().includes(searchLower) ||
                        (color.tags && color.tags.some(tag => tag.toLowerCase().includes(searchLower)))
                    );
                }

                // Apply category filter
                if (category) {
                    colors = colors.filter(color => color.category === category);
                }

                // Pagination
                const startIndex = (pageNum - 1) * limitNum;
                const endIndex = startIndex + limitNum;
                const paginatedColors = colors.slice(startIndex, endIndex);

                const result = {
                    colors: paginatedColors,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total: colors.length,
                        pages: Math.ceil(colors.length / limitNum),
                        hasNext: endIndex < colors.length,
                        hasPrev: pageNum > 1
                    }
                };

                res.json(formatResponse(result));
            } catch (error) {
                console.error('Get colors error:', error);
                res.status(500).json(formatError('Failed to retrieve colors', 500, error.message));
            }
        });

        // Get color combinations
        this.app.get('/api/combinations', (req, res) => {
            try {
                const { page = 1, limit = 20, roomType, ageGroup, style } = req.query;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);

                if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
                    return res.status(400).json(formatError('Invalid pagination parameters', 400));
                }

                // Get combinations from color agent
                let combinations = this.getCombinationsFromAgent();

                // Apply filters
                if (roomType) {
                    combinations = combinations.filter(combo =>
                        combo.suitableRooms && combo.suitableRooms.includes(roomType)
                    );
                }

                if (ageGroup) {
                    combinations = combinations.filter(combo =>
                        combo.ageGroups && combo.ageGroups.includes(ageGroup)
                    );
                }

                if (style) {
                    combinations = combinations.filter(combo =>
                        combo.style === style || (combo.tags && combo.tags.includes(style))
                    );
                }

                // Pagination
                const startIndex = (pageNum - 1) * limitNum;
                const endIndex = startIndex + limitNum;
                const paginatedCombinations = combinations.slice(startIndex, endIndex);

                const result = {
                    combinations: paginatedCombinations,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total: combinations.length,
                        pages: Math.ceil(combinations.length / limitNum),
                        hasNext: endIndex < combinations.length,
                        hasPrev: pageNum > 1
                    }
                };

                res.json(formatResponse(result));
            } catch (error) {
                console.error('Get combinations error:', error);
                res.status(500).json(formatError('Failed to retrieve combinations', 500, error.message));
            }
        });

        // Sync with external data sources
        this.app.post('/api/sync', async (req, res) => {
            try {
                const { source = 'all', force = false } = req.body;

                const results = {};

                if (source === 'all' || source === 'github') {
                    console.log('Syncing with GitHub...');
                    results.github = await this.githubAPI.syncWithRepository();
                }

                if (source === 'all' || source === 'web') {
                    console.log('Syncing with web scraper...');
                    results.web = await this.webScraper.scrapeAllColorPages();
                }

                const success = Object.values(results).every(result => result.success);

                if (success) {
                    res.json(formatResponse(results, 'Synchronization completed successfully'));
                } else {
                    res.status(207).json(formatResponse(results, 'Synchronization completed with some errors'));
                }
            } catch (error) {
                console.error('Sync error:', error);
                res.status(500).json(formatError('Synchronization failed', 500, error.message));
            }
        });

        // Get color by hex value
        this.app.get('/api/colors/:hex', (req, res) => {
            try {
                const { hex } = req.params;

                if (!validateColorInput(hex)) {
                    return res.status(400).json(formatError('Invalid hex color format', 400));
                }

                const color = this.findColorByHex(hex);

                if (!color) {
                    return res.status(404).json(formatError('Color not found', 404));
                }

                res.json(formatResponse(color));
            } catch (error) {
                console.error('Get color error:', error);
                res.status(500).json(formatError('Failed to retrieve color', 500, error.message));
            }
        });

        // Get similar colors
        this.app.post('/api/colors/similar', async (req, res) => {
            try {
                const { color, limit = 10, threshold = 10 } = req.body;

                if (!validateColorInput(color)) {
                    return res.status(400).json(formatError('Invalid color format', 400));
                }

                const limitNum = parseInt(limit);
                const thresholdNum = parseFloat(threshold);

                if (limitNum < 1 || limitNum > 50) {
                    return res.status(400).json(formatError('Limit must be between 1 and 50', 400));
                }

                if (thresholdNum < 0 || thresholdNum > 100) {
                    return res.status(400).json(formatError('Threshold must be between 0 and 100', 400));
                }

                const similarColors = await this.findSimilarColors(color, limitNum, thresholdNum);

                res.json(formatResponse({ colors: similarColors, query: color }));
            } catch (error) {
                console.error('Similar colors error:', error);
                res.status(500).json(formatError('Failed to find similar colors', 500, error.message));
            }
        });

        // ADVANCED FEATURES API ENDPOINTS

        // Advanced mathematical harmony analysis
        this.app.post('/api/advanced/harmony', async (req, res) => {
            try {
                const { baseColor, options = {} } = req.body;

                if (!validateColorInput(baseColor)) {
                    return res.status(400).json(formatError('Invalid base color format', 400));
                }

                const harmonyAnalysis = this.colorAgent.advancedHarmony.generateAdvancedMathematicalHarmony(baseColor, options);

                res.json(formatResponse(harmonyAnalysis, 'Advanced harmony analysis completed'));
            } catch (error) {
                console.error('Advanced harmony error:', error);
                res.status(500).json(formatError('Advanced harmony analysis failed', 500, error.message));
            }
        });

        // Advanced color psychology analysis
        this.app.post('/api/advanced/psychology', async (req, res) => {
            try {
                const { mood, personalityType, roomType, options = {} } = req.body;

                if (!roomType || !validateRoomType(roomType)) {
                    return res.status(400).json(formatError('Valid roomType is required', 400));
                }

                const psychologyConfig = {
                    currentMood: mood || 'balanced',
                    desiredMood: options.desiredMood || 'comfortable',
                    roomType,
                    personalityType: personalityType || 'balanced',
                    activityLevel: options.activityLevel || 'moderate'
                };

                const psychologyAnalysis = this.colorAgent.advancedPsychology.generateMoodBasedRecommendation(psychologyConfig);

                res.json(formatResponse(psychologyAnalysis, 'Advanced psychology analysis completed'));
            } catch (error) {
                console.error('Advanced psychology error:', error);
                res.status(500).json(formatError('Advanced psychology analysis failed', 500, error.message));
            }
        });

        // Color trend analysis
        this.app.get('/api/advanced/trends', async (req, res) => {
            try {
                const { year, region = 'global', industry = 'interior_design', baseColor } = req.query;

                const trendConfig = {
                    year: year ? parseInt(year) : new Date().getFullYear(),
                    region,
                    industry,
                    baseColor: baseColor || null
                };

                const trendAnalysis = this.colorAgent.trendAnalysis.getCurrentTrendAnalysis(trendConfig);

                res.json(formatResponse(trendAnalysis, 'Color trend analysis completed'));
            } catch (error) {
                console.error('Trend analysis error:', error);
                res.status(500).json(formatError('Trend analysis failed', 500, error.message));
            }
        });

        // Turkish cultural color analysis
        this.app.post('/api/advanced/cultural', async (req, res) => {
            try {
                const { baseColor, options = {} } = req.body;

                if (!validateColorInput(baseColor)) {
                    return res.status(400).json(formatError('Invalid base color format', 400));
                }

                const culturalOptions = {
                    includeTraditional: options.includeTraditional !== false,
                    includeModern: options.includeModern !== false,
                    includeSymbolic: options.includeSymbolic !== false,
                    roomType: options.roomType || 'living_room'
                };

                const culturalAnalysis = this.colorAgent.culturalColors.analyzeCulturalHarmony(baseColor, culturalOptions);

                res.json(formatResponse(culturalAnalysis, 'Cultural color analysis completed'));
            } catch (error) {
                console.error('Cultural analysis error:', error);
                res.status(500).json(formatError('Cultural analysis failed', 500, error.message));
            }
        });

        // Seasonal color analysis
        this.app.post('/api/advanced/seasonal', async (req, res) => {
            try {
                const { personalColors } = req.body;

                if (!personalColors || !personalColors.skinTone || !personalColors.eyeColor || !personalColors.hairColor) {
                    return res.status(400).json(formatError('Personal colors (skinTone, eyeColor, hairColor) are required', 400));
                }

                const seasonalAnalysis = this.colorAgent.seasonalAnalysis.analyzePersonalColors(personalColors);

                res.json(formatResponse(seasonalAnalysis, 'Seasonal color analysis completed'));
            } catch (error) {
                console.error('Seasonal analysis error:', error);
                res.status(500).json(formatError('Seasonal analysis failed', 500, error.message));
            }
        });

        // Brand color integration
        this.app.post('/api/advanced/brand', async (req, res) => {
            try {
                const { brandColors, options = {} } = req.body;

                if (!brandColors || !Array.isArray(brandColors) || brandColors.length === 0) {
                    return res.status(400).json(formatError('Brand colors array is required', 400));
                }

                // Validate brand colors
                for (const color of brandColors) {
                    if (!validateColorInput(color)) {
                        return res.status(400).json(formatError(`Invalid brand color format: ${color}`, 400));
                    }
                }

                const brandOptions = {
                    roomType: options.roomType || 'living_room',
                    industry: options.industry || 'general',
                    brandPersonality: options.brandPersonality || 'balanced'
                };

                const brandAnalysis = await this.colorAgent.brandIntegration.generateBrandConsistentPalette(brandColors, brandOptions);

                res.json(formatResponse(brandAnalysis, 'Brand color analysis completed'));
            } catch (error) {
                console.error('Brand analysis error:', error);
                res.status(500).json(formatError('Brand analysis failed', 500, error.message));
            }
        });

        // Comprehensive advanced analysis (combines all systems)
        this.app.post('/api/advanced/comprehensive', async (req, res) => {
            try {
                const input = {
                    roomType: req.body.roomType,
                    ageGroup: req.body.ageGroup || 'adult',
                    wall: req.body.wall,
                    floor: req.body.floor,
                    furniture: req.body.furniture,
                    accent: req.body.accent,
                    preferences: req.body.preferences || {}
                };

                // Validate required inputs
                if (!input.roomType || !validateRoomType(input.roomType)) {
                    return res.status(400).json(formatError('Valid roomType is required', 400));
                }

                // Check if at least one color is provided
                const providedColors = [input.wall, input.floor, input.furniture, input.accent].filter(Boolean);
                if (providedColors.length === 0) {
                    return res.status(400).json(formatError('At least one color must be provided', 400));
                }

                // Validate colors
                for (const [type, color] of Object.entries({wall: input.wall, floor: input.floor, furniture: input.furniture, accent: input.accent})) {
                    if (color && !validateColorInput(color)) {
                        return res.status(400).json(formatError(`Invalid color format for ${type}`, 400));
                    }
                }

                // Perform comprehensive analysis
                const analysis = await this.colorAgent.analyzeColorScheme(input);

                if (!analysis.success) {
                    return res.status(400).json(formatError('Analysis failed', 400, analysis.errors));
                }

                // Add request metadata
                analysis.metadata.requestId = req.id;
                analysis.metadata.endpoint = 'advanced_comprehensive';

                res.json(formatResponse(analysis, 'Comprehensive advanced analysis completed'));
            } catch (error) {
                console.error('Comprehensive analysis error:', error);
                res.status(500).json(formatError('Comprehensive analysis failed', 500, error.message));
            }
        });

        // API documentation endpoint
        this.app.get('/api/docs', (req, res) => {
            const documentation = this.generateAPIDocs();
            res.json(formatResponse(documentation));
        });

        // Cache management endpoints
        this.app.delete('/api/cache', async (req, res) => {
            try {
                const [githubResult, scraperResult] = await Promise.all([
                    this.githubAPI.clearCache(),
                    this.webScraper.clearCache()
                ]);

                const result = {
                    github: githubResult,
                    scraper: scraperResult
                };

                res.json(formatResponse(result, 'Cache cleared successfully'));
            } catch (error) {
                console.error('Clear cache error:', error);
                res.status(500).json(formatError('Failed to clear cache', 500, error.message));
            }
        });

        this.app.get('/api/cache/status', async (req, res) => {
            try {
                const [githubStatus, scraperStatus] = await Promise.all([
                    this.githubAPI.getCacheStatus(),
                    this.webScraper.getCacheStatus ? this.webScraper.getCacheStatus() : { success: true, data: { exists: false } }
                ]);

                const status = {
                    github: githubStatus,
                    scraper: scraperStatus
                };

                res.json(formatResponse(status));
            } catch (error) {
                console.error('Cache status error:', error);
                res.status(500).json(formatError('Failed to get cache status', 500, error.message));
            }
        });

        // Catch-all for API routes
        this.app.all('/api/*', (req, res) => {
            res.status(404).json(formatError('API endpoint not found', 404));
        });

        // Static file serving
        this.app.use(express.static('public'));

        // Customer interface (redirect to customer.html)
        this.app.get('/customer', (req, res) => {
            res.sendFile(require('path').join(__dirname, '../public/customer.html'));
        });

        // Simplified customer API (optimized for simple UI)
        this.app.post('/api/customer/analyze', async (req, res) => {
            try {
                const { roomType, ageGroup = 'adult', wallColor, floorColor } = req.body;

                // Validate required inputs
                if (!roomType) {
                    return res.status(400).json({
                        success: false,
                        error: 'Oda tipi seçimi gereklidir'
                    });
                }

                if (!validateRoomType(roomType)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Geçersiz oda tipi'
                    });
                }

                // Prepare input for color agent
                const input = {
                    roomType,
                    ageGroup,
                    wall: wallColor || undefined,
                    floor: floorColor || undefined
                };

                // If no colors provided, use defaults based on room type
                if (!wallColor && !floorColor) {
                    // Provide sensible defaults so analysis can proceed
                    input.wall = '#F5F5F5'; // Light gray default wall
                }

                // Analyze color scheme
                const analysis = await this.colorAgent.analyzeColorScheme(input);

                if (!analysis.success) {
                    return res.status(400).json({
                        success: false,
                        error: 'Renk analizi başarısız oldu'
                    });
                }

                // Format response for customer UI (simplified)
                const customerResponse = {
                    success: true,
                    recommendations: analysis.recommendations.slice(0, 3).map(rec => ({
                        id: rec.id,
                        name: this.translateRecommendationName(rec),
                        type: rec.type,
                        colors: rec.colors,
                        confidence: rec.confidence,
                        description: this.translateDescription(rec),
                        psychologicalEffects: this.translatePsychology(rec.psychologicalEffects)
                    })),
                    roomInfo: {
                        type: roomType,
                        ageGroup,
                        description: this.getRoomDescription(roomType, ageGroup)
                    }
                };

                res.json(customerResponse);
            } catch (error) {
                console.error('Customer analysis error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Teknik bir hata oluştu. Lütfen tekrar deneyin.'
                });
            }
        });

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json(formatResponse({
                name: 'Sanzo Color Advisor API',
                version: '2.0.0',
                description: 'AI-powered color advisor based on Sanzo Wada\'s Dictionary of Color Combinations with Advanced Mathematical Harmony, Psychology, Trends, and Cultural Analysis',
                endpoints: {
                    // Core endpoints
                    health: 'GET /api/health',
                    analyze: 'POST /api/analyze',
                    colors: 'GET /api/colors',
                    combinations: 'GET /api/combinations',
                    sync: 'POST /api/sync',
                    docs: 'GET /api/docs',

                    // Advanced analysis endpoints
                    advancedHarmony: 'POST /api/advanced/harmony',
                    advancedPsychology: 'POST /api/advanced/psychology',
                    trendAnalysis: 'GET /api/advanced/trends',
                    culturalAnalysis: 'POST /api/advanced/cultural',
                    seasonalAnalysis: 'POST /api/advanced/seasonal',
                    brandIntegration: 'POST /api/advanced/brand',
                    comprehensiveAnalysis: 'POST /api/advanced/comprehensive'
                },
                features: {
                    mathematicalHarmony: ['Fibonacci sequences', 'Bezier curves', 'Fourier analysis', 'Genetic algorithms'],
                    advancedPsychology: ['Mood-based recommendations', 'Personality alignment', 'Circadian optimization'],
                    trendAnalysis: ['Historical patterns', 'Predictive algorithms', 'Industry-specific trends'],
                    culturalIntegration: ['Turkish color traditions', 'Cultural symbolism', 'Heritage patterns'],
                    brandConsistency: ['Logo color extraction', 'Brand palette optimization', 'Industry alignment'],
                    seasonalColors: ['Personal color analysis', 'Four-season theory', 'Undertone detection']
                }
            }));
        });
    }

    /**
     * Setup monitoring integration
     */
    setupMonitoring() {
        this.monitoring.integrateWithApp(this.app);
    }

    /**
     * Setup error handling middleware
     */
    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json(formatError('Resource not found', 404));
        });

        // Note: Error handler is now integrated in monitoring.integrateWithApp()
        // to ensure proper middleware order
    }

    /**
     * Extract colors from color agent
     */
    getColorsFromAgent() {
        const colors = [];

        // Extract from Sanzo harmonies
        const harmonies = [
            ...this.colorAgent.sanzoHarmonies.traditionalHarmonies,
            ...this.colorAgent.sanzoHarmonies.modernAdaptations
        ];

        harmonies.forEach(harmony => {
            harmony.colors.forEach((hex, index) => {
                colors.push({
                    hex: hex,
                    name: `${harmony.name} Color ${index + 1}`,
                    category: 'sanzo_harmony',
                    harmony: harmony.name,
                    psychology: harmony.psychology,
                    suitableRooms: harmony.suitableRooms,
                    ageGroups: harmony.ageGroups,
                    confidence: harmony.confidence
                });
            });
        });

        return colors;
    }

    /**
     * Extract combinations from color agent
     */
    getCombinationsFromAgent() {
        return [
            ...this.colorAgent.sanzoHarmonies.traditionalHarmonies,
            ...this.colorAgent.sanzoHarmonies.modernAdaptations
        ];
    }

    /**
     * Find color by hex value
     */
    findColorByHex(hex) {
        const colors = this.getColorsFromAgent();
        const normalizedHex = hex.toUpperCase();

        return colors.find(color =>
            color.hex.toUpperCase() === normalizedHex ||
            color.hex.toUpperCase() === `#${normalizedHex.replace('#', '')}`
        );
    }

    /**
     * Find similar colors using color distance
     */
    async findSimilarColors(targetColor, limit, threshold) {
        const colors = this.getColorsFromAgent();
        const ColorConversions = require('./utils/colorConversions');
        const DeltaE = require('./utils/deltaE');

        // Convert target color to LAB
        const targetRgb = ColorConversions.hexToRgb(targetColor);
        const targetLab = ColorConversions.rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);

        // Calculate distances
        const colorDistances = colors.map(color => {
            const colorRgb = ColorConversions.hexToRgb(color.hex);
            const colorLab = ColorConversions.rgbToLab(colorRgb.r, colorRgb.g, colorRgb.b);
            const distance = DeltaE.deltaE2000(targetLab, colorLab);

            return {
                ...color,
                distance: distance
            };
        });

        // Filter by threshold and sort by distance
        return colorDistances
            .filter(color => color.distance <= threshold)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
    }

    /**
     * Helper functions for customer UI
     */
    translateRecommendationName(rec) {
        const translations = {
            'sanzo_harmony': 'Sanzo Wada Klasik Harmonisi',
            'complementary': 'Tamamlayıcı Renk Uyumu',
            'analogous': 'Benzer Renk Uyumu',
            'neutral': 'Nötr Şıklık',
            'sanzo_wada_classic_warm': 'Klasik Sıcak Tonlar',
            'sanzo_tranquil_blues': 'Huzurlu Mavi Tonlar',
            'sanzo_earth_tones': 'Doğal Toprak Renkleri',
            'sanzo_gentle_greens': 'Yumuşak Yeşil Tonlar',
            'sanzo_sunset_warmth': 'Gün Batımı Sıcaklığı'
        };
        return translations[rec.id] || translations[rec.type] || rec.name || 'Renk Önerisi';
    }

    translateDescription(rec) {
        if (rec.reasoning) {
            // Simple Turkish translations for common reasoning
            return rec.reasoning
                .replace(/Based on Sanzo Wada/g, 'Sanzo Wada\'nın teorisine göre')
                .replace(/harmony/g, 'uyum')
                .replace(/Creates visual interest/g, 'Görsel ilgi yaratır')
                .replace(/complementary/g, 'tamamlayıcı')
                .replace(/analogous/g, 'benzer')
                .replace(/neutral/g, 'nötr');
        }
        return 'Bu renk kombinasyonu odanız için uyumlu bir atmosfer yaratacaktır.';
    }

    translatePsychology(effects) {
        if (!effects) return 'Rahat ve dengeli';

        const translations = {
            'comfort': 'rahatlık',
            'warmth': 'sıcaklık',
            'calm': 'sakinlik',
            'energy': 'enerji',
            'creativity': 'yaratıcılık',
            'focus': 'odaklanma',
            'balance': 'denge',
            'sophistication': 'şıklık',
            'harmony': 'uyum',
            'serenity': 'huzur',
            'clarity': 'berraklık',
            'stability': 'stabilite',
            'growth': 'büyüme',
            'rejuvenation': 'yenilenme'
        };

        return effects.split(', ').map(effect =>
            translations[effect.trim()] || effect
        ).join(', ');
    }

    getRoomDescription(roomType, ageGroup) {
        const descriptions = {
            'living_room': 'Misafirlerinizi ağırlamak ve aile ile keyifli vakit geçirmek için ideal',
            'bedroom': 'Dinlenmek ve rahatlamak için tasarlanmış huzurlu bir alan',
            'child_bedroom': 'Çocuğunuzun gelişimi ve mutluluğu için özel olarak düşünülmüş',
            'study': 'Odaklanma ve verimli çalışma için optimize edilmiş',
            'dining_room': 'Ailenizle lezzetli yemeklerin tadını çıkarabileceğiniz sosyal alan',
            'bathroom': 'Temizlik ve ferahlık hissi veren rahatlatıcı bir mekan',
            'playroom': 'Oyun ve eğlence için tasarlanmış yaratıcı bir alan'
        };

        let desc = descriptions[roomType] || 'Özel olarak tasarlanmış yaşam alanı';

        if (ageGroup && ageGroup !== 'adult') {
            const ageDescriptions = {
                '0-3': 'bebeğinizin güvenli gelişimi',
                '4-6': 'okul öncesi çocuğunuzun keşif yolculuğu',
                '7-12': 'çocuğunuzun öğrenme maceraları',
                '13-18': 'gençinizin kişilik gelişimi'
            };
            if (ageDescriptions[ageGroup]) {
                desc += ` - ${ageDescriptions[ageGroup]} için uygun`;
            }
        }

        return desc;
    }

    /**
     * Generate API documentation
     */
    generateAPIDocs() {
        return {
            title: 'Sanzo Color Advisor API',
            version: '2.0.0',
            description: 'AI-powered color advisor based on Sanzo Wada\'s Dictionary of Color Combinations with Advanced Mathematical Harmony, Psychology, Trends, and Cultural Analysis',
            baseURL: `http://${this.host}:${this.port}`,
            endpoints: [
                {
                    path: '/api/health',
                    method: 'GET',
                    description: 'Health check endpoint',
                    responses: {
                        200: 'Service status and health information'
                    }
                },
                {
                    path: '/api/analyze',
                    method: 'POST',
                    description: 'Analyze color scheme and get recommendations',
                    parameters: {
                        roomType: 'Required. Room type (child_bedroom, living_room, bedroom, study, dining_room, bathroom, playroom)',
                        ageGroup: 'Optional. Age group (0-3, 4-6, 7-12, 13-18, adult, elderly)',
                        wall: 'Optional. Wall color in hex format',
                        floor: 'Optional. Floor color in hex format',
                        furniture: 'Optional. Furniture color in hex format',
                        accent: 'Optional. Accent color in hex format'
                    },
                    responses: {
                        200: 'Color analysis and recommendations',
                        400: 'Invalid input parameters'
                    }
                },
                {
                    path: '/api/colors',
                    method: 'GET',
                    description: 'Get paginated list of Sanzo colors',
                    parameters: {
                        page: 'Page number (default: 1)',
                        limit: 'Items per page (default: 50, max: 100)',
                        search: 'Search term for color names or hex values',
                        category: 'Filter by color category'
                    },
                    responses: {
                        200: 'Paginated list of colors'
                    }
                },
                {
                    path: '/api/combinations',
                    method: 'GET',
                    description: 'Get paginated list of color combinations',
                    parameters: {
                        page: 'Page number (default: 1)',
                        limit: 'Items per page (default: 20, max: 50)',
                        roomType: 'Filter by room type',
                        ageGroup: 'Filter by age group',
                        style: 'Filter by style'
                    },
                    responses: {
                        200: 'Paginated list of color combinations'
                    }
                },
                {
                    path: '/api/sync',
                    method: 'POST',
                    description: 'Sync with external data sources',
                    parameters: {
                        source: 'Data source to sync (all, github, web)',
                        force: 'Force sync even if cache is valid'
                    },
                    responses: {
                        200: 'Sync completed successfully',
                        207: 'Sync completed with some errors'
                    }
                },
                {
                    path: '/api/advanced/harmony',
                    method: 'POST',
                    description: 'Advanced mathematical harmony analysis using Fibonacci, Bezier, Fourier, and genetic algorithms',
                    parameters: {
                        baseColor: 'Required. Base color in hex format',
                        options: 'Optional. Configuration object with mathematical model preferences'
                    },
                    responses: {
                        200: 'Advanced harmony analysis with mathematical models',
                        400: 'Invalid input parameters'
                    }
                },
                {
                    path: '/api/advanced/psychology',
                    method: 'POST',
                    description: 'Advanced color psychology analysis for mood and personality optimization',
                    parameters: {
                        mood: 'Optional. Current mood (energetic, calm, focused, etc.)',
                        personalityType: 'Optional. Personality type (extroverted, introverted, balanced)',
                        roomType: 'Required. Room type for context',
                        options: 'Optional. Additional psychology configuration'
                    },
                    responses: {
                        200: 'Advanced psychology analysis with mood recommendations',
                        400: 'Invalid input parameters'
                    }
                },
                {
                    path: '/api/advanced/trends',
                    method: 'GET',
                    description: 'Color trend analysis with historical and predictive insights',
                    parameters: {
                        year: 'Optional. Year for trend analysis (default: current year)',
                        region: 'Optional. Geographic region (default: global)',
                        industry: 'Optional. Industry context (default: interior_design)',
                        baseColor: 'Optional. Base color for trend correlation'
                    },
                    responses: {
                        200: 'Color trend analysis with historical and predictive data'
                    }
                },
                {
                    path: '/api/advanced/cultural',
                    method: 'POST',
                    description: 'Turkish cultural color analysis with traditional and modern interpretations',
                    parameters: {
                        baseColor: 'Required. Base color in hex format',
                        options: 'Optional. Cultural analysis preferences (traditional, modern, symbolic)'
                    },
                    responses: {
                        200: 'Cultural color analysis with Turkish color traditions',
                        400: 'Invalid input parameters'
                    }
                },
                {
                    path: '/api/advanced/seasonal',
                    method: 'POST',
                    description: 'Personal seasonal color analysis based on individual characteristics',
                    parameters: {
                        personalColors: 'Required. Object with skinTone, eyeColor, and hairColor'
                    },
                    responses: {
                        200: 'Seasonal color analysis with personal color recommendations',
                        400: 'Invalid personal color parameters'
                    }
                },
                {
                    path: '/api/advanced/brand',
                    method: 'POST',
                    description: 'Brand color integration for consistent brand-aligned palettes',
                    parameters: {
                        brandColors: 'Required. Array of brand colors in hex format',
                        options: 'Optional. Brand integration preferences (industry, personality, room context)'
                    },
                    responses: {
                        200: 'Brand-consistent color palette analysis',
                        400: 'Invalid brand color parameters'
                    }
                },
                {
                    path: '/api/advanced/comprehensive',
                    method: 'POST',
                    description: 'Comprehensive analysis combining all advanced color systems',
                    parameters: {
                        roomType: 'Required. Room type for analysis context',
                        ageGroup: 'Optional. Age group consideration',
                        wall: 'Optional. Wall color in hex format',
                        floor: 'Optional. Floor color in hex format',
                        furniture: 'Optional. Furniture color in hex format',
                        accent: 'Optional. Accent color in hex format',
                        preferences: 'Optional. Advanced preferences for all analysis systems'
                    },
                    responses: {
                        200: 'Comprehensive analysis with all advanced features',
                        400: 'Invalid input parameters'
                    }
                }
            ]
        };
    }

    /**
     * Start the server
     */
    start() {
        this.app.listen(this.port, this.host, () => {
            console.log(`🎨 Sanzo Color Advisor API server running on ${this.host}:${this.port}`);
            console.log(`📚 API Documentation: http://${this.host}:${this.port}/api/docs`);
            console.log(`💚 Health Check: http://${this.host}:${this.port}/api/health`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM, shutting down gracefully...');
            process.exit(0);
        });

        process.on('SIGINT', () => {
            console.log('Received SIGINT, shutting down gracefully...');
            process.exit(0);
        });
    }
}

// Create and start server if this file is run directly
if (require.main === module) {
    const api = new SanzoColorAPI();
    api.start();
}

module.exports = SanzoColorAPI;