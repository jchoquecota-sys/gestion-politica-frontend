'use client';

import { useState } from 'react';
import { CargosTable } from '@/features/cargos/components/CargosTable';
import { CargoFormDialog } from '@/features/cargos/components/CargoFormDialog';
import { Cargo } from '@/features/cargos/types';

export default function CargosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);

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
