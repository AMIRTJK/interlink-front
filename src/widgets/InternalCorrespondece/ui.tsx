import dayjsLib from "dayjs";
import {
  tokenControl,
  useGetQuery,
  useModalState,
  useMutationQuery,
} from "@shared/lib";
import { ActionToolbar, If, ISearchItem } from "@shared/ui";
import { DrawerActionsModal } from "@widgets/DrawerActionsModal";
import { TopNavigation } from "./ui/TopNavigation";
import { useEffect, useMemo, useState } from "react";
import { DocumentHeaderForm, Recipient } from "./ui/DocumentHeaderForm";
import { Form, Modal } from "antd";
import { useNavigate, useParams } from "react-router";
// import { DocumentEditor } from "./ui/DocumentEditor";
import {
  CreateInternalRequest,
  InternalCorrespondenceResponse,
} from "@entities/correspondence";
import { ApiRoutes } from "@shared/api";
import { WorkflowParticipantsPanel } from "./ui/WorkflowParticipantsPanel";
import { generateMockWorkflow } from "./lib";
import { Editor } from "./ui/Editor";
import { AppRoutes } from "@shared/config";

interface IProps {
  mode: "create" | "show";
  initialData?: any;
  isLoading?: boolean;
  type: string;
}

export const InternalCorrespondece: React.FC<IProps> = ({
  mode,
  initialData,
  isLoading,
  type,
}) => {
  const { id } = useParams<{ id: string }>();

  const currentUserId = tokenControl.getUserId();

  const afterSentStatusButton = initialData?.status === "sent";

  const isDraftCreated = !!id || !!initialData;

  const navigate = useNavigate();
  const { open, close, isOpen } = useModalState();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isParticipantsPanelCollapsed, setIsParticipantsPanelCollapsed] =
    useState(false);

  const [initialRecipients, setInitialRecipients] = useState<any[]>([]);
  const [initialCC, setInitialCC] = useState<any[]>([]);
  // Состояние для начального контента редактора
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

  const currentUserApprovalId = useMemo(() => {
    const approvals = workflowData?.data?.approvals || [];

    const foundApproval = approvals.find(
      (item: any) => String(item.approver?.id) === String(currentUserId),
    );

    return foundApproval ? String(foundApproval.id) : "";
  }, [workflowData, currentUserId]);

  const isSigned = useMemo(() => {
    const signatures = rawWorkflowData?.data?.signatures || [];
    if (!signatures || !Array.isArray(signatures)) {
      return false;
    }
    console.log(signatures);

    return signatures.some((s: any) => s.status === "signed");
  }, [rawWorkflowData]);

  const isIncoming = type === "internal-incoming";

  const isReadOnly = isSigned;

  const canSign = useMemo(() => {
    if (!preloadData || !Array.isArray(preloadData)) return false;
    return preloadData.some((p: any) => p.name === "signatures.payload");
  }, [preloadData]);

  // Мутация подтверждения подписи
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
      // queryOptions: {
      //   onSuccess: () => {
      //     navigate("/modules/correspondence/internal/outgoing");
      //   },
      // },
    });

  const handleSign = async () => {
    try {
      const payloadData = await signaturesPayloadAsync({ action: "sign" });

      console.log("Payload received:", payloadData);

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

  const handleApprove = async () => {
    if (!canSign) return;

    try {
      // const payloadData = await signaturesPayloadAsync({ action: "sign" });

      approvalsConfirm({
        status: "approved",
      });
    } catch (error) {
      console.error("Ошибка при процессе подписания:", error);
    }
  };

  const handleSendClick = () => {
    sendCorrespondence({});
  };

  const handleReply = () => {
    close();
    navigate(AppRoutes.INTERNAL_OUTGOING_CREATE);
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
          console.log("Server response:", data);

          const newId = data?.id;

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
        invalidate: [ApiRoutes.GET_INTERNAL_BY_ID],
      },
    });

  const onSaveClick = async () => {
    try {
      // Валидируем форму
      const values = await form.validateFields();

      const requestPayload = {
        subject: values.subject,
        body: editorBody,
        recipients: {
          to: values.recipients,
          cc: values.copy,
        },
      };

      if (id) {
        // Если ID есть - обновляем
        console.log("Обновление черновика:", id, requestPayload);
        updateDraft(requestPayload);
      } else {
        // Если ID нет - создаем
        console.log("Создание черновика:", requestPayload);
        createDraft(requestPayload, {});
      }
    } catch (errorInfo) {
      console.log("Ошибка валидации:", errorInfo);
    }
  };

  // ЭФФЕКТ: Заполнение данных при просмотре
  useEffect(() => {
    if (initialData) {
      // 1. Дата
      let dateValue = dayjsLib();
      const dateString = initialData.doc_date || initialData.created_at;
      if (dateString) {
        dateValue = dayjsLib(dateString);
      }

      // 2. Получатели
      const rawRecipients = initialData.recipients || [];

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

      // 3. Сеттим в форму
      form.setFieldsValue({
        subject: initialData.subject,
        number: initialData.reg_number || "Не указано",
        date: dateValue,
        recipients: toRecipients.map((r) => r.id),
        copy: ccRecipients.map((r) => r.id),
      });

      // 4. Стейты для UI
      setInitialRecipients(toRecipients);
      setInitialCC(ccRecipients);

      console.log(initialData);

      // 5. Редактор
      if (initialData.body) {
        setInitialEditorContent(initialData.body);
        setEditorBody(initialData.body);
      }
    }
  }, [initialData, form]);

  return (
    <div
      className={`relative min-h-screen bg-[#f9fafb] ${isOpen ? "max-h-[768px] overflow-hidden" : ""}`}
    >
      <TopNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        type={type}
      />

      <div className="flex w-full justify-between">
        <main className="flex-1 mx-auto max-w-250  md:py-2 transition-all duration-300">
          <div className="flex flex-col gap-4 ml-10 mr-10">
            {/* <div className="max-w-4xl flex flex-col gap-4 mx-auto px-8 py-12"> */}
            <DocumentHeaderForm
              isDarkMode={isDarkMode}
              form={form}
              initialRecipients={initialRecipients}
              initialCC={initialCC}
              isIncoming={isIncoming}
              isReadOnly={isReadOnly}
            />

            <div className="flex gap-3 items-stretch">
              <ActionToolbar
                setIsInspectorOpen={open}
                setShowPreview={() => setIsPreviewOpen(true)}
                handleSend={handleSendClick}
                onSendLoading={isSending}
                onSave={onSaveClick}
                onSaveLoading={isCreating || isUpdating}
                isActionsEnabled={isDraftCreated}
                isIncoming={isIncoming}
                isReadOnly={isReadOnly}
                isSentStatusEnabled={afterSentStatusButton}
              />

              <div className="flex-1 min-w-0">
                <Editor
                  onChange={setEditorBody}
                  initialContent={initialEditorContent}
                  type={type}
                  isIncoming={isIncoming}
                  isReadOnly={isReadOnly}
                />
              </div>
            </div>
          </div>
        </main>
        <If is={isDraftCreated}>
          <div className="hidden lg:block shrink-0 z-10 h-[calc(100vh-64px)] sticky top-[64px]">
            <WorkflowParticipantsPanel
              workflowData={workflowData}
              isCollapsed={isParticipantsPanelCollapsed}
              toggleCollapse={() =>
                setIsParticipantsPanelCollapsed(!isParticipantsPanelCollapsed)
              }
              onSign={handleSign}
              onApprove={handleApprove}
              isSigning={
                isPayloadLoading || isConfirming || isApprovalsConfirming
              }
              currentUserId={currentUserId}
            />
          </div>
        </If>
      </div>
      <DrawerActionsModal
        open={isOpen}
        onClose={close}
        docId={id}
        onReply={handleReply}
        onRefresh={refetchWorkflow}
        isIncoming={isIncoming}
        isReadOnly={isReadOnly}
      />

      <Modal
        title="Предварительный просмотр"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        centered
        width="100%"
        destroyOnClose
        bodyStyle={{ height: "90vh", padding: 0, overflow: "hidden" }}
      >
        <div className="flex justify-center">
          <Editor
            onChange={setEditorBody}
            initialContent={initialEditorContent || editorBody}
            type={type}
            isPreviewOpen={isPreviewOpen}
          />
        </div>
      </Modal>
    </div>
  );
};
