import { useMemo, useState, useCallback } from "react";
import { Layout, Menu, Button, ConfigProvider, App, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";
import { AppRoutes } from "@shared/config";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { FolderModal } from "./ui/FolderModal";
import { buildMenuTree } from "./lib/buildMenuTree";
import { sideBarIcons } from "./lib/sidebarIcons";
import "./style.css";

const { Sider } = Layout;

export const RegistrySidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: countersData } = useGetQuery({
    url: ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
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
      "Входящие письма": {
        key: AppRoutes.CORRESPONDENCE_INCOMING,
        icon: <img src={sideBarIcons.incomingIcon} />,
        count: counts.incoming_total,
        path: AppRoutes.CORRESPONDENCE_INCOMING,
      },
      "Исходящие письма": {
        key: AppRoutes.CORRESPONDENCE_OUTGOING,
        icon: <img src={sideBarIcons.outgoingIcon} />,
        count: counts.outgoing_total,
        path: AppRoutes.CORRESPONDENCE_OUTGOING,
      },
      Архив: {
        key: AppRoutes.CORRESPONDENCE_ARCHIVE,
        icon: <img src={sideBarIcons.archiveIcon} />,
        count: counts.archived_total,
        path: AppRoutes.CORRESPONDENCE_ARCHIVE,
      },
      Закреплённые: {
        key: AppRoutes.CORRESPONDENCE_PINNED,
        icon: <img src={sideBarIcons.pinnedIcon} />,
        count: counts.pinned_total,
        path: AppRoutes.CORRESPONDENCE_PINNED,
      },
      Корзина: {
        key: AppRoutes.CORRESPONDENCE_TRASHED,
        icon: <img src={sideBarIcons.garbageIcon} />,
        count: counts.trash_total,
        path: AppRoutes.CORRESPONDENCE_TRASHED,
      },
    }),
    [counts],
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
      }),
    [folders, collapsed, definitions, handleEditClick, deleteFolder],
  );

  const footerItems = useMemo(
    () => [
      {
        key: "help",
        icon: <img src={sideBarIcons.helpIcon} alt="" />,
        label: "Помощь",
        path: "#",
      },
      {
        key: "settings",
        icon: <img src={sideBarIcons.settingsIcon} alt="" />,
        label: "Настройки",
        path: "#",
      },
    ],
    [],
  );

  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      const findInTree = (items: any[], searchKey: string): any => {
        for (const item of items) {
          if (item.key === searchKey) return item;
          if (item.children) {
            const found = findInTree(item.children, searchKey);
            if (found) return found;
          }
        }
        return null;
      };

      const item = findInTree([...finalMenuItems, ...footerItems], key);

      if (key.startsWith("create-placeholder-")) {
        const parentFolderId = item?.parent_id || null;
        handleAddClick(parentFolderId);
        return;
      }

      if (item?.path && !item.path.startsWith("#")) {
        navigate(item.path);
      }
    },
    [finalMenuItems, footerItems, navigate, handleAddClick],
  );

  const menuTheme = useMemo(
    () => ({
      components: {
        Menu: {
          itemHeight: collapsed ? 30 : 56,
          itemMarginInline: 0,
          itemMarginBlock: collapsed ? 24 : 4,
        },
      },
    }),
    [collapsed],
  );

  return (
    <App>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        trigger={null}
        width="100%"
        collapsedWidth="80px"
        className="h-full! border-none! rounded-2xl p-6 w-[23%]!"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between py-6 shrink-0">
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
                  className="h-6! w-6!"
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

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <ConfigProvider theme={menuTheme}>
              <Menu
                mode="inline"
                selectedKeys={[pathname]}
                onClick={handleMenuClick}
                className={`registry-sidebar-style border-none! ${collapsed ? "collapsed-style" : ""}`}
                items={finalMenuItems}
              />
            </ConfigProvider>
          </div>

          <div className="shrink-0 pb-4 border-none pt-6">
            <ConfigProvider theme={menuTheme}>
              <Menu
                mode="inline"
                selectable={false}
                onClick={handleMenuClick}
                className={`registry-sidebar-style border-none! ${collapsed ? "collapsed-style" : ""}`}
                items={footerItems}
              />
            </ConfigProvider>
          </div>
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
