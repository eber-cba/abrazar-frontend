import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useStatisticsOverview,
  useCasesByStatus,
  useZoneStatistics,
} from '../useStatistics';
import { statisticsService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  statisticsService: {
    getOverview: jest.fn(),
    getCasesByStatus: jest.fn(),
    getByZone: jest.fn(),
  },
}));

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

describe('useStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useStatisticsOverview', () => {
    it('should fetch overview statistics', async () => {
      const mockOverview = {
        totalHomeless: 100,
        activeHomeless: 80,
        totalCases: 50,
        openCases: 20,
        totalServicePoints: 15,
        totalUsers: 30,
      };

      (statisticsService.getOverview as jest.Mock).mockResolvedValue({
        data: { data: mockOverview },
      });

      const { result } = renderHook(() => useStatisticsOverview(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOverview);
      expect(statisticsService.getOverview).toHaveBeenCalled();
    });
  });

  describe('useCasesByStatus', () => {
    it('should fetch cases by status', async () => {
      const mockCasesByStatus = [
        { status: 'OPEN', count: 10, percentage: 40 },
        { status: 'IN_PROGRESS', count: 8, percentage: 32 },
        { status: 'RESOLVED', count: 5, percentage: 20 },
        { status: 'CLOSED', count: 2, percentage: 8 },
      ];

      (statisticsService.getCasesByStatus as jest.Mock).mockResolvedValue({
        data: { data: mockCasesByStatus },
      });

      const { result } = renderHook(() => useCasesByStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCasesByStatus);
    });
  });

  describe('useZoneStatistics', () => {
    it('should fetch zone statistics', async () => {
      const mockZones = [
        {
          zoneId: 'z1',
          zoneName: 'Centro',
          homelessCount: 30,
          casesCount: 15,
          servicePointsCount: 5,
        },
        {
          zoneId: 'z2',
          zoneName: 'Norte',
          homelessCount: 25,
          casesCount: 12,
          servicePointsCount: 3,
        },
      ];

      (statisticsService.getByZone as jest.Mock).mockResolvedValue({
        data: { data: mockZones },
      });

      const { result } = renderHook(() => useZoneStatistics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockZones);
    });
  });
});
