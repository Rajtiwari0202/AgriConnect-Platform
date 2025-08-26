import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Plus, Handshake, IndianRupee } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-20 overflow-hidden" data-testid="section-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-connecting">
                <span className="mr-2">🌿</span>
                Connecting Agriculture Communities
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight" data-testid="heading-main">
                Bridge the Gap Between{" "}
                <span className="text-primary">Farmers</span> &{" "}
                <span className="text-orange-600">Landowners</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-description">
                Taking care of agricultural roots back home. Connect with verified landowners, 
                secure fair agreements, and grow your farming business with transparent, 
                region-based pricing.
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground" data-testid="text-availability">
                <span>📍</span>
                <span>Available across Punjab, Bihar, UP, and 15+ states</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/listings">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-lg px-8 py-4"
                  data-testid="button-find-land"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find Land to Rent
                </Button>
              </Link>
              <Link href="/list-property">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto text-lg px-8 py-4"
                  data-testid="button-list-property"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  List My Property
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div className="text-center" data-testid="stat-farmers">
                <div className="text-2xl font-bold text-foreground">15,000+</div>
                <div className="text-sm text-muted-foreground">Active Farmers</div>
              </div>
              <div className="text-center" data-testid="stat-acres">
                <div className="text-2xl font-bold text-foreground">2,50,000</div>
                <div className="text-sm text-muted-foreground">Acres Listed</div>
              </div>
              <div className="text-center" data-testid="stat-states">
                <div className="text-2xl font-bold text-foreground">18</div>
                <div className="text-sm text-muted-foreground">States Covered</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600" 
              alt="Indian farmers working in green agricultural fields" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-hero"
            />
            
            {/* Floating Cards */}
            <div className="absolute -bottom-4 -left-4 bg-background rounded-xl shadow-lg p-4 max-w-xs border" data-testid="card-agreement">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Handshake className="text-primary h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Agreement Secured</div>
                  <div className="text-sm text-muted-foreground">5 acres in Punjab</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-background rounded-xl shadow-lg p-4 max-w-xs border" data-testid="card-pricing">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <IndianRupee className="text-orange-600 h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Fair Pricing</div>
                  <div className="text-sm text-muted-foreground">₹2,500/acre/month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
