import type { Translations } from "../lib/translations";

// ─── Реестр оформлений чата ───────────────────────────────────────────────────
// «Оформление» — это только представление: раскладка панелей, форма и цвет
// элементов. Данные, API и состояние у всех оформлений общие (useChatAppState),
// поэтому добавление нового сводится к записи в этом реестре, набору токенов в
// CSS и одному компоненту-оболочке в `ui/themes/<id>`.

export type TChatThemeId = "classic" | "modern" | "relief";

/**
 * Различия представления, которые нужны компонентам вглубь ленты и не
 * выражаются переопределением CSS-токенов. Всё, что выражается цветом,
 * скруглением или тенью, сюда не попадает — это уровень токенов.
 */
export interface IChatThemePresentation {
  /** Время и статус сообщения: внутри пузыря или отдельной строкой под ним. */
  messageMeta: "inside" | "below";
  /** Аватарка отправителя рядом с пузырём. */
  bubbleAvatars: boolean;
  /**
   * Вид статуса отправки: галочки-иконки либо кружок с галочкой внутри (один —
   * доставлено, два — прочитано). Это форма значка, а не его цвет, поэтому
   * переопределением токенов такое не выражается.
   */
  messageStatus: "icon" | "badge";
}

export interface IChatThemeMeta {
  id: TChatThemeId;
  /** Ключ названия в словаре чата — подписи остаются переводимыми. */
  labelKey: keyof Translations;
  descriptionKey: keyof Translations;
  presentation: IChatThemePresentation;
}

export const CHAT_THEMES: readonly IChatThemeMeta[] = [
  {
    id: "classic",
    labelKey: "themeClassic",
    descriptionKey: "themeClassicDesc",
    presentation: {
      messageMeta: "inside",
      bubbleAvatars: true,
      messageStatus: "icon",
    },
  },
  {
    id: "modern",
    labelKey: "themeModern",
    descriptionKey: "themeModernDesc",
    presentation: {
      messageMeta: "below",
      bubbleAvatars: false,
      messageStatus: "icon",
    },
  },
  {
    id: "relief",
    labelKey: "themeRelief",
    descriptionKey: "themeReliefDesc",
    presentation: {
      messageMeta: "below",
      bubbleAvatars: false,
      messageStatus: "badge",
    },
  },
] as const;

export const DEFAULT_CHAT_THEME: TChatThemeId = "classic";

/** Ключ пользовательского выбора: оформление переживает перезагрузку. */
export const CHAT_THEME_STORAGE_KEY = "chat:theme";

/** Атрибут на <html>: по нему CSS переопределяет токены чата целиком, включая порталы. */
export const CHAT_THEME_ATTRIBUTE = "data-chat-theme";

export const isChatThemeId = (value: unknown): value is TChatThemeId =>
  CHAT_THEMES.some((theme) => theme.id === value);

export const getChatTheme = (id: TChatThemeId): IChatThemeMeta =>
  CHAT_THEMES.find((theme) => theme.id === id) ?? CHAT_THEMES[0];
