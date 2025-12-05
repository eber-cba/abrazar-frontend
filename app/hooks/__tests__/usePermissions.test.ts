import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermissions } from '../usePermissions';
import * as storage from '../../utils/storage';

// Mock storage
jest.mock('../../utils/storage');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct permissions for ADMIN', async () => {
    (storage.getUserData as jest.Mock).mockResolvedValue({
      role: 'ADMIN',
      email: ' admin@test.com',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.role).toBe('ADMIN');
    expect(result.current.canViewHomeless).toBe(true);
    expect(result.current.canEditHomeless).toBe(true);
    expect(result.current.canDeleteHomeless).toBe(true);
    expect(result.current.canManageUsers).toBe(true);
  });

  it('should return correct permissions for VOLUNTEER', async () => {
    (storage.getUserData as jest.Mock).mockResolvedValue({
      role: 'VOLUNTEER',
      email: 'volunteer@test.com',
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.role).toBe('VOLUNTEER');
    expect(result.current.canViewHomeless).toBe(true);
    expect(result.current.canEditHomeless).toBe(false);
    expect(result.current.canDeleteHomeless).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
  });

  it('should return no permissions for unauthenticated user', async () => {
    (storage.getUserData as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.role).toBeUndefined();
    expect(result.current.canViewHomeless).toBe(false);
    expect(result.current.canEditHomeless).toBe(false);
    expect(result.current.canDeleteHomeless).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
  });
});
