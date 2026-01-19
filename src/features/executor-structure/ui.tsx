import "./style.css";
import React, { useMemo, useState } from "react";
import { Input, Avatar, Spin } from "antd";
import {
  SearchOutlined,
  StarFilled,
  StarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

// --- Types ---
type UserGroup = "management" | "heads" | "specialists";

interface IUser {
  id: number;
  name: string;
  role: string;
  avatar: string;
  group: UserGroup;
}

// Интерфейс приходящего с бекенда юзера
interface IApiUser {
  id: number;
  full_name: string;
  position: string;
  photo_path: string | null;
  // остальные поля не обязательны для UI
}

// --- Helper: Определение группы по должности ---
const getGroupByPosition = (position: string | null): UserGroup => {
  if (!position) return "specialists";
  const lower = position.toLowerCase();

  if (
    lower.includes("директор") ||
    lower.includes("admin") ||
    lower.includes("ceo") ||
    lower.includes("генеральный")
  ) {
    return "management";
  }

  if (
    lower.includes("руководитель") ||
    lower.includes("head") ||
    lower.includes("начальник") ||
    lower.includes("менеджер")
  ) {
    return "heads";
  }

  return "specialists";
};

// --- Sub-components ---

interface UserCardProps {
  user: IUser;
  isSelected: boolean;
  isMain: boolean;
  onToggleSelection: (id: number) => void;
  onToggleMain: (e: React.MouseEvent, id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  isMain,
  onToggleSelection,
  onToggleMain,
}) => {
  return (
    <div
      onClick={() => onToggleSelection(user.id)}
      className={`
        relative w-full flex flex-col items-center justify-start p-4 rounded-2xl cursor-pointer transition-all duration-300 border min-h-[180px]
        ${
          isSelected
            ? "bg-[#F4F8FF] border-blue-100/50 shadow-inner"
            : "bg-white border-transparent hover:border-blue-200 hover:shadow-lg"
        }
      `}
    >
      {/* Аватар */}
      <div className="mb-3 transition-transform duration-300">
        <Avatar
          src={user.avatar}
          size={80}
          className={`shadow-sm bg-gray-200 transition-all duration-300 ${isSelected ? "ring-4 ring-white" : ""}`}
        >
          {/* Фолбек если нет картинки - инициалы */}
          {!user.avatar && user.name?.[0]}
        </Avatar>
      </div>

      {/* Имя */}
      <h3 className="text-[15px] font-bold text-gray-900 text-center leading-tight mb-1 px-1 line-clamp-2">
        {user.name}
      </h3>

      {/* Должность */}
      <p className="text-[13px] text-[#9AA4C2] text-center leading-tight px-1 mb-2 line-clamp-2">
        {user.role}
      </p>

      {/* Блок "Главный исполнитель" */}
      {isSelected && (
        <div
          key="main-executor-badge"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMain(e, user.id);
          }}
          className="mt-auto pt-2 flex items-center gap-2 cursor-pointer group/star select-none animate-fade-in-up"
          style={{ animationDuration: "0.3s" }}
        >
          <div className="transform transition-transform duration-300 group-hover/star:scale-125 group-hover/star:rotate-12 active:scale-90 flex items-center justify-center">
            {isMain ? (
              <StarFilled
                style={{ fontSize: "18px", color: "#B4833E" }}
                className="drop-shadow-sm"
              />
            ) : (
              <StarOutlined
                style={{ fontSize: "18px", color: "#B4833E" }}
                className="opacity-70 group-hover/star:opacity-100 transition-opacity"
              />
            )}
          </div>

          <span className="text-[13px] text-[#1A1A1A] font-medium leading-none transition-colors duration-200 group-hover/star:text-[#B4833E]">
            Главный исполнитель
          </span>
        </div>
      )}
    </div>
  );
};

interface UserSectionProps {
  title: string;
  users: IUser[];
  selectedIds: number[];
  mainExecutorIds: number[];
  onToggleSelection: (id: number) => void;
  onToggleMain: (e: React.MouseEvent, id: number) => void;
}

const UserSection: React.FC<UserSectionProps> = ({
  title,
  users,
  selectedIds,
  mainExecutorIds,
  onToggleSelection,
  onToggleMain,
}) => {
  if (users.length === 0) return null;

  return (
    <div className="relative border border-blue-100 rounded-[32px] pt-8 pb-4 bg-white">
      {/* 
         no-scrollbar class applied here 
      */}
      <div className="max-h-[420px] overflow-y-auto no-scrollbar px-6 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center items-start">
          {users.map((user) => (
            <div key={user.id} className="w-full max-w-[180px]">
              <UserCard
                user={user}
                isSelected={selectedIds.includes(user.id)}
                isMain={mainExecutorIds.includes(user.id)}
                onToggleSelection={onToggleSelection}
                onToggleMain={onToggleMain}
              />
            </div>
          ))}
        </div>
      </div>
      <span className="absolute -bottom-3 right-8 bg-white px-3 text-xs md:text-sm text-[#BCC5DF] font-medium">
        {title}
      </span>
    </div>
  );
};

// --- Main Component ---

interface ExecutorStructureProps {
  onCancel: () => void;
  onSave: (selectedIds: number[], mainExecutorIds: number[]) => void;
  className?: string;
}

export const ExecutorStructure: React.FC<ExecutorStructureProps> = ({
  onCancel,
  onSave,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [mainExecutorIds, setMainExecutorIds] = useState<number[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- API Request ---
  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
  });

  // Преобразование данных с API в формат UI
  const mappedUsers: IUser[] = useMemo(() => {
    // Получаем массив пользователей из ответа (response.data.data)
    const apiUsers = usersData?.data?.data || [];

    return apiUsers.map((u: IApiUser) => ({
      id: u.id,
      name: u.full_name,
      role: u.position || "Сотрудник",
      // Если фото нет, используем заглушку pravatar (или можно null, тогда Avatar покажет букву)
      avatar: u.photo_path || `https://i.pravatar.cc/150?u=${u.id}`,
      group: getGroupByPosition(u.position),
    }));
  }, [usersData]);

  // Фильтрация
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return mappedUsers;
    return mappedUsers.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, mappedUsers]);

  // Группировка
  const groupedUsers = useMemo(() => {
    return {
      management: filteredUsers.filter((u) => u.group === "management"),
      heads: filteredUsers.filter((u) => u.group === "heads"),
      specialists: filteredUsers.filter((u) => u.group === "specialists"),
    };
  }, [filteredUsers]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        setMainExecutorIds((m) => m.filter((mid) => mid !== id));
        return prev.filter((pid) => pid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleMain = (e: React.MouseEvent, id: number) => {
    setMainExecutorIds((prev) => {
      const isMain = prev.includes(id);
      return isMain ? prev.filter((mid) => mid !== id) : [...prev, id];
    });
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className || ""}`}>
      {/* Header Area */}
      <div className="flex flex-col items-start gap-4 shrink-0 w-full">
        <h2 className="text-base font-semibold text-left">
          Выбор исполнителей
        </h2>

        <div className="w-full mb-10.5 transition-all duration-300 ease-out transform">
          <Input
            size="large"
            placeholder="Поиск сотрудника по имени или должности..."
            prefix={
              <SearchOutlined
                className={`text-lg mr-2 transition-colors duration-300 ${isSearchFocused ? "text-blue-600" : "text-gray-400"}`}
              />
            }
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full h-12 rounded-2xl border bg-gray-50/50 text-base shadow-sm transition-all duration-300
              ${
                isSearchFocused
                  ? "border-blue-500 shadow-lg shadow-blue-500/15"
                  : "border-gray-200 hover:border-blue-300"
              }
            `}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
      </div>

      {/* Content scrollable area */}
      <div className="flex-1 overflow-y-auto custom-scroll space-y-10.5 pb-4">
        {loadingUsers ? (
          <div className="flex items-center justify-center h-full">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </div>
        ) : (
          <>
            <UserSection
              title="Руководство компании"
              users={groupedUsers.management}
              selectedIds={selectedIds}
              mainExecutorIds={mainExecutorIds}
              onToggleSelection={toggleSelection}
              onToggleMain={toggleMain}
            />

            <UserSection
              title="Руководители отделов"
              users={groupedUsers.heads}
              selectedIds={selectedIds}
              mainExecutorIds={mainExecutorIds}
              onToggleSelection={toggleSelection}
              onToggleMain={toggleMain}
            />

            <UserSection
              title="Рядовые специалисты"
              users={groupedUsers.specialists}
              selectedIds={selectedIds}
              mainExecutorIds={mainExecutorIds}
              onToggleSelection={toggleSelection}
              onToggleMain={toggleMain}
            />

            {/* Empty State for Search */}
            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <SearchOutlined
                  style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}
                />
                <p>Сотрудники не найдены</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-6 flex items-center justify-end gap-3 bg-white shrink-0 z-10 border-t border-gray-50 mt-auto">
        <button
          onClick={onCancel}
          className="w-[216px] h-[48px] rounded-xl border border-[#0037AF] text-[#0037AF] font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          Закрыть
        </button>
        <button
          onClick={() => onSave(selectedIds, mainExecutorIds)}
          className="w-[216px] h-[48px] rounded-xl bg-[#0037AF] text-white font-medium hover:bg-[#002d90] transition-colors shadow-md flex items-center justify-center active:transform active:scale-[0.98]"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};
