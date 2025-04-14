
// Content script for MCAT Tutor Assistant
console.log('MCAT Tutor Assistant content script loaded');

let extensionFrame = null;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle_mcat_assistant') {
    if (extensionFrame) {
      // If frame exists, toggle it
      if (extensionFrame.style.display === 'none') {
        extensionFrame.style.display = 'block';
        sendResponse({ status: 'shown' });
      } else {
        extensionFrame.style.display = 'none';
        sendResponse({ status: 'hidden' });
      }
    } else {
      // If no frame, create it
      createExtensionFrame();
      sendResponse({ status: 'created' });
    }
    return true; // Indicates async response
  }
});

function createExtensionFrame() {
  // Prevent multiple frames
  if (extensionFrame) return;
  
  // Create an iframe to host our extension
  extensionFrame = document.createElement('iframe');
  extensionFrame.src = chrome.runtime.getURL('index.html');
  extensionFrame.id = 'mcat-tutor-assistant-frame';
  
  // Style the iframe to better fit within a tab
  extensionFrame.style.position = 'fixed';
  extensionFrame.style.top = '0';
  extensionFrame.style.right = '0';
  extensionFrame.style.width = '375px';  // Narrower width
  extensionFrame.style.height = '100vh'; // Full height
  extensionFrame.style.border = 'none';  // No border for cleaner integration
  extensionFrame.style.borderLeft = '1px solid #ccc'; // Only left border
  extensionFrame.style.borderRadius = '0'; // No border radius
  extensionFrame.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
  extensionFrame.style.zIndex = '2147483647'; // Maximum z-index
  extensionFrame.style.backgroundColor = '#ffffff';
  
  // Add the iframe to the page
  document.body.appendChild(extensionFrame);
  
  // Make the iframe resizable instead of draggable
  makeFrameResizable(extensionFrame);
}

// Make the iframe resizable
function makeFrameResizable(frame) {
  // Create a resizer element
  const resizer = document.createElement('div');
  resizer.id = 'mcat-tutor-resizer';
  resizer.style.position = 'absolute';
  resizer.style.left = '0';
  resizer.style.top = '0';
  resizer.style.bottom = '0';
  resizer.style.width = '4px';
  resizer.style.cursor = 'col-resize';
  resizer.style.zIndex = '2147483648';
  
  document.body.appendChild(resizer);
  
  // Position the resizer
  function updateResizerPosition() {
    const rect = frame.getBoundingClientRect();
    resizer.style.left = (rect.left - 2) + 'px';
    resizer.style.top = rect.top + 'px';
    resizer.style.height = rect.height + 'px';
  }
  
  updateResizerPosition();
  
  // Mouse events for resizing
  resizer.addEventListener('mousedown', initResize, false);
  
  function initResize(e) {
    window.addEventListener('mousemove', resize, false);
    window.addEventListener('mouseup', stopResize, false);
  }
  
  function resize(e) {
    // Calculate new width based on mouse position
    const newWidth = window.innerWidth - e.clientX;
    
    // Constrain width between min and max values
    const minWidth = 300;
    const maxWidth = window.innerWidth * 0.5;
    const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    
    // Apply new width
    frame.style.width = constrainedWidth + 'px';
    
    // Update resizer position
    updateResizerPosition();
  }
  
  function stopResize() {
    window.removeEventListener('mousemove', resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }
  
  // Update position when window is resized
  window.addEventListener('resize', updateResizerPosition);
}

// Initialize on page load if needed
if (window.location.href.includes('?mcat_assistant=show')) {
  createExtensionFrame();
}
