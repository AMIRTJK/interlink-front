import React, { useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import "./style.css";
import { PlusOutlined } from "@ant-design/icons";
import { Layout, Button, App, Form } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { _axios, ApiRoutes } from "@shared/api";
import Logo from "../../../assets/images/logo.svg";
import { toast } from "react-toastify";

import { sideBarIcons } from "../lib/sidebarIcons";
import { buildMenuTree } from "../lib/buildMenuTree";
import { SidebarItem } from "./SidebarItem";
import { FolderModal } from "./FolderModal";

const { Sider } = Layout;

export const ModuleSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
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
        icon: <img src={sideBarIcons.incomingIcon} />,
        count: counts.incoming_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING,
      },
      Исходящие: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
        icon: <img src={sideBarIcons.outgoingIcon} />,
        count: counts.outgoing_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
          : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
      },
      ...(isInternal
        ? {
            Черновики: {
              key: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
              icon: <img src={sideBarIcons.incomingIcon} />,

              count: isInternal ? counts.drafts : counts.drafts_total || 0,
              path: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
            },
          }
        : {}),
      Архив: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_ARCHIVE
          : AppRoutes.CORRESPONDENCE_ARCHIVE,
        icon: <img src={sideBarIcons.archiveIcon} />,
        count: counts.archived_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_ARCHIVE
          : AppRoutes.CORRESPONDENCE_ARCHIVE,
      },
      Закреплённые: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_PINNED
          : AppRoutes.CORRESPONDENCE_PINNED,
        icon: <img src={sideBarIcons.pinnedIcon} />,
        count: counts.pinned_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_PINNED
          : AppRoutes.CORRESPONDENCE_PINNED,
      },
      Корзина: {
        key: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
          : AppRoutes.CORRESPONDENCE_TRASHED,
        icon: <img src={sideBarIcons.garbageIcon} />,
        count: isInternal ? counts.trash : counts.trash_total,
        path: isInternal
          ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
          : AppRoutes.CORRESPONDENCE_TRASHED,
      },
    }),
    [counts, isInternal],
  );

  const queryClient = useQueryClient();
  const { mutate: moveItem } = useMutation({
    mutationFn: async (data: {
      id: number;
      folder_id: number | null;
      type: "folder" | "correspondence";
    }) => {
      // Пользователь обновил роут на /api/v1/correspondences/:DOC_ID/move
      const url = ApiRoutes.MOVE_FOLDER.replace(":DOC_ID", String(data.id));

      const response = await _axios({
        url,
        method: "PATCH",
        data: { folder_id: data.folder_id },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Ошибка перемещения");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Перемещено");
      refetchFolders();
      queryClient.invalidateQueries({
        queryKey: [ApiRoutes.GET_CORRESPONDENCES],
      });
      window.dispatchEvent(new CustomEvent("correspondence-moved"));
    },
    onError: (error: any) => {
      toast.error(error.message || "Ошибка при перемещении");
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
        type: draggedType,
      });
    },
    [moveItem],
  );

  const finalMenuItems = useMemo(
    () =>
      buildMenuTree({
        // counts,
        // navigate,
        folders,
        collapsed,
        definitions,
        handleEditClick,
        deleteFolder,
        handleAddClick,
        onNavigate: (path: string) => navigate(path),
        onDrop: handleDrop,
      }),
    [
      folders,
      collapsed,
      definitions,
      handleEditClick,
      deleteFolder,
      navigate,
      handleAddClick,
      handleDrop,
    ],
  );



  const [searchParams] = useSearchParams();
  const folderIdParam = searchParams.get("folderId");

  const activeKey = useMemo(() => {
    if (folderIdParam) {
      return `folder-${folderIdParam}`;
    }
    return pathname;
  }, [pathname, folderIdParam]);

  return (
    <App>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width="325px"
        collapsedWidth="80px"
        className={`h-full! border-none! rounded-2xl p-3 ${
          collapsed ? "w-[80px]! max-w-[80px]!" : "w-[260px]! max-w-[260px]!"
        }`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center shrink-0 py-6 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && (
              <div
                className="cursor-pointer"
                onClick={() => navigate(AppRoutes.PROFILE)}
              >
                <img src={Logo} alt="logo" />
              </div>
            )}
            <div className="flex items-center gap-2">
              {!collapsed && (
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddClick(null)}
                  className="h-6! w-6! hidden! addFolderRootSideBar"
                />
              )}
              <Button
                type="text"
                onClick={() => setCollapsed(!collapsed)}
                className={collapsed ? "mx-auto h-7! w-7!" : "ml-auto"}
                icon={<img src={sideBarIcons.collapseIcon} />}
              />
            </div>
          </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {finalMenuItems.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              isActive={[activeKey].includes(item.key as string)}
            />
          ))}
        </div>

        {!collapsed && (
          <div className="px-5 pb-5 text-xs text-gray-400 text-center">
            AM | KM
          </div>
        )}
      </div>

      <FolderModal
        isOpen={isModalOpen}
        isEditing={!!editingFolderId}
        parentId={parentId}
        form={form}
        onCancel={() => setIsModalOpen(false)}
        onFinish={onFinish}
      />
    </Sider>
  </App>
  );
};
