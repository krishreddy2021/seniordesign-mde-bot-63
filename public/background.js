
// Background script for handling extension commands

// Track if the panel is currently open
let isPanelOpen = false;
let panelTab = null;

// Listen for keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_extension') {
    if (isPanelOpen && panelTab) {
      // Close the panel if it's open
      chrome.tabs.remove(panelTab.id);
      panelTab = null;
      isPanelOpen = false;
    } else {
      // Open the extension in a panel
      openPanel();
    }
  }
});

// Open our extension in a pinnable side panel
function openPanel() {
  const extensionURL = chrome.runtime.getURL('index.html');
  
  // First check if the panel is already open
  chrome.tabs.query({}, (tabs) => {
    const existingPanel = tabs.find(tab => tab.url && tab.url.includes(extensionURL));
    
    if (existingPanel) {
      // Focus the existing panel
      chrome.tabs.update(existingPanel.id, { active: true });
      panelTab = existingPanel;
      isPanelOpen = true;
    } else {
      // Create a new panel
      chrome.tabs.create({
        url: extensionURL,
        pinned: true,
        active: true
      }, (tab) => {
        panelTab = tab;
        isPanelOpen = true;
      });
    }
  });
}

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(() => {
  if (!isPanelOpen) {
    openPanel();
  } else if (panelTab) {
    // Focus the existing panel
    chrome.tabs.update(panelTab.id, { active: true });
  }
});

// Track closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  if (panelTab && panelTab.id === tabId) {
    panelTab = null;
    isPanelOpen = false;
  }
});
