import React, { useState, useMemo } from "react";
import { INITIAL_FILES, INITIAL_CATEGORIES, IFileItem, ICategoryItem } from "./mockData";
import { FilesHeader } from "./files/FilesHeader";
import { CategoryFilters } from "./files/CategoryFilters";
import { PinnedFiles } from "./files/PinnedFiles";
import { FileGridList } from "./files/FileGridList";
import { StorageUsage } from "./files/StorageUsage";
import { AddCategoryModal } from "./files/AddCategoryModal";
import "./FilesTab.css";

export const FilesTab = () => {
  const [files, setFiles] = useState<IFileItem[]>(INITIAL_FILES);
  const [categories, setCategories] = useState<ICategoryItem[]>(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>("Все файлы");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // Выбор файла в реестре (чекбокс)
  const handleToggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  // Загрузка реального файла пользователя
  const handleRealUpload = (selectedFile: File) => {
    const name = selectedFile.name;
    const sizeBytes = selectedFile.size;
    
    // Форматирование размера
    let size = "";
    if (sizeBytes >= 1024 * 1024 * 1024) {
      size = `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (sizeBytes >= 1024 * 1024) {
      size = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (sizeBytes >= 1024) {
      size = `${(sizeBytes / 1024).toFixed(0)} KB`;
    } else {
      size = `${sizeBytes} B`;
    }

    // Определение типа файла
    const ext = name.split(".").pop()?.toLowerCase() || "";
    let type: "pdf" | "spreadsheet" | "document" | "archive" | "image" = "document";
    if (ext === "pdf") {
      type = "pdf";
    } else if (["xlsx", "xls", "csv"].includes(ext)) {
      type = "spreadsheet";
    } else if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
      type = "image";
    } else if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) {
      type = "archive";
    }

    const newFile: IFileItem = {
      id: String(Date.now()),
      name,
      size,
      sizeBytes,
      date: "Сегодня",
      timestamp: Date.now(),
      type,
      pinned: false,
      categories: activeCategory === "Все файлы" ? ["Все файлы", "Рабочие"] : ["Все файлы", activeCategory],
    };

    if (type === "image") {
      newFile.previewUrl = URL.createObjectURL(selectedFile);
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
    setSelectedFileIds((prev) => prev.filter((fileId) => fileId !== id));
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
        onUpload={handleRealUpload}
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

      {/* Сетка/Реестр файлов */}
      <FileGridList
        files={filteredAndSortedFiles}
        viewMode={viewMode}
        selectedFileIds={selectedFileIds}
        onToggleSelectFile={handleToggleSelectFile}
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
