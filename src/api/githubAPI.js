/**
 * GitHub API Integration Module
 * Connects to mattdesl/dictionary-of-colour-combinations repository
 * Fetches latest color data and combinations with proper rate limiting
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class GitHubAPI {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.repository = 'mattdesl/dictionary-of-colour-combinations';
        this.dataPath = path.join(__dirname, '../data');
        this.cacheFile = path.join(this.dataPath, 'github-cache.json');
        this.lastSyncFile = path.join(this.dataPath, 'last-sync.json');
        this.rateLimitDelay = 1000; // 1 second between requests
        this.maxRetries = 3;

        // Cache duration: 1 hour
        this.cacheExpiry = 60 * 60 * 1000;

        // Initialize axios with default headers
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SanzoColorAdvisor/1.0.0'
            }
        });

        this.setupRequestInterceptor();
    }

    /**
     * Setup request interceptor for rate limiting
     */
    setupRequestInterceptor() {
        let lastRequestTime = 0;

        this.client.interceptors.request.use(async (config) => {
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime;

            if (timeSinceLastRequest < this.rateLimitDelay) {
                const delay = this.rateLimitDelay - timeSinceLastRequest;
                await this.sleep(delay);
            }

            lastRequestTime = Date.now();
            return config;
        });

        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
                    const resetTime = parseInt(error.response.headers['x-ratelimit-reset']) * 1000;
                    const waitTime = resetTime - Date.now();

                    if (waitTime > 0 && waitTime < 60000) { // Wait max 1 minute
                        console.log(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
                        await this.sleep(waitTime);
                        return this.client.request(error.config);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Sleep utility for rate limiting
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get repository information
     */
    async getRepositoryInfo() {
        try {
            const response = await this.client.get(`/repos/${this.repository}`);
            return {
                success: true,
                data: {
                    name: response.data.name,
                    description: response.data.description,
                    lastUpdated: response.data.updated_at,
                    stars: response.data.stargazers_count,
                    forks: response.data.forks_count,
                    defaultBranch: response.data.default_branch
                }
            };
        } catch (error) {
            return this.handleError('Failed to fetch repository information', error);
        }
    }

    /**
     * Get repository contents
     */
    async getRepositoryContents(path = '') {
        try {
            const response = await this.client.get(`/repos/${this.repository}/contents/${path}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return this.handleError(`Failed to fetch repository contents for path: ${path}`, error);
        }
    }

    /**
     * Download file content from repository
     */
    async downloadFile(filePath) {
        try {
            const response = await this.client.get(`/repos/${this.repository}/contents/${filePath}`);

            if (response.data.type !== 'file') {
                throw new Error(`Path ${filePath} is not a file`);
            }

            let content;
            if (response.data.encoding === 'base64') {
                content = Buffer.from(response.data.content, 'base64').toString('utf-8');
            } else {
                content = response.data.content;
            }

            return {
                success: true,
                data: {
                    content,
                    sha: response.data.sha,
                    size: response.data.size,
                    path: response.data.path,
                    downloadUrl: response.data.download_url
                }
            };
        } catch (error) {
            return this.handleError(`Failed to download file: ${filePath}`, error);
        }
    }

    /**
     * Search for color-related files in the repository
     */
    async findColorFiles() {
        try {
            // Search for JSON files that might contain color data
            const searchQuery = `repo:${this.repository} extension:json`;
            const response = await this.client.get('/search/code', {
                params: {
                    q: searchQuery,
                    per_page: 100
                }
            });

            const colorFiles = response.data.items.filter(item => {
                const fileName = item.name.toLowerCase();
                return fileName.includes('color') ||
                       fileName.includes('combination') ||
                       fileName.includes('palette') ||
                       fileName.includes('wada') ||
                       fileName.includes('sanzo');
            });

            return {
                success: true,
                data: colorFiles.map(file => ({
                    name: file.name,
                    path: file.path,
                    sha: file.sha,
                    url: file.url,
                    htmlUrl: file.html_url
                }))
            };
        } catch (error) {
            return this.handleError('Failed to search for color files', error);
        }
    }

    /**
     * Fetch and parse color combinations data
     */
    async fetchColorCombinations() {
        try {
            // Check cache first
            const cachedData = await this.getCachedData('combinations');
            if (cachedData) {
                return {
                    success: true,
                    data: cachedData,
                    fromCache: true
                };
            }

            // Find color files
            const filesResult = await this.findColorFiles();
            if (!filesResult.success) {
                throw new Error('Failed to find color files');
            }

            const combinationsData = [];

            // Download and parse each color file
            for (const file of filesResult.data) {
                const fileResult = await this.downloadFile(file.path);
                if (fileResult.success) {
                    try {
                        const parsed = JSON.parse(fileResult.data.content);
                        const processedData = this.processColorCombinationsData(parsed, file.name);
                        if (processedData.length > 0) {
                            combinationsData.push(...processedData);
                        }
                    } catch (parseError) {
                        console.warn(`Failed to parse ${file.name}:`, parseError.message);
                    }
                }

                // Rate limiting delay
                await this.sleep(this.rateLimitDelay);
            }

            // Cache the results
            await this.cacheData('combinations', combinationsData);

            return {
                success: true,
                data: combinationsData,
                fromCache: false
            };
        } catch (error) {
            return this.handleError('Failed to fetch color combinations', error);
        }
    }

    /**
     * Process raw color combinations data into standardized format
     */
    processColorCombinationsData(rawData, fileName) {
        const processed = [];

        try {
            // Handle different JSON structures
            if (Array.isArray(rawData)) {
                rawData.forEach((item, index) => {
                    const combination = this.standardizeCombination(item, `${fileName}_${index}`);
                    if (combination) {
                        processed.push(combination);
                    }
                });
            } else if (typeof rawData === 'object') {
                // Handle object with combinations
                if (rawData.combinations) {
                    return this.processColorCombinationsData(rawData.combinations, fileName);
                }

                if (rawData.colors) {
                    return this.processColorCombinationsData(rawData.colors, fileName);
                }

                // Single combination object
                const combination = this.standardizeCombination(rawData, fileName);
                if (combination) {
                    processed.push(combination);
                }
            }
        } catch (error) {
            console.warn(`Error processing data from ${fileName}:`, error.message);
        }

        return processed;
    }

    /**
     * Standardize combination data format
     */
    standardizeCombination(item, id) {
        try {
            const combination = {
                id: id,
                name: item.name || item.title || `Combination ${id}`,
                colors: [],
                description: item.description || '',
                tags: item.tags || [],
                source: 'github',
                originalData: item
            };

            // Extract colors from various possible formats
            const colorSources = [
                item.colors,
                item.palette,
                item.values,
                item.hex,
                item.rgb
            ].filter(Boolean);

            for (const colorSource of colorSources) {
                if (Array.isArray(colorSource)) {
                    colorSource.forEach(color => {
                        const standardizedColor = this.standardizeColor(color);
                        if (standardizedColor) {
                            combination.colors.push(standardizedColor);
                        }
                    });
                } else if (typeof colorSource === 'string') {
                    const standardizedColor = this.standardizeColor(colorSource);
                    if (standardizedColor) {
                        combination.colors.push(standardizedColor);
                    }
                }
            }

            // Only return combinations with at least 2 colors
            return combination.colors.length >= 2 ? combination : null;
        } catch (error) {
            console.warn(`Error standardizing combination ${id}:`, error.message);
            return null;
        }
    }

    /**
     * Standardize color format
     */
    standardizeColor(color) {
        try {
            if (typeof color === 'string') {
                // Assume hex color
                if (color.match(/^#?[0-9A-Fa-f]{6}$/)) {
                    const hex = color.startsWith('#') ? color : `#${color}`;
                    return {
                        hex: hex.toUpperCase(),
                        name: color.name || '',
                        type: 'hex'
                    };
                }
            } else if (typeof color === 'object') {
                const result = {
                    name: color.name || '',
                    type: 'unknown'
                };

                // Check for hex
                if (color.hex) {
                    const hex = color.hex.startsWith('#') ? color.hex : `#${color.hex}`;
                    result.hex = hex.toUpperCase();
                    result.type = 'hex';
                }

                // Check for RGB
                if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
                    result.rgb = {
                        r: parseInt(color.r),
                        g: parseInt(color.g),
                        b: parseInt(color.b)
                    };
                    result.type = 'rgb';

                    // Convert to hex if not already present
                    if (!result.hex) {
                        result.hex = this.rgbToHex(result.rgb.r, result.rgb.g, result.rgb.b);
                    }
                }

                // Check for LAB
                if (color.l !== undefined && color.a !== undefined && color.b !== undefined) {
                    result.lab = {
                        l: parseFloat(color.l),
                        a: parseFloat(color.a),
                        b: parseFloat(color.b)
                    };
                    result.type = 'lab';
                }

                return result.hex ? result : null;
            }
        } catch (error) {
            console.warn('Error standardizing color:', error.message);
        }
        return null;
    }

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    /**
     * Sync with GitHub repository
     */
    async syncWithRepository() {
        try {
            const lastSync = await this.getLastSyncTime();
            const repoInfo = await this.getRepositoryInfo();

            if (!repoInfo.success) {
                throw new Error('Failed to get repository information');
            }

            const lastRepoUpdate = new Date(repoInfo.data.lastUpdated);

            // Check if sync is needed
            if (lastSync && lastRepoUpdate <= lastSync) {
                return {
                    success: true,
                    message: 'Repository is up to date',
                    syncNeeded: false,
                    lastSync: lastSync,
                    lastRepoUpdate: lastRepoUpdate
                };
            }

            // Perform sync
            const combinationsResult = await this.fetchColorCombinations();

            if (!combinationsResult.success) {
                throw new Error('Failed to fetch color combinations');
            }

            // Update last sync time
            await this.updateLastSyncTime();

            return {
                success: true,
                message: 'Repository synchronized successfully',
                syncNeeded: true,
                combinationsCount: combinationsResult.data.length,
                lastSync: new Date(),
                lastRepoUpdate: lastRepoUpdate
            };
        } catch (error) {
            return this.handleError('Repository sync failed', error);
        }
    }

    /**
     * Get cached data
     */
    async getCachedData(type) {
        try {
            const cacheData = await fs.readFile(this.cacheFile, 'utf8');
            const cache = JSON.parse(cacheData);

            if (cache[type] && cache[type].timestamp) {
                const age = Date.now() - cache[type].timestamp;
                if (age < this.cacheExpiry) {
                    return cache[type].data;
                }
            }
        } catch (error) {
            // Cache doesn't exist or is invalid
        }
        return null;
    }

    /**
     * Cache data
     */
    async cacheData(type, data) {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });

            let cache = {};
            try {
                const existingCache = await fs.readFile(this.cacheFile, 'utf8');
                cache = JSON.parse(existingCache);
            } catch (error) {
                // Cache file doesn't exist, start fresh
            }

            cache[type] = {
                data: data,
                timestamp: Date.now()
            };

            await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2));
        } catch (error) {
            console.warn('Failed to cache data:', error.message);
        }
    }

    /**
     * Get last sync time
     */
    async getLastSyncTime() {
        try {
            const syncData = await fs.readFile(this.lastSyncFile, 'utf8');
            const parsed = JSON.parse(syncData);
            return new Date(parsed.lastSync);
        } catch (error) {
            return null;
        }
    }

    /**
     * Update last sync time
     */
    async updateLastSyncTime() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
            const syncData = {
                lastSync: new Date().toISOString()
            };
            await fs.writeFile(this.lastSyncFile, JSON.stringify(syncData, null, 2));
        } catch (error) {
            console.warn('Failed to update last sync time:', error.message);
        }
    }

    /**
     * Clear cache
     */
    async clearCache() {
        try {
            await fs.unlink(this.cacheFile);
            return { success: true, message: 'Cache cleared successfully' };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: true, message: 'No cache to clear' };
            }
            return this.handleError('Failed to clear cache', error);
        }
    }

    /**
     * Get cache status
     */
    async getCacheStatus() {
        try {
            const stats = await fs.stat(this.cacheFile);
            const cacheData = await fs.readFile(this.cacheFile, 'utf8');
            const cache = JSON.parse(cacheData);

            const status = {
                exists: true,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                types: Object.keys(cache)
            };

            // Check expiry for each type
            status.typeStatus = {};
            for (const type of status.types) {
                const age = Date.now() - cache[type].timestamp;
                status.typeStatus[type] = {
                    age: age,
                    expired: age > this.cacheExpiry,
                    itemCount: Array.isArray(cache[type].data) ? cache[type].data.length : 1
                };
            }

            return { success: true, data: status };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: true, data: { exists: false } };
            }
            return this.handleError('Failed to get cache status', error);
        }
    }

    /**
     * Handle API errors
     */
    handleError(message, error) {
        const errorResponse = {
            success: false,
            message: message,
            error: error.message
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;

            if (error.response.data) {
                errorResponse.apiError = error.response.data;
            }

            // Rate limiting info
            if (error.response.headers) {
                const rateLimitRemaining = error.response.headers['x-ratelimit-remaining'];
                const rateLimitReset = error.response.headers['x-ratelimit-reset'];

                if (rateLimitRemaining !== undefined) {
                    errorResponse.rateLimit = {
                        remaining: parseInt(rateLimitRemaining),
                        reset: new Date(parseInt(rateLimitReset) * 1000)
                    };
                }
            }
        }

        console.error('GitHub API Error:', errorResponse);
        return errorResponse;
    }

    /**
     * Health check for GitHub API
     */
    async healthCheck() {
        try {
            const start = Date.now();
            const repoInfo = await this.getRepositoryInfo();
            const responseTime = Date.now() - start;

            return {
                success: true,
                status: 'healthy',
                responseTime: responseTime,
                repository: repoInfo.success ? repoInfo.data.name : 'unavailable',
                apiLimitsOk: !repoInfo.rateLimit || repoInfo.rateLimit.remaining > 10
            };
        } catch (error) {
            return {
                success: false,
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

module.exports = GitHubAPI;