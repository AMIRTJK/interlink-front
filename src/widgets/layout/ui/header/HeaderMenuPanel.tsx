import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface IProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

/** Вложенная панель меню шапки: заголовок с возвратом к списку и содержимое. */
export const HeaderMenuPanel = ({ title, onBack, children }: IProps) => (
  <div>
    <div className="flex items-center gap-1 px-1 pt-1 pb-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Назад"
        className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
      </button>
      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        {title}
      </p>
    </div>
    {children}
  </div>
);
