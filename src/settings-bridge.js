// This script runs in the content script context and can access chrome.storage
// It bridges the settings between chrome.storage and the MAIN world content script

const DEFAULT_BLOCKED_EVENTS = [
    "visibilitychange",
    "webkitvisibilitychange",
    "mozvisibilitychange",
    "msvisibilitychange",
    "blur",
    "focus",
    "focusin",
    "focusout"
];

const DEFAULT_BLACKLIST_DOMAINS = [];

// Check if current domain is blacklisted (extension should NOT work)
function checkBlacklist(blacklistDomains) {
    if (!blacklistDomains || blacklistDomains.length === 0) {
        return false;
    }
    
    const currentHost = window.location.hostname;
    
    return blacklistDomains.some(pattern => {
        if (!pattern || pattern.trim() === '') {
            return false;
        }
        
        const trimmedPattern = pattern.trim();
        
        // If pattern contains wildcard, use regex matching
        if (trimmedPattern.includes('*')) {
            const regexPattern = trimmedPattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(currentHost);
        }
        
        // Exact match
        if (trimmedPattern === currentHost) {
            return true;
        }
        
        // Check if current host is a subdomain of the pattern
        // e.g., if pattern is "example.com", match "www.example.com", "sub.example.com", etc.
        if (currentHost.endsWith('.' + trimmedPattern) || currentHost === trimmedPattern) {
            return true;
        }
        
        return false;
    });
}

// Load initial settings
chrome.storage.sync.get(['blockedEvents', 'blacklistDomains', 'whitelistDomains', 'globalEnabled'], (result) => {
    const blockedEvents = result.blockedEvents || DEFAULT_BLOCKED_EVENTS;
    // whitelistDomains kept for backward compatibility
    const blacklistDomains = result.blacklistDomains || result.whitelistDomains || DEFAULT_BLACKLIST_DOMAINS;
    const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
    const isBlacklisted = checkBlacklist(blacklistDomains);
    const isEnabled = globalEnabled && !isBlacklisted;

    window.postMessage({ 
        type: 'FOCUS_BLOCKER_SETTINGS', 
        blockedEvents,
        isEnabled
    }, '*');
});

// Listen for changes in settings
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        chrome.storage.sync.get(['blockedEvents', 'blacklistDomains', 'whitelistDomains', 'globalEnabled'], (result) => {
            const blockedEvents = result.blockedEvents || DEFAULT_BLOCKED_EVENTS;
            const blacklistDomains = result.blacklistDomains || result.whitelistDomains || DEFAULT_BLACKLIST_DOMAINS;
            const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
            const isBlacklisted = checkBlacklist(blacklistDomains);
            const isEnabled = globalEnabled && !isBlacklisted;

            window.postMessage({ 
                type: 'FOCUS_BLOCKER_SETTINGS', 
                blockedEvents,
                isEnabled
            }, '*');
        });
    }
});