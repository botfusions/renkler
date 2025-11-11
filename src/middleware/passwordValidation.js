/**
 * Password Validation Middleware
 * Enforces strong password requirements for user security
 */

/**
 * Password strength requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minUniqueChars: 5,
  preventCommonPasswords: true,
  preventUserInfo: true
};

/**
 * Common passwords to prevent (top 100 most common passwords)
 * In production, this should be a much larger list or use a library like 'pwned-passwords'
 */
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', '12345678', '12345', 'qwerty',
  'abc123', 'password1', '1234567', 'welcome', 'monkey', '1234567890',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master',
  'sunshine', 'ashley', 'bailey', 'shadow', 'superman', 'qazwsx',
  '123123', 'mustang', 'password123', 'charlie', 'admin', 'welcome123'
];

/**
 * Password entropy calculation
 * @param {string} password - Password to calculate entropy for
 * @returns {number} - Entropy score
 */
function calculatePasswordEntropy(password) {
  const charsetSize = {
    lowercase: /[a-z]/.test(password) ? 26 : 0,
    uppercase: /[A-Z]/.test(password) ? 26 : 0,
    numbers: /[0-9]/.test(password) ? 10 : 0,
    special: /[^a-zA-Z0-9]/.test(password) ? 32 : 0
  };

  const totalCharset = Object.values(charsetSize).reduce((a, b) => a + b, 0);
  return password.length * Math.log2(totalCharset);
}

/**
 * Check if password contains user information
 * @param {string} password - Password to check
 * @param {Object} userInfo - User information object
 * @returns {boolean} - True if password contains user info
 */
function containsUserInfo(password, userInfo = {}) {
  const lowerPassword = password.toLowerCase();

  // Check email username
  if (userInfo.email) {
    const emailUsername = userInfo.email.split('@')[0].toLowerCase();
    if (emailUsername.length > 3 && lowerPassword.includes(emailUsername)) {
      return true;
    }
  }

  // Check name
  if (userInfo.name) {
    const nameParts = userInfo.name.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length > 2 && lowerPassword.includes(part)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} userInfo - Optional user information to check against
 * @returns {Object} - Validation result with success flag and details
 */
export function validatePasswordStrength(password, userInfo = {}) {
  const errors = [];
  const warnings = [];

  // Check if password exists
  if (!password) {
    return {
      success: false,
      errors: ['Password is required'],
      warnings: [],
      strength: 'weak',
      entropy: 0
    };
  }

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  // Check maximum length
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  // Check for unique characters
  const uniqueChars = new Set(password).size;
  if (uniqueChars < PASSWORD_REQUIREMENTS.minUniqueChars) {
    errors.push(`Password must contain at least ${PASSWORD_REQUIREMENTS.minUniqueChars} unique characters`);
  }

  // Check for common passwords
  if (PASSWORD_REQUIREMENTS.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    for (const commonPwd of COMMON_PASSWORDS) {
      if (lowerPassword === commonPwd || lowerPassword.includes(commonPwd)) {
        errors.push('Password is too common. Please choose a more secure password');
        break;
      }
    }
  }

  // Check for sequential characters
  const hasSequential = /(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
  if (hasSequential) {
    warnings.push('Password contains sequential characters');
  }

  // Check for repeated characters
  const hasRepeated = /(.)\1{2,}/.test(password);
  if (hasRepeated) {
    warnings.push('Password contains repeated characters');
  }

  // Check for user information
  if (PASSWORD_REQUIREMENTS.preventUserInfo && containsUserInfo(password, userInfo)) {
    errors.push('Password must not contain personal information');
  }

  // Calculate password entropy
  const entropy = calculatePasswordEntropy(password);

  // Determine password strength
  let strength = 'weak';
  if (entropy >= 80 && errors.length === 0) {
    strength = 'very strong';
  } else if (entropy >= 60 && errors.length === 0) {
    strength = 'strong';
  } else if (entropy >= 40 && errors.length <= 1) {
    strength = 'moderate';
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    strength,
    entropy: Math.round(entropy),
    requirements: PASSWORD_REQUIREMENTS
  };
}

/**
 * Express middleware to validate password on signup/password change
 */
export function passwordValidationMiddleware(req, res, next) {
  const { password, email, name } = req.body;

  if (!password) {
    // If no password in request, skip validation (not a password operation)
    return next();
  }

  const userInfo = { email, name };
  const validation = validatePasswordStrength(password, userInfo);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'WEAK_PASSWORD',
      message: 'Password does not meet security requirements',
      details: {
        errors: validation.errors,
        warnings: validation.warnings,
        requirements: validation.requirements
      }
    });
  }

  // Add warnings to response headers for client information
  if (validation.warnings.length > 0) {
    res.set('X-Password-Warnings', validation.warnings.join('; '));
  }

  // Attach validation result to request for logging
  req.passwordValidation = validation;

  next();
}

/**
 * Check if password has been breached (placeholder for future integration)
 * In production, integrate with Have I Been Pwned API or similar service
 */
export async function checkPasswordBreach(password) {
  // TODO: Implement integration with Have I Been Pwned API
  // For now, return false (not breached)
  return {
    breached: false,
    timesExposed: 0
  };
}

export default {
  validatePasswordStrength,
  passwordValidationMiddleware,
  checkPasswordBreach,
  PASSWORD_REQUIREMENTS
};
