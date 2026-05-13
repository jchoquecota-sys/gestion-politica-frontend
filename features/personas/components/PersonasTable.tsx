'use client';

import { Persona } from '../types';
import { usePersonas, useDeletePersona } from '../hooks/usePersonas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, Pencil, Trash2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';

interface PersonasTableProps {
  onAdd: () => void;
  onEdit: (persona: Persona) => void;
}

export function PersonasTable({ onAdd, onEdit }: PersonasTableProps) {
  const { data: personas, isLoading } = usePersonas();
  const { mutate: deletePersona, isPending: isDeleting } = useDeletePersona();
  const [searchTerm, setSearchTerm] = useState('');
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const filteredPersonas = personas?.filter((p) =>
    `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  );

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar a esta persona?')) {
      deletePersona(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre o DNI..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {hasPermission('personas:create') && (
          <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Persona
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
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
            ) : filteredPersonas?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No se encontraron personas registradas.
                </TableCell>
              </TableRow>
            ) : (
              filteredPersonas?.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{p.nombres} {p.apellidos}</p>
                        <p className="text-xs text-slate-500">{p.direccion || 'Sin dirección'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{p.dni}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-slate-700">{p.celular || '-'}</p>
                      <p className="text-xs text-slate-500">{p.email || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {hasPermission('personas:edit') && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(p)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('personas:delete') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(p.id)} 
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
    </div>
  );
}
