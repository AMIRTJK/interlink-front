import { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Task } from "@features/tasks";
import { EVENT_COLOR_STYLES, SIDEBAR_UPCOMING_MOCK } from "../model";

interface ICalendarSidebarProps {
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  tasks: Task[];
  onCreateEvent: () => void;
  onEventClick: (task: Task) => void;
}

const WEEKDAY_INITIALS = [
  { label: "M", isWeekend: false },
  { label: "T", isWeekend: false },
  { label: "W", isWeekend: false },
  { label: "T", isWeekend: false },
  { label: "F", isWeekend: false },
  { label: "S", isWeekend: true },
  { label: "S", isWeekend: true },
];

export const CalendarSidebar = memo(({
  currentDate,
  onDateChange,
  onCreateEvent,
}: ICalendarSidebarProps) => {
  const startOfMonth = currentDate.startOf("month");
  const gridStart = startOfMonth.startOf("isoWeek");

  const miniDays = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => gridStart.add(i, "day"));
  }, [gridStart]);

  return (
    <aside className="w-full! lg:w-[230px]! flex-shrink-0! flex! flex-col! gap-4! p-0.5!">
      {/* Create Event Button */}
      <button
        type="button"
        onClick={onCreateEvent}
        className="w-full! py-2.5! px-4! rounded-full! bg-[#0d9488]! hover:bg-[#0f766e]! text-white! font-extrabold! text-xs! tracking-wide! flex! items-center! justify-center! gap-2! shadow-md! shadow-teal-500/20! transition-all! cursor-pointer! border-0!"
      >
        <Plus size={15} strokeWidth={3} />
        <span>Create Event</span>
      </button>

      {/* Mini Month Picker Widget */}
      <div className="bg-white/80! dark:bg-slate-900/80! backdrop-blur-xl! rounded-2xl! p-3! border! border-white/60! dark:border-slate-800/60! shadow-[0_6px_20px_rgba(0,0,0,0.03)]!">
        {/* Month Navigation Header */}
        <div className="flex! items-center! justify-between! mb-2! px-0.5!">
          <button
            type="button"
            onClick={() => onDateChange(currentDate.subtract(1, "month"))}
            className="w-5! h-5! flex! items-center! justify-center! rounded-full! hover:bg-slate-100! dark:hover:bg-slate-800! text-slate-400! dark:text-slate-500! transition-colors! border-0! cursor-pointer!"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="font-extrabold! text-[11px]! text-slate-800! dark:text-slate-100!">
            {currentDate.format("MMMM YYYY")}
          </span>
          <button
            type="button"
            onClick={() => onDateChange(currentDate.add(1, "month"))}
            className="w-5! h-5! flex! items-center! justify-center! rounded-full! hover:bg-slate-100! dark:hover:bg-slate-800! text-slate-400! dark:text-slate-500! transition-colors! border-0! cursor-pointer!"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid! grid-cols-7! text-center! mb-1.5!">
          {WEEKDAY_INITIALS.map((item, idx) => (
            <span
              key={idx}
              className={`text-[9px]! font-extrabold! ${
                item.isWeekend ? "text-[#f97316]!" : "text-slate-400! dark:text-slate-500!"
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid! grid-cols-7! gap-y-0.5! text-center!">
          {miniDays.map((day) => {
            const isCurrentMonth = day.month() === currentDate.month();
            const isSelected = day.isSame(currentDate, "day");

            return (
              <button
                key={day.format("YYYY-MM-DD")}
                type="button"
                onClick={() => onDateChange(day)}
                className={`w-5! h-5! mx-auto! flex! items-center! justify-center! rounded-full! text-[10px]! font-bold! transition-all! cursor-pointer! border-0! ${
                  isSelected
                    ? "bg-[#0d9488]! text-white! font-extrabold! shadow-xs!"
                    : isCurrentMonth
                    ? "text-slate-700! dark:text-slate-200! hover:bg-slate-100! dark:hover:bg-slate-800!"
                    : "text-slate-300! dark:text-slate-600!"
                }`}
              >
                {day.date()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="flex! flex-col! gap-2.5!">
        <h4 className="text-[9px]! font-extrabold! tracking-widest! text-slate-400! uppercase! px-0.5! m-0!">
          UPCOMING EVENTS
        </h4>

        {SIDEBAR_UPCOMING_MOCK.map((group) => (
          <div key={group.dateLabel} className="flex! flex-col! gap-1.5!">
            <span className="text-[8px]! font-extrabold! tracking-wider! text-slate-400! uppercase! px-0.5!">
              {group.dateLabel}
            </span>

            {group.items.map((item) => {
              const colorStyle = EVENT_COLOR_STYLES[item.color] || EVENT_COLOR_STYLES.purple;
              return (
                <div
                  key={item.id}
                  className={`p-2.5! rounded-xl! ${colorStyle.sidebarCard} border! backdrop-blur-md! shadow-[0_4px_15px_rgba(0,0,0,0.02)]! hover:shadow-md! transition-all! cursor-pointer! flex! flex-col! gap-0.5!`}
                >
                  <div className="flex! items-center! gap-1.5!">
                    <span className={`w-1.5! h-1.5! rounded-full! ${colorStyle.dot} flex-shrink-0!`} />
                    <span className="font-extrabold! text-[11px]! truncate!">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[9px]! font-semibold! opacity-80! pl-3!">
                    {item.timeLocation}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
});
