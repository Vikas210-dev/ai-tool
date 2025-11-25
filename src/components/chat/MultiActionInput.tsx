import { useState, useRef } from "react";
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Paperclip, 
  Wand2,
  Volume2,
  Smile,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const quickModes = [
  { label: "Chat", icon: Sparkles },
  { label: "Image", icon: ImageIcon },
  { label: "Code", icon: Wand2 },
  { label: "Voice", icon: Mic },
];

interface MultiActionInputProps {
  onSend: (message: string) => void;
  onVoiceStart?: (onComplete: (text: string) => void) => void;
  onVoiceStop?: () => void;
  onTextToSpeech?: (text: string) => void;
  onImageGenerate?: () => void;
  onFileUpload?: () => void;
  isRecording?: boolean;
}

export const MultiActionInput = ({
  onSend,
  onVoiceStart,
  onVoiceStop,
  onTextToSpeech,
  onImageGenerate,
  onFileUpload,
  isRecording: externalIsRecording = false,
}: MultiActionInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = async () => {
    if (externalIsRecording) {
      // Stop recording manually
      if (onVoiceStop) {
        onVoiceStop();
      }
    } else {
      // Start recording with auto-transcribe callback
      if (onVoiceStart) {
        onVoiceStart((transcribedText) => {
          // Auto-send the transcribed text
          if (transcribedText && transcribedText.trim()) {
            onSend(transcribedText);
          }
        });
      }
    }
  };

  const handleTextToSpeech = () => {
    console.log(' TTS button clicked');
    console.log('Message:', message);
    console.log(' onTextToSpeech function:', onTextToSpeech);
    
    if (message.trim() && onTextToSpeech) {
      console.log(' Calling textToSpeech with:', message);
      onTextToSpeech(message);
    } else {
      console.warn(' TTS not triggered:', {
        hasMessage: !!message.trim(),
        hasCallback: !!onTextToSpeech
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Quick Modes */}
      {/* <div className="flex items-center gap-2 px-4">
        <span className="text-xs text-muted-foreground">Mode:</span>
        {quickModes.map((mode) => (
          <Badge
            key={mode.label}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <mode.icon className="w-3 h-3 mr-1" />
            {mode.label}
          </Badge>
        ))}
      </div> */}

      {/* Input Bar */}
      <div className="relative glass rounded-[2rem] border border-border shadow-xl">
        <div className="flex items-end gap-2 p-2">
          {/* Left Actions */}
          <TooltipProvider>
            <div className="flex items-center gap-1 pl-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9"
                    onClick={onFileUpload}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload file</TooltipContent>
              </Tooltip>

              {/* <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9"
                    onClick={onImageGenerate}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate image</TooltipContent>
              </Tooltip> */}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full h-9 w-9",
                      externalIsRecording && "bg-destructive text-destructive-foreground voice-pulse"
                    )}
                    onClick={toggleRecording}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{externalIsRecording ? 'Stop recording' : 'Voice input'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9"
                    onClick={handleTextToSpeech}
                    // disabled={!message.trim()}
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text to speech</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
              rows={1}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 pr-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Emoji</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="rounded-full h-10 w-10 gradient-primary shadow-lg hover:shadow-xl transition-all"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Suggested Prompts */}
      {message === "" && (
        <div className="flex flex-wrap gap-2 px-4">
          {["Explain quantum computing", "Write a poem", "Debug my code"].map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setMessage(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
