
import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

type MessageRole = "user" | "assistant";

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
  imageUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp = new Date(),
  imageUrl
}) => {
  const isUser = role === "user";
  
  return (
    <div
      className={cn(
        "flex w-full mb-2 message-animation",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center h-6 w-6 rounded-full flex-shrink-0 mt-1",
            isUser ? "ml-1 bg-primary text-white" : "mr-1 bg-secondary text-primary"
          )}
        >
          {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
        </div>
        
        <div className={cn("max-w-full", isUser ? "mr-1" : "ml-1")}>
          {imageUrl && (
            <div className="mb-1 rounded-lg overflow-hidden border border-border">
              <img 
                src={imageUrl} 
                alt="Captured screenshot" 
                className="max-w-full h-auto object-contain"
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}
          
          <div
            className={cn(
              "px-3 py-2 text-sm rounded-2xl",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            <p className="whitespace-pre-wrap text-xs">{content}</p>
          </div>
          <div
            className={cn(
              "text-[10px] text-muted-foreground mt-0.5",
              isUser ? "text-right" : "text-left"
            )}
          >
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
