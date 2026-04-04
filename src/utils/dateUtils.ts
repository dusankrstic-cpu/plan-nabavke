export function isWeekend(date: Date): boolean {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Invalid date provided');
  }
  
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export function addDays(date: Date, n: number): Date {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Invalid date provided');
  }
  
  if (typeof n !== 'number' || isNaN(n)) {
    throw new TypeError('Invalid number of days provided');
  }
  
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

export function daysBetween(date1: Date, date2: Date): number {
  if (!date1 || !(date1 instanceof Date) || isNaN(date1.getTime())) {
    throw new TypeError('Invalid first date provided');
  }
  
  if (!date2 || !(date2 instanceof Date) || isNaN(date2.getTime())) {
    throw new TypeError('Invalid second date provided');
  }
  
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}