# Agricultural Platform - "Taking Care of Agricultural Roots Back Home"

## Project Overview
A platform connecting tenant farmers with landowners featuring property listings, user profiles, secure payments, and real-time communication.

## Project Architecture
- **Frontend**: React with Wouter routing, ShadCN UI components, TailwindCSS
- **Backend**: Express.js with in-memory storage (MemStorage)
- **Authentication**: JWT-based with Google OAuth
- **Payments**: Stripe integration for deposits and recurring rent
- **Real-time**: Socket.IO for messaging
- **Styling**: TailwindCSS with dark/light mode support

## Core Features
1. **User Management**: Farmers and landowners with separate dashboards
2. **Land Listings**: CRUD operations with search and filtering
3. **Tenancy Requests**: Request system with approval workflow
4. **Payment System**: Stripe checkout for deposits and subscriptions
5. **Messaging**: Real-time chat between farmers and landowners
6. **Notifications**: Email and push notifications

## Data Models
- **User**: Role-based (farmer, landowner, admin)
- **Land**: Property details with location, size, type, pricing
- **Request**: Tenancy requests with status tracking
- **Transaction**: Payment records via Stripe
- **Message**: Real-time messaging between users

## User Preferences
- Production-grade code with comprehensive features
- Modern UI/UX with animations
- Secure payment flow with escrow
- Complete project structure with comments

## Recent Changes
- Initial project setup planned with full-stack architecture
- Focus on security, scalability, and user experience