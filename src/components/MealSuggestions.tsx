import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Lightbulb, Loader2, ChevronRight, Flame, Drumstick, Wheat, Droplets } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MealSuggestion {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  description: string;
  meal_type: string;
}

interface MealSuggestionsProps {
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
}

const MealSuggestions = ({
  remainingCalories,
  remainingProtein,
  remainingCarbs,
  remainingFat,
}: MealSuggestionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (suggestions.length > 0) return; // Don't refetch if we have suggestions
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-suggestions", {
        body: {
          remainingCalories,
          remainingProtein,
          remainingCarbs,
          remainingFat,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message?.includes("402")) {
          toast.error("Service temporarily unavailable.");
        } else {
          throw error;
        }
        return;
      }

      setSuggestions(data?.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      toast.error("Failed to load meal suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchSuggestions();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-accent/10 to-warning/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">My Suggestions</p>
                <p className="text-xs text-muted-foreground">
                  Tap to see meals to reach your goals
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center font-display">Meal Suggestions</SheetTitle>
          <p className="text-sm text-muted-foreground text-center">
            Based on your remaining goals: {remainingCalories} cal, {remainingProtein}g protein
          </p>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">Generating personalized suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No suggestions available</p>
            <Button variant="outline" className="mt-4" onClick={fetchSuggestions}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[calc(85vh-120px)] pb-6">
            {suggestions.map((meal, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{meal.name}</p>
                      <p className="text-xs text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full inline-block mt-1">
                        {meal.meal_type}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Flame className="w-4 h-4 mx-auto text-primary mb-1" />
                      <p className="text-xs font-medium">{meal.calories}</p>
                      <p className="text-[10px] text-muted-foreground">cal</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-2">
                      <Drumstick className="w-4 h-4 mx-auto text-accent mb-1" />
                      <p className="text-xs font-medium">{meal.protein_g}g</p>
                      <p className="text-[10px] text-muted-foreground">protein</p>
                    </div>
                    <div className="bg-warning/10 rounded-lg p-2">
                      <Wheat className="w-4 h-4 mx-auto text-warning mb-1" />
                      <p className="text-xs font-medium">{meal.carbs_g}g</p>
                      <p className="text-[10px] text-muted-foreground">carbs</p>
                    </div>
                    <div className="bg-success/10 rounded-lg p-2">
                      <Droplets className="w-4 h-4 mx-auto text-success mb-1" />
                      <p className="text-xs font-medium">{meal.fat_g}g</p>
                      <p className="text-[10px] text-muted-foreground">fat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MealSuggestions;
