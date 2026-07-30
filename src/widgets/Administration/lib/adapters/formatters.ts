export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatJoinedDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/** Разворачивает разные варианты обёрток ответа: data.data.data | data.data | data */
export function unwrapList<T = unknown>(raw: unknown): T[] {
  const anyRaw = raw as
    | { data?: { data?: T[] } | T[] }
    | T[]
    | undefined
    | null;
  const v =
    (anyRaw as { data?: { data?: T[] } })?.data &&
    (anyRaw as { data?: { data?: T[] } }).data?.data
      ? (anyRaw as { data: { data: T[] } }).data.data
      : (anyRaw as { data?: T[] })?.data
        ? (anyRaw as { data: T[] }).data
        : anyRaw;
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Приводит массив permissions (строки или {name}) к массиву строк-имён */
export function extractPermNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const names: string[] = [];
  raw.forEach((p: unknown) => {
    const name = typeof p === "string" ? p : (p as { name?: string })?.name;
    if (name) names.push(name);
  });
  return names;
}
