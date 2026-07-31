export interface IPassportFile {
  file: File;
  previewUrl: string;
}

export interface IPassportSides {
  front: IPassportFile | null;
  back: IPassportFile | null;
}

export type TSide = "front" | "back";

// Изображение-инструкция (примеры правильной/неправильной загрузки).
// Лежит в public/, поэтому ссылаемся строкой-URL, а не import — так отсутствие
// файла не ломает сборку. Чтобы заменить картинку, достаточно перезаписать файл
// по этому пути (см. public/images/passport-guide/README.md).
export const GUIDE_IMAGE_SRC = "/images/passport-guide/passport-upload-guide.png";

export const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

export const SIDE_LABEL: Record<TSide, string> = {
  front: "Лицевая сторона",
  back: "Обратная сторона",
};
