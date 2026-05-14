import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Base, BaseFormData } from '../types';
import { toast } from 'sonner';

import { PaginatedResponse, PaginationParams } from '@/types/pagination';

export const useBases = (params?: PaginationParams & { sector_id?: number | null }) => {
  return useQuery({
    queryKey: ['bases', params],
    queryFn: async (): Promise<PaginatedResponse<Base>> => {
      const { data } = await api.get('/bases', { params });
      return data;
    },
    enabled: true, 
  });
};

export const useBasesOpciones = (sectorId?: number | null) => {
  return useQuery({
    queryKey: ['opciones', 'bases', sectorId],
    queryFn: async (): Promise<{ id: number; nombre: string; sector_id: number }[]> => {
      const params = sectorId ? { sector_id: sectorId } : {};
      const { data } = await api.get('/opciones/bases', { params });
      return data.data;
    },
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
