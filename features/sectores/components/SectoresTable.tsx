'use client';

import { Sector } from '../types';
import { useSectores, useDeleteSector } from '../hooks/useSectores';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, Pencil, Trash2, MapPin, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTablePagination } from '@/components/shared/DataTablePagination';

interface SectoresTableProps {
  onAdd: () => void;
  onEdit: (sector: Sector) => void;
}

export function SectoresTable({ onAdd, onEdit }: SectoresTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: response, isLoading } = useSectores({
    page: currentPage,
    search: debouncedSearch,
  });
  
  const sectores = response?.data || [];
  const meta = response?.meta;

  const { mutate: deleteSector, isPending: isDeleting } = useDeleteSector();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este sector? Esta acción no se puede deshacer.')) {
      deleteSector(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar sector por nombre o código..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {hasPermission('sectores:create') && (
          <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Sector
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="w-[120px]">Código</TableHead>
              <TableHead>Nombre del Sector</TableHead>
              <TableHead>Responsable Principal</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
                    Cargando sectores...
                  </div>
                </TableCell>
              </TableRow>
            ) : sectores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No se encontraron sectores registrados.
                </TableCell>
              </TableRow>
            ) : (
              sectores.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell>
                    <Badge variant="secondary" className="font-mono bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-slate-900 dark:text-indigo-400 dark:border-indigo-900 uppercase">
                      {s.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{s.nombre}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{s.descripcion || 'Sin descripción'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.responsable ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {s.responsable.nombre_completo}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">
                          {s.responsable.cargo}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{s.referencia_ubicacion || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission('sectores:edit') && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(s)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('sectores:delete') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(s.id)} 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {meta && meta.last_page > 1 && (
          <div className="border-t">
            <DataTablePagination meta={meta} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
}
