import type { CSSProperties } from "react";

/**
 * Наружное свечение пузыря при наведении в тёмной теме: только внешние тени,
 * без spread-кольца — фон и рамка сообщения остаются прежними.
 */
const HOVER_GLOW_OUTGOING =
  "0 0 22px rgba(139,92,246,0.55), 0 0 52px rgba(124,58,237,0.35)";
const HOVER_GLOW_INCOMING =
  "0 0 20px rgba(167,139,250,0.35), 0 0 48px rgba(124,58,237,0.22)";

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

/** Базовое оформление пузыря сообщения без учёта наведения. */
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
    return {
      background:
        "linear-gradient(135deg, rgb(236, 72, 153), rgb(168, 85, 247), rgb(59, 130, 246))",
      border: "2px solid #ffffff",
      boxShadow:
        "0 0 28px rgba(236, 72, 153, 0.9), 0 0 12px rgba(168, 85, 247, 0.8)",
      color: "#ffffff",
    };
  }

  if (isEffectivelyDeleted) return {};

  if (currentMatchMsg) {
    return {
      background: "rgba(251,191,36,0.25)",
      border: "1px solid rgba(251,191,36,0.4)",
    };
  }

  if (highlighted) {
    return {
      background: "rgba(251,191,36,0.15)",
      border: "1px solid rgba(251,191,36,0.3)",
    };
  }

  if (hasThread) {
    return isMe
      ? {
          background:
            "linear-gradient(135deg,rgba(124,58,237,0.75),rgba(168,85,247,0.65),rgba(6,182,212,0.6))",
          border: "1.5px solid rgba(196,181,253,0.65)",
          boxShadow:
            "0 4px 20px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
          backgroundClip: "padding-box",
        }
      : {
          background: "rgba(124,58,237,0.15)",
          border: "1.5px solid rgba(167,139,250,0.4)",
          boxShadow:
            "0 2px 12px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
          backgroundClip: "padding-box",
        };
  }

  if (isMe) {
    return {
      background:
        "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))",
      border: "1px solid rgba(167,139,250,0.4)",
      boxShadow: "0 0 16px rgba(124, 58, 237, 0.5)",
      backgroundClip: "padding-box",
    };
  }

  return {
    background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.85)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.15)"
      : "1px solid rgba(0,0,0,0.08)",
    boxShadow: isDark
      ? "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
      : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
    backgroundClip: "padding-box",
  };
};

/**
 * Оформление пузыря сообщения. При наведении в тёмной теме к существующим
 * теням добавляется внешнее свечение — фон и рамка не меняются.
 */
export const getMessageBubbleStyle = ({
  isHovered,
  ...base
}: IBubbleStyleParams): CSSProperties => {
  const style = getBaseBubbleStyle(base);

  const needsGlow =
    base.isDark &&
    isHovered &&
    !base.isEffectivelyDeleted &&
    !base.isTargetHighlighted;

  if (!needsGlow) return style;

  const glow = base.isMe ? HOVER_GLOW_OUTGOING : HOVER_GLOW_INCOMING;

  return {
    ...style,
    boxShadow: [style.boxShadow, glow].filter(Boolean).join(", "),
  };
};
