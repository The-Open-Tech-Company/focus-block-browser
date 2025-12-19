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
      
      if (currentHost.endsWith('.' + trimmedPattern) || currentHost === trimmedPattern) {
            return true;
        }
        
        return false;
    });
}

// Load initial settings
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