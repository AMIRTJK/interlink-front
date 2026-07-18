import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  X,
  Search,
  Calendar,
  Clock,
  Check,
  Loader2,
} from "lucide-react";
import { cn, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

// Боковая панель «Новое поручение» — 1-в-1 по дизайну (TaskPanel). Поле
// «Исполнитель» подключено к реальному API поиска сотрудников
// (GET_INTERNAL_RECIPIENTS_USERS); остальные поля (текст, срок, приоритет,
// примечание) бэкендом пока не поддержаны и живут только на фронте, поэтому
// отправка — имитация (как в макете).

type PriorityLevel = "low" | "medium" | "high";

interface ExecutorUser {
  id: number;
  full_name: string;
  phone: string;
}

// Палитра аватаров исполнителей (как в структуре организации)
const AVATAR_COLORS = [
  "bg-blue-50 text-blue-600 border-blue-100",
  "bg-emerald-50 text-emerald-600 border-emerald-100",
  "bg-purple-50 text-purple-600 border-purple-100",
  "bg-amber-50 text-amber-600 border-amber-100",
  "bg-rose-50 text-rose-600 border-rose-100",
  "bg-indigo-50 text-indigo-600 border-indigo-100",
];

const getInitials = (fullName: string) => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const priorityConfig: Record<
  PriorityLevel,
  { label: string; activeClass: string; inactiveClass: string }
> = {
  low: {
    label: "Низкий",
    activeClass: "bg-emerald-500 text-white border-emerald-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-emerald-300",
  },
  medium: {
    label: "Средний",
    activeClass: "bg-amber-500 text-white border-amber-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-amber-300",
  },
  high: {
    label: "Высокий",
    activeClass: "bg-rose-500 text-white border-rose-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-rose-300",
  },
};
const priorityKeys: PriorityLevel[] = ["low", "medium", "high"];

export const TaskPanel = ({ onClose }: { onClose: () => void }) => {
  const [searchParams, setSearchParams] = useState({ query: "" });
  const [selectedExecutor, setSelectedExecutor] = useState<ExecutorUser | null>(
    null,
  );
  const [showExecutorDropdown, setShowExecutorDropdown] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Реальный API поиска исполнителей
  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS,
    useToken: true,
    params: searchParams,
  });

  // Пробиваемся до массива: usersData -> data (пагинация) -> data (массив)
  const apiUsersList: ExecutorUser[] =
    usersData?.data?.data && Array.isArray(usersData.data.data)
      ? usersData.data.data
      : Array.isArray(usersData)
        ? usersData
        : [];

  const handleSubmit = () => {
    setSubmitting(true);
    // Отправки поручения на бэкенде пока нет — имитируем успех, как в макете.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(onClose, 1500);
    }, 1200);
  };

  const submitDisabled = submitting || !selectedExecutor || !taskText.trim();

  return (
    <motion.div
      initial={{ x: 12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 12, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 z-30 flex flex-col overflow-hidden"
      style={{
        right: "calc(100% + 12px)",
        top: 10,
        maxHeight: "var(--icc-panel-max-h, calc(100vh - 140px))",
      }}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-900">
            Новое поручение
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {submitted ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center"
          >
            <Check size={28} className="text-white" />
          </motion.div>
          <p className="text-base font-bold text-slate-900">Поручение создано</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Исполнитель */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Исполнитель
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Search size={13} className="text-slate-400 flex-shrink-0" />
                {selectedExecutor ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border",
                        AVATAR_COLORS[
                          selectedExecutor.id % AVATAR_COLORS.length
                        ],
                      )}
                    >
                      {getInitials(selectedExecutor.full_name)}
                    </div>
                    <span className="text-sm text-slate-800 flex-1 truncate">
                      {selectedExecutor.full_name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedExecutor(null);
                        setSearchParams({ query: "" });
                      }}
                      className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={searchParams.query}
                    onChange={(e) => {
                      setSearchParams({ query: e.target.value });
                      setShowExecutorDropdown(true);
                    }}
                    onFocus={() => setShowExecutorDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowExecutorDropdown(false), 150)
                    }
                    placeholder="Найти исполнителя..."
                    className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent min-w-0"
                  />
                )}
                {loadingUsers && !selectedExecutor && (
                  <Loader2
                    size={13}
                    className="animate-spin text-indigo-400 flex-shrink-0"
                  />
                )}
              </div>
              <AnimatePresence>
                {showExecutorDropdown && !selectedExecutor && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-y-auto max-h-56"
                  >
                    {loadingUsers && apiUsersList.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs">Загрузка...</span>
                      </div>
                    ) : apiUsersList.length > 0 ? (
                      apiUsersList.map((u) => (
                        <button
                          key={u.id}
                          onMouseDown={() => {
                            setSelectedExecutor(u);
                            setShowExecutorDropdown(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <div
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border",
                              AVATAR_COLORS[u.id % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(u.full_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {u.full_name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate font-mono">
                              {u.phone}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">
                        Ничего не найдено
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Поручение */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Поручение
            </label>
            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Опишите задачу..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
            />
          </div>

          {/* Срок исполнения */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Срок исполнения
            </label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Приоритет */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Приоритет
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              {priorityKeys.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold transition-all border-r last:border-r-0 border-slate-200 cursor-pointer",
                    priority === p
                      ? priorityConfig[p].activeClass
                      : priorityConfig[p].inactiveClass,
                  )}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Примечание */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Примечание
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Дополнительные сведения..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
            />
          </div>
        </div>
      )}

      {!submitted && (
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitDisabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center",
              submitDisabled
                ? "bg-indigo-300 text-white cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 cursor-pointer",
            )}
          >
            {submitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              >
                <Clock size={14} />
              </motion.div>
            ) : (
              <ClipboardList size={14} />
            )}
            <span>{submitting ? "Создание..." : "Назначить"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Отмена
          </button>
        </div>
      )}
    </motion.div>
  );
};
