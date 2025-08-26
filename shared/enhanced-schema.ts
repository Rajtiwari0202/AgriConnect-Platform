// Enhanced schema definitions following the comprehensive requirements
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced Users table with comprehensive fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // bcrypt hashed
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  
  // Core user info
  role: text("role").notNull(), // 'farmer' | 'landowner' | 'both'
  state: text("state").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode"),
  village: text("village"),
  language: text("language").default('english'), // 'english' | 'hindi'
  
  // KYC and verification status
  kycStatus: text("kyc_status").default('pending'), // 'pending' | 'verified' | 'rejected'
  aadhaarVerified: boolean("aadhaar_verified").default(false),
  panVerified: boolean("pan_verified").default(false),
  bankVerified: boolean("bank_verified").default(false),
  
  // Farmer-specific fields
  farmingExperience: text("farming_experience"), // in years
  preferredCrops: text("preferred_crops").array(),
  farmSize: decimal("farm_size", { precision: 8, scale: 2 }), // in acres
  isPmKisanBeneficiary: boolean("is_pm_kisan_beneficiary").default(false),
  isFpoMember: boolean("is_fpo_member").default(false),
  kccNumber: text("kcc_number"), // Kisan Credit Card
  
  // Landowner-specific fields
  totalLandOwned: decimal("total_land_owned", { precision: 10, scale: 2 }), // in acres
  propertyDocuments: text("property_documents").array(),
  
  // Subscription and payment info
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier").default('basic'), // 'basic' | 'pro' | 'enterprise'
  subscriptionStatus: text("subscription_status").default('inactive'), // 'active' | 'inactive' | 'cancelled' | 'past_due'
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  freeTrialUsed: boolean("free_trial_used").default(false),
  
  // Profile enhancements
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  lastLoginAt: timestamp("last_login_at"),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  stateDistrictIdx: index("users_state_district_idx").on(table.state, table.district),
  subscriptionIdx: index("users_subscription_idx").on(table.subscriptionTier, table.subscriptionStatus),
}));

// Enhanced land listings with comprehensive specifications
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Basic listing info
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Location details
  state: text("state").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode").notNull(),
  village: text("village"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Land specifications
  acreage: decimal("acreage", { precision: 8, scale: 2 }).notNull(), // total area in acres
  soilType: text("soil_type").notNull(), // 'alluvial' | 'black' | 'red' | 'laterite' | etc.
  soilPh: decimal("soil_ph", { precision: 3, scale: 1 }),
  soilFertility: text("soil_fertility"), // 'high' | 'medium' | 'low'
  
  // Irrigation and infrastructure
  irrigation: text("irrigation").notNull(), // 'borewell' | 'canal' | 'rainwater' | 'river' | 'drip'
  waterSource: text("water_source").array(),
  waterAvailability: text("water_availability"), // 'year_round' | 'seasonal' | 'monsoon_only'
  electricityAvailable: boolean("electricity_available").default(false),
  roadAccess: boolean("road_access").default(false),
  
  // Crop suitability and history
  cropSuitability: text("crop_suitability").array(), // suitable crops
  previousCrops: text("previous_crops").array(),
  organicCertified: boolean("organic_certified").default(false),
  
  // Pricing and terms
  rentPerAcre: decimal("rent_per_acre", { precision: 10, scale: 2 }).notNull(), // annual rent per acre
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),
  negotiable: boolean("negotiable").default(true),
  leaseDurationMin: integer("lease_duration_min").notNull(), // in months
  leaseDurationMax: integer("lease_duration_max").notNull(),
  
  // Additional features
  farmHouse: boolean("farm_house").default(false),
  storageAvailable: boolean("storage_available").default(false),
  nearbyMarkets: text("nearby_markets").array(),
  marketDistance: decimal("market_distance", { precision: 5, scale: 2 }), // in km
  
  // Legal and documentation
  landRecordNumber: text("land_record_number"),
  surveyNumber: text("survey_number"),
  ownershipProof: text("ownership_proof").array(),
  
  // Media and documents
  images: text("images").array(),
  documents: text("documents").array(),
  
  // Status and metadata
  status: text("status").notNull().default('active'), // 'active' | 'rented' | 'inactive'
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  viewCount: integer("view_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  availableFrom: timestamp("available_from").notNull(),
  availableUntil: timestamp("available_until"),
}, (table) => ({
  ownerIdx: index("listings_owner_idx").on(table.ownerId),
  locationIdx: index("listings_location_idx").on(table.state, table.district),
  statusIdx: index("listings_status_idx").on(table.status),
  priceIdx: index("listings_price_idx").on(table.rentPerAcre),
  availabilityIdx: index("listings_availability_idx").on(table.availableFrom, table.availableUntil),
}));

// Enhanced tenancy requests with comprehensive workflow
export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  farmerId: varchar("farmer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  landOwnerId: varchar("land_owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Request details
  message: text("message"),
  proposedStartDate: timestamp("proposed_start_date"),
  proposedDuration: integer("proposed_duration"), // in months
  proposedRentPerAcre: decimal("proposed_rent_per_acre", { precision: 10, scale: 2 }),
  
  // Status tracking
  status: text("status").notNull().default("pending"), 
  // 'pending' | 'accepted' | 'rejected' | 'in_escrow' | 'active' | 'completed' | 'cancelled'
  
  // Response from landowner
  ownerResponse: text("owner_response"),
  rejectionReason: text("rejection_reason"),
  
  // Contract details (when accepted)
  finalRentPerAcre: decimal("final_rent_per_acre", { precision: 10, scale: 2 }),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  contractTerms: text("contract_terms"),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  respondedAt: timestamp("responded_at"),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  listingIdx: index("requests_listing_idx").on(table.listingId),
  farmerIdx: index("requests_farmer_idx").on(table.farmerId),
  ownerIdx: index("requests_owner_idx").on(table.landOwnerId),
  statusIdx: index("requests_status_idx").on(table.status),
}));

// Subscription plans (national, no state variation)
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tier: text("tier").notNull().unique(), // 'basic' | 'pro' | 'enterprise'
  name: text("name").notNull(),
  description: text("description").notNull(),
  monthlyPrice: decimal("monthly_price", { precision: 8, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearly_price", { precision: 8, scale: 2 }).notNull(),
  features: jsonb("features").notNull(),
  
  // Limits and capabilities
  maxLandListings: integer("max_land_listings"), // -1 for unlimited
  maxTenancyRequests: integer("max_tenancy_requests"),
  maxMessagesPerMonth: integer("max_messages_per_month"),
  escrowProtection: boolean("escrow_protection").default(false),
  prioritySupport: boolean("priority_support").default(false),
  analytics: boolean("analytics").default(false),
  pdfInvoices: boolean("pdf_invoices").default(false),
  multiUserSeats: integer("multi_user_seats").default(1),
  
  // Free trial
  freeTrialDays: integer("free_trial_days").default(7),
  requiresPaymentMethod: boolean("requires_payment_method").default(true),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// Payment records with comprehensive tracking
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Amount and currency
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  
  // Payment purpose and type
  purpose: text("purpose").notNull(), // 'subscription' | 'deposit' | 'rent' | 'commission'
  type: text("type").notNull(), // 'one_time' | 'recurring'
  
  // Payment status
  status: text("status").notNull(), // 'pending' | 'completed' | 'failed' | 'refunded'
  
  // Payment method (for Indian market)
  mode: text("mode"), // 'upi' | 'card' | 'netbanking' | 'wallet'
  paymentMethodDetails: jsonb("payment_method_details"), // last4, brand, etc.
  
  // Provider integration
  providerRef: text("provider_ref"), // Stripe payment intent ID, etc.
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  
  // Invoice and receipt
  invoiceUrl: text("invoice_url"),
  receiptNumber: text("receipt_number"),
  
  // Metadata
  metadata: jsonb("metadata"),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
}, (table) => ({
  userIdx: index("payments_user_idx").on(table.userId),
  statusIdx: index("payments_status_idx").on(table.status),
  providerIdx: index("payments_provider_idx").on(table.providerRef),
}));

// Escrow management (simulated via Stripe manual capture)
export const escrows = pgTable("escrows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => requests.id, { onDelete: 'cascade' }),
  paymentId: varchar("payment_id").references(() => payments.id),
  
  // Escrow details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  
  // Status tracking
  status: text("status").notNull(), // 'hold' | 'released' | 'refunded' | 'cancelled'
  
  // Provider integration (simulated)
  provider: text("provider").default('stripe_sim'), // 'stripe_sim' for simulated
  captureId: text("capture_id"), // Stripe payment intent ID for manual capture
  
  // Release conditions and timeline
  releaseConditions: text("release_conditions"),
  autoReleaseDate: timestamp("auto_release_date"),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
}, (table) => ({
  requestIdx: index("escrows_request_idx").on(table.requestId),
  statusIdx: index("escrows_status_idx").on(table.status),
}));

// Enhanced messaging system with threading
export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").references(() => listings.id), // optional, can be general conversation
  participants: text("participants").array(), // user IDs
  
  // Thread metadata
  subject: text("subject"),
  isActive: boolean("is_active").default(true),
  lastMessageAt: timestamp("last_message_at").default(sql`now()`),
  
  createdAt: timestamp("created_at").default(sql`now()`)
}, (table) => ({
  listingIdx: index("threads_listing_idx").on(table.listingId),
  participantsIdx: index("threads_participants_idx").on(table.participants),
}));

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => threads.id, { onDelete: 'cascade' }),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: varchar("to_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Message content
  body: text("body").notNull(),
  messageType: text("message_type").default('text'), // 'text' | 'image' | 'file' | 'system'
  
  // Attachments
  attachments: text("attachments").array(), // file paths/URLs
  
  // Threading support
  parentMessageId: varchar("parent_message_id").references(() => messages.id),
  
  // Status tracking
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  
  createdAt: timestamp("created_at").default(sql`now()`)
}, (table) => ({
  threadIdx: index("messages_thread_idx").on(table.threadId),
  fromUserIdx: index("messages_from_user_idx").on(table.fromUserId),
  toUserIdx: index("messages_to_user_idx").on(table.toUserId),
  createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
}));

// Government schemes for awareness
export const schemes = pgTable("schemes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'income_support' | 'credit' | 'insurance' | 'subsidy' | 'training'
  
  // Eligibility and requirements
  eligibility: text("eligibility").array(),
  documents: text("documents").array(),
  benefits: text("benefits").notNull(),
  
  // Application process
  applicationProcess: text("application_process").notNull(),
  officialLink: text("official_link").notNull(),
  contactNumber: text("contact_number"),
  deadline: text("deadline"),
  
  // Metadata
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
}, (table) => ({
  categoryIdx: index("schemes_category_idx").on(table.category),
  activeIdx: index("schemes_active_idx").on(table.isActive),
}));

// Economic dashboard metrics
export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull(), // metric identifier
  value: text("value").notNull(), // JSON stringified value
  source: text("source").notNull(), // data source identifier
  capturedAt: timestamp("captured_at").default(sql`now()`)
}, (table) => ({
  keyIdx: index("metrics_key_idx").on(table.key),
  capturedAtIdx: index("metrics_captured_at_idx").on(table.capturedAt),
}));

// Create insert schemas with proper validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  lastLoginAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(['farmer', 'landowner', 'both']),
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  respondedAt: true,
  completedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Thread = typeof threads.$inferSelect;
export type Escrow = typeof escrows.$inferSelect;
export type Scheme = typeof schemes.$inferSelect;
export type MetricSnapshot = typeof metricsSnapshots.$inferSelect;