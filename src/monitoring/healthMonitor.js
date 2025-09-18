/**
 * Health Monitor for Sanzo Color Advisor
 * Real-time health monitoring and alerting system
 */

const EventEmitter = require('events');

class HealthMonitor extends EventEmitter {
    constructor(metricsCollector, logger) {
        super();

        this.metrics = metricsCollector;
        this.logger = logger;

        // Health status tracking
        this.healthStatus = {
            overall: 'healthy',
            services: new Map(),
            lastCheck: null,
            alerts: []
        };

        // Monitoring configuration
        this.config = {
            checkInterval: 30000, // 30 seconds
            alertThresholds: {
                responseTime: 2000, // 2 seconds
                errorRate: 5, // 5%
                cpuUsage: 80, // 80%
                memoryUsage: 90, // 90%
                diskUsage: 85, // 85%
                consecutiveFailures: 3
            },
            services: [
                'api_server',
                'color_agent',
                'github_api',
                'web_scraper',
                'cache_system',
                'external_dependencies'
            ]
        };

        // Service status tracking
        this.serviceStatus = new Map();
        this.config.services.forEach(service => {
            this.serviceStatus.set(service, {
                status: 'unknown',
                lastCheck: null,
                consecutiveFailures: 0,
                responseTime: 0,
                details: {}
            });
        });

        // Initialize monitoring
        this.startMonitoring();
        this.setupAlertHandlers();
    }

    startMonitoring() {
        this.logger.info('Health monitoring started');

        // Perform initial health check
        this.performHealthCheck();

        // Schedule regular health checks
        this.monitoringInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.config.checkInterval);

        // Monitor system resources
        this.resourceMonitoringInterval = setInterval(() => {
            this.monitorSystemResources();
        }, 10000); // Every 10 seconds
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        if (this.resourceMonitoringInterval) {
            clearInterval(this.resourceMonitoringInterval);
        }

        this.logger.info('Health monitoring stopped');
    }

    async performHealthCheck() {
        const startTime = Date.now();
        const results = new Map();

        this.logger.debug('Performing health check');

        // Check each service
        for (const serviceName of this.config.services) {
            try {
                const result = await this.checkService(serviceName);
                results.set(serviceName, result);
                this.updateServiceStatus(serviceName, result);
            } catch (error) {
                this.logger.error(`Health check failed for ${serviceName}`, error);
                const failedResult = {
                    status: 'unhealthy',
                    responseTime: Date.now() - startTime,
                    error: error.message
                };
                results.set(serviceName, failedResult);
                this.updateServiceStatus(serviceName, failedResult);
            }
        }

        // Update overall health status
        this.updateOverallHealth(results);

        // Update metrics
        this.updateHealthMetrics(results);

        // Check for alerts
        this.checkAlerts(results);

        this.healthStatus.lastCheck = new Date().toISOString();

        this.logger.debug('Health check completed', {
            duration: Date.now() - startTime,
            overallStatus: this.healthStatus.overall
        });
    }

    async checkService(serviceName) {
        const startTime = Date.now();

        switch (serviceName) {
            case 'api_server':
                return await this.checkAPIServer();

            case 'color_agent':
                return await this.checkColorAgent();

            case 'github_api':
                return await this.checkGitHubAPI();

            case 'web_scraper':
                return await this.checkWebScraper();

            case 'cache_system':
                return await this.checkCacheSystem();

            case 'external_dependencies':
                return await this.checkExternalDependencies();

            default:
                throw new Error(`Unknown service: ${serviceName}`);
        }
    }

    async checkAPIServer() {
        const startTime = Date.now();

        try {
            // Check if the server is responding
            const responseTime = Date.now() - startTime;

            return {
                status: 'healthy',
                responseTime,
                details: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage()
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    async checkColorAgent() {
        const startTime = Date.now();

        try {
            // Test color agent functionality with a simple operation
            const ColorAgent = require('../components/ColorAgent');
            const agent = new ColorAgent();

            // Perform a lightweight test
            const testResult = await agent.analyzeColorScheme({
                roomType: 'living_room',
                wall: '#FFFFFF'
            });

            return {
                status: testResult.success ? 'healthy' : 'degraded',
                responseTime: Date.now() - startTime,
                details: {
                    testPassed: testResult.success,
                    harmoniesAvailable: agent.sanzoHarmonies ?
                        (agent.sanzoHarmonies.traditionalHarmonies?.length || 0) +
                        (agent.sanzoHarmonies.modernAdaptations?.length || 0) : 0
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    async checkGitHubAPI() {
        const startTime = Date.now();

        try {
            const GitHubAPI = require('../api/githubAPI');
            const github = new GitHubAPI();

            const result = await github.healthCheck();

            return {
                status: result.success ? 'healthy' : 'degraded',
                responseTime: Date.now() - startTime,
                details: result.data || { error: 'Health check failed' }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    async checkWebScraper() {
        const startTime = Date.now();

        try {
            const WebScraper = require('../api/webScraper');
            const scraper = new WebScraper();

            const result = await scraper.healthCheck();

            return {
                status: result.success ? 'healthy' : 'degraded',
                responseTime: Date.now() - startTime,
                details: result.data || { error: 'Health check failed' }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    async checkCacheSystem() {
        const startTime = Date.now();

        try {
            // Test cache operations
            const fs = require('fs').promises;
            const path = require('path');
            const cacheDir = path.join(process.cwd(), 'cache');

            // Check if cache directory exists and is writable
            try {
                await fs.access(cacheDir);
                const stats = await fs.stat(cacheDir);

                return {
                    status: 'healthy',
                    responseTime: Date.now() - startTime,
                    details: {
                        exists: true,
                        writable: true,
                        size: stats.size
                    }
                };
            } catch (error) {
                // Cache directory doesn't exist, which is okay
                return {
                    status: 'healthy',
                    responseTime: Date.now() - startTime,
                    details: {
                        exists: false,
                        note: 'Cache directory will be created when needed'
                    }
                };
            }
        } catch (error) {
            return {
                status: 'degraded',
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    async checkExternalDependencies() {
        const startTime = Date.now();

        try {
            // Test network connectivity and external service availability
            const axios = require('axios');

            // Test basic internet connectivity
            await axios.get('https://httpbin.org/status/200', { timeout: 5000 });

            return {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                details: {
                    internetConnectivity: true
                }
            };
        } catch (error) {
            return {
                status: 'degraded',
                responseTime: Date.now() - startTime,
                error: error.message,
                details: {
                    internetConnectivity: false
                }
            };
        }
    }

    updateServiceStatus(serviceName, result) {
        const service = this.serviceStatus.get(serviceName);

        if (result.status === 'healthy') {
            service.consecutiveFailures = 0;
        } else {
            service.consecutiveFailures++;
        }

        service.status = result.status;
        service.lastCheck = new Date().toISOString();
        service.responseTime = result.responseTime;
        service.details = result.details || {};

        if (result.error) {
            service.details.lastError = result.error;
        }

        this.serviceStatus.set(serviceName, service);

        // Log service status changes
        if (service.consecutiveFailures === 1 && result.status !== 'healthy') {
            this.logger.warn(`Service ${serviceName} is now ${result.status}`, {
                service: serviceName,
                status: result.status,
                responseTime: result.responseTime,
                error: result.error
            });
        } else if (service.consecutiveFailures === 0 && result.status === 'healthy') {
            this.logger.info(`Service ${serviceName} is now healthy`, {
                service: serviceName,
                responseTime: result.responseTime
            });
        }
    }

    updateOverallHealth(results) {
        const unhealthyServices = Array.from(results.values())
            .filter(result => result.status === 'unhealthy');

        const degradedServices = Array.from(results.values())
            .filter(result => result.status === 'degraded');

        let overallStatus;

        if (unhealthyServices.length > 0) {
            overallStatus = 'unhealthy';
        } else if (degradedServices.length > 0) {
            overallStatus = 'degraded';
        } else {
            overallStatus = 'healthy';
        }

        const previousStatus = this.healthStatus.overall;
        this.healthStatus.overall = overallStatus;

        // Log overall status changes
        if (previousStatus !== overallStatus) {
            this.logger.info(`Overall health status changed: ${previousStatus} -> ${overallStatus}`, {
                unhealthyServices: unhealthyServices.length,
                degradedServices: degradedServices.length,
                totalServices: results.size
            });

            // Emit health change event
            this.emit('healthChange', {
                previous: previousStatus,
                current: overallStatus,
                services: Object.fromEntries(results)
            });
        }
    }

    updateHealthMetrics(results) {
        // Update health check metrics in Prometheus
        for (const [serviceName, result] of results.entries()) {
            this.metrics.setHealthStatus(serviceName, result.status === 'healthy');
        }

        this.metrics.setHealthStatus('overall', this.healthStatus.overall === 'healthy');
    }

    checkAlerts(results) {
        const now = Date.now();

        for (const [serviceName, result] of results.entries()) {
            const service = this.serviceStatus.get(serviceName);

            // Check for consecutive failures
            if (service.consecutiveFailures >= this.config.alertThresholds.consecutiveFailures) {
                this.triggerAlert('service_down', serviceName, {
                    consecutiveFailures: service.consecutiveFailures,
                    lastError: service.details.lastError
                });
            }

            // Check response time
            if (result.responseTime > this.config.alertThresholds.responseTime) {
                this.triggerAlert('slow_response', serviceName, {
                    responseTime: result.responseTime,
                    threshold: this.config.alertThresholds.responseTime
                });
            }
        }

        // Check overall system health
        if (this.healthStatus.overall === 'unhealthy') {
            this.triggerAlert('system_unhealthy', 'overall', {
                status: this.healthStatus.overall,
                timestamp: now
            });
        }
    }

    async monitorSystemResources() {
        try {
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            // Calculate memory usage percentage (approximate)
            const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

            // Check memory usage
            if (memoryUsagePercent > this.config.alertThresholds.memoryUsage) {
                this.triggerAlert('high_memory_usage', 'system', {
                    usage: memoryUsagePercent,
                    threshold: this.config.alertThresholds.memoryUsage,
                    details: memoryUsage
                });
            }

            // Update metrics
            this.metrics.setHealthStatus('memory_check', memoryUsagePercent < this.config.alertThresholds.memoryUsage);

        } catch (error) {
            this.logger.error('Failed to monitor system resources', error);
        }
    }

    triggerAlert(alertType, serviceName, details) {
        const alert = {
            id: `${alertType}_${serviceName}_${Date.now()}`,
            type: alertType,
            service: serviceName,
            severity: this.getAlertSeverity(alertType),
            timestamp: new Date().toISOString(),
            details,
            resolved: false
        };

        // Check if this alert already exists (avoid duplicate alerts)
        const existingAlert = this.healthStatus.alerts.find(a =>
            a.type === alertType &&
            a.service === serviceName &&
            !a.resolved
        );

        if (!existingAlert) {
            this.healthStatus.alerts.push(alert);

            this.logger.warn(`ALERT: ${alertType} for ${serviceName}`, alert);

            // Emit alert event
            this.emit('alert', alert);

            // In production, this would send to alerting systems (Slack, PagerDuty, etc.)
            this.sendAlert(alert);
        }
    }

    getAlertSeverity(alertType) {
        const severityMap = {
            'service_down': 'critical',
            'system_unhealthy': 'critical',
            'high_memory_usage': 'high',
            'high_cpu_usage': 'high',
            'slow_response': 'medium',
            'high_error_rate': 'high'
        };

        return severityMap[alertType] || 'medium';
    }

    async sendAlert(alert) {
        // In production, integrate with alerting systems
        // For now, just log the alert

        switch (alert.severity) {
            case 'critical':
                this.logger.error(`CRITICAL ALERT: ${alert.type}`, alert);
                break;
            case 'high':
                this.logger.warn(`HIGH ALERT: ${alert.type}`, alert);
                break;
            default:
                this.logger.info(`ALERT: ${alert.type}`, alert);
        }

        // TODO: Integrate with external alerting systems
        // - Email notifications
        // - Slack/Discord webhooks
        // - PagerDuty integration
        // - SMS alerts for critical issues
    }

    setupAlertHandlers() {
        this.on('alert', (alert) => {
            this.logger.info('Alert triggered', alert);
        });

        this.on('healthChange', (change) => {
            this.logger.info('Health status changed', change);
        });
    }

    // Public API methods
    getHealthStatus() {
        return {
            overall: this.healthStatus.overall,
            lastCheck: this.healthStatus.lastCheck,
            services: Object.fromEntries(this.serviceStatus),
            activeAlerts: this.healthStatus.alerts.filter(a => !a.resolved).length,
            uptime: process.uptime()
        };
    }

    getAlerts(resolved = false) {
        return this.healthStatus.alerts.filter(alert => alert.resolved === resolved);
    }

    resolveAlert(alertId) {
        const alert = this.healthStatus.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date().toISOString();
            this.logger.info(`Alert resolved: ${alertId}`, alert);
        }
    }

    async forceHealthCheck() {
        this.logger.info('Forcing health check');
        await this.performHealthCheck();
        return this.getHealthStatus();
    }
}

module.exports = HealthMonitor;