'use client';

import { useParams } from 'next/navigation';
import { ActividadDetail } from '@/features/actividades/components/ActividadDetail';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

export default function ActividadDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!hasPermission('actividades:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Acceso Denegado</h1>
        <p className="text-slate-500 max-w-md mx-auto mt-2">
          No tienes los permisos necesarios para ver los detalles de esta actividad.
        </p>
      </div>
    );
  }

  return <ActividadDetail id={id} />;
}
