// Government schemes data for farmer awareness and support
// Based on official Government of India agricultural schemes 2025

export interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  category: 'income_support' | 'credit' | 'insurance' | 'subsidy' | 'training';
  eligibility: string[];
  documents: string[];
  benefits: string;
  applicationProcess: string;
  officialLink: string;
  contactNumber?: string;
  deadline?: string;
  isActive: boolean;
}

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Direct income support to all landholding farmers families to supplement their financial needs for agriculture and allied activities.',
    category: 'income_support',
    eligibility: [
      'All landholder farmers families',
      'Cultivable land holding regardless of size',
      'Valid Aadhaar card',
      'Bank account details'
    ],
    documents: [
      'Aadhaar Card',
      'Bank Account Details (Passbook)',
      'Land ownership papers',
      'Self-declaration certificate'
    ],
    benefits: '₹6,000 per year in 3 equal installments of ₹2,000 each via Direct Benefit Transfer (DBT)',
    applicationProcess: 'Apply online at pmkisan.gov.in or visit nearest Common Service Center (CSC)',
    officialLink: 'https://pmkisan.gov.in',
    contactNumber: '011-23381092',
    isActive: true
  },
  
  {
    id: 'pmfby',
    title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage arising out of unforeseen events.',
    category: 'insurance',
    eligibility: [
      'All farmers growing notified crops',
      'Sharecroppers and tenant farmers',
      'Compulsory for loanee farmers',
      'Voluntary for non-loanee farmers'
    ],
    documents: [
      'Land records (Khata/Khatauni)',
      'Aadhaar Card',
      'Bank account details',
      'Sowing certificate (for non-loanee)',
      'NOC from landowner (for tenant farmers)'
    ],
    benefits: 'Premium subsidy: Government pays 95% of premium for small/marginal farmers, 90% for others',
    applicationProcess: 'Through banks, insurance companies, CSCs, or online portal during notified period',
    officialLink: 'https://pmfby.gov.in',
    contactNumber: '011-23382012',
    deadline: 'Within 2 weeks of sowing (Kharif: July 31, Rabi: December 31)',
    isActive: true
  },
  
  {
    id: 'kcc',
    title: 'KCC (Kisan Credit Card)',
    description: 'Credit support for farmers for comprehensive credit requirements including crop production, maintenance of farm assets and consumption needs.',
    category: 'credit',
    eligibility: [
      'All farmers - individual/joint borrowers',
      'Tenant farmers, oral lessees, sharecroppers',
      'Self Help Group members',
      'Minimum age: 18 years, Maximum: 75 years'
    ],
    documents: [
      'Application form with photograph',
      'Identity proof (Aadhaar/Voter ID)',
      'Address proof',
      'Land ownership/cultivation proof',
      'No objection from landowner (for tenant farmers)'
    ],
    benefits: 'Flexible credit limit, low interest rate (4% for prompt repayment), no collateral up to ₹1.6 lakh',
    applicationProcess: 'Apply at nearest bank branch or online banking portal',
    officialLink: 'https://www.nabard.org/content1.aspx?id=518&catid=23',
    contactNumber: '1800-425-0018',
    isActive: true
  },
  
  {
    id: 'soil-health-card',
    title: 'Soil Health Card Scheme',
    description: 'Soil testing and providing soil health cards to farmers with recommendations on appropriate dosage of nutrients and fertilizers.',
    category: 'subsidy',
    eligibility: [
      'All farmers across the country',
      'Land holding farmers',
      'Tenant farmers with valid documents'
    ],
    documents: [
      'Land ownership documents',
      'Aadhaar Card',
      'Application form',
      'Soil sample (as per guidelines)'
    ],
    benefits: 'Free soil testing and nutrient recommendations, improve soil fertility and reduce fertilizer cost',
    applicationProcess: 'Contact local agriculture department or soil testing laboratories',
    officialLink: 'https://soilhealth.dac.gov.in',
    contactNumber: '011-23073376',
    isActive: true
  },
  
  {
    id: 'atma',
    title: 'ATMA (Agricultural Technology Management Agency)',
    description: 'Extension support system for farmers through technology dissemination, capacity building and skill development.',
    category: 'training',
    eligibility: [
      'All categories of farmers',
      'Farm women and youth',
      'Farmer Producer Organizations (FPOs)',
      'Rural youth interested in agriculture'
    ],
    documents: [
      'Identity proof',
      'Address proof',
      'Land documents (if applicable)',
      'Educational certificates (for specific programs)'
    ],
    benefits: 'Free training programs, demonstration plots, technology transfer, market linkages',
    applicationProcess: 'Contact district ATMA office or local agriculture extension officer',
    officialLink: 'https://agricoop.nic.in/atma',
    contactNumber: '011-23382651',
    isActive: true
  }
];

// Utility functions for schemes
export const schemeUtils = {
  getSchemesByCategory: (category: GovernmentScheme['category']) => 
    GOVERNMENT_SCHEMES.filter(scheme => scheme.category === category),
  
  getActiveSchemes: () => 
    GOVERNMENT_SCHEMES.filter(scheme => scheme.isActive),
  
  searchSchemes: (query: string) => 
    GOVERNMENT_SCHEMES.filter(scheme => 
      scheme.title.toLowerCase().includes(query.toLowerCase()) ||
      scheme.description.toLowerCase().includes(query.toLowerCase())
    ),
  
  getSchemeById: (id: string) => 
    GOVERNMENT_SCHEMES.find(scheme => scheme.id === id),
  
  getCategoryName: (category: GovernmentScheme['category']): string => {
    const categoryNames = {
      income_support: 'Income Support',
      credit: 'Credit & Loans',
      insurance: 'Insurance',
      subsidy: 'Subsidies',
      training: 'Training & Capacity Building'
    };
    return categoryNames[category];
  },
  
  getCategoryIcon: (category: GovernmentScheme['category']): string => {
    const categoryIcons = {
      income_support: '💰',
      credit: '🏦',
      insurance: '🛡️',
      subsidy: '🎯',
      training: '📚'
    };
    return categoryIcons[category];
  }
};