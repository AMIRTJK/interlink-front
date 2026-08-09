import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { PendingFile } from "../../model";
import { getAttachmentIcon } from "../../lib/chatHelpers";

interface PendingFilesBarProps {
  files: PendingFile[];
  onRemove: (id: string) => void;
  onSend: () => void;
  isDark: boolean;
  countLabel: string;
  sendAllLabel: string;
}

export const PendingFilesBar: React.FC<PendingFilesBarProps> = ({
  files,
  onRemove,
  onSend,
  isDark,
  countLabel,
  sendAllLabel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className={`px-6 py-3 border-t backdrop-blur-md ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <span
        className={`text-xs font-semibold ${isDark ? "text-white/70" : "text-gray-655"}`}
      >
        <span>{countLabel}</span>
      </span>
      <button
        onClick={onSend}
        className="ml-auto text-xs font-semibold text-white px-3 py-1 rounded-full transition-all duration-200 ease-in-out hover:scale-105 hover:brightness-110"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)",
        }}
      >
        {sendAllLabel}
      </button>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {files.map((f) => (
        <div key={f.id} className="relative flex-shrink-0 group cursor-pointer">
          {f.type === "image" && f.preview ? (
            <div
              className={`w-20 h-20 rounded-xl overflow-hidden border ${isDark ? "border-white/20" : "border-black/10"}`}
            >
              <img
                src={f.preview}
                alt={f.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`w-20 h-20 rounded-xl border flex flex-col items-center justify-center gap-1 px-1 ${isDark ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5"}`}
            >
              <div className="text-violet-300">{getAttachmentIcon(f.type)}</div>
              <p
                className={`text-[9px] text-center leading-tight break-all line-clamp-2 ${isDark ? "text-white/50" : "text-gray-500"}`}
              >
                {f.name}
              </p>
              <p
                className={`text-[9px] ${isDark ? "text-white/35" : "text-gray-400"}`}
              >
                {f.size}
              </p>
            </div>
          )}
          {/* Кнопка живёт внутри плитки: полоса вложений прокручивается по
              горизонтали, а такой контейнер обрезает и по вертикали — вынос за
              край срезал бы кнопку сверху. */}
          <button
            onClick={() => onRemove(f.id)}
            aria-label={`Убрать ${f.name}`}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 shadow-md ring-1 ring-black/20 hover:scale-110"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  </motion.div>
);
