import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { LandingSetting } from '@/features/landing/types';
import { toast } from 'sonner';

/**
 * Obtener la configuración actual de la landing page (para el panel admin).
 */
export const useLandingSettings = () => {
  return useQuery<LandingSetting | null>({
    queryKey: ['landing-settings'],
    queryFn: async () => {
      const { data } = await api.get('/landing-settings');
      return data.data as LandingSetting | null;
    },
  });
};

/**
 * Mutation para guardar/actualizar la configuración de la landing.
 * Recibe un FormData para manejar archivos de imagen.
 */
export const useUpdateLandingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/landing-settings', formData);
      return data.data as LandingSetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-landing'] });
      toast.success('Configuración de la página pública guardada correctamente.');
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const errors = err.response?.data?.errors;
      const firstFieldError = errors
        ? Object.values(errors).flat()[0]
        : undefined;
      toast.error(
        firstFieldError ||
          err.response?.data?.message ||
          'Error al guardar la configuración. Intente nuevamente.'
      );
    },
  });
};
