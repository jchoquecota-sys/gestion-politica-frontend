import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Persona, PersonaFormData } from '../types';
import { toast } from 'sonner';

export const usePersonas = () => {
  return useQuery({
    queryKey: ['personas'],
    queryFn: async (): Promise<Persona[]> => {
      const { data } = await api.get('/personas');
      return data.data;
    },
  });
};

export const useCreatePersona = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPersona: PersonaFormData) => {
      const { data } = await api.post('/personas', newPersona);
      return data;
    },
    onSuccess: () => {
      toast.success('Persona registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al registrar persona';
      toast.error(message);
    },
  });
};

export const useUpdatePersona = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PersonaFormData }) => {
      const response = await api.put(`/personas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Datos actualizados exitosamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar datos';
      toast.error(message);
    },
  });
};

export const useDeletePersona = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/personas/${id}`);
    },
    onSuccess: () => {
      toast.success('Persona eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar persona';
      toast.error(message);
    },
  });
};
