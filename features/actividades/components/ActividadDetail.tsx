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
  const { data: actividad, isLoading, isError } = useActividad(id);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </Button>
            <span>/</span>
            <span>Detalle de Actividad</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{actividad.titulo}</h1>
            <Badge variant="outline" className={getEstadoColor(actividad.estado)}>
              {actividad.estado.toUpperCase()}
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">{actividad.descripcion}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20 dark:border-primary/30">
            <Calendar className="h-4 w-4" />
            {format(fechaObj, "EEEE, d 'de' MMMM", { locale: es })}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20 dark:border-primary/30">
            <Clock className="h-4 w-4" />
            {format(fechaObj, 'HH:mm')}
          </div>
        </div>
      </div>

      
      {/* Información del tipo de actividad en una fila destacada si es necesario, 
          o simplemente ir directo a los participantes */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg w-fit">
        <span className="text-xs font-bold text-slate-500 uppercase">Tipo:</span>
        <Badge variant="secondary" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-primary">
          {actividad.tipo_actividad?.nombre}
        </Badge>
      </div>

      <ActividadSujetosCard actividadId={actividad.id} sujetos={actividad.sujetos || []} />
    </div>
  );
}
