/**
 * Cases Hook
 * React Query hooks for Cases CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesService } from '../services/api';
import { handleError } from '../utils/error-handler';

// Query keys for caching
export const casesKeys = {
  all: ['cases'] as const,
  lists: () => [...casesKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; status?: string }) => 
    [...casesKeys.lists(), params] as const,
  details: () => [...casesKeys.all, 'detail'] as const,
  detail: (id: string) => [...casesKeys.details(), id] as const,
  history: (id: string) => [...casesKeys.all, 'history', id] as const,
};

// Types based on backend
export interface CaseData {
  id: string;
  homelessId: string;
  homeless?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseInput {
  homelessId: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface UpdateCaseInput {
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface CaseHistoryEntry {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  createdBy?: {
    name: string;
  };
}

/**
 * Hook to fetch cases list
 */
export const useCasesList = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: casesKeys.list(params),
    queryFn: async () => {
      const response = await casesService.getAll(params);
      return response.data.data?.cases || response.data.data || [];
    },
  });
};

/**
 * Hook to fetch a single case by ID
 */
export const useCaseDetail = (id: string) => {
  return useQuery({
    queryKey: casesKeys.detail(id),
    queryFn: async () => {
      const response = await casesService.getById(id);
      return response.data.data?.case || response.data.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch case history
 */
export const useCaseHistory = (id: string) => {
  return useQuery({
    queryKey: casesKeys.history(id),
    queryFn: async () => {
      const response = await casesService.getHistory(id);
      return response.data.data?.history || response.data.data || [];
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new case
 */
export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCaseInput) => {
      const response = await casesService.create(data);
      return response.data.data?.case || response.data.data;
    },
    onSuccess: () => {
      // Invalidate cases list to refetch
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
    },
    onError: (error) => {
      const message = handleError(error);
      console.error('Create case error:', message);
    },
  });
};

/**
 * Hook to update a case
 */
export const useUpdateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCaseInput }) => {
      const response = await casesService.update(id, data);
      return response.data.data?.case || response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: casesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
    },
    onError: (error) => {
      const message = handleError(error);
      console.error('Update case error:', message);
    },
  });
};

/**
 * Hook to delete a case
 */
export const useDeleteCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await casesService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
    },
    onError: (error) => {
      const message = handleError(error);
      console.error('Delete case error:', message);
    },
  });
};

/**
 * Hook to assign a case to a user
 */
export const useAssignCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, userId }: { caseId: string; userId: string }) => {
      const response = await casesService.assign(caseId, userId);
      return response.data.data?.case || response.data.data;
    },
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: casesKeys.detail(caseId) });
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
    },
    onError: (error) => {
      const message = handleError(error);
      console.error('Assign case error:', message);
    },
  });
};
