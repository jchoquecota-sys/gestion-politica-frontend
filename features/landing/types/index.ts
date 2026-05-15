// ─── Tipos para la Landing Page Pública ──────────────────────────────────────

export interface RedSocial {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface CandidateInfo {
  nombre_candidato: string;
  cargo_candidatura: string | null;
  eslogan: string | null;
  biografia: string | null;
  logo_url: string | null;
  foto_principal_url: string | null;
  foto_secundaria_url: string | null;
  redes_sociales: RedSocial;
  color_primario: string;
  color_secundario: string;
}

export interface PublicStat {
  total_simpatizantes: number;
  total_bases: number;
  total_sectores: number;
  total_actividades: number;
}

export interface SectorDistribucion {
  name: string;
  value: number;
}

export interface CrecimientoMensual {
  mes: string;
  total: number;
}

export interface MapaBase {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  sector: string | null;
  direccion: string | null;
}

export interface PublicNoticia {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_actividad: string;
  tipo: string | null;
  foto_portada_url: string | null;
}

export interface PublicEvento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_actividad: string;
  tipo: string | null;
}

export interface LandingData {
  candidate: CandidateInfo | null;
  stats: PublicStat;
  distribucion_sectores: SectorDistribucion[];
  crecimiento_mensual: CrecimientoMensual[];
  mapa_bases: MapaBase[];
  noticias: PublicNoticia[];
  calendario: PublicEvento[];
}

// ─── Tipos para la gestión interna (LandingSettings) ─────────────────────────

export interface LandingSetting {
  id?: number;
  nombre_candidato: string;
  cargo_candidatura: string | null;
  eslogan: string | null;
  biografia: string | null;
  logo_url: string | null;
  foto_principal_url: string | null;
  foto_secundaria_url: string | null;
  logo_path: string | null;
  foto_principal_path: string | null;
  foto_secundaria_path: string | null;
  redes_sociales: RedSocial;
  color_primario: string;
  color_secundario: string;
  meta_titulo: string | null;
  meta_descripcion: string | null;
  updated_at?: string | null;
}
