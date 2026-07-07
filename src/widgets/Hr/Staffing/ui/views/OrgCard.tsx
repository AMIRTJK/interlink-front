import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, Plus, Pencil, Trash2, UserCircle2, LayoutGrid } from 'lucide-react';
import { calcOrgTotals, getOccupancyColor } from '../../lib';
import { ProgressBar } from '../components/ProgressBar';
import { DeptBlock } from './DeptBlock';
import { ISubOrganization, IEmployee, IAssignModalTarget, IStaffingPosition, IStaffingDepartment } from '../../model';
import { If } from '@shared/ui/If';

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

  const cardBg = dark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-100';
  const deptAreaBg = dark ? 'bg-gray-900/40' : '';
  const emptyIcon = dark ? 'bg-gray-700' : 'bg-gray-50';
  const emptyText = dark ? 'text-gray-600' : 'text-gray-400';
  const addDeptBtnEmpty = dark
    ? 'border-indigo-700/50 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20'
    : 'border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/50';
  const addDeptBtnBottom = dark
    ? 'border-gray-700 text-gray-500 hover:border-indigo-700/50 hover:text-indigo-400'
    : 'border-dashed border-gray-200 text-gray-400 hover:border-indigo-200 hover:text-indigo-500';
  const editBtn = dark
    ? 'text-gray-500 hover:bg-gray-700 hover:text-indigo-400'
    : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-600';
  const deleteBtn = dark
    ? 'text-gray-500 hover:bg-gray-700 hover:text-red-400'
    : 'text-gray-400 hover:bg-red-50 hover:text-red-500';
  const addDeptBtn = dark
    ? 'border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/20'
    : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50';
  const chevronBtn = dark ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100';
  const subText = dark ? 'text-gray-500' : 'text-gray-400';
  const nameText = dark ? 'text-amber-300' : 'text-amber-800';
  const nameTextNormal = dark ? 'text-gray-100' : 'text-gray-900';
  const statBg = dark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-gray-50';
  const curatorText = dark ? 'text-indigo-400/80' : 'text-indigo-600/80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}
    >
      <div
        className="px-5 py-4 flex items-center gap-4"
        style={{ borderLeft: `3px solid ${org.isMain ? '#d97706' : org.color}` }}
      >
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ backgroundColor: org.isMain ? '#d97706' : org.color }}
          >
            {org.shortName.slice(0, 2)}
          </div>
          <If is={org.isMain}>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
              <Star size={8} className="text-amber-900" fill="currentColor" />
            </div>
          </If>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <If is={org.isMain}>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                  dark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}
              >
                Вышестоящая
              </span>
            </If>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {org.type}
            </span>
          </div>
          <h3
            className={`text-sm font-bold mt-1 truncate ${
              org.isMain ? nameText : nameTextNormal
            }`}
          >
            {org.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs ${subText}`}>
              {org.departments.length} отд. · {totals.positions} должн. · {totals.slots} ставок
            </span>
            <If is={!!org.curatorName}>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium ${curatorText}`}
              >
                <UserCircle2 size={10} />
                <span>{org.curatorName}</span>
              </span>
            </If>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <If is={totals.slots > 0}>
            <div
              className={`hidden sm:flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl border ${statBg}`}
            >
              <div className="w-28">
                <ProgressBar
                  slots={totals.slots}
                  occupied={totals.occupied}
                  height="h-2"
                  dark={dark}
                />
              </div>
              <p className={`text-xs font-bold ${dark ? colors.darkText : colors.text}`}>
                {pct}% · {totals.occupied}/{totals.slots}
              </p>
            </div>
          </If>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddDept(org.id)}
              className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${addDeptBtn}`}
            >
              <Plus size={12} />
              <span>Отдел</span>
            </button>
            <button
              onClick={() => onEditOrg(org)}
              className={`p-2 rounded-xl transition-colors ${editBtn}`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDeleteOrg(org.id)}
              className={`p-2 rounded-xl transition-colors ${deleteBtn}`}
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => setExpanded((e) => !e)}
              className={`p-2 rounded-xl transition-colors ${chevronBtn}`}
            >
              <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={15} />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        <If is={expanded}>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={deptAreaBg}
          >
            <If is={org.departments.length === 0}>
              <div className="px-5 py-8 flex flex-col items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${emptyIcon}`}
                >
                  <LayoutGrid size={16} className={dark ? 'text-gray-600' : 'text-gray-300'} />
                </div>
                <p className={`text-sm ${emptyText}`}>Нет отделов</p>
                <button
                  onClick={() => onAddDept(org.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${addDeptBtnEmpty}`}
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
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all ${addDeptBtnBottom}`}
                >
                  <Plus size={13} />
                  <span>Добавить отдел</span>
                </button>
              </div>
            </If>
          </motion.div>
        </If>
      </AnimatePresence>
    </motion.div>
  );
};
