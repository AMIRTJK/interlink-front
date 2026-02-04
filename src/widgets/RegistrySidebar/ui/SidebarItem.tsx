import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "../model";
import { cn } from "@shared/lib/utils";
import sidebarArrow from '../../../assets/icons/sidebarArrow.svg'
import { Tooltip } from "antd";

interface SidebarItemProps {
  item: MenuItem;
  isActive: boolean;
  depth?: number;
  collapsed?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  depth = 0,
  collapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  const toggleOpen = (e: React.MouseEvent) => {
    if (collapsed) return; // В свернутом состоянии клик не должен раскрывать аккордеон внизу
    if (item.children && item.children.length > 0) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = isActive;
  
  // Если сайдбар свернут, показываем только иконку по центру
  // Для вложенных элементов collapsed всегда false (так как они внутри меню)
  const isCollapsedMode = collapsed && depth === 0;

  const content = (
      <div
        className={cn(
          "flex items-center w-full transition-all duration-200 group text-left outline-none rounded-2xl cursor-pointer mb-2 relative select-none",
          isCollapsedMode ? "justify-center px-0 py-2.5" : "gap-1 px-3 py-2.5",
          isSelected
            ? (isCollapsedMode 
                ? "text-indigo-700" 
                : "bg-linear-to-r from-indigo-400/30 to-purple-400/30 border border-white/50 text-indigo-700 shadow-lg shadow-indigo-200/40")
            : "text-gray-700 hover:bg-white/50 hover:backdrop-blur-md hover:text-indigo-600 hover:shadow-sm hover:shadow-indigo-200/30"
        )}
        onClick={(e) => {
             if (isCollapsedMode) {
                 // Если свернуто, возможно стоит разворачивать сайдбар или переходить?
                 // Пока оставим стандартное поведение клика по заголовку
                 item.onTitleClick?.(e);
             } else {
                 item.onTitleClick?.(e);
             }
        }}
        style={{ paddingLeft: (!isCollapsedMode && depth > 0) ? `${12 + depth * 12}px` : undefined }}
      >
        <div
          className={cn(
            "shrink-0 transition-colors duration-200 bg-white/60 backdrop-blur-md rounded-4xl w-10 h-10 flex items-center justify-center",
            isSelected
              ? "text-indigo-600 shadow-indigo-200/40"
              : "text-indigo-500"
          )}
        >
          {item.icon}
        </div>
        
        {!isCollapsedMode && (
         <div className="flex-1 flex items-center justify-between min-w-0">
          {/* FolderLabel рендерится здесь как ReactNode */}
           <div className="flex-1 truncate">
              {item.label}
           </div>
         
           {hasChildren && (
             <div
               onClick={toggleOpen}
               className={cn(
                 "shrink-0 transition-colors duration-200 cursor-pointer p-1 rounded-full hover:bg-black/5 ml-2",
                 isSelected ? "text-indigo-600" : "text-gray-400"
               )}
             >
                <motion.div
                   animate={{ rotate: isOpen ? 0 : -90 }}
                   transition={{ duration: 0.2, ease: "easeInOut" }}
                 >
                  <img src={sidebarArrow} alt="arrow" />
                 </motion.div>
             </div>
           )}
         </div>
        )}
      </div>
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

      {/* Submenu Animation */}
      <AnimatePresence>
        {!isCollapsedMode && hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "circOut",
            }}
            className="overflow-hidden"
          >
            <div className="ml-4 border-l-2 border-dotted border-indigo-300/40">
                {item.children!.map((child: MenuItem) => (
                  <SidebarItem
                    key={child.key}
                    item={child}
                    isActive={false} 
                    depth={0} 
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
