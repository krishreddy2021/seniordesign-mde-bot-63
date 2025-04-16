// Content script for MCAT Tutor Assistant
console.log('MCAT Tutor Assistant content script loaded');

let extensionFrame = null;
let captureOverlay = null;
let captureSelection = null;
let captureStartPoint = null;

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
  
  // Handle screen capture requests
  if (message.action === 'start_screen_capture') {
    setupCaptureOverlay();
    sendResponse({ status: 'capture_started' });
    return true;
  }
  
  if (message.action === 'cancel_screen_capture') {
    removeCaptureOverlay();
    sendResponse({ status: 'capture_cancelled' });
    return true;
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

// Handle screen capture functionality in the content script
function setupCaptureOverlay() {
  // Remove any existing overlay
  removeCaptureOverlay();
  
  // Create capture overlay
  captureOverlay = document.createElement('div');
  captureOverlay.id = 'mcat-tutor-capture-overlay';
  captureOverlay.style.position = 'fixed';
  captureOverlay.style.inset = '0';
  captureOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  captureOverlay.style.cursor = 'crosshair';
  captureOverlay.style.zIndex = '2147483646'; // Just below the max z-index
  
  // Create selection element
  captureSelection = document.createElement('div');
  captureSelection.id = 'mcat-tutor-capture-selection';
  captureSelection.style.position = 'fixed';
  captureSelection.style.border = '2px solid #1EAEDB';
  captureSelection.style.backgroundColor = 'rgba(30, 174, 219, 0.1)';
  captureSelection.style.display = 'none';
  captureSelection.style.pointerEvents = 'none';
  captureSelection.style.zIndex = '2147483646';
  
  // Add to body
  document.body.appendChild(captureOverlay);
  document.body.appendChild(captureSelection);
  
  // Set up event handlers
  captureOverlay.addEventListener('mousedown', handleCaptureMouseDown);
  captureOverlay.addEventListener('mousemove', handleCaptureMouseMove);
  captureOverlay.addEventListener('mouseup', handleCaptureMouseUp);
  document.addEventListener('keydown', handleCaptureKeyDown);
}

function removeCaptureOverlay() {
  if (captureOverlay) {
    captureOverlay.removeEventListener('mousedown', handleCaptureMouseDown);
    captureOverlay.removeEventListener('mousemove', handleCaptureMouseMove);
    captureOverlay.removeEventListener('mouseup', handleCaptureMouseUp);
    document.removeEventListener('keydown', handleCaptureKeyDown);
    
    document.body.removeChild(captureOverlay);
    if (captureSelection && captureSelection.parentNode) {
      document.body.removeChild(captureSelection);
    }
    
    captureOverlay = null;
    captureSelection = null;
    captureStartPoint = null;
  }
}

function handleCaptureMouseDown(e) {
  captureStartPoint = { x: e.clientX, y: e.clientY };
}

function handleCaptureMouseMove(e) {
  if (!captureStartPoint || !captureSelection) return;
  
  const currentX = e.clientX;
  const currentY = e.clientY;
  
  // Calculate dimensions
  const left = Math.min(captureStartPoint.x, currentX);
  const top = Math.min(captureStartPoint.y, currentY);
  const width = Math.abs(currentX - captureStartPoint.x);
  const height = Math.abs(currentY - captureStartPoint.y);
  
  // Update selection div
  captureSelection.style.display = 'block';
  captureSelection.style.left = left + 'px';
  captureSelection.style.top = top + 'px';
  captureSelection.style.width = width + 'px';
  captureSelection.style.height = height + 'px';
}

function handleCaptureMouseUp(e) {
  // Selection completed - send message to extension
  if (captureStartPoint) {
    const endPoint = { x: e.clientX, y: e.clientY };
    
    // Calculate dimensions
    const left = Math.min(captureStartPoint.x, endPoint.x);
    const top = Math.min(captureStartPoint.y, endPoint.y);
    const width = Math.abs(endPoint.x - captureStartPoint.x);
    const height = Math.abs(endPoint.y - captureStartPoint.y);
    
    // Only send if selection is big enough
    if (width >= 10 && height >= 10) {
      // Remove overlay before capture to ensure it's not in the screenshot
      removeCaptureOverlay();
      
      // Send selection coordinates back to extension
      if (extensionFrame && extensionFrame.contentWindow) {
        extensionFrame.contentWindow.postMessage({
          action: 'capture_selection',
          selection: { left, top, width, height }
        }, '*');
      }
    } else {
      removeCaptureOverlay();
    }
  }
}

function handleCaptureKeyDown(e) {
  // Cancel capture on Escape key
  if (e.key === 'Escape') {
    removeCaptureOverlay();
  }
}

// Initialize on page load if needed
if (window.location.href.includes('?mcat_assistant=show')) {
  createExtensionFrame();
}
