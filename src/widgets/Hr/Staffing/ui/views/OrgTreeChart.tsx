import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Plus, ChevronDown, LayoutGrid, Star } from 'lucide-react';
import { ISubOrganization, IEmployee, IStaffingDepartment, DEPT_COLORS } from '../../model';
import { calcOrgTotals, getOccupancyColor } from '../../lib';
import { If } from '@shared/ui/If';

export interface IOrgTreeChartProps {
  organizations: ISubOrganization[];
  employees: IEmployee[];
  dark?: boolean;
  onAddOrg: () => void;
  onEditOrg: (org: ISubOrganization) => void;
  onAddDept: (orgId: number) => void;
}

export const OrgTreeChart = ({
  organizations,
  employees,
  dark = false,
  onAddOrg,
  onEditOrg,
  onAddDept,
}: IOrgTreeChartProps) => {
  const [expandedOrgs, setExpandedOrgs] = useState<Set<number>>(
    new Set(organizations.map((o) => o.id))
  );
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
  const [selectedNode, setSelectedNode] = useState<{
    type: 'org' | 'dept';
    id: number;
  } | null>(null);

  const containerBg = dark ? 'bg-gray-900/60 border-gray-700/60' : 'bg-white border-gray-100';
  const cardBg = dark ? 'bg-gray-800 border-gray-700/60' : 'bg-white border-gray-200';
  const deptCardBg = dark ? 'bg-gray-800/80 border-gray-700/40' : 'bg-slate-50 border-gray-100';
  const lineColor = dark ? '#374151' : '#e2e8f0';
  const connectorColor = dark ? '#4b5563' : '#c7d2fe';

  if (organizations.length === 0) {
    return (
      <div
        className={`rounded-2xl border shadow-sm flex flex-col items-center justify-center py-20 gap-5 ${containerBg}`}
      >
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
          <GitBranch size={28} className="text-indigo-400" />
        </div>
        <div className="text-center">
          <p className={`text-base font-bold mb-1 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
            Структура пустая
          </p>
          <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            Добавьте организацию для построения иерархии
          </p>
        </div>
        <button
          onClick={onAddOrg}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
        >
          <Plus size={15} />
          <span>Добавить организацию</span>
        </button>
      </div>
    );
  }

  const toggleOrg = (id: number) =>
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleDept = (id: number) =>
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const getOrgAvatar = (org: ISubOrganization) => {
    if (org.curatorId) {
      const emp = employees.find((e) => e.id === org.curatorId);
      if (emp) {
        return {
          photo: emp.avatarPhoto,
          initials: emp.avatarInitials,
          color: emp.avatarColor,
          name: `${emp.lastName} ${emp.firstName}`,
        };
      }
    }
    return null;
  };

  const getDeptAvatar = (dept: IStaffingDepartment) => {
    if (dept.managerId) {
      const emp = employees.find((e) => e.id === dept.managerId);
      if (emp) {
        return {
          photo: emp.avatarPhoto,
          initials: emp.avatarInitials,
          color: emp.avatarColor,
          name: `${emp.lastName} ${emp.firstName}`,
        };
      }
    }
    return null;
  };

  const renderDeptNode = (
    dept: IStaffingDepartment,
    allDepts: IStaffingDepartment[],
    orgId: number,
    depth: number,
    colorIdx: number
  ): React.ReactNode => {
    const children = allDepts.filter((d) => d.parentDeptId === dept.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedDepts.has(dept.id);
    const isSelected = selectedNode?.type === 'dept' && selectedNode.id === dept.id;

    const dSlots = dept.positions.reduce((s, p) => s + p.slots, 0);
    const dOcc = dept.positions.reduce((s, p) => s + p.occupied, 0);
    const dPct = dSlots > 0 ? Math.round((dOcc / dSlots) * 100) : 0;
    const dColors = getOccupancyColor(dPct);

    const bColor = DEPT_COLORS[colorIdx % DEPT_COLORS.length];
    const dAv = getDeptAvatar(dept);
    const cardW = Math.max(120, 150 - depth * 6);

    return (
      <div key={dept.id} className="flex flex-col items-center">
        <div className="w-0.5 h-6" style={{ backgroundColor: connectorColor }} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <motion.div
            onClick={() =>
              setSelectedNode(isSelected ? null : { type: 'dept', id: dept.id })
            }
            className={`cursor-pointer rounded-xl border shadow-sm transition-all select-none ${deptCardBg}`}
            style={{
              borderColor: isSelected ? bColor : dark ? '#374151' : '#e2e8f0',
              borderTopColor: bColor,
              borderTopWidth: 3,
              width: cardW,
            }}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <div className="px-2.5 py-2.5 flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center"
                style={{
                  borderColor: bColor + '80',
                  backgroundColor: bColor + (dark ? '40' : '25'),
                }}
              >
                {dAv ? (
                  <img
                    src={dAv.photo}
                    alt={dAv.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <LayoutGrid size={14} style={{ color: bColor }} />
                )}
              </div>
              <div
                className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: bColor + '22', color: bColor }}
              >
                {depth > 0 ? 'Подотдел' : 'Отдел'}
              </div>
              <p
                className={`text-[11px] font-semibold text-center leading-tight ${
                  dark ? 'text-gray-200' : 'text-gray-700'
                }`}
                style={{ maxWidth: cardW - 16 }}
              >
                {dept.name.length > 18 ? dept.name.slice(0, 16) + '…' : dept.name}
              </p>
              <If is={!!dAv}>
                <p
                  className={`text-[9px] text-center leading-tight ${
                    dark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {dAv!.name.length > 16 ? dAv!.name.slice(0, 14) + '…' : dAv!.name}
                </p>
              </If>
              <If is={dSlots > 0}>
                <div
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    dark ? dColors.darkBadge : dColors.badge
                  }`}
                >
                  {dPct}%
                </div>
              </If>
              <p className={`text-[9px] ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                {dept.positions.length} должн.
              </p>
            </div>
            <If is={hasChildren}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDept(dept.id);
                }}
                className={`w-full flex items-center justify-center py-1 border-t text-[9px] font-semibold gap-1 transition-colors ${
                  dark
                    ? 'border-gray-700 text-gray-500 hover:text-indigo-400 hover:bg-gray-700/50'
                    : 'border-gray-100 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50'
                }`}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.18 }}
                >
                  <ChevronDown size={10} />
                </motion.div>
                <span>{children.length} подотд.</span>
              </button>
            </If>
          </motion.div>
          <button
            onClick={() => onAddDept(orgId)}
            className={`mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed text-[9px] font-medium transition-all ${
              dark
                ? 'border-indigo-700/40 text-indigo-500 hover:border-indigo-500 hover:bg-indigo-900/20'
                : 'border-indigo-200 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
          >
            <Plus size={8} />
            <span>Подотдел</span>
          </button>
        </motion.div>
        <AnimatePresence>
          <If is={hasChildren && isExpanded}>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4" style={{ backgroundColor: connectorColor }} />
                <If is={children.length > 1}>
                  <div style={{ position: 'relative', height: 2, width: '100%' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: `calc(50% - ${(children.length - 1) * ((cardW + 16) / 2)}px)`,
                        width: `${(children.length - 1) * (cardW + 16)}px`,
                        height: 2,
                        backgroundColor: connectorColor,
                      }}
                    />
                  </div>
                </If>
                <div className="flex items-start gap-4">
                  {children.map((child, ci) => (
                    <div key={child.id}>
                      {renderDeptNode(
                        child,
                        allDepts,
                        orgId,
                        depth + 1,
                        (colorIdx + ci + 1) % DEPT_COLORS.length
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </If>
        </AnimatePresence>
        <AnimatePresence>
          <If is={isSelected && dept.positions.length > 0}>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="w-0.5 h-3 mx-auto" style={{ backgroundColor: connectorColor }} />
              <div
                className="rounded-xl border shadow-sm p-2 space-y-1"
                style={{
                  width: cardW,
                  borderColor: dark ? '#374151' : '#e2e8f0',
                  backgroundColor: dark ? '#1e293b' : '#f8fafc',
                }}
              >
                {dept.positions.slice(0, 5).map((pos) => {
                  const pp = pos.slots > 0 ? Math.round((pos.occupied / pos.slots) * 100) : 0;
                  const pc = getOccupancyColor(pp);
                  return (
                    <div
                      key={pos.id}
                      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg ${
                        dark ? 'bg-gray-800' : 'bg-white'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          pp >= 100
                            ? 'bg-emerald-400'
                            : pp >= 60
                            ? 'bg-indigo-400'
                            : pp >= 30
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      <p
                        className={`text-[9px] font-medium flex-1 truncate ${
                          dark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {pos.name}
                      </p>
                      <span className={`text-[8px] font-bold ${dark ? pc.darkText : pc.text}`}>
                        {pp}%
                      </span>
                    </div>
                  );
                })}
                <If is={dept.positions.length > 5}>
                  <p
                    className={`text-[9px] text-center ${dark ? 'text-gray-600' : 'text-gray-400'}`}
                  >
                    +{dept.positions.length - 5} ещё
                  </p>
                </If>
              </div>
            </motion.div>
          </If>
        </AnimatePresence>
      </div>
    );
  };

  const renderOrgBlock = (org: ISubOrganization, isMain: boolean): React.ReactNode => {
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
            setSelectedNode({ type: 'org', id: org.id });
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
              toggleOrg(org.id);
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
                      {renderDeptNode(dept, org.departments, org.id, 0, dIdx)}
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
  };

  const mainOrg = organizations.find((o) => o.isMain) ?? organizations[0];
  const otherOrgs = organizations.filter((o) => o.id !== mainOrg?.id);

  return (
    <div className={`rounded-2xl border shadow-sm overflow-auto ${containerBg}`}>
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
      <div className="p-6 overflow-x-auto">
        <If is={!!mainOrg}>
          <div
            className="flex flex-col items-center gap-0"
            style={{
              minWidth: Math.max(
                800,
                organizations.reduce(
                  (s, o) =>
                    s +
                    Math.max(
                      1,
                      o.departments.filter((d) => d.parentDeptId === null).length
                    ),
                  0
                ) * 170
              ),
            }}
          >
            {renderOrgBlock(mainOrg, mainOrg.isMain)}
            <If is={otherOrgs.length > 0}>
              <div className="mt-12 w-full">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="flex-1 h-px" style={{ backgroundColor: lineColor }} />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest px-2 ${
                      dark ? 'text-gray-600' : 'text-gray-300'
                    }`}
                  >
                    Подведомственные организации
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: lineColor }} />
                </div>
                <div className="flex flex-wrap gap-10 justify-center">
                  {otherOrgs.map((org) => renderOrgBlock(org, false))}
                </div>
              </div>
            </If>
          </div>
        </If>
      </div>
    </div>
  );
};
