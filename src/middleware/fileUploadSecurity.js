/**
 * Secure File Upload Validation Middleware
 * Protects against malicious file uploads and ensures file safety
 */

import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

/**
 * File upload security configuration
 */
const UPLOAD_CONFIG = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  maxFiles: 5,
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  forbiddenFilenames: [
    '.htaccess',
    '.htpasswd',
    'web.config',
    '.env',
    '.git',
    'config.php',
    'wp-config.php'
  ],
  forbiddenExtensions: [
    '.exe', '.bat', '.cmd', '.sh', '.bash',
    '.php', '.jsp', '.asp', '.aspx',
    '.js', '.jar', '.py', '.rb',
    '.dll', '.so', '.dylib'
  ],
  maxFilenameLength: 255,
  scanForMalware: true,
  enforceImageDimensions: true,
  maxImageWidth: 4096,
  maxImageHeight: 4096,
  minImageWidth: 10,
  minImageHeight: 10
};

/**
 * Sanitize filename to prevent directory traversal and other attacks
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename) {
    return 'unnamed_file';
  }

  // Remove path separators and null bytes
  let sanitized = filename.replace(/[\/\\:\0]/g, '_');

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  if (sanitized.length > UPLOAD_CONFIG.maxFilenameLength) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, UPLOAD_CONFIG.maxFilenameLength - ext.length) + ext;
  }

  // If filename is empty after sanitization, generate a random one
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'file_' + crypto.randomBytes(8).toString('hex');
  }

  return sanitized;
}

/**
 * Generate a unique secure filename
 * @param {string} originalFilename - Original filename
 * @returns {string} - Unique secure filename
 */
export function generateSecureFilename(originalFilename) {
  const ext = path.extname(originalFilename).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return `${timestamp}_${random}${ext}`;
}

/**
 * Validate file extension
 * @param {string} filename - Filename to validate
 * @returns {Object} - Validation result
 */
function validateExtension(filename) {
  const ext = path.extname(filename).toLowerCase();

  // Check if extension is forbidden
  if (UPLOAD_CONFIG.forbiddenExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' is not allowed for security reasons`
    };
  }

  // Check if extension is allowed
  if (!UPLOAD_CONFIG.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' is not allowed. Allowed: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validate filename for security issues
 * @param {string} filename - Filename to validate
 * @returns {Object} - Validation result
 */
function validateFilename(filename) {
  // Check for forbidden filenames
  const lowerFilename = filename.toLowerCase();
  for (const forbidden of UPLOAD_CONFIG.forbiddenFilenames) {
    if (lowerFilename === forbidden.toLowerCase() || lowerFilename.includes(forbidden.toLowerCase())) {
      return {
        valid: false,
        error: 'Filename is not allowed for security reasons'
      };
    }
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return {
      valid: false,
      error: 'Filename contains invalid characters'
    };
  }

  // Check for directory traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return {
      valid: false,
      error: 'Filename contains path traversal characters'
    };
  }

  // Check length
  if (filename.length > UPLOAD_CONFIG.maxFilenameLength) {
    return {
      valid: false,
      error: `Filename too long. Maximum ${UPLOAD_CONFIG.maxFilenameLength} characters`
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type against file content
 * @param {Buffer} buffer - File buffer
 * @param {string} declaredMimeType - MIME type from upload
 * @returns {Promise<Object>} - Validation result
 */
async function validateMimeType(buffer, declaredMimeType) {
  try {
    // Detect actual file type from buffer
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      return {
        valid: false,
        error: 'Unable to determine file type'
      };
    }

    // Check if detected MIME type is allowed
    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(detectedType.mime)) {
      return {
        valid: false,
        error: `File type '${detectedType.mime}' is not allowed. Allowed: ${UPLOAD_CONFIG.allowedMimeTypes.join(', ')}`
      };
    }

    // Verify declared MIME type matches detected type (prevent MIME type spoofing)
    if (declaredMimeType && declaredMimeType !== detectedType.mime) {
      return {
        valid: false,
        error: 'File type mismatch. Declared type does not match actual file content',
        details: {
          declared: declaredMimeType,
          detected: detectedType.mime
        }
      };
    }

    return {
      valid: true,
      detectedType: detectedType.mime,
      detectedExt: detectedType.ext
    };
  } catch (error) {
    console.error('MIME type validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate file type'
    };
  }
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {Object} - Validation result
 */
function validateFileSize(size) {
  if (size > UPLOAD_CONFIG.maxFileSize) {
    const maxSizeMB = (UPLOAD_CONFIG.maxFileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    };
  }

  return { valid: true };
}

/**
 * Scan file for malicious content
 * Basic checks for embedded scripts and suspicious patterns
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Object} - Scan result
 */
function scanForMaliciousContent(buffer, mimeType) {
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000)); // Check first 10KB

  // Patterns to detect potential malicious content
  const maliciousPatterns = [
    /<script[^>]*>.*?<\/script>/is,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /document\.write/i,
    /window\.location/i,
    /<\?php/i,
    /<%.*?%>/s
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      return {
        safe: false,
        threat: 'Potential malicious content detected in file'
      };
    }
  }

  // Additional check for SVG files (can contain scripts)
  if (mimeType === 'image/svg+xml') {
    if (/<script/i.test(content) || /javascript:/i.test(content)) {
      return {
        safe: false,
        threat: 'SVG file contains potentially malicious script content'
      };
    }
  }

  return { safe: true };
}

/**
 * Comprehensive file validation middleware
 * @param {Object} options - Validation options
 */
export function validateFileUpload(options = {}) {
  const config = { ...UPLOAD_CONFIG, ...options };

  return async (req, res, next) => {
    try {
      // Check if files are present
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'NO_FILES_UPLOADED',
          message: 'No files were uploaded'
        });
      }

      // Get files array
      const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];

      // Check number of files
      if (files.length > config.maxFiles) {
        return res.status(400).json({
          success: false,
          error: 'TOO_MANY_FILES',
          message: `Maximum ${config.maxFiles} files allowed`
        });
      }

      // Validate each file
      const validatedFiles = [];
      for (const file of files) {
        // Validate file size
        const sizeValidation = validateFileSize(file.size);
        if (!sizeValidation.valid) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_FILE_SIZE',
            message: sizeValidation.error,
            file: file.name
          });
        }

        // Sanitize and validate filename
        const sanitizedFilename = sanitizeFilename(file.name);
        const filenameValidation = validateFilename(sanitizedFilename);
        if (!filenameValidation.valid) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_FILENAME',
            message: filenameValidation.error,
            file: file.name
          });
        }

        // Validate extension
        const extValidation = validateExtension(sanitizedFilename);
        if (!extValidation.valid) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_FILE_EXTENSION',
            message: extValidation.error,
            file: file.name
          });
        }

        // Validate MIME type
        const mimeValidation = await validateMimeType(file.data, file.mimetype);
        if (!mimeValidation.valid) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_FILE_TYPE',
            message: mimeValidation.error,
            file: file.name,
            details: mimeValidation.details
          });
        }

        // Scan for malicious content
        if (config.scanForMalware) {
          const scanResult = scanForMaliciousContent(file.data, mimeValidation.detectedType);
          if (!scanResult.safe) {
            return res.status(400).json({
              success: false,
              error: 'MALICIOUS_FILE_DETECTED',
              message: scanResult.threat,
              file: file.name
            });
          }
        }

        // Generate secure filename
        const secureFilename = generateSecureFilename(sanitizedFilename);

        validatedFiles.push({
          originalName: file.name,
          sanitizedName: sanitizedFilename,
          secureFilename: secureFilename,
          size: file.size,
          mimeType: mimeValidation.detectedType,
          extension: mimeValidation.detectedExt,
          data: file.data
        });
      }

      // Attach validated files to request
      req.validatedFiles = validatedFiles;

      next();
    } catch (error) {
      console.error('File upload validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'FILE_VALIDATION_ERROR',
        message: 'Failed to validate uploaded files'
      });
    }
  };
}

/**
 * Middleware to enforce file upload limits
 */
export function enforceUploadLimits(req, res, next) {
  const contentLength = parseInt(req.headers['content-length']);

  if (contentLength > UPLOAD_CONFIG.maxFileSize * UPLOAD_CONFIG.maxFiles) {
    return res.status(413).json({
      success: false,
      error: 'PAYLOAD_TOO_LARGE',
      message: 'Total upload size exceeds maximum allowed size'
    });
  }

  next();
}

export default {
  validateFileUpload,
  sanitizeFilename,
  generateSecureFilename,
  enforceUploadLimits,
  UPLOAD_CONFIG
};
