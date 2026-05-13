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
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Padrón de Personas
        </h1>
        <p className="text-slate-500 mt-1">
          Registra y administra la información de ciudadanos y personal de contacto.
        </p>
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
