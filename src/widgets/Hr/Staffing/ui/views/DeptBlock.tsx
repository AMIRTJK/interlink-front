import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pencil, Trash2, LayoutGrid, Plus, UserCircle2, Shield } from 'lucide-react';
import { getOccupancyColor } from '../../lib';
import { PositionRow } from './PositionRow';
import { IStaffingDepartment, ISubOrganization, IEmployee, IAssignModalTarget, IStaffingPosition } from '../../model';
import { If } from '@shared/ui/If';

export interface IDeptBlockProps {
  dept: IStaffingDepartment;
  org: ISubOrganization;
  employees: IEmployee[];
  dark?: boolean;
  onOpenAssign: (target: IAssignModalTarget) => void;
  onAddPosition: (orgId: number, deptId: number) => void;
  onDeleteDept: (orgId: number, deptId: number) => void;
  onDeletePosition: (orgId: number, deptId: number, posId: number) => void;
  onUpdatePosition: (
    orgId: number,
    deptId: number,
    posId: number,
    updated: Partial<IStaffingPosition>
  ) => void;
  onUnassignEmployee: (orgId: number, deptId: number, posId: number, empId: number) => void;
  onEditDept: (orgId: number, dept: IStaffingDepartment) => void;
}

export const DeptBlock = ({
  dept,
  org,
  employees,
  dark = false,
  onOpenAssign,
  onAddPosition,
  onDeleteDept,
  onDeletePosition,
  onUpdatePosition,
  onUnassignEmployee,
  onEditDept,
}: IDeptBlockProps) => {
  const [expanded, setExpanded] = useState(true);
  const totalSlots = dept.positions.reduce((s, p) => s + p.slots, 0);
  const totalOccupied = dept.positions.reduce((s, p) => s + p.occupied, 0);
  const pct = totalSlots > 0 ? Math.round((totalOccupied / totalSlots) * 100) : 0;
  const colors = getOccupancyColor(pct);

  const headerBg = dark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-gray-50/80 border-gray-100';
  const cardBg = dark ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-100';
  const deptNameText = dark ? 'text-gray-200' : 'text-gray-800';
  const subText = dark ? 'text-gray-500' : 'text-gray-400';
  const curatorBadge = dark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600/80';
  const managerBadge = dark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600/80';
  const actionBtn = dark
    ? 'text-gray-500 hover:bg-gray-700 hover:text-indigo-400'
    : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-600';
  const deleteBtn = dark
    ? 'text-gray-500 hover:bg-gray-700 hover:text-red-400'
    : 'text-gray-400 hover:bg-red-50 hover:text-red-500';
  const addBtn = dark
    ? 'border-dashed border-indigo-700/50 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20'
    : 'border-dashed border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50';

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
      <div className={`flex items-center gap-3 px-4 py-3 border-b ${headerBg}`}>
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: org.color + (dark ? '55' : '22') }}
        >
          <LayoutGrid size={13} style={{ color: org.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold truncate ${deptNameText}`}>{dept.name}</p>
            <If is={!!dept.managerName}>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${managerBadge}`}
              >
                <UserCircle2 size={9} />
                <span className="truncate max-w-[80px]">{dept.managerName}</span>
              </span>
            </If>
            <If is={!!dept.curatorName}>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${curatorBadge}`}
              >
                <Shield size={8} />
                <span className="truncate max-w-[80px]">{dept.curatorName}</span>
              </span>
            </If>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-xs ${subText}`}>{dept.positions.length} должн.</p>
            <If is={totalSlots > 0}>
              <span className={`text-[10px] font-semibold ${dark ? colors.darkText : colors.text}`}>
                {pct}%
              </span>
            </If>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEditDept(org.id, dept)}
            className={`p-1.5 rounded-xl transition-colors ${actionBtn}`}
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDeleteDept(org.id, dept.id)}
            className={`p-1.5 rounded-xl transition-colors ${deleteBtn}`}
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`p-1.5 rounded-xl transition-colors ${actionBtn}`}
          >
            <motion.div
              animate={{ rotate: expanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={15} />
            </motion.div>
          </button>
        </div>
      </div>
      <AnimatePresence>
        <If is={expanded}>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <If is={dept.positions.length === 0}>
              <div
                className={`px-4 py-6 text-center text-sm ${
                  dark ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                Нет должностей
              </div>
            </If>
            <If is={dept.positions.length > 0}>
              <AnimatePresence>
                {dept.positions.map((pos, idx) => (
                  <PositionRow
                    key={pos.id}
                    pos={pos}
                    index={idx}
                    orgId={org.id}
                    deptId={dept.id}
                    employees={employees}
                    dark={dark}
                    onDelete={onDeletePosition}
                    onUpdate={onUpdatePosition}
                    onOpenAssign={onOpenAssign}
                    onUnassign={onUnassignEmployee}
                  />
                ))}
              </AnimatePresence>
            </If>
            <div className={`px-4 py-3 border-t ${dark ? 'border-gray-700/40' : 'border-gray-50'}`}>
              <button
                onClick={() => onAddPosition(org.id, dept.id)}
                className={`flex items-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all ${addBtn}`}
              >
                <Plus size={13} />
                <span>Добавить должность</span>
              </button>
            </div>
          </motion.div>
        </If>
      </AnimatePresence>
    </div>
  );
};
