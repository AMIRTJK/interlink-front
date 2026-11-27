import type { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import { Task } from "@features/tasks";

export interface EventLayout {
  type: 'single';
  event: Task;
  top: number;
  height: number;
  left: number;
  width: number;
}

export interface ClusterLayout {
  type: 'cluster';
  events: Task[];
  top: number;
  height: number;
  left: number;
  width: number;
}

export type CalendarItem = EventLayout | ClusterLayout;

const PIXELS_PER_MINUTE = 1.0;

const getMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const calculateDayLayout = (tasks: Task[]): CalendarItem[] => {
  if (tasks.length === 0) return [];

  const preparedEvents = tasks.map(task => {
    const start = getMinutes(task.time);
    const end = start + 60; 
    
    return {
      task,
      start,
      end,
      duration: end - start,
    };
  }).sort((a, b) => a.start - b.start || b.duration - a.duration);

  type PreparedEvent = typeof preparedEvents[0];
  const items: CalendarItem[] = [];
  
  let currentCluster: PreparedEvent[] = [];
  let clusterEnd = -1;

  const processCluster = (cluster: PreparedEvent[]) => {
    if (cluster.length === 0) return;

    if (cluster.length <= 2) {
      cluster?.forEach(event => {
        items.push({
          type: 'single',
          event: event.task,
          top: event?.start * PIXELS_PER_MINUTE,
          height: event?.duration * PIXELS_PER_MINUTE,
          left: 0,
          width: 100
        });
      });
    } else {
      const minStart = Math.min(...cluster.map(e => e.start));
      const maxEnd = Math.max(...cluster.map(e => e.end));
      
      items.push({
        type: 'cluster',
        events: cluster.map(e => e.task),
        top: minStart * PIXELS_PER_MINUTE,
        height: (maxEnd - minStart) * PIXELS_PER_MINUTE,
        left: 0,
        width: 100
      });
    }
  };

  for (const event of preparedEvents) {
    if (currentCluster.length === 0) {
      currentCluster.push(event);
      clusterEnd = event.end;
    } else {
      if (event.start < clusterEnd) {
        currentCluster.push(event);
        clusterEnd = Math.max(clusterEnd, event.end);
      } else {
        processCluster(currentCluster);
        currentCluster = [event];
        clusterEnd = event.end;
      }
    }
  }
  processCluster(currentCluster);

  return items;
};

/** «28.64» → { whole: "28", fraction: ".6" }: крупная целая часть и мелкая дробная, как в погодных виджетах. */
export const splitTemperature = (value: number): { whole: string; fraction: string } => {
  const rounded = Math.round(value * 10) / 10;
  const whole = Math.trunc(rounded);
  const tenth = Math.abs(Math.round((rounded - whole) * 10));
  const sign = rounded < 0 && whole === 0 ? "-" : "";
  return { whole: `${sign}${whole}`, fraction: tenth ? `.${tenth}` : "" };
};

export const formatDegrees = (value: number): string => `${Math.round(value)}°`;

// Open-meteo отдаёт «+14°C»; в капсулах единица лишняя — читается как в погодных виджетах.
export const formatShortTemperature = (temp: string): string => temp.replace(/C$/, "");

/** Короткое название дня недели для капсулы месяца: «Пн», «Вс». */
export const getWeekdayLabel = (day: Dayjs): string => {
  const label = day.locale("ru").format("dd");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const isWeekendDay = (day: Dayjs): boolean => day.day() === 0 || day.day() === 6;
