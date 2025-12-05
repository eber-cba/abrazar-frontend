import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCasesList, useCreateCase, useUpdateCase, useAssignCase } from '../useCases';
import { casesService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  casesService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    assign: jest.fn(),
    getHistory: jest.fn(),
  },
}));

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

describe('useCases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCasesList', () => {
    it('should fetch cases list successfully', async () => {
      const mockCases = [
        {
          id: '1',
          homelessId: 'h1',
          description: 'Test case',
          status: 'OPEN',
          priority: 'HIGH',
          createdAt: '2024-01-01',
        },
      ];

      (casesService.getAll as jest.Mock).mockResolvedValue({
        data: { data: { cases: mockCases } },
      });

      const { result } = renderHook(() => useCasesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCases);
      expect(casesService.getAll).toHaveBeenCalledWith(undefined);
    });

    it('should handle empty cases list', async () => {
      (casesService.getAll as jest.Mock).mockResolvedValue({
        data: { data: { cases: [] } },
      });

      const { result } = renderHook(() => useCasesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCreateCase', () => {
    it('should create a case successfully', async () => {
      const newCase = {
        id: '2',
        homelessId: 'h1',
        description: 'New case',
        status: 'OPEN',
        priority: 'MEDIUM',
      };

      (casesService.create as jest.Mock).mockResolvedValue({
        data: { data: { case: newCase } },
      });

      const { result } = renderHook(() => useCreateCase(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        homelessId: 'h1',
        description: 'New case',
        priority: 'MEDIUM',
      });

      expect(casesService.create).toHaveBeenCalledWith({
        homelessId: 'h1',
        description: 'New case',
        priority: 'MEDIUM',
      });
    });
  });

  describe('useUpdateCase', () => {
    it('should update a case successfully', async () => {
      const updatedCase = {
        id: '1',
        status: 'IN_PROGRESS',
      };

      (casesService.update as jest.Mock).mockResolvedValue({
        data: { data: { case: updatedCase } },
      });

      const { result } = renderHook(() => useUpdateCase(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        id: '1',
        data: { status: 'IN_PROGRESS' },
      });

      expect(casesService.update).toHaveBeenCalledWith('1', {
        status: 'IN_PROGRESS',
      });
    });
  });

  describe('useAssignCase', () => {
    it('should assign a case to a user', async () => {
      const assignedCase = {
        id: '1',
        assignedToId: 'user1',
      };

      (casesService.assign as jest.Mock).mockResolvedValue({
        data: { data: { case: assignedCase } },
      });

      const { result } = renderHook(() => useAssignCase(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        caseId: '1',
        userId: 'user1',
      });

      expect(casesService.assign).toHaveBeenCalledWith('1', 'user1');
    });
  });
});
