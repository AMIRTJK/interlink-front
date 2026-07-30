import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export function PassportScanLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-5">
      <div className="relative w-36 h-44 rounded-2xl bg-slate-900 border-2 border-indigo-500/50 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        <div className="w-28 h-36 border border-indigo-400/20 rounded-lg p-2 flex flex-col justify-between opacity-60">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-10 rounded bg-indigo-500/30 border border-indigo-400/30 flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2 bg-indigo-400/30 rounded w-full" />
              <div className="h-2 bg-indigo-400/30 rounded w-3/4" />
              <div className="h-1.5 bg-indigo-400/20 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 bg-indigo-400/20 rounded w-full" />
            <div className="h-1.5 bg-indigo-400/20 rounded w-4/5" />
            <div className="h-1.5 bg-indigo-400/20 rounded w-2/3" />
          </div>
        </div>

        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_3px_rgba(34,211,238,0.8)] animate-scan-beam" />

        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="p-3 rounded-full bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/50">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          Сканирование паспорта (OCR)...
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          Выполняется обработка документа и извлечение данных. Пожалуйста,
          подождите, процесс распознавания может занять от 20 до 40 секунд...
        </p>
      </div>

      <div className="w-full max-w-xs h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600 rounded-full animate-pulse w-full" />
      </div>
    </div>
  );
}
