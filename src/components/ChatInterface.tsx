
import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import Header from "./Header";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: getSimulatedResponse(content),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const getSimulatedResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello there! How can I assist you today?";
    } else if (lowerMessage.includes("how are you")) {
      return "I'm just a program, but I'm functioning well. Thanks for asking! How can I help you?";
    } else if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else you'd like to know?";
    } else if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
      return "Goodbye! Feel free to chat again whenever you need assistance.";
    } else if (lowerMessage.includes("name")) {
      return "I'm an AI assistant designed to help answer your questions and assist with tasks.";
    } else if (lowerMessage.includes("?")) {
      return "That's an interesting question. While I'm just a simple demo, a fully implemented AI could provide a detailed answer to this.";
    } else {
      return "I understand. In a complete implementation, I would process your message and provide a helpful response based on my training.";
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      <Header />
      
      <div className="flex-1 overflow-y-auto p-4 chat-scrollbar">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 px-4 py-2 max-w-fit rounded-full bg-secondary text-secondary-foreground mb-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;
