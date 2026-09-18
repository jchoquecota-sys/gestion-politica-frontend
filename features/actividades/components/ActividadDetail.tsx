'use client';

import { useActividad } from '../hooks';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ActividadSujetosCard } from './ActividadSujetosCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActividadDetailProps {
  id: number;
}

export function ActividadDetail({ id }: ActividadDetailProps) {
  const router = useRouter();
  const { data: actividad, isLoading, isError, isFetching, dataUpdatedAt } = useActividad(id, {
    live: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando detalles de la actividad...</p>
      </div>
    );
  }

  if (isError || !actividad) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Actividad no encontrada</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">La actividad que intenta ver no existe o no tiene permisos.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/actividades')}>
          Volver al listado
        </Button>
      </div>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'borrador': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'creada': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'cancelada': return 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20 dark:bg-brand-secondary/20 dark:text-brand-secondary dark:border-brand-secondary/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const fechaObj = new Date(actividad.fecha_actividad);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-950 px-4 py-3 rounded-lg border dark:border-slate-800 shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-0.5">
            <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 text-xs" onClick={() => router.back()}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver
            </Button>
            <span>/</span>
            <span>Detalle</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{actividad.titulo}</h1>
            <Badge variant="outline" className={`text-[11px] ${getEstadoColor(actividad.estado)}`}>
              {actividad.estado.toUpperCase()}
            </Badge>
          </div>
          {actividad.descripcion && (
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl line-clamp-2">{actividad.descripcion}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 dark:border-primary/30">
            <Calendar className="h-3.5 w-3.5" />
            {format(fechaObj, "d MMM yyyy", { locale: es })}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20 dark:border-primary/30">
            <Clock className="h-3.5 w-3.5" />
            {format(fechaObj, 'HH:mm')}
          </div>
          {actividad.tipo_actividad?.nombre && (
            <Badge variant="secondary" className="text-[11px] bg-slate-50 dark:bg-slate-900 border">
              {actividad.tipo_actividad.nombre}
            </Badge>
          )}
        </div>
      </div>

      <ActividadSujetosCard
        actividadId={actividad.id}
        sujetos={actividad.sujetos || []}
        isLiveUpdating={isFetching}
        lastUpdatedAt={dataUpdatedAt}
      />
    </div>
  );
}
