const { clamp, lerp, roundTo } = require('../utils/math');

describe('Math utilities', () => {
  describe('clamp', () => {
    it('should clamp value within normal range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases and invalid inputs', () => {
      // When min > max, should swap them
      expect(clamp(5, 10, 0)).toBe(5);
      expect(clamp(-5, 10, 0)).toBe(0);
      expect(clamp(15, 10, 0)).toBe(10);
      
      // Should return NaN for NaN inputs
      expect(clamp(NaN, 0, 10)).toBeNaN();
      expect(clamp(5, NaN, 10)).toBeNaN();
      expect(clamp(5, 0, NaN)).toBeNaN();
      
      // Should throw TypeError for non-numeric inputs
      expect(() => clamp('5', 0, 10)).toThrow(TypeError);
      expect(() => clamp(5, '0', 10)).toThrow(TypeError);
      expect(() => clamp(5, 0, '10')).toThrow(TypeError);
    });
  });

  describe('lerp', () => {
    it('should interpolate between two values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(10, 20, 0.3)).toBe(13);
    });

    it('should handle t values outside 0-1 range and invalid inputs', () => {
      // t values outside 0-1 range should extrapolate
      expect(lerp(0, 10, -0.5)).toBe(-5);
      expect(lerp(0, 10, 1.5)).toBe(15);
      
      // Should return NaN for NaN inputs
      expect(lerp(NaN, 10, 0.5)).toBeNaN();
      expect(lerp(0, NaN, 0.5)).toBeNaN();
      expect(lerp(0, 10, NaN)).toBeNaN();
      
      // Should throw TypeError for non-numeric inputs
      expect(() => lerp('0', 10, 0.5)).toThrow(TypeError);
      expect(() => lerp(0, '10', 0.5)).toThrow(TypeError);
      expect(() => lerp(0, 10, '0.5')).toThrow(TypeError);
    });
  });

  describe('roundTo', () => {
    it('should round to specified decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 0)).toBe(3);
      expect(roundTo(3.14159, 4)).toBe(3.1416);
      expect(roundTo(2.5, 0)).toBe(3); // Math.round behavior
    });

    it('should handle negative decimals and invalid inputs', () => {
      // Negative decimals should be treated as 0
      expect(roundTo(3.14159, -1)).toBe(3);
      expect(roundTo(3.14159, -5)).toBe(3);
      
      // Should return NaN for NaN inputs
      expect(roundTo(NaN, 2)).toBeNaN();
      expect(roundTo(3.14, NaN)).toBeNaN();
      
      // Should throw TypeError for non-numeric inputs
      expect(() => roundTo('3.14', 2)).toThrow(TypeError);
      expect(() => roundTo(3.14, '2')).toThrow(TypeError);
    });
  });
});