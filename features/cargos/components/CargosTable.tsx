'use client';

import { Cargo } from '../types';
import { useCargos, useDeleteCargo } from '../hooks/useCargos';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, Pencil, Trash2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTablePagination } from '@/components/shared/DataTablePagination';

interface CargosTableProps {
  onAdd: () => void;
  onEdit: (cargo: Cargo) => void;
}

export function CargosTable({ onAdd, onEdit }: CargosTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: response, isLoading } = useCargos({
    page: currentPage,
    search: debouncedSearch,
  });

  const cargos = response?.data || [];
  const meta = response?.meta;

  const { mutate: deleteCargo, isPending: isDeleting } = useDeleteCargo();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este cargo?')) {
      deleteCargo(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar cargo..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {hasPermission('cargos:create') && (
          <Button onClick={onAdd} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cargo
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
                    Cargando cargos...
                  </div>
                </TableCell>
              </TableRow>
            ) : cargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No se encontraron cargos registrados.
                </TableCell>
              </TableRow>
            ) : (
              cargos.map((cargo) => (
                <TableRow key={cargo.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-500">#{cargo.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{cargo.nombre}</span>
                      <span title={`Creado por: ${cargo.auditoria.creado_por} el ${cargo.auditoria.creado_el}\nActualizado por: ${cargo.auditoria.actualizado_por || 'N/A'} ${cargo.auditoria.actualizado_el ? 'el ' + cargo.auditoria.actualizado_el : ''}`}>
                        <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-sm italic">
                    {cargo.descripcion || 'Sin descripción'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission('cargos:edit') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(cargo)} 
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('cargos:delete') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(cargo.id)} 
                          className="h-8 w-8 text-brand-secondary hover:text-brand-secondary hover:bg-brand-secondary/10"
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
