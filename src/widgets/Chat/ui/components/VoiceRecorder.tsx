import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { toast } from "@shared/lib";
import { formatDuration } from "../../lib/chatHelpers";

interface VoiceRecorderProps {
  /** Готовая запись: длительность в секундах и сам аудиофайл. */
  onSend: (duration: number, audio: Blob) => void;
  onCancel: () => void;
  isDark: boolean;
}

// Запись голосового сообщения через MediaRecorder. Файл уходит в ту же ручку
// отправки сообщений с kind=voice, поэтому наружу отдаём именно Blob.

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSend,
  onCancel,
  isDark,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [waveHeights] = useState(() =>
    Array.from({ length: 24 }, () => Math.random() * 0.7 + 0.3),
  );

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let stream: MediaStream | null = null;
    let isCancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((mediaStream) => {
        if (isCancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        const recorder = new MediaRecorder(mediaStream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.start();
        recorderRef.current = recorder;

        // Отсчёт начинается вместе с записью, а не с открытия панели: запрос
        // доступа к микрофону и его прогрев занимают время, и эти секунды в
        // файл не попадают. Считаем по часам, а не по тикам таймера — таймер
        // отстаёт под нагрузкой и во вкладке в фоне.
        startedAtRef.current = Date.now();
        interval = setInterval(
          () => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)),
          250,
        );
      })
      .catch(() => {
        toast.error("Нет доступа к микрофону");
        onCancel();
      });

    return () => {
      isCancelled = true;
      if (interval) clearInterval(interval);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      recorderRef.current = null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onCancel]);

  const handleSend = () => {
    const recorder = recorderRef.current;
    if (!recorder) {
      onCancel();
      return;
    }

    // Длительность фиксируем на момент остановки: дробные секунды округляет
    // отправка, поэтому запись на 4,6 с не превращается в четыре.
    const recordedSeconds = startedAtRef.current
      ? (Date.now() - startedAtRef.current) / 1000
      : 0;

    // Последний кусок данных приходит только после stop — отправляем из onstop.
    recorder.onstop = () => {
      const audio = new Blob(chunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });
      chunksRef.current = [];
      if (audio.size > 0) onSend(recordedSeconds, audio);
      else onCancel();
    };
    recorder.stop();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-center gap-3 rounded-full px-4 py-2 flex-1 border border-[rgb(var(--th-danger-rgb)/0.4)] bg-[rgb(var(--th-danger-rgb)/0.1)]"
    >
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
        className="w-3 h-3 rounded-full bg-[rgb(var(--th-danger-rgb))] flex-shrink-0"
      />
      <div className="flex items-center gap-0.5 flex-1">
        {waveHeights.map((h, i) => (
          <motion.div
            key={`wave-${i}`}
            animate={{
              scaleY: [h, h * 0.4, h],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.04,
            }}
            className="w-1 bg-[rgb(var(--th-danger-rgb)/0.7)] rounded-full flex-shrink-0"
            style={{
              height: "20px",
              transformOrigin: "center",
            }}
          />
        ))}
      </div>
      <span
        className="text-xs font-semibold flex-shrink-0 text-[rgb(var(--th-danger-rgb))]"
      >
        {formatDuration(seconds)}
      </span>
      <button
        onClick={onCancel}
        aria-label="Отменить запись"
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 bg-[var(--th-chip-bg)] hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleSend}
        aria-label="Отправить голосовое сообщение"
        className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--th-on-accent)] transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-3-rgb)))",
        }}
      >
        <Send className="w-3 h-3" />
      </button>
    </motion.div>
  );
};
