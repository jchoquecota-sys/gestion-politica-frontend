import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Base, BaseFormData } from '../types';
import { toast } from 'sonner';

export const useBases = (sectorId?: number | null) => {
  return useQuery({
    queryKey: ['bases', sectorId],
    queryFn: async (): Promise<Base[]> => {
      const params = sectorId ? { sector_id: sectorId } : {};
      const { data } = await api.get('/bases', { params });
      return data.data;
    },
    // Solo habilitar si tenemos sectorId o permiso list-all (esto último se maneja en el componente generalmente)
    enabled: true, 
  });
};

export const useBase = (id: number | null) => {
  return useQuery({
    queryKey: ['bases', 'detail', id],
    queryFn: async (): Promise<Base> => {
      const { data } = await api.get(`/bases/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBase: BaseFormData) => {
      const { data } = await api.post('/bases', newBase);
      return data;
    },
    onSuccess: () => {
      toast.success('Base territorial creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['bases'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear la base';
      toast.error(message);
    },
  });
};

export const useUpdateBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BaseFormData }) => {
      const response = await api.put(`/bases/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Base territorial actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['bases'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar la base';
      toast.error(message);
    },
  });
};

export const useDeleteBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bases/${id}`);
    },
    onSuccess: () => {
      toast.success('Base territorial eliminada');
      queryClient.invalidateQueries({ queryKey: ['bases'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar la base';
      toast.error(message);
    },
  });
};
