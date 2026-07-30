import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, LayoutGrid } from 'lucide-react';
import { IStaffingDepartment, DEPT_COLORS } from '../../../model';
import { getOccupancyColor } from '../../../lib';
import { If } from '@shared/ui/If';

interface IProps {
  dept: IStaffingDepartment;
  allDepts: IStaffingDepartment[];
  orgId: number;
  depth: number;
  colorIdx: number;
  dark?: boolean;
  deptCardBg: string;
  connectorColor: string;
  expandedDepts: Set<number>;
  selectedNode: { type: 'org' | 'dept'; id: number } | null;
  onToggleDept: (id: number) => void;
  onSelectNode: (node: { type: 'org' | 'dept'; id: number } | null) => void;
  getDeptAvatar: (dept: IStaffingDepartment) => {
    photo?: string;
    initials?: string;
    color?: string;
    name: string;
  } | null;
  onAddDept: (orgId: number) => void;
}

export function OrgTreeNodeDept({
  dept,
  allDepts,
  orgId,
  depth,
  colorIdx,
  dark = false,
  deptCardBg,
  connectorColor,
  expandedDepts,
  selectedNode,
  onToggleDept,
  onSelectNode,
  getDeptAvatar,
  onAddDept,
}: IProps): React.ReactElement {
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
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-6" style={{ backgroundColor: connectorColor }} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <motion.div
          onClick={() =>
            onSelectNode(isSelected ? null : { type: 'dept', id: dept.id })
          }
          className={`cursor-pointer rounded-xl border shadow-sm transition-all select-none ${deptCardBg}`}
          style={{
            borderColor: isSelected ? bColor : dark ? '#374151' : '#e2e8f0',
            borderTopColor: bColor,
            borderTopWidth: 3,
            width: cardW,
          }}
          whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
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
                onToggleDept(dept.id);
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
                    <OrgTreeNodeDept
                      dept={child}
                      allDepts={allDepts}
                      orgId={orgId}
                      depth={depth + 1}
                      colorIdx={(colorIdx + ci + 1) % DEPT_COLORS.length}
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
}
