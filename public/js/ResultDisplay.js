/**
 * ResultDisplay.js - Beautiful Results Visualization
 * Handles displaying color analysis results with rich visualizations
 */

class ResultDisplay {
    constructor() {
        this.resultsContainer = null;
        this.resultsSection = null;
        this.resultsActions = null;
        this.currentResults = null;
        this.animationDelay = 100; // Stagger animation delay

        this.initialize();
    }

    /**
     * Initialize the result display component
     */
    initialize() {
        this.resultsContainer = document.getElementById('results-container');
        this.resultsSection = document.getElementById('results-section');
        this.resultsActions = document.getElementById('results-actions');

        if (!this.resultsContainer || !this.resultsSection) {
            console.error('Results display elements not found');
            return;
        }

        this.setupEventListeners();
        console.log('ResultDisplay initialized successfully');
    }

    /**
     * Set up event listeners for result actions
     */
    setupEventListeners() {
        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportResults();
            });
        }

        // Share button
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareResults();
            });
        }

        // New analysis button
        const newAnalysisBtn = document.getElementById('new-analysis-btn');
        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => {
                this.startNewAnalysis();
            });
        }
    }

    /**
     * Display analysis results with beautiful animations
     */
    displayResults(results) {
        if (!results || !results.success) {
            this.displayError(results?.error || { message: 'No results to display' });
            return;
        }

        this.currentResults = results;
        this.clearResults();

        // Show results section with animation
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Display each recommendation
        if (results.data?.recommendations && results.data.recommendations.length > 0) {
            this.displayRecommendations(results.data.recommendations);
        } else {
            this.displayNoRecommendations();
        }

        // Display analysis information
        if (results.data?.analysis) {
            this.displayAnalysisInfo(results.data.analysis);
        }

        // Show action buttons
        if (this.resultsActions) {
            this.resultsActions.style.display = 'flex';
        }

        // Announce results for accessibility
        this.announceResults(results.data.recommendations?.length || 0);
    }

    /**
     * Display individual recommendations
     */
    displayRecommendations(recommendations) {
        const fragment = document.createDocumentFragment();

        recommendations.forEach((recommendation, index) => {
            const card = this.createRecommendationCard(recommendation, index);
            fragment.appendChild(card);
        });

        this.resultsContainer.appendChild(fragment);
    }

    /**
     * Create a recommendation card element
     */
    createRecommendationCard(recommendation, index) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Animate card appearance
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * this.animationDelay);

        card.innerHTML = this.generateRecommendationHTML(recommendation);

        return card;
    }

    /**
     * Generate HTML for a recommendation
     */
    generateRecommendationHTML(recommendation) {
        const confidence = recommendation.confidence || 0;
        const confidenceClass = this.getConfidenceClass(confidence);
        const colors = recommendation.colors || {};

        return `
            <div class="recommendation-header">
                <div class="recommendation-info">
                    <h4 class="recommendation-title">${this.escapeHtml(recommendation.name || 'Unnamed Recommendation')}</h4>
                    <p class="recommendation-type">${this.escapeHtml(this.formatRecommendationType(recommendation.type))}</p>
                </div>
                <div class="confidence-score ${confidenceClass}">
                    <div class="confidence-value">${confidence}</div>
                    <div class="confidence-label">Confidence</div>
                </div>
            </div>

            ${Object.keys(colors).length > 0 ? this.generateColorPaletteHTML(colors) : ''}

            <div class="recommendation-content">
                <div class="content-section">
                    <h5 class="content-title">Analysis</h5>
                    <p class="content-text">${this.escapeHtml(recommendation.reasoning || 'No analysis provided.')}</p>
                </div>
                <div class="content-section">
                    <h5 class="content-title">Psychological Effects</h5>
                    <p class="content-text">${this.escapeHtml(recommendation.psychologicalEffects || 'No effects described.')}</p>
                </div>
            </div>

            ${recommendation.implementationTips ? this.generateImplementationTipsHTML(recommendation.implementationTips) : ''}

            <div class="recommendation-meta">
                <div class="meta-item">
                    <span class="meta-label">Suitability:</span>
                    <span class="meta-value">${recommendation.suitabilityScore || 'N/A'}%</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Type:</span>
                    <span class="meta-value">${this.formatRecommendationType(recommendation.type)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Generate color palette HTML
     */
    generateColorPaletteHTML(colors) {
        const swatches = Object.entries(colors).map(([name, colorData]) => {
            const hex = colorData.hex || colorData;
            const rgb = colorData.rgb;
            const hsl = colorData.hsl;

            return `
                <div class="color-swatch" data-color="${hex}">
                    <div class="swatch-color" style="background-color: ${hex}"
                         title="Click to copy ${hex}"
                         tabindex="0"
                         role="button"
                         aria-label="Copy color ${hex}">
                    </div>
                    <div class="swatch-label">${this.formatColorName(name)}</div>
                    <div class="swatch-hex">${hex}</div>
                    ${rgb ? `<div class="swatch-rgb">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>` : ''}
                    ${hsl ? `<div class="swatch-hsl">hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)</div>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="color-palette">
                ${swatches}
            </div>
        `;
    }

    /**
     * Generate implementation tips HTML
     */
    generateImplementationTipsHTML(tips) {
        if (!Array.isArray(tips) || tips.length === 0) {
            return '';
        }

        const tipsList = tips.map(tip => `
            <li class="tip-item">
                <span class="tip-icon">💡</span>
                <span class="tip-text">${this.escapeHtml(tip)}</span>
            </li>
        `).join('');

        return `
            <div class="implementation-section">
                <h5 class="content-title">Implementation Tips</h5>
                <ul class="implementation-tips">
                    ${tipsList}
                </ul>
            </div>
        `;
    }

    /**
     * Get confidence score CSS class
     */
    getConfidenceClass(confidence) {
        if (confidence >= 90) return 'confidence-excellent';
        if (confidence >= 80) return 'confidence-good';
        if (confidence >= 70) return 'confidence-fair';
        return 'confidence-poor';
    }

    /**
     * Format recommendation type for display
     */
    formatRecommendationType(type) {
        if (!type) return 'Color Recommendation';

        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Format color name for display
     */
    formatColorName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
    }

    /**
     * Display analysis information
     */
    displayAnalysisInfo(analysis) {
        const infoCard = document.createElement('div');
        infoCard.className = 'analysis-info-card';
        infoCard.innerHTML = this.generateAnalysisInfoHTML(analysis);

        this.resultsContainer.appendChild(infoCard);

        // Animate appearance
        setTimeout(() => {
            infoCard.style.opacity = '1';
            infoCard.style.transform = 'translateY(0)';
        }, 200);
    }

    /**
     * Generate analysis information HTML
     */
    generateAnalysisInfoHTML(analysis) {
        return `
            <h4 class="analysis-title">Analysis Details</h4>
            <div class="analysis-grid">
                ${analysis.roomRequirements ? this.generateRequirementsHTML(analysis.roomRequirements) : ''}
                ${analysis.ageGroupRequirements ? this.generateAgeRequirementsHTML(analysis.ageGroupRequirements) : ''}
                ${analysis.existingColors ? this.generateExistingColorsHTML(analysis.existingColors) : ''}
                ${analysis.psychologicalProfile ? this.generatePsychologicalHTML(analysis.psychologicalProfile) : ''}
            </div>
        `;
    }

    /**
     * Generate requirements HTML
     */
    generateRequirementsHTML(requirements) {
        return `
            <div class="analysis-section">
                <h5 class="analysis-section-title">Room Requirements</h5>
                <ul class="requirements-list">
                    ${requirements.lighting ? `<li><strong>Lighting:</strong> ${requirements.lighting}</li>` : ''}
                    ${requirements.mood ? `<li><strong>Mood:</strong> ${requirements.mood}</li>` : ''}
                    ${requirements.activity ? `<li><strong>Primary Activity:</strong> ${requirements.activity}</li>` : ''}
                    ${requirements.size ? `<li><strong>Typical Size:</strong> ${requirements.size}</li>` : ''}
                </ul>
            </div>
        `;
    }

    /**
     * Display no recommendations message
     */
    displayNoRecommendations() {
        const noResultsCard = document.createElement('div');
        noResultsCard.className = 'no-results-card';
        noResultsCard.innerHTML = `
            <div class="no-results-icon">🎨</div>
            <h4 class="no-results-title">No Recommendations Found</h4>
            <p class="no-results-text">
                We couldn't find suitable color combinations for your requirements.
                Try adjusting your color selections or room type.
            </p>
            <button class="btn btn-primary" onclick="document.getElementById('color-form').scrollIntoView({ behavior: 'smooth' })">
                <span class="btn-icon">🔄</span>
                <span>Try Different Colors</span>
            </button>
        `;

        this.resultsContainer.appendChild(noResultsCard);
    }

    /**
     * Display error message
     */
    displayError(error) {
        this.clearResults();
        this.resultsSection.style.display = 'block';

        const errorCard = document.createElement('div');
        errorCard.className = 'error-card';
        errorCard.innerHTML = this.generateErrorHTML(error);

        this.resultsContainer.appendChild(errorCard);

        // Hide action buttons for errors
        if (this.resultsActions) {
            this.resultsActions.style.display = 'none';
        }

        // Announce error for accessibility
        this.announceError(error.message);
    }

    /**
     * Generate error HTML
     */
    generateErrorHTML(error) {
        const errorType = error.type || 'unknown';
        const iconMap = {
            validation: '⚠️',
            network_error: '🌐',
            timeout: '⏱️',
            server_error: '🔧',
            rate_limit: '⏳'
        };

        const icon = iconMap[errorType] || '❌';

        return `
            <div class="error-content">
                <div class="error-icon">${icon}</div>
                <h4 class="error-title">Analysis Failed</h4>
                <p class="error-message">${this.escapeHtml(error.message)}</p>
                ${error.details ? `<p class="error-details">${this.escapeHtml(error.details)}</p>` : ''}
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="document.getElementById('analyze-btn').click()">
                        <span class="btn-icon">🔄</span>
                        <span>Try Again</span>
                    </button>
                    <button class="btn btn-secondary" onclick="document.getElementById('color-form').scrollIntoView({ behavior: 'smooth' })">
                        <span class="btn-icon">✏️</span>
                        <span>Edit Colors</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Clear current results
     */
    clearResults() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }

        if (this.resultsActions) {
            this.resultsActions.style.display = 'none';
        }
    }

    /**
     * Hide results section
     */
    hideResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'none';
        }
        this.clearResults();
    }

    /**
     * Export results functionality
     */
    exportResults() {
        if (!this.currentResults) {
            this.showToast('No results to export', 'error');
            return;
        }

        try {
            const exportData = this.prepareExportData();
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `sanzo-color-analysis-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            this.showToast('Results exported successfully!', 'success');

        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Failed to export results', 'error');
        }
    }

    /**
     * Prepare data for export
     */
    prepareExportData() {
        return {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            source: 'Sanzo Color Advisor',
            analysis: this.currentResults.data,
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                exportDate: new Date().toISOString()
            }
        };
    }

    /**
     * Share results functionality
     */
    async shareResults() {
        if (!this.currentResults) {
            this.showToast('No results to share', 'error');
            return;
        }

        try {
            const shareData = this.prepareShareData();

            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback to clipboard
                await this.copyToClipboard(shareData.text);
                this.showToast('Results copied to clipboard!', 'success');
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                this.showToast('Failed to share results', 'error');
            }
        }
    }

    /**
     * Prepare data for sharing
     */
    prepareShareData() {
        const recommendations = this.currentResults.data.recommendations || [];
        const topRec = recommendations[0];

        const text = `🎨 Sanzo Color Advisor Results\n\n` +
            `Top Recommendation: ${topRec?.name || 'Color Harmony'}\n` +
            `Confidence: ${topRec?.confidence || 'N/A'}%\n` +
            `Colors: ${Object.values(topRec?.colors || {}).map(c => c.hex || c).join(', ')}\n\n` +
            `Get your color analysis at: ${window.location.origin}`;

        return {
            title: 'Sanzo Color Advisor Results',
            text: text,
            url: window.location.href
        };
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    }

    /**
     * Start new analysis
     */
    startNewAnalysis() {
        this.hideResults();
        this.currentResults = null;

        // Scroll to form
        const colorForm = document.getElementById('color-form');
        if (colorForm) {
            colorForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Focus on room type select
        const roomTypeSelect = document.getElementById('room-type');
        if (roomTypeSelect) {
            setTimeout(() => {
                roomTypeSelect.focus();
            }, 500);
        }

        this.showToast('Ready for new analysis', 'success');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toastId = type === 'error' ? 'error-toast' : 'success-toast';
        const messageId = type === 'error' ? 'error-message' : 'success-message';

        const toast = document.getElementById(toastId);
        const messageEl = document.getElementById(messageId);

        if (toast && messageEl) {
            messageEl.textContent = message;
            toast.setAttribute('aria-hidden', 'false');
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.setAttribute('aria-hidden', 'true');
                }, 300);
            }, 4000);
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Announce results for accessibility
     */
    announceResults(count) {
        const message = count === 0
            ? 'No color recommendations found'
            : `${count} color recommendation${count === 1 ? '' : 's'} found`;

        this.announceMessage(message);
    }

    /**
     * Announce error for accessibility
     */
    announceError(message) {
        this.announceMessage(`Error: ${message}`);
    }

    /**
     * Announce message for screen readers
     */
    announceMessage(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Set up color swatch click handlers
     */
    setupColorSwatchHandlers() {
        this.resultsContainer.addEventListener('click', (e) => {
            const swatch = e.target.closest('.swatch-color');
            if (swatch) {
                const color = swatch.parentNode.dataset.color;
                if (color) {
                    this.copyColorToClipboard(color);
                }
            }
        });

        this.resultsContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const swatch = e.target.closest('.swatch-color');
                if (swatch) {
                    e.preventDefault();
                    const color = swatch.parentNode.dataset.color;
                    if (color) {
                        this.copyColorToClipboard(color);
                    }
                }
            }
        });
    }

    /**
     * Copy color to clipboard
     */
    async copyColorToClipboard(color) {
        try {
            await this.copyToClipboard(color);
            this.showToast(`Color ${color} copied to clipboard!`, 'success');
        } catch (error) {
            console.error('Failed to copy color:', error);
            this.showToast('Failed to copy color', 'error');
        }
    }

    /**
     * Destroy the result display instance
     */
    destroy() {
        this.clearResults();
        this.currentResults = null;
        console.log('ResultDisplay destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultDisplay;
}

// Global availability
window.ResultDisplay = ResultDisplay;