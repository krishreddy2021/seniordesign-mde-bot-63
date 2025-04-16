
import React, { useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";

const Index: React.FC = () => {
  // Handle extension-specific behavior
  useEffect(() => {
    // Set up message listener for communication with content script
    const isExtensionEnvironment = typeof window !== 'undefined' && 
      window.chrome !== undefined && 
      window.chrome.runtime !== undefined;
      
    if (isExtensionEnvironment && window.chrome.runtime && window.chrome.runtime.onMessage) {
      const messageListener = (message: any, sender: any, sendResponse: any) => {
        if (message.action === 'get_state') {
          sendResponse({ status: 'active' });
          return true;
        }
      };
      
      window.chrome.runtime.onMessage.addListener(messageListener);
      
      // Clean up listener on unmount
      return () => {
        // Use try-catch to safely handle the removeListener call
        try {
          if (window.chrome.runtime.onMessage && 'removeListener' in window.chrome.runtime.onMessage) {
            // Cast to any to bypass TypeScript constraint since we checked it exists
            (window.chrome.runtime.onMessage as any).removeListener(messageListener);
          }
        } catch (error) {
          console.error("Failed to remove message listener:", error);
        }
      };
    }
  }, []);

  // Handle messages from content script
  useEffect(() => {
    const handleContentScriptMessage = (event: MessageEvent) => {
      // Check if this is a message from our content script
      if (event.data && event.data.action === 'capture_selection') {
        console.log('Received capture selection:', event.data.selection);
        
        // We would send this to the ScreenCapture component
        // For now, we'll just log it
        const customEvent = new CustomEvent('screen-capture-selection', {
          detail: event.data.selection
        });
        window.dispatchEvent(customEvent);
      }
    };

    window.addEventListener('message', handleContentScriptMessage);
    return () => {
      window.removeEventListener('message', handleContentScriptMessage);
    };
  }, []);
  
  return (
    <div className="extension-container w-full h-full flex flex-col overflow-hidden">
      <ChatInterface />
    </div>
  );
};

export default Index;
