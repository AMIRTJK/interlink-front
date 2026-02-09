import React, { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import "./style.css";
import { PlusOutlined } from "@ant-design/icons";
import { Layout, Button, App, Form, Tooltip } from "antd";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { _axios, ApiRoutes } from "@shared/api";
import Logo from "../../../assets/images/logo.svg";
import { toast } from "react-toastify";

import { sideBarIcons } from "../lib/sidebarIcons";
import { buildMenuTree } from "../lib/buildMenuTree";
import { SidebarItem } from "./SidebarItem";
import { FolderModal } from "./FolderModal";

const layoutHorizontalIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/></svg>`;
const layoutVerticalIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>`;


const { Sider } = Layout;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemWrapperVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const ModuleSidebar = ({
  variant = "horizontal",
  onVariantChange,
}: {
  variant?: "horizontal" | "vertical";
  onVariantChange?: (variant: "horizontal" | "vertical") => void;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const [hasAnimated, setHasAnimated] = useState(false);

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
      ["На подпись"]: {
        key: isInternal ? AppRoutes.CORRESPONDENCE_INTERNAL_TO_SIGN : "",
        icon: sideBarIcons.draftIcon,
        count: counts.to_sign,
        path: isInternal ? AppRoutes.CORRESPONDENCE_INTERNAL_TO_SIGN : "",
      },
      ["На согласование"]: {
        key: isInternal ? AppRoutes.CORRESPONDENCE_INTERNAL_TO_APPROVE : "",
        icon: sideBarIcons.draftIcon,
        count: counts.to_approve,
        path: isInternal ? AppRoutes.CORRESPONDENCE_INTERNAL_TO_APPROVE : "",
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
  const { mutate: moveItem } = useMutation({
    mutationFn: async (data: {
      id: number;
      folder_id: number | null;
      type: "folder" | "correspondence";
    }) => {
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
    onError: (error: Error) => {
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

  const [searchParams] = useSearchParams();
  const folderIdParam = searchParams.get("folderId");

  const activeKey = useMemo(() => {
    if (folderIdParam) {
      return `folder-${folderIdParam}`;
    }
    return pathname;
  }, [pathname, folderIdParam]);

  if (variant === "horizontal") {
    return (
      <App>
        <div className="w-full border-none! bg-white/50! backdrop-blur-2xl! rounded-xl! shadow-2xl! shadow-indigo-500/20! pt-0 px-4 pb-4!">
          <div className="flex items-center gap-6 h-full">
            <div className="flex items-center shrink-0 gap-2">
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleAddClick(null)}
                className="h-8! w-8! rounded-full! hover:bg-indigo-50!"
              />
              <Tooltip title="Вертикальный вид" placement="bottom">
                <Button
                  type="text"
                  icon={
                    <span 
                      dangerouslySetInnerHTML={{ __html: layoutVerticalIcon }} 
                      className="flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:text-indigo-600 transition-all" 
                    />
                  }
                  onClick={() => onVariantChange?.("vertical")}
                  className="h-8! w-8! rounded-full! hover:bg-gray-100! group"
                />
              </Tooltip>
            </div>

            <motion.div
              className="flex-1 flex flex-row items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1"
              initial={hasAnimated ? false : "hidden"}
              animate="visible"
              variants={containerVariants}
              onAnimationComplete={() => {
                setHasAnimated(true);
              }}
            >
              {finalMenuItems.map((item, index) => (
                <div key={item.key} className="shrink-0 min-w-max">
                  <SidebarItem
                    item={item}
                    isActive={[activeKey].includes(item.key as string)}
                    collapsed={false}
                    activeKey={activeKey}
                    index={index}
                    variant={variant}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          <FolderModal
            isOpen={isModalOpen}
            isEditing={!!editingFolderId}
            parentId={parentId}
            form={form}
            onCancel={() => setIsModalOpen(false)}
            onFinish={onFinish}
          />
        </div>
      </App>
    );
  }

  return (
    <App>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width="325px"
        collapsedWidth="80px"
        className={`h-full! border-none! bg-white/50! backdrop-blur-2xl! rounded-3xl! shadow-2xl! shadow-indigo-500/20! p-6! ${
          collapsed ? "w-[80px]! max-w-[80px]!" : "w-[300px]! max-w-[340px]!"
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
                  className="h-6! w-6! addFolderRootSideBar"
                />
              )}
                <Button
                  type="text"
                  onClick={() => setCollapsed(!collapsed)}
                  className={
                    collapsed
                      ? "mx-auto h-7! w-7! outline-none! focus:outline-none!"
                      : "ml-auto outline-none! focus:outline-none!"
                }
                icon={<img src={sideBarIcons.collapseIcon} alt="collapse" />}
                />
                {!collapsed && (
                  <Tooltip title="Горизонтальный вид" placement="right">
                    <Button
                      type="text"
                      icon={
                        <span 
                          dangerouslySetInnerHTML={{ __html: layoutHorizontalIcon }} 
                          className="flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:text-indigo-600 transition-all" 
                        />
                      }
                      onClick={() => onVariantChange?.("horizontal")}
                      className="h-7! w-7! flex items-center justify-center hover:bg-black/5 rounded-lg group"
                    />
                  </Tooltip>
                )}
            </div>
          </div>

          <motion.div
            className="flex-1 overflow-y-auto custom-scrollbar"
            initial={hasAnimated ? false : "hidden"}
            animate="visible"
            variants={containerVariants}
            onAnimationComplete={() => {
              setHasAnimated(true);
            }}
          >
            {finalMenuItems.map((item, index) => (
              <motion.div key={item.key} variants={itemWrapperVariants}>
                <SidebarItem
                  item={item}
                  isActive={[activeKey].includes(item.key as string)}
                  collapsed={collapsed}
                  activeKey={activeKey}
                  index={index}
                  variant={variant}
                />
              </motion.div>
            ))}
          </motion.div>

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
