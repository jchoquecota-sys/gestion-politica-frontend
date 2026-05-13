export interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  celular?: string;
  email?: string;
  direccion?: string;
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
}
