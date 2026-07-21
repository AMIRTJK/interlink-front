import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  UserOutlined,
  RightOutlined,
  LeftOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  SearchOutlined,
  HistoryOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { If, Tooltip } from "@shared/ui";
import {
  Avatar,
  Button,
  Divider,
  Modal,
  Input,
  Tabs,
  Tag,
  ConfigProvider,
  theme,
  Checkbox,
} from "antd";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { SignatureDetailsModal } from "./SignatureDetailsModal";

// --- КОНСТАНТЫ ---
const MAX_VISIBLE_DOCS = 2;
const MAX_VISIBLE_SIGNERS = 3;
const MAX_VISIBLE_APPROVERS = 3;
const MAX_VISIBLE_VERSIONS = 3;

// --- КОМПОНЕНТ МОДАЛЬНОГО ОКНА ИСТОРИИ ---
const FullHistoryModal = ({
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
  onSelectVersion,
  documentCreator,
  isDarkMode,
  onSetVersionForSign,
  isSelectingVersion,
  activeVersionId,
}: {
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
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);

  // Состояние для раскрытых строк участников (id участника -> boolean)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setExpandedRows({}); // Сбрасываем при открытии
    }
  }, [isOpen, initialTab]);

  const sourceData = workflowData?.data || workflowData || {};
  const signers = sourceData.signatures || [];
  const approvers = sourceData.approvals || [];
  const documents = sourceData.documents || [];

  console.log(documentCreator);

  // Создаем словарь пользователей для быстрого поиска автора версии
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

  // --- ФИЛЬТРАЦИЯ УЧАСТНИКОВ ---
  // Создаем искусственный элемент для Автора, чтобы он рендерился так же, как и остальные
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

  // 1. Фильтруем списки раздельно
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

  const renderStatusTag = (status: string) => {
    const map: Record<string, any> = {
      signed: { color: "success", text: "Подписано" },
      approved: { color: "success", text: "Согласовано" },
      returned: { color: "warning", text: "Возвращено" },
      declined: { color: "error", text: "Отклонил право подписи" },
      rejected: { color: "error", text: "Отклонено" },
      pending: { color: "default", text: "Ожидание" },
      created: { color: "blue", text: "Автор" },
    };
    const s = map[status] || map.pending;
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Вспомогательная функция для рендера строки участника внутри модалки
  const renderParticipantRow = (
    item: any,
    type: "signer" | "approver" | "creator",
  ) => {
    const isCurrentUser = String(item.user?.id) === String(currentUserId);
    const isPending = item.status === "pending";

    const hasSignature =
      (item.status === "signed" || item.status === "approved") &&
      item.payload_hash;

    // Находим версии именно этого участника
    const userVersions = versionsWithMeta.filter(
      (v) => String(v.authorId) === String(item.user?.id),
    );
    const isExpanded = !!expandedRows[item.id];

    return (
      <div key={item.id} className="mb-2">
        <div
          className={`flex items-start justify-between p-3 rounded-lg border transition-all relative z-10 ${
            isDarkMode
              ? "bg-[#1f2937] border-gray-700 hover:bg-gray-800"
              : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <Avatar src={item.user?.photo_path} icon={<UserOutlined />} />
            <div>
              <div
                className={`font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                {item.user?.full_name}
                <If is={hasSignature}>
                  <Tooltip title="Показать данные ЭЦП">
                    <Button
                      type="text"
                      size="small"
                      className={`h-[20px]! w-[20px]! flex items-center justify-center rounded-full ${
                        isDarkMode
                          ? "text-green-400! bg-green-900/30!"
                          : "text-green-600! bg-green-50!"
                      }`}
                      onClick={(e) => onShowSignature(e, item)}
                      icon={
                        <SafetyCertificateOutlined className="text-[12px]!" />
                      }
                    />
                  </Tooltip>
                </If>
                <If is={isCurrentUser}>
                  <span className="text-gray-400 text-xs ml-1">(Вы)</span>
                </If>
              </div>
              <div
                className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {item.user?.position}
              </div>
              {/* --- КНОПКА РАСКРЫТИЯ ВЕРСИЙ --- */}
              <If is={userVersions.length > 0}>
                <div
                  className={`mt-1 flex items-center gap-1 text-[11px] font-medium cursor-pointer select-none transition-colors ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-500 hover:text-blue-600"
                  }`}
                  onClick={() => toggleRow(item.id)}
                >
                  <HistoryOutlined />
                  {userVersions.length}{" "}
                  {userVersions.length === 1
                    ? "версия"
                    : userVersions.length < 5
                      ? "версии"
                      : "версий"}
                  {isExpanded ? (
                    <UpOutlined className="text-[9px]! ml-0.5!" />
                  ) : (
                    <DownOutlined className="text-[9px]! ml-0.5!" />
                  )}
                </div>
              </If>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div>{renderStatusTag(item.status)}</div>

            {type === "signer" && isCurrentUser && isPending && (
              <Button
                htmlType="button"
                onClick={onSign}
                loading={isSigning}
                disabled={item.status !== "pending"}
                type="primary"
                size="small"
                className={`bg-blue-600! hover:bg-blue-500! ${item.status !== "pending" ? "text-white! opacity-50!" : ""}`}
              >
                Подписать
              </Button>
            )}

            {type === "approver" && isCurrentUser && isPending && (
              <Button
                htmlType="button"
                type="primary"
                size="small"
                onClick={handleOpenApproveModal}
                loading={isSigning}
                disabled={item.status !== "pending" || isReadOnly}
                className="bg-green-600! hover:bg-green-500! border-green-600!"
              >
                Согласовать
              </Button>
            )}
          </div>
        </div>

        <If is={Boolean(item.note)}>
          <div
            className={`mt-1.5 mx-3 p-2 rounded-lg text-xs leading-relaxed border ${
              isDarkMode
                ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                : "bg-amber-50/80 border-amber-200/80 text-amber-900"
            }`}
          >
            <span className="font-semibold block mb-0.5 text-[11px] opacity-80">
              💬 Комментарий:
            </span>
            {item.note}
          </div>
        </If>

        {/* --- СПИСОК ВЕРСИЙ УЧАСТНИКА --- */}
        {isExpanded && userVersions.length > 0 && (
          <div
            className={`pl-[52px] pr-2 py-2 flex flex-col gap-2 border-l-2 ml-[22px] -mt-1 rounded-b-lg ${
              isDarkMode
                ? "border-blue-900/50 bg-[#1f2937]/50"
                : "border-blue-100 bg-white/50"
            }`}
          >
            {userVersions.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  if (onSelectVersion) {
                    onSelectVersion(v.content, v.id);
                    onClose();
                  }
                }}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer group transition-all ${
                  v.id === activeVersionId
                    ? isDarkMode
                      ? "bg-gray-800 border-blue-500 shadow-sm shadow-blue-900/30"
                      : "bg-blue-50/50 border-blue-500 shadow-sm shadow-blue-100"
                    : isDarkMode
                      ? "bg-gray-800 border-gray-700 hover:border-blue-500"
                      : "bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div>
                  <div
                    className={`text-xs font-semibold transition-colors flex gap-1 ${
                      isDarkMode
                        ? "text-gray-300 group-hover:text-blue-400"
                        : "text-gray-700 group-hover:text-blue-600"
                    }`}
                  >
                    <p>Версия {v.versionNumber}</p>
                    {v.is_selected && (
                      <Tooltip title="Выбрана для подписи">
                        <CheckCircleFilled className="text-green-500! text-[12px]!" />
                      </Tooltip>
                    )}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {new Date(v.date).toLocaleString("ru-RU")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={v.is_selected}
                      onChange={() =>
                        onSetVersionForSign && onSetVersionForSign(v.id)
                      }
                      disabled={
                        isSelectingVersion || isSigning || isSignedDocument
                      }
                    >
                      <span
                        className={`text-xs select-none ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Для подписи
                      </span>
                    </Checkbox>
                  </div>
                  <div
                    className={`${isDarkMode ? "text-gray-500 group-hover:text-blue-400" : "text-gray-300 group-hover:text-blue-500"}`}
                  >
                    <Tooltip title="Восстановить в редакторе">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        className={
                          isDarkMode
                            ? "text-gray-400! hover:text-blue-400!"
                            : ""
                        }
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const items = [
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
        </div>
      ),
    },
    {
      key: "documents",
      label: `Документы (${documents.length})`,
      children: (
        <div className="flex flex-col gap-2 h-[60vh]! overflow-y-auto pr-2 custom-scrollbar">
          {filteredDocs.map((doc: any) => (
            <div
              key={doc.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-blue-900/20 border-blue-800/50 hover:bg-blue-900/40"
                  : "bg-blue-50/30 border-blue-100 hover:bg-blue-50"
              }`}
            >
              <div className="mt-1 text-blue-500">
                <FileTextOutlined />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span
                    className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}
                  >
                    {doc.reg_number}
                  </span>
                  <span
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {doc.date}
                  </span>
                </div>
                <div
                  className={`text-sm mt-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {doc.subject}
                </div>
                <div className="mt-2">
                  <a
                    href={`/modules/correspondence/internal/incoming/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs hover:underline flex items-center gap-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                  >
                    <EyeOutlined /> Открыть документ
                  </a>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              Документы не найдены
            </div>
          )}
        </div>
      ),
    },
    {
      key: "versions",
      label: `Версии (${versions.length})`,
      children: (
        <div className="flex flex-col gap-2 h-[60vh]! overflow-y-auto pr-2 custom-scrollbar">
          {filteredVersions.map((v: any) => {
            const author = userMap.get(String(v.authorId)) || {};

            return (
              <div
                key={v.id}
                onClick={() => {
                  if (onSelectVersion) {
                    onSelectVersion(v.content, v.id);
                    onClose();
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group mb-2 ${
                  v.id === activeVersionId
                    ? isDarkMode
                      ? "bg-[#1f2937] border-blue-500 shadow-sm"
                      : "bg-blue-50/40 border-blue-500 shadow-sm"
                    : isDarkMode
                      ? "bg-[#1f2937] border-gray-700 hover:bg-gray-800 hover:border-blue-500"
                      : "bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    src={author.photo_path}
                    icon={<UserOutlined />}
                    className={`mt-1! shrink-0! ${isDarkMode ? "bg-gray-700!" : "bg-gray-200!"}`}
                  />
                  <div>
                    <div
                      className={`font-semibold transition-colors flex gap-1 ${isDarkMode ? "text-gray-200 group-hover:text-blue-400" : "text-gray-700 group-hover:text-blue-700"}`}
                    >
                      <p>Версия {v.versionNumber}</p>
                      {v.is_selected && (
                        <Tooltip title="Выбрана для подписи">
                          <CheckCircleFilled className="text-green-500! text-[12px]!" />
                        </Tooltip>
                      )}
                      {v.is_current_signed && (
                        <Tooltip title="Подписанная версия">
                          <SafetyCertificateOutlined className="text-blue-500! text-[13px]!" />
                        </Tooltip>
                      )}
                    </div>
                    <div
                      className={`text-xs mt-1 font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {author.full_name || "Неизвестный автор"}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {author.position ? `${author.position} • ` : ""}
                      {new Date(v.date).toLocaleString("ru-RU")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={v.is_selected}
                      onChange={() =>
                        onSetVersionForSign && onSetVersionForSign(v.id)
                      }
                      disabled={
                        isSelectingVersion || isSigning || isSignedDocument
                      }
                    >
                      <span
                        className={`text-xs select-none ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Для подписи
                      </span>
                    </Checkbox>
                  </div>
                  <div
                    className={`self-center ${isDarkMode ? "text-gray-500 group-hover:text-blue-400" : "text-gray-300 group-hover:text-blue-500"}`}
                  >
                    <Tooltip title="Восстановить в редакторе">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        className={
                          isDarkMode
                            ? "text-gray-400! hover:text-blue-400!"
                            : ""
                        }
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredVersions.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              Версии не найдены
            </div>
          )}
        </div>
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
          items={items}
          className="h-full!"
        />
      </Modal>
    </ConfigProvider>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ПАНЕЛИ ---

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
}: {
  workflowData: any;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onSign: () => void;
  onApprove: (payload?: { status?: "approved" | "returned"; note?: string }) => void;
  isSigning: boolean;
  currentUserId: string | number | null;
  isReadOnly: boolean;
  isReadPage?: boolean;
  isSignedDocument?: boolean;
  hasQRInSelectedVersion?: boolean;
  versions?: any[];
  activeVersionId?: string | number | null;
  onSelectVersion?: (content: string, versionId: string | number) => void;
  documentCreator?: any;
  isDarkMode?: boolean;
  onSetVersionForSign?: (versionId: string | number) => void;
  isSelectingVersion?: boolean;
}) => {
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

  // --- ВАЖНО: ВСЕ ВЫЗОВЫ ХУКОВ ДОЛЖНЫ БЫТЬ ДО `if (!workflowData) return null` ---

  const sourceData = workflowData?.data || workflowData || {};
  const signers = sourceData.signatures || [];
  const approvers = sourceData.approvals || [];
  const documents = sourceData.documents || [];

  // Словарь для поиска автора версии в панели. Безопасно вызывать даже если данные пустые.
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
    }));
  }, [versions]);

  // ВСЕ ХУКИ ВЫЗЫВАЕМ ДО RETURN
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

  const visibleApprovers = isCollapsed
    ? []
    : approvers.slice(0, MAX_VISIBLE_APPROVERS);

  const hiddenApproversCount = approvers.length - visibleApprovers.length;

  const getStatusMeta = (status: string) => {
    switch (status) {
      case "signed":
      case "approved":
        return {
          color: "text-green-500",
          bg: isDarkMode ? "bg-[#111827]" : "bg-white",
          bgList: isDarkMode ? "bg-[#00c9501a]" : "bg-[#00c95026]",
          icon: <CheckCircleFilled className="text-green-500!" />,
        };
      case "returned":
        return {
          color: "text-amber-500",
          bg: isDarkMode ? "bg-[#111827]" : "bg-white",
          bgList: isDarkMode ? "bg-[#f59e0b1a]" : "bg-[#f59e0b26]",
          icon: <ClockCircleFilled className="text-amber-500!" />,
        };
      case "declined":
      case "rejected":
        return {
          color: "text-red-500",
          bg: isDarkMode ? "bg-[#111827]" : "bg-white",
          bgList: isDarkMode ? "bg-[#ff4d4f1a]" : "bg-[#ff4d4f26]",
          icon: <CloseCircleFilled className="text-red-500!" />,
        };
      default:
        return {
          color: "text-gray-400",
          bg: isDarkMode ? "bg-[#111827]" : "bg-white",
          bgList: isDarkMode ? "bg-gray-800/50" : "bg-[#99a1af26]",
          icon: <ClockCircleFilled className="text-gray-400!" />,
        };
    }
  };

  const renderDocumentRow = (doc: any) => (
    <Link
      to={`/modules/correspondence/internal/incoming/${doc.id}`}
      key={doc.id}
      className={`flex items-start gap-3 p-3 rounded-lg border mb-2 transition-all cursor-pointer group no-underline ${
        isDarkMode
          ? "bg-blue-900/20 border-blue-900/50 hover:bg-blue-900/40"
          : "bg-blue-50/40 border-blue-100 hover:bg-blue-50 hover:shadow-sm hover:border-blue-200"
      }`}
    >
      <div
        className={`mt-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}
      >
        <FileTextOutlined />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs font-semibold truncate transition-colors ${isDarkMode ? "text-blue-400 group-hover:text-blue-300" : "text-blue-700 group-hover:text-blue-800"}`}
        >
          {doc.reg_number || "Без номера"}
        </div>
        <div
          className={`text-xs line-clamp-2 leading-tight mt-0.5 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          {doc.subject}
        </div>
        <div
          className={`text-[10px] mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
        >
          {doc.date}
        </div>
      </div>
    </Link>
  );

  const renderUserRow = (
    item: any,
    role: "signer" | "approver",
    isLast: boolean,
  ) => {
    const user = item.user || {};
    const fullName = user.full_name || "Пользователь";
    const position = user.position || "Сотрудник";
    const status = item.status || "Ожидание";
    const meta = getStatusMeta(status);

    const isCurrentUser = String(user.id) === String(currentUserId);
    const isPending = status === "pending";

    const hasSignature =
      (status === "signed" || status === "approved") && item.payload_hash;

    if (isCollapsed) {
      return (
        <Tooltip
          title={`${fullName} - ${status}`}
          placement="left"
          key={item.id}
        >
          <div className="relative mb-3 flex justify-center z-10">
            <Avatar
              src={user.photo_path}
              icon={<UserOutlined />}
              size="small"
              className={isDarkMode ? "bg-gray-700!" : "bg-gray-200!"}
            />
            <div
              className={`absolute -top-1 -right-1 rounded-full leading-[0] ${meta.bg} text-[10px]`}
            >
              {meta.icon}
            </div>
          </div>
        </Tooltip>
      );
    }

    return (
      <div
        key={item.id}
        className={`relative flex gap-3 group items-center mb-4 p-2 rounded-xl ${meta.bgList}`}
      >
        <div className="relative z-10 shrink-0">
          <Avatar
            src={user.photo_path}
            icon={<UserOutlined />}
            className={`transition-colors! ${status === "pending" ? "grayscale-[0.5]! opacity-70!" : ""}`}
          />
          <div
            className={`absolute -top-1 -right-1 rounded-full border leading-[0] ${meta.bg} ${isDarkMode ? "border-[#111827]" : "border-white"}`}
          >
            {meta.icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-medium break-words pr-2 ${status === "pending" ? (isDarkMode ? "text-gray-500" : "text-gray-500") : isDarkMode ? "text-gray-200" : "text-gray-800"}`}
            >
              {fullName}
              <If is={isCurrentUser}>
                <span className="text-blue-500 text-xs ml-1 font-normal">
                  (Вы)
                </span>
              </If>
            </span>
            <If is={hasSignature}>
              <Tooltip title="Показать ЭЦП">
                <div
                  onClick={(e) => openSignatureModal(e, item)}
                  className={`${isDarkMode ? "text-green-500!" : "text-green-600!"} cursor-pointer h-[20px]! w-[20px]! flex items-center justify-center rounded-full`}
                >
                  <SafetyCertificateOutlined />
                </div>
              </Tooltip>
            </If>
          </div>
          <div
            className="text-xs text-gray-400 break-words mt-0.5"
          >
            {position}
          </div>

          <If is={status === "declined"}>
            <div className="text-xs text-red-500 font-semibold mt-1">
              Отклонил право подписи
              <If is={Boolean(item.decline_reason || item.reason)}>
                <span className="block text-[11px] text-red-400 font-normal italic mt-0.5">
                  Причина: {item.decline_reason || item.reason}
                </span>
              </If>
            </div>
          </If>

          <div className="mt-2">
            {role === "signer" && isCurrentUser && isPending && (
              <Tooltip
                title={
                  !hasQRInSelectedVersion
                    ? "Сначала добавьте QR-код в версию для подписи"
                    : ""
                }
                placement="bottom"
              >
                <div>
                  <Button
                    htmlType="button"
                    onClick={onSign}
                    loading={isSigning}
                    disabled={status !== "pending" || !hasQRInSelectedVersion}
                    type="primary"
                    size="small"
                    className={`${status !== "pending" || isReadOnly || !hasQRInSelectedVersion ? (isDarkMode ? "bg-gray-700 text-gray-500" : "bg-[#f0f1f3]") : "bg-blue-600! hover:bg-blue-500!"}`}
                  >
                    Подписать
                  </Button>
                </div>
              </Tooltip>
            )}
            {role === "approver" && isCurrentUser && isPending && (
              <Button
                onClick={handleOpenApproveModal}
                disabled={status !== "pending" || isReadOnly}
                loading={isSigning}
                type="primary"
                size="small"
                className={`${status !== "pending" || isReadOnly ? (isDarkMode ? "bg-gray-700 text-gray-500" : "bg-[#f0f1f3]") : "bg-blue-600! hover:bg-blue-500!"}`}
              >
                Согласовать
              </Button>
            )}
          </div>
          <If is={Boolean(item.note)}>
            <div
              className={`mt-2 p-2 rounded-lg text-xs leading-relaxed border ${
                isDarkMode
                  ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                  : "bg-amber-50/80 border-amber-200/80 text-amber-900"
              }`}
            >
              <span className="font-semibold block mb-0.5 text-[11px] opacity-80">
                💬 Комментарий:
              </span>
              {item.note}
            </div>
          </If>
        </div>
      </div>
    );
  };

  const renderShowMoreParticipants = (count: number) => (
    <div
      onClick={() => openModal("participants")}
      className="relative flex items-center gap-3 group cursor-pointer mb-3"
    >
      <div
        className={`absolute left-[15px] top-0 bottom-1/2 w-[2px] transition-colors ${isDarkMode ? "bg-gray-700 group-hover:bg-blue-900" : "bg-gray-100 group-hover:bg-blue-100"}`}
      />
      <div className="relative z-10 w-[32px] flex justify-center">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all text-[10px] ${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-gray-400 group-hover:bg-blue-900/50 group-hover:border-blue-800 group-hover:text-blue-400"
              : "bg-gray-50 border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-500"
          }`}
        >
          <EyeOutlined />
        </div>
      </div>

      <div
        className={`flex-1 py-2 border-b border-dashed transition-colors ${isDarkMode ? "border-gray-700 group-hover:border-blue-800" : "border-gray-200 group-hover:border-blue-200"}`}
      >
        <span
          className={`text-xs font-medium transition-colors ${isDarkMode ? "text-gray-400 group-hover:text-blue-400" : "text-gray-500 group-hover:text-blue-600"}`}
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
        relative flex flex-col border-l transition-all duration-300 ease-in-out ${isReadPage ? "h-full" : "h-[calc(100vh-64px)]!"}  sticky top-0
        ${isCollapsed ? "w-16 items-center py-4" : "w-80"}
        ${isDarkMode ? "bg-[#111827] border-gray-800 shadow-gray-900/50 text-gray-200" : "bg-white border-gray-200 shadow-xl shadow-gray-200/50 text-gray-800"}
      `}
      >
        <button
          onClick={toggleCollapse}
          className={`absolute -left-3 top-6 border rounded-full w-6 h-6 flex items-center justify-center shadow-sm z-20 transition-transform hover:scale-110 cursor-pointer ${
            isDarkMode
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-400"
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
            className={`px-4 py-4 border-b shrink-0 z-10 flex justify-between items-center ${isDarkMode ? "bg-[#111827] border-gray-800" : "bg-white border-gray-100"}`}
          >
            <h3
              className={`text-sm font-bold flex items-center gap-2 m-0 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
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
          className={`flex-1 overflow-y-auto custom-scrollbar ${isCollapsed ? "px-2 pt-4 w-full flex flex-col items-center" : "p-4"}`}
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
                      className={`px-1.5 rounded text-[10px] ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}
                    >
                      {documents.length}
                    </span>
                  </div>
                  {visibleDocuments.map(renderDocumentRow)}
                  {hiddenDocsCount > 0 && (
                    <div
                      onClick={() => openModal("documents")}
                      className={`mt-2 w-full py-2 px-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 group ${
                        isDarkMode
                          ? "bg-blue-900/20 hover:bg-blue-900/40 border-blue-900/50"
                          : "bg-blue-50 hover:bg-blue-100 border-blue-100"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${isDarkMode ? "text-blue-400 group-hover:text-blue-300" : "text-blue-600 group-hover:text-blue-700"}`}
                      >
                        Показать все документы: {documents.length}
                      </span>
                    </div>
                  )}
                  <Divider
                    className={`my-4! ${isDarkMode ? "border-gray-800!" : "border-gray-100!"}`}
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
                        ? "bg-blue-900/30 text-blue-400 border-blue-800/50 hover:bg-blue-900/50"
                        : "bg-blue-50 text-blue-500 border-blue-100 hover:bg-blue-100"
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
                      className={`px-1.5 rounded text-[10px] ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}
                    >
                      {versions.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {visibleVersions.map((v: any, index: number) => {
                      const author = userMap.get(String(v.authorId)) || {};

                      return (
                        <div
                          key={v.id}
                          onClick={() =>
                            onSelectVersion && onSelectVersion(v.content, v.id)
                          }
                          className={`flex items-start gap-3 p-2 rounded-lg border transition-all cursor-pointer group ${
                            v.id === activeVersionId
                              ? isDarkMode
                                ? "bg-[#1f2937] border-blue-500 shadow-sm"
                                : "bg-blue-50/40 border-blue-500 shadow-sm"
                              : isDarkMode
                                ? "bg-[#1f2937] border-gray-700 hover:bg-gray-800 hover:border-blue-500"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-blue-300"
                          }`}
                        >
                          <Avatar
                            src={author.photo_path}
                            icon={<UserOutlined />}
                            size="small"
                            className={`mt-0.5 shrink-0 ${isDarkMode ? "bg-gray-600!" : "bg-gray-200!"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-xs font-semibold flex gap-1 transition-colors ${isDarkMode ? "text-gray-200 group-hover:text-blue-400" : "text-gray-700 group-hover:text-blue-600"}`}
                            >
                              <p>Версия {v.displayVersion}</p>
                              {v.is_selected && (
                                <Tooltip title="Выбрана для подписи">
                                  <CheckCircleFilled className="text-green-500! text-[12px]!" />
                                </Tooltip>
                              )}
                              {v.signature_state === "revoked" ? (
                                <Tooltip title="Подпись отменена">
                                  <CloseCircleFilled className="text-red-500! text-[13px]!" />
                                </Tooltip>
                              ) : (
                                v.is_current_signed && (
                                  <Tooltip title="Подписанная версия">
                                    <SafetyCertificateOutlined className="text-blue-500! text-[13px]!" />
                                  </Tooltip>
                                )
                              )}
                            </div>
                            <Tooltip title={author.full_name || "Неизвестный автор"}>
                              <div
                                className={`text-[10px] font-medium truncate mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {author.full_name || "Неизвестный автор"}
                              </div>
                            </Tooltip>
                            <div className="text-[9px] text-gray-400 mt-0.5">
                              {new Date(v.date).toLocaleString("ru-RU")}
                            </div>
                          </div>
                          <div
                            className={`flex items-center mt-2 shrink-0 gap-2`}
                          >
                            <div onClick={(e) => e.stopPropagation()}>
                              <ConfigProvider
                                theme={{
                                  algorithm: isDarkMode
                                    ? theme.darkAlgorithm
                                    : theme.defaultAlgorithm,
                                }}
                              >
                                <Checkbox
                                  checked={v.is_selected}
                                  onChange={() =>
                                    onSetVersionForSign &&
                                    onSetVersionForSign(v.id)
                                  }
                                  disabled={
                                    isSelectingVersion ||
                                    isSigning ||
                                    isSignedDocument
                                  }
                                />
                              </ConfigProvider>
                            </div>
                            <div
                              className={`${isDarkMode ? "text-gray-500 hover:text-blue-400" : "text-gray-400 hover:text-blue-500"}`}
                            >
                              <Tooltip title="Восстановить в редакторе">
                                <EyeOutlined />
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {hiddenVersionsCount > 0 && (
                    <div
                      onClick={() => openModal("versions")}
                      className={`mt-2 w-full py-2 px-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 group ${
                        isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${isDarkMode ? "text-gray-400 group-hover:text-gray-200" : "text-gray-500 group-hover:text-gray-700"}`}
                      >
                        Показать все версии: {versions.length}
                      </span>
                    </div>
                  )}
                  <Divider
                    className={`my-4! ${isDarkMode ? "border-gray-800!" : "border-gray-100!"}`}
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
                        ? "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
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
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1 flex justify-between items-center">
                  <span>Подписывающие</span>
                  <span
                    className={`px-1.5 rounded text-[9px] ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}
                  >
                    {signers.length}
                  </span>
                </div>
              )}

              {/* --- ОБНОВЛЕННЫЙ ЦИКЛ ПОДПИСЫВАЮЩИХ --- */}
              {(isCollapsed ? signers : visibleSigners).map(
                (s: any, idx: number) =>
                  renderUserRow(
                    s,
                    "signer",
                    idx === visibleSigners.length - 1 &&
                      hiddenSignersCount === 0 &&
                      approvers.length === 0,
                  ),
              )}

              {/* --- КНОПКА ДЛЯ СКРЫТЫХ ПОДПИСЫВАЮЩИХ --- */}
              {!isCollapsed &&
                hiddenSignersCount > 0 &&
                renderShowMoreParticipants(hiddenSignersCount)}
            </div>
          )}

          {approvers.length > 0 && (
            <div>
              {!isCollapsed && (
                <>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1 flex justify-between items-center">
                    <span>Согласующие</span>
                    <span
                      className={`px-1.5 rounded text-[9px] ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}
                    >
                      {approvers.length}
                    </span>
                  </div>
                </>
              )}

              {(isCollapsed ? approvers : visibleApprovers).map(
                (a: any, idx: number) =>
                  renderUserRow(
                    a,
                    "approver",
                    idx === visibleApprovers.length - 1 &&
                      hiddenApproversCount === 0,
                  ),
              )}

              {!isCollapsed &&
                hiddenApproversCount > 0 &&
                renderShowMoreParticipants(hiddenApproversCount)}
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div
            className={`p-4 border-t shrink-0 ${isDarkMode ? "bg-[#111827] border-gray-800" : "bg-gray-50/50 border-gray-100"}`}
          >
            <Button
              block
              onClick={() => openModal("participants")}
              className={`shadow-sm! h-9! font-medium! ${
                isDarkMode
                  ? "bg-[#1f2937]! border-gray-600! text-gray-300! hover:text-blue-400! hover:border-blue-500!"
                  : "bg-white! border-gray-200! text-gray-600! hover:text-blue-600! hover:border-blue-200!"
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
        onApprove={onApprove}
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

      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <Modal
          open={isApprovalModalOpen}
          onCancel={() => setIsApprovalModalOpen(false)}
          onOk={handleConfirmApproval}
          confirmLoading={isSigning}
          title="Согласование документа"
          okText="Согласовать"
          cancelText="Отмена"
          centered
          destroyOnClose
        >
          <div className="flex flex-col gap-3 py-2">
            <label className={`block text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Комментарий к согласованию (необязательно, до 5000 символов):
            </label>
            <Input.TextArea
              rows={4}
              maxLength={5000}
              showCount
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Введите комментарий к согласованию..."
            />
          </div>
        </Modal>
      </ConfigProvider>
    </>
  );
};
