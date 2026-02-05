import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "../model";
import { cn } from "@shared/lib/utils";
import sidebarArrow from '../../../assets/icons/sidebarArrow.svg?raw'
import { Tooltip } from "antd";

interface SidebarItemProps {
  item: MenuItem;
  isActive: boolean;
  depth?: number;
  collapsed?: boolean;
  activeKey?: string | number;
  index?: number;
}
export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  depth = 0,
  collapsed = false,
  activeKey,
  index = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);
  const toggleOpen = (e: React.MouseEvent) => {
    if (collapsed) return; 
    if (item.children && item.children.length > 0) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = isActive;
  const isCollapsedMode = collapsed && depth === 0;

  const content = (
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: depth === 0 ? 0 : 10 }}
        transition={{ 
          opacity: { 
            delay: depth === 0 ? index * 0.05 : index * 0.08, 
            duration: 0.2 
          },
          x: { 
            delay: (depth === 0 ? index * 0.05 : index * 0.08) + 0.15, 
            duration: 0.35, 
            ease: "easeOut" 
          }
        }}
        whileHover={{ 
          x: isCollapsedMode ? 0 : (depth === 0 ? 1.2 : 8),
          transition: { duration: 0.15, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "flex items-center w-full group focus:outline-none! active:outline-none! border-transparent rounded-2xl cursor-pointer mb-1 relative select-none px-3 py-2",
          isCollapsedMode ? "justify-center px-0" : "gap-1",
          isSelected
            ? (isCollapsedMode 
                ? "text-indigo-700!" 
                : "bg-linear-to-r! from-indigo-400/30! to-purple-400/30! border-white/50! text-indigo-700! shadow-lg! shadow-indigo-200/40!")
            : "text-gray-600! hover:text-indigo-600! hover:shadow-sm hover:shadow-indigo-200/20 transition-shadow duration-200"
        )}
        onClick={(e) => {
             item.onTitleClick?.(e);
        }}
        style={{ paddingLeft: (!isCollapsedMode && depth > 0) ? `8px` : undefined }}
      >
        <div
          className={cn(
            "shrink-0! flex items-center justify-center w-10 h-10",
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
        </div>
        
        {!isCollapsedMode && (
         <div className="flex-1 flex items-center justify-between min-w-0">
           <div className={cn(
             "flex-1 truncate text-xs font-medium tracking-wide",
             isSelected ? "font-semibold" : ""
           )}>
              {item.label}
           </div>
         
           {hasChildren && (
             <div
               onClick={toggleOpen}
               className={cn(
                 "transition-colors duration-200 cursor-pointer p-1 rounded-full hover:bg-black/5 ml-2",
                 isSelected ? "text-purple-600!" : "text-gray-400"
               )}
             >
                <motion.div
                   animate={{ rotate: isOpen ? 0 : -90 }}
                   transition={{ duration: 0.3, ease: "easeInOut" }}
                 >
                   <span 
                     className="flex items-center justify-center w-4 h-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current"
                     dangerouslySetInnerHTML={{ __html: sidebarArrow }}
                   />
                 </motion.div>
             </div>
           )}
         </div>
        )}
      </motion.div>
  );
  return (
    <div className="select-none">
       {isCollapsedMode ? (
           <Tooltip title={item.label} placement="right">
               {content}
           </Tooltip>
       ) : (
           content
       )}

      <AnimatePresence>
        {!isCollapsedMode && hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-1 border-l-2 border-dotted border-indigo-200/50 mt-1">
                {item.children!.map((child: MenuItem, idx: number) => (
                  <SidebarItem
                    key={child.key}
                    item={child}
                    isActive={activeKey === child.key} 
                    depth={depth + 1} 
                    collapsed={collapsed}
                    activeKey={activeKey}
                    index={idx}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
