import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, Folder } from "lucide-react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { cn } from "@shared/lib/utils";

export interface IBreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isActive?: boolean;
  options?: { label: string; onClick: () => void; icon?: React.ReactNode }[];
}

interface IBreadcrumbsProps {
  items: IBreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumbs: React.FC<IBreadcrumbsProps> = ({
  items,
  separator = <ChevronRight size={14} className="text-gray-400/60" />,
  className = "",
}) => {
  return (
    <nav className={cn("flex items-center py-2 overflow-x-auto no-scrollbar", className)}>
      <ul className="flex items-center gap-1.5 m-0 p-0 list-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.isActive || isLast;
          const hasOptions = item.options && item.options.length > 0;

          const menuItems: MenuProps["items"] = item.options?.map((opt: any, i) => {
            if (opt.isDivider) return { type: 'divider', key: `d-${i}` };
            if (opt.isHeader) return { 
              type: 'group', 
              label: <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-1">{opt.label}</span>,
              key: `h-${i}` 
            };
            
            return {
              key: i,
              label: (
                <div className="flex items-center gap-2.5 py-1 px-1">
                  <span className="text-blue-500/70 shrink-0">
                    {opt.icon || <Folder size={14} />}
                  </span>
                  <span className="text-[13px] font-medium text-gray-700">{opt.label}</span>
                </div>
              ),
              onClick: () => opt.onClick(),
            };
          });

          const content = (
            <motion.div
              whileHover={!isActive ? { scale: 1.01, y: -0.5 } : {}}
              whileTap={!isActive ? { scale: 0.98 } : {}}
              className={cn(
                "flex items-center justify-center px-2 py-1 rounded-lg min-w-[100px] max-w-[101px] transition-all duration-200 select-none group border border-transparent",
                !isActive 
                  ? "cursor-pointer text-gray-500 hover:text-blue-700 hover:bg-blue-50/80 hover:border-blue-100/50" 
                  : "text-gray-900 font-bold cursor-default bg-gray-100/30 border-gray-200/50 shadow-sm"
              )}
              onClick={!isActive ? item.onClick : undefined}
            >
              {item.icon && (
                <span className={cn(
                  "flex items-center justify-center shrink-0",
                  !isActive ? "text-gray-400 group-hover:text-blue-500" : "text-blue-600"
                )}>
                  {item.icon}
                </span>
              )}
              <span className="text-sm whitespace-nowrap mr-auto">
                {item.label}
              </span>
              {hasOptions && (
                <ChevronDown size={16} className={cn(
                  "transition-transform duration-300 shrink-0 opacity-60",
                  !isActive ? "group-hover:text-blue-500 group-hover:rotate-180" : ""
                )} />
              )}
            </motion.div>
          );

          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex items-center gap-1.5"
            >
              {hasOptions ? (
                <Dropdown 
                  menu={{ items: menuItems }} 
                  trigger={['click']}
                  placement="bottomLeft"
                  overlayClassName="premium-breadcrumb-dropdown"
                >
                  {content}
                </Dropdown>
              ) : content}

              {!isLast && (
                <div className="flex items-center justify-center pointer-events-none opacity-40">
                  {separator}
                </div>
              )}
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
};
