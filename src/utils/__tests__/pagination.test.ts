import { describe, it, expect } from 'vitest';
import { paginate } from '../pagination';

describe('paginate', () => {
  const testItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  describe('normal cases', () => {
    it('should paginate items correctly for first page', () => {
      const result = paginate(testItems, 1, 3);
      
      expect(result).toEqual({
        data: [1, 2, 3],
        total: 10,
        page: 1,
        totalPages: 4,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should paginate items correctly for middle page', () => {
      const result = paginate(testItems, 2, 3);
      
      expect(result).toEqual({
        data: [4, 5, 6],
        total: 10,
        page: 2,
        totalPages: 4,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should paginate items correctly for last page', () => {
      const result = paginate(testItems, 4, 3);
      
      expect(result).toEqual({
        data: [10],
        total: 10,
        page: 4,
        totalPages: 4,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should handle page size larger than total items', () => {
      const result = paginate(testItems, 1, 20);
      
      expect(result).toEqual({
        data: testItems,
        total: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should work with different data types', () => {
      const stringItems = ['a', 'b', 'c', 'd'];
      const result = paginate(stringItems, 2, 2);
      
      expect(result).toEqual({
        data: ['c', 'd'],
        total: 4,
        page: 2,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should work with object arrays', () => {
      const objectItems = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];
      const result = paginate(objectItems, 1, 2);
      
      expect(result).toEqual({
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        total: 3,
        page: 1,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const result = paginate([], 1, 5);
      
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should handle page number exceeding total pages', () => {
      const result = paginate(testItems, 10, 3);
      
      expect(result).toEqual({
        data: [10],
        total: 10,
        page: 4, // Should be clamped to last valid page
        totalPages: 4,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should handle single item array', () => {
      const result = paginate([42], 1, 1);
      
      expect(result).toEqual({
        data: [42],
        total: 1,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should handle page size of 1', () => {
      const result = paginate([1, 2, 3], 2, 1);
      
      expect(result).toEqual({
        data: [2],
        total: 3,
        page: 2,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('error conditions', () => {
    it('should throw TypeError for non-array items', () => {
      expect(() => paginate('not an array' as any, 1, 5)).toThrow(TypeError);
      expect(() => paginate('not an array' as any, 1, 5)).toThrow('Items must be an array');
    });

    it('should throw TypeError for null items', () => {
      expect(() => paginate(null as any, 1, 5)).toThrow(TypeError);
      expect(() => paginate(null as any, 1, 5)).toThrow('Items must be an array');
    });

    it('should throw TypeError for undefined items', () => {
      expect(() => paginate(undefined as any, 1, 5)).toThrow(TypeError);
      expect(() => paginate(undefined as any, 1, 5)).toThrow('Items must be an array');
    });

    it('should throw RangeError for page less than 1', () => {
      expect(() => paginate(testItems, 0, 5)).toThrow(RangeError);
      expect(() => paginate(testItems, 0, 5)).toThrow('Page must be a positive integer');
      
      expect(() => paginate(testItems, -1, 5)).toThrow(RangeError);
      expect(() => paginate(testItems, -1, 5)).toThrow('Page must be a positive integer');
    });

    it('should throw RangeError for pageSize less than 1', () => {
      expect(() => paginate(testItems, 1, 0)).toThrow(RangeError);
      expect(() => paginate(testItems, 1, 0)).toThrow('Page size must be a positive integer');
      
      expect(() => paginate(testItems, 1, -1)).toThrow(RangeError);
      expect(() => paginate(testItems, 1, -1)).toThrow('Page size must be a positive integer');
    });

    it('should throw RangeError for non-integer page', () => {
      expect(() => paginate(testItems, 1.5, 5)).toThrow(RangeError);
      expect(() => paginate(testItems, 1.5, 5)).toThrow('Page must be a positive integer');
    });

    it('should throw RangeError for non-integer pageSize', () => {
      expect(() => paginate(testItems, 1, 5.5)).toThrow(RangeError);
      expect(() => paginate(testItems, 1, 5.5)).toThrow('Page size must be a positive integer');
    });

    it('should throw RangeError for NaN page', () => {
      expect(() => paginate(testItems, NaN, 5)).toThrow(RangeError);
      expect(() => paginate(testItems, NaN, 5)).toThrow('Page must be a positive integer');
    });

    it('should throw RangeError for NaN pageSize', () => {
      expect(() => paginate(testItems, 1, NaN)).toThrow(RangeError);
      expect(() => paginate(testItems, 1, NaN)).toThrow('Page size must be a positive integer');
    });
  });
});