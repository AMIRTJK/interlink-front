import React from 'react';
import { If } from '@shared/ui/If';
import { calcOrgTotals } from '../../../lib';
import type { ISubOrganization, IAssignedEmployee } from '../../../model';

interface IProps {
  org: ISubOrganization;
  cx: number;
  cy: number;
  orgRadius: number;
  employeeOrbitRadius: number;
  employeeAvatarSize: number;
  orgEmps: IAssignedEmployee[];
  isHovered: boolean;
  isSelected: boolean;
  dark?: boolean;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
}

export function OrgBubbleNode({
  org,
  cx,
  cy,
  orgRadius,
  employeeOrbitRadius,
  employeeAvatarSize,
  orgEmps,
  isHovered,
  isSelected,
  dark = false,
  onHover,
  onSelect,
}: IProps) {
  const totals = calcOrgTotals(org);
  const pct = totals.slots > 0 ? Math.round((totals.occupied / totals.slots) * 100) : 0;
  const circleR = isHovered || isSelected ? orgRadius + 4 : orgRadius;
  const orbitR = isHovered || isSelected ? employeeOrbitRadius + 8 : employeeOrbitRadius;
  const deptDotsLen = org.departments.slice(0, 4).length;

  return (
    <g>
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
        onMouseEnter={() => onHover(org.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onSelect(org.id)}
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
}
