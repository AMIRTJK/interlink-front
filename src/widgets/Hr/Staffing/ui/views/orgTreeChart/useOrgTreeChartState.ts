import { useState } from 'react';
import type { IEmployee, IStaffingDepartment, ISubOrganization } from '../../../model';

export function useOrgTreeChartState(organizations: ISubOrganization[], employees: IEmployee[]) {
  const [expandedOrgs, setExpandedOrgs] = useState<Set<number>>(
    new Set(organizations.map((o) => o.id))
  );
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
  const [selectedNode, setSelectedNode] = useState<{
    type: 'org' | 'dept';
    id: number;
  } | null>(null);

  const toggleOrg = (id: number) =>
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleDept = (id: number) =>
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const getOrgAvatar = (org: ISubOrganization) => {
    if (org.curatorId) {
      const emp = employees.find((e) => e.id === org.curatorId);
      if (emp) {
        return {
          photo: emp.avatarPhoto,
          initials: emp.avatarInitials,
          color: emp.avatarColor,
          name: `${emp.lastName} ${emp.firstName}`,
        };
      }
    }
    return null;
  };

  const getDeptAvatar = (dept: IStaffingDepartment) => {
    if (dept.managerId) {
      const emp = employees.find((e) => e.id === dept.managerId);
      if (emp) {
        return {
          photo: emp.avatarPhoto,
          initials: emp.avatarInitials,
          color: emp.avatarColor,
          name: `${emp.lastName} ${emp.firstName}`,
        };
      }
    }
    return null;
  };

  return {
    expandedOrgs,
    expandedDepts,
    selectedNode,
    setSelectedNode,
    toggleOrg,
    toggleDept,
    getOrgAvatar,
    getDeptAvatar,
  };
}
