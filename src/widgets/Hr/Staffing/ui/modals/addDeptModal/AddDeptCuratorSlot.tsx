import React from 'react';
import { Shield, Pencil, ChevronDown, X } from 'lucide-react';
import { If } from '@shared/ui/If';
import { MiniAvatar } from '../../components/MiniAvatar';
import type { IEmployee } from '../../../model';

interface IProps {
  dark: boolean;
  selectedCuratorEmp: IEmployee | null;
  onClear: () => void;
  onOpenPicker: () => void;
}

export function AddDeptCuratorSlot({
  dark,
  selectedCuratorEmp,
  onClear,
  onOpenPicker,
}: IProps) {
  const labelCls = dark ? 'text-gray-400' : 'text-gray-500';
  const personBtnCls = dark
    ? 'border-gray-700 bg-gray-800 text-gray-400 hover:border-indigo-600'
    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-300';
  const personSelectedCls = dark
    ? 'border-indigo-600/50 bg-indigo-900/20'
    : 'border-indigo-200 bg-indigo-50';
  const personNameCls = dark ? 'text-indigo-300' : 'text-indigo-800';
  const personSubCls = dark ? 'text-indigo-400/70' : 'text-indigo-600/70';
  const personActionCls = dark
    ? 'text-indigo-400 hover:bg-indigo-900/40'
    : 'text-indigo-500 hover:bg-indigo-100';

  return (
    <div>
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
      >
        <span className="flex items-center gap-1.5">
          <Shield size={11} />
          <span>Куратор отдела</span>
        </span>
      </label>
      <If is={!!selectedCuratorEmp}>
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${personSelectedCls}`}
        >
          <MiniAvatar
            photo={selectedCuratorEmp?.avatarPhoto}
            initials={selectedCuratorEmp?.avatarInitials}
            color={selectedCuratorEmp?.avatarColor}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${personNameCls}`}>
              {selectedCuratorEmp?.lastName} {selectedCuratorEmp?.firstName}
            </p>
            <p className={`text-xs truncate ${personSubCls}`}>
              {selectedCuratorEmp?.position}
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
      <If is={!selectedCuratorEmp}>
        <button
          type="button"
          onClick={onOpenPicker}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${personBtnCls}`}
        >
          <Shield size={16} className={dark ? 'text-gray-500' : 'text-gray-400'} />
          <span className={dark ? 'text-gray-500' : 'text-gray-400'}>
            Выбрать куратора
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
