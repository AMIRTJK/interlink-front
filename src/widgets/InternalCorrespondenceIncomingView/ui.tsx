import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Calendar,
  MessageSquare,
  Clock,
  Shield,
  Check,
  ChevronDown,
  FileType,
  User,
  ChevronRight,
  Users,
  X,
  Search,
  Loader2,
  FileText,
} from "lucide-react";
import { cn } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib"; // Ваш кастомный хук запросов

const inboxStatusStyle: Record<string, string> = {
  "на резолюции": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "на исполнении": "bg-amber-50 text-amber-700 border-amber-100",
  "на согласовании": "bg-blue-50 text-blue-700 border-blue-100",
  "на подпись": "bg-purple-50 text-purple-700 border-purple-100",
  завершено: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-100",
};

const TASK_TEMPLATES = [
  "Ознакомиться и утвердить документ",
  "Согласовать содержание",
  "Проверить и подписать",
  "Рассмотреть предложения",
];
const VISA_STATUSES = ["на рассмотрении", "согласовано", "требует доработки"];

// Цветовая палитра для генерации уникальных фонов аватаров пользователей
const AVATAR_COLORS = [
  "bg-blue-50 text-blue-600 border-blue-100",
  "bg-emerald-50 text-emerald-600 border-emerald-100",
  "bg-purple-50 text-purple-600 border-purple-100",
  "bg-amber-50 text-amber-600 border-amber-100",
  "bg-rose-50 text-rose-600 border-rose-100",
  "bg-indigo-50 text-indigo-600 border-indigo-100",
];

interface Recipient {
  id: number;
  type: "to" | "cc";
  user?: {
    id: number;
    full_name: string;
  };
}

interface RegistryItem {
  id: string | number;
  reg_prefix?: string;
  reg_number?: string;
  sender_name?: string | null;
  sent_at?: string;
  subject?: string;
  body?: string;
  status: string;
  recipients?: Recipient[];
  creator?: {
    full_name: string;
  };
}

interface UserFromApi {
  id: number;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  phone: string;
  full_name: string;
  departments: any[];
}

const CollapsibleBlock = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <ChevronDown
          size={14}
          className={cn(
            "text-slate-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && <div className="divide-y divide-slate-50">{children}</div>}
    </div>
  );
};

export const InternalCorrespondenceIncomingView = ({
  item,
  onBack,
}: {
  item: RegistryItem;
  onBack: () => void;
}) => {
  const [taskTemplate, setTaskTemplate] = useState(
    "Ознакомиться и утвердить документ",
  );
  const [customTask, setCustomTask] = useState("");
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [dueDate, setDueDate] = useState("15.02.2026");
  const [visaStatus, setVisaStatus] = useState("на рассмотрении");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [ecpApplied, setEcpApplied] = useState(false);
  const [ecpLoading, setEcpLoading] = useState(false);

  // Состояния для Исполнителя и Модальных окон
  const [executorName, setExecutorName] = useState("");
  const [selectedExecutorId, setSelectedExecutorId] = useState<number | null>(
    null,
  );
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  // API Клиент для поиска исполнителей структуры
  const [searchParams, setSearchParams] = useState({ query: "" });
  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS,
    useToken: true,
    params: searchParams,
  });

// Пробиваемся до массива пользователей: usersData -> data (пагинация) -> data (массив)
  const apiUsersList: UserFromApi[] = usersData?.data?.data && Array.isArray(usersData.data.data)
    ? usersData.data.data
    : (Array.isArray(usersData) ? usersData : []);
        

  // Вспомогательная функция для генерации инициалов
  const getInitials = (fullName: string) => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const ccRecipientsList = item.recipients
    ? item.recipients
        .filter((r) => r.type === "cc" && r.user?.full_name)
        .map((r) => r.user?.full_name)
        .join(", ")
    : "";

  const formattedSentDate = item.sent_at
    ? new Date(item.sent_at).toLocaleDateString("ru-RU")
    : "—";

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] overflow-hidden w-full">
      {/* Шапка страницы */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-base font-bold text-slate-900 leading-tight">
              Просмотр входящего письма
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer">
            <Download size={14} />
            <span>Скачать PDF</span>
          </button>
        </div>
      </div>

      {/* Основная рабочая область */}
      <div className="flex flex-1 min-h-0 overflow-hidden w-full">
        {/* Боковая панель (Левый сайдбар) */}
        <aside className="w-80 flex-shrink-0 border-r border-slate-200 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {/* Блок: Детали письма */}
          <CollapsibleBlock title="Детали письма">
            <div className="px-5 py-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                От кого
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-blue-200">
                  {item.creator?.full_name
                    ? getInitials(item.creator.full_name)
                    : "МФ"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                    {item.creator?.full_name || "Министерство Финансов"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Отправитель
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Копия
              </p>
              <p
                className={cn(
                  "text-sm font-medium",
                  ccRecipientsList ? "text-slate-800" : "text-slate-400 italic",
                )}
              >
                {ccRecipientsList || "Не указано"}
              </p>
            </div>

            <div className="px-5 py-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Тема
              </p>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {item.subject || "Без темы"}
              </p>
            </div>

            <div className="px-5 py-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Дата
              </p>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar size={14} className="text-blue-500 shrink-0" />
                <span className="text-sm font-bold">{formattedSentDate}</span>
              </div>
            </div>

            <div className="px-5 py-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Номер письма
              </p>
              <div className="flex items-center text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-sans font-medium mb-0.5">
                    Входящий
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {item.reg_prefix
                      ? `${item.reg_prefix}-${item.reg_number}`
                      : item.reg_number || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Тип документа
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 min-h-[26px]">
                <FileType size={12} />
                <span>Внутренний</span>
              </span>
            </div>

            <div className="px-5 py-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Статус документа
              </p>
              <span
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize",
                  inboxStatusStyle[item.status] ||
                    "bg-slate-100 text-slate-700",
                )}
              >
                {item.status}
              </span>
            </div>
          </CollapsibleBlock>

          {/* Блок: Виза резолюции */}
          <CollapsibleBlock title="Виза">
            {/* Выбор исполнителя */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Исполнитель
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowOrgModal(true);
                  setShowTaskEditor(false);
                }}
                className="w-full h-12 flex items-center justify-between gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all text-sm font-semibold text-slate-700 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <User
                    size={16}
                    className={cn(
                      executorName ? "text-blue-500" : "text-slate-400",
                      "shrink-0",
                    )}
                  />
                  <span
                    className={cn(
                      "truncate font-medium text-slate-500",
                      executorName && "text-slate-800 font-bold",
                    )}
                  >
                    {executorName || "Выбрать исполнителя"}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Поручение */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Поручение
              </p>
              {!showTaskEditor ? (
                <button
                  type="button"
                  onClick={() => setShowTaskEditor(true)}
                  className="w-full flex items-start gap-3 px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-100/40 transition-colors text-left cursor-pointer"
                >
                  <MessageSquare
                    size={16}
                    className="text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs font-semibold text-blue-700 leading-normal">
                    {customTask || taskTemplate}
                  </p>
                </button>
              ) : (
                <div className="space-y-2 bg-slate-50/50 p-2.5 border border-slate-200 rounded-xl">
                  <div className="flex flex-col gap-1">
                    {TASK_TEMPLATES.map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => {
                          setTaskTemplate(template);
                          setCustomTask("");
                          setShowTaskEditor(false);
                        }}
                        className="text-[11px] px-3 py-2 text-left bg-white border border-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-700 transition-colors font-semibold shadow-sm"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1">
                    <textarea
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      placeholder="Введите текст поручения..."
                      className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 resize-none outline-none focus:border-blue-400 shadow-sm"
                      rows={2}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTaskEditor(false)}
                    className="w-full h-8 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Готово
                  </button>
                </div>
              )}
            </div>

            {/* Срок выполнения */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Срок
              </p>
              <div className="h-12 flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none font-mono tracking-wide"
                />
              </div>
            </div>

            {/* Статус резолюции */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Статус
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full h-12 flex items-center justify-between px-4 py-2 rounded-xl text-sm font-semibold border bg-blue-50/40 border-blue-200 text-blue-700 cursor-pointer shadow-sm"
                >
                  <span>{visaStatus}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform text-blue-500",
                      showStatusDropdown && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence>
                  {showStatusDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 text-xs font-semibold"
                    >
                      {VISA_STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setVisaStatus(s);
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 hover:bg-slate-50 transition-colors text-left text-slate-700 border-b border-slate-50 last:border-b-0"
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Блок Действий с ЭЦП и вызовом приложения №1 */}
            <div className="px-5 py-5 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Электронная подпись
              </p>
              {!ecpApplied ? (
                <button
                  type="button"
                  onClick={() => {
                    setEcpLoading(true);
                    setTimeout(() => {
                      setEcpLoading(false);
                      setEcpApplied(true);
                    }, 1200);
                  }}
                  disabled={ecpLoading}
                  className={cn(
                    "w-full h-12 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer",
                    ecpLoading
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                      : "bg-blue-50/60 border-blue-200 text-blue-600 hover:bg-blue-100/60",
                  )}
                >
                  {ecpLoading ? (
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                  ) : (
                    <Shield size={16} className="text-blue-500" />
                  )}
                  <span>{ecpLoading ? "Утверждение..." : "Применить ЭЦП"}</span>
                </button>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 px-4 h-11 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <Check
                      size={16}
                      className="text-emerald-600 flex-shrink-0"
                    />
                    <span className="text-xs font-bold text-emerald-700">
                      Виза успешно утверждена
                    </span>
                  </div>

                  {/* Запрошенная вами фиолетовая кнопка приложения */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowAttachmentModal(true)}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-file-type"
                      aria-hidden="true"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      <path d="M9 13v-1h6v1"></path>
                      <path d="M12 12v6"></path>
                      <path d="M11 18h2"></path>
                    </svg>
                    <span>Показать Приложение №1</span>
                  </motion.button>
                </div>
              )}
            </div>
          </CollapsibleBlock>
        </aside>

        {/* Интерактивный холст основного бланка документа */}
        <div className="flex-1 overflow-auto bg-[#E8EAED] flex items-start justify-center py-6 px-6">
          <div
            className="bg-white shadow-xl border border-slate-300/30 w-full max-w-[794px] min-h-[1050px]"
            style={{
              padding: "64px 72px 80px",
              fontFamily: "Times New Roman, serif",
              fontSize: 14,
              lineHeight: 2,
              color: "#1e293b",
            }}
          >
            {item.body ? (
              <div
                className="document-body-content overflow-visible focus:outline-none"
                dangerouslySetInnerHTML={{ __html: item.body }}
              />
            ) : (
              <p className="text-slate-400 italic text-center py-10">
                Контент документа отсутствует...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── МОДАЛЬНОЕ ОКНО №1: СТРУКТУРА ОРГАНИЗАЦИИ (ИНТЕГРИРОВАННАЯ С API) ── */}
      <AnimatePresence>
        {showOrgModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setShowOrgModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 w-full max-w-2xl h-[70vh] relative z-10"
            >
              {/* Шапка модалки со встроенным живым поиском */}
              <div className="flex-shrink-0 border-b border-slate-100 p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Users size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Выбор исполнителя
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Выберите сотрудника из списка структуры
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOrgModal(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Инпут поиска, завязанный на стейт searchParams */}
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 h-10 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50">
                  <Search size={14} className="text-slate-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={searchParams.query}
                    onChange={(e) => setSearchParams({ query: e.target.value })}
                    placeholder="Поиск сотрудников по имени, фамилии или телефону..."
                    className="w-full bg-transparent text-xs text-slate-700 font-medium outline-none placeholder:text-slate-400"
                    autoFocus
                  />
                  {loadingUsers && (
                    <Loader2
                      size={14}
                      className="animate-spin text-blue-500 shrink-0 ml-2"
                    />
                  )}
                </div>
              </div>

              {/* Тело списка результатов API */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 divide-y divide-slate-100">
                {loadingUsers && apiUsersList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                    <span className="text-xs font-semibold">
                      Загрузка структуры сотрудников...
                    </span>
                  </div>
                ) : apiUsersList.length > 0 ? (
                  apiUsersList.map((user, idx) => {
                    const avatarColor =
                      AVATAR_COLORS[user.id % AVATAR_COLORS.length];
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setExecutorName(user.full_name);
                          setSelectedExecutorId(user.id);
                          setShowOrgModal(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 transition-colors text-left rounded-xl my-0.5 border border-transparent hover:bg-blue-50/50 hover:border-blue-100/40 group",
                          selectedExecutorId === user.id &&
                            "bg-blue-50 border-blue-100",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border shadow-sm",
                              avatarColor,
                            )}
                          >
                            {getInitials(user.full_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                              {user.full_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 font-mono">
                              {user.phone}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all shrink-0 ml-2"
                        />
                      </button>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                    <p className="text-xs italic">
                      Сотрудники по запросу не найдены
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── МОДАЛЬНОЕ ОКНО №2: ПРИЛОЖЕНИЕ №1 (ВИЗА ИСПОЛНИТЕЛЯ / ДЕТАЛИ ЭЦП) ── */}
      <AnimatePresence>
        {showAttachmentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setShowAttachmentModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 w-full max-w-xl relative z-10"
            >
              {/* Шапка окна */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Приложение №1
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Информация о согласовании и визе исполнителя
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAttachmentModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Содержимое визы */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
                {/* Карточка Исполнителя и поручения */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">
                      Резолюция
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold font-mono">
                      <Clock size={12} className="text-slate-400" />
                      <span>Срок: {dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1 border-t border-slate-50">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                      {getInitials(executorName)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {executorName || "Не выбран"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Внутренний исполнитель
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Текст поручения
                    </p>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      {customTask || taskTemplate}
                    </p>
                  </div>
                </div>

                {/* Блок данных цифрового сертификата подписи (ЭЦП) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Shield size={15} className="text-emerald-600" />
                    <span className="text-xs font-bold">
                      Данные электронной цифровой подписи
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 pt-2 text-xs border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Статус подписи
                      </p>
                      <div className="flex items-center gap-1 text-emerald-600 font-bold mt-0.5">
                        <Check size={12} strokeWidth={3} />
                        <span>Подпись проверена и действительна</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Владелец сертификата
                      </p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {executorName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Серийный номер / Алгоритм
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                        0x7F4B3C9A12E5D8F0 / ГОСТ Р 34.10-2012
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Срок действия ключа
                      </p>
                      <p className="font-medium text-slate-600 mt-0.5">
                        с 10.02.2026 по 10.02.2027
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Футер модалки */}
              <div className="flex-shrink-0 bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowAttachmentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Ознакомлен
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
