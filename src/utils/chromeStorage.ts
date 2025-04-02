
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
        // Use actual Chrome storage in extension environment
        window.chrome.storage.sync.get(keys, callback);
      } else {
        // Use localStorage in development environment
        const result: Record<string, any> = {};
        keys.forEach(key => {
          const value = localStorage.getItem(`chrome_storage_${key}`);
          if (value) {
            result[key] = JSON.parse(value);
          }
        });
        callback(result);
      }
    },
    set: (items: Record<string, any>, callback?: () => void) => {
      if (isExtensionEnvironment) {
        // Use actual Chrome storage in extension environment
        window.chrome.storage.sync.set(items, callback);
      } else {
        // Use localStorage in development environment
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
