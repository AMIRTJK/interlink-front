import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  ChevronDown,
  FileType,
  ChevronRight,
  Loader2,
  CornerUpLeft,
  Forward,
  ClipboardList,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn, useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { DocumentCanvas } from "./DocumentCanvas";
import { downloadDocumentPdf, PAGE_WIDTH } from "./lib";
import { ApproversPanel } from "./ApproversPanel";
import { SignersPanel } from "./SignersPanel";
import { VersionsPanel } from "./VersionsPanel";
import { IncomingPreviewModal } from "./IncomingPreviewModal";
import { TaskPanel } from "./TaskPanel";
import { EditorToolbar, type ToolbarSection } from "./EditorToolbar";
import { AttachmentsPanel } from "./AttachmentsPanel";
import { FilePreviewModal } from "@features/Profile";
import {
  mapServerAttachment,
  createApiFileFromAttachedFile,
  downloadAttachment,
  CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE,
  RelatedDocsBlock,
  type AttachedFile,
} from "@widgets/CreateInternalCorrespondence";


const inboxStatusStyle: Record<string, string> = {
  // Russian keys
  "на резолюции": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "на исполнении": "bg-amber-50 text-amber-700 border-amber-100",
  "на согласовании": "bg-blue-50 text-blue-700 border-blue-100",
  "на подпись": "bg-purple-50 text-purple-700 border-purple-100",
  завершено: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-100",

  // English keys mapping to styles
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  to_register: "bg-emerald-50 text-emerald-700 border-emerald-100",
  to_visa: "bg-emerald-50 text-emerald-700 border-emerald-100",
  to_execute: "bg-amber-50 text-amber-700 border-amber-100",
  to_approve: "bg-blue-50 text-blue-700 border-blue-100",
  to_sign: "bg-purple-50 text-purple-700 border-purple-100",
  done: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  approved: "bg-blue-50 text-blue-700 border-blue-100",
  signed: "bg-purple-50 text-purple-700 border-purple-100",
};

const statusTranslations: Record<string, string> = {
  draft: "Черновик",
  to_register: "Регистрация",
  to_visa: "На резолюции",
  to_execute: "На исполнении",
  to_approve: "На согласовании",
  to_sign: "На подпись",
  done: "Завершено",
  cancelled: "Отклонено",
  sent: "Отправлено",
  approved: "Согласовано",
  signed: "Подписано",
};


const priorityConfig: Record<string, { label: string; className: string }> = {
  high: {
    label: "Высокая",
    className: "bg-rose-50! text-rose-700! border-rose-100!",
  },
  middle: {
    label: "Средняя",
    className: "bg-amber-50! text-amber-700! border-amber-100!",
  },
  medium: {
    label: "Средняя",
    className: "bg-amber-50! text-amber-700! border-amber-100!",
  },
  normal: {
    label: "Средняя",
    className: "bg-amber-50! text-amber-700! border-amber-100!",
  },
  low: {
    label: "Низкая важность",
    className: "bg-slate-50! text-slate-600! border-slate-200!",
  },
};

const ACTION_MENU_ITEMS: {
  id: "seen" | "reply" | "forward" | "task";
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "seen", label: "Ознакомлен", icon: Eye },
  { id: "reply", label: "Ответить", icon: CornerUpLeft },
  { id: "forward", label: "Перенаправить", icon: Forward },
  { id: "task", label: "Поручение", icon: ClipboardList },
];

interface Recipient {
  id: number;
  type: "to" | "cc";
  user?: {
    id: number;
    full_name: string;
  };
}

// Пользователь, совершивший действие над письмом (ознакомился / ответил /
// переслал). Для ознакомления дата приходит в acknowledged_at, для ответа и
// пересылки — в action_at.
interface ActionUser {
  id?: string | number;
  user_id?: string | number;
  correspondence_id?: string | number;
  link_type?: "reply" | "forward";
  status?: string;
  action_at?: string;
  acknowledged_at?: string;
  user?: {
    id?: string | number;
    full_name?: string;
    position?: string;
  };
}

interface RegistryItem {
  id: string | number;
  reg_prefix?: string;
  my_prefix?: string;
  reg_number?: string;
  sender_name?: string | null;
  sent_at?: string;
  subject?: string;
  body?: string;
  status: string;
  is_unread?: boolean;
  recipients?: Recipient[];
  creator?: {
    id?: string | number;
    full_name: string;
    position?: string;
    department?: string;
  };
  priority?: string;
  acknowledged_users?: ActionUser[];
  replied_users?: ActionUser[];
  forwarded_users?: ActionUser[];
  reply_count?: number;
  forward_count?: number;
  attachments?: any[];
}


const initialsOf = (fullName?: string) => {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  ).toUpperCase();
};

// Свёрнутая группа аватаров с поповером-списком: используется в шапке письма
// для ознакомившихся, ответивших и переславших. Скрывается, если действий нет.
const UserActionCluster = ({
  label,
  users,
  accent,
}: {
  label: string;
  users: ActionUser[];
  accent: { avatar: string; date: string };
}) => {
  if (!users || users.length === 0) return null;
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((au) => {
            const u = au.user || {};
            return (
              <span
                key={au.id || u.id}
                title={u.full_name || "Без имени"}
                className={cn(
                  "w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white",
                  accent.avatar,
                )}
              >
                {initialsOf(u.full_name)}
              </span>
            );
          })}
        </div>
        <span>
          {label}: {users.length}
        </span>
      </button>
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[1000] max-h-80 overflow-y-auto">
        <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label} ({users.length})
        </div>
        {users.map((au) => {
          const u = au.user || {};
          const when = au.action_at || au.acknowledged_at;
          return (
            <div
              key={au.id || u.id}
              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50"
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0",
                  accent.avatar,
                )}
              >
                {initialsOf(u.full_name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {u.full_name || "Без имени"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {u.position || "Сотрудник"}
                </p>
              </div>
              <If is={Boolean(when)}>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    accent.date,
                  )}
                >
                  {when ? new Date(when).toLocaleDateString("ru-RU") : ""}
                </span>
              </If>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Ячейка деталей письма (label сверху, значение снизу)
const DetailField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {label}
    </span>
    {children}
  </div>
);

export const InternalCorrespondenceIncomingView = ({
  item,
  onBack,
}: {
  item: RegistryItem;
  onBack: () => void;
}) => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  // Верхняя панель / новые блоки интерфейса
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [signersOpen, setSignersOpen] = useState(false);
  const [approversOpen, setApproversOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState<number | string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<AttachedFile | null>(null);

  const mappedAttachments: AttachedFile[] = (item.attachments || []).map((att: any) =>
    mapServerAttachment(att, item.id)
  );


  // Режим «Панель разделов сверху»: цилиндры-вкладки выносятся в горизонтальную
  // панель под тулбаром, а боковые вкладки у холста скрываются (сами панели
  // по-прежнему открываются у холста). Перенесён 1-в-1 из редактора исходящего.
  const [panelsInToolbar, setPanelsInToolbar] = useState(true);

  // Прокручиваемый контейнер холста, обёртка A4-холста и группа боковых панелей.
  // Панели спозиционированы абсолютно внутри группы (высотой 0 у верха холста);
  // при прокрутке страницы группу смещаем через transform, чтобы вкладки и
  // раскрытая панель оставались привязаны к холсту и были видны на любой
  // странице документа. Тот же приём, что в редакторе исходящего письма.
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelsGroupRef = useRef<HTMLDivElement>(null);

  const { data: workflowResponse } = useGetQuery({
    url: item?.id
      ? ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: { enabled: !!item?.id, refetchOnWindowFocus: false },
  });

  const { data: rawStructureData } = useGetQuery<
    Record<string, unknown>,
    { data: any }
  >({
    url: item?.id
      ? ApiRoutes.GET_INTERNAL_STRUCTURE.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: { enabled: !!item?.id, refetchOnWindowFocus: false },
  });

  const relatedDocs = rawStructureData?.data?.related_documents || [];

  const signatures = workflowResponse?.data?.signatures || [];
  const approvals = workflowResponse?.data?.approvals || [];

  // Закрытие выпадающего меню «Действие» по клику вне / Escape
  useEffect(() => {
    if (!showActionMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setShowActionMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowActionMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showActionMenu]);

  const { mutate: seenMutate } = useMutationQuery({
    method: "POST",
    url: item?.id
      ? ApiRoutes.ACKNOWLEDGE_INTERNAL.replace(":id", String(item.id))
      : "",
    messages: {
      success: "Вы успешно ознакомились с документом",
      error: "Не удалось отметить ознакомление",
      invalidate: item?.id
        ? [ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", String(item.id))]
        : [],
    },
  });

  const isAcknowledged =
    item.is_unread === false ||
    (item.recipients &&
      item.recipients.some(
        (r: any) => r.read_at !== null && r.read_at !== undefined,
      ));

  const handleAction = (id: "seen" | "reply" | "forward" | "task") => {
    setShowActionMenu(false);
    if (id === "seen") {
      seenMutate({});
      return;
    }
    if (id === "task") {
      setShowTaskPanel(true);
      return;
    }
    // «Ответить»/«Перенаправить» → переход на создание исходящего письма с
    // контекстом исходного входящего (аккордеон + предзаполнение «Кому»).
    navigate("/modules/correspondence/internal/outgoing/create", {
      state: {
        composeMode: id,
        sourceLetter: {
          id: item.id,
          subject: item.subject,
          creator: item.creator,
          senderName,
          date: formattedSentDate,
          status: item.status,
          priority: item.priority,
          inboundNumber,
          body: documentBody,
        },
      },
    });
  };

  // Тело письма с рисунком ЭЦП хранится в ВЕРСИИ документа. Эндпоинт одного
  // письма (/internal-correspondences/:id) пока отдаёт в body устаревшую версию
  // (напр. 1.0 без ЭЦП), поэтому, как и редактор исходящего письма, тянем версии
  // и показываем САМУЮ СВЕЖУЮ — её содержимое содержит вшитый рисунок ЭЦП и
  // совпадает с тем, что видит отправитель. item.body — только как крайний фолбэк.
  const { data: versionsResponse, isLoading: loadingVersions } = useGetQuery({
    url: item?.id
      ? ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: { enabled: !!item?.id, refetchOnWindowFocus: false },
  });

  // Производное значение — React Compiler мемоизирует автоматически, ручной
  // useMemo не нужен. Берём САМУЮ СВЕЖУЮ версию (с наибольшим id): её содержимое
  // включает вшитый рисунок ЭЦП. Не полагаемся на порядок элементов с бэкенда.
  // item.body — крайний фолбэк.
  const docVersions: { id?: number | string; body?: string }[] =
    versionsResponse?.data?.versions || [];
  const activeVersion = docVersions.find(v => String(v.id) === String(activeVersionId)) 
    || docVersions.reduce((a, b) => (Number(b?.id) > Number(a?.id) ? b : a), docVersions[0] || {});
  const documentBody = activeVersion?.body || item.body || "";

  // Пока тянем версии — не показываем устаревший item.body, чтобы не мигнуть
  // старой версией (1.0) перед подменой на свежую.
  const isResolvingBody = !!item?.id && loadingVersions;

  // Эффект «следования за холстом» для боковых панелей (цилиндров). Группа
  // панелей лежит абсолютно у верха холста; при прокрутке страницы смещаем её
  // вниз через transform, чтобы вкладки и раскрытая панель были доступны на
  // любой странице, а высоту раскрытой панели ограничиваем видимой областью
  // (переменная --icc-panel-max-h). CSS position:sticky здесь не работает — его
  // перехватывает серый контейнер холста с overflow. 1-в-1 как в редакторе
  // исходящего письма.
  useEffect(() => {
    if (isResolvingBody) return;
    const scroller = scrollRef.current;
    const canvas = canvasRef.current;
    const group = panelsGroupRef.current;
    if (!scroller || !canvas || !group) return;

    const TOP_M = 12; // отступ группы от верхнего края видимой области
    const BOT_M = 24; // нижний отступ для раскрытой панели
    const MIN_VISIBLE = 160; // минимум пикселей группы, что держим над холстом

    const update = () => {
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      let shift = Math.max(0, TOP_M - canvasTop);
      shift = Math.min(shift, Math.max(0, canvas.offsetHeight - MIN_VISIBLE));
      // Верх группы в координатах видимой области: от него отсчитываем доступную
      // высоту, чтобы низ раскрытой панели не уезжал под экран.
      const groupViewportTop = canvasTop + shift;
      const availH = Math.max(
        200,
        scroller.clientHeight - groupViewportTop - BOT_M,
      );
      group.style.setProperty("--icc-panel-max-h", `${availH}px`);
      group.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Высота холста меняется после постраничной разбивки (paginateHtml в
    // DocumentCanvas выполняется в layout-эффекте уже после первого рендера) —
    // пересчитываем позицию панелей, когда высота холста устоялась.
    const canvasRO = new ResizeObserver(update);
    canvasRO.observe(canvas);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      canvasRO.disconnect();
      group.style.transform = "";
    };
  }, [documentBody, isResolvingBody, panelsInToolbar]);

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

  const senderName = item.creator?.full_name || "Министерство Финансов";
  const senderInitials = item.creator?.full_name
    ? getInitials(item.creator.full_name)
    : "МФ";
  const inboundNumber = item.reg_number
    ? item.reg_number.replace(/^[A-Z]+/i, item.my_prefix || "IN")
    : item.my_prefix
      ? `${item.my_prefix}`
      : "—";

  const formattedSentDate = item.sent_at
    ? new Date(item.sent_at).toLocaleDateString("ru-RU")
    : "—";

  // Действия над письмом: ознакомились / ответили / переслали. Бэкенд отдаёт
  // их отдельными массивами прямо в объекте письма (для входящих).
  const acknowledgedUsers = item.acknowledged_users || [];
  const repliedUsers = item.replied_users || [];
  const forwardedUsers = item.forwarded_users || [];

  // Открытие раздела — взаимное закрытие остальных (одновременно только один).
  // Общие для боковых вкладок цилиндров и горизонтальной панели разделов.
  const openSigners = () => {
    setSignersOpen(true);
    setApproversOpen(false);
    setVersionsOpen(false);
    setShowTaskPanel(false);
    setAttachmentsOpen(false);
  };
  const openApprovers = () => {
    setApproversOpen(true);
    setSignersOpen(false);
    setVersionsOpen(false);
    setShowTaskPanel(false);
    setAttachmentsOpen(false);
  };
  const openVersions = () => {
    setVersionsOpen(true);
    setSignersOpen(false);
    setApproversOpen(false);
    setShowTaskPanel(false);
    setAttachmentsOpen(false);
  };
  const openTask = () => {
    setShowTaskPanel(true);
    setSignersOpen(false);
    setApproversOpen(false);
    setVersionsOpen(false);
    setAttachmentsOpen(false);
  };
  const openAttachments = () => {
    setAttachmentsOpen(true);
    setShowTaskPanel(false);
    setSignersOpen(false);
    setApproversOpen(false);
    setVersionsOpen(false);
  };

  // Разделы для режима «Панель разделов сверху» — те же цвета/подписи, что у
  // боковых цилиндров у холста.
  const sections: ToolbarSection[] = [
    {
      key: "task",
      label: "Поручение",
      dotClass: "bg-indigo-500",
      isOpen: showTaskPanel,
      onToggle: () => (showTaskPanel ? setShowTaskPanel(false) : openTask()),
    },
    {
      key: "versions",
      label: "История версий",
      dotClass: "bg-amber-500",
      isOpen: versionsOpen,
      onToggle: () => (versionsOpen ? setVersionsOpen(false) : openVersions()),
    },
    {
      key: "signers",
      label: "Подписывающий",
      dotStyle: { backgroundColor: "oklch(0.6 0.25 250)" },
      isOpen: signersOpen,
      onToggle: () => (signersOpen ? setSignersOpen(false) : openSigners()),
    },
    {
      key: "approvers",
      label: "Согласующие",
      dotStyle: { backgroundColor: "oklch(0.828 0.189 84.429)" },
      isOpen: approversOpen,
      onToggle: () =>
        approversOpen ? setApproversOpen(false) : openApprovers(),
    },
    {
      key: "attachments",
      label: "Вложения",
      dotClass: "bg-teal-500",
      badge: mappedAttachments.length > 0 ? mappedAttachments.length : undefined,
      isOpen: attachmentsOpen,
      onToggle: () =>
        attachmentsOpen ? setAttachmentsOpen(false) : openAttachments(),
    },

  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] overflow-hidden w-full">
      {/* Просмотр: окно по макету входящих (тулбар, миниатюры, «Согласующие»,
          статус-бар). Тело письма раскладывается постранично той же логикой
          (paginateHtml), что и холст — со встроенным рисунком ЭЦП. */}
      <If is={showPreview}>
        <IncomingPreviewModal
          subject={item.subject || ""}
          inboundNumber={inboundNumber}
          lastModified={formattedSentDate}
          html={documentBody}
          fontSize={14}
          onClose={() => setShowPreview(false)}
          signatures={signatures}
          approvals={approvals}
          versions={docVersions}
          activeVersionId={activeVersionId}
          onSelectVersion={(versionId) => {
            setActiveVersionId(versionId);
          }}
          panelsInToolbar={panelsInToolbar}
          onTogglePanelsInToolbar={setPanelsInToolbar}
          attachments={item.attachments || []}
        />
      </If>

      {/* Шапка страницы / верхняя панель управления */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white relative z-[100]">
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
          {/* Просмотр (бывш. «Предварительный просмотр») */}
          <button
            onClick={() => setShowPreview(true)}
            disabled={isResolvingBody}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={14} />
            <span>Просмотр</span>
          </button>

          {/* Действия над письмом — свёрнуты в группы аватаров, полный перечень
              раскрывается поповером при наведении. Каждая группа скрыта, если
              соответствующих действий не было. */}
          <UserActionCluster
            label="Ответили"
            users={repliedUsers}
            accent={{ avatar: "bg-blue-500", date: "text-blue-600" }}
          />
          <UserActionCluster
            label="Переслали"
            users={forwardedUsers}
            accent={{ avatar: "bg-amber-500", date: "text-amber-600" }}
          />
          <UserActionCluster
            label="Ознакомились"
            users={acknowledgedUsers}
            accent={{ avatar: "bg-emerald-500", date: "text-emerald-600" }}
          />

          <If is={isAcknowledged}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold select-none">
              <Check size={14} className="text-emerald-600" />
              <span>Ознакомлен</span>
            </span>
          </If>

          {/* Действие — выпадающее меню */}
          <div className="relative" ref={actionMenuRef}>
            <button
              onClick={() => setShowActionMenu((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <span>Действие</span>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200",
                  showActionMenu && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence>
              {showActionMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  style={{ transformOrigin: "top right" }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 w-56 py-2 overflow-hidden z-[1000]"
                >
                  {ACTION_MENU_ITEMS.map((menuItem, idx) => (
                    <motion.button
                      key={menuItem.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.035, duration: 0.18 }}
                      onClick={() => handleAction(menuItem.id)}
                      className="w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors text-left"
                    >
                      <menuItem.icon
                        size={16}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span>{menuItem.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Скачать PDF (без изменений) */}
          <button
            onClick={() =>
              downloadDocumentPdf(documentBody, 14, item.subject || "")
            }
            disabled={isResolvingBody}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            <span>Скачать PDF</span>
          </button>
        </div>
      </div>

      {/* ── Детали письма: аккордеон под верхней панелью ── */}
      <div className="flex-shrink-0 flex flex-col bg-white border-b border-slate-200">
        <button
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex items-center gap-3 px-6 h-12 w-full text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ rotate: detailsOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={15} className="text-slate-400 flex-shrink-0" />
          </motion.div>
          <span className="text-sm font-semibold text-slate-700">
            Детали письма
          </span>
          <div className="flex items-center gap-2 ml-2 flex-1 overflow-hidden">
            {/* Отправитель */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                {senderInitials[0]}
              </span>
              <span className="truncate max-w-[160px]">{senderName}</span>
            </span>
            {/* Дата */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium flex-shrink-0">
              <Calendar size={10} />
              <span>{formattedSentDate}</span>
            </span>
            {/* Статус */}
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize flex-shrink-0",
                inboxStatusStyle[item.status] ||
                  "bg-slate-100 text-slate-600 border-slate-200",
              )}
            >
              {statusTranslations[item.status] || item.status}
            </span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {detailsOpen && (
            <motion.div
              key="details-expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 px-6 py-5">
                {/* Отправитель */}
                <DetailField label="Отправитель">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0 border border-blue-200">
                      {senderInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {senderName}
                      </p>
                      <p className="text-[10px] text-slate-400">Отправитель</p>
                    </div>
                  </div>
                </DetailField>

                {/* Копия */}
                <DetailField label="Копия">
                  <p
                    className={cn(
                      "text-xs font-medium leading-snug",
                      ccRecipientsList
                        ? "text-slate-800"
                        : "text-slate-400 italic",
                    )}
                  >
                    {ccRecipientsList || "Не указано"}
                  </p>
                </DetailField>

                {/* Тема */}
                <DetailField label="Тема">
                  <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2">
                    {item.subject || "Без темы"}
                  </p>
                </DetailField>

                {/* Дата */}
                <DetailField label="Дата">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Calendar size={13} className="text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold">
                      {formattedSentDate}
                    </span>
                  </div>
                </DetailField>

                {/* Номер (вх.) */}
                <DetailField label="Номер (вх.)">
                  <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-flex w-fit text-slate-800">
                    {inboundNumber}
                  </span>
                </DetailField>

                {/* Тип документа */}
                <DetailField label="Тип документа">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-100 w-fit">
                    <FileType size={12} />
                    <span>Внутренний</span>
                  </span>
                </DetailField>

                {/* Статус */}
                <DetailField label="Статус">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize w-fit",
                      inboxStatusStyle[item.status] ||
                        "bg-slate-100 text-slate-600 border-slate-200",
                    )}
                  >
                    {statusTranslations[item.status] || item.status}
                  </span>
                </DetailField>

                {/* Приоритет */}
                <DetailField label="Приоритет">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize w-fit",
                      priorityConfig[item.priority || "low"]?.className || "bg-slate-50! text-slate-600! border-slate-200!"
                    )}
                  >
                    {priorityConfig[item.priority || "low"]?.label || "Низкая важность"}
                  </span>
                </DetailField>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <If is={relatedDocs.length > 0}>
        <div className="px-6 pt-4 flex-shrink-0">
          <RelatedDocsBlock relatedDocuments={relatedDocs} />
        </div>
      </If>

      {/* Панель управления редактором — перенесена из «Исходящих писем».
          Инструменты форматирования показаны в неактивном (disabled) виде, т.к.
          входящее письмо не редактируется. Активны только элементы просмотра:
          переключатель «Панель разделов сверху» и, в этом режиме, горизонтальные
          кнопки разделов (цилиндров). */}
      <EditorToolbar
        panelsInToolbar={panelsInToolbar}
        onTogglePanelsInToolbar={setPanelsInToolbar}
        sections={sections}
      />

      {/* Основная рабочая область: холст документа + всплывающие панели */}
      <div className="flex flex-1 min-h-0 overflow-hidden w-full relative">
        {/* Холст основного бланка документа: постраничная разбивка (разделение
            страниц A4) и рисунок ЭЦП — 1-в-1 как в редакторе исходящего письма */}
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-auto bg-[#E8EAED] flex items-start justify-center py-8 px-8"
        >
          {isResolvingBody ? (
            <div className="flex flex-col items-center gap-2 text-slate-400 py-20">
              <Loader2 size={22} className="animate-spin text-blue-500" />
              <span className="text-xs font-semibold">
                Загрузка документа...
              </span>
            </div>
          ) : (
            <div
              ref={canvasRef}
              className="relative shrink-0"
              style={{ width: PAGE_WIDTH }}
            >
              <DocumentCanvas html={documentBody} />
              {/* Группа боковых панелей (цилиндров): высотой 0 у верха холста;
                  смещается за прокруткой (эффект «следования за холстом»), чтобы
                  оставаться привязанной к холсту — как в редакторе исходящего. */}
              <div
                ref={panelsGroupRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 0,
                  zIndex: 500,
                  willChange: "transform",

                }}
              >
                <SignersPanel
                  isOpen={signersOpen}
                  hideTab={panelsInToolbar}
                  onOpen={openSigners}
                  onClose={() => setSignersOpen(false)}
                  signatures={signatures}
                />
                <ApproversPanel
                  isOpen={approversOpen}
                  hideTab={panelsInToolbar}
                  onOpen={openApprovers}
                  onClose={() => setApproversOpen(false)}
                  approvals={approvals}
                />
                {!panelsInToolbar && (
                  <div className="absolute z-20" style={{ left: -33, top: 10 }}>
                    <motion.button
                      onClick={() =>
                        showTaskPanel ? setShowTaskPanel(false) : openTask()
                      }
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                      }}
                      className={cn(
                        "bg-white border border-slate-200 border-r-0 rounded-l-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
                        showTaskPanel ? "bg-slate-50" : "hover:bg-slate-50",
                      )}
                      aria-label="Поручение"
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-500" />
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
                        Поручение
                      </span>
                    </motion.button>
                  </div>
                )}
                <AttachmentsPanel
                  isOpen={attachmentsOpen}
                  hideTab={panelsInToolbar}
                  onOpen={openAttachments}
                  onClose={() => setAttachmentsOpen(false)}
                  attachments={mappedAttachments}
                  onPreview={(file) => setPreviewAttachment(file)}
                  onDownload={(file) => downloadAttachment(file)}
                />

                <VersionsPanel
                  isOpen={versionsOpen}
                  hideTab={panelsInToolbar}
                  onOpen={openVersions}
                  onClose={() => setVersionsOpen(false)}
                  versions={docVersions}
                  activeVersionId={activeVersionId}
                  onSelectVersion={(versionId) => {
                    setActiveVersionId(versionId);
                  }}
                />
                <AnimatePresence>
                  {showTaskPanel && (
                    <TaskPanel correspondenceId={item.id} onClose={() => setShowTaskPanel(false)} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
      <If is={!!previewAttachment}>
        <FilePreviewModal
          file={createApiFileFromAttachedFile(previewAttachment)}
          onClose={() => setPreviewAttachment(null)}
          unavailableNotice={CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE}
        />
      </If>
    </div>
  );
};


