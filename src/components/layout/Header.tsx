import { Sparkles, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline">
            AI Platform
          </span>
        </div>

        {/* Model Selector */}
        {/* <div className="flex-1 max-w-xs mx-4">
          <Select defaultValue="gpt-4">
            <SelectTrigger className="bg-muted/50 border-border/50 rounded-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
              <SelectItem value="claude">Claude 3</SelectItem>
              <SelectItem value="gemini">Gemini Pro</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
