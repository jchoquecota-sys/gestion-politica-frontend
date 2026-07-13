'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Role } from '../types';
import { usePermissions, useCreateRole, useUpdateRole } from '../hooks/useRoles';
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
import { Loader2 } from 'lucide-react';

const roleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null; // Si existe, es edición. Si es null, es creación.
}

export function RoleFormDialog({ isOpen, onClose, role }: RoleFormDialogProps) {
  const isEditing = !!role;
  
  const { data: availablePermissions, isLoading: isLoadingPermissions } = usePermissions();
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();

  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  const selectedPermissions = watch('permissions') || [];

  // Agrupar permisos por módulo
  const groupedPermissions = availablePermissions?.reduce((acc, perm) => {
    const [moduleName] = perm.split(':');
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(perm);
    return acc;
  }, {} as Record<string, string[]>) || {};

  // Resetear el formulario cuando se abre/cierra o cambia el rol
  useEffect(() => {
    if (isOpen) {
      if (role) {
        reset({
          name: role.name,
          permissions: role.permissions,
        });
      } else {
        reset({
          name: '',
          permissions: [],
        });
      }
    }
  }, [isOpen, role, reset]);

  const togglePermission = (perm: string, checked: boolean) => {
    if (checked) {
      setValue('permissions', [...selectedPermissions, perm], { shouldDirty: true });
    } else {
      setValue('permissions', selectedPermissions.filter((p) => p !== perm), { shouldDirty: true });
    }
  };

  const handleToggleModule = (moduleName: string, perms: string[]) => {
    const allSelected = perms.every((perm) => selectedPermissions.includes(perm));
    if (allSelected) {
      setValue(
        'permissions',
        selectedPermissions.filter((p) => !perms.includes(p)),
        { shouldDirty: true }
      );
    } else {
      const otherPermissions = selectedPermissions.filter((p) => !perms.includes(p));
      setValue('permissions', [...otherPermissions, ...perms], { shouldDirty: true });
    }
  };

  const onSubmit = (data: RoleFormValues) => {
    // Evitar enviar data.permissions si no se modificaron en edición, o enviar todo (según la API lo permite)
    if (isEditing && role) {
      updateRole({ id: role.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createRole(data, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica el nombre y los permisos asignados a este rol.'
              : 'Asigna un nombre único y selecciona los permisos iniciales.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Rol <span className="text-red-500">*</span></Label>
            <Input 
              id="name" 
              placeholder="Ej: manager" 
              {...register('name')}
              disabled={isPending}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Permisos del Sistema</Label>
            {isLoadingPermissions ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                  <div key={moduleName} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                      <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 capitalize">
                        Módulo: {moduleName}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleToggleModule(moduleName, perms)}
                        className="text-xs text-primary hover:text-primary/80 hover:underline font-semibold transition-colors"
                        disabled={isPending}
                      >
                        {perms.every((perm) => selectedPermissions.includes(perm))
                          ? 'Desmarcar todo'
                          : 'Seleccionar todo'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {perms.map((perm) => (
                        <div key={perm} className="flex flex-row items-start space-x-3 space-y-0">
                          <Checkbox
                            id={`perm-${perm}`}
                            checked={selectedPermissions.includes(perm)}
                            onCheckedChange={(checked) => togglePermission(perm, checked as boolean)}
                            disabled={isPending}
                          />
                          <div className="space-y-1 leading-none">
                            <Label
                              htmlFor={`perm-${perm}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {perm.split(':')[1] || perm}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {(!availablePermissions || availablePermissions.length === 0) && (
                  <p className="text-sm text-slate-500">No se encontraron permisos disponibles.</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-white">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Rol'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
