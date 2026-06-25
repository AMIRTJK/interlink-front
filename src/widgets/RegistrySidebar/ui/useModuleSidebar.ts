import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { useQueryClient } from "@tanstack/react-query";
import { AppRoutes } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { sideBarIcons } from "../lib/sidebarIcons";
import { buildMenuTree } from "../lib/buildMenuTree";
import { SYSTEM_FOLDERS } from "../lib/constants";

export const useModuleSidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("registry-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("registry-sidebar-collapsed", String(collapsed));
  }, [collapsed]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const isInternal = pathname.includes("/internal");

  const { data: countersData } = useGetQuery({
    url: isInternal
      ? ApiRoutes.GET_INTERNAL_COUNTERS
      : ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
    params: {},
  });

  const counts = useMemo(() => countersData?.data || {}, [countersData]);

  const { data: foldersData, refetch: refetchFolders, isLoading: isFoldersLoading } = useGetQuery({
    url: isInternal ? ApiRoutes.GET_INTERNAL_FOLDERS : ApiRoutes.GET_FOLDERS,
    params: {},
  });

  const { mutate: createFolder } = useMutationQuery({
    url: isInternal ? ApiRoutes.CREATE_INTERNAL_FOLDER : ApiRoutes.CREATE_FOLDER,
    method: "POST",
    messages: {
      onSuccessCb: () => {
        setIsModalOpen(false);
        form.resetFields();
        refetchFolders();
      },
    },
  });

  const { mutate: updateFolder } = useMutationQuery<{
    id: number;
    name: string;
  }>({
    url: (data) =>
      (isInternal ? ApiRoutes.UPDATE_INTERNAL_FOLDER : ApiRoutes.UPDATE_FOLDER).replace(
        ":id",
        String(data.id),
      ),
    method: "PATCH",
    messages: {
      onSuccessCb: () => {
        setIsModalOpen(false);
        form.resetFields();
        refetchFolders();
      },
    },
  });

  const { mutate: deleteFolder } = useMutationQuery<{ id: number }>({
    url: (data) =>
      (isInternal ? ApiRoutes.DELETE_INTERNAL_FOLDER : ApiRoutes.DELETE_FOLDER).replace(
        ":id",
        String(data.id),
      ),
    method: "DELETE",
    messages: {
      onSuccessCb: () => {
        refetchFolders();
      },
    },
  });

  const handleAddClick = useCallback(
    (pId: number | null = null) => {
      setParentId(pId);
      setEditingFolderId(null);
      form.resetFields();
      setIsModalOpen(true);
    },
    [form],
  );

  const handleEditClick = useCallback(
    (folderId: number, currentName: string) => {
      setEditingFolderId(folderId);
      setParentId(null);
      form.setFieldsValue({ name: currentName });
      setIsModalOpen(true);
    },
    [form],
  );

  const onFinish = useCallback(
    (values: { name: string; prefix?: string }) => {
      if (editingFolderId) {
        updateFolder({
          id: editingFolderId,
          name: values.name,
          ...(isInternal && { prefix: values.prefix }),
        });
      } else {
        createFolder({
          name: values.name,
          parent_id: parentId,
          sort: 1,
          ...(isInternal && { prefix: values.prefix }),
        });
      }
    },
    [editingFolderId, parentId, updateFolder, createFolder, isInternal],
  );

  const folders = useMemo(() => {
    const apiData = foldersData?.data;
    if (apiData && typeof apiData === "object" && !Array.isArray(apiData)) {
      return apiData.custom_flat || [];
    }
    return Array.isArray(apiData) ? apiData : [];
  }, [foldersData]);

  const definitions = useMemo(() => {
    // Дефолтные ключи на случай, если бэкенд ещё не прислал массив system
    const defaultFolderKeys = ["inbox", "sent", "drafts", "trash"];
    const systemFoldersKeys = (foldersData?.data?.system as string[]) || defaultFolderKeys;

    const baseMap: Record<string, any> = {
      inbox: {
        title: SYSTEM_FOLDERS.INCOMING,
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING,
        icon: sideBarIcons.incomingIcon,
        count: counts.incoming_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING,
      },
      sent: {
        title: SYSTEM_FOLDERS.OUTGOING,
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
        icon: sideBarIcons.outgoingIcon,
        count: counts.outgoing_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
      },
      drafts: {
        title: SYSTEM_FOLDERS.DRAFTS,
        key: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
        icon: sideBarIcons.draftIcon,
        count: isInternal ? counts.drafts : counts.drafts_total || 0,
        path: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
      },

      trash: {
        title: SYSTEM_FOLDERS.TRASH,
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
          : AppRoutes.CORRESPONDENCE_TRASHED,
        icon: sideBarIcons.garbageIcon,
        count: isInternal ? counts.trash : counts.trash_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
          : AppRoutes.CORRESPONDENCE_TRASHED,
      },
    };

    const finalDefinitions: Record<string, any> = {};

    systemFoldersKeys.forEach((key) => {
      const def = baseMap[key];
      if (def) {
        finalDefinitions[def.title] = {
          key: def.key,
          icon: def.icon,
          count: def.count,
          path: def.path,
          slug: key, // Добавляем оригинальный ключ (inbox, sent и т.д.)
        };
      }
    });

    return finalDefinitions;
  }, [counts, isInternal, foldersData]);

  const queryClient = useQueryClient();


  const finalMenuItems = useMemo(
    () =>
      buildMenuTree({
        folders,
        collapsed: false,
        definitions,
        handleEditClick,
        deleteFolder,
        handleAddClick,
        onNavigate: (path: string) => navigate(path),
        isInternal,
      }),
    [
      folders,
      definitions,
      handleEditClick,
      deleteFolder,
      navigate,
      handleAddClick,
      isInternal,
    ],
  );

  const activeKey = useMemo(() => {
    const folderPathMatch = pathname.match(/\/internal\/folder\/(\d+)/);
    if (folderPathMatch) {
      return `folder-${folderPathMatch[1]}`;
    }
    const urlParams = new URLSearchParams(search);
    const folderIdParam = urlParams.get("folder_id");
    if (folderIdParam) {
      return `folder-${folderIdParam}`;
    }
    return pathname;
  }, [pathname, search]);

  return {
    collapsed,
    setCollapsed,
    isModalOpen,
    setIsModalOpen,
    parentId,
    editingFolderId,
    form,
    finalMenuItems,
    activeKey,
    handleAddClick,
    onFinish,
    navigate,
    pathname,
    isInternal,
    isFoldersLoading,
  };
};
