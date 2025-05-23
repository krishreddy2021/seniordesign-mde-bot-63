
import React, { useState, useRef, useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatHeaderActions from "./ChatHeaderActions";
import ChatMessageList from "./ChatMessageList";
import ChatInputArea from "./ChatInputArea";
import Header from "./Header";
import ScreenCapture from "./ScreenCapture";
import SettingsDialog from "./SettingsDialog";
import ImageUploader from "./ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { chromeStorage } from "@/utils/chromeStorage";
import { useTheme } from "@/hooks/use-theme";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "@/types/chat";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

// MCAT tutor system prompt
const SYSTEM_PROMPT = `You are Marcus, an experienced MCAT tutor. You specialize in helping students prepare for the Medical College Admission Test with clear explanations, practice questions, and study strategies. You can explain complex concepts in biology, chemistry, physics, and psychology in an accessible way. You're patient, encouraging, and knowledgeable about the MCAT format and requirements.`;

const GEMINI_MODELS = [
  {
    key: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash"
  },
  {
    key: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash"
  },
  {
    key: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash"
  }
];

const ChatInterface: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-1.5-flash"); // New: for Gemini model dropdown

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const activeMessages = activeChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: null,
      messages: [
        {
          role: "assistant",
          content: "Hello! I'm Marcus, your MCAT tutor. How can I help you with your MCAT preparation today?",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const handleCapturedText = (text: string, imageUrl?: string) => {
    if (text && text.trim()) {
      if (!activeChat) {
        createNewChat();
      }
      handleSendMessage(`I've scanned the following text. Please help me understand or analyze it:\n\n${text}`, imageUrl);
    }
  };

  const handleCapturedImage = (imageUrl: string) => {
    handleCapturedText("I've captured this screenshot. Please analyze the content.", imageUrl);
  };

  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setShowImageUploader(false);
    toast({
      title: "Image uploaded",
      description: "You can now send a message with this image.",
    });
  };

  const handleSendWithImage = (content: string) => {
    if (uploadedImage) {
      handleSendMessage(content, uploadedImage);
      setUploadedImage(null);
    } else {
      handleSendMessage(content);
    }
  };

  const handleCancelUpload = () => {
    setUploadedImage(null);
    setShowImageUploader(false);
  };

  useEffect(() => {
    chromeStorage.sync.get(["geminiApiKey", "chats", "activeChatId"], (result) => {
      if (result.geminiApiKey) {
        setApiKey(result.geminiApiKey);
      } else {
        setOpenSettings(true);
        toast({
          title: "API Key Required",
          description: "Please enter your Gemini API key to use the chatbot.",
        });
      }

      if (result.chats) {
        try {
          const savedChats = JSON.parse(result.chats) as Chat[];
          const chatsWithDates = savedChats.map(chat => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChats(chatsWithDates);

          if (result.activeChatId && chatsWithDates.some(chat => chat.id === result.activeChatId)) {
            setActiveChatId(result.activeChatId);
          } else if (chatsWithDates.length > 0) {
            setActiveChatId(chatsWithDates[0].id);
          }
        } catch (error) {
          console.error("Error parsing saved chats:", error);
        }
      } else {
        createNewChat();
      }
    });
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      chromeStorage.sync.set({ 
        chats: JSON.stringify(chats),
        activeChatId: activeChatId
      });
    }
  }, [chats, activeChatId]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!activeChat) {
      const newChat = createNewChat();
      setChats((prev) => [...prev]);
      setActiveChatId(newChat.id);
    }

    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
      imageUrl
    };

    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage],
            updatedAt: new Date(),
            title: chat.title || (content.length > 20 ? content.substring(0, 20) + '...' : content)
          };
        }
        return chat;
      });
    });

    setIsLoading(true);

    try {
      if (!apiKey) {
        throw new Error("No API key provided");
      }

      // Helper function to extract MIME type from data URL
      const getMimeTypeFromDataUrl = (dataUrl: string): string => {
        const match = dataUrl.match(/^data:([^;]+);base64,/);
        return match ? match[1] : "image/jpeg"; // Default to image/jpeg if not found
      };
      
      // Process messages to include image data for Gemini multimodal capabilities
      const geminiMessages = activeChat ?
        activeChat.messages.concat(userMessage).map(msg => {
          const parts = [];
          
          // Add image if present
          if (msg.imageUrl) {
            const mimeType = getMimeTypeFromDataUrl(msg.imageUrl);
            parts.push({
              inline_data: {
                mime_type: mimeType,
                data: msg.imageUrl.split(";base64,")[1] // Remove the data:image/type;base64, prefix
              }
            });
          }
          
          // Add text content
          if (msg.content) {
            parts.push({ text: msg.content });
          }
          
          return {
            role: msg.role === 'user' ? 'user' : 'model',
            parts: parts
          };
        }) :
        [{ 
          role: 'user',
          parts: userMessage.imageUrl ? [
            {
              inline_data: {
                mime_type: getMimeTypeFromDataUrl(userMessage.imageUrl),
                data: userMessage.imageUrl.split(";base64,")[1]
              }
            },
            { text: userMessage.content }
          ] : [{ text: userMessage.content }]
        }];

      const systemMessage = {
        role: 'model',
        parts: [{ text: SYSTEM_PROMPT }]
      };

      if (!geminiMessages.some(msg => 
        msg.role === 'model' && 
        msg.parts.some(part => part.text && part.text.includes(SYSTEM_PROMPT))
      )) {
        geminiMessages.unshift(systemMessage);
      }

      // Use the selected model for the API endpoint
      const endpoint = (() => {
        if (selectedModel === "gemini-1.5-flash") {
          return "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        }
        if (selectedModel === "gemini-2.0-flash") {
          return "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        }
        if (selectedModel === "gemini-2.5-pro") {
          return "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
        }
        return "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
      })();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't generate a response.";

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, aiMessage],
              updatedAt: new Date()
            };
          }
          return chat;
        });
      });
    } catch (error) {
      console.error('Error calling Gemini API:', error);

      let errorMessage = "Sorry, I encountered an error while processing your request. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "API key is missing or invalid. Please update it in settings.";
          setOpenSettings(true);
        } else if (error.message.includes("API request failed")) {
          errorMessage = error.message;
        }
      }

      const errorMsg: Message = {
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };

      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, errorMsg],
              updatedAt: new Date()
            };
          }
          return chat;
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => {
      const newChats = prevChats.filter(chat => chat.id !== chatId);

      if (chatId === activeChatId) {
        if (newChats.length > 0) {
          setActiveChatId(newChats[0].id);
        } else {
          setActiveChatId(null);
          setTimeout(() => createNewChat(), 0);
        }
      }

      return newChats;
    });
  };

  // NEW: handle image paste from ChatInput
  const handleInputImagePaste = (dataUrl: string) => {
    // Re-use upload logic
    handleImageUpload(dataUrl);
  };

  // --- Voice: On voice input, send transcript just like a normal message ---
  const handleVoiceInput = (transcript: string) => {
    if (transcript && transcript.trim()) {
      handleSendWithImage(transcript);
    }
  };

  // --- Voice: Use browser TTS to speak assistant's last response on request ---
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Automatically speak assistant replies when they arrive
  useEffect(() => {
    // Don't speak when loading or no messages
    if (isLoading || !activeChat || !activeChat.messages.length) return;
    const lastMsg = activeChat.messages[activeChat.messages.length - 1];
    if (lastMsg.role === "assistant" && lastMsg.content) {
      speakText(lastMsg.content);
    }
    // eslint-disable-next-line
  }, [activeChat?.messages?.length]);

  return (
    <div className="flex h-full w-full bg-background shadow-lg overflow-hidden">
      {showSidebar && (
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={setActiveChatId}
          onNewChat={createNewChat}
          onDeleteChat={handleDeleteChat}
        />
      )}

      <div className={`flex flex-col ${showSidebar ? 'flex-1' : 'w-full'}`}>
        <Header
          onOpenSettings={() => setOpenSettings(true)}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          showSidebar={showSidebar}
        >
          <ChatHeaderActions
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onShowImageUploader={() => setShowImageUploader(true)}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            theme={theme}
            GEMINI_MODELS={GEMINI_MODELS}
          />
          <ScreenCapture
            onCapturedText={handleCapturedText}
            onCapturedImage={handleCapturedImage}
          />
        </Header>

        <div className="flex-1 overflow-y-auto p-2 chat-scrollbar">
          <ChatMessageList
            messages={activeMessages}
            isLoading={isLoading}
            uploadedImage={uploadedImage}
            handleCancelUpload={handleCancelUpload}
            messagesEndRef={messagesEndRef}
          />
        </div>
        <ChatInputArea
          onVoiceInput={handleVoiceInput}
          onSpeak={speakText}
          isLoading={isLoading}
          onSendMessage={handleSendWithImage}
          imageAttached={!!uploadedImage}
          onImagePaste={handleInputImagePaste}
        />

        <SettingsDialog
          open={openSettings}
          onOpenChange={(open) => {
            setOpenSettings(open);
            if (!open) {
              chromeStorage.sync.get(["geminiApiKey"], (result) => {
                if (result.geminiApiKey) {
                  setApiKey(result.geminiApiKey);
                }
              });
            }
          }}
        />
        <ImageUploader
          open={showImageUploader}
          onOpenChange={setShowImageUploader}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
