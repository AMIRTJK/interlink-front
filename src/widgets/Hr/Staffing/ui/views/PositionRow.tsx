import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Pencil, Users } from 'lucide-react';
import { getOccupancyColor } from '../../lib';
import { ProgressBar } from '../components/ProgressBar';
import { MiniAvatar } from '../components/MiniAvatar';
import { IEmployee, IStaffingPosition, IAssignModalTarget } from '../../model';
import { If } from '@shared/ui/If';

export interface IPositionRowProps {
  pos: IStaffingPosition;
  index: number;
  orgId: number;
  deptId: number;
  employees: IEmployee[];
  dark?: boolean;
  onDelete: (orgId: number, deptId: number, posId: number) => void;
  onUpdate: (
    orgId: number,
    deptId: number,
    posId: number,
    updated: Partial<IStaffingPosition>
  ) => void;
  onOpenAssign: (target: IAssignModalTarget) => void;
  onUnassign: (orgId: number, deptId: number, posId: number, empId: number) => void;
}

export const PositionRow = ({
  pos,
  index,
  orgId,
  deptId,
  employees,
  dark = false,
  onDelete,
  onUpdate,
  onOpenAssign,
  onUnassign,
}: IPositionRowProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(pos.name);
  const [editSlots, setEditSlots] = useState(String(pos.slots));
  const [editOccupied, setEditOccupied] = useState(String(pos.occupied));
  const [editSalary, setEditSalary] = useState(String(pos.salary));
  const [exiting, setExiting] = useState(false);

  const pct = pos.slots > 0 ? Math.round((pos.occupied / pos.slots) * 100) : 0;
  const colors = getOccupancyColor(pct);
  const editVacant = Math.max(0, Number(editSlots) - Number(editOccupied));

  const handleDelete = () => {
    setExiting(true);
    setTimeout(() => onDelete(orgId, deptId, pos.id), 320);
  };

  const handleSave = () => {
    onUpdate(orgId, deptId, pos.id, {
      name: editName || pos.name,
      slots: Number(editSlots) || 1,
      occupied: Number(editOccupied) || 0,
      vacant: editVacant,
      salary: parseFloat(editSalary) || 0,
    });
    setEditing(false);
  };

  const rowBorder = dark ? 'border-gray-700/40' : 'border-gray-50';
  const rowHover = dark ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50/80';
  const editBg = dark ? 'bg-gray-800/60' : 'bg-indigo-50/60';
  const inputCls = dark
    ? 'bg-gray-700 border-gray-600 text-gray-100'
    : 'bg-white border-indigo-200 text-gray-800';
  const nameText = dark ? 'text-gray-200' : 'text-gray-800';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={
        exiting
          ? { opacity: 0, x: 24, scale: 0.94 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, y: -8 }}
      transition={exiting ? { duration: 0.28 } : { delay: index * 0.04 }}
      className={`border-b ${rowBorder} last:border-0 transition-colors group ${
        editing ? editBg : rowHover
      }`}
    >
      <If is={editing}>
        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${inputCls}`}
              />
            </div>
            <div>
              <label
                className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
                  dark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Ставок
              </label>
              <input
                type="number"
                min="0"
                value={editSlots}
                onChange={(e) => setEditSlots(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold focus:outline-none ${inputCls}`}
              />
            </div>
            <div>
              <label
                className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
                  dark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Занято
              </label>
              <input
                type="number"
                min="0"
                max={Number(editSlots)}
                value={editOccupied}
                onChange={(e) =>
                  setEditOccupied(
                    String(
                      Math.min(Number(e.target.value), Number(editSlots))
                    )
                  )
                }
                className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold focus:outline-none ${inputCls}`}
              />
            </div>
            <div>
              <label
                className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
                  dark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Вак.
              </label>
              <div
                className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold ${
                  dark
                    ? 'border-gray-700 bg-gray-800/60 text-gray-500'
                    : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}
              >
                {editVacant}
              </div>
            </div>
            <div>
              <label
                className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
                  dark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Оклад
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editSalary}
                onChange={(e) => setEditSalary(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold focus:outline-none ${inputCls}`}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setEditName(pos.name);
                setEditSlots(String(pos.slots));
                setEditOccupied(String(pos.occupied));
                setEditSalary(String(pos.salary));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                dark
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Check size={12} />
              <span>Сохранить</span>
            </button>
          </div>
        </div>
      </If>
      <If is={!editing}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            <span
              className={`text-xs font-semibold tabular-nums ${
                dark ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {index + 1}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <p className={`text-sm font-semibold truncate ${nameText}`}>
                {pos.name}
              </p>
              <If is={pos.vacant > 0}>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                    dark
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <span>{pos.vacant} вак.</span>
                </span>
              </If>
            </div>
            <ProgressBar slots={pos.slots} occupied={pos.occupied} dark={dark} />
            <If is={pos.assignedEmployees.length > 0}>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-1.5">
                  {pos.assignedEmployees.slice(0, 5).map((ae) => (
                    <div
                      key={ae.id}
                      className="relative group/avatar"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnassign(orgId, deptId, pos.id, ae.id);
                      }}
                    >
                      <MiniAvatar
                        photo={ae.photo}
                        initials={ae.initials}
                        color={ae.color}
                        size="xs"
                      />
                      <div className="absolute inset-0 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                        <X size={7} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
                <If is={pos.assignedEmployees.length > 5}>
                  <span
                    className={`text-[10px] font-semibold ${
                      dark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    +{pos.assignedEmployees.length - 5}
                  </span>
                </If>
              </div>
            </If>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <div className="text-center">
                <p
                  className={`text-[10px] font-semibold leading-none ${
                    dark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  Ставок
                </p>
                <p
                  className={`text-sm font-bold tabular-nums mt-0.5 ${
                    dark ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {pos.slots}
                </p>
              </div>
              <div className={`w-px h-6 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`} />
              <div className="text-center">
                <p
                  className={`text-[10px] font-semibold leading-none ${
                    dark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  Занято
                </p>
                <p className="text-sm font-bold text-emerald-500 tabular-nums mt-0.5">
                  {pos.occupied}
                </p>
              </div>
              <If is={pos.salary > 0}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-px h-6 ${
                      dark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  />
                  <div className="text-center">
                    <p
                      className={`text-[10px] font-semibold leading-none ${
                        dark ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      Оклад
                    </p>
                    <p
                      className={`text-sm font-bold tabular-nums mt-0.5 ${
                        dark ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      ₽{pos.salary.toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              </If>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                dark ? colors.darkBadge : colors.badge
              }`}
            >
              {pct}%
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <button
                onClick={() =>
                  onOpenAssign({
                    orgId,
                    deptId,
                    posId: pos.id,
                    posName: pos.name,
                    assignedIds: pos.assignedEmployees.map((ae) => ae.id),
                    slots: pos.slots,
                  })
                }
                className={`p-1.5 rounded-lg transition-colors ${
                  dark
                    ? 'text-indigo-400 hover:bg-indigo-900/30'
                    : 'text-indigo-400 hover:bg-indigo-50'
                }`}
                title="Назначить сотрудника"
              >
                <Users size={13} />
              </button>
              <button
                onClick={() => setEditing(true)}
                className={`p-1.5 rounded-lg transition-colors ${
                  dark
                    ? 'text-gray-500 hover:bg-gray-700'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={handleDelete}
                className={`p-1.5 rounded-lg transition-colors ${
                  dark
                    ? 'text-gray-600 hover:text-red-400'
                    : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>
      </If>
    </motion.div>
  );
};
