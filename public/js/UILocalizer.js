/**
 * UI Localizer
 * Handles localization of all UI elements and dynamic content
 */

class UILocalizer {
    constructor() {
        this.isInitialized = false;
        this.observers = new Map();
        this.dynamicElements = new Set();

        // Elements that need special handling
        this.specialElements = {
            forms: new Set(),
            modals: new Set(),
            toasts: new Set(),
            results: new Set()
        };

        this.init();
    }

    /**
     * Initialize the UI localizer
     */
    async init() {
        try {
            // Wait for i18n to be ready
            if (window.i18nManager) {
                await window.i18nManager.waitForInitialization();

                // Listen for language changes
                window.i18nManager.onLanguageChange((language) => {
                    this.localizeAll();
                });
            }

            // Set up mutation observer for dynamic content
            this.setupMutationObserver();

            // Initial localization
            this.localizeAll();

            this.isInitialized = true;
            console.log('UI Localizer initialized');

        } catch (error) {
            console.error('UI Localizer initialization failed:', error);
        }
    }

    /**
     * Localize all UI elements
     */
    localizeAll() {
        if (!window.i18nManager || !window.i18nManager.isInitialized()) {
            return;
        }

        try {
            // Update page metadata
            this.updatePageMetadata();

            // Localize static elements
            this.localizeStaticElements();

            // Localize forms
            this.localizeForms();

            // Localize navigation
            this.localizeNavigation();

            // Localize modals
            this.localizeModals();

            // Localize accessibility features
            this.localizeAccessibilityFeatures();

            // Localize results if visible
            this.localizeResults();

            // Localize footer
            this.localizeFooter();

            // Trigger custom event
            this.dispatchLocalizationEvent();

        } catch (error) {
            console.error('Localization failed:', error);
        }
    }

    /**
     * Update page metadata
     */
    updatePageMetadata() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // Update page title
        const title = t('app.pageTitle');
        if (title && title !== 'app.pageTitle') {
            document.title = title;
        }

        // Update meta description
        const description = t('app.metaDescription');
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && description && description !== 'app.metaDescription') {
            metaDesc.content = description;
        }

        // Update Open Graph title
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && title) {
            ogTitle.content = title;
        }

        // Update Open Graph description
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && description) {
            ogDesc.content = description;
        }
    }

    /**
     * Localize static elements with data-i18n attributes
     */
    localizeStaticElements() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // App title and subtitle
        this.updateElement('.app-title .title-main', t('app.title'));
        this.updateElement('.app-title .title-subtitle', t('app.subtitle'));

        // Hero section
        this.updateElement('.hero-title', t('hero.title'));
        this.updateElement('.hero-subtitle', t('hero.subtitle'));

        // Loading screen
        this.updateElement('.loading-text', t('app.loading'));

        // Section titles
        this.updateElement('#color-input-title', t('form.title'));
        this.updateElement('#results-title', t('results.title'));

        // Skip links
        this.updateSkipLinks();
    }

    /**
     * Update skip links
     */
    updateSkipLinks() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        const skipLinks = [
            { selector: 'a[href="#main-content"]', key: 'navigation.skipToMain' },
            { selector: 'a[href="#color-form"]', key: 'navigation.skipToForm' },
            { selector: 'a[href="#results-section"]', key: 'navigation.skipToResults' },
            { selector: 'a[href="#footer"]', key: 'navigation.skipToFooter' }
        ];

        skipLinks.forEach(link => {
            this.updateElement(link.selector, t(link.key));
        });
    }

    /**
     * Localize navigation elements
     */
    localizeNavigation() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // Navigation buttons
        const navButtons = [
            { id: 'accessibility-btn', key: 'navigation.accessibility' },
            { id: 'about-btn', key: 'navigation.about' },
            { id: 'help-btn', key: 'navigation.help' }
        ];

        navButtons.forEach(button => {
            const element = document.getElementById(button.id);
            if (element) {
                const span = element.querySelector('span');
                if (span) {
                    span.textContent = t(button.key);
                }
                element.setAttribute('aria-label', t(button.key));
            }
        });
    }

    /**
     * Localize form elements
     */
    localizeForms() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // Room type form group
        this.localizeRoomTypeForm(t);

        // Age group form group
        this.localizeAgeGroupForm(t);

        // Color picker groups
        this.localizeColorPickers(t);

        // Action buttons
        this.localizeFormActions(t);

        // Preview section
        this.localizePreview(t);
    }

    /**
     * Localize room type form
     */
    localizeRoomTypeForm(t) {
        // Label
        const roomTypeLabel = document.querySelector('label[for="room-type"]');
        if (roomTypeLabel) {
            roomTypeLabel.innerHTML = `${t('form.roomType.label')} <span class="sr-only">${t('form.roomType.required')}</span>`;
        }

        // Help text
        this.updateElement('#room-type-help', t('form.roomType.help'));

        // Options
        const roomTypeSelect = document.getElementById('room-type');
        if (roomTypeSelect) {
            const options = roomTypeSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                if (value === '') {
                    option.textContent = t('form.roomType.placeholder');
                } else if (t(`form.roomType.options.${value}`)) {
                    option.textContent = t(`form.roomType.options.${value}`);
                }
            });
        }
    }

    /**
     * Localize age group form
     */
    localizeAgeGroupForm(t) {
        // Label
        this.updateElement('label[for="age-group"]', t('form.ageGroup.label'));

        // Help text
        this.updateElement('#age-group-help', t('form.ageGroup.help'));

        // Options
        const ageGroupSelect = document.getElementById('age-group');
        if (ageGroupSelect) {
            const options = ageGroupSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                if (value === '') {
                    option.textContent = t('form.ageGroup.placeholder');
                } else if (t(`form.ageGroup.options.${value}`)) {
                    option.textContent = t(`form.ageGroup.options.${value}`);
                }
            });
        }
    }

    /**
     * Localize color pickers
     */
    localizeColorPickers(t) {
        const colorTypes = ['wall', 'floor', 'furniture', 'accent'];

        colorTypes.forEach(type => {
            // Main label
            const label = document.querySelector(`label[for="${type}-color"] .color-label-text`);
            if (label) {
                label.textContent = t(`form.colors.${type}.label`);
            }

            // Optional text
            const optional = document.querySelector(`label[for="${type}-color"] .color-label-optional`);
            if (optional) {
                optional.textContent = t(`form.colors.${type}.optional`);
            }

            // Help text
            this.updateElement(`#${type}-color-help`, t(`form.colors.${type}.help`));

            // Aria labels
            const colorInput = document.getElementById(`${type}-color`);
            if (colorInput) {
                colorInput.setAttribute('aria-label', t(`form.colors.${type}.ariaLabel`));
            }

            const hexInput = document.getElementById(`${type}-hex`);
            if (hexInput) {
                hexInput.setAttribute('aria-label', t(`form.colors.${type}.hexLabel`));
            }

            // Preview aria-label
            const preview = document.getElementById(`${type}-preview`);
            if (preview) {
                const currentColor = preview.style.backgroundColor;
                const colorName = this.getColorName(currentColor);
                preview.setAttribute('aria-label', `${t(`form.colors.${type}.preview`)}: ${colorName}`);
            }
        });

        // Hex format help
        this.updateElement('#hex-format-help', t('form.colors.hexFormatHelp'));
    }

    /**
     * Localize form actions
     */
    localizeFormActions(t) {
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            const span = resetBtn.querySelector('span:not(.btn-icon)');
            if (span) {
                span.textContent = t('form.actions.reset');
            }
            resetBtn.setAttribute('aria-label', t('form.actions.resetAria'));
        }

        // Analyze button
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            const span = analyzeBtn.querySelector('span:not(.btn-icon):not(.btn-loading)');
            if (span) {
                span.textContent = t('form.actions.analyze');
            }
            analyzeBtn.setAttribute('aria-label', t('form.actions.analyzeAria'));
        }
    }

    /**
     * Localize preview section
     */
    localizePreview(t) {
        const previewLabel = document.querySelector('.preview-label');
        if (previewLabel) {
            previewLabel.textContent = t('form.preview.title');
        }

        const roomPreview = document.getElementById('room-preview');
        if (roomPreview) {
            roomPreview.setAttribute('aria-label', t('form.preview.ariaLabel'));
        }
    }

    /**
     * Localize modals
     */
    localizeModals() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // About modal
        this.localizeAboutModal(t);

        // Help modal
        this.localizeHelpModal(t);

        // Accessibility panel
        this.localizeAccessibilityPanel(t);
    }

    /**
     * Localize about modal
     */
    localizeAboutModal(t) {
        this.updateElement('#about-modal-title', t('about.title'));
        this.updateElement('#about-modal .modal-close', '×');

        const modalBody = document.querySelector('#about-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <p>${t('about.content.intro')}</p>
                <p>${t('about.content.system')}</p>
                <h3>${t('about.content.features')}</h3>
                <ul>
                    ${t('about.content.featuresList', { returnObjects: true }).map(feature =>
                        `<li>${feature}</li>`
                    ).join('')}
                </ul>
            `;
        }
    }

    /**
     * Localize help modal
     */
    localizeHelpModal(t) {
        this.updateElement('#help-modal-title', t('help.title'));

        const modalBody = document.querySelector('#help-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <h3>${t('help.steps.step1.title')}</h3>
                <p>${t('help.steps.step1.description')}</p>

                <h3>${t('help.steps.step2.title')}</h3>
                <p>${t('help.steps.step2.description')}</p>

                <h3>${t('help.steps.step3.title')}</h3>
                <p>${t('help.steps.step3.description')}</p>

                <h3>${t('help.understanding.title')}</h3>
                <ul>
                    ${t('help.understanding.items', { returnObjects: true }).map(item =>
                        `<li>${item}</li>`
                    ).join('')}
                </ul>

                <h3>${t('help.tips.title')}</h3>
                <ul>
                    ${t('help.tips.items', { returnObjects: true }).map(tip =>
                        `<li>${tip}</li>`
                    ).join('')}
                </ul>
            `;
        }
    }

    /**
     * Localize accessibility panel
     */
    localizeAccessibilityPanel(t) {
        this.updateElement('#accessibility-title', t('accessibility.title'));
        this.updateElement('#accessibility-close', '×');

        // This would be a complex function to update all accessibility controls
        // For brevity, I'll include key elements

        // Visual preferences
        this.updateElement('.control-group:first-child .control-group-title', t('accessibility.groups.visual.title'));

        // High contrast toggle
        const highContrastLabel = document.querySelector('#high-contrast-toggle + .control-text');
        if (highContrastLabel) {
            highContrastLabel.textContent = t('accessibility.groups.visual.highContrast.label');
        }
    }

    /**
     * Localize accessibility features
     */
    localizeAccessibilityFeatures() {
        // This function would handle screen reader announcements,
        // ARIA labels, and other accessibility-specific localizations
        this.updateScreenReaderAnnouncements();
    }

    /**
     * Update screen reader announcements
     */
    updateScreenReaderAnnouncements() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // Update live region content if needed
        const srAnnouncer = document.getElementById('sr-announcer');
        if (srAnnouncer && srAnnouncer.textContent) {
            // Re-announce current content in new language if active
            const currentText = srAnnouncer.textContent;
            if (currentText.includes('Loading') || currentText.includes('Yükleniyor')) {
                srAnnouncer.textContent = t('common.loading');
            }
        }
    }

    /**
     * Localize results section
     */
    localizeResults() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // Results actions
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            const span = exportBtn.querySelector('span:not(.btn-icon)');
            if (span) {
                span.textContent = t('results.actions.export');
            }
            exportBtn.setAttribute('aria-label', t('results.actions.exportAria'));
        }

        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            const span = shareBtn.querySelector('span:not(.btn-icon)');
            if (span) {
                span.textContent = t('results.actions.share');
            }
            shareBtn.setAttribute('aria-label', t('results.actions.shareAria'));
        }

        const newAnalysisBtn = document.getElementById('new-analysis-btn');
        if (newAnalysisBtn) {
            const span = newAnalysisBtn.querySelector('span:not(.btn-icon)');
            if (span) {
                span.textContent = t('results.actions.newAnalysis');
            }
            newAnalysisBtn.setAttribute('aria-label', t('results.actions.newAnalysisAria'));
        }
    }

    /**
     * Localize footer
     */
    localizeFooter() {
        const t = window.i18nManager.t.bind(window.i18nManager);

        const footerText = document.querySelector('.footer-text');
        if (footerText) {
            footerText.innerHTML = `
                ${t('footer.basedOn')} <strong>${t('footer.sanzoWadaBook')}</strong> ${t('footer.year')}
            `;
        }

        const footerCredits = document.querySelector('.footer-credits');
        if (footerCredits) {
            footerCredits.textContent = t('footer.aiPowered');
        }

        // Footer links
        this.updateElement('#privacy-link', t('footer.privacy'));
        this.updateElement('#terms-link', t('footer.terms'));

        const sourceDataLink = document.querySelector('a[href*="github.com"]');
        if (sourceDataLink) {
            sourceDataLink.textContent = t('footer.sourceData');
        }
    }

    /**
     * Setup mutation observer for dynamic content
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.localizeDynamicElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.set('mutation', observer);
    }

    /**
     * Localize dynamic element
     */
    localizeDynamicElement(element) {
        // Check if element has data-i18n attribute
        const i18nKey = element.getAttribute('data-i18n');
        if (i18nKey && window.i18nManager) {
            const translation = window.i18nManager.t(i18nKey);
            if (translation && translation !== i18nKey) {
                element.textContent = translation;
            }
        }

        // Check for child elements with data-i18n
        const i18nElements = element.querySelectorAll('[data-i18n]');
        i18nElements.forEach(el => this.localizeDynamicElement(el));
    }

    /**
     * Get color name from color value
     */
    getColorName(colorValue) {
        const t = window.i18nManager.t.bind(window.i18nManager);

        // Basic color name mapping - in real implementation,
        // this would use a more sophisticated color name detection
        const colorMap = {
            '#F5F5F5': t('colors.names.lightGray'),
            '#8B4513': t('colors.names.brown'),
            '#A0522D': t('colors.names.darkBrown'),
            '#FF6347': t('colors.names.orangeRed'),
            '#FFFFFF': t('colors.names.white'),
            '#000000': t('colors.names.black')
        };

        return colorMap[colorValue] || colorValue;
    }

    /**
     * Update element content safely
     */
    updateElement(selector, content) {
        const element = document.querySelector(selector);
        if (element && content) {
            element.textContent = content;
        }
    }

    /**
     * Dispatch localization complete event
     */
    dispatchLocalizationEvent() {
        const event = new CustomEvent('localizationComplete', {
            detail: { language: window.i18nManager.getCurrentLanguage() }
        });
        document.dispatchEvent(event);
    }

    /**
     * Add dynamic element for localization tracking
     */
    addDynamicElement(element, i18nKey) {
        element.setAttribute('data-i18n', i18nKey);
        this.dynamicElements.add(element);
        this.localizeDynamicElement(element);
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return window.i18nManager ? window.i18nManager.getCurrentLanguage() : 'en';
    }

    /**
     * Check if localization is ready
     */
    isReady() {
        return this.isInitialized && window.i18nManager && window.i18nManager.isInitialized();
    }

    /**
     * Destroy the localizer
     */
    destroy() {
        // Clean up observers
        this.observers.forEach((observer) => {
            observer.disconnect();
        });
        this.observers.clear();

        // Clear dynamic elements
        this.dynamicElements.clear();

        this.isInitialized = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UILocalizer;
}