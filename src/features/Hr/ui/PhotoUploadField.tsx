import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { If } from "@shared/ui";
import { SectionTitle } from "./inputs";

interface IPhotoUploadFieldProps {
  initialUrl?: string;
  onChange?: (file: File | null) => void;
}

export const PhotoUploadField = ({ initialUrl, onChange }: IPhotoUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initialUrl);

  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, []);

  const setBlob = (url?: string) => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    blobRef.current = url ?? null;
  };

  const onFile = (f?: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setBlob(url);
    setPreview(url);
    onChange?.(f);
  };

  const onRemove = () => {
    setBlob(undefined);
    setPreview(undefined);
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null);
  };

  return (
    <section>
      <SectionTitle icon={<Camera size={13} />}>Фото сотрудника</SectionTitle>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-dashed border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 hover:border-indigo-400 transition-colors flex items-center justify-center cursor-pointer"
        >
          {preview ? (
            <img src={preview} alt="Фото" className="w-full h-full object-cover" onError={onRemove} />
          ) : (
            <Camera size={20} className="text-gray-400" />
          )}
        </button>
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 hover:border-indigo-400 text-gray-600 dark:text-slate-400 cursor-pointer"
            >
              <Camera size={14} />
              {preview ? "Заменить фото" : "Загрузить фото"}
            </button>
            <If is={preview}>
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-400 hover:text-red-500 hover:border-red-200 text-sm font-medium transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </If>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-600">Необязательно · JPG, PNG или WEBP</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </section>
  );
};
