'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Base } from '../types';
import { useCreateBase, useUpdateBase, useBase } from '../hooks/useBases';
import { useSectoresOpciones } from '@/features/sectores/hooks/useSectores';
import { useAuthStore } from '@/store/useAuthStore';
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
import { Loader2, MapPin, Navigation } from 'lucide-react';
import MapPicker from './MapPicker';

const baseSchema = z.object({
  sector_id: z.number().min(1, 'El sector es requerido'),
  nombre: z.string().min(3, 'El nombre es requerido').max(150),
  descripcion: z.string().optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  latitud: z.number(),
  longitud: z.number(),
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
  const { data: sectores, isLoading: isLoadingSectores } = useSectoresOpciones();
  
  const { mutate: createBase, isPending: isCreating } = useCreateBase();
  const { mutate: updateBase, isPending: isUpdating } = useUpdateBase();

  const isDictionariesLoading = isLoadingSectores;
  const isPending = isCreating || isUpdating || (isEditing && isLoadingDetails) || isDictionariesLoading;

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const user = useAuthStore((state) => state.user);
  const hasListAll = hasPermission('bases:list-all');
  const allowedSectors = user?.allowed_sectors || [];

  const visibleSectores = hasListAll 
    ? sectores 
    : sectores?.filter(s => allowedSectors.includes(s.id));

  const defaultSectorId = !hasListAll && allowedSectors.length === 1 ? allowedSectors[0] : 0;

  // 1. Definir valores por defecto puros
  const defaultFormValues: BaseFormValues = {
    sector_id: defaultSectorId,
    nombre: '',
    descripcion: '',
    direccion: '',
    latitud: -18.0117,
    longitud: -70.2536,
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
      };
    }
    return undefined;
  }, [isEditing, baseDetails]);

  // 3. Inicializar el formulario
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, clearErrors } = useForm<BaseFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: defaultFormValues,
    values: isEditing ? computedFormValues : undefined, 
  });

  const watchLat = watch("latitud");
  const watchLng = watch("longitud");

  // Limpiar el formulario y errores
  useEffect(() => {
    if (!isOpen) {
      clearErrors();
    } else if (isOpen && !isEditing) {
      reset(defaultFormValues);
    }
  }, [isOpen, isEditing, reset, clearErrors]);

  const onSubmit = (data: BaseFormValues) => {
    if (isEditing && baseId) {
      updateBase({ id: baseId, data: data as any }, { onSuccess: () => onClose() });
    } else {
      createBase(data as any, { onSuccess: () => onClose() });
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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando datos del formulario...</p>
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
                    disabled={isPending || (!hasListAll && allowedSectors.length === 1)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleSectores?.map(s => (
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
                  <MapPin className="h-4 w-4 text-primary" />
                  Ubicación Geográfica (Alto de la Alianza)
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
                <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" /> Lat: {watchLat?.toFixed(6) || '0.000000'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" /> Lng: {watchLng?.toFixed(6) || '0.000000'}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-white">
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
