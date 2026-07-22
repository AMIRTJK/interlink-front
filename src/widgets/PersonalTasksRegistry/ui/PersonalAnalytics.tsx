import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, CheckCircle2, TrendingUp } from "lucide-react";
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
import { If, Tooltip as SharedTooltip } from "@shared/ui";
import type { IPersonalTask } from "../model/types";

interface IProps {
  tasks: IPersonalTask[];
  activeTheme: any;
}

type ChartType = "bar" | "line" | "area" | "pie";

const tooltipStyle = { borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" } as const;
const axisTick = { fontSize: 11, fill: "#9ca3af" } as const;

const ChartSwitcher = memo(({ current, onChange }: { current: ChartType; onChange: (v: ChartType) => void }) => {
  const btn = (type: ChartType, svgPath: React.ReactNode, title: string) => (
    <SharedTooltip title={title} key={type}>
      <button
        type="button"
        onClick={() => onChange(type)}
        className={`rounded-lg! p-1.5! transition-all! duration-200! border-0! cursor-pointer! flex! items-center! justify-center! ${
          current === type
            ? "bg-white! dark:bg-zinc-700! shadow-sm! text-indigo-600! dark:text-indigo-400!"
            : "bg-transparent! text-zinc-400! hover:text-zinc-600! dark:hover:text-zinc-200!"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {svgPath}
        </svg>
      </button>
    </SharedTooltip>
  );

  return (
    <div className="rounded-xl! bg-zinc-100! dark:bg-zinc-800! p-0.5! flex! gap-0.5!">
      {btn("bar", <><line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line></>, "Столбцы")}
      {btn("line", <><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="m19 9-5 5-4-4-3 3"></path></>, "Линия")}
      {btn("area", <><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></>, "Область")}
      {btn("pie", <><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path></>, "Круговая")}
    </div>
  );
});

export const PersonalAnalytics = memo(({ tasks, activeTheme }: IProps) => {
  const [statusChart, setStatusChart] = React.useState<ChartType>("bar");
  const [priorityChart, setPriorityChart] = React.useState<ChartType>("bar");
  const [progressChart, setProgressChart] = React.useState<ChartType>("area");

  const statusData = React.useMemo(() => {
    const counts = { new: 0, in_progress: 0, review: 0, completed: 0, overdue: 0 };
    tasks.forEach((t) => { if (t.status in counts) counts[t.status]++; });
    return [
      { name: "Новая", value: counts.new, fill: "#94a3b8" },
      { name: "В работе", value: counts.in_progress, fill: "#3b82f6" },
      { name: "На ревью", value: counts.review, fill: "#8b5cf6" },
      { name: "Завершена", value: counts.completed, fill: "#10b981" },
      { name: "Просрочена", value: counts.overdue, fill: "#ef4444" },
    ];
  }, [tasks]);

  const priorityData = React.useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    tasks.forEach((t) => { if (t.priority in counts) counts[t.priority]++; });
    return [
      { name: "Низкий", value: counts.low, fill: "#10b981" },
      { name: "Средний", value: counts.medium, fill: "#3b82f6" },
      { name: "Высокий", value: counts.high, fill: "#f97316" },
      { name: "Критичный", value: counts.critical, fill: "#ef4444" },
    ];
  }, [tasks]);

  const progressData = React.useMemo(() => {
    return tasks.map((t) => ({
      name: t.title.length > 12 ? t.title.slice(0, 12) + "…" : t.title,
      progress: t.progress,
      fullTitle: t.title
    }));
  }, [tasks]);

  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgProgress = total > 0 ? Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / total) : 0;
    const overdue = tasks.filter((t) => t.status === "overdue" || t.is_overdue).length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    return { total, completed, completionPct, avgProgress, overdue, inProgress };
  }, [tasks]);

  const renderChart = (type: ChartType, data: any[], stroke: string, gradId: string, dataKey: string) => {
    if (type === "line")
      return (
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
          <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
          <Tooltip formatter={(v: any) => [`${v} задач(и)`, "Кол-во"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
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
          <Tooltip formatter={(v: any) => [`${v} задач(и)`, "Кол-во"]} contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} fillOpacity={1} fill={`url(#${gradId})`} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
        </AreaChart>
      );
    if (type === "pie")
      return (
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey={dataKey}>
            {data.map((entry, i) => <Cell key={`pie-${gradId}-${i}`} fill={entry.fill || stroke} />)}
          </Pie>
          <Tooltip formatter={(v: any, name: any) => [`${v} задач(и)`, name]} contentStyle={tooltipStyle} />
        </PieChart>
      );
    return (
      <BarChart data={data} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
        <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
        <Tooltip formatter={(v: any) => [`${v} задач(и)`, "Кол-во"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => <Cell key={`bar-${gradId}-${i}`} fill={entry.fill || stroke} />)}
        </Bar>
      </BarChart>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Выполнено</span>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600"><CheckCircle2 size={18} /></span>
          </div>
          <div className="text-3xl font-black leading-none text-emerald-700 dark:text-emerald-400">{stats.completionPct}%</div>
          <div className="text-xs text-zinc-400 mt-1">{stats.completed} из {stats.total}</div>
        </div>

        <div className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Средний прогресс</span>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600"><TrendingUp size={18} /></span>
          </div>
          <div className="text-3xl font-black leading-none text-blue-700 dark:text-blue-400">{stats.avgProgress}%</div>
          <div className="text-xs text-zinc-400 mt-1">по всем задачам</div>
        </div>

        <div className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Просрочено</span>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600"><X size={18} /></span>
          </div>
          <div className="text-3xl font-black leading-none text-red-700 dark:text-red-400">{stats.overdue}</div>
          <div className="text-xs text-zinc-400 mt-1">задач</div>
        </div>

        <div className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">В работе</span>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-600"><Clock size={18} /></span>
          </div>
          <div className="text-3xl font-black leading-none text-indigo-700 dark:text-indigo-400">{stats.inProgress}</div>
          <div className="text-xs text-zinc-400 mt-1">активных</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/30 shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 m-0">Статус задач</h3>
            <ChartSwitcher current={statusChart} onChange={setStatusChart} />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart(statusChart, statusData, "#6366f1", "statusGrad", "value")}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/30 shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 m-0">Приоритет задач</h3>
            <ChartSwitcher current={priorityChart} onChange={setPriorityChart} />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart(priorityChart, priorityData, "#f97316", "priorityGrad", "value")}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 rounded-3xl bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/30 shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 m-0">Прогресс выполнения</h3>
            <ChartSwitcher current={progressChart} onChange={setProgressChart} />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart(progressChart, progressData, "#6366f1", "progressGrad", "progress")}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
