'use client';

import { useBase } from '../hooks/useBases';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, MapPin, ArrowLeft, Shield, Info, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BasePersonalCard } from './BasePersonalCard';

interface BaseDetailProps {
  id: number;
}

export function BaseDetail({ id }: BaseDetailProps) {
  const router = useRouter();
  const { data: base, isLoading, isError } = useBase(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando detalles de la base...</p>
      </div>
    );
  }

  if (isError || !base) {
    return (
      <div className="text-center py-24 bg-white dark:bg-slate-950 rounded-xl border dark:border-slate-800 shadow-sm">
        <Landmark className="h-16 w-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Base territorial no encontrada</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">La base que intenta ver no existe o no tiene permisos suficientes.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push('/bases')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-950 p-6 rounded-2xl border dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm mb-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10" onClick={() => router.push('/bases')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Bases
            </Button>
            <span>/</span>
            <span className="font-medium text-slate-600 dark:text-slate-400">Detalle de Base</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{base.nombre}</h1>
            <Badge className="bg-primary text-white hover:bg-primary/90 px-3 py-1 shadow-sm">
              SECTOR: {base.sector?.nombre || 'General'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              {base.direccion || 'Sin dirección registrada'}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[240px] relative z-10">
          {base.responsable ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">Responsable de Base</p>
                <p className="font-bold text-slate-900 dark:text-white">{base.responsable.nombre_completo}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{base.responsable.cargo}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl border-dashed">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Responsable de Base</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No asignado aún</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-stretch">
        {/* Compact Description */}
        <div className="flex-1 min-w-[300px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex gap-3 shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg h-fit">
            <Info className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Descripción</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight line-clamp-2">
              {base.descripcion || 'Sin descripción detallada registrada.'}
            </p>
          </div>
        </div>

        {/* Compact Stats & Audit */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex gap-4 shadow-sm">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-100 dark:border-slate-800">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Landmark className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Integrantes</p>
              <p className="text-sm font-bold text-primary">{base.equipo?.length || 0}</p>
            </div>
          </div>

          {base.auditoria && (
            <div className="flex flex-col justify-center space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400 dark:text-slate-500 font-medium">REGISTRO:</span>
                <span className="text-slate-600 dark:text-slate-400 font-bold">{base.auditoria.creado_el}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400 dark:text-slate-500 font-medium">USUARIO:</span>
                <span className="text-slate-600 dark:text-slate-400 font-bold uppercase">{base.auditoria.creado_por}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <BasePersonalCard baseId={base.id} />
      </div>
    </div>
  );
}
