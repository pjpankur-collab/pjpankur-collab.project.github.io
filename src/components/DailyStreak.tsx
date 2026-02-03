import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Target, Zap, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyStreakProps {
  daysLogged: number;
  hasLoggedToday: boolean;
}

const achievements = [
  { days: 3, icon: Zap, title: "Getting Started", color: "text-warning" },
  { days: 7, icon: Star, title: "One Week Warrior", color: "text-primary" },
  { days: 14, icon: Target, title: "Consistency King", color: "text-success" },
  { days: 30, icon: Trophy, title: "Monthly Master", color: "text-accent" },
  { days: 60, icon: Award, title: "Health Hero", color: "text-destructive" },
];

const DailyStreak = ({ daysLogged, hasLoggedToday }: DailyStreakProps) => {
  const [animateFlame, setAnimateFlame] = useState(false);

  useEffect(() => {
    if (hasLoggedToday) {
      setAnimateFlame(true);
      const timer = setTimeout(() => setAnimateFlame(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasLoggedToday]);

  const nextAchievement = achievements.find((a) => a.days > daysLogged);
  const earnedAchievements = achievements.filter((a) => a.days <= daysLogged);
  const latestAchievement = earnedAchievements[earnedAchievements.length - 1];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/10 via-destructive/5 to-warning/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-destructive flex items-center justify-center",
                animateFlame && "animate-bounce"
              )}
            >
              <Flame
                className={cn(
                  "w-8 h-8 text-white",
                  hasLoggedToday && "animate-pulse"
                )}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold">{daysLogged}</span>
                <span className="text-muted-foreground text-sm">day streak</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {hasLoggedToday ? "🔥 Keep it going!" : "Log food to continue!"}
              </p>
            </div>
          </div>

          {latestAchievement && (
            <div className="text-right">
              <latestAchievement.icon
                className={cn("w-6 h-6 ml-auto", latestAchievement.color)}
              />
              <p className="text-xs font-medium mt-1">{latestAchievement.title}</p>
            </div>
          )}
        </div>

        {nextAchievement && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Next: {nextAchievement.title}
              </span>
              <span className="font-medium">
                {nextAchievement.days - daysLogged} days to go
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-destructive rounded-full transition-all duration-500"
                style={{
                  width: `${(daysLogged / nextAchievement.days) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Show earned badges */}
        {earnedAchievements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Earned Badges</p>
            <div className="flex gap-2">
              {earnedAchievements.map((achievement) => (
                <div
                  key={achievement.days}
                  className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center"
                  title={achievement.title}
                >
                  <achievement.icon className={cn("w-4 h-4", achievement.color)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyStreak;
