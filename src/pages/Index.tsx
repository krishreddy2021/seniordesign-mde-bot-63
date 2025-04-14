
import React, { useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";

const Index: React.FC = () => {
  // Handle extension-specific behavior
  useEffect(() => {
    // Set up message listener for communication with content script
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      const messageListener = (message: any, sender: any, sendResponse: any) => {
        if (message.action === 'get_state') {
          sendResponse({ status: 'active' });
          return true;
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
      
      // Clean up listener on unmount
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, []);
  
  return (
    <div className="extension-container w-full h-full flex flex-col overflow-hidden">
      <ChatInterface />
    </div>
  );
};

export default Index;
