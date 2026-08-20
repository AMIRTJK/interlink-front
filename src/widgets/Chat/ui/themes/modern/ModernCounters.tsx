import { Clock3, MessageCircle } from "lucide-react";

// Сводка по беседам: сколько их всего, сколько собеседников в сети и сколько
// непрочитанных сообщений. Данные те же, что в счётчиках чата (GET /chat/counters)
// и в списке бесед — отдельного запроса под эту строку нет.

interface IProps {
  chats: number;
  online: number;
  unread: number;
}

const CHIP_CLASS =
  "flex-1 min-w-0 flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-[var(--chat-modern-card)]";

export const ModernCounters = ({ chats, online, unread }: IProps) => (
  <div
    className="flex items-center gap-2 p-1.5 rounded-2xl"
    style={{ background: "var(--chat-modern-soft)" }}
  >
    <span className={CHIP_CLASS} title="Всего бесед">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgb(139 92 246 / 0.16)" }}
      >
        <MessageCircle
          className="w-3.5 h-3.5"
          style={{ color: "var(--chat-modern-purple)" }}
        />
      </span>
      <span className="text-sm font-bold text-[var(--th-text)]">{chats}</span>
    </span>

    <span className={CHIP_CLASS} title="В сети">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgb(34 197 94 / 0.16)" }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--chat-modern-green)" }}
        />
      </span>
      <span className="text-sm font-bold text-[var(--th-text)]">{online}</span>
    </span>

    <span className={CHIP_CLASS} title="Непрочитанные сообщения">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgb(244 63 94 / 0.16)" }}
      >
        <Clock3
          className="w-3.5 h-3.5"
          style={{ color: "var(--chat-modern-red)" }}
        />
      </span>
      <span className="text-sm font-bold text-[var(--th-text)]">{unread}</span>
    </span>
  </div>
);
