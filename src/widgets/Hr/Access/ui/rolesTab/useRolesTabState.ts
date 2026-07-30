import { useState, useMemo, useEffect } from "react";
import { Modal } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import { normalizeAccessUsers } from "../../lib";
import type { IAccessUser } from "../../model";

export function useRolesTabState() {
  const [selectedRole, setSelectedRole] = useState<{
    id: number;
    name: string;
    permissions?: string[] | { name: string }[];
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateUiPermOpen, setIsCreateUiPermOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesPage, setRolesPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewingUser, setViewingUser] = useState<IAccessUser | null>(null);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: rolesData } = useGetQuery({
    url: ApiRoutes.GET_ROLES,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const { data: allPermsData } = useGetQuery({
    url: ApiRoutes.FETCH_PERMISSIONS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 60 * 1000,
    },
  });

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

  const [roleUserCounts, setRoleUserCounts] = useState<Record<string, number>>({});

  useEffect(() => {
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
      if (!cancelled) {
        setRoleUserCounts(Object.fromEntries(results));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rolesList]);

  const paginatedRoles = useMemo(() => {
    const start = (rolesPage - 1) * 6;
    return rolesList.slice(start, start + 6);
  }, [rolesList, rolesPage]);

  useEffect(() => {
    setRolesPage(1);
  }, [rolesList.length]);

  useEffect(() => {
    if (rolesList.length > 0 && !selectedRole) {
      setSelectedRole(rolesList[0]);
    } else if (rolesList.length > 0 && selectedRole) {
      const updated = rolesList.find((r) => r.id === selectedRole.id);
      if (updated) {
        setSelectedRole(updated);
      }
    }
  }, [rolesList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole?.id, searchQuery]);

  const { data: usersData, isLoading: usersLoading } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: useMemo(() => {
      const p: Record<string, any> = {};
      if (selectedRole) {
        p.role = selectedRole.name;
      }
      if (searchQuery) {
        p.search = searchQuery;
      }
      p.page = currentPage;
      p.per_page = 15;
      return p;
    }, [selectedRole, searchQuery, currentPage]),
    options: {
      enabled: !!selectedRole,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const rawUsers = useMemo(() => {
    const raw = (usersData?.data?.data ||
      usersData?.data ||
      usersData ||
      []) as any[];
    return raw;
  }, [usersData]);

  const normalizedUsers = useMemo(() => {
    return normalizeAccessUsers(rawUsers);
  }, [rawUsers]);

  const allSystemPermissions = useMemo(() => {
    const perms = new Set<string>();
    const rawSystem = allPermsData?.data || allPermsData;
    if (Array.isArray(rawSystem)) {
      rawSystem.forEach((p: any) => {
        const name = typeof p === "string" ? p : p?.name;
        if (name) perms.add(name);
      });
    }
    rolesList.forEach((role) => {
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach((p) => {
          if (typeof p === "string") {
            perms.add(p);
          } else if (p && typeof p === "object" && p.name) {
            perms.add(p.name);
          }
        });
      }
    });
    return Array.from(perms);
  }, [allPermsData, rolesList]);

  const deleteRoleM = useMutationQuery({
    url: (d: { id: number }) =>
      ApiRoutes.DELETE_ROLE.replace(":id", String(d.id)),
    method: "DELETE",
    messages: {
      success: "Роль успешно удалена",
      invalidate: [ApiRoutes.GET_ROLES],
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

  const handleOpenEditUser = (user: IAccessUser) => {
    setEditingUser(user.raw);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (id: number) => {
    deleteUserM.mutate({ id });
  };

  const handleDeleteRole = (roleItem: any) => {
    Modal.confirm({
      title: "Удалить роль?",
      content: "Это действие необратимо.",
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: () => {
        deleteRoleM.mutate(
          { id: roleItem.id },
          {
            onSuccess: () => {
              if (selectedRole?.id === roleItem.id) {
                setSelectedRole(null);
              }
            },
          },
        );
      },
    });
  };

  const totalUsers =
    usersData?.data?.total || usersData?.total || normalizedUsers.length;
  const perPage = usersData?.data?.per_page || usersData?.per_page || 15;

  return {
    selectedRole,
    setSelectedRole,
    searchQuery,
    setSearchQuery,
    isCreateOpen,
    setIsCreateOpen,
    isCreateUiPermOpen,
    setIsCreateUiPermOpen,
    currentPage,
    setCurrentPage,
    rolesPage,
    setRolesPage,
    viewMode,
    setViewMode,
    viewingUser,
    setViewingUser,
    editingUser,
    isFormOpen,
    setIsFormOpen,
    rolesList,
    roleUserCounts,
    paginatedRoles,
    usersLoading,
    normalizedUsers,
    allSystemPermissions,
    handleOpenEditUser,
    handleDeleteUser,
    handleDeleteRole,
    totalUsers,
    perPage,
  };
}
