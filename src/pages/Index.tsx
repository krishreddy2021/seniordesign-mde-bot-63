
import React from "react";
import ChatInterface from "@/components/ChatInterface";

const Index: React.FC = () => {
  return (
    <div className="extension-container w-full h-full flex flex-col overflow-hidden">
      <ChatInterface />
    </div>
  );
};

export default Index;
