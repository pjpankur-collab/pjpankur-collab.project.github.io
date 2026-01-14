import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Target, Sparkles } from "lucide-react";
import coloxyLogo from "@/assets/coloxy-logo.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <img 
          src={coloxyLogo} 
          alt="Coloxy" 
          className="h-24 mx-auto mb-6 object-contain"
        />
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered calorie tracking for Indian food
        </p>

        <div className="space-y-4 mb-12">
          {[
            { icon: Camera, text: "Scan any Indian food" },
            { icon: Sparkles, text: "AI analyzes nutrition instantly" },
            { icon: Target, text: "Track your daily goals" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-card p-4 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        <Button onClick={() => navigate("/auth")} size="lg" className="w-full h-14 text-lg">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
