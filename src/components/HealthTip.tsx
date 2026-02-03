import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const healthTips = [
  { tip: "Drink water before meals to help control portion sizes and stay hydrated!", emoji: "💧" },
  { tip: "Eating slowly helps your brain register fullness, preventing overeating.", emoji: "🧠" },
  { tip: "Colorful plates are healthier plates! Aim for variety in every meal.", emoji: "🌈" },
  { tip: "Protein at breakfast keeps you fuller longer and boosts metabolism.", emoji: "🥚" },
  { tip: "A 10-minute walk after meals can help with digestion and blood sugar.", emoji: "🚶" },
  { tip: "Sleep affects hunger hormones. Aim for 7-9 hours for better food choices!", emoji: "😴" },
  { tip: "Fiber is your friend! It aids digestion and keeps you satisfied.", emoji: "🥦" },
  { tip: "Mindful eating: Put down your phone and focus on your food.", emoji: "📵" },
  { tip: "Small plates = smaller portions. A simple trick that works!", emoji: "🍽️" },
  { tip: "Healthy snacking prevents overeating at meals. Plan ahead!", emoji: "🥜" },
  { tip: "Chewing your food thoroughly aids digestion and satisfaction.", emoji: "😋" },
  { tip: "Green tea can boost metabolism naturally. Try it!", emoji: "🍵" },
  { tip: "Meal prep on weekends saves time and prevents unhealthy choices.", emoji: "📦" },
  { tip: "Your gut health affects your mood! Feed it with fermented foods.", emoji: "🦠" },
  { tip: "Reading food labels helps you make informed, healthier choices.", emoji: "🏷️" },
];

const HealthTip = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    // Get a random tip based on the day
    const today = new Date().toDateString();
    const hash = today.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    setCurrentTip(hash % healthTips.length);
  }, []);

  const getNewTip = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length);
      setIsSpinning(false);
    }, 300);
  };

  const tip = healthTips[currentTip];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-primary">Daily Health Tip</p>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={getNewTip}
              >
                <RefreshCw
                  className={cn("w-3.5 h-3.5", isSpinning && "animate-spin")}
                />
              </Button>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              <span className="mr-1">{tip.emoji}</span>
              {tip.tip}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthTip;
