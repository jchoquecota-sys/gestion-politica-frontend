'use client';

import { useRoles, useDeleteRole } from '../hooks/useRoles';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { RoleFormDialog } from './RoleFormDialog';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function RolesTable() {
  const { data: roles, isLoading } = useRoles();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleEditClick = (role: Role) => {
    setRoleToEdit(role);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete.id, {
        onSuccess: () => setRoleToDelete(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const canEdit = hasPermission('roles:edit');
  const canDelete = hasPermission('roles:delete');

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900">
          <TableRow>
            <TableHead>Nombre del Rol</TableHead>
            <TableHead>Permisos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles?.map((role) => (
            <TableRow key={role.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
              <TableCell className="font-medium capitalize">
                {role.name}
                {role.name === 'super-admin' && (
                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                    Sistema
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-md">
                  {role.permissions.slice(0, 4).map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      {perm}
                    </Badge>
                  ))}
                  {role.permissions.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{role.permissions.length - 4} más
                    </Badge>
                  )}
                  {role.permissions.length === 0 && (
                    <span className="text-xs text-slate-500">Sin permisos</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {canEdit && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(role)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRoleToDelete(role)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {roles?.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                No hay roles registrados en el sistema.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de edición */}
      {roleToEdit && (
        <RoleFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setTimeout(() => setRoleToEdit(null), 200); // delay to avoid flickering
          }}
          role={roleToEdit}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <Dialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar rol?</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar el rol <span className="font-semibold text-slate-900">{roleToDelete?.name}</span>. 
              Esta acción no se puede deshacer y los usuarios que tengan este rol perderán sus accesos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
