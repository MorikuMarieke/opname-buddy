export interface Department {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentInput {
  name: string;
  code?: string | null;
}

export interface DepartmentUpdateInput {
  name?: string;
  code?: string | null;
}
