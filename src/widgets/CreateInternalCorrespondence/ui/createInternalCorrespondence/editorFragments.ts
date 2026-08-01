import { SPACER_ATTR } from "../../lib/constants";

const stripSpacers = (wrapper: HTMLElement) => {
  wrapper.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => n.remove());
};

const drainToFragment = (wrapper: HTMLElement): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
  return fragment;
};

// Превращает очищенный HTML из Word в фрагмент для вставки.
// Распорки страниц вырезаем — их редактор расставляет сам при пагинации.
export const buildFragmentFromHtml = (html: string): DocumentFragment => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  stripSpacers(wrapper);
  return drainToFragment(wrapper);
};

// Инлайновый фрагмент для вставки однострочного форматированного текста: блоки
// (p/div/h*/li/…) разворачиваем в их содержимое, чтобы вставка шла В СТРОКУ
// рядом с курсором, но сохраняла оформление (жирный/курсив/подчёркивание/цвет/
// размер через span style). Иначе одиночное скопированное слово либо уезжало
// на новую строку (как блок), либо теряло стили (как голый текст).
export const buildInlineFragmentFromHtml = (html: string): DocumentFragment => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  stripSpacers(wrapper);
  const BLOCK_SEL =
    "p,div,h1,h2,h3,h4,h5,h6,li,ul,ol,table,thead,tbody,tr,td,th,blockquote,section,header,footer,pre,figure";
  let guard = 0;
  let block = wrapper.querySelector(BLOCK_SEL);
  while (block && guard++ < 2000) {
    block.replaceWith(...Array.from(block.childNodes));
    block = wrapper.querySelector(BLOCK_SEL);
  }
  return drainToFragment(wrapper);
};
