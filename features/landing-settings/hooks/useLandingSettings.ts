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
    onError: () => {
      toast.error('Error al guardar la configuración. Intente nuevamente.');
    },
  });
};
