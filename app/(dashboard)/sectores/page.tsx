'use client';

import { useState } from 'react';
import { SectoresTable } from '@/features/sectores/components/SectoresTable';
import { SectorFormDialog } from '@/features/sectores/components/SectorFormDialog';
import { Sector } from '@/features/sectores/types';

export default function SectoresPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);

  const handleEdit = (sector: Sector) => {
    setSelectedSectorId(sector.id);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedSectorId(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Gestión de Sectores Territoriales
        </h1>
        <p className="text-slate-500 mt-1">
          Define los sectores territoriales, asigna responsables y coordina el trabajo en campo.
        </p>
      </div>

      <SectoresTable onAdd={handleAdd} onEdit={handleEdit} />

      <SectorFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        sectorId={selectedSectorId}
      />
    </div>
  );
}
