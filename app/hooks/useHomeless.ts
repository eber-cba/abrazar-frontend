import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homelessService } from '../services/api';
import { queryKeys } from '../config/react-query';

/**
 * Hook para obtener la lista de personas en situación de calle
 */
export function useHomelessList() {
  return useQuery({
    queryKey: queryKeys.homeless.all,
    queryFn: async () => {
      const response = await homelessService.getAll();
      return response.data;
    },
  });
}

/**
 * Hook para obtener una persona específica
 */
export function useHomelessPerson(id: string) {
  return useQuery({
    queryKey: queryKeys.homeless.detail(id),
    queryFn: async () => {
      const response = await homelessService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas
 */
export function useHomelessStats() {
  return useQuery({
    queryKey: queryKeys.homeless.stats,
    queryFn: async () => {
      const response = await homelessService.getStats();
      return response.data;
    },
  });
}

/**
 * Hook para registrar una nueva persona
 */
export function useCreateHomeless() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await homelessService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeless.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.homeless.stats });
    },
  });
}

/**
 * Hook para actualizar datos de una persona
 */
export function useUpdateHomeless() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await homelessService.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeless.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.homeless.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.homeless.stats });
    },
  });
}

/**
 * Hook para eliminar una persona del registro
 */
export function useDeleteHomeless() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await homelessService.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.homeless.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.homeless.stats });
    },
  });
}
