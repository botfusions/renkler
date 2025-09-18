/**
 * Response formatting utilities for the Sanzo Color Advisor API
 */

/**
 * Format successful response
 */
function formatResponse(data, message = 'Success', metadata = {}) {
    return {
        success: true,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        ...metadata
    };
}

/**
 * Format error response
 */
function formatError(message, status = 500, details = null) {
    const error = {
        success: false,
        error: {
            message: message,
            status: status,
            timestamp: new Date().toISOString()
        }
    };

    if (details) {
        error.error.details = details;
    }

    return error;
}

/**
 * Format validation error response
 */
function formatValidationError(errors) {
    return {
        success: false,
        error: {
            message: 'Validation failed',
            status: 400,
            timestamp: new Date().toISOString(),
            validation_errors: Array.isArray(errors) ? errors : [errors]
        }
    };
}

/**
 * Format paginated response
 */
function formatPaginatedResponse(data, pagination, message = 'Success') {
    return {
        success: true,
        message: message,
        data: data,
        pagination: pagination,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    formatResponse,
    formatError,
    formatValidationError,
    formatPaginatedResponse
};