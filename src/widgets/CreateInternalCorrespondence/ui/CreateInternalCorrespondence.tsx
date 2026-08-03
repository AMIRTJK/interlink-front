import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Send,
  // Pin,
  // ChevronRight,
  // Calendar,
  Check,
  // FileBadge,
  FileType,
} from "lucide-react";
import { useGetQuery, useMutationQuery, toast, tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";
import { If } from "@shared/ui";
import { message } from "antd";
import { ConfirmationModal } from "./ConfirmationModal";
import { RecipientSelectModal } from "./RecipientSelectModal";
import { DeclineReasonModal } from "./DeclineReasonModal";
import { CancelSignatureModal } from "./CancelSignatureModal";
import type {
  // Status,
  ImportanceLevel,
  PageOrientation,
  // RegistryItem,
  RecipientOption,
  AttachedFile,
  Approver,
  FinalSigner,
  MetaOption,
} from "../types";
import {
  LETTER_TYPE_OPTIONS,
  LETTER_TYPE_DESC,
  IMPORTANCE_OPTIONS,
  // RECIPIENT_OPTIONS,
  ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE_MB,
  SPACER_ATTR,
  PAGE_BREAK_ATTR,
  STAMP_ATTR,
  // INBOX_DOC_TYPES,
  // INBOX_DOC_TYPE_STYLE,
  // MOCK_CONTENT_LINES,
  // OUTBOX_STATUS_LABEL,
  // OUTBOX_STATUS_STYLE,
} from "../lib/constants";
import {
  cn,
  formatFileSize,
  downloadAttachment,
  createApiFileFromAttachedFile,
  CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE,
} from "../lib/utils";
import { FilePreviewModal } from "@features/Profile";
import {
  correspondencePermissionsKey,
  useCorrespondenceUserContext,
} from "@entities/correspondence";
import {
  DEFAULT_DOC_LAYOUT,
  RULER_MIN_CONTENT,
  RULER_MIN_MARGIN,
  hasDefaultRulerMargins,
  pageWidthForOrientation,
  stripDocLayout,
  withDocLayout,
  type DocLayout,
} from "./createInternalCorrespondence/docLayout";
import { EditorRuler } from "./createInternalCorrespondence/EditorRuler";
import { PageGrid } from "./createInternalCorrespondence/PageGrid";
import { WORD_BOUNDARY_RE } from "./createInternalCorrespondence/editorTabs";
import {
  cleanEditorArtifacts,
  wrapBareTopLevelNodes,
} from "./createInternalCorrespondence/editorCaret";
import { paginateEditorDom } from "./createInternalCorrespondence/paginateEditorDom";
import { buildFragmentFromHtml } from "./createInternalCorrespondence/editorFragments";
import { useLocationStatePrefill } from "./createInternalCorrespondence/useLocationStatePrefill";
import { useSavedDocumentPrefill } from "./createInternalCorrespondence/useSavedDocumentPrefill";
import { useComposeReplyPrefill } from "./createInternalCorrespondence/useComposeReplyPrefill";
import { useWorkflowPrefill } from "./createInternalCorrespondence/useWorkflowPrefill";
import { useEditorKeyDown } from "./createInternalCorrespondence/useEditorKeyDown";
import { useEditorCommands } from "./createInternalCorrespondence/useEditorCommands";
import { useEditorClipboard } from "./createInternalCorrespondence/useEditorClipboard";
import {
  FWD_ATTR,
  buildForwardQuoteNodes,
  hasForwardQuote,
  removeForwardQuote,
} from "./createInternalCorrespondence/forwardQuote";
import {
  DS_STAMP_DEFAULT_HEIGHT,
  DS_STAMP_DEFAULT_WIDTH,
  buildEmbeddedStampHtml,
} from "./createInternalCorrespondence/stampGeometry";
import { ToolbarFormatGroup } from "./createInternalCorrespondence/toolbar/ToolbarFormatGroup";
import { ToolbarPageGroup } from "./createInternalCorrespondence/toolbar/ToolbarPageGroup";
import { ToolbarParagraphGroup } from "./createInternalCorrespondence/toolbar/ToolbarParagraphGroup";
import { ToolbarViewToggles } from "./createInternalCorrespondence/toolbar/ToolbarViewToggles";
import { SectionCylindersBar } from "./createInternalCorrespondence/toolbar/SectionCylindersBar";
import { IncomingPagerBar } from "./createInternalCorrespondence/toolbar/IncomingPagerBar";
import { VersionComparePagerBar } from "./createInternalCorrespondence/toolbar/VersionComparePagerBar";
import { EditorPageSheet } from "./createInternalCorrespondence/EditorPageSheet";
import { StampPlaceholder } from "./createInternalCorrespondence/StampPlaceholder";
import { ScreenActionsBar } from "./createInternalCorrespondence/ScreenActionsBar";
import { StampZoomOverlay } from "./createInternalCorrespondence/StampZoomOverlay";
import { DocumentMetaToggle } from "./createInternalCorrespondence/documentMeta/DocumentMetaToggle";
import { LetterTypeSelect } from "./createInternalCorrespondence/documentMeta/LetterTypeSelect";
import { ImportanceSelect } from "./createInternalCorrespondence/documentMeta/ImportanceSelect";
import { RecipientField } from "./createInternalCorrespondence/documentMeta/RecipientField";
import { AttachmentsField } from "./createInternalCorrespondence/documentMeta/AttachmentsField";
import { EditorSurface } from "./createInternalCorrespondence/EditorSurface";
import { useEditorHistory } from "./createInternalCorrespondence/useEditorHistory";
import { printDocumentPages } from "./createInternalCorrespondence/printDocument";
import { useStampDrag } from "./createInternalCorrespondence/useStampDrag";
import { useWordImport } from "./createInternalCorrespondence/useWordImport";
import {
  useOriginalCanvasScrollFollow,
  useSideCanvasScrollFollow,
} from "./createInternalCorrespondence/useCanvasScrollFollow";
import {
  useNavPaneScrollFollow,
  usePanelsGroupScrollFollow,
} from "./createInternalCorrespondence/usePaneScrollFollow";
import {
  buildVersionAuthors,
  collectRevokedVersionIds,
  mapDocumentVersions,
} from "./createInternalCorrespondence/versionsLib";
import { useDraftMutations } from "./createInternalCorrespondence/useDraftMutations";

import { PreviewModal } from "./PreviewModal";
import { OriginalLetterPanel } from "./OriginalLetterPanel";
import { RelatedDocsAccordion } from "./RelatedDocsBlock";
import { OriginalLetterCanvas } from "./OriginalLetterCanvas";
import {
  paginateHtml,
  type StampInfo,
} from "../../InternalCorrespondenceIncomingView/lib";
import { ApproversPanel } from "./ApproversPanel";
import { SignerPanel } from "./SignerPanel";
import { IncomingLettersPanel } from "./IncomingLettersPanel";
import { VersionsPanel } from "./VersionsPanel";
import { NavigationPane } from "./NavigationPane";
import { AttachmentsPanel } from "./AttachmentsPanel";


export const CreateInternalCorrespondence = ({
  id,
  onBack = () => {},
  initialData,
}: {
  id?: string | number;
  onBack?: () => void;
  initialData?: any;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Контекст «Ответить»/«Перенаправить»: данные исходного входящего письма
  // приходят через navigate state со страницы просмотра входящего.
  const composeState = (location.state || null) as {
    composeMode?: "reply" | "forward";
    sourceLetter?: {
      id?: string | number;
      subject?: string;
      creator?: {
        id?: string | number;
        full_name?: string;
        position?: string;
        department?: string;
      };
      senderName?: string;
      date?: string;
      status?: string;
      priority?: string;
      inboundNumber?: string;
      body?: string;
    };
  } | null;
  const composeMode = composeState?.composeMode;
  const sourceLetter = composeState?.sourceLetter;

  // Связь ответа/пересылки с исходным письмом. Контекст приходит двумя путями:
  // со страницы просмотра входящего (composeMode + sourceLetter.id) либо из
  // реестра исходящих (source_correspondence_id + link_type напрямую в state).
  // Нормализуем к паре полей бэкенда — их всегда передаём вместе.
  const linkState = (location.state || null) as {
    source_correspondence_id?: string | number;
    link_type?: "reply" | "forward";
  } | null;
  const sourceCorrespondenceId =
    linkState?.source_correspondence_id ?? sourceLetter?.id ?? null;
  const linkType: "reply" | "forward" | null =
    linkState?.link_type ?? composeMode ?? null;

  // Блок «Исходное письмо» показываем не только ДО сохранения (из navigate
  // state), но и ПОСЛЕ — GET уже отдаёт link_type + source_document связанного
  // письма. Здесь собираем поля для панели из сохранённого ответа как фолбэк.
  // ВАЖНО: только для отображения. Префилл темы/получателей и боковой A4-показ
  // исходного письма ниже завязаны строго на navigate state (composeMode/
  // sourceLetter), чтобы при открытии готового черновика ничего не перетиралось.
  const savedItem = initialData?.item;
  const savedLinkType: "reply" | "forward" | null =
    savedItem?.link_type === "reply" || savedItem?.link_type === "forward"
      ? savedItem.link_type
      : null;
  const savedSourceDoc = savedItem?.source_document;
  // Тело исходного письма source_document не содержит — достаём из incoming_links.
  const savedSourceBody: string | undefined =
    savedItem?.incoming_links?.find(
      (l: any) => Number(l?.incoming_id) === Number(savedSourceDoc?.id),
    )?.incoming?.body ?? undefined;

  const panelMode: "reply" | "forward" | undefined =
    composeMode ?? savedLinkType ?? undefined;
  const panelSource = sourceLetter
    ? sourceLetter
    : savedSourceDoc
      ? {
          id: savedSourceDoc.id,
          subject: savedSourceDoc.subject,
          creator: savedSourceDoc.creator,
          senderName: savedSourceDoc.creator?.full_name,
          date: savedSourceDoc.sent_at
            ? new Date(savedSourceDoc.sent_at).toLocaleDateString("ru-RU")
            : savedSourceDoc.created_at
              ? new Date(savedSourceDoc.created_at).toLocaleDateString("ru-RU")
              : "—",
          status: savedSourceDoc.status,
          priority: undefined as string | undefined,
          inboundNumber:
            savedSourceDoc.reg_number || savedSourceDoc.tracking_number || "—",
          body: savedSourceBody,
        }
      : undefined;

  // Исходное письмо могло быть создано этим же редактором — снимаем служебный
  // маркер раскладки, чтобы он не попадал в боковой просмотр и его пагинацию.
  const panelSourceBody = useMemo(
    () => stripDocLayout(panelSource?.body),
    [panelSource?.body],
  );

  const [to, setTo] = useState<RecipientOption[]>([]);
  const [cc, setCc] = useState<RecipientOption[]>([]);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<AttachedFile | null>(null);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [finalSigner, setFinalSigner] = useState<FinalSigner | null>(null);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCcDropdown, setShowCcDropdown] = useState(false);
  const [toSearch, setToSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [approversOpen, setApproversOpen] = useState(false);
  const [signerOpen, setSignerOpen] = useState(false);
  const [incomingOpen, setIncomingOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  // Демо-режим (для показа руководству): «цилиндры» разделов выносятся в
  // горизонтальную панель под тулбаром, а боковые вкладки у холста скрываются.
  // Сами панели по-прежнему открываются у холста. По умолчанию выключен —
  // текущий функционал не меняется.
  const [panelsInToolbar, setPanelsInToolbar] = useState(true);

  const handleOpenApprovers = () => {
    setApproversOpen(true);
    setSignerOpen(false);
    setIncomingOpen(false);
    setVersionsOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenSigner = () => {
    setSignerOpen(true);
    setApproversOpen(false);
    setIncomingOpen(false);
    setVersionsOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenIncoming = () => {
    setIncomingOpen(true);
    setApproversOpen(false);
    setSignerOpen(false);
    setVersionsOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenVersions = () => {
    setVersionsOpen(true);
    setApproversOpen(false);
    setSignerOpen(false);
    setIncomingOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenAttachments = () => {
    setAttachmentsOpen(true);
    setApproversOpen(false);
    setSignerOpen(false);
    setIncomingOpen(false);
    setVersionsOpen(false);
  };
  const [showCcField, setShowCcField] = useState(false);
  const [sent, setSent] = useState(false);
  const [formExpanded, setFormExpanded] = useState(true);
  const [letterType, setLetterType] = useState<string | null>(null);
  const [showLetterTypeDropdown, setShowLetterTypeDropdown] = useState(false);
  const [importance, setImportance] = useState<ImportanceLevel>("normal");
  const [showImportanceDropdown, setShowImportanceDropdown] = useState(false);
  const [fontSize, setFontSize] = useState("14");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [orientation, setOrientation] = useState<PageOrientation>(
    DEFAULT_DOC_LAYOUT.orientation,
  );
  // Показ сантиметровой линейки над листом (переключатель в панели редактора).
  // По умолчанию выключена, но выбор пользователя запоминается между сессиями,
  // поэтому включённая линейка переживает перезагрузку страницы.
  const [rulerEnabled, setRulerEnabled] = useState<boolean>(() =>
    tokenControl.getEditorRulerEnabled(),
  );
  const toggleRuler = useCallback((enabled: boolean) => {
    setRulerEnabled(enabled);
    tokenControl.setEditorRulerEnabled(enabled);
  }, []);
  // Показ сетки — тоже настройка приложения (в Word это галочка на вкладке
  // «Вид», а не свойство документа), поэтому запоминаем так же, как линейку.
  const [gridEnabled, setGridEnabled] = useState<boolean>(() =>
    tokenControl.getEditorGridEnabled(),
  );
  const toggleGrid = useCallback((enabled: boolean) => {
    setGridEnabled(enabled);
    tokenControl.setEditorGridEnabled(enabled);
  }, []);
  // Область навигации — тоже галочка вкладки «Вид» в Word, запоминаем так же.
  const [navPaneEnabled, setNavPaneEnabled] = useState<boolean>(() =>
    tokenControl.getEditorNavPaneEnabled(),
  );
  const toggleNavPane = useCallback((enabled: boolean) => {
    setNavPaneEnabled(enabled);
    tokenControl.setEditorNavPaneEnabled(enabled);
  }, []);
  // Поля страницы (px) — регулируются перетаскиванием маркеров линейки. Задают
  // ширину колонки набора, поэтому влияют на перенос текста, пагинацию и печать.
  const [marginLeft, setMarginLeft] = useState(DEFAULT_DOC_LAYOUT.marginLeft);
  const [marginRight, setMarginRight] = useState(DEFAULT_DOC_LAYOUT.marginRight);
  // Смена ориентации меняет ширину листа — зажимаем поля, чтобы колонка набора
  // не «схлопнулась» в узком портрете после широкого альбома.
  useEffect(() => {
    const cap = Math.round(
      (pageWidthForOrientation(orientation) - RULER_MIN_CONTENT) / 2,
    );
    setMarginLeft((l) => Math.max(RULER_MIN_MARGIN, Math.min(l, cap)));
    setMarginRight((r) => Math.max(RULER_MIN_MARGIN, Math.min(r, cap)));
  }, [orientation]);

  // Раскладка листа, которая уезжает в версию вместе с телом письма.
  const docLayout = useMemo<DocLayout>(
    () => ({ marginLeft, marginRight, orientation }),
    [marginLeft, marginRight, orientation],
  );
  const isRulerDefault = hasDefaultRulerMargins(docLayout);

  // Восстановление раскладки из открываемой версии. У версий, сохранённых до
  // появления маркера, раскладки нет — для них берём значения по умолчанию,
  // чтобы вид не «наследовался» от предыдущей открытой версии.
  const applyDocLayout = useCallback((layout: DocLayout | null) => {
    const next = layout || DEFAULT_DOC_LAYOUT;
    setOrientation(next.orientation);
    setMarginLeft(next.marginLeft);
    setMarginRight(next.marginRight);
  }, []);

  // Сброс линейки: возвращаем стандартные поля страницы одним действием, если
  // маркеры случайно утащили не туда. Ориентацию не трогаем — она задаётся
  // отдельной кнопкой и к линейке отношения не имеет.
  const resetRulerMargins = useCallback(() => {
    setMarginLeft(DEFAULT_DOC_LAYOUT.marginLeft);
    setMarginRight(DEFAULT_DOC_LAYOUT.marginRight);
    toast.success("Поля страницы сброшены к значениям по умолчанию");
  }, []);
  const [showPreview, setShowPreview] = useState(false);
  const [showCancelSignConfirm, setShowCancelSignConfirm] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  // Страницы для предпросмотра — берём из разложенного редактора в момент
  // открытия, чтобы предпросмотр совпадал с холстом 1-в-1.
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [previewStamp, setPreviewStamp] = useState<{
    pageIndex: number;
    x: number;
    y: number;
    width: string;
    html?: string;
  } | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [pageCount, setPageCount] = useState(1);
  // Индекс страницы, для которой показываем подтверждение удаления
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);

  // Управление плавающим плейсхолдером ЭЦП ДО подписания
  const [stampVisible, setStampVisible] = useState(false);
  const [stampPos, setStampPos] = useState({ x: 40, y: 40 });
  const [stampSize, setStampSize] = useState({
    width: DS_STAMP_DEFAULT_WIDTH,
    height: DS_STAMP_DEFAULT_HEIGHT,
  });

  const [docCreator, setDocCreator] = useState<any>(null);
  const [folder, setFolder] = useState<string | number>("drafts");
  const [attachedIncomingLetters, setAttachedIncomingLetters] = useState<any[]>(
    [],
  );
  const [showIncomingSearch, setShowIncomingSearch] = useState(false);
  const [incomingLetterSearch, setIncomingLetterSearch] = useState("");
  // Режим просмотра входящего письма включён по умолчанию, когда страница
  // открыта из «Ответить». При «Перенаправить» — выключен: там исходное письмо
  // по умолчанию лежит цитатой прямо в холсте (как в Outlook), а боковой показ
  // оригинала — альтернатива, которая эту цитату из холста убирает.
  const [showOriginalLetterSides, setShowOriginalLetterSides] = useState(
    !!(panelMode && panelSource) && panelMode !== "forward",
  );
  const [showVersionCompareSides, setShowVersionCompareSides] = useState(false);

  const toggleOriginalLetterSides = (checked: boolean) => {
    setShowOriginalLetterSides(checked);
    if (checked) {
      setShowVersionCompareSides(false);
    }
  };

  const toggleVersionCompareSides = (checked: boolean) => {
    setShowVersionCompareSides(checked);
    if (checked) {
      setShowOriginalLetterSides(false);
    }
  };

  useEffect(() => {
    if (panelMode && panelSource) {
      setShowOriginalLetterSides((prev) => {
        if (prev === false) return false;
        setShowVersionCompareSides(false);
        return true;
      });
    }
  }, [panelMode, panelSource]);

  const [originalPage, setOriginalPage] = useState(0);
  const originalSheets = useMemo((): { pages: string[]; stamp: StampInfo } => {
    if (!panelMode || !panelSourceBody) return { pages: [], stamp: null };
    const res = paginateHtml(panelSourceBody, 14);
    const pages = [...res.pages];
    if (res.stamp) while (pages.length <= res.stamp.pageIndex) pages.push("");
    return { pages, stamp: res.stamp };
  }, [panelMode, panelSourceBody]);
  const originalTotal = Math.max(originalSheets.pages.length, 1);
  const originalCurrent = Math.min(originalPage, originalTotal - 1);

  const [versionComparePage, setVersionComparePage] = useState(0);

  const composeAppliedRef = useRef(false);
  const stampRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLDivElement>(null);
  const rootScrollRef = useRef<HTMLDivElement>(null);
  const originalCanvasWrapRef = useRef<HTMLDivElement>(null);
  const navPaneWrapRef = useRef<HTMLDivElement>(null);
  const versionCompareCanvasWrapRef = useRef<HTMLDivElement>(null);

  // Обёртка боковых панелей (История версий / Входящие письма / Согласующие /
  // Подписывающий). Прижимаем её к верху видимой области при прокрутке, чтобы
  // вкладки и раскрытая панель были доступны на любой странице документа.
  const panelsGroupRef = useRef<HTMLDivElement>(null);
  // Липкая шапка редактора: тулбар форматирования + панель разделов +
  // пагинация входящего письма. Нужна её высота, чтобы прижимать боковые
  // панели под неё, а не под самый верх экрана.
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const paginateEditorRef = useRef<(() => number) | null>(null);
  // Высота содержимого редактора после последней пагинации. Нужна страховке на
  // ResizeObserver, чтобы отличать собственные правки пагинатора (высота уже
  // учтена) от внешних изменений (картинка загрузилась, innerHTML заменили).
  const lastPaginatedHeightRef = useRef(0);

  const isLandscape = orientation === "landscape";
  const PAGE_WIDTH = isLandscape ? 1122 : 794;
  const PAGE_HEIGHT = isLandscape ? 794 : 1122;
  const PAGE_PAD_V = 72;
  const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PAD_V * 2;
  const PAGE_GAP = 32; // визуальный отступ между листами
  const PAGE_STRIDE = PAGE_HEIGHT + PAGE_GAP;

  // Все «пришвартованные» блоки (боковые холсты, группа панелей, область
  // навигации) держатся в поле зрения одинаково: CSS position:sticky здесь
  // перехватывает серая область с overflow, поэтому смещаем их вручную по
  // scroll/resize через transform. Подробности — в самих хуках.
  useSideCanvasScrollFollow({
    showOriginalLetterSides,
    showVersionCompareSides,
    originalCanvasWrapRef,
    versionCompareCanvasWrapRef,
    rootScrollRef,
    pageCanvasRef,
    stickyHeaderRef,
    composeMode,
    sourceLetter,
  });

  useOriginalCanvasScrollFollow({
    showOriginalLetterSides,
    originalCanvasWrapRef,
    rootScrollRef,
    pageCanvasRef,
    stickyHeaderRef,
    composeMode,
    sourceLetter,
    pageCount,
    orientation,
    formExpanded,
    panelsInToolbar,
  });

  usePanelsGroupScrollFollow({
    id,
    panelsGroupRef,
    rootScrollRef,
    pageCanvasRef,
    stickyHeaderRef,
    pageCount,
    orientation,
    formExpanded,
    panelsInToolbar,
  });

  useNavPaneScrollFollow({
    navPaneEnabled,
    navPaneWrapRef,
    rootScrollRef,
    pageCanvasRef,
    stickyHeaderRef,
    pageCount,
    orientation,
    formExpanded,
    panelsInToolbar,
  });

  const [searchParams, setSearchParams] = useState({ query: "" });
  const handleOpenRecipientModal = () => {
    setSearchParams({ query: "" });
    setShowRecipientModal(true);
  };

  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS,
    useToken: true,
    params: searchParams,
  });

  // Справочники типов документа и приоритетов: подписи берём отсюда, не хардкодим
  const { data: metaData } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_META,
    useToken: true,
  });

  // Опции типа письма: ключ+подпись из /meta, описание дополняем локально.
  // До загрузки /meta используем фолбэк-константу.
  const letterTypeOptions = useMemo(() => {
    const metaTypes: MetaOption[] = metaData?.data?.document_types || [];
    if (!metaTypes.length) return LETTER_TYPE_OPTIONS;
    return metaTypes.map((t) => ({
      value: t.key,
      label: t.label,
      desc: LETTER_TYPE_DESC[t.key] ?? LETTER_TYPE_DESC[t.label] ?? "",
    }));
  }, [metaData]);

  // Опции важности: ключ+подпись из /meta, стили (цвета/флажок) берём локально по ключу.
  const importanceStyleByKey = useMemo(
    () => Object.fromEntries(IMPORTANCE_OPTIONS.map((o) => [o.value, o])),
    [],
  );
  const importanceOptions = useMemo(() => {
    const metaPriorities: MetaOption[] = metaData?.data?.priorities || [];
    if (!metaPriorities.length) return IMPORTANCE_OPTIONS;
    return metaPriorities.map((p) => {
      const style = importanceStyleByKey[p.key] ?? IMPORTANCE_OPTIONS[1];
      return { ...style, value: p.key as ImportanceLevel, label: p.label };
    });
  }, [metaData, importanceStyleByKey]);

  const { data: rawWorkflowData, refetch: refetchWorkflow } = useGetQuery({
    url: id ? ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id)) : "",
    useToken: true,
    options: { enabled: !!id },
  });

  // id последней версии, которую мы автоматически подгрузили в редактор.
  // Позволяет переключаться на новую версию после сохранения/подписания,
  // но не сбрасывать выбранную вручную старую версию при обычном рефетче.
  const autoLoadedLatestRef = useRef<string | number | null>(null);

  // Запрос списка версий документа
  const { data: versionsResponse, refetch: refetchVersions } = useGetQuery({
    url: id ? ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id)) : "",
    useToken: true,
    options: {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  });

  const { data: rawStructureData } = useGetQuery<
    Record<string, unknown>,
    { data: any }
  >({
    url: id ? ApiRoutes.GET_INTERNAL_STRUCTURE.replace(":id", String(id)) : "",
    useToken: true,
    options: {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  });

  const relatedDocs = rawStructureData?.data?.related_documents || [];


  const hasSignedWorkflowSignature = useMemo(() => {
    const wfSigs = rawWorkflowData?.data?.signatures || [];
    return wfSigs.some((sig: any) => sig.status === "signed");
  }, [rawWorkflowData]);

  const revokedVersionIds = useMemo(
    () => collectRevokedVersionIds(rawWorkflowData?.data?.signatures || []),
    [rawWorkflowData],
  );

  // Массив всех версий с бэкенда
  const allVersions = useMemo(
    () =>
      mapDocumentVersions({
        rawVersions: versionsResponse?.data?.versions || [],
        revokedVersionIds,
        hasSignedWorkflowSignature,
      }),
    [versionsResponse, revokedVersionIds, hasSignedWorkflowSignature],
  );

  // Список уникальных авторов для выпадающего фильтра
  const versionAuthors = useMemo(
    () => buildVersionAuthors(allVersions),
    [allVersions],
  );

  const [selectedAuthorId, setSelectedAuthorId] = useState<
    string | number | null
  >(null);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const initialActiveVersion =
    allVersions.length > 0 ? allVersions[allVersions.length - 1].id : null;
  const [activeVersionId, setActiveVersionId] = useState<
    string | number | null
  >(initialActiveVersion);

  const filteredVersions = useMemo(() => {
    if (!selectedAuthorId) return allVersions;
    return allVersions.filter(
      (v: any) => v.author.id === String(selectedAuthorId),
    );
  }, [allVersions, selectedAuthorId]);

  const latestVersion = useMemo(
    () => (allVersions.length > 0 ? allVersions[allVersions.length - 1] : null),
    [allVersions],
  );
  const latestVersionId = latestVersion ? latestVersion.id : null;
  // В режиме сравнения версий выбор предыдущей версии влияет только на ЛЕВЫЙ
  // холст (versionCompareSheets). Правый холст всегда держит последнюю версию
  // (см. эффект синхронизации editorRef ниже) и должен оставаться активным для
  // редактирования/сохранения, поэтому здесь «старая версия» не считается
  // выбранной. Блокировка подписанного документа остаётся через isSigned.
  const isOldVersionSelected =
    !showVersionCompareSides &&
    activeVersionId !== null &&
    activeVersionId !== latestVersionId;

  const activeVersion = useMemo(
    () => allVersions.find((v: any) => v.id === activeVersionId) || latestVersion || null,
    [allVersions, activeVersionId, latestVersion],
  );

  const versionCompareSheets = useMemo((): { pages: string[]; stamp: StampInfo } => {
    if (!showVersionCompareSides || !activeVersion || !activeVersion.content) {
      return { pages: [], stamp: null };
    }
    const res = paginateHtml(activeVersion.content, Number(fontSize) || 14);
    const pages = [...res.pages];
    if (res.stamp) while (pages.length <= res.stamp.pageIndex) pages.push("");
    return { pages, stamp: res.stamp };
  }, [showVersionCompareSides, activeVersion, fontSize]);

  const versionCompareTotal = Math.max(versionCompareSheets.pages.length, 1);
  const versionCompareCurrent = Math.min(versionComparePage, versionCompareTotal - 1);

  const isActiveVersionForSign = activeVersion ? !!activeVersion.is_selected : false;

  const signedVersionId = useMemo(() => {
    if (!hasSignedWorkflowSignature) return null;
    const backendSigned = allVersions.find(
      (v: any) => v.is_current_signed && v.signature_state !== "revoked",
    );
    if (backendSigned) return backendSigned.id;
    const stamped = allVersions.filter(
      (v: any) =>
        v.signature_state !== "revoked" &&
        typeof v.content === "string" &&
        v.content.includes(STAMP_ATTR),
    );
    if (stamped.length) return stamped[stamped.length - 1].id;
    return null;
  }, [allVersions, hasSignedWorkflowSignature]);

  const { mutate: selectVersionForSign, isPending: isSelectingVersion } =
    useMutationQuery<{ versionId: string | number }, any>({
      url: (requestData) =>
        ApiRoutes.SELECT_INTERNAL_VERISION_FOR_SIGN.replace(
          ":correspondenceId",
          String(id || ""),
        ).replace(":versionId", String(requestData.versionId)),
      method: "POST",
      messages: {
        suppressSuccessToast: true,
        invalidate: [
          ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id || "")),
        ],
      },
    });


  const handleSetVersionForSign = (clickedVersionId: string | number) => {
    selectVersionForSign({ versionId: clickedVersionId });
  };

  // Правый холст в режиме сравнения синхронизируем с последней версией только
  // при ВХОДЕ в режим и при появлении новой последней версии (новый id). При
  // переключении сравниваемой (левой) версии activeVersion меняется, но правый
  // холст трогать нельзя — иначе затрутся несохранённые правки пользователя.
  const lastCompareSyncRef = useRef<string | number | null>(null);
  useEffect(() => {
    if (showVersionCompareSides && latestVersion && latestVersion.content) {
      if (lastCompareSyncRef.current === latestVersionId) return;
      lastCompareSyncRef.current = latestVersionId;
      if (editorRef.current && editorRef.current.innerHTML !== latestVersion.content) {
        // Раскладку применяем вместе с телом: колонка набора должна совпасть с
        // той, в которой версия сохранялась.
        applyDocLayout(latestVersion.layout);
        editorRef.current.innerHTML = latestVersion.content;
        setEditorContent(latestVersion.content);
        if (paginateEditorRef.current) {
          const nextPageCount = paginateEditorRef.current();
          setPageCount(nextPageCount);
        }
      }
    } else if (!showVersionCompareSides) {
      // Вышли из режима сравнения — сбрасываем метку, чтобы повторный вход снова
      // подтянул актуальную версию в правый холст.
      lastCompareSyncRef.current = null;
      if (activeVersion && activeVersion.content) {
        if (editorRef.current && editorRef.current.innerHTML !== activeVersion.content) {
          applyDocLayout(activeVersion.layout);
          editorRef.current.innerHTML = activeVersion.content;
          setEditorContent(activeVersion.content);
          if (paginateEditorRef.current) {
            const nextPageCount = paginateEditorRef.current();
            setPageCount(nextPageCount);
          }
        }
      }
    }
  }, [
    showVersionCompareSides,
    latestVersion,
    latestVersionId,
    activeVersion,
    applyDocLayout,
  ]);

  const handleSelectVersion = (content: string, versionId: string | number) => {
    setActiveVersionId(versionId);
    if (!showVersionCompareSides) {
      if (editorRef.current) {
        const target = allVersions.find((v: any) => v.id === versionId);
        // Переключение версии восстанавливает и её раскладку — иначе поля
        // остались бы от предыдущей открытой версии.
        applyDocLayout(target?.layout ?? null);
        editorRef.current.innerHTML = content;
        setEditorContent(content);
        if (!target?.is_selected && !finalSigner?.dsApplied) {
          setStampVisible(false);
        }
        if (paginateEditorRef.current) {
          const nextPageCount = paginateEditorRef.current();
          setPageCount(nextPageCount);
        }
        resetHistory();
      }
    }
  };

  const availableUsers: RecipientOption[] =
    usersData?.data?.data?.map((u: any) => {
      const fullName = u.full_name || "";
      return {
        id: String(u.id),
        name: fullName,
        org: u.position || u.department || "Сотрудник",
        initials: fullName
          .split(" ")
          .map((n: string) => n[0])
          .join(""),
        color: "bg-blue-100 text-blue-700",
      };
    }) || [];

  const { saveDraft, isSaving } = useDraftMutations({
    id,
    navigate,
    locationState: location.state,
    attachments,
    setAttachments,
    refetchVersions,
    selectVersionForSign,
    setActiveVersionId,
  });

  const { mutate: inviteSigner, isPending: isSignerInviting } =
    useMutationQuery<any>({
      url: (req) =>
        ApiRoutes.INTERNAL_INVITE_SIGNER?.replace(":id", String(req.docId)),
      method: "POST",
      messages: {
        success: "Подписывающий назначен",
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        ],
      },
      queryOptions: { onSuccess: () => refetchWorkflow() },
    });

  const { mutate: inviteApprover, isPending: isApproverInviting } =
    useMutationQuery<any>({
      url: (req) =>
        ApiRoutes.INTERNAL_INVITE_APPROVER?.replace(":id", String(req.docId)),
      method: "POST",
      messages: {
        success: "Согласующий приглашен",
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        ],
      },
      queryOptions: { onSuccess: () => refetchWorkflow() },
    });

  const { mutate: attachIncoming } = useMutationQuery<any>({
    url: id
      ? ApiRoutes.ATTACH_INTERNAL_INCOMING?.replace(":id", String(id))
      : "",
    method: "POST",
    messages: {
      success: "Письмо прикреплено",
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
      ],
    },
    queryOptions: { onSuccess: () => refetchWorkflow() },
  });

  const { mutate: sendCorrespondence, isPending: isSending } =
    useMutationQuery<any>({
      url: ApiRoutes.SEND_INTERNAL.replace(":id", String(id || "")),
      method: "POST",
      messages: {
        success: "Письмо успешно отправлено",
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW,
          ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
          correspondencePermissionsKey(String(id || "")),
        ],
      },
      queryOptions: {
        onSuccess: () => {
          setSent(true);
        },
      },
    });

  const isAlreadySent = initialData?.item?.status === "sent";

  const currentUserId = tokenControl.getUserId() || tokenControl.getUserData()?.id;

  // Динамическая роль пользователя в этом документе: она не зависит от
  // глобального RBAC и решает, какие действия над письмом ему показывать.
  const userContext = useCorrespondenceUserContext(id, { source: initialData });
  const canEditDocument = userContext.can("edit");
  const canSendDocument = userContext.can("send");
  const canSignDocument = userContext.can("sign");
  const canApproveDocument = userContext.can("approve");
  const canCancelSignature = userContext.can("cancel_signature");

  const pendingSignature = rawWorkflowData?.data?.signatures?.find(
    (sig: any) => sig.status === "pending"
  );
  const isCurrentSigner = pendingSignature && currentUserId && String(currentUserId) === String(pendingSignature.user_id || pendingSignature.user?.id);
  const canDecline =
    !!pendingSignature && !!isCurrentSigner && userContext.can("decline_signature");

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleDeclineClick = () => {
    setShowDeclineModal(true);
  };

  const handleConfirmDecline = async (reasonText: string) => {
    setIsDeclining(true);
    try {
      const payloadData = await signaturesPayloadAsync({ action: "sign" });
      if (payloadData?.signature_id && payloadData?.nonce) {
        signaturesConfirm({
          signature_id: payloadData.signature_id,
          nonce: payloadData.nonce,
          status: "declined",
          reason: reasonText,
          method: "simple",
        });
        setShowDeclineModal(false);
      } else {
        toast.error("Не удалось получить параметры для отклонения");
      }
    } catch (error: any) {
      toast.error(error?.message || "Ошибка при отклонении документа");
    } finally {
      setIsDeclining(false);
    }
  };

  const assignSelfAsSigner = () => {
    if (!docCreator) return;
    setFinalSigner({
      id: String(docCreator.id),
      isInvited: false,
      name: docCreator.full_name,
      role: docCreator.position || "Автор документа",
      initials: docCreator.full_name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join(""),
      color: "bg-purple-100 text-purple-700",
      dsApplied: false,
      dsLoading: false,
    });
  };

  const { mutateAsync: signaturesPayloadAsync } = useMutationQuery<any>({
    url: ApiRoutes.INTERNAL_SIGNATURES_PAYLOAD?.replace(
      ":id",
      String(id || ""),
    ),
    method: "POST",
    messages: {
      suppressSuccessToast: true,
    },
  });

  const { mutate: signaturesCancel, isPending: isCancellingSign } =
    useMutationQuery<any>({
      url: ApiRoutes.INTERNAL_SIGNATURES_CANCEL?.replace(
        ":id",
        String(id || ""),
      ),
      method: "POST",
      messages: {
        suppressSuccessToast: true,
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
          ApiRoutes.GET_INTERNAL_VERSIONS?.replace(":id", String(id || "")),
          ApiRoutes.GET_INTERNAL_BY_ID?.replace(":id", String(id || "")),
          correspondencePermissionsKey(String(id || "")),
          ...CORRESPONDENCE_INVALIDATE_KEYS,
        ],
      },
      queryOptions: {
        onSuccess: () => {
          toast.success("Подпись отменена. Создана новая версия документа.");
          setShowCancelSignConfirm(false);
          refetchVersions();
        },
      },
    });

  const handleConfirmCancelSignature = (reasonText: string) => {
    signaturesCancel({
      reason: reasonText || undefined,
    });
  };

  const { mutate: signaturesConfirm } = useMutationQuery<any>({
    url: ApiRoutes.INTERNAL_SIGNATURES_CONFIRM?.replace(
      ":id",
      String(id || ""),
    ),
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        correspondencePermissionsKey(String(id || "")),
        ...CORRESPONDENCE_INVALIDATE_KEYS,
      ],
    },
    queryOptions: {
      onSuccess: (_data, variables) => {
        if (variables?.status === "declined") {
          toast.success("Документ успешно отклонен");
          return;
        }

        toast.success("Документ успешно подписан");
        setFinalSigner((prev) =>
          prev ? { ...prev, dsApplied: true, dsLoading: false } : null,
        );

        if (editorRef.current && stampVisible) {
          if (
            !editorRef.current.innerHTML.includes('data-signature-stamp="true"')
          ) {
            const stampHTML = buildEmbeddedStampHtml({
              width:
                typeof stampSize.width === "number"
                  ? stampSize.width
                  : DS_STAMP_DEFAULT_WIDTH,
              x: stampPos.x,
              y: stampPos.y,
              signerName: finalSigner?.name || "Неизвестно",
              signerInitials: finalSigner?.initials || "НА",
            });

            editorRef.current.innerHTML += stampHTML;
            // innerHTML-присвоение идёт мимо onInput — синхронизируем стейт,
            // чтобы сохранение/предпросмотр видели тело письма со штампом.
            setEditorContent(getCleanEditorHtml());
            // Подписанное состояние — новая точка отсчёта истории: отмена не
            // должна убирать вшитый штамп ЭЦП.
            resetHistory();
          }
        }

        setStampVisible(false);

        // ВАЖНО: Принудительно вызываем API сохранения, чтобы бэкенд получил новый body с картинкой
        const editorBody = getCleanEditorHtml();
        const requestPayload: any = {
          subject,
          body: withDocLayout(editorBody, docLayout),
          recipients: {
            to: to.map((r) => r.id),
            cc: cc.map((r) => r.id),
          },
          approvals: approvers.map((a) => a.id),
          signatures: finalSigner ? [finalSigner.id] : [],
          document_type: letterType,
          priority: importance,
        };

        // source_correspondence_id и link_type передаём только вместе.
        if (sourceCorrespondenceId != null && linkType) {
          requestPayload.source_correspondence_id = Number(sourceCorrespondenceId);
          requestPayload.link_type = linkType;
        }

        if (id) saveDraft(requestPayload, { suppressToast: true });
      },

      onError: () =>
        setFinalSigner((prev) => (prev ? { ...prev, dsLoading: false } : null)),
    },
  });

  const { mutate: approvalsConfirm } = useMutationQuery<any, any>({
    url: (req) =>
      ApiRoutes.INTERNAL_APPROVALS_CONFIRM?.replace(
        ":id",
        String(req.approvalRecordId),
      ),
    method: "PATCH",
    messages: {
      success: "Решение по согласованию сохранено",
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        ApiRoutes.GET_INTERNAL_BY_ID?.replace(":id", String(id || "")),
        correspondencePermissionsKey(String(id || "")),
      ],
    },
    queryOptions: {
      onSuccess: (res, req) => {
        const item = res?.data || res?.item;
        setApprovers((prev) =>
          prev.map((a) =>
            a.approvalRecordId === req.approvalRecordId
              ? {
                  ...a,
                  approved: (item?.status || req.status) === "approved",
                  status: item?.status || req.status,
                  note: item?.note !== undefined ? item.note : req.note,
                  comment: item?.note !== undefined ? (item.note || "") : a.comment,
                  decided_at: item?.decided_at || new Date().toISOString(),
                  dsApplied: (item?.status || req.status) === "approved",
                  dsLoading: false,
                }
              : a,
          ),
        );
      },
      onError: (_, req) => {
        setApprovers((prev) =>
          prev.map((a) =>
            a.approvalRecordId === req.approvalRecordId
              ? { ...a, dsLoading: false }
              : a,
          ),
        );
      },
    },
  });

  // Печать документа: используем скрытый iframe и @page margin:0, чтобы браузер
  // НЕ добавлял свои колонтитулы (URL, дату, заголовок). Поля задаём через padding.
  // Единый источник постраничной разбивки: берём УЖЕ разложенный в редакторе DOM
  // и группируем блоки по страницам по их offsetTop. Так и предпросмотр, и печать
  // получают ровно то же содержимое на тех же страницах, что и холст редактора.
  // Каждый блок позиционируем АБСОЛЮТНО по его реальному offsetTop в редакторе —
  // так предпросмотр/печать не перетекают контент заново (без распорок), а
  // повторяют холст пиксель-в-пиксель. Иначе блоки «сползали» и часть текста
  // (например, нижний колонтитул) терялась при печати.
  const getEditorPages = useCallback((options?: { readOnly?: boolean }): string[] => {
    const editor = editorRef.current;
    if (!editor) return [];
    // «Голый» текст верхнего уровня заворачиваем в блок, иначе он не попадёт ни
    // на одну страницу (перебираем только element-детей) и пропадёт из
    // предпросмотра/печати — как было с одиночной цифрой, набранной в редактор.
    // Эскизы области навигации просят readOnly: они пересобираются прямо во
    // время набора, а обёртка двигает узлы и может утащить за собой каретку.
    // Такой «голый» текст — редкое переходное состояние, в эскиз он не попадёт.
    if (!options?.readOnly) wrapBareTopLevelNodes(editor);
    const contentWidth = PAGE_WIDTH - marginLeft - marginRight;
    const buckets: string[][] = [];
    Array.from(editor.children).forEach((child) => {
      const el = child as HTMLElement;
      if (
        el.hasAttribute(SPACER_ATTR) ||
        el.hasAttribute(PAGE_BREAK_ATTR) ||
        el.hasAttribute(STAMP_ATTR) ||
        getComputedStyle(el).position === "absolute"
      )
        return;
      const top = el.offsetTop;
      const page = Math.max(0, Math.floor(top / PAGE_STRIDE));
      // y внутри листа = поле сверху + смещение от начала страницы
      const localTop = PAGE_PAD_V + (top - page * PAGE_STRIDE);
      // вертикальные внешние отступы обнуляем — позицию задаёт top
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.marginTop = "0";
      clone.style.marginBottom = "0";
      (buckets[page] ||= []).push(
        `<div style="position:absolute;left:${marginLeft}px;top:${localTop}px;width:${contentWidth}px;box-sizing:border-box;">${clone.outerHTML}</div>`,
      );
    });
    const pages: string[] = [];
    for (let i = 0; i < buckets.length; i++)
      pages.push((buckets[i] || []).join(""));
    return pages.length ? pages : [""];
  }, [PAGE_WIDTH, marginLeft, marginRight, PAGE_PAD_V, PAGE_STRIDE]);

  const getEditorPagesReadOnly = useCallback(
    () => getEditorPages({ readOnly: true }),
    [getEditorPages],
  );

  // Позиция вшитого штампа ЭЦП относительно своей страницы (для печати).
  const getEmbeddedStampInfo = useCallback(() => {
    const editor = editorRef.current;
    const stamp = editor?.querySelector<HTMLElement>(`[${STAMP_ATTR}]`);
    if (!stamp) return null;
    const x = parseFloat(stamp.style.left) || 0;
    const top = parseFloat(stamp.style.top) || 0;
    const pageIndex = Math.max(0, Math.floor(top / PAGE_STRIDE));
    return {
      pageIndex,
      x,
      y: top - pageIndex * PAGE_STRIDE,
      width: stamp.style.width || "377px",
      html: stamp.innerHTML,
    };
  }, [PAGE_STRIDE]);

  // Штамп ЭЦП для предпросмотра: уже вшитый рисунок ИЛИ плавающий плейсхолдер до
  // подписания. Считаем из той же live-DOM, что и страницы, — поэтому штамп в
  // предпросмотре всегда совпадает со страницей холста.
  const getPreviewStamp = useCallback(():
    | { pageIndex: number; x: number; y: number; width: string; html?: string }
    | null => {
    const embedded = getEmbeddedStampInfo();
    if (embedded) return embedded;
    if (stampVisible && finalSigner?.dsApplied) {
      const pageIndex = Math.max(0, Math.floor(stampPos.y / PAGE_STRIDE));
      return {
        pageIndex,
        x: stampPos.x,
        y: stampPos.y - pageIndex * PAGE_STRIDE,
        width:
          typeof stampSize.width === "number"
            ? `${stampSize.width}px`
            : stampSize.width,
      };
    }
    return null;
  }, [
    getEmbeddedStampInfo,
    stampVisible,
    finalSigner,
    stampPos,
    stampSize,
    PAGE_STRIDE,
  ]);

  // Дополняем массив страниц пустыми, чтобы страница со штампом существовала,
  // даже если на ней нет текстовых блоков.
  const padPagesForStamp = (
    pages: string[],
    stamp: { pageIndex: number } | null,
  ) => {
    if (stamp) while (pages.length <= stamp.pageIndex) pages.push("");
    return pages;
  };

  const handlePrint = () => {
    const stamp = getEmbeddedStampInfo();
    printDocumentPages({
      pages: padPagesForStamp(getEditorPages(), stamp),
      stamp,
      isLandscape: orientation === "landscape",
      pageWidth: PAGE_WIDTH,
      pageHeight: PAGE_HEIGHT,
      fontSize,
      marginLeft,
      pagePadV: PAGE_PAD_V,
    });
  };

  const onSaveClick = async () => {
    const editorBody = editorContent || getCleanEditorHtml();

    const requestPayload: any = {
      subject,
      // Раскладку линейки версионируем вместе с телом — иначе после сохранения
      // и переключения версий поля возвращались бы к дефолтным.
      body: withDocLayout(editorBody, docLayout),
      recipients: {
        to: to.map((r) => r.id),
        cc: cc.map((r) => r.id),
      },
      approvals: approvers.map((a) => a.id),
      signatures: finalSigner ? [finalSigner.id] : [],
      folder_id: typeof folder === "number" ? folder : undefined,
      system_folder: typeof folder === "string" ? folder : undefined,
      document_type: letterType,
      priority: importance,
    };

    // source_correspondence_id и link_type передаём только вместе.
    if (sourceCorrespondenceId != null && linkType) {
      requestPayload.source_correspondence_id = Number(sourceCorrespondenceId);
      requestPayload.link_type = linkType;
    }

    saveDraft(requestPayload);
  };

  useLocationStatePrefill({
    id,
    locationState: location.state,
    subject,
    editorContent,
    editorRef,
    applyDocLayout,
    setSubject,
    setEditorContent,
  });

  useSavedDocumentPrefill({
    id,
    initialData,
    setSubject,
    setImportance,
    setLetterType,
    setTo,
    setCc,
    setShowCcField,
    setApprovers,
    setAttachments,
    setDocCreator,
    setFinalSigner,
    setStampVisible,
  });

  useComposeReplyPrefill({
    composeMode,
    sourceLetter,
    composeAppliedRef,
    setSubject,
    setTo,
  });

  useWorkflowPrefill({
    rawWorkflowData,
    setApprovers,
    setFinalSigner,
    setStampVisible,
  });

  const handleFontSize = (size: string) => {
    setShowFontSizeDropdown(false);
    const editor = editorRef.current;
    // Подписанный документ / старая версия — размер шрифта менять нельзя.
    if (!editor || !editor.isContentEditable) return;
    // Набор до смены размера — отдельный шаг истории изменений.
    commitHistoryNow();
    editor.focus();

    // Точный размер для выделенного текста. execCommand("fontSize") умеет
    // только 7 ступеней HTML (small/large/…): 13/14 давали одинаковые 16px, а
    // «16» реально печатала 18px — измерения пагинации расходились с ожидаемым.
    // Ставим ступень-маркер 7, затем переписываем её на точный px-размер.
    const sel = window.getSelection();
    const hasRangeSelection =
      !!sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      editor.contains(sel.anchorNode);
    // Есть выделение → меняем размер ТОЛЬКО выделенного фрагмента (inline-span),
    // базовый размер листа НЕ трогаем (иначе перекрасился бы весь текст).
    // Нет выделения → меняем базовый размер всего листа.
    if (!hasRangeSelection) {
      setFontSize(size);
      return;
    }

    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontSize", false, "7");
    editor
      .querySelectorAll<HTMLElement>('span[style*="font-size"]')
      .forEach((s) => {
        const fs = s.style.fontSize;
        if (fs === "xxx-large" || fs === "-webkit-xxx-large") {
          s.style.fontSize = `${size}px`;
        }
      });
    // Fallback: некоторые движки вместо span со стилем вставляют <font size="7">
    editor.querySelectorAll<HTMLElement>('font[size="7"]').forEach((f) => {
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      while (f.firstChild) span.appendChild(f.firstChild);
      f.replaceWith(span);
    });

    // Немедленная перепагинация с новым размером — без ожидания rAF-цепочки.
    syncEditorAfterDomEdit();
  };

  // HTML без служебных артефактов (распорки/разрезы) — для сохранения и превью
  const getCleanEditorHtml = useCallback(() => {
    const el = editorRef.current;
    if (!el) return "<p></p>";
    return cleanEditorArtifacts(el.innerHTML) || "<p></p>";
  }, []);

  // Постраничная разбивка редактора: сама раскладка живёт в paginateEditorDom,
  // здесь остаётся геометрия листа и запоминание высоты для страховки на
  // ResizeObserver.
  const paginateEditor = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return 1;
    const pages = paginateEditorDom(editor, {
      contentHeight: CONTENT_HEIGHT,
      pageStride: PAGE_STRIDE,
    });
    lastPaginatedHeightRef.current = editor.scrollHeight;
    return pages;
  }, [CONTENT_HEIGHT, PAGE_STRIDE]);
  paginateEditorRef.current = paginateEditor;

  const {
    canUndo,
    canRedo,
    undoEdit,
    redoEdit,
    resetHistory,
    commitHistoryNow,
    scheduleHistoryCommit,
  } = useEditorHistory({
    editorRef,
    paginateEditorRef,
    getCleanEditorHtml,
    setPageCount,
    setEditorContent,
  });

  // Подсветка активных кнопок тулбара: какие форматы применены к текущему
  // выделению/каретке. Обновляется по selectionchange и после execCmd.
  const [activeFmt, setActiveFmt] = useState<Record<string, boolean>>({});
  const refreshActiveFmt = useCallback(() => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    // Выделение вне редактора (или редактор readonly) — гасим всю подсветку.
    if (
      !editor ||
      !editor.isContentEditable ||
      !sel ||
      sel.rangeCount === 0 ||
      !editor.contains(sel.anchorNode)
    ) {
      setActiveFmt((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }
    const q = (cmd: string) => {
      try {
        return document.queryCommandState(cmd);
      } catch {
        return false;
      }
    };
    let block = "";
    try {
      block = (document.queryCommandValue("formatBlock") || "").toLowerCase();
    } catch {
      block = "";
    }
    const next: Record<string, boolean> = {
      bold: q("bold"),
      italic: q("italic"),
      underline: q("underline"),
      strikeThrough: q("strikeThrough"),
      justifyLeft: q("justifyLeft"),
      justifyCenter: q("justifyCenter"),
      justifyRight: q("justifyRight"),
      justifyFull: q("justifyFull"),
      insertUnorderedList: q("insertUnorderedList"),
      insertOrderedList: q("insertOrderedList"),
      h1: block === "h1",
      h2: block === "h2",
    };
    // Меняем стейт только при реальном отличии — selectionchange частит.
    setActiveFmt((prev) => {
      const keys = Object.keys(next);
      const same =
        keys.length === Object.keys(prev).length &&
        keys.every((k) => prev[k] === next[k]);
      return same ? prev : next;
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActiveFmt);
    return () =>
      document.removeEventListener("selectionchange", refreshActiveFmt);
  }, [refreshActiveFmt]);

  // Команды форматирования тулбара. Нативные undo/redo сюда не ходят —
  // история изменений собственная (undoEdit/redoEdit).
  const execCmd = useCallback(
    (command: string, value?: string) => {
      const editor = editorRef.current;
      // contentEditable=false — режим «только чтение» (подписано / старая
      // версия): команды форматирования заблокированы.
      if (!editor || !editor.isContentEditable) return;
      // Незакоммиченный набор — отдельный шаг истории, форматирование — свой.
      commitHistoryNow();
      editor.focus();
      document.execCommand(command, false, value);
      commitHistoryNow();
      // Тулбар-переключение (bold/список/выравнивание) часто НЕ двигает
      // выделение → событие selectionchange не сработает. Обновляем подсветку
      // кнопок вручную сразу после команды.
      refreshActiveFmt();
    },
    [commitHistoryNow, refreshActiveFmt],
  );

  const handleEditorInput = useCallback(
    (e?: React.FormEvent<HTMLDivElement>) => {
    const native = e?.nativeEvent as InputEvent | undefined;
    const inputType = native?.inputType || "";
    const data = native?.data ?? "";
    const isParaBoundary =
      inputType === "insertParagraph" || inputType === "insertLineBreak";

    const editor = editorRef.current;
    if (editor) {
      // Документ очищен полностью: браузер оставляет пустые обёртки с прежним
      // оформлением (<strong>, text-align и т.п.), из-за чего новый текст
      // печатается жирным/со старым выравниванием. Сбрасываем к чистому блоку.
      // Важно: пусто == НЕТ символов вообще (length 0), а не «только пробелы».
      // trim() считал пустыми пробел/табуляцию и стирал их — из-за этого Space
      // в пустом редакторе не срабатывал, а Tab+Space «съедал» табуляцию.
      // НО: Enter/Shift+Enter в пустом холсте создаёт вторую пустую строку
      // (<p><br></p>×2) — тоже textContent="", и сброс схлопывал бы её обратно,
      // из-за чего Enter «не работал» на пустом документе. Для вставки абзаца/
      // переноса сброс не делаем.
      const isEmpty =
        !editor.textContent?.length && !editor.querySelector("img,table,hr");
      if (isEmpty && !isParaBoundary && editor.innerHTML !== "<p><br></p>") {
        editor.innerHTML = "<p><br></p>";
        const sel = window.getSelection();
        const range = document.createRange();
        range.setStart(editor.firstChild as Node, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
    setEditorContent(getCleanEditorHtml());

    // Гранулярность отмены как в Word: обычный набор складывается в один шаг по
    // паузам (scheduleHistoryCommit), но граница слова/абзаца немедленно фиксирует
    // набранное — тогда Ctrl+Z откатывает по словам, а не всю фразу целиком.
    // Enter/Shift+Enter (insertParagraph/insertLineBreak) — тоже граница шага.
    const isWordBoundary =
      inputType === "insertText" && !!data && WORD_BOUNDARY_RE.test(data);
    if (isWordBoundary || isParaBoundary) {
      commitHistoryNow();
    } else {
      // Набор текста складывается в шаги истории по паузам.
      scheduleHistoryCommit();
    }
    },
    [getCleanEditorHtml, scheduleHistoryCommit, commitHistoryNow],
  );

  // После ручной правки DOM (слияние через границу, вставка разрыва) сразу
  // перепагинируем синхронно — не дожидаясь rAF-эффекта — и синхронизируем стейт.
  // Важно: setEditorContent может не измениться (clean-HTML тот же), поэтому
  // одной подписки на editorContent здесь недостаточно.
  const syncEditorAfterDomEdit = useCallback(() => {
    setPageCount(paginateEditor());
    setEditorContent(getCleanEditorHtml());
    // Дискретная правка DOM — сразу отдельный шаг истории изменений.
    commitHistoryNow();
  }, [paginateEditor, getCleanEditorHtml, commitHistoryNow]);

  const handleEditorKeyDown = useEditorKeyDown({
    editorRef,
    undoEdit,
    redoEdit,
    syncEditorAfterDomEdit,
    commitHistoryNow,
    execCmd,
  });

  const { insertPageBreak, deletePage, insertFragmentAtCaret } =
    useEditorCommands({
      editorRef,
      pageStride: PAGE_STRIDE,
      syncEditorAfterDomEdit,
      commitHistoryNow,
      setPageToDelete,
    });

  // Закрываем подтверждение удаления, если страниц стало меньше
  useEffect(() => {
    if (pageToDelete !== null && pageToDelete >= pageCount) {
      setPageToDelete(null);
    }
  }, [pageCount, pageToDelete]);

  const {
    importingWord,
    isDraggingWord,
    handleImportWord,
    handleEditorDrop,
    handleEditorDragOver,
    handleEditorDragLeave,
  } = useWordImport({ buildFragmentFromHtml, insertFragmentAtCaret });

  useEditorClipboard({
    editorRef,
    insertFragmentAtCaret,
    syncEditorAfterDomEdit,
    commitHistoryNow,
  });

  useEffect(() => {
    document.execCommand("styleWithCSS", false, "true");
    // Единая модель «абзаца»: Enter должен создавать <p>, а не <div> (Chrome по
    // умолчанию делает <div>, Firefox — <br>). Выравнивает браузеры на <p> —
    // тот же тег, что приходит из вставки/импорта Word (см. модель блоков 4.9).
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, []);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updatePageCount = () => {
      const nextPageCount = paginateEditor();
      if (nextPageCount !== pageCount) {
        setPageCount(nextPageCount);
      }
    };

    // Неисполненный кадр отменяем при каждом новом изменении: при быстрых
    // последовательных вставках/вводе выполняется одна актуальная пагинация,
    // а не очередь устаревших друг за другом.
    const raf = window.requestAnimationFrame(updatePageCount);
    return () => window.cancelAnimationFrame(raf);
  }, [
    editorContent,
    orientation,
    fontSize,
    pageCount,
    paginateEditor,
    marginLeft,
    marginRight,
  ]);

  // Страховка от «пропущенной» пагинации: если высота содержимого изменилась
  // мимо наших обработчиков (загрузилась картинка из Word, внешняя замена
  // innerHTML без изменения стейта, поздний шрифт), а перепагинация не
  // запускалась — текст лёг бы в зазор между листами. Собственные правки
  // пагинатора цикл не создают: после его прохода высота записана в
  // lastPaginatedHeightRef и совпадает с наблюдаемой.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (editor.scrollHeight === lastPaginatedHeightRef.current) return;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        if (editor.scrollHeight === lastPaginatedHeightRef.current) return;
        if (paginateEditorRef.current) {
          setPageCount(paginateEditorRef.current());
        }
      });
    });
    ro.observe(editor);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const picked = Array.from(files);
    // Сбрасываем input сразу: иначе повторный выбор того же файла не даст change.
    e.target.value = "";

    const accepted: AttachedFile[] = [];
    // Лимит общий на письмо, поэтому считаем и уже загруженные вложения.
    let freeSlots = MAX_ATTACHMENTS - attachments.length;

    for (const f of picked) {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
        toast.error(`«${f.name}»: недопустимый формат файла`);
        continue;
      }
      if (f.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
        toast.error(`«${f.name}»: файл больше ${MAX_ATTACHMENT_SIZE_MB} МБ`);
        continue;
      }
      if (freeSlots <= 0) {
        toast.error(`К письму можно прикрепить не больше ${MAX_ATTACHMENTS} файлов`);
        break;
      }
      freeSlots -= 1;
      accepted.push({
        id: `f-${Date.now()}-${f.name}`,
        name: f.name,
        size: formatFileSize(f.size),
        type: ext.toUpperCase() || "FILE",
        // Сам файл держим в стейте до сохранения — он уйдёт на бэкенд
        // вместе с письмом (multipart), отдельной загрузки вложений нет.
        file: f,
      });
    }

    if (accepted.length) setAttachments((prev) => [...prev, ...accepted]);
  };

  const applyFinalDS = async () => {
    if (!id || !finalSigner) return;
    if (!canSignDocument) return;
    // Подписать можно только версию, выбранную «Для подписи». Иначе ЭЦП ушла бы
    // на одну версию, а штамп остался бы на открытой в редакторе другой версии.
    if (!isActiveVersionForSign) return;

    if (!stampVisible) {
      setStampVisible(true);
    }

    setFinalSigner((prev) => (prev ? { ...prev, dsLoading: true } : null));

    try {
      const payloadData = await signaturesPayloadAsync({ action: "sign" });
      if (payloadData?.signature_id && payloadData?.nonce) {
        signaturesConfirm({
          signature_id: payloadData.signature_id,
          nonce: payloadData.nonce,
          method: "simple",
        });
      } else {
        console.error("Отсутствуют signature_id или nonce в ответе");
        setFinalSigner((prev) => (prev ? { ...prev, dsLoading: false } : null));
      }
    } catch (error) {
      console.error("Ошибка при подписании:", error);
      setFinalSigner((prev) => (prev ? { ...prev, dsLoading: false } : null));
    }
  };

  const applyApproverDS = (recordId: string) => {
    if (!canApproveDocument) return;
    const approverObj = approvers.find((a) => a.approvalRecordId === recordId);
    const rawNote = approverObj?.comment?.trim();
    const note = rawNote && rawNote.length > 0 ? rawNote : null;

    setApprovers((prev) =>
      prev.map((a) =>
        a.approvalRecordId === recordId ? { ...a, dsLoading: true } : a,
      ),
    );

    approvalsConfirm({
      approvalRecordId: recordId,
      status: "approved",
      note,
    });
  };

  const toggleApproverComment = (id: string) => {
    setApprovers((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, showCommentInput: !a.showCommentInput } : a,
      ),
    );
  };

  const updateApproverComment = (id: string, comment: string) => {
    setApprovers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, comment } : a)),
    );
  };

  const addApprover = (r: RecipientOption) => {
    setApprovers((prev) => [
      ...prev,
      {
        id: r.id,
        approvalRecordId: undefined,
        name: r.name,
        role: r.org,
        initials: r.initials,
        color: "bg-slate-100 text-slate-700",
        approved: false,
        approving: false,
        comment: "",
        showCommentInput: false,
        dsApplied: false,
        dsLoading: false,
      },
    ]);
  };

  const addIncomingLetter = (letter: any) => {
    const alreadyAdded = attachedIncomingLetters.some(
      (l: any) => l.id === letter.id,
    );
    if (!alreadyAdded) {
      setAttachedIncomingLetters((prev) => [...prev, letter]);
    }
  };

  const removeIncomingLetter = (letterId: string | number) => {
    setAttachedIncomingLetters((prev) =>
      prev.filter((l: any) => l.id !== letterId),
    );
  };

  const handleAttachIncomingLetters = () => {
    if (id && attachedIncomingLetters.length > 0) {
      attachedIncomingLetters.forEach((letter) => {
        attachIncoming({ incoming_id: letter.id });
      });
      setAttachedIncomingLetters([]);
    }
  };

  const handleInsertStamp = () => {
    // Место для ЭЦП можно указывать только на версии, выбранной «Для подписи».
    if (!isActiveVersionForSign) return;
    setStampVisible(true);
    setStampPos({ x: 40, y: 40 });
    setStampSize({
      width: DS_STAMP_DEFAULT_WIDTH,
      height: DS_STAMP_DEFAULT_HEIGHT,
    });
  };

  const { handleStampMouseDown, handleStampResizeMouseDown } = useStampDrag({
    editorRef,
    isDsApplied: finalSigner?.dsApplied,
    gridEnabled,
    pageCount,
    pageStride: PAGE_STRIDE,
    pageGap: PAGE_GAP,
    pagePadV: PAGE_PAD_V,
    stampPos,
    setStampPos,
    stampSize,
    setStampSize,
  });

  // Просмотр вшитого штампа ЭЦП в полном размере (после подписания). Штамп в теле
  // письма — это <img> с data-URI SVG; по клику берём его src и показываем крупно
  // в модалке-оверлее. Ничего в body не добавляем и не исполняем — фича живёт
  // только в слое отображения (как зум в карточке «Подписывающий»).
  const [zoomedStampSrc, setZoomedStampSrc] = useState<string | null>(null);

  const handleCanvasStampZoom = useCallback((e: React.MouseEvent) => {
    const stamp = (e.target as HTMLElement)?.closest?.(
      `[${STAMP_ATTR}]`,
    ) as HTMLElement | null;
    if (!stamp) return;
    const src = stamp.querySelector("img")?.getAttribute("src");
    if (src) setZoomedStampSrc(src);
  }, []);

  useEffect(() => {
    if (!zoomedStampSrc) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setZoomedStampSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedStampSrc]);

  const selectedImportance =
    importanceOptions.find((o) => o.value === importance) ??
    importanceOptions[0] ??
    IMPORTANCE_OPTIONS[1];

  const isSigned = rawWorkflowData?.data?.signatures?.some(
    (sig: any) => sig.status === "signed",
  );

  // Роль без права edit смотрит документ только на чтение — иначе пользователь
  // правил бы текст, который всё равно некуда сохранить.
  const isReadOnly = isSigned || isOldVersionSelected || !canEditDocument;

  // ===== Пересылка: цитата исходного письма в холсте =====
  // «Перенаправить» кладёт входящее письмо прямо в холст (сверху остаётся место
  // под свой текст, ниже разделитель и само письмо) — как это делает Outlook.
  // Исключение — режим просмотра входящего письма: там оригинал уже открыт на
  // боковом холсте, и в основной холст мы не добавляем ничего.
  //
  // Отслеживаем именно ПЕРЕКЛЮЧЕНИЕ режима: вставлять цитату на каждое
  // изменение текста нельзя, иначе она возвращалась бы сразу после того, как
  // пользователь сам её удалил.
  const forwardSyncedModeRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (panelMode !== "forward" || isReadOnly) return;
    const editor = editorRef.current;
    if (!editor || !panelSourceBody) return;

    const modeChanged = forwardSyncedModeRef.current !== showOriginalLetterSides;
    forwardSyncedModeRef.current = showOriginalLetterSides;

    const afterMutation = () => {
      setEditorContent(getCleanEditorHtml());
      if (paginateEditorRef.current) setPageCount(paginateEditorRef.current());
      resetHistory();
    };

    if (showOriginalLetterSides) {
      // Цитата могла приехать из сохранённого черновика — убираем её здесь же,
      // а не только на переключении режима.
      if (removeForwardQuote(editor)) afterMutation();
      return;
    }

    if (!modeChanged || hasForwardQuote(editor)) return;

    const nodes = buildForwardQuoteNodes(
      {
        sender: panelSource?.senderName || panelSource?.creator?.full_name || "",
        date: panelSource?.date || "",
        subject: panelSource?.subject || "",
        inboundNumber: panelSource?.inboundNumber || "",
      },
      panelSourceBody,
    );
    if (!nodes.length) return;

    // Свой текст пишется НАД цитатой, поэтому если холст пуст — заводим пустой
    // абзац сверху и ставим в него курсор (как курсор Outlook при пересылке).
    const ownBlocks = Array.from(editor.children).filter(
      (el) => !(el as HTMLElement).hasAttribute(FWD_ATTR),
    );
    let caretTarget: HTMLElement | null = null;
    if (!ownBlocks.length) {
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));
      editor.insertBefore(p, editor.firstChild);
      caretTarget = p;
    }
    nodes.forEach((n) => editor.appendChild(n));
    afterMutation();

    if (caretTarget) {
      const range = document.createRange();
      range.setStart(caretTarget, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [
    panelMode,
    isReadOnly,
    showOriginalLetterSides,
    panelSourceBody,
    panelSource?.senderName,
    panelSource?.creator?.full_name,
    panelSource?.date,
    panelSource?.subject,
    panelSource?.inboundNumber,
    editorContent,
    getCleanEditorHtml,
    resetHistory,
  ]);

  const activeSignatures =
    rawWorkflowData?.data?.signatures?.filter(
      (sig: any) => sig.status !== "revoked",
    ) || [];

  const allSignaturesSigned =
    activeSignatures.length > 0
      ? activeSignatures.every((sig: any) => sig.status === "signed")
      : false;


  useEffect(() => {
    if (allVersions.length === 0) return;
    const targetVersion = allVersions[allVersions.length - 1];

    const isNewVersionId = autoLoadedLatestRef.current !== targetVersion.id;
    autoLoadedLatestRef.current = targetVersion.id;
    setActiveVersionId(targetVersion.id);

    // Раскладку подтягиваем только вместе с новой версией. На обычном рефетче
    // (тот же id) её трогать нельзя — затёрли бы несохранённые правки линейки.
    if (isNewVersionId) applyDocLayout(targetVersion.layout);

    if (editorRef.current && targetVersion.content) {
      const currentCleanHtml = cleanEditorArtifacts(
        editorRef.current.innerHTML,
      );
      const incomingCleanHtml = cleanEditorArtifacts(targetVersion.content);

      if (isNewVersionId && currentCleanHtml !== incomingCleanHtml) {
        editorRef.current.innerHTML = targetVersion.content;
        setEditorContent(targetVersion.content);
        // Пагинируем синхронно, не дожидаясь rAF-цепочки от setEditorContent:
        // она может не сработать (React пропускает рендер при равном значении
        // стейта), а в свежезагруженном теле нет распорок — без немедленной
        // пагинации текст первого рендера ложится в зазор между листами.
        if (paginateEditorRef.current) {
          setPageCount(paginateEditorRef.current());
        }
        // Загружено другое содержимое — прежняя история изменений неприменима.
        resetHistory();
      }
    }

    // ХАК: Если документ только открыли и ни одна версия еще не выбрана для подписи
    // (проверяем по ответу, например, если у всех элементов is_selected === false)
    const hasSelected = allVersions.some((v: any) => v.is_selected);
    if (!hasSelected && targetVersion.id) {
      selectVersionForSign({ versionId: targetVersion.id });
    }
  }, [allVersions]);

  if (sent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-10 h-screen w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center gap-4 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Письмо отправлено
          </h2>
          <p className="text-sm text-slate-500">
            Ваше письмо было успешно подписано и отправлено получателям.
          </p>
          <button
            onClick={onBack}
            className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Вернуться назад
          </button>
        </motion.div>
      </div>
    );
  }

  const UserDropdown = ({
    isOpen,
    onSelect,
    onClose,
    search,
  }: {
    isOpen: boolean;
    onSelect: (user: RecipientOption) => void;
    onClose: () => void;
    search: string;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] overflow-y-auto max-h-60"
        >
          {loadingUsers ? (
            <div className="p-4 text-sm text-center text-slate-400">
              Загрузка...
            </div>
          ) : availableUsers.length > 0 ? (
            availableUsers.slice(0, 15).map((r) => (
              <button
                key={r.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(r);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    r.color,
                  )}
                >
                  {r.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-500">{r.org}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-center text-slate-400">
              Ничего не найдено
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={rootScrollRef}
      className="flex-1 overflow-y-auto bg-[#F8FAFC] h-screen w-full flex flex-col"
    >
      {showPreview && (
        <PreviewModal
          subject={subject}
          editorHtml={editorContent}
          pages={previewPages}
          stamp={previewStamp}
          orientation={orientation}
          fontSize={Number(fontSize) || 14}
          onClose={() => setShowPreview(false)}
          stampVisible={stampVisible && !!finalSigner?.dsApplied}
          stampPos={stampPos}
          stampSize={stampSize}
          stampSignerName={finalSigner?.name || "Неизвестно"}
          stampCertSerial={`SN-2026-${finalSigner?.initials}-84201`}
          stampSignedAt="03.02.2026"
          stampValidUntil="аз 20.03.2025 то 20.03.2026"
          attachments={attachments}
        />
      )}

      {/* Просмотр вшитого штампа ЭЦП в полном размере (после подписания). Портал
          в body — чтобы fixed-оверлей не смещался transform'ами предков.
          Закрытие — по фону, крестику или Escape. */}
      <StampZoomOverlay
        src={zoomedStampSrc}
        onClose={() => setZoomedStampSrc(null)}
      />

      <header className="bg-white border-b border-slate-200 px-6 py-4 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              Создание письма
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
              Черновик
            </span>
          </div>
        </div>
      </header>

      <div className="w-full py-6 px-6">
        <ScreenActionsBar
          onBack={onBack}
          onPreview={() => {
            const stamp = getPreviewStamp();
            setPreviewPages(padPagesForStamp(getEditorPages(), stamp));
            setPreviewStamp(stamp);
            setShowPreview(true);
          }}
          onPrint={handlePrint}
          onSaveClick={onSaveClick}
          onDecline={handleDeclineClick}
          onCancelSign={() => setShowCancelSignConfirm(true)}
          onSend={() => {
            if (!to.length || !subject.trim() || isSending || isAlreadySent)
              return;
            setShowSendConfirm(true);
          }}
          to={to}
          subject={subject}
          isSaving={isSaving}
          isOldVersionSelected={isOldVersionSelected}
          isSigned={isSigned}
          isAlreadySent={isAlreadySent}
          isSending={isSending}
          canDecline={canDecline}
          canSave={canEditDocument}
          canSend={canSendDocument}
          canCancelSign={canCancelSignature}
          allSignaturesSigned={allSignaturesSigned}
          hasDocId={!!id}
        />

        {panelMode && panelSource && (
          <OriginalLetterPanel
            mode={panelMode}
            sender={
              panelSource.senderName || panelSource.creator?.full_name || "—"
            }
            date={panelSource.date || "—"}
            status={panelSource.status || ""}
            priority={panelSource.priority}
            inboundNumber={panelSource.inboundNumber || "—"}
            subject={panelSource.subject || ""}
            body={panelSourceBody}
            sourceId={panelSource.id}
          />
        )}

        <RelatedDocsAccordion
          relatedDocuments={relatedDocs}
          currentDoc={{
            id: id || initialData?.item?.id,
            kind: "outgoing",
            date: initialData?.item?.doc_date || initialData?.item?.created_at,
            reg_number: initialData?.item?.reg_number,
            subject: subject || initialData?.item?.subject,
          }}
        />

        <div className="w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <DocumentMetaToggle
                formExpanded={formExpanded}
                onToggle={() => setFormExpanded((v) => !v)}
                letterType={letterType}
                letterTypeOptions={letterTypeOptions}
                subject={subject}
              />
              <AnimatePresence>
                {formExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-visible"
                  >
                    <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                    Тип
                  </label>
                  <LetterTypeSelect
                    letterType={letterType}
                    setLetterType={setLetterType}
                    showLetterTypeDropdown={showLetterTypeDropdown}
                    setShowLetterTypeDropdown={setShowLetterTypeDropdown}
                    letterTypeOptions={letterTypeOptions}
                  />
                  <ImportanceSelect
                    importance={importance}
                    setImportance={setImportance}
                    showImportanceDropdown={showImportanceDropdown}
                    setShowImportanceDropdown={setShowImportanceDropdown}
                    importanceOptions={importanceOptions}
                    selectedImportance={selectedImportance}
                  />
                </div>
              </div>

              <RecipientField
                wrapperClassName="px-6 pt-5 pb-4 border-b border-slate-100 overflow-visible z-20"
                label="Кому"
                placeholder="Поиск получателя..."
                onPickFromRegistry={handleOpenRecipientModal}
                recipients={to}
                onRemove={(r) =>
                  setTo((prev) => prev.filter((x) => x.id !== r.id))
                }
                search={toSearch}
                onSearchChange={(e) => {
                  setToSearch(e.target.value);
                  setSearchParams({ query: e.target.value });
                  setShowToDropdown(true);
                }}
                onSearchFocus={() => {
                  setSearchParams({ query: toSearch });
                  setShowToDropdown(true);
                }}
                onSearchBlur={() =>
                  setTimeout(() => setShowToDropdown(false), 150)
                }
                dropdown={
                  <UserDropdown
                    isOpen={showToDropdown}
                    search={toSearch}
                    onClose={() => setShowToDropdown(false)}
                    onSelect={(u) => {
                      setTo([...to, u]);
                      setToSearch("");
                      setSearchParams({ query: "" });
                      setShowToDropdown(false);
                    }}
                  />
                }
              >
                <button
                  onClick={() => setShowCcField((v) => !v)}
                  className="text-xs text-blue-600 cursor-pointer font-semibold hover:text-blue-800 transition-colors pt-2 flex-shrink-0"
                >
                  {showCcField ? "- Скрыть копию" : "+ Копия"}
                </button>
              </RecipientField>

              <AnimatePresence>
                {showCcField && (
                  <RecipientField
                    wrapperClassName="px-6 pb-4 border-b border-slate-100 overflow-visible z-10"
                    label="Копия"
                    placeholder="Поиск получателя копии..."
                    onPickFromRegistry={handleOpenRecipientModal}
                    recipients={cc}
                    onRemove={(r) =>
                      setCc((prev) => prev.filter((x) => x.id !== r.id))
                    }
                    search={ccSearch}
                    onSearchChange={(e) => {
                      setCcSearch(e.target.value);
                      setSearchParams({ query: e.target.value });
                      setShowCcDropdown(true);
                    }}
                    onSearchFocus={() => {
                      setSearchParams({ query: ccSearch });
                      setShowCcDropdown(true);
                    }}
                    onSearchBlur={() =>
                      setTimeout(() => setShowCcDropdown(false), 150)
                    }
                    dropdown={
                      <UserDropdown
                        isOpen={showCcDropdown}
                        search={ccSearch}
                        onClose={() => setShowCcDropdown(false)}
                        onSelect={(u) => {
                          setCc([...cc, u]);
                          setCcSearch("");
                          setSearchParams({ query: "" });
                          setShowCcDropdown(false);
                        }}
                      />
                    }
                  />
                )}
              </AnimatePresence>

              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-500 w-20 flex-shrink-0">
                    Тема
                  </label>
                  <input
                    type="text"
                    placeholder="Укажите тему письма..."
                    className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 outline-none focus:outline-none"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <AttachmentsField
                attachments={attachments}
                onPreview={setPreviewAttachment}
                onRemove={(file) =>
                  setAttachments((prev) => prev.filter((f) => f.id !== file.id))
                }
                isReadOnly={isReadOnly}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Липкая шапка редактора: тулбар форматирования, панель разделов
                  и пагинация входящего письма прилипают к верху экрана при
                  прокрутке — форматирование и разделы всегда под рукой. Общий
                  sticky-контейнер, чтобы полосы не накладывались друг на друга. */}
              <div ref={stickyHeaderRef} className="sticky top-0 z-[70] bg-white">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-0.5">
                <ToolbarFormatGroup
                  isReadOnly={isReadOnly}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  undoEdit={undoEdit}
                  redoEdit={redoEdit}
                  activeFmt={activeFmt}
                  execCmd={execCmd}
                  fontSize={fontSize}
                  showFontSizeDropdown={showFontSizeDropdown}
                  setShowFontSizeDropdown={setShowFontSizeDropdown}
                  handleFontSize={handleFontSize}
                />
                <ToolbarParagraphGroup
                  isReadOnly={isReadOnly}
                  activeFmt={activeFmt}
                  execCmd={execCmd}
                />
                <ToolbarPageGroup
                  isReadOnly={isReadOnly}
                  insertPageBreak={insertPageBreak}
                  orientation={orientation}
                  setOrientation={setOrientation}
                  importingWord={importingWord}
                  wordInputRef={wordInputRef}
                  handleImportWord={handleImportWord}
                />
                <ToolbarViewToggles
                  rulerEnabled={rulerEnabled}
                  toggleRuler={toggleRuler}
                  isRulerDefault={isRulerDefault}
                  resetRulerMargins={resetRulerMargins}
                  gridEnabled={gridEnabled}
                  toggleGrid={toggleGrid}
                  navPaneEnabled={navPaneEnabled}
                  toggleNavPane={toggleNavPane}
                  hasSectionsToggle={!!id}
                  panelsInToolbar={panelsInToolbar}
                  setPanelsInToolbar={setPanelsInToolbar}
                  hasIncomingSource={!!(panelMode && panelSource)}
                  showOriginalLetterSides={showOriginalLetterSides}
                  toggleOriginalLetterSides={toggleOriginalLetterSides}
                  hasVersions={allVersions.length > 0}
                  showVersionCompareSides={showVersionCompareSides}
                  toggleVersionCompareSides={toggleVersionCompareSides}
                />
              </div>

              {/* Демо-режим: горизонтальная панель разделов под тулбаром.
                  «Цилиндры» открывают те же панели у холста, что и боковые
                  вкладки (боковые вкладки при этом скрыты). */}
              {panelsInToolbar && !!id && (
                <SectionCylindersBar
                  incomingOpen={incomingOpen}
                  setIncomingOpen={setIncomingOpen}
                  handleOpenIncoming={handleOpenIncoming}
                  versionsOpen={versionsOpen}
                  setVersionsOpen={setVersionsOpen}
                  handleOpenVersions={handleOpenVersions}
                  attachmentsCount={attachments.length}
                  attachmentsOpen={attachmentsOpen}
                  setAttachmentsOpen={setAttachmentsOpen}
                  handleOpenAttachments={handleOpenAttachments}
                  signerOpen={signerOpen}
                  setSignerOpen={setSignerOpen}
                  handleOpenSigner={handleOpenSigner}
                  approversOpen={approversOpen}
                  setApproversOpen={setApproversOpen}
                  handleOpenApprovers={handleOpenApprovers}
                />
              )}

              {/* Закреплённая панель пагинации входящего письма — на всю ширину
                  блока, под разделом с кнопками импорта. При прокрутке страницы
                  прилипает к верхнему краю окна и всегда остаётся доступной. */}
              {showOriginalLetterSides && panelMode && panelSource && (
                <IncomingPagerBar
                  sourceId={panelSource.id}
                  originalCurrent={originalCurrent}
                  originalTotal={originalTotal}
                  setOriginalPage={setOriginalPage}
                />
              )}

              <If is={Boolean(showVersionCompareSides && activeVersion)}>
                <VersionComparePagerBar
                  latestVersionNumber={latestVersion?.versionNumber}
                  activeVersionNumber={activeVersion?.versionNumber}
                  activeVersionDate={activeVersion?.date}
                  versionCompareCurrent={versionCompareCurrent}
                  versionCompareTotal={versionCompareTotal}
                  setVersionComparePage={setVersionComparePage}
                />
              </If>
              </div>

              <div
                className="bg-[#E8EAED] overflow-auto rounded-b-2xl relative"
                style={{ minHeight: 420 }}
                {...(!isReadOnly
                  ? {
                      onDrop: handleEditorDrop,
                      onDragOver: handleEditorDragOver,
                      onDragLeave: handleEditorDragLeave,
                    }
                  : {})}
              >
                {/* Подсказка при перетаскивании .docx в редактор */}
                {isDraggingWord && !isReadOnly && (
                  <div className="absolute inset-0 z-[60] m-3 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/80 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-2 text-blue-700">
                      <FileType size={32} />
                      <span className="text-sm font-semibold">
                        Отпустите, чтобы импортировать документ Word
                      </span>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "py-8 px-8 flex justify-center items-start gap-12 w-full",
                  (showOriginalLetterSides || showVersionCompareSides) && "min-w-max"
                )}>
                  {/* Область навигации пришвартована слева от листа, как в Word.
                      Обёртка нужна для sticky-эмуляции (см. эффект ниже). */}
                  {navPaneEnabled && (
                    <div ref={navPaneWrapRef} className="order-0 shrink-0">
                      <NavigationPane
                        onClose={() => toggleNavPane(false)}
                        editorRef={editorRef}
                        scrollerRef={rootScrollRef}
                        headerRef={stickyHeaderRef}
                        canvasRef={pageCanvasRef}
                        editorContent={editorContent}
                        pageCount={pageCount}
                        pageStride={PAGE_STRIDE}
                        pageWidth={PAGE_WIDTH}
                        pageHeight={PAGE_HEIGHT}
                        fontSize={Number(fontSize) || 14}
                        getPages={getEditorPagesReadOnly}
                      />
                    </div>
                  )}

                  <If is={Boolean(showVersionCompareSides && activeVersion)}>
                    <div ref={versionCompareCanvasWrapRef} className="shrink-0 order-2">
                      <OriginalLetterCanvas
                        sheets={versionCompareSheets.pages}
                        stamp={versionCompareSheets.stamp}
                        page={versionCompareCurrent}
                        fitToViewport={pageCount > 1}
                      />
                    </div>
                  </If>

                  <If is={Boolean(showOriginalLetterSides && panelMode && panelSource)}>
                    <div ref={originalCanvasWrapRef} className="shrink-0 order-2">
                      <OriginalLetterCanvas
                        sheets={originalSheets.pages}
                        stamp={originalSheets.stamp}
                        page={originalCurrent}
                        fitToViewport={pageCount > 1}
                      />
                    </div>
                  </If>

                  <div className="order-1 flex flex-col items-center">
                  {rulerEnabled && (
                    <EditorRuler
                      pageWidth={PAGE_WIDTH}
                      marginLeft={marginLeft}
                      marginRight={marginRight}
                      onChange={(side, value) =>
                        side === "left"
                          ? setMarginLeft(value)
                          : setMarginRight(value)
                      }
                    />
                  )}
                  <div
                    ref={pageCanvasRef}
                    className="relative"
                    style={{
                      width: PAGE_WIDTH,
                      height: pageCount * PAGE_STRIDE - PAGE_GAP,
                      padding: `${PAGE_PAD_V}px ${marginRight}px ${PAGE_PAD_V}px ${marginLeft}px`,
                      fontFamily: "Times New Roman, serif",
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.8,
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  >
                    {Array.from({ length: pageCount }, (_, index) => (
                      <EditorPageSheet
                        key={index}
                        index={index}
                        pageCount={pageCount}
                        pageStride={PAGE_STRIDE}
                        pageHeight={PAGE_HEIGHT}
                        isReadOnly={isReadOnly}
                        pageToDelete={pageToDelete}
                        deletePage={deletePage}
                        setPageToDelete={setPageToDelete}
                      />
                    ))}
                    {/* Сетка живёт в системе координат холста, а не листа: у
                        листа есть 1px рамка, и вложенная сетка съезжала бы на
                        неё относительно колонки набора и маркеров линейки.
                        Идёт после листов и до редактора — поверх белой бумаги,
                        но под текстом. В предпросмотр и печать не попадает: они
                        собираются только из содержимого редактора. */}
                    {gridEnabled &&
                      Array.from({ length: pageCount }, (_, index) => (
                        <PageGrid
                          key={`grid${index}`}
                          left={marginLeft}
                          top={index * PAGE_STRIDE + PAGE_PAD_V}
                          width={PAGE_WIDTH - marginLeft - marginRight}
                          height={CONTENT_HEIGHT}
                        />
                      ))}
                    <EditorSurface
                      editorRef={editorRef}
                      isReadOnly={isReadOnly}
                      contentHeight={CONTENT_HEIGHT}
                      fontSize={fontSize}
                      onInput={handleEditorInput}
                      onKeyDown={handleEditorKeyDown}
                      onClick={handleCanvasStampZoom}
                    />

                    {/* Плавающий плейсхолдер ЭЦП - виден ТОЛЬКО ДО подписания.
											Показывает реальный рисунок ЭЦП фиксированного размера,
											который сохранится в документе при нажатии "Подписать". */}
                    {stampVisible && finalSigner && !finalSigner.dsApplied && (
                      <StampPlaceholder
                        stampRef={stampRef}
                        onMouseDown={handleStampMouseDown}
                        onResizeMouseDown={handleStampResizeMouseDown}
                        marginLeft={marginLeft}
                        pagePadV={PAGE_PAD_V}
                        stampPos={stampPos}
                        stampSize={stampSize}
                        signerName={finalSigner.name}
                        signerInitials={finalSigner.initials}
                      />
                    )}
                    {!!id && (
                      <div
                        ref={panelsGroupRef}
                        className="font-sans!"
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
                        <ApproversPanel
                          isOpen={approversOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenApprovers}
                          onClose={() => setApproversOpen(false)}
                          approvers={approvers}
                          onAddApprover={addApprover}
                          onRemoveApprover={(approverId) =>
                            setApprovers((prev) => prev.filter((a) => a.id !== approverId))
                          }
                          availableUsers={availableUsers}
                          inviteApprover={inviteApprover}
                          isApproverInviting={isApproverInviting}
                          applyApproverDS={applyApproverDS}
                          toggleApproverComment={toggleApproverComment}
                          updateApproverComment={updateApproverComment}
                          docId={id}
                          canApprove={canApproveDocument}
                          currentUserId={currentUserId}
                        />
                        <SignerPanel
                          isOpen={signerOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenSigner}
                          onClose={() => setSignerOpen(false)}
                          finalSigner={finalSigner}
                          onAssignSigner={(r) =>
                            setFinalSigner({
                              id: r.id,
                              name: r.name,
                              role: r.org,
                              initials: r.initials,
                              color: "bg-purple-100 text-purple-700",
                              dsApplied: false,
                              dsLoading: false,
                              isInvited: false,
                            })
                          }
                          assignSelfAsSigner={assignSelfAsSigner}
                          inviteSigner={inviteSigner}
                          isSignerInviting={isSignerInviting}
                          applyFinalDS={applyFinalDS}
                          isActiveVersionForSign={isActiveVersionForSign}
                          stampVisible={stampVisible}
                          setStampVisible={setStampVisible}
                          handleInsertStamp={handleInsertStamp}
                          availableUsers={availableUsers}
                          isSigned={isSigned}
                          docCreator={docCreator}
                          docId={id}
                          canSign={canSignDocument}
                        />
                        <IncomingLettersPanel
                          isOpen={incomingOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenIncoming}
                          onClose={() => setIncomingOpen(false)}
                          attachedLetters={attachedIncomingLetters}
                          onAddLetter={addIncomingLetter}
                          onRemoveLetter={removeIncomingLetter}
                          onSaveLetters={handleAttachIncomingLetters}
                          docId={id}
                        />
                        <VersionsPanel
                          isOpen={versionsOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenVersions}
                          onClose={() => setVersionsOpen(false)}
                          versions={allVersions}
                          activeVersionId={activeVersionId}
                          signedVersionId={signedVersionId}
                          onSelectVersion={handleSelectVersion}
                          onSetVersionForSign={handleSetVersionForSign}
                          isSelectingVersion={isSelectingVersion}
                          isSigned={isSigned}
                        />
                        <AttachmentsPanel
                          isOpen={attachmentsOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenAttachments}
                          onClose={() => setAttachmentsOpen(false)}
                          attachments={attachments}
                          onPreview={setPreviewAttachment}
                          onDownload={downloadAttachment}
                          onUpload={() => fileInputRef.current?.click()}
                          onRemove={(file) =>
                            setAttachments((prev) =>
                              prev.filter((f) => f.id !== file.id),
                            )
                          }
                          isReadOnly={isReadOnly}
                        />

                      </div>
                    )}
                  </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

      </div>
      
      <CancelSignatureModal
        isOpen={showCancelSignConfirm}
        onClose={() => setShowCancelSignConfirm(false)}
        onConfirm={handleConfirmCancelSignature}
        isLoading={isCancellingSign}
      />

      <ConfirmationModal
        open={showSendConfirm}
        title="Отправка письма"
        message="Пожалуйста, перед отправкой внимательно проверьте тему письма, список получателей и прикрепленные файлы. Отменить отправку будет невозможно!"
        confirmText="Отправить"
        icon={<Send size={26} strokeWidth={2.2} />}
        iconBg="bg-blue-50 dark:bg-blue-500/10 text-blue-500"
        confirmBtnBg="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25"
        onConfirm={async () => {
          sendCorrespondence({});
          setShowSendConfirm(false);
        }}
        onCancel={() => setShowSendConfirm(false)}
      />

      <RecipientSelectModal
        open={showRecipientModal}
        onClose={() => setShowRecipientModal(false)}
        availableUsers={availableUsers}
        initialTo={to}
        initialCc={cc}
        isLoading={loadingUsers}
        onSearchChange={(val) => setSearchParams({ query: val })}
        onSave={(nextTo, nextCc) => {
          setTo(nextTo);
          setCc(nextCc);
          if (nextCc.length > 0) {
            setShowCcField(true);
          }
          setShowRecipientModal(false);
        }}
      />
      <If is={!!previewAttachment}>
        <FilePreviewModal
          file={createApiFileFromAttachedFile(previewAttachment)}
          onClose={() => setPreviewAttachment(null)}
          unavailableNotice={CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE}
        />
      </If>
      <DeclineReasonModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onConfirm={handleConfirmDecline}
        isLoading={isDeclining}
      />
    </div>
  );
};
