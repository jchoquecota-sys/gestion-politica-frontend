'use client';

import { useState } from 'react';
import { PersonasTable } from '@/features/personas/components/PersonasTable';
import { PersonaFormDialog } from '@/features/personas/components/PersonaFormDialog';
import { Persona } from '@/features/personas/types';

export default function PersonasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const handleEdit = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPersona(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Padrón de Personas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Registra y administra la información de ciudadanos y personal de contacto.
          </p>
        </div>
      </div>

      <PersonasTable onAdd={handleAdd} onEdit={handleEdit} />

      <PersonaFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        persona={selectedPersona}
      />
    </div>
  );
}
