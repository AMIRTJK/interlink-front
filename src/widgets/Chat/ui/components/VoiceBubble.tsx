import React, { useState, useEffect } from "react";
import { Square } from "lucide-react";
import { formatDuration } from "../../lib/chatHelpers";

interface VoiceBubbleProps {
  duration: number;
  isMe: boolean;
  isDark: boolean;
}

export const VoiceBubble: React.FC<VoiceBubbleProps> = ({
  duration,
  isMe,
  isDark,
}) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const bars = Array.from(
    { length: 20 },
    (_, i) => 0.3 + Math.sin(i * 0.8) * 0.4 + Math.random() * 0.3,
  );

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(
      () =>
        setProgress((p) => {
          if (p >= 100) {
            setPlaying(false);
            return 0;
          }
          return p + 100 / (duration * 10);
        }),
      100,
    );
    return () => clearInterval(iv);
  }, [playing, duration]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl min-w-[160px] transition-all duration-200 ease-in-out hover:brightness-110 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}
      style={{
        background: isMe
          ? "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))"
          : isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.85)",
        border: isMe
          ? "1px solid rgba(167,139,250,0.4)"
          : isDark
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isMe
          ? "0 0 16px rgba(124, 58, 237, 0.5)"
          : "none",
      }}
    >
      <button
        onClick={() => setPlaying((p) => !p)}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-in-out hover:scale-110 ${isDark || isMe ? "text-white" : "text-gray-500 hover:text-gray-800"}`}
        style={{
          background: isMe
            ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
            : isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.05)",
        }}
      >
        {playing ? (
          <Square className="w-3 h-3 fill-current" />
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex items-center gap-0.5 flex-1">
        {bars.map((h, i) => (
          <div
            key={`vb-${i}`}
            className="w-1 rounded-full flex-shrink-0 transition-all"
            style={{
              height: `${h * 20}px`,
              background:
                i < Math.floor((bars.length * progress) / 100)
                  ? "linear-gradient(180deg,#a78bfa,#67e8f9)"
                  : isDark || isMe
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>
      <span
        className={`text-[10px] flex-shrink-0 ${isDark || isMe ? "text-white/50" : "text-gray-400"}`}
      >
        {formatDuration(duration)}
      </span>
    </div>
  );
};
