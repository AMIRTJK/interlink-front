import type { IPersonalTask, TFilterTab, TSortField, ISortConfig } from "../model/types";

export const getUserName = (rawUser: any): string => {
  if (!rawUser) return "Сотрудник";
  const nameParts = [rawUser.last_name, rawUser.first_name, rawUser.middle_name].filter(Boolean);
  return nameParts.length > 0 ? nameParts.join(" ") : rawUser.full_name || "Сотрудник";
};

export const calculateStats = (tasks: IPersonalTask[]) => {
  const now = new Date().getTime();
  const isTaskOverdue = (t: IPersonalTask) =>
    t.status !== "completed" &&
    (t.status === "overdue" ||
      Boolean(t.is_overdue) ||
      (Boolean(t.due_date) && new Date(t.due_date).getTime() < now));

  const overdue = tasks.filter(isTaskOverdue).length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const newCount = tasks.filter((t) => t.status === "new" && !isTaskOverdue(t)).length;
  const inProgress = tasks.filter((t) => t.status === "in_progress" && !isTaskOverdue(t)).length;
  const review = tasks.filter((t) => t.status === "review" && !isTaskOverdue(t)).length;

  return { total: tasks.length, new: newCount, inProgress, review, completed, overdue };
};

export const getFilteredTasks = (
  tasks: IPersonalTask[],
  searchQuery: string,
  filterTab: TFilterTab,
  sortConfig: ISortConfig,
): IPersonalTask[] => {
  const now = new Date().getTime();
  return tasks
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.title.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q));
      const isOverdue =
        t.status !== "completed" &&
        (t.status === "overdue" ||
          Boolean(t.is_overdue) ||
          (Boolean(t.due_date) && new Date(t.due_date).getTime() < now));

      const matchesTab =
        filterTab === "all" ||
        (filterTab === "new" && t.status === "new" && !isOverdue) ||
        (filterTab === "in_progress" && t.status === "in_progress" && !isOverdue) ||
        (filterTab === "review" && t.status === "review" && !isOverdue) ||
        (filterTab === "completed" && t.status === "completed") ||
        (filterTab === "overdue" && isOverdue) ||
        (filterTab === "active" && ["new", "in_progress", "review"].includes(t.status) && !isOverdue);
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
      const valA = a.due_date ? new Date(a.due_date).getTime() : 0;
      const valB = b.due_date ? new Date(b.due_date).getTime() : 0;
      return sortConfig.order === "asc" ? valA - valB : valB - valA;
    });
};
