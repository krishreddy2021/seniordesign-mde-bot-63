
import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
        "flex w-full mb-4 message-animation", // increased margin bottom
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
            <div className="mb-2 rounded-lg overflow-hidden border border-border"> {/* increased margin bottom */}
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
              "px-4 py-3 text-sm rounded-2xl", // increased padding
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-base font-bold my-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2" {...props} />,
                  li: ({ node, ...props }) => <li className="my-1" {...props} />,
                  a: ({ node, ...props }) => <a className="text-blue-500 underline" {...props} />,
                  code: ({ node, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match && (className || "").includes("inline");
                    
                    return isInline ? (
                      <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-xs" {...props} />
                    ) : (
                      <code className="block bg-gray-200 dark:bg-gray-800 p-2 rounded-md my-2 text-xs overflow-x-auto" {...props} />
                    );
                  },
                  pre: ({ node, ...props }) => <pre className="overflow-x-auto my-2" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-2 border-muted pl-2 italic my-2" {...props} />
                  ),
                  em: ({ node, ...props }) => <em className="italic" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-2 border-muted" {...props} />,
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto">
                      <table className="border-collapse border border-border my-2" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-border p-1 text-xs bg-muted" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-border p-1 text-xs" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
          <div
            className={cn(
              "text-[10px] text-muted-foreground mt-1", // increased margin top
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

