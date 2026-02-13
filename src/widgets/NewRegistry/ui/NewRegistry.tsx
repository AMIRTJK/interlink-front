import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetQuery, useDynamicSearchParams } from "@shared/lib"; // Твои хуки
import { ApiRoutes } from "@shared/api";
import {
  FileEdit,
  Loader,
  Handshake,
  Signature,
  CheckCheck,
  XCircle,
  Eye,
} from "lucide-react";
import { RegistryLayout } from "./RegistryLayout";
import { AppRoutes } from "@shared/config";
import { useRegistryConfig } from "../lib";

// Типы статусов, сопоставленные с твоим API
const STATUS_CONFIG: Record<string, any> = {
  draft: {
    label: "Черновик",
    icon: <FileEdit size={14} />,
    gradient: "from-blue-500 to-blue-600",
  },
  analysis: {
    label: "Анализ",
    icon: <FileEdit size={14} />,
    gradient: "from-blue-500 to-blue-600",
  },
  ["in-progress"]: {
    label: "В процессе исполнения",
    icon: <FileEdit size={14} />,
    gradient: "from-amber-500 to-amber-600",
  },
  ["to-approve"]: {
    label: "Согласование",
    icon: <Eye size={14} />,
    gradient: "from-emerald-500 to-emerald-600",
    apiUrl: ApiRoutes.GET_INTERNAL_TO_APPROVE,
  },
  ["to-sign"]: {
    label: "На подпись",
    icon: <Loader size={14} />,
    gradient: "from-rose-500 to-rose-600",
    apiUrl: ApiRoutes.GET_INTERNAL_TO_SIGN,
  },
  sent: {
    label: "Отправлено",
    icon: <Handshake size={14} />,
    gradient: "from-indigo-500 to-indigo-600",
    apiUrl: ApiRoutes.GET_INTERNAL_OUTGOING,
  },
  completed: {
    label: "Завершено",
    icon: <CheckCheck size={14} />,
    gradient: "from-green-500 to-green-600",
  },
  canceled: {
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

const REGISTRY_STATUS_MAP: Record<string, string[]> = {
  incoming: ["analysis", "completed"],
  outgoing: ["to-approve", "to-sign", "sent"],
  default: ["draft", "in-progress", "completed"],
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

  const fieldConfig = useRegistryConfig(type);

  // --- ЛОГИКА ИЗ СТАРОГО RegistryTable ---
  const { params: searchParams, setParams } = useDynamicSearchParams();

  const activeStatusKeys = useMemo(() => {
    if (type.includes("incoming")) return REGISTRY_STATUS_MAP["incoming"];
    if (type.includes("outgoing")) return REGISTRY_STATUS_MAP["outgoing"];
    return REGISTRY_STATUS_MAP["default"];
  }, [type]);

  const currentTab = searchParams.status || activeStatusKeys[0];

  const fetchUrl = useMemo(() => {
    const configUrl = STATUS_CONFIG[currentTab]?.apiUrl;

    return configUrl || url;
  }, [currentTab, url]);

  // Запрос счетчиков (для табов)
  const { data: countersData } = useGetQuery({
    url: ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
    params: extraParams?.kind ? { kind: extraParams.kind } : {},
  });

  // Основной запрос данных
  const { data: responseData } = useGetQuery({
    url: fetchUrl,
    params: {
      ...extraParams,
      ...searchParams,
      status: currentTab,
      page: searchParams.page || 1,
      per_page: searchParams.per_page || 9, // 9 для красивой сетки 3x3
    },
  });

  const documents = (responseData as any)?.data?.data || [];
  const meta = (responseData as any)?.data || {};
  const counts = (countersData as any)?.data || {};

  console.log(responseData);

  const statusTabs = useMemo(() => {
    return activeStatusKeys
      .map((key) => {
        const config = STATUS_CONFIG[key];

        if (!config) return null;

        return {
          id: key,
          label: config.label,
          icon: config.icon,
          gradient: config.gradient,
          count: counts[key] || 0,
        };
      })
      .filter(Boolean);
  }, [counts, activeStatusKeys]);

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
    setParams("sender", undefined); // Для селекта
    setParams("sender_name", undefined); // Если селект называется так
    setParams("date", undefined); // Для даты
    setParams("date_from", undefined); // Для диапазона
    setParams("date_to", undefined); // Для диапазона
    setParams("page", 1);
  };

  const handleCardClick = (id: string | number) => {
    const route = type.includes("external-incoming")
      ? AppRoutes.CORRESPONDENCE_INCOMING_SHOW
      : type.includes("internal-incoming")
        ? AppRoutes.INTERNAL_INCOMING_SHOW
        : type.includes("internal-outgoing") ||
            type.includes("internal-drafts") ||
            type.includes("internal-to-sign") ||
            type.includes("internal-to-approve")
          ? AppRoutes.INTERNAL_OUTGOING_SHOW
          : "";

    navigate(route.replace(":id", String(id)));
  };

  const handleCreate = () => {
    navigate(`${location.pathname}/create`);
  };

  return (
    <RegistryLayout
      documents={documents}
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
      fieldConfig={fieldConfig}
    />
  );
};
