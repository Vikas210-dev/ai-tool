import { useState, useRef } from "react";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const quickModes = [
  { label: "Chat", icon: Sparkles },
  { label: "Image", icon: ImageIcon },
  { label: "Code", icon: Wand2 },
  { label: "Voice", icon: Mic },
];

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  data: string; // base64 data
}

interface MultiActionInputProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  onVoiceStart?: (onComplete: (text: string) => void) => void;
  onVoiceStop?: () => void;
  onTextToSpeech?: () => void;
  onImageGenerate?: () => void;
  isRecording?: boolean;
}

export const MultiActionInput = ({
  onSend,
  onVoiceStart,
  onVoiceStop,
  onTextToSpeech,
  onImageGenerate,
  isRecording: externalIsRecording = false,
}: MultiActionInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || uploadedFiles.length > 0) {
      onSend(message, uploadedFiles.length > 0 ? uploadedFiles : undefined);
      setMessage("");
      setUploadedFiles([]);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 20MB.`);
        continue;
      }

      // Convert to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(file);
      });

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64Data,
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    // Focus back on textarea
    textareaRef.current?.focus();
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
    console.log(' TTS button clicked - reading last assistant message');
    
    if (onTextToSpeech) {
      onTextToSpeech();
    } else {
      console.warn(' TTS callback not provided');
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

      {/* File Preview */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm"
            >
              <Paperclip className="w-4 h-4" />
              <span className="max-w-[200px] truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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
                    onClick={handleFileUpload}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload file</TooltipContent>
              </Tooltip>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx,.json,.csv"
                className="hidden"
                onChange={handleFileChange}
              />

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
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-9 w-9"
                      >
                        <Smile className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent>Emoji</TooltipContent>
                </Tooltip>
                <PopoverContent 
                  className="w-auto p-0 border-0" 
                  align="end"
                  sideOffset={5}
                >
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    width={350}
                    height={400}
                  />
                </PopoverContent>
              </Popover>
            </TooltipProvider>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() && uploadedFiles.length === 0}
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
