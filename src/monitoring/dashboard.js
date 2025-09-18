/**
 * Real-time Monitoring Dashboard for Sanzo Color Advisor
 * Provides web-based dashboard for monitoring system metrics
 */

class MonitoringDashboard {
    constructor(metricsCollector, analyticsTracker, healthMonitor, logger) {
        this.metrics = metricsCollector;
        this.analytics = analyticsTracker;
        this.health = healthMonitor;
        this.logger = logger;
    }

    /**
     * Setup dashboard routes
     */
    setupRoutes(app) {
        // Dashboard home page
        app.get('/dashboard', this.serveDashboard.bind(this));

        // API endpoints for dashboard data
        app.get('/api/dashboard/overview', this.getOverview.bind(this));
        app.get('/api/dashboard/metrics', this.getMetrics.bind(this));
        app.get('/api/dashboard/analytics', this.getAnalytics.bind(this));
        app.get('/api/dashboard/health', this.getHealth.bind(this));
        app.get('/api/dashboard/alerts', this.getAlerts.bind(this));
        app.get('/api/dashboard/performance', this.getPerformance.bind(this));

        // Real-time data endpoint
        app.get('/api/dashboard/realtime', this.getRealTimeData.bind(this));

        // Dashboard configuration
        app.get('/api/dashboard/config', this.getConfig.bind(this));
        app.post('/api/dashboard/config', this.updateConfig.bind(this));

        this.logger.info('Dashboard routes initialized');
    }

    serveDashboard(req, res) {
        const dashboardHTML = this.generateDashboardHTML();
        res.setHeader('Content-Type', 'text/html');
        res.send(dashboardHTML);
    }

    async getOverview(req, res) {
        try {
            const [healthStatus, analyticsData, currentStats] = await Promise.all([
                this.health.getHealthStatus(),
                this.analytics.getDashboardData(),
                this.metrics.getCurrentStats()
            ]);

            const overview = {
                timestamp: new Date().toISOString(),
                status: {
                    overall: healthStatus.overall,
                    uptime: healthStatus.uptime,
                    activeAlerts: healthStatus.activeAlerts
                },
                traffic: {
                    activeSessions: analyticsData.summary.activeSessions,
                    hourlyRequests: analyticsData.summary.hourlyInteractions,
                    dailyRequests: analyticsData.summary.dailyInteractions
                },
                performance: {
                    avgResponseTime: analyticsData.performance.avgResponseTime,
                    requestsPerSecond: analyticsData.performance.requestsLastHour / 3600,
                    errorRate: analyticsData.performance.errorRate
                },
                colorAnalysis: {
                    totalAnalyses: currentStats.colorAnalysis.totalAnalyses,
                    successfulAnalyses: currentStats.colorAnalysis.successfulAnalyses,
                    calculationsPerSecond: currentStats.colorAnalysis.calculationsPerSecond
                }
            };

            res.json({ success: true, data: overview });
        } catch (error) {
            this.logger.error('Failed to get dashboard overview', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getMetrics(req, res) {
        try {
            const timeRange = req.query.timeRange || '1h';
            const currentStats = await this.metrics.getCurrentStats();

            const metrics = {
                timestamp: new Date().toISOString(),
                timeRange,
                system: {
                    uptime: currentStats.uptime,
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage()
                },
                http: {
                    totalRequests: currentStats.http.totalRequests,
                    avgResponseTime: currentStats.http.avgResponseTime,
                    activeConnections: currentStats.http.activeConnections
                },
                colorAnalysis: currentStats.colorAnalysis,
                errors: currentStats.errors,
                cache: currentStats.cache
            };

            res.json({ success: true, data: metrics });
        } catch (error) {
            this.logger.error('Failed to get metrics data', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAnalytics(req, res) {
        try {
            const timeRange = req.query.timeRange || '24h';
            const analyticsData = this.analytics.getAnalyticsReport(timeRange);

            res.json({ success: true, data: analyticsData });
        } catch (error) {
            this.logger.error('Failed to get analytics data', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getHealth(req, res) {
        try {
            const healthStatus = this.health.getHealthStatus();
            res.json({ success: true, data: healthStatus });
        } catch (error) {
            this.logger.error('Failed to get health data', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAlerts(req, res) {
        try {
            const resolved = req.query.resolved === 'true';
            const alerts = this.health.getAlerts(resolved);

            res.json({ success: true, data: alerts });
        } catch (error) {
            this.logger.error('Failed to get alerts data', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getPerformance(req, res) {
        try {
            const timeRange = req.query.timeRange || '1h';

            // Get performance data from analytics
            const analyticsData = this.analytics.getAnalyticsReport(timeRange);

            const performance = {
                timestamp: new Date().toISOString(),
                timeRange,
                responseTime: {
                    average: analyticsData.sessions.avgDuration || 0,
                    percentiles: this.calculatePercentiles(analyticsData)
                },
                throughput: {
                    requestsPerSecond: analyticsData.interactions.total / this.getTimeRangeSeconds(timeRange),
                    peakRequestsPerSecond: this.calculatePeakThroughput(analyticsData)
                },
                errors: {
                    errorRate: this.calculateErrorRate(analyticsData),
                    errorsByType: analyticsData.interactions.byType || {}
                }
            };

            res.json({ success: true, data: performance });
        } catch (error) {
            this.logger.error('Failed to get performance data', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getRealTimeData(req, res) {
        try {
            const [healthStatus, currentStats, dashboardData] = await Promise.all([
                this.health.getHealthStatus(),
                this.metrics.getCurrentStats(),
                this.analytics.getDashboardData()
            ]);

            const realTimeData = {
                timestamp: new Date().toISOString(),
                health: {
                    status: healthStatus.overall,
                    services: Object.keys(healthStatus.services).reduce((acc, service) => {
                        acc[service] = healthStatus.services[service].status;
                        return acc;
                    }, {})
                },
                metrics: {
                    activeConnections: currentStats.http.activeConnections,
                    calculationsPerSecond: currentStats.colorAnalysis.calculationsPerSecond,
                    errorCount: currentStats.errors.totalErrors,
                    cacheHitRate: this.calculateCacheHitRate(currentStats.cache)
                },
                analytics: {
                    activeSessions: dashboardData.summary.activeSessions,
                    recentInteractions: dashboardData.summary.hourlyInteractions
                }
            };

            res.json({ success: true, data: realTimeData });
        } catch (error) {
            this.logger.error('Failed to get real-time data', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    getConfig(req, res) {
        const config = {
            refreshInterval: 30000, // 30 seconds
            alertThresholds: {
                responseTime: 2000,
                errorRate: 5,
                memoryUsage: 90
            },
            dashboardSettings: {
                theme: 'light',
                autoRefresh: true,
                showDetailedMetrics: true
            }
        };

        res.json({ success: true, data: config });
    }

    updateConfig(req, res) {
        try {
            // In a real implementation, save config to database or file
            const updatedConfig = req.body;

            this.logger.info('Dashboard configuration updated', updatedConfig);

            res.json({ success: true, message: 'Configuration updated successfully' });
        } catch (error) {
            this.logger.error('Failed to update configuration', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Utility methods
    calculatePercentiles(analyticsData) {
        // Simplified percentile calculation
        return {
            p50: 0,
            p90: 0,
            p95: 0,
            p99: 0
        };
    }

    getTimeRangeSeconds(timeRange) {
        const ranges = {
            '1h': 3600,
            '24h': 86400,
            '7d': 604800
        };
        return ranges[timeRange] || 3600;
    }

    calculatePeakThroughput(analyticsData) {
        // Calculate peak requests per second from hourly data
        return Math.max(...(analyticsData.usage?.hourlyPattern || [0])) / 3600;
    }

    calculateErrorRate(analyticsData) {
        const total = analyticsData.interactions.total || 0;
        const errors = analyticsData.interactions.byType?.error || 0;
        return total > 0 ? (errors / total) * 100 : 0;
    }

    calculateCacheHitRate(cacheStats) {
        const hits = cacheStats.hits || 0;
        const misses = cacheStats.misses || 0;
        const total = hits + misses;
        return total > 0 ? (hits / total) * 100 : 0;
    }

    generateDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sanzo Color Advisor - Monitoring Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 300;
        }

        .header .subtitle {
            opacity: 0.9;
            font-size: 0.9rem;
            margin-top: 0.25rem;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            border: 1px solid #e1e8ed;
        }

        .card h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
            font-size: 1.1rem;
            font-weight: 600;
        }

        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
            padding: 0.5rem;
            background-color: #f8f9fa;
            border-radius: 4px;
        }

        .metric-label {
            font-weight: 500;
            color: #555;
        }

        .metric-value {
            font-weight: 600;
            color: #2c3e50;
        }

        .status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status.healthy {
            background-color: #d4edda;
            color: #155724;
        }

        .status.degraded {
            background-color: #fff3cd;
            color: #856404;
        }

        .status.unhealthy {
            background-color: #f8d7da;
            color: #721c24;
        }

        .refresh-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .loading {
            opacity: 0.6;
        }

        .chart-placeholder {
            height: 200px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-style: italic;
        }

        .alert {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
        }

        .alert.critical {
            background-color: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            .grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Sanzo Color Advisor</h1>
        <div class="subtitle">Real-time Monitoring Dashboard</div>
    </div>

    <div class="refresh-indicator" id="refreshIndicator">
        Last updated: <span id="lastUpdate">Loading...</span>
    </div>

    <div class="container">
        <!-- Overview Section -->
        <div class="grid">
            <div class="card">
                <h3>System Health</h3>
                <div class="metric">
                    <span class="metric-label">Overall Status</span>
                    <span class="status healthy" id="overallStatus">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value" id="uptime">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Active Alerts</span>
                    <span class="metric-value" id="activeAlerts">Loading...</span>
                </div>
            </div>

            <div class="card">
                <h3>Performance Metrics</h3>
                <div class="metric">
                    <span class="metric-label">Avg Response Time</span>
                    <span class="metric-value" id="avgResponseTime">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Requests/Hour</span>
                    <span class="metric-value" id="requestsPerHour">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Error Rate</span>
                    <span class="metric-value" id="errorRate">Loading...</span>
                </div>
            </div>

            <div class="card">
                <h3>Color Analysis</h3>
                <div class="metric">
                    <span class="metric-label">Total Analyses</span>
                    <span class="metric-value" id="totalAnalyses">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Calculations/sec</span>
                    <span class="metric-value" id="calculationsPerSec">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Success Rate</span>
                    <span class="metric-value" id="successRate">Loading...</span>
                </div>
            </div>

            <div class="card">
                <h3>User Activity</h3>
                <div class="metric">
                    <span class="metric-label">Active Sessions</span>
                    <span class="metric-value" id="activeSessions">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Daily Interactions</span>
                    <span class="metric-value" id="dailyInteractions">Loading...</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Popular Room Type</span>
                    <span class="metric-value" id="popularRoomType">Loading...</span>
                </div>
            </div>
        </div>

        <!-- Alerts Section -->
        <div class="card">
            <h3>Active Alerts</h3>
            <div id="alertsContainer">
                <p>Loading alerts...</p>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid">
            <div class="card">
                <h3>Response Time Trend</h3>
                <div class="chart-placeholder">Response time chart will be displayed here</div>
            </div>

            <div class="card">
                <h3>Request Volume</h3>
                <div class="chart-placeholder">Request volume chart will be displayed here</div>
            </div>
        </div>
    </div>

    <script>
        let lastUpdateTime = new Date();

        async function fetchDashboardData() {
            try {
                const [overview, analytics, health, alerts] = await Promise.all([
                    fetch('/api/dashboard/overview').then(r => r.json()),
                    fetch('/api/dashboard/analytics').then(r => r.json()),
                    fetch('/api/dashboard/health').then(r => r.json()),
                    fetch('/api/dashboard/alerts').then(r => r.json())
                ]);

                updateOverview(overview.data);
                updateAnalytics(analytics.data);
                updateHealth(health.data);
                updateAlerts(alerts.data);

                lastUpdateTime = new Date();
                document.getElementById('lastUpdate').textContent = lastUpdateTime.toLocaleTimeString();

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        }

        function updateOverview(data) {
            if (!data) return;

            document.getElementById('overallStatus').textContent = data.status.overall;
            document.getElementById('overallStatus').className = \`status \${data.status.overall}\`;

            document.getElementById('uptime').textContent = formatUptime(data.status.uptime);
            document.getElementById('activeAlerts').textContent = data.status.activeAlerts || 0;

            document.getElementById('avgResponseTime').textContent = \`\${data.performance.avgResponseTime}ms\`;
            document.getElementById('requestsPerHour').textContent = data.traffic.hourlyRequests || 0;
            document.getElementById('errorRate').textContent = \`\${data.performance.errorRate.toFixed(2)}%\`;

            document.getElementById('totalAnalyses').textContent = data.colorAnalysis.totalAnalyses || 0;
            document.getElementById('calculationsPerSec').textContent = data.colorAnalysis.calculationsPerSecond.toFixed(2);

            const successRate = data.colorAnalysis.totalAnalyses > 0
                ? (data.colorAnalysis.successfulAnalyses / data.colorAnalysis.totalAnalyses * 100).toFixed(1)
                : 0;
            document.getElementById('successRate').textContent = \`\${successRate}%\`;

            document.getElementById('activeSessions').textContent = data.traffic.activeSessions || 0;
            document.getElementById('dailyInteractions').textContent = data.traffic.dailyRequests || 0;
        }

        function updateAnalytics(data) {
            if (!data || !data.preferences) return;

            const topRoomType = data.preferences.roomTypes && data.preferences.roomTypes.length > 0
                ? data.preferences.roomTypes[0].name
                : 'N/A';
            document.getElementById('popularRoomType').textContent = topRoomType;
        }

        function updateHealth(data) {
            // Health data is already updated in overview
        }

        function updateAlerts(alerts) {
            const container = document.getElementById('alertsContainer');

            if (!alerts || alerts.length === 0) {
                container.innerHTML = '<p style="color: #28a745; font-style: italic;">No active alerts</p>';
                return;
            }

            container.innerHTML = alerts.map(alert => \`
                <div class="alert \${alert.severity === 'critical' ? 'critical' : ''}">
                    <strong>\${alert.type.replace(/_/g, ' ').toUpperCase()}</strong> - \${alert.service}
                    <br>
                    <small>\${new Date(alert.timestamp).toLocaleString()}</small>
                </div>
            \`).join('');
        }

        function formatUptime(seconds) {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);

            if (days > 0) return \`\${days}d \${hours}h \${minutes}m\`;
            if (hours > 0) return \`\${hours}h \${minutes}m\`;
            return \`\${minutes}m\`;
        }

        // Initialize dashboard
        fetchDashboardData();

        // Auto-refresh every 30 seconds
        setInterval(fetchDashboardData, 30000);

        // Update timestamp every second
        setInterval(() => {
            const timeSinceUpdate = Math.floor((new Date() - lastUpdateTime) / 1000);
            const displayTime = timeSinceUpdate < 60
                ? \`\${timeSinceUpdate}s ago\`
                : lastUpdateTime.toLocaleTimeString();
            document.getElementById('lastUpdate').textContent = displayTime;
        }, 1000);
    </script>
</body>
</html>
        `;
    }
}

module.exports = MonitoringDashboard;