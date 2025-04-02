
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
      id?: string;
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
    commands?: {
      onCommand: {
        addListener: (callback: (command: string) => void) => void;
      };
    };
    windows?: {
      create: (createProperties: any, callback?: (window: any) => void) => void;
      remove: (windowId: number, callback?: () => void) => void;
      onRemoved: {
        addListener: (callback: (windowId: number) => void) => void;
      };
    };
    action?: {
      onClicked: {
        addListener: (callback: () => void) => void;
      };
    };
  };
}
