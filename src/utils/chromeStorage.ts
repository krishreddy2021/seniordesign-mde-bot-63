
// Mock implementation of Chrome storage for development environments
const localStorageStore: Record<string, any> = {};

// Check if running in a Chrome extension environment
const isExtensionEnvironment = typeof window !== 'undefined' && 
  'chrome' in window && 
  window.chrome !== undefined && 
  'storage' in window.chrome && 
  window.chrome.storage !== undefined;

// Storage interface that matches Chrome's storage API
export const chromeStorage = {
  sync: {
    get: (keys: string[], callback: (result: Record<string, any>) => void) => {
      if (isExtensionEnvironment) {
        try {
          // Use actual Chrome storage in extension environment
          window.chrome.storage.sync.get(keys, callback);
        } catch (error) {
          console.error('Error accessing Chrome storage:', error);
          // Fallback to local storage if Chrome API fails
          const result: Record<string, any> = {};
          keys.forEach(key => {
            const value = localStorage.getItem(`chrome_storage_${key}`);
            if (value) {
              result[key] = JSON.parse(value);
            }
          });
          callback(result);
        }
      } else {
        // Use localStorage in development environment
        console.log('Using localStorage for storage in development environment');
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
    },
    set: (items: Record<string, any>, callback?: () => void) => {
      if (isExtensionEnvironment) {
        try {
          // Use actual Chrome storage in extension environment
          window.chrome.storage.sync.set(items, callback);
        } catch (error) {
          console.error('Error accessing Chrome storage:', error);
          // Fallback to local storage if Chrome API fails
          Object.entries(items).forEach(([key, value]) => {
            localStorage.setItem(`chrome_storage_${key}`, JSON.stringify(value));
            localStorageStore[key] = value;
          });
          if (callback) {
            callback();
          }
        }
      } else {
        // Use localStorage in development environment
        console.log('Using localStorage for storage in development environment');
        Object.entries(items).forEach(([key, value]) => {
          localStorage.setItem(`chrome_storage_${key}`, JSON.stringify(value));
          localStorageStore[key] = value;
        });
        if (callback) {
          callback();
        }
      }
    }
  }
};

// We don't need to declare the global interface here as it's already in vite-env.d.ts
