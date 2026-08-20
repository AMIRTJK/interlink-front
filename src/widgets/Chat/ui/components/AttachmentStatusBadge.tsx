import { Check, CheckCheck, Clock3 } from "lucide-react";
import { Tooltip } from "@shared/ui";
import type { Message } from "../../model";

interface IProps {
  /** Статус сообщения; `pending` — ещё уходит на бэкенд. */
  status: NonNullable<Message["status"]>;
  /** Локализованная подпись состояния отправки. */
  sendingLabel: string;
  /**
   * `overlay` — чип поверх картинки (своего фона у неё нет),
   * `inline` — иконка в строке метаданных файла или голосового.
   */
  variant?: "overlay" | "inline";
  /** Пузырь залит акцентом — иконке нужен светлый оттенок. */
  isMe?: boolean;
}

/**
 * Статус доставки своего вложения: часы, пока сообщение отправляется, галочка
 * после ответа бэкенда, двойная — когда доставлено или прочитано. У текста ту же
 * роль играет строка времени, а у картинки, файла и голосового её нет, поэтому
 * отметка ставится на самом пузыре.
 */
export const AttachmentStatusBadge = ({
  status,
  sendingLabel,
  variant = "inline",
  isMe,
}: IProps) => {
  const isPending = status === "pending";
  const isOverlay = variant === "overlay";
  const iconClass = isOverlay ? "w-3.5 h-3.5" : "w-3 h-3";

  return (
    <Tooltip title={isPending ? sendingLabel : status}>
      <span
        aria-label={isPending ? sendingLabel : status}
        className={
          isOverlay
            ? "absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center bg-[var(--th-scrim)] backdrop-blur-sm text-[var(--th-on-accent)]"
            : `inline-flex items-center flex-shrink-0 ${
                isMe
                  ? "text-[var(--th-bubble-out-text-muted)]"
                  : "text-[var(--th-text-muted)]"
              }`
        }
      >
        {isPending ? (
          <Clock3 className={`${iconClass} animate-pulse`} />
        ) : status === "read" || status === "delivered" ? (
          <CheckCheck className={iconClass} />
        ) : (
          <Check className={iconClass} />
        )}
      </span>
    </Tooltip>
  );
};
