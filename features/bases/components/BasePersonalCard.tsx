'use client';

import { useState, useMemo } from 'react';
import { useBasePersonal, useAddBasePersonal, useUpdateBasePersonal, useRemoveBasePersonal } from '../hooks/useBasePersonal';
import { usePersonasOpciones } from '@/features/personas/hooks/usePersonas';
import { useCargosOpciones } from '@/features/cargos/hooks/useCargos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  UserPlus, 
  Shield, 
  Search, 
  Filter,
  MoreVertical,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BasePersonalCardProps {
  baseId: number;
}

export function BasePersonalCard({ baseId }: BasePersonalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCargoId, setFilterCargoId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    persona_id: 0,
    cargo_id: 0,
    es_principal: false,
    fecha_inicio: '',
    observaciones: '',
  });

  const { data: personal, isLoading } = useBasePersonal(baseId);
  const { data: personas } = usePersonasOpciones();
  const { data: cargos } = useCargosOpciones();

  const addMutation = useAddBasePersonal(baseId);
  const updateMutation = useUpdateBasePersonal(baseId);
  const removeMutation = useRemoveBasePersonal(baseId);

  const filteredPersonal = useMemo(() => {
    if (!personal) return [];
    return personal.filter(item => {
      const matchesSearch = item.persona.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.persona.dni.includes(searchTerm);
      const matchesCargo = filterCargoId ? item.cargo.id === filterCargoId : true;
      return matchesSearch && matchesCargo;
    });
  }, [personal, searchTerm, filterCargoId]);

  const resetForm = () => {
    setFormData({
      persona_id: 0,
      cargo_id: 0,
      es_principal: false,
      fecha_inicio: '',
      observaciones: '',
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleAdd = () => {
    if (!formData.persona_id || !formData.cargo_id) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    
    // Si la fecha está vacía, no enviarla para que el backend use su default
    const dataToSend = { ...formData };
    if (!dataToSend.fecha_inicio) delete (dataToSend as any).fecha_inicio;

    addMutation.mutate(dataToSend as any, {
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
      fecha_inicio: item.fecha_inicio || '',
      observaciones: item.observaciones || '',
    });
    setIsDialogOpen(true);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <UserPlus className="h-5 w-5 text-primary" />
              Personal de la Base
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Gestione a los integrantes, asigne cargos y defina responsables principales.</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-2" /> Añadir Integrante
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por nombre o DNI..." 
                className="pl-9 bg-white dark:bg-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select 
                value={filterCargoId?.toString() || 'all'} 
                onValueChange={(val) => setFilterCargoId(val === 'all' ? null : Number(val))}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Filtrar por Cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Cargos</SelectItem>
                  {cargos?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla de Personal */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
                <TableRow>
                  <TableHead className="py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Integrante</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-slate-300">Cargo / Función</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-slate-300">Desde</TableHead>
                  <TableHead className="text-center font-bold text-slate-600 dark:text-slate-300">Jerarquía</TableHead>
                  <TableHead className="text-right px-6 font-bold text-slate-600 dark:text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-slate-400">Cargando personal de la base...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPersonal.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <UserPlus className="h-10 w-10 text-slate-200" />
                        <div>
                          <p className="text-slate-500 font-medium">No se encontró personal con estos criterios.</p>
                          <p className="text-xs text-slate-400 mt-1">Intente cambiar el filtro o añadir un nuevo integrante.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPersonal.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b dark:border-slate-800">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase border border-slate-200 dark:border-slate-700">
                            {item.persona.nombre_completo.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">{item.persona.nombre_completo}</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">DNI: {item.persona.dni}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 dark:border-primary/30 font-medium">
                          {item.cargo.nombre}
                        </Badge>
                        {item.observaciones && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic max-w-[200px] truncate" title={item.observaciones}>
                            "{item.observaciones}"
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <CalendarIcon className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                          {item.fecha_inicio}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.es_principal ? (
                          <Badge className="bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/50 shadow-none gap-1 py-0.5">
                            <Shield className="h-3 w-3" /> Principal
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-medium uppercase tracking-tighter">Miembro</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={() => startEdit(item)}
                            title="Editar Asignación"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="text-brand-secondary focus:text-brand-secondary cursor-pointer"
                                onClick={() => {
                                  if (confirm('¿Está seguro de desvincular a esta persona de la base?')) {
                                    removeMutation.mutate(item.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar de la Base
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Añadir/Editar Personal */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingId ? <Edit2 className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
              {editingId ? 'Editar Asignación' : 'Añadir Personal a la Base'}
            </DialogTitle>
            <DialogDescription>
              Asigne una persona y defina su rol dentro de la base territorial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Persona / Simpatizante</Label>
              <SearchableSelect
                disabled={!!editingId}
                onValueChange={(val) => setFormData(prev => ({ ...prev, persona_id: Number(val) }))}
                value={formData.persona_id ? formData.persona_id.toString() : ''}
                placeholder="Seleccionar persona"
                options={personas?.map(p => ({
                  value: p.id.toString(),
                  label: `${p.nombre_completo} ${p.dni ? `(${p.dni})` : ''}`
                })) || []}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cargo / Función</Label>
                <Select 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, cargo_id: Number(val) }))}
                  value={formData.cargo_id ? formData.cargo_id.toString() : ''}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fecha de Inicio</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <Input 
                    type="date" 
                    className="pl-9 bg-white dark:bg-slate-900"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Observaciones</Label>
              <Input 
                placeholder="Ej: Encargado de logística" 
                className="bg-white dark:bg-slate-900"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
              <Checkbox 
                id="is_principal_base_dialog"
                checked={formData.es_principal}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, es_principal: !!checked }))}
                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label htmlFor="is_principal_base_dialog" className="text-xs font-bold text-amber-700 dark:text-amber-500 cursor-pointer flex items-center gap-1">
                <Shield className="h-3 w-3" /> MARCAR COMO RESPONSABLE PRINCIPAL DE LA BASE
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={isPending}>
              Cancelar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
              onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Procesando...</>
              ) : (
                <>
                  {editingId ? <Check className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {editingId ? 'Guardar Cambios' : 'Asignar a la Base'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
