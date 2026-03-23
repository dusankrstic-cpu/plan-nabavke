/**
 * Currency utility functions for formatting and parsing currency values
 */

/**
 * Formats a numeric amount as currency string for the given locale
 * @param amount - The numeric amount to format
 * @param locale - The locale string (e.g., 'en-US', 'de-DE', 'ja-JP')
 * @returns Formatted currency string
 * @throws TypeError for invalid amounts or unsupported locales
 */
export function formatCurrency(amount: number, locale: string = 'en-US'): string {
  // Validate amount parameter
  if (amount === null || amount === undefined) {
    throw new TypeError('Amount cannot be null or undefined');
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new TypeError('Amount must be a valid number');
  }

  // Validate locale parameter
  if (typeof locale !== 'string' || locale.trim() === '') {
    throw new TypeError('Locale must be a non-empty string');
  }

  try {
    // Use Intl.NumberFormat to format currency
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: getCurrencyForLocale(locale),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  } catch (error) {
    throw new TypeError(`Unsupported locale: ${locale}`);
  }
}

/**
 * Parses a currency string and returns the numeric value
 * @param str - The currency string to parse
 * @param locale - The locale string (optional, defaults to 'en-US')
 * @returns Parsed numeric value or null if parsing fails
 */
export function parseCurrency(str: string, locale: string = 'en-US'): number | null {
  // Validate input string
  if (typeof str !== 'string') {
    return null;
  }

  const trimmedStr = str.trim();
  if (trimmedStr === '') {
    return null;
  }

  // Validate locale parameter
  if (typeof locale !== 'string' || locale.trim() === '') {
    return null;
  }

  try {
    // Remove currency symbols and formatting based on locale
    let cleanStr = trimmedStr;
    
    // Get locale-specific formatting info
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: getCurrencyForLocale(locale),
    });

    // Get the currency symbol for this locale
    const parts = formatter.formatToParts(1234.56);
    const currencySymbol = parts.find(part => part.type === 'currency')?.value || '';
    const decimalSeparator = parts.find(part => part.type === 'decimal')?.value || '.';
    const groupSeparator = parts.find(part => part.type === 'group')?.value || ',';

    // Remove currency symbol
    if (currencySymbol) {
      cleanStr = cleanStr.replace(new RegExp(escapeRegExp(currencySymbol), 'g'), '');
    }

    // Remove whitespace
    cleanStr = cleanStr.trim();

    // Handle negative numbers (parentheses or minus sign)
    let isNegative = false;
    if (cleanStr.startsWith('(') && cleanStr.endsWith(')')) {
      isNegative = true;
      cleanStr = cleanStr.slice(1, -1);
    } else if (cleanStr.startsWith('-')) {
      isNegative = true;
      cleanStr = cleanStr.slice(1);
    }

    // Remove group separators
    if (groupSeparator && groupSeparator !== decimalSeparator) {
      cleanStr = cleanStr.replace(new RegExp(escapeRegExp(groupSeparator), 'g'), '');
    }

    // Convert decimal separator to standard dot
    if (decimalSeparator !== '.') {
      cleanStr = cleanStr.replace(new RegExp(escapeRegExp(decimalSeparator), 'g'), '.');
    }

    // Parse the cleaned string
    const parsed = parseFloat(cleanStr);
    
    if (isNaN(parsed)) {
      return null;
    }

    return isNegative ? -parsed : parsed;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the default currency code for a given locale
 * @param locale - The locale string
 * @returns Currency code (e.g., 'USD', 'EUR', 'JPY')
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
    'hi-IN': 'INR',
    'ar-SA': 'SAR',
  };

  // Try exact match first
  if (currencyMap[locale]) {
    return currencyMap[locale];
  }

  // Try language-only match
  const language = locale.split('-')[0];
  const languageMap: Record<string, string> = {
    'en': 'USD',
    'de': 'EUR',
    'fr': 'EUR',
    'ja': 'JPY',
    'zh': 'CNY',
    'es': 'EUR',
    'it': 'EUR',
    'pt': 'BRL',
    'ru': 'RUB',
    'ko': 'KRW',
    'hi': 'INR',
    'ar': 'SAR',
  };

  return languageMap[language] || 'USD';
}

/**
 * Escapes special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}