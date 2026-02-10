import React, { useState } from "react";
import { motion } from "framer-motion";
import { MenuItem } from "../model";
import { cn } from "@shared/lib/utils";

import { Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { ExpandedFolderViewModal } from "./ExpandedFolderViewModal";

interface SidebarItemProps {
  item: MenuItem;
  isActive: boolean;
  depth?: number;
  collapsed?: boolean;
  activeKey?: string | number;
  index?: number;
  variant?: "horizontal" | "vertical";
}

const rowVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
    }
  },
};

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  depth = 0,
  collapsed = false,
  variant = "vertical",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const toggleOpen = (e: React.MouseEvent) => {
    if (collapsed) return; 
    if (item.children && item.children.length > 0) {
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = isActive;
  const isCollapsedMode = collapsed && depth === 0;

  const content = (
      <motion.div
        variants={rowVariants}
        initial="visible"
        whileHover={{ 
          transition: { duration: 0.15 }
        }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "flex items-center group focus:outline-none! active:outline-none! border border-transparent rounded-2xl cursor-pointer relative select-none px-3 py-2",
          variant === "vertical" ? "w-full" : "max-w-[180px]",
          isCollapsedMode ? "justify-center px-0" : "gap-1",
          isSelected
            ? "text-indigo-700!"
            : "text-gray-600! hover:text-indigo-600! hover:shadow-sm hover:shadow-indigo-200/20 transition-all duration-300",
          item.folderName === "Создать новую папку" && "crtChildrenFolderHidden",
          variant === "horizontal" && "crtChildrenFolderHidden"
        )}
        onClick={(e) => {
             item.onTitleClick?.(e);
        }}
        style={{ paddingLeft: (!isCollapsedMode && depth > 0) ? `8px` : undefined }}
      >
        {isSelected && (
          <motion.div
            layoutId="active-pill"
            className={cn(
               "absolute border-white/50! shadow-lg! shadow-indigo-200/40!",
               isCollapsedMode 
                 ? "w-10 h-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full! shadow-md! from-indigo-500/20! to-purple-500/20! bg-linear-to-r!" 
                 : "inset-0 rounded-2xl bg-linear-to-r! from-indigo-400/30! to-purple-400/30!",
               depth > 0 && !isCollapsedMode && "from-indigo-300/20! to-purple-300/20! shadow-sm!"
            )}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            style={{ zIndex: -1 }}
          />
        )}
        <motion.div
          variants={contentVariants}
          className={cn(
            "shrink-0! flex items-center justify-center w-8 h-8 transition-all duration-300 [&_svg_path]:stroke-current!",
            isSelected && !isCollapsedMode && "bg-[#EEF2FF] rounded-xl",
            isSelected
              ? "text-indigo-600! shadow-indigo-200/40"
              : cn(
                  "group-hover:text-indigo-600!",
                  depth === 0 ? "text-indigo-500!" :
                  depth === 1 ? "text-blue-500!" :
                  depth === 2 ? "text-violet-500!" :
                  depth === 3 ? "text-pink-500!" :
                  depth === 4 ? "text-orange-500!" :
                  "text-teal-500!"
                )
          )}
        >
          {typeof item.icon === 'string' ? (
            <span 
              className="flex items-center justify-center w-5 h-5"
              dangerouslySetInnerHTML={{ __html: item.icon }}
            />
          ) : (
            item.icon
          )}
        </motion.div>
        
        {!isCollapsedMode && (
         <div className="flex-1 flex items-center justify-between min-w-0">
           <motion.div variants={contentVariants} className={cn(
             "flex-1 text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-300",
             isSelected ? "font-semibold" : ""
           )}>
              {item.label}
           </motion.div>
         
           {hasChildren && (
             <motion.div
               variants={contentVariants}
               onClick={toggleOpen}
               className={cn(
                 "transition-colors duration-200 cursor-pointer p-1 rounded-full hover:bg-black/5 ml-2 crtChildrenFolderHidden",
                 isSelected ? "text-purple-600!" : "text-gray-400"
               )}
             >
                <motion.div
                    transition={{ duration: 0.3 }}
                  >
                   <EyeOutlined className="w-4 h-4" />
                 </motion.div>
             </motion.div>
           )}
         </div>
        )}
      </motion.div>
  );

  return (
    <motion.div 
      variants={rowVariants}
      className="select-none"
    >
       {isCollapsedMode ? (
           <Tooltip title={item.label} placement="right">
               {content}
           </Tooltip>
       ) : (
           content
       )}
       
       <ExpandedFolderViewModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         folder={item}
       />
    </motion.div>
  );
};
