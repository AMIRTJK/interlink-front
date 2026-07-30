import * as React from "react";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import { T } from "../../theme/tokens";
import { useToasts } from "../../lib/useToasts";
import type { ExtUser, RoleCard } from "../../model";
import {
  adaptExtUser,
  adaptRoleCard,
  extractPermNames,
  unwrapList,
} from "../../lib/adapters";
import { PER_PAGE } from "./usersViewModel";

export function useUsersViewState() {
  const { toasts, addToast, removeToast } = useToasts();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchValue, setSearchValue] = React.useState("");
  const [chipFilter, setChipFilter] = React.useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [checkedUsers, setCheckedUsers] = React.useState<Set<string>>(
    new Set(),
  );
  const [profileUser, setProfileUser] = React.useState<ExtUser | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [activeActionsUserId, setActiveActionsUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalClick = () => {
      setActiveActionsUserId(null);
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, chipFilter, departmentFilter, statusFilter]);

  const queryParams = React.useMemo(() => {
    const p: Record<string, string> = {
      page: String(currentPage),
      per_page: String(PER_PAGE),
    };
    if (searchQuery) p.search = searchQuery;
    if (chipFilter) p.role = chipFilter;
    if (departmentFilter) p.department = departmentFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [currentPage, searchQuery, chipFilter, departmentFilter, statusFilter]);

  const { data: usersData } = useGetQuery({
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

  const departments = React.useMemo(
    () => unwrapList<{ id: number; name: string }>(deptsData),
    [deptsData],
  );

  const { data: allPermsData } = useGetQuery({
    url: ApiRoutes.FETCH_PERMISSIONS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const rawUsers = React.useMemo(
    () => unwrapList<IAdminUser>(usersData),
    [usersData],
  );
  const totalUsers = React.useMemo(() => {
    const d = usersData as
      | { data?: { total?: number }; total?: number }
      | undefined;
    return d?.data?.total ?? d?.total ?? rawUsers.length;
  }, [usersData, rawUsers.length]);

  const users = React.useMemo(
    () => rawUsers.map(adaptExtUser),
    [rawUsers],
  );

  const rolesList = React.useMemo(
    () =>
      unwrapList<{ id: number; name: string; permissions?: unknown }>(
        rolesData,
      ),
    [rolesData],
  );
  const allRoleNames = React.useMemo(
    () => rolesList.map((r) => r.name),
    [rolesList],
  );

  const allPermNames = React.useMemo(() => {
    const set = new Set<string>();
    const rawSystem = (allPermsData as { data?: unknown })?.data ?? allPermsData;
    extractPermNames(rawSystem).forEach((n) => set.add(n));
    rolesList.forEach((r) =>
      extractPermNames(r.permissions).forEach((n) => set.add(n)),
    );
    return Array.from(set);
  }, [allPermsData, rolesList]);

  const roleCards: RoleCard[] = React.useMemo(
    () =>
      rolesList.map((r) => adaptRoleCard(r, { allPermNames, userCount: 0 })),
    [rolesList, allPermNames],
  );

  const chipFilters = React.useMemo(
    () => [
      { label: "Все", filter: null as string | null },
      ...allRoleNames.map((name) => ({ label: name, filter: name })),
    ],
    [allRoleNames],
  );

  const statChips = React.useMemo(() => {
    const active = users.filter((u) => u.status === "Активен").length;
    const inactive = users.filter((u) => u.status === "Неактивен").length;
    const blocked = users.filter((u) => u.status === "Заблокирован").length;
    return [
      { label: "Всего", value: totalUsers, dot: null as string | null },
      { label: "Активные", value: active, dot: T.success },
      { label: "Неактивные", value: inactive, dot: "#94A3B8" },
      { label: "Заблокированные", value: blocked, dot: T.danger },
    ];
  }, [users, totalUsers]);

  return {
    toasts,
    addToast,
    removeToast,
    searchQuery,
    setSearchQuery,
    searchValue,
    setSearchValue,
    chipFilter,
    setChipFilter,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    checkedUsers,
    setCheckedUsers,
    profileUser,
    setProfileUser,
    isAddOpen,
    setIsAddOpen,
    activeActionsUserId,
    setActiveActionsUserId,
    departments,
    users,
    totalUsers,
    allRoleNames,
    roleCards,
    chipFilters,
    statChips,
  };
}
