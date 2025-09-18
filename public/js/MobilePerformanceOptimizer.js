/**
 * MobilePerformanceOptimizer.js - Mobile Performance Optimization
 * Handles lazy loading, image optimization, and mobile-specific performance enhancements
 */

class MobilePerformanceOptimizer {
    constructor() {
        this.observers = new Map();
        this.performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0,
            memoryUsage: 0
        };

        this.config = {
            lazyLoadMargin: '50px',
            debounceDelay: 100,
            throttleDelay: 16,
            imageQuality: 0.8,
            prefetchPriority: ['critical', 'high', 'medium', 'low']
        };

        console.log('MobilePerformanceOptimizer initialized');
        this.init();
    }

    /**
     * Initialize performance optimizations
     */
    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupResourcePriority();
        this.setupMemoryOptimization();
        this.setupScrollOptimization();
        this.setupRenderOptimization();
        this.startPerformanceMonitoring();
        this.optimizeForMobile();
    }

    /**
     * Setup lazy loading for images and content
     */
    setupLazyLoading() {
        // Create intersection observer for lazy loading
        const lazyLoadObserver = new IntersectionObserver(
            this.handleLazyLoad.bind(this),
            {
                rootMargin: this.config.lazyLoadMargin,
                threshold: 0.01
            }
        );

        this.observers.set('lazyLoad', lazyLoadObserver);

        // Observe all lazy-loadable elements
        this.observeLazyElements();

        // Setup dynamic content lazy loading
        this.setupDynamicLazyLoading();
    }

    /**
     * Observe elements for lazy loading
     */
    observeLazyElements() {
        const lazyElements = document.querySelectorAll([
            'img[data-src]',
            '[data-lazy]',
            '.results-section',
            '.accessibility-panel',
            '.color-palette'
        ].join(','));

        lazyElements.forEach(element => {
            this.observers.get('lazyLoad').observe(element);
        });
    }

    /**
     * Handle lazy loading intersection
     */
    handleLazyLoad(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                if (element.tagName === 'IMG') {
                    this.lazyLoadImage(element);
                } else if (element.hasAttribute('data-lazy')) {
                    this.lazyLoadContent(element);
                } else {
                    this.lazyLoadSection(element);
                }

                this.observers.get('lazyLoad').unobserve(element);
            }
        });
    }

    /**
     * Lazy load image with optimization
     */
    lazyLoadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // Create optimized image
        const optimizedImg = new Image();

        optimizedImg.onload = () => {
            // Add fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';

            img.src = optimizedImg.src;
            img.removeAttribute('data-src');

            // Trigger fade-in
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });

            // Remove loading placeholder
            img.classList.remove('skeleton-loading');
        };

        optimizedImg.onerror = () => {
            console.warn('Failed to load image:', src);
            img.src = this.generatePlaceholderDataURL();
            img.classList.remove('skeleton-loading');
        };

        // Load optimized image
        optimizedImg.src = this.optimizeImageURL(src);
    }

    /**
     * Lazy load content sections
     */
    lazyLoadContent(element) {
        const contentType = element.getAttribute('data-lazy');

        switch (contentType) {
            case 'color-palette':
                this.loadColorPalette(element);
                break;
            case 'accessibility-features':
                this.loadAccessibilityFeatures(element);
                break;
            case 'advanced-controls':
                this.loadAdvancedControls(element);
                break;
            default:
                this.loadGenericContent(element);
        }

        element.removeAttribute('data-lazy');
    }

    /**
     * Lazy load entire sections
     */
    lazyLoadSection(element) {
        // Add loading state
        element.classList.add('loading');

        // Simulate content loading with progressive enhancement
        requestAnimationFrame(() => {
            element.classList.remove('loading');
            element.classList.add('loaded');
        });
    }

    /**
     * Setup image optimization
     */
    setupImageOptimization() {
        // Optimize existing images
        const images = document.querySelectorAll('img:not([data-src])');
        images.forEach(img => {
            this.optimizeExistingImage(img);
        });

        // Setup responsive images
        this.setupResponsiveImages();

        // Setup WebP support detection
        this.detectWebPSupport();
    }

    /**
     * Setup resource priority optimization
     */
    setupResourcePriority() {
        // Critical resources (above the fold)
        this.prioritizeResources('.header', 'high');
        this.prioritizeResources('.hero', 'high');
        this.prioritizeResources('.color-form', 'high');

        // Important resources
        this.prioritizeResources('.color-pickers-grid', 'medium');
        this.prioritizeResources('.room-preview', 'medium');

        // Lower priority resources
        this.prioritizeResources('.footer', 'low');
        this.prioritizeResources('.accessibility-panel', 'low');
        this.prioritizeResources('.modal', 'low');

        // Preload critical resources
        this.preloadCriticalResources();
    }

    /**
     * Setup memory optimization
     */
    setupMemoryOptimization() {
        // Monitor memory usage
        this.startMemoryMonitoring();

        // Cleanup unused elements
        this.setupElementCleanup();

        // Optimize event listeners
        this.optimizeEventListeners();

        // Setup garbage collection hints
        this.setupGCOptimization();
    }

    /**
     * Setup scroll optimization
     */
    setupScrollOptimization() {
        const scrollHandler = this.throttle(() => {
            this.handleOptimizedScroll();
        }, this.config.throttleDelay);

        window.addEventListener('scroll', scrollHandler, { passive: true });

        // Setup scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }

    /**
     * Setup render optimization
     */
    setupRenderOptimization() {
        // Optimize CSS containment
        this.setupCSSContainment();

        // Setup critical CSS inlining
        this.inlineCriticalCSS();

        // Optimize font loading
        this.optimizeFontLoading();

        // Setup will-change optimization
        this.optimizeWillChange();
    }

    /**
     * Handle optimized scroll events
     */
    handleOptimizedScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Show/hide elements based on scroll position
        this.optimizeVisibilityByScroll(scrollY, windowHeight);

        // Update scroll-dependent animations
        this.updateScrollAnimations(scrollY);

        // Manage resource loading based on scroll
        this.manageScrollBasedLoading(scrollY, windowHeight);
    }

    /**
     * Optimize for mobile devices
     */
    optimizeForMobile() {
        if (!this.isMobileDevice()) return;

        // Disable hover effects on mobile
        this.disableHoverOnMobile();

        // Optimize touch events
        this.optimizeTouchEvents();

        // Setup mobile-specific caching
        this.setupMobileCaching();

        // Optimize for mobile viewport
        this.optimizeMobileViewport();

        // Setup battery optimization
        this.setupBatteryOptimization();
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();

        // Monitor memory usage
        this.monitorMemoryUsage();

        // Monitor frame rate
        this.monitorFrameRate();

        // Monitor network performance
        this.monitorNetworkPerformance();
    }

    /**
     * Optimize image URLs for mobile
     */
    optimizeImageURL(src) {
        if (!src) return src;

        // Add mobile-specific parameters
        const url = new URL(src, window.location.origin);

        // Add format optimization
        if (this.supportsWebP) {
            url.searchParams.set('format', 'webp');
        }

        // Add size optimization for mobile
        if (this.isMobileDevice()) {
            const devicePixelRatio = window.devicePixelRatio || 1;
            const screenWidth = Math.round(window.screen.width * devicePixelRatio);
            url.searchParams.set('w', Math.min(screenWidth, 800));
            url.searchParams.set('q', this.config.imageQuality * 100);
        }

        return url.toString();
    }

    /**
     * Generate placeholder data URL
     */
    generatePlaceholderDataURL(width = 200, height = 200) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Create gradient placeholder
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f3f4f6');
        gradient.addColorStop(1, '#e5e7eb');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add text
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', width / 2, height / 2);

        return canvas.toDataURL('image/jpeg', 0.5);
    }

    /**
     * Setup dynamic lazy loading
     */
    setupDynamicLazyLoading() {
        // Observer for dynamically added content
        const dynamicObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.observeNewLazyElements(node);
                    }
                });
            });
        });

        dynamicObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.set('dynamic', dynamicObserver);
    }

    /**
     * Observe new lazy elements
     */
    observeNewLazyElements(container) {
        const lazyElements = container.querySelectorAll([
            'img[data-src]',
            '[data-lazy]'
        ].join(','));

        lazyElements.forEach(element => {
            this.observers.get('lazyLoad').observe(element);
        });
    }

    /**
     * Utility functions
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    /**
     * Load specific content types
     */
    loadColorPalette(element) {
        console.log('Loading color palette:', element);
        element.classList.add('palette-loaded');
    }

    loadAccessibilityFeatures(element) {
        console.log('Loading accessibility features:', element);
        element.classList.add('accessibility-loaded');
    }

    loadAdvancedControls(element) {
        console.log('Loading advanced controls:', element);
        element.classList.add('controls-loaded');
    }

    loadGenericContent(element) {
        console.log('Loading generic content:', element);
        element.classList.add('content-loaded');
    }

    /**
     * Image optimization functions
     */
    optimizeExistingImage(img) {
        if (img.complete && img.naturalHeight !== 0) {
            // Image already loaded, optimize if needed
            this.addImageOptimizations(img);
        } else {
            img.addEventListener('load', () => {
                this.addImageOptimizations(img);
            }, { once: true });
        }
    }

    addImageOptimizations(img) {
        // Add loading="lazy" if not present
        if (!img.hasAttribute('loading')) {
            img.loading = 'lazy';
        }

        // Add decoding="async" for better performance
        img.decoding = 'async';

        // Add fade-in effect
        if (!img.style.transition) {
            img.style.transition = 'opacity 0.3s ease';
        }
    }

    setupResponsiveImages() {
        const images = document.querySelectorAll('img:not([srcset])');
        images.forEach(img => {
            if (img.src && !img.hasAttribute('data-src')) {
                this.addResponsiveSrcSet(img);
            }
        });
    }

    addResponsiveSrcSet(img) {
        const src = img.src;
        if (!src || src.startsWith('data:')) return;

        const sizes = [320, 640, 768, 1024, 1280];
        const srcSet = sizes.map(size => {
            const optimizedSrc = this.optimizeImageURL(src);
            const url = new URL(optimizedSrc, window.location.origin);
            url.searchParams.set('w', size);
            return `${url.toString()} ${size}w`;
        }).join(', ');

        img.srcset = srcSet;
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }

    detectWebPSupport() {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            this.supportsWebP = webP.height === 2;
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    /**
     * Priority and preloading functions
     */
    prioritizeResources(selector, priority) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.setAttribute('data-priority', priority);

            if (priority === 'high') {
                element.setAttribute('importance', 'high');
            }
        });
    }

    preloadCriticalResources() {
        const criticalImages = document.querySelectorAll('img[data-priority="high"]');
        criticalImages.forEach(img => {
            const src = img.src || img.getAttribute('data-src');
            if (src) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Memory optimization functions
     */
    startMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.performanceMetrics.memoryUsage = memory.usedJSHeapSize;

                // Trigger cleanup if memory usage is high
                if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                    this.triggerMemoryCleanup();
                }
            }, 30000); // Check every 30 seconds
        }
    }

    setupElementCleanup() {
        // Clean up hidden elements
        const cleanupObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    this.cleanupElement(entry.target);
                }
            });
        }, { threshold: 0 });

        // Observe cleanup candidates
        const cleanupCandidates = document.querySelectorAll('.results-section, .accessibility-panel');
        cleanupCandidates.forEach(element => {
            cleanupObserver.observe(element);
        });

        this.observers.set('cleanup', cleanupObserver);
    }

    optimizeEventListeners() {
        // Use passive listeners where possible
        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];

        passiveEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {}, { passive: true });
        });

        // Cleanup old event listeners
        this.cleanupEventListeners();
    }

    setupGCOptimization() {
        // Suggest garbage collection at appropriate times
        if ('gc' in window && typeof window.gc === 'function') {
            // Trigger GC during idle time
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    window.gc();
                });
            }
        }
    }

    /**
     * Performance monitoring functions
     */
    monitorCoreWebVitals() {
        // Monitor Largest Contentful Paint (LCP)
        this.observeLCP();

        // Monitor First Input Delay (FID)
        this.observeFID();

        // Monitor Cumulative Layout Shift (CLS)
        this.observeCLS();
    }

    observeLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
                this.performanceMetrics.renderTime = lastEntry.startTime;
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    observeFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    this.performanceMetrics.interactionTime = entry.processingStart - entry.startTime;
                });
            });

            observer.observe({ entryTypes: ['first-input'] });
        }
    }

    observeCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
            });

            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    /**
     * Mobile-specific optimizations
     */
    disableHoverOnMobile() {
        if (this.isMobileDevice()) {
            document.documentElement.classList.add('no-hover');
        }
    }

    optimizeTouchEvents() {
        // Prevent default touch behaviors that can cause performance issues
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
        document.addEventListener('touchend', () => {}, { passive: true });
    }

    setupMobileCaching() {
        // Implement mobile-specific caching strategies
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('mobile-optimization');
            });
        }
    }

    optimizeMobileViewport() {
        // Optimize viewport for mobile performance
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport && this.isMobileDevice()) {
            // Add user-scalable=no for better performance in some cases
            const content = viewport.getAttribute('content');
            if (!content.includes('user-scalable')) {
                viewport.setAttribute('content', content + ', user-scalable=no');
            }
        }
    }

    setupBatteryOptimization() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2) { // Low battery
                    this.enablePowerSaveMode();
                }

                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2) {
                        this.enablePowerSaveMode();
                    } else {
                        this.disablePowerSaveMode();
                    }
                });
            });
        }
    }

    enablePowerSaveMode() {
        console.log('Enabling power save mode');
        document.documentElement.classList.add('power-save-mode');

        // Reduce animation and disable non-essential features
        this.config.debounceDelay *= 2;
        this.config.throttleDelay *= 2;
    }

    disablePowerSaveMode() {
        console.log('Disabling power save mode');
        document.documentElement.classList.remove('power-save-mode');

        // Restore normal performance settings
        this.config.debounceDelay /= 2;
        this.config.throttleDelay /= 2;
    }

    /**
     * Cleanup and utility functions
     */
    cleanupElement(element) {
        // Remove event listeners from element
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
    }

    cleanupEventListeners() {
        // Remove unused event listeners
        // Implementation depends on specific event tracking
    }

    triggerMemoryCleanup() {
        console.log('Triggering memory cleanup');

        // Clean up observers
        this.observers.forEach(observer => {
            if (typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });

        // Force garbage collection if available
        if ('gc' in window && typeof window.gc === 'function') {
            window.gc();
        }
    }

    /**
     * CSS and rendering optimizations
     */
    setupCSSContainment() {
        const containElements = document.querySelectorAll([
            '.results-section',
            '.color-palette',
            '.accessibility-panel',
            '.modal-content'
        ].join(','));

        containElements.forEach(element => {
            element.style.contain = 'layout style paint';
        });
    }

    inlineCriticalCSS() {
        // This would typically be done during build process
        // Here we can add critical styles directly
        const criticalCSS = `
            .header { contain: layout; }
            .hero { contain: layout; }
            .color-form { contain: layout; }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    }

    optimizeFontLoading() {
        // Optimize font loading strategy
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                console.log('Fonts loaded');
                document.documentElement.classList.add('fonts-loaded');
            });
        }
    }

    optimizeWillChange() {
        const animatedElements = document.querySelectorAll([
            '.btn',
            '.color-preview',
            '.modal-content',
            '.toast'
        ].join(','));

        animatedElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.willChange = 'transform, opacity';
            }, { once: true });

            element.addEventListener('animationend', () => {
                element.style.willChange = 'auto';
            }, { once: true });
        });
    }

    // Additional optimization methods can be added here
    destroy() {
        // Cleanup all observers and event listeners
        this.observers.forEach(observer => {
            if (typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        this.observers.clear();
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobilePerformanceOptimizer = new MobilePerformanceOptimizer();
    });
} else {
    window.mobilePerformanceOptimizer = new MobilePerformanceOptimizer();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobilePerformanceOptimizer;
}