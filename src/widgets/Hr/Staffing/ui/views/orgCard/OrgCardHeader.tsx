import { motion } from 'framer-motion';
import { Star, ChevronDown, Plus, Pencil, Trash2, UserCircle2 } from 'lucide-react';
import { calcOrgTotals, getOccupancyColor } from '../../../lib';
import { ProgressBar } from '../../components/ProgressBar';
import { ISubOrganization } from '../../../model';
import { If } from '@shared/ui/If';
import { IOrgCardTheme } from './orgCardTheme';

interface IProps {
  org: ISubOrganization;
  totals: ReturnType<typeof calcOrgTotals>;
  pct: number;
  colors: ReturnType<typeof getOccupancyColor>;
  dark: boolean;
  theme: IOrgCardTheme;
  expanded: boolean;
  onToggleExpanded: () => void;
  onAddDept: (orgId: number) => void;
  onEditOrg: (org: ISubOrganization) => void;
  onDeleteOrg: (orgId: number) => void;
}

export const OrgCardHeader = ({
  org,
  totals,
  pct,
  colors,
  dark,
  theme,
  expanded,
  onToggleExpanded,
  onAddDept,
  onEditOrg,
  onDeleteOrg,
}: IProps) => (
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
          org.isMain ? theme.nameText : theme.nameTextNormal
        }`}
      >
        {org.name}
      </h3>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className={`text-xs ${theme.subText}`}>
          {org.departments.length} отд. · {totals.positions} должн. · {totals.slots} ставок
        </span>
        <If is={!!org.curatorName}>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium ${theme.curatorText}`}
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
          className={`hidden sm:flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl border ${theme.statBg}`}
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
          className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${theme.addDeptBtn}`}
        >
          <Plus size={12} />
          <span>Отдел</span>
        </button>
        <button
          onClick={() => onEditOrg(org)}
          className={`p-2 rounded-xl transition-colors ${theme.editBtn}`}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDeleteOrg(org.id)}
          className={`p-2 rounded-xl transition-colors ${theme.deleteBtn}`}
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={onToggleExpanded}
          className={`p-2 rounded-xl transition-colors ${theme.chevronBtn}`}
        >
          <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} />
          </motion.div>
        </button>
      </div>
    </div>
  </div>
);
