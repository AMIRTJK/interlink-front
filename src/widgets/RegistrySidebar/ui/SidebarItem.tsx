import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MenuItem } from "../model";
import { cn } from "@shared/lib/utils";
import { useLocation } from "react-router-dom";
import { useTabs } from "@shared/lib/hooks";

import { Tooltip } from "antd";
import { RightOutlined, DownOutlined } from "@ant-design/icons";

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
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  },
} as const;

const contentVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
    }
  },
} as const;

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  depth = 0,
  collapsed = false,
  variant = "vertical",
  activeKey,
}) => {
  const checkActiveRecursive = (items?: MenuItem[], currentDepth = 0): boolean => {
    if (!items || currentDepth > 10) return false;
    return items.some(
      (child) => child.key === activeKey || checkActiveRecursive(child.children, currentDepth + 1),
    );
  };

  const [isExpanded, setIsExpanded] = useState(() => checkActiveRecursive(item.children));

  useEffect(() => {
    if (checkActiveRecursive(item.children)) {
      setIsExpanded(true);
    }
  }, [activeKey, item.children]);
  const { addTab, tabMode } = useTabs();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isActive && tabMode === "on") {
      const tabLabel = typeof item.folderName === "string" 
        ? item.folderName 
        : typeof item.label === "string" 
          ? item.label 
          : "Раздел";

      addTab({
        key: pathname,
        path: pathname,
        label: tabLabel,
      });
    }
  }, [isActive, tabMode, pathname, item.folderName, item.label, addTab]);

  
  const toggleOpen = (e: React.MouseEvent) => {
    if (collapsed) return; 
    if (item.children && item.children.length > 0) {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
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
          backgroundColor: "rgba(0, 0, 0, 0.015)",
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center group focus:outline-none! active:outline-none! border border-transparent rounded-2xl cursor-pointer relative select-none px-3 py-2",
          variant === "vertical" ? "w-full" : "max-w-[180px]",
          isCollapsedMode ? "justify-center px-0" : "gap-1",
          isSelected
            ? "text-indigo-700!"
            : "text-gray-600! hover:text-indigo-600! hover:shadow-sm hover:shadow-indigo-200/20 transition-all duration-300",
          item.folderName === "Создать новую папку" && "opacity-80"
        )}
        onClick={(e) => {
             item.onTitleClick?.(e);
        }}
        style={{ paddingLeft: (!isCollapsedMode && depth > 0) ? `${depth * 16}px` : undefined }}
      >
        {isSelected && (
          <motion.div
            layoutId="active-pill"
            className={cn(
               "absolute border-white/50! active-pill-shadow!",
               isCollapsedMode 
                 ? "w-10 h-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full! from-indigo-500/15! to-purple-500/15! bg-linear-to-r!" 
                 : "inset-0 rounded-2xl bg-linear-to-r! from-indigo-400/20! to-purple-400/20!",
               depth > 0 && !isCollapsedMode && "from-indigo-300/10! to-purple-300/10!"
            )}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
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
                 "transition-colors duration-200 cursor-pointer p-1 rounded-full hover:bg-black/5 ml-2",
                 isSelected ? "text-purple-600!" : "text-gray-400"
               )}
             >
                <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                   <RightOutlined className="w-3.5 h-3.5" />
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
      initial="visible"
      animate="visible"
      className="select-none"
    >
       {isCollapsedMode ? (
           <Tooltip title={item.label} placement="right">
               {content}
           </Tooltip>
       ) : (
           content
       )}

        <motion.div
         animate={{ 
           height: isExpanded ? "auto" : 0,
           opacity: isExpanded ? 1 : 0,
         }}
         initial={false}
         transition={{ duration: 0.3, ease: "easeInOut" }}
         className="overflow-hidden"
       >
         {isExpanded && item.children && (
           <div className="flex flex-col gap-1 mt-1">
             {item.children.map((child: MenuItem, idx: number) => (
               <SidebarItem
                 key={child.key || `sub-${idx}`}
                 item={child}
                 isActive={activeKey === child.key}
                 depth={depth + 1}
                 collapsed={collapsed}
                 activeKey={activeKey}
                 variant={variant}
               />
             ))}
           </div>
         )}
       </motion.div>
    </motion.div>
  );
};
