import React, { useState } from "react";
import { Input, Spin } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { DepartmentSection } from "./executorStructure/DepartmentSection";
import { UserSection } from "./executorStructure/UserSection";
import { useExecutorStructureData } from "./executorStructure/useExecutorStructureData";

interface ExecutorStructureProps {
  onCancel: () => void;
  onSave: (
    selectedUserIds: number[],
    selectedDeptIds: number[],
    mainExecutorIds: number[],
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
  const {
    searchTerm,
    setSearchTerm,
    mappedDepartments,
    groupedUsers,
    isLoading,
    isEmpty,
  } = useExecutorStructureData();

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    initialSelectedUserIds,
  );
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>(
    initialSelectedDeptIds,
  );
  const [mainExecutorIds, setMainExecutorIds] = useState<number[]>(
    initialMainExecutorIds,
  );

  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
