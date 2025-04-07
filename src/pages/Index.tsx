
import React from "react";
import ChatInterface from "@/components/ChatInterface";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index: React.FC = () => {
  return (
    <div className="extension-container w-full h-screen">
      <ChatInterface />
    </div>
  );
};

export default Index;
