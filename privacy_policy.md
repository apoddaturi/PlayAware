# Privacy Policy for PlayAware  

## 1. Introduction  
PlayAware ("the Extension") is a browser extension that automatically adjusts video playback speed based on window focus and configured domains. This Privacy Policy outlines the data the Extension collects, how it is used, and your choices regarding your information.  

## 2. Information Collection and Usage  
The Extension does not collect, store, or share any personally identifiable information (PII). However, it uses browser storage to store user preferences. The following data is stored locally within your browser:  

- **Enabled state** – Whether the Extension is enabled or disabled.  
- **Playback speeds** – User-defined video speed settings for focused and unfocused states.  
- **Managed domains** – A list of domains where the Extension applies speed adjustments.  

This data is stored using Chrome's `chrome.storage.sync` API, which allows synchronization across your Chrome profile. The Extension does not transmit this data to external servers.  

## 3. Permissions and Data Access  
The Extension requests the following permissions:  

- **Storage** – To save user settings and preferences.  
- **Tabs and ActiveTab** – To determine the current tab’s domain and manage video playback speed accordingly.  
- **Notifications** – To display status notifications when toggling the Extension.  
- **Host Permissions (`<all_urls>`)** – To allow video speed adjustments on any website as per user settings.  

The Extension only accesses video elements on websites to modify their playback speed and does not read or collect page content.  

## 4. Third-Party Services  
The Extension does not use third-party analytics, tracking, or advertising services.  

## 5. User Control and Data Deletion  
Since all data is stored locally in your browser, you have full control over it. You can remove the Extension and all stored settings by:  

1. Navigating to `chrome://extensions/`  
2. Finding PlayAware and clicking "Remove"  
3. Clearing stored preferences via browser settings  

## 6. Security  
The Extension does not transmit or expose your data to external entities. All operations occur within the browser and respect Chrome’s security policies.  

## 7. Changes to this Policy  
This Privacy Policy may be updated to reflect changes in functionality or legal requirements. Updates will be available within the Extension's listing on the Chrome Web Store.  
