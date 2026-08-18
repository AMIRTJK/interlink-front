
/** Ключ вкладки «Отменено» (реестр отклонённых исходящих писем). */
export const REJECTED_TAB_KEY = "canceled";

/** Значение фильтра «Тип отклонения» по умолчанию (параметр type у бэкенда). */
export const REJECTION_TYPE_ALL = "all";

/** Имя URL-параметра фильтра «Тип отклонения». */
export const REJECTION_TYPE_PARAM = "rejection_type";

/** Тип отклонения: вернул согласующий либо отклонил подписант. */
export type TRejectionType = "approval" | "signature";

export const REJECTION_TYPE_LABELS: Record<TRejectionType, string> = {
  approval: "Согласующий",
  signature: "Подписант",
};

/** Короткая подпись статуса письма по типу отклонения. */
export const REJECTION_STATUS_LABELS: Record<TRejectionType, string> = {
  approval: "Возвращено",
  signature: "Отклонено",
};

/** Автор отклонения (согласующий или подписант). */
export interface IRejectionUser {
  id?: number;
  full_name?: string;
  position?: string;
  photo_path?: string | null;
  photo_url?: string | null;
}

/**
 * Одно отклонение письма. `rejection` — последнее, `rejections` — вся история;
 * оба приходят в ответе реестра `GET_INTERNAL_REJECTED`.
 */
export interface IRejection {
  type?: TRejectionType;
  status?: string;
  reason?: string | null;
  rejected_at?: string | null;
  user?: IRejectionUser | null;
  approval_id?: number | null;
  signature_id?: number | null;
  version_id?: number | null;
  version?: string | null;
}

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
