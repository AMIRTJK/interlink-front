import { Check, CheckCheck, Clock3 } from "lucide-react";
import type { Message } from "../../model";
import type { IChatThemePresentation } from "../../model/chatThemes";

// Время сообщения и статус отправки. Место зависит от оформления: в классическом
// подпись вжата в правый нижний угол пузыря, в остальных стоит отдельной
// строкой под ним — поэтому разметка одна, а обёртка разная.
//
// Вид значка тоже задаёт оформление: галочки-иконки либо кружок с галочкой
// внутри (объёмное оформление). Смысл состояний у обоих один и тот же —
// меняется только форма.

interface IProps {
  time: string;
  isMe: boolean;
  isPending: boolean;
  status?: Message["status"];
  placement: "inside" | "below";
  /** Форма значка статуса. По умолчанию — галочки-иконки. */
  statusStyle?: IChatThemePresentation["messageStatus"];
}

const ICON_CLASS = "w-3.5 h-3.5";

/** Кружок с галочкой: у доставленного и прочитанного их два, у отправленного один. */
const TickBadge = () => (
  <span className="chat-relief-tick">
    <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
  </span>
);

export const MessageMeta = ({
  time,
  isMe,
  isPending,
  status,
  placement,
  statusStyle = "icon",
}: IProps) => {
  const isBelow = placement === "below";
  const isBadge = statusStyle === "badge";

  // Внутри пузыря подпись живёт на его заливке, снаружи — на фоне переписки:
  // цвет берётся у соответствующей поверхности, иначе он тонет в фоне.
  const wrapperClass = isBelow
    ? `mt-1 flex items-center gap-1 select-none text-[10px] text-[var(--th-text-faint)] ${
        isMe ? "self-end" : "self-start"
      }`
    : "inline-flex items-center gap-1 float-right mt-1 ml-2.5 select-none text-[10px] opacity-75";

  const iconColor = isBelow
    ? "text-[rgb(var(--th-success-rgb))]"
    : "text-[var(--th-bubble-out-text-muted)]";

  const isDoubleTick = status === "read" || status === "delivered";

  return (
    <span className={wrapperClass}>
      <span>{time}</span>
      {isMe && (
        <span
          className={`inline-flex items-center ml-0.5 ${isBadge ? "gap-0.5" : ""}`}
          title={status}
        >
          {isPending ? (
            isBadge ? (
              <span className="chat-relief-tick chat-relief-tick--pending">
                <Clock3 className="w-2.5 h-2.5 animate-pulse" strokeWidth={3} />
              </span>
            ) : (
              <Clock3 className={`w-3 h-3 animate-pulse ${iconColor}`} />
            )
          ) : isBadge ? (
            <>
              <TickBadge />
              {isDoubleTick && <TickBadge />}
            </>
          ) : isDoubleTick ? (
            <CheckCheck className={`${ICON_CLASS} ${iconColor}`} />
          ) : (
            <Check className={`${ICON_CLASS} ${iconColor}`} />
          )}
        </span>
      )}
    </span>
  );
};
