import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import { THEMES } from "@widgets/layout/ui/designSettings";

interface IProps {
  title?: string;
}

export const DevelopmentStub = ({ title }: IProps) => {
  const currentTheme = localStorage.getItem("currentTheme") || "emerald";
  const activeTheme = THEMES[currentTheme] || THEMES.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/40 dark:bg-th-raised/90 backdrop-blur-3xl rounded-[2.5rem] ui-glass border border-zinc-200 dark:border-th-high/50 p-16 flex flex-col items-center justify-center text-center min-h-[440px]"
    >
      <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${activeTheme.gradient} flex items-center justify-center shadow-lg mb-6`}>
        <Construction className="text-white" size={34} />
      </div>
      {title && (
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-2">
          {title}
        </h3>
      )}
      <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md">
        Модуль находится в процессе разработки
      </p>
    </motion.div>
  );
};
