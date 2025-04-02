
/// <reference types="vite/client" />

// Chrome API type definitions
interface Chrome {
  runtime: {
    id: string;
    lastError?: {
      message: string;
    };
  };
  tabs?: {
    query: (
      queryInfo: { active: boolean; currentWindow: boolean },
      callback: (tabs: { id?: number }[]) => void
    ) => void;
    captureVisibleTab: (
      windowId: number | null,
      options: { format: string },
      callback: (dataUrl: string) => void
    ) => void;
  };
  permissions?: {
    request: (
      permissions: { permissions: string[] },
      callback: (granted: boolean) => void
    ) => void;
  };
  storage?: {
    sync: {
      get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback?: () => void) => void;
    }
  };
}

declare global {
  interface Window {
    chrome?: Chrome;
  }
  const chrome: Chrome | undefined;
}
