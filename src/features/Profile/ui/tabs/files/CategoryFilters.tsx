import React from "react";
import { Plus, Edit2, Trash2, Share2 } from "lucide-react";
import { If } from "@shared/ui";

export interface ICategoryItem {
  id: number | "all";
  name: string;
  icon: string;
}

interface IProps {
  categories: ICategoryItem[];
  activeCategory: number | "all";
  onCategorySelect: (id: number | "all") => void;
  onAddCategoryClick?: () => void;
  onRenameCategory?: (cat: ICategoryItem) => void;
  onDeleteCategory?: (id: number) => void;
  onShareCategory?: (cat: ICategoryItem) => void;
  allCount?: number;
}

export const CategoryFilters = ({
  categories,
  activeCategory,
  onCategorySelect,
  onAddCategoryClick,
  onRenameCategory,
  onDeleteCategory,
  onShareCategory,
  allCount,
}: IProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategorySelect(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? "bg-indigo-600! text-white! shadow-md shadow-indigo-600/10"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <span className="text-sm leading-none">{cat.icon}</span>
            <span>{cat.name}</span>
            <If is={cat.id === "all" && allCount !== undefined}>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-zinc-400"
              }`}>
                {allCount}
              </span>
            </If>
            <If is={!!(isActive && cat.id !== "all" && onRenameCategory && onDeleteCategory)}>
              <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l border-white/20">
                <Edit2
                  size={11}
                  className="hover:text-amber-250 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameCategory?.(cat);
                  }}
                />
                {onShareCategory && (
                  <Share2
                    size={11}
                    className="hover:text-indigo-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareCategory(cat);
                    }}
                  />
                )}
                <Trash2
                  size={11}
                  className="hover:text-red-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory?.(Number(cat.id));
                  }}
                />
              </div>
            </If>
          </button>
        );
      })}

      <If is={!!onAddCategoryClick}>
        <button
          onClick={onAddCategoryClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-zinc-400 hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Новая</span>
        </button>
      </If>
    </div>
  );
};
