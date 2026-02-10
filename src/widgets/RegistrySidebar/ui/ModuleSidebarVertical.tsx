import React from "react";
import { motion, LayoutGroup } from "framer-motion";
import { Layout, Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { AppRoutes } from "@shared/config";
import { SidebarItem } from "./SidebarItem";
import { sideBarIcons } from "../lib/sidebarIcons";
import {
  containerVariants,
  itemWrapperVariants,
  layoutHorizontalIcon,
} from "../lib/constants";
import { MenuItem } from "../model";
import Logo from "../../../assets/images/logo.svg";

const { Sider } = Layout;

interface IProps {
  variant: "vertical";
  onVariantChange?: (variant: "horizontal" | "vertical") => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  finalMenuItems: MenuItem[];
  activeKey: string;
  handleAddClick: (pId: number | null) => void;
  navigate: (p: string) => void;
  isInternal: boolean;
}

export const ModuleSidebarVertical: React.FC<IProps> = ({
  variant,
  onVariantChange,
  collapsed,
  setCollapsed,
  finalMenuItems,
  activeKey,
  handleAddClick,
  navigate,
  isInternal,
}) => {
  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      trigger={null}
      width="325px"
      collapsedWidth="80px"
      className={`h-full! border-none! bg-white/50! backdrop-blur-2xl! rounded-3xl! shadow-2xl! shadow-indigo-500/20! ${collapsed ? "p-4!" : "p-6!"} ${
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
          key={`${variant}-${isInternal ? "internal" : "external"}`}
          className="flex-1 overflow-y-auto custom-scrollbar"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <LayoutGroup id="sidebar-items">
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
          </LayoutGroup>
        </motion.div>

        {!collapsed && (
          <div className="px-5 pb-5 text-xs text-gray-400 text-center">
            AM | KM
          </div>
        )}
      </div>
    </Sider>
  );
};
