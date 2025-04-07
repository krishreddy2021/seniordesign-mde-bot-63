
// Background script for handling extension commands and side panel

// More robust check if we're in a Chrome extension environment
// Use 'typeof window !== 'undefined'' to ensure we are in a browser context first
const isExtensionEnvironment = typeof window !== 'undefined' && 
  typeof window.chrome !== 'undefined' && 
  typeof window.chrome.runtime !== 'undefined' && 
  typeof window.chrome.runtime.id !== 'undefined';

// Track if the side panel is currently open
let isSidePanelOpen = false;

// Self-executing function to contain our extension logic
(function() {
  // Only set up listeners if we're in a Chrome extension environment
  if (!isExtensionEnvironment) {
    console.log('Running in non-extension environment. Chrome extension APIs not available.');
    return;
  }
  
  // Check if specific APIs are available before using them
  if (window.chrome.commands && window.chrome.commands.onCommand) {
    // Listen for keyboard commands
    window.chrome.commands.onCommand.addListener((command) => {
      if (command === 'toggle_extension') {
        if (isSidePanelOpen && window.chrome.sidePanel && window.chrome.sidePanel.close) {
          // Close the side panel if it's open
          window.chrome.sidePanel.close().catch(err => console.error('Error closing side panel:', err));
          isSidePanelOpen = false;
        } else if (window.chrome.sidePanel && window.chrome.sidePanel.open) {
          // Open the side panel
          window.chrome.sidePanel.open().catch(err => console.error('Error opening side panel:', err));
          isSidePanelOpen = true;
        }
      }
    });
  }

  // Check if action API is available
  if (window.chrome.action && window.chrome.action.onClicked) {
    // Listen for clicks on the extension icon
    window.chrome.action.onClicked.addListener(() => {
      if (window.chrome.sidePanel && window.chrome.sidePanel.open) {
        window.chrome.sidePanel.open().catch(err => console.error('Error opening side panel:', err));
        isSidePanelOpen = true;
      }
    });
  }

  // Check if runtime and sidePanel APIs are available
  if (window.chrome.runtime && window.chrome.runtime.onInstalled && window.chrome.sidePanel) {
    // Set up the side panel to be available on PDF files
    window.chrome.runtime.onInstalled.addListener(() => {
      // Set which sites the side panel is enabled on
      if (window.chrome.sidePanel.setPanelBehavior) {
        window.chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
          .catch((error) => console.error('Side panel behavior error:', error));
      }
    });
  }

  // Track side panel state
  if (window.chrome.sidePanel) {
    if (window.chrome.sidePanel.onOpened) {
      window.chrome.sidePanel.onOpened.addListener(() => {
        isSidePanelOpen = true;
      });
    }

    if (window.chrome.sidePanel.onClosed) {
      window.chrome.sidePanel.onClosed.addListener(() => {
        isSidePanelOpen = false;
      });
    }
  }
})();
