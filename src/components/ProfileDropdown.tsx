import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Target, Settings, Moon, Sun, Share2, LogOut } from "lucide-react";
import { toast } from "sonner";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Coloxy - AI Calorie Tracker",
          text: "Track your calories with AI-powered food scanning! Try Coloxy now.",
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled share or error occurred
    }
  };

  const getGoalLabel = (goal: string | null | undefined) => {
    switch (goal) {
      case "lose_weight":
        return "Lose Weight";
      case "gain_weight":
        return "Gain Weight";
      case "maintain":
        return "Stay Fit";
      default:
        return "Not set";
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Goal:</span>
            <span className="font-medium">{getGoalLabel(profile?.goal)}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Settings</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share App
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
