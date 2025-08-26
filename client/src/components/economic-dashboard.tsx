import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { formatIndianCurrency, formatIndianNumber } from "@/lib/indian-format";
import { TrendingUp, BarChart3, Users, Target, Landmark, Info } from "lucide-react";

export default function EconomicDashboard() {
  const { data: economicsData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/economics"],
  });

  if (isLoading) {
    return (
      <div className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!economicsData) {
    return (
      <div className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-muted-foreground">
            Unable to load economic data. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-background" data-testid="section-economic-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="heading-economic-impact">
            Economic Impact Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-dashboard-description">
            Real-time insights into agricultural economics, pricing fairness, and platform sustainability 
            aligned with government data.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Platform Revenue Projections */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" data-testid="card-platform-revenue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Platform Revenue</CardTitle>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-primary-foreground h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Subscriptions</span>
                <span className="font-semibold text-foreground" data-testid="revenue-subscriptions">
                  {formatIndianCurrency(economicsData.platform.subscriptionRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction Commissions (7%)</span>
                <span className="font-semibold text-foreground" data-testid="revenue-commissions">
                  {formatIndianCurrency(economicsData.platform.commissionRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-medium text-foreground">Total Monthly Revenue</span>
                <span className="text-xl font-bold text-primary" data-testid="revenue-total">
                  {formatIndianCurrency(economicsData.platform.monthlyRevenue)}
                </span>
              </div>

              {/* Growth Chart Placeholder */}
              <div className="mt-6 p-4 bg-background rounded-lg border">
                <div className="text-sm text-muted-foreground mb-2">6-Month Growth Trend</div>
                <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/30 rounded-lg flex items-end justify-center">
                  <Badge variant="secondary" className="mb-2">↗ 15% MoM Growth</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farmer Income vs Platform Cost */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800" data-testid="card-affordability-index">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Affordability Index</CardTitle>
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {economicsData.stateStats.slice(0, 2).map((state: any) => (
                <div key={state.state} data-testid={`affordability-${state.state.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{state.state}</span>
                    <Badge variant="outline" className="text-green-600 dark:text-green-400">
                      {state.affordabilityRatio.toFixed(1)}% of income
                    </Badge>
                  </div>
                  <Card className="border-border">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg. Annual Income</span>
                        <span className="font-semibold text-foreground">
                          {formatIndianCurrency(state.avgIncome)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Platform Cost</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {formatIndianCurrency(state.avgSubscriptionCost * 12)}/year
                        </span>
                      </div>
                      <div className="mt-2 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 rounded-full h-2 transition-all duration-300" 
                          style={{ width: `${Math.min(state.affordabilityRatio, 100)}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Landmark Data Integration */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800" data-testid="card-government-data">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Landmark Data</CardTitle>
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Landmark className="text-white h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Latest MSP (Wheat)</div>
                  <div className="text-lg font-bold text-foreground" data-testid="msp-wheat">
                    {formatIndianCurrency(economicsData.government.msp.wheat)}/quintal
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">↗ 5.4% from last year</div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Agriculture GVA Growth</div>
                  <div className="text-lg font-bold text-foreground" data-testid="gva-growth">
                    {economicsData.government.gvaGrowth}%
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Source: Economic Survey 2024</div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">PM-KISAN Beneficiaries</div>
                  <div className="text-lg font-bold text-foreground" data-testid="pm-kisan-beneficiaries">
                    {formatIndianNumber(economicsData.government.pmKisanBeneficiaries)}
                  </div>
                  <div className="text-xs text-muted-foreground">Eligible for 20% discount</div>
                </CardContent>
              </Card>

              {/* Data Source Disclaimer */}
              <Card className="bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3">
                  <div className="text-xs text-blue-800 dark:text-blue-200 flex items-start space-x-2">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Data sourced from Ministry of Agriculture, Economic Survey 2024, and State Agricultural Statistics
                    </span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Summary */}
        <Card className="mt-12 bg-muted/50" data-testid="card-impact-summary">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Platform Impact Summary</h3>
              <p className="text-muted-foreground">Our commitment to fair, data-driven agricultural economics</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center" data-testid="impact-farmers">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatIndianNumber(economicsData.platform.totalFarmers)}+
                </div>
                <div className="text-sm text-muted-foreground">Farmers Empowered</div>
              </div>
              <div className="text-center" data-testid="impact-acres">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {formatIndianNumber(economicsData.platform.totalAcresListed)}
                </div>
                <div className="text-sm text-muted-foreground">Acres Connected</div>
              </div>
              <div className="text-center" data-testid="impact-affordability">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {economicsData.affordability.avgCostIncomeRatio.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg. Cost/Income Ratio</div>
              </div>
              <div className="text-center" data-testid="impact-satisfaction">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {economicsData.affordability.farmerSatisfaction}%
                </div>
                <div className="text-sm text-muted-foreground">Farmer Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
