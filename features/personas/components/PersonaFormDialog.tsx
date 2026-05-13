'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Persona } from '../types';
import { useCreatePersona, useUpdatePersona } from '../hooks/usePersonas';
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
import { Loader2 } from 'lucide-react';

const personaSchema = z.object({
  nombres: z.string().min(2, 'Los nombres son requeridos').max(100),
  apellidos: z.string().min(2, 'Los apellidos son requeridos').max(100),
  dni: z.string().length(8, 'El DNI debe tener 8 dígitos').regex(/^\d+$/, 'DNI inválido'),
  celular: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
});

type PersonaFormValues = z.infer<typeof personaSchema>;

interface PersonaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  persona?: Persona | null;
}

export function PersonaFormDialog({ isOpen, onClose, persona }: PersonaFormDialogProps) {
  const isEditing = !!persona;
  const { mutate: createPersona, isPending: isCreating } = useCreatePersona();
  const { mutate: updatePersona, isPending: isUpdating } = useUpdatePersona();

  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      dni: '',
      celular: '',
      email: '',
      direccion: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (persona) {
        reset({
          nombres: persona.nombres,
          apellidos: persona.apellidos,
          dni: persona.dni,
          celular: persona.celular || '',
          email: persona.email || '',
          direccion: persona.direccion || '',
        });
      } else {
        reset({
          nombres: '',
          apellidos: '',
          dni: '',
          celular: '',
          email: '',
          direccion: '',
        });
      }
    }
  }, [isOpen, persona, reset]);

  const onSubmit = (data: PersonaFormValues) => {
    if (isEditing && persona) {
      updatePersona({ id: persona.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createPersona(data, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Persona' : 'Registrar Persona'}</DialogTitle>
          <DialogDescription>
            Completa la información básica de la persona para poder vincularla a sectores.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres <span className="text-red-500">*</span></Label>
              <Input id="nombres" {...register('nombres')} disabled={isPending} />
              {errors.nombres && <p className="text-sm text-red-500">{errors.nombres.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos <span className="text-red-500">*</span></Label>
              <Input id="apellidos" {...register('apellidos')} disabled={isPending} />
              {errors.apellidos && <p className="text-sm text-red-500">{errors.apellidos.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI <span className="text-red-500">*</span></Label>
            <Input id="dni" maxLength={8} {...register('dni')} disabled={isPending} />
            {errors.dni && <p className="text-sm text-red-500">{errors.dni.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <Input id="celular" {...register('celular')} disabled={isPending} />
              {errors.celular && <p className="text-sm text-red-500">{errors.celular.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} disabled={isPending} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register('direccion')} disabled={isPending} />
            {errors.direccion && <p className="text-sm text-red-500">{errors.direccion.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Registrar Persona'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
