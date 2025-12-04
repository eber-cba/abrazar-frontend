import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogout } from '../useAuth';
import { authService } from '../../services/api';
import { clearAuthData } from '../../utils/storage';

// Mock dependencies
jest.mock('../../services/api', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

jest.mock('../../utils/storage', () => ({
  clearAuthData: jest.fn(),
}));

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  
  return Wrapper;
};

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should logout successfully and clear auth data', async () => {
    (authService.logout as jest.Mock).mockResolvedValue({ data: { success: true } });
    (clearAuthData as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Verify logout was called
    expect(authService.logout).toHaveBeenCalledTimes(1);
    
    // Verify auth data was cleared
    expect(clearAuthData).toHaveBeenCalledTimes(1);
  });

  it('should clear auth data even if server logout fails', async () => {
    (authService.logout as jest.Mock).mockRejectedValue(new Error('Server error'));
    (clearAuthData as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Even though server call failed, local data should be cleared
    expect(clearAuthData).toHaveBeenCalledTimes(1);
  });

  it('should clear query cache on logout', async () => {
    (authService.logout as jest.Mock).mockResolvedValue({ data: { success: true } });
    (clearAuthData as jest.Mock).mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Set some data in cache
    queryClient.setQueryData(['auth', 'me'], { id: '1', name: 'Test User' });
    queryClient.setQueryData(['test', 'data'], { some: 'data' });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Verify cache was cleared
    expect(queryClient.getQueryData(['auth', 'me'])).toBeUndefined();
    expect(queryClient.getQueryData(['test', 'data'])).toBeUndefined();
  });

  it('should handle loading state', async () => {
    (authService.logout as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { success: true } }), 100))
    );
    (clearAuthData as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    result.current.mutate();

    // Should be pending immediately after mutation
    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.isPending).toBe(false);
  });
});
