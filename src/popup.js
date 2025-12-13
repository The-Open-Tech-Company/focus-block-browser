// Popup script for managing extension state

let currentTab = null;

// Get current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url) {
    currentTab = tabs[0];
    updateCurrentDomain(tabs[0].url);
  }
});

// Update current domain display
function updateCurrentDomain(url) {
  try {
    const urlObj = new URL(url);
    const domainName = document.getElementById("currentDomain");
    domainName.textContent = urlObj.hostname;
  } catch (e) {
    document.getElementById("currentDomain").textContent = "-";
  }
}

// Load saved settings
chrome.storage.sync.get(["globalEnabled", "blacklistDomains", "whitelistDomains"], (result) => {
  const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
  const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];

  // Update toggle state
  const globalToggle = document.getElementById("globalToggle");
  if (globalEnabled) {
    globalToggle.classList.add("active");
  } else {
    globalToggle.classList.remove("active");
  }

  // Update status badge
  updateStatusBadge(globalEnabled, currentTab?.url, blacklistDomains);
});

// Update status badge based on global state and blacklist (domains where extension is off)
function updateStatusBadge(globalEnabled, url, blacklistDomains) {
  const statusBadge = document.getElementById("globalStatusBadge");
  
  if (!globalEnabled) {
    statusBadge.textContent = "Выкл";
    statusBadge.className = "status-badge inactive";
    return;
  }

  if (!url) {
    statusBadge.textContent = "Вкл";
    statusBadge.className = "status-badge active";
    return;
  }

  try {
    const urlObj = new URL(url);
    const currentHost = urlObj.hostname;

    const isBlacklisted = blacklistDomains && blacklistDomains.length > 0 && blacklistDomains.some((pattern) => {
      if (!pattern || pattern.trim() === '') {
        return false;
      }
      
      const trimmedPattern = pattern.trim();
      
      // If pattern contains wildcard, use regex matching
      if (trimmedPattern.includes('*')) {
        const regexPattern = trimmedPattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*");
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

    statusBadge.textContent = isBlacklisted ? "Отключено на домене" : "Активно";
    statusBadge.className = isBlacklisted ? "status-badge inactive" : "status-badge active";
  } catch (e) {
    statusBadge.textContent = "Вкл";
    statusBadge.className = "status-badge active";
  }
}

// Handle global toggle click
const globalToggle = document.getElementById("globalToggle");
globalToggle.addEventListener("click", function () {
  this.classList.toggle("active");
  const isEnabled = this.classList.contains("active");

  // Save to chrome storage
  chrome.storage.sync.set({ globalEnabled: isEnabled }, () => {
    // Reload current tab to apply changes
    if (currentTab) {
      chrome.tabs.reload(currentTab.id);
    }
    
    // Update status badge
    chrome.storage.sync.get(["blacklistDomains", "whitelistDomains"], (result) => {
      const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
      updateStatusBadge(isEnabled, currentTab?.url, blacklistDomains);
    });
  });
});

// Handle settings button click
const openOptionsButton = document.getElementById("openOptions");
openOptionsButton.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    if (changes.globalEnabled) {
      const globalEnabled = changes.globalEnabled.newValue;
      const globalToggle = document.getElementById("globalToggle");
      if (globalEnabled) {
        globalToggle.classList.add("active");
      } else {
        globalToggle.classList.remove("active");
      }

      chrome.storage.sync.get(["blacklistDomains", "whitelistDomains"], (result) => {
        const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
        updateStatusBadge(globalEnabled, currentTab?.url, blacklistDomains);
      });
    }
    
    if (changes.blacklistDomains || changes.whitelistDomains) {
      chrome.storage.sync.get(["globalEnabled", "blacklistDomains", "whitelistDomains"], (result) => {
        const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
        const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
        updateStatusBadge(globalEnabled, currentTab?.url, blacklistDomains);
      });
    }
  }
});

