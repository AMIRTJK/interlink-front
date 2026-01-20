import React, { useMemo, useState, useEffect } from "react";
import { Input, Avatar, Spin } from "antd";
import {
  SearchOutlined,
  StarFilled,
  StarOutlined,
  LoadingOutlined,
  ApartmentOutlined,
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

interface IDepartment {
  id: number;
  name: string;
}

interface IApiUser {
  id: number;
  full_name: string;
  position: string;
  photo_path: string | null;
}

interface IApiDepartment {
  id: number;
  name: string;
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

// 1. Department Card
interface DepartmentCardProps {
  department: IDepartment;
  isSelected: boolean;
  onToggleSelection: (id: number) => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  isSelected,
  onToggleSelection,
}) => {
  return (
    <div
      onClick={() => onToggleSelection(department.id)}
      className={`
        relative w-full flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border min-h-[140px]
        ${
          isSelected
            ? "bg-[#F4F8FF] border-blue-100/50 shadow-inner"
            : "bg-white border-transparent hover:border-blue-200 hover:shadow-lg"
        }
      `}
    >
      <div className="mb-3 transition-transform duration-300">
        <Avatar
          size={60}
          className={`shadow-sm bg-indigo-50 text-indigo-500 flex items-center justify-center transition-all duration-300 ${isSelected ? "ring-4 ring-white" : ""}`}
          icon={<ApartmentOutlined style={{ fontSize: 28 }} />}
        />
      </div>

      <h3 className="text-[14px] font-bold text-gray-900 text-center leading-tight px-1 line-clamp-3">
        {department.name}
      </h3>
    </div>
  );
};

// 2. Department Section
interface DepartmentSectionProps {
  title: string;
  departments: IDepartment[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
}

const DepartmentSection: React.FC<DepartmentSectionProps> = ({
  title,
  departments,
  selectedIds,
  onToggleSelection,
}) => {
  if (departments.length === 0) return null;

  return (
    <div className="relative border border-indigo-100 rounded-[32px] pt-8 pb-4 bg-white">
      <div className="max-h-[420px] overflow-y-auto no-scrollbar px-6 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center items-start">
          {departments.map((dept) => (
            <div key={dept.id} className="w-full max-w-[180px]">
              <DepartmentCard
                department={dept}
                isSelected={selectedIds.includes(dept.id)}
                onToggleSelection={onToggleSelection}
              />
            </div>
          ))}
        </div>
      </div>
      <span className="absolute -bottom-3 right-8 bg-white px-3 text-xs md:text-sm text-indigo-300 font-medium">
        {title}
      </span>
    </div>
  );
};

// 3. User Card
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
      <div className="mb-3 transition-transform duration-300">
        <Avatar
          src={user.avatar}
          size={80}
          className={`shadow-sm bg-gray-200 transition-all duration-300 ${isSelected ? "ring-4 ring-white" : ""}`}
        >
          {!user.avatar && user.name?.[0]}
        </Avatar>
      </div>

      <h3 className="text-[15px] font-bold text-gray-900 text-center leading-tight mb-1 px-1 line-clamp-2">
        {user.name}
      </h3>

      <p className="text-[13px] text-[#9AA4C2] text-center leading-tight px-1 mb-2 line-clamp-2">
        {user.role}
      </p>

      {/* Блок "Главный исполнитель" доступен только если юзер выбран */}
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

// 4. User Section
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
  onSave: (
    selectedUserIds: number[],
    selectedDeptIds: number[],
    mainExecutorIds: number[]
  ) => void;
  className?: string;
  initialSelectedUserIds?: number[];
  initialSelectedDeptIds?: number[];
  initialMainExecutorIds?: number[];
}

export const ExecutorStructure: React.FC<ExecutorStructureProps> = ({
  onCancel,
  onSave,
  className,
  initialSelectedUserIds = [],
  initialSelectedDeptIds = [],
  initialMainExecutorIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    initialSelectedUserIds
  );
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>(
    initialSelectedDeptIds
  );
  const [mainExecutorIds, setMainExecutorIds] = useState<number[]>(
    initialMainExecutorIds
  );

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const searchParams = useMemo(() => {
    return debouncedSearch ? { search: debouncedSearch } : {};
  }, [debouncedSearch]);

  // --- API Request ---
  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: searchParams,
  });

  const { data: deptsData, isLoading: loadingDepts } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    useToken: true,
    params: searchParams,
  });

  // Mappers
  const mappedUsers: IUser[] = useMemo(() => {
    const apiUsers = usersData?.data?.data || [];
    return apiUsers.map((u: IApiUser) => ({
      id: u.id,
      name: u.full_name,
      role: u.position || "Сотрудник",
      avatar: u.photo_path || `https://i.pravatar.cc/150?u=${u.id}`,
      group: getGroupByPosition(u.position),
    }));
  }, [usersData]);

  const mappedDepartments: IDepartment[] = useMemo(() => {
    const apiDepts = deptsData?.data?.data || [];
    return apiDepts.map((d: IApiDepartment) => ({
      id: d.id,
      name: d.name,
    }));
  }, [deptsData]);

  // Grouping
  const groupedUsers = useMemo(() => {
    return {
      management: mappedUsers.filter((u) => u.group === "management"),
      heads: mappedUsers.filter((u) => u.group === "heads"),
      specialists: mappedUsers.filter((u) => u.group === "specialists"),
    };
  }, [mappedUsers]);

  // --- HANDLERS ---

  // Тоггл Пользователя
  const toggleUserSelection = (id: number) => {
    setSelectedUserIds((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        // Если убираем юзера, убираем его и из "Главных"
        setMainExecutorIds((m) => m.filter((mid) => mid !== id));
        return prev.filter((pid) => pid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Тоггл Департамента (никак не влияет на пользователей)
  const toggleDeptSelection = (id: number) => {
    setSelectedDeptIds((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter((pid) => pid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Тоггл Главного исполнителя (только для юзеров)
  const toggleMain = (e: React.MouseEvent, id: number) => {
    setMainExecutorIds((prev) => {
      const isMain = prev.includes(id);
      return isMain ? prev.filter((mid) => mid !== id) : [...prev, id];
    });
  };

  const isLoading = loadingUsers || loadingDepts;
  const isEmpty = mappedUsers.length === 0 && mappedDepartments.length === 0;

  return (
    <div className={`flex flex-col h-full bg-white ${className || ""}`}>
      {/* Header Area */}
      <div className="flex flex-col items-start gap-4 shrink-0 w-full">
        <h2 className="text-base font-semibold text-left">
          Выбор исполнителей и департаментов
        </h2>

        <div className="w-full mb-10.5 transition-all duration-300 ease-out transform">
          <Input
            size="large"
            placeholder="Поиск по имени, должности или названию отдела..."
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
      </div>

      {/* Content scrollable area */}
      <div className="flex-1 overflow-y-auto custom-scroll space-y-10.5 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </div>
        ) : (
          <>
            {/* Блок Департаменты - использует selectedDeptIds и toggleDeptSelection */}
            <DepartmentSection
              title="Департаменты и отделы"
              departments={mappedDepartments}
              selectedIds={selectedDeptIds}
              onToggleSelection={toggleDeptSelection}
            />

            {/* Блоки Пользователей - используют selectedUserIds и toggleUserSelection */}
            <UserSection
              title="Руководство компании"
              users={groupedUsers.management}
              selectedIds={selectedUserIds}
              mainExecutorIds={mainExecutorIds}
              onToggleSelection={toggleUserSelection}
              onToggleMain={toggleMain}
            />

            <UserSection
              title="Руководители отделов"
              users={groupedUsers.heads}
              selectedIds={selectedUserIds}
              mainExecutorIds={mainExecutorIds}
              onToggleSelection={toggleUserSelection}
              onToggleMain={toggleMain}
            />

            <UserSection
              title="Рядовые специалисты"
              users={groupedUsers.specialists}
              selectedIds={selectedUserIds}
              mainExecutorIds={mainExecutorIds}
              onToggleSelection={toggleUserSelection}
              onToggleMain={toggleMain}
            />

            {/* Empty State */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <SearchOutlined
                  style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}
                />
                <p>Ничего не найдено</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-6 flex items-center justify-end gap-3 bg-white shrink-0 z-10 border-t border-gray-50 mt-auto">
        <button
          onClick={onCancel}
          className="w-[216px] h-[48px] cursor-pointer  rounded-xl border border-[#0037AF] text-[#0037AF] font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          Закрыть
        </button>
        <button
          // ОТПРАВЛЯЕМ 3 МАССИВА: ЮЗЕРЫ, ДЕПАРТАМЕНТЫ, ГЛАВНЫЕ
          onClick={() =>
            onSave(selectedUserIds, selectedDeptIds, mainExecutorIds)
          }
          className="w-[216px] h-[48px] cursor-pointer rounded-xl bg-[#0037AF] text-white font-medium hover:bg-[#002d90] transition-colors shadow-md flex items-center justify-center active:transform active:scale-[0.98]"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};
