import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { BasePersonal, BasePersonalFormData } from '../types';
import { toast } from 'sonner';

export const useBasePersonal = (baseId: number | null) => {
  return useQuery({
    queryKey: ['bases', baseId, 'personal'],
    queryFn: async (): Promise<BasePersonal[]> => {
      const { data } = await api.get(`/bases/${baseId}/personal`);
      return data.data;
    },
    enabled: !!baseId,
  });
};

export const useAddBasePersonal = (baseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BasePersonalFormData) => {
      const response = await api.post(`/bases/${baseId}/personal`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Persona añadida a la base');
      queryClient.invalidateQueries({ queryKey: ['bases', baseId, 'personal'] });
      queryClient.invalidateQueries({ queryKey: ['bases'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al añadir persona';
      toast.error(message);
    },
  });
};

export const useUpdateBasePersonal = (baseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ asignacionId, data }: { asignacionId: number; data: Omit<BasePersonalFormData, 'persona_id'> }) => {
      const response = await api.put(`/bases/${baseId}/personal/${asignacionId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Asignación actualizada');
      queryClient.invalidateQueries({ queryKey: ['bases', baseId, 'personal'] });
      queryClient.invalidateQueries({ queryKey: ['bases'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar asignación';
      toast.error(message);
    },
  });
};

export const useRemoveBasePersonal = (baseId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asignacionId: number) => {
      await api.delete(`/bases/${baseId}/personal/${asignacionId}`);
    },
    onSuccess: () => {
      toast.success('Persona desvinculada de la base');
      queryClient.invalidateQueries({ queryKey: ['bases', baseId, 'personal'] });
      queryClient.invalidateQueries({ queryKey: ['bases'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al desvincular persona';
      toast.error(message);
    },
  });
};
