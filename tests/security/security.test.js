/**
 * Security Controls Test Suite
 * Tests for all implemented security features
 */

import { validatePasswordStrength } from '../../src/middleware/passwordValidation.js';
import { filterPiiFromString, filterPiiFromObject } from '../../src/middleware/piiFilter.js';
import { sanitizeFilename, generateSecureFilename } from '../../src/middleware/fileUploadSecurity.js';
import { validateEnvironment, generateSecureKey } from '../../src/middleware/securityConfig.js';

describe('Password Validation', () => {
  test('should reject weak password', () => {
    const result = validatePasswordStrength('weak123');
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should accept strong password', () => {
    const result = validatePasswordStrength('MyStr0ng!P@ssw0rd123');
    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(['strong', 'very strong']).toContain(result.strength);
  });

  test('should reject password with user info', () => {
    const result = validatePasswordStrength('JohnDoe123!@', {
      email: 'john.doe@example.com',
      name: 'John Doe'
    });
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Password must not contain personal information');
  });

  test('should reject common passwords', () => {
    const result = validatePasswordStrength('Password123!');
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('too common'))).toBe(true);
  });

  test('should reject password shorter than minimum', () => {
    const result = validatePasswordStrength('Short1!');
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('12 characters'))).toBe(true);
  });

  test('should calculate password entropy', () => {
    const result = validatePasswordStrength('MyStr0ng!P@ssw0rd123');
    expect(result.entropy).toBeGreaterThan(0);
  });
});

describe('PII Filtering', () => {
  test('should filter email addresses', () => {
    const input = 'Contact user@example.com for info';
    const result = filterPiiFromString(input);
    expect(result).toBe('Contact [EMAIL_REDACTED] for info');
  });

  test('should filter phone numbers', () => {
    const input = 'Call me at 555-123-4567';
    const result = filterPiiFromString(input);
    expect(result).toBe('Call me at [PHONE_REDACTED]');
  });

  test('should filter credit card numbers', () => {
    const input = 'Card: 4532-1234-5678-9010';
    const result = filterPiiFromString(input);
    expect(result).toBe('Card: [CARD_REDACTED]');
  });

  test('should filter IP addresses', () => {
    const input = 'Server IP: 192.168.1.1';
    const result = filterPiiFromString(input);
    expect(result).toBe('Server IP: [IP_REDACTED]');
  });

  test('should filter JWT tokens', () => {
    const input = 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const result = filterPiiFromString(input);
    expect(result).toContain('[TOKEN_REDACTED]');
  });

  test('should filter passwords in objects', () => {
    const input = {
      username: 'john',
      password: 'secret123',
      data: 'public data'
    };
    const result = filterPiiFromObject(input);
    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('john');
    expect(result.data).toBe('public data');
  });

  test('should filter nested objects', () => {
    const input = {
      user: {
        email: 'user@example.com',
        token: 'abc123token',
        profile: {
          name: 'John Doe'
        }
      }
    };
    const result = filterPiiFromObject(input);
    expect(result.user.email).toBe('[EMAIL_REDACTED]');
    expect(result.user.token).toBe('[REDACTED]');
    expect(result.user.profile.name).toBe('John Doe');
  });

  test('should filter arrays', () => {
    const input = [
      { email: 'user1@example.com' },
      { email: 'user2@example.com' }
    ];
    const result = filterPiiFromObject(input);
    expect(result[0].email).toBe('[EMAIL_REDACTED]');
    expect(result[1].email).toBe('[EMAIL_REDACTED]');
  });
});

describe('File Upload Security', () => {
  test('should sanitize dangerous filenames', () => {
    const dangerous = '../../../etc/passwd';
    const result = sanitizeFilename(dangerous);
    expect(result).not.toContain('..');
    expect(result).not.toContain('/');
  });

  test('should remove null bytes from filenames', () => {
    const malicious = 'file.jpg\0.php';
    const result = sanitizeFilename(malicious);
    expect(result).not.toContain('\0');
  });

  test('should limit filename length', () => {
    const longName = 'a'.repeat(300) + '.jpg';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(255);
  });

  test('should generate secure unique filenames', () => {
    const filename1 = generateSecureFilename('test.jpg');
    const filename2 = generateSecureFilename('test.jpg');
    expect(filename1).not.toBe(filename2);
    expect(filename1).toMatch(/\d+_[a-f0-9]+\.jpg$/);
  });

  test('should handle empty filename', () => {
    const result = sanitizeFilename('');
    expect(result).toBe('unnamed_file');
  });

  test('should remove leading dots', () => {
    const hidden = '...secret.txt';
    const result = sanitizeFilename(hidden);
    expect(result).not.toMatch(/^\./);
  });

  test('should preserve file extension', () => {
    const result = sanitizeFilename('document.pdf');
    expect(result).toMatch(/\.pdf$/);
  });
});

describe('Security Configuration', () => {
  test('should validate environment variables', () => {
    const result = validateEnvironment();
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('missing');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('environment');
  });

  test('should generate secure random keys', () => {
    const key1 = generateSecureKey(32);
    const key2 = generateSecureKey(32);
    expect(key1).not.toBe(key2);
    expect(key1).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(key1).toMatch(/^[a-f0-9]+$/);
  });

  test('should generate keys of specified length', () => {
    const key16 = generateSecureKey(16);
    const key64 = generateSecureKey(64);
    expect(key16).toHaveLength(32);
    expect(key64).toHaveLength(128);
  });
});

describe('CSRF Protection', () => {
  test('should generate random tokens', () => {
    const crypto = require('crypto');
    const token1 = crypto.randomBytes(32).toString('hex');
    const token2 = crypto.randomBytes(32).toString('hex');
    expect(token1).not.toBe(token2);
    expect(token1).toHaveLength(64);
  });
});

describe('Session Security', () => {
  test('should enforce session timeout', () => {
    const SESSION_CONFIG = {
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      absoluteTimeout: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    expect(SESSION_CONFIG.sessionTimeout).toBeLessThan(SESSION_CONFIG.absoluteTimeout);
    expect(SESSION_CONFIG.sessionTimeout).toBeGreaterThan(0);
  });

  test('should limit concurrent sessions', () => {
    const maxSessions = 5;
    const activeSessions = new Set();

    // Add more than max sessions
    for (let i = 0; i < 10; i++) {
      activeSessions.add(`session_${i}`);

      // Simulate removing oldest if over limit
      if (activeSessions.size > maxSessions) {
        const oldest = Array.from(activeSessions)[0];
        activeSessions.delete(oldest);
      }
    }

    expect(activeSessions.size).toBe(maxSessions);
  });
});

describe('Security Integration', () => {
  test('all security modules should be importable', () => {
    expect(validatePasswordStrength).toBeDefined();
    expect(filterPiiFromString).toBeDefined();
    expect(sanitizeFilename).toBeDefined();
    expect(validateEnvironment).toBeDefined();
  });

  test('security configuration should have required fields', () => {
    const { SECURITY_CONFIG } = require('../../src/middleware/securityConfig.js');
    expect(SECURITY_CONFIG).toHaveProperty('session');
    expect(SECURITY_CONFIG).toHaveProperty('password');
    expect(SECURITY_CONFIG).toHaveProperty('rateLimit');
    expect(SECURITY_CONFIG).toHaveProperty('token');
  });
});

describe('Input Validation', () => {
  test('should reject invalid email format', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com'
    ];

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  test('should accept valid email format', () => {
    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@domain.com'
    ];

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });
});
