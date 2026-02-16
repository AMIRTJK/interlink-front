import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { useQueryClient } from "@tanstack/react-query";
import { AppRoutes } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { sideBarIcons } from "../lib/sidebarIcons";
import { buildMenuTree } from "../lib/buildMenuTree";

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
  const { pathname } = useLocation();

  const isInternal = pathname.includes(AppRoutes.CORRESPONDENCE_OUTGOING);

  const { data: countersData } = useGetQuery({
    url: isInternal
      ? ApiRoutes.GET_INTERNAL_COUNTERS
      : ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
    params: {},
  });

  const counts = useMemo(() => countersData?.data || {}, [countersData]);

  const { data: foldersData, refetch: refetchFolders } = useGetQuery({
    url: ApiRoutes.GET_FOLDERS,
    params: {},
  });

  const { mutate: createFolder } = useMutationQuery({
    url: ApiRoutes.CREATE_FOLDER,
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
    url: (data) => ApiRoutes.UPDATE_FOLDER.replace(":id", String(data.id)),
    method: "PUT",
    messages: {
      onSuccessCb: () => {
        setIsModalOpen(false);
        form.resetFields();
        refetchFolders();
      },
    },
  });

  const { mutate: deleteFolder } = useMutationQuery<{ id: number }>({
    url: (data) => ApiRoutes.DELETE_FOLDER.replace(":id", String(data.id)),
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
    (values: { name: string }) => {
      if (editingFolderId) {
        updateFolder({
          id: editingFolderId,
          name: values.name,
        });
      } else {
        createFolder({
          name: values.name,
          parent_id: parentId,
          sort: 1,
        });
      }
    },
    [editingFolderId, parentId, updateFolder, createFolder],
  );

  const folders = useMemo(() => foldersData?.data || [], [foldersData]);

  const definitions = useMemo(
    () => ({
      Входящие: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING,
        icon: sideBarIcons.incomingIcon,
        count: counts.incoming_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING,
      },
      Исходящие: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
        icon: sideBarIcons.outgoingIcon,
        count: counts.outgoing_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
      },
      ...(isInternal
        ? {
            Черновики: {
              key: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
              icon: sideBarIcons.draftIcon,
              count: isInternal ? counts.drafts : counts.drafts_total || 0,
              path: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
            },
          }
        : {}),
      Архив: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_ARCHIVE
          : AppRoutes.CORRESPONDENCE_ARCHIVE,
        icon: sideBarIcons.archiveIcon,
        count: counts.archived_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_ARCHIVE
          : AppRoutes.CORRESPONDENCE_ARCHIVE,
      },
      Закреплённые: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_PINNED
          : AppRoutes.CORRESPONDENCE_PINNED,
        icon: sideBarIcons.pinnedIcon,
        count: counts.pinned_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_PINNED
          : AppRoutes.CORRESPONDENCE_PINNED,
      },
      Корзина: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
          : AppRoutes.CORRESPONDENCE_TRASHED,
        icon: sideBarIcons.garbageIcon,
        count: isInternal ? counts.trash : counts.trash_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
          : AppRoutes.CORRESPONDENCE_TRASHED,
      },
    }),
    [counts, isInternal],
  );

  const queryClient = useQueryClient();

  const { mutate: moveItem } = useMutationQuery<{
    id: number;
    folder_id: number | null;
  }>({
    url: (data) => {
      const route = isInternal ? ApiRoutes.INTERNAL_MOVE_FOLDER : ApiRoutes.MOVE_FOLDER;
      return route.replace(isInternal ? ":id" : ":DOC_ID", String(data.id));
    },
    method: "PATCH",
    messages: {
      onSuccessCb: () => {
        refetchFolders();
        queryClient.invalidateQueries({
          queryKey: [ApiRoutes.GET_CORRESPONDENCES],
        });
        window.dispatchEvent(new CustomEvent("correspondence-moved"));
      },
      success: "Перемещено",
      onErrorCb: () => {
        // Ошибка обрабатывается внутри useMutationQuery через toast
      }
    },
  });

  const handleDrop = useCallback(
    (
      targetFolderId: number | null,
      draggedType: "folder" | "correspondence",
      draggedId: number,
    ) => {
      if (draggedType === "folder" && targetFolderId === draggedId) return;
      moveItem({
        id: draggedId,
        folder_id: targetFolderId,
      });
    },
    [moveItem],
  );

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
        onDrop: handleDrop,
      }),
    [
      folders,
      definitions,
      handleEditClick,
      deleteFolder,
      navigate,
      handleAddClick,
      handleDrop,
    ],
  );

  const activeKey = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const folderIdParam = urlParams.get("folder_id");
    if (folderIdParam) {
      return `folder-${folderIdParam}`;
    }
    return pathname;
  }, [pathname]);

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
  };
};
