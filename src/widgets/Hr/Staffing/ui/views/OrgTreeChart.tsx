import React from 'react';
import { ISubOrganization, IEmployee } from '../../model';
import { If } from '@shared/ui/If';
import { useOrgTreeChartState } from './orgTreeChart/useOrgTreeChartState';
import { EmptyOrgTreeState } from './orgTreeChart/EmptyOrgTreeState';
import { OrgTreeChartHeader } from './orgTreeChart/OrgTreeChartHeader';
import { OrgTreeNodeCard } from './orgTreeChart/OrgTreeNodeCard';

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
  const {
    expandedOrgs,
    expandedDepts,
    selectedNode,
    setSelectedNode,
    toggleOrg,
    toggleDept,
    getOrgAvatar,
    getDeptAvatar,
  } = useOrgTreeChartState(organizations, employees);

  const containerBg = dark ? 'bg-gray-900/60 border-gray-700/60' : 'bg-white border-gray-100';
  const cardBg = dark ? 'bg-gray-800 border-gray-700/60' : 'bg-white border-gray-200';
  const deptCardBg = dark ? 'bg-gray-800/80 border-gray-700/40' : 'bg-slate-50 border-gray-100';
  const lineColor = dark ? '#374151' : '#e2e8f0';
  const connectorColor = dark ? '#4b5563' : '#c7d2fe';

  if (organizations.length === 0) {
    return <EmptyOrgTreeState dark={dark} onAddOrg={onAddOrg} />;
  }

  const mainOrg = organizations.find((o) => o.isMain) ?? organizations[0];
  const otherOrgs = organizations.filter((o) => o.id !== mainOrg?.id);

  return (
    <div className={`rounded-2xl border shadow-sm overflow-auto ${containerBg}`}>
      <OrgTreeChartHeader
        organizations={organizations}
        dark={dark}
        lineColor={lineColor}
        onAddOrg={onAddOrg}
      />
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
            <OrgTreeNodeCard
              org={mainOrg}
              isMain={mainOrg.isMain}
              dark={dark}
              cardBg={cardBg}
              deptCardBg={deptCardBg}
              connectorColor={connectorColor}
              expandedOrgs={expandedOrgs}
              expandedDepts={expandedDepts}
              selectedNode={selectedNode}
              onToggleOrg={toggleOrg}
              onToggleDept={toggleDept}
              onSelectNode={setSelectedNode}
              onEditOrg={onEditOrg}
              onAddDept={onAddDept}
              getOrgAvatar={getOrgAvatar}
              getDeptAvatar={getDeptAvatar}
            />
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
                  {otherOrgs.map((org) => (
                    <OrgTreeNodeCard
                      key={org.id}
                      org={org}
                      isMain={false}
                      dark={dark}
                      cardBg={cardBg}
                      deptCardBg={deptCardBg}
                      connectorColor={connectorColor}
                      expandedOrgs={expandedOrgs}
                      expandedDepts={expandedDepts}
                      selectedNode={selectedNode}
                      onToggleOrg={toggleOrg}
                      onToggleDept={toggleDept}
                      onSelectNode={setSelectedNode}
                      onEditOrg={onEditOrg}
                      onAddDept={onAddDept}
                      getOrgAvatar={getOrgAvatar}
                      getDeptAvatar={getDeptAvatar}
                    />
                  ))}
                </div>
              </div>
            </If>
          </div>
        </If>
      </div>
    </div>
  );
};
