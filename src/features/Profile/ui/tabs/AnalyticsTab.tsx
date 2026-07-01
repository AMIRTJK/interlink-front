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

/*
 * Вкладка «Аналитика» нового дизайна.
 * ВНИМАНИЕ: серверного API для аналитики пока нет — вкладка реализована
 * только на фронтенде на локальных моковых данных (как и требовалось).
 * Когда появится API, MOCK_TASKS / CAL_EVENTS_DATA можно заменить данными с бэка.
 */

type Priority = "low" | "medium" | "high" | "critical";
type TaskStatus = "new" | "in_progress" | "review" | "completed" | "overdue";
type ChartType = "bar" | "line" | "area" | "pie";

interface MockTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  progress: number;
}

const MOCK_TASKS: MockTask[] = [
  { id: "TSK-1042", title: "Разработка API авторизации", status: "in_progress", priority: "critical", progress: 75 },
  { id: "TSK-1041", title: "Миграция базы данных", status: "completed", priority: "high", progress: 100 },
  { id: "TSK-1040", title: "Настройка CI/CD пайплайна", status: "in_progress", priority: "high", progress: 60 },
  { id: "TSK-1039", title: "Код-ревью аутентификации", status: "review", priority: "medium", progress: 90 },
  { id: "TSK-1038", title: "Нагрузочное тестирование", status: "new", priority: "medium", progress: 0 },
  { id: "TSK-1037", title: "Оптимизация запросов к БД", status: "overdue", priority: "high", progress: 30 },
  { id: "TSK-1036", title: "Документация REST API", status: "in_progress", priority: "low", progress: 45 },
  { id: "TSK-1035", title: "Рефакторинг Dashboard", status: "new", priority: "medium", progress: 0 },
  { id: "TSK-1034", title: "Мониторинг Grafana", status: "completed", priority: "high", progress: 100 },
  { id: "TSK-1033", title: "Система уведомлений", status: "in_progress", priority: "medium", progress: 55 },
  { id: "TSK-1032", title: "Пентест инфраструктуры", status: "overdue", priority: "critical", progress: 20 },
  { id: "TSK-1031", title: "Обновление SSL сертификатов", status: "completed", priority: "critical", progress: 100 },
  { id: "TSK-1030", title: "Настройка Redis кэша", status: "in_progress", priority: "high", progress: 40 },
  { id: "TSK-1029", title: "Ревью Terraform", status: "review", priority: "medium", progress: 80 },
  { id: "TSK-1028", title: "Автоматизация бэкапов", status: "new", priority: "high", progress: 0 },
];

const CAL_EVENTS_DATA = [
  { month: "Янв", count: 3 },
  { month: "Фев", count: 5 },
  { month: "Мар", count: 2 },
  { month: "Апр", count: 7 },
  { month: "Май", count: 4 },
  { month: "Июн", count: 6 },
];

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
          ? "rounded-lg bg-white dark:bg-zinc-700 shadow-sm p-1.5 text-indigo-600"
          : "p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
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

  const totalTasks = MOCK_TASKS.length;
  const completedTasks = MOCK_TASKS.filter((t) => t.status === "completed").length;
  const overdueTasks = MOCK_TASKS.filter((t) => t.status === "overdue").length;
  const inProgressTasks = MOCK_TASKS.filter((t) => t.status === "in_progress").length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgProgress =
    totalTasks > 0
      ? Math.round(MOCK_TASKS.reduce((s, t) => s + t.progress, 0) / totalTasks)
      : 0;

  const kpiCards = [
    { label: "Выполнено", value: `${completionPct}%`, sub: `${completedTasks} из ${totalTasks}`, color: "emerald" },
    { label: "Средний прогресс", value: `${avgProgress}%`, sub: "по всем задачам", color: "indigo" },
    { label: "Просрочено", value: String(overdueTasks), sub: "задач", color: "red" },
    { label: "В работе", value: String(inProgressTasks), sub: "активных", color: "blue" },
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

  const statusChartData = [
    { name: "Новая", value: MOCK_TASKS.filter((t) => t.status === "new").length, fill: "#94a3b8" },
    { name: "В работе", value: MOCK_TASKS.filter((t) => t.status === "in_progress").length, fill: "#3b82f6" },
    { name: "На ревью", value: MOCK_TASKS.filter((t) => t.status === "review").length, fill: "#8b5cf6" },
    { name: "Завершена", value: MOCK_TASKS.filter((t) => t.status === "completed").length, fill: "#10b981" },
    { name: "Просрочена", value: MOCK_TASKS.filter((t) => t.status === "overdue").length, fill: "#ef4444" },
  ];
  const priorityChartData = [
    { name: "Низкий", value: MOCK_TASKS.filter((t) => t.priority === "low").length, fill: "#94a3b8" },
    { name: "Средний", value: MOCK_TASKS.filter((t) => t.priority === "medium").length, fill: "#3b82f6" },
    { name: "Высокий", value: MOCK_TASKS.filter((t) => t.priority === "high").length, fill: "#f97316" },
    { name: "Критичный", value: MOCK_TASKS.filter((t) => t.priority === "critical").length, fill: "#ef4444" },
  ];
  const progressChartData = MOCK_TASKS.map((t) => ({
    name: t.title.slice(0, 14),
    progress: t.progress,
    fullTitle: t.title,
  }));

  const renderCategoricalChart = (
    type: ChartType,
    data: { name: string; value: number; fill: string }[],
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
        <LineChart data={progressChartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
          <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: any) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
        </LineChart>
      );
    if (progressChartType === "bar")
      return (
        <BarChart data={progressChartData} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
          <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: any) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    if (progressChartType === "pie") {
      const pieColors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5", "#7c3aed", "#6d28d9", "#4338ca", "#3730a3"];
      return (
        <PieChart>
          <Pie data={progressChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="progress">
            {progressChartData.map((_e, i) => (
              <Cell key={`pg-pie-${i}`} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: any) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
        </PieChart>
      );
    }
    return (
      <AreaChart data={progressChartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="mainProgressGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
        <Tooltip formatter={(v: number | undefined, _n: string | undefined, p: any) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#mainProgressGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: "#6366f1" }} />
      </AreaChart>
    );
  };

  const renderCalEventsChart = (): React.ReactElement => {
    const stroke = "#38bdf8";
    if (calEventsChartType === "line")
      return (
        <LineChart data={CAL_EVENTS_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
          <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
          <Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " событий", "Кол-во"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="count" stroke={stroke} strokeWidth={2} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
        </LineChart>
      );
    if (calEventsChartType === "bar")
      return (
        <BarChart data={CAL_EVENTS_DATA} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
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
          <Pie data={CAL_EVENTS_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="count" nameKey="month">
            {CAL_EVENTS_DATA.map((_e, i) => (
              <Cell key={`cal-pie-${i}`} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number | undefined, name: string | undefined) => [(v ?? 0) + " событий", name]} contentStyle={tooltipStyle} />
        </PieChart>
      );
    }
    return (
      <AreaChart data={CAL_EVENTS_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
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
            className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-200"
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
          className="rounded-3xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/30 shadow-md p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Статус задач</h3>
            <ChartSwitcher current={statusChartType} onChange={setStatusChartType} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={statusChartType} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
              <ResponsiveContainer width="100%" height={220}>
                {renderCategoricalChart(statusChartType, statusChartData, "#6366f1", "mainStatusGrad")}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusChartData.map((d) => (
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
          className="rounded-3xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/30 shadow-md p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Приоритет задач</h3>
            <ChartSwitcher current={priorityChartType} onChange={setPriorityChartType} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={priorityChartType} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}>
              <ResponsiveContainer width="100%" height={220}>
                {renderCategoricalChart(priorityChartType, priorityChartData, "#f97316", "mainPriorityGrad")}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-2 mt-2">
            {priorityChartData.map((d) => (
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
        className="rounded-3xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/30 shadow-md p-5"
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
        className="rounded-3xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/30 shadow-md p-5"
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
