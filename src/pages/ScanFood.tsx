import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddFoodLog } from "@/hooks/useFoodLogs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Camera, Loader2, Upload, Check } from "lucide-react";

const ScanFood = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mealType, setMealType] = useState<string>("lunch");
  const addFoodLog = useAddFoodLog();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      setResult(data);
      toast.success("Food analyzed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    try {
      await addFoodLog.mutateAsync({
        food_name: result.food_name,
        food_image_url: imagePreview,
        calories: result.calories,
        protein_g: result.protein_g,
        carbs_g: result.carbs_g,
        fat_g: result.fat_g,
        fiber_g: result.fiber_g || 0,
        serving_size: result.serving_size,
        meal_type: mealType as any,
      });
      toast.success("Food logged!");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-semibold text-lg">Scan Food</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />

        {!imagePreview ? (
          <Card className="border-dashed border-2" onClick={() => fileInputRef.current?.click()}>
            <CardContent className="p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">Take a photo or upload</p>
              <p className="text-sm text-muted-foreground">Scan Indian food for nutrition info</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <img src={imagePreview} alt="Food" className="w-full rounded-xl shadow-lg" />
            
            {analyzing && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-muted-foreground">Analyzing with AI...</p>
              </div>
            )}

            {result && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-display font-bold">{result.food_name}</h2>
                  <p className="text-sm text-muted-foreground">{result.serving_size}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{result.calories}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-accent">{result.protein_g}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="bg-warning/10 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-warning">{result.carbs_g}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="bg-success/10 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-success">{result.fat_g}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>

                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger><SelectValue placeholder="Meal type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleSave} disabled={addFoodLog.isPending} className="w-full h-12">
                    {addFoodLog.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 mr-2" />Add to Log</>}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={() => { setImagePreview(null); setResult(null); }} className="w-full">
              Scan Another
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanFood;
