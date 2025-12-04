/**
 * API Response Types
 * Generic types for API requests and responses
 */

/**
 * Standard API error response
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: unknown;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard success response
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}
