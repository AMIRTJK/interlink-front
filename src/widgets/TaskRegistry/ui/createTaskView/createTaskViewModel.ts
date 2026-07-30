export const toDateInput = (iso: string): string => {
  if (!iso) return new Date().toISOString().split("T")[0];
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? new Date().toISOString().split("T")[0]
    : d.toISOString().split("T")[0];
};

export const toAssigneeIds = (ids: string[]): number[] =>
  ids.map((id) => Number(id)).filter((n) => Number.isFinite(n) && n > 0);
