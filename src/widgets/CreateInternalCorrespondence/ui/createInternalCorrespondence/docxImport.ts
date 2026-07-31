import { PAGE_BREAK_ATTR } from "../../lib/constants";

// Маркер разрыва страницы редактора — тот же, что создаёт кнопка «Новая
// страница». Используется при импорте Word, чтобы перенести разрывы из .docx.
export const makeImportPageBreak = (): HTMLElement => {
  const div = document.createElement("div");
  div.setAttribute(PAGE_BREAK_ATTR, "1");
  div.setAttribute("contenteditable", "false");
  div.setAttribute("aria-hidden", "true");
  div.style.cssText =
    "height:0;line-height:0;font-size:0;break-after:page;page-break-after:always;user-select:none;-webkit-user-select:none;pointer-events:none;";
  return div;
};

// Word-разрыв страницы из mammoth приходит ВНУТРИ абзаца (<p>…маркер…</p>),
// а пагинатор видит только разрывы верхнего уровня. Поэтому «поднимаем» маркер:
// делим родительский блок на «до/после» и вставляем настоящий разрыв между ними.
export const liftPageBreakMarker = (root: HTMLElement, marker: HTMLElement) => {
  let top: HTMLElement = marker;
  while (top.parentElement && top.parentElement !== root)
    top = top.parentElement;

  if (top === marker) {
    marker.replaceWith(makeImportPageBreak());
    return;
  }

  const range = document.createRange();
  range.setStartAfter(marker);
  range.setEndAfter(top);
  const afterFrag = range.extractContents(); // хвост блока (с сохранением стилей)
  marker.remove();
  top.after(makeImportPageBreak(), afterFrag);
};

// Выравнивание и абзацный отступ в Word часто заданы НЕ напрямую, а в стиле
// абзаца (по умолчанию «Обычный»/docDefaults). mammoth такие наследуемые
// свойства в HTML не выводит, поэтому читаем их из styles.xml самого .docx и
// применяем к абзацам без явного выравнивания. Возвращает выравнивание по
// умолчанию и красную строку (в px при 96 DPI).
export const jcToAlign = (jc: string | null): string | null => {
  switch (jc) {
    case "center":
      return "center";
    case "right":
    case "end":
      return "right";
    case "both":
    case "distribute":
      return "justify";
    case "left":
    case "start":
      return "left";
    default:
      return null;
  }
};

// 1 twip = 1/1440 дюйма; px при 96 DPI = twips / 15.
export const twipsToPx = (tw: string | null | undefined): number | null => {
  if (tw == null) return null;
  const n = parseInt(tw, 10);
  return isNaN(n) ? null : Math.round(n / 15);
};

export type DocxDefaults = {
  align: string | null;
  firstLinePx: number;
  leftPx: number;
};

// Кодируем форматирование абзаца (выравнивание + красная строка + левый отступ)
// в имя стиля/класса. mammoth не умеет выводить inline-стили, поэтому через
// styleMap прокидываем класс, а его потом разбираем в mammothToEditorHtml.
// Возвращает null, если форматирование тривиальное (слева, без отступов).
export const paragraphFmtKey = (
  jcVal: string | null | undefined,
  firstLineTwips: string | null | undefined,
  leftTwips: string | null | undefined,
  defaults: DocxDefaults,
): string | null => {
  const align = jcToAlign(jcVal ?? null) ?? defaults.align ?? "left";
  const flDirect = twipsToPx(firstLineTwips);
  const leftDirect = twipsToPx(leftTwips);
  const flPx = Math.max(0, flDirect != null ? flDirect : defaults.firstLinePx);
  const leftPx = Math.max(0, leftDirect != null ? leftDirect : defaults.leftPx);
  if (align === "left" && flPx === 0 && leftPx === 0) return null;
  return `pfmt_${align}_${flPx}_${leftPx}`;
};

// Читает .docx (styles.xml + document.xml) и возвращает форматирование по
// умолчанию и НАБОР всех нужных ключей абзацев — чтобы заранее сгенерировать
// styleMap-правила mammoth (имена стилей известны только после анализа).
export const analyzeDocxFormatting = async (
  arrayBuffer: ArrayBuffer,
): Promise<{ defaults: DocxDefaults; fmtKeys: string[] }> => {
  const empty: DocxDefaults = { align: null, firstLinePx: 0, leftPx: 0 };
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    const stylesXml = await zip.file("word/styles.xml")?.async("string");
    const docXml = await zip.file("word/document.xml")?.async("string");
    const parser = new DOMParser();

    // --- defaults из styles.xml ---
    let defaults = empty;
    if (stylesXml) {
      const sdoc = parser.parseFromString(stylesXml, "application/xml");
      const jcOf = (el: Element | null) =>
        el?.getElementsByTagName("w:jc")[0]?.getAttribute("w:val") || null;
      const indOf = (el: Element | null, attr: string) =>
        el?.getElementsByTagName("w:ind")[0]?.getAttribute(attr) || null;

      const docDefaultPPr =
        sdoc
          .getElementsByTagName("w:pPrDefault")[0]
          ?.getElementsByTagName("w:pPr")[0] || null;
      const defStyle = Array.from(sdoc.getElementsByTagName("w:style")).find(
        (s) =>
          s.getAttribute("w:type") === "paragraph" &&
          s.getAttribute("w:default") === "1",
      );
      const defStylePPr = defStyle?.getElementsByTagName("w:pPr")[0] || null;

      defaults = {
        align: jcToAlign(jcOf(defStylePPr) || jcOf(docDefaultPPr)),
        firstLinePx:
          twipsToPx(
            indOf(defStylePPr, "w:firstLine") ||
              indOf(docDefaultPPr, "w:firstLine"),
          ) || 0,
        leftPx:
          twipsToPx(
            indOf(defStylePPr, "w:left") ||
              indOf(defStylePPr, "w:start") ||
              indOf(docDefaultPPr, "w:left") ||
              indOf(docDefaultPPr, "w:start"),
          ) || 0,
      };
    }

    // --- набор ключей по всем абзацам document.xml ---
    const keys = new Set<string>();
    if (docXml) {
      const ddoc = parser.parseFromString(docXml, "application/xml");
      Array.from(ddoc.getElementsByTagName("w:p")).forEach((p) => {
        const pPr = p.getElementsByTagName("w:pPr")[0] || null;
        const jc =
          pPr?.getElementsByTagName("w:jc")[0]?.getAttribute("w:val") || null;
        const ind = pPr?.getElementsByTagName("w:ind")[0] || null;
        const key = paragraphFmtKey(
          jc,
          ind?.getAttribute("w:firstLine"),
          ind?.getAttribute("w:left") || ind?.getAttribute("w:start"),
          defaults,
        );
        if (key) keys.add(key);
      });
    }

    return { defaults, fmtKeys: Array.from(keys) };
  } catch {
    return { defaults: empty, fmtKeys: [] };
  }
};

// Пост-обработка HTML от mammoth: раскладываем ключи форматирования абзаца
// (pfmt_*) в inline-стили холста и поднимаем маркеры разрыва страницы наверх.
export const mammothToEditorHtml = (html: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;

  root.querySelectorAll<HTMLElement>("[class*='pfmt_']").forEach((el) => {
    const cls = Array.from(el.classList).find((c) => c.startsWith("pfmt_"));
    if (!cls) return;
    const [, align, fl, left] = cls.split("_");
    if (align && align !== "left") el.style.textAlign = align;
    if (Number(fl) > 0) el.style.textIndent = `${fl}px`;
    if (Number(left) > 0) el.style.marginLeft = `${left}px`;
  });

  // Пустые абзацы (mammoth их сохраняет при ignoreEmptyParagraphs:false)
  // должны занимать строку, как в Word.
  root.querySelectorAll<HTMLElement>("p").forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector("img,br,table"))
      p.appendChild(document.createElement("br"));
  });

  Array.from(root.querySelectorAll<HTMLElement>(".docx-page-break")).forEach(
    (marker) => liftPageBreakMarker(root, marker),
  );

  return root.innerHTML;
};
