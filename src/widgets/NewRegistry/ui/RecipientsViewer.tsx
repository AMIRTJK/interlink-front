import React, { useState } from "react";
import { Modal, Tag, Avatar, Tooltip } from "antd";
import { User, Users, Copy } from "lucide-react";

// Типы (адаптируйте под вашу реальную структуру данных)
interface RecipientUser {
  id: number;
  full_name: string;
  // другие поля...
}

interface Recipient {
  user?: RecipientUser;
  recipient_name?: string; // на случай если это просто строка
  type: "to" | "cc" | string;
}

interface RecipientsViewerProps {
  data: {
    recipient_name?: string;
    recipients?: Recipient[];
    status?: string;
  };
}

export const RecipientsViewer = ({ data }: RecipientsViewerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Если статус "На подписании", логика может быть другой (как у вас в примере)
  if (data.status === "to_sign") return <span>На подписании</span>;

  // Безопасно получаем список
  const allRecipients = data.recipients || [];

  // Если массив пустой, пытаемся показать recipient_name или прочерк
  if (allRecipients.length === 0) {
    return <span>{data.recipient_name || "—"}</span>;
  }

  // Основной получатель для отображения в ячейке
  const firstRecipientName =
    allRecipients[0]?.user?.full_name ||
    allRecipients[0]?.recipient_name ||
    "—";
  const othersCount = allRecipients.length - 1;

  // Разделяем списки
  const toList = allRecipients.filter((r) => r.type === "to");
  const ccList = allRecipients.filter((r) => r.type === "cc"); // согласование/копия

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // ВАЖНО: Останавливаем всплытие, чтобы не открылась карточка документа
    setIsModalOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Триггер в таблице */}
      <div
        onClick={handleOpen}
        className="group flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors"
      >
        <span className="truncate max-w-[150px]" title={firstRecipientName}>
          {firstRecipientName}
        </span>

        {othersCount > 0 && (
          <span className="flex-shrink-0 text-xs font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md group-hover:bg-blue-100 transition-colors">
            +{othersCount}
          </span>
        )}
      </div>

      {/* Модальное окно */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600!" />
            <span>Список получателей</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width={500}
        centered
        maskClosable={true}
        wrapProps={{
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              handleClose(e);
            }
          },
        }}
      >
        <div
          className="flex flex-col gap-6 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Секция КОМУ */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <User size={14} />
              <span>Кому ({toList.length})</span>
            </div>
            {toList.length > 0 ? (
              <div className="flex flex-col gap-2">
                {toList.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                  >
                    <Avatar className="bg-blue-600! text-xs!">
                      {r.user?.full_name?.[0] || "U"}
                    </Avatar>
                    <span className="text-gray-800 font-medium">
                      {r.user?.full_name || r.recipient_name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 italic text-sm">
                Нет прямых получателей
              </span>
            )}
          </div>

          {/* Разделитель */}
          {toList.length > 0 && ccList.length > 0 && (
            <div className="h-px bg-gray-100" />
          )}

          {/* Секция КОПИЯ / СОГЛАСОВАНИЕ */}
          {ccList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <Copy size={14} />
                <span>Копия ({ccList.length})</span>
              </div>
              <div className="flex flex-col gap-2">
                {ccList.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                  >
                    <Avatar className="bg-amber-500! text-xs!">
                      {r.user?.full_name?.[0] || "U"}
                    </Avatar>
                    <span className="text-gray-800 font-medium">
                      {r.user?.full_name || r.recipient_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
