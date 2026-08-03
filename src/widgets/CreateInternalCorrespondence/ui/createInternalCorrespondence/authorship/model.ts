/**
 * Авторство фрагментов текста («кто что написал»).
 *
 * Данные берём не из body, а из истории версий: у каждой версии ровно один
 * автор, поэтому всё, что появилось в версии K, написано автором версии K.
 * Диффом соседних версий авторство слов вычисляется с той же точностью, что
 * дало бы хранение user_id рядом с текстом, но работает и для уже созданных
 * документов.
 */

/** Один вклад: кто и когда добавил фрагмент. */
export interface IAuthorshipEntry {
  authorId: string;
  authorName: string;
  authorPosition: string;
  versionId: string | number;
  versionNumber: number;
  date: string;
}

/** Авторство одного слова: текущий вклад и те, что он вытеснил. */
export interface IWordAuthorship {
  current: IAuthorshipEntry;
  /** Кого этот фрагмент заменил, новейшие первыми */
  history: IAuthorshipEntry[];
}

/** Версия в форме, которую отдаёт mapDocumentVersions */
export interface IAuthorshipVersion {
  id: string | number;
  versionNumber: number;
  content: string;
  date: string;
  author: {
    id: string;
    name: string;
    position: string;
  };
}

/** Атрибут-якорь на <mark>: индекс в таблице фрагментов */
export const AUTHORSHIP_ATTR = "data-authorship";

/** Узлы, текст которых не участвует ни в диффе, ни в разметке. */
export const AUTHORSHIP_SKIP_SELECTOR =
  "[data-signature-stamp='true'],[data-page-spacer]";

/**
 * Потолок на пословный LCS. Считается уже после отсечения общего начала и
 * конца, поэтому обычной правке до него далеко; страхует от O(n*m) на
 * документах, переписанных целиком.
 */
export const MAX_DIFF_TOKENS = 2500;

/** Глубина хранимой истории одного фрагмента. */
export const MAX_AUTHORSHIP_HISTORY = 5;

/**
 * Палитра подсветки по авторам. Цвет закрепляется за автором по порядку его
 * появления в истории версий, поэтому в рамках документа он стабилен.
 */
export const AUTHORSHIP_COLORS = [
  { mark: "rgba(59, 130, 246, 0.18)", dot: "#3b82f6" },
  { mark: "rgba(16, 185, 129, 0.18)", dot: "#10b981" },
  { mark: "rgba(245, 158, 11, 0.20)", dot: "#f59e0b" },
  { mark: "rgba(168, 85, 247, 0.18)", dot: "#a855f7" },
  { mark: "rgba(236, 72, 153, 0.18)", dot: "#ec4899" },
  { mark: "rgba(20, 184, 166, 0.18)", dot: "#14b8a6" },
] as const;

export const authorshipColorOf = (index: number) =>
  AUTHORSHIP_COLORS[index % AUTHORSHIP_COLORS.length];
