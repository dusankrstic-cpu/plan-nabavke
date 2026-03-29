import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency } from '../currency';

describe('formatCurrency', () => {
  describe('basic functionality', () => {
    it('formats USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'en-US')).toBe('$1,234.56');
      expect(formatCurrency(0, 'en-US')).toBe('$0.00');
      expect(formatCurrency(1, 'en-US')).toBe('$1.00');
    });

    it('formats EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'de-DE')).toMatch(/1\.234,56\s*€|1\.234,56\s*EUR/);
      expect(formatCurrency(0, 'de-DE')).toMatch(/0,00\s*€|0,00\s*EUR/);
    });

    it('formats JPY currency correctly', () => {
      expect(formatCurrency(1234.56, 'ja-JP')).toMatch(/¥1,235|￥1,235/); // JPY rounds to whole numbers
      expect(formatCurrency(0, 'ja-JP')).toMatch(/¥0|￥0/);
    });

    it('formats GBP currency correctly', () => {
      expect(formatCurrency(1234.56, 'en-GB')).toBe('£1,234.56');
    });

    it('uses default locale when not specified', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
  });

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      expect(formatCurrency(-1234.56, 'en-US')).toBe('-$1,234.56');
      expect(formatCurrency(-0, 'en-US')).toBe('$0.00');
    });

    it('handles very large numbers', () => {
      expect(formatCurrency(999999999.99, 'en-US')).toBe('$999,999,999.99');
    });

    it('handles very small numbers', () => {
      expect(formatCurrency(0.01, 'en-US')).toBe('$0.01');
      expect(formatCurrency(0.001, 'en-US')).toBe('$0.00'); // Rounds to 2 decimal places
    });

    it('handles decimal precision', () => {
      expect(formatCurrency(1.234, 'en-US')).toBe('$1.23');
      expect(formatCurrency(1.235, 'en-US')).toBe('$1.24'); // Rounds up
      expect(formatCurrency(1.999, 'en-US')).toBe('$2.00');
    });
  });

  describe('error handling', () => {
    it('throws TypeError for null amount', () => {
      expect(() => formatCurrency(null as any, 'en-US')).toThrow(TypeError);
      expect(() => formatCurrency(null as any, 'en-US')).toThrow('Amount cannot be null or undefined');
    });

    it('throws TypeError for undefined amount', () => {
      expect(() => formatCurrency(undefined as any, 'en-US')).toThrow(TypeError);
      expect(() => formatCurrency(undefined as any, 'en-US')).toThrow('Amount cannot be null or undefined');
    });

    it('throws TypeError for NaN amount', () => {
      expect(() => formatCurrency(NaN, 'en-US')).toThrow(TypeError);
      expect(() => formatCurrency(NaN, 'en-US')).toThrow('Amount must be a valid number');
    });

    it('throws TypeError for non-numeric amount', () => {
      expect(() => formatCurrency('123' as any, 'en-US')).toThrow(TypeError);
      expect(() => formatCurrency('123' as any, 'en-US')).toThrow('Amount must be a valid number');
    });

    it('throws TypeError for invalid locale', () => {
      expect(() => formatCurrency(123, '')).toThrow(TypeError);
      expect(() => formatCurrency(123, '')).toThrow('Locale must be a non-empty string');
      
      expect(() => formatCurrency(123, null as any)).toThrow(TypeError);
      expect(() => formatCurrency(123, null as any)).toThrow('Locale must be a non-empty string');
    });

    it('throws TypeError for unsupported locale', () => {
      expect(() => formatCurrency(123, 'invalid-locale')).toThrow(TypeError);
      expect(() => formatCurrency(123, 'invalid-locale')).toThrow('Unsupported locale: invalid-locale');
    });
  });
});

describe('parseCurrency', () => {
  describe('basic functionality', () => {
    it('parses USD currency strings correctly', () => {
      expect(parseCurrency('$1,234.56', 'en-US')).toBe(1234.56);
      expect(parseCurrency('$0.00', 'en-US')).toBe(0);
      expect(parseCurrency('$1.00', 'en-US')).toBe(1);
      expect(parseCurrency('$123', 'en-US')).toBe(123);
    });

    it('parses EUR currency strings correctly', () => {
      expect(parseCurrency('1.234,56 €', 'de-DE')).toBe(1234.56);
      expect(parseCurrency('0,00 €', 'de-DE')).toBe(0);
      expect(parseCurrency('123 €', 'de-DE')).toBe(123);
    });

    it('parses JPY currency strings correctly', () => {
      expect(parseCurrency('¥1,235', 'ja-JP')).toBe(1235);
      expect(parseCurrency('¥0', 'ja-JP')).toBe(0);
      expect(parseCurrency('￥123', 'ja-JP')).toBe(123);
    });

    it('parses GBP currency strings correctly', () => {
      expect(parseCurrency('£1,234.56', 'en-GB')).toBe(1234.56);
      expect(parseCurrency('£0.00', 'en-GB')).toBe(0);
    });

    it('uses default locale when not specified', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
    });
  });

  describe('edge cases', () => {
    it('handles negative numbers with minus sign', () => {
      expect(parseCurrency('-$1,234.56', 'en-US')).toBe(-1234.56);
      expect(parseCurrency('-$0.00', 'en-US')).toBe(0);
    });

    it('handles negative numbers with parentheses', () => {
      expect(parseCurrency('($1,234.56)', 'en-US')).toBe(-1234.56);
      expect(parseCurrency('($0.00)', 'en-US')).toBe(0);
    });

    it('handles strings without currency symbols', () => {
      expect(parseCurrency('1,234.56', 'en-US')).toBe(1234.56);
      expect(parseCurrency('123.45', 'en-US')).toBe(123.45);
      expect(parseCurrency('0', 'en-US')).toBe(0);
    });

    it('handles strings with extra whitespace', () => {
      expect(parseCurrency('  $1,234.56  ', 'en-US')).toBe(1234.56);
      expect(parseCurrency('\t$123.45\n', 'en-US')).toBe(123.45);
    });

    it('handles very large numbers', () => {
      expect(parseCurrency('$999,999,999.99', 'en-US')).toBe(999999999.99);
    });

    it('handles very small numbers', () => {
      expect(parseCurrency('$0.01', 'en-US')).toBe(0.01);
      expect(parseCurrency('$0.001', 'en-US')).toBe(0.001);
    });
  });

  describe('error handling', () => {
    it('returns null for non-string input', () => {
      expect(parseCurrency(123 as any, 'en-US')).toBeNull();
      expect(parseCurrency(null as any, 'en-US')).toBeNull();
      expect(parseCurrency(undefined as any, 'en-US')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseCurrency('', 'en-US')).toBeNull();
      expect(parseCurrency('   ', 'en-US')).toBeNull();
    });

    it('returns null for invalid currency strings', () => {
      expect(parseCurrency('abc', 'en-US')).toBeNull();
      expect(parseCurrency('$abc', 'en-US')).toBeNull();
      expect(parseCurrency('$12.34.56', 'en-US')).toBeNull();
      expect(parseCurrency('$$123', 'en-US')).toBeNull();
    });

    it('returns null for invalid locale', () => {
      expect(parseCurrency('$123.45', '')).toBeNull();
      expect(parseCurrency('$123.45', null as any)).toBeNull();
      expect(parseCurrency('$123.45', undefined as any)).toBeNull();
    });

    it('handles malformed currency formats gracefully', () => {
      expect(parseCurrency('$1,2,3,4.56', 'en-US')).toBeNull();
      expect(parseCurrency('$1.234.56', 'en-US')).toBeNull();
      expect(parseCurrency('$-123', 'en-US')).toBe(-123); // This should work
    });
  });

  describe('locale-specific parsing', () => {
    it('handles different decimal separators', () => {
      expect(parseCurrency('1.234,56 €', 'de-DE')).toBe(1234.56);
      expect(parseCurrency('1,234.56', 'en-US')).toBe(1234.56);
    });

    it('handles different group separators', () => {
      expect(parseCurrency('1.234,56', 'de-DE')).toBe(1234.56);
      expect(parseCurrency('1,234.56', 'en-US')).toBe(1234.56);
      expect(parseCurrency('1 234,56', 'fr-FR')).toBe(1234.56);
    });

    it('handles currencies without decimal places', () => {
      expect(parseCurrency('¥1,235', 'ja-JP')).toBe(1235);
      expect(parseCurrency('₩1,235', 'ko-KR')).toBe(1235);
    });
  });
});

describe('integration tests', () => {
  it('format and parse round trip works correctly', () => {
    const testCases = [
      { amount: 1234.56, locale: 'en-US' },
      { amount: 0, locale: 'en-US' },
      { amount: -1234.56, locale: 'en-US' },
      { amount: 999999.99, locale: 'en-US' },
      { amount: 0.01, locale: 'en-US' },
    ];

    testCases.forEach(({ amount, locale }) => {
      const formatted = formatCurrency(amount, locale);
      const parsed = parseCurrency(formatted, locale);
      expect(parsed).toBeCloseTo(amount, 2);
    });
  });

  it('handles edge case round trips', () => {
    // Test with different locales
    const amount = 1234.56;
    const locales = ['en-US', 'en-GB', 'de-DE'];
    
    locales.forEach(locale => {
      const formatted = formatCurrency(amount, locale);
      const parsed = parseCurrency(formatted, locale);
      expect(parsed).toBeCloseTo(amount, 2);
    });
  });
});