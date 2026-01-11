import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  gender: "male" | "female" | "other" | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  goal: "lose_weight" | "gain_weight" | "maintain" | null;
  daily_calories: number | null;
  daily_protein_g: number | null;
  daily_carbs_g: number | null;
  daily_fat_g: number | null;
  onboarding_complete: boolean;
  is_subscribed: boolean;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
};

// Calculate daily nutrition needs based on user profile
export const calculateNutritionNeeds = (profile: Partial<Profile>) => {
  const { gender, age, weight_kg, height_cm, goal } = profile;
  
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
  let tdee = bmr * activityMultiplier;

  // Adjust based on goal
  let daily_calories: number;
  switch (goal) {
    case "lose_weight":
      daily_calories = Math.round(tdee - 500); // 500 calorie deficit
      break;
    case "gain_weight":
      daily_calories = Math.round(tdee + 400); // 400 calorie surplus
      break;
    case "maintain":
    default:
      daily_calories = Math.round(tdee);
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
