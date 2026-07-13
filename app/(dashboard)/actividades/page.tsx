'use client';

import { ActividadesTable } from '@/features/actividades/components/ActividadesTable';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ActividadesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const router = useRouter();

  if (!hasPermission('actividades:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso Denegado</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
          No tienes los permisos necesarios para acceder al módulo de actividades. 
          Contacta con el administrador del sistema si crees que esto es un error.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Actividades</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Administre el registro de actividades, mitines, reuniones y capacitaciones.
        </p>
      </div>

      <ActividadesTable />
    </div>
  );
}
