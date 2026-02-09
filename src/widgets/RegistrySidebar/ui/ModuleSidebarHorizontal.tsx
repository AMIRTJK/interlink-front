import React from "react";
import { motion } from "framer-motion";
import { Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SidebarItem } from "./SidebarItem";
import { containerVariants, itemWrapperVariants, layoutVerticalIcon } from "../lib/constants";
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
          key={`${variant}-${isInternal ? 'internal' : 'external'}`}
          className="flex-1 flex flex-row items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {finalMenuItems.map((item, index) => (
            <motion.div key={item.key} variants={itemWrapperVariants} className="shrink-0 w-[160px]">
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
        </motion.div>
      </div>
    </div>
  );
};
