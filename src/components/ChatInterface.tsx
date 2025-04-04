
import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import Header from "./Header";
import SettingsDialog from "./SettingsDialog";
import ChatList from "./ChatList";
import ScreenCapture from "./ScreenCapture";
import { useToast } from "@/hooks/use-toast";
import { chromeStorage } from "@/utils/chromeStorage";
import { Chat } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

// MCAT tutor system prompt
const SYSTEM_PROMPT = `You are Marcus, an experienced MCAT tutor. You specialize in helping students prepare for the Medical College Admission Test with clear explanations, practice questions, and study strategies. You can explain complex concepts in biology, chemistry, physics, and psychology in an accessible way. You're patient, encouraging, and knowledgeable about the MCAT format and requirements.`;

const ChatInterface: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Get active chat
  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const activeMessages = activeChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  // Create a new chat
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

  // Handle captured text from screen
  const handleCapturedText = (text: string, imageUrl?: string) => {
    if (text && text.trim()) {
      // If there's no active chat, create one
      if (!activeChat) {
        createNewChat();
      }
      
      // Add the captured text as a user message with a prefix
      handleSendMessage(`I've scanned the following text. Please help me understand or analyze it:\n\n${text}`, imageUrl);
    }
  };

  // Handle captured image
  const handleCapturedImage = (imageUrl: string) => {
    // Call handleCapturedText with both text and image
    handleCapturedText("I've captured this screenshot. Please analyze the content.", imageUrl);
  };

  // Load saved chats and API key on mount
  useEffect(() => {
    chromeStorage.sync.get(["openaiApiKey", "chats", "activeChatId"], (result) => {
      // Load API key
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      } else {
        // If no API key is found, open settings dialog
        setOpenSettings(true);
        toast({
          title: "API Key Required",
          description: "Please enter your OpenAI API key to use the chatbot.",
        });
      }
      
      // Load chats if they exist
      if (result.chats) {
        try {
          const savedChats = JSON.parse(result.chats) as Chat[];
          // Convert string timestamps back to Date objects
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
          
          // Set active chat
          if (result.activeChatId && chatsWithDates.some(chat => chat.id === result.activeChatId)) {
            setActiveChatId(result.activeChatId);
          } else if (chatsWithDates.length > 0) {
            setActiveChatId(chatsWithDates[0].id);
          }
        } catch (error) {
          console.error("Error parsing saved chats:", error);
        }
      } else {
        // Create initial chat if no chats exist
        createNewChat();
      }
    });
  }, []);

  // Save chats whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      chromeStorage.sync.set({ 
        chats: JSON.stringify(chats),
        activeChatId: activeChatId
      });
    }
  }, [chats, activeChatId]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    // If no active chat, create one
    if (!activeChat) {
      const newChat = createNewChat();
      setChats((prev) => [...prev]);
      setActiveChatId(newChat.id);
    }
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
      imageUrl
    };
    
    // Update chat with user message
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage],
            updatedAt: new Date(),
            // Set title based on first message if not already set
            title: chat.title || (content.length > 20 ? content.substring(0, 20) + '...' : content)
          };
        }
        return chat;
      });
    });
    
    setIsLoading(true);
    
    try {
      // Check if API key exists
      if (!apiKey) {
        throw new Error("No API key provided");
      }
      
      // Prepare messages array for the API
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...activeChat ? activeChat.messages.concat(userMessage).map(msg => ({
          role: msg.role,
          content: msg.imageUrl ? 
            `[Image attached]\n\n${msg.content}` : 
            msg.content
        })) : [userMessage].map(msg => ({
          role: msg.role,
          content: msg.imageUrl ?
            `[Image attached]\n\n${msg.content}` :
            msg.content
        }))
      ];
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`, 
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using a modern model
          messages: apiMessages,
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      // Add AI response
      const aiMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      
      // Update chat with AI response
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
      console.error('Error calling OpenAI API:', error);
      
      let errorMessage = "Sorry, I encountered an error while processing your request. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "API key is missing or invalid. Please update it in settings.";
          setOpenSettings(true);
        } else if (error.message.includes("API request failed")) {
          errorMessage = error.message;
        }
      }
      
      // Add error message
      const errorMsg: Message = {
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };
      
      // Update chat with error message
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
      
      // If deleting active chat, set new active chat
      if (chatId === activeChatId) {
        if (newChats.length > 0) {
          setActiveChatId(newChats[0].id);
        } else {
          setActiveChatId(null);
          // Create a new chat if we're deleting the last one
          setTimeout(() => createNewChat(), 0);
        }
      }
      
      return newChats;
    });
  };

  return (
    <div className="flex h-full w-full bg-background shadow-lg rounded-lg overflow-hidden">
      {showSidebar && (
        <div className="w-[130px] min-w-[130px] h-full">
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onChatSelect={setActiveChatId}
            onNewChat={createNewChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>
      )}
      
      <div className={`flex flex-col ${showSidebar ? 'flex-1' : 'w-full'}`}>
        <Header 
          onOpenSettings={() => setOpenSettings(true)} 
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          showSidebar={showSidebar}
        >
          <ScreenCapture 
            onCapturedText={handleCapturedText} 
            onCapturedImage={handleCapturedImage}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </Header>
        
        <div className="flex-1 overflow-y-auto p-3 chat-scrollbar">
          <div className="space-y-2">
            {activeChat && activeChat.messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                imageUrl={message.imageUrl}
              />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 px-3 py-1 max-w-fit rounded-full bg-secondary text-secondary-foreground mb-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        
        <SettingsDialog 
          open={openSettings} 
          onOpenChange={(open) => {
            setOpenSettings(open);
            if (!open) {
              // Refresh API key when settings dialog is closed
              chromeStorage.sync.get(["openaiApiKey"], (result) => {
                if (result.openaiApiKey) {
                  setApiKey(result.openaiApiKey);
                }
              });
            }
          }} 
        />
      </div>
    </div>
  );
};

export default ChatInterface;
