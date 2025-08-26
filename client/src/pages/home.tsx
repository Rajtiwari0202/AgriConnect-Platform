import Header from "@/components/header";
import Hero from "@/components/hero";
import PricingCalculator from "@/components/pricing-calculator";
import PropertyCard from "@/components/property-card";
import EconomicDashboard from "@/components/economic-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sprout, Shield, Award, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Home() {
  // Fetch sample listings for homepage
  const { data: listings, isLoading } = useQuery({
    queryKey: ["/api/listings"],
  });

  const sampleListings = listings?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Regional Pricing Section */}
      <PricingCalculator />
      
      {/* Land Listings Section */}
      <section className="py-16 bg-muted/30" data-testid="section-land-listings">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="heading-available-land">
                Available Agricultural Land
              </h2>
              <p className="text-xl text-muted-foreground" data-testid="text-verified-properties">
                Verified properties ready for farming partnerships
              </p>
            </div>
            <Link href="/listings">
              <Button data-testid="button-view-all-properties">
                View All Properties
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-8" data-testid="card-filters">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">State</label>
                  <select className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary" data-testid="select-state">
                    <option>All States</option>
                    <option>Punjab</option>
                    <option>Bihar</option>
                    <option>Uttar Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Crop Type</label>
                  <select className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary" data-testid="select-crop">
                    <option>Any Crop</option>
                    <option>Wheat</option>
                    <option>Rice</option>
                    <option>Sugarcane</option>
                    <option>Cotton</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Land Size</label>
                  <select className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary" data-testid="select-size">
                    <option>Any Size</option>
                    <option>1-5 Acres</option>
                    <option>5-10 Acres</option>
                    <option>10+ Acres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Budget</label>
                  <select className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary" data-testid="select-budget">
                    <option>Any Budget</option>
                    <option>Under ₹2,000/acre</option>
                    <option>₹2,000-5,000/acre</option>
                    <option>₹5,000+/acre</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-properties">
              {sampleListings.length > 0 ? (
                sampleListings.map((listing: any) => (
                  <PropertyCard 
                    key={listing.id} 
                    listing={listing}
                    onRequestRent={(listingId) => {
                      // TODO: Implement rental request flow
                      console.log('Request rent for listing:', listingId);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-muted-foreground">
                    No properties available at the moment. Check back soon!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Economic Dashboard */}
      <EconomicDashboard />
      
      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12" data-testid="footer-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sprout className="text-primary-foreground text-lg" />
                </div>
                <div>
                  <div className="text-xl font-bold">KrishiConnect</div>
                  <div className="text-sm text-muted-foreground">कृषि कनेक्ट</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Taking care of agricultural roots back home. Connecting farmers and landowners 
                across India with fair, transparent partnerships.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-linkedin">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listings" className="text-muted-foreground hover:text-foreground transition-colors">Find Land</Link></li>
                <li><Link href="/list-property" className="text-muted-foreground hover:text-foreground transition-colors">List Property</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing Plans</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Success Stories</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* Government & Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal & Compliance</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Refund Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Government Schemes</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Data Protection</a></li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="font-semibold mb-4">Contact & Support</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">1800-123-KRISHI</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-primary h-4 w-4" />
                  <span className="text-muted-foreground">support@krishiconnect.in</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="text-primary h-4 w-4 mt-1" />
                  <span className="text-muted-foreground">
                    Agricultural Innovation Hub<br />
                    New Delhi, India 110001
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 KrishiConnect. All rights reserved. | Reg. No: U74999DL2024PTC123456
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="text-green-500 h-4 w-4" />
                <span className="text-muted-foreground">Secured by Stripe</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="text-orange-500 h-4 w-4" />
                <span className="text-muted-foreground">Government Verified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
