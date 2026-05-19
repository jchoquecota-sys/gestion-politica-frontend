'use client';

import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { useAuthStore } from '@/store/useAuthStore';
import { User } from '../types';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit2, Trash2, Loader2, Mail, Shield } from 'lucide-react';
import { UserFormDialog } from './UserFormDialog';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function UsersTable() {
  const { data: users, isLoading } = useUsers();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const currentUser = useAuthStore((state) => state.user);
  
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id, {
        onSuccess: () => setUserToDelete(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const canEdit = hasPermission('users:edit');
  const canDelete = hasPermission('users:delete');

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900">
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Fecha Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-primary/10 dark:border-slate-800">
                    <AvatarFallback className="bg-primary/5 text-primary dark:bg-slate-800 dark:text-slate-200">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center">
                      {user.name}
                      {currentUser?.id === user.id && (
                        <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                          Tú
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 border-none shadow-none">
                      <Shield className="h-3 w-3" />
                      {role}
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <span className="text-xs text-slate-500 italic">Sin roles</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {canEdit && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(user)}
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && currentUser?.id !== user.id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setUserToDelete(user)}
                      className="h-8 w-8 text-brand-secondary hover:bg-brand-secondary/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                No hay usuarios registrados en el sistema.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de edición */}
      {userToEdit && (
        <UserFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setTimeout(() => setUserToEdit(null), 200);
          }}
          user={userToEdit}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar a <span className="font-semibold text-slate-900">{userToDelete?.name}</span>. 
              Esta acción revocará todos sus accesos al sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={isDeleting}>
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
