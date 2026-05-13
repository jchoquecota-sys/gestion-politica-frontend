export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string;
  auditoria: {
    creado_por: string;
    creado_el: string;
    actualizado_por: string | null;
    actualizado_el: string;
  };
}

export interface CargoFormData {
  nombre: string;
  descripcion?: string;
}
