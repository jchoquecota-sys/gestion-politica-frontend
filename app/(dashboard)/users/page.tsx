'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { UsersTable } from '@/features/users/components/UsersTable';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import { Button } from '@/components/ui/button';
import { UserPlus, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const router = useRouter();
  
  if (!hasPermission('users:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso Denegado</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
          No tienes los permisos necesarios para acceder a la gestión de usuarios.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const canCreate = hasPermission('users:create');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 mt-1">
            Administra los usuarios del sistema, sus cuentas y sus roles asignados.
          </p>
        </div>
        
        {canCreate && (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      <UsersTable />

      <UserFormDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
    </div>
  );
}
