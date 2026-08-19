// Разметка списков при вставке из буфера обмена и импорте Word.
//
// Модуль намеренно без импортов и без обращений к DOM: ровно эту логику
// проверяют тесты (`npm run test`), которые запускаются в Node, где ни DOM, ни
// псевдонимов путей нет.

// Атрибуты списков, которые обязаны пережить очистку вставки: без `start`
// нумерованный список после вставки начинается заново с «1», без `value`
// элемент теряет свой номер, без `reversed` — обратный порядок.
const LIST_ATTRS: Record<string, readonly string[]> = {
  OL: ["start", "reversed"],
  LI: ["value"],
};

// Атрибуты вне разметки списков, которые санитайзер оставляет как есть.
const COMMON_KEPT_ATTRS: readonly string[] = ["href", "src", "colspan", "rowspan"];

// Устаревший атрибут type=... у списков (<ol type="a">, <ul type="square">).
const LIST_TYPE_TO_STYLE: Record<string, string> = {
  "1": "decimal",
  a: "lower-alpha",
  A: "upper-alpha",
  i: "lower-roman",
  I: "upper-roman",
  disc: "disc",
  circle: "circle",
  square: "square",
};

const LIST_TAGS: readonly string[] = ["UL", "OL", "LI"];

/** Оставляем ли атрибут при очистке вставленного HTML. */
export const isKeptAttribute = (tagName: string, attrName: string): boolean => {
  const name = attrName.toLowerCase();
  if (COMMON_KEPT_ATTRS.includes(name)) return true;
  const listAttrs = LIST_ATTRS[tagName.toUpperCase()];
  return !!listAttrs && listAttrs.includes(name);
};

/**
 * Вид маркера из атрибута `type` списка — в значение `list-style-type`.
 *
 * Как презентационная подсказка `type` слабее любого правила таблицы стилей, а
 * маркеры документа заданы именно правилами (иначе их гасит preflight
 * Tailwind). Поэтому при вставке переносим вид маркера в inline-стиль: он
 * переживает и холст, и предпросмотр, и печать. Возвращает null, если атрибута
 * нет, тег не списочный или значение нераспознанное.
 */
export const listStyleTypeFromAttr = (
  tagName: string,
  typeAttr: string | null,
): string | null => {
  if (!typeAttr || !LIST_TAGS.includes(tagName.toUpperCase())) return null;
  return LIST_TYPE_TO_STYLE[typeAttr] ?? null;
};
