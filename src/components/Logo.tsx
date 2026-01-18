import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const Logo = ({ size = "md", className, showText = true }: LogoProps) => {
  const iconContainerSizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2 animate-fade-in", className)}>
      <div className={cn(
        "rounded-2xl bg-primary flex items-center justify-center",
        iconContainerSizes[size]
      )}>
        <Leaf className={cn("text-primary-foreground", iconSizes[size])} />
      </div>
      {showText && (
        <span className={cn("font-display font-bold text-foreground", textSizeClasses[size])}>
          Coloxy
        </span>
      )}
    </div>
  );
};

export default Logo;
