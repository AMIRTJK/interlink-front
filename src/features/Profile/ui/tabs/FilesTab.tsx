import React, { useState, useMemo } from "react";
import { INITIAL_FILES, INITIAL_CATEGORIES, IFileItem, ICategoryItem } from "./mockData";
import { FilesHeader } from "./files/FilesHeader";
import { CategoryFilters } from "./files/CategoryFilters";
import { PinnedFiles } from "./files/PinnedFiles";
import { FileGridList } from "./files/FileGridList";
import { StorageUsage } from "./files/StorageUsage";
import { AddCategoryModal } from "./files/AddCategoryModal";
import { Upload } from "lucide-react";
import "./FilesTab.css";

export const FilesTab = () => {
  const [files, setFiles] = useState<IFileItem[]>(INITIAL_FILES);
  const [categories, setCategories] = useState<ICategoryItem[]>(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>("Все файлы");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // Симуляция загрузки файла
  const handleSimulatedUpload = () => {
    const randomExtensions = ["pdf", "xlsx", "docx", "zip", "png"] as const;
    const ext = randomExtensions[Math.floor(Math.random() * randomExtensions.length)];
    const sizes = ["1.5 MB", "4.8 MB", "120 KB", "18.2 MB", "950 KB"];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    
    // Парсим размер в байты
    let sizeBytes = 1024 * 1024;
    const value = parseFloat(size);
    if (size.includes("MB")) sizeBytes = value * 1024 * 1024;
    else if (size.includes("KB")) sizeBytes = value * 1024;

    const fileTypes: Record<string, "pdf" | "spreadsheet" | "document" | "archive" | "image"> = {
      pdf: "pdf",
      xlsx: "spreadsheet",
      docx: "document",
      zip: "archive",
      png: "image",
    };

    const newFile: IFileItem = {
      id: String(Date.now()),
      name: `Загруженный_файл_${Math.floor(Math.random() * 1000)}.${ext}`,
      size,
      sizeBytes,
      date: "Сегодня",
      timestamp: Date.now(),
      type: fileTypes[ext] || "document",
      pinned: false,
      categories: activeCategory === "Все файлы" ? ["Все файлы", "Рабочие"] : ["Все файлы", activeCategory],
    };

    if (ext === "png") {
      newFile.previewUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
    }

    setFiles((prev) => [newFile, ...prev]);
  };

  // Переключение закрепа
  const handleTogglePin = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pinned: !f.pinned } : f))
    );
  };

  // Удаление файла
  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Добавление новой категории
  const handleAddCategory = (newCat: ICategoryItem) => {
    if (!categories.some((c) => c.name === newCat.name)) {
      setCategories((prev) => [...prev, newCat]);
    }
  };

  // Фильтрация и сортировка файлов
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "Все файлы" || file.categories.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === "date") return b.timestamp - a.timestamp;
      if (sortBy === "size") return b.sizeBytes - a.sizeBytes;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [files, searchQuery, activeCategory, sortBy]);

  const pinnedFiles = useMemo(() => {
    return files.filter((f) => f.pinned);
  }, [files]);

  return (
    <div className="files-tab-container space-y-6">
      {/* Шапка */}
      <FilesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUploadClick={handleSimulatedUpload}
        totalCount={filteredAndSortedFiles.length}
      />

      {/* Фильтры категорий */}
      <CategoryFilters
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        onAddCategoryClick={() => setIsAddCategoryOpen(true)}
      />

      {/* Закрепленные файлы */}
      <PinnedFiles
        pinnedFiles={pinnedFiles}
        onUnpin={(id) => handleTogglePin(id)}
      />

      {/* Drag and drop зона */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleSimulatedUpload();
        }}
        onClick={handleSimulatedUpload}
        className="border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-3xl py-7 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all bg-slate-50/20 dark:bg-slate-900/10"
      >
        <Upload size={18} />
        <span className="text-xs font-semibold">Перетащите файлы или нажмите, чтобы загрузить</span>
      </div>

      {/* Сетка/Список файлов */}
      <FileGridList
        files={filteredAndSortedFiles}
        viewMode={viewMode}
        onTogglePin={handleTogglePin}
        onDelete={handleDeleteFile}
      />

      {/* Шкала хранилища */}
      <StorageUsage files={files} />

      {/* Модалка добавления категории */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSubmit={handleAddCategory}
      />
    </div>
  );
};
