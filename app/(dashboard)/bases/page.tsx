'use client';

import { useState } from 'react';
import { BasesTable } from '@/features/bases/components/BasesTable';
import { BaseFormDialog } from '@/features/bases/components/BaseFormDialog';
import { Base } from '@/features/bases/types';

export default function BasesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);

  const handleEdit = (base: Base) => {
    setSelectedBaseId(base.id);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedBaseId(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Bases Territoriales
        </h1>
        <p className="text-slate-500 mt-1">
          Gestiona las ubicaciones estratégicas y el personal asignado a cada base por sector.
        </p>
      </div>

      <BasesTable onAdd={handleAdd} onEdit={handleEdit} />

      <BaseFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        baseId={selectedBaseId}
      />
    </div>
  );
}
