import React from 'react';
import { Pencil, Users, X } from 'lucide-react';
import { If } from '@shared/ui/If';
import { ProgressBar } from '../../components/ProgressBar';
import { MiniAvatar } from '../../components/MiniAvatar';
import type { IStaffingPosition, IAssignModalTarget } from '../../../model';

interface IProps {
  pos: IStaffingPosition;
  index: number;
  orgId: number;
  deptId: number;
  pct: number;
  colors: { badge: string; darkBadge: string };
  dark?: boolean;
  onUnassign: (orgId: number, deptId: number, posId: number, empId: number) => void;
  onOpenAssign: (target: IAssignModalTarget) => void;
  onStartEditing: () => void;
  onDelete: () => void;
}

export function PositionRowDisplayView({
  pos,
  index,
  orgId,
  deptId,
  pct,
  colors,
  dark = false,
  onUnassign,
  onOpenAssign,
  onStartEditing,
  onDelete,
}: IProps) {
  const nameText = dark ? 'text-gray-200' : 'text-gray-800';

  return (
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
                className={`w-px h-6 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}
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
            onClick={onStartEditing}
            className={`p-1.5 rounded-lg transition-colors ${
              dark
                ? 'text-gray-500 hover:bg-gray-700'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
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
  );
}
