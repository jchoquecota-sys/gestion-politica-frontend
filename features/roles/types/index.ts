export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface RoleFormData {
  name: string;
  permissions: string[];
}
