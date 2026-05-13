'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Cargo } from '../types';
import { useCreateCargo, useUpdateCargo } from '../hooks/useCargos';
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
import { Loader2 } from 'lucide-react';

const cargoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  descripcion: z.string().optional().or(z.literal('')),
});

type CargoFormValues = z.infer<typeof cargoSchema>;

interface CargoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cargo?: Cargo | null;
}

export function CargoFormDialog({ isOpen, onClose, cargo }: CargoFormDialogProps) {
  const isEditing = !!cargo;
  const { mutate: createCargo, isPending: isCreating } = useCreateCargo();
  const { mutate: updateCargo, isPending: isUpdating } = useUpdateCargo();

  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CargoFormValues>({
    resolver: zodResolver(cargoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (cargo) {
        reset({
          nombre: cargo.nombre,
          descripcion: cargo.descripcion || '',
        });
      } else {
        reset({
          nombre: '',
          descripcion: '',
        });
      }
    }
  }, [isOpen, cargo, reset]);

  const onSubmit = (data: CargoFormValues) => {
    if (isEditing && cargo) {
      updateCargo({ id: cargo.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createCargo(data, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cargo' : 'Crear Nuevo Cargo'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Actualiza la información del cargo seleccionado.'
              : 'Define un nuevo cargo o rol para asignar a las personas dentro de los sectores.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Cargo <span className="text-red-500">*</span></Label>
            <Input 
              id="nombre" 
              placeholder="Ej: Coordinador de Zona" 
              {...register('nombre')}
              disabled={isPending}
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea 
              id="descripcion" 
              placeholder="Opcional: detalles sobre las responsabilidades" 
              {...register('descripcion')}
              disabled={isPending}
              rows={3}
            />
            {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Cargo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
