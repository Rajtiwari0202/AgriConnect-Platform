import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Filter, ExternalLink, Phone, Calendar, FileText, 
  Users, DollarSign, Shield, GraduationCap, Target,
  CheckCircle, AlertCircle, Clock
} from "lucide-react";
import Header from "@/components/header";
import { GOVERNMENT_SCHEMES, schemeUtils, type GovernmentScheme } from "@shared/government-schemes";

export default function Schemes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredSchemes, setFilteredSchemes] = useState<GovernmentScheme[]>(GOVERNMENT_SCHEMES);

  // Filter schemes based on search and category
  React.useEffect(() => {
    let filtered = GOVERNMENT_SCHEMES;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = schemeUtils.getSchemesByCategory(selectedCategory as GovernmentScheme['category']);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = schemeUtils.searchSchemes(searchQuery);
    }

    // Only show active schemes
    filtered = filtered.filter(scheme => scheme.isActive);

    setFilteredSchemes(filtered);
  }, [searchQuery, selectedCategory]);

  const getCategoryIcon = (category: GovernmentScheme['category']) => {
    const icons = {
      income_support: <DollarSign className="w-5 h-5" />,
      credit: <Target className="w-5 h-5" />,
      insurance: <Shield className="w-5 h-5" />,
      subsidy: <CheckCircle className="w-5 h-5" />,
      training: <GraduationCap className="w-5 h-5" />,
    };
    return icons[category];
  };

  const getCategoryColor = (category: GovernmentScheme['category']) => {
    const colors = {
      income_support: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      credit: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      insurance: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      subsidy: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      training: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };
    return colors[category];
  };

  const getUrgencyIndicator = (deadline?: string) => {
    if (!deadline) return null;
    
    // Simple deadline checking (in real app, this would be more sophisticated)
    const hasUrgentDeadline = deadline.includes("July 31") || deadline.includes("December 31");
    
    if (hasUrgentDeadline) {
      return (
        <div className="flex items-center text-red-600 text-xs mt-2">
          <Clock className="w-3 h-3 mr-1" />
          Deadline: {deadline}
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-yellow-600 text-xs mt-2">
        <Calendar className="w-3 h-3 mr-1" />
        {deadline}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-schemes-title">
            Government Schemes & Support
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-schemes-description">
            Discover and apply for government schemes designed to support farmers and agricultural development
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8" data-testid="card-search-filter">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search schemes by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-schemes"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="select-category-filter">
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="income_support">Income Support</SelectItem>
                  <SelectItem value="credit">Credit & Loans</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="subsidy">Subsidies</SelectItem>
                  <SelectItem value="training">Training & Capacity Building</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              Found {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} 
              {selectedCategory !== "all" && ` in ${schemeUtils.getCategoryName(selectedCategory as GovernmentScheme['category'])}`}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(['all', 'income_support', 'credit', 'insurance', 'subsidy', 'training'] as const).map((category) => {
            const count = category === 'all' 
              ? GOVERNMENT_SCHEMES.filter(s => s.isActive).length
              : schemeUtils.getSchemesByCategory(category).filter(s => s.isActive).length;
            
            return (
              <Card 
                key={category}
                className={`cursor-pointer transition-colors ${selectedCategory === category ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedCategory(category)}
                data-testid={`card-category-${category}`}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">
                    {category === 'all' ? 'Total Schemes' : schemeUtils.getCategoryName(category as GovernmentScheme['category'])}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Schemes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="hover:shadow-lg transition-shadow" data-testid={`card-scheme-${scheme.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(scheme.category)}
                    <Badge className={getCategoryColor(scheme.category)}>
                      {schemeUtils.getCategoryName(scheme.category)}
                    </Badge>
                  </div>
                  {scheme.deadline && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                
                <CardTitle className="text-lg leading-tight">{scheme.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{scheme.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Benefits</h4>
                  <p className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    {scheme.benefits}
                  </p>
                </div>

                {/* Key Eligibility */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Key Eligibility</h4>
                  <ul className="text-xs space-y-1">
                    {scheme.eligibility.slice(0, 3).map((criteria, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                    {scheme.eligibility.length > 3 && (
                      <li className="text-muted-foreground">+{scheme.eligibility.length - 3} more criteria</li>
                    )}
                  </ul>
                </div>

                {/* Documents Required */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    Documents Required
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {scheme.documents.slice(0, 3).map((doc, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                    {scheme.documents.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{scheme.documents.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Deadline Warning */}
                {getUrgencyIndicator(scheme.deadline)}

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => window.open(scheme.officialLink, '_blank')}
                    data-testid={`button-apply-${scheme.id}`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Online
                  </Button>
                  
                  {scheme.contactNumber && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(`tel:${scheme.contactNumber}`, '_self')}
                      data-testid={`button-contact-${scheme.id}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {scheme.contactNumber}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSchemes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No schemes found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or selecting a different category
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Information Footer */}
        <Card className="mt-8" data-testid="card-info-footer">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">How to Apply</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Review eligibility criteria carefully</li>
                  <li>Gather all required documents</li>
                  <li>Visit the official website or nearest center</li>
                  <li>Fill the application form completely</li>
                  <li>Submit with required documents</li>
                  <li>Keep application receipt for tracking</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Need Help?</h4>
                <div className="text-sm space-y-2">
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Farmer Helpline: 1800-180-1551
                  </p>
                  <p className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Visit your nearest Common Service Center (CSC)
                  </p>
                  <p className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Contact local Agriculture Extension Officer
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    💡 <strong>Pro Tip:</strong> Many schemes have specific enrollment periods. 
                    Check deadlines regularly and apply early to avoid last-minute rush.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}