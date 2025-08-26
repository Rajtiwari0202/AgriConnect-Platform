import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertLandListingSchema, insertRentalRequestSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe only if secret key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
} else {
  console.warn('Stripe not initialized - STRIPE_SECRET_KEY not found. Payment features will be disabled.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role,
          fullName: user.fullName,
          state: user.state,
          district: user.district
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role,
          fullName: user.fullName,
          state: user.state,
          district: user.district,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Subscription pricing routes
  app.get("/api/pricing/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const plans = await storage.getSubscriptionPlansByState(state);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Calculate pricing with discounts
  app.post("/api/pricing/calculate", async (req, res) => {
    try {
      const { state, tier, isPmKisanBeneficiary, isFpoMember } = req.body;
      const plans = await storage.getSubscriptionPlansByState(state);
      const plan = plans.find(p => p.tier === tier);
      
      if (!plan) {
        return res.status(404).json({ message: "Pricing plan not found" });
      }

      let finalPrice = plan.pricePerMonth;
      let discounts = [];

      // PM-KISAN discount (20%)
      if (isPmKisanBeneficiary) {
        finalPrice = Math.round(finalPrice * 0.8);
        discounts.push({ type: "PM-KISAN", percentage: 20 });
      }

      // FPO member benefits (priority listing, no price discount)
      if (isFpoMember) {
        discounts.push({ type: "FPO Priority", percentage: 0, benefit: "Priority listing" });
      }

      res.json({
        originalPrice: plan.pricePerMonth,
        finalPrice,
        discounts,
        plan,
        affordabilityRatio: ((finalPrice * 12) / plan.avgStateIncome!) * 100
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Land listing routes
  app.get("/api/listings", async (req, res) => {
    try {
      const { state, cropType, minSize, maxSize, maxRent } = req.query;
      let listings = await storage.getAllLandListings();

      // Apply filters
      if (state) {
        listings = listings.filter(l => l.state === state);
      }
      if (cropType) {
        listings = listings.filter(l => l.suitableCrops?.includes(cropType as string));
      }
      if (minSize) {
        listings = listings.filter(l => parseFloat(l.sizeInAcres) >= parseFloat(minSize as string));
      }
      if (maxSize) {
        listings = listings.filter(l => parseFloat(l.sizeInAcres) <= parseFloat(maxSize as string));
      }
      if (maxRent) {
        listings = listings.filter(l => l.rentPerAcrePerMonth <= parseInt(maxRent as string));
      }

      // Get owner information for each listing
      const listingsWithOwners = await Promise.all(
        listings.map(async (listing) => {
          const owner = await storage.getUser(listing.ownerId);
          return {
            ...listing,
            owner: owner ? { 
              id: owner.id, 
              fullName: owner.fullName, 
              phone: owner.phone 
            } : null
          };
        })
      );

      res.json(listingsWithOwners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const listingData = insertLandListingSchema.parse(req.body);
      const listing = await storage.createLandListing(listingData);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await storage.getLandListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const owner = await storage.getUser(listing.ownerId);
      res.json({
        ...listing,
        owner: owner ? { 
          id: owner.id, 
          fullName: owner.fullName, 
          phone: owner.phone 
        } : null
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rental request routes
  app.post("/api/rental-requests", async (req, res) => {
    try {
      const requestData = insertRentalRequestSchema.parse(req.body);
      const request = await storage.createRentalRequest(requestData);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/rental-requests/farmer/:farmerId", async (req, res) => {
    try {
      const { farmerId } = req.params;
      const requests = await storage.getRentalRequestsByFarmer(farmerId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rental-requests/owner/:ownerId", async (req, res) => {
    try {
      const { ownerId } = req.params;
      const requests = await storage.getRentalRequestsByLandOwner(ownerId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/rental-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const request = await storage.updateRentalRequest(id, updates);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe subscription route
  app.post('/api/create-subscription', async (req, res) => {
    try {
      const { userId, priceId, state, tier } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user already has a subscription, return existing
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ['payment_intent']
        });
        
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: (invoice.payment_intent as any)?.client_secret,
        });
      }

      // Create Stripe customer if doesn't exist
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          metadata: {
            userId: user.id,
            state: user.state,
            tier: tier
          }
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'inr',
            product_data: {
              name: `KrishiConnect ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - ${state}`,
              description: `Monthly subscription for ${state} farmers`
            },
            unit_amount: await calculateSubscriptionPrice(state, tier, user.isPmKisanBeneficiary || false),
            recurring: {
              interval: 'month'
            }
          }
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription info
      await storage.updateUser(user.id, {
        stripeSubscriptionId: subscription.id,
        subscriptionTier: tier,
        subscriptionStatus: 'active'
      });

      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        stripePaymentIntentId: (subscription.latest_invoice as any)?.payment_intent?.id,
        type: 'subscription',
        amount: (subscription.latest_invoice as any)?.amount_paid || 0,
        status: 'pending',
        metadata: { state, tier, subscriptionId: subscription.id }
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment intent for one-time payments (deposits)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, userId, listingId, type } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // amount should already be in paise
        currency: "inr",
        metadata: {
          userId,
          listingId,
          type
        }
      });

      // Create transaction record
      await storage.createTransaction({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        type,
        amount: Math.round(amount),
        status: 'pending',
        metadata: { listingId }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Economic dashboard data
  app.get("/api/dashboard/economics", async (req, res) => {
    try {
      const allUsers = Array.from(storage['users'].values());
      const allTransactions = Array.from(storage['transactions'].values());
      const allListings = Array.from(storage['landListings'].values());
      
      // Calculate platform metrics
      const totalFarmers = allUsers.filter(u => u.role === 'farmer').length;
      const totalLandowners = allUsers.filter(u => u.role === 'landowner').length;
      const totalAcresListed = allListings.reduce((sum, listing) => 
        sum + parseFloat(listing.sizeInAcres), 0
      );
      
      // Revenue calculations
      const monthlySubscriptionRevenue = allUsers
        .filter(u => u.subscriptionStatus === 'active')
        .reduce((sum, user) => {
          // Get user's state pricing
          const plans = storage['subscriptionPlans'];
          const userPlan = Array.from(plans.values()).find(p => 
            p.state === user.state && p.tier === user.subscriptionTier
          );
          return sum + (userPlan?.pricePerMonth || 0);
        }, 0);

      const commissionRevenue = allTransactions
        .filter(t => t.type === 'commission' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      // State-wise breakdown
      const stateStats = ['Punjab', 'Bihar', 'Uttar Pradesh'].map(state => {
        const stateFarmers = allUsers.filter(u => u.state === state && u.role === 'farmer');
        const stateListings = allListings.filter(l => l.state === state);
        const plans = Array.from(storage['subscriptionPlans'].values()).filter(p => p.state === state);
        const standardPlan = plans.find(p => p.tier === 'standard');
        
        return {
          state,
          farmers: stateFarmers.length,
          listings: stateListings.length,
          avgSubscriptionCost: standardPlan?.pricePerMonth || 0,
          avgIncome: standardPlan?.avgStateIncome || 0,
          affordabilityRatio: standardPlan ? 
            ((standardPlan.pricePerMonth * 12) / standardPlan.avgStateIncome!) * 100 : 0
        };
      });

      res.json({
        platform: {
          totalFarmers,
          totalLandowners,
          totalAcresListed: Math.round(totalAcresListed),
          monthlyRevenue: monthlySubscriptionRevenue + commissionRevenue,
          subscriptionRevenue: monthlySubscriptionRevenue,
          commissionRevenue
        },
        stateStats,
        government: {
          msp: {
            wheat: 212500, // ₹2,125/quintal in paise
            rice: 205000,
            cotton: 665000
          },
          gvaGrowth: 3.8,
          pmKisanBeneficiaries: 11200000
        },
        affordability: {
          avgCostIncomeRatio: stateStats.reduce((sum, s) => sum + s.affordabilityRatio, 0) / stateStats.length,
          farmerSatisfaction: 96
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate subscription price with discounts
async function calculateSubscriptionPrice(state: string, tier: string, isPmKisanBeneficiary: boolean): Promise<number> {
  const plans = await storage.getSubscriptionPlansByState(state);
  const plan = plans.find(p => p.tier === tier);
  
  if (!plan) {
    throw new Error(`Plan not found for ${state} ${tier}`);
  }

  let price = plan.pricePerMonth;
  
  // Apply PM-KISAN discount
  if (isPmKisanBeneficiary) {
    price = Math.round(price * 0.8);
  }
  
  return price;
}
