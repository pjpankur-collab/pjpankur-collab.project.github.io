import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Target, Sparkles, Flame, Beef, Wheat, Droplets } from "lucide-react";
import Logo from "@/components/Logo";

const foodSuggestions = [
  {
    name: "Dal Tadka",
    calories: 150,
    protein: 9,
    carbs: 20,
    fat: 4,
    emoji: "🍲",
  },
  {
    name: "Roti (2 pcs)",
    calories: 140,
    protein: 4,
    carbs: 30,
    fat: 1,
    emoji: "🫓",
  },
  {
    name: "Paneer Bhurji",
    calories: 265,
    protein: 18,
    carbs: 6,
    fat: 20,
    emoji: "🧀",
  },
  {
    name: "Chicken Curry",
    calories: 240,
    protein: 25,
    carbs: 8,
    fat: 12,
    emoji: "🍗",
  },
  {
    name: "Mixed Veg",
    calories: 120,
    protein: 4,
    carbs: 15,
    fat: 5,
    emoji: "🥗",
  },
  {
    name: "Curd Rice",
    calories: 180,
    protein: 6,
    carbs: 32,
    fat: 4,
    emoji: "🍚",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
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
        </div>

        {/* Food Suggestions Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-center mb-4">
            Popular Indian Foods & Nutrition
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {foodSuggestions.map((food, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-3 space-y-2 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{food.emoji}</span>
                  <span className="font-medium text-sm truncate">{food.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-3 h-3" />
                    <span>{food.calories} cal</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <Beef className="w-3 h-3" />
                    <span>{food.protein}g protein</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Wheat className="w-3 h-3" />
                    <span>{food.carbs}g carbs</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-500">
                    <Droplets className="w-3 h-3" />
                    <span>{food.fat}g fat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => navigate("/auth")} size="lg" className="w-full h-14 text-lg">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
