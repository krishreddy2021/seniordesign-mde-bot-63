
import React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ChatListItemProps {
  id: string;
  title: string;
  isActive: boolean;
  timestamp: Date;
  onClick: () => void;
  onDelete: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  title,
  isActive,
  timestamp,
  onClick,
  onDelete,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
        isActive
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-secondary"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col overflow-hidden">
        <span className="font-medium text-sm truncate">{title}</span>
        <span className="text-xs text-muted-foreground">
          {timestamp.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete chat</span>
      </Button>
    </div>
  );
};

export default ChatListItem;
