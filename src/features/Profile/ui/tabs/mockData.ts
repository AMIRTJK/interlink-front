export interface IFileItem {
  id: string;
  name: string;
  size: string;
  sizeBytes: number; // для правильной сортировки
  date: string;
  timestamp: number; // для правильной сортировки
  type: "archive" | "document" | "image" | "spreadsheet" | "pdf";
  pinned: boolean;
  categories: string[];
  previewUrl?: string;
}

export interface ICategoryItem {
  name: string;
  icon: string; // Эмодзи-иконка
  allowedUsers?: string[]; // ID выбранных пользователей
}

export interface IMockUser {
  id: string;
  name: string;
  role: string;
  avatarColor: string; // Tailwind класс
  initials: string;
}

export const INITIAL_CATEGORIES: ICategoryItem[] = [
  { name: "Все файлы", icon: "📁" },
  { name: "Рабочие", icon: "💼" },
  { name: "Документы", icon: "📄" },
];

export const MOCK_USERS: IMockUser[] = [
  { id: "u1", name: "Алишер Махмудов", role: "Разработчик", avatarColor: "bg-blue-500!", initials: "AM" },
  { id: "u2", name: "Зарина Ибрагимова", role: "Дизайнер", avatarColor: "bg-rose-500!", initials: "ЗИ" },
  { id: "u3", name: "Рустам Назаров", role: "DevOps инженер", avatarColor: "bg-emerald-500!", initials: "РН" },
  { id: "u4", name: "Нилуфар Рахимова", role: "Аналитик", avatarColor: "bg-orange-500!", initials: "НР" },
  { id: "u5", name: "Даврон Хасанов", role: "Backend разработчик", avatarColor: "bg-indigo-500!", initials: "ДХ" },
  { id: "u6", name: "Мадина Юсупова", role: "QA инженер", avatarColor: "bg-teal-500!", initials: "МЮ" },
];

export const INITIAL_FILES: IFileItem[] = [
  {
    id: "1",
    name: "Бэкап_сервера.tar.gz",
    size: "890 MB",
    sizeBytes: 890 * 1024 * 1024,
    date: "10 мая 2025",
    timestamp: new Date("2025-05-10").getTime(),
    type: "archive",
    pinned: false,
    categories: ["Все файлы", "Рабочие"],
  },
  {
    id: "2",
    name: "Инструкция_deploy.md",
    size: "34 KB",
    sizeBytes: 34 * 1024,
    date: "2 мая 2025",
    timestamp: new Date("2025-05-02").getTime(),
    type: "document",
    pinned: false,
    categories: ["Все файлы", "Рабочие", "Документы"],
  },
  {
    id: "3",
    name: "Фото_команды.jpg",
    size: "4.1 MB",
    sizeBytes: 4.1 * 1024 * 1024,
    date: "20 апр 2025",
    timestamp: new Date("2025-04-20").getTime(),
    type: "image",
    pinned: false,
    categories: ["Все файлы"],
    previewUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    name: "План_спринта.xlsx",
    size: "560 KB",
    sizeBytes: 560 * 1024,
    date: "14 апр 2025",
    timestamp: new Date("2025-04-14").getTime(),
    type: "spreadsheet",
    pinned: false,
    categories: ["Все файлы", "Рабочие"],
  },
  {
    id: "5",
    name: "Логи_бренда.zip",
    size: "12.4 MB",
    sizeBytes: 12.4 * 1024 * 1024,
    date: "5 апр 2025",
    timestamp: new Date("2025-04-05").getTime(),
    type: "archive",
    pinned: false,
    categories: ["Все файлы", "Рабочие"],
  },
  {
    id: "6",
    name: "Архитектура_v3.pdf",
    size: "1.8 MB",
    sizeBytes: 1.8 * 1024 * 1024,
    date: "22 мар 2025",
    timestamp: new Date("2025-03-22").getTime(),
    type: "pdf",
    pinned: false,
    categories: ["Все файлы", "Документы"],
  },
  {
    id: "7",
    name: "Скриншот_дашборда.png",
    size: "920 KB",
    sizeBytes: 920 * 1024,
    date: "15 мар 2025",
    timestamp: new Date("2025-03-15").getTime(),
    type: "image",
    pinned: false,
    categories: ["Все файлы"],
    previewUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "8",
    name: "Презентация_API.pptx",
    size: "3.2 MB",
    sizeBytes: 3.2 * 1024 * 1024,
    date: "10 мар 2025",
    timestamp: new Date("2025-03-10").getTime(),
    type: "document",
    pinned: false,
    categories: ["Все файлы", "Рабочие", "Документы"],
  },
  {
    id: "9",
    name: "Дизайн_системы.zip",
    size: "5.7 MB",
    sizeBytes: 5.7 * 1024 * 1024,
    date: "1 мар 2025",
    timestamp: new Date("2025-03-01").getTime(),
    type: "archive",
    pinned: false,
    categories: ["Все файлы", "Рабочие"],
  },
  {
    id: "10",
    name: "База_данных_v2.xlsx",
    size: "1.1 MB",
    sizeBytes: 1.1 * 1024 * 1024,
    date: "17 фев 2025",
    timestamp: new Date("2025-02-17").getTime(),
    type: "spreadsheet",
    pinned: true,
    categories: ["Все файлы", "Рабочие"],
  },
  {
    id: "11",
    name: "Техническое_задание.docx",
    size: "840 KB",
    sizeBytes: 840 * 1024,
    date: "3 фев 2025",
    timestamp: new Date("2025-02-03").getTime(),
    type: "document",
    pinned: false,
    categories: ["Все файлы", "Документы"],
  },
  {
    id: "12",
    name: "Отчёт_2025_Q1.pdf",
    size: "2.4 MB",
    sizeBytes: 2.4 * 1024 * 1024,
    date: "12 янв 2025",
    timestamp: new Date("2025-01-12").getTime(),
    type: "pdf",
    pinned: true,
    categories: ["Все файлы", "Документы"],
  },
];
