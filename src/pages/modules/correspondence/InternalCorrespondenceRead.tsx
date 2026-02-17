import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useGetQuery, tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { generateMockWorkflow } from "@widgets/InternalCorrespondece/lib";
import { WorkflowParticipantsPanel } from "@widgets/InternalCorrespondece/ui/WorkflowParticipantsPanel";
import { Editor } from "../../../widgets/InternalCorrespondece/ui/Editor";

export const InternalCorrespondenceRead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const currentUserId = tokenControl.getUserId();

  const [isParticipantsPanelCollapsed, setIsParticipantsPanelCollapsed] =
    useState(false);

  // 1. Загружаем Workflow (подписанты, статусы)
  const { data: rawWorkflowData, isLoading: isWorkflowLoading } = useGetQuery({
    url: id ? ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", id) : "",
    useToken: true,
    options: { enabled: !!id },
  });

  // 2. Загружаем САМ документ (чтобы получить body), так как в workflow его нет
  const { data: docData, isLoading: isDocLoading } = useGetQuery({
    url: id ? ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", id) : "",
    useToken: true,
    options: { enabled: !!id },
  });

  // Подготавливаем данные для правой панели
  const workflowData = useMemo(() => {
    if (!rawWorkflowData) return null;
    return generateMockWorkflow(rawWorkflowData);
  }, [rawWorkflowData]);

  // Извлекаем контент для редактора из docData (initialData)
  const editorContent = useMemo(() => {
    // В ShowCorrespondencePage данные приходят как { data: { item: { body: ... } } } или похоже
    // Проверьте структуру вашего API. Обычно это docData?.data?.item?.body
    const item = docData?.data?.item || docData?.data || {};
    return item.body || "";
  }, [docData]);

  const isLoading = isWorkflowLoading || isDocLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f9fafb]">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f9fafb] overflow-hidden">
      {/* ЛЕВАЯ ЧАСТЬ: Только Редактор */}
      <div className="flex-1 h-full overflow-hidden relative">
        <div className="h-full w-full flex justify-center overflow-y-auto custom-scrollbar py-8">
          <Editor
            initialContent={editorContent}
            type="internal-read-only"
            isReadOnly={true}
            isIncoming={true}
            isReadPage={true}
          />
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Панель участников (только просмотр) */}
      <div className="lg:block h-full">
        <WorkflowParticipantsPanel
          workflowData={workflowData}
          isCollapsed={isParticipantsPanelCollapsed}
          toggleCollapse={() =>
            setIsParticipantsPanelCollapsed(!isParticipantsPanelCollapsed)
          }
          currentUserId={currentUserId}
          isReadOnly={true}
          onSign={() => {}}
          onApprove={() => {}}
          isSigning={false}
          isReadPage={true}
        />
      </div>
    </div>
  );
};
