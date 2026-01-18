import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUpdateProfile, Profile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, User, Scale, Ruler, Target, Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "gender" | "age" | "weight" | "height" | "goal" | "target_weight" | "timeline" | "results";

interface OnboardingData {
  gender: "male" | "female" | "other" | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  goal: "lose_weight" | "gain_weight" | "maintain" | null;
  target_weight_kg: number | null;
  timeline_months: number | null;
}

interface NutritionPlan {
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
}

// Calculate nutrition needs based on user profile and timeline
const calculateNutritionNeeds = (data: OnboardingData): NutritionPlan | null => {
  const { gender, age, weight_kg, height_cm, goal, target_weight_kg, timeline_months } = data;
  
  if (!gender || !age || !weight_kg || !height_cm || !goal) {
    return null;
  }

  // Mifflin-St Jeor Equation for BMR
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  // Activity multiplier (assuming moderate activity)
  const activityMultiplier = 1.55;
  const tdee = bmr * activityMultiplier;

  let daily_calories: number;

  if (goal === "maintain") {
    daily_calories = Math.round(tdee);
  } else if (target_weight_kg && timeline_months && timeline_months > 0) {
    // Calculate deficit/surplus based on target and timeline
    const weightDifference = Math.abs(weight_kg - target_weight_kg);
    const weeksToGoal = timeline_months * 4.33; // ~4.33 weeks per month
    const weeklyChange = weightDifference / weeksToGoal;
    
    // 1 kg = ~7700 calories, so daily adjustment = (weekly change * 7700) / 7
    const dailyAdjustment = Math.round((weeklyChange * 7700) / 7);
    
    // Cap adjustment for safety: max 1000 cal deficit, max 500 cal surplus
    const maxDeficit = 1000;
    const maxSurplus = 500;
    
    if (goal === "lose_weight") {
      const cappedDeficit = Math.min(dailyAdjustment, maxDeficit);
      daily_calories = Math.round(tdee - cappedDeficit);
      // Ensure minimum calories (1200 for women, 1500 for men)
      const minCalories = gender === "male" ? 1500 : 1200;
      daily_calories = Math.max(daily_calories, minCalories);
    } else {
      const cappedSurplus = Math.min(dailyAdjustment, maxSurplus);
      daily_calories = Math.round(tdee + cappedSurplus);
    }
  } else {
    // Fallback to standard adjustments
    if (goal === "lose_weight") {
      daily_calories = Math.round(tdee - 500);
    } else {
      daily_calories = Math.round(tdee + 400);
    }
  }

  // Macros calculation
  // Protein: 1.6g per kg body weight for active individuals
  const daily_protein_g = Math.round(weight_kg * 1.6);
  // Fat: 25% of calories
  const daily_fat_g = Math.round((daily_calories * 0.25) / 9);
  // Carbs: remaining calories
  const daily_carbs_g = Math.round(
    (daily_calories - daily_protein_g * 4 - daily_fat_g * 9) / 4
  );

  return {
    daily_calories,
    daily_protein_g,
    daily_carbs_g,
    daily_fat_g,
  };
};

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
    target_weight_kg: null,
    timeline_months: null,
  });
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);

  const getSteps = (): Step[] => {
    if (data.goal === "maintain") {
      return ["gender", "age", "weight", "height", "goal", "results"];
    }
    return ["gender", "age", "weight", "height", "goal", "target_weight", "timeline", "results"];
  };

  const steps = getSteps();
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
      case "target_weight":
        if (!data.target_weight_kg || !data.weight_kg) return false;
        if (data.goal === "lose_weight") {
          return data.target_weight_kg < data.weight_kg && data.target_weight_kg > 30;
        }
        if (data.goal === "gain_weight") {
          return data.target_weight_kg > data.weight_kg && data.target_weight_kg < 200;
        }
        return false;
      case "timeline":
        return data.timeline_months !== null && data.timeline_months >= 1 && data.timeline_months <= 36;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const nextIndex = currentIndex + 1;
    
    if (currentStep === "goal" && data.goal === "maintain") {
      // Skip to results for maintain goal
      const plan = calculateNutritionNeeds(data);
      setNutritionPlan(plan);
      setCurrentStep("results");
    } else if (currentStep === "timeline") {
      // Calculate nutrition needs after timeline
      const plan = calculateNutritionNeeds(data);
      setNutritionPlan(plan);
      setCurrentStep("results");
    } else if (currentStep === "results") {
      // Save to database
      try {
        await updateProfile.mutateAsync({
          gender: data.gender,
          age: data.age,
          weight_kg: data.weight_kg,
          height_cm: data.height_cm,
          goal: data.goal,
          ...nutritionPlan,
          onboarding_complete: true,
        } as Partial<Profile>);
        toast.success("Your personalized plan is ready!");
        navigate("/dashboard");
      } catch (error) {
        toast.error("Failed to save profile. Please try again.");
      }
    } else {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getWeightChangeText = () => {
    if (!data.weight_kg || !data.target_weight_kg) return "";
    const diff = Math.abs(data.weight_kg - data.target_weight_kg);
    return `${diff.toFixed(1)} kg to ${data.goal === "lose_weight" ? "lose" : "gain"}`;
  };

  const getTimelineText = () => {
    if (!data.timeline_months) return "";
    if (data.timeline_months === 1) return "1 month";
    if (data.timeline_months < 12) return `${data.timeline_months} months`;
    const years = Math.floor(data.timeline_months / 12);
    const months = data.timeline_months % 12;
    if (months === 0) return years === 1 ? "1 year" : `${years} years`;
    return `${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""}`;
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
                  onClick={() => {
                    setData({ ...data, gender: option.value as OnboardingData["gender"] });
                    setTimeout(() => handleNext(), 300);
                  }}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && data.age && data.age >= 10 && data.age <= 120) {
                  handleNext();
                }
              }}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && data.weight_kg && data.weight_kg > 0) {
                  handleNext();
                }
              }}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && data.height_cm && data.height_cm > 0) {
                  handleNext();
                }
              }}
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
                  onClick={() => {
                    setData({ ...data, goal: option.value as OnboardingData["goal"], target_weight_kg: null, timeline_months: null });
                    setTimeout(() => handleNext(), 300);
                  }}
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

      case "target_weight":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">
                  How many kilos do you want to {data.goal === "lose_weight" ? "lose" : "gain"}?
                </h2>
                <p className="text-muted-foreground text-sm">
                  Current weight: {data.weight_kg} kg
                </p>
              </div>
            </div>
            <Input
              type="number"
              placeholder={`Enter your target weight`}
              value={data.target_weight_kg || ""}
              onChange={(e) => setData({ ...data, target_weight_kg: parseFloat(e.target.value) || null })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canProceed()) {
                  handleNext();
                }
              }}
              min={data.goal === "lose_weight" ? 30 : (data.weight_kg || 0) + 1}
              max={data.goal === "gain_weight" ? 200 : (data.weight_kg || 100) - 1}
              step={0.5}
              className="h-14 text-lg text-center"
            />
            <p className="text-center text-muted-foreground text-sm">
              Target weight in kilograms (kg)
            </p>
            {data.target_weight_kg && data.weight_kg && (
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <p className="text-lg font-medium text-primary">{getWeightChangeText()}</p>
              </div>
            )}
          </div>
        );

      case "timeline":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">
                  In how many months do you want to achieve this?
                </h2>
                <p className="text-muted-foreground text-sm">
                  {getWeightChangeText()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 3, label: "3 months" },
                { value: 6, label: "6 months" },
                { value: 12, label: "1 year" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setData({ ...data, timeline_months: option.value });
                    setTimeout(() => handleNext(), 300);
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    data.timeline_months === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="Or enter custom months"
                value={[3, 6, 12].includes(data.timeline_months || 0) ? "" : (data.timeline_months || "")}
                onChange={(e) => setData({ ...data, timeline_months: parseInt(e.target.value) || null })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && data.timeline_months && data.timeline_months >= 1 && data.timeline_months <= 36) {
                    handleNext();
                  }
                }}
                min={1}
                max={36}
                className="h-14 text-lg text-center"
              />
            </div>
            {data.timeline_months && (
              <p className="text-center text-muted-foreground text-sm">
                Target: {getTimelineText()}
              </p>
            )}
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
              {data.goal !== "maintain" && data.target_weight_kg && data.timeline_months && (
                <p className="text-sm text-primary mt-2">
                  To {data.goal === "lose_weight" ? "lose" : "gain"} {Math.abs((data.weight_kg || 0) - data.target_weight_kg).toFixed(1)} kg in {getTimelineText()}
                </p>
              )}
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
