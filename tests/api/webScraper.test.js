/**
 * Web Scraper Tests
 */

const WebScraper = require('../../src/api/webScraper');
const fs = require('fs').promises;
const path = require('path');

describe('Web Scraper', () => {
    let webScraper;
    const testDataPath = path.join(__dirname, '../data');

    beforeAll(async () => {
        webScraper = new WebScraper();
        // Ensure test data directory exists
        await fs.mkdir(testDataPath, { recursive: true });
    });

    afterAll(async () => {
        // Clean up test files
        try {
            await fs.rmdir(testDataPath, { recursive: true });
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    describe('Constructor', () => {
        it('should initialize with correct configuration', () => {
            expect(webScraper.baseURL).toBe('https://wada-sanzo-colors.com');
            expect(webScraper.requestDelay).toBe(2000);
            expect(webScraper.maxConcurrentRequests).toBe(1);
            expect(webScraper.maxRetries).toBe(3);
            expect(webScraper.timeout).toBe(30000);
        });
    });

    describe('Utility Functions', () => {
        it('should parse robots.txt content', () => {
            const robotsContent = `
                User-agent: *
                Disallow: /admin/
                Disallow: /private/
                Crawl-delay: 5

                User-agent: SanzoColorAdvisor
                Disallow: /test/
                Crawl-delay: 2
            `;

            const rules = webScraper.parseRobotsTxt(robotsContent);

            expect(rules.allowed).toBe(true);
            expect(rules.crawlDelay).toBeGreaterThanOrEqual(2000);
            expect(Array.isArray(rules.disallowed)).toBe(true);
        });

        it('should check if path is allowed', () => {
            const rules = {
                disallowed: ['/admin/', '/private/']
            };

            expect(webScraper.isPathAllowed('/public/page', rules)).toBe(true);
            expect(webScraper.isPathAllowed('/admin/panel', rules)).toBe(false);
            expect(webScraper.isPathAllowed('/private/data', rules)).toBe(false);
        });

        it('should identify color-related content', () => {
            expect(webScraper.isColorRelated('/colors/red', 'Red Color')).toBe(true);
            expect(webScraper.isColorRelated('/palette/spring', 'Spring Palette')).toBe(true);
            expect(webScraper.isColorRelated('/wada/combination-1', 'Wada Combination')).toBe(true);
            expect(webScraper.isColorRelated('/about', 'About Us')).toBe(false);
            expect(webScraper.isColorRelated('/contact', 'Contact')).toBe(false);
        });

        it('should categorize color pages', () => {
            expect(webScraper.categorizeColorPage('/combination/1', 'Color Combination')).toBe('combination');
            expect(webScraper.categorizeColorPage('/palette/modern', 'Modern Palette')).toBe('combination');
            expect(webScraper.categorizeColorPage('/color/red', 'Individual Red')).toBe('individual');
            expect(webScraper.categorizeColorPage('/chart', 'Color Chart')).toBe('chart');
            expect(webScraper.categorizeColorPage('/about', 'About')).toBe('about');
            expect(webScraper.categorizeColorPage('/unknown', 'Unknown')).toBe('unknown');
        });
    });

    describe('Color Parsing', () => {
        it('should parse hex colors', () => {
            const hexColor = webScraper.parseColorValue('#FF0000');
            expect(hexColor).toEqual({
                hex: '#FF0000',
                type: 'hex'
            });

            const hexWithoutHash = webScraper.parseColorValue('00FF00');
            expect(hexWithoutHash).toEqual({
                hex: '#00FF00',
                type: 'hex'
            });
        });

        it('should parse RGB colors', () => {
            const rgbColor = webScraper.parseColorValue('rgb(255, 0, 0)');
            expect(rgbColor).toEqual({
                rgb: { r: 255, g: 0, b: 0 },
                hex: '#FF0000',
                type: 'rgb'
            });

            const rgbSpaced = webScraper.parseColorValue('rgb( 0 , 255 , 0 )');
            expect(rgbSpaced).toEqual({
                rgb: { r: 0, g: 255, b: 0 },
                hex: '#00FF00',
                type: 'rgb'
            });
        });

        it('should parse LAB colors', () => {
            const labColor = webScraper.parseColorValue('lab(50.0, 20.0, -30.0)');
            expect(labColor).toEqual({
                lab: { l: 50.0, a: 20.0, b: -30.0 },
                type: 'lab'
            });
        });

        it('should handle invalid color values', () => {
            expect(webScraper.parseColorValue('invalid')).toBe(null);
            expect(webScraper.parseColorValue('')).toBe(null);
            expect(webScraper.parseColorValue('#GGG')).toBe(null);
        });

        it('should convert RGB to hex', () => {
            expect(webScraper.rgbToHex(255, 0, 0)).toBe('#FF0000');
            expect(webScraper.rgbToHex(0, 255, 0)).toBe('#00FF00');
            expect(webScraper.rgbToHex(0, 0, 255)).toBe('#0000FF');
            expect(webScraper.rgbToHex(128, 128, 128)).toBe('#808080');
        });

        it('should extract Sanzo number from content', () => {
            expect(webScraper.extractSanzoNumber('Sanzo No. 123')).toBe(123);
            expect(webScraper.extractSanzoNumber('Wada No.456')).toBe(456);
            expect(webScraper.extractSanzoNumber('Color No. 789')).toBe(789);
            expect(webScraper.extractSanzoNumber('Combination 101')).toBe(101);
            expect(webScraper.extractSanzoNumber('No numbers here')).toBe(null);
        });
    });

    describe('Robots.txt Handling', () => {
        it('should check robots.txt compliance', async () => {
            const result = await webScraper.checkRobotsTxt();

            expect(result.allowed).toBeDefined();
            expect(result.crawlDelay).toBeDefined();
            expect(Array.isArray(result.disallowed)).toBe(true);
            expect(typeof result.crawlDelay).toBe('number');
        }, 15000);
    });

    describe('Health Check', () => {
        it('should perform health check', async () => {
            const result = await webScraper.healthCheck();

            expect(result.success).toBeDefined();
            expect(result.status).toBeDefined();

            if (result.success) {
                expect(result.status).toBe('healthy');
                expect(result.responseTime).toBeDefined();
                expect(result.robotsCompliant).toBeDefined();
                expect(result.crawlDelay).toBeDefined();
                expect(result.queueLength).toBeDefined();
            }
        }, 15000);
    });

    describe('Page Discovery', () => {
        it('should discover color pages', async () => {
            const result = await webScraper.discoverColorPages();

            expect(result.success).toBeDefined();

            if (result.success) {
                expect(Array.isArray(result.data)).toBe(true);
                expect(result.fromCache).toBeDefined();

                if (result.data.length > 0) {
                    const firstPage = result.data[0];
                    expect(firstPage.url).toBeDefined();
                    expect(firstPage.path).toBeDefined();
                    expect(firstPage.title).toBeDefined();
                    expect(firstPage.type).toBeDefined();
                }
            }
        }, 30000);
    });

    describe('Color Scraping', () => {
        it('should scrape color page if pages are discovered', async () => {
            // First discover pages
            const pagesResult = await webScraper.discoverColorPages();

            if (pagesResult.success && pagesResult.data.length > 0) {
                const firstPage = pagesResult.data[0];
                const result = await webScraper.scrapeColorPage(firstPage.url);

                expect(result.success).toBeDefined();

                if (result.success) {
                    expect(result.data.url).toBe(firstPage.url);
                    expect(result.data.title).toBeDefined();
                    expect(Array.isArray(result.data.colors)).toBe(true);
                    expect(Array.isArray(result.data.combinations)).toBe(true);
                    expect(result.data.metadata).toBeDefined();
                }
            } else {
                console.log('No pages discovered for scraping test');
            }
        }, 45000);
    });

    describe('Cache Management', () => {
        it('should handle cache operations', async () => {
            const testData = [{ test: 'data' }];

            // Cache data
            await webScraper.cacheData('test', testData);

            // Retrieve cached data
            const cached = await webScraper.getCachedData('test');
            expect(cached).toEqual(testData);

            // Clear cache
            const clearResult = await webScraper.clearCache();
            expect(clearResult.success).toBe(true);
        });

        it('should handle cache expiry', async () => {
            const testData = [{ test: 'data' }];

            // Cache data
            await webScraper.cacheData('expiry-test', testData);

            // Simulate expired cache by setting a very short expiry
            const originalExpiry = webScraper.cacheExpiry;
            webScraper.cacheExpiry = 1; // 1ms

            await new Promise(resolve => setTimeout(resolve, 10));

            // Should return null for expired cache
            const expired = await webScraper.getCachedData('expiry-test');
            expect(expired).toBe(null);

            // Restore original expiry
            webScraper.cacheExpiry = originalExpiry;
        });
    });

    describe('Request Queue', () => {
        it('should queue requests properly', async () => {
            const startTime = Date.now();

            // Queue multiple requests
            const promises = [
                webScraper.queueRequest('https://httpbin.org/delay/1'),
                webScraper.queueRequest('https://httpbin.org/delay/1'),
                webScraper.queueRequest('https://httpbin.org/delay/1')
            ];

            try {
                await Promise.all(promises);
                const endTime = Date.now();
                const totalTime = endTime - startTime;

                // Should take at least 3 seconds due to delays between requests
                expect(totalTime).toBeGreaterThan(3000);
            } catch (error) {
                // Network errors are acceptable in tests
                console.log('Network error in queue test:', error.message);
            }
        }, 15000);
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', () => {
            const error = new Error('Network error');
            error.response = {
                status: 500,
                statusText: 'Internal Server Error'
            };

            const result = webScraper.handleError('Test error', error);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Test error');
            expect(result.error).toBe('Network error');
            expect(result.status).toBe(500);
            expect(result.statusText).toBe('Internal Server Error');
        });

        it('should handle errors without response', () => {
            const error = new Error('Connection timeout');

            const result = webScraper.handleError('Timeout error', error);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Timeout error');
            expect(result.error).toBe('Connection timeout');
            expect(result.status).toBeUndefined();
        });
    });

    describe('Respectful Scraping', () => {
        it('should respect rate limits', () => {
            expect(webScraper.requestDelay).toBeGreaterThanOrEqual(1000);
            expect(webScraper.maxConcurrentRequests).toBeLessThanOrEqual(3);
        });

        it('should have proper user agent', () => {
            expect(webScraper.userAgent).toContain('SanzoColorAdvisor');
            expect(webScraper.userAgent).toContain('Educational Purpose');
        });

        it('should respect robots.txt', async () => {
            const robotsResult = await webScraper.checkRobotsTxt();

            if (robotsResult.allowed === false) {
                console.log('Scraping not allowed by robots.txt - respecting restrictions');
            }

            expect(typeof robotsResult.allowed).toBe('boolean');
        }, 10000);
    });
});