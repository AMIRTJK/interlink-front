import { useState } from "react";
import { Image } from "antd";
import { Maximize2, ScanLine, ZoomIn } from "lucide-react";
import { GUIDE_IMAGE_SRC } from "./passportUploadStepModel";

export const PassportGuideCard = () => {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-center gap-2.5 p-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <ScanLine size={16} />
        </div>
        <p className="flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Загрузите фото лицевой и обратной сторон паспорта. Фото используется
          для автоматического распознавания данных (OCR). Откройте инструкцию,
          чтобы рассмотреть примеры правильной и неправильной загрузки.
        </p>
      </div>

      <div className="px-3.5 pb-3.5">
        {/* Нарисованная иллюстрация вместо самого фото. Реальная картинка-
            инструкция открывается на весь экран только по клику (см. ниже). */}
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="group relative block w-full cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50"
        >
          <svg viewBox="0 0 320 150" className="h-[150px] w-full" role="img" aria-label="Пример фотографии паспорта">
            {/* Рамка выравнивания (уголки) */}
            {[
              "M14 30 V14 H30",
              "M290 14 H306 V30",
              "M306 120 V136 H290",
              "M30 136 H14 V120",
            ].map((d) => (
              <path key={d} d={d} className="fill-none stroke-blue-300 dark:stroke-blue-500/60" strokeWidth={2.5} strokeLinecap="round" />
            ))}

            {/* Документ */}
            <rect x="34" y="34" width="252" height="82" rx="8" className="fill-white stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-700" strokeWidth={1.5} />

            {/* Фото владельца */}
            <rect x="44" y="44" width="46" height="52" rx="5" className="fill-blue-100 dark:fill-blue-950/50" />
            <circle cx="67" cy="63" r="9" className="fill-blue-300 dark:fill-blue-500/70" />
            <path d="M52 92 c0-9 7-15 15-15 s15 6 15 15 z" className="fill-blue-300 dark:fill-blue-500/70" />

            {/* Строки полей */}
            {[52, 62, 72].map((y, i) => (
              <rect key={y} x="104" y={y} width={i === 2 ? 90 : 150} height="6" rx="3" className="fill-slate-200 dark:fill-slate-700" />
            ))}

            {/* MRZ (машиночитаемая зона) */}
            <g className="fill-slate-300 dark:fill-slate-600">
              {Array.from({ length: 22 }).map((_, i) => (
                <rect key={`a${i}`} x={104 + i * 8} y="98" width="5" height="6" rx="1" />
              ))}
              {Array.from({ length: 22 }).map((_, i) => (
                <rect key={`b${i}`} x={104 + i * 8} y="107" width="5" height="6" rx="1" />
              ))}
            </g>

            {/* Луч сканирования — намёк на распознавание (OCR) */}
            <line x1="34" y1="75" x2="286" y2="75" className="stroke-emerald-400/70" strokeWidth={2} strokeDasharray="4 4" />
          </svg>

          <span className="pointer-events-none absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-slate-900/75 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm transition-transform group-hover:scale-105">
            <Maximize2 size={13} /> Открыть и увеличить
          </span>
        </button>

        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ZoomIn size={12} className="flex-shrink-0" />
          Нажмите, чтобы открыть реальный пример фотографии — приблизить и перемещать.
        </p>

        {/* Реальное фото-инструкция: скрыто, показывается только по клику */}
        <Image
          src={GUIDE_IMAGE_SRC}
          alt="Инструкция по загрузке фотографий паспорта"
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: guideOpen,
            onVisibleChange: setGuideOpen,
            scaleStep: 0.3,
          }}
        />
      </div>
    </div>
  );
};
