// Тексты панели топиков. Пока функционал только на фронтенде и только
// по-русски, поэтому живут отдельно от общего словаря чата (translations.ts).

export const TOPIC_TEXTS = {
  barLabel: "Топики беседы",
  create: "Новый топик",
  createPlaceholder: "Название топика",
  save: "Сохранить",
  cancel: "Отмена",
  rename: "Переименовать топик",
  remove: "Удалить топик",
  removeConfirm: (title: string) => `Удалить топик «${title}»?`,
  removeHint: "Сообщения не удалятся — они вернутся в «Общий».",
  removeAction: "Удалить",
  localBadge: "Только на этом устройстве",
  localHint:
    "Топики пока работают только на этом устройстве — серверная часть в разработке. Собеседник их не видит.",
  emptyTitle: (title: string) => `В топике «${title}» пока нет сообщений`,
  emptyHint: "Напишите первое — оно будет видно только в этом топике.",
} as const;

export type TTopicEditMode =
  | { kind: "idle" }
  | { kind: "create" }
  | { kind: "rename"; topicId: string }
  | { kind: "remove"; topicId: string };

export const IDLE_MODE: TTopicEditMode = { kind: "idle" };
