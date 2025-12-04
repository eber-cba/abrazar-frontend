import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useServicePoints,
  useServicePoint,
  useNearbyServicePoints,
  useCreateServicePoint,
  useUpdateServicePoint,
  useDeleteServicePoint,
} from '../useServicePoints';
import { servicePointsService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  servicePointsService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getNearby: jest.fn(),
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

describe('useServicePoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all service points', async () => {
    const mockData = [{ id: '1', name: 'Test Point' }];
    (servicePointsService.getAll as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useServicePoints(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors when fetching service points', async () => {
    (servicePointsService.getAll as jest.Mock).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useServicePoints(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useServicePoint', () => {
  it('should fetch a single service point', async () => {
    const mockData = { id: '1', name: 'Test Point' };
    (servicePointsService.getById as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useServicePoint('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('should not fetch if id is empty', () => {
    const { result } = renderHook(() => useServicePoint(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useNearbyServicePoints', () => {
  it('should fetch nearby service points', async () => {
    const mockData = [{ id: '1', name: 'Nearby Point' }];
    (servicePointsService.getNearby as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useNearbyServicePoints(-31.4201, -64.1888, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useCreateServicePoint', () => {
  it('should create a service point', async () => {
    const newPoint = { name: 'New Point' };
    const createdPoint = { id: '1', ...newPoint };
    (servicePointsService.create as jest.Mock).mockResolvedValue({ data: createdPoint });

    const { result } = renderHook(() => useCreateServicePoint(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newPoint);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(createdPoint);
  });
});

describe('useUpdateServicePoint', () => {
  it('should update a service point', async () => {
    const updatedData = { name: 'Updated Point' };
    const updatedPoint = { id: '1', ...updatedData };
    (servicePointsService.update as jest.Mock).mockResolvedValue({ data: updatedPoint });

    const { result } = renderHook(() => useUpdateServicePoint(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: '1', data: updatedData });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(updatedPoint);
  });
});

describe('useDeleteServicePoint', () => {
  it('should delete a service point', async () => {
    (servicePointsService.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useDeleteServicePoint(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
