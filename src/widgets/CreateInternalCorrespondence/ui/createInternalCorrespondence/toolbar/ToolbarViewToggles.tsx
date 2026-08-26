import type { Dispatch, SetStateAction } from "react";
import { RotateCcw } from "lucide-react";

import { If } from "@shared/ui";

interface IProps {
  rulerEnabled: boolean;
  toggleRuler: (enabled: boolean) => void;
  isRulerDefault: boolean;
  resetRulerMargins: () => void;
  gridEnabled: boolean;
  toggleGrid: (enabled: boolean) => void;
  navPaneEnabled: boolean;
  toggleNavPane: (enabled: boolean) => void;
  hasSectionsToggle: boolean;
  panelsInToolbar: boolean;
  setPanelsInToolbar: Dispatch<SetStateAction<boolean>>;
  hasIncomingSource: boolean;
  showOriginalLetterSides: boolean;
  toggleOriginalLetterSides: (checked: boolean) => void;
  hasVersions: boolean;
  showVersionCompareSides: boolean;
  toggleVersionCompareSides: (checked: boolean) => void;
  showAuthorship: boolean;
  toggleAuthorship: (checked: boolean) => void;
}

export const ToolbarViewToggles = ({
  rulerEnabled,
  toggleRuler,
  isRulerDefault,
  resetRulerMargins,
  gridEnabled,
  toggleGrid,
  navPaneEnabled,
  toggleNavPane,
  hasSectionsToggle,
  panelsInToolbar,
  setPanelsInToolbar,
  hasIncomingSource,
  showOriginalLetterSides,
  toggleOriginalLetterSides,
  hasVersions,
  showVersionCompareSides,
  toggleVersionCompareSides,
  showAuthorship,
  toggleAuthorship,
}: IProps) => (
  <>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
      <input
        type="checkbox"
        checked={rulerEnabled}
        onChange={(e) => toggleRuler(e.target.checked)}
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
      <span>Линейка</span>
    </label>
    {rulerEnabled && (
      <button
        type="button"
        onClick={resetRulerMargins}
        disabled={isRulerDefault}
        title={
          isRulerDefault
            ? "Поля страницы уже стандартные"
            : "Вернуть поля страницы к значениям по умолчанию"
        }
        className="flex items-center gap-1.5 px-2.5 py-1 ml-2 rounded text-xs font-semibold transition-colors border flex-shrink-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <RotateCcw size={14} />
        <span>Сбросить</span>
      </button>
    )}
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 mr-2 ml-1">
      <input
        type="checkbox"
        checked={gridEnabled}
        onChange={(e) => toggleGrid(e.target.checked)}
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
      <span>Сетка</span>
    </label>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
      <input
        type="checkbox"
        checked={navPaneEnabled}
        onChange={(e) => toggleNavPane(e.target.checked)}
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
      <span>Область навигации</span>
    </label>
    {hasSectionsToggle && (
      <>
        <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
          <input
            type="checkbox"
            checked={panelsInToolbar}
            onChange={(e) => setPanelsInToolbar(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Панель разделов сверху</span>
        </label>
      </>
    )}
    {hasIncomingSource && (
      <>
        <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
          <input
            type="checkbox"
            checked={showOriginalLetterSides}
            onChange={(e) => toggleOriginalLetterSides(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Режим просмотра входящего письма</span>
        </label>
      </>
    )}
    <If is={hasVersions}>
      <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
        <input
          type="checkbox"
          checked={showVersionCompareSides}
          onChange={(e) => toggleVersionCompareSides(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <span>Режим просмотра истории версий</span>
      </label>
    </If>
    {/* Рецензирование — самостоятельный режим со своей колонкой подсветки
        авторов. От истории версий и просмотра входящего не зависит, поэтому
        переключатель доступен всегда, когда у документа есть версии. */}
    <If is={hasVersions}>
      <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
        <input
          type="checkbox"
          checked={showAuthorship}
          onChange={(e) => toggleAuthorship(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <span>Рецензирование</span>
      </label>
    </If>
  </>
);
