export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  // Validate inputs
  if (!Array.isArray(items)) {
    throw new TypeError('Items must be an array');
  }
  
  if (page < 1) {
    throw new RangeError('Page must be greater than 0');
  }
  
  if (pageSize < 1) {
    throw new RangeError('Page size must be greater than 0');
  }

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}