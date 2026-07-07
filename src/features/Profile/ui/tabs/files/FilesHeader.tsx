import React, { useRef, useState, useEffect } from "react";
import { Search, ChevronDown, Upload, LayoutGrid, List, ArrowUp, ArrowDown, FolderPlus, X } from "lucide-react";
import { If } from "@shared/ui";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { useDesignSettings } from "@widgets/layout/ui/useDesignSettings";

interface IProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sortBy: "date" | "size" | "name";
  onSortChange: (val: "date" | "size" | "name") => void;
  sortDir: "asc" | "desc";
  onSortDirToggle: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (val: "grid" | "list") => void;
  onUpload: (file: File) => void;
  totalCount: number;
  onCreateFolderClick: () => void;
}

export const FilesHeader = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortDir,
  onSortDirToggle,
  viewMode,
  onViewModeChange,
  onUpload,
  totalCount,
  onCreateFolderClick,
}: IProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const { currentTheme, isDarkMode } = useDesignSettings();
  const theme = THEMES[currentTheme] || THEMES.emerald;
  const accent = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Закрываем меню сортировки при клике вне него.
  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  const handleSearchSubmit = () => {
    onSearchChange(localSearch);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const getSortLabel = () => {
    if (sortBy === "date") return "Дата";
    if (sortBy === "size") return "Размер";
    return "Имя";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onUpload(selectedFile);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
          Файлы
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-zinc-400 rounded-full">
          {totalCount}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden!"
        />

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Поиск файлов..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-zinc-200 placeholder-slate-400 pl-4 pr-14 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <If is={!!localSearch}>
              <X
                size={15}
                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                onClick={() => {
                  setLocalSearch("");
                  onSearchChange("");
                }}
              />
            </If>
            <Search
              size={15}
              className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              onClick={handleSearchSubmit}
            />
          </div>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1">
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-zinc-300 rounded-full border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium cursor-pointer"
            >
              <span>{getSortLabel()}</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>

            <If is={sortOpen}>
              <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl py-1 z-50">
                {(["date", "size", "name"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onSortChange(option);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                      sortBy === option
                        ? "bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-zinc-100 font-semibold"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    style={
                      sortBy === option
                        ? { color: accent }
                        : undefined
                    }
                  >
                    {option === "date" ? "Дата" : option === "size" ? "Размер" : "Имя"}
                  </button>
                ))}
              </div>
            </If>
          </div>

          {/* Direction Toggle */}
          <button
            onClick={onSortDirToggle}
            className="p-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 dark:text-zinc-300 cursor-pointer transition-all"
            title={sortDir === "asc" ? "По возрастанию" : "По убыванию"}
          >
            {sortDir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </button>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => onViewModeChange("grid")}
            style={viewMode === "grid" ? { color: accent } : undefined}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            style={viewMode === "list" ? { color: accent } : undefined}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            }`}
          >
            <List size={15} />
          </button>
        </div>

        {/* Create Folder Button */}
        <button
          onClick={onCreateFolderClick}
          className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-slate-700 font-semibold rounded-full text-sm shadow-sm cursor-pointer transition-all"
        >
          <FolderPlus size={16} className="text-slate-400 dark:text-zinc-400" />
          <span>Создать папку</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={handleUploadClick}
          className={`bg-gradient-to-r ${theme.gradient} flex items-center gap-2 px-5 py-2 text-white font-semibold rounded-full text-sm shadow-md cursor-pointer hover:shadow-lg hover:brightness-105 transition-all`}
        >
          <Upload size={16} />
          <span>Загрузить</span>
        </button>
      </div>
    </div>
  );
};
