/**
 * Essential Error Monitoring System
 * Lightweight error tracking and alerting for production use
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

class ErrorMonitoring {
    constructor() {
        this.setupLogger();
        this.errorCounts = new Map();
        this.errorPatterns = new Map();
        this.alertThresholds = {
            errorRate: 10, // errors per minute
            memoryUsage: 0.9, // 90% memory usage
            responseTime: 5000, // 5 seconds
            consecutiveErrors: 5
        };
        this.lastAlerts = new Map();
        this.alertCooldown = 5 * 60 * 1000; // 5 minutes

        // Monitor system health
        this.startHealthMonitoring();
    }

    /**
     * Setup Winston logger with rotation
     */
    setupLogger() {
        // Error log rotation
        const errorTransport = new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '7d',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        });

        // Combined log rotation
        const combinedTransport = new DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '3d',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        });

        // Console transport for development
        const consoleTransport = new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ level, message, timestamp, stack }) => {
                    return `${timestamp} ${level}: ${message}${stack ? '\n' + stack : ''}`;
                })
            )
        });

        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            transports: [
                errorTransport,
                combinedTransport,
                ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : [])
            ]
        });

        // Handle uncaught exceptions and rejections
        this.logger.exceptions.handle(
            new DailyRotateFile({
                filename: 'logs/exceptions-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '3d'
            })
        );

        this.logger.rejections.handle(
            new DailyRotateFile({
                filename: 'logs/rejections-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '3d'
            })
        );
    }

    /**
     * Express middleware for error capture
     */
    errorCapture() {
        return (req, res, next) => {
            // Capture original res.json to monitor response errors
            const originalJson = res.json;
            res.json = (data) => {
                if (res.statusCode >= 400) {
                    this.logError({
                        type: 'http_error',
                        statusCode: res.statusCode,
                        method: req.method,
                        url: req.url,
                        userAgent: req.get('User-Agent'),
                        ip: req.ip,
                        requestId: req.id,
                        responseData: data
                    });
                }
                return originalJson.call(res, data);
            };

            next();
        };
    }

    /**
     * Express error handling middleware
     */
    errorHandler() {
        return (error, req, res, next) => {
            const errorInfo = {
                type: 'server_error',
                message: error.message,
                stack: error.stack,
                statusCode: error.status || 500,
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                requestId: req.id,
                timestamp: new Date().toISOString()
            };

            this.logError(errorInfo);
            this.checkAlertThresholds();

            // Don't expose stack traces in production
            const isDevelopment = process.env.NODE_ENV === 'development';
            res.status(errorInfo.statusCode).json({
                success: false,
                error: {
                    message: error.message,
                    status: errorInfo.statusCode,
                    requestId: req.id,
                    ...(isDevelopment && { stack: error.stack })
                }
            });
        };
    }

    /**
     * Log error with pattern detection
     */
    logError(errorInfo) {
        // Log to Winston
        this.logger.error('Error occurred', errorInfo);

        // Track error patterns
        const pattern = this.getErrorPattern(errorInfo);
        const currentCount = this.errorPatterns.get(pattern) || 0;
        this.errorPatterns.set(pattern, currentCount + 1);

        // Track error rates
        const minute = Math.floor(Date.now() / 60000);
        const minuteKey = `${minute}`;
        const minuteCount = this.errorCounts.get(minuteKey) || 0;
        this.errorCounts.set(minuteKey, minuteCount + 1);

        // Clean old error counts (keep last 10 minutes)
        for (const [key] of this.errorCounts.entries()) {
            if (parseInt(key) < minute - 10) {
                this.errorCounts.delete(key);
            }
        }
    }

    /**
     * Get error pattern for grouping similar errors
     */
    getErrorPattern(errorInfo) {
        // Create pattern from error type, status code, and URL path
        const urlPath = errorInfo.url ? errorInfo.url.split('?')[0] : 'unknown';
        return `${errorInfo.type || 'unknown'}-${errorInfo.statusCode || 500}-${urlPath}`;
    }

    /**
     * Check if alert thresholds are exceeded
     */
    checkAlertThresholds() {
        const now = Date.now();

        // Check error rate (errors per minute)
        const minute = Math.floor(now / 60000);
        const currentMinuteErrors = this.errorCounts.get(minute.toString()) || 0;

        if (currentMinuteErrors >= this.alertThresholds.errorRate) {
            this.sendAlert('high_error_rate', {
                count: currentMinuteErrors,
                threshold: this.alertThresholds.errorRate,
                minute: minute
            });
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        const memUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

        if (memUsagePercent >= this.alertThresholds.memoryUsage) {
            this.sendAlert('high_memory_usage', {
                percentage: Math.round(memUsagePercent * 100),
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal
            });
        }
    }

    /**
     * Send alert (with cooldown to prevent spam)
     */
    sendAlert(alertType, details) {
        const now = Date.now();
        const lastAlert = this.lastAlerts.get(alertType);

        // Check cooldown
        if (lastAlert && (now - lastAlert) < this.alertCooldown) {
            return;
        }

        this.lastAlerts.set(alertType, now);

        const alert = {
            type: alertType,
            timestamp: new Date().toISOString(),
            details: details,
            serverInfo: {
                hostname: require('os').hostname(),
                platform: process.platform,
                nodeVersion: process.version,
                uptime: process.uptime()
            }
        };

        // Log alert
        this.logger.error('ALERT TRIGGERED', alert);

        // In a real production environment, you would send this to:
        // - Slack webhook
        // - Email service
        // - PagerDuty
        // - SMS service
        // For now, we'll just log it prominently

        console.error('\n🚨 PRODUCTION ALERT 🚨');
        console.error(`Type: ${alertType}`);
        console.error(`Details:`, JSON.stringify(details, null, 2));
        console.error(`Time: ${alert.timestamp}\n`);

        // You could extend this to send real alerts:
        // this.sendSlackAlert(alert);
        // this.sendEmailAlert(alert);
    }

    /**
     * Start system health monitoring
     */
    startHealthMonitoring() {
        // Monitor every 30 seconds
        setInterval(() => {
            this.checkSystemHealth();
        }, 30000);
    }

    /**
     * Check overall system health
     */
    checkSystemHealth() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        // Log health metrics
        this.logger.info('Health check', {
            type: 'health_check',
            memory: {
                rss: memUsage.rss,
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external
            },
            cpu: cpuUsage,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get error monitoring dashboard data
     */
    getDashboardData() {
        const now = Date.now();
        const minute = Math.floor(now / 60000);

        // Get recent error rates
        const recentErrors = [];
        for (let i = 9; i >= 0; i--) {
            const checkMinute = minute - i;
            const count = this.errorCounts.get(checkMinute.toString()) || 0;
            recentErrors.push({
                minute: checkMinute,
                timestamp: new Date(checkMinute * 60000).toISOString(),
                count: count
            });
        }

        // Get top error patterns
        const topPatterns = Array.from(this.errorPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([pattern, count]) => ({ pattern, count }));

        return {
            errorRates: recentErrors,
            topPatterns: topPatterns,
            totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
            systemHealth: {
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                nodeVersion: process.version,
                platform: process.platform
            },
            thresholds: this.alertThresholds,
            lastAlerts: Array.from(this.lastAlerts.entries()).map(([type, time]) => ({
                type,
                timestamp: new Date(time).toISOString()
            }))
        };
    }

    /**
     * Get recent logs for dashboard
     */
    async getRecentLogs(level = 'error', limit = 50) {
        // In a production environment, you might want to use a log aggregation service
        // For now, this is a simple implementation
        return {
            message: 'Log retrieval not implemented in this lightweight version',
            suggestion: 'Use external log aggregation service like ELK stack for production'
        };
    }

    /**
     * Performance monitoring middleware
     */
    performanceMonitor() {
        return (req, res, next) => {
            const start = process.hrtime.bigint();

            res.on('finish', () => {
                const duration = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds

                // Log slow requests
                if (duration > this.alertThresholds.responseTime) {
                    this.logger.warn('Slow request detected', {
                        type: 'slow_request',
                        method: req.method,
                        url: req.url,
                        duration: duration,
                        userAgent: req.get('User-Agent'),
                        requestId: req.id
                    });
                }
            });

            next();
        };
    }
}

module.exports = ErrorMonitoring;