import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with enhanced dual registration system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // 'farmer' | 'landowner' | 'admin' | 'both'
  state: text("state").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode"),
  village: text("village"),
  
  // Enhanced farmer-specific fields
  farmingExperience: text("farming_experience"),
  preferredCrops: text("preferred_crops").array(),
  farmSize: decimal("farm_size", { precision: 8, scale: 2 }), // in acres
  isPmKisanBeneficiary: boolean("is_pm_kisan_beneficiary").default(false),
  isFpoMember: boolean("is_fpo_member").default(false),
  kccNumber: text("kcc_number"), // Kisan Credit Card
  
  // Landowner-specific fields
  totalLandOwned: decimal("total_land_owned", { precision: 10, scale: 2 }), // in acres
  propertyDocuments: text("property_documents").array(),
  
  // Identity verification (future OAuth integration)
  aadhaarVerified: boolean("aadhaar_verified").default(false),
  panVerified: boolean("pan_verified").default(false),
  bankVerified: boolean("bank_verified").default(false),
  
  // Stripe integration - national pricing
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier"), // 'basic' | 'pro' | 'enterprise'
  subscriptionStatus: text("subscription_status"), // 'active' | 'inactive' | 'cancelled' | 'past_due'
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  
  // Profile enhancements
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  languages: text("languages").array(), // 'hindi' | 'english' | 'bengali' | etc
  preferredLanguage: text("preferred_language").default('english'),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// Enhanced land listings with comprehensive search filters
export const landListings = pgTable("land_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode").notNull(),
  village: text("village"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Enhanced land specifications
  totalArea: decimal("total_area", { precision: 8, scale: 2 }).notNull(), // in acres
  availableArea: decimal("available_area", { precision: 8, scale: 2 }).notNull(),
  soilType: text("soil_type").notNull(), // 'alluvial' | 'black' | 'red' | 'laterite' | 'sandy' | 'clayey'
  soilPh: decimal("soil_ph", { precision: 3, scale: 1 }),
  soilFertility: text("soil_fertility"), // 'high' | 'medium' | 'low'
  irrigationFacility: text("irrigation_facility").notNull(), // 'bore_well' | 'canal' | 'rainwater' | 'river' | 'pond' | 'drip'
  waterSource: text("water_source").array(),
  waterAvailability: text("water_availability"), // 'year_round' | 'seasonal' | 'monsoon_only'
  electricityAvailable: boolean("electricity_available").default(false),
  roadAccess: boolean("road_access").default(false),
  roadType: text("road_type"), // 'paved' | 'gravel' | 'dirt'
  
  // Crop suitability
  suitableCrops: text("suitable_crops").array(),
  previousCrops: text("previous_crops").array(),
  cropHistory: jsonb("crop_history"), // Historical yield data
  
  // Pricing and availability
  rentPerAcrePerYear: decimal("rent_per_acre_per_year", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).notNull(),
  negotiable: boolean("negotiable").default(true),
  leaseDurationMin: integer("lease_duration_min").notNull(), // in months
  leaseDurationMax: integer("lease_duration_max").notNull(),
  availableFrom: timestamp("available_from").notNull(),
  availableUntil: timestamp("available_until"),
  
  // Enhanced features and amenities
  farmHouse: boolean("farm_house").default(false),
  storageAvailable: boolean("storage_available").default(false),
  organicCertified: boolean("organic_certified").default(false),
  pesticidesUsed: boolean("pesticides_used").default(false),
  nearbyMarkets: text("nearby_markets").array(),
  marketDistance: decimal("market_distance", { precision: 5, scale: 2 }), // in km
  transportAccess: text("transport_access"), // 'excellent' | 'good' | 'moderate' | 'limited'
  nearbyFacilities: text("nearby_facilities").array(), // banks, hospitals, schools, etc.
  
  // Legal and documentation
  landRecordNumber: text("land_record_number"),
  surveyNumber: text("survey_number"),
  ownershipProof: text("ownership_proof").array(),
  khataNumber: text("khata_number"),
  
  // Media
  images: text("images").array(),
  videos: text("videos").array(),
  documents: text("documents").array(),
  
  // Status and visibility
  status: text("status").notNull().default('active'), // 'active' | 'rented' | 'inactive' | 'under_negotiation'
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// Rental requests
export const rentalRequests = pgTable("rental_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  landListingId: varchar("land_listing_id").notNull().references(() => landListings.id),
  farmerId: varchar("farmer_id").notNull().references(() => users.id),
  landOwnerId: varchar("land_owner_id").notNull().references(() => users.id),
  
  message: text("message"),
  proposedStartDate: timestamp("proposed_start_date"),
  proposedDuration: integer("proposed_duration"), // in months
  
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected' | 'cancelled'
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// Enhanced threaded messaging system
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  landListingId: varchar("land_listing_id").references(() => landListings.id),
  lastMessageAt: timestamp("last_message_at").default(sql`now()`),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").default(sql`now()`)
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  
  content: text("content"),
  messageType: text("message_type").notNull().default('text'), // 'text' | 'image' | 'file' | 'system'
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  
  isRead: boolean("is_read").default(false),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  
  // Thread support
  parentMessageId: varchar("parent_message_id").references(() => messages.id),
  threadCount: integer("thread_count").default(0),
  
  createdAt: timestamp("created_at").default(sql`now()`)
});

// National three-tier subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tier: text("tier").notNull().unique(), // 'basic' | 'pro' | 'enterprise'
  name: text("name").notNull(),
  description: text("description").notNull(),
  pricePerMonth: decimal("price_per_month", { precision: 8, scale: 2 }).notNull(), // in INR
  pricePerYear: decimal("price_per_year", { precision: 8, scale: 2 }).notNull(), // in INR
  features: jsonb("features").notNull(),
  maxLandListings: integer("max_land_listings"),
  maxTenancyRequests: integer("max_tenancy_requests"),
  escrowProtection: boolean("escrow_protection").default(false),
  prioritySupport: boolean("priority_support").default(false),
  governmentSchemeAccess: boolean("government_scheme_access").default(false),
  advancedAnalytics: boolean("advanced_analytics").default(false),
  multiLanguageSupport: boolean("multi_language_support").default(false),
  
  // Economic context for affordability
  targetAudienceIncome: decimal("target_audience_income", { precision: 10, scale: 2 }), // monthly income in INR
  affordabilityPercentage: decimal("affordability_percentage", { precision: 5, scale: 2 }), // % of income
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// Enhanced transactions with escrow support
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripePaymentMethodId: text("stripe_payment_method_id"),
  
  type: text("type").notNull(), // 'subscription' | 'deposit' | 'rent' | 'commission' | 'escrow_deposit' | 'escrow_release'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // in INR
  currency: text("currency").default("INR"),
  status: text("status").notNull(), // 'pending' | 'completed' | 'failed' | 'refunded' | 'held_in_escrow'
  
  // Escrow details
  escrowReleaseDate: timestamp("escrow_release_date"),
  beneficiaryUserId: varchar("beneficiary_user_id").references(() => users.id),
  landListingId: varchar("land_listing_id").references(() => landListings.id),
  
  // Payment method details for India
  paymentMethod: text("payment_method"), // 'card' | 'upi' | 'netbanking' | 'wallet'
  upiId: text("upi_id"),
  bankName: text("bank_name"),
  
  metadata: jsonb("metadata"),
  invoiceGenerated: boolean("invoice_generated").default(false),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// Government schemes for subsidy awareness
export const governmentSchemes = pgTable("government_schemes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'subsidy' | 'loan' | 'insurance' | 'training' | 'equipment'
  eligibleStates: text("eligible_states").array(),
  eligibleDistricts: text("eligible_districts").array(),
  
  // Eligibility criteria
  minFarmSize: decimal("min_farm_size", { precision: 8, scale: 2 }),
  maxFarmSize: decimal("max_farm_size", { precision: 8, scale: 2 }),
  maxAnnualIncome: decimal("max_annual_income", { precision: 10, scale: 2 }),
  requiredDocuments: text("required_documents").array(),
  eligibleCrops: text("eligible_crops").array(),
  
  // Scheme details
  subsidyAmount: decimal("subsidy_amount", { precision: 10, scale: 2 }),
  subsidyPercentage: decimal("subsidy_percentage", { precision: 5, scale: 2 }),
  maxBenefitAmount: decimal("max_benefit_amount", { precision: 10, scale: 2 }),
  applicationDeadline: timestamp("application_deadline"),
  
  // URLs and contacts
  officialWebsite: text("official_website"),
  applicationProcess: text("application_process"),
  contactNumber: text("contact_number"),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// PDF Invoices for payments
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().references(() => transactions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  invoiceNumber: text("invoice_number").notNull().unique(),
  pdfUrl: text("pdf_url"),
  
  // Invoice details
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Business details
  companyName: text("company_name").default('AgriConnect India Pvt Ltd'),
  companyAddress: text("company_address"),
  gstin: text("gstin"),
  
  status: text("status").notNull().default('generated'), // 'generated' | 'sent' | 'downloaded'
  
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Create insert schemas for all tables
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true
});

export const insertLandListingSchema = createInsertSchema(landListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRentalRequestSchema = createInsertSchema(rentalRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertGovernmentSchemeSchema = createInsertSchema(governmentSchemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true
});

// Export comprehensive types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LandListing = typeof landListings.$inferSelect;
export type InsertLandListing = z.infer<typeof insertLandListingSchema>;
export type RentalRequest = typeof rentalRequests.$inferSelect;
export type InsertRentalRequest = z.infer<typeof insertRentalRequestSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type GovernmentScheme = typeof governmentSchemes.$inferSelect;
export type InsertGovernmentScheme = z.infer<typeof insertGovernmentSchemeSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
