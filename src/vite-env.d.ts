
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
      update: (tabId: number, updateProperties: any, callback?: (tab: any) => void) => void;
      remove: (tabId: number, callback?: () => void) => void;
      sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => void;
      onRemoved: {
        addListener: (callback: (tabId: number, removeInfo: any) => void) => void;
      };
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
        removeListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
      };
      onInstalled?: {
        addListener: (callback: (details: any) => void) => void;
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
    sidePanel?: {
      open: (options?: { windowId?: number }) => Promise<void>;
      close: (options?: { windowId?: number }) => Promise<void>;
      setPanelBehavior: (behavior: { openPanelOnActionClick?: boolean }) => Promise<void>;
      onOpened: {
        addListener: (callback: () => void) => void;
      };
      onClosed: {
        addListener: (callback: () => void) => void;
      };
    };
    desktopCapture?: {
      chooseDesktopMedia: (sources: string[], tab: any, callback: (streamId: string) => void) => void;
    };
    scripting?: {
      executeScript: (options: any, callback?: () => void) => void;
    };
  };
}

// Extend MediaTrackConstraints for Chrome's desktop capture
interface MediaTrackConstraintSet {
  chromeMediaSource?: string;
  chromeMediaSourceId?: string;
}

