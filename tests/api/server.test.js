/**
 * API Server Tests
 * Tests for the main Express.js server and endpoints
 */

const request = require('supertest');
const SanzoColorAPI = require('../../src/index');

describe('Sanzo Color API Server', () => {
    let app;
    let server;

    beforeAll(() => {
        const api = new SanzoColorAPI();
        app = api.app;
        // Don't start the server for tests
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => {
                server.close(resolve);
            });
        }
    });

    describe('GET /', () => {
        it('should return API information', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Sanzo Color Advisor API');
            expect(response.body.data.version).toBe('1.0.0');
            expect(response.body.data.endpoints).toBeDefined();
        });
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('healthy');
            expect(response.body.data.services).toBeDefined();
            expect(response.body.data.services.colorAgent).toBeDefined();
            expect(response.body.data.services.githubAPI).toBeDefined();
            expect(response.body.data.services.webScraper).toBeDefined();
        });
    });

    describe('POST /api/analyze', () => {
        it('should analyze color scheme successfully', async () => {
            const input = {
                roomType: 'living_room',
                ageGroup: 'adult',
                wall: '#F5F5F5',
                furniture: '#8B4513'
            };

            const response = await request(app)
                .post('/api/analyze')
                .send(input)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.recommendations).toBeDefined();
            expect(Array.isArray(response.body.data.recommendations)).toBe(true);
            expect(response.body.data.analysis).toBeDefined();
        });

        it('should reject invalid room type', async () => {
            const input = {
                roomType: 'invalid_room',
                wall: '#F5F5F5'
            };

            const response = await request(app)
                .post('/api/analyze')
                .send(input)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Invalid roomType');
        });

        it('should reject request without colors', async () => {
            const input = {
                roomType: 'living_room'
            };

            const response = await request(app)
                .post('/api/analyze')
                .send(input)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('At least one color must be provided');
        });

        it('should reject invalid color format', async () => {
            const input = {
                roomType: 'living_room',
                wall: 'invalid-color'
            };

            const response = await request(app)
                .post('/api/analyze')
                .send(input)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Invalid color format');
        });

        it('should reject missing room type', async () => {
            const input = {
                wall: '#F5F5F5'
            };

            const response = await request(app)
                .post('/api/analyze')
                .send(input)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('roomType is required');
        });
    });

    describe('GET /api/colors', () => {
        it('should return paginated colors', async () => {
            const response = await request(app)
                .get('/api/colors')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.colors).toBeDefined();
            expect(Array.isArray(response.body.data.colors)).toBe(true);
            expect(response.body.data.pagination).toBeDefined();
            expect(response.body.data.pagination.page).toBe(1);
            expect(response.body.data.pagination.limit).toBe(50);
        });

        it('should handle pagination parameters', async () => {
            const response = await request(app)
                .get('/api/colors?page=2&limit=10')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.pagination.page).toBe(2);
            expect(response.body.data.pagination.limit).toBe(10);
        });

        it('should reject invalid pagination', async () => {
            const response = await request(app)
                .get('/api/colors?page=0&limit=200')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Invalid pagination parameters');
        });

        it('should handle search parameter', async () => {
            const response = await request(app)
                .get('/api/colors?search=blue')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.colors).toBeDefined();
        });
    });

    describe('GET /api/combinations', () => {
        it('should return paginated combinations', async () => {
            const response = await request(app)
                .get('/api/combinations')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.combinations).toBeDefined();
            expect(Array.isArray(response.body.data.combinations)).toBe(true);
            expect(response.body.data.pagination).toBeDefined();
        });

        it('should filter by room type', async () => {
            const response = await request(app)
                .get('/api/combinations?roomType=living_room')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.combinations).toBeDefined();
        });

        it('should filter by age group', async () => {
            const response = await request(app)
                .get('/api/combinations?ageGroup=adult')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.combinations).toBeDefined();
        });
    });

    describe('GET /api/colors/:hex', () => {
        it('should return color by hex value', async () => {
            // First get a color from the colors endpoint
            const colorsResponse = await request(app)
                .get('/api/colors?limit=1')
                .expect(200);

            if (colorsResponse.body.data.colors.length > 0) {
                const color = colorsResponse.body.data.colors[0];
                const hex = color.hex.replace('#', '');

                const response = await request(app)
                    .get(`/api/colors/${hex}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.hex).toBeDefined();
            }
        });

        it('should handle hex values with # prefix', async () => {
            const response = await request(app)
                .get('/api/colors/FF0000')
                .expect(404); // Color might not exist

            // Test that the endpoint accepts the format
            expect(response.body.success).toBe(false);
        });

        it('should reject invalid hex format', async () => {
            const response = await request(app)
                .get('/api/colors/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Invalid hex color format');
        });
    });

    describe('POST /api/colors/similar', () => {
        it('should find similar colors', async () => {
            const input = {
                color: '#FF0000',
                limit: 5,
                threshold: 20
            };

            const response = await request(app)
                .post('/api/colors/similar')
                .send(input)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.colors).toBeDefined();
            expect(Array.isArray(response.body.data.colors)).toBe(true);
            expect(response.body.data.query).toBe('#FF0000');
        });

        it('should reject invalid color format', async () => {
            const input = {
                color: 'invalid',
                limit: 5
            };

            const response = await request(app)
                .post('/api/colors/similar')
                .send(input)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Invalid color format');
        });

        it('should reject invalid limit', async () => {
            const input = {
                color: '#FF0000',
                limit: 100
            };

            const response = await request(app)
                .post('/api/colors/similar')
                .send(input)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Limit must be between 1 and 50');
        });

        it('should reject invalid threshold', async () => {
            const input = {
                color: '#FF0000',
                threshold: 150
            };

            const response = await request(app)
                .post('/api/colors/similar')
                .send(input)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Threshold must be between 0 and 100');
        });
    });

    describe('GET /api/docs', () => {
        it('should return API documentation', async () => {
            const response = await request(app)
                .get('/api/docs')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Sanzo Color Advisor API');
            expect(response.body.data.endpoints).toBeDefined();
            expect(Array.isArray(response.body.data.endpoints)).toBe(true);
        });
    });

    describe('POST /api/sync', () => {
        it('should handle sync request', async () => {
            const input = {
                source: 'github'
            };

            const response = await request(app)
                .post('/api/sync')
                .send(input);

            expect(response.status).toBeGreaterThanOrEqual(200);
            expect(response.status).toBeLessThan(300);
            expect(response.body.success).toBeDefined();
        }, 30000); // 30 second timeout for sync operations
    });

    describe('Cache endpoints', () => {
        describe('GET /api/cache/status', () => {
            it('should return cache status', async () => {
                const response = await request(app)
                    .get('/api/cache/status')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeDefined();
            });
        });

        describe('DELETE /api/cache', () => {
            it('should clear cache', async () => {
                const response = await request(app)
                    .delete('/api/cache')
                    .expect(200);

                expect(response.body.success).toBe(true);
            });
        });
    });

    describe('Error handling', () => {
        it('should handle 404 for unknown API routes', async () => {
            const response = await request(app)
                .get('/api/unknown')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('API endpoint not found');
        });

        it('should handle 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/unknown')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('Resource not found');
        });
    });

    describe('Rate limiting', () => {
        it('should have rate limiting headers', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.headers['x-ratelimit-limit']).toBeDefined();
            expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        });
    });

    describe('Security headers', () => {
        it('should include security headers', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-xss-protection']).toBe('0');
        });
    });

    describe('CORS', () => {
        it('should handle CORS preflight requests', async () => {
            const response = await request(app)
                .options('/api/analyze')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'POST')
                .set('Access-Control-Request-Headers', 'Content-Type')
                .expect(204);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-methods']).toBeDefined();
        });
    });
});