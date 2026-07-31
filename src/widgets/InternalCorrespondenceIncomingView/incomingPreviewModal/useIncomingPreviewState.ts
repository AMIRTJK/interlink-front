import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  mapServerAttachment,
  type AttachedFile,
} from "@widgets/CreateInternalCorrespondence";
import { VISOR_INVITE_HINT } from "../model";
import { paginateHtml } from "../lib";
import {
  PreviewApprover,
  ToolbarSection,
  IncomingPreviewModalProps,
} from "./incomingPreviewModalModel";
import { buildPreviewApproversList } from "./incomingPreviewModalLib";

export function useIncomingPreviewState(props: IncomingPreviewModalProps) {
  const {
    html,
    fontSize = 14,
    signatures = [],
    approvals = [],
    attachments = [],
    correspondenceId,
    canCreateAssignment = true,
    onClose,
  } = props;

  const [zoom, setZoom] = useState(1);
  const [isScaleFocused, setIsScaleFocused] = useState(false);
  const [scaleInput, setScaleInput] = useState("");

  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [signersOpen, setSignersOpen] = useState(false);
  const [approversOpen, setApproversOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<AttachedFile | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [activeApprover, setActiveApprover] = useState<PreviewApprover | null>(null);
  const [approversPanelOpen, setApproversPanelOpen] = useState(false);

  const [panelSearch, setPanelSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "signer" | "approver">("all");
  const [zoomedStampSrc, setZoomedStampSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!zoomedStampSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedStampSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedStampSrc]);

  const mappedAttachments: AttachedFile[] = useMemo(
    () => (attachments || []).map((att: any) => mapServerAttachment(att, correspondenceId)),
    [attachments, correspondenceId]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelsGroupRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    if (!canCreateAssignment) return;
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

  const sections: ToolbarSection[] = [
    {
      key: "task",
      label: "Поручение",
      dotClass: "bg-indigo-500",
      isOpen: showTaskPanel,
      disabled: !canCreateAssignment,
      hint: canCreateAssignment ? undefined : VISOR_INVITE_HINT,
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
      onToggle: () => (approversOpen ? setApproversOpen(false) : openApprovers()),
    },
    {
      key: "attachments",
      label: "Вложения",
      dotClass: "bg-teal-500",
      badge: mappedAttachments.length > 0 ? mappedAttachments.length : undefined,
      isOpen: attachmentsOpen,
      onToggle: () => (attachmentsOpen ? setAttachmentsOpen(false) : openAttachments()),
    },
  ];

  useEffect(() => {
    const scroller = scrollRef.current;
    const canvas = canvasRef.current;
    const group = panelsGroupRef.current;
    if (!scroller || !canvas || !group) return;

    const TOP_M = 12;
    const BOT_M = 24;
    const MIN_VISIBLE = 160;

    const update = () => {
      const canvasTop =
        canvas.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      let shift = Math.max(0, TOP_M - canvasTop);
      shift = Math.min(shift, Math.max(0, canvas.offsetHeight - MIN_VISIBLE));
      const groupViewportTop = canvasTop + shift;
      const availH = Math.max(200, scroller.clientHeight - groupViewportTop - BOT_M);
      group.style.setProperty("--icc-panel-max-h", `${availH}px`);
      group.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const canvasRO = new ResizeObserver(update);
    canvasRO.observe(canvas);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      canvasRO.disconnect();
      group.style.transform = "";
    };
  }, [html, zoom]);

  useEffect(() => {
    if (!isScaleFocused) {
      setScaleInput(`${Math.round(zoom * 100)}%`);
    }
  }, [zoom, isScaleFocused]);

  const handleScaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9%]/g, "");
    setScaleInput(value);
  };

  const handleScaleInputFocus = () => {
    setIsScaleFocused(true);
    setScaleInput(Math.round(zoom * 100).toString());
  };

  const commitScale = (value: string) => {
    const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numeric) && numeric > 0) {
      const clamped = Math.max(30, Math.min(300, numeric));
      setZoom(clamped / 100);
    } else {
      setScaleInput(`${Math.round(zoom * 100)}%`);
    }
  };

  const handleScaleInputBlur = () => {
    setIsScaleFocused(false);
    commitScale(scaleInput);
  };

  const handleScaleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitScale(scaleInput);
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setScaleInput(`${Math.round(zoom * 100)}%`);
      e.currentTarget.blur();
    }
  };

  const previewApproversList = useMemo(
    () => buildPreviewApproversList(signatures, approvals),
    [signatures, approvals]
  );

  const previewSigners = useMemo(
    () => previewApproversList.filter((a) => a.role === "Подписывающий"),
    [previewApproversList]
  );

  const previewApprovers = useMemo(
    () => previewApproversList.filter((a) => a.role === "Согласующий"),
    [previewApproversList]
  );

  const filteredSigners = useMemo(() => {
    if (roleFilter === "approver") return [];
    return previewSigners;
  }, [previewSigners, roleFilter]);

  const filteredApprovers = useMemo(() => {
    if (roleFilter === "signer") return [];
    if (!panelSearch.trim()) return previewApprovers;
    return previewApprovers.filter((a) =>
      a.name.toLowerCase().includes(panelSearch.toLowerCase())
    );
  }, [previewApprovers, panelSearch, roleFilter]);

  const { pages, stamp } = useMemo(
    () => paginateHtml(html, fontSize),
    [html, fontSize]
  );

  const sheets = useMemo(() => {
    const s = [...pages];
    if (stamp) while (s.length <= stamp.pageIndex) s.push("");
    if (!s.length) s.push("");
    return s;
  }, [pages, stamp]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const signedCount = previewApproversList.filter((a) => a.signed).length;
  const totalCount = previewApproversList.length;
  const progressPct = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

  const zoomOut = () => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10));
  const zoomIn = () => setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10));

  const scrollToPage = (idx: number) => {
    setCurrentPage(idx);
    pageRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return {
    zoom,
    scaleInput,
    showTaskPanel,
    setShowTaskPanel,
    signersOpen,
    setSignersOpen,
    approversOpen,
    setApproversOpen,
    versionsOpen,
    setVersionsOpen,
    attachmentsOpen,
    setAttachmentsOpen,
    previewAttachment,
    setPreviewAttachment,
    zoomedStampSrc,
    setZoomedStampSrc,
    currentPage,
    activeApprover,
    setActiveApprover,
    approversPanelOpen,
    setApproversPanelOpen,
    panelSearch,
    setPanelSearch,
    roleFilter,
    setRoleFilter,
    mappedAttachments,
    scrollRef,
    canvasRef,
    panelsGroupRef,
    pageRefs,
    openSigners,
    openApprovers,
    openVersions,
    openTask,
    openAttachments,
    sections,
    handleScaleInputChange,
    handleScaleInputFocus,
    handleScaleInputBlur,
    handleScaleInputKeyDown,
    previewApproversList,
    previewSigners,
    previewApprovers,
    filteredSigners,
    filteredApprovers,
    pages,
    stamp,
    sheets,
    signedCount,
    totalCount,
    progressPct,
    zoomIn,
    zoomOut,
    scrollToPage,
  };
}
