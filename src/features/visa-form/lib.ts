export interface IAttachment {
  id: number;
  correspondence_id: number;
  uploaded_by: number;
  original_name: string;
  mime: string;
  size: number;
  path: string;
  url: string;
  created_at: string;
}

export const mockFiles: IAttachment[] = [
  {
    id: 1,
    correspondence_id: 101,
    uploaded_by: 5,
    original_name: "Приказ_о_назначении_№123.pdf",
    mime: "application/pdf",
    size: 2560000, // ~2.4 MB
    path: "/path/to/file1",
    url: "#",
    created_at: "2023-10-25T10:00:00Z",
  },
  {
    id: 2,
    correspondence_id: 101,
    uploaded_by: 5,
    original_name: "Скриншот_ошибки_системы.jpg",
    mime: "image/jpeg", // Проверка логики IMG
    size: 512000, // 500 KB
    path: "/path/to/file2",
    url: "#",
    created_at: "2023-10-25T10:05:00Z",
  },
  {
    id: 3,
    correspondence_id: 101,
    uploaded_by: 5,
    original_name:
      "Очень_длинное_название_файла_для_теста_верстки_и_обрезки_текста.docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 102400, // 100 KB
    path: "/path/to/file3",
    url: "#",
    created_at: "2023-10-25T10:10:00Z",
  },
];
