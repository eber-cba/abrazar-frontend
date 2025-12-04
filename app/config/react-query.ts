/**
 * React Query Configuration
 * Advanced setup with caching, retry logic, and offline support
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { isNetworkError, logError } from '../utils/error-handler';

/**
 * Default stale time: 5 minutes
 * Data is considered fresh for 5 minutes before refetching
 */
const DEFAULT_STALE_TIME = 5 * 60 * 1000;

/**
 * Default cache time: 10 minutes
 * Unused data stays in cache for 10 minutes before garbage collection
 */
const DEFAULT_CACHE_TIME = 10 * 60 * 1000;

/**
 * Query Client Configuration
 */
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // ============================================
      // Caching Strategy
      // ============================================
      
      // Data is considered fresh for 5 minutes
      staleTime: DEFAULT_STALE_TIME,
      
      // Unused data stays in cache for 10 minutes
      gcTime: DEFAULT_CACHE_TIME,
      
      // ============================================
      // Retry Logic (Smart Retry)
      // ============================================
      
      // Retry failed requests up to 3 times
      retry: (failureCount, error) => {
        // Don't retry on network errors after 1 attempt
        if (isNetworkError(error) && failureCount >= 1) {
          return false;
        }
        
        // Don't retry client errors (4xx) except 408 (timeout)
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error as any).response?.status;
          if (status >= 400 && status < 500 && status !== 408) {
            return false;
          }
        }
        
        // Retry server errors (5xx) up to 3 times
        return failureCount < 3;
      },
      
      // Exponential backoff: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // ============================================
      // Refetch Behavior
      // ============================================
      
      // Refetch on window focus (user returns to tab)
      refetchOnWindowFocus: true,
      
      // Refetch when network reconnects
      refetchOnReconnect: true,
      
      // Don't refetch on component mount if data is fresh
      refetchOnMount: false,
      
      // ============================================
      // Network Mode (Offline Support)
      // ============================================
      
      // online: only fetch when online
      // offlineFirst: try cache first, then network
      // always: fetch regardless of network status
      networkMode: 'offlineFirst',
    },
    
    mutations: {
      // ============================================
      // Mutation Retry Logic
      // ============================================
      
      // Retry mutations only once (BE CAREFUL WITH MUTATIONS)
      retry: (failureCount, error: any) => {
        // Never retry mutations that succeeded on server but failed on client
        // Only retry network errors
        if (isNetworkError(error) && failureCount < 1) {
          return true;
        }
        return false;
      },
      
      // Network mode for mutations
      networkMode: 'online', // Mutations require network
    },
  },
};

/**
 * Create and export Query Client instance
 */
export const queryClient = new QueryClient(queryClientConfig);

/**
 * Query Keys
 * Centralized query keys for consistency and type safety
 */
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
    user: (id: string) => ['auth', 'user', id] as const,
  },
  
  // Personas
  personas: {
    all: ['personas'] as const,
    list: (filters?: Record<string, any>) => ['personas', 'list', filters] as const,
    detail: (id: string) => ['personas', 'detail', id] as const,
  },
  
  // Organizations
  organizations: {
    all: ['organizations'] as const,
    list: (filters?: Record<string, any>) => ['organizations', 'list', filters] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    list: (filters?: Record<string, any>) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  
  // Service Points
  servicePoints: {
    all: ['service-points'] as const,
    list: (filters?: Record<string, any>) => ['service-points', 'list', filters] as const,
    detail: (id: string) => ['service-points', 'detail', id] as const,
    nearby: (lat: number, lng: number, radius: number) => ['service-points', 'nearby', { lat, lng, radius }] as const,
  },

  // Homeless / Personas
  homeless: {
    all: ['homeless'] as const,
    list: (filters?: Record<string, any>) => ['homeless', 'list', filters] as const,
    detail: (id: string) => ['homeless', 'detail', id] as const,
    stats: ['homeless', 'stats'] as const,
  },

  // Admin
  admin: {
    stats: ['admin', 'stats'] as const,
    auditLogs: (filters?: Record<string, any>) => ['admin', 'audit-logs', filters] as const,
  },
} as const;

/**
 * Prefetch helper
 * Prefetch data before it's needed
 */
export async function prefetchQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

/**
 * Invalidate queries helper
 * Invalidate and refetch queries
 */
export function invalidateQueries(queryKey: readonly unknown[]) {
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * Reset all queries
 * Clear all cache and reset to initial state
 */
export function resetQueries() {
  return queryClient.resetQueries();
}

/**
 * Clear all cache
 */
export function clearCache() {
  return queryClient.clear();
}
