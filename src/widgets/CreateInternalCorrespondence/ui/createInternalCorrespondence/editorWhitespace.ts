// Ведущий пробельный отступ абзаца.
//
// При text-align: justify браузер распределяет остаток строки по ВСЕМ
// разделителям слов этой строки, включая пробелы в её начале (CSS Text 3, §7.3:
// точкой растяжения считается каждый word-separator, в т.ч. U+0020 и U+00A0).
// Поэтому при наборе пробелов в начале абзаца отступ живёт своей жизнью: пока
// текст умещается — пробел даёт свою нормальную ширину, а в тот момент, когда
// последнее слово строки переносится вниз, освободившееся место раскидывается
// по немногочисленным пробелам слева, и курсор одним скачком уезжает вправо на
// «табуляторное» расстояние. Word так не делает: точки растяжения в начале
// строки он подавляет, и отступ из пробелов всегда равен N × ширина пробела.
//
// Лечение — сделать ведущий прогон пробелов атомарной инлайн-коробкой
// (display: inline-block). Внутри коробки пробелы остаются обычными U+0020
// (текст, Ctrl+A, копирование и экспорт не меняются), но для алгоритма
// выключки коробка — единый атом, растягивать внутри нечего. Остаток строки
// распределяется по пробелам между словами — ровно как в Word.
//
// Атрибут держим локально: снаружи редактора этот span читать не нужно, он
// содержит обычный текст и не является служебной разметкой вроде распорок.

import { getCaretCharOffset, restoreCaretCharOffset } from "./editorCaret";
import { normalizeTabSpacers } from "./editorTabs";

export const LEAD_SPACE_ATTR = "data-lead-space";
const LEAD_SPACE_STYLE = "display:inline-block";

// Элементы, у которых есть собственная первая строка, — только в них
// «ведущий отступ» имеет смысл.
const LEAD_HOST_SELECTOR =
  "p,div,li,td,th,h1,h2,h3,h4,h5,h6,blockquote,pre,section,article";

// Инлайн-оформление прозрачно для поиска начала абзаца: <p><strong>   Текст…
// начинается с тех же пробелов, что и <p>   Текст…
const INLINE_WRAPPER_TAGS = new Set([
  "SPAN",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "STRIKE",
  "SUB",
  "SUP",
  "FONT",
  "A",
  "MARK",
  "SMALL",
]);

const isLeadSpacer = (n: Node | null): n is HTMLElement =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).hasAttribute(LEAD_SPACE_ATTR);

const leadingSpaceCount = (s: string): number => {
  let i = 0;
  while (i < s.length && s[i] === " ") i++;
  return i;
};

// Первый значащий узел блока: текстовый узел, наш спейсер или «непрозрачный»
// элемент (картинка, вложенный блок, <br>). Инлайн-оформление проходим насквозь.
const firstContentNode = (host: HTMLElement): Node | null => {
  let node: Node | null = host.firstChild;
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node as Text).data.length) return node;
      node = node.nextSibling;
      continue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.hasAttribute(LEAD_SPACE_ATTR)) return el;
      if (INLINE_WRAPPER_TAGS.has(el.tagName) && el.firstChild) {
        node = el.firstChild;
        continue;
      }
      return el;
    }
    node = node.nextSibling;
  }
  return null;
};

// Раскрыть спейсер обратно в поток (содержимое остаётся на месте).
const unwrap = (spacer: HTMLElement) => {
  const parent = spacer.parentNode;
  if (!parent) return;
  while (spacer.firstChild) parent.insertBefore(spacer.firstChild, spacer);
  spacer.remove();
  // Склеиваем осколки текста: иначе следующий проход не увидит ведущий прогон
  // целиком (он оказался бы разрезан на два соседних текстовых узла).
  parent.normalize();
};

const makeLeadSpacer = (text: string): HTMLElement => {
  const span = document.createElement("span");
  span.setAttribute(LEAD_SPACE_ATTR, "1");
  span.setAttribute("style", LEAD_SPACE_STYLE);
  span.textContent = text;
  return span;
};

// Приводит спейсер к канону: внутри — только ведущие пробелы блока.
// null — спейсер пришлось раскрыть, блок надо переразметить с нуля.
const normalizeExistingSpacer = (spacer: HTMLElement): boolean | null => {
  const text = spacer.textContent || "";
  const keep = leadingSpaceCount(text);

  // Внутрь коробки попал набранный символ (курсор стоял на её правом краю)
  // или отступ стёрли целиком — раскрываем и собираем заново.
  if (keep !== text.length || keep === 0 || spacer.children.length) {
    unwrap(spacer);
    return null;
  }
  if (spacer.getAttribute("style") !== LEAD_SPACE_STYLE) {
    spacer.setAttribute("style", LEAD_SPACE_STYLE);
    return true;
  }
  // Пробелы, набранные вплотную справа от коробки, забираем внутрь — иначе
  // часть отступа осталась бы снаружи и снова растягивалась выключкой.
  const next = spacer.nextSibling;
  if (next && next.nodeType === Node.TEXT_NODE) {
    const extra = leadingSpaceCount((next as Text).data);
    if (extra) {
      (next as Text).deleteData(0, extra);
      spacer.textContent = text + " ".repeat(extra);
      if (!(next as Text).data.length) next.remove();
      return true;
    }
  }
  return false;
};

const normalizeHost = (host: HTMLElement): boolean => {
  let reopened = false;
  const existing = firstContentNode(host);
  if (isLeadSpacer(existing)) {
    const res = normalizeExistingSpacer(existing);
    if (res !== null) return res;
    reopened = true;
  }

  const node = firstContentNode(host);
  if (!node || node.nodeType !== Node.TEXT_NODE) return reopened;

  const text = node as Text;
  const count = leadingSpaceCount(text.data);
  if (!count) return reopened;

  const spacer = makeLeadSpacer(text.data.slice(0, count));
  text.deleteData(0, count);
  text.parentNode?.insertBefore(spacer, text);
  if (!text.data.length) text.remove();
  return true;
};

/**
 * Оборачивает ведущие пробелы каждого блока в неразрываемую инлайн-коробку,
 * чтобы выключка «по ширине» не растягивала отступ абзаца. Идемпотентна:
 * повторный вызов на уже нормализованном дереве ничего не меняет и возвращает
 * false — за счёт этого обычный набор пробелов идёт без правок DOM.
 */
export const normalizeLeadingSpaces = (root: HTMLElement): boolean => {
  let mutated = false;

  // Спейсеры, переставшие быть началом блока (например, абзац разрезали Enter'ом
  // посередине отступа), раскрываем обратно — дальше их подберёт общий проход.
  root.querySelectorAll<HTMLElement>(`[${LEAD_SPACE_ATTR}]`).forEach((s) => {
    const host = s.parentElement?.closest<HTMLElement>(LEAD_HOST_SELECTOR);
    if (!host || firstContentNode(host) !== s) {
      unwrap(s);
      mutated = true;
    }
  });

  const hosts: HTMLElement[] = [
    root,
    ...root.querySelectorAll<HTMLElement>(LEAD_HOST_SELECTOR),
  ];
  hosts.forEach((host) => {
    // Вложенные блоки (<div><p>…) обслуживает самый внутренний хост.
    const inner = firstContentNode(host);
    if (
      inner &&
      inner.nodeType === Node.ELEMENT_NODE &&
      (inner as HTMLElement).matches?.(LEAD_HOST_SELECTOR)
    ) {
      return;
    }
    if (normalizeHost(host)) mutated = true;
  });

  return mutated;
};

/**
 * Приводит пробельную разметку холста к канону после правки: ведущий отступ
 * абзаца — в своей коробке, табулятор — только из неразрывных пробелов.
 * Состав символов при этом не меняется, поэтому курсор восстанавливается по
 * абсолютному смещению точно. Возвращает true, если дерево пришлось менять.
 */
export const syncEditorWhitespace = (editor: HTMLElement | null): boolean => {
  if (!editor) return false;
  const caret = getCaretCharOffset(editor);
  // Порядок важен: сначала выселяем чужие символы из табулятора — они могут
  // оказаться ведущими пробелами блока и тогда попадут в отступ этим же проходом.
  const tabs = normalizeTabSpacers(editor);
  const lead = normalizeLeadingSpaces(editor);
  if (!tabs && !lead) return false;
  restoreCaretCharOffset(editor, caret);
  return true;
};
