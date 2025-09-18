/**
 * GitHub API Integration Tests
 */

const GitHubAPI = require('../../src/api/githubAPI');
const fs = require('fs').promises;
const path = require('path');

describe('GitHub API Integration', () => {
    let githubAPI;
    const testDataPath = path.join(__dirname, '../data');

    beforeAll(async () => {
        githubAPI = new GitHubAPI();
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
            expect(githubAPI.baseURL).toBe('https://api.github.com');
            expect(githubAPI.repository).toBe('mattdesl/dictionary-of-colour-combinations');
            expect(githubAPI.rateLimitDelay).toBe(1000);
            expect(githubAPI.maxRetries).toBe(3);
        });
    });

    describe('Health Check', () => {
        it('should perform health check', async () => {
            const result = await githubAPI.healthCheck();

            expect(result.success).toBeDefined();
            expect(result.status).toBeDefined();
            expect(result.responseTime).toBeDefined();

            if (result.success) {
                expect(result.status).toBe('healthy');
                expect(typeof result.responseTime).toBe('number');
                expect(result.repository).toBeDefined();
                expect(result.apiLimitsOk).toBeDefined();
            }
        }, 10000);
    });

    describe('Repository Information', () => {
        it('should fetch repository information', async () => {
            const result = await githubAPI.getRepositoryInfo();

            expect(result.success).toBeDefined();

            if (result.success) {
                expect(result.data.name).toBeDefined();
                expect(result.data.description).toBeDefined();
                expect(result.data.lastUpdated).toBeDefined();
                expect(result.data.defaultBranch).toBeDefined();
                expect(typeof result.data.stars).toBe('number');
                expect(typeof result.data.forks).toBe('number');
            } else {
                // If request fails, check error structure
                expect(result.message).toBeDefined();
                expect(result.error).toBeDefined();
            }
        }, 15000);
    });

    describe('Repository Contents', () => {
        it('should fetch repository root contents', async () => {
            const result = await githubAPI.getRepositoryContents('');

            expect(result.success).toBeDefined();

            if (result.success) {
                expect(Array.isArray(result.data)).toBe(true);
                expect(result.data.length).toBeGreaterThan(0);

                // Check structure of first item
                const firstItem = result.data[0];
                expect(firstItem.name).toBeDefined();
                expect(firstItem.type).toBeDefined();
                expect(firstItem.path).toBeDefined();
            }
        }, 15000);
    });

    describe('File Operations', () => {
        it('should search for color files', async () => {
            const result = await githubAPI.findColorFiles();

            expect(result.success).toBeDefined();

            if (result.success) {
                expect(Array.isArray(result.data)).toBe(true);

                if (result.data.length > 0) {
                    const firstFile = result.data[0];
                    expect(firstFile.name).toBeDefined();
                    expect(firstFile.path).toBeDefined();
                    expect(firstFile.sha).toBeDefined();
                }
            }
        }, 20000);

        it('should download a file if found', async () => {
            // First find color files
            const filesResult = await githubAPI.findColorFiles();

            if (filesResult.success && filesResult.data.length > 0) {
                const firstFile = filesResult.data[0];
                const result = await githubAPI.downloadFile(firstFile.path);

                expect(result.success).toBeDefined();

                if (result.success) {
                    expect(result.data.content).toBeDefined();
                    expect(result.data.sha).toBeDefined();
                    expect(result.data.size).toBeDefined();
                    expect(result.data.path).toBe(firstFile.path);
                }
            }
        }, 25000);
    });

    describe('Color Combinations', () => {
        it('should fetch color combinations data', async () => {
            const result = await githubAPI.fetchColorCombinations();

            expect(result.success).toBeDefined();

            if (result.success) {
                expect(Array.isArray(result.data)).toBe(true);
                expect(result.fromCache).toBeDefined();

                if (result.data.length > 0) {
                    const firstCombination = result.data[0];
                    expect(firstCombination.id).toBeDefined();
                    expect(firstCombination.name).toBeDefined();
                    expect(Array.isArray(firstCombination.colors)).toBe(true);
                    expect(firstCombination.source).toBe('github');
                }
            }
        }, 30000);
    });

    describe('Data Processing', () => {
        it('should standardize color format', () => {
            // Test hex color
            const hexColor = githubAPI.standardizeColor('#FF0000');
            expect(hexColor).toEqual({
                hex: '#FF0000',
                name: '',
                type: 'hex'
            });

            // Test RGB color object
            const rgbColor = githubAPI.standardizeColor({
                r: 255,
                g: 0,
                b: 0,
                name: 'Red'
            });
            expect(rgbColor.rgb).toEqual({ r: 255, g: 0, b: 0 });
            expect(rgbColor.hex).toBe('#FF0000');
            expect(rgbColor.name).toBe('Red');
            expect(rgbColor.type).toBe('rgb');

            // Test invalid color
            const invalidColor = githubAPI.standardizeColor('invalid');
            expect(invalidColor).toBe(null);
        });

        it('should convert RGB to hex', () => {
            expect(githubAPI.rgbToHex(255, 0, 0)).toBe('#FF0000');
            expect(githubAPI.rgbToHex(0, 255, 0)).toBe('#00FF00');
            expect(githubAPI.rgbToHex(0, 0, 255)).toBe('#0000FF');
            expect(githubAPI.rgbToHex(255, 255, 255)).toBe('#FFFFFF');
            expect(githubAPI.rgbToHex(0, 0, 0)).toBe('#000000');
        });

        it('should process color combinations data', () => {
            const testData = [
                {
                    name: 'Test Combination',
                    colors: ['#FF0000', '#00FF00', '#0000FF'],
                    description: 'Test description'
                }
            ];

            const processed = githubAPI.processColorCombinationsData(testData, 'test.json');

            expect(Array.isArray(processed)).toBe(true);
            expect(processed.length).toBe(1);

            const combination = processed[0];
            expect(combination.name).toBe('Test Combination');
            expect(combination.colors.length).toBe(3);
            expect(combination.source).toBe('github');
            expect(combination.colors[0].hex).toBe('#FF0000');
        });
    });

    describe('Synchronization', () => {
        it('should sync with repository', async () => {
            const result = await githubAPI.syncWithRepository();

            expect(result.success).toBeDefined();
            expect(result.message).toBeDefined();
            expect(result.syncNeeded).toBeDefined();

            if (result.success && result.syncNeeded) {
                expect(result.combinationsCount).toBeDefined();
                expect(typeof result.combinationsCount).toBe('number');
            }
        }, 45000);
    });

    describe('Cache Management', () => {
        it('should handle cache operations', async () => {
            // Test cache status
            const statusResult = await githubAPI.getCacheStatus();
            expect(statusResult.success).toBe(true);

            // Test cache clearing
            const clearResult = await githubAPI.clearCache();
            expect(clearResult.success).toBe(true);
        });

        it('should cache and retrieve data', async () => {
            const testData = [{ test: 'data' }];

            // Cache data
            await githubAPI.cacheData('test', testData);

            // Retrieve cached data
            const cached = await githubAPI.getCachedData('test');
            expect(cached).toEqual(testData);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', () => {
            const error = new Error('Test error');
            error.response = {
                status: 404,
                statusText: 'Not Found',
                data: { message: 'API error' }
            };

            const result = githubAPI.handleError('Test message', error);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Test message');
            expect(result.error).toBe('Test error');
            expect(result.status).toBe(404);
            expect(result.statusText).toBe('Not Found');
            expect(result.apiError).toEqual({ message: 'API error' });
        });

        it('should handle rate limiting info', () => {
            const error = new Error('Rate limited');
            error.response = {
                status: 403,
                headers: {
                    'x-ratelimit-remaining': '0',
                    'x-ratelimit-reset': '1640995200'
                }
            };

            const result = githubAPI.handleError('Rate limited', error);

            expect(result.rateLimit).toBeDefined();
            expect(result.rateLimit.remaining).toBe(0);
            expect(result.rateLimit.reset).toBeInstanceOf(Date);
        });
    });
});