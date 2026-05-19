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
import { QRCodeSVG } from 'qrcode.react';
import { useMarcarAsistenciaManual } from '../hooks';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { QrCode, UserCheck } from 'lucide-react';

interface ActividadSujetosCardProps {
  actividadId: number;
  sujetos: SujetoActividad[];
}

export function ActividadSujetosCard({ actividadId, sujetos }: ActividadSujetosCardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [selectedSujeto, setSelectedSujeto] = useState<{ id: number; type: SujetoType }>({ id: 0, type: 'persona' });
  const [manualPersonaId, setManualPersonaId] = useState<number>(0);
  const [reportingSujeto, setReportingSujeto] = useState<SujetoActividad | null>(null);

  const { data: sectores } = useSectoresOpciones();
  const { data: bases } = useBasesOpciones();
  const { data: personas } = usePersonasOpciones();

  const { mutate: asignar, isPending: isAsignando } = useAsignarSujeto(actividadId);
  const { mutate: desvincular } = useDesvincularSujeto(actividadId);
  const { mutate: marcarAsistencia, isPending: isMarcando } = useMarcarAsistenciaManual(actividadId);

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManage = hasPermission('actividades:edit') || hasPermission('actividades:manage-all');
  const canMarkAttendance = hasPermission('actividades:asistencia-manual') || canManage;

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

  const handleManualAttendance = () => {
    if (manualPersonaId === 0) {
      toast.error('Seleccione una persona');
      return;
    }
    marcarAsistencia(manualPersonaId, {
      onSuccess: (response: any) => {
        toast.success(response.message || 'Asistencia registrada correctamente');
        setIsManualDialogOpen(false);
        setManualPersonaId(0);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al marcar asistencia');
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
    <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Participantes y Asistencia</CardTitle>
          <CardDescription>Gestione la participación y asistencia a esta actividad.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canMarkAttendance && (
             <>
               <Button onClick={() => setIsQRDialogOpen(true)} variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                 <QrCode className="h-4 w-4 mr-2" /> QR Asistencia
               </Button>
               <Button onClick={() => setIsManualDialogOpen(true)} variant="outline" className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
                 <UserCheck className="h-4 w-4 mr-2" /> Asistencia Manual
               </Button>
             </>
          )}
          {canManage && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Añadir Participante
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sujetos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay participantes asignados aún.</p>
            <p className="text-sm text-slate-400">Asigne sujetos para comenzar a registrar evidencias.</p>
          </div>
        ) : (
          <div className="rounded-md border dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800">
                  <TableHead className="w-[200px]">Nombre / Tipo</TableHead>
                  <TableHead className="w-[150px]">Asistencia</TableHead>
                  <TableHead>Observaciones</TableHead>
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
                          <span className="text-slate-900 dark:text-white">{s.nombre_sujeto}</span>
                        </div>
                        <Badge variant="outline" className="w-fit text-[10px] h-4 px-1.5 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                          {s.sujeto_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.hora_asistencia ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 text-[10px] py-0.5 px-1.5 font-semibold">
                              Ingreso
                            </Badge>
                            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                              {format(new Date(s.hora_asistencia), 'HH:mm', { locale: es })}
                            </span>
                          </div>
                          {s.hora_salida && (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50 text-[10px] py-0.5 px-1.5 font-semibold">
                                Salida
                              </Badge>
                              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                {format(new Date(s.hora_salida), 'HH:mm', { locale: es })}
                              </span>
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Vía: {s.metodo_registro === 'qr_self_service' ? 'QR' : 'Manual'}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="w-fit text-slate-500">Ausente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 max-w-[200px] italic">
                        {s.descripcion_ejecucion || '...'}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {s.evidencias && s.evidencias.length > 0 ? (
                          <div className="flex -space-x-2">
                             {/* Mostramos hasta 3 miniaturas o un contador */}
                             <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center font-bold text-xs">
                               {s.evidencias.length}
                             </div>
                             <div className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
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
                          className="h-8 border-primary/20 dark:border-primary/40 text-primary hover:bg-primary/10"
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
                              className="text-brand-secondary focus:text-brand-secondary cursor-pointer"
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
              <SearchableSelect
                value={selectedSujeto.id.toString()}
                onValueChange={(val) => setSelectedSujeto(prev => ({ ...prev, id: Number(val) }))}
                placeholder={`Seleccione ${selectedSujeto.type}...`}
                options={
                  selectedSujeto.type === 'persona' ? (personas?.map(p => ({ value: p.id.toString(), label: `${p.nombre_completo} - ${p.dni}` })) || [])
                  : selectedSujeto.type === 'base' ? (bases?.map(b => ({ value: b.id.toString(), label: b.nombre })) || [])
                  : (sectores?.map(s => ({ value: s.id.toString(), label: s.nombre })) || [])
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAsignar} disabled={isAsignando} className="bg-primary hover:bg-primary/90">
              Asignar Participante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Asistencia Manual */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registro Manual de Asistencia</DialogTitle>
            <DialogDescription>Busque y registre la asistencia de una persona que no puede usar el QR.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Persona (DNI o Nombre)</Label>
              <SearchableSelect
                value={manualPersonaId.toString()}
                onValueChange={(val) => setManualPersonaId(Number(val))}
                placeholder="Buscar persona..."
                options={personas?.map(p => ({ value: p.id.toString(), label: `${p.nombre_completo} - ${p.dni}` })) || []}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleManualAttendance} disabled={isMarcando} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Marcar Asistencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Generador QR */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>QR de Auto-registro</DialogTitle>
            <DialogDescription>Imprima o muestre este código QR para que los asistentes registren su llegada.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <QRCodeSVG 
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/asistencia/${actividadId}`} 
                size={256} 
                level={"H"}
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-center text-slate-500 font-mono bg-slate-100 dark:bg-slate-900 p-2 rounded-md break-all">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/asistencia/${actividadId}`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRDialogOpen(false)}>Cerrar</Button>
            <Button onClick={() => window.print()} className="bg-primary">
              Imprimir
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
