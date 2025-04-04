
// Background script for handling extension commands and side panel

// Track if the side panel is currently open
let isSidePanelOpen = false;

// Listen for keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_extension') {
    if (isSidePanelOpen) {
      // Close the side panel if it's open
      chrome.sidePanel.close();
      isSidePanelOpen = false;
    } else {
      // Open the side panel
      chrome.sidePanel.open();
      isSidePanelOpen = true;
    }
  }
});

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(() => {
  chrome.sidePanel.open();
  isSidePanelOpen = true;
});

// Set up the side panel to be available on PDF files
chrome.runtime.onInstalled.addListener(() => {
  // Set which sites the side panel is enabled on
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

// Track side panel state
chrome.sidePanel.onOpened.addListener(() => {
  isSidePanelOpen = true;
});

chrome.sidePanel.onClosed.addListener(() => {
  isSidePanelOpen = false;
});
