'use client';

import { useState } from 'react';
import { BasesTable } from '@/features/bases/components/BasesTable';
import { BaseFormDialog } from '@/features/bases/components/BaseFormDialog';
import { BasePersonalDialog } from '@/features/bases/components/BasePersonalDialog';
import { Base } from '@/features/bases/types';

export default function BasesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPersonalDialogOpen, setIsPersonalDialogOpen] = useState(false);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);

  const handleEdit = (base: Base) => {
    setSelectedBaseId(base.id);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedBaseId(null);
    setIsDialogOpen(true);
  };

  const handleManagePersonal = (base: Base) => {
    setSelectedBase(base);
    setIsPersonalDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Bases Territoriales
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona las ubicaciones estratégicas y el personal asignado a cada base por sector.
          </p>
        </div>
      </div>

      <BasesTable onAdd={handleAdd} onEdit={handleEdit} onManagePersonal={handleManagePersonal} />

      <BaseFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        baseId={selectedBaseId}
      />

      <BasePersonalDialog
        isOpen={isPersonalDialogOpen}
        onClose={() => setIsPersonalDialogOpen(false)}
        base={selectedBase}
      />
    </div>
  );
}
