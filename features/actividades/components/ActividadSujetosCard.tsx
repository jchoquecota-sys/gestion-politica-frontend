'use client';

import { useState } from 'react';
import { SujetoActividad, SujetoType } from '../types';
import { useAsignarSujeto, useDesvincularSujeto } from '../hooks';
import { useSectoresOpciones } from '@/features/sectores/hooks/useSectores';
import { useBasesOpciones } from '@/features/bases/hooks/useBases';
import { usePersonasOpciones } from '@/features/personas/hooks/usePersonas';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, User, Users, Home, Map, Trash2, FileEdit, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { EjecucionEvidenceDialog } from './EjecucionEvidenceDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActividadSujetosCardProps {
  actividadId: number;
  sujetos: SujetoActividad[];
}

export function ActividadSujetosCard({ actividadId, sujetos }: ActividadSujetosCardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSujeto, setSelectedSujeto] = useState<{ id: number; type: SujetoType }>({ id: 0, type: 'persona' });
  const [reportingSujeto, setReportingSujeto] = useState<SujetoActividad | null>(null);

  const { data: sectores } = useSectoresOpciones();
  const { data: bases } = useBasesOpciones();
  const { data: personas } = usePersonasOpciones();

  const { mutate: asignar, isPending: isAsignando } = useAsignarSujeto(actividadId);
  const { mutate: desvincular } = useDesvincularSujeto(actividadId);

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManage = hasPermission('actividades:edit') || hasPermission('actividades:manage-all');

  const handleAsignar = () => {
    if (selectedSujeto.id === 0) {
      toast.error('Seleccione un sujeto');
      return;
    }

    asignar({
      sujeto_id: selectedSujeto.id,
      sujeto_type: selectedSujeto.type,
    }, {
      onSuccess: () => {
        toast.success('Sujeto asignado correctamente');
        setIsAddDialogOpen(false);
        setSelectedSujeto({ id: 0, type: 'persona' });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al asignar sujeto');
      }
    });
  };

  const getSujetoIcon = (type: string) => {
    switch (type) {
      case 'persona': return <User className="h-4 w-4" />;
      case 'base': return <Home className="h-4 w-4" />;
      case 'sector': return <Map className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Participantes Asignados</CardTitle>
          <CardDescription>Gestione los sectores, bases y personas que forman parte de esta actividad.</CardDescription>
        </div>
        {canManage && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" /> Añadir Participante
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sujetos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay participantes asignados aún.</p>
            <p className="text-sm text-slate-400">Asigne sujetos para comenzar a registrar evidencias.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[250px]">Nombre / Tipo</TableHead>
                  <TableHead>Estado de Ejecución / Observaciones</TableHead>
                  <TableHead className="text-center">Evidencias</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sujetos.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {getSujetoIcon(s.sujeto_type)}
                          <span className="text-slate-900">{s.nombre_sujeto}</span>
                        </div>
                        <Badge variant="outline" className="w-fit text-[10px] h-4 px-1.5 uppercase tracking-wider bg-slate-50">
                          {s.sujeto_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600 line-clamp-2 max-w-md italic">
                        {s.descripcion_ejecucion || 'Sin registro de ejecución...'}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {s.evidencias && s.evidencias.length > 0 ? (
                          <div className="flex -space-x-2">
                             {/* Mostramos hasta 3 miniaturas o un contador */}
                             <div className="h-8 w-8 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                               {s.evidencias.length}
                             </div>
                             <div className="h-8 w-8 rounded-md bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center">
                               <ImageIcon className="h-3.5 w-3.5" />
                             </div>
                          </div>
                        ) : (
                          <Badge variant="ghost" className="text-slate-400 font-normal">Ninguna</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          onClick={() => setReportingSujeto(s)}
                        >
                          <FileEdit className="h-3.5 w-3.5 mr-1.5" /> Reportar
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => {
                                if (confirm('¿Está seguro de desvincular a este participante?')) {
                                  desvincular(s.id!);
                                  toast.success('Participante desvinculado');
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar Asignación
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Dialog para Añadir Participante */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Participante</DialogTitle>
            <DialogDescription>Seleccione un sector, base o persona para asignar a la actividad.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Participante</Label>
              <Select 
                value={selectedSujeto.type} 
                onValueChange={(val) => setSelectedSujeto({ id: 0, type: val as SujetoType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="persona">Persona / Simpatizante</SelectItem>
                  <SelectItem value="base">Base Territorial</SelectItem>
                  <SelectItem value="sector">Sector (Zona)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seleccionar</Label>
              <Select 
                value={selectedSujeto.id.toString()} 
                onValueChange={(val) => setSelectedSujeto(prev => ({ ...prev, id: Number(val) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buscar..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedSujeto.type === 'persona' && personas?.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre_completo}</SelectItem>
                  ))}
                  {selectedSujeto.type === 'base' && bases?.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.nombre}</SelectItem>
                  ))}
                  {selectedSujeto.type === 'sector' && sectores?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAsignar} disabled={isAsignando} className="bg-indigo-600 hover:bg-indigo-700">
              Asignar Participante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Reportar Ejecución y Evidencias */}
      {reportingSujeto && (
        <EjecucionEvidenceDialog 
          actividadId={actividadId}
          sujeto={reportingSujeto}
          isOpen={!!reportingSujeto}
          onClose={() => setReportingSujeto(null)}
        />
      )}
    </Card>
  );
}
