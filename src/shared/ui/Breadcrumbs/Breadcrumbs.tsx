import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@shared/lib/utils";

/**
 * Интерфейс для одного элемента крошек
 */
export interface IBreadcrumbItem {
  label: string; // Текст
  onClick?: () => void; // Действие при клике
  icon?: React.ReactNode; // Опциональная иконка
  isActive?: boolean; // Флаг текущего активного шага
}

/**
 * Пропсы компонента
 */
interface IBreadcrumbsProps {
  items: IBreadcrumbItem[];
  separator?: React.ReactNode; // Кастомный разделитель (по дефолту >)
  className?: string; // Дополнительный класс
}

/**
 * Универсальный компонент хлебных крошек в стиле премиум
 */
export const Breadcrumbs: React.FC<IBreadcrumbsProps> = ({
  items,
  separator = <ChevronRight size={14} className="text-gray-400/60" />,
  className = "",
}) => {
  return (
    <nav className={cn("flex items-center py-2 overflow-x-auto no-scrollbar", className)}>
      <ul className="flex items-center gap-2 m-0 p-0 list-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.isActive || isLast;

          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              {/* Элемент крошки */}
              <motion.div
                whileHover={!isActive ? { scale: 1.02, y: -1 } : {}}
                whileTap={!isActive ? { scale: 0.98 } : {}}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 select-none",
                  !isActive 
                    ? "cursor-pointer text-gray-500 hover:text-blue-600 hover:bg-blue-50/50" 
                    : "text-gray-900 font-bold cursor-default"
                )}
                onClick={!isActive ? item.onClick : undefined}
              >
                {item.icon && (
                  <span className={cn(
                    "flex items-center justify-center",
                    !isActive ? "text-gray-400 group-hover:text-blue-500" : "text-blue-600"
                  )}>
                    {item.icon}
                  </span>
                )}
                <span className="text-sm whitespace-nowrap">
                  {item.label}
                </span>
              </motion.div>

              {/* Разделитель */}
              {!isLast && (
                <div className="flex items-center justify-center pointer-events-none">
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
