/**
 * Monitoring Integration Module
 * Integrates analytics and error monitoring with the main application
 */

const AnalyticsMiddleware = require('./middleware/analytics');
const ErrorMonitoring = require('./middleware/errorMonitoring');
const { router: analyticsRouter, initializeAnalytics } = require('./routes/analytics');

class MonitoringIntegration {
    constructor() {
        this.analytics = new AnalyticsMiddleware();
        this.errorMonitoring = new ErrorMonitoring();

        // Initialize analytics routes with middleware instances
        initializeAnalytics(this.analytics, this.errorMonitoring);

        // Create logs directory if it doesn't exist
        this.ensureLogsDirectory();
    }

    /**
     * Ensure logs directory exists
     */
    ensureLogsDirectory() {
        const fs = require('fs');
        const path = require('path');

        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }

    /**
     * Get all middleware for Express app integration
     */
    getMiddleware() {
        return {
            // Performance and analytics tracking
            requestTracker: this.analytics.requestTracker(),
            colorAnalysisTracker: this.analytics.colorAnalysisTracker(),
            responseTimeTracker: this.analytics.responseTimeTracker(),

            // Error monitoring
            errorCapture: this.errorMonitoring.errorCapture(),
            performanceMonitor: this.errorMonitoring.performanceMonitor(),

            // Error handler (must be last)
            errorHandler: this.errorMonitoring.errorHandler()
        };
    }

    /**
     * Get analytics router for mounting
     */
    getAnalyticsRouter() {
        return analyticsRouter;
    }

    /**
     * Get Prometheus metrics endpoint handler
     */
    getMetricsHandler() {
        return (req, res) => {
            try {
                const metrics = this.analytics.getMetrics();
                res.set('Content-Type', 'text/plain');
                res.send(metrics);
            } catch (error) {
                console.error('Metrics endpoint error:', error);
                res.status(500).send('# Error retrieving metrics\n');
            }
        };
    }

    /**
     * Setup static file serving for dashboard
     */
    setupStaticFiles(app) {
        const path = require('path');
        const express = require('express');

        // Serve dashboard at /dashboard
        app.get('/dashboard', (req, res) => {
            res.sendFile(path.join(process.cwd(), 'public', 'dashboard.html'));
        });

        // Serve public files
        app.use('/public', express.static(path.join(process.cwd(), 'public')));
    }

    /**
     * Integration method for SanzoColorAPI
     */
    integrateWithApp(app) {
        const middleware = this.getMiddleware();

        // Add monitoring middleware before other middleware
        app.use(middleware.requestTracker);
        app.use(middleware.colorAnalysisTracker);
        app.use(middleware.responseTimeTracker);
        app.use(middleware.errorCapture);
        app.use(middleware.performanceMonitor);

        // Add analytics routes
        app.use('/api/analytics', this.getAnalyticsRouter());

        // Add metrics endpoint
        app.get('/metrics', this.getMetricsHandler());

        // Setup static files
        this.setupStaticFiles(app);

        // Add error handler last
        app.use(middleware.errorHandler);

        console.log('✅ Monitoring system integrated successfully');
        console.log(`📊 Dashboard: http://localhost:${process.env.PORT || 3000}/dashboard`);
        console.log(`📈 Metrics: http://localhost:${process.env.PORT || 3000}/metrics`);
        console.log(`📋 Analytics API: http://localhost:${process.env.PORT || 3000}/api/analytics/dashboard`);
    }

    /**
     * Health check method
     */
    getHealthStatus() {
        return {
            analytics: {
                status: 'healthy',
                activeSessions: this.analytics.getActiveSessions(),
                metricsAvailable: true
            },
            errorMonitoring: {
                status: 'healthy',
                logsDirectory: 'logs/',
                alertsEnabled: true
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            }
        };
    }
}

module.exports = MonitoringIntegration;