import "./style.css";
import { useState } from "react";
import { Layout, Menu, Button, ConfigProvider } from "antd";

import { useLocation, useNavigate } from "react-router-dom";

import incomingIcon from "../../assets/icons/incoming-icon.svg";
import outgoingIcon from "../../assets/icons/outgoing-icon.svg";
import archiveIcon from "../../assets/icons/archive-icon.svg";
import pinnedIcon from "../../assets/icons/pinned-icon.svg";
import folderIcon from "../../assets/icons/folder-icon.svg";
import garbageIcon from "../../assets/icons/garbage-icon.svg";
import helpIcon from "../../assets/icons/help-icon.svg";
import settingsIcon from "../../assets/icons/settings-icon.svg";
import collapseIcon from "../../assets/icons/collapse-icon.svg";

import Logo from "../../assets/images/logo.svg";
import { AppRoutes } from "@shared/config";
import { tokenControl, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

const { Sider } = Layout;

export const RegistrySidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [outgoingCount, setOutgoingCount] = useState<number>(() => {
  return Number(tokenControl.getOutgoingLetterCount()) || 0;
});
console.log(setOutgoingCount)
  const mainItems = [
    {
      key: AppRoutes.CORRESPONDENCE_INCOMING,
      icon: <img src={incomingIcon} />,
      label: "Входящие письма",
      count: outgoingCount,
      path: AppRoutes.CORRESPONDENCE_INCOMING,
    },
    {
      key: AppRoutes.CORRESPONDENCE_OUTGOING,
      icon: <img src={outgoingIcon} />,
      label: "Исходящие письма",
      path: AppRoutes.CORRESPONDENCE_OUTGOING,
    },
    {
      key: AppRoutes.CORRESPONDENCE_ARCHIVE,
      icon: <img src={archiveIcon} />,
      label: "Архив",
      path: `#`,
    },
    {
      key: AppRoutes.CORRESPONDENCE_PINNED,
      icon: <img src={pinnedIcon} />,
      label: "Закреплённые",
      path: `#`,
    },
    {
      key: AppRoutes.CORRESPONDENCE_FOLDERS,
      icon: <img src={folderIcon} />,
      label: "Папки",
      path: `#`,
    },
    {
      key: AppRoutes.CORRESPONDENCE_TRASH,
      icon: <img src={garbageIcon} />,
      label: "Корзина",
      path: `#`,
    },
  ];

  const footerItems = [
    {
      key: "help",
      icon: <img src={helpIcon} alt="" />,
      label: "Помощь",
      path: "#",
    },
    {
      key: "settings",
      icon: <img src={settingsIcon} alt="" />,
      label: "Настройки",
      path: "#",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = [...mainItems, ...footerItems].find((i) => i.key === key);
    if (item?.path) {
      navigate(item.path);
    }
  };

  const { isPending } = useGetQuery({
    method: "GET",
    url: ApiRoutes.GET_CORRESPONDENCES,
    options: {
      onSuccess: (data: { data: { total: number } }) => {
        tokenControl.setOutgoingLetterCount(data.data.total);
      },
      enabled: true,
    },
  });


  return (
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
          <Button
            type="text"
            disabled={isPending}
            loading={isPending}
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? "mx-auto" : "ml-auto"}
            icon={<img src={collapseIcon} />}
          />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemHeight: collapsed ? 30 : 56,
                  itemMarginInline: 0,
                  itemMarginBlock: collapsed ? 24 : 4,
                },
              },
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[pathname]}
              onClick={handleMenuClick}
              className="registry-sidebar-style border-none!"
              items={mainItems.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: (
                  <div className="flex justify-between items-center w-full">
                    <span>{item.label}</span>
                    {item.count && !collapsed && (
                      <span className="bg-[#E30613] text-white text-[11px] font-bold px-1.5 rounded-full min-w-6 h-6 flex items-center justify-center">
                        {item.count}
                      </span>
                    )}
                  </div>
                ),
              }))}
            />
          </ConfigProvider>
        </div>

        <div className="shrink-0 pb-4 border-none">
          <div className="h-px bg-[#eceef1] mx-4 mb-4" />
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemHeight: collapsed ? 30 : 56,
                  itemMarginInline: 0,
                  itemMarginBlock: collapsed ? 24 : 4,
                },
              },
            }}
          >
            <Menu
              mode="inline"
              selectable={false}
              onClick={handleMenuClick}
              className="border-none!"
              items={footerItems}
            />
          </ConfigProvider>
        </div>
      </div>
    </Sider>
  );
};
