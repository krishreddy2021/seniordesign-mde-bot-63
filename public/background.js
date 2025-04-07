
// Background script for handling extension commands and side panel

// More robust check if we're in a Chrome extension environment
const isExtensionEnvironment = typeof window !== 'undefined' && 
  typeof chrome !== 'undefined' && 
  chrome.runtime !== undefined && 
  chrome.runtime.id !== undefined;

// Track if the side panel is currently open
let isSidePanelOpen = false;

// Only set up listeners if we're in a Chrome extension environment
if (isExtensionEnvironment) {
  // Check if specific APIs are available before using them
  if (chrome.commands && chrome.commands.onCommand) {
    // Listen for keyboard commands
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'toggle_extension') {
        if (isSidePanelOpen && chrome.sidePanel && chrome.sidePanel.close) {
          // Close the side panel if it's open
          chrome.sidePanel.close();
          isSidePanelOpen = false;
        } else if (chrome.sidePanel && chrome.sidePanel.open) {
          // Open the side panel
          chrome.sidePanel.open();
          isSidePanelOpen = true;
        }
      }
    });
  }

  // Check if action API is available
  if (chrome.action && chrome.action.onClicked) {
    // Listen for clicks on the extension icon
    chrome.action.onClicked.addListener(() => {
      if (chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open();
        isSidePanelOpen = true;
      }
    });
  }

  // Check if runtime and sidePanel APIs are available
  if (chrome.runtime && chrome.runtime.onInstalled && chrome.sidePanel) {
    // Set up the side panel to be available on PDF files
    chrome.runtime.onInstalled.addListener(() => {
      // Set which sites the side panel is enabled on
      if (chrome.sidePanel.setPanelBehavior) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
          .catch((error) => console.error('Side panel behavior error:', error));
      }
    });
  }

  // Track side panel state
  if (chrome.sidePanel) {
    if (chrome.sidePanel.onOpened) {
      chrome.sidePanel.onOpened.addListener(() => {
        isSidePanelOpen = true;
      });
    }

    if (chrome.sidePanel.onClosed) {
      chrome.sidePanel.onClosed.addListener(() => {
        isSidePanelOpen = false;
      });
    }
  }
} else {
  console.log('Running in non-extension environment. Chrome extension APIs not available.');
}
