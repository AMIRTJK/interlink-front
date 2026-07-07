import type { IPersonalTask, TFilterTab, TSortField, ISortConfig } from "../model/types";

export const getUserName = (rawUser: any): string => {
  if (!rawUser) return "Сотрудник";
  const nameParts = [rawUser.last_name, rawUser.first_name, rawUser.middle_name].filter(Boolean);
  return nameParts.length > 0 ? nameParts.join(" ") : rawUser.full_name || "Сотрудник";
};

export const calculateStats = (tasks: IPersonalTask[]) => {
  const now = new Date().getTime();
  const inProgress = tasks.filter((t) => ["new", "in_progress", "review"].includes(t.status) && !(t.is_overdue || (new Date(t.due_date).getTime() < now && t.status !== "completed"))).length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const overdue = tasks.filter((t) => t.status === "overdue" || t.is_overdue || (new Date(t.due_date).getTime() < now && t.status !== "completed")).length;
  return { total: tasks.length, inProgress, completed, overdue };
};

export const getFilteredTasks = (
  tasks: IPersonalTask[],
  searchQuery: string,
  filterTab: TFilterTab,
  sortConfig: ISortConfig
): IPersonalTask[] => {
  const now = new Date().getTime();
  return tasks
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = t.title.toLowerCase().includes(q) || t.tags?.some((tag) => tag.toLowerCase().includes(q));
      const isOverdue = t.status === "overdue" || t.is_overdue || (new Date(t.due_date).getTime() < now && t.status !== "completed");
      const matchesTab =
        filterTab === "all" ||
        (filterTab === "active" && ["new", "in_progress", "review"].includes(t.status) && !isOverdue) ||
        (filterTab === "completed" && t.status === "completed") ||
        (filterTab === "overdue" && isOverdue);
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortConfig.field === "priority") {
        const ranks = { critical: 4, high: 3, medium: 2, low: 1 };
        const diff = (ranks[a.priority] || 2) - (ranks[b.priority] || 2);
        return sortConfig.order === "asc" ? diff : -diff;
      }
      if (sortConfig.field === "status") {
        const ranks = { completed: 4, review: 3, in_progress: 2, new: 1, overdue: 0 };
        const diff = (ranks[a.status] || 1) - (ranks[b.status] || 1);
        return sortConfig.order === "asc" ? diff : -diff;
      }
      const valA = new Date(a.due_date).getTime();
      const valB = new Date(b.due_date).getTime();
      return sortConfig.order === "asc" ? valA - valB : valB - valA;
    });
};
