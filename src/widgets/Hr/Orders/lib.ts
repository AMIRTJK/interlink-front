import { useState, useMemo } from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IHrOrder } from "@entities/hr";
import { TOrderStatus, IOrderRecord, normalizeOrders } from "./model";
import { TMinisterFilter } from "./ui/OrderFilters";

export const ORDER_STATUS_CONFIG: Record<
  TOrderStatus,
  { bg: string; text: string; dot: string }
> = {
  draft: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  signed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  approved: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

export const ORDER_STATUS_FALLBACK = {
  bg: "bg-slate-100",
  text: "text-slate-500",
  dot: "bg-slate-400",
};

export const getStatusConfig = (status: string) =>
  ORDER_STATUS_CONFIG[status as TOrderStatus] || ORDER_STATUS_FALLBACK;

const RU_MONTHS_GEN = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export const parseDate = (dateStr: string) => {
  const dotParts = dateStr.split(".");
  if (dotParts.length === 3) {
    const day = dotParts[0];
    const monthIdx = parseInt(dotParts[1], 10) - 1;
    const year = dotParts[2];
    return { day, month: RU_MONTHS_GEN[monthIdx] ?? dotParts[1], year };
  }

  const isoParts = dateStr.split("-");
  if (isoParts.length === 3) {
    const year = isoParts[0];
    const monthIdx = parseInt(isoParts[1], 10) - 1;
    const day = isoParts[2];
    return { day, month: RU_MONTHS_GEN[monthIdx] ?? isoParts[1], year };
  }

  return { day: "___", month: "______", year: "____" };
};

export const getExecutorInitials = (executorName: string) => {
  if (!executorName) return "";
  return executorName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const useOrdersLogic = () => {
  const { data, isLoading } = useGetQuery({
    url: ApiRoutes.GET_HR_ORDERS,
    useToken: true,
  });

  const orders = useMemo<IOrderRecord[]>(() => {
    const raw = (data?.data?.data || data?.data || data || []) as IHrOrder[];
    return normalizeOrders(raw);
  }, [data]);

  const createM = useMutationQuery({
    url: ApiRoutes.CREATE_HR_ORDER,
    method: "POST",
    messages: {
      success: "Приказ создан",
      invalidate: [ApiRoutes.GET_HR_ORDERS],
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TOrderStatus | "Все">("Все");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [executorQuery, setExecutorQuery] = useState("");
  const [ministerFilter, setMinisterFilter] = useState<TMinisterFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    !!dateFrom ||
    !!dateTo ||
    !!executorQuery ||
    ministerFilter !== "all";

  const statCards = useMemo(() => [
    { label: "Всего", value: orders.length, color: "#1E3A5F" },
    { label: "Утверждено", value: orders.filter((o) => o.status === "approved").length, color: "#3b82f6" },
    { label: "Подписано", value: orders.filter((o) => o.status === "signed").length, color: "#10b981" },
    { label: "На подписании", value: orders.filter((o) => o.status === "pending").length, color: "#f59e0b" },
    { label: "Черновик", value: orders.filter((o) => o.status === "draft").length, color: "#94a3b8" },
  ], [orders]);

  const toISO = (d?: string) => {
    if (!d) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
    const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return "";
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        o.type.toLowerCase().includes(q) ||
        o.number.toLowerCase().includes(q) ||
        o.executorName.toLowerCase().includes(q);

      const matchStatus = statusFilter === "Все" || o.status === statusFilter;
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(o.type);

      const iso = toISO(o.date);
      const matchFrom = !dateFrom || (!!iso && iso >= dateFrom);
      const matchTo = !dateTo || (!!iso && iso <= dateTo);

      const matchExecutor =
        !executorQuery ||
        o.executorName.toLowerCase().includes(executorQuery.toLowerCase());

      const matchMinister =
        ministerFilter === "all" ||
        (ministerFilter === "signed" ? o.ministerSigned : !o.ministerSigned);

      return (
        matchSearch &&
        matchStatus &&
        matchType &&
        matchFrom &&
        matchTo &&
        matchExecutor &&
        matchMinister
      );
    });
  }, [
    orders,
    searchQuery,
    statusFilter,
    selectedTypes,
    dateFrom,
    dateTo,
    executorQuery,
    ministerFilter,
  ]);

  const handleResetFilters = () => {
    setSelectedTypes([]);
    setDateFrom("");
    setDateTo("");
    setExecutorQuery("");
    setMinisterFilter("all");
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return {
    orders,
    isLoading,
    createM,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedTypes,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    executorQuery,
    setExecutorQuery,
    ministerFilter,
    setMinisterFilter,
    filtersOpen,
    setFiltersOpen,
    hasActiveFilters,
    statCards,
    filteredOrders,
    handleResetFilters,
    handleTypeToggle,
  };
};
