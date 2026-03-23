/**
 * Formats a number as currency for the specified locale
 * @param amount - The numeric amount to format
 * @param locale - The locale string (e.g., 'en-US', 'de-DE')
 * @returns Formatted currency string
 * @throws TypeError for invalid amounts
 */
export function formatCurrency(amount: number, locale: string): string {
  if (amount === null || amount === undefined) {
    throw new TypeError('Amount cannot be null or undefined');
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new TypeError('Amount must be a valid number');
  }
  
  if (typeof locale !== 'string' || !locale.trim()) {
    throw new TypeError('Locale must be a non-empty string');
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: getCurrencyForLocale(locale)
    }).format(amount);
  } catch (error) {
    throw new TypeError(`Invalid locale: ${locale}`);
  }
}

/**
 * Parses a currency string back to a number
 * @param str - The currency string to parse
 * @returns The parsed number or null if parsing fails
 */
export function parseCurrency(str: string): number | null {
  if (typeof str !== 'string' || !str.trim()) {
    return null;
  }
  
  // Remove currency symbols and formatting, keep numbers, decimal points, and minus signs
  const cleaned = str.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  
  // Handle negative numbers (minus at start or in parentheses)
  const isNegative = str.includes('-') || (str.includes('(') && str.includes(')'));
  
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    return null;
  }
  
  return isNegative ? -Math.abs(parsed) : parsed;
}

/**
 * Gets the default currency code for a locale
 * @param locale - The locale string
 * @returns Currency code (e.g., 'USD', 'EUR')
 */
function getCurrencyForLocale(locale: string): string {
  const currencyMap: Record<string, string> = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'ja-JP': 'JPY',
    'zh-CN': 'CNY',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'pt-BR': 'BRL',
    'ru-RU': 'RUB',
    'ko-KR': 'KRW',
    'ar-SA': 'SAR',
    'hi-IN': 'INR',
    'th-TH': 'THB'
  };
  
  return currencyMap[locale] || 'USD';
}