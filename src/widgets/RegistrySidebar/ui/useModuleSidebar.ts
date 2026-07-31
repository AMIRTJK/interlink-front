import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form } from "antd";
import { useGetQuery } from "@shared/lib";
import { useQueryClient } from "@tanstack/react-query";
import { ApiRoutes } from "@shared/api";
import { buildMenuTree } from "../lib/buildMenuTree";
import { useSidebarFolderMutations } from "./moduleSidebar/useSidebarFolderMutations";
import {
  buildSidebarDefinitions,
  DEFAULT_FOLDER_KEYS,
} from "./moduleSidebar/buildSidebarDefinitions";

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

  const { createFolder, updateFolder, deleteFolder } = useSidebarFolderMutations({
    isInternal,
    form,
    onCloseModal: () => setIsModalOpen(false),
    refetchFolders,
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

  const definitions = useMemo(
    () =>
      buildSidebarDefinitions({
        counts,
        isInternal,
        systemFoldersKeys:
          (foldersData?.data?.system as string[]) || DEFAULT_FOLDER_KEYS,
      }),
    [counts, isInternal, foldersData],
  );

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
