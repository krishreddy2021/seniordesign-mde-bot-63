
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
