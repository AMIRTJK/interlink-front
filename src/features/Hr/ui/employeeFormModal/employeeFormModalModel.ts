import type { IPassportOcrData } from "@entities/hr";
import type { IPassportFile, IPassportSides } from "../PassportUploadStep";

export interface IPassportMeta {
  passport_front_path: string | null;
  passport_back_path: string | null;
  passport_ocr_scanned_at: string | null;
  passport_ocr_data: IPassportOcrData | null;
}

export const PASSPORT_DRAFT_KEY = "hr_passport_draft";

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const dataUrlToFile = (dataUrl: string, name: string, type: string): File => {
  const [meta, base64] = dataUrl.split(",");
  const mime = type || meta.match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(base64);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], name, { type: mime });
};

export const EMPTY_PASSPORT: IPassportSides = { front: null, back: null };

export const sideToStored = (side: IPassportFile | null) =>
  side
    ? fileToDataUrl(side.file).then((dataUrl) => ({
        name: side.file.name,
        type: side.file.type,
        dataUrl,
      }))
    : Promise.resolve(null);

export const storedToSide = (
  stored: { name: string; type: string; dataUrl: string } | null,
): IPassportFile | null => {
  if (!stored?.dataUrl) return null;
  return {
    file: dataUrlToFile(stored.dataUrl, stored.name, stored.type),
    previewUrl: stored.dataUrl,
  };
};

export const readPassportDraft = (): IPassportSides => {
  try {
    const raw = localStorage.getItem(PASSPORT_DRAFT_KEY);
    if (!raw) return EMPTY_PASSPORT;
    const parsed = JSON.parse(raw);
    return {
      front: storedToSide(parsed.front),
      back: storedToSide(parsed.back),
    };
  } catch {
    return EMPTY_PASSPORT;
  }
};
