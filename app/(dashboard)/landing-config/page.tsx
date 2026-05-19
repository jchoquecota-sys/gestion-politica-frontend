'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LandingSettingsForm } from '@/features/landing-settings/components/LandingSettingsForm';
import { ShieldAlert, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LandingConfigPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const router = useRouter();

  if (!hasPermission('landing:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso Restringido</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
          No tiene los permisos necesarios para gestionar la página pública. Contacte con el administrador.
        </p>
        <Button onClick={() => router.back()} variant="outline">Volver</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Globe size={160} />
        </div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Globe className="h-4 w-4" /> Gestión de Página Pública
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Configuración de la Landing Page
          </h1>
          <p className="text-slate-500 font-medium">
            Administre el contenido visible para el público general en la página de la campaña.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary border border-indigo-200 rounded-xl px-4 py-2 hover:bg-primary/10 transition-colors relative z-10"
        >
          <Globe className="h-4 w-4" />
          Ver página pública
        </a>
      </div>

      {/* Formulario principal */}
      <LandingSettingsForm />
    </div>
  );
}
