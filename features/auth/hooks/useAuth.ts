import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const logoutAction = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success('Sesión iniciada correctamente');
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      window.location.href = redirectUrl || '/roles';
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/logout');
    },
    onSettled: () => {
      logoutAction();
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/me');
      setUser(data.user);
      return data.user;
    },
    retry: false,
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    profile,
    isLoadingProfile: isLoading,
  };
};
