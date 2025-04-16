// Utility functions for screenshot capture and OCR processing

/**
 * Checks if the current environment is a Chrome extension
 */
export const isChromeExtension = (): boolean => {
  return typeof window !== 'undefined' && 
    typeof window.chrome !== 'undefined' && 
    !!window.chrome.runtime;
};

/**
 * Checks if the extension has permission to capture the screen
 */
export const hasCapturePermission = async (): Promise<boolean> => {
  if (!isChromeExtension()) return false;
  
  try {
    // This is a way to check if the extension has the activeTab permission
    // We attempt to execute a script, which requires activeTab permission
    return new Promise<boolean>((resolve) => {
      if (!window.chrome?.tabs || !window.chrome.tabs.query) {
        resolve(false);
        return;
      }
      
      window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (window.chrome?.runtime?.lastError || !tabs || !tabs[0] || !tabs[0].id) {
          resolve(false);
          return;
        }
        
        // If we have tabs.captureVisibleTab, we likely have permission
        if (window.chrome?.tabs?.captureVisibleTab) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error("Error checking capture permission:", error);
    return false;
  }
};

/**
 * Request optional permissions if needed
 * Note: This may not be necessary if the permissions are declared in the manifest
 */
export const requestCapturePermission = async (): Promise<boolean> => {
  if (!isChromeExtension() || !window.chrome?.permissions) return false;
  
  try {
    return new Promise<boolean>((resolve) => {
      window.chrome?.permissions?.request(
        { permissions: ["activeTab"] },
        (granted) => {
          resolve(!!granted);
        }
      );
    });
  } catch (error) {
    console.error("Error requesting capture permission:", error);
    return false;
  }
};

/**
 * Capture the entire visible tab
 */
export const captureVisibleTab = async (): Promise<string> => {
  if (!isChromeExtension() || !window.chrome?.tabs?.captureVisibleTab) {
    throw new Error("Chrome screenshot API not available");
  }
  
  try {
    return new Promise<string>((resolve, reject) => {
      window.chrome?.tabs?.captureVisibleTab(
        null, // Current window
        { format: 'png' },
        (dataUrl) => {
          if (window.chrome?.runtime?.lastError) {
            reject(new Error(window.chrome.runtime.lastError.message));
            return;
          }
          resolve(dataUrl);
        }
      );
    });
  } catch (error) {
    console.error("Error capturing visible tab:", error);
    throw error;
  }
};

/**
 * Advanced screen capture method using desktop capture API
 */
export const captureFullScreen = async (): Promise<string> => {
  if (!isChromeExtension() || !window.chrome?.desktopCapture) {
    throw new Error("Full screen capture not supported");
  }

  return new Promise((resolve, reject) => {
    window.chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window', 'tab'], 
      (streamId) => {
        if (streamId) {
          navigator.mediaDevices.getUserMedia({
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId
              }
            }
          }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.onloadedmetadata = () => {
              video.play();
              video.pause();
              
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const imageData = canvas.toDataURL('image/png');
              
              // Stop all tracks
              stream.getTracks().forEach(track => track.stop());
              
              resolve(imageData);
            };
          }).catch(reject);
        } else {
          reject(new Error('No stream selected'));
        }
      }
    );
  });
};
