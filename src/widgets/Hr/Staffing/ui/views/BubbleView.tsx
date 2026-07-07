import React, { useState } from 'react';
import { Network, Plus } from 'lucide-react';
import { ISubOrganization, IEmployee, IAssignedEmployee } from '../../model';
import { calcOrgTotals } from '../../lib';
import { If } from '@shared/ui/If';

export interface IBubbleViewProps {
  organizations: ISubOrganization[];
  employees: IEmployee[];
  dark?: boolean;
  onAddOrg: () => void;
}

export const BubbleView = ({
  organizations,
  employees,
  dark = false,
  onAddOrg,
}: IBubbleViewProps) => {
  const [hoveredOrg, setHoveredOrg] = useState<number | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);

  const containerBg = dark
    ? 'bg-gray-900/60 border-gray-700/60'
    : 'bg-gradient-to-br from-slate-50 to-indigo-50/30 border-gray-100';

  if (organizations.length === 0) {
    return (
      <div
        className={`rounded-2xl border shadow-sm flex flex-col items-center justify-center py-20 gap-5 ${containerBg}`}
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
            <Network size={32} className="text-indigo-400" />
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg absolute -bottom-1 -right-1">
            <Plus size={14} className="text-white" />
          </div>
        </div>
        <div className="text-center">
          <p className={`text-base font-bold mb-1 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
            Нет организаций
          </p>
          <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            Добавьте организацию для отображения структуры
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

  const orgRadius = 44;
  const employeeOrbitRadius = 90;
  const employeeAvatarSize = 28;
  const svgPadding = 110;
  const cols = Math.min(organizations.length, 3);
  const rows = Math.ceil(organizations.length / cols);
  const cellW = 260;
  const cellH = 240;
  const svgW = Math.max(600, cols * cellW + svgPadding * 2);
  const svgH = Math.max(400, rows * cellH + svgPadding * 2);

  const orgPositions = organizations.map((org, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      org,
      cx: svgPadding + col * cellW + cellW / 2,
      cy: svgPadding + row * cellH + cellH / 2,
    };
  });

  const getSampleEmployees = (org: ISubOrganization) => {
    const seen = new Set<number>();
    const result: IAssignedEmployee[] = [];
    org.departments.forEach((d) =>
      d.positions.forEach((p) =>
        p.assignedEmployees.forEach((ae) => {
          if (!seen.has(ae.id)) {
            seen.add(ae.id);
            result.push(ae);
          }
        })
      )
    );
    const assigned = result.slice(0, 8);
    if (assigned.length >= 3) return assigned;

    const extra = employees.slice(0, 8 - assigned.length).map((e) => ({
      id: e.id,
      name: `${e.lastName} ${e.firstName}`,
      initials: e.avatarInitials,
      color: e.avatarColor,
      photo: e.avatarPhoto,
    }));
    const allIds = new Set(assigned.map((a) => a.id));
    return [...assigned, ...extra.filter((e) => !allIds.has(e.id))].slice(0, 8);
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-auto ${containerBg}`}
      style={{ minHeight: 420 }}
    >
      <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ minWidth: svgW }}>
        <defs>
          {orgPositions.map(({ org }) => (
            <radialGradient key={`bg-${org.id}`} id={`orgGrad-${org.id}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor={org.isMain ? '#f59e0b' : org.color} stopOpacity="1" />
              <stop offset="100%" stopColor={org.isMain ? '#b45309' : org.color} stopOpacity="0.8" />
            </radialGradient>
          ))}
          <filter id="shadowBlob" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.18" />
          </filter>
          <filter id="shadowAvatar" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.22" />
          </filter>
        </defs>

        {orgPositions.map(({ org, cx, cy }) => {
          const orgEmps = getSampleEmployees(org);
          const totals = calcOrgTotals(org);
          const pct = totals.slots > 0 ? Math.round((totals.occupied / totals.slots) * 100) : 0;
          const isHovered = hoveredOrg === org.id;
          const isSelected = selectedOrg === org.id;
          const circleR = isHovered || isSelected ? orgRadius + 4 : orgRadius;
          const orbitR = isHovered || isSelected ? employeeOrbitRadius + 8 : employeeOrbitRadius;
          const deptDotsLen = org.departments.slice(0, 4).length;

          return (
            <g key={org.id}>
              <circle
                cx={cx}
                cy={cy}
                r={orbitR}
                fill="none"
                stroke={dark ? '#1e293b' : '#e2e8f0'}
                strokeWidth="1"
                strokeDasharray="3 5"
                opacity={isHovered || isSelected ? 0.6 : 0.35}
              />
              {orgEmps.map((emp, i) => {
                const angle = (i / orgEmps.length) * 2 * Math.PI - Math.PI / 2;
                const ex = cx + orbitR * Math.cos(angle);
                const ey = cy + orbitR * Math.sin(angle);
                const hr = employeeAvatarSize / 2;
                return (
                  <g key={emp.id} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={ex}
                      cy={ey}
                      r={hr + 1.5}
                      fill={dark ? '#1e293b' : 'white'}
                      filter="url(#shadowAvatar)"
                    />
                    <circle cx={ex} cy={ey} r={hr} fill={emp.color} />
                    <text
                      x={ex}
                      y={ey}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="9"
                      fontWeight="700"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {emp.initials}
                    </text>
                  </g>
                );
              })}

              <If is={isSelected || isHovered}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={circleR + 6}
                  fill="none"
                  stroke={org.isMain ? '#f59e0b' : org.color}
                  strokeWidth="2"
                  opacity="0.3"
                />
              </If>

              <circle
                cx={cx}
                cy={cy}
                r={circleR}
                fill={`url(#orgGrad-${org.id})`}
                filter="url(#shadowBlob)"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredOrg(org.id)}
                onMouseLeave={() => setHoveredOrg(null)}
                onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
              />

              <circle
                cx={cx + orgRadius - 2}
                cy={cy - orgRadius + 2}
                r={11}
                fill={dark ? '#1e293b' : 'white'}
              />
              <text
                x={cx + orgRadius - 2}
                y={cy - orgRadius + 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={org.isMain ? '#d97706' : org.color}
                fontSize="9"
                fontWeight="800"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {org.departments.length}
              </text>

              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="12"
                fontWeight="800"
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  letterSpacing: '-0.5px',
                }}
              >
                {org.shortName.slice(0, 3)}
              </text>
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(255,255,255,0.85)"
                fontSize="10"
                fontWeight="600"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {pct}%
              </text>

              {org.departments.slice(0, 4).map((dept, di) => {
                const dSlots = dept.positions.reduce((s, p) => s + p.slots, 0);
                const dOcc = dept.positions.reduce((s, p) => s + p.occupied, 0);
                const dp = dSlots > 0 ? Math.round((dOcc / dSlots) * 100) : 0;
                const dotColor =
                  dp >= 100
                    ? '#10b981'
                    : dp >= 60
                    ? '#6366f1'
                    : dp >= 30
                    ? '#f59e0b'
                    : '#f43f5e';
                const dotX = cx - (deptDotsLen - 1) * 5 + di * 10;
                return (
                  <circle
                    key={dept.id}
                    cx={dotX}
                    cy={cy + orgRadius + 12}
                    r={4}
                    fill={dotColor}
                    opacity="0.9"
                  />
                );
              })}

              <text
                x={cx}
                y={cy + orgRadius + 30}
                textAnchor="middle"
                dominantBaseline="hanging"
                fill={dark ? '#d1d5db' : '#374151'}
                fontSize="11"
                fontWeight="600"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {org.name.length > 22 ? org.name.slice(0, 20) + '…' : org.name}
              </text>

              <If is={isSelected}>
                <g>
                  <rect
                    x={cx - 72}
                    y={cy + orgRadius + 48}
                    width={144}
                    height={36}
                    rx={10}
                    fill={dark ? '#1e293b' : 'white'}
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }}
                  />
                  <text
                    x={cx - 48}
                    y={cy + orgRadius + 60}
                    fill={dark ? '#6ee7b7' : '#10b981'}
                    fontSize="10"
                    fontWeight="700"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {totals.occupied}/{totals.slots}
                  </text>
                  <text
                    x={cx - 48}
                    y={cy + orgRadius + 74}
                    fill={dark ? '#94a3b8' : '#6b7280'}
                    fontSize="9"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    ставок
                  </text>
                  <text
                    x={cx + 8}
                    y={cy + orgRadius + 60}
                    fill={dark ? '#fcd34d' : '#d97706'}
                    fontSize="10"
                    fontWeight="700"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {totals.vacant}
                  </text>
                  <text
                    x={cx + 8}
                    y={cy + orgRadius + 74}
                    fill={dark ? '#94a3b8' : '#6b7280'}
                    fontSize="9"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    вакант.
                  </text>
                </g>
              </If>
            </g>
          );
        })}
      </svg>
      <div
        className={`px-5 pb-4 pt-2 flex items-center gap-4 flex-wrap text-xs ${
          dark ? 'text-gray-500' : 'text-gray-400'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>100% — заполнено</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
          <span>60–99% — норма</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>30–59% — частично</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
          <span>{'<'}30% — критично</span>
        </span>
        <span className={`ml-auto text-[10px] ${dark ? 'text-gray-600' : 'text-gray-300'}`}>
          Нажмите на пузырь для деталей
        </span>
      </div>
    </div>
  );
};
