import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Sector, SectorFormData } from '../types';
import { toast } from 'sonner';

export const useSectores = () => {
  return useQuery({
    queryKey: ['sectores'],
    queryFn: async (): Promise<Sector[]> => {
      const { data } = await api.get('/sectores');
      return data.data;
    },
  });
};

export const useSector = (id: number | null) => {
  return useQuery({
    queryKey: ['sectores', id],
    queryFn: async (): Promise<Sector> => {
      const { data } = await api.get(`/sectores/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateSector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSector: SectorFormData) => {
      const { data } = await api.post('/sectores', newSector);
      return data;
    },
    onSuccess: () => {
      toast.success('Sector creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['sectores'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear sector';
      toast.error(message);
    },
  });
};

export const useUpdateSector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SectorFormData }) => {
      const response = await api.put(`/sectores/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Sector actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['sectores'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar sector';
      toast.error(message);
    },
  });
};

export const useDeleteSector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/sectores/${id}`);
    },
    onSuccess: () => {
      toast.success('Sector eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['sectores'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar sector';
      toast.error(message);
    },
  });
};
