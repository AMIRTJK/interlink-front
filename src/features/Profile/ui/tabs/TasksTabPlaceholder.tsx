import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export const TasksTabPlaceholder = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/40 dark:bg-slate-800/90 backdrop-blur-3xl p-12 rounded-[2.5rem] border border-white/20 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]"
    >
      <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-6">
        <Hammer className="w-8 h-8 text-indigo-500 animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
        В разработке
      </h3>
      <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-sm leading-relaxed">
        Данный раздел находится в разработке. В ближайших обновлениях здесь появится новый функционал.
      </p>
    </motion.div>
  );
};
