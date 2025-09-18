/**
 * Monitoring Middleware for Sanzo Color Advisor
 * Integrates monitoring, analytics, and logging into Express.js requests
 */

const responseTime = require('response-time');

class MonitoringMiddleware {
    constructor(metricsCollector, analyticsTracker, logger, healthMonitor) {
        this.metrics = metricsCollector;
        this.analytics = analyticsTracker;
        this.logger = logger;
        this.health = healthMonitor;

        // Session tracking
        this.activeSessions = new Map();
    }

    /**
     * Setup all monitoring middleware
     */
    setupMiddleware(app) {
        // Performance monitoring
        app.use(this.performanceMiddleware());

        // Session tracking
        app.use(this.sessionMiddleware());

        // Request/Response logging
        app.use(this.requestLoggingMiddleware());

        // Error tracking
        app.use(this.errorTrackingMiddleware());

        // Metrics endpoint
        app.get('/metrics', this.metricsEndpoint());

        this.logger.info('Monitoring middleware initialized');
    }

    /**
     * Performance monitoring middleware
     */
    performanceMiddleware() {
        return responseTime((req, res, time) => {
            const route = this.extractRoute(req);
            const statusCode = res.statusCode;
            const method = req.method;

            // Record HTTP metrics
            this.metrics.recordHttpRequest(method, route, statusCode, time / 1000);

            // Track API latency
            this.metrics.recordApiLatency(route, time / 1000);

            // Log request performance
            this.logger.logRequest(req, res, time);

            // Track performance in analytics
            this.analytics.trackPerformance(route, time, statusCode);

            // Record color calculations if applicable
            if (route === '/api/analyze' || route === '/api/colors/similar') {
                this.metrics.recordColorCalculation();
            }

            // Log slow requests
            if (time > 2000) { // 2 seconds
                this.logger.warn('Slow request detected', {
                    method,
                    route,
                    responseTime: time,
                    statusCode,
                    requestId: req.id
                });
            }
        });
    }

    /**
     * Session tracking middleware
     */
    sessionMiddleware() {
        return (req, res, next) => {
            // Track active connections
            this.metrics.incrementActiveConnections();

            // Start or update session
            const sessionId = this.analytics.startSession(req);
            req.sessionId = sessionId;

            // Track active session
            this.activeSessions.set(sessionId, {
                startTime: Date.now(),
                lastActivity: Date.now(),
                ip: this.analytics.generateSessionId(req) // Use hashed version
            });

            // Clean up on response finish
            res.on('finish', () => {
                this.metrics.decrementActiveConnections();

                const session = this.activeSessions.get(sessionId);
                if (session) {
                    session.lastActivity = Date.now();
                }
            });

            // Clean up on connection close
            req.on('close', () => {
                this.metrics.decrementActiveConnections();
            });

            next();
        };
    }

    /**
     * Request/Response logging middleware
     */
    requestLoggingMiddleware() {
        return (req, res, next) => {
            const startTime = Date.now();

            // Log incoming request
            this.logger.debug('Incoming request', {
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                referer: req.get('Referer'),
                requestId: req.id,
                sessionId: req.sessionId
            });

            // Track page view/API interaction
            const interactionType = req.url.startsWith('/api/') ? 'api_call' : 'page_view';
            this.analytics.trackInteraction(req.sessionId, interactionType, {
                method: req.method,
                endpoint: this.extractRoute(req),
                userAgent: req.get('User-Agent')
            });

            // Override res.json to capture response data
            const originalJson = res.json;
            res.json = function (data) {
                const responseTime = Date.now() - startTime;

                // Log response
                this.logger.debug('Response sent', {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    responseTime,
                    requestId: req.id,
                    responseSize: JSON.stringify(data).length
                });

                return originalJson.call(this, data);
            }.bind(this);

            next();
        };
    }

    /**
     * Error tracking middleware
     */
    errorTrackingMiddleware() {
        return (err, req, res, next) => {
            const route = this.extractRoute(req);
            const statusCode = res.statusCode || err.status || 500;

            // Record error in metrics
            this.metrics.recordError(
                this.logger.classifyError(err),
                route,
                this.logger.determineSeverity(err, { statusCode })
            );

            // Log error with context
            this.logger.error('Request error', err, {
                method: req.method,
                url: req.url,
                statusCode,
                requestId: req.id,
                sessionId: req.sessionId,
                userAgent: req.get('User-Agent'),
                endpoint: route
            });

            // Track error in analytics
            this.analytics.trackInteraction(req.sessionId, 'error', {
                errorType: this.logger.classifyError(err),
                statusCode,
                endpoint: route
            });

            next(err);
        };
    }

    /**
     * Metrics endpoint for Prometheus scraping
     */
    metricsEndpoint() {
        return async (req, res) => {
            try {
                res.set('Content-Type', this.metrics.getContentType());
                const metrics = await this.metrics.getMetrics();
                res.end(metrics);
            } catch (error) {
                this.logger.error('Failed to serve metrics', error);
                res.status(500).end('Error retrieving metrics');
            }
        };
    }

    /**
     * Specific monitoring for color analysis endpoints
     */
    colorAnalysisMiddleware() {
        return (req, res, next) => {
            if (req.path === '/api/analyze') {
                const startTime = Date.now();

                // Override res.json to track analysis results
                const originalJson = res.json;
                res.json = function (data) {
                    const responseTime = Date.now() - startTime;
                    const success = data.success !== false && res.statusCode < 400;

                    // Track color analysis
                    this.analytics.trackColorAnalysis(
                        req.sessionId,
                        req.body,
                        responseTime,
                        success
                    );

                    // Log analysis details
                    this.logger.logColorAnalysis(
                        { ...req.body, requestId: req.id },
                        responseTime,
                        success,
                        success ? null : data.error
                    );

                    return originalJson.call(this, data);
                }.bind(this);
            }

            next();
        };
    }

    /**
     * Color search tracking middleware
     */
    colorSearchMiddleware() {
        return (req, res, next) => {
            if (req.path === '/api/colors' || req.path === '/api/combinations') {
                const searchType = req.path === '/api/colors' ? 'color_search' : 'combination_search';

                // Override res.json to track search results
                const originalJson = res.json;
                res.json = function (data) {
                    const resultCount = data.data?.colors?.length ||
                                      data.data?.combinations?.length ||
                                      0;

                    // Track search
                    this.analytics.trackColorSearch(
                        req.sessionId,
                        searchType,
                        req.query.search || req.query.roomType || 'browse',
                        resultCount
                    );

                    return originalJson.call(this, data);
                }.bind(this);
            }

            next();
        };
    }

    /**
     * Cache monitoring middleware
     */
    cacheMiddleware(cacheService) {
        return (req, res, next) => {
            const originalGet = cacheService.get?.bind(cacheService);
            const originalSet = cacheService.set?.bind(cacheService);

            if (originalGet) {
                cacheService.get = (key) => {
                    const startTime = Date.now();
                    const result = originalGet(key);
                    const responseTime = Date.now() - startTime;

                    if (result !== null && result !== undefined) {
                        this.metrics.recordCacheHit('memory');
                        this.logger.logCacheOperation('get', 'memory', true, responseTime);
                    } else {
                        this.metrics.recordCacheMiss('memory');
                        this.logger.logCacheOperation('get', 'memory', false, responseTime);
                    }

                    return result;
                };
            }

            if (originalSet) {
                cacheService.set = (key, value, ttl) => {
                    const startTime = Date.now();
                    const result = originalSet(key, value, ttl);
                    const responseTime = Date.now() - startTime;

                    this.logger.logCacheOperation('set', 'memory', true, responseTime);
                    return result;
                };
            }

            next();
        };
    }

    /**
     * Rate limiting monitoring
     */
    rateLimitMiddleware() {
        return (req, res, next) => {
            // Check if request was rate limited
            const wasRateLimited = res.statusCode === 429;

            if (wasRateLimited) {
                const endpoint = this.extractRoute(req);
                const ip = req.ip || req.connection.remoteAddress;

                // Track rate limit hit
                this.logger.logRateLimit(endpoint, ip, 1);

                // Track in analytics
                this.analytics.trackInteraction(req.sessionId, 'rate_limit_hit', {
                    endpoint,
                    timestamp: Date.now()
                });
            }

            next();
        };
    }

    /**
     * Security event monitoring
     */
    securityMiddleware() {
        return (req, res, next) => {
            // Monitor for potential security issues
            const userAgent = req.get('User-Agent') || '';
            const origin = req.get('Origin') || '';

            // Check for suspicious user agents
            if (this.isSuspiciousUserAgent(userAgent)) {
                this.logger.logSecurity('suspicious_user_agent', 'medium', {
                    userAgent,
                    ip: req.ip,
                    endpoint: req.path
                });
            }

            // Check for suspicious request patterns
            if (this.isSuspiciousRequest(req)) {
                this.logger.logSecurity('suspicious_request', 'high', {
                    method: req.method,
                    url: req.url,
                    ip: req.ip,
                    userAgent
                });
            }

            next();
        };
    }

    /**
     * Health check integration
     */
    healthCheckMiddleware() {
        return (req, res, next) => {
            if (req.path === '/api/health') {
                // Force a health check if requested
                if (req.query.force === 'true') {
                    this.health.forceHealthCheck().then(status => {
                        req.healthStatus = status;
                        next();
                    }).catch(next);
                } else {
                    req.healthStatus = this.health.getHealthStatus();
                    next();
                }
            } else {
                next();
            }
        };
    }

    // Utility methods
    extractRoute(req) {
        // Extract meaningful route from request path
        let route = req.route?.path || req.path;

        // Normalize common patterns
        route = route.replace(/\/[0-9a-f]{24}/g, '/:id'); // MongoDB ObjectIds
        route = route.replace(/\/[0-9]+/g, '/:id'); // Numeric IDs
        route = route.replace(/\/[A-Fa-f0-9]{6}/g, '/:hex'); // Hex colors

        return route;
    }

    isSuspiciousUserAgent(userAgent) {
        const suspiciousPatterns = [
            /bot/i,
            /crawler/i,
            /scraper/i,
            /scanner/i,
            /sqlmap/i,
            /nikto/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(userAgent));
    }

    isSuspiciousRequest(req) {
        // Check for common attack patterns
        const url = req.url.toLowerCase();
        const body = JSON.stringify(req.body || {}).toLowerCase();

        const attackPatterns = [
            /(\<script|\<iframe|\<object)/i, // XSS
            /(union.*select|or.*1.*=.*1)/i, // SQL injection
            /(\.\.\/|\.\.\\)/i, // Path traversal
            /(\${|%24%7b)/i // Template injection
        ];

        return attackPatterns.some(pattern =>
            pattern.test(url) || pattern.test(body)
        );
    }

    /**
     * Get current active sessions
     */
    getActiveSessions() {
        const now = Date.now();
        const activeThreshold = 30 * 60 * 1000; // 30 minutes

        return Array.from(this.activeSessions.entries())
            .filter(([_, session]) => now - session.lastActivity < activeThreshold)
            .map(([id, session]) => ({
                id,
                duration: now - session.startTime,
                lastActivity: session.lastActivity
            }));
    }

    /**
     * Cleanup inactive sessions
     */
    cleanupSessions() {
        const now = Date.now();
        const inactiveThreshold = 60 * 60 * 1000; // 1 hour

        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (now - session.lastActivity > inactiveThreshold) {
                this.activeSessions.delete(sessionId);
            }
        }

        this.logger.debug('Session cleanup completed', {
            activeSessions: this.activeSessions.size
        });
    }
}

module.exports = MonitoringMiddleware;