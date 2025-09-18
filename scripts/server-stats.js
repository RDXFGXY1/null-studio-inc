/**
 * Server Statistics Fetcher
 * Fetches live server count and statistics from GitHub repository
 */

class ServerStats {
    constructor(config = {}) {
        this.config = {
            // Default GitHub repository URL (replace with your actual repository)
            githubRepo: config.githubRepo || 'RDXFGXY1/null-tracker',
            // Path to the stats file in the repository
            statsFile: config.statsFile || 'stats/server_count.json',
            // Branch to fetch from
            branch: config.branch || 'main',
            // Cache duration in milliseconds (5 minutes default)
            cacheTimeout: config.cacheTimeout || 300000,
            // Enable debug logging
            debug: config.debug || false,
            // Retry configuration
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 1000,
            ...config
        };
        
        this.cache = {
            data: null,
            timestamp: 0
        };
        
        this.log = this.config.debug ? console.log.bind(console, '[ServerStats]') : () => {};
    }
    
    /**
     * Get the GitHub raw content URL for the stats file
     */
    getStatsUrl() {
        return `https://raw.githubusercontent.com/${this.config.githubRepo}/${this.config.branch}/${this.config.statsFile}`;
    }
    
    /**
     * Check if cached data is still valid
     */
    isCacheValid() {
        const now = Date.now();
        const cacheAge = now - this.cache.timestamp;
        return this.cache.data && cacheAge < this.config.cacheTimeout;
    }
    
    /**
     * Fetch server statistics with retry logic
     */
    async fetchWithRetry(url, retries = this.config.maxRetries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                this.log(`Attempt ${attempt}/${retries}: Fetching ${url}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    // Add timestamp to prevent caching
                    cache: 'no-store'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                this.log('Successfully fetched server stats:', data);
                return data;
                
            } catch (error) {
                this.log(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt === retries) {
                    throw error;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
            }
        }
    }
    
    /**
     * Fetch server statistics from GitHub
     */
    async fetchStats() {
        // Return cached data if valid
        if (this.isCacheValid()) {
            this.log('Returning cached stats');
            return this.cache.data;
        }
        
        try {
            const url = this.getStatsUrl();
            const data = await this.fetchWithRetry(url);
            
            // Validate the data structure
            if (!this.validateStatsData(data)) {
                throw new Error('Invalid stats data structure');
            }
            
            // Update cache
            this.cache = {
                data: data,
                timestamp: Date.now()
            };
            
            return data;
            
        } catch (error) {
            this.log('Error fetching server stats:', error);
            
            // Return fallback data
            const fallbackData = {
                server_count: 0,
                total_members: 0,
                bot_status: 'offline',
                updated: new Date().toISOString(),
                error: true,
                error_message: error.message
            };
            
            // Cache the fallback data for a shorter time
            this.cache = {
                data: fallbackData,
                timestamp: Date.now() - (this.config.cacheTimeout - 30000) // Cache for only 30 seconds
            };
            
            return fallbackData;
        }
    }
    
    /**
     * Validate the structure of stats data
     */
    validateStatsData(data) {
        const requiredFields = ['server_count', 'updated'];
        
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        for (const field of requiredFields) {
            if (!(field in data)) {
                this.log(`Missing required field: ${field}`);
                return false;
            }
        }
        
        if (typeof data.server_count !== 'number' || data.server_count < 0) {
            this.log('Invalid server_count value');
            return false;
        }
        
        return true;
    }
    
    /**
     * Update DOM elements with server statistics
     */
    updateDOM(stats) {
        const updates = {
            'server-count': this.formatNumber(stats.server_count),
            'total-members': this.formatNumber(stats.total_members || 0),
            'bot-status': stats.bot_status || 'offline',
            'last-updated': this.formatDate(stats.updated)
        };
        
        Object.entries(updates).forEach(([id, value]) => {
            const elements = document.querySelectorAll(`#${id}, .${id}`);
            elements.forEach(element => {
                if (element) {
                    element.textContent = value;
                    element.classList.remove('loading');
                    
                    // Add status classes
                    if (id === 'server-count' || id === 'total-members') {
                        element.classList.add('stat-loaded');
                    }
                    
                    if (id === 'bot-status') {
                        element.classList.remove('online', 'offline');
                        element.classList.add(stats.bot_status || 'offline');
                    }
                }
            });
        });
        
        // Update any elements with data attributes
        const dataElements = document.querySelectorAll('[data-stat]');
        dataElements.forEach(element => {
            const statName = element.getAttribute('data-stat');
            if (stats[statName] !== undefined) {
                element.textContent = this.formatStatValue(stats[statName], statName);
                element.classList.remove('loading');
            }
        });
        
        this.log('DOM updated with stats:', updates);
    }
    
    /**
     * Format numbers with appropriate suffixes
     */
    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        
        return num.toLocaleString();
    }
    
    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffMins < 1) {
                return 'Just now';
            } else if (diffMins < 60) {
                return `${diffMins}m ago`;
            } else if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else if (diffDays < 7) {
                return `${diffDays}d ago`;
            } else {
                return date.toLocaleDateString();
            }
        } catch (error) {
            this.log('Error formatting date:', error);
            return 'Unknown';
        }
    }
    
    /**
     * Format stat values based on their type
     */
    formatStatValue(value, statName) {
        switch (statName) {
            case 'server_count':
            case 'total_members':
                return this.formatNumber(value);
            case 'updated':
                return this.formatDate(value);
            case 'bot_status':
                return value === 'online' ? '🟢 Online' : '🔴 Offline';
            default:
                return value;
        }
    }
    
    /**
     * Initialize automatic updates
     */
    startAutoUpdate(intervalMs = 300000) { // 5 minutes default
        this.log(`Starting auto-update with interval: ${intervalMs}ms`);
        
        // Initial load
        this.loadAndUpdate();
        
        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.loadAndUpdate();
        }, intervalMs);
        
        // Update when page becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.log('Page became visible, updating stats');
                this.loadAndUpdate();
            }
        });
        
        return this.updateInterval;
    }
    
    /**
     * Stop automatic updates
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            this.log('Auto-update stopped');
        }
    }
    
    /**
     * Load stats and update DOM
     */
    async loadAndUpdate() {
        try {
            const stats = await this.fetchStats();
            this.updateDOM(stats);
            
            // Dispatch custom event
            const event = new CustomEvent('serverStatsUpdated', {
                detail: { stats, error: stats.error || false }
            });
            document.dispatchEvent(event);
            
            return stats;
        } catch (error) {
            this.log('Error in loadAndUpdate:', error);
            
            // Dispatch error event
            const event = new CustomEvent('serverStatsError', {
                detail: { error: error.message }
            });
            document.dispatchEvent(event);
            
            throw error;
        }
    }
    
    /**
     * Get current stats (from cache or fetch new)
     */
    async getStats() {
        return await this.fetchStats();
    }
    
    /**
     * Clear cache and force refresh
     */
    refresh() {
        this.cache = { data: null, timestamp: 0 };
        return this.loadAndUpdate();
    }
}

// Auto-initialize if configuration is found
if (typeof window !== 'undefined') {
    // Default configuration - update this with your repository details
    window.ServerStats = ServerStats;
    
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Check if there are elements that need server stats
        const statsElements = document.querySelectorAll(
            '#server-count, .server-count, [data-stat], #total-members, .total-members'
        );
        
        if (statsElements.length > 0) {
            // Initialize with default config - you'll need to update this
            const serverStats = new ServerStats({
                githubRepo: 'yourusername/yourrepo', // UPDATE THIS
                debug: window.location.hostname === 'localhost'
            });
            
            // Start auto-updates
            serverStats.startAutoUpdate();
            
            // Make available globally for debugging
            window.nullTrackerStats = serverStats;
            
            console.log('🤖 NullTracker server stats initialized');
        }
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServerStats;
}
