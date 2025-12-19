(() => {
  "use strict";

  const DEFAULT_HIGHLIGHT_ENABLED = true;
  const DEFAULT_BORDER_COLOR = "#4169E1";
  const DEFAULT_BORDER_OPACITY = 100;
  const DEFAULT_BLACKLIST_DOMAINS = [];

  let highlightEnabled = DEFAULT_HIGHLIGHT_ENABLED;
  let borderColor = DEFAULT_BORDER_COLOR;
  let borderOpacity = DEFAULT_BORDER_OPACITY;
  let isEnabled = false;

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
      
      if (trimmedPattern === currentHost) {
        return true;
      }
      
      if (currentHost.endsWith('.' + trimmedPattern) || currentHost === trimmedPattern) {
        return true;
      }
      
      return false;
    });
  }

  chrome.storage.sync.get(["highlightEnabled", "borderColor", "borderOpacity", "blacklistDomains", "whitelistDomains", "globalEnabled"], (result) => {
    highlightEnabled = result.highlightEnabled !== undefined ? result.highlightEnabled : DEFAULT_HIGHLIGHT_ENABLED;
    borderColor = result.borderColor || DEFAULT_BORDER_COLOR;
    borderOpacity = result.borderOpacity !== undefined ? result.borderOpacity : DEFAULT_BORDER_OPACITY;
    const blacklistDomains = result.blacklistDomains || result.whitelistDomains || DEFAULT_BLACKLIST_DOMAINS;
    const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
    isEnabled = globalEnabled && !checkBlacklist(blacklistDomains);
    updateStyles();
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
      chrome.storage.sync.get(["highlightEnabled", "borderColor", "borderOpacity", "blacklistDomains", "whitelistDomains", "globalEnabled"], (result) => {
        highlightEnabled = result.highlightEnabled !== undefined ? result.highlightEnabled : DEFAULT_HIGHLIGHT_ENABLED;
        borderColor = result.borderColor || DEFAULT_BORDER_COLOR;
        borderOpacity = result.borderOpacity !== undefined ? result.borderOpacity : DEFAULT_BORDER_OPACITY;
        const blacklistDomains = result.blacklistDomains || result.whitelistDomains || DEFAULT_BLACKLIST_DOMAINS;
        const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
        isEnabled = globalEnabled && !checkBlacklist(blacklistDomains);
        updateStyles();
      });
    }
  });

  const style = document.createElement("style");
  const className = `highlight_asdfqweafsdfa`;
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function updateStyles() {
    const borderOpacityValue = borderOpacity / 100;

    if (isEnabled && (highlightEnabled || borderOpacityValue > 0)) {
      style.textContent = `
        .${className} {
          outline: 2px solid ${hexToRgba(borderColor, borderOpacityValue)} !important;
        }
      `;
    } else {
      style.textContent = "";
    }
  }

  updateStyles();

  if (document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      document.head.appendChild(style);
    });
  }

  let currentElement = null;
  let copyInProgress = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  function clearAllHighlights() {
    document.querySelectorAll(`.${className}`).forEach((el) => {
      try {
        el.classList.remove(className);
      } catch (e) {}
    });
  }

  document.addEventListener("mousemove", function (event) {
    if (!isEnabled || copyInProgress) return;

    const isMetaKeyPressed = event.metaKey || event.ctrlKey;
    
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    clearAllHighlights();
    currentElement = null;

    if (!isMetaKeyPressed) {
      return;
    }

    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (element && element.nodeType === Node.ELEMENT_NODE) {
      try {
        if (highlightEnabled) {
          element.classList.add(className);
        }

        currentElement = element;
      } catch (e) {}
    }
  });

  document.addEventListener("keydown", async function (event) {
    if (!isEnabled) return;
    
    const isMetaKeyPressed = event.metaKey || event.ctrlKey;
    const shouldCopy = isMetaKeyPressed && event.altKey;

    if (!highlightEnabled && shouldCopy) {
      const x = lastMouseX || (window.innerWidth / 2);
      const y = lastMouseY || (window.innerHeight / 2);
      const element = document.elementFromPoint(x, y);
      if (element && element.nodeType === Node.ELEMENT_NODE && !copyInProgress) {
        currentElement = element;
      }
    }

    if (!currentElement || copyInProgress) {
      return;
    }

    if (shouldCopy) {
      event.preventDefault();
      copyInProgress = true;

      let textToCopy = "";
      try {
        textToCopy = currentElement.innerText || currentElement.textContent || "";
      } catch (e) {
        console.error("Failed to get text content:", e);
        copyInProgress = false;
        return;
      }

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          if (!document.body) {
            console.error("document.body is not available");
            copyInProgress = false;
            return;
          }
          
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          textArea.style.left = "-9999px";
          textArea.style.top = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand("copy");
          } catch (e) {
            console.error("execCommand failed:", e);
          }

          if (document.body.contains(textArea)) {
            document.body.removeChild(textArea);
          }
        }

        clearAllHighlights();
        copyInProgress = false;
      } catch (err) {
        console.error("Failed to copy:", err);
        copyInProgress = false;
      }

      currentElement = null;
    } else if (!isMetaKeyPressed) {
      clearAllHighlights();
      currentElement = null;
    }
  });

  document.addEventListener("keyup", function (event) {
    if ((event.key === "Meta" || event.key === "Control") && !copyInProgress) {
      clearAllHighlights();
      currentElement = null;
    }
  });

  window.addEventListener("blur", function () {
    clearAllHighlights();
    currentElement = null;
  });
})();
