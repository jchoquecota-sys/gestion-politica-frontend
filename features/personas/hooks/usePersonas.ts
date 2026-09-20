import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Persona, PersonaFormData } from '../types';
import { toast } from 'sonner';

import { PaginatedResponse, PaginationParams } from '@/types/pagination';

export const usePersonas = (params?: PaginationParams & { sector_id?: number | null; base_id?: number | null }) => {
  return useQuery({
    queryKey: ['personas', params],
    queryFn: async (): Promise<PaginatedResponse<Persona>> => {
      const { data } = await api.get('/personas', { params });
      return data;
    },
  });
};

export const usePersonasOpciones = () => {
  return useQuery({
    queryKey: ['opciones', 'personas'],
    queryFn: async (): Promise<{ id: number; nombre_completo: string; dni: string }[]> => {
      const { data } = await api.get('/opciones/personas');
      return data.data;
    },
  });
};

export const useCreatePersona = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPersona: PersonaFormData) => {
      const formData = new FormData();
      Object.entries(newPersona).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });

      const { data } = await api.post('/personas', formData);
      return data as { status: string; message: string; data: Persona };
    },
    onSuccess: () => {
      toast.success('Persona registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      queryClient.invalidateQueries({ queryKey: ['opciones', 'personas'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("No tiene permiso para crear esta persona.");
      } else {
        const message = error.response?.data?.message || 'Error al registrar persona';
        toast.error(message);
      }
    },
  });
};

export const useUpdatePersona = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PersonaFormData }) => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });

      const response = await api.post(`/personas/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Datos actualizados exitosamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("No tiene permiso para gestionar esta persona.");
      } else {
        const message = error.response?.data?.message || 'Error al actualizar datos';
        toast.error(message);
      }
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
      if (error.response?.status === 403) {
        toast.error("No tiene permiso para gestionar esta persona.");
      } else {
        const message = error.response?.data?.message || 'Error al eliminar persona';
        toast.error(message);
      }
    },
  });
};

export const useImportPersonasCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, replace = true }: { file: File; replace?: boolean }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('replace', replace ? '1' : '0');
      const { data } = await api.post('/personas/import', formData);
      return data as {
        status: string;
        message: string;
        data?: { inserted: number; total_filas: number; replace: boolean };
      };
    },
    onSuccess: (data) => {
      toast.success(data.message || 'CSV importado correctamente');
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      queryClient.invalidateQueries({ queryKey: ['opciones', 'personas'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'No se pudo importar el CSV');
    },
  });
};

export const useExportPersonasCsv = () => {
  return useMutation({
    mutationFn: async (params?: {
      search?: string;
      sector_id?: number | null;
      base_id?: number | null;
    }) => {
      const { data } = await api.get('/personas/export', {
        params: {
          search: params?.search || undefined,
          sector_id: params?.sector_id ?? undefined,
          base_id: params?.base_id ?? undefined,
        },
        responseType: 'blob',
      });

      const blob = data instanceof Blob
        ? data
        : new Blob([data], { type: 'text/csv;charset=utf-8' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `padron-personas-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('CSV exportado (UTF-8, con ñ y acentos)');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'No se pudo exportar el CSV');
    },
  });
};
