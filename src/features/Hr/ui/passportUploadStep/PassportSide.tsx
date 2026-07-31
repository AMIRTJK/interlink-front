import { useRef, useState } from "react";
import { Image } from "antd";
import { CheckCircle2, UploadCloud, X } from "lucide-react";
import {
  ACCEPT,
  IPassportFile,
  SIDE_LABEL,
  TSide,
} from "./passportUploadStepModel";

// Одна зона загрузки для стороны паспорта (лицевая / обратная).
// В дальнейшем сюда подключится OCR: после загрузки распознанные данные
// автоматически подставятся в поля формы (см. onChange родителя).
export const PassportSide = ({
  side,
  value,
  onSelect,
  onRemove,
}: {
  side: TSide;
  value: IPassportFile | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    // Файл только выбирается локально. Реальная загрузка + OCR-распознавание
    // происходят на шаге «Продолжить» (POST /api/v1/admin/users/passport-ocr).
    onSelect(file);
  };

  if (value) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-2.5 dark:border-emerald-800/50 dark:bg-emerald-950/30">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={14} /> {SIDE_LABEL[side]}
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
          >
            <X size={12} /> Заменить
          </button>
        </div>
        <div className="overflow-hidden rounded-xl ring-1 ring-emerald-200 dark:ring-emerald-800">
          <Image
            src={value.previewUrl}
            alt={SIDE_LABEL[side]}
            rootClassName="block! w-full"
            className="block! h-[150px]! w-full! cursor-zoom-in object-cover"
            preview={{ mask: <span className="text-xs font-semibold">Открыть</span> }}
          />
        </div>
        <p className="mt-1.5 truncate text-[11px] text-emerald-600/80 dark:text-emerald-500/80">
          {value.file.name}
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex h-full min-h-[190px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
            : "border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          <UploadCloud size={20} />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {SIDE_LABEL[side]}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Перетащите или выберите файл
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </>
  );
};
