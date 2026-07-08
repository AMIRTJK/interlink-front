import type { IStaffingStructureApi, IStaffingSubOrgApi, IStaffingDeptApi, IStaffingPositionApi } from "@entities/hr";

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

// Map raw API staffing structure to frontend ISubOrganization[]
export const normalizeStaffingStructure = (
  raw?: IStaffingStructureApi | null
): ISubOrganization[] => {
  if (!raw) return [];
  const subOrgs = raw.sub_organizations || [];
  const rootDepts = raw.departments || [];

  return subOrgs.map((org, orgIdx) => {
    // A department is included if it contains positions belonging to this sub_organization.
    const orgDepts = rootDepts
      .map((dept) => {
        const filteredPositions = (dept.positions || [])
          .filter((pos) => pos.sub_organization_id === org.id)
          .map((pos) => ({
            id: pos.id,
            name: pos.name,
            slots: pos.slots,
            occupied: pos.occupied,
            vacant: pos.vacant,
            salary: pos.salary,
            assignedEmployees: (pos.assigned_employees || []).map((ae) => ({
              id: ae.id,
              name: ae.name,
              initials: ae.initials || '??',
              color: ORG_COLORS[ae.id % ORG_COLORS.length],
              photo: ae.photo || '',
            })),
          }));

        return {
          id: dept.id,
          name: dept.name,
          positions: filteredPositions,
          collapsed: false,
          curatorId: dept.curator_user_id,
          curatorName: dept.curator_name || '—',
          managerId: null,
          managerName: '—',
          parentDeptId: dept.parent_id,
        };
      })
      .filter((dept) => dept.positions.length > 0);

    return {
      id: org.id,
      name: org.name,
      shortName: org.short_name,
      type: org.type,
      departments: orgDepts,
      collapsed: false,
      color: org.color || ORG_COLORS[orgIdx % ORG_COLORS.length],
      isMain: org.is_main,
      curatorId: org.curator_user_id,
      curatorName: org.curator_name || '—',
      parentOrgId: org.parent_id,
    };
  });
};
