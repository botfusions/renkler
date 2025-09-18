/**
 * Web Scraping Module for wada-sanzo-colors.com
 * Respectful scraping with proper delays and error handling
 * Extracts LAB values and color information
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class WebScraper {
    constructor() {
        this.baseURL = 'https://wada-sanzo-colors.com';
        this.dataPath = path.join(__dirname, '../data');
        this.cacheFile = path.join(this.dataPath, 'scraper-cache.json');
        this.robotsFile = path.join(this.dataPath, 'robots.txt');

        // Respectful scraping settings
        this.requestDelay = 2000; // 2 seconds between requests
        this.maxConcurrentRequests = 1; // No concurrent requests
        this.maxRetries = 3;
        this.timeout = 30000; // 30 seconds
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

        // User agent string
        this.userAgent = 'SanzoColorAdvisor/1.0.0 (Educational Purpose; Contact: claude@anthropic.com)';

        // Initialize axios client
        this.client = axios.create({
            timeout: this.timeout,
            headers: {
                'User-Agent': this.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        this.setupInterceptors();
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * Setup request interceptors for rate limiting and error handling
     */
    setupInterceptors() {
        this.client.interceptors.request.use(
            (config) => {
                console.log(`Making request to: ${config.url}`);
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => {
                console.log(`Response received: ${response.status} ${response.statusText}`);
                return response;
            },
            async (error) => {
                if (error.response?.status === 429) {
                    console.log('Rate limited, waiting 5 seconds...');
                    await this.sleep(5000);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Sleep utility for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check robots.txt compliance
     */
    async checkRobotsTxt() {
        try {
            const cachedRobots = await this.getCachedRobots();
            if (cachedRobots) {
                return this.parseRobotsTxt(cachedRobots);
            }

            const response = await this.client.get(`${this.baseURL}/robots.txt`);
            await this.cacheRobots(response.data);

            return this.parseRobotsTxt(response.data);
        } catch (error) {
            console.warn('Could not fetch robots.txt, proceeding with default restrictions');
            return {
                allowed: true,
                crawlDelay: this.requestDelay,
                disallowed: []
            };
        }
    }

    /**
     * Parse robots.txt content
     */
    parseRobotsTxt(robotsContent) {
        const lines = robotsContent.split('\n');
        let userAgentMatch = false;
        const disallowed = [];
        let crawlDelay = this.requestDelay;

        for (const line of lines) {
            const trimmed = line.trim().toLowerCase();

            if (trimmed.startsWith('user-agent:')) {
                const agent = trimmed.split(':')[1].trim();
                userAgentMatch = agent === '*' || agent === 'sanzocoloradvisor';
            }

            if (userAgentMatch && trimmed.startsWith('disallow:')) {
                const path = trimmed.split(':')[1].trim();
                if (path) disallowed.push(path);
            }

            if (userAgentMatch && trimmed.startsWith('crawl-delay:')) {
                const delay = parseInt(trimmed.split(':')[1].trim());
                if (!isNaN(delay)) crawlDelay = Math.max(delay * 1000, this.requestDelay);
            }
        }

        return {
            allowed: true,
            crawlDelay: crawlDelay,
            disallowed: disallowed
        };
    }

    /**
     * Check if path is allowed by robots.txt
     */
    isPathAllowed(path, robotsRules) {
        return !robotsRules.disallowed.some(disallowedPath =>
            path.startsWith(disallowedPath)
        );
    }

    /**
     * Add request to queue for rate limiting
     */
    async queueRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                url,
                options,
                resolve,
                reject
            });

            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }

    /**
     * Process request queue with proper delays
     */
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();

            try {
                const response = await this.client.get(request.url, request.options);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            }

            // Delay between requests
            if (this.requestQueue.length > 0) {
                await this.sleep(this.requestDelay);
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * Discover color pages on the website
     */
    async discoverColorPages() {
        try {
            const robotsRules = await this.checkRobotsTxt();

            if (!this.isPathAllowed('/', robotsRules)) {
                throw new Error('Scraping not allowed by robots.txt');
            }

            // Check cache first
            const cachedPages = await this.getCachedData('colorPages');
            if (cachedPages) {
                return {
                    success: true,
                    data: cachedPages,
                    fromCache: true
                };
            }

            const response = await this.queueRequest(this.baseURL);
            const $ = cheerio.load(response.data);

            const colorPages = [];

            // Look for color-related links
            $('a[href]').each((i, element) => {
                const href = $(element).attr('href');
                const text = $(element).text().trim();

                if (this.isColorRelated(href, text)) {
                    const fullUrl = href.startsWith('http') ? href : `${this.baseURL}${href}`;

                    if (this.isPathAllowed(href, robotsRules)) {
                        colorPages.push({
                            url: fullUrl,
                            path: href,
                            title: text,
                            type: this.categorizeColorPage(href, text)
                        });
                    }
                }
            });

            // Remove duplicates
            const uniquePages = colorPages.filter((page, index, self) =>
                index === self.findIndex(p => p.url === page.url)
            );

            await this.cacheData('colorPages', uniquePages);

            return {
                success: true,
                data: uniquePages,
                fromCache: false
            };
        } catch (error) {
            return this.handleError('Failed to discover color pages', error);
        }
    }

    /**
     * Check if URL/text is color-related
     */
    isColorRelated(href, text) {
        const colorKeywords = [
            'color', 'colour', 'palette', 'combination', 'wada', 'sanzo',
            'rgb', 'hex', 'lab', 'cmyk', 'hsl', 'paint', 'pigment'
        ];

        const combined = `${href} ${text}`.toLowerCase();
        return colorKeywords.some(keyword => combined.includes(keyword));
    }

    /**
     * Categorize color page type
     */
    categorizeColorPage(href, text) {
        const lower = `${href} ${text}`.toLowerCase();

        if (lower.includes('combination') || lower.includes('palette')) {
            return 'combination';
        }
        if (lower.includes('individual') || lower.includes('single')) {
            return 'individual';
        }
        if (lower.includes('chart') || lower.includes('index')) {
            return 'chart';
        }
        if (lower.includes('about') || lower.includes('history')) {
            return 'about';
        }

        return 'unknown';
    }

    /**
     * Scrape color data from a specific page
     */
    async scrapeColorPage(pageUrl) {
        try {
            const response = await this.queueRequest(pageUrl);
            const $ = cheerio.load(response.data);

            const colorData = {
                url: pageUrl,
                title: $('title').text().trim(),
                colors: [],
                combinations: [],
                metadata: {}
            };

            // Extract colors from various formats
            await this.extractColorsFromPage($, colorData);
            await this.extractMetadata($, colorData);

            return {
                success: true,
                data: colorData
            };
        } catch (error) {
            return this.handleError(`Failed to scrape color page: ${pageUrl}`, error);
        }
    }

    /**
     * Extract colors from page content
     */
    async extractColorsFromPage($, colorData) {
        // Look for hex colors in text
        const hexPattern = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
        const pageText = $.html();
        let match;

        while ((match = hexPattern.exec(pageText)) !== null) {
            const hex = match[0];
            if (!colorData.colors.find(c => c.hex === hex)) {
                colorData.colors.push({
                    hex: hex,
                    type: 'hex',
                    source: 'text'
                });
            }
        }

        // Look for RGB values
        const rgbPattern = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
        while ((match = rgbPattern.exec(pageText)) !== null) {
            const rgb = {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };

            colorData.colors.push({
                rgb: rgb,
                hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
                type: 'rgb',
                source: 'text'
            });
        }

        // Look for LAB values
        const labPattern = /lab\s*\(\s*([0-9.]+)\s*,\s*([-0-9.]+)\s*,\s*([-0-9.]+)\s*\)/gi;
        while ((match = labPattern.exec(pageText)) !== null) {
            const lab = {
                l: parseFloat(match[1]),
                a: parseFloat(match[2]),
                b: parseFloat(match[3])
            };

            colorData.colors.push({
                lab: lab,
                type: 'lab',
                source: 'text'
            });
        }

        // Look for color swatches or color-specific elements
        $('.color, .swatch, [class*="color"], [style*="background-color"], [style*="color:"]').each((i, element) => {
            const $elem = $(element);
            const style = $elem.attr('style') || '';
            const className = $elem.attr('class') || '';
            const text = $elem.text().trim();

            // Extract background color
            const bgColorMatch = style.match(/background-color:\s*([^;]+)/);
            if (bgColorMatch) {
                const color = this.parseColorValue(bgColorMatch[1]);
                if (color) {
                    color.source = 'background-color';
                    color.element = element.name;
                    colorData.colors.push(color);
                }
            }

            // Extract text color
            const textColorMatch = style.match(/color:\s*([^;]+)/);
            if (textColorMatch) {
                const color = this.parseColorValue(textColorMatch[1]);
                if (color) {
                    color.source = 'text-color';
                    color.element = element.name;
                    colorData.colors.push(color);
                }
            }

            // Check for data attributes
            const colorAttrs = ['data-color', 'data-hex', 'data-rgb', 'data-lab'];
            for (const attr of colorAttrs) {
                const value = $elem.attr(attr);
                if (value) {
                    const color = this.parseColorValue(value);
                    if (color) {
                        color.source = attr;
                        color.element = element.name;
                        colorData.colors.push(color);
                    }
                }
            }
        });
    }

    /**
     * Parse color value from text
     */
    parseColorValue(value) {
        const trimmed = value.trim();

        // Hex color
        if (trimmed.match(/^#?[0-9A-Fa-f]{6}$/)) {
            const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
            return {
                hex: hex.toUpperCase(),
                type: 'hex'
            };
        }

        // RGB color
        const rgbMatch = trimmed.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (rgbMatch) {
            const rgb = {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
            return {
                rgb: rgb,
                hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
                type: 'rgb'
            };
        }

        // LAB color
        const labMatch = trimmed.match(/lab\s*\(\s*([0-9.]+)\s*,\s*([-0-9.]+)\s*,\s*([-0-9.]+)\s*\)/);
        if (labMatch) {
            return {
                lab: {
                    l: parseFloat(labMatch[1]),
                    a: parseFloat(labMatch[2]),
                    b: parseFloat(labMatch[3])
                },
                type: 'lab'
            };
        }

        return null;
    }

    /**
     * Extract metadata from page
     */
    async extractMetadata($, colorData) {
        // Page metadata
        colorData.metadata.description = $('meta[name="description"]').attr('content') || '';
        colorData.metadata.keywords = $('meta[name="keywords"]').attr('content') || '';
        colorData.metadata.language = $('html').attr('lang') || 'en';

        // Content metadata
        colorData.metadata.lastModified = $('meta[name="last-modified"]').attr('content') || '';
        colorData.metadata.author = $('meta[name="author"]').attr('content') || '';

        // Sanzo-specific metadata
        colorData.metadata.sanzoNumber = this.extractSanzoNumber($.html());
        colorData.metadata.colorCount = colorData.colors.length;

        // Extract publication info
        const pubPattern = /(\d{4})\s*(edition|publication|published)/i;
        const pubMatch = $.html().match(pubPattern);
        if (pubMatch) {
            colorData.metadata.publicationYear = pubMatch[1];
        }
    }

    /**
     * Extract Sanzo color number from content
     */
    extractSanzoNumber(html) {
        const patterns = [
            /sanzo\s*no?\.?\s*(\d+)/i,
            /wada\s*no?\.?\s*(\d+)/i,
            /color\s*no?\.?\s*(\d+)/i,
            /combination\s*(\d+)/i
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                return parseInt(match[1]);
            }
        }

        return null;
    }

    /**
     * Scrape all discovered color pages
     */
    async scrapeAllColorPages() {
        try {
            const pagesResult = await this.discoverColorPages();
            if (!pagesResult.success) {
                throw new Error('Failed to discover color pages');
            }

            const allColorData = [];
            const errors = [];

            console.log(`Discovered ${pagesResult.data.length} color pages to scrape`);

            for (let i = 0; i < pagesResult.data.length; i++) {
                const page = pagesResult.data[i];
                console.log(`Scraping page ${i + 1}/${pagesResult.data.length}: ${page.url}`);

                const result = await this.scrapeColorPage(page.url);
                if (result.success) {
                    allColorData.push(result.data);
                } else {
                    errors.push({
                        url: page.url,
                        error: result.error
                    });
                }

                // Progress report every 10 pages
                if ((i + 1) % 10 === 0) {
                    console.log(`Progress: ${i + 1}/${pagesResult.data.length} pages scraped`);
                }
            }

            await this.cacheData('allColorData', allColorData);

            return {
                success: true,
                data: allColorData,
                errors: errors,
                summary: {
                    pagesScraped: allColorData.length,
                    totalColors: allColorData.reduce((sum, page) => sum + page.colors.length, 0),
                    errors: errors.length
                }
            };
        } catch (error) {
            return this.handleError('Failed to scrape all color pages', error);
        }
    }

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
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
                // Cache file doesn't exist
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
     * Cache robots.txt
     */
    async cacheRobots(content) {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
            await fs.writeFile(this.robotsFile, content);
        } catch (error) {
            console.warn('Failed to cache robots.txt:', error.message);
        }
    }

    /**
     * Get cached robots.txt
     */
    async getCachedRobots() {
        try {
            const stats = await fs.stat(this.robotsFile);
            const age = Date.now() - stats.mtime.getTime();

            // Cache robots.txt for 24 hours
            if (age < 24 * 60 * 60 * 1000) {
                return await fs.readFile(this.robotsFile, 'utf8');
            }
        } catch (error) {
            // File doesn't exist
        }
        return null;
    }

    /**
     * Health check for web scraper
     */
    async healthCheck() {
        try {
            const start = Date.now();
            const robotsCheck = await this.checkRobotsTxt();
            const responseTime = Date.now() - start;

            return {
                success: true,
                status: 'healthy',
                responseTime: responseTime,
                robotsCompliant: robotsCheck.allowed,
                crawlDelay: robotsCheck.crawlDelay,
                queueLength: this.requestQueue.length
            };
        } catch (error) {
            return {
                success: false,
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    /**
     * Clear cache
     */
    async clearCache() {
        try {
            await fs.unlink(this.cacheFile);
            await fs.unlink(this.robotsFile);
            return { success: true, message: 'Cache cleared successfully' };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: true, message: 'No cache to clear' };
            }
            return this.handleError('Failed to clear cache', error);
        }
    }

    /**
     * Handle errors
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
        }

        console.error('Web Scraper Error:', errorResponse);
        return errorResponse;
    }
}

module.exports = WebScraper;