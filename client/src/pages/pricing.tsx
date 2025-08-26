import { useState } from "react";
import Header from "@/components/header";
import PricingCalculator from "@/components/pricing-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calculator, Award, Shield, TrendingUp } from "lucide-react";
import { formatIndianCurrency } from "@/lib/indian-format";
import { getPlanFeatures } from "@/lib/pricing";
import { Link } from "wouter";

export default function Pricing() {
  const [selectedState, setSelectedState] = useState("Punjab");

  const governmentBenefits = [
    {
      icon: Award,
      title: "PM-KISAN Integration",
      description: "20% discount for PM-KISAN beneficiaries",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "FPO Priority",
      description: "Priority listing for FPO/Producer Company members",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      title: "MSP Linked",
      description: "Pricing aligned with Minimum Support Price data",
      color: "text-orange-600"
    },
    {
      icon: Calculator,
      title: "Regional Fairness",
      description: "State-wise pricing based on agricultural income",
      color: "text-purple-600"
    }
  ];

  const faqItems = [
    {
      question: "How is regional pricing calculated?",
      answer: "Our pricing is based on comprehensive data from the Ministry of Agriculture, including state-wise crop income, MSP data, regional GDP, and agricultural productivity indices. This ensures that subscription costs remain affordable relative to local farming income."
    },
    {
      question: "What government schemes are integrated?",
      answer: "We integrate with PM-KISAN for beneficiary discounts, FPO registrations for priority services, Soil Health Card data for better matching, and link pricing to current MSP rates for transparency."
    },
    {
      question: "Can I change my subscription plan?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major payment methods through Stripe India including UPI, Net Banking, Credit/Debit Cards, and wallet payments for maximum convenience."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service within the first month, we'll provide a full refund."
    },
    {
      question: "How do transaction commissions work?",
      answer: "We charge a small commission (5-10%) only on successful land rental agreements to keep the platform sustainable. This is clearly disclosed in our Terms & Conditions."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5" data-testid="section-pricing-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6" data-testid="heading-pricing">
            Fair & Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-pricing-description">
            Our subscription model is designed with Indian farmers in mind. 
            Pricing varies by state to ensure affordability based on local agricultural income.
          </p>
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Calculator className="mr-2 h-4 w-4" />
            Pricing based on government agricultural data
          </div>
        </div>
      </section>

      {/* Interactive Pricing Calculator */}
      <PricingCalculator selectedState={selectedState} onStateChange={setSelectedState} />

      {/* Plan Comparison */}
      <section className="py-16 bg-muted/30" data-testid="section-plan-comparison">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Compare All Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that best fits your agricultural needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {["basic", "standard", "premium"].map((tier) => (
              <Card key={tier} className={`relative ${tier === "standard" ? "border-primary scale-105" : ""}`} data-testid={`plan-${tier}`}>
                {tier === "standard" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold capitalize">{tier} Plan</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {tier === "basic" && "₹899"}
                    {tier === "standard" && "₹1,299"}
                    {tier === "premium" && "₹1,799"}
                  </div>
                  <p className="text-muted-foreground">per month*</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {getPlanFeatures(tier as any).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth">
                    <Button 
                      className="w-full" 
                      variant={tier === "standard" ? "default" : "outline"}
                      data-testid={`button-select-${tier}`}
                    >
                      Select {tier} Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            * Prices shown for Punjab. Actual pricing varies by state based on agricultural income data.
          </div>
        </div>
      </section>

      {/* Government Benefits */}
      <section className="py-16 bg-background" data-testid="section-government-benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Government Scheme Integration
            </h2>
            <p className="text-xl text-muted-foreground">
              Benefit from government agricultural initiatives and policies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {governmentBenefits.map((benefit, index) => (
              <Card key={index} className="text-center" data-testid={`benefit-${index}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center`}>
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30" data-testid="section-faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing and policies
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <Card key={index} data-testid={`faq-${index}`}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">{item.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground" data-testid="section-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of farmers and landowners building successful agricultural partnerships
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="px-8" data-testid="button-start-free">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-primary" data-testid="button-browse-listings">
                Browse Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
