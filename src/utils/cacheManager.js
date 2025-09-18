/**
 * cacheManager.js - Multi-Level Intelligent Caching System
 * Implements memory cache, localStorage, and service worker caching with intelligent invalidation
 *
 * Cache Levels:
 * 1. Memory Cache (L1) - Fastest, volatile
 * 2. localStorage Cache (L2) - Persistent, limited storage
 * 3. Service Worker Cache (L3) - Network resource caching
 * 4. Progressive Cache - For large datasets
 */

class CacheManager {
    constructor(options = {}) {
        this.options = {
            memoryCache: {
                maxSize: options.memoryCacheSize || 10000,
                ttl: options.memoryCacheTTL || 30 * 60 * 1000, // 30 minutes
                compressionRatio: 0.7 // Target compression ratio for eviction
            },
            localStorage: {
                keyPrefix: options.localStoragePrefix || 'sanzo_cache_',
                maxSize: options.localStorageSize || 5 * 1024 * 1024, // 5MB
                ttl: options.localStorageTTL || 24 * 60 * 60 * 1000, // 24 hours
                compression: options.compression !== false // Enable by default
            },
            serviceWorker: {
                cacheName: options.swCacheName || 'sanzo-color-cache-v1',
                maxEntries: options.swMaxEntries || 1000,
                maxAge: options.swMaxAge || 7 * 24 * 60 * 60 * 1000 // 7 days
            },
            progressive: {
                chunkSize: options.progressiveChunkSize || 1000,
                maxChunks: options.maxProgressiveChunks || 100
            },
            analytics: options.analytics !== false
        };

        // Cache stores
        this.memoryCache = new Map();
        this.memoryCacheTimestamps = new Map();
        this.memoryCacheAccess = new Map(); // LRU tracking

        // Service Worker support
        this.serviceWorkerSupported = 'serviceWorker' in navigator;
        this.serviceWorker = null;

        // Progressive loading state
        this.progressiveLoading = new Map();
        this.loadingPromises = new Map();

        // Performance analytics
        this.analytics = {
            hits: { memory: 0, localStorage: 0, serviceWorker: 0 },
            misses: { memory: 0, localStorage: 0, serviceWorker: 0 },
            writes: { memory: 0, localStorage: 0, serviceWorker: 0 },
            evictions: { memory: 0, localStorage: 0 },
            compressionRatio: 0,
            averageAccessTime: new Map(),
            totalBytes: { memory: 0, localStorage: 0, serviceWorker: 0 }
        };

        // Cleanup intervals
        this.cleanupIntervals = [];

        this.init();
    }

    /**
     * Initialize cache manager
     */
    async init() {
        console.log('CacheManager initializing...');

        // Setup memory cache cleanup
        this.setupMemoryCacheCleanup();

        // Setup localStorage monitoring
        this.setupLocalStorageMonitoring();

        // Setup service worker caching
        if (this.serviceWorkerSupported) {
            await this.setupServiceWorkerCaching();
        }

        // Setup event listeners
        this.setupEventListeners();

        console.log('CacheManager initialized with options:', this.options);
    }

    /**
     * Setup memory cache cleanup and optimization
     */
    setupMemoryCacheCleanup() {
        // Periodic cleanup every 5 minutes
        const cleanupInterval = setInterval(() => {
            this.cleanupMemoryCache();
        }, 5 * 60 * 1000);

        this.cleanupIntervals.push(cleanupInterval);

        // Cleanup on memory pressure (if supported)
        if ('memory' in performance) {
            const checkMemoryPressure = () => {
                const memInfo = performance.memory;
                const usedRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;

                if (usedRatio > 0.8) { // 80% memory usage
                    console.log('Memory pressure detected, aggressive cleanup');
                    this.cleanupMemoryCache(true);
                }
            };

            const memoryInterval = setInterval(checkMemoryPressure, 30000);
            this.cleanupIntervals.push(memoryInterval);
        }
    }

    /**
     * Setup localStorage monitoring and cleanup
     */
    setupLocalStorageMonitoring() {
        // Monitor localStorage usage
        const monitorLocalStorage = () => {
            const usage = this.getLocalStorageUsage();
            if (usage.usedBytes > this.options.localStorage.maxSize * 0.9) {
                console.log('localStorage near capacity, cleaning up');
                this.cleanupLocalStorage();
            }
        };

        const storageInterval = setInterval(monitorLocalStorage, 10 * 60 * 1000); // 10 minutes
        this.cleanupIntervals.push(storageInterval);
    }

    /**
     * Setup service worker caching
     */
    async setupServiceWorkerCaching() {
        try {
            // Register service worker if not already registered
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                console.log('Service worker not found, caching will be memory + localStorage only');
                return;
            }

            this.serviceWorker = registration;

            // Listen for service worker messages
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event);
            });

            console.log('Service worker caching enabled');

        } catch (error) {
            console.warn('Service worker setup failed:', error);
            this.serviceWorkerSupported = false;
        }
    }

    /**
     * Setup event listeners for cache optimization
     */
    setupEventListeners() {
        // Page visibility change - optimize cache on hidden
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.optimizeCacheForBackground();
                }
            });

            // Before unload - persist important cache entries
            window.addEventListener('beforeunload', () => {
                this.persistCriticalCache();
            });
        }

        // Storage event - sync cache across tabs
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => {
                if (event.key?.startsWith(this.options.localStorage.keyPrefix)) {
                    this.handleCrossTabCacheSync(event);
                }
            });
        }
    }

    /**
     * Get cached value with multi-level fallback
     */
    async get(key, options = {}) {
        const startTime = performance.now();
        const cacheKey = this.normalizeKey(key);

        try {
            // Level 1: Memory cache
            const memoryResult = this.getFromMemoryCache(cacheKey);
            if (memoryResult !== null) {
                this.analytics.hits.memory++;
                this.updateAccessTime('memory', performance.now() - startTime);
                return memoryResult;
            }
            this.analytics.misses.memory++;

            // Level 2: localStorage cache
            if (options.useLocalStorage !== false) {
                const localStorageResult = await this.getFromLocalStorage(cacheKey);
                if (localStorageResult !== null) {
                    this.analytics.hits.localStorage++;
                    this.updateAccessTime('localStorage', performance.now() - startTime);

                    // Promote to memory cache
                    this.setToMemoryCache(cacheKey, localStorageResult, options);
                    return localStorageResult;
                }
                this.analytics.misses.localStorage++;
            }

            // Level 3: Service Worker cache
            if (this.serviceWorkerSupported && options.useServiceWorker !== false) {
                const swResult = await this.getFromServiceWorker(cacheKey);
                if (swResult !== null) {
                    this.analytics.hits.serviceWorker++;
                    this.updateAccessTime('serviceWorker', performance.now() - startTime);

                    // Promote to higher levels
                    this.setToMemoryCache(cacheKey, swResult, options);
                    if (options.useLocalStorage !== false) {
                        await this.setToLocalStorage(cacheKey, swResult, options);
                    }
                    return swResult;
                }
                this.analytics.misses.serviceWorker++;
            }

            // Level 4: Progressive loading for large datasets
            if (options.progressive) {
                return await this.getProgressive(cacheKey, options);
            }

            return null;

        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set cached value to appropriate levels
     */
    async set(key, value, options = {}) {
        const cacheKey = this.normalizeKey(key);
        const serializedValue = this.serializeValue(value, options);

        const promises = [];

        // Always set to memory cache (Level 1)
        this.setToMemoryCache(cacheKey, value, options);
        this.analytics.writes.memory++;

        // Set to localStorage (Level 2)
        if (options.useLocalStorage !== false) {
            promises.push(
                this.setToLocalStorage(cacheKey, value, options)
                    .then(() => this.analytics.writes.localStorage++)
                    .catch(error => console.warn('localStorage set failed:', error))
            );
        }

        // Set to Service Worker cache (Level 3)
        if (this.serviceWorkerSupported && options.useServiceWorker !== false) {
            promises.push(
                this.setToServiceWorker(cacheKey, value, options)
                    .then(() => this.analytics.writes.serviceWorker++)
                    .catch(error => console.warn('Service worker set failed:', error))
            );
        }

        // Handle progressive caching for large datasets
        if (options.progressive && Array.isArray(value) && value.length > this.options.progressive.chunkSize) {
            promises.push(this.setProgressive(cacheKey, value, options));
        }

        await Promise.allSettled(promises);
        return true;
    }

    /**
     * Remove from all cache levels
     */
    async remove(key) {
        const cacheKey = this.normalizeKey(key);

        // Remove from memory cache
        this.memoryCache.delete(cacheKey);
        this.memoryCacheTimestamps.delete(cacheKey);
        this.memoryCacheAccess.delete(cacheKey);

        // Remove from localStorage
        try {
            localStorage.removeItem(this.options.localStorage.keyPrefix + cacheKey);
        } catch (error) {
            console.warn('localStorage remove failed:', error);
        }

        // Remove from service worker cache
        if (this.serviceWorkerSupported) {
            try {
                await this.removeFromServiceWorker(cacheKey);
            } catch (error) {
                console.warn('Service worker remove failed:', error);
            }
        }

        // Remove progressive chunks
        this.removeProgressive(cacheKey);

        return true;
    }

    /**
     * Clear all caches with selective options
     */
    async clear(options = {}) {
        if (options.memory !== false) {
            this.memoryCache.clear();
            this.memoryCacheTimestamps.clear();
            this.memoryCacheAccess.clear();
        }

        if (options.localStorage !== false) {
            await this.clearLocalStorage();
        }

        if (options.serviceWorker !== false && this.serviceWorkerSupported) {
            await this.clearServiceWorker();
        }

        if (options.progressive !== false) {
            this.progressiveLoading.clear();
            this.loadingPromises.clear();
        }

        console.log('Cache cleared:', options);
    }

    // Memory Cache Implementation

    getFromMemoryCache(key) {
        if (!this.memoryCache.has(key)) {
            return null;
        }

        const timestamp = this.memoryCacheTimestamps.get(key);
        const now = Date.now();

        // Check TTL
        if (timestamp && (now - timestamp) > this.options.memoryCache.ttl) {
            this.memoryCache.delete(key);
            this.memoryCacheTimestamps.delete(key);
            this.memoryCacheAccess.delete(key);
            return null;
        }

        // Update access time for LRU
        this.memoryCacheAccess.set(key, now);

        return this.memoryCache.get(key);
    }

    setToMemoryCache(key, value, options = {}) {
        const now = Date.now();

        // Check if we need to evict items
        if (this.memoryCache.size >= this.options.memoryCache.maxSize) {
            this.evictFromMemoryCache();
        }

        this.memoryCache.set(key, value);
        this.memoryCacheTimestamps.set(key, now);
        this.memoryCacheAccess.set(key, now);

        // Update memory usage tracking
        const serializedSize = JSON.stringify(value).length;
        this.analytics.totalBytes.memory += serializedSize;
    }

    evictFromMemoryCache() {
        // LRU eviction
        const entries = Array.from(this.memoryCacheAccess.entries());
        entries.sort((a, b) => a[1] - b[1]); // Sort by access time, oldest first

        const evictCount = Math.ceil(this.options.memoryCache.maxSize * (1 - this.options.memoryCache.compressionRatio));

        for (let i = 0; i < evictCount && i < entries.length; i++) {
            const keyToEvict = entries[i][0];
            this.memoryCache.delete(keyToEvict);
            this.memoryCacheTimestamps.delete(keyToEvict);
            this.memoryCacheAccess.delete(keyToEvict);
            this.analytics.evictions.memory++;
        }
    }

    cleanupMemoryCache(aggressive = false) {
        const now = Date.now();
        const ttl = aggressive ? this.options.memoryCache.ttl / 2 : this.options.memoryCache.ttl;

        for (const [key, timestamp] of this.memoryCacheTimestamps.entries()) {
            if ((now - timestamp) > ttl) {
                this.memoryCache.delete(key);
                this.memoryCacheTimestamps.delete(key);
                this.memoryCacheAccess.delete(key);
            }
        }
    }

    // localStorage Cache Implementation

    async getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(this.options.localStorage.keyPrefix + key);
            if (!item) return null;

            const parsed = JSON.parse(item);

            // Check TTL
            if (parsed.expiry && Date.now() > parsed.expiry) {
                localStorage.removeItem(this.options.localStorage.keyPrefix + key);
                return null;
            }

            // Decompress if needed
            const value = parsed.compressed
                ? this.decompress(parsed.data)
                : parsed.data;

            return value;

        } catch (error) {
            console.warn('localStorage get failed:', error);
            return null;
        }
    }

    async setToLocalStorage(key, value, options = {}) {
        try {
            const ttl = options.ttl || this.options.localStorage.ttl;
            const expiry = Date.now() + ttl;

            // Serialize and optionally compress
            let data = value;
            let compressed = false;

            if (this.options.localStorage.compression && this.shouldCompress(value)) {
                data = this.compress(data);
                compressed = true;
            }

            const item = {
                data,
                compressed,
                expiry,
                timestamp: Date.now()
            };

            const serialized = JSON.stringify(item);

            // Check if localStorage has space
            if (!this.hasLocalStorageSpace(serialized.length)) {
                await this.cleanupLocalStorage();

                // Try again after cleanup
                if (!this.hasLocalStorageSpace(serialized.length)) {
                    throw new Error('localStorage full');
                }
            }

            localStorage.setItem(this.options.localStorage.keyPrefix + key, serialized);

            // Update tracking
            this.analytics.totalBytes.localStorage += serialized.length;

        } catch (error) {
            console.warn('localStorage set failed:', error);
            throw error;
        }
    }

    async clearLocalStorage() {
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.options.localStorage.keyPrefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        this.analytics.totalBytes.localStorage = 0;
    }

    cleanupLocalStorage() {
        const items = [];

        // Collect all cache items with metadata
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.options.localStorage.keyPrefix)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    items.push({
                        key,
                        timestamp: item.timestamp || 0,
                        expiry: item.expiry || 0,
                        size: localStorage.getItem(key).length
                    });
                } catch (error) {
                    // Remove corrupted items
                    localStorage.removeItem(key);
                }
            }
        }

        const now = Date.now();

        // Remove expired items first
        const expiredItems = items.filter(item => item.expiry > 0 && now > item.expiry);
        expiredItems.forEach(item => {
            localStorage.removeItem(item.key);
            this.analytics.evictions.localStorage++;
        });

        // If still over capacity, remove oldest items
        const remainingItems = items.filter(item => !(item.expiry > 0 && now > item.expiry));
        const currentUsage = remainingItems.reduce((sum, item) => sum + item.size, 0);

        if (currentUsage > this.options.localStorage.maxSize * 0.8) {
            remainingItems.sort((a, b) => a.timestamp - b.timestamp);

            let removedBytes = 0;
            const targetReduction = currentUsage * 0.3; // Remove 30%

            for (const item of remainingItems) {
                localStorage.removeItem(item.key);
                removedBytes += item.size;
                this.analytics.evictions.localStorage++;

                if (removedBytes >= targetReduction) break;
            }
        }
    }

    // Service Worker Cache Implementation

    async getFromServiceWorker(key) {
        if (!this.serviceWorker) return null;

        try {
            // Send message to service worker
            const response = await this.sendServiceWorkerMessage({
                type: 'CACHE_GET',
                key,
                cacheName: this.options.serviceWorker.cacheName
            });

            return response.data || null;

        } catch (error) {
            console.warn('Service worker get failed:', error);
            return null;
        }
    }

    async setToServiceWorker(key, value, options = {}) {
        if (!this.serviceWorker) return;

        try {
            await this.sendServiceWorkerMessage({
                type: 'CACHE_SET',
                key,
                value,
                cacheName: this.options.serviceWorker.cacheName,
                ttl: options.ttl || this.options.serviceWorker.maxAge
            });

        } catch (error) {
            console.warn('Service worker set failed:', error);
            throw error;
        }
    }

    async removeFromServiceWorker(key) {
        if (!this.serviceWorker) return;

        try {
            await this.sendServiceWorkerMessage({
                type: 'CACHE_DELETE',
                key,
                cacheName: this.options.serviceWorker.cacheName
            });

        } catch (error) {
            console.warn('Service worker remove failed:', error);
        }
    }

    async clearServiceWorker() {
        if (!this.serviceWorker) return;

        try {
            await this.sendServiceWorkerMessage({
                type: 'CACHE_CLEAR',
                cacheName: this.options.serviceWorker.cacheName
            });

        } catch (error) {
            console.warn('Service worker clear failed:', error);
        }
    }

    // Progressive Loading Implementation

    async getProgressive(key, options = {}) {
        if (this.loadingPromises.has(key)) {
            return await this.loadingPromises.get(key);
        }

        const loadingPromise = this.loadProgressiveChunks(key, options);
        this.loadingPromises.set(key, loadingPromise);

        try {
            const result = await loadingPromise;
            this.loadingPromises.delete(key);
            return result;
        } catch (error) {
            this.loadingPromises.delete(key);
            throw error;
        }
    }

    async loadProgressiveChunks(key, options = {}) {
        const chunkSize = options.chunkSize || this.options.progressive.chunkSize;
        const chunks = [];
        let chunkIndex = 0;

        while (chunkIndex < this.options.progressive.maxChunks) {
            const chunkKey = `${key}_chunk_${chunkIndex}`;
            const chunk = await this.get(chunkKey, { ...options, progressive: false });

            if (chunk === null) break;

            chunks.push(chunk);
            chunkIndex++;

            // Yield control periodically
            if (chunkIndex % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        // Combine chunks if they're arrays
        if (chunks.length > 0 && Array.isArray(chunks[0])) {
            return chunks.flat();
        }

        return chunks.length === 1 ? chunks[0] : chunks;
    }

    async setProgressive(key, value, options = {}) {
        if (!Array.isArray(value)) return;

        const chunkSize = options.chunkSize || this.options.progressive.chunkSize;
        const chunks = [];

        // Split into chunks
        for (let i = 0; i < value.length; i += chunkSize) {
            chunks.push(value.slice(i, i + chunkSize));
        }

        // Store chunks
        const promises = chunks.map(async (chunk, index) => {
            const chunkKey = `${key}_chunk_${index}`;
            return this.set(chunkKey, chunk, { ...options, progressive: false });
        });

        await Promise.all(promises);

        // Store metadata
        await this.set(`${key}_meta`, {
            totalChunks: chunks.length,
            totalItems: value.length,
            chunkSize
        }, { ...options, progressive: false });
    }

    removeProgressive(key) {
        // This would need to be implemented to remove all chunks
        // For now, we'll just clear the metadata
        this.progressiveLoading.delete(key);
    }

    // Utility Methods

    normalizeKey(key) {
        return typeof key === 'string' ? key : JSON.stringify(key);
    }

    serializeValue(value, options = {}) {
        return JSON.stringify(value);
    }

    compress(data) {
        // Simple compression using JSON minification and base64
        // In production, you might want to use a proper compression library
        const minified = JSON.stringify(data);
        try {
            return btoa(minified);
        } catch (error) {
            return minified;
        }
    }

    decompress(data) {
        try {
            const decompressed = atob(data);
            return JSON.parse(decompressed);
        } catch (error) {
            return JSON.parse(data);
        }
    }

    shouldCompress(value) {
        const serialized = JSON.stringify(value);
        return serialized.length > 1000; // Compress if larger than 1KB
    }

    hasLocalStorageSpace(requiredBytes) {
        try {
            const testKey = '__storage_test__';
            const testData = 'x'.repeat(requiredBytes);
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    getLocalStorageUsage() {
        let usedBytes = 0;
        let cacheBytes = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const item = localStorage.getItem(key);
            usedBytes += key.length + item.length;

            if (key.startsWith(this.options.localStorage.keyPrefix)) {
                cacheBytes += key.length + item.length;
            }
        }

        return { usedBytes, cacheBytes, totalBytes: usedBytes };
    }

    async sendServiceWorkerMessage(message) {
        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                if (event.data.success) {
                    resolve(event.data);
                } else {
                    reject(new Error(event.data.error));
                }
            };

            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
            } else {
                reject(new Error('No service worker controller'));
            }

            // Timeout after 5 seconds
            setTimeout(() => {
                reject(new Error('Service worker message timeout'));
            }, 5000);
        });
    }

    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;

        switch (type) {
            case 'CACHE_UPDATED':
                // Handle cache updates from service worker
                break;
            case 'CACHE_EVICTED':
                // Handle cache evictions
                this.analytics.evictions.serviceWorker = (this.analytics.evictions.serviceWorker || 0) + 1;
                break;
        }
    }

    handleCrossTabCacheSync(event) {
        // Sync memory cache with changes from other tabs
        if (event.newValue && event.key.startsWith(this.options.localStorage.keyPrefix)) {
            const key = event.key.replace(this.options.localStorage.keyPrefix, '');

            try {
                const parsed = JSON.parse(event.newValue);
                const value = parsed.compressed
                    ? this.decompress(parsed.data)
                    : parsed.data;

                // Update memory cache if not present
                if (!this.memoryCache.has(key)) {
                    this.setToMemoryCache(key, value);
                }
            } catch (error) {
                console.warn('Cross-tab cache sync failed:', error);
            }
        }
    }

    updateAccessTime(cacheLevel, time) {
        const key = cacheLevel;
        const current = this.analytics.averageAccessTime.get(key) || { total: 0, count: 0 };
        current.total += time;
        current.count += 1;
        this.analytics.averageAccessTime.set(key, current);
    }

    optimizeCacheForBackground() {
        // Reduce memory cache size when app is backgrounded
        this.cleanupMemoryCache(true);

        // Persist frequently accessed items to localStorage
        const frequentItems = Array.from(this.memoryCacheAccess.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by access time, newest first
            .slice(0, 100); // Top 100 frequently accessed

        frequentItems.forEach(async ([key]) => {
            const value = this.memoryCache.get(key);
            if (value) {
                await this.setToLocalStorage(key, value);
            }
        });
    }

    persistCriticalCache() {
        // Persist critical cache entries before page unload
        const criticalKeys = Array.from(this.memoryCache.keys()).slice(0, 50);

        criticalKeys.forEach(async (key) => {
            const value = this.memoryCache.get(key);
            if (value) {
                try {
                    await this.setToLocalStorage(key, value, { ttl: this.options.localStorage.ttl });
                } catch (error) {
                    // Silent fail during page unload
                }
            }
        });
    }

    // Analytics and Monitoring

    getAnalytics() {
        const memoryHits = this.analytics.hits.memory;
        const memoryMisses = this.analytics.misses.memory;
        const localStorageHits = this.analytics.hits.localStorage;
        const localStorageMisses = this.analytics.misses.localStorage;

        const totalHits = memoryHits + localStorageHits + this.analytics.hits.serviceWorker;
        const totalMisses = memoryMisses + localStorageMisses + this.analytics.misses.serviceWorker;
        const totalAccesses = totalHits + totalMisses;

        const averageAccessTimes = {};
        for (const [level, stats] of this.analytics.averageAccessTime.entries()) {
            averageAccessTimes[level] = stats.count > 0 ? (stats.total / stats.count).toFixed(2) + 'ms' : '0ms';
        }

        return {
            hitRate: {
                overall: totalAccesses > 0 ? ((totalHits / totalAccesses) * 100).toFixed(2) + '%' : '0%',
                memory: (memoryHits + memoryMisses) > 0 ? ((memoryHits / (memoryHits + memoryMisses)) * 100).toFixed(2) + '%' : '0%',
                localStorage: (localStorageHits + localStorageMisses) > 0 ? ((localStorageHits / (localStorageHits + localStorageMisses)) * 100).toFixed(2) + '%' : '0%'
            },
            accessCounts: {
                totalHits,
                totalMisses,
                totalAccesses,
                byLevel: {
                    memory: { hits: memoryHits, misses: memoryMisses },
                    localStorage: { hits: localStorageHits, misses: localStorageMisses },
                    serviceWorker: { hits: this.analytics.hits.serviceWorker, misses: this.analytics.misses.serviceWorker }
                }
            },
            averageAccessTimes,
            evictions: this.analytics.evictions,
            memoryUsage: {
                cacheEntries: this.memoryCache.size,
                maxEntries: this.options.memoryCache.maxSize,
                utilizationRate: ((this.memoryCache.size / this.options.memoryCache.maxSize) * 100).toFixed(2) + '%'
            },
            storageUsage: this.getLocalStorageUsage()
        };
    }

    resetAnalytics() {
        this.analytics = {
            hits: { memory: 0, localStorage: 0, serviceWorker: 0 },
            misses: { memory: 0, localStorage: 0, serviceWorker: 0 },
            writes: { memory: 0, localStorage: 0, serviceWorker: 0 },
            evictions: { memory: 0, localStorage: 0 },
            compressionRatio: 0,
            averageAccessTime: new Map(),
            totalBytes: { memory: 0, localStorage: 0, serviceWorker: 0 }
        };
    }

    // Cleanup and Destroy

    destroy() {
        // Clear all intervals
        this.cleanupIntervals.forEach(interval => clearInterval(interval));
        this.cleanupIntervals.length = 0;

        // Clear all caches
        this.memoryCache.clear();
        this.memoryCacheTimestamps.clear();
        this.memoryCacheAccess.clear();
        this.progressiveLoading.clear();
        this.loadingPromises.clear();

        // Remove event listeners
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.optimizeCacheForBackground);
        }

        if (typeof window !== 'undefined') {
            window.removeEventListener('beforeunload', this.persistCriticalCache);
            window.removeEventListener('storage', this.handleCrossTabCacheSync);
        }

        console.log('CacheManager destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheManager;
} else if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
}