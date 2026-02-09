import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetQuery, useDynamicSearchParams } from "@shared/lib"; // Твои хуки
import { ApiRoutes } from "@shared/api";
import {
  FileEdit,
  Loader,
  Handshake,
  Signature,
  Send,
  CheckCheck,
  XCircle,
  Eye,
} from "lucide-react";
import { RegistryLayout } from "./RegistryLayout";

// Типы статусов, сопоставленные с твоим API
const STATUS_CONFIG: Record<string, any> = {
  draft: {
    label: "Черновик",
    icon: <FileEdit size={14} />,
    gradient: "from-blue-500 to-blue-600",
  },
  to_register: {
    label: "Регистрация",
    icon: <FileEdit size={14} />,
    gradient: "from-blue-500 to-blue-600",
  },
  to_visa: {
    label: "Визирование",
    icon: <Eye size={14} />,
    gradient: "from-purple-500 to-purple-600",
  },
  to_execute: {
    label: "Исполнение",
    icon: <Loader size={14} />,
    gradient: "from-amber-500 to-amber-600",
  },
  to_approve: {
    label: "Согласование",
    icon: <Handshake size={14} />,
    gradient: "from-emerald-500 to-emerald-600",
  },
  to_sign: {
    label: "Подпись",
    icon: <Signature size={14} />,
    gradient: "from-rose-500 to-rose-600",
  },
  done: {
    label: "Завершено",
    icon: <CheckCheck size={14} />,
    gradient: "from-green-500 to-green-600",
  },
  cancelled: {
    label: "Отменено",
    icon: <XCircle size={14} />,
    gradient: "from-red-500 to-red-600",
  },
  // Дефолт
  default: {
    label: "Документ",
    icon: <FileEdit size={14} />,
    gradient: "from-gray-500 to-gray-600",
  },
};

interface NewRegistryProps {
  type: string;
  createButtonText?: string;
  url?: string;
  extraParams?: Record<string, unknown>;
}

export const NewRegistry = ({
  type,
  createButtonText,
  url = ApiRoutes.GET_CORRESPONDENCES,
  extraParams,
}: NewRegistryProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- ЛОГИКА ИЗ СТАРОГО RegistryTable ---
  const { params: searchParams, setParams } = useDynamicSearchParams();
  const currentTab =
    searchParams.status ||
    (type === "internal-outgoing" ? "to_approve" : "draft");

  // Запрос счетчиков (для табов)
  const { data: countersData } = useGetQuery({
    url: ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
    params: extraParams?.kind ? { kind: extraParams.kind } : {},
  });

  // Основной запрос данных
  const {
    data: responseData,
    isPending,
    refetch,
  } = useGetQuery({
    url,
    params: {
      ...extraParams,
      ...searchParams,
      status: currentTab,
      page: searchParams.page || 1,
      per_page: searchParams.per_page || 9, // 9 для красивой сетки 3x3
    },
  });

  const documents = (responseData as any)?.data?.data || [];
  const meta = (responseData as any)?.data?.meta || {};
  const counts = (countersData as any)?.data || {};

  // Формируем конфиг табов на основе данных счетчиков и конфига
  const statusTabs = useMemo(() => {
    // Здесь можно пробежаться по ключам counts или задать жесткий список
    return Object.keys(STATUS_CONFIG)
      .map((key) => {
        if (key === "default") return null;
        // Если для этого типа (type) такой статус не актуален, можно отфильтровать
        return {
          id: key,
          label: STATUS_CONFIG[key].label,
          count: counts[key] || 0,
          icon: STATUS_CONFIG[key].icon,
          gradient: STATUS_CONFIG[key].gradient,
        };
      })
      .filter(Boolean);
  }, [counts]);

  // Обработчики
  const handleTabChange = (statusId: string) => {
    setParams("status", statusId);
    setParams("page", 1);
  };

  const handlePageChange = (page: number) => {
    setParams("page", page);
  };

  const handleFilterApply = (newFilters: any) => {
    Object.entries(newFilters).forEach(([key, val]) => {
      setParams(key, val);
    });
    setParams("page", 1);
  };

  const handleFilterReset = () => {
    // Сброс фильтров (кроме служебных)
    setParams("incomingNumber", undefined);
    setParams("outgoingNumber", undefined);
    setParams("sender", undefined);
    setParams("page", 1);
  };

  const handleCardClick = (id: number) => {
    // Логика роутинга из старого файла
    const route = type.includes("external-incoming")
      ? `/correspondence/incoming/${id}` // Пример, подставь свои AppRoutes
      : `/correspondence/outgoing/${id}`;
    navigate(route);
  };

  const handleCreate = () => {
    navigate(`${location.pathname}/create`);
  };

  return (
    <RegistryLayout
      documents={documents}
      isLoading={isPending}
      meta={meta}
      tabs={statusTabs}
      activeTabId={currentTab}
      createButtonText={createButtonText}
      onTabChange={handleTabChange}
      onPageChange={handlePageChange}
      onFilterApply={handleFilterApply}
      onFilterReset={handleFilterReset}
      onCardClick={handleCardClick}
      onCreate={handleCreate}
      currentFilters={{
        incomingNumber: searchParams.incomingNumber,
        outgoingNumber: searchParams.outgoingNumber,
        sender: searchParams.sender,
      }}
      statusConfig={STATUS_CONFIG}
    />
  );
};
