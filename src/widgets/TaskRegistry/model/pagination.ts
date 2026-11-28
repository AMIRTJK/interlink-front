// Чистая логика пагинации — отдельно от api.ts, который читает import.meta.env
// и поэтому не загружается в тестах на Node.

export interface Pagination {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
}

/**
 * Извлекает метаданные серверной пагинации, устойчиво к разным форматам:
 * `res.meta`, `res.data.meta` или пагинатор Laravel в `res.data`
 * (`current_page/last_page/total/per_page`).
 */
export const extractPagination = (
  res: unknown,
  fallbackCount: number,
  defaultPerPage: number,
): Pagination => {
  const r = (res ?? {}) as Record<string, unknown>;
  const dataField = r.data as Record<string, unknown> | unknown[] | undefined;
  const metaCandidate =
    (r.meta as Record<string, unknown> | undefined) ??
    (dataField && !Array.isArray(dataField)
      ? ((dataField.meta as Record<string, unknown> | undefined) ?? dataField)
      : undefined) ??
    r;
  const meta = (metaCandidate ?? {}) as Record<string, unknown>;
  // Ответ без метаданных пагинации — сервер отдал список целиком. Тогда это одна
  // страница: иначе per_page по умолчанию делил бы уже полученный список на
  // «страницы», которые сервер вернёт теми же самыми записями.
  const PAGINATION_KEYS = ["per_page", "total", "last_page", "current_page"];
  const hasPagination = PAGINATION_KEYS.some((key) => meta[key] !== undefined || r[key] !== undefined);
  if (!hasPagination) {
    return { total: fallbackCount, lastPage: 1, currentPage: 1, perPage: Math.max(fallbackCount, 1) };
  }
  const num = (v: unknown, d: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : d;
  };
  const perPage = num(meta.per_page ?? r.per_page, defaultPerPage);
  const total = num(meta.total ?? r.total, fallbackCount);
  const currentPage = num(meta.current_page ?? r.current_page ?? meta.page ?? r.page, 1);
  const lastPage = num(
    meta.last_page ?? r.last_page,
    Math.max(1, Math.ceil(total / perPage)),
  );
  return { total, lastPage, currentPage, perPage };
};
