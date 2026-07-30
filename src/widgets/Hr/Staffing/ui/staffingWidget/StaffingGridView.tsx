import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, Pencil, Trash2 } from 'lucide-react';
import { If } from '@shared/ui/If';
import { OccupancyRing } from '../components/OccupancyRing';
import { calcOrgTotals, getOccupancyColor } from '../../lib';
import type { ISubOrganization } from '../../model';

interface IProps {
  filteredOrgs: ISubOrganization[];
  dark?: boolean;
  onAddDept: (orgId: number) => void;
  onEditOrg: (org: ISubOrganization) => void;
}

export function StaffingGridView({
  filteredOrgs,
  dark = false,
  onAddDept,
  onEditOrg,
}: IProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredOrgs.map((org, oIdx) => {
        const totals = calcOrgTotals(org);
        return (
          <motion.div
            key={org.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: oIdx * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
              dark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-100'
            }`}
          >
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${org.color}${dark ? '40' : '18'} 0%, ${
                  org.color
                }${dark ? '22' : '08'} 100%)`,
                borderBottom: `2px solid ${org.color}${dark ? '50' : '30'}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: org.isMain ? '#d97706' : org.color }}
              >
                {org.shortName.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${
                    org.isMain
                      ? dark
                        ? 'text-amber-300'
                        : 'text-amber-800'
                      : dark
                      ? 'text-gray-100'
                      : 'text-gray-900'
                  }`}
                >
                  {org.name}
                </p>
                <p className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {org.type} · {org.departments.length} отд.
                </p>
              </div>
              <OccupancyRing slots={totals.slots} occupied={totals.occupied} size={38} dark={dark} />
            </div>
            <div className="p-3 space-y-2 flex-1">
              {org.departments.slice(0, 4).map((dept) => {
                const dSlots = dept.positions.reduce((s, p) => s + p.slots, 0);
                const dOcc = dept.positions.reduce((s, p) => s + p.occupied, 0);
                return (
                  <div
                    key={dept.id}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${
                      dark ? 'bg-gray-700/50' : 'bg-gray-50/80'
                    }`}
                  >
                    <LayoutGrid size={11} style={{ color: org.color }} className="shrink-0" />
                    <p
                      className={`text-xs font-medium flex-1 truncate ${
                        dark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {dept.name}
                    </p>
                    <span className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {dept.positions.length} должн.
                    </span>
                    <If is={dSlots > 0}>
                      <span
                        className={`text-[10px] font-bold ${
                          dark
                            ? getOccupancyColor(Math.round((dOcc / dSlots) * 100)).darkText
                            : getOccupancyColor(Math.round((dOcc / dSlots) * 100)).text
                        }`}
                      >
                        {Math.round((dOcc / dSlots) * 100)}%
                      </span>
                    </If>
                  </div>
                );
              })}
              <If is={org.departments.length > 4}>
                <p className={`text-[10px] text-center ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                  +{org.departments.length - 4} отделов
                </p>
              </If>
            </div>
            <div className="px-3 pb-3 flex items-center gap-2">
              <button
                onClick={() => onAddDept(org.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                  dark
                    ? 'border-indigo-700/50 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20'
                    : 'border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/50'
                }`}
              >
                <Plus size={12} />
                <span>Отдел</span>
              </button>
              <button
                onClick={() => onEditOrg(org)}
                className={`p-2 rounded-xl border transition-all ${
                  dark
                    ? 'border-gray-700 text-gray-500 hover:text-indigo-400 hover:border-indigo-700/50'
                    : 'border-gray-200 text-gray-400 hover:text-indigo-500 hover:border-indigo-200'
                }`}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => {}}
                className={`p-2 rounded-xl border transition-all ${
                  dark
                    ? 'border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-800/50'
                    : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
