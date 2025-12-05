/**
 * Statistics Hook
 * React Query hooks for fetching statistics and analytics
 */

import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '../services/api';

// Query keys
export const statisticsKeys = {
  all: ['statistics'] as const,
  overview: () => [...statisticsKeys.all, 'overview'] as const,
  casesByStatus: () => [...statisticsKeys.all, 'cases-by-status'] as const,
  zones: () => [...statisticsKeys.all, 'zones'] as const,
};

// Types based on backend API response
export interface StatisticsOverview {
  totalHomeless: number;
  activeHomeless?: number;
  totalCases: number;
  activeCases: number;  // Per API docs
  openCases?: number;
  inProgressCases?: number;
  resolvedCases: number;
  closedCases?: number;
  totalServicePoints?: number;
  totalUsers?: number;
  activeTeams?: number;
  organizationCount?: number;
}

export interface CasesByStatus {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  count: number;
  percentage: number;
}

export interface ZoneStatistics {
  zoneId: string;
  zoneName: string;
  homelessCount: number;
  casesCount: number;
  servicePointsCount: number;
}

/**
 * Hook to fetch overview statistics
 */
export const useStatisticsOverview = () => {
  return useQuery({
    queryKey: statisticsKeys.overview(),
    queryFn: async () => {
      const response = await statisticsService.getOverview();
      return response.data.data as StatisticsOverview;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch cases grouped by status
 */
export const useCasesByStatus = () => {
  return useQuery({
    queryKey: statisticsKeys.casesByStatus(),
    queryFn: async () => {
      const response = await statisticsService.getCasesByStatus();
      return response.data.data as CasesByStatus[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch statistics by zone
 */
export const useZoneStatistics = () => {
  return useQuery({
    queryKey: statisticsKeys.zones(),
    queryFn: async () => {
      const response = await statisticsService.getByZone();
      return response.data.data as ZoneStatistics[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
