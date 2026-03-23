import { isWeekend, addDays, daysBetween } from './dateUtils';

describe('dateUtils', () => {
  describe('isWeekend', () => {
    it('should return true for Saturday and Sunday', () => {
      const saturday = new Date('2023-12-16'); // Saturday
      const sunday = new Date('2023-12-17'); // Sunday
      
      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekdays', () => {
      const monday = new Date('2023-12-18'); // Monday
      const friday = new Date('2023-12-22'); // Friday
      
      expect(isWeekend(monday)).toBe(false);
      expect(isWeekend(friday)).toBe(false);
    });

    it('should throw TypeError for invalid date', () => {
      expect(() => isWeekend(null as any)).toThrow(TypeError);
      expect(() => isWeekend(undefined as any)).toThrow(TypeError);
      expect(() => isWeekend(new Date('invalid'))).toThrow(TypeError);
    });
  });

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const date = new Date('2023-12-15');
      const result = addDays(date, 5);
      
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(11); // December = 11
      expect(result.getFullYear()).toBe(2023);
    });

    it('should subtract days when given negative number', () => {
      const date = new Date('2023-12-15');
      const result = addDays(date, -5);
      
      expect(result.getDate()).toBe(10);
      expect(result.getMonth()).toBe(11); // December = 11
      expect(result.getFullYear()).toBe(2023);
    });

    it('should throw TypeError for invalid inputs', () => {
      const validDate = new Date('2023-12-15');
      
      expect(() => addDays(null as any, 5)).toThrow(TypeError);
      expect(() => addDays(validDate, 'invalid' as any)).toThrow(TypeError);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2023-12-15');
      const date2 = new Date('2023-12-20');
      
      expect(daysBetween(date1, date2)).toBe(5);
      expect(daysBetween(date2, date1)).toBe(5); // Should be absolute difference
    });
  });
});