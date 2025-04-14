
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
  
  // Style the iframe
  extensionFrame.style.position = 'fixed';
  extensionFrame.style.top = '20px';
  extensionFrame.style.right = '20px';
  extensionFrame.style.width = '400px';
  extensionFrame.style.height = '600px';
  extensionFrame.style.border = '1px solid #ccc';
  extensionFrame.style.borderRadius = '8px';
  extensionFrame.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  extensionFrame.style.zIndex = '2147483647'; // Maximum z-index
  extensionFrame.style.backgroundColor = '#ffffff';
  
  // Add the iframe to the page
  document.body.appendChild(extensionFrame);
  
  // Make the iframe draggable
  makeFrameDraggable(extensionFrame);
}

// Make the iframe draggable
function makeFrameDraggable(frame) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  // Create a draggable header
  const header = document.createElement('div');
  header.id = 'mcat-tutor-header';
  header.style.position = 'absolute';
  header.style.top = '0';
  header.style.left = '0';
  header.style.right = '0';
  header.style.height = '30px';
  header.style.backgroundColor = 'transparent';
  header.style.cursor = 'move';
  header.style.zIndex = '2147483648'; // Above the iframe
  
  document.body.appendChild(header);
  
  // Position the header over the iframe
  function updateHeaderPosition() {
    const rect = frame.getBoundingClientRect();
    header.style.top = rect.top + 'px';
    header.style.left = rect.left + 'px';
    header.style.width = rect.width + 'px';
  }
  
  updateHeaderPosition();
  
  // Mouse events for dragging
  header.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // Set the element's new position
    frame.style.top = (frame.offsetTop - pos2) + 'px';
    frame.style.left = (frame.offsetLeft - pos1) + 'px';
    
    // Update header position
    updateHeaderPosition();
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Initialize on page load if needed
if (window.location.href.includes('?mcat_assistant=show')) {
  createExtensionFrame();
}
