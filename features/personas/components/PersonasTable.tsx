'use client';

import { Persona } from '../types';
import { usePersonas, useDeletePersona, useImportPersonasCsv } from '../hooks/usePersonas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, Pencil, Trash2, User, Filter, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { useSectoresOpciones } from '@/features/sectores/hooks/useSectores';
import { useBasesOpciones } from '@/features/bases/hooks/useBases';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
interface PersonasTableProps {
  onAdd: () => void;
  onEdit: (persona: Persona) => void;
}

export function PersonasTable({ onAdd, onEdit }: PersonasTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
  const [personaToDelete, setPersonaToDelete] = useState<number | null>(null);

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const user = useAuthStore((state) => state.user);
  
  const hasListAll = hasPermission('personas:list-all');
  const hasListOnlySector = hasPermission('personas:list-only-sector');
  const allowedSectors = user?.allowed_sectors || [];

  const { data: sectores } = useSectoresOpciones();
  const { data: bases } = useBasesOpciones(selectedSectorId);
  
  const { data: response, isLoading } = usePersonas({
    page: currentPage,
    search: debouncedSearch,
    sector_id: selectedSectorId,
    base_id: selectedBaseId,
  });
  
  const personas = response?.data || [];
  const meta = response?.meta;

  const { mutate: deletePersona, isPending: isDeleting } = useDeletePersona();
  const { mutate: importCsv, isPending: isImporting } = useImportPersonasCsv();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleSectores = hasListAll 
    ? sectores 
    : sectores?.filter(s => allowedSectors.includes(s.id));

  const showSectorFilter = hasListAll || hasListOnlySector;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedSectorId, selectedBaseId]);

  const handleDeleteConfirm = () => {
    if (personaToDelete !== null) {
      deletePersona(personaToDelete, {
        onSuccess: () => setPersonaToDelete(null)
      });
    }
  };

  const handleCsvSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const ok = window.confirm(
      '¿Reemplazar el padrón actual con este CSV?\n\nSe archivarán las personas actuales e importarán las del archivo.'
    );
    if (!ok) return;

    importCsv({ file, replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-1">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por nombre o DNI..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {showSectorFilter && (
              <Select 
                onValueChange={(val) => {
                  setSelectedSectorId(val === 'all' ? null : parseInt(val));
                  setSelectedBaseId(null);
                }}
                value={selectedSectorId?.toString() || 'all'}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <SelectValue placeholder="Todos los Sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Sectores</SelectItem>
                  {visibleSectores?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select 
              onValueChange={(val) => setSelectedBaseId(val === 'all' ? null : parseInt(val))}
              value={selectedBaseId?.toString() || 'all'}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Todas las Bases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Bases</SelectItem>
                {bases?.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasPermission('personas:create') && (
          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvSelected}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Importar CSV
            </Button>
            <Button onClick={onAdd} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Persona
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead>Persona</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
                    Cargando personas...
                  </div>
                </TableCell>
              </TableRow>
            ) : personas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No se encontraron personas registradas.
                </TableCell>
              </TableRow>
            ) : (
              personas.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-slate-200">
                        {p.foto_url ? (
                          <img 
                            src={p.foto_url} 
                            alt={`${p.nombres} ${p.apellidos}`} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{p.nombres} {p.apellidos}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.direccion || 'Sin dirección'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{p.dni}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-slate-700 dark:text-slate-300">{p.celular || '-'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.email || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission('personas:edit') && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(p)} className="h-8 w-8 text-primary hover:bg-primary/10">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('personas:delete') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setPersonaToDelete(p.id)} 
                          className="h-8 w-8 text-brand-secondary hover:bg-brand-secondary/10"
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

      <Dialog open={personaToDelete !== null} onOpenChange={(open) => !open && setPersonaToDelete(null)}>
        <DialogContent>
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="bg-brand-secondary/10 p-3 rounded-full">
              <Trash2 className="h-8 w-8 text-brand-secondary" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold text-slate-900">¿Eliminar persona?</DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Esta acción moverá a la persona a la papelera. Podrá ser restaurada por un administrador si es necesario.
              </DialogDescription>
            </div>
            <div className="flex w-full gap-3 mt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setPersonaToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
