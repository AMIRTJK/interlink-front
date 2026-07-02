import React from "react";
import { Folder, Briefcase, FileText, Plus } from "lucide-react";

interface IProps {
  categories: string[];
  activeCategory: string;
  onCategorySelect: (category: string) => void;
  onAddCategoryClick: () => void;
}

export const CategoryFilters = ({
  categories,
  activeCategory,
  onCategorySelect,
  onAddCategoryClick,
}: IProps) => {
  const getIcon = (category: string) => {
    switch (category) {
      case "Все файлы":
        return <Folder size={14} className="fill-yellow-400! text-yellow-500!" />;
      case "Рабочие":
        return <Briefcase size={14} className="text-amber-600!" />;
      case "Документы":
        return <FileText size={14} className="text-blue-500!" />;
      default:
        return <Folder size={14} className="text-slate-400!" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onCategorySelect(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? "bg-indigo-600! text-white! shadow-md shadow-indigo-600/10"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {getIcon(cat)}
            <span>{cat}</span>
          </button>
        );
      })}

      <button
        onClick={onAddCategoryClick}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-zinc-400 hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
      >
        <Plus size={14} />
        <span>Новая</span>
      </button>
    </div>
  );
};
