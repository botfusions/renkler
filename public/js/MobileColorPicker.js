/**
 * MobileColorPicker.js - Advanced Mobile-Optimized Color Picker
 * Includes touch gestures, haptic feedback, and camera integration
 */

class MobileColorPicker extends ColorPicker {
    constructor() {
        super();

        this.isMobile = this.detectMobileDevice();
        this.touchState = {
            isActive: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            scale: 1,
            initialDistance: 0,
            gestureStartTime: 0
        };

        this.mobileFeatures = {
            hapticFeedback: 'vibrate' in navigator,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            camera: null,
            colorCapture: null
        };

        this.initializeMobileFeatures();
    }

    /**
     * Detect if running on mobile device
     */
    detectMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Check for mobile user agents
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const isMobileUA = mobileRegex.test(userAgent);

        // Check for touch support
        const isTouchDevice = 'ontouchstart' in window ||
                             navigator.maxTouchPoints > 0 ||
                             navigator.msMaxTouchPoints > 0;

        // Check viewport width
        const isMobileViewport = window.innerWidth <= 768;

        return isMobileUA || (isTouchDevice && isMobileViewport);
    }

    /**
     * Initialize mobile-specific features
     */
    async initializeMobileFeatures() {
        if (!this.isMobile) return;

        console.log('Initializing mobile color picker features...');

        // Initialize touch gestures
        this.setupTouchGestures();

        // Initialize haptic feedback
        this.setupHapticFeedback();

        // Initialize camera integration
        await this.initializeCameraFeatures();

        // Initialize device orientation support
        this.setupOrientationSupport();

        // Initialize mobile-specific UI enhancements
        this.setupMobileUI();

        // Initialize swipe gestures for navigation
        this.setupSwipeNavigation();

        console.log('Mobile color picker features initialized');
    }

    /**
     * Set up touch gesture handling
     */
    setupTouchGestures() {
        const colorPreviews = document.querySelectorAll('.color-preview');
        const colorPickers = document.querySelectorAll('.color-input');

        [...colorPreviews, ...colorPickers].forEach(element => {
            // Touch start
            element.addEventListener('touchstart', (e) => {
                this.handleTouchStart(e, element);
            }, { passive: false });

            // Touch move
            element.addEventListener('touchmove', (e) => {
                this.handleTouchMove(e, element);
            }, { passive: false });

            // Touch end
            element.addEventListener('touchend', (e) => {
                this.handleTouchEnd(e, element);
            }, { passive: false });

            // Touch cancel
            element.addEventListener('touchcancel', (e) => {
                this.handleTouchCancel(e, element);
            }, { passive: false });

            // Double tap for advanced color picker
            element.addEventListener('touchend', this.debounce((e) => {
                this.handleDoubleTap(e, element);
            }, 300));
        });

        // Pinch-to-zoom for room preview
        const roomPreview = document.getElementById('room-preview');
        if (roomPreview) {
            this.setupPinchZoom(roomPreview);
        }
    }

    /**
     * Handle touch start event
     */
    handleTouchStart(e, element) {
        e.preventDefault();

        const touch = e.touches[0];
        this.touchState = {
            isActive: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            scale: 1,
            gestureStartTime: Date.now()
        };

        // Add active state styling
        element.classList.add('touch-active');

        // Haptic feedback on touch start
        this.triggerHapticFeedback('light');

        // If multi-touch, prepare for pinch gesture
        if (e.touches.length === 2) {
            this.touchState.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        }
    }

    /**
     * Handle touch move event
     */
    handleTouchMove(e, element) {
        if (!this.touchState.isActive) return;

        e.preventDefault();

        const touch = e.touches[0];
        this.touchState.currentX = touch.clientX;
        this.touchState.currentY = touch.clientY;

        // Calculate movement delta
        const deltaX = this.touchState.currentX - this.touchState.startX;
        const deltaY = this.touchState.currentY - this.touchState.startY;

        // Handle pinch gesture for zoom
        if (e.touches.length === 2) {
            this.handlePinchGesture(e, element);
        } else if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            // Handle swipe gesture
            this.handleSwipeGesture(deltaX, deltaY, element);
        }
    }

    /**
     * Handle touch end event
     */
    handleTouchEnd(e, element) {
        if (!this.touchState.isActive) return;

        const gestureDuration = Date.now() - this.touchState.gestureStartTime;
        const deltaX = this.touchState.currentX - this.touchState.startX;
        const deltaY = this.touchState.currentY - this.touchState.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Determine gesture type
        if (distance < 10 && gestureDuration < 200) {
            // Tap gesture
            this.handleTap(e, element);
        } else if (distance > 50) {
            // Swipe gesture
            this.handleSwipeComplete(deltaX, deltaY, element);
        }

        // Clean up touch state
        this.touchState.isActive = false;
        element.classList.remove('touch-active');

        // Haptic feedback on release
        this.triggerHapticFeedback('light');
    }

    /**
     * Handle touch cancel event
     */
    handleTouchCancel(e, element) {
        this.touchState.isActive = false;
        element.classList.remove('touch-active');
    }

    /**
     * Handle tap gesture
     */
    handleTap(e, element) {
        // If it's a color input, trigger the native picker
        if (element.classList.contains('color-input')) {
            element.click();
        } else if (element.classList.contains('color-preview')) {
            // Show advanced color picker modal
            this.showAdvancedColorPicker(element);
        }

        this.triggerHapticFeedback('medium');
    }

    /**
     * Handle double tap gesture
     */
    handleDoubleTap(e, element) {
        if (element.classList.contains('color-preview')) {
            // Copy color to clipboard
            this.copyColorToClipboard(element);
            this.showToast('Color copied to clipboard!', 'success');
            this.triggerHapticFeedback('heavy');
        }
    }

    /**
     * Handle pinch gesture for zoom
     */
    handlePinchGesture(e, element) {
        if (e.touches.length !== 2) return;

        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / this.touchState.initialDistance;

        // Constrain scale between limits
        this.touchState.scale = Math.max(0.5, Math.min(3, scale));

        // Apply transform
        if (element.closest('.room-preview')) {
            element.style.transform = `scale(${this.touchState.scale})`;
        }
    }

    /**
     * Set up pinch-to-zoom for room preview
     */
    setupPinchZoom(element) {
        let scale = 1;
        let initialDistance = 0;
        let initialScale = 1;

        element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                initialScale = scale;
            }
        });

        element.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                scale = initialScale * (currentDistance / initialDistance);
                scale = Math.max(0.8, Math.min(2.5, scale));

                element.style.transform = `scale(${scale})`;
                element.style.transformOrigin = 'center center';
            }
        });

        element.addEventListener('touchend', () => {
            if (scale < 1) {
                scale = 1;
                element.style.transform = 'scale(1)';
                element.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    element.style.transition = '';
                }, 300);
            }
        });
    }

    /**
     * Handle swipe gestures
     */
    handleSwipeGesture(deltaX, deltaY, element) {
        const threshold = 50;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.handleSwipeRight(element);
                } else {
                    this.handleSwipeLeft(element);
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0) {
                    this.handleSwipeDown(element);
                } else {
                    this.handleSwipeUp(element);
                }
            }
        }
    }

    /**
     * Handle swipe navigation
     */
    setupSwipeNavigation() {
        const colorPickers = document.querySelectorAll('.color-picker-group');

        colorPickers.forEach((picker, index) => {
            picker.addEventListener('touchend', (e) => {
                const deltaX = this.touchState.currentX - this.touchState.startX;
                const threshold = 100;

                if (Math.abs(deltaX) > threshold) {
                    if (deltaX > 0 && index > 0) {
                        // Swipe right - previous picker
                        this.focusColorPicker(index - 1);
                    } else if (deltaX < 0 && index < colorPickers.length - 1) {
                        // Swipe left - next picker
                        this.focusColorPicker(index + 1);
                    }
                }
            });
        });
    }

    /**
     * Focus on specific color picker
     */
    focusColorPicker(index) {
        const colorPickers = document.querySelectorAll('.color-picker-group');
        const targetPicker = colorPickers[index];

        if (targetPicker) {
            targetPicker.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });

            const colorInput = targetPicker.querySelector('.color-input');
            if (colorInput) {
                setTimeout(() => colorInput.focus(), 300);
            }

            this.triggerHapticFeedback('medium');
        }
    }

    /**
     * Initialize camera features for color capture
     */
    async initializeCameraFeatures() {
        if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
            console.log('Camera API not supported');
            return;
        }

        try {
            // Check camera permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // Stop the stream immediately, just checking availability
            stream.getTracks().forEach(track => track.stop());

            this.mobileFeatures.camera = true;
            this.addCameraButtons();

        } catch (error) {
            console.log('Camera access not available:', error);
            this.mobileFeatures.camera = false;
        }
    }

    /**
     * Add camera capture buttons to color pickers
     */
    addCameraButtons() {
        const colorPickerGroups = document.querySelectorAll('.color-picker-group');

        colorPickerGroups.forEach((group, index) => {
            const cameraButton = document.createElement('button');
            cameraButton.type = 'button';
            cameraButton.className = 'btn btn-outline camera-capture-btn';
            cameraButton.innerHTML = `
                <span class="btn-icon">📷</span>
                <span>Capture Color</span>
            `;

            cameraButton.addEventListener('click', () => {
                this.openCameraColorCapture(index);
            });

            group.appendChild(cameraButton);
        });
    }

    /**
     * Open camera for color capture
     */
    async openCameraColorCapture(colorIndex) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.showCameraModal(stream, colorIndex);

        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showToast('Camera access denied or unavailable', 'error');
        }
    }

    /**
     * Show camera capture modal
     */
    showCameraModal(stream, colorIndex) {
        const modal = document.createElement('div');
        modal.className = 'modal camera-modal active';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content camera-content">
                <div class="camera-header">
                    <h3>Capture Color</h3>
                    <button class="modal-close camera-close">&times;</button>
                </div>
                <div class="camera-preview">
                    <video id="camera-video" autoplay playsinline></video>
                    <div class="camera-crosshair">
                        <div class="crosshair-circle"></div>
                    </div>
                </div>
                <div class="camera-controls">
                    <button class="btn btn-secondary cancel-capture">Cancel</button>
                    <button class="btn btn-primary capture-color">Capture</button>
                </div>
                <div class="captured-color-preview" style="display: none;">
                    <div class="preview-swatch"></div>
                    <div class="color-info">
                        <span class="hex-value"></span>
                        <span class="rgb-value"></span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const video = modal.querySelector('#camera-video');
        video.srcObject = stream;

        // Set up event listeners
        modal.querySelector('.camera-close').addEventListener('click', () => {
            this.closeCameraModal(modal, stream);
        });

        modal.querySelector('.cancel-capture').addEventListener('click', () => {
            this.closeCameraModal(modal, stream);
        });

        modal.querySelector('.capture-color').addEventListener('click', () => {
            this.captureColorFromVideo(video, colorIndex, modal, stream);
        });

        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.closeCameraModal(modal, stream);
        });
    }

    /**
     * Capture color from video stream
     */
    captureColorFromVideo(video, colorIndex, modal, stream) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);

        // Get pixel data from center of frame
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const imageData = ctx.getImageData(centerX, centerY, 1, 1);
        const [r, g, b] = imageData.data;

        // Convert to hex
        const hex = this.rgbToHex(r, g, b);

        // Update color picker
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];
        const colorType = colorTypes[colorIndex];

        if (colorType) {
            this.updateColorInput(colorType, hex);
            this.showToast(`Captured color: ${hex}`, 'success');
            this.triggerHapticFeedback('heavy');
        }

        this.closeCameraModal(modal, stream);
    }

    /**
     * Close camera modal and stop stream
     */
    closeCameraModal(modal, stream) {
        stream.getTracks().forEach(track => track.stop());
        modal.remove();
    }

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    /**
     * Set up haptic feedback
     */
    setupHapticFeedback() {
        if (!this.mobileFeatures.hapticFeedback) return;

        console.log('Haptic feedback available');
    }

    /**
     * Trigger haptic feedback
     */
    triggerHapticFeedback(intensity = 'light') {
        if (!this.mobileFeatures.hapticFeedback) return;

        const patterns = {
            light: 50,
            medium: 100,
            heavy: 200
        };

        navigator.vibrate(patterns[intensity] || patterns.light);
    }

    /**
     * Set up device orientation support
     */
    setupOrientationSupport() {
        if (!this.mobileFeatures.deviceOrientation) return;

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }

    /**
     * Handle device orientation changes
     */
    handleOrientationChange() {
        // Recalculate layout dimensions
        this.updateMobileLayout();

        // Trigger haptic feedback
        this.triggerHapticFeedback('light');

        console.log('Orientation changed');
    }

    /**
     * Set up mobile-specific UI enhancements
     */
    setupMobileUI() {
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-optimized');

        // Enhance touch targets
        this.enhanceTouchTargets();

        // Add pull-to-refresh for results
        this.setupPullToRefresh();

        // Add mobile-friendly tooltips
        this.setupMobileTooltips();
    }

    /**
     * Enhance touch targets for better accessibility
     */
    enhanceTouchTargets() {
        const interactiveElements = document.querySelectorAll('button, input, select, .color-preview, .swatch-color');

        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                element.classList.add('enhanced-touch-target');
            }
        });
    }

    /**
     * Set up pull-to-refresh functionality
     */
    setupPullToRefresh() {
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) return;

        let startY = 0;
        let pullDistance = 0;
        let isPulling = false;

        resultsSection.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isPulling = resultsSection.scrollTop === 0;
        });

        resultsSection.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            const currentY = e.touches[0].clientY;
            pullDistance = Math.max(0, currentY - startY);

            if (pullDistance > 0) {
                e.preventDefault();
                const opacity = Math.min(pullDistance / 100, 1);
                resultsSection.style.transform = `translateY(${pullDistance * 0.5}px)`;
                resultsSection.style.opacity = 1 - opacity * 0.3;
            }
        });

        resultsSection.addEventListener('touchend', () => {
            if (pullDistance > 100) {
                // Trigger refresh
                this.triggerResultsRefresh();
            }

            // Reset transform
            resultsSection.style.transform = '';
            resultsSection.style.opacity = '';
            isPulling = false;
            pullDistance = 0;
        });
    }

    /**
     * Set up mobile-friendly tooltips
     */
    setupMobileTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title]');

        elementsWithTooltips.forEach(element => {
            const title = element.getAttribute('title');
            element.removeAttribute('title');

            element.addEventListener('touchstart', () => {
                this.showMobileTooltip(element, title);
            });
        });
    }

    /**
     * Show mobile-friendly tooltip
     */
    showMobileTooltip(element, text) {
        const existingTooltip = document.querySelector('.mobile-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'mobile-tooltip';
        tooltip.textContent = text;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;

        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    }

    /**
     * Get distance between two touch points
     */
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Debounce function for gesture handling
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Update mobile layout on orientation change
     */
    updateMobileLayout() {
        // Force recalculation of layout
        const colorPickers = document.querySelectorAll('.color-picker-group');
        colorPickers.forEach(picker => {
            picker.style.height = 'auto';
        });
    }

    /**
     * Copy color to clipboard
     */
    async copyColorToClipboard(element) {
        const colorValue = element.style.backgroundColor;
        const hex = this.rgbToHex(...colorValue.match(/\d+/g).map(Number));

        try {
            await navigator.clipboard.writeText(hex);
            return true;
        } catch (err) {
            console.error('Failed to copy color:', err);
            return false;
        }
    }

    /**
     * Show mobile toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `mobile-toast mobile-toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('active');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Update color input with new value
     */
    updateColorInput(colorType, hex) {
        const colorInput = document.getElementById(`${colorType}-color`);
        const hexInput = document.getElementById(`${colorType}-hex`);
        const preview = document.getElementById(`${colorType}-preview`);

        if (colorInput) colorInput.value = hex;
        if (hexInput) hexInput.value = hex;
        if (preview) preview.style.backgroundColor = hex;

        // Update room preview
        this.updateRoomPreview();
    }

    /**
     * Handle swipe directions
     */
    handleSwipeLeft(element) {
        // Navigate to next color picker or section
        console.log('Swipe left detected');
    }

    handleSwipeRight(element) {
        // Navigate to previous color picker or section
        console.log('Swipe right detected');
    }

    handleSwipeUp(element) {
        // Minimize or show additional options
        console.log('Swipe up detected');
    }

    handleSwipeDown(element) {
        // Expand or show details
        console.log('Swipe down detected');
    }

    /**
     * Complete swipe gesture
     */
    handleSwipeComplete(deltaX, deltaY, element) {
        this.triggerHapticFeedback('medium');
    }

    /**
     * Trigger results refresh
     */
    triggerResultsRefresh() {
        this.showToast('Refreshing results...', 'info');
        this.triggerHapticFeedback('heavy');

        // Trigger the analyze function
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn && !analyzeBtn.disabled) {
            analyzeBtn.click();
        }
    }

    /**
     * Show advanced color picker modal
     */
    showAdvancedColorPicker(element) {
        // Implementation for advanced color picker
        console.log('Show advanced color picker for:', element);
    }
}

// Initialize mobile color picker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(max-width: 768px)').matches ||
        'ontouchstart' in window) {
        window.mobileColorPicker = new MobileColorPicker();
        console.log('Mobile color picker initialized');
    }
});