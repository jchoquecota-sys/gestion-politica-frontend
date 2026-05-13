import { Persona } from "@/features/personas/types";
import { Cargo } from "@/features/cargos/types";

export interface SectorPersona {
  persona_id: number;
  cargo_id: number;
  es_principal: boolean;
  observaciones?: string;
  // Campos que vienen en el GET (equipo)
  id?: number; 
  nombre_completo?: string;
  cargo?: string;
}

export interface Sector {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
  referencia_ubicacion?: string;
  responsable?: {
    id: number;
    nombre_completo: string;
    cargo: string;
  };
  equipo?: SectorPersona[]; // El backend lo devuelve como equipo
  created_at?: string;
  updated_at?: string;
}

export interface SectorFormData {
  nombre: string;
  descripcion?: string;
  codigo: string;
  referencia_ubicacion?: string;
  personas: {
    persona_id: number;
    cargo_id: number;
    es_principal: boolean;
    observaciones?: string;
  }[];
}
