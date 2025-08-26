import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatIndianCurrency, formatAcres } from "@/lib/indian-format";
import { MapPin, User } from "lucide-react";
import type { LandListing } from "@shared/schema";

interface PropertyCardProps {
  listing: LandListing & {
    owner?: {
      id: string;
      fullName: string;
      phone: string;
    };
  };
  onRequestRent?: (listingId: string) => void;
}

export default function PropertyCard({ listing, onRequestRent }: PropertyCardProps) {
  const handleRequestRent = () => {
    onRequestRent?.(listing.id);
  };

  const getStatusBadgeColor = () => {
    if (listing.isVerified) return "default";
    return "secondary";
  };

  const getStatusBadgeText = () => {
    if (listing.isVerified) return "Verified";
    return "New Listing";
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow overflow-hidden" data-testid={`property-card-${listing.id}`}>
      {/* Property Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid="img-property"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🌾</div>
              <div className="text-sm">Agricultural Land</div>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant={getStatusBadgeColor()} data-testid="badge-status">
            {getStatusBadgeText()}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground" data-testid="text-location">
            <MapPin className="mr-1 h-3 w-3" />
            {listing.district}, {listing.state}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-title">
          {listing.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid="text-description">
          {listing.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-muted rounded-lg" data-testid="stat-size">
            <div className="text-lg font-semibold text-foreground">
              {formatAcres(listing.sizeInAcres)}
            </div>
            <div className="text-sm text-muted-foreground">Acres</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg" data-testid="stat-soil">
            <div className="text-lg font-semibold text-foreground">
              {listing.soilType}
            </div>
            <div className="text-sm text-muted-foreground">Soil Type</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div data-testid="pricing-rent">
            <div className="text-2xl font-bold text-primary">
              {formatIndianCurrency(listing.rentPerAcrePerMonth)}
            </div>
            <div className="text-sm text-muted-foreground">per acre/month</div>
          </div>
          <div className="text-right" data-testid="pricing-deposit">
            <div className="text-sm text-muted-foreground">Security Deposit</div>
            <div className="font-semibold text-foreground">
              {formatIndianCurrency(listing.securityDeposit)}
            </div>
          </div>
        </div>

        {/* Suitable Crops */}
        {listing.suitableCrops && listing.suitableCrops.length > 0 && (
          <div className="mb-4" data-testid="suitable-crops">
            <div className="text-sm text-muted-foreground mb-2">Suitable Crops</div>
            <div className="flex flex-wrap gap-1">
              {listing.suitableCrops.slice(0, 3).map((crop, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {crop}
                </Badge>
              ))}
              {listing.suitableCrops.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.suitableCrops.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Landowner Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="text-muted-foreground text-sm h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm" data-testid="text-owner-name">
                {listing.owner?.fullName || "Landowner"}
              </div>
              <div className="text-xs text-muted-foreground">Landowner</div>
            </div>
          </div>
          <Button 
            onClick={handleRequestRent}
            size="sm"
            data-testid="button-request-rent"
          >
            Request to Rent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
