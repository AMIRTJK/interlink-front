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
  const secondsRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);

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
      })
      .catch(() => {
        toast.error("Нет доступа к микрофону");
        onCancel();
      });

    return () => {
      isCancelled = true;
      clearInterval(interval);
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

    // Последний кусок данных приходит только после stop — отправляем из onstop.
    recorder.onstop = () => {
      const audio = new Blob(chunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });
      chunksRef.current = [];
      if (audio.size > 0) onSend(secondsRef.current, audio);
      else onCancel();
    };
    recorder.stop();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`flex items-center gap-3 rounded-full px-4 py-2 flex-1 border ${isDark ? "border-red-400/40 bg-red-500/10" : "border-red-400/30 bg-red-500/5"}`}
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
        className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0"
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
            className="w-1 bg-red-400/70 rounded-full flex-shrink-0"
            style={{
              height: "20px",
              transformOrigin: "center",
            }}
          />
        ))}
      </div>
      <span
        className={`text-xs font-semibold flex-shrink-0 ${isDark ? "text-red-300" : "text-red-600"}`}
      >
        {formatDuration(seconds)}
      </span>
      <button
        onClick={onCancel}
        aria-label="Отменить запись"
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 ${isDark ? "bg-white/15 hover:bg-white/25 text-white/70" : "bg-black/5 hover:bg-black/8 text-gray-655"}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleSend}
        aria-label="Отправить голосовое сообщение"
        className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
        }}
      >
        <Send className="w-3 h-3" />
      </button>
    </motion.div>
  );
};
