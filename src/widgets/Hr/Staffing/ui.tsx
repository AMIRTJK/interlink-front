import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, LayoutGrid, GitBranch, Network, FileText, Download, X, Upload, Search, Plus, Eye, Trash2, Pencil } from 'lucide-react';
import { TStaffingViewMode, ORG_COLORS } from './model';
import { SummaryBar } from './ui/SummaryBar';
import { EmptyStateIllustration } from './ui/EmptyStateIllustration';
import { OccupancyRing } from './ui/components/OccupancyRing';
import { ListView, BubbleView, OrgTreeChart } from './ui/views';
import {
  AddOrgModal,
  AddDeptModal,
  AddPositionModal,
  AssignEmployeeModal,
  EditOrgModal,
  EditDeptModal,
} from './ui/modals';
import { calcOrgTotals, getOccupancyColor } from './lib';
import { If } from '@shared/ui/If';
import { useStaffing } from './useStaffing';

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
  const searchBg = dark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-600' : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400';
  const searchIcon = dark ? 'text-gray-500' : 'text-gray-400';
  const viewToggleBg = dark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white';
  const viewToggleActive = (mode: TStaffingViewMode) =>
    state.viewMode === mode
      ? 'bg-indigo-600 text-white shadow-sm'
      : dark
      ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50';
  const countText = dark ? 'text-gray-500' : 'text-gray-400';

  const viewModes = [
    { mode: 'list' as const, Icon: List, label: 'Список' },
    { mode: 'grid' as const, Icon: LayoutGrid, label: 'Сетка' },
    { mode: 'tree' as const, Icon: GitBranch, label: 'Дерево' },
    { mode: 'bubble' as const, Icon: Network, label: 'Пузыри' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full overflow-hidden">
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${headerCardBg}`}>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GitBranch size={15} className="text-white" />
              </div>
              <h2 className={`text-lg font-bold ${titleText}`}>Штатное расписание</h2>
            </div>
            <p className={`text-sm ml-10 ${subText}`}>
              Управление структурой организаций, отделов и должностей
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfChange} />
            <If is={!!pdfFile}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${pdfBg}`}>
                <FileText size={13} />
                <span className="truncate max-w-[120px]">{pdfFile?.name}</span>
                <span className="opacity-60 text-[10px]">{pdfFile?.size}</span>
                <button onClick={() => setPdfViewerOpen(true)} className="p-0.5 rounded hover:bg-white/10 transition-colors">
                  <Eye size={12} />
                </button>
                <a href={pdfFile?.url} download={pdfFile?.name} className="p-0.5 rounded hover:bg-white/10 transition-colors">
                  <Download size={12} />
                </a>
                <button
                  onClick={() => {
                    setPdfFile(null);
                    if (pdfInputRef.current) pdfInputRef.current.value = '';
                  }}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </If>
            <If is={!pdfFile}>
              <button
                onClick={() => pdfInputRef.current?.click()}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${pdfUploadBtn}`}
              >
                <Upload size={13} />
                <span>Прикрепить PDF</span>
              </button>
            </If>
          </div>
        </div>
        <If is={state.organizations.length > 0}>
          <div className="px-6 pb-5">
            <SummaryBar organizations={state.organizations} {...state.allTotals} dark={dark} />
          </div>
        </If>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${searchIcon}`} />
          <input
            type="text"
            placeholder="Поиск организаций, отделов..."
            value={state.search}
            onChange={(e) => state.setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${searchBg}`}
          />
        </div>
        <div className={`flex items-center rounded-xl border p-1 gap-0.5 ${viewToggleBg}`}>
          {viewModes.map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => state.setViewMode(mode)}
              title={label}
              className={`p-2 rounded-lg transition-all ${viewToggleActive(mode)}`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs hidden sm:block ${countText}`}>
            {state.organizations.length} орг. · {state.allTotals.totalPositions} должн.
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => state.setAddOrgOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md ${
              dark ? 'shadow-indigo-900/30' : 'shadow-indigo-200'
            }`}
          >
            <Plus size={15} />
            <span>Организация</span>
          </motion.button>
        </div>
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {state.filteredOrgs.map((org, oIdx) => {
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
                        onClick={() => state.setAddDeptOrgId(org.id)}
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
                        onClick={() => state.setEditOrgTarget(org)}
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

      <AnimatePresence>
        <If is={pdfViewerOpen && !!pdfFile}>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setPdfViewerOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`relative rounded-2xl shadow-2xl w-full max-w-4xl z-[61] flex flex-col ${
                dark ? 'bg-gray-900' : 'bg-white'
              }`}
              style={{ maxHeight: '90vh' }}
            >
              <div
                className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
                  dark ? 'border-gray-700/60' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                    <FileText size={14} className="text-red-600" />
                  </div>
                  <p
                    className={`text-sm font-semibold truncate max-w-[280px] ${
                      dark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {pdfFile?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={pdfFile?.url}
                    download={pdfFile?.name}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      dark
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Download size={13} />
                    <span>Скачать</span>
                  </a>
                  <button
                    onClick={() => setPdfViewerOpen(false)}
                    className={`p-2 rounded-xl transition-colors ${
                      dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden rounded-b-2xl">
                <iframe
                  src={pdfFile?.url}
                  className="w-full h-full"
                  style={{ minHeight: '70vh' }}
                  title={pdfFile?.name}
                />
              </div>
            </motion.div>
          </div>
        </If>
      </AnimatePresence>

      <AnimatePresence>
        <If key={state.addOrgOpen ? 'add-org-open' : 'add-org-closed'} is={state.addOrgOpen}>
          <AddOrgModal
            key="add-org"
            employees={state.employees}
            organizations={state.organizations}
            onClose={() => state.setAddOrgOpen(false)}
            onSave={methods.handleAddOrg}
            dark={dark}
          />
        </If>
        <If key={state.addDeptOrgId !== null && !!addDeptOrg ? 'add-dept-open' : 'add-dept-closed'} is={state.addDeptOrgId !== null && !!addDeptOrg}>
          <AddDeptModal
            key="add-dept"
            orgName={addDeptOrg?.name || ''}
            existingDepts={addDeptOrg?.departments || []}
            employees={state.employees}
            onClose={() => state.setAddDeptOrgId(null)}
            onSave={() => {}}
            dark={dark}
          />
        </If>
        <If key={state.addPositionTarget !== null && !!addPosDept ? 'add-pos-open' : 'add-pos-closed'} is={state.addPositionTarget !== null && !!addPosDept}>
          <AddPositionModal
            key="add-pos"
            deptName={addPosDept?.name || ''}
            onClose={() => state.setAddPositionTarget(null)}
            onSave={(pos) => methods.handleAddPosition(state.addPositionTarget?.orgId ?? 0, state.addPositionTarget?.deptId ?? 0, pos)}
            dark={dark}
          />
        </If>
        <If key={state.assignTarget ? 'assign-open' : 'assign-closed'} is={!!state.assignTarget}>
          <AssignEmployeeModal
            key="assign"
            employees={state.employees}
            assignedIds={state.currentAssignedIds}
            positionName={state.assignTarget?.posName ?? ''}
            slots={state.currentAssignSlots}
            onClose={() => state.setAssignTarget(null)}
            onAssign={(emp) =>
              methods.handleAssignEmployee(state.assignTarget?.orgId ?? 0, state.assignTarget?.deptId ?? 0, state.assignTarget?.posId ?? 0, emp)
            }
            onUnassign={(empId) =>
              methods.handleUnassignEmployee(state.assignTarget?.orgId ?? 0, state.assignTarget?.deptId ?? 0, state.assignTarget?.posId ?? 0, empId)
            }
            dark={dark}
          />
        </If>
        <If key={state.editOrgTarget ? 'edit-org-open' : 'edit-org-closed'} is={!!state.editOrgTarget}>
          <EditOrgModal
            key="edit-org"
            org={state.editOrgTarget as any}
            employees={state.employees}
            dark={dark}
            onClose={() => state.setEditOrgTarget(null)}
            onSave={() => {}}
          />
        </If>
        <If key={state.editDeptTarget ? 'edit-dept-open' : 'edit-dept-closed'} is={!!state.editDeptTarget}>
          <EditDeptModal
            key="edit-dept"
            dept={state.editDeptTarget?.dept as any}
            orgId={state.editDeptTarget?.orgId ?? 0}
            existingDepts={state.organizations.find((o) => o.id === state.editDeptTarget?.orgId)?.departments ?? []}
            employees={state.employees}
            onClose={() => state.setEditDeptTarget(null)}
            onSave={() => {}}
            dark={dark}
          />
        </If>
      </AnimatePresence>
    </div>
  );
};
