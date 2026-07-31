import { Avatar } from "antd";
import { ApartmentOutlined, StarFilled } from "@ant-design/icons";
import { IApiDepartment, IApiUser } from "./visaFormModel";

interface IProps {
  users: IApiUser[];
  departments: IApiDepartment[];
  mainExecutorIds: number[];
}

/** Чипсы выбранных исполнителей: сначала сотрудники (главные — первыми), затем отделы. */
export const SelectedExecutorsList = ({
  users,
  departments,
  mainExecutorIds,
}: IProps) => (
  <div className="w-full px-4">
    <p className="text-[13px] font-bold text-[#b4bce0] mb-2.5 ml-1">
      Выбранные исполнители
    </p>

    {/* Используем Grid для ровного распределения (макс 2 в строку) */}
    <div className="grid grid-cols-2 gap-2 w-full">
      {/* 1. Сначала рендерим Пользователей (отсортированных: Главные -> Остальные) */}
      {users.map((user) => {
        const isMain = mainExecutorIds.includes(user.id);
        return (
          <div
            key={`user-${user.id}`}
            className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-1 pr-3 py-1 shadow-sm select-none min-w-0"
          >
            <div className="relative shrink-0">
              <Avatar
                src={user.photo_path}
                size={24}
                className={`
                          flex items-center justify-center text-[10px]
                          ${isMain ? "ring-2 ring-[#B4833E]" : "bg-gray-200"}
                        `}
              >
                {!user.photo_path && user.full_name?.[0]}
              </Avatar>
              {/* Звездочка для главного исполнителя */}
              {isMain && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[1px] leading-none z-10">
                  <StarFilled style={{ fontSize: "10px", color: "#B4833E" }} />
                </div>
              )}
            </div>
            <span className="text-[12px] text-gray-700 font-medium truncate">
              {user.full_name}
            </span>
          </div>
        );
      })}

      {/* 2. Затем рендерим Департаменты */}
      {departments.map((dept) => (
        <div
          key={`dept-${dept.id}`}
          className="flex items-center gap-2 bg-white border border-indigo-100 rounded-full pl-1 pr-3 py-1 shadow-sm select-none min-w-0"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
            <ApartmentOutlined style={{ fontSize: "14px" }} />
          </div>
          <span className="text-[12px] text-gray-700 font-medium truncate">
            {dept.name}
          </span>
        </div>
      ))}
    </div>
  </div>
);
