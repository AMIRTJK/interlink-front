import { useState, useMemo, useCallback } from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import { toast } from "@shared/lib/toast";
import {
  IEmployeesFilters,
  IEmployee,
  normalizeUsers,
  exportUsersExcel,
  PAGE_SIZE,
} from "./model";

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

export const useEmployeesLogic = () => {
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<IEmployeesFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IAdminUser | null>(null);
  const [viewing, setViewing] = useState<IEmployee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleDelete = async (id: number) => {
    await deleteM.mutateAsync({ id });
    setDeletingId(null);
  };

  return {
    view, setView,
    search, setSearch,
    filters, setFilters,
    page, setPage,
    pageSize, setPageSize,
    showAnalytics, setShowAnalytics,
    modalOpen, setModalOpen,
    editing, setEditing,
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
  };
};
