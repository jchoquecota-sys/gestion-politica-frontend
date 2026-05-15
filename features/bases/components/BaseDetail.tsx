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
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando detalles de la base...</p>
      </div>
    );
  }

  if (isError || !base) {
    return (
      <div className="text-center py-24 bg-white rounded-xl border shadow-sm">
        <Landmark className="h-16 w-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Base territorial no encontrada</h2>
        <p className="text-slate-500 mt-2">La base que intenta ver no existe o no tiene permisos suficientes.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push('/bases')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => router.push('/bases')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Bases
            </Button>
            <span>/</span>
            <span className="font-medium text-slate-600">Detalle de Base</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{base.nombre}</h1>
            <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 shadow-sm">
              SECTOR: {base.sector?.nombre || 'General'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin className="h-4 w-4 text-indigo-500" />
              {base.direccion || 'Sin dirección registrada'}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[240px] relative z-10">
          {base.responsable ? (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Responsable de Base</p>
                <p className="font-bold text-slate-900">{base.responsable.nombre_completo}</p>
                <p className="text-xs text-amber-600 font-medium">{base.responsable.cargo}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl border-dashed">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsable de Base</p>
              <p className="text-sm text-slate-400 italic">No asignado aún</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-stretch">
        {/* Compact Description */}
        <div className="flex-1 min-w-[300px] bg-white border border-slate-200 rounded-xl p-3 flex gap-3 shadow-sm">
          <div className="bg-slate-50 p-2 rounded-lg h-fit">
            <Info className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Descripción</p>
            <p className="text-xs text-slate-600 leading-tight line-clamp-2">
              {base.descripcion || 'Sin descripción detallada registrada.'}
            </p>
          </div>
        </div>

        {/* Compact Stats & Audit */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex gap-4 shadow-sm">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Landmark className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Integrantes</p>
              <p className="text-sm font-bold text-indigo-700">{base.equipo?.length || 0}</p>
            </div>
          </div>

          {base.auditoria && (
            <div className="flex flex-col justify-center space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400 font-medium">REGISTRO:</span>
                <span className="text-slate-600 font-bold">{base.auditoria.creado_el}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400 font-medium">USUARIO:</span>
                <span className="text-slate-600 font-bold uppercase">{base.auditoria.creado_por}</span>
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
