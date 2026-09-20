'use client';

import { useState } from 'react';
import { PersonasTable } from '@/features/personas/components/PersonasTable';
import { PersonaFormDialog } from '@/features/personas/components/PersonaFormDialog';
import { Persona } from '@/features/personas/types';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PersonasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const router = useRouter();

  if (!hasPermission('personas:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso Denegado</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
          No tienes los permisos necesarios para acceder al padrón de personas.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const handleEdit = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPersona(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white break-words" style={{ fontFamily: 'var(--font-heading)' }}>
          Padrón de Personas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
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
