/**
 * Internationalization Setup for Sanzo Color Advisor
 * Using i18next for vanilla JavaScript
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'tr'];
        this.defaultLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.initialized = false;

        // Resource loading promises
        this.resourcePromises = new Map();

        // Event listeners for language changes
        this.languageChangeListeners = new Set();

        // Initialize i18next when CDN loads
        this.initPromise = this.waitForI18next().then(() => this.initialize());
    }

    /**
     * Wait for i18next to load from CDN
     */
    async waitForI18next() {
        return new Promise((resolve, reject) => {
            const checkI18next = () => {
                if (typeof i18next !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkI18next, 100);
                }
            };
            checkI18next();

            // Timeout after 10 seconds
            setTimeout(() => {
                if (typeof i18next === 'undefined') {
                    reject(new Error('i18next failed to load'));
                }
            }, 10000);
        });
    }

    /**
     * Initialize i18next with configuration
     */
    async initialize() {
        try {
            // Detect user's preferred language
            const detectedLanguage = this.detectLanguage();

            await i18next.init({
                lng: detectedLanguage,
                fallbackLng: this.fallbackLanguage,
                debug: false,

                // Load resources dynamically
                initImmediate: false,

                // Interpolation settings
                interpolation: {
                    escapeValue: false // React already does escaping
                },

                // Detection settings
                detection: {
                    order: ['localStorage', 'navigator', 'htmlTag'],
                    lookupLocalStorage: 'sanzo-language',
                    caches: ['localStorage']
                },

                // Resources will be loaded dynamically
                resources: {}
            });

            // Load resources for current language
            await this.loadLanguageResources(detectedLanguage);

            this.currentLanguage = detectedLanguage;
            this.initialized = true;

            console.log(`i18n initialized with language: ${detectedLanguage}`);

            // Trigger initial language change event
            this.notifyLanguageChange(detectedLanguage);

        } catch (error) {
            console.error('i18n initialization failed:', error);
            throw error;
        }
    }

    /**
     * Detect user's preferred language
     */
    detectLanguage() {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('sanzo-language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            return savedLanguage;
        }

        // Check browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        const langCode = browserLanguage.split('-')[0].toLowerCase();

        if (this.supportedLanguages.includes(langCode)) {
            return langCode;
        }

        // Default to Turkish if browser is set to Turkish, otherwise English
        if (langCode === 'tr') {
            return 'tr';
        }

        return this.defaultLanguage;
    }

    /**
     * Load language resources dynamically
     */
    async loadLanguageResources(language) {
        if (this.resourcePromises.has(language)) {
            return await this.resourcePromises.get(language);
        }

        const promise = this.fetchLanguageResources(language);
        this.resourcePromises.set(language, promise);

        try {
            const resources = await promise;

            // Add resources to i18next
            i18next.addResourceBundle(language, 'translation', resources, true, true);

            return resources;
        } catch (error) {
            this.resourcePromises.delete(language);
            throw error;
        }
    }

    /**
     * Fetch language resources from JSON files
     */
    async fetchLanguageResources(language) {
        try {
            const response = await fetch(`/locales/${language}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${language} translations: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${language} translations:`, error);

            // Return fallback resources if main language fails
            if (language !== this.fallbackLanguage) {
                return await this.fetchLanguageResources(this.fallbackLanguage);
            }

            // Return minimal fallback if everything fails
            return this.getMinimalFallbackResources();
        }
    }

    /**
     * Get minimal fallback resources
     */
    getMinimalFallbackResources() {
        return {
            app: {
                title: "Sanzo Color Advisor",
                loading: "Loading..."
            },
            common: {
                error: "An error occurred",
                retry: "Retry",
                close: "Close"
            }
        };
    }

    /**
     * Change language
     */
    async changeLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            throw new Error(`Unsupported language: ${language}`);
        }

        if (language === this.currentLanguage) {
            return;
        }

        try {
            // Load resources if not already loaded
            await this.loadLanguageResources(language);

            // Change i18next language
            await i18next.changeLanguage(language);

            // Update current language
            this.currentLanguage = language;

            // Save to localStorage
            localStorage.setItem('sanzo-language', language);

            // Update HTML lang attribute
            document.documentElement.lang = language;

            // Update HTML dir attribute for RTL support
            document.documentElement.dir = this.isRTL(language) ? 'rtl' : 'ltr';

            // Notify listeners
            this.notifyLanguageChange(language);

            console.log(`Language changed to: ${language}`);

        } catch (error) {
            console.error(`Failed to change language to ${language}:`, error);
            throw error;
        }
    }

    /**
     * Check if language is RTL
     */
    isRTL(language) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(language);
    }

    /**
     * Get translation
     */
    t(key, options = {}) {
        if (!this.initialized) {
            console.warn('i18n not initialized yet, returning key:', key);
            return key;
        }

        try {
            return i18next.t(key, options);
        } catch (error) {
            console.warn('Translation error for key:', key, error);
            return key;
        }
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    /**
     * Check if initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Add language change listener
     */
    onLanguageChange(callback) {
        this.languageChangeListeners.add(callback);

        // Return cleanup function
        return () => {
            this.languageChangeListeners.delete(callback);
        };
    }

    /**
     * Notify language change listeners
     */
    notifyLanguageChange(language) {
        this.languageChangeListeners.forEach(callback => {
            try {
                callback(language);
            } catch (error) {
                console.error('Error in language change listener:', error);
            }
        });
    }

    /**
     * Wait for initialization to complete
     */
    async waitForInitialization() {
        return this.initPromise;
    }

    /**
     * Get language display name
     */
    getLanguageDisplayName(language) {
        const displayNames = {
            'en': 'English',
            'tr': 'Türkçe'
        };
        return displayNames[language] || language;
    }

    /**
     * Get language flag emoji
     */
    getLanguageFlag(language) {
        const flags = {
            'en': '🇺🇸',
            'tr': '🇹🇷'
        };
        return flags[language] || '🌐';
    }

    /**
     * Format number according to locale
     */
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    /**
     * Format date according to locale
     */
    formatDate(date, options = {}) {
        const locale = this.currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    /**
     * Update page title with translation
     */
    updatePageTitle() {
        const titleKey = 'app.pageTitle';
        const translatedTitle = this.t(titleKey);
        if (translatedTitle && translatedTitle !== titleKey) {
            document.title = translatedTitle;
        }
    }

    /**
     * Update meta description with translation
     */
    updateMetaDescription() {
        const descKey = 'app.metaDescription';
        const translatedDesc = this.t(descKey);
        if (translatedDesc && translatedDesc !== descKey) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', translatedDesc);
            }
        }
    }

    /**
     * Pluralization helper
     */
    plural(key, count, options = {}) {
        return this.t(key, { count, ...options });
    }
}

// Create global instance
window.i18nManager = new I18nManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}