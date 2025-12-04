/**
 * Authentication Hooks
 * React Query hooks for authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api';
import { queryKeys } from '../config/react-query';
import { saveToken, clearAuthData } from '../utils/storage';
import { handleError } from '../utils/error-handler';
import type { AuthResponse, User } from '../types';

/**
 * Get current authenticated user
 * Automatically syncs across entire app
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await authService.me();
      return response.data as User;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry auth requests
  });
};

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authService.login(email, password);
      return response.data as AuthResponse;
    },
    onSuccess: async (data) => {
      // Save token
      await saveToken(data.accessToken);
      
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (error) => {
      const message = handleError(error);
      console.error('Login error:', message);
      // You can show a toast/alert here
    },
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
 * Register mutation (if registration is supported)
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await authService.register(data);
      return response.data as AuthResponse;
    },
    onSuccess: async (data) => {
      // Save token
      await saveToken(data.accessToken);
      
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
    onError: (error) => {
      const message = handleError(error);
      console.error('Register error:', message);
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
