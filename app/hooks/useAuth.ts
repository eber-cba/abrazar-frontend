/**
 * Authentication Hooks
 * React Query hooks for authentication
 * NOTE: Backend doesn't have GET /api/auth/me, so we use AsyncStorage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api';
import { queryKeys } from '../config/react-query';
import { saveToken, getUserData, clearAuthData } from '../utils/storage';

/**
 * Get current user from AsyncStorage (NO API call)
 * Backend doesn't have GET /api/auth/me endpoint
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const userData = await getUserData();
      if (!userData) {
        return null;
      }
      return userData;
    },
    staleTime: Infinity, // User data doesn't change unless we update it
    retry: false,
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (error) {
        // Even if logout fails on server, clear local data
        console.error('Logout error:', error);
      }
    },
    onSuccess: async () => {
      // Clear all auth data
      await clearAuthData();

      // Clear all queries
      queryClient.clear();
    },
  });
};

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};
