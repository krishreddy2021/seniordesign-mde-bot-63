
import React from "react";
import { Bot } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-2 border-b bg-primary/5">
      <div className="flex items-center space-x-2">
        <Bot className="h-5 w-5 text-primary" />
        <h1 className="text-sm font-semibold">AI Chatbot Assistant</h1>
      </div>
    </header>
  );
};

export default Header;
