import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Role, RoleFormData } from '../types';
import { toast } from 'sonner';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const { data } = await api.get('/roles');
      return data.data;
    },
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async (): Promise<string[]> => {
      const { data } = await api.get('/roles/permissions');
      return data.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRole: RoleFormData) => {
      const { data } = await api.post('/roles', newRole);
      return data;
    },
    onSuccess: () => {
      toast.success('Rol creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear el rol';
      toast.error(message);
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RoleFormData }) => {
      const response = await api.put(`/roles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Rol actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar el rol';
      toast.error(message);
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      toast.success('Rol eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar el rol';
      toast.error(message);
    },
  });
};
