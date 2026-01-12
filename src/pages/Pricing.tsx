import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Crown, Scan, History, Target, Zap } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Trial",
      price: "₹10",
      period: "2 days",
      description: "Try everything free for 2 days",
      features: [
        { icon: Scan, text: "Unlimited food scans" },
        { icon: History, text: "Full history access" },
        { icon: Target, text: "Personalized goals" },
      ],
      highlight: false,
    },
    {
      name: "Premium",
      price: "₹260",
      period: "month",
      description: "Best value for regular users",
      features: [
        { icon: Scan, text: "Unlimited food scans" },
        { icon: History, text: "Full history access" },
        { icon: Target, text: "Personalized goals" },
      ],
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-semibold text-lg">Premium</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-display font-bold">Coloxy Premium</h2>
          <p className="text-muted-foreground mt-2">Unlock unlimited AI-powered food scanning</p>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={plan.highlight ? "border-2 border-primary shadow-xl" : "border shadow-md"}
            >
              {plan.highlight && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                <CardTitle className="text-4xl font-display">
                  {plan.price}<span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                    <Check className="w-5 h-5 text-success ml-auto" />
                  </div>
                ))}
                
                <Button 
                  className="w-full h-12 mt-4" 
                  size="lg"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.name === "Trial" ? "Start Trial" : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. Secure payment via Stripe.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
