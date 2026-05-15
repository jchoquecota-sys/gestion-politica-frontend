export interface DashboardStats {
  stats: {
    total_personas: number;
    total_bases: number;
    total_sectores: number;
    total_actividades: number;
  };
  actividades_estados: {
    estado: string;
    total: number;
  }[];
  distribucion_sectores: {
    name: string;
    value: number;
  }[];
  crecimiento_mensual: {
    mes: string;
    total: number;
  }[];
  actividades_crecimiento: {
    month: string;
    total: number;
  }[];
  personas_por_base: {
    base: string;
    total: number;
  }[];
}

export interface MapPoint {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  sector?: string;
  responsable?: string;
  direccion: string;
}
