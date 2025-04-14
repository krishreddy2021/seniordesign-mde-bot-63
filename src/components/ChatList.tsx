
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import ChatListItem from "./ChatListItem";
import { Chat } from "@/types/chat";

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
}) => {
  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="p-1 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-1 h-8 text-sm px-2"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-1 space-y-1">
        {chats.length === 0 ? (
          <div className="text-center text-muted-foreground py-2 text-xs">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              id={chat.id}
              title={chat.title || "New Conversation"}
              isActive={chat.id === activeChatId}
              timestamp={chat.createdAt}
              onClick={() => onChatSelect(chat.id)}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
