import { useState } from "react";
import {
  Home,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Upload,
  FileText,
  Key,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

const sidebarItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageSquare, label: "Chats", path: "/chats" },
  { icon: ImageIcon, label: "Images", path: "/images" },
  { icon: Upload, label: "Uploads", path: "/uploads" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const AppSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "h-[calc(100vh-3.5rem)] border-r border-border bg-sidebar transition-all duration-300 sticky top-14",
        isExpanded ? "w-56" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="p-2 space-y-1">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                "whitespace-nowrap transition-all",
                isExpanded ? "opacity-100" : "opacity-0 w-0"
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 right-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full transition-transform",
            isExpanded && "rotate-180"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  );
};
