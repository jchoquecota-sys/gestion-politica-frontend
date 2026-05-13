'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '../types';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ShieldCheck } from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional().or(z.literal('')),
  roles: z.array(z.string()),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export function UserFormDialog({ isOpen, onClose, user }: UserFormDialogProps) {
  const isEditing = !!user;
  
  const { data: availableRoles, isLoading: isLoadingRoles } = useRoles();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roles: [],
    },
  });

  const selectedRoles = watch('roles') || [];

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          password: '',
          roles: user.roles,
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          roles: [],
        });
      }
    }
  }, [isOpen, user, reset]);

  const toggleRole = (roleName: string, checked: boolean) => {
    if (checked) {
      setValue('roles', [...selectedRoles, roleName], { shouldDirty: true });
    } else {
      setValue('roles', selectedRoles.filter((r) => r !== roleName), { shouldDirty: true });
    }
  };

  const onSubmit = (data: UserFormValues) => {
    const formattedData = { ...data };
    
    // Si estamos editando y el password está vacío, lo eliminamos para que el backend no intente cambiarlo
    if (isEditing && !formattedData.password) {
      delete formattedData.password;
    }

    if (isEditing && user) {
      updateUser({ id: user.id, data: formattedData }, {
        onSuccess: () => onClose()
      });
    } else {
      createUser(formattedData as any, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Actualiza los datos básicos y roles del usuario.'
              : 'Registra un nuevo usuario y asígnale sus roles iniciales.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                placeholder="Ej: Juan Pérez" 
                {...register('name')}
                disabled={isPending}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico <span className="text-red-500">*</span></Label>
              <Input 
                id="email" 
                type="email"
                placeholder="juan@ejemplo.com" 
                {...register('email')}
                disabled={isPending}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña {isEditing ? '(Dejar vacío para no cambiar)' : <span className="text-red-500">*</span>}
            </Label>
            <Input 
              id="password" 
              type="password"
              placeholder="••••••••" 
              {...register('password')}
              disabled={isPending}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Asignación de Roles
            </Label>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                {availableRoles?.map((role) => (
                  <div key={role.id} className="flex flex-row items-center space-x-3 space-y-0">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.name)}
                      onCheckedChange={(checked) => toggleRole(role.name, checked as boolean)}
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {role.name}
                    </Label>
                  </div>
                ))}
                {(!availableRoles || availableRoles.length === 0) && (
                  <p className="text-sm text-slate-500 col-span-2">No hay roles definidos.</p>
                )}
              </div>
            )}
            {errors.roles && <p className="text-xs text-red-500">{errors.roles.message}</p>}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
