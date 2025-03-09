// Global variables
let enabled = true;
let focusedSpeed = 1.5;
let unfocusedSpeed = 0.75;
let domains = [];
let currentDomain = window.location.hostname;
let isPageMatched = false;
let videos = [];

// Initialize when content script loads
initialize();

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === "windowFocusChanged") {
    updateVideoSpeeds(message.isFocused);
  } else if (message.action === "settingsUpdated") {
    loadSettings();
  } else if (message.action === "quickToggleChanged") {
    // Update the enabled state directly
    enabled = message.enabled;

    // If the extension was just disabled, reset videos to normal speed
    if (!enabled && isPageMatched) {
      resetVideosToNormalSpeed();
    }
    // If the extension was just enabled, apply appropriate speeds
    else if (enabled && isPageMatched) {
      updateVideoSpeeds(!document.hidden);
    }

    // Show a visual indicator of the change
    showToggleIndicator(message.enabled);
  }
});

// Show a visual indicator when the extension is toggled
function showToggleIndicator(isEnabled) {
  // Create a temporary floating element to show the status
  const indicator = document.createElement("div");
  indicator.style.position = "fixed";
  indicator.style.top = "10%";
  indicator.style.left = "50%";
  indicator.style.transform = "translateX(-50%)";
  indicator.style.padding = "10px 20px";
  indicator.style.borderRadius = "5px";
  indicator.style.backgroundColor = isEnabled ? "rgba(66, 133, 244, 0.9)" : "rgba(234, 67, 53, 0.9)";
  indicator.style.color = "white";
  indicator.style.fontWeight = "bold";
  indicator.style.zIndex = "9999999";
  indicator.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  indicator.textContent = isEnabled ? "✓ Video Speed Controller Enabled" : "✗ Video Speed Controller Disabled";

  // Add to document
  document.body.appendChild(indicator);

  // Remove after 2 seconds
  setTimeout(() => {
    indicator.style.opacity = "0";
    indicator.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      document.body.removeChild(indicator);
    }, 500);
  }, 2000);
}

// Reset all videos to normal speed (1x)
function resetVideosToNormalSpeed() {
  videos.forEach(function (video) {
    if (video && !video.paused) {
      video.playbackRate = 1.0;
    }
  });
}

// Initialize the content script
function initialize() {
  loadSettings();

  // Find any initial videos on the page
  findAndTrackVideos();

  // Set up mutation observer to detect new videos added to the page
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        findAndTrackVideos();
      }
    });
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });

  // Check document visibility state initially
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Initially set video speeds based on current window focus
  updateVideoSpeeds(!document.hidden);
}

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(["domains", "focusedSpeed", "unfocusedSpeed", "enabled"], function (result) {
    domains = result.domains || [];
    focusedSpeed = result.focusedSpeed !== undefined ? result.focusedSpeed : 1.5;
    unfocusedSpeed = result.unfocusedSpeed !== undefined ? result.unfocusedSpeed : 0.75;
    enabled = result.enabled !== undefined ? result.enabled : true;

    // Check if current domain is in the list
    isPageMatched = isDomainMatched(currentDomain);

    // Update video speeds based on current state
    if (enabled && isPageMatched) {
      updateVideoSpeeds(!document.hidden);
    } else if (!enabled && isPageMatched) {
      // Reset to normal speed when disabled
      resetVideosToNormalSpeed();
    }
  });
}

// Find videos on the page and track them
function findAndTrackVideos() {
  const pageVideos = document.querySelectorAll("video");

  pageVideos.forEach(function (video) {
    // Only add listeners to videos we haven't tracked yet
    if (!videos.includes(video)) {
      videos.push(video);

      // Listen for new video elements that might be loaded later
      video.addEventListener("loadedmetadata", function () {
        if (isPageMatched && enabled) {
          updateVideoSpeed(video, !document.hidden);
        }
      });
    }
  });
}

// Handle visibility change events (tab focus/blur)
function handleVisibilityChange() {
  updateVideoSpeeds(!document.hidden);
}

// Update speeds of all videos
function updateVideoSpeeds(isFocused) {
  // Only change video speeds if extension is enabled and domain is matched
  if (!enabled || !isPageMatched) return;

  videos.forEach(function (video) {
    updateVideoSpeed(video, isFocused);
  });
}

// Update the speed of a single video
function updateVideoSpeed(video, isFocused) {
  if (video && !video.paused) {
    if (isFocused) {
      video.playbackRate = focusedSpeed;
    } else {
      video.playbackRate = unfocusedSpeed;
    }
  }
}

// Check if the current domain matches any in our list
function isDomainMatched(domain) {
  return domains.some(function (managedDomain) {
    return domain.includes(managedDomain);
  });
}
