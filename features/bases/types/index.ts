import { Sector } from "@/features/sectores/types";
import { Persona } from "@/features/personas/types";
import { Cargo } from "@/features/cargos/types";

export interface BasePersona {
  id?: number;
  persona_id: number;
  cargo_id: number;
  es_principal: boolean;
  fecha_inicio?: string;
  observaciones?: string;
  // Campos del GET (equipo)
  nombre_completo?: string;
  cargo?: string;
}

export interface BasePersonal {
  id: number;
  persona: {
    id: number;
    nombre_completo: string;
    dni: string;
    celular?: string;
  };
  cargo: {
    id: number;
    nombre: string;
  };
  es_principal: boolean;
  fecha_inicio: string;
  observaciones: string | null;
}

export interface Base {
  id: number;
  sector_id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  latitud: number;
  longitud: number;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  sector?: Sector;
  responsable?: {
    id: number;
    nombre_completo: string;
    cargo: string;
  };
  equipo?: BasePersona[];
  auditoria?: {
    creado_por: string;
    creado_el: string;
    actualizado_por: string | null;
    actualizado_el: string;
  };
}

export interface BaseFormData {
  sector_id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  latitud: number;
  longitud: number;
  personas?: {
    persona_id: number;
    cargo_id: number;
    es_principal: boolean;
    fecha_inicio?: string;
    observaciones?: string;
  }[];
}

export interface BasePersonalFormData {
  persona_id: number;
  cargo_id: number;
  es_principal: boolean;
  fecha_inicio: string;
  observaciones?: string;
}
