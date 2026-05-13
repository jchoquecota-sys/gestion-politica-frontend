'use client';

import { Base } from '../types';
import { useBases, useDeleteBase } from '../hooks/useBases';
import { useSectores } from '@/features/sectores/hooks/useSectores';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, Pencil, Trash2, MapPin, Landmark, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BasesTableProps {
  onAdd: () => void;
  onEdit: (base: Base) => void;
}

export function BasesTable({ onAdd, onEdit }: BasesTableProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isSuperAdmin = useAuthStore((state) => state.user?.roles.includes('super-admin'));
  
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sectores } = useSectores();
  const { data: bases, isLoading } = useBases(selectedSectorId);
  const { mutate: deleteBase, isPending: isDeleting } = useDeleteBase();

  const filteredBases = bases?.filter((b) =>
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta base territorial?')) {
      deleteBase(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por nombre o dirección..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select 
              onValueChange={(val) => setSelectedSectorId(val === 'all' ? null : parseInt(val))}
              value={selectedSectorId?.toString() || 'all'}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filtrar por Sector" />
              </SelectTrigger>
              <SelectContent>
                {isSuperAdmin && <SelectItem value="all">Todos los Sectores</SelectItem>}
                {sectores?.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasPermission('bases:create') && (
          <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Base
          </Button>
        )}
      </div>

      {!selectedSectorId && !isSuperAdmin ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 border border-dashed rounded-lg">
          <Landmark className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Seleccione un sector para ver las bases territoriales</p>
        </div>
      ) : (
        <div className="rounded-md border bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Base Territorial</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Responsable</TableHead>
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
                      Cargando bases...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBases?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No se encontraron bases territoriales.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBases?.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900">{b.nombre}</p>
                        <p className="text-xs text-slate-500">{b.direccion || 'Sin dirección'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50">
                        {b.sector?.nombre || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {b.responsable ? (
                        <div className="text-sm">
                          <p className="font-medium text-slate-700">{b.responsable.nombre_completo}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{b.responsable.cargo}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No asignado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="h-3 w-3 text-indigo-500" />
                        <span>Ver en mapa</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission('bases:edit') && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onEdit(b)} 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission('bases:delete') && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(b.id)} 
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
        </div>
      )}
    </div>
  );
}
