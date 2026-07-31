import { useState } from 'react';
import { motion } from 'framer-motion';
import { calcOrgTotals, getOccupancyColor } from '../../lib';
import { ISubOrganization, IEmployee, IAssignModalTarget, IStaffingPosition, IStaffingDepartment } from '../../model';
import { getOrgCardTheme } from './orgCard/orgCardTheme';
import { OrgCardHeader } from './orgCard/OrgCardHeader';
import { OrgCardDepartments } from './orgCard/OrgCardDepartments';

export interface IOrgCardProps {
  org: ISubOrganization;
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
  index: number;
}

export const OrgCard = ({
  org,
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
  index,
}: IOrgCardProps) => {
  const [expanded, setExpanded] = useState(true);
  const totals = calcOrgTotals(org);
  const pct = totals.slots > 0 ? Math.round((totals.occupied / totals.slots) * 100) : 0;
  const colors = getOccupancyColor(pct);

  const theme = getOrgCardTheme(dark);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border shadow-sm overflow-hidden ${theme.cardBg}`}
    >
      <OrgCardHeader
        org={org}
        totals={totals}
        pct={pct}
        colors={colors}
        dark={dark}
        theme={theme}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((e) => !e)}
        onAddDept={onAddDept}
        onEditOrg={onEditOrg}
        onDeleteOrg={onDeleteOrg}
      />
      <OrgCardDepartments
        org={org}
        employees={employees}
        dark={dark}
        theme={theme}
        expanded={expanded}
        onAddDept={onAddDept}
        onAddPosition={onAddPosition}
        onDeleteDept={onDeleteDept}
        onDeletePosition={onDeletePosition}
        onUpdatePosition={onUpdatePosition}
        onOpenAssign={onOpenAssign}
        onUnassignEmployee={onUnassignEmployee}
        onEditDept={onEditDept}
      />
    </motion.div>
  );
};
