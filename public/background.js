
// Background script for handling extension commands and side panel

// Check if we're in a Chrome extension environment
const isExtensionEnvironment = typeof chrome !== 'undefined' && 
  chrome.runtime !== undefined && 
  chrome.runtime.id !== undefined;

// Track if the assistant is currently visible
let isAssistantVisible = false;

// Only set up listeners if we're in a Chrome extension environment
if (isExtensionEnvironment) {
  // Listen for keyboard commands
  if (chrome.commands && chrome.commands.onCommand) {
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'toggle_extension') {
        toggleAssistant();
      }
    });
  }
  
  // Listen for clicks on the extension icon
  if (chrome.action && chrome.action.onClicked) {
    chrome.action.onClicked.addListener((tab) => {
      toggleAssistant(tab);
    });
  }
  
  // Initialize on installation
  if (chrome.runtime && chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(() => {
      console.log('MCAT Tutor Assistant installed');
      
      // Set up side panel behavior if available
      if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
          .catch((error) => console.error('Side panel behavior error:', error));
      }
    });
  }
}

// Function to toggle the assistant visibility
function toggleAssistant(tab) {
  if (!tab && chrome.tabs) {
    // Get the active tab if not provided
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        toggleAssistantInTab(tabs[0]);
      }
    });
  } else if (tab) {
    toggleAssistantInTab(tab);
  }
}

// Toggle assistant in a specific tab
function toggleAssistantInTab(tab) {
  // Make sure we have the right permissions
  if (chrome.scripting && chrome.scripting.executeScript) {
    // Send message to content script
    chrome.tabs.sendMessage(
      tab.id, 
      { action: 'toggle_mcat_assistant' },
      (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded, inject it
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }, () => {
            // After injection, try again
            setTimeout(() => {
              chrome.tabs.sendMessage(
                tab.id,
                { action: 'toggle_mcat_assistant' },
                (response) => {
                  if (response) {
                    isAssistantVisible = response.status === 'shown' || response.status === 'created';
                  }
                }
              );
            }, 100);
          });
        } else if (response) {
          // Update state based on response
          isAssistantVisible = response.status === 'shown' || response.status === 'created';
        }
      }
    );
  } else if (chrome.sidePanel && chrome.sidePanel.open) {
    // Fallback to side panel if available
    chrome.sidePanel.open({ tabId: tab.id });
    isAssistantVisible = true;
  }
}
