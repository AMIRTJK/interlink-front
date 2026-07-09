import React from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SidebarItem } from "./SidebarItem";
import {
  containerVariants,
  itemWrapperVariants,
  layoutVerticalIcon,
} from "../lib/constants";
import { MenuItem } from "../model";
import { Tooltip } from "@shared/ui";

interface IProps {
  variant: "horizontal";
  onVariantChange?: (variant: "horizontal" | "vertical") => void;
  finalMenuItems: MenuItem[];
  activeKey: string;
  handleAddClick: (pId: number | null) => void;
  isLoading?: boolean;
}

export const ModuleSidebarHorizontal: React.FC<IProps> = ({
  variant,
  onVariantChange,
  finalMenuItems,
  activeKey,
  handleAddClick,
}) => {
  return (
    <div className="w-full border border-gray-200/80! dark:border-slate-700/80! bg-white! dark:bg-slate-900! shadow-md! transition-colors duration-500 rounded-3xl! py-2.5 px-6">
      <div className="flex items-center gap-6 h-full">
        <div className="flex items-center shrink-0 gap-2">
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => handleAddClick(null)}
            className="h-8! w-8! rounded-full! hover:bg-indigo-50! dark:hover:bg-indigo-950/40! text-gray-500! dark:text-slate-400! hover:text-indigo-600"
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
              className="h-8! w-8! rounded-full! hover:bg-gray-100! dark:hover:bg-slate-700! group text-gray-500! dark:text-slate-400! hover:text-indigo-600"
            />
          </Tooltip>
        </div>

        <motion.div
          key={variant}
          className="flex-1 flex flex-row items-start gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1"
        >
          <LayoutGroup id="sidebar-items">
            <AnimatePresence>
              {finalMenuItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  className="shrink-0 min-w-[170px]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 120,
                  }}
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
            </AnimatePresence>
          </LayoutGroup>
        </motion.div>
      </div>
    </div>
  );
};
