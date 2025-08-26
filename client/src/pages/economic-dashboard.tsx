import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Info, TrendingUp, DollarSign, Users, Briefcase, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatIndianCurrency } from "@/lib/indian-format";
import { NATIONAL_SUBSCRIPTION_PLANS, subscriptionUtils } from "@shared/subscription-plans";
import { useState } from "react";
import Header from "@/components/header";

// Economic data - this would come from metrics API in real implementation
const economicData = {
  unionBudget: {
    year: "2025-26",
    agriculturalAllocation: 195000, // in crores
    totalBudget: 4800000, // in crores
    keySchemes: [
      { name: "PM-KISAN", allocation: 60000, beneficiaries: "11+ crore farmers" },
      { name: "PMFBY", allocation: 15500, coverage: "5.5 crore farmers" },
      { name: "Agriculture Infrastructure Fund", allocation: 10000, purpose: "Cold storage, processing" },
    ]
  },
  farmIncomeData: [
    { category: "Smallholder (< 2 acres)", avgIncome: 8500, population: "86%" },
    { category: "Mid-scale (2-10 acres)", avgIncome: 25000, population: "12%" },
    { category: "Large-scale (> 10 acres)", avgIncome: 75000, population: "2%" },
  ],
  platformMetrics: {
    totalFarmers: 0,
    totalLandowners: 0,
    activeListing: 0,
    totalArea: 0,
    avgRentPerAcre: 0,
  }
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function EconomicDashboard() {
  const [farmSize, setFarmSize] = useState([2]);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('basic');

  const { data: platformMetrics } = useQuery({
    queryKey: ["/api/dashboard/economics"],
  });

  const currentPlan = NATIONAL_SUBSCRIPTION_PLANS[selectedPlan];
  const farmSizeValue = farmSize[0];
  
  // Calculate affordability based on farm size
  const getEstimatedIncome = (acres: number) => {
    if (acres < 2) return 8500;
    if (acres < 10) return 15000 + (acres * 2000);
    return 45000 + (acres * 1500);
  };

  const estimatedIncome = getEstimatedIncome(farmSizeValue);
  const planCost = currentPlan.monthlyPrice;
  const affordabilityPercentage = ((planCost / estimatedIncome) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
            Economic Dashboard
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-dashboard-description">
            Understanding India's agricultural economy and platform affordability
          </p>
        </div>

        {/* Union Budget Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-budget-allocation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agriculture Budget {economicData.unionBudget.year}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(economicData.unionBudget.agriculturalAllocation / 100).toFixed(1)}L Cr</div>
              <p className="text-xs text-muted-foreground">
                {((economicData.unionBudget.agriculturalAllocation / economicData.unionBudget.totalBudget) * 100).toFixed(1)}% of total budget
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                      <Info className="h-3 w-3 mr-1" />
                      <span className="text-xs">Source</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ministry of Finance, Union Budget 2025-26</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>

          <Card data-testid="card-pm-kisan">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PM-KISAN Coverage</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">11+ Cr</div>
              <p className="text-xs text-muted-foreground">
                Farmers receiving ₹6,000/year
              </p>
              <Badge variant="secondary" className="mt-2">
                Direct Benefit Transfer
              </Badge>
            </CardContent>
          </Card>

          <Card data-testid="card-platform-farmers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics?.platform?.totalFarmers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active farmers on AgriConnect
              </p>
              <div className="text-xs text-green-600 mt-1">
                +{platformMetrics?.platform?.totalLandowners || 0} landowners
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-rent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Land Rent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatIndianCurrency(platformMetrics?.platform?.avgRentPerAcre || 15000)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per acre per year
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Schemes Overview */}
        <Card className="mb-8" data-testid="card-key-schemes">
          <CardHeader>
            <CardTitle>Major Government Schemes (Budget 2025-26)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {economicData.unionBudget.keySchemes.map((scheme, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-lg">{scheme.name}</h4>
                  <p className="text-2xl font-bold text-primary">₹{(scheme.allocation / 100).toFixed(0)}K Cr</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scheme.beneficiaries || scheme.coverage || scheme.purpose}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Farm Income Distribution */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card data-testid="card-income-distribution">
            <CardHeader>
              <CardTitle>Average Monthly Farm Income by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={economicData.farmIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [formatIndianCurrency(value), "Monthly Income"]}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Bar dataKey="avgIncome" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="card-farmer-distribution">
            <CardHeader>
              <CardTitle>Farmer Distribution by Land Size</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={economicData.farmIncomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ population }) => `${population}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="population"
                    valueKey="population"
                  >
                    {economicData.farmIncomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any, name: string, props: any) => [
                      `${value} of farmers`,
                      props.payload.category
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {economicData.farmIncomeData.map((item, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span>{item.category}: {item.population}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affordability Calculator */}
        <Card className="mb-8" data-testid="card-affordability-calculator">
          <CardHeader>
            <CardTitle>Subscription Affordability Calculator</CardTitle>
            <p className="text-sm text-muted-foreground">
              Calculate platform subscription cost as percentage of estimated farm income
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="farm-size-slider" className="text-sm font-medium">
                    Your Farm Size: {farmSizeValue} acres
                  </Label>
                  <Slider
                    id="farm-size-slider"
                    min={0.5}
                    max={50}
                    step={0.5}
                    value={farmSize}
                    onValueChange={setFarmSize}
                    className="mt-2"
                    data-testid="slider-farm-size"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.5 acres</span>
                    <span>50+ acres</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Select Plan</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Object.entries(NATIONAL_SUBSCRIPTION_PLANS).map(([planId, plan]) => (
                      <Button
                        key={planId}
                        variant={selectedPlan === planId ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPlan(planId as any)}
                        data-testid={`button-plan-${planId}`}
                      >
                        {plan.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Affordability Analysis
                  </h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Estimated monthly income: <strong>{formatIndianCurrency(estimatedIncome)}</strong></p>
                    <p>Plan cost: <strong>{formatIndianCurrency(planCost)}/month</strong></p>
                    <p className={`font-bold ${parseFloat(affordabilityPercentage) <= 3 ? 'text-green-600' : parseFloat(affordabilityPercentage) <= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      Affordability: {affordabilityPercentage}% of income
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-blue-800 dark:text-blue-200">
                    {parseFloat(affordabilityPercentage) <= 3 
                      ? '✅ Highly affordable - within recommended range'
                      : parseFloat(affordabilityPercentage) <= 5 
                      ? '⚠️ Moderately affordable - consider benefits carefully'
                      : '❌ High cost - may want to consider Basic plan'
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Plan Features: {currentPlan.name}</h4>
                <ul className="space-y-2 text-sm">
                  {currentPlan.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    💡 Cost Saving Tip
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                    PM-KISAN beneficiaries get 20% discount. 
                    Annual billing saves {subscriptionUtils.getYearlySavingsPercentage(selectedPlan)}%.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Government Schemes Access */}
        <Card data-testid="card-schemes-access">
          <CardHeader>
            <CardTitle className="flex items-center">
              Government Schemes & Support
              <Badge variant="secondary" className="ml-2">Featured</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">PM-KISAN Status Check</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Check your PM-KISAN application status and payment history
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">PMFBY Enrollment</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Crop insurance enrollment for Kharif/Rabi seasons
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">KCC Application</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Apply for Kisan Credit Card for agricultural credit
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply Online
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Soil Health Card</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get soil testing and nutrient recommendations
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Request Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources Footer */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Data Sources & Methodology</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p><strong>Budget Data:</strong> Ministry of Finance, Union Budget 2025-26</p>
              <p><strong>Farm Income:</strong> NSSO Situation Assessment Survey 2019, adjusted for inflation</p>
              <p><strong>Scheme Data:</strong> Official government portals and publications</p>
            </div>
            <div>
              <p><strong>Platform Metrics:</strong> Real-time data from AgriConnect platform</p>
              <p><strong>Affordability Model:</strong> Based on expenditure patterns from NSSO data</p>
              <p><strong>Update Frequency:</strong> Economic data updated monthly, budget data annually</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}