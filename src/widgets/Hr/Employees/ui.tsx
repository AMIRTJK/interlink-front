import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "@shared/lib/toast";
import type { IAdminUser } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { EmployeeFormModal } from "@features/Hr";
import {
  IEmployee,
  IEmployeesFilters,
  PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  TEmployeesView,
  exportUsersExcel,
  normalizeUsers,
} from "./model";
import { EmployeesToolbar } from "./EmployeesToolbar";
import { EmployeesTable } from "./EmployeesTable";
import { EmployeesCards } from "./EmployeesCards";
import { EmployeesAnalyticsModal } from "./EmployeesAnalyticsModal";
import { EmployeeProfileModal } from "./EmployeeProfileModal";
import { PageSizeSelect } from "./PageSizeSelect";

const emptyFilters: IEmployeesFilters = {
  status: "all",
  department: "all",
  salaryMin: "",
  salaryMax: "",
};

const buildQueryParams = (
  search: string,
  filters: IEmployeesFilters
): Record<string, unknown> => {
  const params: Record<string, unknown> = {
    with_departments: 1,
    with_roles: 1,
  };
  if (search.trim()) params.search = search.trim();
  if (filters.status !== "all") params.status = filters.status;
  if (filters.department !== "all") params.department_id = filters.department;
  if (filters.salaryMin) params.salary_min = Number(filters.salaryMin);
  if (filters.salaryMax) params.salary_max = Number(filters.salaryMax);
  return params;
};

export const EmployeesWidget: React.FC = () => {
  const [view, setView] = useState<TEmployeesView>("table");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<IEmployeesFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAdminUser | null>(null);
  const [viewing, setViewing] = useState<IEmployee | null>(null);

  const queryParams = useMemo(
    () => buildQueryParams(search, filters),
    [search, filters]
  );

  const { data, isLoading } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    params: queryParams,
    useToken: true,
  });

  const deleteM = useMutationQuery({
    url: (d: { id: number }) =>
      ApiRoutes.DELETE_USER.replace(":id", String(d.id)),
    method: "DELETE",
    messages: { success: "Сотрудник удалён", invalidate: [ApiRoutes.GET_USERS] },
  });

  const employees = useMemo<IEmployee[]>(() => {
    const raw = (data?.data?.data || data?.data || data || []) as IAdminUser[];
    return normalizeUsers(raw);
  }, [data]);

  const departments = useMemo(() => {
    const seen = new Set<number>();
    const result: { id: number; name: string }[] = [];
    employees.forEach((e) => {
      if (e.departmentId && !seen.has(e.departmentId)) {
        seen.add(e.departmentId);
        result.push({ id: e.departmentId, name: e.department });
      }
    });
    return result;
  }, [employees]);

  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = employees.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((e: IEmployee) => {
    setEditing(e.raw);
    setModalOpen(true);
  }, []);

  const openDuplicate = useCallback((e: IEmployee) => {
    setEditing({ ...e.raw, id: undefined as unknown as number });
    setModalOpen(true);
  }, []);

  const handleExportExcel = useCallback(async () => {
    const params: Record<string, unknown> = {};
    if (search.trim()) params.search = search.trim();
    if (filters.status !== "all") params.status = filters.status;
    if (filters.department !== "all") params.department = filters.department;
    if (filters.salaryMin) params.salary_min = filters.salaryMin;
    if (filters.salaryMax) params.salary_max = filters.salaryMax;
    try {
      await exportUsersExcel(params);
    } catch {
      toast.error("Не удалось скачать файл");
    }
  }, [search, filters]);

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
          onDelete={(id) => deleteM.mutate({ id })}
          onRowClick={setViewing}
        />
      ) : (
        <EmployeesCards
          items={pageItems}
          onEdit={openEdit}
          onDelete={(id) => deleteM.mutate({ id })}
          onDuplicate={openDuplicate}
          onCardClick={setViewing}
        />
      )}

      {employees.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-3">
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
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    safePage === i + 1
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
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
              deleteM.mutate({ id });
              setViewing(null);
            }}
            onDuplicate={(e) => {
              setViewing(null);
              openDuplicate(e);
            }}
          />
        )}
      </AnimatePresence>

      <EmployeeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editing}
      />
    </div>
  );
};
