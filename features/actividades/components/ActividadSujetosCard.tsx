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
import { Plus, User, Users, Home, Map, Trash2, FileEdit, MoreVertical, Image as ImageIcon, Eye } from 'lucide-react';
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
  const [viewingSujeto, setViewingSujeto] = useState<SujetoActividad | null>(null);

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
                  <TableHead className="w-[200px] h-9 py-2">Nombre / Tipo</TableHead>
                  <TableHead className="w-[140px] h-9 py-2">Asistencia</TableHead>
                  <TableHead className="h-9 py-2">Observaciones</TableHead>
                  <TableHead className="text-center h-9 py-2 w-[80px]">Evidencias</TableHead>
                  <TableHead className="text-right h-9 py-2 w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sujetos.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{getSujetoIcon(s.sujeto_type)}</span>
                        <span className="text-sm text-slate-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]" title={s.nombre_sujeto}>{s.nombre_sujeto}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                          {s.sujeto_type.substring(0, 3)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {s.hora_asistencia || s.hora_salida ? (
                        <div className="flex items-center gap-2">
                          {s.hora_asistencia && (
                            <div className="flex items-center gap-1" title="Hora de ingreso">
                              <span className="text-[10px] font-bold text-emerald-600">IN</span>
                              <span className="text-xs font-mono">{format(new Date(s.hora_asistencia), 'HH:mm')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1" title="Hora de salida">
                            <span className="text-[10px] font-bold text-blue-600">OUT</span>
                            {s.hora_salida ? (
                              <span className="text-xs font-mono">{format(new Date(s.hora_salida), 'HH:mm')}</span>
                            ) : (
                              <span className="text-[10px] italic text-slate-400">--:--</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Ausente</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[150px] italic" title={s.descripcion_ejecucion || 'Sin observaciones'}>
                        {s.descripcion_ejecucion || '-'}
                      </p>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      {s.evidencias && s.evidencias.length > 0 ? (
                        <Badge variant="secondary" className="text-[10px] h-5 w-5 p-0 flex items-center justify-center mx-auto">{s.evidencias.length}</Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => setViewingSujeto(s)}
                          title="Ver Detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                          onClick={() => setReportingSujeto(s)}
                          title="Reportar Evidencia"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={() => {
                            if (confirm('¿Está seguro de desvincular a este participante?')) {
                              desvincular(s.id!);
                              toast.success('Participante desvinculado');
                            }
                          }}
                          title="Eliminar Asignación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* Dialog para Ver Detalles */}
      <Dialog open={!!viewingSujeto} onOpenChange={(open) => !open && setViewingSujeto(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle de Participación</DialogTitle>
            <DialogDescription>
              Información detallada del participante en la actividad.
            </DialogDescription>
          </DialogHeader>
          {viewingSujeto && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Participante</h4>
                <div className="flex items-center gap-2">
                  {getSujetoIcon(viewingSujeto.sujeto_type)}
                  <span className="font-medium">{viewingSujeto.nombre_sujeto}</span>
                  <Badge variant="outline" className="text-[10px] uppercase">{viewingSujeto.sujeto_type}</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Registro de Asistencia</h4>
                {viewingSujeto.hora_asistencia || viewingSujeto.hora_salida ? (
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border">
                    {viewingSujeto.hora_asistencia && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 w-16 justify-center">Ingreso</Badge>
                        <span className="text-sm font-mono">{format(new Date(viewingSujeto.hora_asistencia), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 w-16 justify-center">Salida</Badge>
                      {viewingSujeto.hora_salida ? (
                        <span className="text-sm font-mono">{format(new Date(viewingSujeto.hora_salida), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      ) : (
                        <span className="text-sm italic text-slate-500">Pendiente</span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-500 border-t pt-2">
                      Método de registro: <strong>{viewingSujeto.metodo_registro === 'qr_self_service' ? 'QR Autoregistro' : 'Registro Manual'}</strong>
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-slate-500">Ausente / Sin Registrar</Badge>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Observaciones / Reporte</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border min-h-[60px]">
                  {viewingSujeto.descripcion_ejecucion || 'Sin observaciones registradas.'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Evidencias Adjuntas</h4>
                {viewingSujeto.evidencias && viewingSujeto.evidencias.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewingSujeto.evidencias.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-md border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <ImageIcon className="h-6 w-6 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500">Ver Archivo</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-900 rounded-md border">No se adjuntaron evidencias.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingSujeto(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
