import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useHomelessList,
  useHomelessPerson,
  useHomelessStats,
  useCreateHomeless,
  useUpdateHomeless,
  useDeleteHomeless,
} from '../useHomeless';
import { homelessService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  homelessService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getStats: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
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

describe('useHomelessList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch homeless list', async () => {
    const mockData = [{ id: '1', firstName: 'John', lastName: 'Doe' }];
    (homelessService.getAll as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useHomelessList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors when fetching list', async () => {
    (homelessService.getAll as jest.Mock).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useHomelessList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useHomelessPerson', () => {
  it('should fetch a single person', async () => {
    const mockData = { id: '1', firstName: 'John', lastName: 'Doe' };
    (homelessService.getById as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useHomelessPerson('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('should not fetch if id is empty', () => {
    const { result } = renderHook(() => useHomelessPerson(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useHomelessStats', () => {
  it('should fetch homeless stats', async () => {
    const mockStats = { total: 100, active: 80, inactive: 20 };
    (homelessService.getStats as jest.Mock).mockResolvedValue({ data: mockStats });

    const { result } = renderHook(() => useHomelessStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockStats);
  });
});

describe('useCreateHomeless', () => {
  it('should create a homeless person', async () => {
    const newPerson = { firstName: 'Jane', lastName: 'Smith' };
    const createdPerson = { id: '2', ...newPerson };
    (homelessService.create as jest.Mock).mockResolvedValue({ data: createdPerson });

    const { result } = renderHook(() => useCreateHomeless(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newPerson);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(createdPerson);
  });
});

describe('useUpdateHomeless', () => {
  it('should update a homeless person', async () => {
    const updatedData = { firstName: 'Jane Updated' };
    const updatedPerson = { id: '1', ...updatedData };
    (homelessService.update as jest.Mock).mockResolvedValue({ data: updatedPerson });

    const { result } = renderHook(() => useUpdateHomeless(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: '1', data: updatedData });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(updatedPerson);
  });
});

describe('useDeleteHomeless', () => {
  it('should delete a homeless person', async () => {
    (homelessService.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useDeleteHomeless(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
