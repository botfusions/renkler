/**
 * Lightweight Analytics Middleware
 * Privacy-friendly tracking for the Sanzo Color Advisor API
 * Focuses on performance and usage patterns without collecting personal data
 */

const promClient = require('prom-client');
const responseTime = require('response-time');

class AnalyticsMiddleware {
    constructor() {
        // Create custom metrics
        this.setupMetrics();

        // In-memory storage for session analytics (reset on restart)
        this.analytics = {
            sessions: new Map(),
            dailyStats: new Map(),
            errorCounts: new Map(),
            lastReset: new Date()
        };

        // Clean up old sessions every hour
        setInterval(() => this.cleanupSessions(), 60 * 60 * 1000);
    }

    /**
     * Setup Prometheus metrics
     */
    setupMetrics() {
        // Custom metrics for color analysis
        this.metrics = {
            // Request metrics
            httpRequests: new promClient.Counter({
                name: 'sanzo_http_requests_total',
                help: 'Total HTTP requests',
                labelNames: ['method', 'route', 'status_code']
            }),

            httpDuration: new promClient.Histogram({
                name: 'sanzo_http_duration_seconds',
                help: 'HTTP request duration',
                labelNames: ['method', 'route', 'status_code'],
                buckets: [0.1, 0.5, 1, 2, 5, 10]
            }),

            // Color analysis specific metrics
            colorAnalysis: new promClient.Counter({
                name: 'sanzo_color_analysis_total',
                help: 'Total color analysis requests',
                labelNames: ['room_type', 'age_group', 'success']
            }),

            colorAnalysisDuration: new promClient.Histogram({
                name: 'sanzo_color_analysis_duration_seconds',
                help: 'Color analysis processing time',
                buckets: [0.1, 0.5, 1, 2, 5]
            }),

            // API usage metrics
            apiUsage: new promClient.Counter({
                name: 'sanzo_api_usage_total',
                help: 'API endpoint usage',
                labelNames: ['endpoint', 'user_type']
            }),

            // Error metrics
            errors: new promClient.Counter({
                name: 'sanzo_errors_total',
                help: 'Total errors',
                labelNames: ['type', 'endpoint', 'error_code']
            }),

            // Performance metrics
            memoryUsage: new promClient.Gauge({
                name: 'sanzo_memory_usage_bytes',
                help: 'Memory usage in bytes',
                collect() {
                    const memUsage = process.memoryUsage();
                    this.set({ type: 'rss' }, memUsage.rss);
                    this.set({ type: 'heapUsed' }, memUsage.heapUsed);
                    this.set({ type: 'heapTotal' }, memUsage.heapTotal);
                }
            }),

            // Active sessions
            activeSessions: new promClient.Gauge({
                name: 'sanzo_active_sessions',
                help: 'Number of active user sessions'
            })
        };

        // Default Prometheus metrics (CPU, memory, etc.)
        promClient.collectDefaultMetrics({
            prefix: 'sanzo_',
            timeout: 5000
        });
    }

    /**
     * Express middleware for request tracking
     */
    requestTracker() {
        return (req, res, next) => {
            const startTime = Date.now();

            // Track session
            const sessionId = this.getSessionId(req);
            this.trackSession(sessionId, req);

            // Override res.end to capture metrics
            const originalEnd = res.end;
            res.end = (...args) => {
                const duration = (Date.now() - startTime) / 1000;
                const route = this.normalizeRoute(req.route?.path || req.path);

                // Record metrics
                this.metrics.httpRequests.inc({
                    method: req.method,
                    route: route,
                    status_code: res.statusCode
                });

                this.metrics.httpDuration.observe({
                    method: req.method,
                    route: route,
                    status_code: res.statusCode
                }, duration);

                // Track API usage
                if (req.path.startsWith('/api/')) {
                    this.metrics.apiUsage.inc({
                        endpoint: route,
                        user_type: this.classifyUser(req)
                    });
                }

                // Track errors
                if (res.statusCode >= 400) {
                    this.trackError(req, res, res.statusCode);
                }

                originalEnd.apply(res, args);
            };

            next();
        };
    }

    /**
     * Middleware specifically for color analysis tracking
     */
    colorAnalysisTracker() {
        return (req, res, next) => {
            if (req.path === '/api/analyze' && req.method === 'POST') {
                const startTime = Date.now();

                // Override res.json to capture analysis metrics
                const originalJson = res.json;
                res.json = (data) => {
                    const duration = (Date.now() - startTime) / 1000;
                    const roomType = req.body?.roomType || 'unknown';
                    const ageGroup = req.body?.ageGroup || 'unknown';
                    const success = res.statusCode === 200 ? 'true' : 'false';

                    this.metrics.colorAnalysis.inc({
                        room_type: roomType,
                        age_group: ageGroup,
                        success: success
                    });

                    if (success === 'true') {
                        this.metrics.colorAnalysisDuration.observe(duration);
                    }

                    // Track daily stats
                    this.updateDailyStats({
                        type: 'analysis',
                        roomType,
                        ageGroup,
                        success: success === 'true',
                        duration
                    });

                    originalJson.call(res, data);
                };
            }
            next();
        };
    }

    /**
     * Error tracking middleware
     */
    errorTracker() {
        return (error, req, res, next) => {
            this.trackError(req, res, error.status || 500, error.message);
            next(error);
        };
    }

    /**
     * Response time middleware
     */
    responseTimeTracker() {
        return responseTime((req, res, time) => {
            // Already handled in requestTracker, but can add specific logic here
            console.log(`${req.method} ${req.path} - ${time}ms`);
        });
    }

    /**
     * Generate session ID from request
     */
    getSessionId(req) {
        // Privacy-friendly session ID based on IP + User-Agent hash
        const crypto = require('crypto');
        const identifier = `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
        return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 16);
    }

    /**
     * Track user sessions
     */
    trackSession(sessionId, req) {
        const now = Date.now();

        if (!this.analytics.sessions.has(sessionId)) {
            this.analytics.sessions.set(sessionId, {
                firstSeen: now,
                lastActivity: now,
                requestCount: 0,
                endpoints: new Set(),
                userAgent: req.get('User-Agent'),
                country: req.get('CF-IPCountry') || 'unknown' // Cloudflare header
            });
        }

        const session = this.analytics.sessions.get(sessionId);
        session.lastActivity = now;
        session.requestCount++;
        session.endpoints.add(req.path);

        // Update active sessions gauge
        this.metrics.activeSessions.set(this.getActiveSessions());
    }

    /**
     * Clean up old sessions (inactive for >1 hour)
     */
    cleanupSessions() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        for (const [sessionId, session] of this.analytics.sessions.entries()) {
            if (now - session.lastActivity > oneHour) {
                this.analytics.sessions.delete(sessionId);
            }
        }

        this.metrics.activeSessions.set(this.getActiveSessions());
    }

    /**
     * Get number of active sessions (active in last 30 minutes)
     */
    getActiveSessions() {
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        let activeCount = 0;

        for (const session of this.analytics.sessions.values()) {
            if (now - session.lastActivity <= thirtyMinutes) {
                activeCount++;
            }
        }

        return activeCount;
    }

    /**
     * Track errors
     */
    trackError(req, res, statusCode, message = '') {
        const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
        const endpoint = this.normalizeRoute(req.route?.path || req.path);

        this.metrics.errors.inc({
            type: errorType,
            endpoint: endpoint,
            error_code: statusCode.toString()
        });

        // Update error counts for dashboard
        const errorKey = `${statusCode}-${endpoint}`;
        const currentCount = this.analytics.errorCounts.get(errorKey) || 0;
        this.analytics.errorCounts.set(errorKey, currentCount + 1);
    }

    /**
     * Normalize route paths for consistent metrics
     */
    normalizeRoute(path) {
        if (!path) return 'unknown';

        // Replace dynamic segments with placeholders
        return path
            .replace(/\/api\/colors\/[a-fA-F0-9]{6}/, '/api/colors/:hex')
            .replace(/\/\d+/g, '/:id')
            .replace(/\?.+$/, ''); // Remove query parameters
    }

    /**
     * Classify user type for metrics
     */
    classifyUser(req) {
        const userAgent = req.get('User-Agent') || '';

        if (userAgent.includes('bot') || userAgent.includes('crawler')) {
            return 'bot';
        }

        if (req.get('X-API-Key')) {
            return 'api_client';
        }

        return 'web_user';
    }

    /**
     * Update daily statistics
     */
    updateDailyStats(event) {
        const today = new Date().toISOString().split('T')[0];

        if (!this.analytics.dailyStats.has(today)) {
            this.analytics.dailyStats.set(today, {
                totalRequests: 0,
                analysisRequests: 0,
                uniqueSessions: new Set(),
                errors: 0,
                averageResponseTime: 0,
                roomTypes: {},
                ageGroups: {}
            });
        }

        const dayStats = this.analytics.dailyStats.get(today);

        if (event.type === 'analysis') {
            dayStats.analysisRequests++;
            dayStats.roomTypes[event.roomType] = (dayStats.roomTypes[event.roomType] || 0) + 1;
            dayStats.ageGroups[event.ageGroup] = (dayStats.ageGroups[event.ageGroup] || 0) + 1;
        }
    }

    /**
     * Get analytics dashboard data
     */
    getDashboardData() {
        const now = Date.now();
        const sessions = Array.from(this.analytics.sessions.values());

        return {
            overview: {
                activeSessions: this.getActiveSessions(),
                totalSessions: sessions.length,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                lastReset: this.analytics.lastReset
            },
            sessions: {
                active: this.getActiveSessions(),
                total: sessions.length,
                avgRequestsPerSession: sessions.length > 0
                    ? sessions.reduce((acc, s) => acc + s.requestCount, 0) / sessions.length
                    : 0
            },
            errors: {
                recentErrors: Array.from(this.analytics.errorCounts.entries())
                    .map(([key, count]) => {
                        const [code, endpoint] = key.split('-', 2);
                        return { code, endpoint, count };
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
            },
            daily: Array.from(this.analytics.dailyStats.entries())
                .map(([date, stats]) => ({
                    date,
                    ...stats,
                    uniqueSessions: stats.uniqueSessions.size
                }))
                .slice(-7) // Last 7 days
        };
    }

    /**
     * Get Prometheus metrics
     */
    getMetrics() {
        return promClient.register.metrics();
    }
}

module.exports = AnalyticsMiddleware;