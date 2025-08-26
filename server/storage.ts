import { 
  type User, 
  type InsertUser, 
  type LandListing, 
  type InsertLandListing,
  type RentalRequest,
  type InsertRentalRequest,
  type Message,
  type InsertMessage,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Land Listings
  getLandListing(id: string): Promise<LandListing | undefined>;
  getAllLandListings(): Promise<LandListing[]>;
  getLandListingsByState(state: string): Promise<LandListing[]>;
  getLandListingsByOwner(ownerId: string): Promise<LandListing[]>;
  createLandListing(listing: InsertLandListing): Promise<LandListing>;
  updateLandListing(id: string, updates: Partial<LandListing>): Promise<LandListing>;
  
  // Rental Requests
  getRentalRequest(id: string): Promise<RentalRequest | undefined>;
  getRentalRequestsByFarmer(farmerId: string): Promise<RentalRequest[]>;
  getRentalRequestsByLandOwner(landOwnerId: string): Promise<RentalRequest[]>;
  createRentalRequest(request: InsertRentalRequest): Promise<RentalRequest>;
  updateRentalRequest(id: string, updates: Partial<RentalRequest>): Promise<RentalRequest>;
  
  // Messages
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message>;
  
  // Subscription Plans
  getSubscriptionPlansByState(state: string): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // Transactions
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private landListings: Map<string, LandListing> = new Map();
  private rentalRequests: Map<string, RentalRequest> = new Map();
  private messages: Map<string, Message> = new Map();
  private subscriptionPlans: Map<string, SubscriptionPlan> = new Map();
  private transactions: Map<string, Transaction> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed subscription plans for different states
    const plans = [
      // Punjab plans
      { state: "Punjab", tier: "basic", pricePerMonth: 89900, avgStateIncome: 35000000 },
      { state: "Punjab", tier: "standard", pricePerMonth: 129900, avgStateIncome: 35000000 },
      { state: "Punjab", tier: "premium", pricePerMonth: 179900, avgStateIncome: 35000000 },
      
      // Bihar plans (subsidized)
      { state: "Bihar", tier: "basic", pricePerMonth: 39900, avgStateIncome: 18500000 },
      { state: "Bihar", tier: "standard", pricePerMonth: 49900, avgStateIncome: 18500000 },
      { state: "Bihar", tier: "premium", pricePerMonth: 69900, avgStateIncome: 18500000 },
      
      // UP plans
      { state: "Uttar Pradesh", tier: "basic", pricePerMonth: 59900, avgStateIncome: 25000000 },
      { state: "Uttar Pradesh", tier: "standard", pricePerMonth: 79900, avgStateIncome: 25000000 },
      { state: "Uttar Pradesh", tier: "premium", pricePerMonth: 99900, avgStateIncome: 25000000 },
    ];

    plans.forEach(plan => {
      const id = randomUUID();
      this.subscriptionPlans.set(id, {
        id,
        state: plan.state,
        tier: plan.tier,
        pricePerMonth: plan.pricePerMonth,
        avgStateIncome: plan.avgStateIncome,
        features: {
          basic: ["Property listings", "Basic messaging", "Government scheme integration"],
          standard: ["Everything in Basic", "Priority support", "Advanced filters", "Analytics"],
          premium: ["Everything in Standard", "Priority listing", "Chat analytics", "Dedicated support"]
        }[plan.tier],
        createdAt: new Date()
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: null,
      subscriptionStatus: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    return this.updateUser(userId, { stripeCustomerId, stripeSubscriptionId });
  }

  // Land Listing methods
  async getLandListing(id: string): Promise<LandListing | undefined> {
    return this.landListings.get(id);
  }

  async getAllLandListings(): Promise<LandListing[]> {
    return Array.from(this.landListings.values()).filter(listing => listing.isAvailable);
  }

  async getLandListingsByState(state: string): Promise<LandListing[]> {
    return Array.from(this.landListings.values()).filter(
      listing => listing.state === state && listing.isAvailable
    );
  }

  async getLandListingsByOwner(ownerId: string): Promise<LandListing[]> {
    return Array.from(this.landListings.values()).filter(
      listing => listing.ownerId === ownerId
    );
  }

  async createLandListing(insertListing: InsertLandListing): Promise<LandListing> {
    const id = randomUUID();
    const listing: LandListing = {
      ...insertListing,
      id,
      isAvailable: true,
      isVerified: false,
      images: insertListing.images || [],
      documents: insertListing.documents || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.landListings.set(id, listing);
    return listing;
  }

  async updateLandListing(id: string, updates: Partial<LandListing>): Promise<LandListing> {
    const listing = this.landListings.get(id);
    if (!listing) throw new Error("Land listing not found");
    
    const updatedListing = { ...listing, ...updates, updatedAt: new Date() };
    this.landListings.set(id, updatedListing);
    return updatedListing;
  }

  // Rental Request methods
  async getRentalRequest(id: string): Promise<RentalRequest | undefined> {
    return this.rentalRequests.get(id);
  }

  async getRentalRequestsByFarmer(farmerId: string): Promise<RentalRequest[]> {
    return Array.from(this.rentalRequests.values()).filter(
      request => request.farmerId === farmerId
    );
  }

  async getRentalRequestsByLandOwner(landOwnerId: string): Promise<RentalRequest[]> {
    return Array.from(this.rentalRequests.values()).filter(
      request => request.landOwnerId === landOwnerId
    );
  }

  async createRentalRequest(insertRequest: InsertRentalRequest): Promise<RentalRequest> {
    const id = randomUUID();
    const request: RentalRequest = {
      ...insertRequest,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rentalRequests.set(id, request);
    return request;
  }

  async updateRentalRequest(id: string, updates: Partial<RentalRequest>): Promise<RentalRequest> {
    const request = this.rentalRequests.get(id);
    if (!request) throw new Error("Rental request not found");
    
    const updatedRequest = { ...request, ...updates, updatedAt: new Date() };
    this.rentalRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Message methods
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const message = this.messages.get(id);
    if (!message) throw new Error("Message not found");
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Subscription Plan methods
  async getSubscriptionPlansByState(state: string): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).filter(
      plan => plan.state === state
    );
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = randomUUID();
    const plan: SubscriptionPlan = {
      ...insertPlan,
      id,
      createdAt: new Date()
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  // Transaction methods
  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      currency: "inr",
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) throw new Error("Transaction not found");
    
    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
}

export const storage = new MemStorage();
