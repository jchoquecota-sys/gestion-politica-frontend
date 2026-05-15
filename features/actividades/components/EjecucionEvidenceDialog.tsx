'use client';

import { useState, useRef } from 'react';
import { SujetoActividad } from '../types';
import { useUpdateEjecucion } from '../hooks';
import api from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, X, Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EjecucionEvidenceDialogProps {
  actividadId: number;
  sujeto: SujetoActividad;
  isOpen: boolean;
  onClose: () => void;
}

export function EjecucionEvidenceDialog({ actividadId, sujeto, isOpen, onClose }: EjecucionEvidenceDialogProps) {
  const [descripcion, setDescripcion] = useState(sujeto.descripcion_ejecucion || '');
  const [evidencias, setEvidencias] = useState<string[]>(() => {
    if (!sujeto.evidencias) return [];
    return sujeto.evidencias.map((ev: any) => (typeof ev === 'string' ? ev : ev.path));
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateEjecucion, isPending: isUpdating } = useUpdateEjecucion(actividadId);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('folder', `actividades/${actividadId}/evidencias`);

        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        uploadedPaths.push(data.data.path);
      }

      setEvidencias(prev => [...prev, ...uploadedPaths]);
      toast.success(`${files.length} archivo(s) subido(s) correctamente`);
    } catch (error) {
      console.error(error);
      toast.error('Error al subir archivos');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeEvidence = (path: string) => {
    setEvidencias(prev => prev.filter(p => p !== path));
  };

  const handleSave = () => {
    updateEjecucion({
      id: sujeto.id!,
      descripcion_ejecucion: descripcion,
      evidencias: evidencias,
    }, {
      onSuccess: () => {
        toast.success('Reporte de ejecución actualizado');
        onClose();
      },
      onError: () => {
        toast.error('Error al actualizar el reporte');
      }
    });
  };

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Reporte de Ejecución - {sujeto.nombre_sujeto}
          </DialogTitle>
          <DialogDescription>
            Detalle las actividades realizadas y adjunte evidencias fotográficas o documentos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de lo realizado</Label>
            <Textarea 
              id="descripcion" 
              placeholder="Ej: Se realizó la entrega de folletos casa por casa en la zona norte..."
              className="min-h-[150px] resize-none"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <p className="text-[11px] text-slate-400">Sea específico con las acciones y resultados obtenidos.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Evidencias Digitales</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8"
              >
                {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                Subir Archivos
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleUpload}
              />
            </div>

            {evidencias.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-slate-50 text-slate-400">
                <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs italic">No hay evidencias adjuntas aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidencias.map((path, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border bg-white aspect-square shadow-sm">
                    {path && typeof path === 'string' && path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img 
                        src={getFullUrl(path)} 
                        alt={`Evidencia ${index}`} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center p-2 text-slate-400">
                        <FileText className="h-8 w-8 mb-1" />
                        <span className="text-[10px] text-center truncate w-full px-2">{path.split('/').pop()}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => removeEvidence(path)}
                      className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="outline" onClick={onClose} disabled={isUpdating || isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || isUploading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
            {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando...</> : 'Guardar Reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
