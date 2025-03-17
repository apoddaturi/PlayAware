document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const addDomainButton = document.getElementById("addDomain");
  const addManualDomainButton = document.getElementById("addManualDomain");
  const manualDomainInput = document.getElementById("manualDomain");
  const domainList = document.getElementById("domainList");
  const focusedSpeedInput = document.getElementById("focusedSpeed");
  const unfocusedSpeedInput = document.getElementById("unfocusedSpeed");
  const focusedSpeedValue = document.getElementById("focusedSpeedValue");
  const unfocusedSpeedValue = document.getElementById("unfocusedSpeedValue");
  const incrementFocused = document.getElementById("incrementFocused");
  const decrementFocused = document.getElementById("decrementFocused");
  const incrementUnfocused = document.getElementById("incrementUnfocused");
  const decrementUnfocused = document.getElementById("decrementUnfocused");
  const enableExtensionCheckbox = document.getElementById("enableExtension");
  const quickToggleButton = document.getElementById("quickToggle");
  const normalSpeedButton = document.getElementById("normalSpeed");

  // Load saved settings
  loadSettings();

  // Add current domain button event listener
  addDomainButton.addEventListener("click", function () {
    // Query for the active tab to get its URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname.trim().toLowerCase();

        if (domain) {
          addDomainToList(domain);
        }
      }
    });
  });

  // Add manual domain button event listener
  addManualDomainButton.addEventListener("click", function () {
    addManualDomain();
  });

  // Allow adding domain by pressing Enter in the input field
  manualDomainInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addManualDomain();
    }
  });

  // Quick toggle button event listener
  if (quickToggleButton) {
    quickToggleButton.addEventListener("click", function () {
      const newState = !enableExtensionCheckbox.checked;
      enableExtensionCheckbox.checked = newState;
      saveSettings();

      // Update button text based on new state
      quickToggleButton.textContent = newState ? "Disable Extension" : "Enable Extension";
      quickToggleButton.classList.toggle("enabled", newState);
      quickToggleButton.classList.toggle("disabled", !newState);
    });
  }

  // Normal speed button event listener
  if (normalSpeedButton) {
    normalSpeedButton.addEventListener("click", function () {
      // Get current settings
      chrome.storage.sync.get(["enabled", "focusedSpeed", "normalSpeedState"], function (result) {
        const wasEnabled = result.enabled;
        // If we have saved normal speed state, restore it
        if (wasEnabled && !result.normalSpeedState) {
          // Save current state and disable
          chrome.storage.sync.set(
            {
              normalSpeedState: {
                enabled: true,
                focusedSpeed: focusedSpeedInput.value,
              },
              enabled: false,
            },
            function () {
              enableExtensionCheckbox.checked = false;
              quickToggleButton.textContent = "Enable Extension";
              quickToggleButton.classList.remove("enabled");
              quickToggleButton.classList.add("disabled");
              normalSpeedButton.textContent = "Restore Speed";
            },
          );
        } else {
          // Restore previous state or enable with default speed
          const stateToRestore = result.normalSpeedState || { enabled: true, focusedSpeed: 1.5 };
          chrome.storage.sync.set(
            {
              enabled: stateToRestore.enabled,
              focusedSpeed: stateToRestore.focusedSpeed,
              normalSpeedState: null,
            },
            function () {
              // Update UI
              focusedSpeedInput.value = stateToRestore.focusedSpeed;
              focusedSpeedValue.textContent = stateToRestore.focusedSpeed + "x";
              enableExtensionCheckbox.checked = stateToRestore.enabled;
              quickToggleButton.textContent = stateToRestore.enabled ? "Disable Extension" : "Enable Extension";
              quickToggleButton.classList.toggle("enabled", stateToRestore.enabled);
              quickToggleButton.classList.toggle("disabled", !stateToRestore.enabled);
              normalSpeedButton.textContent = "Normal Speed (1x)";
            },
          );
        }
      });
    });
  }

  // Function to add manual domain
  function addManualDomain() {
    let domain = manualDomainInput.value.trim().toLowerCase();

    // Basic validation
    if (!domain) {
      alert("Please enter a domain name.");
      return;
    }

    // Add www. prefix handling
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }

    // Add http/https handling
    try {
      // If the user entered a full URL, extract just the hostname
      if (domain.includes("://")) {
        const url = new URL(domain);
        domain = url.hostname.toLowerCase();
      }
    } catch (e) {
      // Not a URL, just continue with the text as is
    }

    addDomainToList(domain);
    manualDomainInput.value = ""; // Clear the input field
  }

  // Common function to add a domain to the list
  function addDomainToList(domain) {
    // Get current domains
    chrome.storage.sync.get(["domains"], function (result) {
      const domains = result.domains || [];

      // Check if domain already exists
      if (!domains.includes(domain)) {
        domains.push(domain);

        // Save updated domains
        chrome.storage.sync.set({ domains: domains }, function () {
          displayDomains(domains);
        });
      } else {
        alert("This domain is already in the list!");
      }
    });
  }

  // Speed slider change handlers
  focusedSpeedInput.addEventListener("input", function () {
    focusedSpeedValue.textContent = focusedSpeedInput.value + "x";
  });

  unfocusedSpeedInput.addEventListener("input", function () {
    unfocusedSpeedValue.textContent = unfocusedSpeedInput.value + "x";
  });

  // Speed slider change event
  focusedSpeedInput.addEventListener("change", saveSettings);
  unfocusedSpeedInput.addEventListener("change", saveSettings);

  // Increment/decrement buttons
  incrementFocused.addEventListener("click", function () {
    const currentValue = parseFloat(focusedSpeedInput.value);
    const newValue = Math.min(parseFloat(focusedSpeedInput.max), currentValue + 0.25);
    focusedSpeedInput.value = newValue;
    focusedSpeedValue.textContent = newValue + "x";
    saveSettings();
  });

  decrementFocused.addEventListener("click", function () {
    const currentValue = parseFloat(focusedSpeedInput.value);
    const newValue = Math.max(parseFloat(focusedSpeedInput.min), currentValue - 0.25);
    focusedSpeedInput.value = newValue;
    focusedSpeedValue.textContent = newValue + "x";
    saveSettings();
  });

  incrementUnfocused.addEventListener("click", function () {
    const currentValue = parseFloat(unfocusedSpeedInput.value);
    const newValue = Math.min(parseFloat(unfocusedSpeedInput.max), currentValue + 0.25);
    unfocusedSpeedInput.value = newValue;
    unfocusedSpeedValue.textContent = newValue + "x";
    saveSettings();
  });

  decrementUnfocused.addEventListener("click", function () {
    const currentValue = parseFloat(unfocusedSpeedInput.value);
    const newValue = Math.max(parseFloat(unfocusedSpeedInput.min), currentValue - 0.25);
    unfocusedSpeedInput.value = newValue;
    unfocusedSpeedValue.textContent = newValue + "x";
    saveSettings();
  });

  enableExtensionCheckbox.addEventListener("change", function () {
    saveSettings();

    // Update quick toggle button if it exists
    if (quickToggleButton) {
      quickToggleButton.textContent = enableExtensionCheckbox.checked ? "Disable Extension" : "Enable Extension";
      quickToggleButton.classList.toggle("enabled", enableExtensionCheckbox.checked);
      quickToggleButton.classList.toggle("disabled", !enableExtensionCheckbox.checked);
    }
  });

  // Function to load settings
  function loadSettings() {
    chrome.storage.sync.get(
      ["domains", "focusedSpeed", "unfocusedSpeed", "enabled", "normalSpeedState"],
      function (result) {
        // Display domains
        const domains = result.domains || [];
        displayDomains(domains);

        // Set speed inputs
        const focusedSpeed = result.focusedSpeed !== undefined ? result.focusedSpeed : 1.5;
        const unfocusedSpeed = result.unfocusedSpeed !== undefined ? result.unfocusedSpeed : 0.75;

        focusedSpeedInput.value = focusedSpeed;
        unfocusedSpeedInput.value = unfocusedSpeed;
        focusedSpeedValue.textContent = focusedSpeed + "x";
        unfocusedSpeedValue.textContent = unfocusedSpeed + "x";

        // Set enabled state
        const isEnabled = result.enabled !== undefined ? result.enabled : true;
        enableExtensionCheckbox.checked = isEnabled;

        // Update quick toggle button state if it exists
        if (quickToggleButton) {
          quickToggleButton.textContent = isEnabled ? "Disable Extension" : "Enable Extension";
          quickToggleButton.classList.toggle("enabled", isEnabled);
          quickToggleButton.classList.toggle("disabled", !isEnabled);
        }

        // Update normal speed button text if it exists
        if (normalSpeedButton && result.normalSpeedState) {
          normalSpeedButton.textContent = "Restore Speed";
        }
      },
    );
  }

  // Function to save settings
  function saveSettings() {
    const settings = {
      focusedSpeed: parseFloat(focusedSpeedInput.value),
      unfocusedSpeed: parseFloat(unfocusedSpeedInput.value),
      enabled: enableExtensionCheckbox.checked,
    };

    // Update display values when saving
    focusedSpeedValue.textContent = settings.focusedSpeed + "x";
    unfocusedSpeedValue.textContent = settings.unfocusedSpeed + "x";

    chrome.storage.sync.set(settings);
  }

  // Function to display domains
  function displayDomains(domains) {
    // Clear current list
    domainList.innerHTML = "";

    if (domains.length === 0) {
      domainList.innerHTML = "<p>No domains added yet.</p>";
      return;
    }

    // Add each domain to the list
    domains.forEach(function (domain) {
      const domainItem = document.createElement("div");
      domainItem.className = "domain-item";

      const domainText = document.createElement("span");
      domainText.textContent = domain;

      const removeButton = document.createElement("button");
      removeButton.className = "remove-btn";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", function () {
        removeDomain(domain);
      });

      domainItem.appendChild(domainText);
      domainItem.appendChild(removeButton);
      domainList.appendChild(domainItem);
    });
  }

  // Function to remove a domain
  function removeDomain(domain) {
    chrome.storage.sync.get(["domains"], function (result) {
      const domains = result.domains || [];
      const updatedDomains = domains.filter((d) => d !== domain);

      chrome.storage.sync.set({ domains: updatedDomains }, function () {
        displayDomains(updatedDomains);
      });
    });
  }
});
