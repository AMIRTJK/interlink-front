import React, { useState } from "react";
import { If, VisorInviteNoticeModal } from "@shared/ui";
import { downloadDocumentPdf } from "./lib";
import { EditorToolbar } from "./EditorToolbar";
import { IncomingPreviewModal } from "./IncomingPreviewModal";
import { FilePreviewModal } from "@features/Profile";
import {
  createApiFileFromAttachedFile,
  downloadAttachment,
  CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE,
  RelatedDocsBlock,
} from "@widgets/CreateInternalCorrespondence";

import { RegistryItem } from "./incomingView/incomingViewModel";
import { useIncomingViewData } from "./incomingView/useIncomingViewData";
import { useIncomingViewState } from "./incomingView/useIncomingViewState";
import { IncomingViewHeader } from "./incomingView/IncomingViewHeader";
import { IncomingDetailsAccordion } from "./incomingView/IncomingDetailsAccordion";
import { IncomingViewCanvasPanels } from "./incomingView/IncomingViewCanvasPanels";

export const InternalCorrespondenceIncomingView = ({
  item,
  onBack,
}: {
  item: RegistryItem;
  onBack: () => void;
}) => {
  const [activeVersionId, setActiveVersionId] = useState<
    number | string | null
  >(null);

  const data = useIncomingViewData(item, activeVersionId);

  const state = useIncomingViewState({
    item,
    can: data.userContext.can,
    canCreateAssignment: data.canCreateAssignment,
    canInviteVisor: data.canInviteVisor,
    visors: data.visors,
    isVisorsAvailable: data.isVisorsAvailable,
    assignmentsCount: data.assignmentsCount,
    mappedAttachments: data.mappedAttachments,
    isResolvingBody: data.isResolvingBody,
    documentBody: data.documentBody,
    senderName: data.senderName,
    formattedSentDate: data.formattedSentDate,
    inboundNumber: data.inboundNumber,
    seenMutate: data.seenMutate,
    activeVersionId,
    setActiveVersionId,
  });

  return (
    <div
      ref={state.rootScrollRef}
      className="flex-1 overflow-y-auto bg-[#F8FAFC] h-screen w-full flex flex-col"
    >
      {/* Просмотр: полноэкранное модальное окно */}
      <If is={state.showPreview}>
        <IncomingPreviewModal
          subject={item.subject || ""}
          inboundNumber={data.inboundNumber}
          lastModified={data.formattedSentDate}
          html={data.documentBody}
          fontSize={14}
          onClose={() => state.setShowPreview(false)}
          signatures={data.signatures}
          approvals={data.approvals}
          versions={data.docVersions}
          activeVersionId={state.activeVersionId}
          onSelectVersion={(versionId) => {
            state.setActiveVersionId(versionId);
          }}
          panelsInToolbar={state.panelsInToolbar}
          onTogglePanelsInToolbar={state.setPanelsInToolbar}
          attachments={item.attachments || []}
          correspondenceId={item.id}
          canCreateAssignment={data.canCreateAssignment}
        />
      </If>

      {/* Верхняя шапка страницы */}
      <IncomingViewHeader
        onBack={onBack}
        onOpenPreview={() => state.setShowPreview(true)}
        isResolvingBody={data.isResolvingBody}
        repliedUsers={data.repliedUsers}
        forwardedUsers={data.forwardedUsers}
        acknowledgedUsers={data.acknowledgedUsers}
        showActionMenu={state.showActionMenu}
        onToggleActionMenu={() => state.setShowActionMenu((v) => !v)}
        actionMenuRef={state.actionMenuRef}
        visibleActionItems={data.visibleActionItems}
        onActionClick={state.handleAction}
        onDownloadPdf={() =>
          downloadDocumentPdf(data.documentBody, 14, item.subject || "")
        }
      />

      {/* Детали письма (аккордеон) */}
      <IncomingDetailsAccordion
        item={item}
        detailsOpen={state.detailsOpen}
        onToggleDetails={() => state.setDetailsOpen((v) => !v)}
        senderName={data.senderName}
        senderInitials={data.senderInitials}
        inboundNumber={data.inboundNumber}
        formattedSentDate={data.formattedSentDate}
        ccRecipientsList={data.ccRecipientsList}
      />

      {/* Связанные документы */}
      <If is={data.relatedDocs.length > 0}>
        <RelatedDocsBlock
          variant="fullWidth"
          relatedDocuments={data.relatedDocs}
          currentDoc={{
            id: item.id,
            kind: "incoming",
            date: item.sent_at || (item as any).doc_date || (item as any).created_at,
            reg_number: item.reg_number,
            subject: item.subject,
          }}
        />
      </If>

      {/* Тулбар просмотра и панели разделов */}
      <div ref={state.stickyHeaderRef} className="sticky top-0 z-[70] bg-white">
        <EditorToolbar
          panelsInToolbar={state.panelsInToolbar}
          onTogglePanelsInToolbar={state.setPanelsInToolbar}
          sections={state.sections}
        />
      </div>

      {/* Рабочая область: холст и боковые панели */}
      <IncomingViewCanvasPanels
        isResolvingBody={data.isResolvingBody}
        documentBody={data.documentBody}
        canvasRef={state.canvasRef}
        panelsGroupRef={state.panelsGroupRef}
        panelsInToolbar={state.panelsInToolbar}
        signersOpen={state.signersOpen}
        openSigners={state.openSigners}
        setSignersOpen={state.setSignersOpen}
        signatures={data.signatures}
        approversOpen={state.approversOpen}
        openApprovers={state.openApprovers}
        setApproversOpen={state.setApproversOpen}
        approvals={data.approvals}
        showTaskPanel={state.showTaskPanel}
        setShowTaskPanel={state.setShowTaskPanel}
        openTask={state.openTask}
        canCreateAssignment={data.canCreateAssignment}
        assignmentsCount={data.assignmentsCount}
        isVisorsAvailable={data.isVisorsAvailable}
        visorsOpen={state.visorsOpen}
        openVisors={state.openVisors}
        setVisorsOpen={state.setVisorsOpen}
        visors={data.visors}
        attachmentsOpen={state.attachmentsOpen}
        openAttachments={state.openAttachments}
        setAttachmentsOpen={state.setAttachmentsOpen}
        mappedAttachments={data.mappedAttachments}
        onPreviewAttachment={(file) => state.setPreviewAttachment(file)}
        onDownloadAttachment={(file) => downloadAttachment(file)}
        versionsOpen={state.versionsOpen}
        openVersions={state.openVersions}
        setVersionsOpen={state.setVersionsOpen}
        docVersions={data.docVersions}
        activeVersionId={state.activeVersionId}
        onSelectVersion={(versionId) => state.setActiveVersionId(versionId)}
        correspondenceId={item.id}
        loadingVisors={data.loadingVisors}
        canInviteVisor={data.canInviteVisor}
      />

      {/* Модальное окно предпросмотра вложения */}
      <If is={!!state.previewAttachment}>
        <FilePreviewModal
          file={createApiFileFromAttachedFile(state.previewAttachment!)}
          onClose={() => state.setPreviewAttachment(null)}
          unavailableNotice={CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE}
        />
      </If>

      {/* Модалка уведомления о необходимости визирования */}
      <VisorInviteNoticeModal
        open={state.showVisorNotice}
        onClose={() => state.setShowVisorNotice(false)}
        onInviteVisor={data.canInviteVisor ? state.openVisors : undefined}
      />
    </div>
  );
};
