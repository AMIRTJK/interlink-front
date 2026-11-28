import React from 'react';
import { UserCircle2, Pencil, ChevronDown, X } from 'lucide-react';
import { If } from '@shared/ui/If';
import { MiniAvatar } from '../../components/MiniAvatar';
import type { IEmployee } from '../../../model';

interface IProps {
  dark: boolean;
  selectedManagerEmp: IEmployee | null;
  onClear: () => void;
  onOpenPicker: () => void;
}

export function AddDeptManagerSlot({
  dark,
  selectedManagerEmp,
  onClear,
  onOpenPicker,
}: IProps) {
  const labelCls = dark ? 'text-gray-400' : 'text-gray-500';
  const personBtnCls = dark
    ? 'border-th-high bg-th-raised text-gray-400 hover:border-th-accent-600'
    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-th-accent-300';
  const personSelectedCls = dark
    ? 'border-th-accent-600/50 bg-th-accent-900/20'
    : 'border-th-accent-200 bg-th-accent-50';
  const personNameCls = dark ? 'text-th-accent-300' : 'text-th-accent-800';
  const personSubCls = dark ? 'text-th-accent-400/70' : 'text-th-accent-600/70';
  const personActionCls = dark
    ? 'text-th-accent-400 hover:bg-th-accent-900/40'
    : 'text-th-accent-500 hover:bg-th-accent-100';

  return (
    <div>
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
      >
        <span className="flex items-center gap-1.5">
          <UserCircle2 size={11} />
          <span>Руководитель отдела</span>
        </span>
      </label>
      <If is={!!selectedManagerEmp}>
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${personSelectedCls}`}
        >
          <MiniAvatar
            photo={selectedManagerEmp?.avatarPhoto}
            initials={selectedManagerEmp?.avatarInitials}
            color={selectedManagerEmp?.avatarColor}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${personNameCls}`}>
              {selectedManagerEmp?.lastName} {selectedManagerEmp?.firstName}
            </p>
            <p className={`text-xs truncate ${personSubCls}`}>
              {selectedManagerEmp?.position}
            </p>
          </div>
          <button
            onClick={onClear}
            className={`p-1 rounded-lg transition-colors ${personActionCls}`}
          >
            <X size={13} />
          </button>
          <button
            onClick={onOpenPicker}
            className={`p-1 rounded-lg transition-colors ${personActionCls}`}
          >
            <Pencil size={13} />
          </button>
        </div>
      </If>
      <If is={!selectedManagerEmp}>
        <button
          type="button"
          onClick={onOpenPicker}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${personBtnCls}`}
        >
          <UserCircle2
            size={16}
            className={dark ? 'text-gray-500' : 'text-gray-400'}
          />
          <span className={dark ? 'text-gray-500' : 'text-gray-400'}>
            Выбрать руководителя
          </span>
          <ChevronDown
            size={14}
            className={`ml-auto ${dark ? 'text-gray-600' : 'text-gray-300'}`}
          />
        </button>
      </If>
    </div>
  );
}
