
import React from "react";
import ChatMessage from "./ChatMessage";
import { Button } from "./ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  uploadedImage: string | null;
  handleCancelUpload: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  uploadedImage,
  handleCancelUpload,
  messagesEndRef,
}) => (
  <div className="space-y-4"> {/* increased space between messages */}
    {messages.map((message, idx) => (
      <ChatMessage
        key={idx}
        role={message.role}
        content={message.content}
        timestamp={message.timestamp}
        imageUrl={message.imageUrl}
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
    {uploadedImage && (
      <div className="flex flex-col space-y-2 items-end">
        <div className="rounded-md overflow-hidden border border-border max-w-[300px]">
          <img 
            src={uploadedImage} 
            alt="Uploaded" 
            className="max-w-full h-auto object-contain"
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancelUpload}
            className="text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessageList;
