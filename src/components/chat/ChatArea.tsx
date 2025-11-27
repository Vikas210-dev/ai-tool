import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MultiActionInput } from "./MultiActionInput";
import { useAIProvider, AIProviderType, ImageProviderType } from "@/hooks/useAIProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "image";
}

export const ChatArea = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { provider, imageProvider, changeProvider, changeImageProvider, sendMessage, isRecording, startVoiceRecording, stopVoiceRecording, textToSpeech } = useAIProvider();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingContent, isTyping]);

  // Sleep function for typing effect
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleNewChat = () => {
    setMessages([]);
    setIsTyping(false);
    setStreamingContent("");
  };

  const handleSend = async (content: string) => {
    if (!content || !content.trim()) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setStreamingContent("");

    try {
      // Call AI provider
      const response = await sendMessage(content);
      
      // Check if it's an image response
      if (response.type === 'image') {
        const imageMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'image'
        };
        setMessages(prev => [...prev, imageMessage]);
      } else {
        // Add empty assistant message that will be filled
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Simulate typing effect
        const responseText = response.content;
        if (responseText) {
          for (let i = 0; i < responseText.length; i++) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: responseText.substring(0, i + 1) }
                  : msg
              )
            );
            await sleep(10);
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: error.message || 'Sorry, there was an error processing your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setStreamingContent("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="border-b border-border px-6 py-4 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">AI Workspace</h2>
              <p className="text-sm text-muted-foreground">Ask anything, create anything</p>
            </div>
            <Button 
              onClick={handleNewChat}
              variant="outline" 
              size="sm"
              className="rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* AI Provider Selector */}
          <div className="flex items-center gap-3">
            {/* Text Model Selector */}
            <Select value={provider} onValueChange={(value) => changeProvider(value as AIProviderType)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select AI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">
                  <div className="flex items-center gap-2">
                    <span>Gemini</span>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <span>OpenAI GPT</span>
                  </div>
                </SelectItem>
                <SelectItem value="claude">
                  <div className="flex items-center gap-2">
                    <span>Claude</span>
                  </div>
                </SelectItem>
                <SelectItem value="nvidia">
                  <div className="flex items-center gap-2">
                    <span>NVIDIA</span>
                  </div>
                </SelectItem>
                <SelectItem value="meta">
                  <div className="flex items-center gap-2">
                    <span>Meta Llama</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Image Model Selector */}
            {/* <Select value={imageProvider} onValueChange={(value) => changeImageProvider(value as ImageProviderType)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Image Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dalle">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>DALL-E 3</span>
                  </div>
                </SelectItem>
                <SelectItem value="imagen">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Imagen 3.0</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
        <div className="py-6 space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border px-6 py-6 bg-card/30">
        <MultiActionInput
          onSend={handleSend}
          onVoiceStart={(onComplete) => startVoiceRecording(onComplete)}
          onVoiceStop={stopVoiceRecording}
          onTextToSpeech={() => {
            // Read the last assistant message
            const lastAssistantMessage = messages
              .filter(m => m.role === 'assistant' && m.type !== 'image')
              .pop();
            if (lastAssistantMessage?.content) {
              textToSpeech(lastAssistantMessage.content);
            }
          }}
          onImageGenerate={() => console.log("Image generation modal")}
          onFileUpload={() => console.log("File upload")}
          isRecording={isRecording}
        />
      </div>
    </div>
  );
};
