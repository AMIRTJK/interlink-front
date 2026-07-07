import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { OrgCard } from './OrgCard';
import { ISubOrganization, IEmployee, IAssignModalTarget, IStaffingDepartment, IStaffingPosition } from '../../model';

export interface IListViewProps {
  organizations: ISubOrganization[];
  employees: IEmployee[];
  dark?: boolean;
  onAddDept: (orgId: number) => void;
  onDeleteOrg: (orgId: number) => void;
  onEditOrg: (org: ISubOrganization) => void;
  onAddPosition: (orgId: number, deptId: number) => void;
  onDeleteDept: (orgId: number, deptId: number) => void;
  onDeletePosition: (orgId: number, deptId: number, posId: number) => void;
  onUpdatePosition: (
    orgId: number,
    deptId: number,
    posId: number,
    updated: Partial<IStaffingPosition>
  ) => void;
  onOpenAssign: (target: IAssignModalTarget) => void;
  onUnassignEmployee: (orgId: number, deptId: number, posId: number, empId: number) => void;
  onEditDept: (orgId: number, dept: IStaffingDepartment) => void;
}

export const ListView = ({
  organizations,
  employees,
  dark = false,
  onAddDept,
  onDeleteOrg,
  onEditOrg,
  onAddPosition,
  onDeleteDept,
  onDeletePosition,
  onUpdatePosition,
  onOpenAssign,
  onUnassignEmployee,
  onEditDept,
}: IListViewProps) => {
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {organizations.map((org, idx) => (
          <OrgCard
            key={org.id}
            org={org}
            employees={employees}
            dark={dark}
            index={idx}
            onAddDept={onAddDept}
            onDeleteOrg={onDeleteOrg}
            onEditOrg={onEditOrg}
            onAddPosition={onAddPosition}
            onDeleteDept={onDeleteDept}
            onDeletePosition={onDeletePosition}
            onUpdatePosition={onUpdatePosition}
            onOpenAssign={onOpenAssign}
            onUnassignEmployee={onUnassignEmployee}
            onEditDept={onEditDept}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
