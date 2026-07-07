import React from "react";
import { AnimatePresence } from "framer-motion";
import { BarChart2 } from "lucide-react";
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
import "./style.css";

export const PersonalTasksRegistry = () => {
  const [subTab, setSubTab] = React.useState<"registry" | "analytics">("registry");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<TFilterTab>("all");
  const [sortConfig, setSortConfig] = React.useState<ISortConfig>({ field: "dueDate", order: "asc" });
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [activeTask, setActiveTask] = React.useState<IPersonalTask | null>(null);

  const { data: rawTasks, refetch } = useGetQuery<any, any>({
    url: ApiRoutes.PERSONAL_TASKS,
    useToken: true,
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
  const stats = React.useMemo(() => calculateStats(tasks), [tasks]);
  const filteredTasks = React.useMemo(() => getFilteredTasks(tasks, searchQuery, filterTab, sortConfig), [tasks, searchQuery, filterTab, sortConfig]);

  const handleSortChange = (field: TSortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handleSaveTask = async (values: any) => {
    if (activeTask) {
      await updateTask({ id: activeTask.id, ...values });
    } else {
      await createTask(values);
    }
    setIsCreateOpen(false);
    setActiveTask(null);
    refetch();
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
    refetch();
  };

  return (
    <div className="w-full flex flex-col gap-4 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <button
            onClick={() => setSubTab("registry")}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 border-0 cursor-pointer ${
              subTab === "registry"
                ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white"
                : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Реестр
          </button>
          <button
            onClick={() => setSubTab("analytics")}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 border-0 cursor-pointer ${
              subTab === "analytics"
                ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white"
                : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            Аналитика
          </button>
        </div>
      </div>

      <If is={subTab === "registry"}>
        <div className="flex flex-col gap-4">
          <StatsCards stats={stats} />
          <div className="rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/30 dark:border-zinc-700/30 shadow-none flex flex-col overflow-hidden">
            <RegistryHeader
              taskCount={filteredTasks.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
              onCreateClick={() => {
                setActiveTask(null);
                setIsCreateOpen(true);
              }}
            />
            <FilterTabs activeTab={filterTab} onTabChange={setFilterTab} stats={stats} />
            <TasksTable
              tasks={filteredTasks}
              onOpen={(t) => {
                setActiveTask(t);
                setIsDetailsOpen(true);
              }}
              onEdit={(t) => {
                setActiveTask(t);
                setIsCreateOpen(true);
              }}
              onDelete={handleDeleteTask}
              userName={userName}
            />
          </div>
        </div>
      </If>

      <If is={subTab === "analytics"}>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
            <BarChart2 className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Аналитика в процессе разработки</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed m-0">
            Этот раздел находится на стадии разработки. В ближайших обновлениях здесь появится расширенная статистика личных задач.
          </p>
        </div>
      </If>

      <AnimatePresence>
        {isCreateOpen && (
          <CreateTaskModal
            onClose={() => {
              setIsCreateOpen(false);
              setActiveTask(null);
            }}
            task={activeTask}
            userName={userName}
            onSave={handleSaveTask}
            isSaving={false}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailsOpen && (
          <TaskDetailsModal
            onClose={() => {
              setIsDetailsOpen(false);
              setActiveTask(null);
            }}
            task={activeTask}
            userName={userName}
            onEditClick={() => {
              setIsDetailsOpen(false);
              setIsCreateOpen(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
