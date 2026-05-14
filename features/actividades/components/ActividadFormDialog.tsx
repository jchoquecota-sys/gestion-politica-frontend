'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Actividad, ActividadEstado, SujetoType, SujetoActividad } from '../types';
import { useCreateActividad, useUpdateActividad, useActividad, useTiposActividad } from '../hooks';
import { useSectoresOpciones } from '@/features/sectores/hooks/useSectores';
import { useBasesOpciones } from '@/features/bases/hooks/useBases';
import { usePersonasOpciones } from '@/features/personas/hooks/usePersonas';
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
import { Loader2, Plus, Trash2, User, Home, Map } from 'lucide-react';
import { toast } from 'sonner';

const sujetoSchema = z.object({
  sujeto_id: z.number().min(1, 'Seleccione un sujeto'),
  sujeto_type: z.enum(['persona', 'base', 'sector']),
  descripcion_ejecucion: z.string().optional(),
});

const actividadSchema = z.object({
  titulo: z.string().min(3, 'El título es requerido').max(200),
  descripcion: z.string().min(10, 'Proporcione una descripción más detallada'),
  fecha_actividad: z.string().min(1, 'La fecha es requerida'),
  tipo_actividad_id: z.number().min(1, 'El tipo es requerido'),
  estado: z.enum(['borrador', 'creada', 'cancelada']),
  sujetos: z.array(sujetoSchema).min(1, 'Debe asignar al menos un sujeto (Persona, Base o Sector)'),
});

type ActividadFormValues = z.infer<typeof actividadSchema>;

interface ActividadFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actividadId?: number | null;
}

export function ActividadFormDialog({ isOpen, onClose, actividadId }: ActividadFormDialogProps) {
  const isEditing = !!actividadId;
  const { data: actividad, isLoading: isLoadingDetails } = useActividad(actividadId || undefined);
  const { data: tipos, isLoading: isLoadingTipos } = useTiposActividad();
  
  const { data: sectores, isLoading: isLoadingSectores } = useSectoresOpciones();
  const { data: bases, isLoading: isLoadingBases } = useBasesOpciones();
  const { data: personas, isLoading: isLoadingPersonas } = usePersonasOpciones();

  const { mutate: createActividad, isPending: isCreating } = useCreateActividad();
  const { mutate: updateActividad, isPending: isUpdating } = useUpdateActividad(actividadId || 0);

  const isDictionariesLoading = isLoadingTipos || isLoadingSectores || isLoadingBases || isLoadingPersonas;

  // 1. Valores por defecto iniciales
  const defaultFormValues: ActividadFormValues = {
    titulo: '',
    descripcion: '',
    fecha_actividad: '',
    tipo_actividad_id: 0,
    estado: 'creada',
    sujetos: [],
  };

  // 2. Valores computados reactivos para edición
  const computedFormValues = useMemo(() => {
    if (isEditing && actividad) {
      return {
        titulo: actividad.titulo || '',
        descripcion: actividad.descripcion || '',
        fecha_actividad: actividad.fecha_actividad ? actividad.fecha_actividad.replace(' ', 'T').slice(0, 16) : '',
        tipo_actividad_id: actividad.tipo_actividad?.id || 0,
        estado: actividad.estado || 'creada',
        sujetos: actividad.sujetos?.map(s => ({
          sujeto_id: s.sujeto_id,
          sujeto_type: s.sujeto_type,
          descripcion_ejecucion: s.descripcion_ejecucion || '',
        })) || [],
      };
    }
    return undefined;
  }, [isEditing, actividad]);

  const {
    register,
    control,
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sujetos',
  });

  useEffect(() => {
    if (!isOpen) {
      clearErrors();
    } else if (isOpen && !isEditing) {
      reset(defaultFormValues);
    }
  }, [isOpen, isEditing, reset, clearErrors]);

  const onSubmit = (data: ActividadFormValues) => {
    // Convert date back to SQL format
    const formattedData = {
      ...data,
      fecha_actividad: data.fecha_actividad.replace('T', ' ') + ':00',
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
        onSuccess: () => {
          toast.success('Actividad registrada correctamente');
          onClose();
        }
      });
    }
  };

  const isPending = isCreating || isUpdating || (isEditing && isLoadingDetails) || isDictionariesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
          <DialogDescription>
            Registre los detalles de la actividad política y asigne los sujetos responsables.
          </DialogDescription>
        </DialogHeader>

        {isPending && (isEditing || isDictionariesLoading) ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500 font-medium">Cargando datos y catálogos...</p>
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
                <Label htmlFor="fecha_actividad">Fecha y Hora</Label>
                <Input id="fecha_actividad" type="datetime-local" {...register('fecha_actividad')} />
                {errors.fecha_actividad && <p className="text-xs text-red-500 font-medium">{errors.fecha_actividad.message}</p>}
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
                <Label htmlFor="estado">Estado Inicial</Label>
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

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-600" />
                  Sujetos Responsables / Participantes
                </h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ sujeto_id: 0, sujeto_type: 'persona', descripcion_ejecucion: '' })}
                  className="h-8 border-dashed border-slate-300"
                >
                  Añadir Sujeto
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-lg bg-slate-50/50 space-y-3 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-start gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div className="space-y-1.5">
                          <Select 
                            onValueChange={(val) => {
                              setValue(`sujetos.${index}.sujeto_type`, val as SujetoType);
                              setValue(`sujetos.${index}.sujeto_id`, 0); 
                            }}
                            value={watch(`sujetos.${index}.sujeto_type`)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Tipo de Sujeto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="persona"><div className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> Persona</div></SelectItem>
                              <SelectItem value="base"><div className="flex items-center gap-2"><Home className="h-3.5 w-3.5" /> Base</div></SelectItem>
                              <SelectItem value="sector"><div className="flex items-center gap-2"><Map className="h-3.5 w-3.5" /> Sector</div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Select 
                            onValueChange={(val) => setValue(`sujetos.${index}.sujeto_id`, Number(val))}
                            value={watch(`sujetos.${index}.sujeto_id`)?.toString()}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {watch(`sujetos.${index}.sujeto_type`) === 'persona' && personas?.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.nombre_completo}</SelectItem>
                              ))}
                              {watch(`sujetos.${index}.sujeto_type`) === 'base' && bases?.map(b => (
                                <SelectItem key={b.id} value={b.id.toString()}>{b.nombre}</SelectItem>
                              ))}
                              {watch(`sujetos.${index}.sujeto_type`) === 'sector' && sectores?.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input 
                      {...register(`sujetos.${index}.descripcion_ejecucion`)} 
                      placeholder="Rol o acción realizada (opcional)" 
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
                {errors.sujetos && <p className="text-xs text-red-500 font-medium">{errors.sujetos.message}</p>}
                {fields.length === 0 && (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-400">No hay sujetos asignados a esta actividad.</p>
                  </div>
                )}
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
                  isEditing ? 'Guardar Cambios' : 'Registrar Actividad'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
