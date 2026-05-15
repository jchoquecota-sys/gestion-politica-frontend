import { useQuery } from '@tanstack/react-query';
import apiPublic from '@/lib/axios-public';
import type { LandingData } from '../types';

/**
 * Hook para la landing page pública.
 * Usa la instancia pública de Axios (sin token).
 * Cache de TanStack Query de 1 hora para evitar refetches innecesarios.
 */
export const usePublicLanding = () => {
  return useQuery<LandingData>({
    queryKey: ['public-landing'],
    queryFn: async () => {
      const { data } = await apiPublic.get('/public/landing-data');
      return data.data as LandingData;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 2, // 2 horas en cache
    retry: 2,
  });
};
