import { useState } from "react";
import { Modal, Avatar } from "antd";
import { Users } from "lucide-react";

// Пользователь, совершивший действие над письмом (ответил / переслал /
// ознакомился). Дата приходит в action_at (ответ/пересылка) либо в
// acknowledged_at (ознакомление).
interface ActionUser {
  id?: string | number;
  user_id?: string | number;
  action_at?: string;
  acknowledged_at?: string;
  user?: {
    id?: string | number;
    full_name?: string;
    position?: string;
  };
}

const initialsOf = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  ).toUpperCase();
};

// Ячейка-триггер списка пользователей для реестра: показывает первого + «+N»,
// по клику открывает окно со всем списком (по образцу RecipientsViewer).
export const PeopleViewer = ({
  label,
  avatarBg,
  users,
}: {
  label: string;
  avatarBg: string;
  users: ActionUser[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const list = Array.isArray(users) ? users : [];

  if (list.length === 0) {
    return <span className="text-gray-400 dark:text-slate-500">—</span>;
  }

  const firstName = list[0]?.user?.full_name || "Без имени";
  const othersCount = list.length - 1;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="group flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors"
      >
        <span
          className="truncate max-w-[120px] text-gray-700 dark:text-slate-200"
          title={firstName}
        >
          {firstName}
        </span>
        {othersCount > 0 && (
          <span className="flex-shrink-0 text-xs font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md group-hover:bg-blue-100 transition-colors">
            +{othersCount}
          </span>
        )}
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600!" />
            <span>
              {label} ({list.length})
            </span>
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
          className="flex flex-col gap-2 py-2 max-h-[60vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {list.map((au, idx) => {
            const u = au.user || {};
            const when = au.action_at || au.acknowledged_at;
            return (
              <div
                key={au.id || u.id || idx}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
              >
                <Avatar className={`${avatarBg} text-xs!`}>
                  {initialsOf(u.full_name)}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-gray-800 font-medium truncate">
                    {u.full_name || "Без имени"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {u.position || "Сотрудник"}
                  </div>
                </div>
                {when && (
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(when).toLocaleDateString("ru-RU")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
