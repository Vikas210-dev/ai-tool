import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  unread?: number;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Product Design Ideas",
    preview: "Let's discuss the new landing page layout...",
    timestamp: "2m ago",
    unread: 2,
  },
];

interface ConversationListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const ConversationList = ({
  selectedId,
  onSelect,
}: ConversationListProps) => {
  return (
    <div className="w-full lg:w-80 border-r border-border bg-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button className="w-full rounded-full gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full p-3 rounded-2xl text-left transition-all hover-lift",
                selectedId === conv.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <h3 className="font-medium text-sm truncate">{conv.title}</h3>
                </div>
                {conv.unread && (
                  <Badge
                    variant="default"
                    className="rounded-full h-5 px-2 text-xs gradient-primary"
                  >
                    {conv.unread}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate pl-6">
                {conv.preview}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1 pl-6">
                {conv.timestamp}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
