/**
 * Security Tests for Sanzo Color Advisor
 * Tests critical security configurations and protections
 */

const request = require('supertest');
const express = require('express');
const { securityHeaders, sanitizeRequest, ipAuditLog } = require('../src/middleware/security');

describe('Security Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Security Headers', () => {
    it('should add X-Frame-Options header', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should add X-Content-Type-Options header', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should add X-XSS-Protection header', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should add Referrer-Policy header', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should add HSTS header in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.use(securityHeaders);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test');
      expect(response.headers['strict-transport-security']).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Request Sanitization - SQL Injection Protection', () => {
    it('should block SQL injection in query parameters', async () => {
      app.use(sanitizeRequest);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test?id=1 OR 1=1');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('INVALID_REQUEST');
    });

    it('should block UNION SELECT attacks', async () => {
      app.use(sanitizeRequest);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test?query=admin UNION SELECT * FROM users');
      expect(response.status).toBe(400);
    });

    it('should block SQL comments', async () => {
      app.use(sanitizeRequest);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test?name=admin--');
      expect(response.status).toBe(400);
    });

    it('should allow valid query parameters', async () => {
      app.use(sanitizeRequest);
      app.get('/test', (req, res) => res.send('OK'));

      const response = await request(app).get('/test?color=blue&page=1');
      expect(response.status).toBe(200);
    });
  });

  describe('Request Sanitization - XSS Protection', () => {
    it('should block script tags in request body', async () => {
      app.use(sanitizeRequest);
      app.post('/test', (req, res) => res.send('OK'));

      const response = await request(app)
        .post('/test')
        .send({ message: '<script>alert("xss")</script>' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('INVALID_REQUEST');
    });

    it('should block javascript: protocol', async () => {
      app.use(sanitizeRequest);
      app.post('/test', (req, res) => res.send('OK'));

      const response = await request(app)
        .post('/test')
        .send({ url: 'javascript:alert(1)' });

      expect(response.status).toBe(400);
    });

    it('should block event handlers', async () => {
      app.use(sanitizeRequest);
      app.post('/test', (req, res) => res.send('OK'));

      const response = await request(app)
        .post('/test')
        .send({ html: '<img src=x onerror=alert(1)>' });

      expect(response.status).toBe(400);
    });

    it('should allow safe HTML-like content', async () => {
      app.use(sanitizeRequest);
      app.post('/test', (req, res) => res.send('OK'));

      const response = await request(app)
        .post('/test')
        .send({ message: 'Hello <world>' });

      expect(response.status).toBe(200);
    });
  });

  describe('IP Audit Logging', () => {
    it('should attach client IP to request', async () => {
      app.use(ipAuditLog);
      app.get('/test', (req, res) => {
        expect(req.clientIp).toBeDefined();
        res.send('OK');
      });

      await request(app).get('/test');
    });

    it('should detect directory traversal attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      app.use(ipAuditLog);
      app.get('/test', (req, res) => res.send('OK'));

      await request(app).get('/test?file=../../etc/passwd');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SECURITY ALERT')
      );

      consoleSpy.mockRestore();
    });

    it('should handle X-Forwarded-For header', async () => {
      app.use(ipAuditLog);
      app.get('/test', (req, res) => {
        expect(req.clientIp).toBe('1.2.3.4');
        res.send('OK');
      });

      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '1.2.3.4, 5.6.7.8');
    });
  });

  describe('Environment Variable Validation', () => {
    it('should fail without JWT_SECRET in production', () => {
      const originalEnv = { ...process.env };
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;

      const { validateProductionEnv } = require('../src/middleware/security');

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      validateProductionEnv(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockNext).not.toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should pass with all required env vars in production', () => {
      const originalEnv = { ...process.env };
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.ENCRYPTION_KEY = 'b'.repeat(32);
      process.env.REACT_APP_SUPABASE_URL = 'https://example.com';
      process.env.REACT_APP_SUPABASE_ANON_KEY = 'key123';
      process.env.SUPABASE_SERVICE_KEY = 'servicekey';

      const { validateProductionEnv } = require('../src/middleware/security');

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      validateProductionEnv(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should skip validation in development', () => {
      const originalEnv = { ...process.env };
      process.env.NODE_ENV = 'development';

      const { validateProductionEnv } = require('../src/middleware/security');

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      validateProductionEnv(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();

      process.env = originalEnv;
    });
  });

  describe('Authentication Bypass Prevention', () => {
    it('should never bypass auth in production', () => {
      const originalEnv = { ...process.env };
      process.env.NODE_ENV = 'production';
      process.env.BYPASS_AUTH = 'true'; // Even if set to true

      const { devAuthBypass } = require('../src/middleware/auth');

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      devAuthBypass(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });

    it('should allow bypass only in development with flag', () => {
      const originalEnv = { ...process.env };
      process.env.NODE_ENV = 'development';
      process.env.BYPASS_AUTH = 'true';

      const { devAuthBypass } = require('../src/middleware/auth');

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      devAuthBypass(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.role).toBe('admin');
      expect(mockNext).toHaveBeenCalled();

      process.env = originalEnv;
    });
  });
});

describe('Password Security Tests', () => {
  it('should not contain hardcoded passwords in scripts', () => {
    const fs = require('fs');
    const path = require('path');

    const createAdminScript = fs.readFileSync(
      path.join(__dirname, '../scripts/create-admin.js'),
      'utf8'
    );

    // Should not have hardcoded password like "SanzoAdmin2025!"
    expect(createAdminScript).not.toMatch(/const\s+\w*[Pp]assword\s*=\s*['"][^'"]*!['"];/);

    // Should use environment variables
    expect(createAdminScript).toContain('process.env.ADMIN_PASSWORD');
    expect(createAdminScript).toContain('process.env.TEST_PASSWORD');
  });

  it('should require password environment variables', () => {
    const fs = require('fs');
    const path = require('path');

    const createAdminScript = fs.readFileSync(
      path.join(__dirname, '../scripts/create-admin.js'),
      'utf8'
    );

    // Should validate password environment variables
    expect(createAdminScript).toContain('if (!adminPassword || !testPassword)');
    expect(createAdminScript).toContain('process.exit(1)');
  });
});

describe('Environment File Security Tests', () => {
  it('.gitignore should exclude .env files', () => {
    const fs = require('fs');
    const path = require('path');

    const gitignore = fs.readFileSync(
      path.join(__dirname, '../.gitignore'),
      'utf8'
    );

    expect(gitignore).toContain('.env');
    expect(gitignore).toMatch(/\.env\.local/);
  });

  it('.env.example should not contain real secrets', () => {
    const fs = require('fs');
    const path = require('path');

    const envExample = fs.readFileSync(
      path.join(__dirname, '../.env.example'),
      'utf8'
    );

    // Should have placeholders, not real values
    expect(envExample).toContain('your_secure_admin_password_here');
    expect(envExample).toContain('your_secure_test_password_here');
    expect(envExample).not.toContain('SanzoAdmin2025!');
  });
});
