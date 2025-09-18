/**
 * Advanced Logging System for Sanzo Color Advisor
 * Comprehensive error monitoring and structured logging
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

class Logger {
    constructor(metricsCollector) {
        this.metrics = metricsCollector;
        this.setupLogger();
        this.setupErrorTracking();
    }

    setupLogger() {
        // Create logs directory if it doesn't exist
        const logsDir = path.join(process.cwd(), 'logs');

        // Define log format
        const logFormat = winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss.SSS'
            }),
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.printf(info => {
                const { timestamp, level, message, ...meta } = info;

                // Add request context if available
                const context = {
                    timestamp,
                    level,
                    message,
                    service: 'sanzo-color-advisor',
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development'
                };

                // Add metadata
                if (Object.keys(meta).length > 0) {
                    context.meta = meta;
                }

                return JSON.stringify(context);
            })
        );

        // Create rotating file transport for general logs
        const fileRotateTransport = new DailyRotateFile({
            filename: path.join(logsDir, 'sanzo-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: logFormat,
            level: 'info'
        });

        // Create rotating file transport for error logs
        const errorRotateTransport = new DailyRotateFile({
            filename: path.join(logsDir, 'sanzo-error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            format: logFormat,
            level: 'error'
        });

        // Create performance log transport
        const performanceRotateTransport = new DailyRotateFile({
            filename: path.join(logsDir, 'sanzo-performance-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '7d',
            format: logFormat,
            level: 'debug'
        });

        // Console transport for development
        const consoleTransport = new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(info => {
                    const { timestamp, level, message, ...meta } = info;
                    let output = `${timestamp} [${level}]: ${message}`;

                    if (Object.keys(meta).length > 0) {
                        output += ` ${JSON.stringify(meta, null, 2)}`;
                    }

                    return output;
                })
            ),
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        });

        // Create main logger
        this.logger = winston.createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            transports: [
                fileRotateTransport,
                errorRotateTransport,
                performanceRotateTransport,
                consoleTransport
            ],
            exitOnError: false
        });

        // Create specialized loggers
        this.errorLogger = winston.createLogger({
            level: 'error',
            transports: [errorRotateTransport, consoleTransport],
            exitOnError: false
        });

        this.performanceLogger = winston.createLogger({
            level: 'debug',
            transports: [performanceRotateTransport],
            exitOnError: false
        });

        // Handle uncaught exceptions and rejections
        this.logger.exceptions.handle(
            new DailyRotateFile({
                filename: path.join(logsDir, 'sanzo-exceptions-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '30d',
                format: logFormat
            })
        );

        this.logger.rejections.handle(
            new DailyRotateFile({
                filename: path.join(logsDir, 'sanzo-rejections-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '30d',
                format: logFormat
            })
        );
    }

    setupErrorTracking() {
        // Error classification
        this.errorTypes = {
            VALIDATION_ERROR: 'validation_error',
            API_ERROR: 'api_error',
            DATABASE_ERROR: 'database_error',
            EXTERNAL_SERVICE_ERROR: 'external_service_error',
            AUTHENTICATION_ERROR: 'authentication_error',
            AUTHORIZATION_ERROR: 'authorization_error',
            RATE_LIMIT_ERROR: 'rate_limit_error',
            SYSTEM_ERROR: 'system_error',
            USER_ERROR: 'user_error',
            UNKNOWN_ERROR: 'unknown_error'
        };

        // Error severity levels
        this.errorSeverity = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
    }

    // Main logging methods
    info(message, meta = {}) {
        this.logger.info(message, this.enrichMeta(meta));
    }

    warn(message, meta = {}) {
        this.logger.warn(message, this.enrichMeta(meta));

        // Record warning in metrics
        if (this.metrics) {
            this.metrics.recordError('warning', meta.endpoint || 'unknown', 'medium');
        }
    }

    error(message, error = null, meta = {}) {
        const errorMeta = this.enrichMeta(meta);

        if (error) {
            errorMeta.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            };
        }

        this.errorLogger.error(message, errorMeta);
        this.logger.error(message, errorMeta);

        // Record error in metrics
        if (this.metrics) {
            const errorType = this.classifyError(error);
            const severity = this.determineSeverity(error, meta);
            this.metrics.recordError(errorType, meta.endpoint || 'unknown', severity);
        }
    }

    debug(message, meta = {}) {
        this.logger.debug(message, this.enrichMeta(meta));
    }

    // Performance logging
    performance(message, metrics = {}) {
        const perfMeta = {
            ...metrics,
            type: 'performance',
            timestamp: Date.now()
        };

        this.performanceLogger.debug(message, perfMeta);
    }

    // Specialized logging methods
    logRequest(req, res, responseTime) {
        const requestMeta = {
            type: 'http_request',
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: responseTime,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            requestId: req.id,
            ip: this.hashIP(req.ip || req.connection.remoteAddress)
        };

        // Log different levels based on status code
        if (res.statusCode >= 500) {
            this.error('HTTP request failed', null, requestMeta);
        } else if (res.statusCode >= 400) {
            this.warn('HTTP request error', requestMeta);
        } else {
            this.info('HTTP request', requestMeta);
        }

        // Log performance separately for slow requests
        if (responseTime > 1000) {
            this.performance('Slow HTTP request', requestMeta);
        }
    }

    logColorAnalysis(analysisData, responseTime, success, error = null) {
        const analysisMeta = {
            type: 'color_analysis',
            roomType: analysisData.roomType,
            ageGroup: analysisData.ageGroup,
            colorCount: [analysisData.wall, analysisData.floor, analysisData.furniture, analysisData.accent]
                .filter(Boolean).length,
            responseTime,
            success,
            requestId: analysisData.requestId
        };

        if (success) {
            this.info('Color analysis completed', analysisMeta);
        } else {
            this.error('Color analysis failed', error, analysisMeta);
        }

        // Performance logging for analysis operations
        this.performance('Color analysis performance', {
            operation: 'color_analysis',
            duration: responseTime,
            success,
            roomType: analysisData.roomType
        });
    }

    logCacheOperation(operation, cacheType, hit, responseTime = null) {
        const cacheMeta = {
            type: 'cache_operation',
            operation,
            cacheType,
            hit,
            responseTime
        };

        this.debug(`Cache ${operation}: ${hit ? 'HIT' : 'MISS'}`, cacheMeta);

        if (responseTime) {
            this.performance('Cache operation performance', cacheMeta);
        }
    }

    logExternalService(serviceName, operation, success, responseTime, error = null) {
        const serviceMeta = {
            type: 'external_service',
            serviceName,
            operation,
            success,
            responseTime
        };

        if (success) {
            this.info(`External service call: ${serviceName}`, serviceMeta);
        } else {
            this.error(`External service failed: ${serviceName}`, error, serviceMeta);
        }

        this.performance('External service performance', serviceMeta);
    }

    logSecurity(event, level, details = {}) {
        const securityMeta = {
            type: 'security',
            event,
            level,
            ...details,
            timestamp: Date.now()
        };

        switch (level) {
            case 'critical':
                this.error(`Security event: ${event}`, null, securityMeta);
                break;
            case 'high':
                this.warn(`Security event: ${event}`, securityMeta);
                break;
            default:
                this.info(`Security event: ${event}`, securityMeta);
        }
    }

    logRateLimit(endpoint, ip, attemptCount) {
        const rateLimitMeta = {
            type: 'rate_limit',
            endpoint,
            ip: this.hashIP(ip),
            attemptCount
        };

        this.warn('Rate limit exceeded', rateLimitMeta);

        // Record in metrics
        if (this.metrics) {
            this.metrics.recordRateLimitHit(endpoint, this.hashIP(ip));
        }
    }

    // Health check logging
    logHealthCheck(service, status, responseTime, details = {}) {
        const healthMeta = {
            type: 'health_check',
            service,
            status,
            responseTime,
            ...details
        };

        if (status === 'healthy') {
            this.debug(`Health check: ${service} - OK`, healthMeta);
        } else {
            this.warn(`Health check: ${service} - FAILED`, healthMeta);
        }
    }

    // Business logic logging
    logBusinessEvent(event, data = {}) {
        const businessMeta = {
            type: 'business_event',
            event,
            ...data,
            timestamp: Date.now()
        };

        this.info(`Business event: ${event}`, businessMeta);
    }

    // Utility methods
    enrichMeta(meta) {
        return {
            ...meta,
            pid: process.pid,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };
    }

    classifyError(error) {
        if (!error) return this.errorTypes.UNKNOWN_ERROR;

        const message = error.message || '';
        const name = error.name || '';
        const code = error.code || '';

        // Classification logic
        if (name === 'ValidationError' || message.includes('validation')) {
            return this.errorTypes.VALIDATION_ERROR;
        }

        if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
            return this.errorTypes.EXTERNAL_SERVICE_ERROR;
        }

        if (message.includes('rate limit') || code === 'RATE_LIMITED') {
            return this.errorTypes.RATE_LIMIT_ERROR;
        }

        if (name === 'UnauthorizedError' || message.includes('unauthorized')) {
            return this.errorTypes.AUTHENTICATION_ERROR;
        }

        if (name === 'ForbiddenError' || message.includes('forbidden')) {
            return this.errorTypes.AUTHORIZATION_ERROR;
        }

        if (message.includes('database') || message.includes('sql')) {
            return this.errorTypes.DATABASE_ERROR;
        }

        if (error.status >= 400 && error.status < 500) {
            return this.errorTypes.USER_ERROR;
        }

        if (error.status >= 500) {
            return this.errorTypes.SYSTEM_ERROR;
        }

        return this.errorTypes.UNKNOWN_ERROR;
    }

    determineSeverity(error, meta = {}) {
        if (!error) return this.errorSeverity.LOW;

        const status = error.status || meta.statusCode || 0;
        const errorType = this.classifyError(error);

        // Critical errors
        if (status >= 500 || errorType === this.errorTypes.SYSTEM_ERROR) {
            return this.errorSeverity.CRITICAL;
        }

        // High severity errors
        if (errorType === this.errorTypes.EXTERNAL_SERVICE_ERROR ||
            errorType === this.errorTypes.DATABASE_ERROR ||
            errorType === this.errorTypes.AUTHENTICATION_ERROR) {
            return this.errorSeverity.HIGH;
        }

        // Medium severity errors
        if (status >= 400 || errorType === this.errorTypes.VALIDATION_ERROR) {
            return this.errorSeverity.MEDIUM;
        }

        return this.errorSeverity.LOW;
    }

    hashIP(ip) {
        if (!ip) return 'unknown';

        const crypto = require('crypto');
        return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    }

    // Get logger instance for external use
    getLogger() {
        return this.logger;
    }

    // Get error statistics
    getErrorStats() {
        // In a real implementation, this would query log files or a logging service
        // For now, return basic stats from metrics
        return {
            lastHour: {
                total: 0,
                byType: {},
                bySeverity: {}
            },
            lastDay: {
                total: 0,
                byType: {},
                bySeverity: {}
            }
        };
    }
}

module.exports = Logger;