/**
 * MobileTouchHandler.js - Advanced Touch Gesture Support
 * Implements comprehensive touch interactions for mobile color picking
 */

class MobileTouchHandler {
    constructor() {
        this.touchStartTime = 0;
        this.lastTap = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.touchMovePos = { x: 0, y: 0 };
        this.isScrolling = false;
        this.gestureState = 'idle';

        // Configuration
        this.config = {
            doubleTapDelay: 300,
            longPressDelay: 500,
            swipeThreshold: 50,
            pinchThreshold: 10,
            tapTimeout: 100,
            scrollTimeout: 150
        };

        // Gesture detection
        this.gestures = {
            tap: false,
            doubleTap: false,
            longPress: false,
            swipe: false,
            pinch: false,
            pan: false
        };

        this.eventHandlers = new Map();
        this.activeElement = null;
        this.longPressTimer = null;
        this.doubleTapTimer = null;

        console.log('MobileTouchHandler initialized');
        this.init();
    }

    /**
     * Initialize touch handler
     */
    init() {
        this.setupEventListeners();
        this.setupColorPickerTouch();
        this.setupPaletteTouch();
        this.setupModalTouch();
        this.setupPreventDefaults();
    }

    /**
     * Set up basic event listeners
     */
    setupEventListeners() {
        // Passive listeners for better performance
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });

        // Gesture-specific listeners
        document.addEventListener('gesturestart', this.handleGestureStart.bind(this), { passive: false });
        document.addEventListener('gesturechange', this.handleGestureChange.bind(this), { passive: false });
        document.addEventListener('gestureend', this.handleGestureEnd.bind(this), { passive: false });

        // Pointer events for better cross-device support
        if (window.PointerEvent) {
            document.addEventListener('pointerdown', this.handlePointerDown.bind(this), { passive: false });
            document.addEventListener('pointermove', this.handlePointerMove.bind(this), { passive: false });
            document.addEventListener('pointerup', this.handlePointerUp.bind(this), { passive: false });
        }

        // Prevent context menu on long press
        document.addEventListener('contextmenu', this.preventContextMenu.bind(this), { passive: false });
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        this.touchStartTime = Date.now();
        this.activeElement = event.target;

        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStartPos = { x: touch.clientX, y: touch.clientY };
            this.touchMovePos = { x: touch.clientX, y: touch.clientY };

            // Start long press detection
            this.startLongPressDetection();

            // Handle double tap detection
            this.handleDoubleTapDetection();
        }

        // Handle color picker specific touches
        if (this.isColorPickerElement(event.target)) {
            this.handleColorPickerTouchStart(event);
        }

        // Handle palette specific touches
        if (this.isPaletteElement(event.target)) {
            this.handlePaletteTouchStart(event);
        }
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchMovePos = { x: touch.clientX, y: touch.clientY };

            // Calculate movement distance
            const deltaX = this.touchMovePos.x - this.touchStartPos.x;
            const deltaY = this.touchMovePos.y - this.touchStartPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Cancel long press if moved too much
            if (distance > 10) {
                this.cancelLongPress();
            }

            // Handle scrolling detection
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
                this.isScrolling = true;
            }

            // Handle color picker dragging
            if (this.isColorPickerElement(this.activeElement)) {
                this.handleColorPickerTouchMove(event);
            }

            // Handle palette swiping
            if (this.isPaletteElement(this.activeElement)) {
                this.handlePaletteSwipe(event, deltaX, deltaY);
            }
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        const touchDuration = Date.now() - this.touchStartTime;
        const deltaX = this.touchMovePos.x - this.touchStartPos.x;
        const deltaY = this.touchMovePos.y - this.touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        this.cancelLongPress();

        // Determine gesture type
        if (touchDuration < this.config.tapTimeout && distance < 10) {
            this.handleTap(event);
        } else if (distance > this.config.swipeThreshold) {
            this.handleSwipe(event, deltaX, deltaY);
        }

        // Handle color picker specific end
        if (this.isColorPickerElement(this.activeElement)) {
            this.handleColorPickerTouchEnd(event);
        }

        // Reset state
        this.resetGestureState();
    }

    /**
     * Handle touch cancel
     */
    handleTouchCancel(event) {
        this.cancelLongPress();
        this.resetGestureState();
    }

    /**
     * Setup color picker touch interactions
     */
    setupColorPickerTouch() {
        const colorInputs = document.querySelectorAll('.color-input, .color-preview');

        colorInputs.forEach(input => {
            // Enhanced touch feedback
            input.addEventListener('touchstart', (e) => {
                input.classList.add('touch-active');
                this.addHapticFeedback('light');
            }, { passive: true });

            input.addEventListener('touchend', (e) => {
                input.classList.remove('touch-active');
            }, { passive: true });

            // Long press for color info
            this.addLongPressHandler(input, (e) => {
                this.showColorInfo(input);
            });

            // Double tap for favorites
            this.addDoubleTapHandler(input, (e) => {
                this.toggleColorFavorite(input);
            });
        });
    }

    /**
     * Setup palette touch interactions
     */
    setupPaletteTouch() {
        const palettes = document.querySelectorAll('.color-palette, .swatch-container');

        palettes.forEach(palette => {
            // Swipe gestures for navigation
            this.addSwipeHandler(palette, {
                left: () => this.navigatePalette('next'),
                right: () => this.navigatePalette('prev'),
                up: () => this.navigatePalette('category-next'),
                down: () => this.navigatePalette('category-prev')
            });

            // Pinch-to-zoom for palette
            this.addPinchHandler(palette, {
                scale: (scale) => this.scalePalette(palette, scale),
                end: () => this.resetPaletteScale(palette)
            });
        });

        // Individual swatch interactions
        const swatches = document.querySelectorAll('.swatch-color, .color-preview');
        swatches.forEach(swatch => {
            // Tap to select
            this.addTapHandler(swatch, (e) => {
                this.selectSwatch(swatch);
                this.addHapticFeedback('medium');
            });

            // Long press for actions menu
            this.addLongPressHandler(swatch, (e) => {
                this.showSwatchActions(swatch, e);
            });
        });
    }

    /**
     * Setup modal touch interactions
     */
    setupModalTouch() {
        const modals = document.querySelectorAll('.modal, .accessibility-panel');

        modals.forEach(modal => {
            // Swipe down to close
            this.addSwipeHandler(modal, {
                down: (e) => {
                    if (e.target === modal || modal.querySelector('.modal-content').contains(e.target)) {
                        this.closeModal(modal);
                    }
                }
            });

            // Pull to refresh gesture in modal content
            const modalBody = modal.querySelector('.modal-body, .panel-body');
            if (modalBody) {
                this.addPullToRefreshHandler(modalBody);
            }
        });
    }

    /**
     * Color picker touch start handler
     */
    handleColorPickerTouchStart(event) {
        event.preventDefault();
        const element = event.target;

        // Add visual feedback
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.1s ease';

        // Show color picker helper
        this.showColorPickerHelper(element);
    }

    /**
     * Color picker touch move handler
     */
    handleColorPickerTouchMove(event) {
        // Implement fine color adjustment with drag
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.touchStartPos.x;
            const deltaY = touch.clientY - this.touchStartPos.y;

            // Adjust hue with horizontal movement
            const hueAdjustment = deltaX * 0.5;

            // Adjust lightness with vertical movement
            const lightnessAdjustment = -deltaY * 0.1;

            this.adjustColorWithGesture(event.target, hueAdjustment, lightnessAdjustment);
        }
    }

    /**
     * Color picker touch end handler
     */
    handleColorPickerTouchEnd(event) {
        const element = event.target;

        // Reset visual feedback
        element.style.transform = '';
        element.style.transition = '';

        // Hide color picker helper
        this.hideColorPickerHelper();

        // Trigger color change event
        this.triggerColorChangeEvent(element);
    }

    /**
     * Handle palette swipe
     */
    handlePaletteSwipe(event, deltaX, deltaY) {
        const threshold = this.config.swipeThreshold;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > threshold) {
                event.preventDefault();
                const direction = deltaX > 0 ? 'right' : 'left';
                this.handlePaletteNavigation(direction);
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > threshold) {
                event.preventDefault();
                const direction = deltaY > 0 ? 'down' : 'up';
                this.handlePaletteNavigation(direction);
            }
        }
    }

    /**
     * Add haptic feedback
     */
    addHapticFeedback(intensity = 'medium') {
        if ('vibrate' in navigator) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 50
            };
            navigator.vibrate(patterns[intensity] || patterns.medium);
        }
    }

    /**
     * Add long press handler
     */
    addLongPressHandler(element, callback) {
        let longPressTimer;

        element.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                callback(e);
                this.addHapticFeedback('heavy');
            }, this.config.longPressDelay);
        }, { passive: true });

        element.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        }, { passive: true });

        element.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        }, { passive: true });
    }

    /**
     * Add double tap handler
     */
    addDoubleTapHandler(element, callback) {
        let lastTap = 0;

        element.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            const tapGap = currentTime - lastTap;

            if (tapGap < this.config.doubleTapDelay && tapGap > 50) {
                callback(e);
                this.addHapticFeedback('medium');
            }

            lastTap = currentTime;
        }, { passive: true });
    }

    /**
     * Add swipe handler
     */
    addSwipeHandler(element, callbacks) {
        let startX, startY, endX, endY;

        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            endX = touch.clientX;
            endY = touch.clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > this.config.swipeThreshold) {
                const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

                if (angle >= -45 && angle <= 45 && callbacks.right) {
                    callbacks.right(e);
                } else if (angle >= 135 || angle <= -135 && callbacks.left) {
                    callbacks.left(e);
                } else if (angle >= 45 && angle <= 135 && callbacks.down) {
                    callbacks.down(e);
                } else if (angle >= -135 && angle <= -45 && callbacks.up) {
                    callbacks.up(e);
                }
            }
        }, { passive: true });
    }

    /**
     * Add pinch handler
     */
    addPinchHandler(element, callbacks) {
        let initialDistance = 0;

        element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;

                if (callbacks.scale) {
                    callbacks.scale(scale);
                }
            }
        }, { passive: false });

        element.addEventListener('touchend', (e) => {
            if (callbacks.end) {
                callbacks.end(e);
            }
        }, { passive: true });
    }

    /**
     * Add tap handler
     */
    addTapHandler(element, callback) {
        element.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - this.touchStartTime;

            if (touchDuration < this.config.tapTimeout) {
                callback(e);
            }
        }, { passive: true });
    }

    /**
     * Utility functions
     */
    isColorPickerElement(element) {
        return element.matches('.color-input, .color-preview, .hex-input') ||
               element.closest('.color-picker-group, .color-input-wrapper');
    }

    isPaletteElement(element) {
        return element.matches('.color-palette, .swatch-container, .swatch-color') ||
               element.closest('.color-palette, .results-container');
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    preventContextMenu(event) {
        if (event.target.closest('.color-input, .color-preview, .swatch-color')) {
            event.preventDefault();
        }
    }

    startLongPressDetection() {
        this.longPressTimer = setTimeout(() => {
            this.handleLongPress();
        }, this.config.longPressDelay);
    }

    cancelLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    handleLongPress() {
        this.gestures.longPress = true;
        this.addHapticFeedback('heavy');

        if (this.isColorPickerElement(this.activeElement)) {
            this.showColorActions(this.activeElement);
        }
    }

    resetGestureState() {
        this.gestureState = 'idle';
        this.isScrolling = false;
        this.activeElement = null;
        Object.keys(this.gestures).forEach(key => {
            this.gestures[key] = false;
        });
    }

    // Implementation stubs for UI actions
    showColorInfo(element) {
        console.log('Showing color info for:', element);
        // Implementation depends on existing color picker component
    }

    toggleColorFavorite(element) {
        console.log('Toggling favorite for:', element);
        // Implementation depends on existing favorites system
    }

    navigatePalette(direction) {
        console.log('Navigating palette:', direction);
        // Implementation depends on existing palette navigation
    }

    scalePalette(palette, scale) {
        palette.style.transform = `scale(${Math.max(0.5, Math.min(2, scale))})`;
    }

    resetPaletteScale(palette) {
        palette.style.transform = '';
    }

    selectSwatch(swatch) {
        console.log('Selecting swatch:', swatch);
        // Implementation depends on existing swatch selection
    }

    showSwatchActions(swatch, event) {
        console.log('Showing swatch actions for:', swatch);
        // Implementation depends on existing action menu system
    }

    closeModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    showColorPickerHelper(element) {
        console.log('Showing color picker helper for:', element);
        // Implementation depends on existing helper system
    }

    hideColorPickerHelper() {
        console.log('Hiding color picker helper');
        // Implementation depends on existing helper system
    }

    adjustColorWithGesture(element, hueAdjustment, lightnessAdjustment) {
        console.log('Adjusting color with gesture:', hueAdjustment, lightnessAdjustment);
        // Implementation depends on existing color adjustment system
    }

    triggerColorChangeEvent(element) {
        const event = new CustomEvent('colorchange', {
            detail: { element: element },
            bubbles: true
        });
        element.dispatchEvent(event);
    }

    handleTap(event) {
        console.log('Tap detected on:', event.target);
    }

    handleSwipe(event, deltaX, deltaY) {
        console.log('Swipe detected:', deltaX, deltaY);
    }

    handleDoubleTapDetection() {
        const currentTime = Date.now();
        const tapGap = currentTime - this.lastTap;

        if (tapGap < this.config.doubleTapDelay && tapGap > 50) {
            this.gestures.doubleTap = true;
        }

        this.lastTap = currentTime;
    }

    handlePaletteNavigation(direction) {
        console.log('Palette navigation:', direction);
        // Implementation depends on existing navigation system
    }

    setupPreventDefaults() {
        // Prevent zoom on double tap for color elements
        const colorElements = document.querySelectorAll('.color-input, .color-preview, .swatch-color');
        colorElements.forEach(element => {
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    }

    // Gesture event handlers for Safari
    handleGestureStart(event) {
        event.preventDefault();
    }

    handleGestureChange(event) {
        event.preventDefault();

        const element = event.target.closest('.color-palette, .room-preview');
        if (element) {
            this.scalePalette(element, event.scale);
        }
    }

    handleGestureEnd(event) {
        event.preventDefault();

        const element = event.target.closest('.color-palette, .room-preview');
        if (element) {
            this.resetPaletteScale(element);
        }
    }

    // Pointer event handlers for better device support
    handlePointerDown(event) {
        if (event.pointerType === 'touch') {
            this.handleTouchStart(event);
        }
    }

    handlePointerMove(event) {
        if (event.pointerType === 'touch') {
            this.handleTouchMove(event);
        }
    }

    handlePointerUp(event) {
        if (event.pointerType === 'touch') {
            this.handleTouchEnd(event);
        }
    }

    addPullToRefreshHandler(element) {
        let startY = 0;
        let pullThreshold = 80;
        let isPulling = false;

        element.addEventListener('touchstart', (e) => {
            if (element.scrollTop === 0) {
                startY = e.touches[0].clientY;
            }
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (element.scrollTop === 0) {
                const currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;

                if (pullDistance > 0) {
                    isPulling = true;
                    element.style.transform = `translateY(${Math.min(pullDistance / 2, pullThreshold)}px)`;

                    if (pullDistance > pullThreshold) {
                        element.classList.add('pull-refresh-ready');
                    }
                }
            }
        }, { passive: false });

        element.addEventListener('touchend', (e) => {
            if (isPulling) {
                element.style.transform = '';

                if (element.classList.contains('pull-refresh-ready')) {
                    element.classList.remove('pull-refresh-ready');
                    this.triggerRefresh();
                }

                isPulling = false;
            }
        }, { passive: true });
    }

    triggerRefresh() {
        console.log('Pull to refresh triggered');
        // Implementation depends on existing refresh functionality
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileTouchHandler = new MobileTouchHandler();
    });
} else {
    window.mobileTouchHandler = new MobileTouchHandler();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileTouchHandler;
}