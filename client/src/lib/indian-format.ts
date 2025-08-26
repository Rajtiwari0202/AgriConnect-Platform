// Indian currency formatting utility
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format numbers in Indian number system (lakhs, crores)
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + ' Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(1) + ' L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format area in Indian context
export function formatArea(acres: number): string {
  if (acres < 1) {
    // Convert to gunta (1 acre = 40 gunta in some regions)
    const gunta = acres * 40;
    return `${gunta.toFixed(1)} gunta`;
  }
  return `${acres} acres`;
}

// Legacy alias for backwards compatibility
export const formatAcres = formatArea;

// Format distance for Indian context
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} meters`;
  }
  return `${km.toFixed(1)} km`;
}