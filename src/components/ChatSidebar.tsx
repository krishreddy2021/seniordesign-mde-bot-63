
import React from "react";
import ChatList from "./ChatList";

interface ChatSidebarProps {
  chats: any[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat
}) => (
  <div className="w-[100px] min-w-[100px] h-full border-r border-border">
    <ChatList
      chats={chats}
      activeChatId={activeChatId}
      onChatSelect={onChatSelect}
      onNewChat={onNewChat}
      onDeleteChat={onDeleteChat}
    />
  </div>
);

export default ChatSidebar;

