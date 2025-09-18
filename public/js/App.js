/**
 * App.js - Main Application Orchestration
 * Coordinates all components and manages application state
 */

class SanzoColorAdvisorApp {
    constructor() {
        this.components = {};
        this.state = {
            isLoading: false,
            isAnalyzing: false,
            currentAnalysis: null,
            apiConnection: null
        };

        // Configuration
        this.config = {
            apiBaseUrl: 'http://localhost:3000/api',
            loadingDelay: 500, // Minimum loading time for UX
            autoSave: true,
            maxRetries: 3
        };

        console.log('Sanzo Color Advisor App initializing...');
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            // Show loading screen
            this.showLoading();

            // Initialize components
            await this.initializeComponents();

            // Set up global event listeners
            this.setupGlobalEventListeners();

            // Check API connection
            await this.checkApiConnection();

            // Load any saved state
            this.loadSavedState();

            // Set up periodic connection checks
            this.startConnectionMonitoring();

            // Hide loading screen
            await this.hideLoading();

            console.log('Sanzo Color Advisor App initialized successfully');

        } catch (error) {
            console.error('App initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        try {
            // Wait for i18n to be ready first
            if (window.i18nManager) {
                await window.i18nManager.waitForInitialization();
                console.log('i18n Manager ready');
            }

            // Initialize localization components
            if (window.UILocalizer) {
                this.components.uiLocalizer = new window.UILocalizer();
                console.log('UI Localizer initialized');
            }

            if (window.LanguageSwitcher) {
                this.components.languageSwitcher = new window.LanguageSwitcher();
                console.log('Language Switcher initialized');
            }

            if (window.localizedColorData) {
                this.components.localizedColorData = window.localizedColorData;
                console.log('Localized Color Data ready');
            }

            // Initialize API client
            this.components.apiClient = new ApiClient(this.config.apiBaseUrl);

            // Initialize color picker with localization support
            this.components.colorPicker = new ColorPicker();

            // Initialize result display with localization support
            this.components.resultDisplay = new ResultDisplay();

            // Set up component connections
            this.connectComponents();

            console.log('All components initialized');

        } catch (error) {
            console.error('Component initialization failed:', error);
            throw new Error(`Failed to initialize components: ${error.message}`);
        }
    }

    /**
     * Connect components for communication
     */
    connectComponents() {
        // Set up color swatch click handlers in result display
        if (this.components.resultDisplay.setupColorSwatchHandlers) {
            this.components.resultDisplay.setupColorSwatchHandlers();
        }

        // Add API interceptors for logging and error handling
        this.components.apiClient.addRequestInterceptor((config) => {
            console.log('API Request:', config);
            return config;
        });

        this.components.apiClient.addResponseInterceptor((response) => {
            console.log('API Response:', response);
            return response;
        });

        // Set up language change listeners
        this.setupLanguageChangeHandlers();
    }

    /**
     * Set up language change event handlers
     */
    setupLanguageChangeHandlers() {
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            const { language } = event.detail;
            console.log('Language changed to:', language);

            // Update language-dependent components
            this.updateComponentsForLanguage(language);

            // Update cultural color preferences
            if (this.components.localizedColorData) {
                this.components.localizedColorData.setLanguage(language);
            }

            // Show language change notification
            this.showToast(
                window.i18nManager ?
                window.i18nManager.t('common.success') + ': ' +
                (language === 'tr' ? 'Türkçe' : 'English') :
                `Language changed to ${language === 'tr' ? 'Turkish' : 'English'}`,
                'success'
            );
        });

        // Listen for localization complete events
        document.addEventListener('localizationComplete', (event) => {
            console.log('Localization completed for:', event.detail.language);
            this.updatePageMetadata();
        });
    }

    /**
     * Update components when language changes
     */
    updateComponentsForLanguage(language) {
        // Update form validation messages if needed
        if (this.components.colorPicker && this.components.colorPicker.updateValidationMessages) {
            this.components.colorPicker.updateValidationMessages();
        }

        // Update results display if results are currently shown
        if (this.state.currentAnalysis && this.components.resultDisplay) {
            // Re-render results with new language
            this.components.resultDisplay.displayResults(this.state.currentAnalysis);
        }

        // Update accessibility announcements
        if (window.accessibilityController) {
            window.accessibilityController.updateLanguage(language);
        }
    }

    /**
     * Update page metadata for current language
     */
    updatePageMetadata() {
        if (window.i18nManager) {
            window.i18nManager.updatePageTitle();
            window.i18nManager.updateMetaDescription();
        }
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEventListeners() {
        // Form submission
        const colorForm = document.getElementById('color-form');
        if (colorForm) {
            colorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAnalyzeColors();
            });
        }

        // Modal controls
        this.setupModalControls();

        // Toast controls
        this.setupToastControls();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Accessibility test handlers
        this.setupAccessibilityTestHandlers();

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveCurrentState();
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });

        // Visibility change for pausing/resuming
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    /**
     * Set up modal controls
     */
    setupModalControls() {
        // About modal
        const aboutBtn = document.getElementById('about-btn');
        const aboutModal = document.getElementById('about-modal');

        if (aboutBtn && aboutModal) {
            aboutBtn.addEventListener('click', () => {
                this.showModal('about-modal');
            });
        }

        // Help modal
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');

        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => {
                this.showModal('help-modal');
            });
        }

        // Modal close handlers
        document.querySelectorAll('.modal').forEach(modal => {
            // Close button
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideModal(modal.id);
                });
            }

            // Backdrop click
            const backdrop = modal.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    this.hideModal(modal.id);
                });
            }

            // Escape key
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    /**
     * Set up toast controls
     */
    setupToastControls() {
        document.querySelectorAll('.toast').forEach(toast => {
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideToast(toast.id);
                });
            }
        });
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to analyze
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.state.isAnalyzing) {
                    this.handleAnalyzeColors();
                }
            }

            // Ctrl/Cmd + R to reset
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                if (this.components.colorPicker && this.components.colorPicker.resetColors) {
                    this.components.colorPicker.resetColors();
                }
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    this.hideModal(modal.id);
                });
            }

            // Alt + A for accessibility panel
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                if (window.accessibilityController) {
                    window.accessibilityController.togglePanel();
                }
            }

            // Alt + T for accessibility test
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.runQuickAccessibilityTest();
            }
        });
    }

    /**
     * Set up accessibility test handlers
     */
    setupAccessibilityTestHandlers() {
        // Run accessibility audit button
        const runTestBtn = document.getElementById('run-accessibility-test');
        if (runTestBtn) {
            runTestBtn.addEventListener('click', () => {
                this.runFullAccessibilityAudit();
            });
        }

        // Test color combinations button
        const testColorsBtn = document.getElementById('test-color-combinations');
        if (testColorsBtn) {
            testColorsBtn.addEventListener('click', () => {
                this.testCurrentColorCombinations();
            });
        }

        // Validate implementation button
        const validateBtn = document.getElementById('validate-implementation');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => {
                this.validateAccessibilityImplementation();
            });
        }
    }

    /**
     * Handle color analysis
     */
    async handleAnalyzeColors() {
        if (this.state.isAnalyzing) {
            console.log('Analysis already in progress');
            return;
        }

        try {
            // Validate form
            if (!this.components.colorPicker.validateForm()) {
                console.log('Form validation failed');
                return;
            }

            // Set analyzing state
            this.setAnalyzingState(true);

            // Get form data
            const formData = this.components.colorPicker.getFormValues();
            console.log('Form data:', formData);

            // Prepare API request data
            const apiData = this.prepareApiData(formData);

            // Make API request
            const result = await this.components.apiClient.analyzeColors(apiData);

            // Handle result
            if (result.success) {
                this.handleAnalysisSuccess(result);
            } else {
                this.handleAnalysisError(result.error);
            }

        } catch (error) {
            console.error('Analysis error:', error);
            this.handleAnalysisError(error);

        } finally {
            this.setAnalyzingState(false);
        }
    }

    /**
     * Prepare data for API request
     */
    prepareApiData(formData) {
        const apiData = {
            roomType: formData.roomType,
            ...formData.colors
        };

        // Add age group if specified
        if (formData.ageGroup) {
            apiData.ageGroup = formData.ageGroup;
        }

        // Add preferences (future enhancement)
        apiData.preferences = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        return apiData;
    }

    /**
     * Handle successful analysis
     */
    handleAnalysisSuccess(result) {
        console.log('Analysis successful:', result);

        // Store current analysis
        this.state.currentAnalysis = result;

        // Display results
        this.components.resultDisplay.displayResults(result);

        // Save state
        if (this.config.autoSave) {
            this.saveCurrentState();
        }

        // Show success toast
        this.showToast('Color analysis completed successfully!', 'success');

        // Analytics (future enhancement)
        this.trackAnalysisEvent('success', result.data.recommendations?.length || 0);
    }

    /**
     * Handle analysis error
     */
    handleAnalysisError(error) {
        console.error('Analysis failed:', error);

        // Display error
        this.components.resultDisplay.displayError(error);

        // Show error toast
        this.showToast(error.message || 'Analysis failed. Please try again.', 'error');

        // Analytics (future enhancement)
        this.trackAnalysisEvent('error', 0);
    }

    /**
     * Set analyzing state
     */
    setAnalyzingState(isAnalyzing) {
        this.state.isAnalyzing = isAnalyzing;

        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            if (isAnalyzing) {
                analyzeBtn.classList.add('loading');
                analyzeBtn.disabled = true;
                analyzeBtn.setAttribute('aria-label', 'Analyzing colors, please wait...');
            } else {
                analyzeBtn.classList.remove('loading');
                analyzeBtn.disabled = false;
                analyzeBtn.setAttribute('aria-label', 'Analyze colors');
            }
        }
    }

    /**
     * Check API connection
     */
    async checkApiConnection() {
        try {
            console.log('Checking API connection...');
            const result = await this.components.apiClient.testConnection();

            this.state.apiConnection = result.success;

            if (result.success) {
                console.log('API connection successful:', result.summary);
                this.showConnectionStatus('connected');
            } else {
                console.warn('API connection issues:', result.tests);
                this.showConnectionStatus('disconnected');
            }

            return result.success;

        } catch (error) {
            console.error('API connection check failed:', error);
            this.state.apiConnection = false;
            this.showConnectionStatus('error');
            return false;
        }
    }

    /**
     * Show connection status
     */
    showConnectionStatus(status) {
        // Could add a connection indicator to the UI
        console.log(`Connection status: ${status}`);

        if (status === 'disconnected' || status === 'error') {
            this.showToast('API connection issues detected. Some features may not work.', 'error');
        }
    }

    /**
     * Start connection monitoring
     */
    startConnectionMonitoring() {
        // Check connection every 30 seconds
        this.connectionMonitor = setInterval(async () => {
            if (document.visibilityState === 'visible') {
                await this.checkApiConnection();
            }
        }, 30000);
    }

    /**
     * Handle connection change
     */
    handleConnectionChange(isOnline) {
        console.log('Connection changed:', isOnline ? 'online' : 'offline');

        if (isOnline) {
            this.showToast('Internet connection restored', 'success');
            this.checkApiConnection();
        } else {
            this.showToast('Internet connection lost', 'error');
            this.state.apiConnection = false;
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // App became visible - check connection
            this.checkApiConnection();
        }
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');

            // Focus management
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');

            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        if (this.components.resultDisplay && this.components.resultDisplay.showToast) {
            this.components.resultDisplay.showToast(message, type);
        }
    }

    /**
     * Hide toast notification
     */
    hideToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.setAttribute('aria-hidden', 'true');
            }, 300);
        }
    }

    /**
     * Show loading screen
     */
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            loadingScreen.setAttribute('aria-hidden', 'false');
        }
        this.state.isLoading = true;
    }

    /**
     * Hide loading screen
     */
    async hideLoading() {
        // Ensure minimum loading time for UX
        await new Promise(resolve => setTimeout(resolve, this.config.loadingDelay));

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            loadingScreen.setAttribute('aria-hidden', 'true');
        }
        this.state.isLoading = false;
    }

    /**
     * Handle initialization error
     */
    handleInitializationError(error) {
        console.error('Initialization error:', error);

        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        // Show error message
        const errorHtml = `
            <div class="initialization-error">
                <h2>Application Failed to Load</h2>
                <p>Sorry, there was an error initializing the Sanzo Color Advisor.</p>
                <p class="error-details">${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <span>Reload Page</span>
                </button>
            </div>
        `;

        document.body.innerHTML = errorHtml;
    }

    /**
     * Save current state
     */
    saveCurrentState() {
        if (!this.config.autoSave) return;

        try {
            const state = {
                timestamp: new Date().toISOString(),
                formData: this.components.colorPicker?.getFormValues(),
                currentAnalysis: this.state.currentAnalysis,
                version: '1.0.0'
            };

            localStorage.setItem('sanzo-color-advisor-state', JSON.stringify(state));
            console.log('State saved');

        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    /**
     * Load saved state
     */
    loadSavedState() {
        try {
            const savedState = localStorage.getItem('sanzo-color-advisor-state');
            if (!savedState) return;

            const state = JSON.parse(savedState);

            // Check if state is recent (within 24 hours)
            const stateAge = Date.now() - new Date(state.timestamp).getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (stateAge > maxAge) {
                console.log('Saved state is too old, ignoring');
                return;
            }

            // Restore form data
            if (state.formData && this.components.colorPicker) {
                if (state.formData.colors) {
                    this.components.colorPicker.setColors(state.formData.colors);
                }
                // Restore form fields
                if (state.formData.roomType) {
                    const roomTypeSelect = document.getElementById('room-type');
                    if (roomTypeSelect) {
                        roomTypeSelect.value = state.formData.roomType;
                        roomTypeSelect.dispatchEvent(new Event('change'));
                    }
                }
                if (state.formData.ageGroup) {
                    const ageGroupSelect = document.getElementById('age-group');
                    if (ageGroupSelect) {
                        ageGroupSelect.value = state.formData.ageGroup;
                    }
                }
            }

            console.log('State loaded from', state.timestamp);

        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    /**
     * Clear saved state
     */
    clearSavedState() {
        try {
            localStorage.removeItem('sanzo-color-advisor-state');
            console.log('Saved state cleared');
        } catch (error) {
            console.error('Failed to clear state:', error);
        }
    }

    /**
     * Track analysis event (placeholder for analytics)
     */
    trackAnalysisEvent(type, resultCount) {
        // Analytics implementation would go here
        console.log('Analytics event:', { type, resultCount });
    }

    /**
     * Get application state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        // Update API client if URL changed
        if (newConfig.apiBaseUrl && this.components.apiClient) {
            this.components.apiClient.setBaseUrl(newConfig.apiBaseUrl);
        }

        console.log('Configuration updated:', this.config);
    }

    /**
     * Run quick accessibility test
     */
    async runQuickAccessibilityTest() {
        console.log('Running quick accessibility test...');

        if (!window.AccessibilityTester) {
            console.error('AccessibilityTester not available');
            this.showToast('Accessibility testing not available', 'error');
            return;
        }

        try {
            const tester = new window.AccessibilityTester();
            const results = await tester.runFullAccessibilityAudit({ level: 'AA' });

            if (window.accessibilityController) {
                // Announce results to screen reader
                const summary = `Accessibility test completed. Score: ${results.score}%, ${results.summary.passed} passed, ${results.summary.failed} failed.`;
                window.accessibilityController.announceToScreenReader(summary);
            }

            this.showToast(`Accessibility test completed. Score: ${results.score}%`,
                results.score >= 80 ? 'success' : 'warning');

            return results;
        } catch (error) {
            console.error('Accessibility test failed:', error);
            this.showToast('Accessibility test failed', 'error');
        }
    }

    /**
     * Run full accessibility audit
     */
    async runFullAccessibilityAudit() {
        console.log('Running full accessibility audit...');

        const resultsContainer = document.getElementById('accessibility-test-results');
        if (!resultsContainer) return;

        // Show loading
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="test-loading">
                <div class="spinner" aria-label="Running accessibility tests"></div>
                <p>Running comprehensive accessibility audit...</p>
            </div>
        `;

        try {
            if (!window.AccessibilityTester) {
                throw new Error('AccessibilityTester not available');
            }

            const tester = new window.AccessibilityTester();
            const results = await tester.runFullAccessibilityAudit({ level: 'AA' });

            // Display results
            resultsContainer.innerHTML = tester.generateHTMLReport();

            // Announce completion
            if (window.accessibilityController) {
                const summary = `Full accessibility audit completed. Score: ${results.score}%. ${results.summary.failed} violations found.`;
                window.accessibilityController.announceToScreenReader(summary, 'assertive');
            }

        } catch (error) {
            console.error('Full accessibility audit failed:', error);
            resultsContainer.innerHTML = `
                <div class="test-error">
                    <h4>Accessibility Test Error</h4>
                    <p>Failed to run accessibility tests: ${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Test current color combinations for accessibility
     */
    async testCurrentColorCombinations() {
        console.log('Testing current color combinations...');

        const resultsContainer = document.getElementById('accessibility-test-results');
        if (!resultsContainer) return;

        try {
            // Get current colors from form
            const colors = this.getCurrentColors();
            if (!colors || colors.length === 0) {
                this.showToast('Please select colors first', 'warning');
                return;
            }

            // Show loading
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `
                <div class="test-loading">
                    <div class="spinner" aria-label="Testing color combinations"></div>
                    <p>Testing color combinations for accessibility...</p>
                </div>
            `;

            if (!window.ColorBlindnessAdvanced) {
                throw new Error('ColorBlindnessAdvanced not available');
            }

            // Test color combinations
            const colorBlindTest = new window.ColorBlindnessAdvanced();
            const results = colorBlindTest.testColorCombinations(colors);

            // Generate report
            const report = this.generateColorAccessibilityReport(results, colors);
            resultsContainer.innerHTML = report;

            // Announce results
            if (window.accessibilityController) {
                const summary = `Color combination test completed. Overall score: ${results.overallScore}%.`;
                window.accessibilityController.announceToScreenReader(summary);
            }

        } catch (error) {
            console.error('Color combination test failed:', error);
            resultsContainer.innerHTML = `
                <div class="test-error">
                    <h4>Color Test Error</h4>
                    <p>Failed to test color combinations: ${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Get current colors from the form
     */
    getCurrentColors() {
        const colors = [];
        const colorInputs = document.querySelectorAll('.color-input');

        colorInputs.forEach(input => {
            if (input.value && input.value !== '#000000') {
                colors.push(input.value);
            }
        });

        return colors;
    }

    /**
     * Generate color accessibility report HTML
     */
    generateColorAccessibilityReport(results, colors) {
        const { overallScore, combinations, recommendations } = results;

        let html = `
            <div class="accessibility-report">
                <h3>Color Accessibility Report</h3>
                <div class="test-summary">
                    <div class="test-score">
                        <div class="score-circle grade-${this.getScoreGrade(overallScore)}">
                            ${overallScore}%
                        </div>
                        <p>Overall Score</p>
                    </div>
                    <div class="test-stats">
                        <div class="test-stat">
                            <span class="stat-icon">🎨</span>
                            <span>${colors.length} colors tested</span>
                        </div>
                        <div class="test-stat">
                            <span class="stat-icon">🔍</span>
                            <span>${combinations.length} combinations analyzed</span>
                        </div>
                    </div>
                </div>
        `;

        // Add recommendations
        if (recommendations.length > 0) {
            html += `
                <div class="test-violations">
                    <h4>Recommendations</h4>
                    ${recommendations.map(rec => `
                        <div class="violation-item">
                            <div class="violation-title">${rec.title}</div>
                            <div class="violation-description">${rec.description}</div>
                            <div class="violation-recommendation">
                                Actions: ${rec.actions.join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Add combination details
        const problematicCombos = combinations.filter(combo => !combo.accessible);
        if (problematicCombos.length > 0) {
            html += `
                <div class="test-warnings">
                    <h4>Problematic Color Combinations</h4>
                    ${problematicCombos.map(combo => `
                        <div class="warning-item">
                            <div class="warning-title">
                                Color Combination Issue
                            </div>
                            <div class="warning-description">
                                Some users with color vision deficiencies may have difficulty distinguishing these colors.
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Get score grade letter
     */
    getScoreGrade(score) {
        if (score >= 90) return 'a';
        if (score >= 80) return 'b';
        if (score >= 70) return 'c';
        return 'f';
    }

    /**
     * Validate complete accessibility implementation
     */
    async validateAccessibilityImplementation() {
        console.log('Validating complete accessibility implementation...');

        const resultsContainer = document.getElementById('accessibility-test-results');
        if (!resultsContainer) return;

        // Show loading
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="test-loading">
                <div class="spinner" aria-label="Validating accessibility implementation"></div>
                <p>Validating comprehensive accessibility implementation...</p>
            </div>
        `;

        try {
            if (!window.AccessibilityValidator) {
                throw new Error('AccessibilityValidator not available');
            }

            const validator = new window.AccessibilityValidator();
            const results = await validator.validateImplementation();

            // Display results
            resultsContainer.innerHTML = validator.generateReport();

            // Announce completion
            if (window.accessibilityController) {
                const summary = `Accessibility implementation validation completed. Score: ${results.score}% (${results.grade}).`;
                window.accessibilityController.announceToScreenReader(summary, 'assertive');
            }

            // Show toast with results
            this.showToast(
                `Accessibility validation: ${results.score}% (${results.grade})`,
                results.score >= 80 ? 'success' : results.score >= 60 ? 'warning' : 'error'
            );

            console.log('Accessibility validation results:', results);

        } catch (error) {
            console.error('Accessibility validation failed:', error);
            resultsContainer.innerHTML = `
                <div class="test-error">
                    <h4>Validation Error</h4>
                    <p>Failed to validate accessibility implementation: ${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Destroy the application
     */
    destroy() {
        // Clear intervals
        if (this.connectionMonitor) {
            clearInterval(this.connectionMonitor);
        }

        // Save state
        this.saveCurrentState();

        // Destroy components
        Object.values(this.components).forEach(component => {
            if (component && component.destroy) {
                component.destroy();
            }
        });

        // Clear references
        this.components = {};
        this.state = {};

        console.log('Sanzo Color Advisor App destroyed');
    }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sanzoApp = new SanzoColorAdvisorApp();
    });
} else {
    window.sanzoApp = new SanzoColorAdvisorApp();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SanzoColorAdvisorApp;
}

// Global availability
window.SanzoColorAdvisorApp = SanzoColorAdvisorApp;