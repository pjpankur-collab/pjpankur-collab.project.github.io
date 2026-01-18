import coloxyLogo from "@/assets/coloxy-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = ({ size = "md", className }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-20",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-2 animate-fade-in", className)}>
      <img 
        src={coloxyLogo} 
        alt="Coloxy" 
        className={cn("object-contain", sizeClasses[size])}
      />
      <span className={cn("font-display font-bold text-foreground", textSizeClasses[size])}>
        Coloxy
      </span>
    </div>
  );
};

export default Logo;
