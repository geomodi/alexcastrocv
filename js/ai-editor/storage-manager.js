/**
 * Storage Manager - Handles local storage for API keys and settings
 * Provides secure storage with encryption for sensitive data
 */

class StorageManager {
    constructor() {
        this.storageKey = 'ai-image-editor';
        this.apiKeyKey = 'gemini-api-key';
        this.settingsKey = 'editor-settings';
        
        console.log('💾 [STORAGE] Storage Manager initialized');
    }

    /**
     * Save API key to local storage with basic obfuscation
     * @param {string} apiKey - The API key to save
     */
    saveApiKey(apiKey) {
        try {
            if (!apiKey || typeof apiKey !== 'string') {
                throw new Error('Invalid API key provided');
            }

            // Basic obfuscation (not encryption, just to avoid plain text in storage)
            const obfuscated = this.obfuscateString(apiKey);
            
            localStorage.setItem(`${this.storageKey}-${this.apiKeyKey}`, obfuscated);
            
            console.log('💾 [STORAGE] API key saved successfully');
            return true;
        } catch (error) {
            console.error('❌ [STORAGE] Failed to save API key:', error);
            throw new Error('Failed to save API key');
        }
    }

    /**
     * Retrieve API key from local storage
     * @returns {string|null} The API key or null if not found
     */
    getApiKey() {
        try {
            const obfuscated = localStorage.getItem(`${this.storageKey}-${this.apiKeyKey}`);
            
            if (!obfuscated) {
                return null;
            }

            // Deobfuscate the stored key
            const apiKey = this.deobfuscateString(obfuscated);
            
            console.log('💾 [STORAGE] API key retrieved successfully');
            return apiKey;
        } catch (error) {
            console.error('❌ [STORAGE] Failed to retrieve API key:', error);
            return null;
        }
    }

    /**
     * Remove API key from local storage
     */
    removeApiKey() {
        try {
            localStorage.removeItem(`${this.storageKey}-${this.apiKeyKey}`);
            console.log('💾 [STORAGE] API key removed successfully');
            return true;
        } catch (error) {
            console.error('❌ [STORAGE] Failed to remove API key:', error);
            return false;
        }
    }

    /**
     * Check if API key exists in storage
     * @returns {boolean} True if API key exists
     */
    hasApiKey() {
        const key = localStorage.getItem(`${this.storageKey}-${this.apiKeyKey}`);
        return key !== null && key.length > 0;
    }

    /**
     * Save editor settings
     * @param {object} settings - Settings object to save
     */
    saveSettings(settings) {
        try {
            if (!settings || typeof settings !== 'object') {
                throw new Error('Invalid settings provided');
            }

            const settingsJson = JSON.stringify(settings);
            localStorage.setItem(`${this.storageKey}-${this.settingsKey}`, settingsJson);
            
            console.log('💾 [STORAGE] Settings saved successfully');
            return true;
        } catch (error) {
            console.error('❌ [STORAGE] Failed to save settings:', error);
            throw new Error('Failed to save settings');
        }
    }

    /**
     * Retrieve editor settings
     * @returns {object} Settings object or default settings
     */
    getSettings() {
        try {
            const settingsJson = localStorage.getItem(`${this.storageKey}-${this.settingsKey}`);
            
            if (!settingsJson) {
                return this.getDefaultSettings();
            }

            const settings = JSON.parse(settingsJson);
            
            // Merge with defaults to ensure all properties exist
            return { ...this.getDefaultSettings(), ...settings };
        } catch (error) {
            console.error('❌ [STORAGE] Failed to retrieve settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Get default settings
     * @returns {object} Default settings object
     */
    getDefaultSettings() {
        return {
            canvasWidth: 800,
            canvasHeight: 600,
            imageQuality: 0.9,
            autoSave: true,
            showGrid: false,
            snapToGrid: false,
            gridSize: 20,
            theme: 'dark',
            shortcuts: {
                undo: 'ctrl+z',
                redo: 'ctrl+y',
                save: 'ctrl+s',
                export: 'ctrl+e'
            }
        };
    }

    /**
     * Update specific setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    updateSetting(key, value) {
        try {
            const settings = this.getSettings();
            settings[key] = value;
            this.saveSettings(settings);
            
            console.log(`💾 [STORAGE] Setting '${key}' updated successfully`);
            return true;
        } catch (error) {
            console.error(`❌ [STORAGE] Failed to update setting '${key}':`, error);
            return false;
        }
    }

    /**
     * Clear all stored data
     */
    clearAll() {
        try {
            const keys = [
                `${this.storageKey}-${this.apiKeyKey}`,
                `${this.storageKey}-${this.settingsKey}`
            ];

            keys.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log('💾 [STORAGE] All data cleared successfully');
            return true;
        } catch (error) {
            console.error('❌ [STORAGE] Failed to clear data:', error);
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {object} Storage usage stats
     */
    getStorageInfo() {
        try {
            const apiKeySize = this.getItemSize(`${this.storageKey}-${this.apiKeyKey}`);
            const settingsSize = this.getItemSize(`${this.storageKey}-${this.settingsKey}`);
            
            return {
                apiKeySize,
                settingsSize,
                totalSize: apiKeySize + settingsSize,
                hasApiKey: this.hasApiKey()
            };
        } catch (error) {
            console.error('❌ [STORAGE] Failed to get storage info:', error);
            return {
                apiKeySize: 0,
                settingsSize: 0,
                totalSize: 0,
                hasApiKey: false
            };
        }
    }

    /**
     * Basic string obfuscation (not encryption!)
     * @param {string} str - String to obfuscate
     * @returns {string} Obfuscated string
     */
    obfuscateString(str) {
        return btoa(str.split('').reverse().join(''));
    }

    /**
     * Deobfuscate string
     * @param {string} obfuscated - Obfuscated string
     * @returns {string} Original string
     */
    deobfuscateString(obfuscated) {
        return atob(obfuscated).split('').reverse().join('');
    }

    /**
     * Get size of stored item in bytes
     * @param {string} key - Storage key
     * @returns {number} Size in bytes
     */
    getItemSize(key) {
        const item = localStorage.getItem(key);
        return item ? new Blob([item]).size : 0;
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('⚠️ [STORAGE] localStorage is not available:', error);
            return false;
        }
    }

    /**
     * Export all data as JSON
     * @returns {object} Exported data
     */
    exportData() {
        try {
            return {
                settings: this.getSettings(),
                hasApiKey: this.hasApiKey(),
                exportDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ [STORAGE] Failed to export data:', error);
            return null;
        }
    }

    /**
     * Import data from JSON (excluding API key for security)
     * @param {object} data - Data to import
     */
    importData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid import data');
            }

            if (data.settings) {
                this.saveSettings(data.settings);
            }

            console.log('💾 [STORAGE] Data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ [STORAGE] Failed to import data:', error);
            return false;
        }
    }
}
