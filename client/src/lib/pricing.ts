// National three-tier subscription pricing for AgriConnect
// Based on India's agricultural economic data 2025-26

// Economic context data based on Government of India reports
export const economicContext = {
  // Average monthly farmer income (INR) - varies by farm size
  avgFarmerIncome: {
    smallholder: 8500, // < 2 acres
    midScale: 25000, // 2-10 acres  
    largScale: 75000, // > 10 acres
  },
  
  // GDP Agriculture growth rate 2025-26 estimate
  agriGdpGrowth: 3.2,
  
  // Budget 2025-26 Agriculture & Rural Development allocation
  govtBudgetAllocation: 1950000000000, // ₹1.95 lakh crores
  
  // Recommended affordability threshold (% of monthly income)
  affordabilityThreshold: {
    basic: 1.5, // 1.5% of monthly income
    pro: 3.0,   // 3.0% of monthly income  
    enterprise: 5.0, // 5.0% of monthly income
  }
};

// Three-tier national subscription plans
export const subscriptionTiers = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    tagline: 'For Smallholder Farmers',
    description: 'Essential tools for small-scale farming operations',
    monthlyPrice: 99, // ₹99/month
    yearlyPrice: 999, // ₹999/year (2 months free)
    targetIncome: economicContext.avgFarmerIncome.smallholder,
    affordabilityPercent: 1.2, // 1.2% of avg smallholder income
    features: [
      'Up to 3 land listings',
      'Basic tenant search',
      'Standard messaging',
      'Mobile app access',
      'Government scheme alerts',
      'Basic crop advisory',
    ],
    limits: {
      landListings: 3,
      tenancyRequests: 10,
      escrowProtection: false,
      prioritySupport: false,
      governmentSchemeAccess: true,
      advancedAnalytics: false,
      multiLanguageSupport: true,
    }
  },
  
  pro: {
    id: 'pro',
    name: 'Pro Plan', 
    tagline: 'For Mid-Scale Farms & Agri-Entrepreneurs',
    description: 'Advanced features for growing agricultural businesses',
    monthlyPrice: 499, // ₹499/month
    yearlyPrice: 4999, // ₹4999/year (2 months free)
    targetIncome: economicContext.avgFarmerIncome.midScale,
    affordabilityPercent: 2.0, // 2.0% of avg mid-scale income
    features: [
      'Unlimited land listings',
      'Advanced search filters',
      'Priority tenant matching',
      'Escrow payment protection',
      'Detailed analytics dashboard',
      'Government subsidy calculator',
      'Multi-language support',
      'Priority customer support',
      'Crop yield predictions',
      'Market price alerts',
    ],
    limits: {
      landListings: -1, // Unlimited
      tenancyRequests: 50,
      escrowProtection: true,
      prioritySupport: true,
      governmentSchemeAccess: true,
      advancedAnalytics: true,
      multiLanguageSupport: true,
    }
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    tagline: 'For Large-Scale Landowners & Cooperatives',
    description: 'Comprehensive solution for large agricultural operations',
    monthlyPrice: 1999, // ₹1999/month
    yearlyPrice: 19999, // ₹19999/year (2 months free)
    targetIncome: economicContext.avgFarmerIncome.largScale,
    affordabilityPercent: 2.7, // 2.7% of avg large-scale income
    features: [
      'Unlimited land listings',
      'Bulk tenant management',
      'Advanced escrow services',
      'Dedicated account manager',
      'Custom integrations',
      'White-label solutions',
      'Advanced reporting & analytics',
      'API access',
      'Government compliance tools',
      'Multi-location management',
      'Custom contract templates',
      'Priority 24/7 support',
    ],
    limits: {
      landListings: -1, // Unlimited
      tenancyRequests: -1, // Unlimited
      escrowProtection: true,
      prioritySupport: true,
      governmentSchemeAccess: true,
      advancedAnalytics: true,
      multiLanguageSupport: true,
    }
  }
};

// Utility functions for pricing calculations
export const pricingUtils = {
  // Calculate affordability as percentage of income
  calculateAffordability: (planPrice: number, monthlyIncome: number): number => {
    return (planPrice / monthlyIncome) * 100;
  },
  
  // Get recommended plan based on farm size
  getRecommendedPlan: (farmSizeAcres: number): string => {
    if (farmSizeAcres <= 2) return 'basic';
    if (farmSizeAcres <= 10) return 'pro';
    return 'enterprise';
  },
  
  // Calculate yearly savings
  getYearlySavings: (planId: string): number => {
    const plan = subscriptionTiers[planId as keyof typeof subscriptionTiers];
    const monthlyTotal = plan.monthlyPrice * 12;
    return monthlyTotal - plan.yearlyPrice;
  },
  
  // Format price for Indian currency
  formatPrice: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  },
  
  // Get plan comparison data
  getPlanComparison: () => {
    return Object.values(subscriptionTiers).map(plan => ({
      ...plan,
      formattedMonthlyPrice: pricingUtils.formatPrice(plan.monthlyPrice),
      formattedYearlyPrice: pricingUtils.formatPrice(plan.yearlyPrice),
      yearlySavings: pricingUtils.getYearlySavings(plan.id),
      formattedSavings: pricingUtils.formatPrice(pricingUtils.getYearlySavings(plan.id)),
    }));
  }
};

// Government scheme integration data
export const governmentSchemes = {
  // Key schemes for agricultural development
  schemes: [
    {
      name: 'PM-KISAN',
      description: 'Income support for farmers',
      benefit: '₹6000/year in 3 installments',
      eligibility: 'All landholder farmers',
      category: 'income_support'
    },
    {
      name: 'Kisan Credit Card (KCC)',
      description: 'Credit support for farmers',
      benefit: 'Low interest agricultural loans',
      eligibility: 'Farmers with land records',
      category: 'credit'
    },
    {
      name: 'PM Fasal Bima Yojana',
      description: 'Crop insurance scheme',
      benefit: 'Premium subsidy up to 90%',
      eligibility: 'All farmers growing notified crops',
      category: 'insurance'
    }
  ]
};

// Constants for form data and filtering
export const STATES = [
  { value: "andhra-pradesh", label: "Andhra Pradesh", hindi: "आंध्र प्रदेश" },
  { value: "arunachal-pradesh", label: "Arunachal Pradesh", hindi: "अरुणाचल प्रदेश" },
  { value: "assam", label: "Assam", hindi: "असम" },
  { value: "bihar", label: "Bihar", hindi: "बिहार" },
  { value: "chhattisgarh", label: "Chhattisgarh", hindi: "छत्तीसगढ़" },
  { value: "goa", label: "Goa", hindi: "गोवा" },
  { value: "gujarat", label: "Gujarat", hindi: "गुजरात" },
  { value: "haryana", label: "Haryana", hindi: "हरियाणा" },
  { value: "himachal-pradesh", label: "Himachal Pradesh", hindi: "हिमाचल प्रदेश" },
  { value: "jharkhand", label: "Jharkhand", hindi: "झारखंड" },
  { value: "karnataka", label: "Karnataka", hindi: "कर्नाटक" },
  { value: "kerala", label: "Kerala", hindi: "केरल" },
  { value: "madhya-pradesh", label: "Madhya Pradesh", hindi: "मध्य प्रदेश" },
  { value: "maharashtra", label: "Maharashtra", hindi: "महाराष्ट्र" },
  { value: "manipur", label: "Manipur", hindi: "मणिपुर" },
  { value: "meghalaya", label: "Meghalaya", hindi: "मेघालय" },
  { value: "mizoram", label: "Mizoram", hindi: "मिजोरम" },
  { value: "nagaland", label: "Nagaland", hindi: "नागालैंड" },
  { value: "odisha", label: "Odisha", hindi: "ओडिशा" },
  { value: "punjab", label: "Punjab", hindi: "पंजाब" },
  { value: "rajasthan", label: "Rajasthan", hindi: "राजस्थान" },
  { value: "sikkim", label: "Sikkim", hindi: "सिक्किम" },
  { value: "tamil-nadu", label: "Tamil Nadu", hindi: "तमिल नाडु" },
  { value: "telangana", label: "Telangana", hindi: "तेलंगाना" },
  { value: "tripura", label: "Tripura", hindi: "त्रिपुरा" },
  { value: "uttar-pradesh", label: "Uttar Pradesh", hindi: "उत्तर प्रदेश" },
  { value: "uttarakhand", label: "Uttarakhand", hindi: "उत्तराखंड" },
  { value: "west-bengal", label: "West Bengal", hindi: "पश्चिम बंगाल" }
];

export const CROPS = [
  "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Soybean", "Groundnut",
  "Sunflower", "Sesame", "Mustard", "Potato", "Onion", "Tomato", "Chili",
  "Turmeric", "Coriander", "Cumin", "Fenugreek", "Chickpea", "Pigeon Pea",
  "Black Gram", "Green Gram", "Lentil", "Field Pea", "Banana", "Mango",
  "Coconut", "Areca Nut", "Cardamom", "Pepper", "Ginger", "Tea", "Coffee"
];

export const SOIL_TYPES = [
  "Alluvial", "Black Cotton", "Red", "Laterite", "Mountain", "Desert",
  "Saline", "Peaty", "Forest"
];

export const IRRIGATION_TYPES = [
  "Canal", "Tube Well", "Well", "Tank", "River", "Sprinkler", "Drip",
  "Rainfed", "Lift Irrigation"
];

// Utility function to get plan features
export const getPlanFeatures = (planId: string) => {
  const plan = subscriptionTiers[planId as keyof typeof subscriptionTiers];
  return plan ? plan.features : [];
};

export default {
  economicContext,
  subscriptionTiers,
  pricingUtils,
  governmentSchemes,
  STATES,
  CROPS,
  SOIL_TYPES,
  IRRIGATION_TYPES,
  getPlanFeatures,
};