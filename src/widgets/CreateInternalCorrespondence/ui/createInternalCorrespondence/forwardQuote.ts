import {
  AUTOSPLIT_ATTR,
  PAGE_BREAK_ATTR,
  SPACER_ATTR,
  STAMP_ATTR,
} from "../../lib/constants";
import { wrapBareTopLevelNodes } from "./editorCaret";

// ===== Цитата пересылаемого письма (как в Outlook) =====
// При «Перенаправить» тело входящего письма кладётся прямо в холст: сверху
// пустое место под свой текст, ниже — разделитель и само пересылаемое письмо.
// Каждый блок цитаты помечаем FWD_ATTR: по метке её потом находят, чтобы убрать
// (в режиме просмотра входящего письма цитата в холсте не нужна — оригинал и
// так открыт на боковом холсте) и чтобы не вставить её второй раз.
export const FWD_ATTR = "data-forwarded";

export const hasForwardQuote = (editor: HTMLElement): boolean =>
  !!editor.querySelector(`[${FWD_ATTR}]`);

export const removeForwardQuote = (editor: HTMLElement): boolean => {
  const nodes = editor.querySelectorAll(`[${FWD_ATTR}]`);
  nodes.forEach((n) => n.remove());
  return nodes.length > 0;
};

// Блоки цитаты кладём СИБЛИНГАМИ верхнего уровня, а не одной обёрткой: пагинатор
// разбирает документ по верхнеуровневым детям редактора, и один гигантский
// контейнер ему пришлось бы резать целиком.
export const buildForwardQuoteNodes = (
  meta: { sender: string; date: string; subject: string; inboundNumber: string },
  bodyHtml: string,
): HTMLElement[] => {
  const nodes: HTMLElement[] = [];

  const divider = document.createElement("div");
  divider.setAttribute(FWD_ATTR, "divider");
  divider.style.cssText =
    "border-top:1px solid #94a3b8;margin:22px 0 14px;height:0;line-height:0;font-size:0;";
  nodes.push(divider);

  const head = document.createElement("div");
  head.setAttribute(FWD_ATTR, "head");
  head.style.cssText = "margin-bottom:12px;";
  const row = (label: string, value: string) =>
    value ? `<div><b>${label}:</b> ${value}</div>` : "";
  head.innerHTML =
    row("От", meta.sender) +
    row("Отправлено", meta.date) +
    row("Вх. номер", meta.inboundNumber) +
    row("Тема", meta.subject);
  nodes.push(head);

  const holder = document.createElement("div");
  holder.innerHTML = bodyHtml;
  // Разметку пагинатора исходного письма в цитату не тащим. Рисунок ЭЦП тоже
  // убираем, и не только из-за абсолютного позиционирования: по наличию
  // STAMP_ATTR в теле вычисляется состояние подписи версии (см. allVersions),
  // и чужая печать внутри цитаты сломала бы этот расчёт у нового письма.
  holder
    .querySelectorAll(`[${SPACER_ATTR}],[${PAGE_BREAK_ATTR}],[${STAMP_ATTR}]`)
    .forEach((n) => n.remove());
  wrapBareTopLevelNodes(holder);
  Array.from(holder.children).forEach((child) => {
    const el = child as HTMLElement;
    el.setAttribute(FWD_ATTR, "body");
    el.removeAttribute(AUTOSPLIT_ATTR);
    nodes.push(el);
  });

  return nodes;
};
