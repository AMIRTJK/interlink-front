import React from "react";
import { cn } from "@shared/lib/utils";
import { motion } from "framer-motion";

interface IProps {
  count?: number;
  variant?: "red" | "white";
  className?: string;
  showZero?: boolean;
  animate?: boolean;
}
export const Count: React.FC<IProps> = ({
  count,
  variant = "red",
  className,
  showZero = false,
  animate = true,
}) => {
  if (count === undefined || (count === 0 && !showZero)) {
    return null;
  }

  const content = (
    <span
      className={cn(
        "flex items-center justify-center rounded-full shrink-0 leading-none font-bold text-[10px] h-5 min-w-[20px] px-1 transition-colors border",
        // Стили для красного варианта (сайдбар)
        variant === "red" && "bg-[#E30613] text-white border-transparent",
        // Стили для белого варианта (реестр) - автоматически управляются через родительский tab group
        variant === "white" && "bg-white text-gray-500 border-gray-200 group-data-[active=true]/tab:text-blue-600 group-data-[active=true]/tab:border-blue-100",

        className
      )}
    >
      {count}
    </span>
  );
  if (animate) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        {content}
      </motion.span>
    );
  }

  return content;
};
