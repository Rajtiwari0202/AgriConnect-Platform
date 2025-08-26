import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatIndianCurrency } from "@/lib/indian-format";
import { STATES, CROPS } from "@/lib/pricing";
import { Bus, Home, Calculator, Info } from "lucide-react";
import Header from "@/components/header";
import { z } from "zod";

const authSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<"farmer" | "landowner">("farmer");
  const [isLogin, setIsLogin] = useState(false);
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      role: "farmer",
      state: "",
      district: "",
      farmingExperience: "",
      preferredCrops: [],
      isPmKisanBeneficiary: false,
      isFpoMember: false,
    },
  });

  const selectedState = form.watch("state");
  const isPmKisanBeneficiary = form.watch("isPmKisanBeneficiary");
  const isFpoMember = form.watch("isFpoMember");

  // Fetch pricing for selected state
  const { data: pricingPlans } = useQuery({
    queryKey: ["/api/pricing", selectedState],
    enabled: !!selectedState,
  });

  // Calculate pricing with discounts
  const { data: pricingCalculation } = useQuery({
    queryKey: ["/api/pricing/calculate", {
      state: selectedState,
      tier: "standard",
      isPmKisanBeneficiary,
      isFpoMember
    }],
    enabled: !!selectedState,
  });

  const registerMutation = useMutation({
    mutationFn: (data: Omit<AuthFormData, "confirmPassword">) => 
      apiRequest("POST", "/api/auth/register", data),
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });
      setIsLogin(true);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => 
      apiRequest("POST", "/api/auth/login", data),
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome back to KrishiConnect!",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthFormData) => {
    if (isLogin) {
      loginMutation.mutate({
        email: data.email,
        password: data.password,
      });
    } else {
      const { confirmPassword, ...submitData } = data;
      submitData.role = selectedRole;
      registerMutation.mutate(submitData);
    }
  };

  const handleGoogleAuth = () => {
    toast({
      title: "Google Authentication",
      description: "Google OAuth integration will be implemented here.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-muted/30 to-primary/5" data-testid="section-auth">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="heading-auth">
              {isLogin ? "Welcome Back to KrishiConnect" : "Join KrishiConnect Today"}
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="text-auth-description">
              {isLogin 
                ? "Sign in to access your agricultural partnerships" 
                : "Choose your role and start building agricultural partnerships"
              }
            </p>
          </div>

          {!isLogin && (
            /* Role Selection */
            <div className="flex justify-center mb-8">
              <div className="bg-background p-2 rounded-xl shadow-sm border border-border">
                <Button
                  variant={selectedRole === "farmer" ? "default" : "ghost"}
                  className="px-6 py-3 rounded-lg font-medium transition-all"
                  onClick={() => setSelectedRole("farmer")}
                  data-testid="button-role-farmer"
                >
                  <Bus className="mr-2 h-4 w-4" />
                  I'm a Farmer
                </Button>
                <Button
                  variant={selectedRole === "landowner" ? "default" : "ghost"}
                  className="px-6 py-3 rounded-lg font-medium transition-all"
                  onClick={() => setSelectedRole("landowner")}
                  data-testid="button-role-landowner"
                >
                  <Home className="mr-2 h-4 w-4" />
                  I'm a Landowner
                </Button>
              </div>
            </div>
          )}

          {/* Auth Form */}
          <Card className="shadow-xl border border-border" data-testid="card-auth-form">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                {isLogin ? "Sign In" : `${selectedRole === "farmer" ? "Farmer" : "Landowner"} Registration`}
              </CardTitle>
              <p className="text-muted-foreground">
                {isLogin 
                  ? "Enter your credentials to access your account"
                  : `Create your account and start connecting with ${selectedRole === "farmer" ? "landowners" : "farmers"}`
                }
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Login Form Fields */}
                  {isLogin ? (
                    <>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="your.email@example.com"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password" 
                                placeholder="Enter your password"
                                data-testid="input-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    /* Registration Form Fields */
                    <>
                      {/* Personal Information */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter your full name"
                                  data-testid="input-full-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="tel" 
                                  placeholder="+91 XXXXX XXXXX"
                                  data-testid="input-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Choose a username"
                                  data-testid="input-username"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="your.email@example.com"
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  placeholder="Create a password"
                                  data-testid="input-password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  placeholder="Confirm your password"
                                  data-testid="input-confirm-password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Location Information */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-state">
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select State" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label} ({state.hindi})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="district"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>District</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Enter your district"
                                  data-testid="input-district"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Farmer-specific fields */}
                      {selectedRole === "farmer" && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="farmingExperience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Farming Experience</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-experience">
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Experience" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="less-than-2">Less than 2 years</SelectItem>
                                      <SelectItem value="2-5">2-5 years</SelectItem>
                                      <SelectItem value="5-10">5-10 years</SelectItem>
                                      <SelectItem value="10-plus">10+ years</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="preferredCrops"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Preferred Crops</FormLabel>
                                  <Select onValueChange={(value) => field.onChange([...field.value, value])} data-testid="select-crops">
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Crops" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {CROPS.map((crop) => (
                                        <SelectItem key={crop} value={crop}>
                                          {crop}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                  {field.value.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {field.value.map((crop, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {crop}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Government Schemes */}
                          <div>
                            <Label className="text-sm font-medium text-foreground mb-3 block">
                              Government Scheme Benefits
                            </Label>
                            <div className="space-y-3">
                              <FormField
                                control={form.control}
                                name="isPmKisanBeneficiary"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="checkbox-pm-kisan"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm text-foreground">
                                        I am a PM-KISAN beneficiary (20% discount on subscription)
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="isFpoMember"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="checkbox-fpo-member"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm text-foreground">
                                        I am a member of FPO/Producer Company (Priority listing)
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Regional Pricing Display */}
                          {selectedState && pricingPlans && pricingCalculation && (
                            <Card className="bg-primary/5 border-primary/20" data-testid="card-pricing-estimate">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <Calculator className="text-primary h-4 w-4" />
                                  <h4 className="font-medium text-foreground">Your Estimated Subscription Cost</h4>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                  {pricingPlans.map((plan: any) => (
                                    <div key={plan.tier} className="text-center" data-testid={`pricing-${plan.tier}`}>
                                      <div className="font-semibold text-foreground capitalize">{plan.tier} Plan</div>
                                      <div className="text-2xl font-bold text-primary">
                                        {formatIndianCurrency(plan.pricePerMonth)}
                                      </div>
                                      <div className="text-muted-foreground">/month</div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 text-xs text-blue-700 dark:text-blue-300 flex items-start space-x-2">
                                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>
                                    Pricing based on {selectedState} agricultural income data. 
                                    {(isPmKisanBeneficiary || isFpoMember) && " Eligible for government scheme discounts."}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Submit Buttons */}
                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full py-4 text-lg font-semibold"
                      disabled={registerMutation.isPending || loginMutation.isPending}
                      data-testid="button-submit"
                    >
                      {registerMutation.isPending || loginMutation.isPending 
                        ? "Please wait..." 
                        : isLogin 
                          ? "Sign In" 
                          : `Create ${selectedRole === "farmer" ? "Farmer" : "Landowner"} Account`
                      }
                    </Button>
                    
                    {/* Social Login */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full py-3 font-medium"
                      onClick={handleGoogleAuth}
                      data-testid="button-google-auth"
                    >
                      <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>

                    {/* Toggle between login and register */}
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setIsLogin(!isLogin)}
                        data-testid="button-toggle-auth"
                      >
                        {isLogin 
                          ? "Don't have an account? Sign up" 
                          : "Already have an account? Sign in"
                        }
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
