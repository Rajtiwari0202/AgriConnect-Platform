import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Star, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatIndianCurrency } from "@/lib/indian-format";
import { NATIONAL_SUBSCRIPTION_PLANS, subscriptionUtils } from "@shared/subscription-plans";

interface PricingComparisonProps {
  onSelectPlan?: (planId: string, billingPeriod: 'monthly' | 'yearly') => void;
  currentPlan?: string;
  showAffordability?: boolean;
}

export default function PricingComparison({ 
  onSelectPlan, 
  currentPlan,
  showAffordability = true 
}: PricingComparisonProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  const plans = subscriptionUtils.getAllPlans();

  const handleSelectPlan = (planId: string) => {
    onSelectPlan?.(planId, billingPeriod);
  };

  const getPrice = (plan: any) => {
    return billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: any) => {
    if (billingPeriod === 'monthly') return null;
    const savings = subscriptionUtils.getYearlySavings(plan.id);
    const percentage = subscriptionUtils.getYearlySavingsPercentage(plan.id);
    return { amount: savings, percentage };
  };

  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="pricing-comparison">
      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <Label htmlFor="billing-toggle" className="text-sm font-medium">
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingPeriod === 'yearly'}
          onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
          data-testid="switch-billing-period"
        />
        <Label htmlFor="billing-toggle" className="text-sm font-medium">
          Yearly
          <Badge variant="secondary" className="ml-2">Save up to 17%</Badge>
        </Label>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan, index) => {
          const price = getPrice(plan);
          const savings = getSavings(plan);
          const isCurrentPlan = currentPlan === plan.id;
          const isPopular = plan.id === 'pro';

          return (
            <Card
              key={plan.id}
              className={`relative ${
                isPopular ? 'border-2 border-primary shadow-lg scale-105' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">
                      {formatIndianCurrency(price)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      /{billingPeriod === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  
                  {savings && (
                    <div className="text-sm text-green-600 mt-1">
                      Save {formatIndianCurrency(savings.amount)} ({savings.percentage}% off)
                    </div>
                  )}
                  
                  {showAffordability && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground cursor-help">
                            <Info className="w-3 h-3 mr-1" />
                            {plan.affordabilityNote}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            This plan costs approximately {plan.affordabilityNote} based on 
                            average agricultural household income data from Government of India surveys.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Free Trial Info */}
                {plan.freeTrial.enabled && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      🎉 {plan.freeTrial.durationDays}-day free trial
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {plan.freeTrial.requiresPaymentMethod 
                        ? 'Payment method required, no charge during trial'
                        : 'No payment method required'
                      }
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={isCurrentPlan ? "secondary" : (isPopular ? "default" : "outline")}
                  className="w-full"
                  disabled={isCurrentPlan}
                  data-testid={`button-select-${plan.id}`}
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : `Choose ${plan.name}`
                  }
                </Button>

                {/* Target Audience */}
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Perfect for: {plan.target}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Choose AgriConnect?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Designed specifically for Indian agriculture
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Support for multiple Indian payment methods
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Government scheme integration and awareness
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Farmer-friendly pricing based on affordability
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Secure escrow protection for land deals
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment & Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                UPI, Cards, Net Banking supported
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                GST-compliant invoices provided
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Cancel anytime from your dashboard
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Pro-rated refunds as per terms
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                Secure payment processing by Stripe
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Transparency Note */}
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
          Pricing Transparency
        </h4>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Our platform charges a small service fee (~5-8%) to maintain the platform, 
          ensure security, and provide support. The majority of payments go directly to 
          landowners. We believe in transparent pricing that supports both farmers and landowners.
        </p>
      </div>
    </div>
  );
}