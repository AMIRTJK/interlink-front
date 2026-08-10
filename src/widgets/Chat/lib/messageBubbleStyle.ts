import type { CSSProperties } from "react";

/**
 * Оформление пузыря сообщения. Все цвета берутся из токенов активной темы
 * (`--th-*`), поэтому пузыри перекрашиваются вместе с выбранной темой.
 * При наведении в тёмной теме к теням добавляется внешнее свечение — фон и
 * рамка при этом не меняются.
 */

interface IBubbleStyleParams {
  isMe: boolean;
  isDark: boolean;
  isHovered: boolean;
  isEffectivelyDeleted: boolean;
  isTargetHighlighted: boolean;
  currentMatchMsg: boolean;
  highlighted: boolean;
  hasThread: boolean;
}

/** Базовое оформление пузыря без учёта наведения. */
const getBaseBubbleStyle = ({
  isMe,
  isDark,
  isEffectivelyDeleted,
  isTargetHighlighted,
  currentMatchMsg,
  highlighted,
  hasThread,
}: Omit<IBubbleStyleParams, "isHovered">): CSSProperties => {
  if (isTargetHighlighted) {
    const baseStyle = isMe
      ? {
          background: "var(--th-bubble-out-bg)",
          color: "var(--th-bubble-out-text)",
        }
      : {
          background: "var(--th-bubble-in-bg)",
          color: "var(--th-bubble-in-text)",
        };
    return {
      ...baseStyle,
      border: "2px solid rgb(var(--th-accent-rgb))",
      boxShadow:
        "0 0 28px rgb(var(--th-accent-2-rgb) / 0.9), 0 0 12px rgb(var(--th-accent-rgb) / 0.8)",
      backgroundClip: "padding-box",
    };
  }

  if (isEffectivelyDeleted) return {};

  if (currentMatchMsg) {
    return {
      background: "rgb(var(--th-warning-rgb) / 0.25)",
      border: "1px solid rgb(var(--th-warning-rgb) / 0.4)",
    };
  }

  if (highlighted) {
    return {
      background: "rgb(var(--th-warning-rgb) / 0.15)",
      border: "1px solid rgb(var(--th-warning-rgb) / 0.3)",
    };
  }

  if (hasThread) {
    return isMe
      ? {
          background: "var(--th-bubble-out-bg-soft)",
          border: "1.5px solid rgb(var(--th-accent-2-rgb) / 0.65)",
          boxShadow: isDark
            ? "0 4px 20px rgb(var(--th-accent-rgb) / 0.35), var(--th-inset-highlight)"
            : "none",
          backgroundClip: "padding-box",
        }
      : {
          background: "rgb(var(--th-accent-rgb) / 0.15)",
          border: "1.5px solid var(--th-accent-border)",
          boxShadow: isDark
            ? "0 2px 12px rgb(var(--th-accent-rgb) / 0.15), var(--th-inset-highlight)"
            : "none",
          backgroundClip: "padding-box",
        };
  }

  if (isMe) {
    return {
      background: "var(--th-bubble-out-bg)",
      border: "none",
      boxShadow: isDark ? "var(--th-glow-accent)" : "none",
      backgroundClip: "padding-box",
    };
  }

  return {
    background: "var(--th-bubble-in-bg)",
    border: "1px solid var(--th-bubble-in-border)",
    boxShadow: isDark
      ? "var(--th-shadow-soft), var(--th-inset-highlight)"
      : "none",
    backgroundClip: "padding-box",
  };
};

interface IHoverGlowParams {
  isDark: boolean;
  isHovered: boolean;
  isMe: boolean;
  /** У подсвеченного перехода своя пульсация — свечение к ней не добавляем. */
  isTargetHighlighted?: boolean;
}

/**
 * Наружное свечение при наведении. Общее для всех видов сообщения — текста,
 * вложений и голосового, — чтобы подсветка выглядела одинаково.
 */
export const getHoverGlow = ({
  isDark,
  isHovered,
  isMe,
  isTargetHighlighted,
}: IHoverGlowParams): string | null => {
  if (!isDark || !isHovered || isTargetHighlighted) return null;
  return isMe ? "var(--th-glow-out)" : "var(--th-glow-in)";
};

/** Добавляет свечение к уже собранным теням, не затирая их. */
export const withHoverGlow = (
  boxShadow: CSSProperties["boxShadow"],
  glow: string | null,
): CSSProperties["boxShadow"] => {
  if (!glow) return boxShadow;
  return [boxShadow, glow].filter((value) => value && value !== "none").join(", ");
};

export const getMessageBubbleStyle = ({
  isHovered,
  isDark,
  ...base
}: IBubbleStyleParams): CSSProperties => {
  const style = getBaseBubbleStyle(base);

  const glow = base.isEffectivelyDeleted
    ? null
    : getHoverGlow({
        isDark,
        isHovered,
        isMe: base.isMe,
        isTargetHighlighted: base.isTargetHighlighted,
      });

  if (!glow) return style;

  return { ...style, boxShadow: withHoverGlow(style.boxShadow, glow) };
};
