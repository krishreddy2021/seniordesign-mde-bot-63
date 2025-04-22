
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Image } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  imageAttached?: boolean;
  onImagePaste?: (dataUrl: string) => void; // NEW: callback for pasted images
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  imageAttached = false,
  onImagePaste,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!onImagePaste) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              onImagePaste(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
        // Prevent huge base64 output in textarea
        e.preventDefault();
        return;
      }
    }
    // ... Optionally, let text paste go through
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-2 p-2 border-t bg-background"
    >
      <div className="relative flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            imageAttached
              ? "Ask about this image or describe what you see..."
              : "Type a message..."
          }
          className="w-full p-2 pr-8 min-h-[40px] max-h-[80px] text-xs resize-none rounded-lg border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          onPaste={handlePaste}
          disabled={disabled}
        />
        {imageAttached && (
          <div className="absolute right-2 top-2">
            <Image className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || disabled}
        className="h-8 w-8 rounded-full"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
