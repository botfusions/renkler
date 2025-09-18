/**
 * Analytics Tracker for Sanzo Color Advisor
 * Privacy-compliant user interaction and usage analytics
 */

const crypto = require('crypto');

class AnalyticsTracker {
    constructor(metricsCollector, logger) {
        this.metrics = metricsCollector;
        this.logger = logger;

        // In-memory analytics store (in production, use Redis or database)
        this.analyticsStore = {
            sessions: new Map(),
            userInteractions: [],
            colorPreferences: new Map(),
            usagePatterns: {
                hourly: new Array(24).fill(0),
                daily: new Array(7).fill(0),
                roomTypes: new Map(),
                ageGroups: new Map(),
                colorCombinations: new Map()
            },
            performanceMetrics: {
                responseTime: [],
                throughput: [],
                errorRate: []
            }
        };

        // Cleanup old data every hour
        setInterval(() => {
            this.cleanupOldData();
        }, 3600000); // 1 hour
    }

    /**
     * Generate anonymous session ID for privacy compliance
     */
    generateSessionId(req) {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent') || '';
        const timestamp = Date.now();

        // Create hash without storing personal data
        const hash = crypto.createHash('sha256')
            .update(ip + userAgent + Math.floor(timestamp / 3600000)) // Hour-based
            .digest('hex');

        return hash.substring(0, 16); // Short session ID
    }

    /**
     * Track user session start
     */
    startSession(req) {
        const sessionId = this.generateSessionId(req);
        const timestamp = Date.now();

        if (!this.analyticsStore.sessions.has(sessionId)) {
            this.analyticsStore.sessions.set(sessionId, {
                id: sessionId,
                startTime: timestamp,
                lastActivity: timestamp,
                pageViews: 0,
                interactions: 0,
                colorAnalyses: 0,
                preferredRoomTypes: new Set(),
                preferredAgeGroups: new Set()
            });
        }

        return sessionId;
    }

    /**
     * Track page view or API interaction
     */
    trackInteraction(sessionId, interactionType, metadata = {}) {
        const session = this.analyticsStore.sessions.get(sessionId);
        if (!session) return;

        const interaction = {
            sessionId,
            type: interactionType,
            timestamp: Date.now(),
            metadata: this.sanitizeMetadata(metadata)
        };

        // Update session
        session.lastActivity = interaction.timestamp;
        session.interactions++;

        if (interactionType === 'page_view') {
            session.pageViews++;
        }

        // Store interaction
        this.analyticsStore.userInteractions.push(interaction);

        // Update usage patterns
        this.updateUsagePatterns(interaction);

        // Log for debugging (without personal data)
        this.logger.debug('User interaction tracked', {
            type: interactionType,
            sessionId: sessionId.substring(0, 8) + '...',
            metadata: interaction.metadata
        });
    }

    /**
     * Track color analysis request
     */
    trackColorAnalysis(sessionId, analysisData, responseTime, success) {
        const session = this.analyticsStore.sessions.get(sessionId);
        if (session) {
            session.colorAnalyses++;

            if (analysisData.roomType) {
                session.preferredRoomTypes.add(analysisData.roomType);
            }

            if (analysisData.ageGroup) {
                session.preferredAgeGroups.add(analysisData.ageGroup);
            }
        }

        // Track color preferences
        this.trackColorPreferences(analysisData);

        // Update metrics
        this.metrics.recordColorAnalysis(
            analysisData.roomType || 'unknown',
            analysisData.ageGroup || 'unknown',
            responseTime / 1000, // Convert to seconds
            success
        );

        // Track room type popularity
        if (analysisData.roomType) {
            const count = this.analyticsStore.usagePatterns.roomTypes.get(analysisData.roomType) || 0;
            this.analyticsStore.usagePatterns.roomTypes.set(analysisData.roomType, count + 1);
        }

        // Track age group popularity
        if (analysisData.ageGroup) {
            const count = this.analyticsStore.usagePatterns.ageGroups.get(analysisData.ageGroup) || 0;
            this.analyticsStore.usagePatterns.ageGroups.set(analysisData.ageGroup, count + 1);
        }

        // Track color combinations
        const colors = [analysisData.wall, analysisData.floor, analysisData.furniture, analysisData.accent]
            .filter(Boolean);

        if (colors.length > 1) {
            const combinationKey = colors.sort().join('-');
            const count = this.analyticsStore.usagePatterns.colorCombinations.get(combinationKey) || 0;
            this.analyticsStore.usagePatterns.colorCombinations.set(combinationKey, count + 1);
        }

        this.trackInteraction(sessionId, 'color_analysis', {
            roomType: analysisData.roomType,
            ageGroup: analysisData.ageGroup,
            colorCount: colors.length,
            responseTime,
            success
        });
    }

    /**
     * Track color search requests
     */
    trackColorSearch(sessionId, searchType, query, resultCount) {
        this.metrics.recordColorSearch(searchType, resultCount > 0);

        this.trackInteraction(sessionId, 'color_search', {
            searchType,
            hasResults: resultCount > 0,
            resultCount: Math.min(resultCount, 100) // Cap for privacy
        });
    }

    /**
     * Track user color preferences (anonymous)
     */
    trackColorPreferences(analysisData) {
        const colors = [analysisData.wall, analysisData.floor, analysisData.furniture, analysisData.accent]
            .filter(Boolean);

        colors.forEach(color => {
            if (color) {
                // Extract color family (hue range) for preference tracking
                const colorFamily = this.getColorFamily(color);
                const count = this.analyticsStore.colorPreferences.get(colorFamily) || 0;
                this.analyticsStore.colorPreferences.set(colorFamily, count + 1);

                this.metrics.recordUserPreference('color_family', colorFamily);
            }
        });

        // Track room type preference
        if (analysisData.roomType) {
            this.metrics.recordUserPreference('room_type', analysisData.roomType);
        }

        // Track age group preference
        if (analysisData.ageGroup) {
            this.metrics.recordUserPreference('age_group', analysisData.ageGroup);
        }
    }

    /**
     * Track performance metrics
     */
    trackPerformance(endpoint, responseTime, statusCode) {
        const metric = {
            timestamp: Date.now(),
            endpoint,
            responseTime,
            statusCode,
            hour: new Date().getHours()
        };

        this.analyticsStore.performanceMetrics.responseTime.push(metric);

        // Update hourly usage patterns
        this.analyticsStore.usagePatterns.hourly[metric.hour]++;

        // Update daily usage patterns
        const dayOfWeek = new Date().getDay();
        this.analyticsStore.usagePatterns.daily[dayOfWeek]++;

        // Record in metrics
        this.metrics.recordApiLatency(endpoint, responseTime / 1000);
    }

    /**
     * Get analytics dashboard data
     */
    getDashboardData() {
        const now = Date.now();
        const oneHour = 3600000;
        const oneDay = 86400000;

        // Calculate active sessions (last hour)
        const activeSessions = Array.from(this.analyticsStore.sessions.values())
            .filter(session => now - session.lastActivity < oneHour).length;

        // Calculate hourly interactions
        const hourlyInteractions = this.analyticsStore.userInteractions
            .filter(interaction => now - interaction.timestamp < oneHour).length;

        // Calculate daily interactions
        const dailyInteractions = this.analyticsStore.userInteractions
            .filter(interaction => now - interaction.timestamp < oneDay).length;

        // Top room types
        const topRoomTypes = Array.from(this.analyticsStore.usagePatterns.roomTypes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([roomType, count]) => ({ roomType, count }));

        // Top age groups
        const topAgeGroups = Array.from(this.analyticsStore.usagePatterns.ageGroups.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ageGroup, count]) => ({ ageGroup, count }));

        // Top color preferences
        const topColorPreferences = Array.from(this.analyticsStore.colorPreferences.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([colorFamily, count]) => ({ colorFamily, count }));

        // Performance summary
        const recentPerformance = this.analyticsStore.performanceMetrics.responseTime
            .filter(metric => now - metric.timestamp < oneHour);

        const avgResponseTime = recentPerformance.length > 0
            ? recentPerformance.reduce((sum, m) => sum + m.responseTime, 0) / recentPerformance.length
            : 0;

        return {
            timestamp: new Date().toISOString(),
            summary: {
                activeSessions,
                hourlyInteractions,
                dailyInteractions,
                totalSessions: this.analyticsStore.sessions.size,
                avgResponseTime: Math.round(avgResponseTime)
            },
            usage: {
                hourlyPattern: this.analyticsStore.usagePatterns.hourly,
                dailyPattern: this.analyticsStore.usagePatterns.daily,
                topRoomTypes,
                topAgeGroups,
                topColorPreferences
            },
            performance: {
                avgResponseTime,
                requestsLastHour: recentPerformance.length,
                errorRate: this.calculateErrorRate(recentPerformance)
            }
        };
    }

    /**
     * Get detailed analytics report
     */
    getAnalyticsReport(timeRange = '24h') {
        const now = Date.now();
        let timeFilter;

        switch (timeRange) {
            case '1h':
                timeFilter = now - 3600000;
                break;
            case '24h':
                timeFilter = now - 86400000;
                break;
            case '7d':
                timeFilter = now - 604800000;
                break;
            default:
                timeFilter = now - 86400000;
        }

        const filteredInteractions = this.analyticsStore.userInteractions
            .filter(interaction => interaction.timestamp >= timeFilter);

        const filteredSessions = Array.from(this.analyticsStore.sessions.values())
            .filter(session => session.lastActivity >= timeFilter);

        return {
            timeRange,
            period: {
                start: new Date(timeFilter).toISOString(),
                end: new Date(now).toISOString()
            },
            sessions: {
                total: filteredSessions.length,
                avgDuration: this.calculateAvgSessionDuration(filteredSessions),
                avgInteractions: this.calculateAvgInteractions(filteredSessions)
            },
            interactions: {
                total: filteredInteractions.length,
                byType: this.groupInteractionsByType(filteredInteractions)
            },
            preferences: {
                roomTypes: this.getTopPreferences(this.analyticsStore.usagePatterns.roomTypes, 10),
                ageGroups: this.getTopPreferences(this.analyticsStore.usagePatterns.ageGroups, 10),
                colorFamilies: this.getTopPreferences(this.analyticsStore.colorPreferences, 10)
            }
        };
    }

    /**
     * Utility methods
     */
    sanitizeMetadata(metadata) {
        // Remove any potentially sensitive data
        const sanitized = { ...metadata };
        delete sanitized.ip;
        delete sanitized.userAgent;
        delete sanitized.personalInfo;
        return sanitized;
    }

    getColorFamily(hexColor) {
        try {
            const chroma = require('chroma-js');
            const color = chroma(hexColor);
            const hsl = color.hsl();
            const hue = hsl[0] || 0;

            // Categorize into color families
            if (hue < 30) return 'red';
            if (hue < 60) return 'orange';
            if (hue < 90) return 'yellow';
            if (hue < 150) return 'green';
            if (hue < 210) return 'cyan';
            if (hue < 270) return 'blue';
            if (hue < 330) return 'purple';
            return 'red';
        } catch (error) {
            return 'unknown';
        }
    }

    updateUsagePatterns(interaction) {
        const hour = new Date(interaction.timestamp).getHours();
        const day = new Date(interaction.timestamp).getDay();

        this.analyticsStore.usagePatterns.hourly[hour]++;
        this.analyticsStore.usagePatterns.daily[day]++;
    }

    calculateErrorRate(metrics) {
        if (metrics.length === 0) return 0;
        const errorCount = metrics.filter(m => m.statusCode >= 400).length;
        return (errorCount / metrics.length) * 100;
    }

    calculateAvgSessionDuration(sessions) {
        if (sessions.length === 0) return 0;
        const totalDuration = sessions.reduce((sum, session) => {
            return sum + (session.lastActivity - session.startTime);
        }, 0);
        return totalDuration / sessions.length;
    }

    calculateAvgInteractions(sessions) {
        if (sessions.length === 0) return 0;
        const totalInteractions = sessions.reduce((sum, session) => sum + session.interactions, 0);
        return totalInteractions / sessions.length;
    }

    groupInteractionsByType(interactions) {
        const groups = {};
        interactions.forEach(interaction => {
            groups[interaction.type] = (groups[interaction.type] || 0) + 1;
        });
        return groups;
    }

    getTopPreferences(map, limit) {
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([key, value]) => ({ name: key, count: value }));
    }

    cleanupOldData() {
        const now = Date.now();
        const maxAge = 7 * 24 * 3600000; // 7 days

        // Cleanup old interactions
        this.analyticsStore.userInteractions = this.analyticsStore.userInteractions
            .filter(interaction => now - interaction.timestamp < maxAge);

        // Cleanup inactive sessions
        for (const [sessionId, session] of this.analyticsStore.sessions.entries()) {
            if (now - session.lastActivity > maxAge) {
                this.analyticsStore.sessions.delete(sessionId);
            }
        }

        // Cleanup old performance metrics
        this.analyticsStore.performanceMetrics.responseTime =
            this.analyticsStore.performanceMetrics.responseTime
                .filter(metric => now - metric.timestamp < maxAge);

        this.logger.info('Analytics data cleanup completed', {
            interactions: this.analyticsStore.userInteractions.length,
            sessions: this.analyticsStore.sessions.size,
            performanceMetrics: this.analyticsStore.performanceMetrics.responseTime.length
        });
    }
}

module.exports = AnalyticsTracker;