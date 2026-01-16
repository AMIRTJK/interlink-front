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