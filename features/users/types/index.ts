export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  created_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  roles: string[];
}
