/**
 * Analytics Dashboard Routes
 * Simple usage statistics dashboard for monitoring production metrics
 */

const express = require('express');
const router = express.Router();

// Middleware instances will be injected by the main application
let analyticsMiddleware;
let errorMonitoring;

/**
 * Initialize analytics routes with middleware instances
 */
function initializeAnalytics(analytics, monitoring) {
    analyticsMiddleware = analytics;
    errorMonitoring = monitoring;
}

/**
 * GET /api/analytics/dashboard
 * Main dashboard data endpoint
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [analyticsData, errorData] = await Promise.all([
            analyticsMiddleware.getDashboardData(),
            errorMonitoring.getDashboardData()
        ]);

        const dashboardData = {
            timestamp: new Date().toISOString(),
            overview: {
                ...analyticsData.overview,
                errorRate: errorData.totalErrors,
                systemHealth: errorData.systemHealth
            },
            sessions: analyticsData.sessions,
            errors: {
                recentRates: errorData.errorRates,
                topPatterns: errorData.topPatterns,
                totalErrors: errorData.totalErrors
            },
            performance: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            },
            daily: analyticsData.daily
        };

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve dashboard data'
        });
    }
});

/**
 * GET /api/analytics/metrics
 * Prometheus metrics endpoint
 */
router.get('/metrics', (req, res) => {
    try {
        const metrics = analyticsMiddleware.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).send('# Error retrieving metrics\n');
    }
});

/**
 * GET /api/analytics/health
 * Health check with detailed monitoring info
 */
router.get('/health', async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            activeSessions: analyticsMiddleware.getActiveSessions(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version
        };

        // Add recent error count
        const errorData = errorMonitoring.getDashboardData();
        health.recentErrors = errorData.totalErrors;

        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            error: 'Health check failed'
        });
    }
});

/**
 * GET /api/analytics/sessions
 * Active sessions information
 */
router.get('/sessions', (req, res) => {
    try {
        const data = analyticsMiddleware.getDashboardData();
        res.json({
            success: true,
            data: {
                activeSessions: data.sessions.active,
                totalSessions: data.sessions.total,
                avgRequestsPerSession: data.sessions.avgRequestsPerSession,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Sessions data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve sessions data'
        });
    }
});

/**
 * GET /api/analytics/errors
 * Error monitoring data
 */
router.get('/errors', (req, res) => {
    try {
        const data = errorMonitoring.getDashboardData();
        res.json({
            success: true,
            data: {
                errorRates: data.errorRates,
                topPatterns: data.topPatterns,
                totalErrors: data.totalErrors,
                systemHealth: data.systemHealth,
                lastAlerts: data.lastAlerts,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error data retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve error data'
        });
    }
});

/**
 * GET /api/analytics/usage
 * API usage statistics
 */
router.get('/usage', (req, res) => {
    try {
        const data = analyticsMiddleware.getDashboardData();

        // Simple usage report
        const usage = {
            overview: data.overview,
            dailyStats: data.daily,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: usage
        });
    } catch (error) {
        console.error('Usage data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve usage data'
        });
    }
});

/**
 * GET /api/analytics/export
 * Export analytics data (last 7 days)
 */
router.get('/export', async (req, res) => {
    try {
        const { format = 'json' } = req.query;

        const [analyticsData, errorData] = await Promise.all([
            analyticsMiddleware.getDashboardData(),
            errorMonitoring.getDashboardData()
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            timeRange: '7 days',
            data: {
                analytics: analyticsData,
                errors: errorData
            }
        };

        if (format === 'csv') {
            // Simple CSV export for daily stats
            const csvData = [
                'Date,Total Requests,Analysis Requests,Unique Sessions,Errors',
                ...analyticsData.daily.map(day =>
                    `${day.date},${day.totalRequests || 0},${day.analysisRequests || 0},${day.uniqueSessions || 0},${day.errors || 0}`
                )
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="sanzo-analytics-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvData);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="sanzo-analytics-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(exportData);
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export analytics data'
        });
    }
});

/**
 * POST /api/analytics/clear
 * Clear analytics data (development only)
 */
router.post('/clear', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            success: false,
            error: 'Clear operation not allowed in production'
        });
    }

    try {
        // Clear analytics data
        analyticsMiddleware.analytics.sessions.clear();
        analyticsMiddleware.analytics.dailyStats.clear();
        analyticsMiddleware.analytics.errorCounts.clear();

        // Clear error monitoring data
        errorMonitoring.errorCounts.clear();
        errorMonitoring.errorPatterns.clear();

        res.json({
            success: true,
            message: 'Analytics data cleared successfully'
        });
    } catch (error) {
        console.error('Clear analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear analytics data'
        });
    }
});

module.exports = {
    router,
    initializeAnalytics
};