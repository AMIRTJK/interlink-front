import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Loader, EmptyState } from "@shared/ui";
import { usePersonalAnalytics } from "./analytics/usePersonalAnalytics";
import type { ICategoricalDatum } from "./analytics/lib";

/*
 * Вкладка «Аналитика» личного кабинета.
 * Данные приходят с GET /api/v1/personal-analytics (только личные задачи и
 * встречи текущего авторизованного пользователя) через usePersonalAnalytics.
 */

type ChartType = "bar" | "line" | "area" | "pie";

// Элемент, который recharts прокидывает третьим аргументом в formatter Tooltip.
type ProgressTooltipItem = { payload?: { fullTitle?: string } };

const tooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  fontSize: "12px",
} as const;

const axisTick = { fontSize: 11, fill: "#9ca3af" } as const;

const ChartSwitcher = ({
  current,
  onChange,
}: {
  current: ChartType;
  onChange: (v: ChartType) => void;
}) => {
  const btn = (type: ChartType, icon: React.ReactNode, title: string) => (
    <button
      onClick={() => onChange(type)}
      title={title}
      className={
        current === type
          ? "rounded-lg bg-white dark:bg-zinc-700 shadow-sm p-1.5 text-indigo-600 dark:text-indigo-400"
          : "p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
      }
    >
      {icon}
    </button>
  );
  return (
    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 flex gap-0.5">
      {btn("bar", <BarChart2 size={14} />, "Столбцы")}
      {btn("line", <LineChartIcon size={14} />, "Линия")}
      {btn("area", <TrendingUp size={14} />, "Область")}
      {btn("pie", <PieChartIcon size={14} />, "Круговая")}
    </div>
  );
};

export const AnalyticsTab = () => {
  const [statusChartType, setStatusChartType] = useState<ChartType>("bar");
  const [priorityChartType, setPriorityChartType] = useState<ChartType>("bar");
  const [progressChartType, setProgressChartType] = useState<ChartType>("area");
  const [calEventsChartType, setCalEventsChartType] = useState<ChartType>("area");

  const {
    summary,
    statusData,
    priorityData,
    progressData,
    calEventsData,
    isLoading,
    isError,
    refetch,
  } = usePersonalAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[440px]">
        <Loader />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex justify-center items-center min-h-[440px]">
        <EmptyState
          title="Не удалось загрузить аналитику"
          description="Проверьте подключение и попробуйте обновить данные."
          actionText="Повторить"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Выполнено",
      value: `${summary.completion_pct ?? 0}%`,
      sub: `${summary.completed_tasks ?? 0} из ${summary.total_tasks ?? 0}`,
      color: "emerald",
    },
    {
      label: "Средний прогресс",
      value: `${summary.avg_progress ?? 0}%`,
      sub: "по всем задачам",
      color: "indigo",
    },
    {
      label: "Просрочено",
      value: String(summary.overdue_tasks ?? 0),
      sub: "задач",
      color: "red",
    },
    {
      label: "В работе",
      value: String(summary.in_progress_tasks ?? 0),
      sub: "активных",
      color: "blue",
    },
  ];
  const kpiColorMap: Record<string, string> = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    indigo: "text-indigo-700 dark:text-indigo-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-700 dark:text-blue-400",
  };
  const kpiBgMap: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
    blue: "bg-blue-50 dark:bg-blue-900/20",
  };

  const renderCategoricalChart = (
    type: ChartType,
    data: ICategoricalDatum[],
    stroke: string,
    gradId: string,
  ): React.ReactElement => {
    if (type === "line")
      return (
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
          <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
          <Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " задач", "Кол-во"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
        </LineChart>
      );
    if (type === "area")
      return (
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
          <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
          <Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " задач", "Кол-во"]} contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} fillOpacity={1} fill={`url(#${gradId})`} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
        </AreaChart>
      );
    if (type === "pie")
      return (
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={`pie-${gradId}-${i}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number | undefined, name: string | undefined) => [(v ?? 0) + " задач", name]} contentStyle={tooltipStyle} />
        </PieChart>
      );
    return (
      <BarChart data={data} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
        <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
        <Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " задач", "Кол-во"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={`bar-${gradId}-${i}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  const renderProgressChart = (): React.ReactElement => {
    if (progressChartType === "line")
      return (
        <LineChart data={progressData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
          <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
        </LineChart>
      );
    if (progressChartType === "bar")
      return (
        <BarChart data={progressData} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
          <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    if (progressChartType === "pie") {
      const pieColors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5", "#7c3aed", "#6d28d9", "#4338ca", "#3730a3"];
      return (
        <PieChart>
          <Pie data={progressData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="progress">
            {progressData.map((_e, i) => (
              <Cell key={`pg-pie-${i}`} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
        </PieChart>
      );
    }
    return (
      <AreaChart data={progressData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="mainProgressGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
        <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#mainProgressGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: "#6366f1" }} />
      </AreaChart>
    );
  };

  const renderCalEventsChart = (): React.ReactElement => {
    const stroke = "#38bdf8";
    if (calEventsChartType === "line")
      return (
        <LineChart data={calEventsData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
          <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
          <Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " событий", "Кол-во"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="count" stroke={stroke} strokeWidth={2} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
        </LineChart>
      );
    if (calEventsChartType === "bar")
      return (
        <BarChart data={calEventsData} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
          <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
          <Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " событий", "Кол-во"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="count" fill={stroke} radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    if (calEventsChartType === "pie") {
      const pieColors = ["#38bdf8", "#0ea5e9", "#7dd3fc", "#0369a1", "#bae6fd", "#0284c7"];
      return (
        <PieChart>
          <Pie data={calEventsData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="count" nameKey="month">
            {calEventsData.map((_e, i) => (
              <Cell key={`cal-pie-${i}`} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number | undefined, name: string | undefined) => [(v ?? 0) + " событий", name]} contentStyle={tooltipStyle} />
        </PieChart>
      );
    }
    return (
      <AreaChart data={calEventsData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="calEventsAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
        <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
        <Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " событий", "Кол-во"]} contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="count" stroke={stroke} strokeWidth={2} fillOpacity={1} fill="url(#calEventsAreaGrad)" dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: stroke }} />
      </AreaChart>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 pb-6"
    >
      {/* KPI карточки */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.07 }}
            className="rounded-2xl p-4 bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className={`text-xs font-semibold mb-1 ${kpiColorMap[card.color]}`}>{card.label}</div>
            <div className={`text-3xl font-black leading-none ${kpiColorMap[card.color]}`}>{card.value}</div>
            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${kpiBgMap[card.color]} ${kpiColorMap[card.color]}`}>{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Ряд 1: Статус + Приоритет */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Статус задач</h3>
            <ChartSwitcher current={statusChartType} onChange={setStatusChartType} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={statusChartType} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
              <ResponsiveContainer width="100%" height={220}>
                {renderCategoricalChart(statusChartType, statusData, "#6366f1", "mainStatusGrad")}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{d.name}</span>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Приоритет задач</h3>
            <ChartSwitcher current={priorityChartType} onChange={setPriorityChartType} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={priorityChartType} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
              <ResponsiveContainer width="100%" height={220}>
                {renderCategoricalChart(priorityChartType, priorityData, "#f97316", "mainPriorityGrad")}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-2 mt-2">
            {priorityData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{d.name}</span>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Ряд 2: Прогресс выполнения */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
        className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Прогресс выполнения</h3>
          <ChartSwitcher current={progressChartType} onChange={setProgressChartType} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={progressChartType} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
            <ResponsiveContainer width="100%" height={220}>
              {renderProgressChart()}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Ряд 3: События календаря */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.32 }}
        className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">События календаря</h3>
          <ChartSwitcher current={calEventsChartType} onChange={setCalEventsChartType} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={calEventsChartType} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
            <ResponsiveContainer width="100%" height={220}>
              {renderCalEventsChart()}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
