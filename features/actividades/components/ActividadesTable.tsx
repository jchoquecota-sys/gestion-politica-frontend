'use client';

import { useState } from 'react';
import { useActividades, useDeleteActividad } from '../hooks';
import { Actividad, ActividadEstado } from '../types';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit2, 
  Trash2, 
  Loader2, 
  Calendar, 
  Users, 
  MapPin, 
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActividadFormDialog } from './ActividadFormDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusConfig: Record<ActividadEstado, { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  creada: { label: 'Creada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelada: { label: 'Cancelada', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function ActividadesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data: response, isLoading } = useActividades({ page, search, per_page: 15 });
  const { mutate: deleteActividad, isPending: isDeleting } = useDeleteActividad();
  
  const hasPermission = useAuthStore((state) => state.hasPermission);
  
  const [actividadIdToEdit, setActividadIdToEdit] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState<Actividad | null>(null);

  const handleEdit = (id: number) => {
    setActividadIdToEdit(id);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setActividadIdToEdit(null);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (actividadToDelete) {
      deleteActividad(actividadToDelete.id, {
        onSuccess: () => {
          toast.success('Actividad eliminada correctamente');
          setActividadToDelete(null);
        },
        onError: () => {
          toast.error('No se pudo eliminar la actividad');
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Cargando actividades...</p>
      </div>
    );
  }

  const actividades = response?.data || [];
  const canEdit = hasPermission('actividades:edit');
  const canDelete = hasPermission('actividades:delete');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Listado de Actividades</h2>
        {hasPermission('actividades:create') && (
          <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Nueva Actividad
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableHead className="w-[300px]">Actividad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Participantes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actividades.map((actividad) => (
              <TableRow key={actividad.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-900 leading-tight">
                      {actividad.titulo}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {actividad.descripcion}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {format(new Date(actividad.fecha_actividad), "dd 'de' MMMM, HH:mm", { locale: es })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal bg-indigo-50/30 text-indigo-700 border-indigo-100">
                    {actividad.tipo?.nombre || 'General'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {actividad.sujetos?.length || 0} sujetos
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`font-medium border ${statusConfig[actividad.estado].className}`} variant="secondary">
                    {statusConfig[actividad.estado].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(actividad.id)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setActividadToDelete(actividad)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {actividades.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-slate-200" />
                    <p className="text-slate-500">No se encontraron actividades registradas.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ActividadFormDialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        actividadId={actividadIdToEdit} 
      />

      <Dialog open={!!actividadToDelete} onOpenChange={(open) => !open && setActividadToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar actividad?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará la actividad <span className="font-semibold text-slate-900">"{actividadToDelete?.titulo}"</span> y toda su evidencia asociada. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActividadToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Eliminar Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
