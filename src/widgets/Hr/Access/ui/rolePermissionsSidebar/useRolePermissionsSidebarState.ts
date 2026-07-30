import { useState, useEffect, useMemo } from "react";
import { Modal } from "antd";
import { ApiRoutes } from "@shared/api";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import {
  ACTION_TRANSLATIONS,
  MODULE_TRANSLATIONS,
} from "./rolePermissionsSidebarModel";

interface IRole {
  id: number;
  name: string;
  permissions?: string[] | { name: string }[];
}

interface IProps {
  role: IRole | null;
  allSystemPermissions: string[];
  onClose: () => void;
}

export function useRolePermissionsSidebarState({
  role,
  allSystemPermissions,
  onClose,
}: IProps) {
  const [rolePermissionsState, setRolePermissionsState] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);

  useEffect(() => {
    setSidebarPage(1);
  }, [role, searchQuery]);

  const { data: roleDetailData } = useGetQuery({
    url: role ? ApiRoutes.GET_ROLE.replace(":id", String(role.id)) : undefined,
    useToken: true,
    options: {
      enabled: !!role,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  });

  useEffect(() => {
    const freshRole = roleDetailData?.data || roleDetailData;
    const list: string[] = [];
    if (freshRole && Array.isArray(freshRole.permissions)) {
      freshRole.permissions.forEach((p: any) => {
        const name = typeof p === "string" ? p : p?.name;
        if (name) list.push(name);
      });
    }
    setRolePermissionsState(list);
  }, [roleDetailData]);

  const updateRoleM = useMutationQuery({
    url: () =>
      role ? ApiRoutes.UPDATE_ROLE.replace(":id", String(role.id)) : "",
    method: "PUT",
    messages: {
      success: "Права роли успешно сохранены",
      invalidate: [ApiRoutes.GET_ROLES],
    },
  });

  const deleteRoleM = useMutationQuery({
    url: () =>
      role ? ApiRoutes.DELETE_ROLE.replace(":id", String(role.id)) : "",
    method: "DELETE",
    messages: {
      success: "Роль успешно удалена",
      invalidate: [ApiRoutes.GET_ROLES],
    },
  });

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

  const handleTogglePermission = (permissionName: string) => {
    setRolePermissionsState((prev) => {
      if (prev.includes(permissionName)) {
        return prev.filter((p) => p !== permissionName);
      } else {
        return [...prev, permissionName];
      }
    });
  };

  const handleSave = () => {
    if (!role) return;
    updateRoleM.mutate(
      { name: role.name, permissions: rolePermissionsState },
      { onSuccess: () => onClose() },
    );
  };

  const handleDelete = () => {
    if (!role) return;
    Modal.confirm({
      title: "Удалить роль?",
      content: "Это действие необратимо.",
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: () => {
        deleteRoleM.mutate({}, { onSuccess: () => onClose() });
      },
    });
  };

  const colors = useMemo(() => {
    if (!role) return { bg: "bg-slate-50 text-slate-500" };
    const name = role.name.toLowerCase();
    if (name.includes("администратор") || name.includes("admin"))
      return { bg: "bg-blue-50 text-blue-600" };
    if (name.includes("делопроизводитель") || name.includes("recipient"))
      return { bg: "bg-emerald-50 text-emerald-600" };
    if (name.includes("руководитель") || name.includes("signer"))
      return { bg: "bg-orange-50 text-orange-600" };
    if (name.includes("исполнитель") || name.includes("approval"))
      return { bg: "bg-indigo-50 text-indigo-600" };
    if (name.includes("контрол") || name.includes("control"))
      return { bg: "bg-purple-50 text-purple-600" };
    return { bg: "bg-slate-50 text-slate-500" };
  }, [role?.name]);

  return {
    rolePermissionsState,
    searchQuery,
    setSearchQuery,
    sidebarPage,
    setSidebarPage,
    filteredGroups,
    paginatedGroups,
    totalSidebarPages,
    handleTogglePermission,
    handleSave,
    handleDelete,
    colors,
    isUpdatePending: updateRoleM.isPending,
    isDeletePending: deleteRoleM.isPending,
  };
}
