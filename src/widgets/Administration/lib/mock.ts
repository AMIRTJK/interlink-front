// ⚠️ MOCK-данные для частей интерфейса, под которые пока нет API.
// Передать backend-разработчикам (см. план, раздел «API gap-анализ»):
//  1. Активные сессии пользователя         → mockSessions
//  2. История/аудит действий пользователя   → mockHistory
//  3. Последняя активность (last_activity)  → mockLastActivity
//  4. Статистика профиля (документы/поручения/сессии) → mockProfileStats
// Как только эндпоинты появятся — заменить вызовы этих функций на реальные данные.
import type { SessionInfo, HistoryItem } from "../model";

const ACTIVITY_POOL = [
  "2 мин. назад",
  "15 мин. назад",
  "1 час назад",
  "3 часа назад",
  "Вчера 17:42",
  "30 мин. назад",
  "2 часа назад",
  "45 мин. назад",
];

export function mockLastActivity(id: number): string {
  return ACTIVITY_POOL[id % ACTIVITY_POOL.length];
}

export function mockSessions(): SessionInfo[] {
  return [
    {
      device: "Chrome 122",
      os: "Windows 11",
      ip: "192.168.1.42",
      lastSeen: "2 мин. назад",
      icon: "monitor",
    },
    {
      device: "Safari 17",
      os: "iPhone 15 Pro",
      ip: "10.0.0.88",
      lastSeen: "1 час назад",
      icon: "phone",
    },
    {
      device: "Firefox 124",
      os: "macOS Sonoma",
      ip: "172.16.0.5",
      lastSeen: "Вчера 09:15",
      icon: "monitor",
    },
  ];
}

export function mockHistory(): HistoryItem[] {
  return [
    {
      action: "Зарегистрирован входящий документ №2024-0891",
      time: "Сегодня 10:32",
      type: "create",
    },
    {
      action: "Согласован исходящий документ №2024-0876",
      time: "Сегодня 09:14",
      type: "approve",
    },
    {
      action: "Исполнено поручение руководства",
      time: "Вчера 16:50",
      type: "complete",
    },
    {
      action: "Создан новый исходящий документ №2024-0841",
      time: "Вчера 11:28",
      type: "create",
    },
    {
      action: "Просмотрен архив за Q3 2024",
      time: "3 дня назад 14:11",
      type: "view",
    },
    {
      action: "Изменены права доступа пользователя",
      time: "5 дней назад 09:00",
      type: "settings",
    },
    {
      action: "Добавлена новая запись в журнал",
      time: "Неделю назад 15:30",
      type: "create",
    },
  ];
}

export function mockProfileStats(): { label: string; value: string }[] {
  return [
    { label: "Документов", value: "142" },
    { label: "Поручений", value: "38" },
    { label: "Сессий", value: "3" },
  ];
}
