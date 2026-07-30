import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Star } from 'lucide-react';
import { ISubOrganization, IStaffingDepartment } from '../../../model';
import { calcOrgTotals, getOccupancyColor } from '../../../lib';
import { If } from '@shared/ui/If';
import { OrgTreeNodeDept } from './OrgTreeNodeDept';

interface IProps {
  org: ISubOrganization;
  isMain: boolean;
  dark?: boolean;
  cardBg: string;
  deptCardBg: string;
  connectorColor: string;
  expandedOrgs: Set<number>;
  expandedDepts: Set<number>;
  selectedNode: { type: 'org' | 'dept'; id: number } | null;
  onToggleOrg: (id: number) => void;
  onToggleDept: (id: number) => void;
  onSelectNode: (node: { type: 'org' | 'dept'; id: number } | null) => void;
  onEditOrg: (org: ISubOrganization) => void;
  onAddDept: (orgId: number) => void;
  getOrgAvatar: (org: ISubOrganization) => {
    photo?: string;
    initials?: string;
    color?: string;
    name: string;
  } | null;
  getDeptAvatar: (dept: IStaffingDepartment) => {
    photo?: string;
    initials?: string;
    color?: string;
    name: string;
  } | null;
}

export function OrgTreeNodeCard({
  org,
  isMain,
  dark = false,
  cardBg,
  deptCardBg,
  connectorColor,
  expandedOrgs,
  expandedDepts,
  selectedNode,
  onToggleOrg,
  onToggleDept,
  onSelectNode,
  onEditOrg,
  onAddDept,
  getOrgAvatar,
  getDeptAvatar,
}: IProps) {
  const totals = calcOrgTotals(org);
  const pct = totals.slots > 0 ? Math.round((totals.occupied / totals.slots) * 100) : 0;
  const colors = getOccupancyColor(pct);
  const av = getOrgAvatar(org);
  const isExpanded = expandedOrgs.has(org.id);
  const isSelOrg = selectedNode?.id === org.id && selectedNode.type === 'org';
  const rootDepts = org.departments.filter((d) => d.parentDeptId === null);

  return (
    <div className="flex flex-col items-center" key={org.id}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => {
          onEditOrg(org);
          onSelectNode({ type: 'org', id: org.id });
        }}
        className={`relative cursor-pointer rounded-2xl border-2 shadow-lg transition-all select-none ${cardBg} ${
          isSelOrg ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
        }`}
        style={{ borderColor: isMain ? '#f59e0b' : org.color, width: 148 }}
      >
        <div
          className="h-1.5 rounded-t-xl"
          style={{
            background: isMain
              ? 'linear-gradient(90deg,#f59e0b,#d97706)'
              : `linear-gradient(90deg,${org.color},${org.color}cc)`,
          }}
        />
        <div className="px-3 py-3 flex flex-col items-center gap-2">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-md flex items-center justify-center text-white text-lg font-bold"
              style={{
                borderColor: isMain ? '#f59e0b' : org.color,
                backgroundColor: isMain ? '#d97706' : org.color,
              }}
            >
              {av ? (
                <img
                  src={av.photo}
                  alt={av.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-sm font-bold">{org.shortName.slice(0, 2)}</span>
              )}
            </div>
            <If is={isMain}>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                <Star size={9} className="text-amber-900" fill="currentColor" />
              </div>
            </If>
          </div>
          <div className="text-center">
            <p
              className={`text-xs font-bold leading-tight ${
                dark ? 'text-gray-100' : 'text-gray-800'
              }`}
              style={{ maxWidth: 120 }}
            >
              {org.name.length > 20 ? org.name.slice(0, 18) + '…' : org.name}
            </p>
            <p className={`text-[10px] mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              {org.type}
            </p>
          </div>
          <If is={totals.slots > 0}>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                dark ? colors.darkBadge : colors.badge
              }`}
            >
              <span>{pct}%</span>
              <span className="opacity-60">·</span>
              <span>
                {totals.occupied}/{totals.slots}
              </span>
            </div>
          </If>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleOrg(org.id);
          }}
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors z-10 ${
            dark
              ? 'bg-gray-800 border-gray-600 text-gray-400 hover:border-indigo-500'
              : 'bg-white border-gray-200 text-gray-400 hover:border-indigo-400'
          }`}
        >
          <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} />
          </motion.div>
        </button>
      </motion.div>
      <AnimatePresence>
        <If is={isExpanded}>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center overflow-hidden"
          >
            <div className="w-0.5 h-8" style={{ backgroundColor: connectorColor }} />
            <If is={rootDepts.length > 1}>
              <div style={{ position: 'relative', height: 2, width: '100%' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(50% - ${(rootDepts.length - 1) * 90}px)`,
                    width: `${(rootDepts.length - 1) * 180}px`,
                    height: 2,
                    backgroundColor: connectorColor,
                  }}
                />
              </div>
            </If>
            {rootDepts.length > 0 ? (
              <div className="flex items-start gap-6 mt-0">
                {rootDepts.map((dept, dIdx) => (
                  <div key={dept.id}>
                    <OrgTreeNodeDept
                      dept={dept}
                      allDepts={org.departments}
                      orgId={org.id}
                      depth={0}
                      colorIdx={dIdx}
                      dark={dark}
                      deptCardBg={deptCardBg}
                      connectorColor={connectorColor}
                      expandedDepts={expandedDepts}
                      selectedNode={selectedNode}
                      onToggleDept={onToggleDept}
                      onSelectNode={onSelectNode}
                      getDeptAvatar={getDeptAvatar}
                      onAddDept={onAddDept}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4" style={{ backgroundColor: connectorColor }} />
              </div>
            )}
            <button
              onClick={() => onAddDept(org.id)}
              className={`mt-5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed text-xs font-medium transition-all ${
                dark
                  ? 'border-indigo-700/50 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20'
                  : 'border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/50'
              }`}
            >
              <Plus size={12} />
              <span>Добавить отдел</span>
            </button>
          </motion.div>
        </If>
        <If is={!isExpanded && org.departments.length === 0}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center mt-6"
          >
            <button
              onClick={() => onAddDept(org.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed text-xs font-medium transition-all ${
                dark
                  ? 'border-indigo-700/50 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20'
                  : 'border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/50'
              }`}
            >
              <Plus size={12} />
              <span>Добавить отдел</span>
            </button>
          </motion.div>
        </If>
      </AnimatePresence>
    </div>
  );
}
