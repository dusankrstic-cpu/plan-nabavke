export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  // Validate input parameters
  if (!Array.isArray(items)) {
    throw new TypeError('Items must be an array');
  }

  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError('Page must be a positive integer');
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('Page size must be a positive integer');
  }

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  
  // Handle edge case where page exceeds total pages
  const safePage = Math.min(page, Math.max(1, totalPages));
  
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    total,
    page: safePage,
    totalPages: totalPages || 1, // Ensure at least 1 page for empty arrays
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}