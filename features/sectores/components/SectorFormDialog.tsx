'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sector } from '../types';
import { useCreateSector, useUpdateSector, useSector } from '../hooks/useSectores';
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
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const sectorSchema = z.object({
  nombre: z.string().min(3, 'El nombre es requerido').max(150),
  descripcion: z.string().optional(),
  codigo: z.string().min(2, 'El código es requerido').max(20),
  referencia_ubicacion: z.string().optional(),
  personas: z.array(z.object({
    persona_id: z.number().min(1, 'Seleccione una persona'),
    cargo_id: z.number().min(1, 'Seleccione un cargo'),
    es_principal: z.boolean(),
    observaciones: z.string().optional().or(z.literal('')),
  })).min(1, 'Debe asignar al menos una persona al sector'),
});

type SectorFormValues = z.infer<typeof sectorSchema>;

interface SectorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sectorId?: number | null;
}

export function SectorFormDialog({ isOpen, onClose, sectorId }: SectorFormDialogProps) {
  const isEditing = !!sectorId;
  const { data: sectorDetails, isLoading: isLoadingDetails } = useSector(sectorId || null);
  const { data: personas } = usePersonas();
  const { data: cargos } = useCargos();
  
  const { mutate: createSector, isPending: isCreating } = useCreateSector();
  const { mutate: updateSector, isPending: isUpdating } = useUpdateSector();

  const isPending = isCreating || isUpdating || (isEditing && isLoadingDetails);

  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<SectorFormValues>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      codigo: '',
      referencia_ubicacion: '',
      personas: [{ persona_id: 0, cargo_id: 0, es_principal: true, observaciones: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "personas"
  });

  const watchPersonas = watch("personas");

  useEffect(() => {
    if (isOpen) {
      if (isEditing && sectorDetails) {
        reset({
          nombre: sectorDetails.nombre,
          descripcion: sectorDetails.descripcion || '',
          codigo: sectorDetails.codigo,
          referencia_ubicacion: sectorDetails.referencia_ubicacion || '',
          personas: sectorDetails.equipo?.map(p => {
            // Si el backend no envía cargo_id, intentamos buscarlo por nombre en la lista de cargos
            const cargoEncontrado = !p.cargo_id && p.cargo && cargos 
              ? cargos.find(c => c.nombre.toLowerCase() === p.cargo?.toLowerCase())
              : null;

            return {
              persona_id: p.persona_id || p.id || 0,
              cargo_id: p.cargo_id || cargoEncontrado?.id || 0,
              es_principal: !!p.es_principal,
              observaciones: p.observaciones || '',
            };
          }) || [{ persona_id: 0, cargo_id: 0, es_principal: true, observaciones: '' }],
        });
      } else if (!isEditing) {
        reset({
          nombre: '',
          descripcion: '',
          codigo: '',
          referencia_ubicacion: '',
          personas: [{ persona_id: 0, cargo_id: 0, es_principal: true, observaciones: '' }],
        });
      }
    }
  }, [isOpen, isEditing, sectorDetails, reset, cargos]);

  const onSubmit = (data: SectorFormValues) => {
    if (isEditing && sectorId) {
      updateSector({ id: sectorId, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createSector(data, {
        onSuccess: () => onClose()
      });
    }
  };

  const handlePrincipalChange = (index: number, checked: boolean) => {
    if (checked) {
      // Si este es principal, desmarcar todos los demás
      const updatedPersonas = watchPersonas.map((p, i) => ({
        ...p,
        es_principal: i === index
      }));
      setValue("personas", updatedPersonas);
    } else {
      // No permitir desmarcar si es el único (al menos debe haber uno principal)
      // O simplemente dejar que el usuario marque otro
      setValue(`personas.${index}.es_principal`, false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Sector' : 'Crear Nuevo Sector'}</DialogTitle>
          <DialogDescription>
            Configura el sector y asigna el personal responsable con sus respectivos cargos.
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm text-slate-500">Cargando detalles del sector...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Sector <span className="text-red-500">*</span></Label>
                <Input id="nombre" placeholder="Ej: Sector Norte 01" {...register('nombre')} disabled={isPending} />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código Identificador <span className="text-red-500">*</span></Label>
                <Input id="codigo" placeholder="Ej: SEC-N01" {...register('codigo')} disabled={isPending} className="uppercase" />
                {errors.codigo && <p className="text-sm text-red-500">{errors.codigo.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencia_ubicacion">Referencia de Ubicación</Label>
              <Input id="referencia_ubicacion" placeholder="Ej: Cerca al Mercado Central" {...register('referencia_ubicacion')} disabled={isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" placeholder="Detalles adicionales sobre el sector..." {...register('descripcion')} disabled={isPending} rows={2} />
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-indigo-600" />
                  Personal Asignado
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ persona_id: 0, cargo_id: 0, es_principal: false, observaciones: '' })}
                  disabled={isPending}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Agregar Persona
                </Button>
              </div>
              
              {errors.personas && <p className="text-sm text-red-500 font-medium">{errors.personas.message}</p>}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white border rounded-md relative group">
                    <div className="md:col-span-5 space-y-1.5">
                      <Label className="text-[11px] uppercase text-slate-500 font-bold">Persona</Label>
                      <Select 
                        onValueChange={(val) => setValue(`personas.${index}.persona_id`, parseInt(val))}
                        value={watchPersonas[index]?.persona_id?.toString()}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {personas?.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.nombres} {p.apellidos} ({p.dni})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <Label className="text-[11px] uppercase text-slate-500 font-bold">Cargo</Label>
                      <Select 
                        onValueChange={(val) => setValue(`personas.${index}.cargo_id`, parseInt(val))}
                        value={watchPersonas[index]?.cargo_id?.toString()}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cargos?.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 flex flex-col items-center justify-center space-y-1.5 pt-2">
                      <Label className="text-[11px] uppercase text-slate-500 font-bold">Principal</Label>
                      <Checkbox 
                        checked={watchPersonas[index]?.es_principal}
                        onCheckedChange={(val) => handlePrincipalChange(index, val as boolean)}
                        disabled={isPending}
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end justify-center pb-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)} 
                        disabled={isPending || fields.length === 1}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Errores específicos por fila */}
                    {(errors.personas?.[index]?.persona_id || errors.personas?.[index]?.cargo_id) && (
                      <div className="md:col-span-12">
                        <p className="text-[11px] text-red-500">Asegúrese de seleccionar persona y cargo.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar Sector' : 'Guardar Sector'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
