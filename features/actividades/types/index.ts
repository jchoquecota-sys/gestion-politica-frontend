export type ActividadEstado = 'borrador' | 'creada' | 'cancelada';
export type SujetoType = 'persona' | 'base' | 'sector';

export interface TipoActividad {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface SujetoActividad {
  id?: number;
  sujeto_id: number;
  sujeto_type: SujetoType;
  descripcion_ejecucion?: string;
  evidencias?: string[];
  // Campos informativos que pueden venir del backend en el detail
  nombre_sujeto?: string; 
}

export interface Actividad {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_actividad: string;
  tipo_actividad_id: number;
  estado: ActividadEstado;
  created_by?: number;
  created_at?: string;
  tipo_actividad?: TipoActividad;
  sujetos?: SujetoActividad[];
}

export interface CreateActividadDTO {
  titulo: string;
  descripcion: string;
  fecha_actividad: string;
  tipo_actividad_id: number;
  estado: ActividadEstado;
  sujetos: SujetoActividad[];
}

export interface UpdateActividadDTO extends Partial<CreateActividadDTO> {}

export interface ActividadFilters {
  tipo_actividad_id?: number;
  estado?: ActividadEstado;
  sector_id?: number | null;
  base_id?: number | null;
  search?: string;
}
