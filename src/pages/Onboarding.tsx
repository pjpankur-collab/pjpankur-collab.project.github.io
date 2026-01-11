import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUpdateProfile, calculateNutritionNeeds, Profile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, User, Scale, Ruler, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "gender" | "age" | "weight" | "height" | "goal" | "results";

interface OnboardingData {
  gender: "male" | "female" | "other" | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  goal: "lose_weight" | "gain_weight" | "maintain" | null;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState<Step>("gender");
  const [data, setData] = useState<OnboardingData>({
    gender: null,
    age: null,
    weight_kg: null,
    height_cm: null,
    goal: null,
  });
  const [nutritionPlan, setNutritionPlan] = useState<ReturnType<typeof calculateNutritionNeeds>>(null);

  const steps: Step[] = ["gender", "age", "weight", "height", "goal", "results"];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case "gender":
        return data.gender !== null;
      case "age":
        return data.age !== null && data.age >= 10 && data.age <= 120;
      case "weight":
        return data.weight_kg !== null && data.weight_kg > 0;
      case "height":
        return data.height_cm !== null && data.height_cm > 0;
      case "goal":
        return data.goal !== null;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === "goal") {
      // Calculate nutrition needs
      const plan = calculateNutritionNeeds(data);
      setNutritionPlan(plan);
      setCurrentStep("results");
    } else if (currentStep === "results") {
      // Save to database
      try {
        await updateProfile.mutateAsync({
          ...data,
          ...nutritionPlan,
          onboarding_complete: true,
        } as Partial<Profile>);
        toast.success("Your personalized plan is ready!");
        navigate("/dashboard");
      } catch (error) {
        toast.error("Failed to save profile. Please try again.");
      }
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "gender":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">What's your gender?</h2>
                <p className="text-muted-foreground text-sm">This helps calculate your calorie needs</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "male", label: "Male", emoji: "👨" },
                { value: "female", label: "Female", emoji: "👩" },
                { value: "other", label: "Other", emoji: "🧑" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData({ ...data, gender: option.value as OnboardingData["gender"] })}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    data.gender === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-3xl block mb-2">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "age":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎂</span>
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">How old are you?</h2>
                <p className="text-muted-foreground text-sm">Age affects your metabolism</p>
              </div>
            </div>
            <Input
              type="number"
              placeholder="Enter your age"
              value={data.age || ""}
              onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || null })}
              min={10}
              max={120}
              className="h-14 text-lg text-center"
            />
            <p className="text-center text-muted-foreground text-sm">Years old</p>
          </div>
        );

      case "weight":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">What's your current weight?</h2>
                <p className="text-muted-foreground text-sm">We'll track your progress from here</p>
              </div>
            </div>
            <Input
              type="number"
              placeholder="Enter your weight"
              value={data.weight_kg || ""}
              onChange={(e) => setData({ ...data, weight_kg: parseFloat(e.target.value) || null })}
              min={20}
              max={300}
              step={0.1}
              className="h-14 text-lg text-center"
            />
            <p className="text-center text-muted-foreground text-sm">Kilograms (kg)</p>
          </div>
        );

      case "height":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Ruler className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">What's your height?</h2>
                <p className="text-muted-foreground text-sm">Used to calculate your BMR</p>
              </div>
            </div>
            <Input
              type="number"
              placeholder="Enter your height"
              value={data.height_cm || ""}
              onChange={(e) => setData({ ...data, height_cm: parseFloat(e.target.value) || null })}
              min={100}
              max={250}
              step={1}
              className="h-14 text-lg text-center"
            />
            <p className="text-center text-muted-foreground text-sm">Centimeters (cm)</p>
          </div>
        );

      case "goal":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">What's your goal?</h2>
                <p className="text-muted-foreground text-sm">We'll customize your plan accordingly</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { value: "lose_weight", label: "Lose Weight", emoji: "📉", desc: "Burn fat & get lean" },
                { value: "maintain", label: "Stay Fit", emoji: "⚖️", desc: "Maintain current weight" },
                { value: "gain_weight", label: "Gain Weight", emoji: "📈", desc: "Build muscle & mass" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData({ ...data, goal: option.value as OnboardingData["goal"] })}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                    data.goal === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <div className="text-left">
                    <span className="font-medium block">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "results":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Your Personalized Plan</h2>
              <p className="text-muted-foreground">Based on your profile, here's what you need daily</p>
            </div>

            {nutritionPlan && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-display font-bold text-primary">
                      {nutritionPlan.daily_calories}
                    </p>
                    <p className="text-sm text-muted-foreground">Calories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-display font-bold text-accent">
                      {nutritionPlan.daily_protein_g}g
                    </p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-display font-bold text-warning">
                      {nutritionPlan.daily_carbs_g}g
                    </p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-display font-bold text-success">
                      {nutritionPlan.daily_fat_g}g
                    </p>
                    <p className="text-sm text-muted-foreground">Fat</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground mt-2">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3 max-w-md mx-auto w-full">
        {currentIndex > 0 && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed() || updateProfile.isPending}
          className="flex-1 h-12"
        >
          {updateProfile.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : currentStep === "results" ? (
            "Start Tracking"
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
