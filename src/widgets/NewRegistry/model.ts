
/**
 * Интерфейс папки в системе
 */
export interface IFolder {
  id: number;
  name: string;
  parent_id: number | null;
  sort?: number;
  slug?: string;
}


/**
 * Пропсы для модального окна перемещения документа
 */
export interface IMoveToFolderModalProps {
  /** Флаг открытия модального окна */
  isOpen: boolean;
  /** Функция закрытия модального окна */
  onClose: () => void;
  /** ID документа для перемещения */
  documentId: number | null;
  /** Список всех доступных папок */
  folders: IFolder[];
  /** Флаг внутреннего документа (влияет на API роут) */
  isInternal?: boolean;
}
