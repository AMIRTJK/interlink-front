import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  ImageOff,
  Loader2,
  ScanLine,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

export interface IPassportFile {
  file: File;
  previewUrl: string;
}

interface IProps {
  value: IPassportFile | null;
  onChange: (value: IPassportFile | null) => void;
}

const RECOMMENDATIONS = [
  "Загрузите фотографию или скан паспорта в хорошем качестве.",
  "Изображение должно быть чётким, без размытия.",
  "Паспорт должен полностью помещаться в кадре.",
  "Документ расположен ровно, без наклона и перспективных искажений.",
  "Все текстовые поля хорошо читаемы.",
  "Избегайте бликов, теней и посторонних предметов в кадре.",
];

const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

// Шаг загрузки паспорта — обязательный первый шаг создания сотрудника.
// В дальнейшем сюда подключается OCR: после успешной загрузки распознанные
// данные автоматически подставляются в поля формы (см. onChange).
export const PassportUploadStep = ({ value, onChange }: IProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (value) URL.revokeObjectURL(value.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    // Имитация загрузки на сервер. Позже здесь будет реальный upload + OCR,
    // а извлечённые данные пробросятся в форму через onChange/родительский колбэк.
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setTimeout(() => {
      setUploading(false);
      onChange({ file, previewUrl });
    }, 900);
  };

  const handleRemove = () => {
    if (value) URL.revokeObjectURL(value.previewUrl);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Загруженный паспорт — компактная карточка с превью и возможностью заменить.
  if (value) {
    return (
      <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
        <div className="flex items-center gap-3">
          <img
            src={value.previewUrl}
            alt="Паспорт"
            className="h-14 w-20 flex-shrink-0 rounded-lg object-cover ring-1 ring-emerald-200"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={15} /> Паспорт загружен
            </p>
            <p className="truncate text-xs text-emerald-600/80">{value.file.name}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
          >
            <X size={13} /> Заменить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      {/* Информационный раздел с инструкцией */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ScanLine size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Загрузка паспорта</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Изображение паспорта используется для автоматического распознавания данных (OCR) —
              они будут подставлены в поля формы. Чтобы распознавание прошло корректно,
              подготовьте документ по рекомендациям ниже.
            </p>
          </div>
        </div>

        <ul className="mt-3 grid gap-1.5">
          {RECOMMENDATIONS.map((text) => (
            <li key={text} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-blue-500" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {/* Иллюстрация с примерами. ЗАГЛУШКА — заменить на готовое изображение,
            не меняя структуру: достаточно подставить <img src=... /> внутрь блоков. */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-white p-2">
            <div className="flex h-24 items-center justify-center rounded-lg bg-emerald-50 text-emerald-400">
              {/* TODO: заменить на реальную иллюстрацию правильной загрузки */}
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={22} />
                <span className="text-[10px] font-medium">пример макета</span>
              </div>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 size={12} /> Правильно
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-white p-2">
            <div className="flex h-24 items-center justify-center rounded-lg bg-rose-50 text-rose-400">
              {/* TODO: заменить на реальную иллюстрацию неправильной загрузки */}
              <div className="flex flex-col items-center gap-1">
                <ImageOff size={22} />
                <span className="text-[10px] font-medium">пример макета</span>
              </div>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
              <X size={12} /> Неправильно
            </p>
          </div>
        </div>
      </div>

      {/* Зона загрузки */}
      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
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
        disabled={uploading}
        className={`mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/40"
        } ${uploading ? "cursor-wait opacity-80" : "cursor-pointer"}`}
      >
        {uploading ? (
          <>
            <Loader2 size={26} className="animate-spin text-blue-500" />
            <p className="text-sm font-semibold text-slate-700">Загрузка паспорта…</p>
            <p className="text-xs text-slate-400">Обработка изображения</p>
          </>
        ) : (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <UploadCloud size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Перетащите файл или{" "}
              <span className="text-blue-600">выберите на устройстве</span>
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <FileText size={12} /> JPG, PNG или WEBP
            </p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};
