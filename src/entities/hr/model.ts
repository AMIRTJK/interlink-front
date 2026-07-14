export interface MetaData {
  type: string;
  note: string;
}

export interface IOrganizationShort {
  id: number;
  name: string;
  short_name?: string;
}

export interface ISupervisorShort {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name?: string;
  position?: string;
}

export interface IDepartmentShort {
  id: number;
  name: string;
  code?: string;
}

export interface IRoleShort {
  id: number;
  name: string;
  guard_name?: string;
}

/**
 * Поля, распознанные OCR из фотографий паспорта.
 * Пока OCR на сервере отключён (не установлен Tesseract) — все поля приходят как null.
 * После активации OCR контракт не меняется: fields начнёт приходить заполненным,
 * и фронтенд автоматически подставит эти значения в форму создания сотрудника.
 * Список полей может расширяться на бэкенде — поэтому допускаем произвольные ключи.
 */
export interface IPassportOcrFields {
  last_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  passport_series?: string | null;
  passport_number?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  inn?: string | null;
  [key: string]: string | null | undefined;
}

export interface IPassportOcrData {
  /** "disabled" пока OCR не установлен на сервере; после активации — например "success". */
  status: string;
  /** Распознанные значения. null (или отсутствие) — OCR ещё не дал данных, форма работает вручную. */
  fields?: IPassportOcrFields | null;
  [key: string]: unknown;
}

/** Ответ POST /api/v1/admin/users/passport-ocr. */
export interface IPassportOcrResponse {
  passport_front_path: string;
  passport_back_path: string | null;
  passport_ocr_scanned_at: string | null;
  passport_ocr_data: IPassportOcrData;
}

export interface IAdminUser {
  id: number;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  personal_email?: string;
  personal_phone?: string;
  corporate_email?: string;
  corporate_phone?: string;
  position?: string;
  hr_status?: string;
  status?: string;
  salary?: number | string;
  birth_date?: string;
  gender?: string;
  passport_series?: string;
  passport_number?: string;
  passport_front_path?: string | null;
  passport_back_path?: string | null;
  passport_ocr_scanned_at?: string | null;
  passport_ocr_data?: IPassportOcrData | null;
  inn?: string;
  address?: string;
  bank_account?: string;
  rating?: number;
  photo_path?: string | null;
  bio?: string | null;
  organization_id?: number;
  supervisor_id?: number;
  organization?: IOrganizationShort;
  supervisor?: ISupervisorShort | null;
  department?: IDepartmentShort;
  departments?: IDepartmentShort[];
  roles?: IRoleShort[];
  projects_count?: number;
  tasks_count?: number;
  awards_count?: number;
  years?: number;
  created_at?: string;
}

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

export interface CreateUserDTO {
  last_name: string;
  first_name: string;
  middle_name?: string;
  phone: string;
  password?: string;
  position: string;
  personal_email?: string;
  personal_phone?: string;
  corporate_email?: string;
  corporate_phone?: string;
  organization_id: number;
  supervisor_id?: number;
  hr_status?: string;
  salary?: number;
  birth_date?: string;
  gender?: string;
  passport_series?: string;
  passport_number?: string;
  // Паспортные/OCR-поля, полученные из ответа POST /api/v1/admin/users/passport-ocr
  // и отправляемые вместе с остальными полями при создании/редактировании сотрудника.
  passport_front_path?: string | null;
  passport_back_path?: string | null;
  passport_ocr_scanned_at?: string | null;
  passport_ocr_data?: IPassportOcrData | null;
  inn?: string;
  address?: string;
  bank_account?: string;
  roles?: string[];
  department_ids?: number[];
  bio?: string;
}

export interface SetRoleDTO {
  user_id: number;
  roles: string[];
}

export interface CreatePermissionDTO {
  name: string;
}

export interface CreatePermissionAndRoleDTO {
  name: string;
  permissions: string[];
}

export interface CreateDepartmentDTO {
  name: string;
  code: string;
}

export interface IHrDocumentEmployee {
  id: number;
  full_name: string;
  position: string;
}

export interface IHrDocumentUploader {
  id: number;
  full_name: string;
}

export interface IHrDocument {
  id: number;
  organization_id: number;
  employee_id: number;
  uploaded_by: number;
  type: string;
  title: string;
  status: string;
  issued_at: string;
  expires_at: string | null;
  original_name: string;
  stored_name: string;
  extension: string;
  mime: string;
  size: number;
  size_human: string;
  download_url: string;
  meta: unknown;
  employee: IHrDocumentEmployee;
  uploader: IHrDocumentUploader;
}

export interface IHrOrderAttachment {
  id: number;
  original_name: string;
  extension: string;
  mime: string;
  size: number;
  download_url: string;
}

export interface IHrOrderEmployee {
  id: number;
  full_name: string;
  position: string;
}

export interface IHrOrder {
  id: number;
  organization_id: number;
  employee_id: number;
  executor_id: number;
  type: string;
  number: string;
  date: string;
  order_date: string;
  basis: string;
  points: string[];
  minister_name: string;
  minister_signed: boolean;
  executor_signed: boolean;
  status: string;
  employee: IHrOrderEmployee;
  executor: IHrOrderEmployee;
  attachments: IHrOrderAttachment[];
}

export interface ICreateOrderDTO {
  organization_id: number;
  employee_id: number;
  executor_id: number;
  type: string;
  number: string;
  order_date: string;
  basis: string;
  points: string[];
  minister_name: string;
  minister_signed: boolean;
  executor_signed: boolean;
  status: string;
}

export interface IStaffingAssignedEmployee {
  id: number;
  name: string;
  initials: string;
  photo: string | null;
}

export interface IStaffingPositionApi {
  id: number;
  organization_id: number;
  sub_organization_id: number;
  department_id: number;
  department_name: string;
  sub_organization_name: string;
  name: string;
  slots: number;
  occupied: number;
  vacant: number;
  salary: number;
  assigned_employees: IStaffingAssignedEmployee[];
}

export interface IStaffingDeptApi {
  id: number;
  organization_id: number;
  parent_id: number | null;
  name: string;
  code: string;
  curator_user_id: number | null;
  curator_name: string;
  positions: IStaffingPositionApi[];
}

export interface IStaffingSubOrgApi {
  id: number;
  organization_id: number;
  parent_id: number | null;
  curator_user_id: number | null;
  curator_name: string;
  name: string;
  short_name: string;
  type: string;
  color: string;
  is_main: boolean;
  sort_order: number;
  positions: IStaffingPositionApi[];
}

export interface IStaffingStructureApi {
  organization_id: number;
  sub_organizations: IStaffingSubOrgApi[];
  departments: IStaffingDeptApi[];
}

export interface ICreateSubOrgDTO {
  organization_id: number;
  name: string;
  short_name: string;
  type: string;
  color: string;
  is_main: boolean;
  sort_order: number;
  curator_user_id?: number;
}

export interface ICreatePositionDTO {
  organization_id: number;
  sub_organization_id: number;
  department_id: number;
  name: string;
  slots: number;
  salary: number;
  sort_order?: number;
}