'use client';

import { useParams } from 'next/navigation';
import { BaseDetail } from '@/features/bases/components/BaseDetail';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!hasPermission('bases:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Acceso Denegado</h1>
        <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">
          No tienes los permisos necesarios para ver los detalles de esta base territorial.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  return <BaseDetail id={id} />;
}
