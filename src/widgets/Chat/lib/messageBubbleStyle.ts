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
  isEffectivelyDeleted,
  isTargetHighlighted,
  currentMatchMsg,
  highlighted,
  hasThread,
}: Omit<IBubbleStyleParams, "isHovered" | "isDark">): CSSProperties => {
  if (isTargetHighlighted) {
    return {
      background: "var(--th-bubble-out-bg)",
      border: "2px solid rgb(var(--th-on-accent-rgb))",
      boxShadow:
        "0 0 28px rgb(var(--th-accent-2-rgb) / 0.9), 0 0 12px rgb(var(--th-accent-rgb) / 0.8)",
      color: "var(--th-bubble-out-text)",
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
          boxShadow:
            "0 4px 20px rgb(var(--th-accent-rgb) / 0.35), var(--th-inset-highlight)",
          backgroundClip: "padding-box",
        }
      : {
          background: "rgb(var(--th-accent-rgb) / 0.15)",
          border: "1.5px solid var(--th-accent-border)",
          boxShadow:
            "0 2px 12px rgb(var(--th-accent-rgb) / 0.15), var(--th-inset-highlight)",
          backgroundClip: "padding-box",
        };
  }

  if (isMe) {
    return {
      background: "var(--th-bubble-out-bg)",
      border: "1px solid var(--th-bubble-out-border)",
      boxShadow: "var(--th-glow-accent)",
      backgroundClip: "padding-box",
    };
  }

  return {
    background: "var(--th-bubble-in-bg)",
    border: "1px solid var(--th-bubble-in-border)",
    boxShadow: "var(--th-shadow-soft), var(--th-inset-highlight)",
    backgroundClip: "padding-box",
  };
};

export const getMessageBubbleStyle = ({
  isHovered,
  isDark,
  ...base
}: IBubbleStyleParams): CSSProperties => {
  const style = getBaseBubbleStyle(base);

  const needsGlow =
    isDark &&
    isHovered &&
    !base.isEffectivelyDeleted &&
    !base.isTargetHighlighted;

  if (!needsGlow) return style;

  return {
    ...style,
    boxShadow: [style.boxShadow, base.isMe ? "var(--th-glow-out)" : "var(--th-glow-in)"]
      .filter(Boolean)
      .join(", "),
  };
};
