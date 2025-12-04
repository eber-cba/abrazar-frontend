import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicePointsService } from '../services/api';
import { queryKeys } from '../config/react-query';

/**
 * Hook para obtener todos los puntos de servicio
 */
export function useServicePoints() {
  return useQuery({
    queryKey: queryKeys.servicePoints.all,
    queryFn: async () => {
      const response = await servicePointsService.getAll();
      return response.data;
    },
  });
}

/**
 * Hook para obtener un punto de servicio específico
 */
export function useServicePoint(id: string) {
  return useQuery({
    queryKey: queryKeys.servicePoints.detail(id),
    queryFn: async () => {
      const response = await servicePointsService.getById(id);
      return response.data;
    },
    enabled: !!id, // Solo ejecutar si hay ID
  });
}

/**
 * Hook para obtener puntos de servicio cercanos
 */
export function useNearbyServicePoints(lat: number, lng: number, radius: number = 5) {
  return useQuery({
    queryKey: queryKeys.servicePoints.nearby(lat, lng, radius),
    queryFn: async () => {
      const response = await servicePointsService.getNearby(lat, lng, radius);
      return response.data;
    },
    enabled: !!lat && !!lng, // Solo ejecutar si hay coordenadas
  });
}

/**
 * Hook para crear un nuevo punto de servicio
 */
export function useCreateServicePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await servicePointsService.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar la lista para refrescar
      queryClient.invalidateQueries({ queryKey: queryKeys.servicePoints.all });
    },
  });
}

/**
 * Hook para actualizar un punto de servicio
 */
export function useUpdateServicePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await servicePointsService.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.servicePoints.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.servicePoints.detail(variables.id) });
    },
  });
}

/**
 * Hook para eliminar un punto de servicio
 */
export function useDeleteServicePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await servicePointsService.delete(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar la lista para refrescar
      queryClient.invalidateQueries({ queryKey: queryKeys.servicePoints.all });
    },
  });
}
