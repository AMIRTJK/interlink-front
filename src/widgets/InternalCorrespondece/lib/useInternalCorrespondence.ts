import dayjsLib from "dayjs";
import QRCode from "qrcode";
import { useRef, useState, useMemo, useEffect } from "react";
import { Form } from "antd";
import { useNavigate, useParams } from "react-router";
import {
  tokenControl,
  useGetQuery,
  useModalState,
  useMutationQuery,
} from "@shared/lib";
import { CORRESPONDENCE_INVALIDATE_KEYS, AppRoutes } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { CreateInternalRequest } from "@entities/correspondence";
import { generateMockWorkflow } from "./index";
import { EditorHandle } from "../ui/Editor";
import { Recipient } from "../ui/DocumentHeaderForm";

interface UseInternalCorrespondenceOptions {
  initialData?: any;
  type: string;
}

export const useInternalCorrespondence = ({
  initialData,
  type,
}: UseInternalCorrespondenceOptions) => {
  const editorRef = useRef<EditorHandle>(null);
  const { id } = useParams<{ id: string }>();

  const currentUserId = tokenControl.getUserId();
  const afterSentStatusButton = initialData?.item?.status === "sent";
  const isDraftCreated = !!id || !!initialData;

  const navigate = useNavigate();
  const { open, close, isOpen } = useModalState();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    tokenControl.getDarkMode(),
  );

  const [isParticipantsPanelCollapsed, setIsParticipantsPanelCollapsed] =
    useState(false);

  const [initialRecipients, setInitialRecipients] = useState<any[]>([]);
  const [initialCC, setInitialCC] = useState<any[]>([]);
  const [initialEditorContent, setInitialEditorContent] = useState<string>("");

  const [form] = Form.useForm();
  const [editorBody, setEditorBody] = useState<string>("");

  const {
    data: rawWorkflowData,
    refetch: refetchWorkflow,
    preloadData,
  } = useGetQuery({
    url: id ? ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", id) : "",
    useToken: true,
    options: { enabled: !!id },
    preload: true,
  });

  const workflowData = useMemo(() => {
    if (!rawWorkflowData) return null;
    return generateMockWorkflow(rawWorkflowData);
  }, [rawWorkflowData]);

  const { data: versionsResponse } = useGetQuery({
    url: id ? ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", id) : "",
    useToken: true,
    options: { enabled: !!id },
  });

  const versions = useMemo(() => {
    const rawVersions = versionsResponse?.data?.versions || [];

    return rawVersions.map((v: any) => ({
      id: v.id,
      versionNumber: v.version,
      content: v.body,
      date: v.created_at,
      authorId: v.author?.id,
      is_selected: v.is_selected,
      is_current_signed: v.is_current_signed,
    }));
  }, [versionsResponse]);

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

  const currentUserApprovalId = useMemo(() => {
    const approvals = workflowData?.data?.approvals || [];

    const foundApproval = approvals.find(
      (item: any) => String(item.approver?.id) === String(currentUserId),
    );

    return foundApproval ? String(foundApproval.id) : "";
  }, [workflowData, currentUserId]);

  const canSign = useMemo(() => {
    if (!preloadData || !Array.isArray(preloadData)) return false;
    return preloadData.some((p: any) => p.name === "signatures.payload");
  }, [preloadData]);

  const { mutate: signaturesConfirm, isPending: isConfirming } =
    useMutationQuery<any>({
      url: ApiRoutes.INTERNAL_SIGNATURES_CONFIRM.replace(
        ":id",
        String(id || ""),
      ),
      method: "POST",
      messages: {
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", String(id || "")),
          ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id || "")),
          ...CORRESPONDENCE_INVALIDATE_KEYS,
        ],
      },
      preload: true,
      preloadConditional: ["signatures.confirm"],
    });

  const { mutate: approvalsConfirm, isPending: isApprovalsConfirming } =
    useMutationQuery<any>({
      url: ApiRoutes.INTERNAL_APPROVALS_CONFIRM.replace(
        ":id",
        String(currentUserApprovalId || ""),
      ),
      method: "PATCH",
      messages: {
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", String(id || "")),
          ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id || "")),
        ],
      },
      preload: true,
      preloadConditional: ["internal_correspondence.approve"],
    });

  const { mutateAsync: signaturesPayloadAsync, isPending: isPayloadLoading } =
    useMutationQuery<any>({
      url: ApiRoutes.INTERNAL_SIGNATURES_PAYLOAD.replace(
        ":id",
        String(id || ""),
      ),
      method: "POST",
      preload: true,
      preloadConditional: ["signatures.payload"],
    });

  const { mutate: sendCorrespondence, isPending: isSending } =
    useMutationQuery<any>({
      url: ApiRoutes.SEND_INTERNAL.replace(":id", String(id || "")),
      method: "POST",
      messages: {
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW,
          ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
        ],
      },
    });

  const creator = initialData?.item?.creator;

  const handleSign = async () => {
    try {
      const payloadData = await signaturesPayloadAsync({ action: "sign" });

      if (payloadData?.signature_id && payloadData?.nonce) {
        signaturesConfirm({
          signature_id: payloadData.signature_id,
          nonce: payloadData.nonce,
          method: "simple",
        });
      } else {
        console.error(
          "Отсутствуют signature_id или nonce в ответе",
          payloadData,
        );
      }
    } catch (error) {
      console.error("Ошибка при процессе подписания:", error);
    }
  };

  const handleApprove = async (payload?: { status?: "approved" | "returned"; note?: string }) => {
    try {
      const status = payload?.status || "approved";
      const rawNote = payload?.note?.trim();
      const note = rawNote && rawNote.length > 0 ? rawNote : null;

      approvalsConfirm({
        status,
        note,
      });
    } catch (error) {
      console.error("Ошибка при процессе согласования:", error);
    }
  };

  const handleSendClick = () => {
    sendCorrespondence({});
  };

  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);

  const { mutate: acknowledge } = useMutationQuery({
    url: id ? ApiRoutes.ACKNOWLEDGE_INTERNAL.replace(":id", String(id)) : "",
    method: "POST",
    messages: {
      success: "Ознакомление сохранено",
      invalidate: [
        ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
        ApiRoutes.GET_INTERNAL_INCOMING,
        ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", String(id || "")),
      ],
    },
  });

  const acknowledgedUsers = useMemo(() => {
    return initialData?.item?.acknowledged_users || rawWorkflowData?.data?.acknowledged_users || [];
  }, [initialData, rawWorkflowData]);

  const isAlreadyAcknowledged = useMemo(() => {
    const fromAckUsers = acknowledgedUsers.some(
      (u: any) => String(u.user_id || u.user?.id || u.id) === String(currentUserId),
    );
    const fromRecipients = initialData?.item?.recipients?.some(
      (r: any) => r.read_at !== null && r.read_at !== undefined,
    );
    return fromAckUsers || fromRecipients || initialData?.item?.is_unread === false;
  }, [acknowledgedUsers, currentUserId, initialData]);

  const handleAcknowledge = () => {
    if (id) acknowledge({});
  };

  const handleReply = () => {
    close();
    navigate(AppRoutes.INTERNAL_OUTGOING_CREATE, {
      state: {
        source_correspondence_id: Number(id),
        link_type: "reply",
        subject: initialData?.item?.subject ? `Re: ${initialData.item.subject}` : "",
        recipient_id: initialData?.item?.creator?.id,
      },
    });
  };

  const handleForward = () => {
    close();
    navigate(AppRoutes.INTERNAL_OUTGOING_CREATE, {
      state: {
        source_correspondence_id: Number(id),
        link_type: "forward",
        subject: initialData?.item?.subject ? `Fwd: ${initialData.item.subject}` : "",
        body: initialData?.item?.body
          ? `<p><br></p><p>---------- Пересылаемое сообщение ----------<br><strong>От:</strong> ${initialData.item.creator?.full_name || "Не указан"}<br><strong>Тема:</strong> ${initialData.item.subject || ""}</p>${initialData.item.body}`
          : "",
      },
    });
  };

  const handleOpenAssignment = () => {
    close();
    setIsCreateAssignmentOpen(true);
  };

  const { mutate: createDraft, isPending: isCreating } =
    useMutationQuery<CreateInternalRequest>({
      url: ApiRoutes.CREATE_INTERNAL,
      method: "POST",
      messages: {
        invalidate: [ApiRoutes.GET_INTERNAL_DRAFTS],
      },
      queryOptions: {
        onSuccess: (data: any) => {
          const newId = data?.item?.id;

          if (newId) {
            navigate(`/modules/correspondence/internal/outgoing/${newId}`);
          } else {
            console.warn("ID не найден в ответе:", data);
          }
        },
      },
    });

  const { mutate: updateDraft, isPending: isUpdating } =
    useMutationQuery<CreateInternalRequest>({
      url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
      method: "PUT",
      messages: {
        invalidate: [
          ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
          ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id || "")),
        ],
        onSuccessCb: () => {
          isVersionContentInit.current = false;
        },
      },
    });

  const initialActiveVersion =
    versions.length > 0 ? versions[versions.length - 1].id : null;

  const [activeVersionId, setActiveVersionId] = useState<
    string | number | null
  >(initialActiveVersion);

  const isVersionContentInit = useRef(false);

  const isSigned = useMemo(() => {
    const signatures = rawWorkflowData?.data?.signatures || [];
    if (!signatures || !Array.isArray(signatures)) {
      return false;
    }

    return signatures.some((s: any) => s.status === "signed");
  }, [rawWorkflowData]);

  const latestVersionId =
    versions.length > 0 ? versions[versions.length - 1].id : null;

  const isOldVersionSelected =
    activeVersionId !== null && activeVersionId !== latestVersionId;

  const isIncoming = type === "internal-incoming";
  const isReadOnly = isSigned || isOldVersionSelected;

  const selectedVersionForSign = versions.find(
    (v: any) => v.is_selected === true,
  );

  const hasQRInSelectedVersion = useMemo(() => {
    if (!selectedVersionForSign || !selectedVersionForSign.content) {
      return false;
    }
    const qrRegex = /<img[^>]+src=["']data:image\/[^"']+["']/i;
    return qrRegex.test(selectedVersionForSign.content);
  }, [selectedVersionForSign]);

  const handleSelectVersion = (content: string, versionId: string | number) => {
    if (editorRef.current) {
      editorRef.current.setContent(content);
      setEditorBody(content);
      setActiveVersionId(versionId);
    }
  };

  const onSaveClick = async () => {
    try {
      const values = await form.validateFields();

      const requestPayload: any = {
        subject: values.subject,
        body: editorBody,
        recipients: {
          to: values.recipients,
          cc: values.copy,
        },
      };

      if (typeof values.folder === "number") {
        requestPayload.folder_id = values.folder;
      } else if (typeof values.folder === "string") {
        requestPayload.system_folder = values.folder;
      }

      if (id) {
        updateDraft(requestPayload);
      } else {
        createDraft(requestPayload);
      }
    } catch (errorInfo) {
      console.log("Ошибка валидации:", errorInfo);
    }
  };

  const handleInsertQR = async () => {
    try {
      const readUrl = `${window.location.origin}/modules/correspondence/internal/read/${id}`;

      const qrDataUrl = await QRCode.toDataURL(readUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const imgHtml = `<img src="${qrDataUrl}" alt="Scan to read" />`;

      if (editorRef.current) {
        editorRef.current.insertHtml(imgHtml);
      }
    } catch (err) {
      console.error("Ошибка при генерации QR-кода", err);
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      tokenControl.setDarkMode(newMode);
      return newMode;
    });
  };

  useEffect(() => {
    if (initialData) {
      const item = initialData.item || [];
      let dateValue = dayjsLib();
      const dateString = item.doc_date || item.created_at;
      if (dateString) {
        dateValue = dayjsLib(dateString);
      }

      const rawRecipients = item.recipients || [];

      const toRecipients: Recipient[] = rawRecipients
        .filter((r: any) => r.type === "to")
        .map((r: any) => ({
          id: r.user.id,
          full_name: r.user.full_name,
          photo_path: r.user.photo_path || "",
          position: r.user.position || "",
        }));

      const ccRecipients: Recipient[] = rawRecipients
        .filter((r: any) => r.type === "cc")
        .map((r: any) => ({
          id: r.user.id,
          full_name: r.user.full_name,
          photo_path: r.user.photo_path || "",
          position: r.user.position || "",
        }));

      form.setFieldsValue({
        subject: item.subject,
        number: item.reg_number || "Не указано",
        date: dateValue,
        recipients: toRecipients.map((r) => r.id),
        copy: ccRecipients.map((r) => r.id),
        folder: initialData.my_folder,
      });

      setInitialRecipients(toRecipients);
      setInitialCC(ccRecipients);

      if (item.body) {
        setInitialEditorContent(item.body);
        setEditorBody(item.body);
      }
    }
  }, [initialData, form]);

  useEffect(() => {
    if (versions.length > 0 && !isVersionContentInit.current) {
      const targetVersion = versions[versions.length - 1];

      setActiveVersionId(targetVersion.id);

      if (editorRef.current && targetVersion.content) {
        editorRef.current.setContent(targetVersion.content);
      }

      setEditorBody(targetVersion.content || "");
      setInitialEditorContent(targetVersion.content || "");

      isVersionContentInit.current = true;
    }
  }, [versions]);

  return {
    id,
    editorRef,
    currentUserId,
    afterSentStatusButton,
    isDraftCreated,
    open,
    close,
    isOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    isDarkMode,
    handleToggleDarkMode,
    isParticipantsPanelCollapsed,
    setIsParticipantsPanelCollapsed,
    initialRecipients,
    initialCC,
    initialEditorContent,
    form,
    editorBody,
    setEditorBody,
    refetchWorkflow,
    workflowData,
    versions,
    handleSetVersionForSign,
    isSelectingVersion,
    canSign,
    isSigning: isPayloadLoading || isConfirming || isApprovalsConfirming,
    isSending,
    creator,
    handleSign,
    handleApprove,
    handleSendClick,
    isCreateAssignmentOpen,
    setIsCreateAssignmentOpen,
    isAlreadyAcknowledged,
    handleAcknowledge,
    handleReply,
    handleForward,
    handleOpenAssignment,
    isCreating,
    isUpdating,
    activeVersionId,
    isSigned,
    isIncoming,
    isReadOnly,
    hasQRInSelectedVersion,
    handleSelectVersion,
    onSaveClick,
    handleInsertQR,
  };
};
