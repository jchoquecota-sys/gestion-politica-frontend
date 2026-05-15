'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ActividadEstado } from '../types';
import { useCreateActividad, useUpdateActividad, useActividad, useTiposActividad } from '../hooks';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

const actividadSchema = z.object({
  titulo: z.string().min(3, 'El título es requerido').max(200),
  descripcion: z.string().min(10, 'Proporcione una descripción más detallada'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().min(1, 'La hora es requerida'),
  tipo_actividad_id: z.number().min(1, 'El tipo es requerido'),
  estado: z.enum(['borrador', 'creada', 'cancelada']),
});

type ActividadFormValues = z.infer<typeof actividadSchema>;

interface ActividadFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actividadId?: number | null;
}

export function ActividadFormDialog({ isOpen, onClose, actividadId }: ActividadFormDialogProps) {
  const router = useRouter();
  const isEditing = !!actividadId;
  const { data: actividad, isLoading: isLoadingDetails } = useActividad(actividadId || undefined);
  const { data: tipos, isLoading: isLoadingTipos } = useTiposActividad();
  
  const { mutate: createActividad, isPending: isCreating } = useCreateActividad();
  const { mutate: updateActividad, isPending: isUpdating } = useUpdateActividad(actividadId || 0);

  const isDictionariesLoading = isLoadingTipos;

  const defaultFormValues: ActividadFormValues = {
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '09:00',
    tipo_actividad_id: 0,
    estado: 'creada',
  };

  const computedFormValues = useMemo(() => {
    if (isEditing && actividad) {
      const fullDate = actividad.fecha_actividad || '';
      return {
        titulo: actividad.titulo || '',
        descripcion: actividad.descripcion || '',
        fecha: fullDate.split(' ')[0] || '',
        hora: fullDate.split(' ')[1]?.slice(0, 5) || '09:00',
        tipo_actividad_id: actividad.tipo_actividad?.id || 0,
        estado: actividad.estado || 'creada',
      };
    }
    return undefined;
  }, [isEditing, actividad]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: defaultFormValues,
    values: isEditing ? computedFormValues : undefined,
  });

  useEffect(() => {
    if (!isOpen) {
      clearErrors();
    } else if (isOpen && !isEditing) {
      reset(defaultFormValues);
    }
  }, [isOpen, isEditing, reset, clearErrors]);

  const onSubmit = (data: ActividadFormValues) => {
    // Combinar fecha y hora para el backend
    const formattedData = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_actividad: `${data.fecha} ${data.hora}:00`,
      tipo_actividad_id: data.tipo_actividad_id,
      estado: data.estado,
    };

    if (isEditing && actividadId) {
      updateActividad(formattedData, {
        onSuccess: () => {
          toast.success('Actividad actualizada correctamente');
          onClose();
        }
      });
    } else {
      createActividad(formattedData, {
        onSuccess: (newActividad) => {
          toast.success('Actividad registrada correctamente');
          onClose();
          router.push(`/actividades/${newActividad.id}`);
        }
      });
    }
  };

  const isPending = isCreating || isUpdating || (isEditing && isLoadingDetails) || isDictionariesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Actualice la información básica de la actividad.' 
              : 'Registre los detalles de la actividad política. Podrá gestionar los participantes y evidencias después de crearla.'}
          </DialogDescription>
        </DialogHeader>

        {isPending && (isEditing || isDictionariesLoading) ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500 font-medium">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">Título de la Actividad</Label>
                <Input id="titulo" {...register('titulo')} placeholder="Ej: Asamblea de Coordinación Regional" />
                {errors.titulo && <p className="text-xs text-red-500 font-medium">{errors.titulo.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" {...register('descripcion')} placeholder="Detalle los objetivos y resultados..." className="min-h-[100px]" />
                {errors.descripcion && <p className="text-xs text-red-500 font-medium">{errors.descripcion.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha" className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> Fecha
                </Label>
                <Input id="fecha" type="date" {...register('fecha')} />
                {errors.fecha && <p className="text-xs text-red-500 font-medium">{errors.fecha.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora" className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Hora
                </Label>
                <Input id="hora" type="time" {...register('hora')} />
                {errors.hora && <p className="text-xs text-red-500 font-medium">{errors.hora.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_actividad_id">Tipo de Actividad</Label>
                <Select 
                  key={isPending ? 'loading' : `ready-${watch('tipo_actividad_id')}`}
                  onValueChange={(val) => setValue('tipo_actividad_id', Number(val))}
                  value={watch('tipo_actividad_id')?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos?.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo_actividad_id && <p className="text-xs text-red-500 font-medium">{errors.tipo_actividad_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  onValueChange={(val) => setValue('estado', val as ActividadEstado)}
                  value={watch('estado')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="creada">Creada / Programada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado && <p className="text-xs text-red-500 font-medium">{errors.estado.message}</p>}
              </div>
            </div>

            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]">
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Continuar a Detalles'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
