# AgriConnect - Agricultural Land Leasing Platform

A comprehensive platform connecting tenant farmers with landowners across India, featuring secure payments, subscription plans, and real-time communication.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (recommended) or SQLite for development

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd agriconnect
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.sample .env
   # Edit .env with your actual values
   ```

3. **Database setup**
   ```bash
   # Run migrations
   npm run db:push
   
   # Seed development data
   npm run db:seed
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── db/                 # Database schema and migrations
│   ├── middleware/         # Express middleware
│   └── utils/              # Server utilities
├── shared/                 # Shared types and schemas
└── uploads/                # File uploads (development)
```

## 🛠 Available Scripts

### Development
- `npm run dev` - Start both client and server in development mode
- `npm run start:client` - Start only the React frontend
- `npm run start:server` - Start only the Express backend

### Building
- `npm run build` - Build both client and server for production
- `npm run start` - Start production build

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:seed` - Seed database with sample data

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run test suite
- `npm run format` - Format code with Prettier

## 🗄 Database Schema

### Core Entities
- **Users**: Farmers, landowners with KYC status and subscription info
- **Listings**: Land listings with detailed specifications and pricing
- **Requests**: Tenancy requests with escrow and status tracking
- **Messages**: Threaded messaging system with file attachments
- **Payments**: Transaction records with Stripe integration
- **Subscriptions**: User subscription plans and billing

### Government Schemes Integration
- **Schemes**: PM-KISAN, PMFBY, KCC scheme information
- **Metrics**: Economic dashboard data points

## 💳 Payment Integration

### Stripe India Support
- **Currency**: INR (Indian Rupees)
- **Payment Methods**: UPI, Cards (Visa, Mastercard, RuPay), Net Banking
- **Subscriptions**: Monthly and annual billing with auto-renewal
- **Escrow**: Simulated escrow using Stripe manual capture

### Subscription Plans
- **Basic**: ₹99/month - For smallholder farmers
- **Pro**: ₹499/month - For mid-scale operations  
- **Enterprise**: ₹1,999/month - For large landowners

## 🔐 Security Features

- **Authentication**: JWT-based with secure session management
- **Input Validation**: Zod schemas for all API endpoints
- **File Upload Security**: MIME type validation and safe storage
- **Rate Limiting**: Protection against abuse
- **CORS**: Locked to CLIENT_URL

## 🌍 Internationalization

- **Primary Language**: English
- **Secondary Language**: Hindi (basic translation support)
- **Currency**: INR with Indian number formatting
- **Locale**: en-IN throughout the application

## 📊 Features

### For Farmers
- Search and filter land listings
- Submit tenancy requests
- Secure payment processing
- Real-time messaging with landowners
- Government scheme information
- Economic dashboard with affordability insights

### For Landowners
- Create and manage land listings
- Review and approve tenant requests
- Escrow-protected transactions
- Multi-tenant communication
- Analytics and reporting

### Platform Features
- Responsive design (mobile-first)
- Real-time notifications
- File upload and management
- PDF invoice generation
- Economic data integration
- Accessibility compliance (WCAG AA)

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- `DATABASE_URL` (PostgreSQL connection string)
- `STRIPE_SECRET_KEY` (live key for production)
- `JWT_SECRET` (secure random string)
- `SESSION_SECRET` (secure random string)

### Build and Deploy
```bash
npm run build
npm start
```

## 📝 Legal Compliance

- **Terms of Service**: Comprehensive terms covering platform usage
- **Privacy Policy**: DPDP Act compliance with data protection
- **Refund Policy**: Clear refund terms for subscriptions and services
- **GST Compliance**: Invoice generation with applicable taxes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

- **Email**: support@agriconnect.in
- **Documentation**: [Link to detailed docs]
- **Issue Tracker**: GitHub Issues

## 📄 License

Copyright © 2025 AgriConnect. All rights reserved.

---

**Note**: This platform handles sensitive agricultural and financial data. Please ensure proper security measures are in place before production deployment.