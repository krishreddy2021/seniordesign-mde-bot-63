
import React from "react";
import ChatInterface from "@/components/ChatInterface";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index: React.FC = () => {
  return (
    <div className="extension-container w-full h-screen">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        <ResizablePanel defaultSize={70} minSize={40}>
          <ResizablePanelGroup direction="vertical" className="w-full h-full">
            <ResizablePanel defaultSize={80} minSize={30}>
              <ChatInterface />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20} minSize={10}>
              <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <p className="text-sm text-muted-foreground">Drag to resize height</p>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">Drag to resize width</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
