import React from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { If } from "@shared/ui";
import { EmployeeFormModal } from "@features/Hr";
import { PAGE_SIZE_OPTIONS } from "./model";
import { EmployeesToolbar } from "./EmployeesToolbar";
import { EmployeesTable } from "./EmployeesTable";
import { EmployeesCards } from "./EmployeesCards";
import { EmployeesAnalyticsModal } from "./EmployeesAnalyticsModal";
import { EmployeeProfileModal } from "./EmployeeProfileModal";
import { PageSizeSelect } from "./PageSizeSelect";
import { useEmployeesLogic } from "./lib";

export const EmployeesWidget: React.FC = () => {
  const {
    view, setView,
    search, setSearch,
    filters, setFilters,
    page, setPage,
    pageSize, setPageSize,
    showAnalytics, setShowAnalytics,
    modalOpen, setModalOpen,
    editing,
    viewing, setViewing,
    deletingId, setDeletingId,
    isLoading,
    employees,
    departments,
    totalPages,
    safePage,
    pageItems,
    openCreate,
    openEdit,
    openDuplicate,
    handleExportExcel,
    handleDelete,
  } = useEmployeesLogic();

  return (
    <div className="space-y-4">
      <EmployeesToolbar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        view={view}
        onView={setView}
        filters={filters}
        onApplyFilters={(f) => {
          setFilters(f);
          setPage(1);
        }}
        departments={departments}
        onOpenAnalytics={() => setShowAnalytics(true)}
        onCreate={openCreate}
      />

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Загрузка...</div>
      ) : employees.length === 0 ? (
        <div className="py-20 text-center text-slate-400">Сотрудники не найдены</div>
      ) : view === "table" ? (
        <EmployeesTable
          items={pageItems}
          onEdit={openEdit}
          onDelete={setDeletingId}
          onRowClick={setViewing}
        />
      ) : (
        <EmployeesCards
          items={pageItems}
          onEdit={openEdit}
          onDelete={setDeletingId}
          onDuplicate={openDuplicate}
          onCardClick={setViewing}
        />
      )}

      {employees.length > 0 && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              Показано {(safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, employees.length)} из{" "}
              {employees.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Строк на странице:</span>
              <PageSizeSelect
                value={pageSize}
                options={PAGE_SIZE_OPTIONS}
                onChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    safePage === i + 1
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                      : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {showAnalytics && (
        <EmployeesAnalyticsModal
          employees={employees}
          onClose={() => setShowAnalytics(false)}
          onExport={handleExportExcel}
        />
      )}

      <AnimatePresence>
        {viewing && (
          <EmployeeProfileModal
            employee={viewing}
            onClose={() => setViewing(null)}
            onEdit={(e) => {
              setViewing(null);
              openEdit(e);
            }}
            onDelete={(id) => {
              setViewing(null);
              setDeletingId(id);
            }}
            onDuplicate={(e) => {
              setViewing(null);
              openDuplicate(e);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <If is={deletingId !== null}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Удалить сотрудника?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Это действие необратимо. Сотрудник потеряет доступ к системе, а его данные будут удалены.</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deletingId!)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </If>
      </AnimatePresence>

      <EmployeeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editing}
      />
    </div>
  );
};
