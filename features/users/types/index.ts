export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  created_at: string;
  persona?: {
    id: number;
    nombre_completo: string;
  };
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  roles: string[];
  persona_id?: number | null;
}
