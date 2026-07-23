import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Mail, Plus } from "lucide-react";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";

interface IProps {
  open: boolean;
  onClose: () => void;
  attachedLetters: any[];
  onAddLetter: (letter: any) => void;
  docId?: string | number;
}

export const IncomingLetterSelectModal = ({
  open,
  onClose,
  attachedLetters,
  onAddLetter,
  docId,
}: IProps) => {
  const [search, setSearch] = useState("");

  const { data: incomingLettersData, isLoading } = useGetQuery({
    url: docId ? ApiRoutes.GET_INTERNAL_INCOMING_PICKER : "",
    useToken: true,
    options: { enabled: !!docId && open },
    params: { query: search },
  });

  const availableIncomingLetters =
    incomingLettersData?.data?.data
      ?.map((letter: any) => ({
        id: String(letter.id),
        subject: letter.subject || "Без темы",
        regNumber: letter.reg_number
          ? letter.reg_number.replace(/^[A-Z]+/i, letter.my_prefix || "IN")
          : "Не указано",
        date: letter.sent_at
          ? new Date(letter.sent_at).toLocaleDateString("ru-RU")
          : letter.created_at
            ? new Date(letter.created_at).toLocaleDateString("ru-RU")
            : "—",
        sender: letter.creator?.full_name || "Не указано",
      }))
      .filter(
        (letter: any) =>
          (letter.subject.toLowerCase().includes(search.toLowerCase()) ||
            letter.sender.toLowerCase().includes(search.toLowerCase()) ||
            letter.regNumber.toLowerCase().includes(search.toLowerCase())) &&
          !attachedLetters.some((l) => String(l.id) === String(letter.id)),
      ) || [];

  return createPortal(
    <AnimatePresence>
      <If is={open}>
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="w-full max-w-3xl h-[600px] rounded-3xl bg-white dark:bg-zinc-900 border border-white/50 dark:border-zinc-700/60 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Реестр входящих писем
                  </h3>
                  <p className="text-xs text-slate-400">
                    Выберите письма для прикрепления к текущему документу
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск по теме, отправителю или номеру письма..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800/80 backdrop-blur-sm">
                    <th className="px-6 py-3 w-36">Рег. номер</th>
                    <th className="px-6 py-3">Тема письма</th>
                    <th className="px-6 py-3 w-48">Отправитель</th>
                    <th className="px-6 py-3 w-28 text-center">Дата</th>
                    <th className="px-6 py-3 w-28 text-center">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  <If is={isLoading}>
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-sm text-slate-400">
                        Загрузка входящих писем...
                      </td>
                    </tr>
                  </If>
                  <If is={!isLoading && availableIncomingLetters.length === 0}>
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-sm text-slate-400">
                        Входящие письма не найдены
                      </td>
                    </tr>
                  </If>
                  <If is={!isLoading && availableIncomingLetters.length > 0}>
                    {availableIncomingLetters.map((letter: any) => (
                      <tr
                        key={letter.id}
                        className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-6 py-3 text-xs font-mono font-semibold text-slate-600 dark:text-zinc-300">
                          {letter.regNumber}
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200 line-clamp-1">
                            {letter.subject}
                          </p>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-600 dark:text-zinc-400 truncate">
                          {letter.sender}
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-400 text-center">
                          {letter.date}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => onAddLetter(letter)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>Добавить</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </If>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 flex-shrink-0 bg-slate-50/40 dark:bg-zinc-800/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer focus:outline-none"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </motion.div>
      </If>
    </AnimatePresence>,
    document.body,
  );
};
