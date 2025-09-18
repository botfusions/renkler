/**
 * Language Switcher Component
 * Handles language switching functionality and UI
 */

class LanguageSwitcher {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = [
            { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' }
        ];

        this.isInitialized = false;
        this.switcherElement = null;

        // Initialize when i18n is ready
        this.init();
    }

    /**
     * Initialize the language switcher
     */
    async init() {
        try {
            // Wait for i18n to be ready
            if (window.i18nManager) {
                await window.i18nManager.waitForInitialization();
            }

            this.createLanguageSwitcher();
            this.attachEventListeners();
            this.isInitialized = true;

            // Listen for language changes
            if (window.i18nManager) {
                window.i18nManager.onLanguageChange((language) => {
                    this.currentLanguage = language;
                    this.updateSwitcherUI();
                });

                this.currentLanguage = window.i18nManager.getCurrentLanguage();
            }

            console.log('Language switcher initialized');
        } catch (error) {
            console.error('Language switcher initialization failed:', error);
        }
    }

    /**
     * Create the language switcher UI
     */
    createLanguageSwitcher() {
        // Find the navigation area or create one
        const headerNav = document.querySelector('.header-nav');
        if (!headerNav) {
            console.warn('Header navigation not found, language switcher not created');
            return;
        }

        // Get localized labels
        const t = window.i18nManager ? window.i18nManager.t.bind(window.i18nManager) : (key) => key;

        // Create language switcher button
        const languageButton = document.createElement('button');
        languageButton.className = 'nav-button language-switcher-btn';
        languageButton.type = 'button';
        languageButton.setAttribute('aria-label', t('navigation.language') || 'Change language');
        languageButton.setAttribute('aria-expanded', 'false');
        languageButton.setAttribute('aria-haspopup', 'menu');

        // Current language display
        const currentLang = this.getCurrentLanguageInfo();
        languageButton.innerHTML = `
            <span class="language-flag">${currentLang.flag}</span>
            <span class="language-name">${currentLang.name}</span>
            <span class="language-chevron" aria-hidden="true">▼</span>
        `;

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'language-dropdown';
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-hidden', 'true');
        dropdown.style.display = 'none';

        // Create language options
        this.supportedLanguages.forEach(lang => {
            const option = document.createElement('button');
            option.className = 'language-option';
            option.type = 'button';
            option.setAttribute('role', 'menuitem');
            option.setAttribute('data-language', lang.code);
            option.setAttribute('aria-label', `Switch to ${lang.name}`);

            if (lang.code === this.currentLanguage) {
                option.classList.add('active');
                option.setAttribute('aria-current', 'true');
            }

            option.innerHTML = `
                <span class="language-flag">${lang.flag}</span>
                <span class="language-name">${lang.name}</span>
                ${lang.code === this.currentLanguage ? '<span class="checkmark" aria-hidden="true">✓</span>' : ''}
            `;

            dropdown.appendChild(option);
        });

        // Create container
        const container = document.createElement('div');
        container.className = 'language-switcher';
        container.appendChild(languageButton);
        container.appendChild(dropdown);

        // Insert before other nav buttons (but after accessibility button if it exists)
        const accessibilityBtn = headerNav.querySelector('#accessibility-btn');
        if (accessibilityBtn && accessibilityBtn.parentNode) {
            headerNav.insertBefore(container, accessibilityBtn.parentNode.nextSibling);
        } else {
            headerNav.insertBefore(container, headerNav.firstChild);
        }

        this.switcherElement = container;
    }

    /**
     * Get current language information
     */
    getCurrentLanguageInfo() {
        return this.supportedLanguages.find(lang => lang.code === this.currentLanguage) || this.supportedLanguages[0];
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (!this.switcherElement) return;

        const button = this.switcherElement.querySelector('.language-switcher-btn');
        const dropdown = this.switcherElement.querySelector('.language-dropdown');

        // Toggle dropdown
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Language option clicks
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                const language = option.getAttribute('data-language');
                this.changeLanguage(language);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.switcherElement.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Keyboard navigation
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleDropdown();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.openDropdown();
                this.focusFirstOption();
            }
        });

        dropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.closeDropdown();
                button.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.focusNextOption();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.focusPreviousOption();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const focused = dropdown.querySelector('.language-option:focus');
                if (focused) {
                    const language = focused.getAttribute('data-language');
                    this.changeLanguage(language);
                }
            }
        });

        // Accessibility improvements
        this.setupAccessibilityFeatures();
    }

    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + L for language switching
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                this.toggleDropdown();
            }
        });
    }

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        const dropdown = this.switcherElement.querySelector('.language-dropdown');
        const button = this.switcherElement.querySelector('.language-switcher-btn');
        const isOpen = dropdown.style.display !== 'none';

        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    /**
     * Open dropdown
     */
    openDropdown() {
        const dropdown = this.switcherElement.querySelector('.language-dropdown');
        const button = this.switcherElement.querySelector('.language-switcher-btn');

        dropdown.style.display = 'block';
        dropdown.setAttribute('aria-hidden', 'false');
        button.setAttribute('aria-expanded', 'true');
        button.classList.add('open');

        // Add animation class
        requestAnimationFrame(() => {
            dropdown.classList.add('open');
        });
    }

    /**
     * Close dropdown
     */
    closeDropdown() {
        const dropdown = this.switcherElement.querySelector('.language-dropdown');
        const button = this.switcherElement.querySelector('.language-switcher-btn');

        dropdown.classList.remove('open');
        dropdown.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-expanded', 'false');
        button.classList.remove('open');

        // Hide after animation
        setTimeout(() => {
            if (!dropdown.classList.contains('open')) {
                dropdown.style.display = 'none';
            }
        }, 200);
    }

    /**
     * Focus first option in dropdown
     */
    focusFirstOption() {
        const firstOption = this.switcherElement.querySelector('.language-option');
        if (firstOption) {
            firstOption.focus();
        }
    }

    /**
     * Focus next option
     */
    focusNextOption() {
        const options = Array.from(this.switcherElement.querySelectorAll('.language-option'));
        const current = document.activeElement;
        const currentIndex = options.indexOf(current);
        const nextIndex = (currentIndex + 1) % options.length;
        options[nextIndex].focus();
    }

    /**
     * Focus previous option
     */
    focusPreviousOption() {
        const options = Array.from(this.switcherElement.querySelectorAll('.language-option'));
        const current = document.activeElement;
        const currentIndex = options.indexOf(current);
        const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
        options[prevIndex].focus();
    }

    /**
     * Change language
     */
    async changeLanguage(language) {
        if (!this.supportedLanguages.find(lang => lang.code === language)) {
            console.error('Unsupported language:', language);
            return;
        }

        if (language === this.currentLanguage) {
            this.closeDropdown();
            return;
        }

        try {
            // Show loading state
            this.setLoadingState(true);

            // Change language through i18n manager
            if (window.i18nManager) {
                await window.i18nManager.changeLanguage(language);
            }

            this.currentLanguage = language;
            this.updateSwitcherUI();
            this.closeDropdown();

            // Trigger custom event for other components
            this.dispatchLanguageChangeEvent(language);

            // Show success toast
            this.showLanguageChangeSuccess(language);

        } catch (error) {
            console.error('Failed to change language:', error);
            this.showLanguageChangeError();
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Update switcher UI after language change
     */
    updateSwitcherUI() {
        if (!this.switcherElement) return;

        const button = this.switcherElement.querySelector('.language-switcher-btn');
        const options = this.switcherElement.querySelectorAll('.language-option');
        const currentLang = this.getCurrentLanguageInfo();

        // Update button content
        button.innerHTML = `
            <span class="language-flag">${currentLang.flag}</span>
            <span class="language-name">${currentLang.name}</span>
            <span class="language-chevron" aria-hidden="true">▼</span>
        `;

        // Update options
        options.forEach(option => {
            const langCode = option.getAttribute('data-language');
            const isActive = langCode === this.currentLanguage;

            option.classList.toggle('active', isActive);
            option.setAttribute('aria-current', isActive ? 'true' : 'false');

            // Update checkmark
            const existingCheckmark = option.querySelector('.checkmark');
            if (existingCheckmark) {
                existingCheckmark.remove();
            }

            if (isActive) {
                const checkmark = document.createElement('span');
                checkmark.className = 'checkmark';
                checkmark.setAttribute('aria-hidden', 'true');
                checkmark.textContent = '✓';
                option.appendChild(checkmark);
            }
        });
    }

    /**
     * Set loading state
     */
    setLoadingState(loading) {
        if (!this.switcherElement) return;

        const button = this.switcherElement.querySelector('.language-switcher-btn');
        button.classList.toggle('loading', loading);
        button.disabled = loading;

        if (loading) {
            button.setAttribute('aria-busy', 'true');
        } else {
            button.removeAttribute('aria-busy');
        }
    }

    /**
     * Dispatch language change event
     */
    dispatchLanguageChangeEvent(language) {
        const event = new CustomEvent('languageChanged', {
            detail: { language, previousLanguage: this.currentLanguage }
        });
        document.dispatchEvent(event);
    }

    /**
     * Show language change success message
     */
    showLanguageChangeSuccess(language) {
        const langInfo = this.supportedLanguages.find(lang => lang.code === language);
        const message = `Language changed to ${langInfo.name}`;

        // Use toast system if available
        if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            console.log(message);
        }
    }

    /**
     * Show language change error message
     */
    showLanguageChangeError() {
        const message = 'Failed to change language';

        // Use toast system if available
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }

    /**
     * Get current language code
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
     * Check if language is supported
     */
    isLanguageSupported(language) {
        return this.supportedLanguages.some(lang => lang.code === language);
    }

    /**
     * Destroy the language switcher
     */
    destroy() {
        if (this.switcherElement) {
            this.switcherElement.remove();
            this.switcherElement = null;
        }
        this.isInitialized = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}