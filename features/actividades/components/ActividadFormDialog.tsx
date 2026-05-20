'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Loader2, Calendar as CalendarIcon, Clock, Globe, Upload, Trash2, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import MapPicker from '@/features/bases/components/MapPicker';

const actividadSchema = z.object({
  titulo: z.string().min(3, 'El título es requerido').max(200),
  descripcion: z.string().min(10, 'Proporcione una descripción más detallada'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().min(1, 'La hora es requerida'),
  tipo_actividad_id: z.number().min(1, 'El tipo es requerido'),
  estado: z.enum(['borrador', 'creada', 'cancelada']),
  es_publica: z.boolean(),
  foto_portada: z.any().optional(), // File object
  latitud: z.number().nullable().optional(),
  longitud: z.number().nullable().optional(),
  radio_asistencia_metros: z.number().min(1).optional(),
});

interface ActividadFormValues {
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  tipo_actividad_id: number;
  estado: ActividadEstado;
  es_publica: boolean;
  foto_portada?: any;
  latitud?: number | null;
  longitud?: number | null;
  radio_asistencia_metros?: number;
}

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
    es_publica: false,
    foto_portada: undefined,
    latitud: null,
    longitud: null,
    radio_asistencia_metros: 100,
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
        es_publica: actividad.es_publica ?? false,
        foto_portada: undefined, // Reset file on load
        latitud: actividad.latitud,
        longitud: actividad.longitud,
        radio_asistencia_metros: actividad.radio_asistencia_metros || 100,
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

  const watchLat = watch('latitud');
  const watchLng = watch('longitud');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const selectedFile = watch('foto_portada');

  useEffect(() => {
    if (selectedFile instanceof File) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (isEditing && actividad?.foto_portada_url) {
      setPreviewUrl(actividad.foto_portada_url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile, isEditing, actividad?.foto_portada_url]);

  useEffect(() => {
    if (!isOpen) {
      clearErrors();
    } else if (isOpen && !isEditing) {
      reset(defaultFormValues);
      setPreviewUrl(null);
    }
  }, [isOpen, isEditing, reset, clearErrors]);

  const onSubmit = (data: ActividadFormValues) => {
    const formattedData = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_actividad: `${data.fecha} ${data.hora}:00`,
      tipo_actividad_id: data.tipo_actividad_id,
      estado: data.estado,
      es_publica: data.es_publica,
      latitud: data.latitud,
      longitud: data.longitud,
      radio_asistencia_metros: data.radio_asistencia_metros,
      foto_portada: data.foto_portada instanceof File ? data.foto_portada : null,
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
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] max-h-[95vh] overflow-y-auto">
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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500 font-medium">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Izquierda: Datos Básicos */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título de la Actividad</Label>
                  <Input id="titulo" {...register('titulo')} placeholder="Ej: Asamblea de Coordinación Regional" />
                  {errors.titulo && <p className="text-xs text-red-500 font-medium">{errors.titulo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" {...register('descripcion')} placeholder="Detalle los objetivos y resultados..." className="min-h-[100px]" />
                  {errors.descripcion && <p className="text-xs text-red-500 font-medium">{errors.descripcion.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_actividad_id">Tipo</Label>
                    <Select 
                      key={isPending ? 'loading' : `ready-${watch('tipo_actividad_id')}`}
                      onValueChange={(val) => setValue('tipo_actividad_id', Number(val))}
                      value={watch('tipo_actividad_id')?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
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
                        <SelectItem value="creada">Programada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado && <p className="text-xs text-red-500 font-medium">{errors.estado.message}</p>}
                  </div>
                </div>

                {/* Visibilidad pública y Foto */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="es_publica" className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Publicar en Landing Page
                      </Label>
                    </div>
                    <Switch
                      id="es_publica"
                      checked={watch('es_publica')}
                      onCheckedChange={(val) => setValue('es_publica', val)}
                    />
                  </div>

                  {watch('es_publica') && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center group">
                          {previewUrl ? (
                            <>
                              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button type="button" size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => setValue('foto_portada', null)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-2">
                              <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Sin foto</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label 
                            htmlFor="foto_portada" 
                            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 border-dashed border-primary/20 dark:border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors text-center"
                          >
                            <Upload className="h-4 w-4 text-primary" />
                            <p className="text-xs font-bold text-primary leading-tight">Subir foto</p>
                          </Label>
                          <input 
                            id="foto_portada"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setValue('foto_portada', file);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Configuraciones */}
              <div className="space-y-4">
                {/* Geolocalización con Mapa */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Geolocalización
                      </Label>
                      <p className="text-xs text-slate-500 mt-1">
                        Mueva el pin en el mapa para fijar el evento.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Label htmlFor="radio_asistencia_metros" className="text-xs">Radio (m)</Label>
                      <Input 
                        id="radio_asistencia_metros" 
                        type="number" 
                        className="w-20 h-8 text-xs"
                        {...register('radio_asistencia_metros', { valueAsNumber: true })} 
                      />
                    </div>
                  </div>

                  <MapPicker 
                    lat={watchLat || undefined} 
                    lng={watchLng || undefined} 
                    onChange={(lat, lng) => {
                      setValue('latitud', lat);
                      setValue('longitud', lng);
                    }}
                    disabled={isPending}
                  />

                  <div className="flex gap-4 text-xs text-slate-500 bg-white dark:bg-slate-950 p-2 rounded-md border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" /> Lat: {watchLat?.toFixed(6) || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" /> Lng: {watchLng?.toFixed(6) || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-white min-w-[140px]">
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
