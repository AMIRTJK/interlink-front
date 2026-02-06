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
} from "@ant-design/icons";
import {
  Avatar,
  Tooltip,
  Button,
  Divider,
  Modal,
  Input,
  Tabs,
  Tag,
} from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// --- КОНСТАНТЫ ---
const MAX_VISIBLE_DOCS = 2;
const MAX_VISIBLE_APPROVERS = 3;

// --- КОМПОНЕНТ МОДАЛЬНОГО ОКНА ИСТОРИИ ---
const FullHistoryModal = ({
  isOpen,
  onClose,
  workflowData,
  initialTab = "participants",
}: {
  isOpen: boolean;
  onClose: () => void;
  workflowData: any;
  initialTab?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const sourceData = workflowData?.data || workflowData || {};
  const signers = sourceData.signatures || [];
  const approvers = sourceData.approvals || [];
  const documents = sourceData.documents || [];

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

  const totalParticipants = filteredSigners.length + filteredApprovers.length;

  const renderStatusTag = (status: string) => {
    const map: Record<string, any> = {
      signed: { color: "success", text: "Подписано" },
      approved: { color: "success", text: "Согласовано" },
      rejected: { color: "error", text: "Отказано" },
      pending: { color: "default", text: "Ожидание" },
    };
    const s = map[status] || map.pending;
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  // Вспомогательная функция для рендера строки участника внутри модалки
  const renderParticipantRow = (item: any, type: "signer" | "approver") => (
    <div
      key={item.id}
      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all mb-2"
    >
      <div className="flex items-center gap-3">
        <Avatar src={item.user?.photo_path} icon={<UserOutlined />} />
        <div>
          <div className="font-medium text-gray-800">
            {item.user?.full_name}
          </div>
          <div className="text-xs text-gray-500">{item.user?.position}</div>
          {item.updated_at && (
            <div className="text-[10px] text-gray-400 mt-1">
              {new Date(item.updated_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div>{renderStatusTag(item.status)}</div>

        {/* Кнопка зависит от типа, переданного в функцию */}
        {type === "signer" && (
          <Button
            type="primary"
            size="small"
            className="bg-blue-600! hover:bg-blue-500!"
            onClick={() => console.log("Подписать (Modal)", item.id)}
          >
            Подписать
          </Button>
        )}

        {type === "approver" && (
          <Button
            type="primary"
            size="small"
            className="bg-green-600 hover:bg-green-500 border-green-600"
            onClick={() => console.log("Согласовать (Modal)", item.id)}
          >
            Согласовать
          </Button>
        )}
      </div>
    </div>
  );

  const items = [
    {
      key: "participants",
      label: `Участники (${totalParticipants})`,
      children: (
        <div className="flex flex-col h-[60vh]! overflow-y-auto pr-2 custom-scrollbar">
          {/* СЕКЦИЯ ПОДПИСАНТОВ */}
          {filteredSigners.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                Подписанты ({filteredSigners.length})
              </div>
              {filteredSigners.map((s: any) =>
                renderParticipantRow(s, "signer"),
              )}
            </div>
          )}

          {/* СЕКЦИЯ СОГЛАСУЮЩИХ */}
          {filteredApprovers.length > 0 && (
            <div>
              {/* Разделитель, если есть и те и другие */}
              {filteredSigners.length > 0 && (
                <Divider className="my-4! border-gray-200!" />
              )}
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                Согласующие ({filteredApprovers.length})
              </div>
              {filteredApprovers.map((a: any) =>
                renderParticipantRow(a, "approver"),
              )}
            </div>
          )}

          {/* ЕСЛИ ПУСТО */}
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
              className="flex items-start gap-3 p-3 bg-blue-50/30 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors"
            >
              <div className="mt-1 text-blue-500">
                <FileTextOutlined />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-blue-700">
                    {doc.reg_number}
                  </span>
                  <span className="text-xs text-gray-400">{doc.date}</span>
                </div>
                <div className="text-sm text-gray-700 mt-1">{doc.subject}</div>
                <div className="mt-2">
                  <a
                    href={`/documents/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
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
  ];

  return (
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
        placeholder="Поиск по участникам или документам..."
        prefix={<SearchOutlined className="text-gray-400!" />} // Important сохранен
        className="mb-4!" // Important сохранен
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        className="h-full!" // Important сохранен
      />
    </Modal>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ПАНЕЛИ ---

export const WorkflowParticipantsPanel = ({
  workflowData,
  isCollapsed,
  toggleCollapse,
}: {
  workflowData: any;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    tab: string;
  }>({
    isOpen: false,
    tab: "participants",
  });

  const openModal = (tab: "participants" | "documents") => {
    setModalState({ isOpen: true, tab });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  if (!workflowData) return null;

  const sourceData = workflowData.data || workflowData;
  const signers = sourceData.signatures || [];
  const approvers = sourceData.approvals || [];
  const documents = sourceData.documents || [];

  const visibleDocuments = isCollapsed
    ? []
    : documents.slice(0, MAX_VISIBLE_DOCS);
  const hiddenDocsCount = documents.length - visibleDocuments.length;

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
          bg: "bg-white",
          // Важно: ! нужен для перебивания цвета иконки Antd
          icon: <CheckCircleFilled className="text-green-500!" />,
        };
      case "rejected":
        return {
          color: "text-red-500",
          bg: "bg-white",
          icon: <CloseCircleFilled className="text-red-500!" />,
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-white",
          icon: <ClockCircleFilled className="text-gray-400!" />,
        };
    }
  };

  const renderDocumentRow = (doc: any) => (
    <Link
      to={`/documents/${doc.id}`}
      key={doc.id}
      className="flex items-start gap-3 p-3 bg-blue-50/40 rounded-lg border border-blue-100 mb-2 hover:bg-blue-50 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer group no-underline"
    >
      <div className="mt-0.5 text-blue-500">
        <FileTextOutlined />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-blue-700 truncate group-hover:text-blue-800 transition-colors">
          {doc.reg_number || "Без номера"}
        </div>
        <div className="text-xs text-gray-600 line-clamp-2 leading-tight mt-0.5">
          {doc.subject}
        </div>
        <div className="text-[10px] text-gray-400 mt-1">{doc.date}</div>
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
              // Изменено на bg-gray-200! для консистентности (suffix syntax)
              className="bg-gray-200!"
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
      <div key={item.id} className="relative flex gap-3 group">
        {/* Линия таймлайна */}
        {!isLast && (
          <div className="absolute left-[15px] top-8 bottom-[-12px] w-[2px] bg-gray-100 group-hover:bg-gray-200 transition-colors" />
        )}

        <div className="relative z-10 shrink-0">
          <Avatar
            src={user.photo_path}
            icon={<UserOutlined />}
            // Добавил ! к классам opacity и grayscale для перебития стилей Antd
            className={`transition-colors! ${status === "pending" ? "grayscale-[0.5]! opacity-70!" : ""}`}
          />
          {/* Статус */}
          <div
            className={`absolute -top-1 -right-1 rounded-full border border-white leading-[0] ${meta.bg}`}
          >
            {meta.icon}
          </div>
        </div>

        <div className="flex-1 min-w-0 pb-4">
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-medium truncate pr-2 ${status === "pending" ? "text-gray-500" : "text-gray-800"}`}
            >
              {fullName}
            </span>
          </div>
          <div
            className="text-xs text-gray-400 truncate mt-0.5"
            title={position}
          >
            {position}
          </div>

          {/* --- КНОПКИ ДЛЯ ПАНЕЛИ --- */}
          <div className="mt-2">
            {role === "signer" && (
              <Button
                type="primary"
                size="small"
                className="bg-blue-600! hover:bg-blue-500!"
                onClick={() => console.log("Подписать", item.id)}
              >
                Подписать
              </Button>
            )}
            {role === "approver" && (
              <Button
                type="primary"
                size="small"
                className="bg-blue-600! hover:bg-blue-500!"
                onClick={() => console.log("Согласовать", item.id)}
              >
                Согласовать
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Кнопка "Показать остальных" (Исправленный hover)
  const renderShowMoreParticipants = (count: number) => (
    <div
      onClick={() => openModal("participants")}
      className="relative flex items-center gap-3 group cursor-pointer"
    >
      <div className="absolute left-[15px] top-0 bottom-1/2 w-[2px] bg-gray-100 group-hover:bg-blue-100 transition-colors" />

      <div className="relative z-10 w-[32px] flex justify-center">
        <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-500 transition-all text-[10px]">
          <EyeOutlined />
        </div>
      </div>

      <div className="flex-1 py-2 border-b border-dashed border-gray-200 group-hover:border-blue-200 transition-colors">
        <span className="text-xs text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
          Показать остальных ({count})
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`
        relative flex flex-col bg-white border-l border-gray-200 shadow-xl shadow-gray-200/50
        transition-all duration-300 ease-in-out h-[calc(100vh-64px)]! sticky top-0
        ${isCollapsed ? "w-16 items-center py-4" : "w-80"}
      `}
      >
        <button
          onClick={toggleCollapse}
          className="absolute -left-3 top-6 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-gray-50 text-gray-500 z-20 transition-transform hover:scale-110 cursor-pointer"
        >
          {isCollapsed ? (
            <LeftOutlined className="text-[10px]!" />
          ) : (
            <RightOutlined className="text-[10px]!" />
          )}
        </button>

        {!isCollapsed && (
          <div className="px-4 py-4 border-b border-gray-100 shrink-0 bg-white z-10 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 m-0">
              <InfoCircleOutlined className="text-gray-400!" />
              Информация
            </h3>
            <Tooltip title="Полная история">
              <Button
                type="text"
                size="small"
                icon={<HistoryOutlined />}
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
                    <span className="bg-gray-100 px-1.5 rounded text-gray-600 text-[10px]">
                      {documents.length}
                    </span>
                  </div>
                  {visibleDocuments.map(renderDocumentRow)}

                  {hiddenDocsCount > 0 && (
                    <div
                      onClick={() => openModal("documents")}
                      className="mt-2 w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 group"
                    >
                      <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700">
                        Показать все документы: {documents.length}
                      </span>
                    </div>
                  )}
                  <Divider className="my-4! border-gray-100!" />
                </>
              ) : (
                <Tooltip
                  title={`Вложения: ${documents.length} шт.`}
                  placement="left"
                >
                  <div
                    className="mb-4 w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => openModal("documents")}
                  >
                    <PaperClipOutlined />
                  </div>
                </Tooltip>
              )}
            </div>
          )}

          {signers.length > 0 && (
            <div className="mb-2">
              {!isCollapsed && (
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">
                  Подписанты
                </div>
              )}
              {signers.map((s: any, idx: number) =>
                renderUserRow(
                  s,
                  "signer",
                  idx === signers.length - 1 && approvers.length === 0,
                ),
              )}
            </div>
          )}

          {approvers.length > 0 && (
            <div>
              {!isCollapsed && (
                <>
                  {signers.length > 0 && (
                    <div className="ml-[15px] h-4 w-[2px] bg-gray-100 mb-1 -mt-2" />
                  )}
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1 flex justify-between items-center">
                    <span>Согласующие</span>
                    <span className="bg-gray-100 text-gray-500 px-1.5 rounded text-[9px]">
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
          <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
            <Button
              block
              onClick={() => openModal("participants")}
              className="bg-white! border-gray-200! text-gray-600! hover:text-blue-600! hover:border-blue-200! shadow-sm! h-9! font-medium!"
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
      />
    </>
  );
};
