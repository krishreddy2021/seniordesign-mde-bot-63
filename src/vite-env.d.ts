
/// <reference types="vite/client" />

// Chrome API extensions
interface Window {
  chrome?: {
    storage?: {
      sync: {
        get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
        set: (items: Record<string, any>, callback?: () => void) => void;
      };
    };
    tabs?: {
      query: (queryInfo: any, callback: (tabs: any[]) => void) => void;
      captureVisibleTab: (windowId: number | null, options: any, callback: (dataUrl: string) => void) => void;
      create: (createProperties: any, callback?: (tab: any) => void) => void;
    };
    runtime?: {
      lastError?: {
        message: string;
      };
      getURL: (path: string) => string;
      sendMessage: (message: any, callback?: (response: any) => void) => void;
      onMessage: {
        addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
      };
    };
    permissions?: {
      request: (permissions: any, callback: (granted: boolean) => void) => void;
      contains: (permissions: any, callback: (result: boolean) => void) => void;
    };
  };
}
