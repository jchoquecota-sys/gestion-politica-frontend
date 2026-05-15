import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { DashboardStats, MapPoint } from '../types';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
  });
};

export const useDashboardMap = () => {
  return useQuery({
    queryKey: ['dashboard', 'map'],
    queryFn: async (): Promise<MapPoint[]> => {
      const { data } = await api.get('/dashboard/map');
      return data.data;
    },
  });
};
