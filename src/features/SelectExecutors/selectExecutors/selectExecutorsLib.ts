/** Ответ приходит либо массивом, либо `{ data: [...] }`, либо `{ data: { data: [...] } }`. */
export const extractData = <T,>(resp: unknown): T[] => {
  if (!resp) return [];
  const typed = resp as { data?: T[] | { data?: T[] } };
  const root = typed.data || typed;
  if (Array.isArray(root)) return root;
  if (
    root &&
    typeof root === "object" &&
    "data" in root &&
    Array.isArray(root.data)
  )
    return root.data;
  return [];
};

export const getMeta = (resp: unknown) => {
  const typed = resp as {
    data?: { current_page?: number; last_page?: number };
    current_page?: number;
    last_page?: number;
  };
  const root = typed?.data || typed;
  return {
    current_page: root?.current_page || 1,
    last_page: root?.last_page || 1,
  };
};

export const transformSelectResponse = (resp: unknown) => {
  const data = extractData<{
    id: number;
    name?: string;
    full_name?: string;
    title?: string;
  }>(resp);
  return data.map((item) => ({
    value: item.id.toString(),
    label: item.name || item.full_name || item.title || "",
  }));
};
