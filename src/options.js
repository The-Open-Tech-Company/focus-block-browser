const DEFAULT_BLOCKED_EVENTS = [
  "visibilitychange",
  "webkitvisibilitychange",
  "mozvisibilitychange",
  "msvisibilitychange",
  "blur",
  "focus",
  "focusin",
  "focusout",
];

const DEFAULT_HIGHLIGHT_ENABLED = true;
const DEFAULT_BORDER_COLOR = "#4169E1";
const DEFAULT_BORDER_OPACITY = 100;
const DEFAULT_BLACKLIST_DOMAINS = [];
const DEFAULT_EPILEPSY_MODE = false;
const EXTENSION_VERSION = "2.0.0";
let currentLanguage = 'ru';
let currentTheme = 'light';
let epilepsyMode = false;

// Apply theme and accessibility mode immediately to prevent flash
(function() {
  chrome.storage.sync.get(['theme', 'epilepsyMode'], (result) => {
    const theme = result.theme || 'light';
    const epilepsy = result.epilepsyMode || false;
    
    const finalTheme = epilepsy ? 'light' : theme;
    
    document.documentElement.setAttribute('data-theme', finalTheme);
    document.body.setAttribute('data-theme', finalTheme);
    
    if (epilepsy) {
      document.documentElement.setAttribute('data-accessibility', 'true');
      document.body.setAttribute('data-accessibility', 'true');
    }
  });
})();

// Normalize domain: www.example.com, https://example.com, example.com -> example.com
function normalizeDomain(domain) {
  if (!domain || typeof domain !== 'string') return '';
  
  let normalized = domain.trim();
  
  normalized = normalized.replace(/^https?:\/\//i, '');
  normalized = normalized.replace(/^www\./i, '');
  normalized = normalized.replace(/\/$/, '');
  
  const urlMatch = normalized.match(/^([^\/\?#]+)/);
  if (urlMatch) {
    normalized = urlMatch[1];
  }
  
  normalized = normalized.split(':')[0];
  
  return normalized.toLowerCase();
}

// Update toggle labels
function updateToggleLabel(toggle) {
  const toggleId = toggle.id || toggle.dataset.event;
  const label = document.querySelector(`[data-toggle-label="${toggleId}"]`);
  if (label) {
    label.textContent = toggle.classList.contains('active') ? 'ON' : 'OFF';
  }
}

function initSidebar() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const sections = document.querySelectorAll('.content-section');
  
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;
      
      // Update active sidebar item
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Show corresponding section
      sections.forEach(s => s.classList.remove('active'));
      const targetSection = document.getElementById(`${sectionId}-section`);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

async function initThemeSwitcher() {
  const themeSwitcher = document.getElementById('theme-switcher');
  if (!themeSwitcher) return;
  
  chrome.storage.sync.get(['theme'], (result) => {
    currentTheme = result.theme || 'light';
    applyTheme(currentTheme);
    
    // Update theme switcher buttons
    const themeButtons = themeSwitcher.querySelectorAll('.lang-btn');
    themeButtons.forEach(btn => {
      if (btn.dataset.theme === currentTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });
  
  const themeButtons = themeSwitcher.querySelectorAll('.lang-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const theme = btn.dataset.theme;
      await setTheme(theme);
      currentTheme = theme;
      
      // Update active state
      themeButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.theme === theme);
      });
    });
  });
}

function setTheme(theme) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ theme: theme }, () => {
      applyTheme(theme);
      resolve();
    });
  });
}

// Apply theme
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
}

// Initialize language switcher
async function initLanguageSwitcher() {
  currentLanguage = await getLanguage();
  
  // Update active button in header
  const headerLangButtons = document.querySelectorAll('.header .lang-btn');
  headerLangButtons.forEach(btn => {
    if (btn.dataset.lang === currentLanguage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update active button in general section
  const generalSection = document.getElementById('general-section');
  if (generalSection) {
    const generalLangButtons = generalSection.querySelectorAll('.lang-btn');
    generalLangButtons.forEach(btn => {
      if (btn.dataset.lang === currentLanguage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  // Add click handlers for header
  headerLangButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      await setLanguage(lang);
      currentLanguage = lang;
      
      // Update all language buttons
      document.querySelectorAll('.lang-btn[data-lang]').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
      });
      
      await translatePage();
    });
  });
  
  // Add click handlers for general section
  if (generalSection) {
    const generalLangButtons = generalSection.querySelectorAll('.lang-btn');
    generalLangButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const lang = btn.dataset.lang;
        await setLanguage(lang);
        currentLanguage = lang;
        
        // Update all language buttons
        document.querySelectorAll('.lang-btn[data-lang]').forEach(b => {
          b.classList.toggle('active', b.dataset.lang === lang);
        });
        
        await translatePage();
      });
    });
  }
  
  await translatePage();
}

// Initialize domain management
function initDomainManagement() {
  const addDomainBtn = document.getElementById('addDomainBtn');
  const domainModal = document.getElementById('domainModal');
  const domainInput = document.getElementById('domainInput');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');
  
  if (!addDomainBtn || !domainModal || !domainInput || !modalCancel || !modalConfirm) {
    return;
  }
  
  // Open modal
  addDomainBtn.addEventListener('click', () => {
    domainInput.value = '';
    domainModal.classList.add('show');
    setTimeout(() => domainInput.focus(), 100);
  });
  
  // Close modal
  modalCancel.addEventListener('click', () => {
    domainModal.classList.remove('show');
  });
  
  domainModal.addEventListener('click', (e) => {
    if (e.target === domainModal) {
      domainModal.classList.remove('show');
    }
  });
  
  // Confirm add domain
  modalConfirm.addEventListener('click', async () => {
    const domain = domainInput.value.trim();
    if (domain) {
      const normalized = normalizeDomain(domain);
      if (normalized) {
        await addDomain(normalized);
        domainModal.classList.remove('show');
        domainInput.value = '';
      }
    }
  });
  
  domainInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const domain = domainInput.value.trim();
      if (domain) {
        const normalized = normalizeDomain(domain);
        if (normalized) {
          await addDomain(normalized);
          domainModal.classList.remove('show');
          domainInput.value = '';
        }
      }
    }
  });
  
  // Load and display domains
  loadDomains();
}

// Load domains from storage
function loadDomains() {
  chrome.storage.sync.get(['blacklistDomains', 'whitelistDomains'], (result) => {
    const domains = result.blacklistDomains || result.whitelistDomains || [];
    displayDomains(domains);
  });
}

// Display domains
function displayDomains(domains) {
  const domainList = document.getElementById('domainList');
  
  if (!domainList) return;
  
  if (domains.length === 0) {
    domainList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div data-i18n="domains.empty">Нет доменов в blacklist</div>
      </div>
    `;
    translatePage();
    return;
  }
  
  domainList.innerHTML = domains.map((domain, index) => `
    <div class="domain-item" data-domain="${domain}" style="animation-delay: ${index * 0.05}s">
      <div class="domain-name">${domain}</div>
      <button class="domain-remove" data-domain="${domain}" data-i18n="domains.remove">Удалить</button>
    </div>
  `).join('');
  
  // Add remove handlers
  document.querySelectorAll('.domain-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const domain = btn.dataset.domain;
      await removeDomain(domain);
    });
  });
  
  translatePage();
}

// Add domain
async function addDomain(domain) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['blacklistDomains', 'whitelistDomains'], (result) => {
      const domains = result.blacklistDomains || result.whitelistDomains || [];
      
      // Check if domain already exists (normalized)
      const normalizedDomains = domains.map(d => normalizeDomain(d));
      if (normalizedDomains.includes(domain)) {
        resolve();
        return;
      }
      
      domains.push(domain);
      
      chrome.storage.sync.set({ blacklistDomains: domains }, () => {
        loadDomains();
        saveSettings();
        resolve();
      });
    });
  });
}

// Remove domain
async function removeDomain(domain) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['blacklistDomains', 'whitelistDomains'], (result) => {
      const domains = result.blacklistDomains || result.whitelistDomains || [];
      const normalized = normalizeDomain(domain);
      
      const filtered = domains.filter(d => normalizeDomain(d) !== normalized);
      
      chrome.storage.sync.set({ blacklistDomains: filtered }, () => {
        loadDomains();
        saveSettings();
        resolve();
      });
    });
  });
}

// Initialize accessibility mode
function initAccessibilityMode() {
  const epilepsyToggle = document.getElementById('epilepsyMode');
  if (!epilepsyToggle) return;
  
  // Load saved state
  chrome.storage.sync.get(['epilepsyMode'], (result) => {
    epilepsyMode = result.epilepsyMode || false;
    
    if (epilepsyMode) {
      epilepsyToggle.classList.add('active');
      applyAccessibilityMode(true);
    }
  });
  
  // Update toggle label
  function updateEpilepsyToggleLabel() {
    const label = document.querySelector('[data-toggle-label="epilepsyMode"]');
    if (label) {
      label.textContent = epilepsyMode ? 'ON' : 'OFF';
    }
  }
  
  updateEpilepsyToggleLabel();
  
  // Handle toggle
  epilepsyToggle.addEventListener('click', async () => {
    epilepsyToggle.classList.toggle('active');
    epilepsyMode = epilepsyToggle.classList.contains('active');
    updateEpilepsyToggleLabel();
    
    await setEpilepsyMode(epilepsyMode);
    applyAccessibilityMode(epilepsyMode);
    
    // If enabled, force light theme
    if (epilepsyMode) {
      await setTheme('light');
      currentTheme = 'light';
      
      // Update theme switcher buttons
      const themeSwitcher = document.getElementById('theme-switcher');
      if (themeSwitcher) {
        themeSwitcher.querySelectorAll('.lang-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.theme === 'light');
        });
      }
    }
    
    saveSettings();
  });
}

// Set epilepsy mode
function setEpilepsyMode(enabled) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ epilepsyMode: enabled }, resolve);
  });
}

// Apply accessibility mode
function applyAccessibilityMode(enabled) {
  if (enabled) {
    document.documentElement.setAttribute('data-accessibility', 'true');
    document.body.setAttribute('data-accessibility', 'true');
    
    // Force light theme
    if (currentTheme !== 'light') {
      setTheme('light');
      currentTheme = 'light';
    }
    
    // Disable dark theme switcher
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
      const darkBtn = themeSwitcher.querySelector('[data-theme="dark"]');
      if (darkBtn) {
        darkBtn.style.opacity = '0.5';
        darkBtn.style.pointerEvents = 'none';
        darkBtn.style.cursor = 'not-allowed';
      }
    }
  } else {
    document.documentElement.removeAttribute('data-accessibility');
    document.body.removeAttribute('data-accessibility');
    
    // Enable dark theme switcher
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
      const darkBtn = themeSwitcher.querySelector('[data-theme="dark"]');
      if (darkBtn) {
        darkBtn.style.opacity = '1';
        darkBtn.style.pointerEvents = 'auto';
        darkBtn.style.cursor = 'pointer';
      }
    }
  }
}

// Initialize reset settings
function initResetSettings() {
  const resetBtn = document.getElementById('resetSettingsBtn');
  
  if (!resetBtn) return;
  
  resetBtn.addEventListener('click', async () => {
    const confirmText = await t('about.resetConfirm', currentLanguage);
    if (confirm(confirmText)) {
      // Reset all settings
      chrome.storage.sync.clear(() => {
        // Reload page to apply defaults
        location.reload();
      });
    }
  });
}

// Initialize everything when DOM is ready
function init() {
  // Load saved settings
  chrome.storage.sync.get(
    ["blockedEvents", "highlightEnabled", "borderColor", "borderOpacity", "blacklistDomains", "whitelistDomains", "theme", "epilepsyMode"],
    async (result) => {
      const blockedEvents = result.blockedEvents || DEFAULT_BLOCKED_EVENTS;
      const highlightEnabled =
        result.highlightEnabled !== undefined ? result.highlightEnabled : DEFAULT_HIGHLIGHT_ENABLED;
      const borderColor = result.borderColor || DEFAULT_BORDER_COLOR;
      const borderOpacity = result.borderOpacity !== undefined ? result.borderOpacity : DEFAULT_BORDER_OPACITY;
      const blacklistDomains = result.blacklistDomains || result.whitelistDomains || DEFAULT_BLACKLIST_DOMAINS;
      epilepsyMode = result.epilepsyMode || false;
      
      // If epilepsy mode is enabled, force light theme
      currentTheme = epilepsyMode ? 'light' : (result.theme || 'light');

      // Initialize components
      await initLanguageSwitcher();
      initSidebar();
      initThemeSwitcher();
      initDomainManagement();
      initAccessibilityMode();
      initResetSettings();

      // Set extension version
      const versionEl = document.getElementById('extensionVersion');
      if (versionEl) {
        versionEl.textContent = EXTENSION_VERSION;
      }

      // Apply theme and accessibility mode
      applyTheme(currentTheme);
      applyAccessibilityMode(epilepsyMode);

    // Update toggles based on saved settings
    document.querySelectorAll(".toggle[data-event]").forEach((toggle) => {
      const event = toggle.dataset.event;
      if (!blockedEvents.includes(event)) {
        toggle.classList.remove("active");
      }
      updateToggleLabel(toggle);
    });

      // Update border color picker
      const borderColorPicker = document.getElementById("borderColor");
      const borderColorValue = document.getElementById("borderColorValue");
      if (borderColorPicker && borderColorValue) {
        borderColorPicker.value = borderColor;
        borderColorValue.textContent = borderColor;
      }

      // Update border opacity slider
      const borderOpacitySlider = document.getElementById("borderOpacity");
      const borderOpacityValue = document.getElementById("borderOpacityValue");
      if (borderOpacitySlider && borderOpacityValue) {
        borderOpacitySlider.value = borderOpacity;
        borderOpacityValue.textContent = borderOpacity + "%";
      }

    // Update highlight enabled toggle
    const highlightToggle = document.getElementById("highlightEnabled");
    if (highlightToggle) {
      if (!highlightEnabled) {
        highlightToggle.classList.remove("active");
      }
      updateToggleLabel(highlightToggle);

      // Show/hide color and opacity settings based on enabled state
      updateHighlightSettingsVisibility(highlightEnabled);
    }

      // Handle toggle clicks for blocked events only
      document.querySelectorAll(".toggle[data-event]").forEach((toggle) => {
        toggle.addEventListener("click", function () {
          this.classList.toggle("active");
          updateToggleLabel(this);
          saveSettings();
        });
      });

      // Handle highlight enabled toggle separately
      if (highlightToggle) {
        highlightToggle.addEventListener("click", function () {
          this.classList.toggle("active");
          const isEnabled = this.classList.contains("active");
          updateToggleLabel(this);
          updateHighlightSettingsVisibility(isEnabled);
          saveSettings();
        });
      }

      // Handle border color picker change
      if (borderColorPicker && borderColorValue) {
        borderColorPicker.addEventListener("input", function () {
          borderColorValue.textContent = this.value;
          saveSettings();
        });
      }

      // Handle border opacity slider change
      if (borderOpacitySlider && borderOpacityValue) {
        borderOpacitySlider.addEventListener("input", function () {
          borderOpacityValue.textContent = this.value + "%";
          saveSettings();
        });
      }
    }
  );
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function updateHighlightSettingsVisibility(enabled) {
  const borderColorSettings = document.getElementById("borderColorSettings");
  const borderOpacitySettings = document.getElementById("borderOpacitySettings");

  if (!borderColorSettings || !borderOpacitySettings) return;

  if (enabled) {
    borderColorSettings.style.display = "flex";
    borderOpacitySettings.style.display = "flex";
  } else {
    borderColorSettings.style.display = "none";
    borderOpacitySettings.style.display = "none";
  }
}

async function saveSettings() {
  const blockedEvents = [];

  // Collect all active toggles (only those with data-event attribute)
  document.querySelectorAll(".toggle[data-event].active").forEach((toggle) => {
    blockedEvents.push(toggle.dataset.event);
  });

  // Get highlight settings
  const highlightToggle = document.getElementById("highlightEnabled");
  const borderColorPicker = document.getElementById("borderColor");
  const borderOpacitySlider = document.getElementById("borderOpacity");
  
  const highlightEnabled = highlightToggle ? highlightToggle.classList.contains("active") : DEFAULT_HIGHLIGHT_ENABLED;
  const borderColor = borderColorPicker ? borderColorPicker.value : DEFAULT_BORDER_COLOR;
  const borderOpacity = borderOpacitySlider ? parseInt(borderOpacitySlider.value) : DEFAULT_BORDER_OPACITY;

  // Get blacklist domains
  chrome.storage.sync.get(['blacklistDomains', 'whitelistDomains'], (result) => {
    const blacklistDomains = result.blacklistDomains || result.whitelistDomains || [];

    // Save to chrome storage
    chrome.storage.sync.set(
      {
        blockedEvents,
        highlightEnabled,
        borderColor,
        borderOpacity,
        blacklistDomains,
      },
      async () => {
        // Show save confirmation
        const saveStatus = document.getElementById("saveStatus");
        if (saveStatus) {
          saveStatus.textContent = await t("options.saved", currentLanguage);
          saveStatus.classList.add("show");

          setTimeout(() => {
            saveStatus.classList.remove("show");
          }, 2000);
        }
      }
    );
  });
}

// Listen for language changes
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === "sync") {
    if (changes.language) {
      currentLanguage = changes.language.newValue;
      await translatePage();
      
      // Update active button
      document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
      });
    }
    
    if (changes.theme) {
      // Don't allow theme change if epilepsy mode is enabled
      if (!epilepsyMode) {
        currentTheme = changes.theme.newValue;
        applyTheme(currentTheme);
        
        // Update theme switcher buttons
        document.querySelectorAll('#theme-switcher .lang-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        });
      }
    }
    
    if (changes.epilepsyMode) {
      epilepsyMode = changes.epilepsyMode.newValue;
      applyAccessibilityMode(epilepsyMode);
      
      // Update toggle
      const epilepsyToggle = document.getElementById('epilepsyMode');
      if (epilepsyToggle) {
        if (epilepsyMode) {
          epilepsyToggle.classList.add('active');
        } else {
          epilepsyToggle.classList.remove('active');
        }
        const label = document.querySelector('[data-toggle-label="epilepsyMode"]');
        if (label) {
          label.textContent = epilepsyMode ? 'ON' : 'OFF';
        }
      }
      
      // If enabled, force light theme
      if (epilepsyMode && currentTheme !== 'light') {
        setTheme('light');
        currentTheme = 'light';
      }
    }
    
    if (changes.blacklistDomains || changes.whitelistDomains) {
      loadDomains();
    }
  }
});
