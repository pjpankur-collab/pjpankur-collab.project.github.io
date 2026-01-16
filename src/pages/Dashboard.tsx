import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/hooks/useProfile";
import { useFoodLogs, useDeleteFoodLog } from "@/hooks/useFoodLogs";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Camera, Drumstick, Wheat, Droplets, Trash2, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: foodLogs = [], isLoading: logsLoading } = useFoodLogs();
  const deleteFoodLog = useDeleteFoodLog();

  // Calculate totals
  const totals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + Number(log.protein_g || 0),
      carbs: acc.carbs + Number(log.carbs_g || 0),
      fat: acc.fat + Number(log.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteFoodLog.mutateAsync(id);
      toast.success("Food log deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to onboarding if not complete
  if (profile && !profile.onboarding_complete) {
    navigate("/onboarding");
    return null;
  }

  const calorieProgress = profile?.daily_calories 
    ? Math.min((totals.calories / profile.daily_calories) * 100, 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            {!profile?.is_subscribed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="gap-1"
              >
                <Crown className="w-4 h-4 text-accent" />
                Premium
              </Button>
            )}
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Welcome message with user name */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold">
              Hi, {profile?.full_name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-muted-foreground text-sm">Track your meals today</p>
          </div>
        </div>

        {/* Daily Progress Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <p className="text-sm opacity-80">Today's Progress</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-4xl font-display font-bold">{totals.calories}</span>
              <span className="text-lg opacity-80 mb-1">/ {profile?.daily_calories || 2000} cal</span>
            </div>
            <Progress 
              value={calorieProgress} 
              className="mt-4 h-3 bg-primary-foreground/20"
            />
            <p className="text-sm mt-2 opacity-80">
              {profile?.daily_calories 
                ? `${Math.max(0, profile.daily_calories - totals.calories)} calories remaining`
                : "Set up your goals in settings"}
            </p>
          </div>
        </Card>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Drumstick className="w-6 h-6 mx-auto text-accent mb-2" />
              <p className="text-2xl font-display font-bold">{Math.round(totals.protein)}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="text-xs text-muted-foreground">/ {profile?.daily_protein_g || 100}g</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Wheat className="w-6 h-6 mx-auto text-warning mb-2" />
              <p className="text-2xl font-display font-bold">{Math.round(totals.carbs)}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="text-xs text-muted-foreground">/ {profile?.daily_carbs_g || 250}g</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Droplets className="w-6 h-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-display font-bold">{Math.round(totals.fat)}g</p>
              <p className="text-xs text-muted-foreground">Fat</p>
              <p className="text-xs text-muted-foreground">/ {profile?.daily_fat_g || 65}g</p>
            </CardContent>
          </Card>
        </div>

        {/* Food Logs */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-3">Today's Food</h2>
          {logsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : foodLogs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No food logged yet today</p>
                <p className="text-sm text-muted-foreground">Scan your first meal!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {foodLogs.map((log) => (
                <Card key={log.id} className="border-0 shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    {log.food_image_url ? (
                      <img
                        src={log.food_image_url}
                        alt={log.food_name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{log.food_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.calories} cal • {log.protein_g}g protein
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {log.meal_type || "Meal"}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Scan Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <Button
          size="lg"
          onClick={() => navigate("/scan")}
          className="h-16 px-8 rounded-full shadow-2xl animate-pulse-glow gap-2"
        >
          <Camera className="w-6 h-6" />
          <span className="font-display font-semibold">Scan Food</span>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
