import { useState, useMemo } from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import { IAccessUser, IUserAccessFilters } from "../../model";
import { normalizeAccessUsers } from "../../lib";

export function useUsersTabState() {
  const [filters, setFilters] = useState<IUserAccessFilters>({
    search: "",
    role: "all",
    department: "all",
    status: "all",
  });

  const [selectedQuickRole, setSelectedQuickRole] = useState<string>("all");
  const [viewingUser, setViewingUser] = useState<IAccessUser | null>(null);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (filters.search) {
      p.search = filters.search;
    }
    const activeRole =
      selectedQuickRole !== "all" ? selectedQuickRole : filters.role;
    if (activeRole !== "all") {
      p.role = activeRole;
    }
    if (filters.department !== "all") {
      p.department = filters.department;
    }
    if (filters.status !== "all") {
      p.status = filters.status;
    }
    p.page = String(currentPage);
    p.per_page = String(perPage);
    return p;
  }, [filters, selectedQuickRole, currentPage]);

  const { data: usersData, isLoading: usersLoading } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: queryParams,
    options: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const { data: rolesData } = useGetQuery({
    url: ApiRoutes.GET_ROLES,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const { data: deptsData } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const deleteUserM = useMutationQuery({
    url: (d: { id: number }) =>
      ApiRoutes.DELETE_USER.replace(":id", String(d.id)),
    method: "DELETE",
    messages: {
      success: "Пользователь успешно удален",
      invalidate: [ApiRoutes.GET_USERS],
    },
  });

  const rawUsers = useMemo(() => {
    const raw = (usersData?.data?.data ||
      usersData?.data ||
      usersData ||
      []) as IAdminUser[];
    return raw;
  }, [usersData]);

  const totalUsers = useMemo(() => {
    return usersData?.data?.total ?? usersData?.total ?? rawUsers.length;
  }, [usersData, rawUsers.length]);

  const allUsers = useMemo(() => {
    return normalizeAccessUsers(rawUsers);
  }, [rawUsers]);

  const roles = useMemo(() => {
    const raw = (rolesData?.data?.data ||
      rolesData?.data ||
      rolesData ||
      []) as { id: number; name: string }[];
    return raw.map((r) => r.name);
  }, [rolesData]);

  const rolesList = useMemo(() => {
    const raw = (rolesData?.data?.data ||
      rolesData?.data ||
      rolesData ||
      []) as {
      id: number;
      name: string;
      permissions?: string[] | { name: string }[];
    }[];
    return Array.isArray(raw) ? raw : [];
  }, [rolesData]);

  const departments = useMemo(() => {
    const raw = (deptsData?.data?.data ||
      deptsData?.data ||
      deptsData ||
      []) as { id: number; name: string }[];
    return raw.map((d) => d.name);
  }, [deptsData]);

  const counters = useMemo(() => {
    const counts = { all: 0, active: 0, inactive: 0, blocked: 0 };
    allUsers.forEach((u) => {
      counts.all++;
      if (u.status === "active") counts.active++;
      else if (u.status === "inactive") counts.inactive++;
      else if (u.status === "blocked") counts.blocked++;
    });
    return counts;
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = u.fullName.toLowerCase().includes(query);
        const matchesEmail = u.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }
      if (filters.status !== "all" && u.status !== filters.status) {
        return false;
      }
      if (filters.department !== "all" && u.department !== filters.department) {
        return false;
      }
      if (filters.role !== "all" && !u.roles.includes(filters.role)) {
        return false;
      }
      if (selectedQuickRole !== "all" && !u.roles.includes(selectedQuickRole)) {
        return false;
      }
      return true;
    });
  }, [allUsers, filters, selectedQuickRole]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof IUserAccessFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleQuickRoleChange = (role: string) => {
    setSelectedQuickRole(role);
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: IAccessUser) => {
    setEditingUser(user.raw);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (id: number) => {
    deleteUserM.mutate({ id });
  };

  return {
    filters,
    setFilters,
    selectedQuickRole,
    viewingUser,
    setViewingUser,
    editingUser,
    isFormOpen,
    setIsFormOpen,
    currentPage,
    perPage,
    usersLoading,
    filteredUsers,
    totalUsers,
    roles,
    rolesList,
    departments,
    counters,
    handlePageChange,
    handleFilterChange,
    handleQuickRoleChange,
    handleOpenCreate,
    handleOpenEdit,
    handleDeleteUser,
  };
}
