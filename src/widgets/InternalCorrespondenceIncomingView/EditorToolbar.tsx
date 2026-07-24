import React from "react";
import {
  Undo,
  Redo,
  Heading1,
  Heading2,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Minus,
  FilePlus2,
  Monitor,
} from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";


// Панель управления редактором для ПРОСМОТРА входящего письма. Внешне 1-в-1
// повторяет тулбар редактора исходящего письма (CreateInternalCorrespondence),
// но так как содержимое входящего письма не редактируется, все инструменты
// форматирования показаны в неактивном (disabled) состоянии. Активны только
// элементы, относящиеся к просмотру: переключатель «Панель разделов сверху»
// и, в этом режиме, горизонтальные кнопки разделов (цилиндров).

export interface ToolbarSection {
  key: string;
  label: string;
  dotClass?: string;
  dotStyle?: React.CSSProperties;
  badge?: number | string;
  isOpen: boolean;
  onToggle: () => void;
}


// Неактивная кнопка тулбара — повторяет вид TBtn редактора в disabled-состоянии.
const TBtn = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    disabled
    className="p-1.5 rounded transition-colors flex-shrink-0 text-slate-300 cursor-not-allowed"
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
);

interface EditorToolbarProps {
  panelsInToolbar: boolean;
  onTogglePanelsInToolbar: (value: boolean) => void;
  sections: ToolbarSection[];
  fontSize?: number;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  panelsInToolbar,
  onTogglePanelsInToolbar,
  sections,
  fontSize = 14,
}) => {
  return (
    <div className="flex-shrink-0 bg-white z-20">
      {/* Ряд инструментов форматирования — неактивен (только просмотр) */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-0.5">
        <TBtn title="Отменить (недоступно при просмотре)">
          <Undo size={14} />
        </TBtn>
        <TBtn title="Повторить (недоступно при просмотре)">
          <Redo size={14} />
        </TBtn>
        <Divider />
        <TBtn title="Заголовок 1">
          <Heading1 size={14} />
        </TBtn>
        <TBtn title="Заголовок 2">
          <Heading2 size={14} />
        </TBtn>
        <Divider />
        <button
          type="button"
          disabled
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium transition-colors border text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed"
        >
          <span>{fontSize}px</span>
          <ChevronDown size={10} />
        </button>
        <Divider />
        <TBtn title="Жирный">
          <Bold size={14} />
        </TBtn>
        <TBtn title="Курсив">
          <Italic size={14} />
        </TBtn>
        <TBtn title="Подчёркнутый">
          <Underline size={14} />
        </TBtn>
        <TBtn title="Зачёркнутый">
          <Strikethrough size={14} />
        </TBtn>
        <TBtn title="Выделить">
          <Highlighter size={14} />
        </TBtn>
        <Divider />
        <TBtn title="По левому краю">
          <AlignLeft size={14} />
        </TBtn>
        <TBtn title="По центру">
          <AlignCenter size={14} />
        </TBtn>
        <TBtn title="По правому краю">
          <AlignRight size={14} />
        </TBtn>
        <TBtn title="По ширине">
          <AlignJustify size={14} />
        </TBtn>
        <Divider />
        <TBtn title="Маркированный список">
          <List size={14} />
        </TBtn>
        <TBtn title="Нумерованный список">
          <ListOrdered size={14} />
        </TBtn>
        <TBtn title="Горизонтальная линия">
          <Minus size={14} />
        </TBtn>
        <Divider />
        <button
          type="button"
          disabled
          title="Новая страница (недоступно при просмотре)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0 bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
        >
          <FilePlus2 size={14} />
          <span>Новая страница</span>
        </button>
        <button
          type="button"
          disabled
          title="Ориентация страницы (недоступно при просмотре)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0 bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
        >
          <Monitor size={16} />
          <span>Книжный</span>
        </button>
        <Divider />
        {/* Активный элемент просмотра: вынести разделы (цилиндры) наверх */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
          <input
            type="checkbox"
            checked={panelsInToolbar}
            onChange={(e) => onTogglePanelsInToolbar(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Панель разделов сверху</span>
        </label>
      </div>

      {/* Демо-режим: горизонтальная панель разделов под тулбаром. «Цилиндры»
          открывают те же панели у холста, что и боковые вкладки (боковые
          вкладки при этом скрыты). */}
      {panelsInToolbar && (
        <div className="px-3 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center gap-2 font-sans">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1 select-none">
            Разделы
          </span>
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={section.onToggle}
              className={cn(
                "flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer select-none",
                section.isOpen
                  ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300",
              )}
            >
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full flex-shrink-0",
                  section.dotClass,
                )}
                style={section.dotStyle}
              />
              <span>{section.label}</span>
              <If is={section.badge !== undefined && section.badge !== null && section.badge !== ""}>
                <span
                  className={cn(
                    "text-[10px] font-bold rounded-full px-1.5 py-0.5 flex items-center justify-center flex-shrink-0 min-w-4 h-4",
                    section.isOpen
                      ? "bg-white text-slate-800"
                      : "bg-indigo-100 text-indigo-700",
                  )}
                >
                  {section.badge}
                </span>
              </If>
            </button>

          ))}
        </div>
      )}
    </div>
  );
};
