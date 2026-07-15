import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search } from "lucide-react";
import { If } from "@shared/ui";
import type { RecipientOption } from "../types";

interface IProps {
  open: boolean;
  onClose: () => void;
  availableUsers: RecipientOption[];
  initialTo: RecipientOption[];
  initialCc: RecipientOption[];
  onSave: (selectedTo: RecipientOption[], selectedCc: RecipientOption[]) => void;
}

export const RecipientSelectModal = ({
  open,
  onClose,
  availableUsers,
  initialTo,
  initialCc,
  onSave,
}: IProps) => {
  const [selectedToIds, setSelectedToIds] = useState<string[]>([]);
  const [selectedCcIds, setSelectedCcIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedToIds(initialTo.map((u) => u.id));
      setSelectedCcIds(initialCc.map((u) => u.id));
      setSearch("");
    }
  }, [open, initialTo, initialCc]);

  const toggleTo = (id: string) => {
    setSelectedToIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSelectedCcIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleCc = (id: string) => {
    setSelectedCcIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSelectedToIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSave = () => {
    const nextTo = availableUsers.filter((u) => selectedToIds.includes(u.id));
    const nextCc = availableUsers.filter((u) => selectedCcIds.includes(u.id));
    onSave(nextTo, nextCc);
  };

  const filteredUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.org.toLowerCase().includes(search.toLowerCase())
  );

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
            className="w-full max-w-2xl h-[560px] rounded-3xl bg-white dark:bg-zinc-900 border border-white/50 dark:border-zinc-700/60 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Выбор получателей
              </h3>
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
                  placeholder="Поиск сотрудника или организации..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-400 dark:text-zinc-500 bg-slate-50/55 dark:bg-zinc-800/10">
                    <th className="px-6 py-3">Сотрудник</th>
                    <th className="px-6 py-3 w-24 text-center">Кому</th>
                    <th className="px-6 py-3 w-24 text-center">Копия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/30 dark:hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-6 py-3 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.color}`}>
                          {u.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-200 truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {u.org}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedToIds.includes(u.id)}
                          onChange={() => toggleTo(u.id)}
                          className="w-4.5 h-4.5 rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCcIds.includes(u.id)}
                          onChange={() => toggleCc(u.id)}
                          className="w-4.5 h-4.5 rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 flex-shrink-0 bg-slate-50/40 dark:bg-zinc-800/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer focus:outline-none"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-500/25 focus:outline-none"
              >
                Применить
              </button>
            </div>
          </motion.div>
        </motion.div>
      </If>
    </AnimatePresence>,
    document.body
  );
};
