
import React from "react";
import { Bot } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">AI Chatbot</h1>
      </div>
    </header>
  );
};

export default Header;
