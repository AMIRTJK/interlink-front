import React, { useEffect } from "react";
import { cn } from "@shared/lib/utils";
import { motion, useSpring, useTransform } from "framer-motion";

interface IProps {
  count?: number;
  variant?: "red" | "white";
  className?: string;
  showZero?: boolean;
  animate?: boolean;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

export const Count: React.FC<IProps> = ({
  count = 0,
  variant = "red",
  className,
  showZero = false,
  animate = true,
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const content = (
    <span
      className={cn(
        "flex items-center justify-center rounded-full shrink-0 leading-none font-bold text-[10px] h-5 min-w-[20px] px-1 transition-all duration-300 border",
        // Стили для красного варианта (сайдбар)
        variant === "red" && "bg-[#E30613] text-white border-transparent shadow-sm",
        // Стили для белого варианта (реестр)
        variant === "white" &&
          "scale-0 opacity-0 bg-white text-gray-500 border-gray-200 group-data-[active=true]/tab:scale-100 group-data-[active=true]/tab:opacity-100 group-data-[active=true]/tab:text-blue-600 group-data-[active=true]/tab:border-blue-100",

        className
      )}
    >
      <AnimatedNumber value={count} />
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
