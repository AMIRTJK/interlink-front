// Сводка по беседам: сколько их всего, сколько собеседников в сети и сколько
// непрочитанных сообщений. Данные те же, что в счётчиках чата (GET /chat/counters)
// и в списке бесед — отдельного запроса под эту строку нет.
//
// В макете это три плитки с эмодзи в цветном кружке и крупным числом рядом.

interface IStat {
  key: string;
  emoji: string;
  title: string;
  /** Токен-триплет тона: заливка плитки и кружка строятся от него. */
  tone: string;
}

const STATS: readonly IStat[] = [
  { key: "chats", emoji: "💬", title: "Всего бесед", tone: "--chat-relief-indigo" },
  { key: "online", emoji: "🟢", title: "В сети", tone: "--chat-relief-green" },
  { key: "unread", emoji: "📩", title: "Непрочитанные сообщения", tone: "--chat-relief-red" },
] as const;

interface IProps {
  chats: number;
  online: number;
  unread: number;
}

export const ReliefCounters = ({ chats, online, unread }: IProps) => {
  const values: Record<string, number> = { chats, online, unread };

  return (
    <div
      className="flex items-center justify-between gap-2 p-[9px] flex-shrink-0"
      style={{
        background: "var(--chat-relief-well-bg)",
        border: "1px solid var(--chat-relief-well-border)",
        borderRadius: 16,
        boxShadow: "var(--chat-relief-well-shadow)",
        backgroundClip: "padding-box",
      }}
    >
      {STATS.map(({ key, emoji, title, tone }) => (
        <span
          key={key}
          title={title}
          className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
          style={{ background: `rgb(var(${tone}) / 0.08)` }}
        >
          <span
            aria-hidden="true"
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] leading-none"
            style={{ background: `rgb(var(${tone}) / 0.15)` }}
          >
            {emoji}
          </span>
          <span className="text-base font-bold leading-tight truncate text-[var(--th-text)]">
            {values[key]}
          </span>
        </span>
      ))}
    </div>
  );
};
