/**
 * Input validation utilities for the Sanzo Color Advisor API
 */

/**
 * Validate color input (hex format)
 */
function validateColorInput(color) {
    if (!color || typeof color !== 'string') {
        return false;
    }

    // Remove whitespace
    const trimmed = color.trim();

    // Check hex format with or without #
    const hexPattern = /^#?[0-9A-Fa-f]{6}$/;
    const shortHexPattern = /^#?[0-9A-Fa-f]{3}$/;

    return hexPattern.test(trimmed) || shortHexPattern.test(trimmed);
}

/**
 * Validate room type
 */
function validateRoomType(roomType) {
    const validRoomTypes = [
        'child_bedroom',
        'living_room',
        'bedroom',
        'study',
        'dining_room',
        'bathroom',
        'playroom'
    ];

    return validRoomTypes.includes(roomType);
}

/**
 * Validate age group
 */
function validateAgeGroup(ageGroup) {
    const validAgeGroups = [
        '0-3',
        '4-6',
        '7-12',
        '13-18',
        'adult',
        'elderly'
    ];

    return validAgeGroups.includes(ageGroup);
}

/**
 * Validate pagination parameters
 */
function validatePagination(page, limit, maxLimit = 100) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
        return { valid: false, error: 'Page must be a positive integer' };
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit) {
        return { valid: false, error: `Limit must be between 1 and ${maxLimit}` };
    }

    return { valid: true, page: pageNum, limit: limitNum };
}

/**
 * Validate numeric range
 */
function validateRange(value, min, max) {
    const num = parseFloat(value);

    if (isNaN(num)) {
        return { valid: false, error: 'Value must be a number' };
    }

    if (num < min || num > max) {
        return { valid: false, error: `Value must be between ${min} and ${max}` };
    }

    return { valid: true, value: num };
}

module.exports = {
    validateColorInput,
    validateRoomType,
    validateAgeGroup,
    validatePagination,
    validateRange
};