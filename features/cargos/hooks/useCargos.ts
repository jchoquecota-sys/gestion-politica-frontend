import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Cargo, CargoFormData } from '../types';
import { toast } from 'sonner';

import { PaginatedResponse, PaginationParams } from '@/types/pagination';

export const useCargos = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['cargos', params],
    queryFn: async (): Promise<PaginatedResponse<Cargo>> => {
      const { data } = await api.get('/cargos', { params });
      return data;
    },
  });
};

export const useCargosOpciones = () => {
  return useQuery({
    queryKey: ['opciones', 'cargos'],
    queryFn: async (): Promise<{ id: number; nombre: string }[]> => {
      const { data } = await api.get('/opciones/cargos');
      return data.data;
    },
  });
};

export const useCreateCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCargo: CargoFormData) => {
      const { data } = await api.post('/cargos', newCargo);
      return data;
    },
    onSuccess: () => {
      toast.success('Cargo creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear el cargo';
      toast.error(message);
    },
  });
};

export const useUpdateCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CargoFormData }) => {
      const response = await api.put(`/cargos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cargo actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar el cargo';
      toast.error(message);
    },
  });
};

export const useDeleteCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cargos/${id}`);
    },
    onSuccess: () => {
      toast.success('Cargo eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['cargos'] });
    },
    onError: (error: any) => {
      // Manejar error de integridad (422) cuando el cargo está en uso
      if (error.response?.status === 422) {
        const message = error.response?.data?.message || 'No se puede eliminar el cargo porque tiene personas asignadas';
        toast.error(message);
      } else {
        const message = error.response?.data?.message || 'Error al eliminar el cargo';
        toast.error(message);
      }
    },
  });
};
