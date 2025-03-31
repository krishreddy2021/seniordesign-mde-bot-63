
import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import Header from "./Header";
import SettingsDialog from "./SettingsDialog";
import { useToast } from "@/hooks/use-toast";

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
  const [openSettings, setOpenSettings] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if API key exists on mount
    chrome.storage.sync.get(["openaiApiKey"], (result) => {
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      } else {
        // If no API key is found, open settings dialog
        setOpenSettings(true);
        toast({
          title: "API Key Required",
          description: "Please enter your OpenAI API key to use the chatbot.",
        });
      }
    });
  }, []);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Check if API key exists
      if (!apiKey) {
        throw new Error("No API key provided");
      }
      
      // Prepare messages array for the API
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`, 
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using a modern model
          messages: apiMessages,
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      // Add AI response
      const aiMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      let errorMessage = "Sorry, I encountered an error while processing your request. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "API key is missing or invalid. Please update it in settings.";
          setOpenSettings(true);
        } else if (error.message.includes("API request failed")) {
          errorMessage = error.message;
        }
      }
      
      // Add error message
      const errorMsg: Message = {
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-[350px] max-h-[500px] bg-background shadow-lg rounded-lg overflow-hidden">
      <Header onOpenSettings={() => setOpenSettings(true)} />
      
      <div className="flex-1 overflow-y-auto p-3 chat-scrollbar">
        <div className="space-y-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 px-3 py-1 max-w-fit rounded-full bg-secondary text-secondary-foreground mb-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      
      <SettingsDialog 
        open={openSettings} 
        onOpenChange={(open) => {
          setOpenSettings(open);
          if (!open) {
            // Refresh API key when settings dialog is closed
            chrome.storage.sync.get(["openaiApiKey"], (result) => {
              if (result.openaiApiKey) {
                setApiKey(result.openaiApiKey);
              }
            });
          }
        }} 
      />
    </div>
  );
};

export default ChatInterface;
