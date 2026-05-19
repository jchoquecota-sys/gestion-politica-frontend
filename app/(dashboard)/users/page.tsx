'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { UsersTable } from '@/features/users/components/UsersTable';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  
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
