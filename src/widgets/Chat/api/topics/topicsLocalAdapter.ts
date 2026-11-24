// ВНИМАНИЕ: топики личного чата пока работают ТОЛЬКО НА ФРОНТЕНДЕ.
// Серверной части нет, поэтому топики и привязки сообщений лежат в localStorage
// этого браузера: собеседник их не видит, на другом устройстве их нет.
//
// Что нужно от бэкенда (в стиле остальных ручек /api/v1/chat/**):
//   GET    /api/v1/chat/conversations/:id/topics            — список топиков беседы
//                                                              (включая «Общий» с is_default: true)
//   POST   /api/v1/chat/conversations/:id/topics            — создать { title }
//   PATCH  /api/v1/chat/conversations/:id/topics/:topicId   — переименовать { title }
//   DELETE /api/v1/chat/conversations/:id/topics/:topicId   — удалить; сообщения уходят в «Общий»
//   Поле topic_id (nullable) у сообщения: в ответах ленты и realtime-событиях,
//   во входных данных POST /conversations/:id/messages,
//   и PATCH /api/v1/chat/messages/:messageId { topic_id } — перенос сообщения.
//   Фильтр ленты на сервере: GET /conversations/:id/messages?topic_id=… (иначе
//   пагинация по топику работает только в пределах уже загруженных сообщений).
//   Realtime-события .chat.topic.created/updated/deleted в канал беседы.
//
// Что заменить при подключении:
//   1. Маршруты добавить в ApiRoutes и chatUrls.
//   2. В useChatTopics заменить queryFn/mutationFn этого адаптера на
//      useGetQuery/useMutationQuery (интерфейс хука при этом не меняется);
//      инвалидация — по chatUrls.topics(id) вместо TOPICS_QUERY_KEY.
//   3. message_topics убрать: getMessageTopicId читает message.topicId
//      (маппер chatMappers → topic_id), а topic_id уходит в теле отправки.
//   4. Этот файл и ключ CHAT_TOPICS_STORAGE_KEY удалить.
import { tokenControl } from "@shared/lib";
import {
  DEFAULT_TOPIC_ID,
  DEFAULT_TOPIC_TITLE,
  TOPIC_TITLE_MAX_LENGTH,
  type IBindMessagesPayload,
  type IConversationTopics,
  type ICreateTopicPayload,
  type IDeleteTopicPayload,
  type IRenameTopicPayload,
  type ITopic,
} from "./model";

const CHAT_TOPICS_STORAGE_KEY = "chat:topics:v1";

interface IStoredConversation {
  topics: ITopic[];
  message_topics: Record<string, string>;
}

type TStore = Record<string, IStoredConversation>;

/** Ключ отдельный на каждого пользователя: за одним компьютером могут работать разные люди. */
const storageKey = () => `${CHAT_TOPICS_STORAGE_KEY}:${tokenControl.getUserId() ?? "anon"}`;

/** Событие `storage` из других вкладок фильтруем по этому префиксу. */
export const isTopicsStorageKey = (key: string | null) =>
  !!key && key.startsWith(CHAT_TOPICS_STORAGE_KEY);

const isStoredConversation = (value: unknown): value is IStoredConversation =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as IStoredConversation).topics) &&
  typeof (value as IStoredConversation).message_topics === "object";

const readStore = (): TStore => {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isStoredConversation(value)),
    ) as TStore;
  } catch {
    return {};
  }
};

const writeStore = (store: TStore) => {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(store));
  } catch {
    throw new Error("Не удалось сохранить топики на этом устройстве");
  }
};

const readConversation = (store: TStore, conversationId: number): IStoredConversation =>
  store[conversationId] ?? { topics: [], message_topics: {} };

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildDefaultTopic = (conversationId: number): ITopic => ({
  id: DEFAULT_TOPIC_ID,
  conversation_id: conversationId,
  title: DEFAULT_TOPIC_TITLE,
  is_default: true,
  created_at: "",
  updated_at: "",
});

/** Та же валидация, что ожидается от бэкенда (422 с текстом ошибки). */
const normalizeTitle = (title: string, topics: ITopic[], exceptId?: string) => {
  const value = title.trim().slice(0, TOPIC_TITLE_MAX_LENGTH);
  if (!value) throw new Error("Введите название топика");
  const lower = value.toLowerCase();
  const isTaken =
    lower === DEFAULT_TOPIC_TITLE.toLowerCase() ||
    topics.some((topic) => topic.id !== exceptId && topic.title.toLowerCase() === lower);
  if (isTaken) throw new Error("Топик с таким названием уже есть");
  return value;
};

export const topicsLocalAdapter = {
  list: async (conversationId: number): Promise<IConversationTopics> => {
    const conversation = readConversation(readStore(), conversationId);
    return {
      topics: [buildDefaultTopic(conversationId), ...conversation.topics],
      message_topics: conversation.message_topics,
    };
  },

  create: async ({ conversationId, title }: ICreateTopicPayload): Promise<ITopic> => {
    const store = readStore();
    const conversation = readConversation(store, conversationId);
    const now = new Date().toISOString();
    const topic: ITopic = {
      id: createId(),
      conversation_id: conversationId,
      title: normalizeTitle(title, conversation.topics),
      is_default: false,
      created_at: now,
      updated_at: now,
    };
    store[conversationId] = { ...conversation, topics: [...conversation.topics, topic] };
    writeStore(store);
    return topic;
  },

  rename: async ({ conversationId, topicId, title }: IRenameTopicPayload): Promise<ITopic> => {
    const store = readStore();
    const conversation = readConversation(store, conversationId);
    const current = conversation.topics.find((topic) => topic.id === topicId);
    if (!current) throw new Error("Топик не найден");
    const updated: ITopic = {
      ...current,
      title: normalizeTitle(title, conversation.topics, topicId),
      updated_at: new Date().toISOString(),
    };
    store[conversationId] = {
      ...conversation,
      topics: conversation.topics.map((topic) => (topic.id === topicId ? updated : topic)),
    };
    writeStore(store);
    return updated;
  },

  remove: async ({ conversationId, topicId }: IDeleteTopicPayload): Promise<void> => {
    const store = readStore();
    const conversation = readConversation(store, conversationId);
    store[conversationId] = {
      topics: conversation.topics.filter((topic) => topic.id !== topicId),
      message_topics: Object.fromEntries(
        Object.entries(conversation.message_topics).filter(([, id]) => id !== topicId),
      ),
    };
    writeStore(store);
  },

  bindMessages: async ({ conversationId, links }: IBindMessagesPayload): Promise<void> => {
    const store = readStore();
    const conversation = readConversation(store, conversationId);
    const knownIds = new Set(conversation.topics.map((topic) => topic.id));
    const messageTopics = { ...conversation.message_topics };
    links.forEach(({ messageId, topicId }) => {
      if (topicId === DEFAULT_TOPIC_ID || !knownIds.has(topicId)) {
        delete messageTopics[messageId];
        return;
      }
      messageTopics[messageId] = topicId;
    });
    store[conversationId] = { ...conversation, message_topics: messageTopics };
    writeStore(store);
  },
};
