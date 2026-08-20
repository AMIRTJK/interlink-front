import { Check, CheckCheck, Clock3 } from "lucide-react";
import type { Message } from "../../model";

// Время сообщения и статус отправки. Место зависит от оформления: в классическом
// подпись вжата в правый нижний угол пузыря, в современном стоит отдельной
// строкой под ним — поэтому разметка одна, а обёртка разная.

interface IProps {
  time: string;
  isMe: boolean;
  isPending: boolean;
  status?: Message["status"];
  placement: "inside" | "below";
}

const ICON_CLASS = "w-3.5 h-3.5";

export const MessageMeta = ({
  time,
  isMe,
  isPending,
  status,
  placement,
}: IProps) => {
  const isBelow = placement === "below";

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

  return (
    <span className={wrapperClass}>
      <span>{time}</span>
      {isMe && (
        <span className="inline-flex items-center ml-0.5" title={status}>
          {isPending ? (
            <Clock3 className={`w-3 h-3 animate-pulse ${iconColor}`} />
          ) : status === "read" || status === "delivered" ? (
            <CheckCheck className={`${ICON_CLASS} ${iconColor}`} />
          ) : (
            <Check className={`${ICON_CLASS} ${iconColor}`} />
          )}
        </span>
      )}
    </span>
  );
};
