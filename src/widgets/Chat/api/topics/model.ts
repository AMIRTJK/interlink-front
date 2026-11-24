// Контракты топиков личного чата. Поля названы так, как их будет отдавать
// бэкенд (snake_case, как у остальных ресурсов /api/v1/chat/**), чтобы при
// подключении API типы не пришлось переписывать.

export type TTopicId = string;

export interface ITopic {
  id: TTopicId;
  conversation_id: number;
  title: string;
  /** Топик «Общий»: не переименовывается и не удаляется. */
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/** Ответ списка топиков беседы вместе с привязками сообщений. */
export interface IConversationTopics {
  topics: ITopic[];
  /**
   * id сообщения → id топика. Сообщение без записи относится к «Общему».
   * С API это поле уйдёт: топик будет приходить в самом сообщении (`topic_id`).
   */
  message_topics: Record<string, TTopicId>;
}

export interface ICreateTopicPayload {
  conversationId: number;
  title: string;
}

export interface IRenameTopicPayload {
  conversationId: number;
  topicId: TTopicId;
  title: string;
}

export interface IDeleteTopicPayload {
  conversationId: number;
  topicId: TTopicId;
}

export interface IMessageTopicLink {
  messageId: string;
  topicId: TTopicId;
}

export interface IBindMessagesPayload {
  conversationId: number;
  links: IMessageTopicLink[];
}

/** Id топика по умолчанию. Сообщения без привязки показываются в нём. */
export const DEFAULT_TOPIC_ID: TTopicId = "general";
export const DEFAULT_TOPIC_TITLE = "Общий";
export const TOPIC_TITLE_MAX_LENGTH = 40;

/** Корень ключа кэша TanStack Query для топиков. */
export const TOPICS_QUERY_KEY = "chat-topics-local";
