import React, { useState } from 'react';
import type { ISubOrganization, IEmployee, IAssignedEmployee } from '../../model';
import { EmptyBubbleState } from './bubbleView/EmptyBubbleState';
import { BubbleLegend } from './bubbleView/BubbleLegend';
import { OrgBubbleNode } from './bubbleView/OrgBubbleNode';

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
      <EmptyBubbleState
        containerBg={containerBg}
        dark={dark}
        onAddOrg={onAddOrg}
      />
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
          const isHovered = hoveredOrg === org.id;
          const isSelected = selectedOrg === org.id;

          return (
            <OrgBubbleNode
              key={org.id}
              org={org}
              cx={cx}
              cy={cy}
              orgRadius={orgRadius}
              employeeOrbitRadius={employeeOrbitRadius}
              employeeAvatarSize={employeeAvatarSize}
              orgEmps={orgEmps}
              isHovered={isHovered}
              isSelected={isSelected}
              dark={dark}
              onHover={setHoveredOrg}
              onSelect={(id) => setSelectedOrg(selectedOrg === id ? null : id)}
            />
          );
        })}
      </svg>
      <BubbleLegend dark={dark} />
    </div>
  );
};
