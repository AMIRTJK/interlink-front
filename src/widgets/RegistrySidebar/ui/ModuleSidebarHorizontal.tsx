import React from "react";
import { motion, LayoutGroup } from "framer-motion";
import { Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SidebarItem } from "./SidebarItem";
import {
  containerVariants,
  itemWrapperVariants,
  layoutVerticalIcon,
} from "../lib/constants";
import { MenuItem } from "../model";

interface IProps {
  variant: "horizontal";
  onVariantChange?: (variant: "horizontal" | "vertical") => void;
  finalMenuItems: MenuItem[];
  activeKey: string;
  handleAddClick: (pId: number | null) => void;
  isInternal: boolean;
}

export const ModuleSidebarHorizontal: React.FC<IProps> = ({
  variant,
  onVariantChange,
  finalMenuItems,
  activeKey,
  handleAddClick,
  isInternal,
}) => {
  return (
    <div className="w-full border-none! bg-white/70 backdrop-blur-xl! transition-colors duration-500 rounded-b-2xl shadow-inner py-2.5 px-6">
      <div className="flex items-center gap-6 h-full">
        <div className="flex items-center shrink-0 gap-2">
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => handleAddClick(null)}
            className="h-8! w-8! rounded-full! hover:bg-indigo-50! text-gray-500 hover:text-indigo-600"
          />
          <Tooltip title="Вертикальный вид" placement="bottom">
            <Button
              type="text"
              icon={
                <span
                  dangerouslySetInnerHTML={{ __html: layoutVerticalIcon }}
                  className="flex items-center justify-center transition-all"
                />
              }
              onClick={() => onVariantChange?.("vertical")}
              className="h-8! w-8! rounded-full! hover:bg-gray-100! group text-gray-500 hover:text-indigo-600"
            />
          </Tooltip>
        </div>

        <motion.div
          key={`${variant}-${isInternal ? "internal" : "external"}`}
          className="flex-1 flex flex-row items-start gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <LayoutGroup id="sidebar-items">
            {finalMenuItems.map((item, index) => (
              <motion.div
                key={item.key}
                variants={itemWrapperVariants}
                className="shrink-0 min-w-[170px]"
              >
                <SidebarItem
                  item={item}
                  isActive={[activeKey].includes(item.key as string)}
                  collapsed={false}
                  activeKey={activeKey}
                  index={index}
                  variant={variant}
                />
              </motion.div>
            ))}
          </LayoutGroup>
        </motion.div>
      </div>
    </div>
  );
};
