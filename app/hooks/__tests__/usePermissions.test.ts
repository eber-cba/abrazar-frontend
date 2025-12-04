import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePermissions } from '../usePermissions';

// Mock the entire useAuth module
jest.mock('../useAuth', () => ({
  useCurrentUser: jest.fn(),
}));

// Import after mocking
const { useCurrentUser } = require('../useAuth');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  return Wrapper;
};

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all permissions for ADMIN user', () => {
    useCurrentUser.mockReturnValue({
      data: { id: '1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin' },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBe('ADMIN');
    expect(result.current.canViewHomeless).toBe(true);
    expect(result.current.canEditHomeless).toBe(true);
    expect(result.current.canDeleteHomeless).toBe(true);
    expect(result.current.canManageUsers).toBe(true);
  });

  it('should return limited permissions for VOLUNTEER user', () => {
    useCurrentUser.mockReturnValue({
      data: { id: '2', email: 'volunteer@test.com', role: 'VOLUNTEER', name: 'Volunteer' },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBe('VOLUNTEER');
    expect(result.current.canViewHomeless).toBe(true);
    expect(result.current.canEditHomeless).toBe(false);
    expect(result.current.canDeleteHomeless).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
  });

  it('should return no permissions when user is not authenticated', () => {
    useCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBeUndefined();
    expect(result.current.canViewHomeless).toBe(false);
    expect(result.current.canEditHomeless).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
  });

  it('should work with hasPermission function', () => {
    useCurrentUser.mockReturnValue({
      data: { id: '3', email: 'ngo@test.com', role: 'NGO', name: 'NGO User' },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasPermission('view_homeless')).toBe(true);
    expect(result.current.hasPermission('edit_homeless')).toBe(true);
    expect(result.current.hasPermission('delete_homeless')).toBe(false);
    expect(result.current.hasPermission('manage_users')).toBe(false);
  });
});
