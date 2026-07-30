import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { If } from '@shared/ui/If';
import {
  AddOrgModal,
  AddDeptModal,
  AddPositionModal,
  AssignEmployeeModal,
  EditOrgModal,
  EditDeptModal,
} from '../modals';
import type { IEmployee, IStaffingDepartment, ISubOrganization } from '../../model';

interface IProps {
  state: any;
  methods: any;
  addDeptOrg: ISubOrganization | null;
  addPosDept: IStaffingDepartment | null;
  dark?: boolean;
}

export function StaffingModals({
  state,
  methods,
  addDeptOrg,
  addPosDept,
  dark = false,
}: IProps) {
  return (
    <AnimatePresence>
      <If key={state.addOrgOpen ? 'add-org-open' : 'add-org-closed'} is={state.addOrgOpen}>
        <AddOrgModal
          key="add-org"
          employees={state.employees}
          organizations={state.organizations}
          onClose={() => state.setAddOrgOpen(false)}
          onSave={methods.handleAddOrg}
          dark={dark}
        />
      </If>
      <If key={state.addDeptOrgId !== null && !!addDeptOrg ? 'add-dept-open' : 'add-dept-closed'} is={state.addDeptOrgId !== null && !!addDeptOrg}>
        <AddDeptModal
          key="add-dept"
          orgName={addDeptOrg?.name || ''}
          existingDepts={addDeptOrg?.departments || []}
          employees={state.employees}
          onClose={() => state.setAddDeptOrgId(null)}
          onSave={() => {}}
          dark={dark}
        />
      </If>
      <If key={state.addPositionTarget !== null && !!addPosDept ? 'add-pos-open' : 'add-pos-closed'} is={state.addPositionTarget !== null && !!addPosDept}>
        <AddPositionModal
          key="add-pos"
          deptName={addPosDept?.name || ''}
          onClose={() => state.setAddPositionTarget(null)}
          onSave={(pos) => methods.handleAddPosition(state.addPositionTarget?.orgId ?? 0, state.addPositionTarget?.deptId ?? 0, pos)}
          dark={dark}
        />
      </If>
      <If key={state.assignTarget ? 'assign-open' : 'assign-closed'} is={!!state.assignTarget}>
        <AssignEmployeeModal
          key="assign"
          employees={state.employees}
          assignedIds={state.currentAssignedIds}
          positionName={state.assignTarget?.posName ?? ''}
          slots={state.currentAssignSlots}
          onClose={() => state.setAssignTarget(null)}
          onAssign={(emp) =>
            methods.handleAssignEmployee(state.assignTarget?.orgId ?? 0, state.assignTarget?.deptId ?? 0, state.assignTarget?.posId ?? 0, emp)
          }
          onUnassign={(empId) =>
            methods.handleUnassignEmployee(state.assignTarget?.orgId ?? 0, state.assignTarget?.deptId ?? 0, state.assignTarget?.posId ?? 0, empId)
          }
          dark={dark}
        />
      </If>
      <If key={state.editOrgTarget ? 'edit-org-open' : 'edit-org-closed'} is={!!state.editOrgTarget}>
        <EditOrgModal
          key="edit-org"
          org={state.editOrgTarget as any}
          employees={state.employees}
          dark={dark}
          onClose={() => state.setEditOrgTarget(null)}
          onSave={() => {}}
        />
      </If>
      <If key={state.editDeptTarget ? 'edit-dept-open' : 'edit-dept-closed'} is={!!state.editDeptTarget}>
        <EditDeptModal
          key="edit-dept"
          dept={state.editDeptTarget?.dept as any}
          orgId={state.editDeptTarget?.orgId ?? 0}
          existingDepts={state.organizations.find((o) => o.id === state.editDeptTarget?.orgId)?.departments ?? []}
          employees={state.employees}
          onClose={() => state.setEditDeptTarget(null)}
          onSave={() => {}}
          dark={dark}
        />
      </If>
    </AnimatePresence>
  );
}
