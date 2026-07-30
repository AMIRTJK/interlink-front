import React, { useRef, useState } from 'react';
import { ListView, BubbleView, OrgTreeChart } from './ui/views';
import { EmptyStateIllustration } from './ui/EmptyStateIllustration';
import { If } from '@shared/ui/If';
import { useStaffing } from './useStaffing';
import { StaffingHeaderCard } from './ui/staffingWidget/StaffingHeaderCard';
import { StaffingTopControls } from './ui/staffingWidget/StaffingTopControls';
import { StaffingGridView } from './ui/staffingWidget/StaffingGridView';
import { StaffingPdfViewerModal } from './ui/staffingWidget/StaffingPdfViewerModal';
import { StaffingModals } from './ui/staffingWidget/StaffingModals';

export interface IStaffingWidgetProps {
  dark?: boolean;
}

export const StaffingWidget = ({ dark = false }: IStaffingWidgetProps) => {
  const { state, methods } = useStaffing();

  const [pdfFile, setPdfFile] = useState<{ name: string; url: string; size: string } | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const sizeKb = file.size / 1024;
        setPdfFile({
          name: file.name,
          url: ev.target?.result as string,
          size: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} МБ` : `${Math.round(sizeKb)} КБ`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addDeptOrg = state.organizations.find((o) => o.id === state.addDeptOrgId) ?? null;
  const addPosDept = state.addPositionTarget
    ? state.organizations.find((o) => o.id === state.addPositionTarget?.orgId)?.departments.find((d) => d.id === state.addPositionTarget?.deptId) ?? null
    : null;

  const headerCardBg = dark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-100';
  const titleText = dark ? 'text-gray-100' : 'text-gray-900';
  const subText = dark ? 'text-gray-400' : 'text-gray-500';
  const pdfBg = dark ? 'border-emerald-800/40 bg-emerald-900/20 text-emerald-400' : 'border-emerald-200 text-emerald-700';
  const pdfUploadBtn = dark ? 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-700' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50';

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full overflow-hidden">
      <StaffingHeaderCard
        dark={dark}
        headerCardBg={headerCardBg}
        titleText={titleText}
        subText={subText}
        pdfBg={pdfBg}
        pdfUploadBtn={pdfUploadBtn}
        pdfFile={pdfFile}
        pdfInputRef={pdfInputRef}
        onPdfChange={handlePdfChange}
        onOpenPdfViewer={() => setPdfViewerOpen(true)}
        onClearPdf={() => {
          setPdfFile(null);
          if (pdfInputRef.current) pdfInputRef.current.value = '';
        }}
        organizations={state.organizations}
        allTotals={state.allTotals}
      />

      <StaffingTopControls
        dark={dark}
        search={state.search}
        onSearchChange={state.setSearch}
        viewMode={state.viewMode}
        onViewModeChange={state.setViewMode}
        orgCount={state.organizations.length}
        totalPositions={state.allTotals.totalPositions}
        onAddOrg={() => state.setAddOrgOpen(true)}
      />

      <If is={state.isLoading}>
        <div className="py-20 text-center text-slate-400">Загрузка структуры...</div>
      </If>

      <If is={!state.isLoading && state.filteredOrgs.length === 0}>
        <EmptyStateIllustration
          onAddOrg={() => state.setAddOrgOpen(true)}
          dark={dark}
          hasSearch={state.search.trim().length > 0}
          search={state.search}
        />
      </If>
      
      <If is={!state.isLoading && state.filteredOrgs.length > 0}>
        <div>
          <If is={state.viewMode === 'list'}>
            <ListView
              organizations={state.filteredOrgs}
              employees={state.employees}
              dark={dark}
              onAddDept={state.setAddDeptOrgId}
              onDeleteOrg={() => {}}
              onEditOrg={state.setEditOrgTarget}
              onAddPosition={(orgId, deptId) => state.setAddPositionTarget({orgId, deptId})}
              onDeleteDept={() => {}}
              onDeletePosition={() => {}}
              onUpdatePosition={() => {}}
              onOpenAssign={state.setAssignTarget}
              onUnassignEmployee={methods.handleUnassignEmployee}
              onEditDept={(orgId, dept) => state.setEditDeptTarget({orgId, dept})}
            />
          </If>

          <If is={state.viewMode === 'grid'}>
            <StaffingGridView
              filteredOrgs={state.filteredOrgs}
              dark={dark}
              onAddDept={state.setAddDeptOrgId}
              onEditOrg={state.setEditOrgTarget}
            />
          </If>

          <If is={state.viewMode === 'tree'}>
            <OrgTreeChart
              organizations={state.filteredOrgs}
              employees={state.employees}
              dark={dark}
              onAddOrg={() => state.setAddOrgOpen(true)}
              onEditOrg={state.setEditOrgTarget}
              onAddDept={state.setAddDeptOrgId}
            />
          </If>
          <If is={state.viewMode === 'bubble'}>
            <BubbleView
              organizations={state.filteredOrgs}
              employees={state.employees}
              dark={dark}
              onAddOrg={() => state.setAddOrgOpen(true)}
            />
          </If>
        </div>
      </If>

      <StaffingPdfViewerModal
        pdfViewerOpen={pdfViewerOpen}
        pdfFile={pdfFile}
        onClose={() => setPdfViewerOpen(false)}
        dark={dark}
      />

      <StaffingModals
        state={state}
        methods={methods}
        addDeptOrg={addDeptOrg}
        addPosDept={addPosDept}
        dark={dark}
      />
    </div>
  );
};
