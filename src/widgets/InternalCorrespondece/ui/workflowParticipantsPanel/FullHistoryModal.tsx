import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, ConfigProvider, Divider, Input, Modal, Tabs, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { HistoryParticipantRow } from "./HistoryParticipantRow";
import { HistoryDocumentsTab } from "./HistoryDocumentsTab";
import { HistoryVersionsTab } from "./HistoryVersionsTab";

interface FullHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowData: any;
  initialTab?: string;
  onSign: () => void;
  onApprove: (payload?: { status?: "approved"; note?: string }) => void;
  isSigning: boolean;
  currentUserId: string | number | null;
  onShowSignature: (e: any, item: any) => void;
  isReadOnly: boolean;
  isSignedDocument?: boolean;
  versions?: any[];
  activeVersionId?: string | number | null;
  onSelectVersion?: (content: string, versionId: string | number) => void;
  documentCreator?: any;
  isDarkMode?: boolean;
  onSetVersionForSign?: (versionId: string | number) => void;
  isSelectingVersion?: boolean;
}

export const FullHistoryModal = ({
  isOpen,
  onClose,
  workflowData,
  initialTab = "participants",
  onSign,
  onApprove,
  isSigning,
  currentUserId,
  onShowSignature,
  isReadOnly,
  isSignedDocument,
  versions = [],
  activeVersionId,
  onSelectVersion,
  documentCreator,
  isDarkMode,
  onSetVersionForSign,
  isSelectingVersion,
}: FullHistoryModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setExpandedRows({});
    }
  }, [isOpen, initialTab]);

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
    return versions.map((v, idx) => ({
      ...v,
      versionNumber: v.versionNumber || idx + 1,
    }));
  }, [versions]);

  const creatorItem = documentCreator
    ? {
        id: "creator-" + documentCreator.id,
        user: documentCreator,
        status: "created",
      }
    : null;

  const filteredCreator =
    creatorItem &&
    (creatorItem.user?.full_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
      ? creatorItem
      : null;

  const filteredSigners = signers.filter((p: any) =>
    (p.user?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredApprovers = approvers.filter((p: any) =>
    (p.user?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredDocs = documents.filter(
    (d: any) =>
      (d.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.reg_number || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredVersions = versionsWithMeta.filter((v: any) => {
    const author = userMap.get(String(v.authorId));
    const authorName = (author?.full_name || "").toLowerCase();
    const versionName = `Версия ${v.versionNumber}`.toLowerCase();
    const dateStr = new Date(v.date).toLocaleString("ru-RU").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      versionName.includes(searchLower) ||
      dateStr.includes(searchLower) ||
      authorName.includes(searchLower)
    );
  });

  const totalParticipants =
    filteredSigners.length +
    filteredApprovers.length +
    (filteredCreator ? 1 : 0);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenApproveModal = () => {
    onApprove({ status: "approved" });
  };

  const renderParticipantRow = (
    item: any,
    type: "signer" | "approver" | "creator",
  ) => (
    <HistoryParticipantRow
      key={item.id}
      item={item}
      type={type}
      currentUserId={currentUserId}
      versionsWithMeta={versionsWithMeta}
      isExpanded={!!expandedRows[item.id]}
      toggleRow={toggleRow}
      onShowSignature={onShowSignature}
      onSign={onSign}
      handleOpenApproveModal={handleOpenApproveModal}
      isSigning={isSigning}
      isReadOnly={isReadOnly}
      isDarkMode={isDarkMode}
      onSelectVersion={onSelectVersion}
      onClose={onClose}
      activeVersionId={activeVersionId}
      onSetVersionForSign={onSetVersionForSign}
      isSelectingVersion={isSelectingVersion}
      isSignedDocument={isSignedDocument}
    />
  );

  const tabItems = [
    {
      key: "participants",
      label: `Участники (${totalParticipants})`,
      children: (
        <div className="flex flex-col h-[60vh]! overflow-y-auto pr-2 custom-scrollbar">
          {filteredCreator && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                Автор
              </div>
              {renderParticipantRow(filteredCreator, "creator")}
            </div>
          )}

          {filteredSigners.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                Подписывающие ({filteredSigners.length})
              </div>
              {filteredSigners.map((s: any) =>
                renderParticipantRow(s, "signer"),
              )}
            </div>
          )}

          {filteredApprovers.length > 0 && (
            <div>
              {filteredSigners.length > 0 && (
                <Divider
                  className={`my-4! ${isDarkMode ? "border-gray-700!" : "border-gray-200!"}`}
                />
              )}
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                Согласующие ({filteredApprovers.length})
              </div>
              {filteredApprovers.map((a: any) =>
                renderParticipantRow(a, "approver"),
              )}
            </div>
          )}

          {totalParticipants === 0 && (
            <div className="text-center text-gray-400 py-4">
              Никого не найдено
            </div>
          )}

          {sourceData.acknowledged_users &&
            sourceData.acknowledged_users.length > 0 && (
              <div className="mt-4 border-t pt-3 border-gray-100 dark:border-gray-800">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
                  Ознакомились ({sourceData.acknowledged_users.length})
                </div>
                {sourceData.acknowledged_users.map((ackUser: any) => {
                  const user = ackUser.user || ackUser;
                  return (
                    <div
                      key={ackUser.id || user.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg mb-1.5 border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-900/40"
                    >
                      <Avatar
                        src={user.photo_path || null}
                        size={28}
                        icon={<UserOutlined />}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {user.full_name ||
                            `${user.last_name || ""} ${user.first_name || ""}`}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {user.position || "Сотрудник"}
                        </p>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                        {ackUser.acknowledged_at
                          ? new Date(ackUser.acknowledged_at).toLocaleString(
                              "ru-RU",
                            )
                          : "Ознакомлен"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      ),
    },
    {
      key: "documents",
      label: `Документы (${documents.length})`,
      children: (
        <HistoryDocumentsTab
          filteredDocs={filteredDocs}
          isDarkMode={isDarkMode}
        />
      ),
    },
    {
      key: "versions",
      label: `Версии (${versions.length})`,
      children: (
        <HistoryVersionsTab
          filteredVersions={filteredVersions}
          userMap={userMap}
          activeVersionId={activeVersionId}
          onSelectVersion={onSelectVersion}
          onClose={onClose}
          onSetVersionForSign={onSetVersionForSign}
          isSelectingVersion={isSelectingVersion}
          isSigning={isSigning}
          isSignedDocument={isSignedDocument}
          isDarkMode={isDarkMode}
        />
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        title="Полная история и документы"
        width={700}
        centered
        destroyOnClose
      >
        <Input
          placeholder="Поиск по участникам, документам или версиям..."
          prefix={<SearchOutlined className="text-gray-400!" />}
          className="mb-4!"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="h-full!"
        />
      </Modal>
    </ConfigProvider>
  );
};
