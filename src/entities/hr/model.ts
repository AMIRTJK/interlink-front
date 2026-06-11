export interface MetaData {
  type: string;
  note: string;
}

// createOrganization
export interface CreateOrganizationDTO {
  name: string;
  short_name: string;
  code: string;
  inn: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  meta: MetaData;
}

// createUser
export interface CreateUserDTO {
  last_name: string;
  first_name: string;
  phone: string;
  password?: string;
  position: string;
  organization_id: number;
  department_id: number;
  roles: string[];
}

// setRoleToUser
export interface SetRoleDTO {
  user_id: number;
  roles: string[];
}

// createPermision
export interface CreatePermissionDTO {
  name: string;
}

// createPermisionAndRoles
export interface CreatePermissionAndRoleDTO {
  name: string;
  permissions: string[];
}

// createDepartment
export interface CreateDepartmentDTO {
  name: string;
  code: string;
}

// Пользователь из админского списка (GET_USERS)
export interface IAdminUser {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  position?: string;
  phone?: string;
  email?: string;
  personal_email?: string;
  personal_phone?: string;
  status?: string;
  salary?: number;
  photo_path?: string;
  organization?: { id: number; name: string };
  department?: { id: number; name: string };
  departments?: { id: number; name: string }[];
  roles?: { id: number; name: string }[];
}