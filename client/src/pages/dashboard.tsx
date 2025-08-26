import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import EconomicDashboard from "@/components/economic-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatIndianCurrency, formatAcres } from "@/lib/indian-format";
import { BarChart3, Users, MapPin, Calendar, MessageSquare, TrendingUp, FileText, Settings } from "lucide-react";

// Mock user data - in real app, this would come from auth context
const mockUser = {
  id: "user123",
  role: "farmer",
  fullName: "Rajesh Kumar",
  state: "Punjab",
  subscriptionTier: "standard",
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's rental requests
  const { data: rentalRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/rental-requests/farmer", mockUser.id],
    enabled: mockUser.role === "farmer",
  });

  // Fetch user's listings (for landowners)
  const { data: userListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["/api/listings", { ownerId: mockUser.id }],
    enabled: mockUser.role === "landowner",
  });

  // Fetch user's transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions", mockUser.id],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2" data-testid="heading-dashboard">
            Welcome back, {mockUser.fullName}
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-dashboard-description">
            Manage your agricultural partnerships and track your activities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-active-requests">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Requests</p>
                  <p className="text-2xl font-bold text-foreground">
                    {rentalRequests?.filter((r: any) => r.status === "pending").length || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-approved-partnerships">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Partnerships</p>
                  <p className="text-2xl font-bold text-foreground">
                    {rentalRequests?.filter((r: any) => r.status === "approved").length || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-acres">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Acres</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockUser.role === "farmer" ? "45" : "120"}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-subscription">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <p className="text-2xl font-bold text-foreground capitalize">
                    {mockUser.subscriptionTier}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="tabs-dashboard">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              {mockUser.role === "farmer" ? "My Requests" : "Incoming Requests"}
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card data-testid="card-recent-activity">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Rental request submitted", time: "2 hours ago", type: "request" },
                      { action: "Message from landowner", time: "1 day ago", type: "message" },
                      { action: "Subscription payment processed", time: "3 days ago", type: "payment" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card data-testid="card-quick-actions">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-browse-properties">
                    <MapPin className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-view-messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Messages
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-upgrade-subscription">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Upgrade Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card data-testid="card-rental-requests">
              <CardHeader>
                <CardTitle>
                  {mockUser.role === "farmer" ? "My Rental Requests" : "Incoming Rental Requests"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse p-4 border rounded-lg">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : rentalRequests && rentalRequests.length > 0 ? (
                  <div className="space-y-4">
                    {rentalRequests.map((request: any) => (
                      <div key={request.id} className="p-4 border border-border rounded-lg" data-testid={`request-${request.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">Request #{request.id.slice(-6)}</h4>
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.message || "No message provided"}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Duration: {request.proposedDuration || "N/A"} months
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rental requests found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card data-testid="card-transactions">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse p-4 border rounded-lg">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="p-4 border border-border rounded-lg" data-testid={`transaction-${transaction.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground capitalize">
                            {transaction.type}
                          </h4>
                          <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground font-medium">
                            {formatIndianCurrency(transaction.amount)}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <EconomicDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
