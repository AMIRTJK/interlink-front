import * as React from "react";
import type { TableRowSelection } from "antd/es/table/interface";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import { useToasts } from "../../lib/useToasts";
import type { RoleCard, ExtUser, TableUser } from "../../model";
import {
  adaptRoleCard,
  adaptTableUser,
  adaptExtUser,
  extractPermNames,
  unwrapList,
} from "../../lib/adapters";
import {
  PER_PAGE,
  ROLES_VIEW_MODE_STORAGE_KEY,
  type RolesViewMode,
} from "./rolesViewModel";

export function useRolesViewState() {
  const { toasts, addToast, removeToast } = useToasts();
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [isFirstOpen, setIsFirstOpen] = React.useState(false);
  const [pulsingCardId, setPulsingCardId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<RolesViewMode>(() => {
    try {
      const saved = localStorage.getItem(ROLES_VIEW_MODE_STORAGE_KEY);
      if (saved === "block" || saved === "registry") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "block";
  });
  const [viewTransitioning, setViewTransitioning] = React.useState(false);
  const [checkedUsers, setCheckedUsers] = React.useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showCreateRole, setShowCreateRole] = React.useState(false);
  const [showCreateUiPerm, setShowCreateUiPerm] = React.useState(false);
  const [showDeleteRole, setShowDeleteRole] = React.useState(false);
  const [profileUser, setProfileUser] = React.useState<ExtUser | null>(null);

  const { data: rolesData } = useGetQuery({
    url: ApiRoutes.GET_ROLES,
    useToken: true,
    options: { refetchOnWindowFocus: false, staleTime: 30 * 60 * 1000 },
  });

  const { data: allPermsData } = useGetQuery({
    url: ApiRoutes.FETCH_PERMISSIONS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const rolesList = React.useMemo(
    () =>
      unwrapList<{
        id: number;
        name: string;
        description?: string;
        permissions?: unknown;
        created_at?: string;
      }>(rolesData),
    [rolesData],
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

  // Реальный счётчик «пользователей на роль» — total из GET_USERS?role=X&per_page=1
  const [roleUserCounts, setRoleUserCounts] = React.useState<
    Record<string, number>
  >({});
  React.useEffect(() => {
    if (rolesList.length === 0) return;
    let cancelled = false;
    Promise.all(
      rolesList.map((r) =>
        _axios
          .get(ApiRoutes.GET_USERS, { params: { role: r.name, per_page: 1 } })
          .then((res) => {
            const body = res.data;
            const total = body?.data?.total ?? body?.total ?? 0;
            return [r.name, total] as const;
          })
          .catch(() => [r.name, 0] as const),
      ),
    ).then((results) => {
      if (!cancelled) setRoleUserCounts(Object.fromEntries(results));
    });
    return () => {
      cancelled = true;
    };
  }, [rolesList]);

  const roleCards: RoleCard[] = React.useMemo(
    () =>
      rolesList.map((r) =>
        adaptRoleCard(r, {
          allPermNames,
          userCount: roleUserCounts[r.name] ?? 0,
        }),
      ),
    [rolesList, allPermNames, roleUserCounts],
  );

  // Выбор первой роли по умолчанию
  React.useEffect(() => {
    if (roleCards.length > 0 && selectedRoleId === null && drawerOpen) {
      setSelectedRoleId(roleCards[0].id);
    }
  }, [roleCards, selectedRoleId, drawerOpen]);

  const selectedCard =
    roleCards.find((c) => c.id === selectedRoleId) ?? null;
  const selectedRoleName = selectedCard?.name ?? null;
  const isRoleFiltered = drawerOpen && selectedRoleName !== null;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedRoleId, searchQuery]);

  // Пользователи (для таблицы) — фильтр по выбранной роли + поиск
  const usersParams = React.useMemo(() => {
    const p: Record<string, string> = {
      page: String(currentPage),
      per_page: String(PER_PAGE),
    };
    if (isRoleFiltered && selectedRoleName) p.role = selectedRoleName;
    if (searchQuery) p.search = searchQuery;
    return p;
  }, [currentPage, isRoleFiltered, selectedRoleName, searchQuery]);

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: usersParams,
    options: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const rawUsers = React.useMemo(
    () => unwrapList<IAdminUser>(usersData),
    [usersData],
  );
  const displayedUsers = React.useMemo(
    () => rawUsers.map(adaptTableUser),
    [rawUsers],
  );
  const totalUsers = React.useMemo(() => {
    const d = usersData as
      | { data?: { total?: number }; total?: number }
      | undefined;
    return d?.data?.total ?? d?.total ?? displayedUsers.length;
  }, [usersData, displayedUsers.length]);

  const memberInitials = React.useMemo(
    () => displayedUsers.slice(0, 12).map((u) => u.avatarInitials),
    [displayedUsers],
  );

  const switchView = (mode: RolesViewMode) => {
    if (mode === viewMode) return;
    setViewTransitioning(true);
    try {
      localStorage.setItem(ROLES_VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    setTimeout(() => {
      setViewMode(mode);
      setViewTransitioning(false);
    }, 150);
  };

  const handleCardClick = (cardId: string) => {
    setProfileUser(null);
    if (selectedRoleId === cardId && drawerOpen) {
      setDrawerOpen(false);
      setSelectedRoleId(null);
      setPulsingCardId(null);
    } else {
      const isOpening = !drawerOpen || selectedRoleId === null;
      setIsFirstOpen(isOpening);
      setSelectedRoleId(cardId);
      setDrawerOpen(true);
      setPulsingCardId(cardId);
      setTimeout(() => setPulsingCardId(null), 700);
    }
  };

  const handleRowClick = (userId: string) => {
    const rawUser = rawUsers.find((u) => String(u.id) === userId);
    if (!rawUser) return;
    setIsFirstOpen(!profileUser);
    setProfileUser(adaptExtUser(rawUser));
  };

  const rowSelection: TableRowSelection<TableUser> = {
    selectedRowKeys: Array.from(checkedUsers),
    onChange: (keys) => setCheckedUsers(new Set(keys.map(String))),
  };

  const showRoleDrawer = drawerOpen && selectedCard;

  return {
    toasts,
    addToast,
    removeToast,
    selectedRoleId,
    setSelectedRoleId,
    drawerOpen,
    setDrawerOpen,
    isFirstOpen,
    pulsingCardId,
    viewMode,
    viewTransitioning,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    showCreateRole,
    setShowCreateRole,
    showCreateUiPerm,
    setShowCreateUiPerm,
    showDeleteRole,
    setShowDeleteRole,
    profileUser,
    setProfileUser,
    allPermNames,
    roleCards,
    selectedCard,
    selectedRoleName,
    isRoleFiltered,
    displayedUsers,
    totalUsers,
    memberInitials,
    switchView,
    handleCardClick,
    handleRowClick,
    rowSelection,
    showRoleDrawer,
  };
}
