'use client';

import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboardStats, useDashboardMap } from '@/features/dashboard/hooks/useDashboard';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { ChartsGrid } from '@/features/dashboard/components/ChartsGrid';
import { ShieldAlert, LayoutDashboard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Importar el mapa dinámicamente para evitar errores de SSR con Leaflet
const BasesMap = dynamic(() => import('@/features/dashboard/components/BasesMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-50 animate-pulse rounded-xl" />
});

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const router = useRouter();

  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: mapPoints, isLoading: isLoadingMap } = useDashboardMap();

  if (!hasPermission('dashboard:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Acceso Restringido</h1>
        <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">
          No tiene los permisos necesarios para visualizar el panel de control estadístico. 
          Contacte con su administrador regional.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Volver
        </Button>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <LayoutDashboard size={160} />
        </div>
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">
            <LayoutDashboard className="h-4 w-4" /> Panel de Control Principal
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Bienvenido, {user?.name || 'Usuario'}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" /> {currentDate}
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <Button onClick={() => window.print()} variant="outline" className="hidden sm:flex border-slate-200">
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <StatsGrid stats={stats} isLoading={isLoadingStats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Charts Section */}
        <div className="space-y-8">
           <ChartsGrid stats={stats} isLoading={isLoadingStats} />
        </div>

        {/* Map Section - Normal flow */}
        <div className="h-[650px]">
           <BasesMap points={mapPoints} isLoading={isLoadingMap} />
        </div>
      </div>
    </div>
  );
}
