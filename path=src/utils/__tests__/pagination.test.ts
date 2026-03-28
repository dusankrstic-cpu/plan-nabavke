import { paginate } from '../pagination';

describe('paginate', () => {
  const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  describe('basic functionality', () => {
    it('should paginate correctly for first page', () => {
      const result = paginate(testData, 1, 3);
      
      expect(result).toEqual({
        data: [1, 2, 3],
        total: 10,
        page: 1,
        totalPages: 4,
        hasNext: true,
        hasPrev: false
      });
    });

    it('should paginate correctly for middle page', () => {
      const result = paginate(testData, 2, 3);
      
      expect(result).toEqual({
        data: [4, 5, 6],
        total: 10,
        page: 2,
        totalPages: 4,
        hasNext: true,
        hasPrev: true
      });
    });

    it('should paginate correctly for last page', () => {
      const result = paginate(testData, 4, 3);
      
      expect(result).toEqual({
        data: [10],
        total: 10,
        page: 4,
        totalPages: 4,
        hasNext: false,
        hasPrev: true
      });
    });

    it('should handle page size larger than total items', () => {
      const result = paginate(testData, 1, 20);
      
      expect(result).toEqual({
        data: testData,
        total: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should handle page size equal to total items', () => {
      const result = paginate(testData, 1, 10);
      
      expect(result).toEqual({
        data: testData,
        total: 10,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
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
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should handle single item array', () => {
      const result = paginate([1], 1, 5);
      
      expect(result).toEqual({
        data: [1],
        total: 1,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should handle page beyond total pages', () => {
      const result = paginate(testData, 10, 3);
      
      expect(result).toEqual({
        data: [],
        total: 10,
        page: 10,
        totalPages: 4,
        hasNext: false,
        hasPrev: true
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
        hasPrev: true
      });
    });
  });

  describe('different data types', () => {
    it('should work with string arrays', () => {
      const strings = ['a', 'b', 'c', 'd', 'e'];
      const result = paginate(strings, 2, 2);
      
      expect(result).toEqual({
        data: ['c', 'd'],
        total: 5,
        page: 2,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      });
    });

    it('should work with object arrays', () => {
      const objects = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ];
      const result = paginate(objects, 1, 2);
      
      expect(result).toEqual({
        data: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ],
        total: 3,
        page: 1,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
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
      expect(() => paginate(testData, 0, 5)).toThrow(RangeError);
      expect(() => paginate(testData, 0, 5)).toThrow('Page must be greater than 0');
      
      expect(() => paginate(testData, -1, 5)).toThrow(RangeError);
      expect(() => paginate(testData, -1, 5)).toThrow('Page must be greater than 0');
    });

    it('should throw RangeError for pageSize less than 1', () => {
      expect(() => paginate(testData, 1, 0)).toThrow(RangeError);
      expect(() => paginate(testData, 1, 0)).toThrow('Page size must be greater than 0');
      
      expect(() => paginate(testData, 1, -1)).toThrow(RangeError);
      expect(() => paginate(testData, 1, -1)).toThrow('Page size must be greater than 0');
    });
  });

  describe('boundary conditions', () => {
    it('should handle very large arrays efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const result = paginate(largeArray, 50, 100);
      
      expect(result.data).toHaveLength(100);
      expect(result.data[0]).toBe(4900);
      expect(result.data[99]).toBe(4999);
      expect(result.total).toBe(10000);
      expect(result.totalPages).toBe(100);
    });

    it('should handle exact division of total by page size', () => {
      const result = paginate([1, 2, 3, 4], 2, 2);
      
      expect(result).toEqual({
        data: [3, 4],
        total: 4,
        page: 2,
        totalPages: 2,
        hasNext: false,
        hasPrev: true
      });
    });
  });
});