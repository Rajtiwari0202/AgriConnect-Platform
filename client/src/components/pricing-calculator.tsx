import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { formatIndianCurrency } from "@/lib/indian-format";
import { STATES } from "@/lib/pricing";
import { Calculator, Info, Award, Landmark } from "lucide-react";

interface PricingCalculatorProps {
  selectedState?: string;
  onStateChange?: (state: string) => void;
}

export default function PricingCalculator({ 
  selectedState = "Punjab", 
  onStateChange 
}: PricingCalculatorProps) {
  const [currentState, setCurrentState] = useState(selectedState);
  const [isPmKisanBeneficiary, setIsPmKisanBeneficiary] = useState(false);
  const [isFpoMember, setIsFpoMember] = useState(false);

  // Fetch pricing data for selected state
  const { data: pricingPlans, isLoading } = useQuery({
    queryKey: ["/api/pricing", currentState],
    enabled: !!currentState,
  });

  // Calculate pricing with discounts
  const { data: pricingCalculation } = useQuery({
    queryKey: ["/api/pricing/calculate", {
      state: currentState,
      tier: "standard",
      isPmKisanBeneficiary,
      isFpoMember
    }],
    enabled: !!currentState,
  });

  const handleStateSelect = (state: string) => {
    setCurrentState(state);
    onStateChange?.(state);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-background" data-testid="section-pricing-calculator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="heading-pricing">
            Fair, Region-Based Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-pricing-description">
            Our subscription fees are calculated based on your state's average crop income, 
            ensuring affordability across all regions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* State Selector */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="heading-select-state">
              Select Your State
            </h3>
            <div className="space-y-2">
              {STATES.slice(0, 3).map((state) => (
                <Button
                  key={state.value}
                  variant={currentState === state.value ? "default" : "outline"}
                  className="w-full justify-between p-4 h-auto"
                  onClick={() => handleStateSelect(state.value)}
                  data-testid={`button-state-${state.value.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="text-left">
                    <div className="font-medium">{state.label}</div>
                    <div className="text-sm opacity-70">{state.hindi}</div>
                  </div>
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </Button>
              ))}
            </div>

            {/* Landmark Benefits */}
            <Card className="mt-6" data-testid="card-government-benefits">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <Info className="text-blue-500 mt-0.5 h-4 w-4" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground mb-2">Landmark Benefits</div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pm-kisan"
                          checked={isPmKisanBeneficiary}
                          onCheckedChange={(checked) => setIsPmKisanBeneficiary(!!checked)}
                          data-testid="checkbox-pm-kisan"
                        />
                        <label htmlFor="pm-kisan" className="text-sm text-muted-foreground cursor-pointer">
                          PM-KISAN beneficiary (20% discount)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="fpo-member"
                          checked={isFpoMember}
                          onCheckedChange={(checked) => setIsFpoMember(!!checked)}
                          data-testid="checkbox-fpo-member"
                        />
                        <label htmlFor="fpo-member" className="text-sm text-muted-foreground cursor-pointer">
                          FPO member (Priority listing)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Calculator Note */}
            <Card className="mt-4 border-blue-200 dark:border-blue-800" data-testid="card-calculator-info">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Calculator className="text-blue-600 dark:text-blue-400 mt-0.5 h-4 w-4" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      How we calculate pricing
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">
                      Based on MSP data, regional GDP, and national agricultural surveys to ensure fairness.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected State Pricing */}
            {pricingPlans && pricingPlans.length > 0 && (
              <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground" data-testid="card-selected-state-pricing">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{currentState} Subscription</CardTitle>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      Most Popular
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {pricingPlans.map((plan: any) => (
                      <div key={plan.tier} className="text-center" data-testid={`pricing-${plan.tier}`}>
                        <div className="text-sm opacity-90 mb-1 capitalize">{plan.tier} Plan</div>
                        <div className="text-3xl font-bold">
                          {formatIndianCurrency(
                            pricingCalculation?.plan.tier === plan.tier 
                              ? pricingCalculation.finalPrice 
                              : plan.pricePerMonth
                          )}
                        </div>
                        <div className="text-sm opacity-90">/month</div>
                        <div className="text-xs opacity-75 mt-2">
                          {plan.tier === 'basic' && 'For small farmers'}
                          {plan.tier === 'standard' && 'Most common choice'}
                          {plan.tier === 'premium' && 'Priority & analytics'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Affordability Indicator */}
                  {pricingCalculation && (
                    <div className="p-4 bg-white/10 rounded-lg" data-testid="affordability-indicator">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>
                          Avg. Annual Farm Income: {formatIndianCurrency(pricingCalculation.plan.avgStateIncome)}
                        </span>
                        <span>
                          Our fee: <span className="font-semibold">
                            {pricingCalculation.affordabilityRatio.toFixed(1)}% of income
                          </span>
                        </span>
                      </div>
                      <div className="bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-300"
                          style={{ width: `${Math.min(pricingCalculation.affordabilityRatio, 100)}%` }}
                        />
                      </div>
                      {pricingCalculation.discounts.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Active discounts: </span>
                          {pricingCalculation.discounts.map((discount, i) => (
                            <span key={i} className="mr-2">
                              {discount.type} ({discount.percentage}%){i < pricingCalculation.discounts.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Landmark Scheme Integration */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 border-orange-200 dark:border-orange-800" data-testid="card-government-schemes">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Landmark className="text-white h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-foreground">Landmark Scheme Benefits</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Award className="text-green-600 dark:text-green-400 mr-2 h-4 w-4" />
                      PM-KISAN beneficiaries get 20% discount
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Award className="text-green-600 dark:text-green-400 mr-2 h-4 w-4" />
                      Integrated with Soil Health Card data
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Award className="text-green-600 dark:text-green-400 mr-2 h-4 w-4" />
                      FPO members get priority listing
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Award className="text-green-600 dark:text-green-400 mr-2 h-4 w-4" />
                      MSP-linked payment calculations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
