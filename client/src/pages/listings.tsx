import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { STATES, CROPS, SOIL_TYPES, IRRIGATION_TYPES } from "@/lib/pricing";
import { Search, Filter, MapPin } from "lucide-react";

export default function Listings() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    state: "all",
    cropType: "all", 
    minSize: "",
    maxSize: "",
    maxRent: "",
    soilType: "all",
    irrigationType: "all",
  });

  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.set(key, value);
  });

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["/api/listings", queryParams.toString()],
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      state: "all",
      cropType: "all",
      minSize: "",
      maxSize: "",
      maxRent: "",
      soilType: "all",
      irrigationType: "all",
    });
  };

  const handleRequestRent = (listingId: string) => {
    toast({
      title: "Request Sent",
      description: "Your rental request has been sent to the landowner. They will contact you soon.",
    });
    // TODO: Implement actual rental request logic
    console.log("Request rent for listing:", listingId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="heading-listings">
            Find Agricultural Land
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-listings-description">
            Discover verified properties ready for farming partnerships across India
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8" data-testid="card-filters">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filter Properties
              </h3>
              <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)} data-testid="select-filter-state">
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cropType">Crop Type</Label>
                <Select value={filters.cropType} onValueChange={(value) => handleFilterChange("cropType", value)} data-testid="select-filter-crop">
                  <SelectTrigger>
                    <SelectValue placeholder="Any Crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Crop</SelectItem>
                    {CROPS.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="soilType">Soil Type</Label>
                <Select value={filters.soilType} onValueChange={(value) => handleFilterChange("soilType", value)} data-testid="select-filter-soil">
                  <SelectTrigger>
                    <SelectValue placeholder="Any Soil Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Soil Type</SelectItem>
                    {SOIL_TYPES.map((soil) => (
                      <SelectItem key={soil} value={soil}>
                        {soil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="irrigationType">Irrigation</Label>
                <Select value={filters.irrigationType} onValueChange={(value) => handleFilterChange("irrigationType", value)} data-testid="select-filter-irrigation">
                  <SelectTrigger>
                    <SelectValue placeholder="Any Irrigation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Irrigation</SelectItem>
                    {IRRIGATION_TYPES.map((irrigation) => (
                      <SelectItem key={irrigation} value={irrigation}>
                        {irrigation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minSize">Min Size (Acres)</Label>
                <Input 
                  id="minSize"
                  type="number" 
                  placeholder="0"
                  value={filters.minSize}
                  onChange={(e) => handleFilterChange("minSize", e.target.value)}
                  data-testid="input-min-size"
                />
              </div>

              <div>
                <Label htmlFor="maxSize">Max Size (Acres)</Label>
                <Input 
                  id="maxSize"
                  type="number" 
                  placeholder="Any"
                  value={filters.maxSize}
                  onChange={(e) => handleFilterChange("maxSize", e.target.value)}
                  data-testid="input-max-size"
                />
              </div>

              <div>
                <Label htmlFor="maxRent">Max Rent/Acre/Month (₹)</Label>
                <Input 
                  id="maxRent"
                  type="number" 
                  placeholder="Any"
                  value={filters.maxRent}
                  onChange={(e) => handleFilterChange("maxRent", e.target.value)}
                  data-testid="input-max-rent"
                />
              </div>

              <div className="flex items-end">
                <Button className="w-full" data-testid="button-search">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span data-testid="text-results-count">
              {isLoading ? "Loading..." : `${listings?.length || 0} properties found`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-xl"></div>
                <div className="p-6 space-y-4 bg-background border border-border rounded-b-xl">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-destructive mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to Load Listings</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                We couldn't fetch the property listings. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-listings">
            {listings && listings.length > 0 ? (
              listings.map((listing: any) => (
                <PropertyCard 
                  key={listing.id} 
                  listing={listing}
                  onRequestRent={handleRequestRent}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-muted-foreground mb-4">
                      <Search className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No Properties Found</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No properties match your current filters. Try adjusting your search criteria.
                    </p>
                    <Button onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
