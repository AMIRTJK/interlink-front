import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Square } from "lucide-react";
import { toast } from "@shared/lib";
import { chatUrls, fetchPrivateMedia } from "../../api";
import { formatDuration } from "../../lib/chatHelpers";

interface VoiceBubbleProps {
  /** Длительность записи в секундах — запасной источник для шкалы. */
  duration: number;
  /** id вложения на бэкенде: сам файл приватный и берётся с токеном. */
  attachmentId?: number;
  /** MIME записи — ручка скачивания отдаёт octet-stream, плееру этого мало. */
  mimeType?: string;
  isMe: boolean;
  isDark: boolean;
}

const BAR_COUNT = 20;

/**
 * Форма волны — оформление, а не реальный анализ звука. Считаем её от id
 * вложения, чтобы у каждого сообщения был свой рисунок, но он не прыгал на
 * каждом ререндере (раньше высоты брались из `Math.random()` прямо в теле).
 */
const buildBars = (seed: number) =>
  Array.from({ length: BAR_COUNT }, (_, i) => {
    const noise = Math.abs(Math.sin((seed + 1) * 12.9898 + i * 78.233)) % 1;
    return 0.3 + Math.sin(i * 0.8) * 0.4 + noise * 0.3;
  });

export const VoiceBubble: React.FC<VoiceBubbleProps> = ({
  duration,
  attachmentId,
  mimeType,
  isMe,
  isDark,
}) => {
  const [playing, setPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // Длительность из самого файла: у записи с телефона она может отличаться от
  // присланной бэкендом, а webm от MediaRecorder её вовсе не содержит.
  const [mediaDuration, setMediaDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const bars = useMemo(() => buildBars(attachmentId ?? 0), [attachmentId]);

  const totalSeconds =
    mediaDuration > 0 ? mediaDuration : duration > 0 ? duration : 1;

  useEffect(
    () => () => {
      // object-URL живёт в общем кэше вложений — здесь только глушим звук.
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  const attachAudio = useCallback((element: HTMLAudioElement) => {
    // Пока идёт замер длительности, позиция скачет к концу файла — прогресс в
    // это время не трогаем, иначе шкала дёргается на полную и обратно.
    let isProbing = false;

    const applyDuration = () => {
      if (!Number.isFinite(element.duration) || element.duration <= 0) return false;
      setMediaDuration(element.duration);
      if (isProbing) {
        isProbing = false;
        element.currentTime = 0;
      }
      return true;
    };

    element.addEventListener("loadedmetadata", () => {
      if (applyDuration()) return;
      // webm из MediaRecorder не содержит длительности в заголовке: браузер
      // отдаёт Infinity, пока не дочитает поток до конца. Перемотка в заведомо
      // недостижимую точку заставляет его досчитать реальное значение.
      isProbing = true;
      element.currentTime = 1e101;
    });
    element.addEventListener("durationchange", applyDuration);

    element.addEventListener("timeupdate", () => {
      if (isProbing) return;
      const total =
        Number.isFinite(element.duration) && element.duration > 0
          ? element.duration
          : 0;
      setProgress(total > 0 ? (element.currentTime / total) * 100 : 0);
    });
    element.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(0);
      element.currentTime = 0;
    });
    element.addEventListener("error", () => {
      setPlaying(false);
      toast.error("Не удалось воспроизвести голосовое сообщение");
    });
  }, []);

  const handleToggle = useCallback(async () => {
    const existing = audioRef.current;

    if (existing) {
      if (existing.paused) {
        setPlaying(true);
        await existing.play().catch(() => setPlaying(false));
      } else {
        existing.pause();
        setPlaying(false);
      }
      return;
    }

    if (!attachmentId) {
      toast.error("Файл голосового сообщения недоступен");
      return;
    }

    // Файл тянем по первому нажатию: грузить все голосовые ленты сразу незачем.
    setIsLoading(true);
    const objectUrl = await fetchPrivateMedia(
      chatUrls.attachment(attachmentId, true),
      mimeType,
    );
    setIsLoading(false);

    if (!objectUrl) {
      toast.error("Не удалось загрузить голосовое сообщение");
      return;
    }

    const element = new Audio(objectUrl);
    attachAudio(element);
    audioRef.current = element;

    setPlaying(true);
    await element.play().catch(() => setPlaying(false));
  }, [attachmentId, mimeType, attachAudio]);

  const handleSeek = useCallback(
    (index: number) => {
      const element = audioRef.current;
      if (!element) return;
      const ratio = (index + 0.5) / BAR_COUNT;
      const total =
        Number.isFinite(element.duration) && element.duration > 0
          ? element.duration
          : 0;
      if (!total) return;
      element.currentTime = total * ratio;
      setProgress(ratio * 100);
    },
    [],
  );

  const playedBars = Math.floor((bars.length * progress) / 100);
  const playedSeconds = Math.min(
    Math.round((totalSeconds * progress) / 100),
    Math.round(totalSeconds),
  );

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
        boxShadow: isMe ? "0 0 16px rgba(124, 58, 237, 0.5)" : "none",
      }}
    >
      <button
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={
          playing
            ? "Остановить голосовое сообщение"
            : "Прослушать голосовое сообщение"
        }
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-in-out hover:scale-110 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer ${isDark || isMe ? "text-white" : "text-gray-500 hover:text-gray-800"}`}
        style={{
          background: isMe
            ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
            : isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.05)",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : playing ? (
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
            onClick={() => handleSeek(i)}
            className="w-1 rounded-full flex-shrink-0 transition-all cursor-pointer"
            style={{
              height: `${h * 20}px`,
              background:
                i < playedBars
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
        {formatDuration(playing || progress > 0 ? playedSeconds : Math.round(totalSeconds))}
      </span>
    </div>
  );
};
