import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Actividad, CreateActividadDTO, UpdateActividadDTO, TipoActividad, ActividadFilters } from '../types';
import { PaginatedResponse, PaginationParams } from '@/types/pagination';

// --- Tipos de Actividad ---
export const useTiposActividad = () => {
  return useQuery({
    queryKey: ['tipos-actividad'],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: TipoActividad[] }>('/tipos-actividad');
      return data.data;
    },
  });
};

// --- Actividades ---
export const useActividades = (params: PaginationParams & ActividadFilters) => {
  return useQuery({
    queryKey: ['actividades', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Actividad>>('/actividades', { params });
      return data;
    },
  });
};

export const useActividad = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['actividad', id],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: Actividad }>(`/actividades/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateActividad = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateActividadDTO) => {
      const { data } = await api.post<{ status: string; data: Actividad }>('/actividades', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
    },
  });
};

export const useUpdateActividad = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateActividadDTO) => {
      const { data } = await api.put<{ status: string; data: Actividad }>(`/actividades/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
      queryClient.invalidateQueries({ queryKey: ['actividad', id] });
    },
  });
};

export const useDeleteActividad = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/actividades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
    },
  });
};

// --- Gestión de Sujetos/Participantes ---

export const useAsignarSujeto = (actividadId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sujeto_id: number; sujeto_type: string; descripcion_ejecucion?: string }) => {
      const { data } = await api.post(`/actividad-sujetos/${actividadId}/asignar`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividad', actividadId] });
    },
  });
};

export const useUpdateEjecucion = (actividadId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; descripcion_ejecucion?: string; evidencias?: string[] }) => {
      const { data } = await api.put(`/actividad-sujetos/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividad', actividadId] });
    },
  });
};

export const useDesvincularSujeto = (actividadId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asignacionId: number) => {
      await api.delete(`/actividad-sujetos/${asignacionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividad', actividadId] });
    },
  });
};
