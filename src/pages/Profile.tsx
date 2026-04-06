import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile, calculateNutritionNeeds, Profile as ProfileType } from "@/hooks/useProfile";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, RefreshCw, Moon, Sun, Share2, Crown, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setGender(profile.gender || "");
      setAge(profile.age?.toString() || "");
      setWeight(profile.weight_kg?.toString() || "");
      setHeight(profile.height_cm?.toString() || "");
      setGoal(profile.goal || "");
      setCalories(profile.daily_calories?.toString() || "");
      setProtein(profile.daily_protein_g?.toString() || "");
      setCarbs(profile.daily_carbs_g?.toString() || "");
      setFat(profile.daily_fat_g?.toString() || "");
    }
  }, [profile]);

  const getInitials = (n: string) => {
    if (!n) return "U";
    return n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSavePersonal = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: name,
        gender: gender as ProfileType["gender"],
        age: age ? parseInt(age) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseFloat(height) : null,
        goal: goal as ProfileType["goal"],
      });
      toast.success("Personal info updated!");
    } catch {
      toast.error("Failed to update personal info");
    }
  };

  const handleSaveGoals = async () => {
    try {
      await updateProfile.mutateAsync({
        daily_calories: calories ? parseInt(calories) : null,
        daily_protein_g: protein ? parseInt(protein) : null,
        daily_carbs_g: carbs ? parseInt(carbs) : null,
        daily_fat_g: fat ? parseInt(fat) : null,
      });
      toast.success("Nutrition goals updated!");
    } catch {
      toast.error("Failed to update goals");
    }
  };

  const handleRecalculate = () => {
    const result = calculateNutritionNeeds({
      gender: gender as ProfileType["gender"],
      age: age ? parseInt(age) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      height_cm: height ? parseFloat(height) : null,
      goal: goal as ProfileType["goal"],
    });
    if (result) {
      setCalories(result.daily_calories.toString());
      setProtein(result.daily_protein_g.toString());
      setCarbs(result.daily_carbs_g.toString());
      setFat(result.daily_fat_g.toString());
      toast.success("Goals recalculated based on your stats!");
    } else {
      toast.error("Please fill in all personal info first");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Caloxy - AI Calorie Tracker",
          text: "Track your calories with AI-powered food scanning!",
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success("Link copied to clipboard!");
      }
    } catch {}
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Profile & Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground">{name || "User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Age</label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Weight (kg)</label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Height (cm)</label>
                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Goal</label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="gain_weight">Gain Weight</SelectItem>
                  <SelectItem value="maintain">Stay Fit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSavePersonal} disabled={updateProfile.isPending} className="w-full">
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Personal Info
            </Button>
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Nutrition Goals</CardTitle>
              <Button variant="outline" size="sm" onClick={handleRecalculate}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Recalculate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Daily Calories</label>
              <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="2000" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Protein (g)</label>
                <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="120" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Carbs (g)</label>
                <Input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="250" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Fat (g)</label>
                <Input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="55" />
              </div>
            </div>
            <Button onClick={handleSaveGoals} disabled={updateProfile.isPending} className="w-full">
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Goals
            </Button>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm">Dark Mode</span>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={c => setTheme(c ? "dark" : "light")} />
            </div>
            <Separator />
            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share App
            </Button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Subscription</span>
              {profile?.is_subscribed ? (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Crown className="w-3 h-3 mr-1" /> Premium
                </Badge>
              ) : (
                <Badge variant="secondary">Free</Badge>
              )}
            </div>
            {!profile?.is_subscribed && (
              <Button variant="outline" className="w-full" onClick={() => navigate("/pricing")}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
            <Separator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>You'll need to sign in again to access your data.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
