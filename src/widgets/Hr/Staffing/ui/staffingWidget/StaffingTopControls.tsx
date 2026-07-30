import React from 'react';
import { Search, Plus, List, LayoutGrid, GitBranch, Network } from 'lucide-react';
import type { TStaffingViewMode } from '../../model';

interface IProps {
  dark?: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  viewMode: TStaffingViewMode;
  onViewModeChange: (mode: TStaffingViewMode) => void;
  orgCount: number;
  totalPositions: number;
  onAddOrg: () => void;
}

export function StaffingTopControls({
  dark = false,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  orgCount,
  totalPositions,
  onAddOrg,
}: IProps) {
  const searchBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-600'
    : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400';
  const searchIcon = dark ? 'text-gray-500' : 'text-gray-400';
  const viewToggleBg = dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white';
  const countText = dark ? 'text-gray-500' : 'text-gray-400';

  const viewToggleActive = (mode: TStaffingViewMode) =>
    viewMode === mode
      ? 'bg-indigo-600 text-white shadow-sm'
      : dark
      ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50';

  const viewModes = [
    { mode: 'list' as const, Icon: List, label: 'Список' },
    { mode: 'grid' as const, Icon: LayoutGrid, label: 'Сетка' },
    { mode: 'tree' as const, Icon: GitBranch, label: 'Дерево' },
    { mode: 'bubble' as const, Icon: Network, label: 'Пузыри' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search
          size={14}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${searchIcon}`}
        />
        <input
          type="text"
          placeholder="Поиск организаций, отделов..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${searchBg}`}
        />
      </div>
      <div className={`flex items-center rounded-xl border p-1 gap-0.5 ${viewToggleBg}`}>
        {viewModes.map(({ mode, Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            title={label}
            className={`p-2 rounded-lg transition-all ${viewToggleActive(mode)}`}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className={`text-xs hidden sm:block ${countText}`}>
          {orgCount} орг. · {totalPositions} должн.
        </span>
        <button
          onClick={onAddOrg}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md ${
            dark ? 'shadow-indigo-900/30' : 'shadow-indigo-200'
          }`}
        >
          <Plus size={15} />
          <span>Организация</span>
        </button>
      </div>
    </div>
  );
}
