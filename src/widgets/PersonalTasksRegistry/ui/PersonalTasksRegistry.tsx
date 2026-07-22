import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { AnimatePresence } from "framer-motion";
import { If } from "@shared/ui/If";
import { useGetQuery, useMutationQuery, tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api/api-routes";
import { StatsCards } from "./StatsCards";
import { RegistryHeader } from "./RegistryHeader";
import { FilterTabs } from "./FilterTabs";
import { TasksTable } from "./TasksTable";
import { CreateTaskModal } from "./CreateTaskModal";
import { TaskDetailsModal } from "./TaskDetailsModal";
import type { IPersonalTask, TFilterTab, TSortField, ISortConfig } from "../model/types";
import { getUserName, calculateStats, getFilteredTasks } from "./lib";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { PersonalAnalytics } from "./PersonalAnalytics";
import "./style.css";

const cacheOptions = {
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

export const PersonalTasksRegistry = memo(() => {
  const [subTab, setSubTab] = useState<"registry" | "analytics">("registry");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<TFilterTab>("all");
  const [sortConfig, setSortConfig] = useState<ISortConfig>({ field: "dueDate", order: "asc" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<IPersonalTask | null>(null);
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem("currentTheme") || "emerald");

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "currentTheme" && e.newValue) {
        setThemeKey(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const activeTheme = THEMES[themeKey] || THEMES.emerald;

  const { data: rawTasks } = useGetQuery<any, any>({
    url: ApiRoutes.PERSONAL_TASKS,
    useToken: true,
    options: cacheOptions,
  });

  const { mutateAsync: createTask } = useMutationQuery<any, any>({
    url: ApiRoutes.PERSONAL_TASKS,
    method: "POST",
    messages: { success: "Задача успешно создана", invalidate: [ApiRoutes.PERSONAL_TASKS] },
  });

  const { mutateAsync: updateTask } = useMutationQuery<any, any>({
    url: (task) => `${ApiRoutes.PERSONAL_TASKS}/${task.id}`,
    method: "PUT",
    messages: { success: "Задача успешно обновлена", invalidate: [ApiRoutes.PERSONAL_TASKS] },
  });

  const { mutateAsync: deleteTask } = useMutationQuery<any, any>({
    url: (id) => `${ApiRoutes.PERSONAL_TASKS}/${id}`,
    method: "DELETE",
    messages: { success: "Задача успешно удалена", invalidate: [ApiRoutes.PERSONAL_TASKS] },
  });

  const userData = tokenControl.getUserData();
  const userName = getUserName(userData?.data?.user || userData?.user || userData?.data || userData);
  const tasks: IPersonalTask[] = rawTasks?.data || [];
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  const filteredTasks = useMemo(() => getFilteredTasks(tasks, searchQuery, filterTab, sortConfig), [tasks, searchQuery, filterTab, sortConfig]);

  const handleSortChange = useCallback((field: TSortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleSaveTask = useCallback(async (values: any) => {
    if (activeTask) {
      await updateTask({ id: activeTask.id, ...values });
    } else {
      await createTask(values);
    }
    setIsCreateOpen(false);
    setActiveTask(null);
  }, [activeTask, createTask, updateTask]);

  const handleDeleteTask = useCallback(async (id: number) => {
    await deleteTask(id);
  }, [deleteTask]);

  const handleOpenTask = useCallback((t: IPersonalTask) => {
    setActiveTask(t);
    setIsDetailsOpen(true);
  }, []);

  const handleEditTask = useCallback((t: IPersonalTask) => {
    setActiveTask(t);
    setIsCreateOpen(true);
  }, []);

  const handleCreateTaskClick = useCallback(() => {
    setActiveTask(null);
    setIsCreateOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateOpen(false);
    setActiveTask(null);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsOpen(false);
    setActiveTask(null);
  }, []);

  const handleEditFromDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setIsCreateOpen(true);
  }, []);

  return (
    <div className="w-full! flex! flex-col! gap-4! selection:bg-emerald-100! selection:text-emerald-900!">
      <div className="flex! items-center! gap-3!">
        <div className="flex! items-center! gap-1! p-1! rounded-2xl! bg-zinc-100! dark:bg-zinc-800!">
          <button
            type="button"
            onClick={() => setSubTab("registry")}
            className={`px-4! py-1.5! rounded-xl! text-sm! font-semibold! transition-all! duration-200! border-0! cursor-pointer! ${
              subTab === "registry"
                ? "bg-white! dark:bg-zinc-700! shadow! text-zinc-900! dark:text-white!"
                : "bg-transparent! text-zinc-500! dark:text-zinc-400! hover:text-zinc-700! dark:hover:text-zinc-200!"
            }`}
          >
            Реестр
          </button>
          <button
            type="button"
            onClick={() => setSubTab("analytics")}
            className={`px-4! py-1.5! rounded-xl! text-sm! font-semibold! transition-all! duration-200! border-0! cursor-pointer! ${
              subTab === "analytics"
                ? "bg-white! dark:bg-zinc-700! shadow! text-zinc-900! dark:text-white!"
                : "bg-transparent! text-zinc-500! dark:text-zinc-400! hover:text-zinc-700! dark:hover:text-zinc-200!"
            }`}
          >
            Аналитика
          </button>
        </div>
      </div>

      <If is={subTab === "registry"}>
        <div className="flex! flex-col! gap-4!">
          <StatsCards stats={stats} />
          <div className="rounded-3xl! bg-white/60! dark:bg-zinc-900/60! backdrop-blur-xl! border! border-white/30! dark:border-zinc-700/30! shadow-none! flex! flex-col! overflow-hidden!">
            <RegistryHeader
              taskCount={filteredTasks.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
              onCreateClick={handleCreateTaskClick}
              activeTheme={activeTheme}
            />
            <FilterTabs activeTab={filterTab} onTabChange={setFilterTab} stats={stats} activeTheme={activeTheme} />
            <TasksTable
              tasks={filteredTasks}
              onOpen={handleOpenTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              userName={userName}
            />
          </div>
        </div>
      </If>

      <If is={subTab === "analytics"}>
        <PersonalAnalytics tasks={tasks} activeTheme={activeTheme} />
      </If>

      <AnimatePresence>
        {isCreateOpen && (
          <CreateTaskModal
            onClose={handleCloseCreateModal}
            task={activeTask}
            userName={userName}
            onSave={handleSaveTask}
            isSaving={false}
            activeTheme={activeTheme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailsOpen && (
          <TaskDetailsModal
            onClose={handleCloseDetailsModal}
            task={activeTask}
            userName={userName}
            onEditClick={handleEditFromDetails}
            activeTheme={activeTheme}
          />
        )}
      </AnimatePresence>
    </div>
  );
});
