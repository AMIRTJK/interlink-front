import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import type { IAdminUser } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { EmployeeFormModal } from "@features/Hr";
import {
  IEmployee,
  IEmployeesFilters,
  PAGE_SIZE,
  TEmployeesView,
  exportUsersExcel,
  normalizeUsers,
} from "./model";
import { EmployeesToolbar } from "./EmployeesToolbar";
import { EmployeesTable } from "./EmployeesTable";
import { EmployeesCards } from "./EmployeesCards";
import { EmployeesAnalyticsModal } from "./EmployeesAnalyticsModal";

const emptyFilters: IEmployeesFilters = {
  status: "all",
  department: "all",
  salaryMin: "",
  salaryMax: "",
};

// Виджет «Сотрудники»: список, поиск, фильтр, аналитика, CRUD
export const EmployeesWidget: React.FC = () => {
  const { data, isLoading } = useGetQuery({ url: ApiRoutes.GET_USERS, useToken: true });

  const deleteM = useMutationQuery({
    url: (d: { id: number }) => ApiRoutes.DELETE_USER.replace(":id", String(d.id)),
    method: "DELETE",
    messages: { success: "Сотрудник удалён", invalidate: [ApiRoutes.GET_USERS] },
  });

  const employees = useMemo<IEmployee[]>(() => {
    const raw = (data?.data?.data || data?.data || data || []) as IAdminUser[];
    return normalizeUsers(raw);
  }, [data]);

  const [view, setView] = useState<TEmployeesView>("table");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<IEmployeesFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAdminUser | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter((d) => d && d !== "—"))),
    [employees],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (q) {
        const hay = `${e.fullName} ${e.position} ${e.email} ${e.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.status !== "all" && e.status !== filters.status) return false;
      if (filters.department !== "all" && e.department !== filters.department) return false;
      if (filters.salaryMin && (e.salary == null || e.salary < Number(filters.salaryMin))) return false;
      if (filters.salaryMax && (e.salary == null || e.salary > Number(filters.salaryMax))) return false;
      return true;
    });
  }, [employees, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (e: IEmployee) => {
    setEditing(e.raw);
    setModalOpen(true);
  };
  const openDuplicate = (e: IEmployee) => {
    // Дубликат: предзаполняем, но без id (создание)
    setEditing({ ...e.raw, id: undefined as unknown as number });
    setModalOpen(true);
  };

  // Экспорт в Excel с бэка с учётом текущих поиска/фильтров
  const handleExportExcel = async () => {
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
  };

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
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-400">Сотрудники не найдены</div>
      ) : view === "table" ? (
        <EmployeesTable items={pageItems} onEdit={openEdit} onDelete={(id) => deleteM.mutate({ id })} />
      ) : (
        <EmployeesCards
          items={pageItems}
          onEdit={openEdit}
          onDelete={(id) => deleteM.mutate({ id })}
          onDuplicate={openDuplicate}
        />
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Показано {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} из {filtered.length}
          </span>
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

      <EmployeeFormModal open={modalOpen} onClose={() => setModalOpen(false)} employee={editing} />
    </div>
  );
};
