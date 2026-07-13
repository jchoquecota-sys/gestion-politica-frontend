'use client';

import { useState } from 'react';
import { SectoresTable } from '@/features/sectores/components/SectoresTable';
import { SectorFormDialog } from '@/features/sectores/components/SectorFormDialog';
import { Sector } from '@/features/sectores/types';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SectoresPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const router = useRouter();

  if (!hasPermission('sectores:view')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso Denegado</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-6">
          No tienes los permisos necesarios para acceder a la gestión de sectores.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const handleEdit = (sector: Sector) => {
    setSelectedSectorId(sector.id);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedSectorId(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Gestión de Sectores Territoriales
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Define los sectores territoriales, asigna responsables y coordina el trabajo en campo.
          </p>
        </div>
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
