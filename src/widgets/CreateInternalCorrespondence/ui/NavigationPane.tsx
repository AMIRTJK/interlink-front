import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@shared/lib";
import {
  SPACER_ATTR,
  AUTOSPLIT_ATTR,
  PAGE_BREAK_ATTR,
  STAMP_ATTR,
} from "../lib/constants";

// Область навигации как в Word («Вид → Область навигации», Ctrl+F): панель,
// пришвартованная слева от листа, с тремя вкладками — «Заголовки» (структура
// документа), «Страницы» (эскизы листов) и «Результаты» (совпадения поиска).
// Поиск подсвечивает все вхождения прямо в тексте и умеет ходить по ним
// стрелками, при вводе запроса Word сам переключается на «Результаты» — здесь
// так же.
//
// Подсветка сделана через CSS Custom Highlight API: он рисует выделение, не
// трогая DOM редактора. Это принципиально — оборачивать совпадения в <mark>
// внутри contenteditable значило бы менять тело письма и попадать в сохранение
// и в историю правок.

type PaneTab = "headings" | "pages" | "results";

// Служебные узлы разбивки и штамп ЭЦП в навигацию не попадают: это не текст
// документа, а разметка пагинатора.
const SERVICE_SELECTOR = `[${SPACER_ATTR}],[${PAGE_BREAK_ATTR}],[${STAMP_ATTR}]`;
const HEADING_SELECTOR = "h1,h2,h3,h4,h5,h6";

const HIGHLIGHT_ALL = "icc-search";
const HIGHLIGHT_ACTIVE = "icc-search-active";

// Сколько символов контекста показываем вокруг совпадения в списке результатов
const SNIPPET_PAD = 34;

type HeadingEntry = { el: HTMLElement; level: number; text: string };
type HeadingItem = { index: number; level: number; text: string; top: number };
type SearchHit = { before: string; match: string; after: string; page: number };

// CSS Custom Highlight API есть не везде (нужен Chrome 105+/Safari 17.2+).
// Достаём его через узкий шим: без него панель просто работает без подсветки.
type HighlightRegistry = {
  set: (name: string, highlight: unknown) => void;
  delete: (name: string) => void;
};
const highlightApi = (): {
  registry: HighlightRegistry;
  create: (ranges: Range[]) => unknown;
} | null => {
  const g = window as unknown as {
    CSS?: { highlights?: HighlightRegistry };
    Highlight?: new (...ranges: Range[]) => unknown;
  };
  if (!g.CSS?.highlights || !g.Highlight) return null;
  const Ctor = g.Highlight;
  return {
    registry: g.CSS.highlights,
    create: (ranges: Range[]) => new Ctor(...ranges),
  };
};

// Заголовки документа по порядку. Разрезанный пагинатором заголовок даёт
// несколько DOM-узлов с одним AUTOSPLIT_ATTR — берём только первый кусок,
// иначе один заголовок задвоился бы в структуре.
const collectHeadings = (editor: HTMLElement | null): HeadingEntry[] => {
  if (!editor) return [];
  const seenSplit = new Set<string>();
  const out: HeadingEntry[] = [];
  editor.querySelectorAll<HTMLElement>(HEADING_SELECTOR).forEach((el) => {
    if (el.closest(SERVICE_SELECTOR)) return;
    const split = el.getAttribute(AUTOSPLIT_ATTR);
    if (split) {
      if (seenSplit.has(split)) return;
      seenSplit.add(split);
    }
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;
    out.push({ el, level: Number(el.tagName.slice(1)) || 1, text });
  });
  return out;
};

// Совпадения поиска как Range'и по текстовым узлам редактора. Регистр не
// учитываем — как в Word по умолчанию.
const collectMatches = (
  editor: HTMLElement | null,
  query: string,
): Range[] => {
  const needle = query.trim().toLowerCase();
  if (!editor || !needle) return [];
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || parent.closest(SERVICE_SELECTOR))
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const ranges: Range[] = [];
  let node = walker.nextNode();
  while (node) {
    const text = node.textContent || "";
    const lower = text.toLowerCase();
    let from = 0;
    for (;;) {
      const at = lower.indexOf(needle, from);
      if (at === -1) break;
      const range = document.createRange();
      range.setStart(node, at);
      range.setEnd(node, at + needle.length);
      ranges.push(range);
      from = at + needle.length;
    }
    node = walker.nextNode();
  }
  return ranges;
};

interface IProps {
  onClose: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  /** Меняется при любой правке — по нему пересобираем структуру и совпадения */
  editorContent: string;
  pageCount: number;
  pageStride: number;
  pageWidth: number;
  pageHeight: number;
  fontSize: number;
  /** Готовые страницы для эскизов; вызываем только на вкладке «Страницы» */
  getPages: () => string[];
}

export const NavigationPane: React.FC<IProps> = ({
  onClose,
  editorRef,
  scrollerRef,
  headerRef,
  canvasRef,
  editorContent,
  pageCount,
  pageStride,
  pageWidth,
  pageHeight,
  fontSize,
  getPages,
}) => {
  const [tab, setTab] = useState<PaneTab>("headings");
  const [query, setQuery] = useState("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [activeHeading, setActiveHeading] = useState(-1);
  const [currentPage, setCurrentPage] = useState(0);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [activeHit, setActiveHit] = useState(0);
  const [thumbs, setThumbs] = useState<string[]>([]);

  // ===== Структура документа =====
  // Замеры снимаем следующим кадром, а не в теле эффекта: тело письма и его
  // разбивка на страницы правятся императивно (innerHTML + пагинатор), и на
  // момент коммита React раскладка ещё не финальная — offsetTop был бы старый.
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setHeadings(
        collectHeadings(editorRef.current).map((h, index) => ({
          index,
          level: h.level,
          text: h.text,
          top: h.el.offsetTop,
        })),
      );
    });
    return () => window.cancelAnimationFrame(raf);
  }, [editorContent, pageCount, editorRef]);

  // ===== Эскизы страниц =====
  // Пересборка клонирует каждый блок документа, поэтому делаем её только на
  // открытой вкладке и с паузой после набора — иначе эскизы перестраивались бы
  // на каждое нажатие клавиши.
  useEffect(() => {
    if (tab !== "pages") return;
    const timer = window.setTimeout(() => setThumbs(getPages()), 300);
    return () => window.clearTimeout(timer);
  }, [tab, editorContent, pageCount, getPages]);

  // ===== Поиск =====
  const matchesRef = useRef<Range[]>([]);
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      const ranges = collectMatches(editorRef.current, query);
      matchesRef.current = ranges;
      setActiveHit(0);
      setHits(
        ranges.map((range) => {
          const text = range.startContainer.textContent || "";
          const from = range.startOffset;
          const to = range.endOffset;
          return {
            before:
              (from > SNIPPET_PAD ? "…" : "") +
              text.slice(Math.max(0, from - SNIPPET_PAD), from),
            match: text.slice(from, to),
            after:
              text.slice(to, to + SNIPPET_PAD) +
              (text.length > to + SNIPPET_PAD ? "…" : ""),
            page: Math.max(
              0,
              Math.floor(
                (range.startContainer.parentElement?.offsetTop ?? 0) / pageStride,
              ),
            ),
          };
        }),
      );
    });
    return () => window.cancelAnimationFrame(raf);
  }, [query, editorContent, pageCount, pageStride, editorRef]);

  // Подсветка всех совпадений + отдельная подсветка текущего.
  useEffect(() => {
    const api = highlightApi();
    if (!api) return;
    const ranges = matchesRef.current;
    if (!ranges.length) {
      api.registry.delete(HIGHLIGHT_ALL);
      api.registry.delete(HIGHLIGHT_ACTIVE);
      return;
    }
    api.registry.set(HIGHLIGHT_ALL, api.create(ranges));
    const current = ranges[activeHit];
    if (current) api.registry.set(HIGHLIGHT_ACTIVE, api.create([current]));
    else api.registry.delete(HIGHLIGHT_ACTIVE);
  }, [hits, activeHit]);

  // Панель закрыли — снимаем подсветку, иначе она осталась бы в тексте.
  useEffect(() => {
    return () => {
      const api = highlightApi();
      if (!api) return;
      api.registry.delete(HIGHLIGHT_ALL);
      api.registry.delete(HIGHLIGHT_ACTIVE);
    };
  }, []);

  // ===== Переходы по документу =====
  const scrollToViewportTop = useCallback(
    (rectTop: number) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const delta = rectTop - scroller.getBoundingClientRect().top;
      scroller.scrollTo({
        top: Math.max(0, scroller.scrollTop + delta - headerH - 24),
        behavior: "smooth",
      });
    },
    [scrollerRef, headerRef],
  );

  // Позицию берём из живого DOM в момент клика: между построением списка и
  // кликом мог пройти пересчёт страниц, и сохранённые узлы уже не те.
  const goToHeading = useCallback(
    (index: number) => {
      const entry = collectHeadings(editorRef.current)[index];
      if (!entry) return;
      scrollToViewportTop(entry.el.getBoundingClientRect().top);
      setActiveHeading(index);
    },
    [editorRef, scrollToViewportTop],
  );

  const goToPage = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      scrollToViewportTop(
        canvas.getBoundingClientRect().top + index * pageStride,
      );
      setCurrentPage(index);
    },
    [canvasRef, pageStride, scrollToViewportTop],
  );

  const goToHit = useCallback(
    (index: number) => {
      const ranges = collectMatches(editorRef.current, query);
      matchesRef.current = ranges;
      const range = ranges[index];
      if (!range) return;
      setActiveHit(index);
      scrollToViewportTop(range.getBoundingClientRect().top);
    },
    [editorRef, query, scrollToViewportTop],
  );

  const stepHit = useCallback(
    (delta: number) => {
      if (!hits.length) return;
      goToHit((activeHit + delta + hits.length) % hits.length);
    },
    [activeHit, hits.length, goToHit],
  );

  // Текущий заголовок и текущая страница — подсвечиваем то, что сейчас на
  // экране, как это делает Word при прокрутке документа.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const canvas = canvasRef.current;
    if (!scroller || !canvas) return;
    const update = () => {
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const anchor =
        scroller.getBoundingClientRect().top + headerH + 32;
      const canvasTop = canvas.getBoundingClientRect().top;
      setCurrentPage(
        Math.min(
          pageCount - 1,
          Math.max(0, Math.floor((anchor - canvasTop) / pageStride)),
        ),
      );
      const entries = collectHeadings(editorRef.current);
      let active = -1;
      entries.forEach((entry, i) => {
        if (entry.el.getBoundingClientRect().top <= anchor) active = i;
      });
      setActiveHeading(active);
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, [scrollerRef, canvasRef, headerRef, editorRef, pageCount, pageStride, editorContent]);

  // Свернуть/развернуть ветку структуры. Свёрнутым считается заголовок, у
  // которого есть вложенные — скрываем всё до следующего заголовка того же или
  // более высокого уровня.
  const hiddenHeadings = useMemo(() => {
    const hidden = new Set<number>();
    headings.forEach((h, i) => {
      if (!collapsed.has(i)) return;
      for (let k = i + 1; k < headings.length; k++) {
        if (headings[k].level <= h.level) break;
        hidden.add(k);
      }
    });
    return hidden;
  }, [headings, collapsed]);

  const hasChildren = useCallback(
    (i: number) =>
      i + 1 < headings.length && headings[i + 1].level > headings[i].level,
    [headings],
  );

  const toggleCollapsed = (i: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const thumbScale = 168 / pageWidth;

  const tabs: { key: PaneTab; label: string; count?: number }[] = [
    { key: "headings", label: "Заголовки" },
    { key: "pages", label: "Страницы", count: pageCount },
    { key: "results", label: "Результаты", count: hits.length },
  ];

  return (
    // Максимум высоты приходит от родителя (--icc-nav-max-h) и равен видимой
    // части экрана; списки вкладок прокручиваются внутри за счёт flex-1.
    <div
      className="w-[264px] bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden font-sans"
      style={{ maxHeight: "var(--icc-nav-max-h, 70vh)" }}
    >
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <span className="font-semibold text-sm text-slate-800">Навигация</span>
        <button
          type="button"
          onClick={onClose}
          className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
          aria-label="Закрыть область навигации"
        >
          <X size={15} />
        </button>
      </div>

      <div className="px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
        <div className="relative flex items-center">
          <Search
            size={14}
            className="absolute left-2.5 text-slate-400 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Word при вводе запроса сам показывает вкладку результатов
              if (e.target.value.trim()) setTab("results");
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              stepHit(e.shiftKey ? -1 : 1);
            }}
            placeholder="Поиск в документе"
            className="w-full pl-8 pr-16 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-blue-400 focus:outline-none transition-colors"
          />
          <div className="absolute right-1 flex items-center gap-0.5">
            {query.trim() !== "" && (
              <button
                type="button"
                onClick={() => setQuery("")}
                title="Очистить"
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={() => stepHit(-1)}
              disabled={!hits.length}
              title="Предыдущее совпадение"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronUp size={12} />
            </button>
            <button
              type="button"
              onClick={() => stepHit(1)}
              disabled={!hits.length}
              title="Следующее совпадение"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
        {query.trim() !== "" && (
          <div className="mt-1.5 px-0.5 text-[11px] text-slate-500">
            {hits.length
              ? `Совпадение ${activeHit + 1} из ${hits.length}`
              : "Совпадений нет"}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-2 pt-2 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer",
              tab === t.key
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:bg-slate-100",
            )}
          >
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[9px] font-bold",
                  tab === t.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
        {tab === "headings" && (
          <>
            {headings.length === 0 ? (
              <div className="px-3 py-8 text-center text-[11px] text-slate-400 leading-relaxed">
                В документе нет заголовков.
                <br />
                Примените к строке стиль «Заголовок 1» или «Заголовок 2» на
                панели инструментов — и структура появится здесь.
              </div>
            ) : (
              headings.map((h, i) =>
                hiddenHeadings.has(i) ? null : (
                  <div
                    key={`${h.index}-${h.text}`}
                    className={cn(
                      "group flex items-start gap-0.5 rounded-lg transition-colors",
                      activeHeading === i
                        ? "bg-blue-50"
                        : "hover:bg-slate-100/80",
                    )}
                    style={{ paddingLeft: (h.level - 1) * 12 }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCollapsed(i)}
                      className={cn(
                        "mt-1 p-0.5 rounded text-slate-400 hover:text-slate-700 transition-transform cursor-pointer flex-shrink-0",
                        !hasChildren(i) && "invisible",
                        !collapsed.has(i) && "rotate-90",
                      )}
                      aria-label={collapsed.has(i) ? "Развернуть" : "Свернуть"}
                    >
                      <ChevronRight size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToHeading(h.index)}
                      title={h.text}
                      className={cn(
                        "flex-1 text-left py-1 pr-2 text-xs leading-snug cursor-pointer truncate",
                        activeHeading === i
                          ? "text-blue-700 font-semibold"
                          : "text-slate-600",
                        h.level === 1 && "font-semibold",
                      )}
                    >
                      {h.text}
                    </button>
                  </div>
                ),
              )
            )}
          </>
        )}

        {tab === "pages" && (
          <div className="flex flex-col items-center gap-3 py-1">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                className="cursor-pointer flex flex-col items-center gap-1 group"
              >
                <div
                  className={cn(
                    "relative overflow-hidden bg-white border rounded-md transition-all",
                    currentPage === i
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-slate-200 group-hover:border-slate-400",
                  )}
                  style={{
                    width: pageWidth * thumbScale,
                    height: pageHeight * thumbScale,
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: pageWidth,
                      height: pageHeight,
                      transform: `scale(${thumbScale})`,
                      transformOrigin: "top left",
                      fontFamily: "Times New Roman, serif",
                      fontSize,
                      lineHeight: 1.8,
                      color: "#1e293b",
                      pointerEvents: "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: thumbs[i] || "" }}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold tabular-nums",
                    currentPage === i ? "text-blue-600" : "text-slate-400",
                  )}
                >
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "results" && (
          <>
            {query.trim() === "" ? (
              <div className="px-3 py-8 text-center text-[11px] text-slate-400 leading-relaxed">
                Введите текст в поле поиска, чтобы найти его в документе.
              </div>
            ) : hits.length === 0 ? (
              <div className="px-3 py-8 text-center text-[11px] text-slate-400">
                Ничего не найдено.
              </div>
            ) : (
              hits.map((hit, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToHit(i)}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-lg text-[11px] leading-snug transition-colors cursor-pointer",
                    activeHit === i
                      ? "bg-blue-50 text-slate-700"
                      : "text-slate-500 hover:bg-slate-100/80",
                  )}
                >
                  <span className="text-slate-400">{hit.before}</span>
                  <span className="bg-amber-200 text-slate-900 font-semibold rounded-sm px-0.5">
                    {hit.match}
                  </span>
                  <span className="text-slate-400">{hit.after}</span>
                  <span className="block mt-0.5 text-[10px] text-slate-400">
                    Страница {hit.page + 1}
                  </span>
                </button>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
