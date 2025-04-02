
// Background script for handling extension commands

// Track if the popup is currently open
let isPopupOpen = false;
let popupWindow = null;

// Listen for keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_extension') {
    if (isPopupOpen && popupWindow) {
      // Close the window if it's open
      chrome.windows.remove(popupWindow.id);
      popupWindow = null;
      isPopupOpen = false;
    } else {
      // Open the extension in a popup window
      openPopupWindow();
    }
  }
});

// Open our extension in a dedicated popup window
function openPopupWindow() {
  const popupURL = chrome.runtime.getURL('index.html');
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 400,
    height: 600,
    focused: true
  }, (window) => {
    popupWindow = window;
    isPopupOpen = true;
  });
}

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(() => {
  if (!isPopupOpen) {
    openPopupWindow();
  }
});

// Track closed windows
chrome.windows.onRemoved.addListener((windowId) => {
  if (popupWindow && popupWindow.id === windowId) {
    popupWindow = null;
    isPopupOpen = false;
  }
});
