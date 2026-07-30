import { useState, useMemo, useEffect } from "react";
import { Modal } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IAccessUser, ACCESS_STATUS_META } from "../../model";
import { formatJoinedDate, extractPermNames } from "../../lib";
import {
  ACTION_TRANSLATIONS,
  TTab,
} from "./userProfileModalModel";

interface IUseUserProfileModalStateProps {
  user: IAccessUser;
  onClose: () => void;
  onEdit: (user: IAccessUser) => void;
  onDelete: (id: number) => void;
  allRoles: {
    id: number;
    name: string;
    permissions?: string[] | { name: string }[];
  }[];
}

export function useUserProfileModalState({
  user,
  onClose,
  onEdit,
  onDelete,
  allRoles: rolesList,
}: IUseUserProfileModalStateProps) {
  const [tab, setTab] = useState<TTab>("profile");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);
  const [originalRoles, setOriginalRoles] = useState<string[]>(user.roles);
  const [backendRolePermissions, setBackendRolePermissions] = useState<string[]>([]);
  const [directPermissionsState, setDirectPermissionsState] = useState<string[]>([]);
  const [deniedPermissionsState, setDeniedPermissionsState] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [accessPage, setAccessPage] = useState(1);

  const { data: detailData, isLoading: isDetailLoading } = useGetQuery({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const { data: allPermsData, isLoading: isPermsLoading } = useGetQuery({
    url: ApiRoutes.FETCH_PERMISSIONS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const userPermsUrl = ApiRoutes.GET_USER_PERMISSIONS.replace(
    ":id",
    String(user.id),
  );

  const { data: userPermsData, isLoading: isUserPermsLoading } = useGetQuery({
    url: userPermsUrl,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  });

  const isDataLoading =
    isDetailLoading || isPermsLoading || isUserPermsLoading || !isInitialized;

  useEffect(() => {
    if (isInitialized || !detailData || !userPermsData || rolesList.length === 0) {
      return;
    }
    const rawRoles = detailData?.data?.roles || detailData?.roles;
    const roleNames: string[] = extractPermNames(rawRoles);
    if (roleNames.length) {
      setSelectedRoles(roleNames);
      setOriginalRoles(roleNames);
    }

    const rawUserPerms = userPermsData?.data || userPermsData;
    setBackendRolePermissions(extractPermNames(rawUserPerms?.role_permissions));
    setDirectPermissionsState(extractPermNames(rawUserPerms?.direct_permissions));
    setDeniedPermissionsState(extractPermNames(rawUserPerms?.denied_permissions));
    setIsInitialized(true);
  }, [detailData, userPermsData, isInitialized, rolesList]);

  const updateRolesM = useMutationQuery({
    url: ApiRoutes.SET_USER_ROLES,
    method: "POST",
    messages: {
      success: "Роли успешно сохранены",
      invalidate: [
        ApiRoutes.GET_USERS,
        `${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
      ],
    },
  });

  const updateDirectM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER_DIRECT_PERMISSIONS.replace(":id", String(user.id)),
    method: "PUT",
    messages: {
      success: "Прямые права сохранены",
      invalidate: [
        ApiRoutes.GET_USERS,
        userPermsUrl,
        `${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
      ],
    },
  });

  const updateDeniedM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER_DENIED_PERMISSIONS.replace(":id", String(user.id)),
    method: "PUT",
    messages: {
      success: "Персональные ограничения сохранены",
      invalidate: [
        ApiRoutes.GET_USERS,
        userPermsUrl,
        `${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
      ],
    },
  });

  const updateStatusM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER.replace(":id", String(user.id)),
    method: "PUT",
    messages: {
      success: "Статус сотруника обновлен",
      invalidate: [
        ApiRoutes.GET_USERS,
        `${ApiRoutes.FETCH_USER_BY_ID}${user.id}`,
      ],
    },
  });

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

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, { label: string; name: string }[]> = {};
    allSystemPermissions.forEach((permName) => {
      const parts = permName.split(".");
      const moduleName = parts[0];
      const actionName = parts.slice(1).join(".");
      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }
      groups[moduleName].push({
        label: ACTION_TRANSLATIONS[actionName] || actionName,
        name: permName,
      });
    });
    return groups;
  }, [allSystemPermissions]);

  const PAGE_SIZE = 4;
  const paginatedGroupEntries = useMemo(() => {
    const entries = Object.entries(groupedPermissions);
    const start = (permissionsPage - 1) * PAGE_SIZE;
    return entries.slice(start, start + PAGE_SIZE);
  }, [groupedPermissions, permissionsPage]);

  const ACCESS_PAGE_SIZE = 6;

  const rolesUnchanged = useMemo(() => {
    if (selectedRoles.length !== originalRoles.length) return false;
    const a = [...selectedRoles].sort();
    const b = [...originalRoles].sort();
    return a.every((role, i) => role === b[i]);
  }, [selectedRoles, originalRoles]);

  const roleGrantedPermissions = useMemo(() => {
    if (rolesUnchanged && backendRolePermissions.length) {
      return backendRolePermissions;
    }
    const perms = new Set<string>();
    selectedRoles.forEach((roleName) => {
      const roleObj = rolesList.find((r) => r.name === roleName);
      extractPermNames(roleObj?.permissions).forEach((p) => perms.add(p));
    });
    return Array.from(perms);
  }, [rolesUnchanged, backendRolePermissions, selectedRoles, rolesList]);

  const effectivePermissions = useMemo(() => {
    const perms = new Set<string>(roleGrantedPermissions);
    directPermissionsState.forEach((p) => perms.add(p));
    deniedPermissionsState.forEach((p) => perms.delete(p));
    return Array.from(perms);
  }, [roleGrantedPermissions, directPermissionsState, deniedPermissionsState]);

  const relevantPermissions = useMemo(() => {
    const activeModules = new Set(effectivePermissions.map((p) => p.split(".")[0]));
    return allSystemPermissions.filter((perm) => activeModules.has(perm.split(".")[0]));
  }, [allSystemPermissions, effectivePermissions]);

  const paginatedAccessLevels = useMemo(() => {
    const start = (accessPage - 1) * ACCESS_PAGE_SIZE;
    return relevantPermissions.slice(start, start + ACCESS_PAGE_SIZE);
  }, [relevantPermissions, accessPage]);

  useEffect(() => {
    setAccessPage(1);
  }, [relevantPermissions]);

  const handleToggleDirect = (permissionName: string) => {
    setDirectPermissionsState((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName],
    );
  };

  const handleToggleDenied = (permissionName: string) => {
    setDeniedPermissionsState((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName],
    );
  };

  const handleResetToStandard = () => {
    setDirectPermissionsState([]);
    setDeniedPermissionsState([]);
  };

  const availableRolesToAdd = useMemo(() => {
    return rolesList.filter((r) => !selectedRoles.includes(r.name));
  }, [rolesList, selectedRoles]);

  const handleAddRole = (roleName: string) => {
    setSelectedRoles((prev) => [...prev, roleName]);
  };

  const handleRemoveRole = (roleName: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== roleName));
  };

  const handleSave = () => {
    updateRolesM.mutate(
      { user_id: user.id, roles: selectedRoles },
      { onSuccess: () => onClose() },
    );
  };

  const handleSavePermissions = () => {
    updateDirectM.mutate(
      { permissions: directPermissionsState },
      {
        onSuccess: () => {
          updateDeniedM.mutate(
            { permissions: deniedPermissionsState },
            { onSuccess: () => onClose() },
          );
        },
      },
    );
  };

  const handleUpdateStatus = (status: string) => {
    updateStatusM.mutate({ status });
  };

  const handleDeleteConfirm = () => {
    Modal.confirm({
      title: "Удалить сотрудника?",
      content: "Это действие необратимо.",
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      zIndex: 10005,
      onOk: () => {
        onDelete(user.id);
        onClose();
      },
    });
  };

  const rawDetail = detailData?.data || detailData;
  const currentStatus = rawDetail?.status || user.status;
  const statusMeta = ACCESS_STATUS_META[currentStatus] || ACCESS_STATUS_META.active;
  const currentFullName = rawDetail?.full_name || rawDetail?.fullName || user.fullName;
  const currentEmail = rawDetail?.email || rawDetail?.phone || user.email;
  const currentDepartment =
    rawDetail?.departments?.[0]?.name ||
    rawDetail?.department?.name ||
    rawDetail?.organization?.name ||
    user.department;
  const currentPosition = rawDetail?.position || user.raw?.position || "Сотрудник";
  const currentJoinedAt = rawDetail?.created_at || user.raw?.created_at;
  const formattedJoinedAt = currentJoinedAt
    ? formatJoinedDate(currentJoinedAt)
    : user.joinedAt;

  return {
    tab,
    setTab,
    isDataLoading,
    selectedRoles,
    availableRolesToAdd,
    handleAddRole,
    handleRemoveRole,
    relevantPermissions,
    paginatedAccessLevels,
    effectivePermissions,
    accessPage,
    setAccessPage,
    ACCESS_PAGE_SIZE,
    roleGrantedPermissions,
    directPermissionsState,
    deniedPermissionsState,
    handleToggleDirect,
    handleToggleDenied,
    handleResetToStandard,
    groupedPermissions,
    paginatedGroupEntries,
    permissionsPage,
    setPermissionsPage,
    PAGE_SIZE,
    handleSave,
    handleSavePermissions,
    handleUpdateStatus,
    handleDeleteConfirm,
    updateRolesM,
    updateDirectM,
    updateDeniedM,
    currentStatus,
    statusMeta,
    currentFullName,
    currentEmail,
    currentDepartment,
    currentPosition,
    formattedJoinedAt,
  };
}
