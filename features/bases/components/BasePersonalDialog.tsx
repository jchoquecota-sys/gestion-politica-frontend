'use client';

import { useState } from 'react';
import { useBasePersonal, useAddBasePersonal, useUpdateBasePersonal, useRemoveBasePersonal } from '../hooks/useBasePersonal';
import { usePersonasOpciones } from '@/features/personas/hooks/usePersonas';
import { useCargosOpciones } from '@/features/cargos/hooks/useCargos';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash2, Edit2, X, Check, UserPlus, Shield } from 'lucide-react';
import { Base } from '../types';

interface BasePersonalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  base: Base | null;
}

export function BasePersonalDialog({ isOpen, onClose, base }: BasePersonalDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state for adding/editing
  const [formData, setFormData] = useState({
    persona_id: 0,
    cargo_id: 0,
    es_principal: false,
    fecha_inicio: new Date().toISOString().split('T')[0],
    observaciones: '',
  });

  const { data: personal, isLoading } = useBasePersonal(base?.id || null);
  const { data: personas } = usePersonasOpciones();
  const { data: cargos } = useCargosOpciones();

  const addMutation = useAddBasePersonal(base?.id || 0);
  const updateMutation = useUpdateBasePersonal(base?.id || 0);
  const removeMutation = useRemoveBasePersonal(base?.id || 0);

  const resetForm = () => {
    setFormData({
      persona_id: 0,
      cargo_id: 0,
      es_principal: false,
      fecha_inicio: new Date().toISOString().split('T')[0],
      observaciones: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!formData.persona_id || !formData.cargo_id) return;
    addMutation.mutate(formData, {
      onSuccess: () => resetForm(),
    });
  };

  const handleUpdate = (asignacionId: number) => {
    const { persona_id, ...updateData } = formData;
    updateMutation.mutate({ asignacionId, data: updateData }, {
      onSuccess: () => resetForm(),
    });
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      persona_id: item.persona.id,
      cargo_id: item.cargo.id,
      es_principal: item.es_principal,
      fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : new Date().toISOString().split('T')[0],
      observaciones: item.observaciones || '',
    });
    setIsAdding(false);
  };

  if (!base) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Gestionar Personal: {base.nombre}
          </DialogTitle>
          <DialogDescription>
            Administra a los integrantes de esta base territorial y sus respectivos cargos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Formulario de Adición/Edición */}
          {(isAdding || editingId) && (
            <div className="mb-6 p-4 bg-slate-50 border rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">
                  {editingId ? 'Editar Asignación' : 'Añadir Nueva Persona'}
                </h4>
                <Button variant="ghost" size="sm" onClick={resetForm} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-2">
                  <Label>Persona</Label>
                  <SearchableSelect
                    disabled={!!editingId}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, persona_id: Number(val) }))}
                    value={formData.persona_id ? formData.persona_id.toString() : ''}
                    placeholder="Seleccionar persona..."
                    options={personas?.map(p => ({ value: p.id.toString(), label: `${p.nombre_completo} - ${p.dni}` })) || []}
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label>Cargo</Label>
                  <Select 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, cargo_id: Number(val) }))}
                    value={formData.cargo_id ? formData.cargo_id.toString() : ''}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Input 
                    type="date" 
                    className="bg-white"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-center pt-8">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="is_principal_manage"
                      checked={formData.es_principal}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, es_principal: !!checked }))}
                    />
                    <Label htmlFor="is_principal_manage" className="text-xs font-medium cursor-pointer">Principal</Label>
                  </div>
                </div>

                <div className="md:col-span-10 space-y-2">
                  <Label>Observaciones (Opcional)</Label>
                  <Input 
                    placeholder="Ej: Encargado de logística" 
                    className="bg-white"
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 flex items-end justify-end">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                    disabled={addMutation.isPending || updateMutation.isPending}
                  >
                    {addMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      editingId ? <Check className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />
                    )}
                    {editingId ? 'Guardar' : 'Añadir'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Personal */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : personal?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No hay personal asignado a esta base.
                    </TableCell>
                  </TableRow>
                ) : (
                  personal?.map((item) => (
                    <TableRow key={item.id} className={editingId === item.id ? "bg-primary/10/50" : ""}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.persona.nombre_completo}</span>
                          <span className="text-xs text-slate-500">DNI: {item.persona.dni}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white">
                          {item.cargo.nombre}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {item.fecha_inicio}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.es_principal && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                            <Shield className="h-3 w-3 mr-1" /> Principal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-primary"
                            onClick={() => startEdit(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-brand-secondary"
                            onClick={() => {
                              if (confirm('¿Está seguro de desvincular a esta persona?')) {
                                removeMutation.mutate(item.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          {!isAdding && !editingId && (
            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" /> Añadir Personal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
