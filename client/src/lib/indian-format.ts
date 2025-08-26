export function formatIndianCurrency(amountInPaise: number, options: {
  showDecimals?: boolean;
  showSymbol?: boolean;
} = {}): string {
  const { showDecimals = false, showSymbol = true } = options;
  const amount = amountInPaise / 100;
  
  if (!showSymbol) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

export function formatIndianNumber(num: number): string {
  if (num >= 10000000) { // 1 crore
    return `${(num / 10000000).toFixed(1)} Cr`;
  } else if (num >= 100000) { // 1 lakh
    return `${(num / 100000).toFixed(1)} L`;
  } else if (num >= 1000) { // 1 thousand
    return `${(num / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatAcres(acres: string | number): string {
  const numAcres = typeof acres === 'string' ? parseFloat(acres) : acres;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAcres);
}

export function parseIndianCurrency(value: string): number {
  // Remove currency symbol and commas, convert to paise
  const cleanValue = value.replace(/[₹,\s]/g, '');
  return Math.round(parseFloat(cleanValue) * 100);
}
