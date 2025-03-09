// Variables to track focus state
let lastActiveTabId = null;
let isWindowFocused = true;

// Listen for window focus/blur events
if (typeof browser !== "undefined") {
  // Firefox
  browser.windows.onFocusChanged.addListener(handleWindowFocusChange);
} else {
  // Chrome/Safari
  chrome.windows.onFocusChanged.addListener(handleWindowFocusChange);
}

// Listen for tab activation changes
chrome.tabs.onActivated.addListener(function (activeInfo) {
  lastActiveTabId = activeInfo.tabId;
});

// Listen for storage changes
chrome.storage.onChanged.addListener(function (changes) {
  // Notify active tabs when settings change
  if (changes.domains || changes.focusedSpeed || changes.unfocusedSpeed || changes.enabled) {
    notifySettingsUpdated();

    // Update icon if enabled state changes
    if (changes.enabled) {
      updateExtensionIcon(changes.enabled.newValue);

      // Show a notification about the status change
      showQuickToggleNotification(changes.enabled.newValue);
    }
  }
});

// Add click handler for the extension icon to toggle enabled state
chrome.action.onClicked.addListener(function () {
  chrome.storage.sync.get(["enabled"], function (result) {
    const newEnabledState = !result.enabled;
    chrome.storage.sync.set({ enabled: newEnabledState }, function () {
      updateExtensionIcon(newEnabledState);
      showQuickToggleNotification(newEnabledState);
    });
  });
});

// Function to show a notification when quick toggling
function showQuickToggleNotification(isEnabled) {
  // Create and show a notification (if supported)
  if (chrome.notifications) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: isEnabled ? "icon128.png" : "icon128.png",
      title: "Video Speed Controller",
      message: isEnabled ? "Extension enabled" : "Extension disabled",
    });
  }

  // Also notify the current tab that the state has changed
  if (lastActiveTabId) {
    try {
      chrome.tabs.sendMessage(lastActiveTabId, {
        action: "quickToggleChanged",
        enabled: isEnabled,
      });
    } catch (e) {
      // Tab might not be available or content script not loaded
      console.error("Error sending toggle notification:", e);
    }
  }
}

// Function to update the extension icon based on enabled state
function updateExtensionIcon(enabled) {
  if (enabled) {
    chrome.action.setIcon({
      path: {
        16: "icon16.png",
        48: "icon48.png",
        128: "icon128.png",
      },
    });
    chrome.action.setTitle({ title: "Smart Video Speed Controller (Enabled) - Click to Disable" });
  } else {
    chrome.action.setIcon({
      path: {
        16: "icon16_disabled.png",
        48: "icon48_disabled.png",
        128: "icon128_disabled.png",
      },
    });
    chrome.action.setTitle({ title: "Smart Video Speed Controller (Disabled) - Click to Enable" });
  }
}

// Handle window focus changes
function handleWindowFocusChange(windowId) {
  // Window ID of -1 means all windows lost focus
  isWindowFocused = windowId !== -1;
  // Notify the current active tab about the focus change
  if (lastActiveTabId) {
    notifyFocusChange(lastActiveTabId, isWindowFocused);
  }
}

// Notify a tab about a focus change
function notifyFocusChange(tabId, isFocused) {
  try {
    chrome.tabs.sendMessage(tabId, {
      action: "windowFocusChanged",
      isFocused: isFocused,
    });
  } catch (e) {
    // Tab might not be available or content script not loaded
    console.error("Error sending focus change message:", e);
  }
}

// Notify all tabs about settings changes
function notifySettingsUpdated() {
  chrome.tabs.query({}, function (tabs) {
    for (let tab of tabs) {
      try {
        chrome.tabs.sendMessage(tab.id, {
          action: "settingsUpdated",
        });
      } catch (e) {
        // Some tabs might not have the content script running
      }
    }
  });
}

// Initialize default settings if not set
function initDefaultSettings() {
  chrome.storage.sync.get(["domains", "focusedSpeed", "unfocusedSpeed", "enabled"], function (result) {
    const defaultSettings = {};
    if (result.domains === undefined) {
      defaultSettings.domains = [];
    }
    if (result.focusedSpeed === undefined) {
      defaultSettings.focusedSpeed = 1.5;
    }
    if (result.unfocusedSpeed === undefined) {
      defaultSettings.unfocusedSpeed = 0.75;
    }
    if (result.enabled === undefined) {
      defaultSettings.enabled = true;
    }
    if (Object.keys(defaultSettings).length > 0) {
      chrome.storage.sync.set(defaultSettings);
    }

    // Set initial icon state
    updateExtensionIcon(result.enabled !== undefined ? result.enabled : true);
  });
}

// Initialize settings on extension startup
initDefaultSettings();

// For Safari and Firefox compatibility
function setupBrowserSpecificListeners() {
  // Check if we're in Firefox (has browser namespace)
  if (typeof browser !== "undefined") {
    // Firefox specific initialization if needed
  }
  // Safari doesn't have specific browser detection here,
  // but we can handle Safari-specific issues as they arise
}

// Run browser-specific setup
setupBrowserSpecificListeners();
