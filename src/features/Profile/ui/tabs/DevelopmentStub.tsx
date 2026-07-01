import { motion } from "framer-motion";
import { Construction } from "lucide-react";

interface IProps {
  /** Название вкладки/модуля — показывается заголовком над сообщением. */
  title?: string;
}

/**
 * Универсальная заглушка для вкладок, которые ещё не реализованы
 * (Задачи, Календарь, Мои файлы). Оформлена в стиле нового дизайна
 * (glassmorphism-карточка).
 */
export const DevelopmentStub = ({ title }: IProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-zinc-700/30 shadow-sm p-16 flex flex-col items-center justify-center text-center min-h-[440px]"
  >
    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 flex items-center justify-center shadow-lg mb-6">
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
