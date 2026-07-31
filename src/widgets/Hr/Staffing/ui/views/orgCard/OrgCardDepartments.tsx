import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid } from 'lucide-react';
import { DeptBlock } from '../DeptBlock';
import {
  ISubOrganization,
  IEmployee,
  IAssignModalTarget,
  IStaffingPosition,
  IStaffingDepartment,
} from '../../../model';
import { If } from '@shared/ui/If';
import { IOrgCardTheme } from './orgCardTheme';

interface IProps {
  org: ISubOrganization;
  employees: IEmployee[];
  dark: boolean;
  theme: IOrgCardTheme;
  expanded: boolean;
  onAddDept: (orgId: number) => void;
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

export const OrgCardDepartments = ({
  org,
  employees,
  dark,
  theme,
  expanded,
  onAddDept,
  onAddPosition,
  onDeleteDept,
  onDeletePosition,
  onUpdatePosition,
  onOpenAssign,
  onUnassignEmployee,
  onEditDept,
}: IProps) => (
  <AnimatePresence>
    <If is={expanded}>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className={theme.deptAreaBg}
      >
        <If is={org.departments.length === 0}>
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.emptyIcon}`}
            >
              <LayoutGrid size={16} className={dark ? 'text-gray-600' : 'text-gray-300'} />
            </div>
            <p className={`text-sm ${theme.emptyText}`}>Нет отделов</p>
            <button
              onClick={() => onAddDept(org.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${theme.addDeptBtnEmpty}`}
            >
              <Plus size={13} />
              <span>Добавить отдел</span>
            </button>
          </div>
        </If>
        <If is={org.departments.length > 0}>
          <div className="px-4 pb-4 pt-2 space-y-3">
            {org.departments
              .filter((d) => d.parentDeptId === null)
              .map((dept) => (
                <DeptBlock
                  key={dept.id}
                  dept={dept}
                  org={org}
                  employees={employees}
                  dark={dark}
                  onOpenAssign={onOpenAssign}
                  onAddPosition={onAddPosition}
                  onDeleteDept={onDeleteDept}
                  onDeletePosition={onDeletePosition}
                  onUpdatePosition={onUpdatePosition}
                  onUnassignEmployee={onUnassignEmployee}
                  onEditDept={onEditDept}
                />
              ))}
            <button
              onClick={() => onAddDept(org.id)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all ${theme.addDeptBtnBottom}`}
            >
              <Plus size={13} />
              <span>Добавить отдел</span>
            </button>
          </div>
        </If>
      </motion.div>
    </If>
  </AnimatePresence>
);
