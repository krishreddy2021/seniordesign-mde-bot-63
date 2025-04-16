
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

  // Listen for messages from the content script
  useEffect(() => {
    const handleContentScriptMessage = (event: MessageEvent) => {
      // Forward captured image events to any listeners
      if (event.data && event.data.action === 'captured_image' && event.data.imageData) {
        console.log('Received captured image from content script');
        
        // Dispatch custom event that ScreenCapture can listen for
        const customEvent = new CustomEvent('captured-image-event', {
          detail: {
            imageData: event.data.imageData
          }
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
