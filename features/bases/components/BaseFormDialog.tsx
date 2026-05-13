'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Base } from '../types';
import { useCreateBase, useUpdateBase, useBase } from '../hooks/useBases';
import { useSectores } from '@/features/sectores/hooks/useSectores';
import { usePersonas } from '@/features/personas/hooks/usePersonas';
import { useCargos } from '@/features/cargos/hooks/useCargos';
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
import { Loader2, Plus, Trash2, UserPlus, MapPin, Navigation } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import MapPicker from './MapPicker';

const baseSchema = z.object({
  sector_id: z.number().min(1, 'El sector es requerido'),
  nombre: z.string().min(3, 'El nombre es requerido').max(150),
  descripcion: z.string().optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  latitud: z.number(),
  longitud: z.number(),
  personas: z.array(z.object({
    persona_id: z.number().min(1, 'Seleccione una persona'),
    cargo_id: z.number().min(1, 'Seleccione un cargo'),
    es_principal: z.boolean(),
    fecha_inicio: z.string().min(1, 'La fecha es requerida'),
    observaciones: z.string().optional().or(z.literal('')),
  })).min(1, 'Debe asignar al menos una persona a la base'),
});

type BaseFormValues = z.infer<typeof baseSchema>;

interface BaseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  baseId?: number | null;
}

export function BaseFormDialog({ isOpen, onClose, baseId }: BaseFormDialogProps) {
  const isEditing = !!baseId;
  const { data: baseDetails, isLoading: isLoadingDetails } = useBase(baseId || null);
  const { data: sectores, isLoading: isLoadingSectores } = useSectores();
  const { data: personas, isLoading: isLoadingPersonas } = usePersonas();
  const { data: cargos, isLoading: isLoadingCargos } = useCargos();
  
  const { mutate: createBase, isPending: isCreating } = useCreateBase();
  const { mutate: updateBase, isPending: isUpdating } = useUpdateBase();

  const isDictionariesLoading = isLoadingSectores || isLoadingPersonas || isLoadingCargos;
  const isPending = isCreating || isUpdating || (isEditing && isLoadingDetails) || isDictionariesLoading;

  // 1. Definir valores por defecto puros
  const defaultFormValues: BaseFormValues = {
    sector_id: 0,
    nombre: '',
    descripcion: '',
    direccion: '',
    latitud: -18.0117,
    longitud: -70.2536,
    personas: [{ persona_id: 0, cargo_id: 0, es_principal: true, observaciones: '', fecha_inicio: new Date().toISOString().split('T')[0] }],
  };

  // 2. Computar valores reales cuando lleguen los datos asíncronos
  const computedFormValues = useMemo(() => {
    if (isEditing && baseDetails) {
      return {
        sector_id: Number(baseDetails.sector?.id || baseDetails.sector_id || 0),
        nombre: baseDetails.nombre || '',
        descripcion: baseDetails.descripcion || '',
        direccion: baseDetails.direccion || '',
        latitud: Number(baseDetails.coordenadas?.lat || baseDetails.latitud || -18.0117),
        longitud: Number(baseDetails.coordenadas?.lng || baseDetails.longitud || -70.2536),
        personas: baseDetails.equipo?.length ? baseDetails.equipo.map(p => ({
          persona_id: Number(p.persona_id || p.id || 0),
          cargo_id: Number(p.cargo_id || 0),
          es_principal: !!p.es_principal,
          fecha_inicio: p.fecha_inicio ? p.fecha_inicio.split('T')[0] : new Date().toISOString().split('T')[0],
          observaciones: p.observaciones || '',
        })) : defaultFormValues.personas,
      };
    }
    return undefined; // Crucial: devolver undefined mientras carga para no sobrescribir con defaults
  }, [isEditing, baseDetails]);

  // 3. Inicializar el formulario con la propiedad 'values' reactiva
  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch, clearErrors } = useForm<BaseFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: defaultFormValues,
    values: isEditing ? computedFormValues : undefined, 
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "personas"
  });

  const watchLat = watch("latitud");
  const watchLng = watch("longitud");
  const watchPersonas = watch("personas");

  // Limpiar el formulario y errores para evitar falsos positivos
  useEffect(() => {
    if (!isOpen) {
      clearErrors(); // Limpiar errores al cerrar
    } else if (isOpen && !isEditing) {
      reset(defaultFormValues); // Resetear a valores por defecto al crear
    } else if (isOpen && isEditing && baseDetails) {
      clearErrors(); // IMPORTANTE: Radix UI dispara validaciones prematuras al montar. Limpiamos cuando los datos reales llegan.
    }
  }, [isOpen, isEditing, reset, clearErrors, baseDetails]);

  // ================= DEBUG =================
  useEffect(() => {
    if (isOpen) {
      console.log('--- DEBUG: ESTADO DEL FORMULARIO DE BASES ---');
      console.log('Cargando Diccionarios?:', isDictionariesLoading);
      console.log('Cargando Detalles?:', isLoadingDetails);
      console.log('Valor actual de sector_id (watch):', watch('sector_id'), 'Tipo:', typeof watch('sector_id'));
      console.log('Errores en sector_id:', errors.sector_id);
      console.log('Errores completos:', errors);
      console.log('-------------------------------------------');
    }
  }, [isOpen, isDictionariesLoading, isLoadingDetails, watch('sector_id'), errors]);
  // =========================================

  const onSubmit = (data: BaseFormValues) => {
    const payload = {
      ...data,
      personas: data.personas.map(p => ({
        ...p,
        persona_id: Number(p.persona_id),
        cargo_id: Number(p.cargo_id)
      }))
    };

    if (isEditing && baseId) {
      updateBase({ id: baseId, data: payload as any }, { onSuccess: () => onClose() });
    } else {
      createBase(payload as any, { onSuccess: () => onClose() });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Base Territorial' : 'Registrar Nueva Base'}</DialogTitle>
          <DialogDescription>
            Complete los datos de la base y seleccione su ubicación exacta en el mapa.
          </DialogDescription>
        </DialogHeader>

        {(isLoadingDetails && isEditing) || isDictionariesLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500">Cargando datos del formulario...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Datos Básicos */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sector_id">Sector Perteneciente <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(val) => {
                      if (val) setValue('sector_id', Number(val), { shouldValidate: true });
                    }}
                    value={watch('sector_id') ? watch('sector_id').toString() : undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectores?.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sector_id && <p className="text-sm text-red-500">{errors.sector_id.message || "El sector es requerido"}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Base <span className="text-red-500">*</span></Label>
                  <Input id="nombre" {...register('nombre')} placeholder="Ej: Base Centro" />
                  {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección / Referencia</Label>
                  <Input id="direccion" {...register('direccion')} placeholder="Ej: Av. Principal 456" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" {...register('descripcion')} placeholder="Detalles adicionales..." />
                </div>
              </div>

              {/* Columna Derecha: Mapa */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  Ubicación Geográfica (Tacna)
                </Label>
                <MapPicker 
                  lat={watchLat} 
                  lng={watchLng} 
                  onChange={(lat, lng) => {
                    setValue('latitud', lat);
                    setValue('longitud', lng);
                  }}
                  disabled={isPending}
                />
                <div className="flex gap-4 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" /> Lat: {watchLat?.toFixed(6) || '0.000000'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" /> Lng: {watchLng?.toFixed(6) || '0.000000'}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Personal Asignado */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  Personal de la Base
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ persona_id: 0, cargo_id: 0, es_principal: false, observaciones: '', fecha_inicio: new Date().toISOString().split('T')[0] })}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" /> Añadir
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50/50 rounded-lg border relative group">
                  <div className="md:col-span-4 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Persona</Label>
                    <Select 
                      onValueChange={(val) => {
                        if (val) setValue(`personas.${index}.persona_id`, Number(val), { shouldValidate: true });
                      }}
                      value={watchPersonas[index]?.persona_id ? watchPersonas[index]?.persona_id.toString() : undefined}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione persona" />
                      </SelectTrigger>
                      <SelectContent>
                        {personas?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.nombres} {p.apellidos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Cargo</Label>
                    <Select 
                      onValueChange={(val) => {
                        if (val) setValue(`personas.${index}.cargo_id`, Number(val), { shouldValidate: true });
                      }}
                      value={watchPersonas[index]?.cargo_id ? watchPersonas[index]?.cargo_id.toString() : undefined}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargos?.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Fecha Inicio</Label>
                    <Input 
                      type="date" 
                      className="bg-white"
                      {...register(`personas.${index}.fecha_inicio`)} 
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-center pt-6">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`main-${index}`}
                        checked={watchPersonas[index]?.es_principal}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            watchPersonas.forEach((_, i) => setValue(`personas.${i}.es_principal`, i === index));
                          } else {
                            setValue(`personas.${index}.es_principal`, false);
                          }
                        }}
                      />
                      <Label htmlFor={`main-${index}`} className="text-xs font-medium cursor-pointer">Principal</Label>
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-center justify-end pt-6">
                    {fields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="md:col-span-12">
                    <Input 
                      placeholder="Observaciones adicionales (opcional)" 
                      className="bg-white text-xs h-8"
                      {...register(`personas.${index}.observaciones`)} 
                    />
                  </div>
                </div>
              ))}
              {errors.personas && <p className="text-sm text-red-500">{errors.personas.message}</p>}
            </div>

            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar Base' : 'Registrar Base'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
