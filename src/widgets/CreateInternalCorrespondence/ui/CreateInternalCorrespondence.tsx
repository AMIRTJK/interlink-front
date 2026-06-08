import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Pin,
  Search,
  Plus,
  ChevronRight,
  Calendar,
  User,
  Clock,
  Download,
  Trash,
  X,
  Paperclip,
  Shield,
  Users,
  Check,
  PenLine,
  UserPlus,
  FileBadge,
  ArrowLeft,
  ChevronDown,
  FileType,
  MessageSquare,
  MessageSquarePlus,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Minus,
  Highlighter,
  Flag,
  Eye,
  Monitor,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Save,
  Mail,
} from "lucide-react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type {
  Status,
  LetterType,
  ImportanceLevel,
  PageOrientation,
  RegistryItem,
  RecipientOption,
  AttachedFile,
  Approver,
  FinalSigner,
} from "../types";
import {
  LETTER_TYPE_OPTIONS,
  IMPORTANCE_OPTIONS,
  IMPORTANCE_DOT,
  RECIPIENT_OPTIONS,
  FONT_SIZES,
  INBOX_DOC_TYPES,
  INBOX_DOC_TYPE_STYLE,
  MOCK_CONTENT_LINES,
  OUTBOX_STATUS_LABEL,
  OUTBOX_STATUS_STYLE,
} from "../lib/constants";
import { cn } from "../lib/utils";
import { PreviewModal } from "./PreviewModal";
import { TBtn } from "./TBtn";
import { DSStamp } from "./DSStamp";

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

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
  const [to, setTo] = useState<RecipientOption[]>([]);
  const [cc, setCc] = useState<RecipientOption[]>([]);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [finalSigner, setFinalSigner] = useState<FinalSigner | null>(null);
  const [showSignerDropdown, setShowSignerDropdown] = useState(false);
  const [signerSearch, setSignerSearch] = useState("");
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCcDropdown, setShowCcDropdown] = useState(false);
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  const [toSearch, setToSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [approverSearch, setApproverSearch] = useState("");
  const [showCcField, setShowCcField] = useState(false);
  const [sent, setSent] = useState(false);
  const [letterType, setLetterType] = useState<LetterType | null>(null);
  const [showLetterTypeDropdown, setShowLetterTypeDropdown] = useState(false);
  const [importance, setImportance] = useState<ImportanceLevel>("medium");
  const [showImportanceDropdown, setShowImportanceDropdown] = useState(false);
  const [fontSize, setFontSize] = useState("14");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [showPreview, setShowPreview] = useState(false);
  const [stampVisible, setStampVisible] = useState(false);
  const [stampPos, setStampPos] = useState({ x: 40, y: 40 });
  const [stampSize, setStampSize] = useState({
    width: 320,
    height: "auto" as "auto" | number,
  });
  const [docCreator, setDocCreator] = useState<any>(null);
  const [folder, setFolder] = useState<string | number>("drafts");
  const [attachedIncomingLetters, setAttachedIncomingLetters] = useState<any[]>(
    [],
  );
  const [showIncomingSearch, setShowIncomingSearch] = useState(false);
  const [incomingLetterSearch, setIncomingLetterSearch] = useState("");

  const isDraggingStamp = useRef(false);
  const isResizingStamp = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, startW: 320, startH: 0 });
  const stampRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const isLandscape = orientation === "landscape";
  const PAGE_WIDTH = isLandscape ? 1122 : 794;
  const PAGE_HEIGHT = isLandscape ? 794 : 1122;
  const PAGE_PAD_H = 80;
  const PAGE_PAD_V = 72;
  const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PAD_V * 2;

  const [searchParams, setSearchParams] = useState({ query: "" });

  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS,
    useToken: true,
    params: searchParams,
  });

  const { data: rawWorkflowData, refetch: refetchWorkflow } = useGetQuery({
    url: id ? ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id)) : "",
    useToken: true,
    options: { enabled: !!id },
  });

  const { data: incomingLettersData } = useGetQuery({
    url: id ? ApiRoutes.GET_INTERNAL_INCOMING_PICKER : "",
    useToken: true,
    options: { enabled: !!id && showIncomingSearch },
    params: { query: incomingLetterSearch },
  });

  const isVersionContentInit = useRef(false);

  // Запрос списка версий документа
  const { data: versionsResponse, refetch: refetchVersions } = useGetQuery({
    url: id ? ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id)) : "",
    useToken: true,
    options: {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  });

  // Массив всех версий с бэкенда
  const allVersions = useMemo(() => {
    const rawVersions = versionsResponse?.data?.versions || [];
    return rawVersions.map((v: any, idx: number) => ({
      id: v.id,
      versionNumber: v.version || idx + 1,
      content: v.body,
      date: v.created_at,
      author: v.author
        ? {
            id: String(v.author.id),
            name: v.author.full_name || "Неизвестный автор",
            position: v.author.position || "Сотрудник",
            initials: (v.author.full_name || "НА")
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join(""),
          }
        : {
            id: "unknown",
            name: "Неизвестный автор",
            position: "Сотрудник",
            initials: "НА",
          },
      is_selected: v.is_selected,
      is_current_signed: v.is_current_signed,
    }));
  }, [versionsResponse]);

  // Список уникальных авторов для выпадающего фильтра (с подсчетом количества их версий)
  const versionAuthors = useMemo(() => {
    const authorsMap: Record<string, { name: string; count: number }> = {};

    allVersions.forEach((v) => {
      if (!authorsMap[v.author.id]) {
        authorsMap[v.author.id] = { name: v.author.name, count: 0 };
      }
      authorsMap[v.author.id].count += 1;
    });

    return Object.entries(authorsMap).map(([id, meta]) => ({
      id,
      name: meta.name,
      count: meta.count,
    }));
  }, [allVersions]);

  // Стейт для фильтрации версий по автору (null — показать все)
  const [selectedAuthorId, setSelectedAuthorId] = useState<
    string | number | null
  >(null);

  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  // Проверки для кнопок и readonly режима
  const initialActiveVersion =
    allVersions.length > 0 ? allVersions[allVersions.length - 1].id : null;

  const [activeVersionId, setActiveVersionId] = useState<
    string | number | null
  >(initialActiveVersion);

  // Отфильтрованный массив версий, который пойдет в UI
  const filteredVersions = useMemo(() => {
    if (!selectedAuthorId) return allVersions;
    return allVersions.filter((v) => v.author.id === String(selectedAuthorId));
  }, [allVersions, selectedAuthorId]);

  const latestVersionId =
    allVersions.length > 0 ? allVersions[allVersions.length - 1].id : null;
  const isOldVersionSelected =
    activeVersionId !== null && activeVersionId !== latestVersionId;

  const { mutate: selectVersionForSign, isPending: isSelectingVersion } =
    useMutationQuery<{ versionId: string | number }, any>({
      url: (requestData) =>
        ApiRoutes.SELECT_INTERNAL_VERISION_FOR_SIGN.replace(
          ":correspondenceId",
          String(id || ""),
        ).replace(":versionId", String(requestData.versionId)),
      method: "POST",
      messages: {
        invalidate: [
          ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id || "")),
        ],
      },
    });

  const handleSetVersionForSign = (clickedVersionId: string | number) => {
    selectVersionForSign({ versionId: clickedVersionId });
  };

  // Выбор версии в панели и замена содержимого в редакторе
  const handleSelectVersion = (content: string, versionId: string | number) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content; // Для native div contentEditable
      // Если твой EditorHandle имеет метод setContent, используй: editorRef.current.setContent(content);
      setActiveVersionId(versionId);
    }
  };

  const availableUsers: RecipientOption[] =
    usersData?.data?.data?.map((u: any) => ({
      id: String(u.id),
      name: u.full_name,
      org: u.position || u.department,
      initials: u.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join(""),
      color: "bg-blue-100 text-blue-700",
    })) || [];

  const availableApprovers = availableUsers
    .filter(
      (r) =>
        !approvers.find((a) => a.id === r.id) &&
        finalSigner?.id !== r.id &&
        (r.name.toLowerCase().includes(approverSearch.toLowerCase()) ||
          r.org.toLowerCase().includes(approverSearch.toLowerCase())),
    )
    .slice(0, 15);

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
          (letter.subject
            .toLowerCase()
            .includes(incomingLetterSearch.toLowerCase()) ||
            letter.sender
              .toLowerCase()
              .includes(incomingLetterSearch.toLowerCase()) ||
            letter.regNumber
              .toLowerCase()
              .includes(incomingLetterSearch.toLowerCase())) &&
          !attachedIncomingLetters.some((l) => l.id === letter.id),
      )
      .slice(0, 15) || [];

  const { mutate: createDraft, isPending: isCreating } = useMutationQuery<any>({
    url: ApiRoutes.CREATE_INTERNAL,
    method: "POST",
    messages: { invalidate: [ApiRoutes.GET_INTERNAL_DRAFTS] },
    queryOptions: {
      onSuccess: (data: any) => {
        const newId = data?.item?.id;
        if (newId)
          navigate(`/modules/correspondence/internal/outgoing/${newId}`, {
            replace: true,
          });
      },
    },
  });

  const { mutate: updateDraft, isPending: isUpdating } = useMutationQuery<any>({
    url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
    method: "PUT",
    messages: {
      invalidate: [
        ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
        ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id || "")),
      ],
      onSuccessCb: () => {
        isVersionContentInit.current = false; // Позволяет подтянуть новую сохраненную версию
      },
    },
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
  });

  const { mutate: signaturesConfirm } = useMutationQuery<any>({
    url: ApiRoutes.INTERNAL_SIGNATURES_CONFIRM?.replace(
      ":id",
      String(id || ""),
    ),
    method: "POST",
    messages: {
      success: "Документ успешно подписан",
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
      ],
    },
    queryOptions: {
      onSuccess: () => {
        setFinalSigner((prev) =>
          prev ? { ...prev, dsApplied: true, dsLoading: false } : null,
        );
        setStampVisible(true);
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
      success: "Документ согласован",
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
      ],
    },
    queryOptions: {
      onSuccess: (_, req) => {
        setApprovers((prev) =>
          prev.map((a) =>
            a.approvalRecordId === req.approvalRecordId
              ? { ...a, approved: true, dsApplied: true, dsLoading: false }
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

  const onSaveClick = async () => {
    const editorBody = editorRef.current?.innerHTML || "<p></p>";
    const requestPayload: any = {
      subject,
      body: editorBody,
      recipients: {
        to: to.map((r) => r.id),
        cc: cc.map((r) => r.id),
      },
      approvals: approvers.map((a) => a.id),
      signatures: finalSigner ? [finalSigner.id] : [],
      folder_id: typeof folder === "number" ? folder : undefined,
      system_folder: typeof folder === "string" ? folder : undefined,
      document_type: letterType,
      priority: importance === "medium" ? "normal" : importance,
    };

    if (id) updateDraft(requestPayload);
    else createDraft(requestPayload);
  };

  const execCmd = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }, []);

  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialData?.item) {
      const item = initialData.item;

      if (item.subject) setSubject(item.subject);
      if (
        item.body &&
        editorRef.current &&
        editorRef.current.innerHTML !== item.body
      ) {
        editorRef.current.innerHTML = item.body;
      }
      if (item.priority) {
        const priorityMap: Record<string, ImportanceLevel> = {
          normal: "medium",
          high: "high",
          low: "low",
        };
        setImportance(priorityMap[item.priority] || "medium");
      }
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
              comment: "",
              showCommentInput: false,
              dsApplied: a.status === "approved",
              dsLoading: false,
            };
          }),
        );
      }

      if (item.creator) {
        setDocCreator(item.creator);
      }

      if (item.signatures && item.signatures.length > 0) {
        const s = item.signatures[0];
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
          dsApplied: s.status === "signed",
          dsLoading: false,
        });
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
        const wfS = wfSignatures[0];
        const user = wfS.user;
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
            dsApplied: wfS.status === "signed",
            dsLoading: false,
          });
        }
      }
    }
  }, [rawWorkflowData]);

  const handleFontSize = (size: string) => {
    setFontSize(size);
    setShowFontSizeDropdown(false);
    editorRef.current?.focus();
    const sizeMap: Record<string, string> = {
      "10": "1",
      "11": "1",
      "12": "2",
      "13": "3",
      "14": "3",
      "16": "4",
      "18": "4",
      "20": "5",
      "24": "6",
      "28": "6",
      "36": "7",
    };
    document.execCommand("fontSize", false, sizeMap[size] ?? "3");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: AttachedFile[] = Array.from(files).map((f) => ({
      id: `f-${Date.now()}-${f.name}`,
      name: f.name,
      size:
        f.size > 1024 * 1024
          ? `${(f.size / 1024 / 1024).toFixed(1)} МБ`
          : `${(f.size / 1024).toFixed(0)} КБ`,
      type: f.name.split(".").pop()?.toUpperCase() ?? "FILE",
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const applyFinalDS = async () => {
    if (!id || !finalSigner) return;

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
    setApprovers((prev) =>
      prev.map((a) =>
        a.approvalRecordId === recordId ? { ...a, dsLoading: true } : a,
      ),
    );

    approvalsConfirm({
      approvalRecordId: recordId,
      status: "approved",
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
    setShowApproverDropdown(false);
    setApproverSearch("");
  };

  const addIncomingLetter = (letter: any) => {
    const alreadyAdded = attachedIncomingLetters.some(
      (l: any) => l.id === letter.id,
    );
    if (!alreadyAdded) {
      setAttachedIncomingLetters((prev) => [...prev, letter]);
    }
    setShowIncomingSearch(false);
    setIncomingLetterSearch("");
  };

  const removeIncomingLetter = (letterId: string) => {
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
    setStampVisible(true);
    setStampPos({ x: 40, y: 40 });
    setStampSize({ width: 320, height: "auto" });
  };

  const handleStampMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingStamp.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingStamp.current || !pageCanvasRef.current) return;
      const cr = pageCanvasRef.current.getBoundingClientRect();
      setStampPos({
        x: Math.max(
          0,
          Math.min(
            ev.clientX - cr.left - dragOffset.current.x,
            cr.width -
              (typeof stampSize.width === "number" ? stampSize.width : 320),
          ),
        ),
        y: Math.max(
          0,
          Math.min(ev.clientY - cr.top - dragOffset.current.y, cr.height - 120),
        ),
      });
    };
    const onMouseUp = () => {
      isDraggingStamp.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingStamp.current = true;
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: typeof stampSize.width === "number" ? stampSize.width : 320,
      startH: stampRef.current ? stampRef.current.offsetHeight : 120,
    };
    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizingStamp.current) return;
      setStampSize({
        width: Math.max(
          200,
          Math.min(
            resizeStart.current.startW +
              ev.clientX -
              resizeStart.current.mouseX,
            600,
          ),
        ),
        height: Math.max(
          100,
          resizeStart.current.startH + ev.clientY - resizeStart.current.mouseY,
        ),
      });
    };
    const onMouseUp = () => {
      isResizingStamp.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const selectedImportance = IMPORTANCE_OPTIONS.find(
    (o) => o.value === importance,
  )!;

  const isSigned = rawWorkflowData?.data?.signatures?.some(
    (sig: any) => sig.status === "signed",
  );

  // Если документ подписан ИЛИ выбрана старая версия — включаем режим "только чтение"
  const isReadOnly = isSigned || isOldVersionSelected;

  const allSignaturesSigned =
    rawWorkflowData?.data?.signatures?.length > 0
      ? rawWorkflowData.data.signatures.every(
          (sig: any) => sig.status === "signed",
        )
      : false;

  useEffect(() => {
    if (allVersions.length > 0 && !isVersionContentInit.current) {
      const targetVersion = allVersions[allVersions.length - 1];
      setActiveVersionId(targetVersion.id);

      if (editorRef.current && targetVersion.content) {
        editorRef.current.innerHTML = targetVersion.content;
      }
      isVersionContentInit.current = true;
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
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] h-screen w-full flex flex-col">
      {showPreview && (
        <PreviewModal
          subject={subject}
          editorHtml={editorRef.current?.innerHTML ?? ""}
          orientation={orientation}
          onClose={() => setShowPreview(false)}
          stampVisible={stampVisible && !!finalSigner?.dsApplied}
          stampPos={stampPos}
          stampSize={stampSize}
          stampSignerName={finalSigner?.name || "Неизвестно"}
          stampCertSerial={`SN-2026-${finalSigner?.initials}-84201`}
          stampSignedAt="03.02.2026"
          stampValidUntil="с 20.03.2025 до 20.03.2026"
        />
      )}
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span>Назад</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
            >
              <Eye size={15} className="text-slate-500" />
              <span className="hidden sm:inline">Предварительный просмотр</span>
            </button>

            <button
              onClick={onSaveClick}
              disabled={
                !to.length ||
                !subject.trim() ||
                isCreating ||
                isUpdating ||
                isOldVersionSelected
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                to.length &&
                  subject.trim() &&
                  !isCreating &&
                  !isUpdating &&
                  !isOldVersionSelected
                  ? "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                  : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              {isCreating || isUpdating ? (
                <Clock size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>Сохранить</span>
            </button>

            {!!id && (
              <button
                onClick={() => {
                  // Добавили проверку isAlreadySent
                  if (
                    !to.length ||
                    !subject.trim() ||
                    isSending ||
                    isAlreadySent
                  )
                    return;
                  sendCorrespondence({});
                }}
                disabled={
                  !to.length ||
                  !subject.trim() ||
                  !allSignaturesSigned ||
                  isSending ||
                  isAlreadySent
                }
                className={cn(
                  "flex items-center gap-2 cursor-pointer px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md",
                  to.length &&
                    subject.trim() &&
                    allSignaturesSigned &&
                    !isSending &&
                    !isAlreadySent
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
                )}
              >
                {isSending ? (
                  <Clock size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>
                  {isSending
                    ? "Отправка..."
                    : isAlreadySent
                      ? "Отправлено"
                      : "Отправить"}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                    Тип
                  </label>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setShowLetterTypeDropdown((v) => !v)}
                      onBlur={() =>
                        setTimeout(() => setShowLetterTypeDropdown(false), 150)
                      }
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                        letterType
                          ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FileType
                          size={15}
                          className={
                            letterType ? "text-indigo-500" : "text-slate-400"
                          }
                        />
                        {letterType ? (
                          <span>
                            <span className="font-semibold">{letterType}</span>
                            <span className="text-indigo-500 text-xs ml-2">
                              —{" "}
                              {
                                LETTER_TYPE_OPTIONS.find(
                                  (o) => o.value === letterType,
                                )?.desc
                              }
                            </span>
                          </span>
                        ) : (
                          <span>Выберите тип документа...</span>
                        )}
                      </div>
                      <ChevronDown
                        size={15}
                        className={cn(
                          "transition-transform",
                          showLetterTypeDropdown && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {showLetterTypeDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden py-1"
                        >
                          {LETTER_TYPE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onMouseDown={() => {
                                setLetterType(opt.value);
                                setShowLetterTypeDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                                letterType === opt.value && "bg-slate-50",
                              )}
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {opt.label}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {opt.desc}
                                </p>
                              </div>
                              {letterType === opt.value && (
                                <Check size={12} className="text-slate-400" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowImportanceDropdown((v) => !v)}
                      onBlur={() =>
                        setTimeout(() => setShowImportanceDropdown(false), 150)
                      }
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                        selectedImportance.badgeBg,
                        selectedImportance.badgeBorder,
                        selectedImportance.badgeText,
                      )}
                    >
                      <Flag size={14} className={selectedImportance.flagFill} />
                      <span>{selectedImportance.label}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform",
                          showImportanceDropdown && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {showImportanceDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 min-w-[220px]"
                        >
                          {IMPORTANCE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onMouseDown={() => {
                                setImportance(opt.value);
                                setShowImportanceDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                                importance === opt.value && "bg-slate-50",
                              )}
                            >
                              <span
                                className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 border",
                                  IMPORTANCE_DOT[opt.value],
                                )}
                              />
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-semibold",
                                    opt.badgeText,
                                  )}
                                >
                                  {opt.label}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {opt.desc}
                                </p>
                              </div>
                              {importance === opt.value && (
                                <Check
                                  size={13}
                                  className="text-slate-400 flex-shrink-0"
                                />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="px-6 pt-5 pb-4 border-b border-slate-100 overflow-visible z-20">
                <div className="flex items-start gap-3">
                  <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                    Кому
                  </label>
                  <div className="flex-1 relative overflow-visible">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {to.map((r) => (
                        <span
                          key={r.id}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                            r.color,
                          )}
                        >
                          <span>{r.initials}</span>
                          <span>{r.name}</span>
                          <button
                            onClick={() =>
                              setTo((prev) => prev.filter((x) => x.id !== r.id))
                            }
                            className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <input
                      className="w-full text-sm text-slate-700 bg-transparent border-0 outline-none"
                      placeholder="Поиск получателя..."
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setSearchParams({ query: e.target.value });
                        setShowToDropdown(true);
                      }}
                      onFocus={() => setShowToDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowToDropdown(false), 150)
                      }
                    />
                    <UserDropdown
                      isOpen={showToDropdown}
                      search={toSearch}
                      onClose={() => setShowToDropdown(false)}
                      onSelect={(u) => {
                        setTo([...to, u]);
                        setToSearch("");
                        setShowToDropdown(false);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowCcField((v) => !v)}
                    className="text-xs text-blue-600 cursor-pointer font-semibold hover:text-blue-800 transition-colors pt-2 flex-shrink-0"
                  >
                    + Копия
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showCcField && (
                  <div className="px-6 pb-4 border-b border-slate-100 overflow-visible z-10">
                    <div className="flex items-start gap-3">
                      <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                        Копия
                      </label>
                      <div className="flex-1 relative overflow-visible">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {cc.map((r) => (
                            <span
                              key={r.id}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                r.color,
                              )}
                            >
                              <span>{r.initials}</span>
                              <span>{r.name}</span>
                              <button
                                onClick={() =>
                                  setCc((prev) =>
                                    prev.filter((x) => x.id !== r.id),
                                  )
                                }
                                className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          className="w-full text-sm text-slate-700 bg-transparent border-0 outline-none"
                          placeholder="Поиск получателя копии..."
                          value={ccSearch}
                          onChange={(e) => {
                            setCcSearch(e.target.value);
                            setSearchParams({ query: e.target.value });
                            setShowCcDropdown(true);
                          }}
                          onFocus={() => setShowCcDropdown(true)}
                          onBlur={() =>
                            setTimeout(() => setShowCcDropdown(false), 150)
                          }
                        />
                        <UserDropdown
                          isOpen={showCcDropdown}
                          search={ccSearch}
                          onClose={() => setShowCcDropdown(false)}
                          onSelect={(u) => {
                            setCc([...cc, u]);
                            setCcSearch("");
                            setShowCcDropdown(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
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

              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-0.5">
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("undo");
                  }}
                  title="Отменить"
                >
                  <Undo size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("redo");
                  }}
                  title="Повторить"
                >
                  <Redo size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("formatBlock", "h1");
                  }}
                  title="Заголовок 1"
                >
                  <Heading1 size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("formatBlock", "h2");
                  }}
                  title="Заголовок 2"
                >
                  <Heading2 size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <div className="relative flex-shrink-0">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowFontSizeDropdown((v) => !v);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
                  >
                    <span>{fontSize}px</span>
                    <ChevronDown
                      size={10}
                      className={cn(
                        "transition-transform",
                        showFontSizeDropdown && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {showFontSizeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 min-w-[72px]"
                      >
                        {FONT_SIZES.map((s) => (
                          <button
                            key={s}
                            onMouseDown={() => handleFontSize(s)}
                            className={cn(
                              "w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-slate-50 transition-colors",
                              fontSize === s &&
                                "bg-blue-50 text-blue-700 font-bold",
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("bold");
                  }}
                  title="Жирный"
                >
                  <Bold size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("italic");
                  }}
                  title="Курсив"
                >
                  <Italic size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("underline");
                  }}
                  title="Подчёркнутый"
                >
                  <Underline size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("strikeThrough");
                  }}
                  title="Зачёркнутый"
                >
                  <Strikethrough size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("hiliteColor", "#fef08a");
                  }}
                  title="Выделить"
                >
                  <Highlighter size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyLeft");
                  }}
                  title="По левому краю"
                >
                  <AlignLeft size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyCenter");
                  }}
                  title="По центру"
                >
                  <AlignCenter size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyRight");
                  }}
                  title="По правому краю"
                >
                  <AlignRight size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyFull");
                  }}
                  title="По ширине"
                >
                  <AlignJustify size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertUnorderedList");
                  }}
                  title="Маркированный список"
                >
                  <List size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertOrderedList");
                  }}
                  title="Нумерованный список"
                >
                  <ListOrdered size={14} />
                </TBtn>
                <TBtn
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertHorizontalRule");
                  }}
                  title="Горизонтальная линия"
                >
                  <Minus size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setOrientation((o) =>
                      o === "portrait" ? "landscape" : "portrait",
                    );
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0",
                    orientation === "landscape"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Monitor size={16} />
                  <span>
                    {orientation === "portrait" ? "Книжный" : "Альбомный"}
                  </span>
                </button>
              </div>

              <div
                className="bg-[#E8EAED] overflow-auto"
                style={{ minHeight: 420 }}
              >
                <div className="py-8 px-8 flex justify-center">
                  <div
                    ref={pageCanvasRef}
                    className="bg-white shadow-xl border border-slate-300/30 relative"
                    style={{
                      width: PAGE_WIDTH,
                      minHeight: PAGE_HEIGHT,
                      padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
                      fontFamily: "Times New Roman, serif",
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.8,
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      ref={editorRef}
                      contentEditable={!isReadOnly}
                      suppressContentEditableWarning
                      data-placeholder="Начните вводить текст письма..."
                      onKeyDown={handleEditorKeyDown}
                      style={{
                        outline: "none",
                        minHeight: CONTENT_HEIGHT,
                        fontFamily: "Times New Roman, serif",
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.8,
                        color: "#1e293b",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                      className="focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-300 [&:empty]:before:italic [&:empty]:before:pointer-events-none"
                    />
                    {stampVisible && finalSigner && finalSigner.dsApplied && (
                      <div
                        ref={stampRef}
                        onMouseDown={handleStampMouseDown}
                        style={{
                          position: "absolute",
                          left: stampPos.x,
                          top: stampPos.y,
                          width:
                            typeof stampSize.width === "number"
                              ? stampSize.width
                              : 320,
                          height:
                            stampSize.height !== "auto"
                              ? stampSize.height
                              : undefined,
                          cursor: "move",
                          userSelect: "none",
                          overflow: "hidden",
                        }}
                      >
                        <DSStamp
                          name={finalSigner.name}
                          certSerial={`SN-2026-${finalSigner.initials}-84201`}
                          signedAt="03.02.2026"
                          validUntil="с 20.03.2025 до 20.03.2026"
                        />
                        <div
                          onMouseDown={handleResizeMouseDown}
                          style={{
                            position: "absolute",
                            right: 0,
                            bottom: 0,
                            width: 14,
                            height: 14,
                            cursor: "se-resize",
                            background: "rgba(59,130,246,0.5)",
                            borderRadius: "2px 0 2px 0",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Paperclip size={12} />
                    <span>Вложения</span>
                    {attachments.length > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                        {attachments.length}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={12} />
                    <span>Прикрепить файл</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <FileTextIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {file.name}
                          </p>
                          <p className="text-slate-400">{file.size}</p>
                        </div>
                        <button
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((f) => f.id !== file.id),
                            )
                          }
                          className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {!!id && (
            <div className="w-[340px] flex-shrink-0 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Users size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Согласующие
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Добавьте согласующих лиц
                        </p>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowApproverDropdown((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <UserPlus size={13} />
                        <span>Добавить</span>
                      </button>
                      <AnimatePresence>
                        {showApproverDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-64"
                            // Добавляем onBlur точно так же, как во входящих письмах
                            onBlur={() =>
                              setTimeout(() => {
                                setShowApproverDropdown(false);
                                setApproverSearch("");
                              }, 150)
                            }
                          >
                            <div className="p-2 border-b border-slate-100">
                              <input
                                type="text"
                                placeholder="Поиск..."
                                value={approverSearch}
                                onChange={(e) => {
                                  setApproverSearch(e.target.value);
                                  setSearchParams({
                                    query: e.target.value,
                                  });
                                }}
                                autoFocus
                                className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto py-1">
                              {availableApprovers.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">
                                  Нет доступных
                                </p>
                              ) : (
                                availableApprovers.map((r) => (
                                  <button
                                    key={r.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      addApprover(r);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                                  >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-slate-100 text-slate-700">
                                      {r.initials}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 truncate">
                                        {r.name}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">
                                        {r.org}
                                      </p>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 space-y-2">
                  {approvers.length === 0 ? (
                    <div className="py-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                      <UserPlus size={15} />
                      <span>Нажмите «Добавить»</span>
                    </div>
                  ) : (
                    approvers.map((approver, idx) => (
                      <div
                        key={approver.id}
                        className={cn(
                          "rounded-xl border transition-all overflow-hidden",
                          approver.approved
                            ? "border-emerald-100 bg-emerald-50/40"
                            : "border-slate-100 bg-slate-50/40",
                        )}
                      >
                        <div className="flex items-center gap-2.5 px-3 py-2.5">
                          <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                              approver.color,
                            )}
                          >
                            {approver.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {approver.name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {approver.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!approver.approved && (
                              <button
                                onClick={() =>
                                  toggleApproverComment(approver.id)
                                }
                                className={cn(
                                  "p-1.5 rounded-lg text-xs transition-all border",
                                  approver.showCommentInput || approver.comment
                                    ? "bg-amber-50 border-amber-200 text-amber-600"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                                )}
                              >
                                <MessageSquarePlus size={12} />
                              </button>
                            )}

                            {!approver.isInvited ? (
                              <button
                                onClick={() =>
                                  inviteApprover({
                                    docId: id,
                                    users: [Number(approver.id)],
                                  })
                                }
                                disabled={isApproverInviting}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Send size={11} />
                                <span>
                                  {isApproverInviting ? "..." : "Пригласить"}
                                </span>
                              </button>
                            ) : approver.dsApplied ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                                <Shield
                                  size={10}
                                  className="text-emerald-500"
                                />
                                <span className="text-[10px] font-semibold text-emerald-600">
                                  ЭЦП
                                </span>
                                <Check size={10} className="text-emerald-500" />
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (approver.approvalRecordId) {
                                    applyApproverDS(approver.approvalRecordId);
                                  }
                                }}
                                disabled={approver.dsLoading}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                                  approver.dsLoading
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 shadow-sm",
                                )}
                              >
                                {approver.dsLoading ? (
                                  <Clock size={11} className="animate-spin" />
                                ) : (
                                  <Check size={11} />
                                )}
                                <span>
                                  {approver.dsLoading
                                    ? "Согласую..."
                                    : "Согласовать"}
                                </span>
                              </button>
                            )}

                            {!approver.approved && !approver.isInvited && (
                              <button
                                onClick={() =>
                                  setApprovers((prev) =>
                                    prev.filter((a) => a.id !== approver.id),
                                  )
                                }
                                className="text-slate-300 hover:text-rose-400 transition-colors ml-1"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {approver.showCommentInput && !approver.approved && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-white/60">
                                <div className="flex items-start gap-2">
                                  <MessageSquare
                                    size={12}
                                    className="text-amber-500 mt-0.5 flex-shrink-0"
                                  />
                                  <textarea
                                    placeholder="Комментарий к согласованию..."
                                    className="flex-1 text-[11px] text-slate-700 placeholder-slate-400 bg-amber-50/60 border border-amber-100 rounded-lg px-2.5 py-2 resize-none outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all min-h-[54px] leading-relaxed"
                                    value={approver.comment}
                                    onChange={(e) =>
                                      updateApproverComment(
                                        approver.id,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {approver.dsApplied && (
                          <div
                            className={cn(
                              "px-3 py-2 border-t",
                              approver.approved
                                ? "border-emerald-100 bg-emerald-50/60"
                                : "border-purple-100 bg-purple-50/40",
                            )}
                          >
                            <DSStamp
                              name={approver.name}
                              certSerial={`SN-2026-${approver.initials}-${Math.abs(Number(approver.id) * 317 + 10000)}`}
                              signedAt={new Date().toLocaleDateString("ru-RU")}
                              validUntil="с 20.03.2025 до 20.03.2026"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <PenLine size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        Подписывающий
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate">
                        Подписывает с ЭЦП
                      </p>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0 flex items-center gap-1.5">
                    {docCreator &&
                      finalSigner?.id !== String(docCreator.id) && (
                        <button
                          onClick={assignSelfAsSigner}
                          title="Назначить себя"
                          disabled={isSigned}
                          className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                            isSigned
                              ? "bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed"
                              : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                          )}
                        >
                          <User size={14} />
                        </button>
                      )}
                    <button
                      onClick={() => setShowSignerDropdown((v) => !v)}
                      disabled={isSigned}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors",
                        isSigned
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100",
                      )}
                    >
                      <UserPlus size={12} />
                      <span>{finalSigner ? "Изменить" : "Назначить"}</span>
                    </button>
                    <AnimatePresence>
                      {showSignerDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-64"
                          // Добавляем onBlur для автоматического закрытия
                          onBlur={() =>
                            setTimeout(() => {
                              setShowSignerDropdown(false);
                              setSignerSearch("");
                            }, 150)
                          }
                        >
                          <div className="p-2 border-b border-slate-100">
                            <input
                              type="text"
                              placeholder="Поиск сотрудника..."
                              value={signerSearch}
                              onChange={(e) => {
                                setSignerSearch(e.target.value);
                                setSearchParams({
                                  query: e.target.value,
                                });
                              }}
                              autoFocus
                              className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {availableUsers
                              .filter((u) =>
                                u.name
                                  .toLowerCase()
                                  .includes(signerSearch.toLowerCase()),
                              )
                              .slice(0, 15)
                              .map((r) => (
                                <button
                                  key={r.id}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setFinalSigner({
                                      id: r.id,
                                      name: r.name,
                                      role: r.org,
                                      initials: r.initials,
                                      color: "bg-purple-100 text-purple-700",
                                      dsApplied: false,
                                      dsLoading: false,
                                      isInvited: false,
                                    });
                                    setShowSignerDropdown(false);
                                    setSignerSearch("");
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 transition-colors text-left"
                                >
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-purple-100 text-purple-700">
                                    {r.initials}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                      {r.name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                      {r.org}
                                    </p>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>{" "}
                  </div>
                </div>

                <div className="px-5 py-3">
                  {finalSigner ? (
                    <div
                      className={cn(
                        "rounded-xl border transition-all",
                        finalSigner.dsApplied
                          ? "border-emerald-100 bg-emerald-50/40"
                          : "border-slate-100 bg-slate-50/40",
                      )}
                    >
                      <div className="flex items-center gap-2.5 px-3 py-2.5">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                            finalSigner.color,
                          )}
                        >
                          {finalSigner.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {finalSigner.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {finalSigner.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!finalSigner.isInvited ? (
                            <button
                              onClick={() =>
                                inviteSigner({
                                  docId: id,
                                  users: [Number(finalSigner.id)],
                                })
                              }
                              disabled={isSignerInviting}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              <Send size={11} />
                              <span>
                                {isSignerInviting ? "..." : "Пригласить"}
                              </span>
                            </button>
                          ) : finalSigner.dsApplied ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                              <Shield size={10} className="text-emerald-500" />
                              <span className="text-[10px] font-semibold text-emerald-600">
                                ЭЦП
                              </span>
                              <Check size={10} className="text-emerald-500" />
                            </div>
                          ) : (
                            <button
                              onClick={applyFinalDS}
                              disabled={finalSigner.dsLoading}
                              className={cn(
                                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                                finalSigner.dsLoading
                                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 shadow-sm",
                              )}
                            >
                              {finalSigner.dsLoading ? (
                                <Clock size={11} className="animate-spin" />
                              ) : (
                                <PenLine size={11} />
                              )}
                              <span>
                                {finalSigner.dsLoading
                                  ? "Подписываю..."
                                  : "ЭЦП"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {finalSigner.dsApplied && (
                        <div className="px-3 py-2.5 border-t border-emerald-100 bg-emerald-50/40 rounded-b-xl">
                          <DSStamp
                            name={finalSigner.name}
                            certSerial={`SN-2026-${finalSigner.initials}-84201`}
                            signedAt={new Date().toLocaleDateString("ru-RU")}
                            validUntil="с 20.03.2025 до 20.03.2026"
                          />
                          <AnimatePresence>
                            {!stampVisible && (
                              <motion.button
                                key="insert-btn"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                onClick={handleInsertStamp}
                                className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded-lg transition-colors shadow-sm"
                              >
                                <PenLine size={12} />
                                <span>Вставить ЭЦП в письмо</span>
                              </motion.button>
                            )}
                            {stampVisible && (
                              <motion.button
                                key="remove-btn"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                onClick={() => setStampVisible(false)}
                                className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 text-[11px] font-semibold rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
                              >
                                <X size={12} />
                                <span>Убрать ЭЦП из письма</span>
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                      <PenLine size={15} />
                      <span>Нажмите «Назначить»</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Mail size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        Входящие письма
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate">
                        Прикрепленные письма
                      </p>
                    </div>
                  </div>

                  {!!id && (
                    <div className="relative flex-shrink-0 flex items-center gap-1.5">
                      {attachedIncomingLetters.length > 0 && (
                        <button
                          onClick={handleAttachIncomingLetters}
                          className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Check size={12} />
                          <span>Сохранить</span>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setShowIncomingSearch(!showIncomingSearch)
                        }
                        className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Plus size={12} />
                        <span>Добавить</span>
                      </button>
                      <AnimatePresence>
                        {showIncomingSearch && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-72"
                            onBlur={() =>
                              setTimeout(
                                () => setShowIncomingSearch(false),
                                150,
                              )
                            }
                          >
                            <div className="p-2 border-b border-slate-100">
                              <input
                                type="text"
                                placeholder="Поиск писем..."
                                value={incomingLetterSearch}
                                onChange={(e) => {
                                  setIncomingLetterSearch(e.target.value);
                                }}
                                autoFocus
                                className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto py-1">
                              {availableIncomingLetters.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">
                                  Нет доступных писем
                                </p>
                              ) : (
                                availableIncomingLetters.map((letter: any) => (
                                  <button
                                    key={letter.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      addIncomingLetter(letter);
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
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3">
                  {attachedIncomingLetters.length === 0 ? (
                    <div className="py-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                      <Mail size={15} />
                      <span>Нет прикрепленных писем</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attachedIncomingLetters.map((letter, idx) => (
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
                              onClick={() => removeIncomingLetter(letter.id)}
                              className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {allVersions.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                  {/* === ШАПКА БЛОКА ИСТОРИИ ВЕРСИЙ С ФИКСИРОВАННЫМ СЕЛЕКТОМ === */}
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2.5 relative overflow-visible">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          История версий
                        </h3>
                        <p className="text-[10px] text-slate-500 truncate">
                          Всего версий: {allVersions.length}
                        </p>
                      </div>
                    </div>

                    {/* Кастомный выпадающий список с фиксированной шириной и тултипом */}
                    {versionAuthors.length > 0 && (
                      <div
                        className="relative flex-shrink-0 z-30"
                        onBlur={(e) => {
                          if (
                            !e.currentTarget.contains(e.relatedTarget as Node)
                          ) {
                            setTimeout(() => setShowAuthorDropdown(false), 150);
                          }
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setShowAuthorDropdown((v) => !v)}
                          // Добавили title для всплывающего тултипа при наведении
                          title={
                            selectedAuthorId
                              ? versionAuthors.find(
                                  (a) => a.id === String(selectedAuthorId),
                                )?.name
                              : "Все авторы"
                          }
                          // Зафиксировали ширину на w-40 (160px)
                          className={cn(
                            "w-30 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-left",
                            selectedAuthorId
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300",
                          )}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Search
                              size={12}
                              className={cn(
                                "flex-shrink-0",
                                selectedAuthorId
                                  ? "text-amber-500"
                                  : "text-slate-400",
                              )}
                            />
                            <span className="truncate block flex-1 pr-1">
                              {selectedAuthorId
                                ? versionAuthors.find(
                                    (a) => a.id === String(selectedAuthorId),
                                  )?.name
                                : "Все авторы"}
                            </span>
                          </div>
                          <ChevronDown
                            size={12}
                            className={cn(
                              "transition-transform text-slate-400 flex-shrink-0",
                              showAuthorDropdown && "rotate-180",
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {showAuthorDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.97 }}
                              className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-56 py-1"
                            >
                              {/* Вариант сброса фильтра */}
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSelectedAuthorId(null);
                                  setShowAuthorDropdown(false);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 font-medium",
                                  !selectedAuthorId
                                    ? "bg-slate-50 text-blue-600 font-bold"
                                    : "text-slate-700",
                                )}
                              >
                                <span>Все авторы</span>
                                {!selectedAuthorId && (
                                  <Check size={12} className="text-blue-500" />
                                )}
                              </button>

                              {/* Список авторов */}
                              {versionAuthors.map((auth) => {
                                const isSelected =
                                  String(selectedAuthorId) === auth.id;
                                return (
                                  <button
                                    type="button"
                                    key={auth.id}
                                    title={auth.name} // Тултип для длинных имён внутри самого выпадающего списка
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setSelectedAuthorId(auth.id);
                                      setShowAuthorDropdown(false);
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50",
                                      isSelected
                                        ? "bg-slate-50 text-blue-600 font-bold"
                                        : "text-slate-600",
                                    )}
                                  >
                                    <span className="truncate pr-2">
                                      {auth.name}
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-mono">
                                        {auth.count}
                                      </span>
                                      {isSelected && (
                                        <Check
                                          size={12}
                                          className="text-blue-500"
                                        />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                    {filteredVersions.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        Нет версий от этого автора
                      </p>
                    ) : (
                      filteredVersions.map((v) => {
                        const isCurrentActive = v.id === activeVersionId;
                        return (
                          <div
                            key={v.id}
                            onClick={() => handleSelectVersion(v.content, v.id)}
                            className={cn(
                              "flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer group text-xs gap-3",
                              isCurrentActive
                                ? "bg-blue-50/50 border-blue-500 shadow-sm"
                                : "bg-slate-50/40 border-slate-100 hover:bg-slate-50 hover:border-slate-200",
                            )}
                          >
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-white shadow-sm">
                              {v.author.initials}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={cn(
                                    "font-bold",
                                    isCurrentActive
                                      ? "text-blue-600"
                                      : "text-slate-700",
                                  )}
                                >
                                  Версия {v.versionNumber}
                                </span>
                                {v.is_selected && (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-medium rounded text-[9px] border border-emerald-100">
                                    Для подписи
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                                {v.author.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {v.author.position} •{" "}
                                {new Date(v.date).toLocaleString("ru-RU")}
                              </p>
                            </div>

                            <div
                              className="flex items-center gap-1.5 flex-shrink-0 mt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                id={`version-sign-${v.id}`}
                                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                checked={v.is_selected}
                                disabled={isSelectingVersion || isSigned}
                                onChange={() => handleSetVersionForSign(v.id)}
                              />
                              <label
                                htmlFor={`version-sign-${v.id}`}
                                className="text-[10px] text-slate-400 select-none cursor-pointer group-hover:text-slate-500"
                              >
                                Выбрать
                              </label>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
