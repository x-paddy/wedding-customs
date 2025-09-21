// Dashboard JavaScript - Wedding Traditions

// Global dashboard object
const Dashboard = {
    data: {
        stats: null,
        lighthouse: null,
        api: null,
        inlinks: null
    },
    
    // Initialize dashboard
    async init() {
        console.log('Initializing Dashboard...');
        
        // Load all data
        await this.loadData();
        
        // Update UI
        this.updateLastUpdated();
        this.initializeTabNavigation();
        
        // Load page-specific functionality
        const currentPage = window.location.pathname.split('/').pop();
        
        switch(currentPage) {
            case 'index.html':
            case '':
                this.initOverviewPage();
                break;
            case 'api.html':
                this.initAPIPage();
                break;
            case 'inlinks.html':
                this.initInlinksPage();
                break;
        }
    },
    
    // Load all dashboard data
    async loadData() {
        try {
            // Load dashboard stats
            const statsResponse = await fetch('data/dashboard-stats.json');
            if (statsResponse.ok) {
                this.data.stats = await statsResponse.json();
            }
            
            // Load lighthouse data
            const lighthouseResponse = await fetch('data/lighthouse-summary.json');
            if (lighthouseResponse.ok) {
                this.data.lighthouse = await lighthouseResponse.json();
            }
            
            // Load API data
            const apiResponse = await fetch('data/api-dashboard-data.json');
            if (apiResponse.ok) {
                this.data.api = await apiResponse.json();
            }
            
            // Load inlinks data
            const inlinksResponse = await fetch('data/inlinks-data.json');
            if (inlinksResponse.ok) {
                this.data.inlinks = await inlinksResponse.json();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    },
    
    // Update last updated timestamp
    updateLastUpdated() {
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl && this.data.stats) {
            const date = new Date(this.data.stats.last_updated);
            lastUpdatedEl.textContent = date.toLocaleString();
        }
    },
    
    // Initialize tab navigation
    initializeTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    },
    
    // Initialize overview page
    initOverviewPage() {
        if (!this.data.stats) return;
        
        // Update overview stats
        const stats = this.data.stats.overview;
        this.updateElementText('totalArticles', stats.total_articles);
        this.updateElementText('totalCountries', stats.total_countries);
        this.updateElementText('totalWords', this.formatNumber(stats.total_words));
        this.updateElementText('totalPronunciations', this.formatNumber(stats.total_pronunciations));
        
        // Update performance scores
        const perf = this.data.stats.performance;
        if (perf.lighthouse) {
            this.updateScoreCircle('performance', Math.round(perf.lighthouse.average_performance));
            this.updateScoreCircle('accessibility', Math.round(perf.lighthouse.average_accessibility));
            this.updateScoreCircle('best-practices', Math.round(perf.lighthouse.average_best_practices));
            this.updateScoreCircle('seo', Math.round(perf.lighthouse.average_seo));
        }
        
        // Update Core Web Vitals
        if (perf.core_web_vitals) {
            this.updateElementText('avgFCP', this.formatTime(perf.core_web_vitals.average_fcp));
            this.updateElementText('avgLCP', this.formatTime(perf.core_web_vitals.average_lcp));
            this.updateElementText('avgCLS', perf.core_web_vitals.average_cls.toFixed(3));
            this.updateElementText('avgTBT', this.formatTime(perf.core_web_vitals.average_tbt));
            this.updateElementText('avgTTI', this.formatTime(perf.core_web_vitals.average_tti));
        }
    },
    
    // Initialize API page
    initAPIPage() {
        // This will be handled by api-dashboard.js
        if (typeof initializeAPIDashboard === 'function') {
            initializeAPIDashboard(this.data);
        }
    },
    
    // Initialize inlinks page
    initInlinksPage() {
        // This will be handled by inlinks-dashboard.js
        if (typeof initializeInlinksDashboard === 'function') {
            initializeInlinksDashboard(this.data);
        }
    },
    
    // Helper functions
    updateElementText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },
    
    updateScoreCircle(type, score) {
        const circle = document.querySelector(`.score-circle.${type} .circle`);
        const text = document.querySelector(`.score-circle.${type} .percentage`);
        
        if (circle) {
            circle.setAttribute('stroke-dasharray', `${score}, 100`);
        }
        if (text) {
            text.textContent = score;
        }
    },
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toLocaleString();
    },
    
    formatTime(ms) {
        if (ms >= 1000) {
            return (ms / 1000).toFixed(1) + 's';
        }
        return Math.round(ms) + 'ms';
    },
    
    formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

// Export for use in other scripts
window.Dashboard = Dashboard;