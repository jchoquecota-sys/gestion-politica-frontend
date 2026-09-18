'use client';

import { useState } from 'react';
import { useActividades, useDeleteActividad } from '../hooks';
import { Actividad, ActividadEstado } from '../types';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
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
  Plus,
  Search,
  FolderOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSectoresOpciones } from '@/features/sectores/hooks/useSectores';
import { useBasesOpciones } from '@/features/bases/hooks/useBases';
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
  borrador: { label: 'Borrador', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  creada: { label: 'Creada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' },
  cancelada: { label: 'Cancelada', className: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20 dark:bg-brand-secondary/20 dark:text-brand-secondary dark:border-brand-secondary/30' },
};

export function ActividadesTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);

  const { data: sectores } = useSectoresOpciones();
  const { data: bases } = useBasesOpciones(selectedSectorId);

  const { data: response, isLoading } = useActividades({ 
    page, 
    search: debouncedSearch, 
    per_page: 15,
    sector_id: selectedSectorId,
    base_id: selectedBaseId
  });
  const { mutate: deleteActividad, isPending: isDeleting } = useDeleteActividad();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const user = useAuthStore((state) => state.user);

  const hasManageAll = hasPermission('actividades:manage-all');
  const hasManageSector = hasPermission('actividades:manage-sector');
  const hasManageBase = hasPermission('actividades:manage-base');
  const allowedSectors = user?.allowed_sectors || [];

  const visibleSectores = hasManageAll 
    ? sectores 
    : sectores?.filter(s => allowedSectors.includes(s.id));

  const showSectorFilter = hasManageAll || hasManageSector;
  const showBaseFilter = showSectorFilter || hasManageBase;

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500 font-medium">Cargando actividades...</p>
      </div>
    );
  }

  const actividades = response?.data || [];
  const canEdit = hasPermission('actividades:edit');
  const canDelete = hasPermission('actividades:delete');

  return (
    <div className="space-y-3">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 flex-1 w-full">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Buscar actividad..."
              className="pl-8 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {showSectorFilter && (
              <UISelect 
                onValueChange={(val) => {
                  setSelectedSectorId(val === 'all' ? null : parseInt(val));
                  setSelectedBaseId(null);
                  setPage(1);
                }}
                value={selectedSectorId?.toString() || 'all'}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Todos los Sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Sectores</SelectItem>
                  {visibleSectores?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </UISelect>
            )}

            {showBaseFilter && (
              <UISelect 
                onValueChange={(val) => {
                  setSelectedBaseId(val === 'all' ? null : parseInt(val));
                  setPage(1);
                }}
                value={selectedBaseId?.toString() || 'all'}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Todas las Bases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Bases</SelectItem>
                  {bases?.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </UISelect>
            )}
          </div>
        </div>

        {hasPermission('actividades:create') && (
          <Button onClick={handleCreate} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-1.5 w-full xl:w-auto shrink-0 h-9">
            <Plus className="h-4 w-4" />
            Nueva
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 py-2 w-[240px]">Actividad</TableHead>
              <TableHead className="h-9 py-2 w-[120px]">Fecha</TableHead>
              <TableHead className="h-9 py-2 w-[100px]">Tipo</TableHead>
              <TableHead className="h-9 py-2 w-[90px]">Particip.</TableHead>
              <TableHead className="h-9 py-2 w-[90px]">Estado</TableHead>
              <TableHead className="h-9 py-2 text-right w-[110px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actividades.map((actividad) => (
              <TableRow key={actividad.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                <TableCell className="py-2">
                  <div className="flex flex-col gap-0 min-w-0">
                    <span className="font-medium text-sm text-slate-900 dark:text-white leading-snug truncate max-w-[280px]" title={actividad.titulo}>
                      {actividad.titulo}
                    </span>
                    {actividad.descripcion && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[280px]" title={actividad.descripcion}>
                        {actividad.descripcion}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                    {format(new Date(actividad.fecha_actividad), 'dd/MM/yy HH:mm', { locale: es })}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className="font-normal text-[11px] px-1.5 py-0 h-5 bg-primary/5 text-primary border-primary/20">
                    {actividad.tipo_actividad?.nombre || 'General'}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Users className="h-3 w-3 text-slate-400" />
                    {actividad.sujetos?.length || 0}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <Badge className={`font-medium text-[11px] px-1.5 py-0 h-5 border ${statusConfig[actividad.estado].className}`} variant="secondary">
                    {statusConfig[actividad.estado].label}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-right">
                  <div className="flex justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/actividades/${actividad.id}`)}
                      className="h-7 w-7 text-primary hover:bg-primary/10"
                      title="Ver Detalles y Evidencias"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(actividad.id)}
                        className="h-7 w-7 text-primary hover:bg-primary/10"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActividadToDelete(actividad)}
                        className="h-7 w-7 text-brand-secondary hover:bg-brand-secondary/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {actividades.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-1.5">
                    <FolderOpen className="h-7 w-7 text-slate-300" />
                    <p className="text-sm text-slate-500">No se encontraron actividades.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {response?.meta && response.meta.last_page > 1 && (
          <div className="border-t">
            <DataTablePagination meta={response.meta} onPageChange={setPage} />
          </div>
        )}
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
