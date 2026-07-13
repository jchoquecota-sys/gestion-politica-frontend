'use client';

import { useState } from 'react';
import { CargosTable } from '@/features/cargos/components/CargosTable';
import { CargoFormDialog } from '@/features/cargos/components/CargoFormDialog';
import { Cargo } from '@/features/cargos/types';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CargosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const router = useRouter();

  if (!hasPermission('cargos:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso Denegado</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
          No tienes los permisos necesarios para acceder a la gestión de cargos.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const handleEdit = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCargo(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Gestión de Cargos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Administra los cargos y roles que pueden ser asignados al personal en cada sector.
          </p>
        </div>
      </div>

      <CargosTable onAdd={handleAdd} onEdit={handleEdit} />

      <CargoFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        cargo={selectedCargo}
      />
    </div>
  );
}
