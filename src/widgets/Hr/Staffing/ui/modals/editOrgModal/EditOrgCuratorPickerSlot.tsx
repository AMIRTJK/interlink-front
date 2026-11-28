import React from 'react';
import { UserCircle2, Pencil, ChevronDown, X } from 'lucide-react';
import { If } from '@shared/ui/If';
import { MiniAvatar } from '../../components/MiniAvatar';
import type { IEmployee } from '../../../model';

interface IProps {
  dark: boolean;
  selectedEmp: IEmployee | null;
  curatorName: string;
  onClear: () => void;
  onOpenPicker: () => void;
}

export const EditOrgCuratorPickerSlot = ({
  dark,
  selectedEmp,
  curatorName,
  onClear,
  onOpenPicker,
}: IProps) => {
  const labelCls = dark ? 'text-gray-400' : 'text-gray-500';
  const curatorBtnCls = dark
    ? 'border-th-high bg-th-raised text-gray-400 hover:border-th-accent-600'
    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-th-accent-300';
  const curatorSelectedCls = dark
    ? 'border-th-accent-600/50 bg-th-accent-900/20'
    : 'border-th-accent-200 bg-th-accent-50';

  return (
    <div>
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
      >
        Куратор
      </label>
      <If is={!!selectedEmp}>
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${curatorSelectedCls}`}
        >
          <MiniAvatar
            photo={selectedEmp?.avatarPhoto}
            initials={selectedEmp?.avatarInitials}
            color={selectedEmp?.avatarColor}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold truncate ${
                dark ? 'text-th-accent-300' : 'text-th-accent-800'
              }`}
            >
              {selectedEmp?.lastName} {selectedEmp?.firstName}
            </p>
            <p
              className={`text-xs truncate ${
                dark ? 'text-th-accent-400/70' : 'text-th-accent-600/70'
              }`}
            >
              {selectedEmp?.position}
            </p>
          </div>
          <button
            onClick={onClear}
            className={`p-1 rounded-lg transition-colors ${
              dark
                ? 'text-th-accent-400 hover:bg-th-accent-900/40'
                : 'text-th-accent-500 hover:bg-th-accent-100'
            }`}
          >
            <X size={13} />
          </button>
          <button
            onClick={onOpenPicker}
            className={`p-1 rounded-lg transition-colors ${
              dark
                ? 'text-th-accent-400 hover:bg-th-accent-900/40'
                : 'text-th-accent-500 hover:bg-th-accent-100'
            }`}
          >
            <Pencil size={13} />
          </button>
        </div>
      </If>
      <If is={!selectedEmp}>
        <button
          type="button"
          onClick={onOpenPicker}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${curatorBtnCls}`}
        >
          <UserCircle2 size={16} className={dark ? 'text-gray-500' : 'text-gray-400'} />
          <span
            className={
              curatorName
                ? dark
                  ? 'text-gray-200'
                  : 'text-gray-700'
                : dark
                ? 'text-gray-500'
                : 'text-gray-400'
            }
          >
            {curatorName || 'Выбрать куратора'}
          </span>
          <ChevronDown
            size={14}
            className={`ml-auto ${dark ? 'text-gray-600' : 'text-gray-300'}`}
          />
        </button>
      </If>
    </div>
  );
};
