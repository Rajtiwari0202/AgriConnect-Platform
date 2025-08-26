// National subscription plans (removing state-wise variation)
// Based on Indian agricultural economic data and farmer affordability

export const NATIONAL_SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    tagline: 'For Smallholder Farmers',
    description: 'Essential tools for small-scale farming operations',
    monthlyPrice: 99, // ₹99/month
    yearlyPrice: 999, // ₹999/year (2 months free)
    target: 'Smallholders (< 2 acres)',
    affordabilityNote: '≈ 1.2% of avg smallholder monthly income (₹8,500)',
    features: [
      'Search & filter land listings',
      '5 messages per month',
      '2 active tenancy requests',
      'Basic government scheme alerts',
      'Mobile app access',
      'Standard support (48-hour response)',
    ],
    limits: {
      landListings: 3,
      messagesPerMonth: 5,
      activeRequests: 2,
      escrowProtection: false,
      prioritySupport: false,
      analytics: false,
      pdfInvoices: false,
      multiUser: false,
    },
    freeTrial: {
      enabled: true,
      durationDays: 7,
      requiresPaymentMethod: true,
    }
  },
  
  pro: {
    id: 'pro',
    name: 'Pro Plan', 
    tagline: 'For Mid-Scale Farms & Agri-Entrepreneurs',
    description: 'Advanced features for growing agricultural businesses',
    monthlyPrice: 499, // ₹499/month
    yearlyPrice: 4999, // ₹4999/year (2 months free)
    target: 'Mid-scale (2-10 acres)',
    affordabilityNote: '≈ 2.0% of avg mid-scale monthly income (₹25,000)',
    features: [
      'Unlimited land search & listings',
      '50 messages per month',
      '10 active tenancy requests',
      'Basic analytics dashboard',
      'PDF invoice generation',
      'Government subsidy calculator',
      'Crop advisory alerts',
      'Priority support (24-hour response)',
      'Email notifications',
    ],
    limits: {
      landListings: -1, // Unlimited
      messagesPerMonth: 50,
      activeRequests: 10,
      escrowProtection: true,
      prioritySupport: true,
      analytics: true,
      pdfInvoices: true,
      multiUser: false,
    },
    freeTrial: {
      enabled: true,
      durationDays: 7,
      requiresPaymentMethod: true,
    }
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    tagline: 'For Large Landowners & Cooperatives',
    description: 'Comprehensive solution for large agricultural operations',
    monthlyPrice: 1999, // ₹1999/month
    yearlyPrice: 19999, // ₹19999/year (2 months free)
    target: 'Large-scale (> 10 acres) & FPCs',
    affordabilityNote: '≈ 2.7% of avg large-scale monthly income (₹75,000)',
    features: [
      'Unlimited land listings & search',
      'Unlimited messaging',
      'Unlimited tenancy requests',
      'Advanced analytics & reports',
      'CSV exports & bulk operations',
      'Multi-user seats (3 included)',
      'Dedicated account manager',
      'Priority 24/7 support',
      'Custom contract templates',
      'API access (future)',
      'White-label options (future)',
    ],
    limits: {
      landListings: -1, // Unlimited
      messagesPerMonth: -1, // Unlimited
      activeRequests: -1, // Unlimited
      escrowProtection: true,
      prioritySupport: true,
      analytics: true,
      pdfInvoices: true,
      multiUser: 3, // 3 seats included
    },
    freeTrial: {
      enabled: true,
      durationDays: 7,
      requiresPaymentMethod: true,
    }
  }
} as const;

export type SubscriptionPlanId = keyof typeof NATIONAL_SUBSCRIPTION_PLANS;

// Utility functions for subscription management
export const subscriptionUtils = {
  getPlan: (planId: SubscriptionPlanId) => NATIONAL_SUBSCRIPTION_PLANS[planId],
  
  getYearlySavings: (planId: SubscriptionPlanId): number => {
    const plan = NATIONAL_SUBSCRIPTION_PLANS[planId];
    const monthlyTotal = plan.monthlyPrice * 12;
    return monthlyTotal - plan.yearlyPrice;
  },
  
  getYearlySavingsPercentage: (planId: SubscriptionPlanId): number => {
    const plan = NATIONAL_SUBSCRIPTION_PLANS[planId];
    const monthlyTotal = plan.monthlyPrice * 12;
    return Math.round(((monthlyTotal - plan.yearlyPrice) / monthlyTotal) * 100);
  },
  
  formatPrice: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  },
  
  getAllPlans: () => Object.values(NATIONAL_SUBSCRIPTION_PLANS),
  
  getPlanComparison: () => {
    return Object.values(NATIONAL_SUBSCRIPTION_PLANS).map(plan => ({
      ...plan,
      formattedMonthlyPrice: subscriptionUtils.formatPrice(plan.monthlyPrice),
      formattedYearlyPrice: subscriptionUtils.formatPrice(plan.yearlyPrice),
      yearlySavings: subscriptionUtils.getYearlySavings(plan.id),
      yearlySavingsPercentage: subscriptionUtils.getYearlySavingsPercentage(plan.id),
      formattedSavings: subscriptionUtils.formatPrice(subscriptionUtils.getYearlySavings(plan.id)),
    }));
  }
};