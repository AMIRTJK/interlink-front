import { useEffect, useRef, useState } from "react";
import { Image } from "antd";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Maximize2,
  ScanLine,
  UploadCloud,
  X,
  ZoomIn,
} from "lucide-react";

export interface IPassportFile {
  file: File;
  previewUrl: string;
}

interface IProps {
  value: IPassportFile | null;
  onChange: (value: IPassportFile | null) => void;
}

// Изображение-инструкция (примеры правильной/неправильной загрузки).
// Лежит в public/, поэтому ссылаемся строкой-URL, а не import — так отсутствие
// файла не ломает сборку. Чтобы заменить картинку, достаточно перезаписать файл
// по этому пути (см. public/images/passport-guide/README.md).
const GUIDE_IMAGE_SRC = "/images/passport-guide/passport-upload-guide.png";

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
      <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <img
            src={value.previewUrl}
            alt="Паспорт"
            className="h-14 w-20 flex-shrink-0 rounded-lg object-cover ring-1 ring-emerald-200 dark:ring-emerald-800"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={15} /> Паспорт загружен
            </p>
            <p className="truncate text-xs text-emerald-600/80 dark:text-emerald-500/80">
              {value.file.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
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
      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-start gap-2.5 p-3.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ScanLine size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Как сфотографировать паспорт
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Фото используется для автоматического распознавания данных (OCR).
              Откройте инструкцию, чтобы рассмотреть примеры правильной и
              неправильной загрузки.
            </p>
          </div>
        </div>

        {/* Кликабельное превью инструкции. Открывает полноэкранный просмотр
            (antd Image) с зумом (кнопки + колесо), перемещением и поворотом. */}
        <div className="px-3.5 pb-3.5">
          <div className="overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
            <Image
              src={GUIDE_IMAGE_SRC}
              alt="Инструкция по загрузке фотографий паспорта"
              rootClassName="block! w-full"
              className="block! h-[168px]! w-full! cursor-zoom-in object-cover object-top"
              preview={{
                scaleStep: 0.3,
                mask: (
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <Maximize2 size={14} /> Открыть и увеличить
                  </span>
                ),
              }}
            />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ZoomIn size={12} className="flex-shrink-0" />
            Нажмите на изображение, чтобы открыть его, приблизить и перемещать.
          </p>
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
            ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
            : "border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
        } ${uploading ? "cursor-wait opacity-80" : "cursor-pointer"}`}
      >
        {uploading ? (
          <>
            <Loader2 size={26} className="animate-spin text-blue-500" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Загрузка паспорта…
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Обработка изображения
            </p>
          </>
        ) : (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <UploadCloud size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Перетащите файл или{" "}
              <span className="text-blue-600 dark:text-blue-400">
                выберите на устройстве
              </span>
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
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
