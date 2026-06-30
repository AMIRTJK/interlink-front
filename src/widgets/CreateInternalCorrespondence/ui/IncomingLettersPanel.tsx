import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Plus, X, Check } from "lucide-react";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";

interface IProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  attachedLetters: any[];
  onAddLetter: (letter: any) => void;
  onRemoveLetter: (id: string | number) => void;
  onSaveLetters: () => void;
  docId?: string | number;
}

export const IncomingLettersPanel = ({
  isOpen,
  onOpen,
  onClose,
  attachedLetters,
  onAddLetter,
  onRemoveLetter,
  onSaveLetters,
  docId,
}: IProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const { data: incomingLettersData } = useGetQuery({
    url: docId ? ApiRoutes.GET_INTERNAL_INCOMING_PICKER : "",
    useToken: true,
    options: { enabled: !!docId && showSearch && isOpen },
    params: { query: search },
  });

  const availableIncomingLetters =
    incomingLettersData?.data?.data
      ?.map((letter: any) => ({
        id: String(letter.id),
        subject: letter.subject || "Без темы",
        regNumber: letter.reg_number || "Не указано",
        date: letter.sent_at || letter.created_at,
        sender: letter.creator?.full_name || "Не указано",
      }))
      .filter(
        (letter: any) =>
          (letter.subject.toLowerCase().includes(search.toLowerCase()) ||
            letter.sender.toLowerCase().includes(search.toLowerCase()) ||
            letter.regNumber.toLowerCase().includes(search.toLowerCase())) &&
          !attachedLetters.some((l) => l.id === letter.id)
      )
      .slice(0, 15) || [];

  return (
    <>
      <div className="absolute z-20" style={{ left: -36, top: 10 }}>
        <motion.button
          onClick={isOpen ? onClose : onOpen}
          className={cn(
            "bg-white border border-slate-200 border-r-0 rounded-l-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
            isOpen ? "bg-slate-50" : "hover:bg-slate-50"
          )}
          aria-label="Входящие письма"
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-blue-500"
          />
          <span
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontSize: 11,
              fontWeight: 600,
              color: "#475569",
              letterSpacing: "0.08em",
            }}
          >
            Входящие письма
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 h-full w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{ right: "calc(100% + 12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  Входящие письма
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {attachedLetters.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700"
                aria-label="Закрыть панель входящих писем"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center z-40 relative">
              <span className="text-xs text-slate-500 font-medium">
                Прикрепленные письма
              </span>
              <div className="flex items-center gap-1.5">
                <If is={attachedLetters.length > 0}>
                  <button
                    onClick={onSaveLetters}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Check size={12} />
                    <span>Сохранить</span>
                  </button>
                </If>
                <If is={!!docId}>
                  <button
                    onClick={() => setShowSearch((v) => !v)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={12} />
                    <span>Добавить</span>
                  </button>
                </If>
                <AnimatePresence>
                  {showSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-72"
                    >
                      <div className="p-2 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="Поиск писем..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          autoFocus
                          className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        <If is={availableIncomingLetters.length === 0}>
                          <p className="text-xs text-slate-400 text-center py-4">
                            Нет доступных писем
                          </p>
                        </If>
                        <If is={availableIncomingLetters.length > 0}>
                          {availableIncomingLetters.map((letter: any) => (
                            <button
                              key={letter.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                onAddLetter(letter);
                                setShowSearch(false);
                                setSearch("");
                              }}
                              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-blue-100 text-blue-700">
                                <Mail size={12} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {letter.subject}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {letter.sender}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  №{letter.regNumber} • {letter.date}
                                </p>
                              </div>
                            </button>
                          ))}
                        </If>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              <If is={attachedLetters.length === 0}>
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <Mail size={15} />
                  <span>Нет прикрепленных писем</span>
                </div>
              </If>
              <If is={attachedLetters.length > 0}>
                {attachedLetters.map((letter, idx) => (
                  <div
                    key={letter.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/40 p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-blue-100 text-blue-700">
                        <Mail size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {letter.subject}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {letter.sender}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          №{letter.regNumber} • {letter.date}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveLetter(letter.id)}
                        className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </If>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
