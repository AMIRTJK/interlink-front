import { useRef, useState } from "react";
import { Image } from "antd";
import {
  CheckCircle2,
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

export interface IPassportSides {
  front: IPassportFile | null;
  back: IPassportFile | null;
}

type TSide = "front" | "back";

interface IProps {
  value: IPassportSides;
  onChange: (value: IPassportSides) => void;
}

// Изображение-инструкция (примеры правильной/неправильной загрузки).
// Лежит в public/, поэтому ссылаемся строкой-URL, а не import — так отсутствие
// файла не ломает сборку. Чтобы заменить картинку, достаточно перезаписать файл
// по этому пути (см. public/images/passport-guide/README.md).
const GUIDE_IMAGE_SRC = "/images/passport-guide/passport-upload-guide.png";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

const SIDE_LABEL: Record<TSide, string> = {
  front: "Лицевая сторона",
  back: "Обратная сторона",
};

// Одна зона загрузки для стороны паспорта (лицевая / обратная).
// В дальнейшем сюда подключится OCR: после загрузки распознанные данные
// автоматически подставятся в поля формы (см. onChange родителя).
const PassportSide = ({
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
  const [uploading, setUploading] = useState(false);

  const handleFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    // Имитация загрузки на сервер. Позже здесь будет реальный upload + OCR.
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onSelect(file);
    }, 700);
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
        className={`flex h-full min-h-[190px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
            : "border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
        } ${uploading ? "cursor-wait opacity-80" : "cursor-pointer"}`}
      >
        {uploading ? (
          <>
            <Loader2 size={24} className="animate-spin text-blue-500" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Загрузка…
            </p>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <UploadCloud size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {SIDE_LABEL[side]}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Перетащите или выберите файл
            </p>
          </>
        )}
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

// Шаг загрузки паспорта — обязательный первый шаг создания сотрудника.
// Загружаются две стороны: лицевая и обратная. В будущем данные из фото
// будут распознаваться (OCR) и автозаполнять форму.
export const PassportUploadStep = ({ value, onChange }: IProps) => {
  const setSide = (side: TSide, file: File | null) => {
    const prev = value[side];
    if (prev) URL.revokeObjectURL(prev.previewUrl);
    onChange({
      ...value,
      [side]: file ? { file, previewUrl: URL.createObjectURL(file) } : null,
    });
  };

  return (
    <div className="mb-2 space-y-3">
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

      {/* Две стороны паспорта */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PassportSide
          side="front"
          value={value.front}
          onSelect={(file) => setSide("front", file)}
          onRemove={() => setSide("front", null)}
        />
        <PassportSide
          side="back"
          value={value.back}
          onSelect={(file) => setSide("back", file)}
          onRemove={() => setSide("back", null)}
        />
      </div>
    </div>
  );
};
