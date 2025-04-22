
import React from "react";
import { Button } from "./ui/button";
import { Upload, Moon, Sun } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

interface ChatHeaderActionsProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onShowImageUploader: () => void;
  onToggleTheme: () => void;
  theme: string;
  GEMINI_MODELS: { key: string; label: string }[];
}

const ChatHeaderActions: React.FC<ChatHeaderActionsProps> = ({
  selectedModel,
  setSelectedModel,
  onShowImageUploader,
  onToggleTheme,
  theme,
  GEMINI_MODELS
}) => (
  <div className="flex items-center space-x-1">
    <Select
      value={selectedModel}
      onValueChange={setSelectedModel}
    >
      <SelectTrigger
        className="h-8 w-[120px] px-2 text-xs rounded-md border border-input bg-background"
        aria-label="Select Gemini Model"
      >
        <SelectValue>
          {GEMINI_MODELS.find(model => model.key === selectedModel)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent side="bottom" className="w-[150px] min-w-[120px] text-xs !z-50 bg-popover">
        {GEMINI_MODELS.map(model => (
          <SelectItem
            key={model.key}
            value={model.key}
            className="text-xs"
          >{model.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full"
      onClick={onShowImageUploader}
      title="Upload image"
    >
      <Upload className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggleTheme}
      className="h-8 w-8 rounded-full"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  </div>
);

export default ChatHeaderActions;
