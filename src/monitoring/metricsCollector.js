/**
 * Metrics Collection System for Sanzo Color Advisor
 * Handles performance metrics, user analytics, and system monitoring
 */

const client = require('prom-client');

class MetricsCollector {
    constructor() {
        // Register default metrics (CPU, memory, etc.)
        client.register.setDefaultLabels({
            app: 'sanzo-color-advisor',
            version: '1.0.0'
        });

        // Initialize custom metrics
        this.initializeMetrics();

        // Start collecting default metrics
        client.collectDefaultMetrics({
            timeout: 10000,
            prefix: 'sanzo_'
        });
    }

    initializeMetrics() {
        // HTTP Request Metrics
        this.httpRequestDuration = new client.Histogram({
            name: 'sanzo_http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
        });

        this.httpRequestsTotal = new client.Counter({
            name: 'sanzo_http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code']
        });

        // Color Analysis Metrics
        this.colorAnalysisRequests = new client.Counter({
            name: 'sanzo_color_analysis_requests_total',
            help: 'Total number of color analysis requests',
            labelNames: ['room_type', 'age_group', 'success']
        });

        this.colorAnalysisDuration = new client.Histogram({
            name: 'sanzo_color_analysis_duration_seconds',
            help: 'Duration of color analysis operations',
            labelNames: ['room_type', 'age_group'],
            buckets: [0.1, 0.5, 1, 2, 5, 10]
        });

        this.colorCalculationsPerSecond = new client.Gauge({
            name: 'sanzo_color_calculations_per_second',
            help: 'Number of color calculations processed per second'
        });

        // User Interaction Metrics
        this.colorSearchRequests = new client.Counter({
            name: 'sanzo_color_search_requests_total',
            help: 'Total number of color search requests',
            labelNames: ['search_type', 'has_results']
        });

        this.popularRoomTypes = new client.Counter({
            name: 'sanzo_popular_room_types_total',
            help: 'Popular room types requested',
            labelNames: ['room_type']
        });

        this.popularAgeGroups = new client.Counter({
            name: 'sanzo_popular_age_groups_total',
            help: 'Popular age groups analyzed',
            labelNames: ['age_group']
        });

        // User Preferences Metrics
        this.userPreferences = new client.Counter({
            name: 'sanzo_user_preferences_total',
            help: 'User color preferences tracked',
            labelNames: ['preference_type', 'value']
        });

        // API Performance Metrics
        this.apiLatency = new client.Histogram({
            name: 'sanzo_api_latency_seconds',
            help: 'API endpoint latency',
            labelNames: ['endpoint'],
            buckets: [0.1, 0.3, 0.5, 1, 2, 5]
        });

        this.activeConnections = new client.Gauge({
            name: 'sanzo_active_connections',
            help: 'Number of active connections'
        });

        // Cache Metrics
        this.cacheHits = new client.Counter({
            name: 'sanzo_cache_hits_total',
            help: 'Total cache hits',
            labelNames: ['cache_type']
        });

        this.cacheMisses = new client.Counter({
            name: 'sanzo_cache_misses_total',
            help: 'Total cache misses',
            labelNames: ['cache_type']
        });

        // Error Metrics
        this.errorCount = new client.Counter({
            name: 'sanzo_errors_total',
            help: 'Total number of errors',
            labelNames: ['error_type', 'endpoint', 'severity']
        });

        this.rateLimitHits = new client.Counter({
            name: 'sanzo_rate_limit_hits_total',
            help: 'Total rate limit violations',
            labelNames: ['endpoint', 'ip_hash']
        });

        // Business Metrics
        this.successfulAnalyses = new client.Counter({
            name: 'sanzo_successful_analyses_total',
            help: 'Total successful color analyses'
        });

        this.userSatisfactionScore = new client.Gauge({
            name: 'sanzo_user_satisfaction_score',
            help: 'Average user satisfaction score (1-5)'
        });

        // Health Check Metrics
        this.healthCheck = new client.Gauge({
            name: 'sanzo_health_check',
            help: 'Service health status',
            labelNames: ['check_type']
        });

        this.uptime = new client.Gauge({
            name: 'sanzo_uptime_seconds',
            help: 'Service uptime in seconds'
        });

        // Color calculation performance tracking
        this.colorCalculationsWindow = [];
        this.startTime = Date.now();

        // Update calculations per second every 10 seconds
        setInterval(() => {
            const now = Date.now();
            const windowSize = 10000; // 10 seconds

            // Remove old calculations
            this.colorCalculationsWindow = this.colorCalculationsWindow.filter(
                timestamp => now - timestamp < windowSize
            );

            // Update gauge
            this.colorCalculationsPerSecond.set(this.colorCalculationsWindow.length / (windowSize / 1000));
        }, 10000);

        // Update uptime every minute
        setInterval(() => {
            const uptimeSeconds = (Date.now() - this.startTime) / 1000;
            this.uptime.set(uptimeSeconds);
        }, 60000);
    }

    // HTTP Request Tracking
    recordHttpRequest(method, route, statusCode, duration) {
        this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
        this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    }

    // Color Analysis Tracking
    recordColorAnalysis(roomType, ageGroup, duration, success) {
        this.colorAnalysisRequests.inc({
            room_type: roomType,
            age_group: ageGroup,
            success: success.toString()
        });

        if (success) {
            this.colorAnalysisDuration.observe({ room_type: roomType, age_group: ageGroup }, duration);
            this.successfulAnalyses.inc();
        }

        // Track popular room types and age groups
        this.popularRoomTypes.inc({ room_type: roomType });
        if (ageGroup) {
            this.popularAgeGroups.inc({ age_group: ageGroup });
        }
    }

    // Color Calculation Tracking
    recordColorCalculation() {
        this.colorCalculationsWindow.push(Date.now());
    }

    // User Interaction Tracking
    recordColorSearch(searchType, hasResults) {
        this.colorSearchRequests.inc({
            search_type: searchType,
            has_results: hasResults.toString()
        });
    }

    recordUserPreference(preferenceType, value) {
        this.userPreferences.inc({ preference_type: preferenceType, value });
    }

    // API Performance Tracking
    recordApiLatency(endpoint, duration) {
        this.apiLatency.observe({ endpoint }, duration);
    }

    incrementActiveConnections() {
        this.activeConnections.inc();
    }

    decrementActiveConnections() {
        this.activeConnections.dec();
    }

    // Cache Tracking
    recordCacheHit(cacheType) {
        this.cacheHits.inc({ cache_type: cacheType });
    }

    recordCacheMiss(cacheType) {
        this.cacheMisses.inc({ cache_type: cacheType });
    }

    // Error Tracking
    recordError(errorType, endpoint, severity) {
        this.errorCount.inc({ error_type: errorType, endpoint, severity });
    }

    recordRateLimitHit(endpoint, ipHash) {
        this.rateLimitHits.inc({ endpoint, ip_hash: ipHash });
    }

    // Health Monitoring
    setHealthStatus(checkType, status) {
        this.healthCheck.set({ check_type: checkType }, status ? 1 : 0);
    }

    // User Satisfaction
    updateUserSatisfactionScore(score) {
        this.userSatisfactionScore.set(score);
    }

    // Metrics Export
    getMetrics() {
        return client.register.metrics();
    }

    getContentType() {
        return client.register.contentType;
    }

    // Reset all metrics (useful for testing)
    reset() {
        client.register.clear();
        this.initializeMetrics();
    }

    // Get current statistics
    async getCurrentStats() {
        const metrics = await client.register.getMetricsAsJSON();

        const stats = {
            timestamp: new Date().toISOString(),
            http: {
                totalRequests: this.getMetricValue(metrics, 'sanzo_http_requests_total'),
                avgResponseTime: this.getMetricValue(metrics, 'sanzo_http_request_duration_seconds'),
                activeConnections: this.getMetricValue(metrics, 'sanzo_active_connections')
            },
            colorAnalysis: {
                totalAnalyses: this.getMetricValue(metrics, 'sanzo_color_analysis_requests_total'),
                successfulAnalyses: this.getMetricValue(metrics, 'sanzo_successful_analyses_total'),
                avgAnalysisTime: this.getMetricValue(metrics, 'sanzo_color_analysis_duration_seconds'),
                calculationsPerSecond: this.getMetricValue(metrics, 'sanzo_color_calculations_per_second')
            },
            errors: {
                totalErrors: this.getMetricValue(metrics, 'sanzo_errors_total'),
                rateLimitHits: this.getMetricValue(metrics, 'sanzo_rate_limit_hits_total')
            },
            cache: {
                hits: this.getMetricValue(metrics, 'sanzo_cache_hits_total'),
                misses: this.getMetricValue(metrics, 'sanzo_cache_misses_total')
            },
            uptime: this.getMetricValue(metrics, 'sanzo_uptime_seconds')
        };

        return stats;
    }

    getMetricValue(metrics, metricName) {
        const metric = metrics.find(m => m.name === metricName);
        if (!metric || !metric.values || metric.values.length === 0) {
            return 0;
        }

        // For counters and gauges, return the value
        if (metric.type === 'counter' || metric.type === 'gauge') {
            return metric.values.reduce((sum, v) => sum + v.value, 0);
        }

        // For histograms, return the count or a useful aggregate
        if (metric.type === 'histogram') {
            const count = metric.values.find(v => v.metricName?.includes('_count'));
            return count ? count.value : 0;
        }

        return 0;
    }
}

module.exports = MetricsCollector;