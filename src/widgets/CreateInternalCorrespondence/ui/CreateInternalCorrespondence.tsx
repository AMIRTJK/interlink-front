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
  AUTOSPLIT_ATTR,
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
  sanitizeWordHtml,
  formatFileSize,
  mapServerAttachment,
  downloadAttachment,
  createApiFileFromAttachedFile,
  CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE,
} from "../lib/utils";
import { FilePreviewModal } from "@features/Profile";
import {
  DEFAULT_DOC_LAYOUT,
  RULER_MIN_CONTENT,
  RULER_MIN_MARGIN,
  hasDefaultRulerMargins,
  pageWidthForOrientation,
  splitDocLayout,
  stripDocLayout,
  withDocLayout,
  type DocLayout,
} from "./createInternalCorrespondence/docLayout";
import { EditorRuler } from "./createInternalCorrespondence/EditorRuler";
import { PageGrid } from "./createInternalCorrespondence/PageGrid";
import {
  EDITOR_ATOMIC_TAGS,
  EDITOR_BLOCK_TAGS,
  PAGE_SPLITTABLE_TAGS,
  isPageBreakNode,
  isSpacerNode,
  isStampNode,
} from "./createInternalCorrespondence/editorTags";
import {
  TAB_STEP_CM,
  WORD_BOUNDARY_RE,
  closestLiOf,
  deleteTabBeforeCaret,
  getTextIndentCm,
  makeTabSpacer,
  tabNbspCount,
} from "./createInternalCorrespondence/editorTabs";
import {
  blockAcrossPageBoundary,
  caretAtBlockEnd,
  caretAtBlockStart,
  topLevelBlockOf,
} from "./createInternalCorrespondence/editorBlocks";
import { mergeAcrossBoundary } from "./createInternalCorrespondence/editorMerge";
import {
  charPosAt,
  cleanEditorArtifacts,
  getCaretCharOffset,
  htmlToPlainText,
  removeSpacerSafely,
  restoreCaretCharOffset,
  wrapBareTopLevelNodes,
} from "./createInternalCorrespondence/editorCaret";
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
  truncateToChars,
  dropChars,
  brAtCharBoundary,
  removeLeadingBr,
  type StampInfo,
} from "../../InternalCorrespondenceIncomingView/lib";
import { ApproversPanel } from "./ApproversPanel";
import { SignerPanel } from "./SignerPanel";
import { IncomingLettersPanel } from "./IncomingLettersPanel";
import { VersionsPanel } from "./VersionsPanel";
import { NavigationPane } from "./NavigationPane";
import { AttachmentsPanel } from "./AttachmentsPanel";


let splitGroupSeq = 0;

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
  const pendingSignature = rawWorkflowData?.data?.signatures?.find(
    (sig: any) => sig.status === "pending"
  );
  const isCurrentSigner = pendingSignature && currentUserId && String(currentUserId) === String(pendingSignature.user_id || pendingSignature.user?.id);
  const canDecline = !!pendingSignature && !!isCurrentSigner;

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

  useEffect(() => {
    if (!id && location.state) {
      if (location.state.subject && !subject) {
        setSubject(location.state.subject);
      }
      if (location.state.body && !editorContent) {
        // Префилл может прийти из письма, сохранённого этим редактором, —
        // раскладку из него применяем, а маркер в редактор не пускаем.
        const { layout, body } = splitDocLayout(location.state.body);
        if (layout) applyDocLayout(layout);
        setEditorContent(body);
        if (editorRef.current) {
          editorRef.current.innerHTML = body;
        }
      }
    }
  }, [id, location.state]);

  useEffect(() => {
    if (initialData?.item) {
      const item = initialData.item;

      if (item.subject) setSubject(item.subject);

      // ВАЖНО: тело письма в редактор грузит ТОЛЬКО эффект истории версий
      // (по allVersions). Если дублировать загрузку здесь, этот эффект
      // срабатывает после пагинации и перезаписывает innerHTML, стирая
      // распорки между страницами — текст «сползает» в зазор после обновления.

      // priority и document_type приходят уже в ключах бэкенда — кладём как есть
      if (item.priority) setImportance(item.priority);
      if (item.document_type) setLetterType(item.document_type);

      if (item.recipients && Array.isArray(item.recipients)) {
        const toUsers: RecipientOption[] = [];
        const ccUsers: RecipientOption[] = [];
        item.recipients.forEach((r: any) => {
          if (!r.user) return;
          const mappedUser = {
            id: String(r.user.id),
            name: r.user.full_name,
            org: r.user.position || r.user.department || "Сотрудник",
            initials: r.user.full_name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join(""),
            color: "bg-blue-100 text-blue-700",
          };
          if (r.type === "to") toUsers.push(mappedUser);
          if (r.type === "cc") ccUsers.push(mappedUser);
        });
        if (toUsers.length > 0) setTo(toUsers);
        if (ccUsers.length > 0) {
          setCc(ccUsers);
          setShowCcField(true);
        }
      }

      if (item.approvals && Array.isArray(item.approvals)) {
        setApprovers(
          item.approvals.map((a: any) => {
            const userData = a.approver || a.user;

            return {
              id: String(userData?.id),
              approvalRecordId: String(a.id),
              isInvited: true,
              name: userData?.full_name || "Неизвестно",
              role: userData?.position || "Сотрудник",
              initials: userData?.full_name
                ? userData.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                : "",
              color: "bg-slate-100 text-slate-700",
              approved: a.status === "approved",
              approving: false,
              comment: a.note || "",
              showCommentInput: false,
              dsApplied: a.status === "approved",
              dsLoading: false,
              status: a.status,
              note: a.note || null,
              decided_at: a.decided_at || null,
            };
          }),
        );
      }

      // Уже сохранённые вложения. Файлы, выбранные пользователем прямо сейчас,
      // оставляем: письмо перезапрашивается и после посторонних действий,
      // и такой рефетч не должен съедать несохранённый выбор.
      if (Array.isArray(item.attachments)) {
        setAttachments((prev) => [
          ...item.attachments.map((a: any) => mapServerAttachment(a, item.id || id)),
          ...prev.filter((a) => a.file),
        ]);
      }

      if (item.creator) {
        setDocCreator(item.creator);
      }

      if (item.signatures && item.signatures.length > 0) {
        const activeSigs = item.signatures.filter((s: any) => s.status !== "revoked");
        const s = activeSigs.length > 0 ? activeSigs[activeSigs.length - 1] : item.signatures[item.signatures.length - 1];
        const isCurrentlySigned = s.status === "signed";
        const isCurrentlyDeclined = s.status === "declined";
        setFinalSigner({
          id: String(s.user.id),
          isInvited: true,
          name: s.user.full_name,
          role: s.user.position || "Сотрудник",
          initials: s.user.full_name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join(""),
          color: "bg-purple-100 text-purple-700",
          dsApplied: isCurrentlySigned,
          dsDeclined: isCurrentlyDeclined,
          declineReason: s.decline_reason || s.reason,
          dsLoading: false,
        });
        if (isCurrentlySigned) {
          setStampVisible(false);
        }
      } else if (item.creator) {

        setFinalSigner({
          id: String(item.creator.id),
          isInvited: false,
          name: item.creator.full_name,
          role: item.creator.position || "Автор документа",
          initials: item.creator.full_name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join(""),
          color: "bg-purple-100 text-purple-700",
          dsApplied: false,
          dsLoading: false,
        });
      }
    }
  }, [initialData]);

  // Предзаполнение при «Ответить»/«Перенаправить» (один раз при монтировании).
  // Ответить → тема «Ответ: …», «Кому» = отправитель входящего письма.
  // Перенаправить → тема «Перенаправление: …», «Кому» остаётся пустым.
  useEffect(() => {
    if (composeAppliedRef.current) return;
    if (!composeMode || !sourceLetter) return;
    composeAppliedRef.current = true;

    setSubject(
      `${composeMode === "reply" ? "Ответ" : "Перенаправление"}: ${
        sourceLetter.subject || ""
      }`,
    );

    if (composeMode === "reply" && sourceLetter.creator?.id != null) {
      const c = sourceLetter.creator;
      const initials = (c.full_name || "")
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      setTo([
        {
          id: String(c.id),
          name: c.full_name || "",
          org: c.position || c.department || "Сотрудник",
          initials,
          color: "bg-blue-100 text-blue-700",
        },
      ]);
    }
  }, [composeMode, sourceLetter]);

  useEffect(() => {
    if (rawWorkflowData?.data) {
      const wfApprovals = rawWorkflowData.data.approvals || [];
      const wfSignatures = rawWorkflowData.data.signatures || [];

      if (wfApprovals.length > 0) {
        setApprovers((prev) => {
          const merged = [...prev];
          wfApprovals.forEach((wfA: any) => {
            const user = wfA.approver || wfA.user;
            if (!user) return;
            const existingIdx = merged.findIndex(
              (a) => a.id === String(user.id),
            );
            if (existingIdx !== -1) {
              merged[existingIdx] = {
                ...merged[existingIdx],
                approvalRecordId: String(wfA.id),
                isInvited: true,
                approved: wfA.status === "approved",
                dsApplied: wfA.status === "approved",
              };
            } else {
              merged.push({
                id: String(user.id),
                approvalRecordId: String(wfA.id),
                isInvited: true,
                name: user.full_name,
                role: user.position || "Сотрудник",
                initials: user.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join(""),
                color: "bg-slate-100 text-slate-700",
                approved: wfA.status === "approved",
                approving: false,
                comment: "",
                showCommentInput: false,
                dsApplied: wfA.status === "approved",
                dsLoading: false,
              });
            }
          });
          return merged;
        });
      }

      if (wfSignatures.length > 0) {
        const activeSigs = wfSignatures.filter((s: any) => s.status !== "revoked");
        const wfS = activeSigs.length > 0 ? activeSigs[activeSigs.length - 1] : wfSignatures[wfSignatures.length - 1];
        const user = wfS.user;
        const isCurrentlySigned = wfS.status === "signed";
        const isCurrentlyDeclined = wfS.status === "declined";

        if (user) {
          setFinalSigner({
            id: String(user.id),
            isInvited: true,
            name: user.full_name,
            role: user.position || "Сотрудник",
            initials: user.full_name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join(""),
            color: "bg-purple-100 text-purple-700",
            dsApplied: isCurrentlySigned,
            dsDeclined: isCurrentlyDeclined,
            declineReason: wfS.decline_reason || wfS.reason,
            dsLoading: false,
          });
          if (isCurrentlySigned) {
            setStampVisible(false);
          }
        }
      }
    }
  }, [rawWorkflowData]);

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

  // Постраничная разбивка редактора. Абзац, не влезающий до конца страницы,
  // делится: влезающие строки остаются, хвост уезжает за распорку на следующий
  // лист (с сохранением разметки; части склеиваются при сохранении). Списки
  // делятся по пунктам, таблицы — по строкам, атомарные блоки переносятся
  // целиком. Курсор сохраняется структурно + сверяется по смещению в символах.
  const paginateEditor = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return 1;

    // --- Функция структурного сохранения курсора ---
    const saveCaretStructure = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode))
        return null;

      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      const offset = range.startOffset;

      if (node === editor) {
        return { blockIndex: 0, path: [], offset: 0 };
      }

      // Находим родительский блок верхнего уровня (прямой потомок editor)
      let topBlock = node;
      while (topBlock && topBlock.parentNode !== editor) {
        topBlock = topBlock.parentNode!;
      }
      if (!topBlock) return null;
      // «Голый» текстовый узел верхнего уровня (например, сразу после вставки
      // plain-text): структурный путь не работает — editor.children содержит
      // только элементы, и индекс блока посчитался бы неверно. Позицию
      // восстановит символьный fallback (getCaretCharOffset) ниже.
      if (topBlock.nodeType !== Node.ELEMENT_NODE) return null;

      // Считаем индекс этого блока среди всех детей, игнорируя распорки spacer
      const children = Array.from(editor.children);
      let blockIndex = 0;
      for (const child of children) {
        if (child === topBlock) break;
        if (!child.hasAttribute(SPACER_ATTR)) {
          blockIndex++;
        }
      }

      // Запоминаем путь от topBlock до целевого узла (node)
      const path: number[] = [];
      let current = node;
      while (current !== topBlock) {
        const parent = current.parentNode;
        if (!parent) break;
        const index = Array.from(parent.childNodes).indexOf(
          current as ChildNode,
        );
        path.unshift(index);
        current = parent;
      }

      return { blockIndex, path, offset };
    };

    // --- Функция структурного восстановления курсора ---
    const restoreCaretStructure = (snapshot: any) => {
      if (!snapshot) return;

      const children = Array.from(editor.children);
      let currentBlock: Element | null = null;
      let nonSpacerCount = 0;

      // Ищем блок по индексу, пропуская сервисные распорки spacers
      for (const child of children) {
        if (child.hasAttribute(SPACER_ATTR)) continue;
        if (nonSpacerCount === snapshot.blockIndex) {
          currentBlock = child;
          break;
        }
        nonSpacerCount++;
      }

      if (!currentBlock) {
        const validBlocks = children.filter(
          (c) => !c.hasAttribute(SPACER_ATTR),
        );
        currentBlock = validBlocks[validBlocks.length - 1] || editor;
      }

      // Спускаемся по сохраненному пути дерева DOM к нужному узлу
      let targetNode: Node = currentBlock;
      for (const idx of snapshot.path) {
        if (targetNode.childNodes[idx]) {
          targetNode = targetNode.childNodes[idx];
        } else {
          targetNode = targetNode.lastChild || targetNode;
          break;
        }
      }

      try {
        const range = document.createRange();
        const maxOffset =
          targetNode.nodeType === Node.TEXT_NODE
            ? targetNode.textContent?.length || 0
            : targetNode.childNodes.length;

        range.setStart(targetNode, Math.min(snapshot.offset, maxOffset));
        range.collapse(true);

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (e) {
        console.error("Ошибка восстановления каретки:", e);
      }
    };

    // Сохраняем положение курсора через структуру
    const caretSnapshot = saveCaretStructure();
    // Эталонный символьный снимок: пагинация переставляет/режет/клеит блоки,
    // НЕ меняя сам текст, поэтому абсолютное смещение в символах инвариантно.
    // Структурный снимок точнее в пустых блоках, но ломается, когда блоки
    // сливаются/разрезаются (сдвигаются индексы) — тогда после структурного
    // восстановления позиция сверяется по символам и чинится fallback'ом.
    const caretChars = getCaretCharOffset(editor);
    const restoreCaretHybrid = () => {
      restoreCaretStructure(caretSnapshot);
      if (caretChars) {
        const after = getCaretCharOffset(editor);
        if (!after || after.offset !== caretChars.offset) {
          restoreCaretCharOffset(editor, caretChars);
        }
      }
    };
    let textMutated = false;

    // 1. Убираем старые распорки и собираем ранее разрезанные блоки обратно
    editor.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => {
      if (removeSpacerSafely(n)) textMutated = true;
    });

    const groups = new Map<string, HTMLElement[]>();
    editor
      .querySelectorAll<HTMLElement>(`[${AUTOSPLIT_ATTR}]`)
      .forEach((el) => {
        const gid = el.getAttribute(AUTOSPLIT_ATTR) || "";
        const arr = groups.get(gid) || [];
        arr.push(el);
        groups.set(gid, arr);
      });
    groups.forEach((pieces) => {
      const first = pieces[0];
      first.removeAttribute(AUTOSPLIT_ATTR);
      for (let k = 1; k < pieces.length; k++) {
        let child = pieces[k].firstChild;
        while (child) {
          first.appendChild(child);
          child = pieces[k].firstChild;
        }
        pieces[k].remove();
      }
      first.normalize();
      textMutated = true;
    });

    // Контент помещается на один лист и нет ручных разрывов
    if (
      editor.scrollHeight <= CONTENT_HEIGHT &&
      !editor.querySelector(`[${PAGE_BREAK_ATTR}]`)
    ) {
      if (textMutated) restoreCaretHybrid();
      lastPaginatedHeightRef.current = editor.scrollHeight;
      return 1;
    }

    // 2. «Голый» текст и инлайн-узлы заворачиваем в блок <p>
    let buf: Node[] = [];
    const flushBuf = () => {
      if (!buf.length) return;
      const div = document.createElement("p");
      buf[0].parentNode?.insertBefore(div, buf[0]);
      buf.forEach((n) => div.appendChild(n));
      buf = [];
      textMutated = true;
    };
    Array.from(editor.childNodes).forEach((node) => {
      const isBlock =
        node.nodeType === Node.ELEMENT_NODE &&
        EDITOR_BLOCK_TAGS.has((node as HTMLElement).tagName);
      if (isBlock) flushBuf();
      else buf.push(node);
    });
    flushBuf();

    const makeSpacer = (h: number) => {
      const s = document.createElement("div");
      s.setAttribute(SPACER_ATTR, "1");
      s.setAttribute("contenteditable", "false");
      s.setAttribute("aria-hidden", "true");
      s.style.height = `${Math.max(0, h)}px`;
      s.style.width = "100%";
      s.style.userSelect = "none";
      s.style.pointerEvents = "none";
      return s;
    };

    // Таблицы — атомарные блоки: их нельзя резать по символам, как абзац.
    // Поэтому таблицу, не помещающуюся на лист, делим по СТРОКАМ: строки, что
    // не влезают до конца страницы, переезжают в таблицу-продолжение (со всеми
    // стилями исходной), между ними ставится распорка. Обе части помечаются
    // AUTOSPLIT_ATTR — при сохранении cleanEditorArtifacts склеит их в одну
    // таблицу. Без этого высокая таблица «перетекала» через границы листов.
    const splitTableByRows = (
      table: HTMLElement,
      usableBottom: number,
      page: number,
      pageStart: number,
    ): boolean => {
      const rows = Array.from(table.querySelectorAll("tr")).filter(
        (tr) => tr.closest("table") === table,
      ) as HTMLElement[];
      if (rows.length < 2) return false;

      // offsetTop у <tr> в разных движках считается относительно <table>, а не
      // редактора — полагаться на него нельзя. Меряем строки через rect и
      // приводим к системе координат редактора (как у table.offsetTop).
      const tableRectTop = table.getBoundingClientRect().top;
      const tableOffsetTop = table.offsetTop;
      const rowBottom = (tr: HTMLElement) => {
        const r = tr.getBoundingClientRect();
        return r.bottom - tableRectTop + tableOffsetTop;
      };

      const splitIdx = rows.findIndex((tr) => rowBottom(tr) > usableBottom + 1);
      if (splitIdx === -1) return false;

      // Даже первая строка не влезает в остаток листа — переносим таблицу
      // целиком на следующую страницу (там доступна полная высота листа).
      if (splitIdx === 0) {
        if (table.offsetTop > pageStart + 2) {
          editor.insertBefore(
            makeSpacer((page + 1) * PAGE_STRIDE - table.offsetTop),
            table,
          );
          return true;
        }
        return false; // одна строка выше целого листа — делить нечем
      }

      const gid = table.getAttribute(AUTOSPLIT_ATTR) || `g${++splitGroupSeq}`;
      table.setAttribute(AUTOSPLIT_ATTR, gid);

      const tail = document.createElement("table");
      Array.from(table.attributes).forEach((a) =>
        tail.setAttribute(a.name, a.value),
      );
      const tbody = document.createElement("tbody");
      tail.appendChild(tbody);
      for (let k = splitIdx; k < rows.length; k++) tbody.appendChild(rows[k]);

      // Убираем опустевшие группы строк, чтобы они не копились при повторных
      // слияниях/разрезаниях на каждой пагинации.
      table.querySelectorAll("tbody, thead, tfoot").forEach((g) => {
        if (g.closest("table") === table && !g.querySelector("tr")) g.remove();
      });

      editor.insertBefore(tail, table.nextSibling);
      const blockBottom = table.offsetTop + table.offsetHeight;
      editor.insertBefore(makeSpacer((page + 1) * PAGE_STRIDE - blockBottom), tail);
      return true;
    };

    // Списки (UL/OL) делим по пунктам <li>, как таблицы по строкам: пункты, не
    // влезшие до конца страницы, переезжают в список-продолжение с теми же
    // атрибутами. Обе части — в одной AUTOSPLIT-группе, при сохранении
    // склеиваются обратно в один список. Раньше высокий список резался
    // посимвольно через textContent и терял всю структуру пунктов.
    const splitListByItems = (
      list: HTMLElement,
      usableBottom: number,
      page: number,
      pageStart: number,
    ): boolean => {
      const items = Array.from(list.children).filter(
        (n): n is HTMLElement => n.tagName === "LI",
      );

      const moveWholeToNextPage = (): boolean => {
        if (list.offsetTop > pageStart + 2) {
          editor.insertBefore(
            makeSpacer((page + 1) * PAGE_STRIDE - list.offsetTop),
            list,
          );
          return true;
        }
        return false;
      };

      if (items.length < 2) return moveWholeToNextPage();

      // offsetTop у <li> считается относительно списка — меряем через rect и
      // приводим к системе координат редактора (как у list.offsetTop).
      const listRectTop = list.getBoundingClientRect().top;
      const listOffsetTop = list.offsetTop;
      const itemBottom = (li: HTMLElement) =>
        li.getBoundingClientRect().bottom - listRectTop + listOffsetTop;

      const splitIdx = items.findIndex(
        (li) => itemBottom(li) > usableBottom + 1,
      );
      if (splitIdx === -1) return false;
      // Даже первый пункт не влезает в остаток листа — переносим целиком.
      if (splitIdx === 0) return moveWholeToNextPage();

      const gid = list.getAttribute(AUTOSPLIT_ATTR) || `g${++splitGroupSeq}`;
      list.setAttribute(AUTOSPLIT_ATTR, gid);

      const tail = list.cloneNode(false) as HTMLElement;
      // Нумерация продолжения OL продолжает исходную, а не начинается с 1.
      if (list.tagName === "OL") {
        const startBase = parseInt(list.getAttribute("start") || "1", 10);
        tail.setAttribute("start", String(startBase + splitIdx));
      }
      for (let k = splitIdx; k < items.length; k++) tail.appendChild(items[k]);

      editor.insertBefore(tail, list.nextSibling);
      const blockBottom = list.offsetTop + list.offsetHeight;
      editor.insertBefore(
        makeSpacer((page + 1) * PAGE_STRIDE - blockBottom),
        tail,
      );
      return true;
    };

    // Деление абзаца по вертикальному бюджету (остатку места на текущей
    // странице) с СОХРАНЕНИЕМ разметки: голова остаётся на месте, хвост уезжает
    // за распорку на следующий лист. Обе части — в одной AUTOSPLIT-группе и при
    // сохранении склеиваются обратно. Так текст перетекает между страницами
    // построчно, как в Word, без больших пустых областей внизу листа. Возвращает
    // false, если в бюджет не влезает ни одной строки.
    const splitBlockToBudget = (
      block: HTMLElement,
      budgetPx: number,
      page: number,
    ): boolean => {
      const total = (block.textContent || "").length;
      if (total < 2 || budgetPx <= 0) return false;

      const template = block.cloneNode(true) as HTMLElement;
      const originalHtml = block.innerHTML;

      const headHtmlFor = (k: number): string => {
        const probe = template.cloneNode(true) as HTMLElement;
        truncateToChars(probe, { left: k });
        return probe.innerHTML;
      };

      // Бинарный поиск числа символов, влезающих в остаток страницы. Меряем на
      // живом блоке (та же ширина/шрифт/позиция), подменяя содержимое.
      let lo = 1;
      let hi = total - 1;
      let best = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        block.innerHTML = headHtmlFor(mid);
        if (block.offsetHeight <= budgetPx) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      if (best < 1) {
        block.innerHTML = originalHtml;
        return false;
      }

      const tail = template.cloneNode(true) as HTMLElement;
      dropChars(tail, { left: best });
      // <br> ровно на границе разреза принадлежит голове (там он невидим);
      // в хвосте он дал бы лишнюю пустую строку в начале страницы.
      if (brAtCharBoundary(template, best)) removeLeadingBr(tail);
      if (!(tail.textContent || "").trim() && !tail.querySelector("br,img")) {
        // Хвост пуст — деление не имеет смысла.
        block.innerHTML = originalHtml;
        return false;
      }

      block.innerHTML = headHtmlFor(best);

      const gid = block.getAttribute(AUTOSPLIT_ATTR) || `g${++splitGroupSeq}`;
      block.setAttribute(AUTOSPLIT_ATTR, gid);
      tail.setAttribute(AUTOSPLIT_ATTR, gid);

      editor.insertBefore(tail, block.nextSibling);
      const blockBottom = block.offsetTop + block.offsetHeight;
      editor.insertBefore(
        makeSpacer((page + 1) * PAGE_STRIDE - blockBottom),
        tail,
      );
      return true;
    };

    // 3. Раскладка по страницам
    let i = 0;
    let guard = 0;
    while (i < editor.children.length && guard < 8000) {
      guard++;
      const block = editor.children[i] as HTMLElement;
      if (block.hasAttribute(SPACER_ATTR)) {
        i++;
        continue;
      }
      if (block.hasAttribute(PAGE_BREAK_ATTR)) {
        const top = block.offsetTop;
        const page = Math.floor(top / PAGE_STRIDE);
        editor.insertBefore(
          makeSpacer((page + 1) * PAGE_STRIDE - top),
          block.nextSibling,
        );
        i += 2;
        continue;
      }
      if (
        block.hasAttribute("data-signature-stamp") ||
        getComputedStyle(block).position === "absolute"
      ) {
        i++;
        continue;
      }
      const top = block.offsetTop;
      const h = block.offsetHeight;
      const page = Math.floor(top / PAGE_STRIDE);
      const pageStart = page * PAGE_STRIDE;
      const usableBottom = pageStart + CONTENT_HEIGHT;
      const overflows = top >= usableBottom || top + h > usableBottom;

      if (!overflows) {
        i++;
        continue;
      }

      const tag = block.tagName;

      // Таблицы паджинируем по строкам (атомарны для посимвольного деления).
      if (tag === "TABLE") {
        // Влезает в лист целиком, но не до конца текущей страницы — переносим.
        if (h <= CONTENT_HEIGHT && top > pageStart + 2) {
          editor.insertBefore(
            makeSpacer((page + 1) * PAGE_STRIDE - top),
            block,
          );
          i++;
          continue;
        }
        // Выше печатной области листа — режем по строкам.
        if (splitTableByRows(block, usableBottom, page, pageStart)) {
          textMutated = true;
        }
        i++;
        continue;
      }

      // Списки делим по пунктам: часть остаётся, хвост уезжает на новый лист.
      if (tag === "UL" || tag === "OL") {
        if (splitListByItems(block, usableBottom, page, pageStart)) {
          textMutated = true;
        }
        i++;
        continue;
      }

      // Блок начинается уже за печатной областью (в зазоре между листами) —
      // сдвигаем его на начало следующей страницы.
      if (top >= usableBottom) {
        editor.insertBefore(makeSpacer((page + 1) * PAGE_STRIDE - top), block);
        i++;
        continue;
      }

      const splittable =
        PAGE_SPLITTABLE_TAGS.has(tag) &&
        !EDITOR_ATOMIC_TAGS.has(tag) &&
        (block.textContent || "").trim().length > 0;

      // Пробуем отрезать влезающую часть блока в остаток текущей страницы:
      // абзац перетекает на следующий лист построчно, как в Word. Раньше блок
      // выше страницы целиком уезжал на следующий лист, оставляя предыдущую
      // страницу почти пустой (например, после смены размера шрифта).
      if (splittable && splitBlockToBudget(block, usableBottom - top, page)) {
        textMutated = true;
        i++;
        continue;
      }

      // Не делится (атомарный, пустой, или в остаток не влезает ни строки) —
      // переносим целиком на следующую страницу.
      if (top > pageStart + 2) {
        editor.insertBefore(makeSpacer((page + 1) * PAGE_STRIDE - top), block);
        i++;
        continue;
      }

      i++;
    }

    // Восстанавливаем позицию курсора: структурно + сверка по символам
    if (textMutated || caretSnapshot || caretChars) {
      restoreCaretHybrid();
    }

    lastPaginatedHeightRef.current = editor.scrollHeight;
    return Math.max(1, Math.ceil(editor.scrollHeight / PAGE_STRIDE));
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

  // Tab — выделяемый табулятор (прогон неразрывных пробелов). Backspace/Delete на
  // границе страниц — управляемое слияние блоков: дефолтное поведение браузера
  // рядом с contenteditable=false распоркой прыгает курсором и теряет текст.
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z — только собственная история. Нативную
      // отмену браузера глушим всегда: её стек разрушен программными правками
      // пагинации и восстанавливает непредсказуемые старые состояния.
      // e.code вместо e.key — чтобы работало и в русской раскладке (Ctrl+Я).
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.code === "KeyZ") {
          e.preventDefault();
          if (e.shiftKey) redoEdit();
          else undoEdit();
          return;
        }
        if (e.code === "KeyY" && !e.shiftKey) {
          e.preventDefault();
          redoEdit();
          return;
        }
      }

      // Shift+Enter — мягкий перенос строки внутри абзаца (soft return), как в
      // Word: один <br>, без завершения абзаца. Перехватываем ради единообразия
      // между браузерами и корректной установки каретки (в конце блока нужен
      // «якорный» <br>, иначе каретка не встаёт на новую строку).
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor || !editor.isContentEditable) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.startContainer)) return;
        range.deleteContents();
        const br = document.createElement("br");
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        const brBlock = topLevelBlockOf(editor, br);
        if (brBlock && caretAtBlockEnd(brBlock, range)) {
          const anchor = document.createElement("br");
          br.after(anchor);
          range.setStartBefore(anchor);
          range.collapse(true);
        }
        selection.removeAllRanges();
        selection.addRange(range);
        syncEditorAfterDomEdit();
        return;
      }

      // Enter на ПУСТОМ пункте списка — выход из списка (как в Word): outdent
      // либо понижает уровень вложенного пункта, либо выносит пункт из списка
      // обычным блоком. Непустые пункты обрабатывает нативный split (Enter не
      // перехватываем — наследование формата идёт через defaultParagraphSeparator).
      if (e.key === "Enter" && !e.shiftKey) {
        const editor = editorRef.current;
        if (editor && editor.isContentEditable) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            if (editor.contains(range.startContainer)) {
              const li = closestLiOf(editor, range.startContainer);
              if (
                li &&
                !(li.textContent || "").trim() &&
                !li.querySelector("img,table")
              ) {
                e.preventDefault();
                commitHistoryNow();
                execCmd("outdent");
                syncEditorAfterDomEdit();
                return;
              }

              // Enter внутри блока, разрезанного пагинацией по границе страницы
              // (data-page-split): нативный split создаёт новый блок, который
              // наследует id группы, и шаг слияния пагинации склеивает половины
              // обратно — перенос «мерцал и откатывался». Делим блок сами и
              // разводим половины по разным группам: всё до курсора остаётся в
              // старой группе (абзац до переноса), курсорный хвост и нижележащие
              // куски получают новый id (абзац после переноса) — слияние их уже
              // не соединит, а пагинация переразложит по страницам заново.
              const block = topLevelBlockOf(editor, range.startContainer);
              const gid = block?.getAttribute(AUTOSPLIT_ATTR) || null;
              if (block && gid && PAGE_SPLITTABLE_TAGS.has(block.tagName)) {
                e.preventDefault();
                commitHistoryNow();

                const pieces = Array.from(
                  editor.querySelectorAll<HTMLElement>(
                    `[${AUTOSPLIT_ATTR}="${gid}"]`,
                  ),
                );
                const k = pieces.indexOf(block);
                const hasBefore = k > 0;
                const hasAfter = k >= 0 && k < pieces.length - 1;

                // Хвост блока (после курсора) уносим в блок-клон.
                const cut = document.createRange();
                cut.setStart(range.startContainer, range.startOffset);
                cut.setEnd(block, block.childNodes.length);
                const next = block.cloneNode(false) as HTMLElement;
                next.appendChild(cut.extractContents());

                // Пустую половину держит placeholder <br> — но только если она не
                // сольётся с соседями по своей группе (иначе лишняя пустая строка).
                if (
                  !hasBefore &&
                  !(block.textContent || "").length &&
                  !block.querySelector("br,img")
                ) {
                  block.appendChild(document.createElement("br"));
                }
                if (
                  !hasAfter &&
                  !(next.textContent || "").length &&
                  !next.querySelector("br,img")
                ) {
                  next.appendChild(document.createElement("br"));
                }

                block.after(next);

                // Разводим группы: старый id — по курсорный блок включительно,
                // новый id — клон next и все нижележащие куски прежней группы.
                const newGid = `g${++splitGroupSeq}`;
                next.setAttribute(AUTOSPLIT_ATTR, newGid);
                for (let j = k + 1; j < pieces.length; j++) {
                  pieces[j].setAttribute(AUTOSPLIT_ATTR, newGid);
                }

                const pos = charPosAt(next, 0);
                const caret = document.createRange();
                caret.setStart(pos.node, pos.offset);
                caret.collapse(true);
                selection.removeAllRanges();
                selection.addRange(caret);

                syncEditorAfterDomEdit();
                return;
              }
            }
          }
        }
      }

      // Tab / Shift+Tab — контекстное поведение как в Word:
      //  • в списке   → изменение уровня пункта (indent/outdent);
      //  • Shift+Tab  → удаление табулятора слева (фокус НЕ уводим из редактора —
      //                 дефолт браузера перенёс бы его на предыдущий элемент);
      //  • иначе      → вставка ВЫДЕЛЯЕМОГО табулятора (прогон неразрывных
      //                 пробелов). В т.ч. в начале абзаца: НЕ используем CSS
      //                 text-indent — он не содержимое и не попадает в Ctrl+A.
      if (e.key === "Tab") {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor || !editor.isContentEditable) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.startContainer)) return;

        // 1) Список — менять уровень пункта
        if (closestLiOf(editor, range.startContainer)) {
          execCmd(e.shiftKey ? "outdent" : "indent");
          return;
        }

        const block = topLevelBlockOf(editor, range.startContainer);

        if (e.shiftKey) {
          // Убрать табулятор слева (или тот, внутри которого стоит каретка).
          if (deleteTabBeforeCaret(range)) {
            selection.removeAllRanges();
            selection.addRange(range);
            syncEditorAfterDomEdit();
            return;
          }
          // Легаси/импорт из Word: уменьшить красную строку, заданную в стиле.
          const indent = getTextIndentCm(block);
          if (block && indent > 0) {
            commitHistoryNow();
            const next = Math.max(0, indent - TAB_STEP_CM);
            block.style.textIndent = next > 0 ? `${next}cm` : "";
            syncEditorAfterDomEdit();
          }
          return;
        }

        // Tab (в т.ч. в начале абзаца) — вставляем ВЫДЕЛЯЕМЫЙ табулятор.
        const blockWasEmpty =
          !!block &&
          !(block.textContent || "").length &&
          !block.querySelector("img,table");
        range.deleteContents();
        const tabNode = makeTabSpacer(tabNbspCount(editor));
        range.insertNode(tabNode);
        // Пустой блок держал placeholder <br> — после вставки табулятора он лишний
        // (иначе под строкой осталась бы пустая строка).
        if (blockWasEmpty && block) {
          block.querySelectorAll(":scope > br").forEach((br) => br.remove());
        }
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
        // Вставка через Range идёт мимо события input — синхронизируем стейт
        // и историю вручную (иначе Tab не попадал ни в тело письма, ни в undo).
        syncEditorAfterDomEdit();
        return;
      }

      // Стрелки на границе страниц: между блоками стоит невидимая распорка
      // (contenteditable=false, большая высота). Вертикальная навигация браузера
      // геометрическая — каретка «проваливается» в пустоту распорки и застревает,
      // требуя второго нажатия. Перехватываем ТОЛЬКО когда каретка на краю блока
      // и за границей действительно есть распорка/разрыв: тогда ставим её в
      // начало/конец соседнего блока. Мид-блочную навигацию не трогаем (caretAt*
      // истинны лишь на первой/последней визуальной строке блока).
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft"
      ) {
        if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
        const editor = editorRef.current;
        if (!editor) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
        const range = sel.getRangeAt(0);
        if (!editor.contains(range.startContainer)) return;
        const block = topLevelBlockOf(editor, range.startContainer);
        if (!block) return;

        const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
        const atEdge = forward
          ? caretAtBlockEnd(block, range)
          : caretAtBlockStart(block, range);
        if (!atEdge) return;

        const neighbour = blockAcrossPageBoundary(block, forward ? "next" : "prev");
        if (!neighbour) return;

        // Список — крайний пункт; атомарный блок (таблица/картинка) отдаём дефолту.
        let target: HTMLElement = neighbour;
        if (neighbour.tagName === "UL" || neighbour.tagName === "OL") {
          const li = forward
            ? neighbour.firstElementChild
            : neighbour.lastElementChild;
          if (!li) return;
          target = li as HTMLElement;
        } else if (EDITOR_ATOMIC_TAGS.has(neighbour.tagName)) {
          return;
        }

        const pos = forward
          ? charPosAt(target, 0)
          : charPosAt(target, (target.textContent || "").length);
        e.preventDefault();
        const r = document.createRange();
        r.setStart(pos.node, pos.offset);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        return;
      }

      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const editor = editorRef.current;
      if (!editor) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      if (!editor.contains(range.startContainer)) return;
      const block = topLevelBlockOf(editor, range.startContainer);
      if (!block) return;

      const setCaret = (node: Node, offset: number) => {
        const r = document.createRange();
        r.setStart(node, offset);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      };

      // Служебные узлы (распорки, печать ЭЦП, пустой текст) рядом с блоком
      const collectBoundary = (
        start: ChildNode | null,
        dir: "prev" | "next",
      ) => {
        const spacers: ChildNode[] = [];
        let n = start;
        while (
          n &&
          (isSpacerNode(n) ||
            isStampNode(n) ||
            (n.nodeType === Node.TEXT_NODE && !(n.textContent || "").trim()))
        ) {
          if (isSpacerNode(n)) spacers.push(n);
          n = dir === "prev" ? n.previousSibling : n.nextSibling;
        }
        return { spacers, stop: n };
      };

      if (e.key === "Backspace") {
        if (!caretAtBlockStart(block, range)) return;
        const { spacers, stop } = collectBoundary(
          block.previousSibling,
          "prev",
        );

        if (isPageBreakNode(stop)) {
          e.preventDefault();
          commitHistoryNow();
          stop.remove();
          spacers.forEach((s) => s.remove());
          syncEditorAfterDomEdit();
          return;
        }

        // Своё слияние блоков и БЕЗ распорок (обычные соседние абзацы на одной
        // странице): дефолт браузера тянет формат из произвольной стороны и
        // ломает разметку. mergeAcrossBoundary вливает текущий блок в приёмник,
        // СОХРАНЯЯ формат приёмника (как в Word). Атомарные блоки (img/table) и
        // <hr> оставляем дефолту — там слияние абзацев неуместно.
        const prevIsMergeable =
          !!stop &&
          stop.nodeType === Node.ELEMENT_NODE &&
          (stop as HTMLElement).tagName !== "HR" &&
          !EDITOR_ATOMIC_TAGS.has((stop as HTMLElement).tagName);
        if (!spacers.length && !prevIsMergeable) return;

        e.preventDefault();
        commitHistoryNow();
        spacers.forEach((s) => s.remove());
        if (stop && stop.nodeType === Node.ELEMENT_NODE) {
          const target = stop as HTMLElement;
          if (target.tagName === "HR") {
            target.remove();
          } else {
            const pos = mergeAcrossBoundary(target, block);
            if (pos) setCaret(pos.node, pos.offset);
          }
        }
        syncEditorAfterDomEdit();
        return;
      }

      if (!caretAtBlockEnd(block, range)) return;
      const { spacers, stop } = collectBoundary(block.nextSibling, "next");

      if (isPageBreakNode(stop)) {
        e.preventDefault();
        commitHistoryNow(); // набор до операции — отдельный шаг истории
        stop.remove();
        spacers.forEach((s) => s.remove());
        syncEditorAfterDomEdit();
        return;
      }

      // Зеркально Backspace: своё слияние со следующим блоком и без распорок.
      const nextIsMergeable =
        !!stop &&
        stop.nodeType === Node.ELEMENT_NODE &&
        (stop as HTMLElement).tagName !== "HR" &&
        !EDITOR_ATOMIC_TAGS.has((stop as HTMLElement).tagName);
      if (!spacers.length && !nextIsMergeable) return;

      e.preventDefault();
      commitHistoryNow(); // набор до операции — отдельный шаг истории
      spacers.forEach((s) => s.remove());
      if (stop && stop.nodeType === Node.ELEMENT_NODE) {
        const nextBlock = stop as HTMLElement;
        if (nextBlock.tagName === "HR") {
          nextBlock.remove();
        } else {
          const pos = mergeAcrossBoundary(block, nextBlock);
          if (pos) setCaret(pos.node, pos.offset);
        }
      }
      syncEditorAfterDomEdit();
    },
    [syncEditorAfterDomEdit, commitHistoryNow, undoEdit, redoEdit, execCmd],
  );

  // Ручной разрыв страницы: текст после курсора начинается с нового листа.
  // Сам маркер невидим (нулевая высота), break-after — для печати/экспорта.
  const insertPageBreak = useCallback(() => {
    const editor = editorRef.current;
    // contentEditable=false означает режим «только чтение» (подписано/старая версия)
    if (!editor || !editor.isContentEditable) return;
    // Набор до разрыва — отдельный шаг истории; сам разрыв зафиксирует
    // syncEditorAfterDomEdit в конце.
    commitHistoryNow();
    editor.focus();

    const breakEl = document.createElement("div");
    breakEl.setAttribute(PAGE_BREAK_ATTR, "1");
    breakEl.setAttribute("contenteditable", "false");
    breakEl.setAttribute("aria-hidden", "true");
    breakEl.style.cssText =
      "height:0;line-height:0;font-size:0;break-after:page;page-break-after:always;user-select:none;-webkit-user-select:none;pointer-events:none;";

    const sel = window.getSelection();
    const range =
      sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)
        ? sel.getRangeAt(0)
        : null;
    const block = range ? topLevelBlockOf(editor, range.startContainer) : null;

    const makeEmptyPara = () => {
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));
      return p;
    };

    let caretNode: Node;

    if (range && block && PAGE_SPLITTABLE_TAGS.has(block.tagName)) {
      // Блок с курсором делим на «до/после»: хвост уезжает на новую страницу.
      // Если блок был частью авторазреза — расформировываем группу, иначе
      // очистка HTML склеит куски обратно поверх ручного разрыва.
      const gid = block.getAttribute(AUTOSPLIT_ATTR);
      if (gid) {
        editor
          .querySelectorAll(`[${AUTOSPLIT_ATTR}="${gid}"]`)
          .forEach((el) => el.removeAttribute(AUTOSPLIT_ATTR));
      }
      const tail = document.createRange();
      tail.setStart(range.endContainer, range.endOffset);
      tail.setEnd(block, block.childNodes.length);
      const frag = tail.extractContents();
      const next = block.cloneNode(false) as HTMLElement;
      next.removeAttribute(AUTOSPLIT_ATTR);
      next.appendChild(frag);
      if (!(next.textContent || "").length && !next.querySelector("br,img")) {
        next.appendChild(document.createElement("br"));
      }
      if (!(block.textContent || "").length && !block.querySelector("br,img")) {
        block.appendChild(document.createElement("br"));
      }
      block.after(breakEl, next);
      caretNode = next;
    } else if (block) {
      // Списки/таблицы не делим — разрыв после всего блока + пустой абзац
      const para = makeEmptyPara();
      block.after(breakEl, para);
      caretNode = para;
    } else if (range) {
      // «Голый» текст на верхнем уровне (до первого Enter) — делим текстовый узел
      let topNode: Node | null = range.startContainer;
      while (topNode && topNode.parentNode !== editor)
        topNode = topNode.parentNode;
      if (topNode && topNode.nodeType === Node.TEXT_NODE) {
        const textNode = topNode as Text;
        const splitAt =
          range.startContainer === textNode
            ? range.startOffset
            : textNode.length;
        const tailText = textNode.splitText(splitAt);
        textNode.after(breakEl);
        if (tailText.length === 0) {
          tailText.remove();
          const para = makeEmptyPara();
          breakEl.after(para);
          caretNode = para;
        } else {
          caretNode = tailText;
        }
      } else {
        const para = makeEmptyPara();
        editor.append(breakEl, para);
        caretNode = para;
      }
    } else {
      const para = makeEmptyPara();
      editor.append(breakEl, para);
      caretNode = para;
    }

    const r = document.createRange();
    r.setStart(caretNode, 0);
    r.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(r);

    syncEditorAfterDomEdit();
  }, [syncEditorAfterDomEdit, commitHistoryNow]);

  // Удаление конкретной страницы: убираем верхнеуровневые блоки, визуально
  // расположенные на ней, плюс ручной разрыв, который её породил. Так не нужно
  // вручную стирать весь текст. Операция обратима через собственную историю
  // изменений (Ctrl+Z), подтверждение оставлено как защита от случайного клика.
  const deletePage = useCallback(
    (pageIndex: number) => {
      const editor = editorRef.current;
      setPageToDelete(null);
      if (!editor || !editor.isContentEditable) return;
      // Правки до удаления страницы — отдельный шаг истории.
      commitHistoryNow();

      const children = Array.from(editor.children);
      const removals: Element[] = [];
      let firstIdx = -1;

      children.forEach((child, idx) => {
        if (isSpacerNode(child)) return; // распорки пересоздаются при пагинации
        // печать ЭЦП и прочие абсолютные элементы не трогаем
        if (
          isStampNode(child) ||
          getComputedStyle(child).position === "absolute"
        )
          return;
        const el = child as HTMLElement;
        const page = Math.floor(
          (el.offsetTop + el.offsetHeight / 2) / PAGE_STRIDE,
        );
        if (page === pageIndex) {
          removals.push(child);
          if (firstIdx === -1) firstIdx = idx;
        }
      });

      // Ручной разрыв, создавший эту страницу, удаляем вместе с её содержимым
      if (firstIdx > 0) {
        let j = firstIdx - 1;
        while (j >= 0 && isSpacerNode(children[j])) j--;
        if (j >= 0 && isPageBreakNode(children[j])) removals.push(children[j]);
      }

      if (!removals.length) return;
      removals.forEach((n) => n.remove());

      // Не оставляем редактор полностью пустым — иначе ломаются курсор/плейсхолдер
      if (
        !editor.textContent?.trim() &&
        !editor.querySelector("img,table,br")
      ) {
        editor.innerHTML = "<div><br></div>";
      }

      syncEditorAfterDomEdit();
    },
    [PAGE_STRIDE, syncEditorAfterDomEdit, commitHistoryNow],
  );

  // Закрываем подтверждение удаления, если страниц стало меньше
  useEffect(() => {
    if (pageToDelete !== null && pageToDelete >= pageCount) {
      setPageToDelete(null);
    }
  }, [pageCount, pageToDelete]);

  // Вставка готового DOM-фрагмента в позицию курсора (или в конец, если фокуса
  // нет). Используется и при Ctrl+V, и при импорте Word-файла, чтобы вставка
  // вела себя одинаково и корректно пересчитывала постраничную разбивку.
  const insertFragmentAtCaret = useCallback(
    (fragment: DocumentFragment) => {
      const editor = editorRef.current;
      if (!editor) return;
      // Набор текста до вставки — отдельный шаг истории; сама вставка
      // зафиксируется в syncEditorAfterDomEdit ниже.
      commitHistoryNow();
      editor.focus();

      const selection = window.getSelection();
      let range: Range;
      if (
        selection &&
        selection.rangeCount > 0 &&
        editor.contains(selection.anchorNode)
      ) {
        range = selection.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      range.deleteContents();

      // Блочный контент (импорт Word, вставка многостраничного документа) должен
      // ложиться ВЕРХНЕУРОВНЕВЫМИ блоками редактора. После очистки (CTRL+A+Delete)
      // редактор сбрасывается в пустой блок-плейсхолдер <div><br></div>, и каретка
      // стоит ВНУТРИ него. Тогда range.insertNode вложил бы все абзацы документа
      // в этот один <div>: постраничная разбивка считает его одним «гигантским»
      // блоком, режет по тексту (теряя форматирование), а печать сваливает всё на
      // первую страницу и обрезает не влезшее (пропадал нижний текст письма).
      // Поэтому, если каретка в пустом плейсхолдере, поднимаем точку вставки на
      // уровень редактора и убираем плейсхолдер.
      const fragmentHasBlocks = Array.from(fragment.childNodes).some(
        (n) =>
          n.nodeType === Node.ELEMENT_NODE &&
          EDITOR_BLOCK_TAGS.has((n as HTMLElement).tagName),
      );
      let placeholder: HTMLElement | null = null;
      if (fragmentHasBlocks && range.startContainer !== editor) {
        const topBlock = topLevelBlockOf(editor, range.startContainer);
        if (
          topBlock &&
          !(topBlock.textContent || "").trim() &&
          !topBlock.querySelector("img,table,hr")
        ) {
          placeholder = topBlock;
          range = document.createRange();
          range.setStartBefore(topBlock);
          range.collapse(true);
        }
      }

      const lastNode = fragment.lastChild;
      range.insertNode(fragment);
      placeholder?.remove();

      // Инлайновые куски вставки, оказавшиеся на верхнем уровне редактора,
      // сразу заворачиваем в блоки: «голые» узлы ломают структурный снимок
      // каретки и постраничную разбивку (см. wrapBareTopLevelNodes).
      wrapBareTopLevelNodes(editor);

      // Курсор после вставленного содержимого
      if (lastNode && editor.contains(lastNode)) {
        const after = document.createRange();
        after.setStartAfter(lastNode);
        after.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(after);
      }

      // Пагинация синхронно, а не через rAF: при серии быстрых вставок каждая
      // следующая ложится в уже разложенный документ с актуальными распорками,
      // а не в «хвост» с устаревшей разметкой — без случайных пустых
      // промежутков и лишних отступов.
      syncEditorAfterDomEdit();
    },
    [syncEditorAfterDomEdit, commitHistoryNow],
  );

  // Превращает очищенный HTML из Word в фрагмент для вставки.
  // Распорки страниц вырезаем — их редактор расставляет сам при пагинации.
  const buildFragmentFromHtml = useCallback((html: string) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    wrapper.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => n.remove());
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    return fragment;
  }, []);

  // Инлайновый фрагмент для вставки однострочного форматированного текста: блоки
  // (p/div/h*/li/…) разворачиваем в их содержимое, чтобы вставка шла В СТРОКУ
  // рядом с курсором, но сохраняла оформление (жирный/курсив/подчёркивание/цвет/
  // размер через span style). Иначе одиночное скопированное слово либо уезжало
  // на новую строку (как блок), либо теряло стили (как голый текст).
  const buildInlineFragmentFromHtml = useCallback((html: string) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    wrapper.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => n.remove());
    const BLOCK_SEL =
      "p,div,h1,h2,h3,h4,h5,h6,li,ul,ol,table,thead,tbody,tr,td,th,blockquote,section,header,footer,pre,figure";
    let guard = 0;
    let block = wrapper.querySelector(BLOCK_SEL);
    while (block && guard++ < 2000) {
      block.replaceWith(...Array.from(block.childNodes));
      block = wrapper.querySelector(BLOCK_SEL);
    }
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    return fragment;
  }, []);

  // Очистка HTML при вставке из Word / PDF / других источников: sanitizeWordHtml
  // убирает служебную разметку Office, переводит размеры pt → px (тот же 96 DPI,
  // что и у А4-холста) и нормализует пробелы — поэтому форматирование совпадает
  // с исходным документом, а текст не выходит за границы листа.
  const handleEditorPaste = useCallback(
    (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const editor = editorRef.current;
      if (!editor || !e.clipboardData) return;

      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");
      const isMultiline = /\r?\n/.test(text.trim());

      const htmlHasText = !!html && !!html.replace(/<[^>]*>/g, "").trim();

      let fragment: DocumentFragment;
      if (html && isMultiline) {
        // Многострочный форматированный контент (документ из Word) — сохраняем
        // структуру и оформление как есть.
        fragment = buildFragmentFromHtml(sanitizeWordHtml(html));
        fragment = buildFragmentFromHtml(sanitizeWordHtml(html));
      } else if (htmlHasText) {
        fragment = buildInlineFragmentFromHtml(sanitizeWordHtml(html));
      } else if (text) {
        fragment = document.createDocumentFragment();
        if (!isMultiline) {
          fragment.appendChild(document.createTextNode(text));
        } else {
          const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
          paragraphs.forEach((para) => {
            const block = document.createElement("p");
            const lines = para.split("\n");
            lines.forEach((line, idx) => {
              block.appendChild(document.createTextNode(line));
              if (idx < lines.length - 1)
                block.appendChild(document.createElement("br"));
            });
            if (!block.textContent)
              block.appendChild(document.createElement("br"));
            fragment.appendChild(block);
          });
        }
      } else {
        return;
      }

      insertFragmentAtCaret(fragment);
    },
    [buildFragmentFromHtml, buildInlineFragmentFromHtml, insertFragmentAtCaret],
  );

  const {
    importingWord,
    isDraggingWord,
    handleImportWord,
    handleEditorDrop,
    handleEditorDragOver,
    handleEditorDragLeave,
  } = useWordImport({ buildFragmentFromHtml, insertFragmentAtCaret });

  // Нативный обработчик вставки: гарантированно отменяет стандартную вставку
  // браузера (иначе контент дублировался — нативная + ручная вставка).
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener("paste", handleEditorPaste);
    return () => editor.removeEventListener("paste", handleEditorPaste);
  }, [handleEditorPaste]);

  // Копирование/вырезание: в буфер кладём ОЧИЩЕННЫЙ фрагмент — без служебной
  // разметки пагинации (распорки/разрезы) и без zero-height блоков. Иначе
  // нативный copy выносил во внешние редакторы/Word внутренние артефакты и
  // «рваное» форматирование. text/plain формируем с переносами абзацев, чтобы
  // вставка в обычные поля не «слипалась». Для cut дополнительно удаляем
  // выделение через собственную логику с фиксацией истории.
  const handleEditorCopyCut = useCallback(
    (e: ClipboardEvent, isCut: boolean) => {
      const editor = editorRef.current;
      const sel = window.getSelection();
      if (!editor || !e.clipboardData || !sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed || !editor.contains(range.commonAncestorContainer))
        return;
      e.preventDefault();
      const holder = document.createElement("div");
      holder.appendChild(range.cloneContents());
      const cleanHtml = cleanEditorArtifacts(holder.innerHTML);
      e.clipboardData.setData("text/html", cleanHtml);
      e.clipboardData.setData("text/plain", htmlToPlainText(cleanHtml));
      if (isCut && editor.isContentEditable) {
        commitHistoryNow();
        range.deleteContents();
        syncEditorAfterDomEdit();
      }
    },
    [commitHistoryNow, syncEditorAfterDomEdit],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onCopy = (e: ClipboardEvent) => handleEditorCopyCut(e, false);
    const onCut = (e: ClipboardEvent) => handleEditorCopyCut(e, true);
    editor.addEventListener("copy", onCopy);
    editor.addEventListener("cut", onCut);
    return () => {
      editor.removeEventListener("copy", onCopy);
      editor.removeEventListener("cut", onCut);
    };
  }, [handleEditorCopyCut]);

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

  const isReadOnly = isSigned || isOldVersionSelected;

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
