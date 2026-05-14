export interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  nombre_completo?: string;
  dni: string;
  celular?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonaFormData {
  nombres: string;
  apellidos: string;
  dni: string;
  celular?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  foto?: File | null;
}
