import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";

export type ViewMode = "day" | "week" | "month";
export type WeatherType = "sun" | "cloud" | "snow" | "sun-cloud" | "rain";

export interface IEventColorStyle {
  bg: string;
  border: string;
  text: string;
  dot: string;
  sidebarCard: string;
}

export const EVENT_COLOR_STYLES: Record<string, IEventColorStyle> = {
  emerald: {
    bg: "bg-[#ecfdf5] dark:bg-emerald-950/60",
    border: "border-2 border-[#10b981] dark:border-emerald-600",
    text: "text-[#059669] dark:text-emerald-300",
    dot: "bg-[#059669]",
    sidebarCard: "bg-[#ecfdf5]/90 dark:bg-emerald-950/40 border-[#a7f3d0] text-[#059669]",
  },
  purple: {
    bg: "bg-[#f3e8ff] dark:bg-purple-950/60",
    border: "border-2 border-[#a855f7] dark:border-purple-600",
    text: "text-[#9333ea] dark:text-purple-300",
    dot: "bg-[#9333ea]",
    sidebarCard: "bg-[#f3e8ff]/90 dark:bg-purple-950/40 border-[#e9d5ff] text-[#9333ea]",
  },
  pink: {
    bg: "bg-[#fce7f3] dark:bg-pink-950/60",
    border: "border-2 border-[#ec4899] dark:border-pink-600",
    text: "text-[#db2777] dark:text-pink-300",
    dot: "bg-[#ec4899]",
    sidebarCard: "bg-[#fce7f3]/90 dark:bg-pink-950/40 border-[#fbcfe8] text-[#db2777]",
  },
  rose: {
    bg: "bg-[#ffe4e6] dark:bg-rose-950/60",
    border: "border-2 border-[#f43f5e] dark:border-rose-600",
    text: "text-[#e11d48] dark:text-rose-300",
    dot: "bg-[#f43f5e]",
    sidebarCard: "bg-[#ffe4e6]/90 dark:bg-rose-950/40 border-[#fecdd3] text-[#e11d48]",
  },
  blue: {
    bg: "bg-[#eff6ff] dark:bg-blue-950/60",
    border: "border-2 border-[#3b82f6] dark:border-blue-600",
    text: "text-[#2563eb] dark:text-blue-300",
    dot: "bg-[#3b82f6]",
    sidebarCard: "bg-[#eff6ff]/90 dark:bg-blue-950/40 border-[#bfdbfe] text-[#2563eb]",
  },
  cyan: {
    bg: "bg-[#ecfeff] dark:bg-cyan-950/60",
    border: "border-2 border-[#06b6d4] dark:border-cyan-600",
    text: "text-[#0891b2] dark:text-cyan-300",
    dot: "bg-[#06b6d4]",
    sidebarCard: "bg-[#ecfeff]/90 dark:bg-cyan-950/40 border-[#a5f3fc] text-[#0891b2]",
  },
  amber: {
    bg: "bg-[#fffbeb] dark:bg-amber-950/60",
    border: "border-2 border-[#f59e0b] dark:border-amber-600",
    text: "text-[#b45309] dark:text-amber-300",
    dot: "bg-[#f59e0b]",
    sidebarCard: "bg-[#fffbeb]/90 dark:bg-amber-950/40 border-[#fde68a] text-[#b45309]",
  },
};

export const getEventStyle = (color?: string): IEventColorStyle => {
  if (!color) return EVENT_COLOR_STYLES.emerald;
  const lower = color.toLowerCase();
  if (lower.includes("purple") || lower.includes("8833ff") || lower.includes("af52de")) {
    return EVENT_COLOR_STYLES.purple;
  }
  if (lower.includes("pink") || lower.includes("e62e7b")) {
    return EVENT_COLOR_STYLES.pink;
  }
  if (lower.includes("rose") || lower.includes("red") || lower.includes("f43f5e")) {
    return EVENT_COLOR_STYLES.rose;
  }
  if (lower.includes("cyan") || lower.includes("teal") || lower.includes("06b6d4")) {
    return EVENT_COLOR_STYLES.cyan;
  }
  if (lower.includes("blue") || lower.includes("sky") || lower.includes("33bfff") || lower.includes("3b82f6")) {
    return EVENT_COLOR_STYLES.blue;
  }
  if (lower.includes("amber") || lower.includes("yellow") || lower.includes("ffcb33") || lower.includes("orange")) {
    return EVENT_COLOR_STYLES.amber;
  }
  return EVENT_COLOR_STYLES.emerald;
};

export const getDayWeather = (day: Dayjs): WeatherType => {
  const d = day.date();
  if (d === 1) return "sun";
  if (d === 2 || d === 17) return "sun-cloud";
  if (d === 3 || d === 10 || d === 11) return "snow";
  if ([4, 5, 6, 13, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30].includes(d)) return "rain";
  return "cloud";
};

export const getSampleEventsForDate = (dateStr: string): Task[] => {
  const d = dayjs(dateStr).date();

  if (d === 1) {
    return [
      {
        id: `demo-1-1`,
        title: "10am Yoga Pract...",
        date: dateStr,
        time: "10:00",
        endTime: "11:00",
        category: "personal",
        color: "amber",
        description: "Studio A",
      },
    ];
  }

  if (d === 3) {
    return [
      {
        id: `demo-3-1`,
        title: "9am Kickoff Sync",
        date: dateStr,
        time: "09:00",
        endTime: "10:00",
        category: "work",
        color: "blue",
        description: "Room 101",
      },
    ];
  }

  if (d === 5) {
    return [
      {
        id: `demo-5-1`,
        title: "2pm Product Re...",
        date: dateStr,
        time: "14:00",
        endTime: "15:00",
        category: "work",
        color: "purple",
        description: "Miro Board",
      },
    ];
  }

  if (d === 11) {
    return [
      {
        id: `demo-11-1`,
        title: "11am Design Alig...",
        date: dateStr,
        time: "11:00",
        endTime: "12:00",
        category: "work",
        color: "purple",
        description: "Zoom Meeting",
      },
    ];
  }

  if (d === 13) {
    return [
      {
        id: `demo-13-1`,
        title: "4pm All-Hands",
        date: dateStr,
        time: "16:00",
        endTime: "17:00",
        category: "work",
        color: "blue",
        description: "Main Hall",
      },
    ];
  }

  if (d === 17) {
    return [
      {
        id: `demo-17-1`,
        title: "9:30am Team Sy...",
        date: dateStr,
        time: "09:30",
        endTime: "10:30",
        category: "work",
        color: "blue",
        description: "Product Space",
      },
      {
        id: `demo-17-2`,
        title: "2:30pm 1:1 w/ Sa...",
        date: dateStr,
        time: "14:30",
        endTime: "15:30",
        category: "work",
        color: "amber",
        description: "Coffee Bar",
      },
    ];
  }

  if (d === 18) {
    return [
      {
        id: `demo-18-1`,
        title: "Design Alignment",
        date: dateStr,
        time: "11:00",
        endTime: "12:00",
        category: "work",
        color: "blue",
        description: "Zoom Meeting",
      },
    ];
  }

  if (d === 19) {
    return [
      {
        id: `demo-19-1`,
        title: "11am Design Rev...",
        date: dateStr,
        time: "11:00",
        endTime: "12:00",
        category: "work",
        color: "purple",
        description: "Figma Board",
      },
    ];
  }

  if (d === 21) {
    return [
      {
        id: `demo-21-1`,
        title: "1pm Marketing S...",
        date: dateStr,
        time: "13:00",
        endTime: "14:00",
        category: "work",
        color: "emerald",
        description: "1pm–2pm",
      },
    ];
  }

  if (d === 25) {
    return [
      {
        id: `demo-25-1`,
        title: "3pm Client Demo",
        date: dateStr,
        time: "15:00",
        endTime: "16:00",
        category: "work",
        color: "emerald",
        description: "Client Office",
      },
    ];
  }

  return [];
};

export interface ISidebarUpcomingGroup {
  dateLabel: string;
  items: {
    id: string;
    title: string;
    timeLocation: string;
    color: string;
  }[];
}

export const SIDEBAR_UPCOMING_MOCK: ISidebarUpcomingGroup[] = [
  {
    dateLabel: "MONDAY, AUGUST 17",
    items: [
      {
        id: "side-1",
        title: "Team Sync",
        timeLocation: "8:30 AM • Stand-up Room",
        color: "emerald",
      },
      {
        id: "side-2",
        title: "1:1 w/ Sarah",
        timeLocation: "3:30 PM • Coffee Bar",
        color: "rose",
      },
    ],
  },
  {
    dateLabel: "TUESDAY, AUGUST 18",
    items: [
      {
        id: "side-3",
        title: "Design Alignment",
        timeLocation: "11:00 AM • Zoom Meeting",
        color: "blue",
      },
    ],
  },
  {
    dateLabel: "WEDNESDAY, AUGUST 19",
    items: [
      {
        id: "side-4",
        title: "Design Review",
        timeLocation: "11:00 AM • Figma Board",
        color: "purple",
      },
      {
        id: "side-5",
        title: "Product Review",
        timeLocation: "2:00 PM • Miro Board",
        color: "cyan",
      },
    ],
  },
];
