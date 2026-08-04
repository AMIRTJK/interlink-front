import { AUTOSPLIT_ATTR, SPACER_ATTR } from "../../lib/constants";
import {
  brAtCharBoundary,
  dropChars,
  removeLeadingBr,
  truncateToChars,
  wordBoundaryBefore,
} from "../../../InternalCorrespondenceIncomingView/lib";
import { nextSplitGroupId } from "./editorSplitGroup";

/**
 * Служебная распорка: нередактируемый блок нужной высоты, которым содержимое
 * сдвигается на начало следующего листа. При сохранении распорки вырезаются.
 *
 * События мыши распорка ПРИНИМАЕТ (никакого `pointer-events: none`): только так
 * над ней стоит курсор-стрелка вместо курсора набора, и только так mousedown по
 * ней виден обработчику редактора, который гасит его и не даёт браузеру
 * поставить каретку в остаток листа (handleEditorMouseDown).
 */
export const makeSpacer = (h: number): HTMLElement => {
  const s = document.createElement("div");
  s.setAttribute(SPACER_ATTR, "1");
  s.setAttribute("contenteditable", "false");
  s.setAttribute("aria-hidden", "true");
  s.style.height = `${Math.max(0, h)}px`;
  s.style.width = "100%";
  s.style.userSelect = "none";
  s.style.cursor = "default";
  return s;
};

/**
 * Три способа поделить блок, не влезающий до конца листа: таблица — по строкам,
 * список — по пунктам, абзац — по вертикальному бюджету с сохранением разметки.
 * Каждый возвращает true, если DOM изменён.
 */
export const createBlockSplitters = (
  editor: HTMLElement,
  pageStride: number,
) => {
  // Таблицы — атомарные блоки: их нельзя резать по символам, как абзац.
  // Поэтому таблицу, не помещающуюся на лист, делим по СТРОКАМ: строки, что
  // не влезают до конца страницы, переезжают в таблицу-продолжение (со всеми
  // стилями исходной), между ними ставится распорка. Обе части помечаются
  // AUTOSPLIT_ATTR — при сохранении cleanEditorArtifacts склеит их в одну
  // таблицу. Без этого высокая таблица «перетекала» через границы листов.
  const splitTableByRows = (
    table: HTMLElement,
    usableBottom: number,
    page: number,
    pageStart: number,
  ): boolean => {
    const rows = Array.from(table.querySelectorAll("tr")).filter(
      (tr) => tr.closest("table") === table,
    ) as HTMLElement[];
    if (rows.length < 2) return false;

    // offsetTop у <tr> в разных движках считается относительно <table>, а не
    // редактора — полагаться на него нельзя. Меряем строки через rect и
    // приводим к системе координат редактора (как у table.offsetTop).
    const tableRectTop = table.getBoundingClientRect().top;
    const tableOffsetTop = table.offsetTop;
    const rowBottom = (tr: HTMLElement) => {
      const r = tr.getBoundingClientRect();
      return r.bottom - tableRectTop + tableOffsetTop;
    };

    const splitIdx = rows.findIndex((tr) => rowBottom(tr) > usableBottom + 1);
    if (splitIdx === -1) return false;

    // Даже первая строка не влезает в остаток листа — переносим таблицу
    // целиком на следующую страницу (там доступна полная высота листа).
    if (splitIdx === 0) {
      if (table.offsetTop > pageStart + 2) {
        editor.insertBefore(
          makeSpacer((page + 1) * pageStride - table.offsetTop),
          table,
        );
        return true;
      }
      return false; // одна строка выше целого листа — делить нечем
    }

    const gid = table.getAttribute(AUTOSPLIT_ATTR) || nextSplitGroupId();
    table.setAttribute(AUTOSPLIT_ATTR, gid);

    const tail = document.createElement("table");
    Array.from(table.attributes).forEach((a) =>
      tail.setAttribute(a.name, a.value),
    );
    const tbody = document.createElement("tbody");
    tail.appendChild(tbody);
    for (let k = splitIdx; k < rows.length; k++) tbody.appendChild(rows[k]);

    // Убираем опустевшие группы строк, чтобы они не копились при повторных
    // слияниях/разрезаниях на каждой пагинации.
    table.querySelectorAll("tbody, thead, tfoot").forEach((g) => {
      if (g.closest("table") === table && !g.querySelector("tr")) g.remove();
    });

    editor.insertBefore(tail, table.nextSibling);
    const blockBottom = table.offsetTop + table.offsetHeight;
    editor.insertBefore(makeSpacer((page + 1) * pageStride - blockBottom), tail);
    return true;
  };

  // Списки (UL/OL) делим по пунктам <li>, как таблицы по строкам: пункты, не
  // влезшие до конца страницы, переезжают в список-продолжение с теми же
  // атрибутами. Обе части — в одной AUTOSPLIT-группе, при сохранении
  // склеиваются обратно в один список. Раньше высокий список резался
  // посимвольно через textContent и терял всю структуру пунктов.
  const splitListByItems = (
    list: HTMLElement,
    usableBottom: number,
    page: number,
    pageStart: number,
  ): boolean => {
    const items = Array.from(list.children).filter(
      (n): n is HTMLElement => n.tagName === "LI",
    );

    const moveWholeToNextPage = (): boolean => {
      if (list.offsetTop > pageStart + 2) {
        editor.insertBefore(
          makeSpacer((page + 1) * pageStride - list.offsetTop),
          list,
        );
        return true;
      }
      return false;
    };

    if (items.length < 2) return moveWholeToNextPage();

    // offsetTop у <li> считается относительно списка — меряем через rect и
    // приводим к системе координат редактора (как у list.offsetTop).
    const listRectTop = list.getBoundingClientRect().top;
    const listOffsetTop = list.offsetTop;
    const itemBottom = (li: HTMLElement) =>
      li.getBoundingClientRect().bottom - listRectTop + listOffsetTop;

    const splitIdx = items.findIndex((li) => itemBottom(li) > usableBottom + 1);
    if (splitIdx === -1) return false;
    // Даже первый пункт не влезает в остаток листа — переносим целиком.
    if (splitIdx === 0) return moveWholeToNextPage();

    const gid = list.getAttribute(AUTOSPLIT_ATTR) || nextSplitGroupId();
    list.setAttribute(AUTOSPLIT_ATTR, gid);

    const tail = list.cloneNode(false) as HTMLElement;
    // Нумерация продолжения OL продолжает исходную, а не начинается с 1.
    if (list.tagName === "OL") {
      const startBase = parseInt(list.getAttribute("start") || "1", 10);
      tail.setAttribute("start", String(startBase + splitIdx));
    }
    for (let k = splitIdx; k < items.length; k++) tail.appendChild(items[k]);

    editor.insertBefore(tail, list.nextSibling);
    const blockBottom = list.offsetTop + list.offsetHeight;
    editor.insertBefore(makeSpacer((page + 1) * pageStride - blockBottom), tail);
    return true;
  };

  // Деление абзаца по вертикальному бюджету (остатку места на текущей
  // странице) с СОХРАНЕНИЕМ разметки: голова остаётся на месте, хвост уезжает
  // за распорку на следующий лист. Обе части — в одной AUTOSPLIT-группе и при
  // сохранении склеиваются обратно. Так текст перетекает между страницами
  // построчно, как в Word, без больших пустых областей внизу листа. Возвращает
  // false, если в бюджет не влезает ни одного целого слова.
  //
  // `allowMidWord` разрешает резать слово по буквам. Его ставит только тот
  // вызывающий, у которого блок и так стоит в начале листа: слово шире целой
  // страницы иначе не разместить нигде. В середине листа деление слова
  // запрещено — блок целиком уезжает на следующую страницу.
  const splitBlockToBudget = (
    block: HTMLElement,
    budgetPx: number,
    page: number,
    allowMidWord: boolean,
  ): boolean => {
    const text = block.textContent || "";
    const total = text.length;
    if (total < 2 || budgetPx <= 0) return false;

    const template = block.cloneNode(true) as HTMLElement;
    const originalHtml = block.innerHTML;

    const headHtmlFor = (k: number): string => {
      const probe = template.cloneNode(true) as HTMLElement;
      truncateToChars(probe, { left: k });
      return probe.innerHTML;
    };

    // Бинарный поиск числа символов, влезающих в остаток страницы. Меряем на
    // живом блоке (та же ширина/шрифт/позиция), подменяя содержимое.
    let lo = 1;
    let hi = total - 1;
    let best = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      block.innerHTML = headHtmlFor(mid);
      if (block.offsetHeight <= budgetPx) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    // Разрез по бюджету почти всегда приходится на середину слова. Отступаем
    // назад к границе слова, чтобы слово уехало на следующий лист целиком.
    const wordCut = wordBoundaryBefore(text, best);
    const cut = wordCut > 0 ? wordCut : allowMidWord ? best : 0;

    if (cut < 1) {
      block.innerHTML = originalHtml;
      return false;
    }

    const tail = template.cloneNode(true) as HTMLElement;
    dropChars(tail, { left: cut });
    // <br> ровно на границе разреза принадлежит голове (там он невидим);
    // в хвосте он дал бы лишнюю пустую строку в начале страницы.
    if (brAtCharBoundary(template, cut)) removeLeadingBr(tail);
    if (!(tail.textContent || "").trim() && !tail.querySelector("br,img")) {
      // Хвост пуст — деление не имеет смысла.
      block.innerHTML = originalHtml;
      return false;
    }

    block.innerHTML = headHtmlFor(cut);

    const gid = block.getAttribute(AUTOSPLIT_ATTR) || nextSplitGroupId();
    block.setAttribute(AUTOSPLIT_ATTR, gid);
    tail.setAttribute(AUTOSPLIT_ATTR, gid);

    editor.insertBefore(tail, block.nextSibling);
    const blockBottom = block.offsetTop + block.offsetHeight;
    editor.insertBefore(makeSpacer((page + 1) * pageStride - blockBottom), tail);
    return true;
  };

  return { splitTableByRows, splitListByItems, splitBlockToBudget };
};
