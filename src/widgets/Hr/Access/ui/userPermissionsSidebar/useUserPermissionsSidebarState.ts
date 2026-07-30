import { useState, useEffect, useMemo } from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IAccessUser } from "../../model";
import { extractPermNames } from "../../lib";
import {
  ACTION_TRANSLATIONS,
  MODULE_TRANSLATIONS,
} from "../rolePermissionsSidebar/rolePermissionsSidebarModel";

interface IProps {
  user: IAccessUser | null;
  allSystemPermissions: string[];
}

export function useUserPermissionsSidebarState({
  user,
  allSystemPermissions,
}: IProps) {
  const [directPermissionsState, setDirectPermissionsState] = useState<string[]>([]);
  const [deniedPermissionsState, setDeniedPermissionsState] = useState<string[]>([]);
  const [roleGrantedPermissions, setRoleGrantedPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);

  useEffect(() => {
    setSidebarPage(1);
  }, [user, searchQuery]);

  const userPermsUrl = user
    ? ApiRoutes.GET_USER_PERMISSIONS.replace(":id", String(user.id))
    : undefined;

  const { data: userPermsData, isLoading: isUserPermsLoading } = useGetQuery({
    url: userPermsUrl,
    useToken: true,
    options: {
      enabled: !!user,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(false);
  }, [user?.id]);

  useEffect(() => {
    if (!userPermsData) return;
    const rawUserPerms = userPermsData?.data || userPermsData;
    setRoleGrantedPermissions(extractPermNames(rawUserPerms?.role_permissions));
    setDirectPermissionsState(extractPermNames(rawUserPerms?.direct_permissions));
    setDeniedPermissionsState(extractPermNames(rawUserPerms?.denied_permissions));
    setIsInitialized(true);
  }, [userPermsData]);

  const isDataLoading = isUserPermsLoading || !isInitialized;

  const updateDirectM = useMutationQuery({
    url: () =>
      user
        ? ApiRoutes.UPDATE_USER_DIRECT_PERMISSIONS.replace(":id", String(user.id))
        : "",
    method: "PUT",
    messages: {
      success: "Прямые права сохранены",
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS, userPermsUrl || ""],
    },
  });

  const updateDeniedM = useMutationQuery({
    url: () =>
      user
        ? ApiRoutes.UPDATE_USER_DENIED_PERMISSIONS.replace(":id", String(user.id))
        : "",
    method: "PUT",
    messages: {
      success: "Права пользователя сохранены",
      invalidate: [ApiRoutes.GET_USERS, userPermsUrl || ""],
    },
  });

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

  const handleSave = () => {
    updateDirectM.mutate(
      { permissions: directPermissionsState },
      {
        onSuccess: () => {
          updateDeniedM.mutate({ permissions: deniedPermissionsState });
        },
      },
    );
  };

  const filteredGroups = useMemo(() => {
    const groups: Record<string, { label: string; name: string }[]> = {};
    const query = searchQuery.toLowerCase();

    allSystemPermissions.forEach((permName) => {
      const parts = permName.split(".");
      const moduleName = parts[0];
      const actionName = parts.slice(1).join(".");
      const label = ACTION_TRANSLATIONS[actionName] || actionName;

      const moduleTitle = MODULE_TRANSLATIONS[moduleName] || moduleName;
      const matchesModule = moduleTitle.toLowerCase().includes(query);
      const matchesAction =
        label.toLowerCase().includes(query) ||
        permName.toLowerCase().includes(query);

      if (query && !matchesModule && !matchesAction) return;

      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }
      groups[moduleName].push({ label, name: permName });
    });
    return groups;
  }, [allSystemPermissions, searchQuery]);

  const paginatedGroups = useMemo(() => {
    const entries = Object.entries(filteredGroups);
    const start = (sidebarPage - 1) * 3;
    return entries.slice(start, start + 3);
  }, [filteredGroups, sidebarPage]);

  const totalSidebarPages = useMemo(() => {
    const entries = Object.entries(filteredGroups);
    return Math.ceil(entries.length / 3);
  }, [filteredGroups]);

  return {
    directPermissionsState,
    deniedPermissionsState,
    roleGrantedPermissions,
    searchQuery,
    setSearchQuery,
    sidebarPage,
    setSidebarPage,
    isDataLoading,
    filteredGroups,
    paginatedGroups,
    totalSidebarPages,
    handleToggleDirect,
    handleToggleDenied,
    handleSave,
    isPending: updateDirectM.isPending || updateDeniedM.isPending,
  };
}
