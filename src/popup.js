let currentTab = null;
let currentLanguage = 'ru';

(function() {
  chrome.storage.sync.get(['epilepsyMode'], (result) => {
    const epilepsy = result.epilepsyMode || false;
    if (epilepsy) {
      document.documentElement.setAttribute('data-accessibility', 'true');
      document.body.setAttribute('data-accessibility', 'true');
    }
  });
})();

// Initialize language
async function initLanguage() {
  currentLanguage = await getLanguage();
  await translatePage();
}

async function updateStatusTexts() {
  const statusBadge = document.getElementById("globalStatusBadge");
  const globalToggle = document.getElementById("globalToggle");
  const isActive = globalToggle.classList.contains("active");
  
  chrome.storage.sync.get(["globalEnabled", "blacklistDomains", "whitelistDomains"], async (result) => {
    const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
    const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
    
    if (!globalEnabled) {
      statusBadge.textContent = await t("popup.statusOff", currentLanguage);
      statusBadge.className = "status-badge inactive";
      return;
    }

    if (!currentTab?.url) {
      statusBadge.textContent = await t("popup.statusOn", currentLanguage);
      statusBadge.className = "status-badge active";
      return;
    }

    try {
      const urlObj = new URL(currentTab.url);
      const currentHost = urlObj.hostname;

      const isBlacklisted = blacklistDomains && blacklistDomains.length > 0 && blacklistDomains.some((pattern) => {
        if (!pattern || pattern.trim() === '') {
          return false;
        }
        
        const trimmedPattern = pattern.trim();
        
        if (trimmedPattern.includes('*')) {
          const regexPattern = trimmedPattern
            .replace(/\./g, "\\.")
            .replace(/\*/g, ".*");
          const regex = new RegExp(`^${regexPattern}$`);
          return regex.test(currentHost);
        }
        
        if (trimmedPattern === currentHost) {
          return true;
        }
        
        if (currentHost.endsWith('.' + trimmedPattern) || currentHost === trimmedPattern) {
          return true;
        }
        
        return false;
      });

      if (isBlacklisted) {
        statusBadge.textContent = await t("popup.statusDisabledOnDomain", currentLanguage);
        statusBadge.className = "status-badge inactive";
      } else {
        statusBadge.textContent = await t("popup.statusOn", currentLanguage);
        statusBadge.className = "status-badge active";
      }
    } catch (e) {
      statusBadge.textContent = await t("popup.statusOn", currentLanguage);
      statusBadge.className = "status-badge active";
    }
  });
}

// Get current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url) {
    currentTab = tabs[0];
    updateCurrentDomain(tabs[0].url);
  }
});

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
chrome.storage.sync.get(["globalEnabled", "blacklistDomains", "whitelistDomains", "epilepsyMode"], async (result) => {
  const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
  const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
  const epilepsyMode = result.epilepsyMode || false;

  if (epilepsyMode) {
    document.documentElement.setAttribute('data-accessibility', 'true');
    document.body.setAttribute('data-accessibility', 'true');
  }

  // Update toggle state
  const globalToggle = document.getElementById("globalToggle");
  const globalToggleLabel = document.getElementById("globalToggleLabel");
  if (globalEnabled) {
    globalToggle.classList.add("active");
    if (globalToggleLabel) globalToggleLabel.textContent = "ON";
  } else {
    globalToggle.classList.remove("active");
    if (globalToggleLabel) globalToggleLabel.textContent = "OFF";
  }

  await initLanguage();
  
  await updateStatusBadge(globalEnabled, currentTab?.url, blacklistDomains);
});

async function updateStatusBadge(globalEnabled, url, blacklistDomains) {
  const statusBadge = document.getElementById("globalStatusBadge");
  
  if (!globalEnabled) {
    statusBadge.textContent = await t("popup.statusOff", currentLanguage);
    statusBadge.className = "status-badge inactive";
    return;
  }

  if (!url) {
    statusBadge.textContent = await t("popup.statusOn", currentLanguage);
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
      
      if (trimmedPattern.includes('*')) {
        const regexPattern = trimmedPattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*");
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(currentHost);
      }
      
      if (trimmedPattern === currentHost) {
        return true;
      }
      
      if (currentHost.endsWith('.' + trimmedPattern) || currentHost === trimmedPattern) {
        return true;
      }
      
      return false;
    });

    if (isBlacklisted) {
      statusBadge.textContent = await t("popup.statusDisabledOnDomain", currentLanguage);
      statusBadge.className = "status-badge inactive";
    } else {
      statusBadge.textContent = await t("popup.statusOn", currentLanguage);
      statusBadge.className = "status-badge active";
    }
  } catch (e) {
    statusBadge.textContent = await t("popup.statusOn", currentLanguage);
    statusBadge.className = "status-badge active";
  }
}

const globalToggle = document.getElementById("globalToggle");
const globalToggleLabel = document.getElementById("globalToggleLabel");
globalToggle.addEventListener("click", async function () {
  this.classList.toggle("active");
  const isEnabled = this.classList.contains("active");
  
  if (globalToggleLabel) {
    globalToggleLabel.textContent = isEnabled ? "ON" : "OFF";
  }

  // Save to chrome storage
  chrome.storage.sync.set({ globalEnabled: isEnabled }, () => {
    // Reload current tab to apply changes
    if (currentTab) {
      chrome.tabs.reload(currentTab.id);
    }
    
    chrome.storage.sync.get(["blacklistDomains", "whitelistDomains"], async (result) => {
      const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
      await updateStatusBadge(isEnabled, currentTab?.url, blacklistDomains);
    });
  });
});

const openOptionsButton = document.getElementById("openOptions");
openOptionsButton.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Listen for storage changes
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === "sync") {
    if (changes.globalEnabled) {
      const globalEnabled = changes.globalEnabled.newValue;
      const globalToggle = document.getElementById("globalToggle");
      const globalToggleLabel = document.getElementById("globalToggleLabel");
      if (globalEnabled) {
        globalToggle.classList.add("active");
        if (globalToggleLabel) globalToggleLabel.textContent = "ON";
      } else {
        globalToggle.classList.remove("active");
        if (globalToggleLabel) globalToggleLabel.textContent = "OFF";
      }

      chrome.storage.sync.get(["blacklistDomains", "whitelistDomains"], async (result) => {
        const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
        await updateStatusBadge(globalEnabled, currentTab?.url, blacklistDomains);
      });
    }
    
    if (changes.blacklistDomains || changes.whitelistDomains) {
      chrome.storage.sync.get(["globalEnabled", "blacklistDomains", "whitelistDomains"], async (result) => {
        const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
        const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];
        await updateStatusBadge(globalEnabled, currentTab?.url, blacklistDomains);
      });
    }
    
    if (changes.language) {
      currentLanguage = changes.language.newValue;
      await translatePage();
      await updateStatusTexts();
    }
    
    if (changes.epilepsyMode) {
      const epilepsyMode = changes.epilepsyMode.newValue;
      if (epilepsyMode) {
        document.documentElement.setAttribute('data-accessibility', 'true');
        document.body.setAttribute('data-accessibility', 'true');
      } else {
        document.documentElement.removeAttribute('data-accessibility');
        document.body.removeAttribute('data-accessibility');
      }
    }
  }
});
