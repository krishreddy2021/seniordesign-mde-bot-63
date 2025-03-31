
import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

type MessageRole = "user" | "assistant";

interface ChatMessageProps {
  content: string;
  role: MessageRole;
  timestamp?: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp = new Date(),
}) => {
  const isUser = role === "user";
  
  return (
    <div
      className={cn(
        "flex w-full mb-4 message-animation",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] md:max-w-[70%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 mt-1",
            isUser ? "ml-2 bg-primary text-white" : "mr-2 bg-secondary text-primary"
          )}
        >
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>
        
        <div>
          <div
            className={cn(
              "px-4 py-3 rounded-2xl",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
          <div
            className={cn(
              "text-xs text-muted-foreground mt-1",
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
