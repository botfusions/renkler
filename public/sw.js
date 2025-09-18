/**
 * Service Worker for Sanzo Color Advisor PWA
 * Provides comprehensive offline functionality, caching, and mobile optimizations
 */

const CACHE_NAME = 'sanzo-color-advisor-v1.3.0';
const DYNAMIC_CACHE_NAME = 'sanzo-dynamic-v1.3.0';
const API_CACHE_NAME = 'sanzo-api-v1.3.0';
const OFFLINE_URL = '/offline.html';

// Core files to cache for offline functionality
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/styles.css',
    '/css/mobile-responsive.css',
    '/accessibility.css',
    '/js/App.js',
    '/js/ColorPicker.js',
    '/js/MobileTouchHandler.js',
    '/js/ApiClient.js',
    '/js/ResultDisplay.js',
    '/js/AccessibilityController.js',
    '/js/AccessibilityUtils.js',
    '/js/ScreenReaderEnhanced.js',
    '/js/ColorBlindnessAdvanced.js',
    '/js/AccessibilityTester.js',
    '/js/AccessibilityValidator.js',
    '/js/i18n.js',
    '/js/LocalizedColorData.js',
    '/js/UILocalizer.js',
    '/js/LanguageSwitcher.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Dynamic cache for API responses
const API_CACHE_NAME = 'sanzo-api-cache-v1';
const API_CACHE_URLS = [
    '/api/health',
    '/api/color-combinations',
    '/api/room-suggestions'
];

// Image and asset cache
const ASSET_CACHE_NAME = 'sanzo-assets-v1';

// Color database for offline use
const OFFLINE_COLOR_DATA = {
    combinations: [
        // Essential Sanzo Wada combinations for offline use
        {
            id: 'classic-1',
            name: 'Classic Harmony',
            colors: ['#8B4513', '#F5F5DC', '#CD853F', '#DEB887'],
            description: 'Warm, earthy tones inspired by natural materials',
            suitableFor: ['living_room', 'bedroom', 'study']
        },
        {
            id: 'modern-1',
            name: 'Modern Minimalism',
            colors: ['#FFFFFF', '#F8F8F8', '#E0E0E0', '#B0B0B0'],
            description: 'Clean, contemporary palette for modern spaces',
            suitableFor: ['bathroom', 'study', 'living_room']
        },
        {
            id: 'vibrant-1',
            name: 'Vibrant Energy',
            colors: ['#FF6347', '#FFD700', '#32CD32', '#1E90FF'],
            description: 'Energetic colors perfect for active spaces',
            suitableFor: ['playroom', 'child_bedroom', 'dining_room']
        },
        {
            id: 'calm-1',
            name: 'Serene Waters',
            colors: ['#E6F3FF', '#B3D9FF', '#80BFFF', '#4D9AFF'],
            description: 'Calming blues for relaxation and focus',
            suitableFor: ['bedroom', 'bathroom', 'study']
        },
        {
            id: 'nature-1',
            name: 'Forest Retreat',
            colors: ['#228B22', '#90EE90', '#F5FFFA', '#8FBC8F'],
            description: 'Nature-inspired greens for tranquility',
            suitableFor: ['living_room', 'bedroom', 'study']
        }
    ],
    roomTypes: {
        living_room: {
            recommendations: ['Classic Harmony', 'Modern Minimalism', 'Forest Retreat'],
            psychologicalEffects: ['Comfort', 'Social interaction', 'Relaxation']
        },
        bedroom: {
            recommendations: ['Serene Waters', 'Classic Harmony', 'Forest Retreat'],
            psychologicalEffects: ['Rest', 'Calm', 'Peace']
        },
        child_bedroom: {
            recommendations: ['Vibrant Energy', 'Serene Waters'],
            psychologicalEffects: ['Creativity', 'Playfulness', 'Focus']
        },
        study: {
            recommendations: ['Modern Minimalism', 'Serene Waters', 'Forest Retreat'],
            psychologicalEffects: ['Focus', 'Productivity', 'Clarity']
        },
        dining_room: {
            recommendations: ['Classic Harmony', 'Vibrant Energy'],
            psychologicalEffects: ['Appetite', 'Social interaction', 'Warmth']
        },
        bathroom: {
            recommendations: ['Modern Minimalism', 'Serene Waters'],
            psychologicalEffects: ['Cleanliness', 'Freshness', 'Calm']
        },
        playroom: {
            recommendations: ['Vibrant Energy'],
            psychologicalEffects: ['Energy', 'Creativity', 'Fun']
        }
    }
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        Promise.all([
            // Cache static resources
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_URLS);
            }),

            // Cache offline color data
            caches.open('offline-data').then((cache) => {
                const offlineDataResponse = new Response(
                    JSON.stringify(OFFLINE_COLOR_DATA),
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                return cache.put('/api/offline-colors', offlineDataResponse);
            })
        ])
    );

    // Force activation of new service worker
    self.skipWaiting();
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME &&
                            cacheName !== API_CACHE_NAME &&
                            cacheName !== ASSET_CACHE_NAME &&
                            cacheName !== 'offline-data') {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Take control of all pages
            self.clients.claim()
        ])
    );
});

/**
 * Fetch Event Handler - Network requests interception
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method === 'GET') {
        // API requests
        if (url.pathname.startsWith('/api/')) {
            event.respondWith(handleApiRequest(request));
        }
        // Static assets
        else if (url.pathname.match(/\.(css|js|html|png|jpg|jpeg|svg|ico|woff2?|ttf|eot)$/)) {
            event.respondWith(handleStaticAsset(request));
        }
        // HTML pages
        else {
            event.respondWith(handlePageRequest(request));
        }
    }
});

/**
 * Handle API requests with offline fallback
 */
async function handleApiRequest(request) {
    const url = new URL(request.url);

    try {
        // Try network first for fresh data
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful API responses
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }

        throw new Error('Network response not ok');

    } catch (error) {
        console.log('Service Worker: Network failed, trying cache for:', url.pathname);

        // Try cached version
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback to offline data for color combinations
        if (url.pathname.includes('color-combinations') || url.pathname.includes('room-suggestions')) {
            return handleOfflineColorRequest(url);
        }

        // Return offline response for other API requests
        return new Response(
            JSON.stringify({
                error: 'Offline - Service temporarily unavailable',
                offline: true,
                timestamp: new Date().toISOString()
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle offline color analysis requests
 */
async function handleOfflineColorRequest(url) {
    const searchParams = url.searchParams;
    const roomType = searchParams.get('roomType') || 'living_room';
    const ageGroup = searchParams.get('ageGroup') || 'adult';

    const offlineCache = await caches.open('offline-data');
    const cachedData = await offlineCache.match('/api/offline-colors');
    const colorData = await cachedData.json();

    // Simple offline analysis logic
    const suitableCombinations = colorData.combinations.filter(combo =>
        combo.suitableFor.includes(roomType)
    );

    const selectedCombination = suitableCombinations[Math.floor(Math.random() * suitableCombinations.length)] ||
                               colorData.combinations[0];

    const roomInfo = colorData.roomTypes[roomType] || colorData.roomTypes.living_room;

    const offlineResponse = {
        success: true,
        offline: true,
        data: {
            combination: selectedCombination,
            roomType: roomType,
            ageGroup: ageGroup,
            psychologicalEffects: roomInfo.psychologicalEffects,
            confidence: 0.75, // Lower confidence for offline analysis
            recommendations: [
                {
                    type: 'wall',
                    color: selectedCombination.colors[0],
                    name: 'Primary Wall Color',
                    description: 'Recommended main wall color for your space'
                },
                {
                    type: 'accent',
                    color: selectedCombination.colors[1],
                    name: 'Accent Color',
                    description: 'Perfect for decorative elements and highlights'
                },
                {
                    type: 'furniture',
                    color: selectedCombination.colors[2],
                    name: 'Furniture Tone',
                    description: 'Complementary color for furniture pieces'
                },
                {
                    type: 'trim',
                    color: selectedCombination.colors[3],
                    name: 'Trim & Details',
                    description: 'Ideal for trim, molding, and architectural details'
                }
            ],
            tips: [
                'Colors analyzed offline using cached Sanzo Wada principles',
                'For best results, reconnect to internet for full AI analysis',
                'Consider natural lighting when implementing these colors',
                'Test colors in small areas before full application'
            ],
            timestamp: new Date().toISOString()
        }
    };

    return new Response(
        JSON.stringify(offlineResponse),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

/**
 * Handle static asset requests
 */
async function handleStaticAsset(request) {
    try {
        // Try cache first for static assets
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If not in cache, try network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache the asset
            const cache = await caches.open(ASSET_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;

    } catch (error) {
        console.log('Service Worker: Failed to load asset:', request.url);

        // Return a placeholder or cached version
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Asset not available offline', { status: 404 });
    }
}

/**
 * Handle page requests
 */
async function handlePageRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            return networkResponse;
        }

        throw new Error('Network response not ok');

    } catch (error) {
        console.log('Service Worker: Page request failed, serving from cache or offline page');

        // Try cached version
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Serve offline page
        const offlineResponse = await caches.match(OFFLINE_URL);
        return offlineResponse || new Response('Offline - Page not available', { status: 404 });
    }
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered:', event.tag);

    if (event.tag === 'sync-color-analysis') {
        event.waitUntil(syncColorAnalysis());
    } else if (event.tag === 'sync-user-preferences') {
        event.waitUntil(syncUserPreferences());
    }
});

/**
 * Sync color analysis when back online
 */
async function syncColorAnalysis() {
    try {
        // Get pending analysis from IndexedDB
        const pendingAnalyses = await getPendingAnalyses();

        for (const analysis of pendingAnalyses) {
            try {
                const response = await fetch('/api/color-combinations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(analysis.data)
                });

                if (response.ok) {
                    await removePendingAnalysis(analysis.id);

                    // Notify all clients
                    const clients = await self.clients.matchAll();
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'ANALYSIS_SYNCED',
                            data: analysis
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to sync analysis:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

/**
 * Sync user preferences
 */
async function syncUserPreferences() {
    // Implementation for syncing user preferences
    console.log('Syncing user preferences...');
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');

    let notificationData = {
        title: 'Sanzo Color Advisor',
        body: 'New color inspiration available!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'color-inspiration',
        data: {
            url: '/'
        }
    };

    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clients) => {
                // Check if app is already open
                for (const client of clients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Open new window/tab
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);

    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_COLOR_ANALYSIS':
            event.waitUntil(cacheColorAnalysis(data));
            break;

        case 'GET_CACHE_STATUS':
            event.waitUntil(getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            }));
            break;

        default:
            console.log('Unknown message type:', type);
    }
});

/**
 * Cache color analysis result
 */
async function cacheColorAnalysis(analysisData) {
    try {
        const cache = await caches.open(API_CACHE_NAME);
        const cacheKey = `/api/color-analysis-${Date.now()}`;

        const response = new Response(
            JSON.stringify(analysisData),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        await cache.put(cacheKey, response);
        console.log('Color analysis cached:', cacheKey);

    } catch (error) {
        console.error('Failed to cache color analysis:', error);
    }
}

/**
 * Get cache status information
 */
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {
            caches: cacheNames.length,
            totalSize: 0,
            lastUpdate: new Date().toISOString()
        };

        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            status.totalSize += keys.length;
        }

        return status;

    } catch (error) {
        console.error('Failed to get cache status:', error);
        return { error: 'Failed to get cache status' };
    }
}

/**
 * Utility functions for IndexedDB operations
 */

async function getPendingAnalyses() {
    // Implementation for getting pending analyses from IndexedDB
    return [];
}

async function removePendingAnalysis(id) {
    // Implementation for removing analysis from IndexedDB
    console.log('Removing pending analysis:', id);
}

/**
 * Periodic cache cleanup
 */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

async function cleanupOldCaches() {
    try {
        const cache = await caches.open(API_CACHE_NAME);
        const requests = await cache.keys();

        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days

        for (const request of requests) {
            const response = await cache.match(request);
            const dateHeader = response.headers.get('date');

            if (dateHeader && new Date(dateHeader).getTime() < cutoffTime) {
                await cache.delete(request);
                console.log('Cleaned up old cache entry:', request.url);
            }
        }
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}

console.log('Service Worker: Registered successfully');