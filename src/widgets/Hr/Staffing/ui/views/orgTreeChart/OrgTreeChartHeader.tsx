import React from 'react';
import { GitBranch, Plus } from 'lucide-react';
import type { ISubOrganization } from '../../../model';

interface IProps {
  organizations: ISubOrganization[];
  dark?: boolean;
  lineColor: string;
  onAddOrg: () => void;
}

export function OrgTreeChartHeader({ organizations, dark = false, lineColor, onAddOrg }: IProps) {
  return (
    <div
      className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b"
      style={{ borderColor: lineColor }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <GitBranch size={15} className="text-white" />
        </div>
        <div>
          <p className={`text-sm font-bold ${dark ? 'text-gray-100' : 'text-gray-900'}`}>
            Организационная диаграмма
          </p>
          <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {organizations.length} орг. ·{' '}
            {organizations.reduce((s, o) => s + o.departments.length, 0)} отделов
          </p>
        </div>
      </div>
      <button
        onClick={onAddOrg}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-md"
      >
        <Plus size={13} />
        <span>Организация</span>
      </button>
    </div>
  );
}
