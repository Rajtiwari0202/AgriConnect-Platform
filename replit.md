# Agricultural Platform - "AgriConnect"

## Project Overview
A comprehensive Indian agricultural platform connecting tenant farmers with landowners featuring economic data integration, government schemes awareness, national subscription pricing, Stripe India payment processing, and farmer-friendly affordability models.

## Project Architecture
- **Frontend**: React with Wouter routing, ShadCN UI components, TailwindCSS, Recharts for data visualization
- **Backend**: Express.js with enhanced in-memory storage, security middleware (Helmet, CORS, Rate Limiting)
- **Authentication**: JWT-based with Passport.js, session management with secure secrets
- **Payments**: Stripe India integration with UPI/Card/NetBanking, simulated escrow via manual capture
- **Economic Dashboard**: Government budget data, farm income analysis, affordability calculations
- **Government Integration**: PM-KISAN, PMFBY, KCC schemes with real application links
- **Security**: Environment validation with Zod, production-grade middleware stack
- **Styling**: TailwindCSS with Indian localization (en-IN, INR currency)

## Core Features - Enhanced
1. **User Management**: KYC verification, Aadhaar/PAN integration, subscription tiers
2. **Land Listings**: Comprehensive agricultural specifications (soil, irrigation, crops, legal docs)
3. **National Subscription Plans**: Farmer-affordable pricing based on economic data (₹99-₹1999/month)
4. **Payment System**: Stripe India with escrow protection, recurring subscriptions, invoice generation
5. **Economic Dashboard**: Union Budget data, income analysis, platform metrics, affordability calculator
6. **Government Schemes**: PM-KISAN, PMFBY, KCC integration with application guidance
7. **Enhanced Messaging**: Threaded conversations, file attachments, read receipts
8. **Security**: Environment validation, rate limiting, JWT authentication, role-based access

## Data Models - Comprehensive
- **Enhanced User**: KYC status, farming experience, FPO membership, subscription management
- **Enhanced Listing**: Soil specifications, irrigation details, legal documentation, crop suitability
- **Tenancy Requests**: Contract terms, escrow integration, status workflow
- **Payment Records**: Multi-purpose tracking (subscription, deposit, rent, commission)
- **Escrow Management**: Simulated holding via Stripe manual capture
- **Government Schemes**: Official data with application processes and deadlines
- **Economic Metrics**: Dashboard analytics and historical data tracking

## National Subscription Plans
- **Basic Plan**: ₹99/month - Smallholder farmers (< 2 acres) - ≈1.2% of avg income
- **Pro Plan**: ₹499/month - Mid-scale farms (2-10 acres) - ≈2.0% of avg income  
- **Enterprise Plan**: ₹1999/month - Large operations (> 10 acres) - ≈2.7% of avg income

## User Preferences
- TypeScript end-to-end with comprehensive type safety
- INR currency with "en-IN" locale throughout the platform
- Farmer-friendly explanations and government scheme integration
- Security-first approach with environment validation
- Comprehensive economic data integration for transparency
- Production-grade architecture with proper error handling

## Recent Changes - August 26, 2025
### Migration & Security Implementation
- **Migration Complete**: Successfully migrated from Replit Agent to standard Replit environment
- **Security Infrastructure**: Implemented comprehensive environment validation using Zod
- **Authentication**: JWT and session management with secure secrets (SESSION_SECRET, JWT_SECRET)
- **Middleware Stack**: Helmet security headers, CORS configuration, express rate limiting
- **Express Configuration**: Trust proxy for production, body parsing limits, compression

### Enhanced Data Architecture  
- **Comprehensive Schema**: Created enhanced database schema with 12+ tables supporting full agricultural workflow
- **User Management**: KYC verification, Aadhaar/PAN integration, subscription tracking, farming profiles
- **Land Listings**: Detailed agricultural specifications including soil pH, irrigation systems, legal documentation
- **Payment System**: Multi-purpose payment tracking with Stripe integration and escrow simulation
- **Messaging**: Threaded conversations with file attachments and read receipts

### Payment & Subscription System
- **Stripe India Integration**: Payment intents, subscription management, webhook handling
- **National Pricing**: Single nationwide pricing eliminating regional complexity
- **Escrow Simulation**: Manual capture payments for secure land deal protection
- **Affordability Model**: Income-based pricing recommendations using government agricultural data

### Economic Dashboard & Government Integration
- **Dashboard**: Union Budget 2025-26 data, farm income distribution, platform metrics
- **Government Schemes**: PM-KISAN, PMFBY, KCC with real application links and eligibility criteria
- **Affordability Calculator**: Dynamic pricing analysis based on farm size and estimated income
- **Data Visualization**: Charts and graphs for economic data using Recharts library

### Storage & Infrastructure
- **Enhanced Storage**: Comprehensive in-memory storage supporting all features with TypeScript interfaces
- **API Routes**: Payment processing, escrow management, schemes integration, dashboard metrics
- **File Upload**: Multer configuration for agricultural documents and property images
- **Validation Middleware**: Zod-based request validation for all API endpoints

### Frontend Components & Pages
- **Economic Dashboard**: Interactive data visualization with affordability calculations
- **Government Schemes**: Searchable scheme database with application guidance
- **Pricing Comparison**: National subscription plans with farmer-targeted messaging
- **Enhanced Listings**: Fixed SelectItem value prop issues for proper form functionality

## Technical Implementation Status
- ✅ Environment validation and security middleware
- ✅ Enhanced database schema with comprehensive agricultural data model
- ✅ Payment system with Stripe India and escrow simulation
- ✅ Economic dashboard with government budget integration
- ✅ Government schemes awareness system
- ✅ National subscription pricing with affordability analysis
- ✅ Enhanced storage interface supporting all features
- ✅ Frontend components with proper Indian localization
- 🔄 Storage interface integration with existing routes (in progress)
- 🔄 Full TypeScript error resolution (in progress)