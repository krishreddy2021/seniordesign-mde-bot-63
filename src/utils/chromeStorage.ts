
// Mock implementation of Chrome storage for development environments
const localStorageStore: Record<string, any> = {};

// More robust check if running in a Chrome extension environment
const isExtensionEnvironment = typeof window !== 'undefined' && 
  typeof window.chrome !== 'undefined' && 
  typeof window.chrome.runtime !== 'undefined' && 
  typeof window.chrome.runtime.id !== 'undefined';

// Storage interface that matches Chrome's storage API
export const chromeStorage = {
  sync: {
    get: (keys: string[], callback: (result: Record<string, any>) => void) => {
      if (isExtensionEnvironment && window.chrome?.storage && window.chrome.storage.sync) {
        try {
          // Use actual Chrome storage in extension environment
          window.chrome.storage.sync.get(keys, callback);
        } catch (error) {
          console.error('Error accessing Chrome storage:', error);
          // Fallback to local storage if Chrome API fails
          fallbackToLocalStorage(keys, callback);
        }
      } else {
        // Use localStorage in development environment
        console.log('Using localStorage for storage in development environment');
        fallbackToLocalStorage(keys, callback);
      }
    },
    set: (items: Record<string, any>, callback?: () => void) => {
      if (isExtensionEnvironment && window.chrome?.storage && window.chrome.storage.sync) {
        try {
          // Use actual Chrome storage in extension environment
          window.chrome.storage.sync.set(items, callback);
        } catch (error) {
          console.error('Error accessing Chrome storage:', error);
          // Fallback to local storage if Chrome API fails
          saveToLocalStorage(items, callback);
        }
      } else {
        // Use localStorage in development environment
        console.log('Using localStorage for storage in development environment');
        saveToLocalStorage(items, callback);
      }
    }
  }
};

// Helper function to fallback to localStorage for get operations
function fallbackToLocalStorage(keys: string[], callback: (result: Record<string, any>) => void) {
  const result: Record<string, any> = {};
  keys.forEach(key => {
    const value = localStorage.getItem(`chrome_storage_${key}`);
    if (value) {
      try {
        result[key] = JSON.parse(value);
      } catch (e) {
        result[key] = value;
      }
    }
  });
  callback(result);
}

// Helper function to save to localStorage for set operations
function saveToLocalStorage(items: Record<string, any>, callback?: () => void) {
  Object.entries(items).forEach(([key, value]) => {
    localStorage.setItem(`chrome_storage_${key}`, JSON.stringify(value));
    localStorageStore[key] = value;
  });
  if (callback) {
    callback();
  }
}
