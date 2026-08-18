import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TCorrespondenceAction } from "@entities/correspondence";
import { type AttachedFile } from "@widgets/CreateInternalCorrespondence";
import { type ToolbarSection } from "../EditorToolbar";
import { RegistryItem, TActionId, ACTION_MENU_ITEMS } from "./incomingViewModel";

interface IDataArgs {
  item: RegistryItem;
  canCreateAssignment: boolean;
  canInviteVisor: boolean;
  can: (action: TCorrespondenceAction) => boolean;
  visors: any[];
  isVisorsAvailable: boolean;
  assignmentsCount: number;
  mappedAttachments: AttachedFile[];
  isResolvingBody: boolean;
  documentBody: string;
  senderName: string;
  formattedSentDate: string;
  inboundNumber: string;
  seenMutate: (variables: any) => void;
}

export function useIncomingViewState(data: IDataArgs) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [visorsOpen, setVisorsOpen] = useState(false);
  const [signersOpen, setSignersOpen] = useState(false);
  const [approversOpen, setApproversOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState<number | string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<AttachedFile | null>(null);
  const [showVisorNotice, setShowVisorNotice] = useState(false);

  const [panelsInToolbar, setPanelsInToolbar] = useState(false);

  const rootScrollRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelsGroupRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (data.isResolvingBody) return;
    const scroller = rootScrollRef.current;
    const canvas = canvasRef.current;
    const group = panelsGroupRef.current;
    if (!scroller || !canvas || !group) return;

    const BOT_M = 24;
    const MIN_VISIBLE = 160;

    const update = () => {
      const TOP_M = (stickyHeaderRef.current?.offsetHeight ?? 0) + 12;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      let shift = Math.max(0, TOP_M - canvasTop);
      shift = Math.min(shift, Math.max(0, canvas.offsetHeight - MIN_VISIBLE));
      // Высота — от закреплённой позиции группы (TOP_M), а не от текущей:
      // иначе панель растёт при прокрутке вниз и сжимается при прокрутке вверх.
      const availH = Math.max(200, scroller.clientHeight - TOP_M - BOT_M);
      group.style.setProperty("--icc-panel-max-h", `${availH}px`);
      group.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const canvasRO = new ResizeObserver(update);
    canvasRO.observe(canvas);
    if (stickyHeaderRef.current) canvasRO.observe(stickyHeaderRef.current);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      canvasRO.disconnect();
      group.style.transform = "";
    };
  }, [data.documentBody, data.isResolvingBody, panelsInToolbar]);

  const closeAllPanels = () => {
    setSignersOpen(false);
    setApproversOpen(false);
    setVersionsOpen(false);
    setShowTaskPanel(false);
    setAttachmentsOpen(false);
    setVisorsOpen(false);
  };

  const openSigners = () => {
    closeAllPanels();
    setSignersOpen(true);
  };
  const openApprovers = () => {
    closeAllPanels();
    setApproversOpen(true);
  };
  const openVersions = () => {
    closeAllPanels();
    setVersionsOpen(true);
  };
  const openTask = () => {
    if (!data.canCreateAssignment) {
      if (data.canInviteVisor) openVisors();
      return;
    }
    closeAllPanels();
    setShowTaskPanel(true);
  };
  const openAttachments = () => {
    closeAllPanels();
    setAttachmentsOpen(true);
  };
  const openVisors = () => {
    closeAllPanels();
    setVisorsOpen(true);
  };

  const handleAction = (id: TActionId) => {
    setShowActionMenu(false);

    // Страховка от клика по действию, которого нет у роли пользователя в
    // документе: пункт меню уже задизейблен, но обработчик зовут и по клавише.
    const menuItem = ACTION_MENU_ITEMS.find((action) => action.id === id);
    if (menuItem && !data.can(menuItem.action)) return;

    if (id === "seen") {
      data.seenMutate({});
      return;
    }
    if (id === "visor") {
      openVisors();
      return;
    }
    if (id === "task") {
      if (!data.canCreateAssignment || data.visors.length === 0) {
        setShowVisorNotice(true);
        return;
      }
      openTask();
      return;
    }
    navigate("/modules/correspondence/internal/outgoing/create", {
      state: {
        composeMode: id,
        sourceLetter: {
          id: data.item.id,
          subject: data.item.subject,
          creator: data.item.creator,
          senderName: data.senderName,
          date: data.formattedSentDate,
          status: data.item.status,
          priority: data.item.priority,
          inboundNumber: data.inboundNumber,
          body: data.documentBody,
        },
      },
    });
  };

  const sections: ToolbarSection[] = [
    ...(data.isVisorsAvailable
      ? [
          {
            key: "visors",
            label: "Визирующие",
            dotClass: "bg-violet-500",
            badge: data.visors.length > 0 ? data.visors.length : undefined,
            isOpen: visorsOpen,
            onToggle: () => (visorsOpen ? setVisorsOpen(false) : openVisors()),
          },
        ]
      : []),
    {
      key: "task",
      label: "Поручение",
      dotClass: "bg-indigo-500",
      badge: data.assignmentsCount > 0 ? data.assignmentsCount : undefined,
      isOpen: showTaskPanel,
      disabled: !data.canCreateAssignment,
      hint: data.canCreateAssignment ? undefined : "Поручение доступно после приглашения визирующего",
      onToggle: () => {
        if (!data.canCreateAssignment || data.visors.length === 0) {
          setShowVisorNotice(true);
          return;
        }
        showTaskPanel ? setShowTaskPanel(false) : openTask();
      },
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
      onToggle: () => (approversOpen ? setApproversOpen(false) : openApprovers()),
    },
    {
      key: "attachments",
      label: "Вложения",
      dotClass: "bg-teal-500",
      badge: data.mappedAttachments.length > 0 ? data.mappedAttachments.length : undefined,
      isOpen: attachmentsOpen,
      onToggle: () => (attachmentsOpen ? setAttachmentsOpen(false) : openAttachments()),
    },
  ];

  return {
    showPreview,
    setShowPreview,
    showActionMenu,
    setShowActionMenu,
    actionMenuRef,
    showTaskPanel,
    setShowTaskPanel,
    visorsOpen,
    setVisorsOpen,
    signersOpen,
    setSignersOpen,
    approversOpen,
    setApproversOpen,
    versionsOpen,
    setVersionsOpen,
    attachmentsOpen,
    setAttachmentsOpen,
    detailsOpen,
    setDetailsOpen,
    activeVersionId,
    setActiveVersionId,
    previewAttachment,
    setPreviewAttachment,
    showVisorNotice,
    setShowVisorNotice,
    panelsInToolbar,
    setPanelsInToolbar,
    rootScrollRef,
    stickyHeaderRef,
    canvasRef,
    panelsGroupRef,
    openSigners,
    openApprovers,
    openVersions,
    openTask,
    openAttachments,
    openVisors,
    handleAction,
    sections,
  };
}
