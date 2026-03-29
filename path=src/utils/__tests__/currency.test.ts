import { formatCurrency, parseCurrency } from '../currency';

describe('formatCurrency', () => {
  describe('basic formatting', () => {
    it('formats USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'en-US')).toBe('$1,234.56');
    });

    it('formats EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'de-DE')).toBe('1.234,56 €');
    });

    it('formats GBP currency correctly', () => {
      expect(formatCurrency(1234.56, 'en-GB')).toBe('£1,234.56');
    });

    it('formats JPY currency correctly', () => {
      expect(formatCurrency(1234, 'ja-JP')).toBe('¥1,234');
    });
  });

  describe('edge cases', () => {
    it('formats zero correctly', () => {
      expect(formatCurrency(0, 'en-US')).toBe('$0.00');
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56, 'en-US')).toBe('-$1,234.56');
    });

    it('formats very large numbers', () => {
      expect(formatCurrency(1234567890.12, 'en-US')).toBe('$1,234,567,890.12');
    });

    it('formats very small numbers', () => {
      expect(formatCurrency(0.01, 'en-US')).toBe('$0.01');
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

    it('throws TypeError for non-number amount', () => {
      expect(() => formatCurrency('123' as any, 'en-US')).toThrow(TypeError);
      expect(() => formatCurrency('123' as any, 'en-US')).toThrow('Amount must be a valid number');
    });

    it('throws TypeError for empty locale', () => {
      expect(() => formatCurrency(123, '')).toThrow(TypeError);
      expect(() => formatCurrency(123, '')).toThrow('Locale must be a non-empty string');
    });

    it('throws TypeError for invalid locale', () => {
      expect(() => formatCurrency(123, 'invalid-locale')).toThrow(TypeError);
      expect(() => formatCurrency(123, 'invalid-locale')).toThrow('Invalid locale: invalid-locale');
    });
  });
});

describe('parseCurrency', () => {
  describe('basic parsing', () => {
    it('parses USD currency strings', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
      expect(parseCurrency('$1234.56')).toBe(1234.56);
      expect(parseCurrency('1,234.56')).toBe(1234.56);
    });

    it('parses EUR currency strings', () => {
      expect(parseCurrency('1.234,56 €')).toBe(1234.56);
      expect(parseCurrency('€1,234.56')).toBe(1234.56);
    });

    it('parses negative currency strings', () => {
      expect(parseCurrency('-$1,234.56')).toBe(-1234.56);
      expect(parseCurrency('($1,234.56)')).toBe(-1234.56);
    });

    it('parses zero values', () => {
      expect(parseCurrency('$0.00')).toBe(0);
      expect(parseCurrency('$0')).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles strings with only numbers', () => {
      expect(parseCurrency('1234.56')).toBe(1234.56);
      expect(parseCurrency('1234')).toBe(1234);
    });

    it('handles various currency symbols', () => {
      expect(parseCurrency('¥1,234')).toBe(1234);
      expect(parseCurrency('£1,234.56')).toBe(1234.56);
    });

    it('handles whitespace', () => {
      expect(parseCurrency(' $1,234.56 ')).toBe(1234.56);
    });
  });

  describe('error handling', () => {
    it('returns null for empty string', () => {
      expect(parseCurrency('')).toBeNull();
      expect(parseCurrency('   ')).toBeNull();
    });

    it('returns null for non-string input', () => {
      expect(parseCurrency(null as any)).toBeNull();
      expect(parseCurrency(undefined as any)).toBeNull();
      expect(parseCurrency(123 as any)).toBeNull();
    });

    it('returns null for invalid currency strings', () => {
      expect(parseCurrency('abc')).toBeNull();
      expect(parseCurrency('$abc')).toBeNull();
      expect(parseCurrency('not a number')).toBeNull();
    });

    it('returns null for malformed numbers', () => {
      expect(parseCurrency('$1.2.3')).toBeNull();
      expect(parseCurrency('$1,2,3,4.5.6')).toBeNull();
    });
  });
});