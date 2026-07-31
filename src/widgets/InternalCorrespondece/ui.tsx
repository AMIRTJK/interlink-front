import { ActionToolbar, If } from "@shared/ui";
import { DrawerActionsModal } from "@widgets/DrawerActionsModal";
import { TopNavigation } from "./ui/TopNavigation";
import { DocumentHeaderForm } from "./ui/DocumentHeaderForm";
import { WorkflowParticipantsPanel } from "./ui/WorkflowParticipantsPanel";
import { Editor } from "./ui/Editor";
import { CreateAssignmentModal } from "./ui/assignments/CreateAssignmentModal";
import { PreviewModal } from "./ui/PreviewModal";
import { useInternalCorrespondence } from "./lib/useInternalCorrespondence";

interface IProps {
  mode: "create" | "show";
  initialData?: any;
  isLoading?: boolean;
  type: string;
  showHeader?: boolean;
}

export const InternalCorrespondece: React.FC<IProps> = ({
  initialData,
  type,
}) => {
  const {
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
    isSigning,
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
  } = useInternalCorrespondence({ initialData, type });

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#111827]!" : "bg-[#f9fafb]!"
      } ${isOpen ? "max-h-[768px] overflow-hidden" : ""}`}
    >
      <TopNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={handleToggleDarkMode}
        type={type}
      />

      <div className="flex w-full justify-between">
        <main className="flex-1 mx-auto max-w-250 md:py-2 transition-all duration-300">
          <div className="flex flex-col gap-4 ml-10 mr-10">
            <DocumentHeaderForm
              isDarkMode={isDarkMode}
              form={form}
              initialRecipients={initialRecipients}
              initialCC={initialCC}
              isIncoming={isIncoming}
              isReadOnly={isReadOnly}
              creator={creator}
              relationType={initialData?.item?.relation_type}
              relationLabel={initialData?.item?.relation_label}
              sourceDocument={initialData?.item?.source_document}
            />

            <div className="flex gap-3 items-stretch">
              <ActionToolbar
                isDarkMode={isDarkMode}
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
                handleInsertQR={handleInsertQR}
              />

              <div className="flex-1 min-w-0">
                <Editor
                  isDarkMode={isDarkMode}
                  ref={editorRef}
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
              isDarkMode={isDarkMode}
              workflowData={workflowData}
              isCollapsed={isParticipantsPanelCollapsed}
              toggleCollapse={() =>
                setIsParticipantsPanelCollapsed(!isParticipantsPanelCollapsed)
              }
              onSign={handleSign}
              onApprove={handleApprove}
              isSigning={isSigning}
              currentUserId={currentUserId}
              isReadOnly={isReadOnly}
              isSignedDocument={isSigned}
              hasQRInSelectedVersion={hasQRInSelectedVersion}
              onSelectVersion={handleSelectVersion}
              documentCreator={creator}
              versions={versions}
              onSetVersionForSign={handleSetVersionForSign}
              isSelectingVersion={isSelectingVersion}
              activeVersionId={activeVersionId}
            />
          </div>
        </If>
      </div>
      <DrawerActionsModal
        isDarkMode={isDarkMode}
        open={isOpen}
        onClose={close}
        docId={id}
        onReply={handleReply}
        onForward={handleForward}
        onAcknowledge={handleAcknowledge}
        isAcknowledged={isAlreadyAcknowledged}
        onOpenAssignment={handleOpenAssignment}
        onRefresh={refetchWorkflow}
        isIncoming={isIncoming}
        isReadOnly={isReadOnly}
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        isDarkMode={isDarkMode}
        initialContent={initialEditorContent || editorBody}
        onChange={setEditorBody}
        type={type}
      />

      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setIsCreateAssignmentOpen(false)}
        docId={id || ""}
        isDarkMode={isDarkMode}
        onSuccess={() => {
          refetchWorkflow();
        }}
      />
    </div>
  );
};
