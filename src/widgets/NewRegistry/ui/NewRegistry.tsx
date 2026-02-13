import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetQuery, useDynamicSearchParams } from "@shared/lib";
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
import { IBreadcrumbItem } from "@shared/ui";

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
  to_approve: {
    label: "Согласование",
    icon: <Eye size={14} />,
    gradient: "from-emerald-500 to-emerald-600",
  },
  ["to-sign"]: {
    label: "На подпись",
    icon: <Loader size={14} />,
    gradient: "from-rose-500 to-rose-600",
    apiUrl: ApiRoutes.GET_INTERNAL_TO_SIGN,
  },
  to_sign: {
    label: "На подпись",
    icon: <Loader size={14} />,
    gradient: "from-rose-500 to-rose-600",
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
  const { params: searchParams, setParams } = useDynamicSearchParams();

  const isInternal = type.startsWith("internal");

  const activeStatusKeys = useMemo(() => {
    if (type.includes("incoming")) return REGISTRY_STATUS_MAP["incoming"];
    if (type.includes("outgoing")) return REGISTRY_STATUS_MAP["outgoing"];
    return REGISTRY_STATUS_MAP["default"];
  }, [type]);

  const defaultStatus = useMemo(() => {
    if (searchParams.folder_id) return "";
    if (type === "internal-incoming") return "analysis";
    if (type === "internal-outgoing") return "sent";
    if (type === "internal-drafts") return "draft";
    if (type === "internal-to-sign") return "to-sign";
    if (type === "internal-to-approve") return "to-approve";
    return "";
  }, [type, searchParams.folder_id]);

  const currentTab = searchParams.status || defaultStatus || activeStatusKeys[0];

  const fetchUrl = useMemo(() => {
    const configUrl = STATUS_CONFIG[currentTab]?.apiUrl;
    return configUrl || url;
  }, [currentTab, url]);

  const { data: countersData } = useGetQuery({
    url: isInternal
      ? ApiRoutes.GET_INTERNAL_COUNTERS
      : ApiRoutes.GET_COUNTERS_CORRESPONDENCE,
    params: extraParams?.kind ? { kind: extraParams.kind } : {},
  });

  const { data: foldersData } = useGetQuery({
    url: ApiRoutes.GET_FOLDERS,
    params: {},
  });

  const folders = useMemo(() => foldersData?.data || [], [foldersData]);

  const { data: responseData } = useGetQuery({
    url: fetchUrl,
    params: {
      ...extraParams,
      ...searchParams,
      status: currentTab,
      page: searchParams.page || 1,
      per_page: searchParams.per_page || 9,
    },
  });

  const breadcrumbs = useMemo(() => {
    const items: IBreadcrumbItem[] = [];

    const rootLabel =
      type === "internal-incoming"
        ? "Входящие"
        : type === "internal-outgoing"
          ? "Исходящие"
          : type === "internal-drafts"
            ? "Черновики"
            : type === "internal-to-sign"
              ? "На подпись"
              : type === "internal-to-approve"
                ? "На согласование"
                : "Реестр";

    items.push({
      label: rootLabel,
      onClick: () => {
        setParams("folder_id", undefined);
        setParams("status", undefined);
      },
    });

    if (searchParams.folder_id && folders.length > 0) {
      const path: IBreadcrumbItem[] = [];
      let currentId: number | null = parseInt(searchParams.folder_id, 10);

      while (currentId) {
        const folder = folders.find((f: any) => f.id === currentId);
        if (folder) {
          if (folder.name !== rootLabel) {
            const siblings = folders
              .filter((f: any) => f.parent_id === folder.parent_id && f.id !== folder.id)
              .map((s: any) => ({
                label: s.name,
                onClick: () => setParams("folder_id", String(s.id)),
              }));

            const subfolders = folders
              .filter((f: any) => f.parent_id === folder.id)
              .map((s: any) => ({
                label: s.name,
                onClick: () => setParams("folder_id", String(s.id)),
              }));

            const allOptions: any[] = [];
            
            if (subfolders.length > 0) {
              allOptions.push({ label: "Вложенные папки", isHeader: true });
              allOptions.push(...subfolders);
            }
            
            if (siblings.length > 0) {
              if (allOptions.length > 0) allOptions.push({ isDivider: true });
              allOptions.push({ label: "Другие папки", isHeader: true });
              allOptions.push(...siblings);
            }

            path.unshift({
              label: folder.name,
              onClick: () => setParams("folder_id", String(folder.id)),
              options: allOptions.length > 0 ? allOptions : undefined,
            });
          }
          currentId = folder.parent_id;
        } else {
          currentId = null;
        }
      }
      items.push(...path);
    }

    if (items.length > 0) {
      items[items.length - 1].isActive = true;
    }

    return items;
  }, [type, searchParams.folder_id, folders, setParams]);

  const documents = (responseData as any)?.data?.data || [];
  const meta = (responseData as any)?.data || {};
  const counts = (countersData as any)?.data || {};

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
    setParams("incomingNumber", undefined);
    setParams("outgoingNumber", undefined);
    setParams("sender", undefined);
    setParams("sender_name", undefined);
    setParams("date", undefined);
    setParams("date_from", undefined);
    setParams("date_to", undefined);
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
      breadcrumbs={breadcrumbs}
    />
  );
};
