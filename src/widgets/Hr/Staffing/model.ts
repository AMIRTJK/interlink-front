export type TEmployeeStatus = 'active' | 'vacation' | 'business_trip';

export interface IEmployee {
  id: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  position: string;
  department: string;
  status: TEmployeeStatus;
  email: string;
  phone: string;
  salary: number;
  avatarColor: string;
  avatarInitials: string;
  avatarPhoto: string;
  rating: number;
}

export interface IAssignedEmployee {
  id: number;
  name: string;
  initials: string;
  color: string;
  photo: string;
}

export interface IStaffingPosition {
  id: number;
  name: string;
  slots: number;
  occupied: number;
  vacant: number;
  salary: number;
  assignedEmployees: IAssignedEmployee[];
}

export interface IStaffingDepartment {
  id: number;
  name: string;
  positions: IStaffingPosition[];
  collapsed: boolean;
  curatorId: number | null;
  curatorName: string;
  managerId: number | null;
  managerName: string;
  parentDeptId: number | null;
}

export interface ISubOrganization {
  id: number;
  name: string;
  shortName: string;
  type: string;
  departments: IStaffingDepartment[];
  collapsed: boolean;
  color: string;
  isMain: boolean;
  curatorId: number | null;
  curatorName: string;
  parentOrgId: number | null;
}

export interface IAssignModalTarget {
  orgId: number;
  deptId: number;
  posId: number;
  posName: string;
  assignedIds: number[];
  slots: number;
}

export interface IPdfFile {
  name: string;
  url: string;
  size: string;
}

export type TStaffingViewMode = 'list' | 'grid' | 'tree' | 'bubble';

// ─── Constants ────────────────────────────────────────────────────────────────

export const ORG_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', 
  '#ef4444', '#14b8a6', '#7c3aed', '#f97316', '#8b5cf6'
];

export const ORG_TYPES = [
  'Министерство', 'Агентство', 'Служба', 'Комитет', 
  'Главное управление', 'Управление', 'Отдел'
];

export const DEPT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#14b8a6'
];

export const STATUS_CONFIG: Record<TEmployeeStatus, {
  label: string;
  dot: string;
  bg: string;
  text: string;
  darkBg: string;
  darkText: string;
}> = {
  active: {
    label: 'Активен',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    darkBg: 'bg-emerald-900/40',
    darkText: 'text-emerald-400'
  },
  vacation: {
    label: 'В отпуске',
    dot: 'bg-red-500',
    bg: 'bg-red-100',
    text: 'text-red-700',
    darkBg: 'bg-red-900/40',
    darkText: 'text-red-400'
  },
  business_trip: {
    label: 'В командировке',
    dot: 'bg-amber-500',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    darkBg: 'bg-amber-900/40',
    darkText: 'text-amber-400'
  }
};
