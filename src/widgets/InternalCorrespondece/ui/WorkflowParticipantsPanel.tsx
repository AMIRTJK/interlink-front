import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  PaperClipOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  ApprovalVersionNotice,
  resolveApprovalVersionId,
} from "@entities/correspondence";
import { If, Tooltip } from "@shared/ui";
import { Avatar, Button, Checkbox, ConfigProvider, Divider, theme } from "antd";
import { useMemo, useState } from "react";
import { AssignmentsSection } from "./assignments/AssignmentsSection";
import { SignatureDetailsModal } from "./SignatureDetailsModal";
import { ApprovalConfirmModal } from "./workflowParticipantsPanel/ApprovalConfirmModal";
import { FullHistoryModal } from "./workflowParticipantsPanel/FullHistoryModal";
import { SidebarDocumentRow } from "./workflowParticipantsPanel/SidebarDocumentRow";
import { SidebarParticipantRow } from "./workflowParticipantsPanel/SidebarParticipantRow";
import { SidebarVersionRow } from "./workflowParticipantsPanel/SidebarVersionRow";
import {
  MAX_VISIBLE_APPROVERS,
  MAX_VISIBLE_DOCS,
  MAX_VISIBLE_SIGNERS,
  MAX_VISIBLE_VERSIONS,
} from "./workflowParticipantsPanel/workflowParticipantsModel";

export const WorkflowParticipantsPanel = ({
  workflowData,
  isCollapsed,
  toggleCollapse,
  onSign,
  onApprove,
  isSigning,
  currentUserId,
  isReadOnly,
  isSignedDocument,
  isReadPage = false,
  hasQRInSelectedVersion,
  versions = [],
  activeVersionId,
  onSelectVersion,
  documentCreator,
  isDarkMode,
  onSetVersionForSign,
  isSelectingVersion,
  docId,
  approvalVersionSummary,
  approvalVersionWarning,
  signVersionWarning,
  approvedCountByVersion,
}: any) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    tab: string;
  }>({
    isOpen: false,
    tab: "participants",
  });

  const [signatureModal, setSignatureModal] = useState<{
    isOpen: boolean;
    data: any | null;
  }>({ isOpen: false, data: null });

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");

  const handleOpenApproveModal = () => {
    setApprovalNote("");
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = () => {
    onApprove({
      status: "approved",
      note: approvalNote.trim() || undefined,
    });
    setIsApprovalModalOpen(false);
    setApprovalNote("");
  };

  // Из полной истории согласование идёт через ту же модалку подтверждения:
  // иначе предупреждение о расхождении версий проходило бы мимо пользователя.
  const handleRequestApproveFromHistory = () => {
    closeModal();
    handleOpenApproveModal();
  };

  const openSignatureModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    e.preventDefault();
    setSignatureModal({ isOpen: true, data: item });
  };

  const openModal = (tab: "participants" | "documents" | "versions") => {
    setModalState({ isOpen: true, tab });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const sourceData = workflowData?.data || workflowData || {};
  const signers = sourceData.signatures || [];
  const approvers = sourceData.approvals || [];
  const documents = sourceData.documents || [];

  const userMap = useMemo(() => {
    const map = new Map();

    if (documentCreator) {
      map.set(String(documentCreator.id), documentCreator);
    }

    signers.forEach((s: any) => {
      if (s.user) map.set(String(s.user.id), s.user);
    });
    approvers.forEach((a: any) => {
      if (a.user) map.set(String(a.user.id), a.user);
    });
    return map;
  }, [signers, approvers, documentCreator]);

  const versionsWithMeta = useMemo(() => {
    return versions.map((v: any, idx: number) => ({
      ...v,
      displayVersion: v.versionNumber || idx + 1,
      approvedCount: approvedCountByVersion?.get(String(v.id)) || 0,
    }));
  }, [versions, approvedCountByVersion]);

  if (!workflowData) return null;

  const visibleVersions = isCollapsed
    ? []
    : versionsWithMeta.slice(-MAX_VISIBLE_VERSIONS);

  const hiddenVersionsCount = versions.length - visibleVersions.length;

  const visibleDocuments = isCollapsed
    ? []
    : documents.slice(0, MAX_VISIBLE_DOCS);
  const hiddenDocsCount = documents.length - visibleDocuments.length;

  const visibleSigners = isCollapsed
    ? []
    : signers.slice(0, MAX_VISIBLE_SIGNERS);

  const hiddenSignersCount = signers.length - visibleSigners.length;

  const currentVersionApprovers = useMemo(() => {
    if (!activeVersionId) return approvers;
    return approvers.filter((a: any) => {
      const vId = resolveApprovalVersionId(a, approvalVersionSummary);
      if (vId != null) {
        return String(vId) === String(activeVersionId);
      }
      if (versions.length <= 1) return true;
      const latest =
        versions.length > 0 ? versions[versions.length - 1].id : null;
      if (latest != null && String(activeVersionId) === String(latest)) {
        return true;
      }
      return false;
    });
  }, [approvers, activeVersionId, approvalVersionSummary, versions]);

  const visibleApprovers = isCollapsed
    ? []
    : currentVersionApprovers.slice(0, MAX_VISIBLE_APPROVERS);

  const hiddenApproversCount =
    currentVersionApprovers.length - visibleApprovers.length;

  const renderShowMoreParticipants = (count: number) => (
    <div
      onClick={() => openModal("participants")}
      className="relative flex items-center gap-3 group cursor-pointer mb-3"
    >
      <div
        className={`absolute left-[15px] top-0 bottom-1/2 w-[2px] transition-colors ${
          isDarkMode
            ? "bg-th-high group-hover:bg-th-accent-900"
            : "bg-gray-100 group-hover:bg-th-accent-100"
        }`}
      />
      <div className="relative z-10 w-[32px] flex justify-center">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all text-[10px] ${
            isDarkMode
              ? "bg-th-raised border-th-high text-gray-400 group-hover:bg-th-accent-900/50 group-hover:border-th-accent-800 group-hover:text-th-accent-400"
              : "bg-gray-50 border-gray-200 text-gray-400 group-hover:bg-th-accent-50 group-hover:border-th-accent-200 group-hover:text-th-accent-500"
          }`}
        >
          <EyeOutlined />
        </div>
      </div>

      <div
        className={`flex-1 py-2 border-b border-dashed transition-colors ${
          isDarkMode
            ? "border-th-high group-hover:border-th-accent-800"
            : "border-gray-200 group-hover:border-th-accent-200"
        }`}
      >
        <span
          className={`text-xs font-medium transition-colors ${
            isDarkMode
              ? "text-gray-400 group-hover:text-th-accent-400"
              : "text-gray-500 group-hover:text-th-accent-600"
          }`}
        >
          Показать остальных ({count})
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`
        relative flex flex-col border-l transition-all duration-300 ease-in-out ${
          isReadPage ? "h-full" : "h-[calc(100vh-64px)]!"
        }  sticky top-0
        ${isCollapsed ? "w-16 items-center py-4" : "w-80"}
        ${
          isDarkMode
            ? "bg-th-base border-th-raised shadow-gray-900/50 text-gray-200"
            : "bg-white border-gray-200 shadow-xl shadow-gray-200/50 text-gray-800"
        }
      `}
      >
        <button
          onClick={toggleCollapse}
          className={`absolute -left-3 top-6 border rounded-full w-6 h-6 flex items-center justify-center shadow-sm z-20 transition-transform hover:scale-110 cursor-pointer ${
            isDarkMode
              ? "bg-th-raised border-th-high hover:bg-th-high text-gray-400"
              : "bg-white border-gray-200 hover:bg-gray-50 text-gray-500"
          }`}
        >
          {isCollapsed ? (
            <LeftOutlined className="text-[10px]!" />
          ) : (
            <RightOutlined className="text-[10px]!" />
          )}
        </button>

        {!isCollapsed && (
          <div
            className={`px-4 py-4 border-b shrink-0 z-10 flex justify-between items-center ${
              isDarkMode
                ? "bg-th-base border-th-raised"
                : "bg-white border-gray-100"
            }`}
          >
            <h3
              className={`text-sm font-bold flex items-center gap-2 m-0 ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              <InfoCircleOutlined
                className={isDarkMode ? "text-gray-500!" : "text-gray-400!"}
              />
              История
            </h3>
            <Tooltip title="Полная история">
              <Button
                type="text"
                size="small"
                icon={
                  <HistoryOutlined
                    className={isDarkMode ? "text-gray-400!" : ""}
                  />
                }
                onClick={() => openModal("participants")}
              />
            </Tooltip>
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto custom-scrollbar ${
            isCollapsed
              ? "px-2 pt-4 w-full flex flex-col items-center"
              : "p-4"
          }`}
        >
          {documents.length > 0 && (
            <div className="mb-4">
              {!isCollapsed ? (
                <>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <PaperClipOutlined /> Документы
                    </span>
                    <span
                      className={`px-1.5 rounded text-[10px] ${
                        isDarkMode
                          ? "bg-th-raised text-gray-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {documents.length}
                    </span>
                  </div>
                  {visibleDocuments.map((doc: any) => (
                    <SidebarDocumentRow
                      key={doc.id}
                      doc={doc}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                  {hiddenDocsCount > 0 && (
                    <div
                      onClick={() => openModal("documents")}
                      className={`mt-2 w-full py-2 px-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 group ${
                        isDarkMode
                          ? "bg-th-accent-900/20 hover:bg-th-accent-900/40 border-th-accent-900/50"
                          : "bg-th-accent-50 hover:bg-th-accent-100 border-th-accent-100 dark:bg-th-accent-900/35 dark:border-th-accent-800/50"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isDarkMode
                            ? "text-th-accent-400 group-hover:text-th-accent-300"
                            : "text-th-accent-600 group-hover:text-th-accent-700"
                        }`}
                      >
                        Показать все документы: {documents.length}
                      </span>
                    </div>
                  )}
                  <Divider
                    className={`my-4! ${
                      isDarkMode ? "border-th-raised!" : "border-gray-100!"
                    }`}
                  />
                </>
              ) : (
                <Tooltip
                  title={`Вложения: ${documents.length} шт.`}
                  placement="left"
                >
                  <div
                    className={`mb-4 w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer transition-colors ${
                      isDarkMode
                        ? "bg-th-accent-900/30 text-th-accent-400 border-th-accent-800/50 hover:bg-th-accent-900/50"
                        : "bg-th-accent-50 text-th-accent-500 border-th-accent-100 hover:bg-th-accent-100 dark:bg-th-accent-900/35 dark:border-th-accent-800/50"
                    }`}
                    onClick={() => openModal("documents")}
                  >
                    <PaperClipOutlined />
                  </div>
                </Tooltip>
              )}
            </div>
          )}

          {versions.length > 0 && (
            <div className="mb-4">
              {!isCollapsed ? (
                <>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <HistoryOutlined /> Версии редактора
                    </span>
                    <span
                      className={`px-1.5 rounded text-[10px] ${
                        isDarkMode
                          ? "bg-th-raised text-gray-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {versions.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {visibleVersions.map((v: any) => (
                      <SidebarVersionRow
                        key={v.id}
                        version={v}
                        author={userMap.get(String(v.authorId)) || {}}
                        activeVersionId={activeVersionId}
                        onSelectVersion={onSelectVersion}
                        onSetVersionForSign={onSetVersionForSign}
                        isSelectingVersion={isSelectingVersion}
                        isSigning={isSigning}
                        isSignedDocument={isSignedDocument}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                  {hiddenVersionsCount > 0 && (
                    <div
                      onClick={() => openModal("versions")}
                      className={`mt-2 w-full py-2 px-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 group ${
                        isDarkMode
                          ? "bg-th-raised hover:bg-th-high border-th-high"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isDarkMode
                            ? "text-gray-400 group-hover:text-gray-200"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        Показать все версии: {versions.length}
                      </span>
                    </div>
                  )}
                  <Divider
                    className={`my-4! ${
                      isDarkMode ? "border-th-raised!" : "border-gray-100!"
                    }`}
                  />
                </>
              ) : (
                <Tooltip
                  title={`Версии: ${versions.length} шт.`}
                  placement="left"
                >
                  <div
                    className={`mb-4 w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer transition-colors ${
                      isDarkMode
                        ? "bg-th-raised text-gray-400 border-th-high hover:bg-th-high"
                        : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                    }`}
                    onClick={() => openModal("versions")}
                  >
                    <HistoryOutlined />
                  </div>
                </Tooltip>
              )}
            </div>
          )}

          {signers.length > 0 && (
            <div>
              <If is={!isCollapsed && !!signVersionWarning?.hasMismatch}>
                <div className="mb-3">
                  <ApprovalVersionNotice
                    warning={signVersionWarning}
                    isDarkMode={isDarkMode}
                    isCompact
                  />
                </div>
              </If>
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1 flex justify-between items-center">
                  <span>Подписывающие</span>
                  <span
                    className={`px-1.5 rounded text-[9px] ${
                      isDarkMode
                        ? "bg-th-raised text-gray-400"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {signers.length}
                  </span>
                </div>
              )}

              {(isCollapsed ? signers : visibleSigners).map((s: any) => (
                <SidebarParticipantRow
                  key={s.id}
                  item={s}
                  role="signer"
                  isCollapsed={isCollapsed}
                  isDarkMode={isDarkMode}
                  currentUserId={currentUserId}
                  openSignatureModal={openSignatureModal}
                  onSign={onSign}
                  handleOpenApproveModal={handleOpenApproveModal}
                  isSigning={isSigning}
                  isReadOnly={isReadOnly}
                  hasQRInSelectedVersion={hasQRInSelectedVersion}
                  approvalVersionSummary={approvalVersionSummary}
                  activeVersionId={activeVersionId}
                />
              ))}

              {!isCollapsed &&
                hiddenSignersCount > 0 &&
                renderShowMoreParticipants(hiddenSignersCount)}
            </div>
          )}

          {!isCollapsed && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1 flex justify-between items-center">
                <span>Согласующие</span>
                <span
                  className={`px-1.5 rounded text-[9px] ${
                    isDarkMode
                      ? "bg-th-raised text-gray-400"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {currentVersionApprovers.length}
                </span>
              </div>

              {currentVersionApprovers.length === 0 ? (
                <div className="text-[11px] text-gray-400 py-3 text-center border border-dashed rounded-xl border-gray-200 dark:border-th-raised mb-3">
                  Нет согласующих для этой версии
                </div>
              ) : (
                <>
                  {visibleApprovers.map((a: any) => (
                    <SidebarParticipantRow
                      key={a.id}
                      item={a}
                      role="approver"
                      isCollapsed={isCollapsed}
                      isDarkMode={isDarkMode}
                      currentUserId={currentUserId}
                      openSignatureModal={openSignatureModal}
                      onSign={onSign}
                      handleOpenApproveModal={handleOpenApproveModal}
                      isSigning={isSigning}
                      isReadOnly={isReadOnly}
                      hasQRInSelectedVersion={hasQRInSelectedVersion}
                      approvalVersionSummary={approvalVersionSummary}
                      activeVersionId={activeVersionId}
                    />
                  ))}

                  {hiddenApproversCount > 0 &&
                    renderShowMoreParticipants(hiddenApproversCount)}
                </>
              )}
            </div>
          )}

          {isCollapsed &&
            currentVersionApprovers.map((a: any) => (
              <SidebarParticipantRow
                key={a.id}
                item={a}
                role="approver"
                isCollapsed={isCollapsed}
                isDarkMode={isDarkMode}
                currentUserId={currentUserId}
                openSignatureModal={openSignatureModal}
                onSign={onSign}
                handleOpenApproveModal={handleOpenApproveModal}
                isSigning={isSigning}
                isReadOnly={isReadOnly}
                hasQRInSelectedVersion={hasQRInSelectedVersion}
                approvalVersionSummary={approvalVersionSummary}
                activeVersionId={activeVersionId}
              />
            ))}

          {!isCollapsed && docId && (
            <div className="p-3 border-t border-gray-100 dark:border-th-raised">
              <AssignmentsSection
                docId={docId}
                currentUserId={currentUserId}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div
            className={`p-4 border-t shrink-0 ${
              isDarkMode
                ? "bg-th-base border-th-raised"
                : "bg-gray-50/50 border-gray-100"
            }`}
          >
            <Button
              block
              onClick={() => openModal("participants")}
              className={`shadow-sm! h-9! font-medium! ${
                isDarkMode
                  ? "bg-th-raised! border-th-higher! text-gray-300! hover:text-th-accent-400! hover:border-th-accent-500!"
                  : "bg-white! border-gray-200! text-gray-600! hover:text-th-accent-600! hover:border-th-accent-200!"
              }`}
            >
              Полная история
            </Button>
          </div>
        )}
      </div>

      <FullHistoryModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        workflowData={workflowData}
        initialTab={modalState.tab}
        onSign={onSign}
        isSigning={isSigning}
        currentUserId={currentUserId}
        onShowSignature={openSignatureModal}
        onRequestApprove={handleRequestApproveFromHistory}
        approvalVersionSummary={approvalVersionSummary}
        approvedCountByVersion={approvedCountByVersion}
        isReadOnly={isReadOnly}
        isSignedDocument={isSignedDocument}
        versions={versions}
        onSelectVersion={onSelectVersion}
        documentCreator={documentCreator}
        isDarkMode={isDarkMode}
        onSetVersionForSign={onSetVersionForSign}
        isSelectingVersion={isSelectingVersion}
        activeVersionId={activeVersionId}
      />

      <SignatureDetailsModal
        isOpen={signatureModal.isOpen}
        onClose={() => setSignatureModal({ ...signatureModal, isOpen: false })}
        data={signatureModal.data}
        isDarkMode={isDarkMode}
      />

      <ApprovalConfirmModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={handleConfirmApproval}
        isSigning={isSigning}
        approvalNote={approvalNote}
        setApprovalNote={setApprovalNote}
        approvalVersionWarning={approvalVersionWarning}
        isDarkMode={isDarkMode}
      />
    </>
  );
};
