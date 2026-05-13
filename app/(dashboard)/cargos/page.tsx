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
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Gestión de Cargos
        </h1>
        <p className="text-slate-500 mt-1">
          Administra los cargos y roles que pueden ser asignados al personal en cada sector.
        </p>
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
