/**
 * ApiClient.js - Clean API Integration with Error Handling
 * Handles all communication with the Sanzo Color Advisor API
 */

class ApiClient {
    constructor(baseUrl = null) {
        // Auto-detect environment if baseUrl not provided
        this.baseUrl = baseUrl || this.getDefaultBaseUrl();
        this.requestTimeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second

        // Request interceptors
        this.requestInterceptors = [];
        this.responseInterceptors = [];

        // Abort controller for request cancellation
        this.abortController = null;

        console.log('ApiClient initialized with base URL:', this.baseUrl);
    }

    /**
     * Auto-detect the correct API base URL based on environment
     */
    getDefaultBaseUrl() {
        // Check if running on Netlify
        if (window.location.hostname.includes('netlify.app') ||
            window.location.hostname.includes('netlify.com')) {
            return '/.netlify/functions/api';
        }

        // Check if production deployment (custom domain)
        if (window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1') {
            return '/.netlify/functions/api';
        }

        // Default to localhost for development
        return 'http://localhost:3000/api';
    }

    /**
     * Generic HTTP request method with error handling and retries
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.requestTimeout
        };

        const requestOptions = { ...defaultOptions, ...options };

        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            requestOptions = await interceptor(requestOptions);
        }

        // Create abort controller for this request
        this.abortController = new AbortController();
        requestOptions.signal = this.abortController.signal;

        let lastError;

        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                const response = await this.makeRequest(url, requestOptions);

                // Apply response interceptors
                let processedResponse = response;
                for (const interceptor of this.responseInterceptors) {
                    processedResponse = await interceptor(processedResponse);
                }

                return processedResponse;

            } catch (error) {
                lastError = error;

                // Don't retry for certain error types
                if (this.isNonRetriableError(error) || attempt === this.retryAttempts - 1) {
                    break;
                }

                // Wait before retry (exponential backoff)
                const delay = this.retryDelay * Math.pow(2, attempt);
                await this.delay(delay);

                console.warn(`Request attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);
            }
        }

        // All retries failed
        throw this.createApiError(lastError, url);
    }

    /**
     * Make the actual HTTP request with timeout
     */
    async makeRequest(url, options) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout);
        });

        try {
            const response = await Promise.race([
                fetch(url, options),
                timeoutPromise
            ]);

            // Handle HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Parse JSON response
            const data = await response.json();

            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: data
            };

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request cancelled');
            }
            throw error;
        }
    }

    /**
     * Check if error should not be retried
     */
    isNonRetriableError(error) {
        const nonRetriableErrors = [
            'Request cancelled',
            'HTTP 400',
            'HTTP 401',
            'HTTP 403',
            'HTTP 404',
            'HTTP 422'
        ];

        return nonRetriableErrors.some(errorType =>
            error.message.includes(errorType)
        );
    }

    /**
     * Create standardized API error
     */
    createApiError(originalError, url) {
        const apiError = new Error(originalError.message || 'API request failed');
        apiError.name = 'ApiError';
        apiError.url = url;
        apiError.originalError = originalError;
        apiError.timestamp = new Date().toISOString();

        return apiError;
    }

    /**
     * Delay utility for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Cancel ongoing requests
     */
    cancelRequests() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Health check endpoint
     */
    async healthCheck() {
        try {
            const response = await this.request('/health');
            return {
                success: true,
                data: response.data,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Analyze color scheme - Main API endpoint
     */
    async analyzeColors(colorData) {
        try {
            // Validate input data
            this.validateColorAnalysisData(colorData);

            const response = await this.request('/analyze', {
                method: 'POST',
                body: JSON.stringify(colorData)
            });

            return {
                success: true,
                data: response.data,
                meta: {
                    requestTime: new Date().toISOString(),
                    responseTime: response.headers.get('x-response-time'),
                    requestId: response.headers.get('x-request-id')
                }
            };

        } catch (error) {
            console.error('Color analysis failed:', error);

            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error),
                    timestamp: new Date().toISOString(),
                    details: error.originalError?.message
                }
            };
        }
    }

    /**
     * Get color suggestions
     */
    async getColors(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const endpoint = `/colors${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await this.request(endpoint);

            return {
                success: true,
                data: response.data,
                pagination: response.data.pagination,
                meta: {
                    total: response.data.total,
                    page: response.data.page,
                    limit: response.data.limit
                }
            };

        } catch (error) {
            console.error('Failed to fetch colors:', error);

            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error),
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Get color combinations
     */
    async getCombinations(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const endpoint = `/combinations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await this.request(endpoint);

            return {
                success: true,
                data: response.data,
                pagination: response.data.pagination,
                meta: {
                    total: response.data.total,
                    page: response.data.page,
                    limit: response.data.limit
                }
            };

        } catch (error) {
            console.error('Failed to fetch combinations:', error);

            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error),
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Find similar colors
     */
    async findSimilarColors(color, options = {}) {
        try {
            if (!color || !this.isValidHexColor(color)) {
                throw new Error('Valid hex color is required');
            }

            const requestData = {
                color,
                limit: options.limit || 10,
                threshold: options.threshold || 20
            };

            const response = await this.request('/colors/similar', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            return {
                success: true,
                data: response.data,
                meta: {
                    searchColor: color,
                    threshold: requestData.threshold,
                    resultsCount: response.data.colors?.length || 0
                }
            };

        } catch (error) {
            console.error('Failed to find similar colors:', error);

            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error),
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Get API documentation
     */
    async getApiDocs() {
        try {
            const response = await this.request('/docs');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error)
                }
            };
        }
    }

    /**
     * Sync data sources
     */
    async syncData(source = 'all', force = false) {
        try {
            const requestData = { source, force };

            const response = await this.request('/sync', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Data sync failed:', error);

            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error),
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Get cache status
     */
    async getCacheStatus() {
        try {
            const response = await this.request('/cache/status');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error)
                }
            };
        }
    }

    /**
     * Clear cache
     */
    async clearCache() {
        try {
            const response = await this.request('/cache', {
                method: 'DELETE'
            });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Failed to clear cache:', error);

            return {
                success: false,
                error: {
                    message: this.getErrorMessage(error),
                    type: this.getErrorType(error)
                }
            };
        }
    }

    /**
     * Validate color analysis data
     */
    validateColorAnalysisData(data) {
        const errors = [];

        // Required field validation
        if (!data.roomType || typeof data.roomType !== 'string') {
            errors.push('Room type is required and must be a string');
        }

        // Valid room types
        const validRoomTypes = [
            'child_bedroom', 'living_room', 'bedroom', 'study',
            'dining_room', 'bathroom', 'playroom'
        ];

        if (data.roomType && !validRoomTypes.includes(data.roomType)) {
            errors.push(`Invalid room type. Must be one of: ${validRoomTypes.join(', ')}`);
        }

        // Age group validation for child rooms
        const childRooms = ['child_bedroom', 'playroom'];
        if (childRooms.includes(data.roomType) && !data.ageGroup) {
            errors.push('Age group is required for children\'s rooms');
        }

        // Valid age groups
        const validAgeGroups = ['0-3', '4-6', '7-12', '13-18', 'adult', 'elderly'];
        if (data.ageGroup && !validAgeGroups.includes(data.ageGroup)) {
            errors.push(`Invalid age group. Must be one of: ${validAgeGroups.join(', ')}`);
        }

        // Color validation
        const colorFields = ['wall', 'floor', 'furniture', 'accent'];
        colorFields.forEach(field => {
            if (data[field] && !this.isValidHexColor(data[field])) {
                errors.push(`Invalid ${field} color format. Must be a valid hex color (e.g., #FF0000)`);
            }
        });

        if (errors.length > 0) {
            const error = new Error(`Validation failed: ${errors.join(', ')}`);
            error.name = 'ValidationError';
            error.errors = errors;
            throw error;
        }
    }

    /**
     * Validate hex color format
     */
    isValidHexColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        if (error.name === 'ValidationError') {
            return `Please check your input: ${error.errors?.join(', ') || error.message}`;
        }

        if (error.message.includes('Request timeout')) {
            return 'The request took too long to complete. Please try again.';
        }

        if (error.message.includes('Request cancelled')) {
            return 'Request was cancelled.';
        }

        if (error.message.includes('HTTP 429')) {
            return 'Too many requests. Please wait a moment and try again.';
        }

        if (error.message.includes('HTTP 500')) {
            return 'Server error occurred. Please try again later.';
        }

        if (error.message.includes('HTTP 503')) {
            return 'Service temporarily unavailable. Please try again later.';
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return 'Network connection error. Please check your internet connection.';
        }

        return error.message || 'An unexpected error occurred. Please try again.';
    }

    /**
     * Get error type for categorization
     */
    getErrorType(error) {
        if (error.name === 'ValidationError') {
            return 'validation';
        }

        if (error.message.includes('Request timeout')) {
            return 'timeout';
        }

        if (error.message.includes('Request cancelled')) {
            return 'cancelled';
        }

        if (error.message.includes('HTTP 429')) {
            return 'rate_limit';
        }

        if (error.message.includes('HTTP 5')) {
            return 'server_error';
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return 'network_error';
        }

        return 'unknown';
    }

    /**
     * Test API connectivity with comprehensive checks
     */
    async testConnection() {
        const tests = [];

        // Test 1: Health check
        const healthResult = await this.healthCheck();
        tests.push({
            name: 'Health Check',
            success: healthResult.success,
            message: healthResult.success ? 'API is responding' : healthResult.error,
            duration: null
        });

        if (!healthResult.success) {
            return {
                success: false,
                tests,
                message: 'API health check failed'
            };
        }

        // Test 2: Colors endpoint
        const colorsStart = Date.now();
        const colorsResult = await this.getColors({ limit: 5 });
        tests.push({
            name: 'Colors Endpoint',
            success: colorsResult.success,
            message: colorsResult.success ?
                `Retrieved ${colorsResult.data?.colors?.length || 0} colors` :
                colorsResult.error.message,
            duration: Date.now() - colorsStart
        });

        // Test 3: Combinations endpoint
        const combStart = Date.now();
        const combResult = await this.getCombinations({ limit: 3 });
        tests.push({
            name: 'Combinations Endpoint',
            success: combResult.success,
            message: combResult.success ?
                `Retrieved ${combResult.data?.combinations?.length || 0} combinations` :
                combResult.error.message,
            duration: Date.now() - combStart
        });

        const successCount = tests.filter(test => test.success).length;
        const totalTests = tests.length;

        return {
            success: successCount === totalTests,
            tests,
            summary: `${successCount}/${totalTests} tests passed`,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Set base URL for API requests
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        console.log('API base URL updated to:', this.baseUrl);
    }

    /**
     * Set request timeout
     */
    setTimeout(timeout) {
        this.requestTimeout = timeout;
        console.log('Request timeout set to:', timeout, 'ms');
    }

    /**
     * Set retry configuration
     */
    setRetryConfig(attempts, delay) {
        this.retryAttempts = attempts;
        this.retryDelay = delay;
        console.log('Retry config updated:', { attempts, delay });
    }

    /**
     * Destroy the API client instance
     */
    destroy() {
        this.cancelRequests();
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        console.log('ApiClient destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}

// Global availability
window.ApiClient = ApiClient;