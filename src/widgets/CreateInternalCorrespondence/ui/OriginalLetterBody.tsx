import React, { useState, useMemo } from "react";
import { MessageSquare, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { paginateHtml } from "../../InternalCorrespondenceIncomingView/lib";

interface IProps {
  body?: string | null;
  sourceId?: string | number;
}

export const OriginalLetterBody = ({ body, sourceId }: IProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleOpenOriginal = () => {
    if (sourceId != null) {
      window.open(
        `/modules/correspondence/internal/incoming/${sourceId}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const { pages, stamp } = useMemo(() => {
    return paginateHtml(body, 14);
  }, [body]);

  const totalPages = pages.length;

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
  };

  const currentPageHtml = pages[currentPage] || "";
  const hasStampOnCurrentPage = stamp && stamp.pageIndex === currentPage;

  return (
    <div className="w-[360px] h-[480px] shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4 font-sans!">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-500" />
          <span className="text-sm font-bold text-slate-800">
            Содержимое письма
          </span>
        </div>
        {sourceId != null && (
          <button
            type="button"
            onClick={handleOpenOriginal}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <ExternalLink size={12} />
            <span>Оригинал</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-4 relative">
        {totalPages > 0 ? (
          <div className="flex flex-col min-h-full justify-between">
            <div
              className="text-xs text-slate-700 leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: currentPageHtml }}
            />
            {hasStampOnCurrentPage && stamp?.html && (
              <div
                className="mt-6 border border-blue-100 rounded-xl overflow-hidden max-w-full bg-white shadow-sm [&_div]:!relative [&_div]:!left-0 [&_div]:!top-0 [&_div]:!max-w-full [&_img]:!max-w-full [&_img]:!h-auto"
                dangerouslySetInnerHTML={{ __html: stamp.html }}
              />
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center mt-10">
            Текст письма отсутствует
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Страница {currentPage + 1} из {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
