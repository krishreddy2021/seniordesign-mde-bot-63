
import React from "react";
import ChatInput from "./ChatInput";
import VoiceControls from "./VoiceControls";

interface ChatInputAreaProps {
  onVoiceInput: (transcript: string) => void;
  onSpeak: (text: string) => void;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  imageAttached: boolean;
  onImagePaste: (dataUrl: string) => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onVoiceInput,
  onSpeak,
  isLoading,
  onSendMessage,
  imageAttached,
  onImagePaste
}) => (
  <div className="flex items-center gap-2 px-2 pb-2">
    <VoiceControls
      onVoiceInput={onVoiceInput}
      onSpeak={onSpeak}
      disabled={isLoading}
    />
    <div className="flex-1">
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        imageAttached={imageAttached}
        onImagePaste={onImagePaste}
      />
    </div>
  </div>
);

export default ChatInputArea;
