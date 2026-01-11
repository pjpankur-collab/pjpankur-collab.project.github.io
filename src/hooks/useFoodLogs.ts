import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FoodLog {
  id: string;
  user_id: string;
  food_name: string;
  food_image_url: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  serving_size: string | null;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | null;
  logged_at: string;
  created_at: string;
}

export const useFoodLogs = (date?: Date) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["food-logs", user?.id, date?.toDateString()],
    queryFn: async () => {
      if (!user) return [];

      const startOfDay = date ? new Date(date.setHours(0, 0, 0, 0)) : new Date(new Date().setHours(0, 0, 0, 0));
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", startOfDay.toISOString())
        .lt("logged_at", endOfDay.toISOString())
        .order("logged_at", { ascending: false });

      if (error) throw error;
      return data as FoodLog[];
    },
    enabled: !!user,
  });
};

export const useAddFoodLog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodLog: Omit<FoodLog, "id" | "user_id" | "created_at" | "logged_at">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("food_logs")
        .insert({
          ...foodLog,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-logs"] });
    },
  });
};

export const useDeleteFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-logs"] });
    },
  });
};
