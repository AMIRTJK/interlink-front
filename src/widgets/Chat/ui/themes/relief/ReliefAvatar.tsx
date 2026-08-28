import type { Contact } from "../../../model";
import { buildInitialsAvatar } from "../../../lib/chatFormat";

// Аватарка макета: картинка в кольце из внутренней тени и точка присутствия в
// правом нижнем углу. В отличие от общего индикатора, здесь у точки есть и
// состояние «не в сети» — в макете оно нарисовано серым кружком, а не пустотой.

interface IProps {
  contact: Contact;
  size: number;
  /** Показывать точку присутствия. У групп её нет — присутствия у группы нет. */
  withPresence?: boolean;
  className?: string;
}

/** Диаметр точки присутствия: 12px при аватарке 44px — пропорция макета. */
const DOT_RATIO = 12 / 44;
const MIN_DOT = 10;

export const ReliefAvatar = ({
  contact,
  size,
  withPresence = true,
  className = "",
}: IProps) => {
  const dotSize = Math.max(MIN_DOT, Math.round(size * DOT_RATIO));
  const showPresence = withPresence && !contact.isGroup;

  return (
    <span
      className={`relative flex-shrink-0 inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={contact.avatar}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = buildInitialsAvatar(
            contact.name,
          );
        }}
        className="w-full h-full object-cover overflow-hidden rounded-full"
        style={{
          // Внутренняя светлая кайма отделяет аватарку от карточки, тень снизу
          // приподнимает её — как в макете.
          boxShadow:
            "inset 0 0 0 2px rgb(255 255 255 / 0.8), 0 2px 6px 1px rgb(0 0 0 / 0.2)",
        }}
      />

      {showPresence && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 z-20 rounded-full pointer-events-none"
          style={{
            width: dotSize,
            height: dotSize,
            background: contact.online
              ? "var(--chat-relief-online)"
              : "var(--chat-relief-offline)",
            border: `2px solid var(--chat-relief-online-ring)`,
            boxShadow: contact.online
              ? "0 0 5px 1px rgb(15 186 128 / 0.5)"
              : undefined,
          }}
        />
      )}
    </span>
  );
};
